import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";

const fallbackSettings: SiteSettings = {
  id: "default",
  brand_name: "Smith Robertson Collections",
  museum_name: "Smith Robertson Museum And Cultural Center",
  public_catalog_title: "Browse published Smith Robertson records.",
  public_catalog_intro: "This view is for visitors, partners, and researchers.",
  public_gallery_title: "A living gallery of Jackson history.",
  public_gallery_intro: "Use this public-facing site to feature objects and stories before visitors dive into the archive."
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();
  return { ...fallbackSettings, ...(data || {}) };
});
