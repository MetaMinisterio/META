import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Painel Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "pastor"].includes(profile.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-dvh bg-black flex text-foreground">
      <AdminSidebar userName={profile.full_name} userRole={profile.role} />
      <main className="flex-1 min-w-0 lg:ml-64 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
