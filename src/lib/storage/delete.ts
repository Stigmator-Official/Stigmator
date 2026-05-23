import { createClientBrowser } from '@/lib/supabase/client'

export interface DeleteOptions {
  bucket: string
  path: string
}

const supabase = createClientBrowser()

/**
 * Delete a single file
 */
export async function deleteFile(options: DeleteOptions): Promise<void> {
  const { bucket, path } = options

  const { error } = await supabase
    .storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Delete multiple files at once
 */
export async function deleteFiles(
  bucket: string,
  paths: string[]
): Promise<{ success: string[]; failed: string[] }> {
  if (paths.length === 0) {
    return { success: [], failed: [] }
  }

  const { data, error } = await supabase
    .storage
    .from(bucket)
    .remove(paths)

  if (error) {
    // If bulk delete fails, mark all as failed
    return { success: [], failed: paths }
  }

  // Successfully deleted paths
  const deletedPaths = data?.map((d: { name: string }) => d.name) || []
  const failed = paths.filter(p => !deletedPaths.includes(p))

  return {
    success: deletedPaths,
    failed,
  }
}

/**
 * Delete all files in a folder
 */
export async function deleteFolder(
  bucket: string,
  folderPath: string
): Promise<void> {
  // List all files in the folder
  const { data: files, error: listError } = await supabase
    .storage
    .from(bucket)
    .list(folderPath)

  if (listError) {
    throw new Error(`Failed to list folder contents: ${listError.message}`)
  }

  if (!files || files.length === 0) {
    return
  }

  // Construct full paths
  const paths = files
    .filter((file: { name: string }) => file.name !== '.emptyFolderPlaceholder')  // Skip placeholder files
    .map((file: { name: string }) => `${folderPath}/${file.name}`)

  if (paths.length === 0) {
    return
  }

  const { error } = await supabase
    .storage
    .from(bucket)
    .remove(paths)

  if (error) {
    throw new Error(`Failed to delete folder contents: ${error.message}`)
  }
}

/**
 * Safe delete with dependency checking
 */
export async function safeDelete(
  options: DeleteOptions,
  dependencies?: Array<{ table: string; column: string }>
): Promise<{ success: boolean; message?: string }> {
  // If no dependencies specified, just delete
  if (!dependencies || dependencies.length === 0) {
    try {
      await deleteFile(options)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Delete failed',
      }
    }
  }

  // Check for dependencies
  const { data: hasDependencies, error: checkError } = await supabase
    .rpc('check_storage_dependencies', {
      bucket_name: options.bucket,
      file_path: options.path,
      dependency_tables: dependencies.map(d => d.table),
      dependency_columns: dependencies.map(d => d.column),
    })

  if (checkError) {
    return {
      success: false,
      message: `Failed to check dependencies: ${checkError.message}`,
    }
  }

  if (hasDependencies) {
    return {
      success: false,
      message: 'File is still referenced by other records and cannot be deleted',
    }
  }

  // Safe to delete
  try {
    await deleteFile(options)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

/**
 * Batch delete with progress callback
 */
export async function deleteWithProgress(
  bucket: string,
  paths: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = []
  const failed: string[] = []
  const total = paths.length

  // Process in batches of 100 (Supabase limit)
  const batchSize = 100
  
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize)
    
    const result = await deleteFiles(bucket, batch)
    
    success.push(...result.success)
    failed.push(...result.failed)
    
    if (onProgress) {
      onProgress(Math.min(i + batchSize, total), total)
    }
  }

  if (onProgress) {
    onProgress(total, total)
  }

  return { success, failed }
}

/**
 * Move file from one location to another
 */
export async function moveFile(
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<void> {
  const { error } = await supabase
    .storage
    .from(bucket)
    .move(fromPath, toPath)

  if (error) {
    throw new Error(`Move failed: ${error.message}`)
  }
}

/**
 * Copy file to new location
 */
export async function copyFile(
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<void> {
  const { error } = await supabase
    .storage
    .from(bucket)
    .copy(fromPath, toPath)

  if (error) {
    throw new Error(`Copy failed: ${error.message}`)
  }
}
