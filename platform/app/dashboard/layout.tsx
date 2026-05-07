import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { getSiteSettings } from "@/lib/data/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const settings = await getSiteSettings();

  return <DashboardShell brandName={settings.brand_name}>{children}</DashboardShell>;
}
