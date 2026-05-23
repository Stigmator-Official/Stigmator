import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { generalRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for original resolution preservation

function getImageDimensions(buffer: Buffer, mimeType: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (mimeType === "image/svg+xml") {
      // For SVGs, we can't easily get dimensions from buffer without parsing XML
      resolve({ width: 0, height: 0 });
      return;
    }
    // Simple parser for PNG/JPEG/WebP dimensions from buffer
    const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;
    const isJPEG = buffer[0] === 0xff && buffer[1] === 0xd8;
    const isWebP = buffer.slice(8, 12).toString("ascii") === "WEBP";

    if (isPNG) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      resolve({ width, height });
    } else if (isJPEG) {
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) { offset++; continue; }
        const marker = buffer[offset + 1];
        if (marker === 0xd9 || marker === 0xda) break;
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          resolve({ width, height });
          return;
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
      resolve({ width: 0, height: 0 });
    } else if (isWebP) {
      // VP8X or VP8 or VP8L chunk
      const chunkType = buffer.slice(12, 16).toString("ascii");
      if (chunkType === "VP8 ") {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        resolve({ width, height });
      } else if (chunkType === "VP8L") {
        const bits = buffer.readUInt32LE(21);
        const width = (bits & 0x3fff) + 1;
        const height = ((bits >> 14) & 0x3fff) + 1;
        resolve({ width, height });
      } else if (chunkType === "VP8X") {
        const width = buffer.readUInt24LE(24) + 1;
        const height = buffer.readUInt24LE(27) + 1;
        resolve({ width, height });
      } else {
        resolve({ width: 0, height: 0 });
      }
    } else {
      resolve({ width: 0, height: 0 });
    }
  });
}

// Extend Buffer interface for readUInt24LE
declare global {
  interface Buffer {
    readUInt24LE(offset: number): number;
  }
}

Buffer.prototype.readUInt24LE = function(offset: number) {
  return this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16);
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();

    // Authenticate via cookies (respects RLS)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit
    const { success: limitOk } = await generalRateLimit(user.id);
    if (!limitOk) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";
    const category = (formData.get("category") as string) || "";
    const tagsRaw = (formData.get("tags") as string) || "[]";
    const isNSFW = formData.get("isNSFW") === "true";
    const attributionRequired = formData.get("attributionRequired") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    if (!title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsRaw);
    } catch {
      tags = [];
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get dimensions
    const { width, height } = await getImageDimensions(buffer, file.type);

    // Upload original to Supabase Storage (preserve exact file)
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `designs/${user.id}/${timestamp}_${sanitizedName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("design-uploads")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("design-uploads").getPublicUrl(uploadData.path);
    const publicUrl = urlData.publicUrl;

    // Create design record
    const { data: design, error: designError } = await supabase
      .from("designs")
      .insert({
        artist_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        images: [publicUrl],
        tags: tags,
        style_tags: category ? [category] : [],
        is_original_flash: false,
        is_exclusive: false,
        is_nsfw: isNSFW,
        attribution_required: attributionRequired,
      } as any)
      .select()
      .single();

    if (designError || !design) {
      // Best-effort cleanup
      await supabase.storage.from("design-uploads").remove([uploadData.path]);
      return NextResponse.json({ error: "Failed to create design record" }, { status: 500 });
    }

    // Create design_files record for original asset tracking
    const { error: fileError } = await supabase.from("design_files").insert({
      artist_id: user.id,
      original_name: file.name,
      storage_path: uploadData.path,
      public_url: publicUrl,
      format: file.type.split("/")[1] || "unknown",
      width,
      height,
      has_transparency: file.type === "image/png" || file.type === "image/svg+xml",
      file_size_bytes: file.size,
    } as any);

    if (fileError) {
      // Non-fatal: design exists, file record can be cleaned up manually
    }

    return NextResponse.json({ design });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
