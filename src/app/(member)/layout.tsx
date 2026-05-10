import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/member/bottom-nav";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-background pb-20">
      {/* Top header */}
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center">
              <span className="text-black font-extrabold text-[10px]">M</span>
            </div>
            <span className="text-sm font-bold tracking-tight">META</span>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-lg mx-auto px-4 pt-4">{children}</main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
