import { requireAdmin } from "@/lib/auth/admin-guard";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check admin access - will redirect if not authorized
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#0a0f0a]">
      <Header user={session} />
      <div className="flex">
        <Sidebar role={session.role} />
        <main className="flex-1 ml-64 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
