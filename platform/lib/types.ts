export type MuseumRecord = {
  id: string;
  accession_number: string;
  title: string;
  record_type: string;
  status: string;
  collection_name: string | null;
  location: string | null;
  historical_theme: string | null;
  neighborhood: string | null;
  time_period: string | null;
  people: string | null;
  donor: string | null;
  object_date: string | null;
  format_material: string | null;
  condition: string | null;
  rights_status: string | null;
  sensitivity: string | null;
  is_public: boolean;
  description: string | null;
  significance: string | null;
  provenance: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: string;
  brand_name: string;
  museum_name: string;
  public_catalog_title: string;
  public_catalog_intro: string;
  public_gallery_title: string;
  public_gallery_intro: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
};
