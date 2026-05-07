import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MuseumRecord } from "@/lib/types";

export const getPublicRecords = cache(async (limit = 24): Promise<MuseumRecord[]> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("museum_records")
    .select(
      "id, accession_number, title, record_type, status, collection_name, location, historical_theme, neighborhood, time_period, people, donor, object_date, format_material, condition, rights_status, sensitivity, is_public, description, significance, provenance, notes, tags, created_at, updated_at"
    )
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (data || []) as MuseumRecord[];
});

export const getDashboardRecords = cache(async (limit = 25, offset = 0): Promise<MuseumRecord[]> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("museum_records")
    .select(
      "id, accession_number, title, record_type, status, collection_name, location, historical_theme, neighborhood, time_period, people, donor, object_date, format_material, condition, rights_status, sensitivity, is_public, description, significance, provenance, notes, tags, created_at, updated_at"
    )
    .order("accession_number", { ascending: true })
    .range(offset, offset + limit - 1);

  return (data || []) as MuseumRecord[];
});
