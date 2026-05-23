import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin-guard";

export default async function AdminPage() {
  // Verify admin access - redirects if not authorized
  await requireAdmin();
  
  // Redirect to dashboard
  redirect("/admin/dashboard");
}
