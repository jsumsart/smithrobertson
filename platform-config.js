export const defaultSiteSettings = {
  id: "default",
  brand_name: "Smith Robertson Collections",
  museum_name: "Smith Robertson Museum And Cultural Center",
  manager_headline: "A shared collections database for Jackson history.",
  manager_intro:
    "Built for a real museum workflow: staff and students can log in, catalog the same records, upload object photos, and manage collections tied to African American history, Jackson history, and Farish Street.",
  public_catalog_title: "Browse published Smith Robertson records.",
  public_catalog_intro:
    "This view is for visitors, partners, and researchers. Only records marked for public display are shown here.",
  primary_color: "#9f4728",
  accent_deep_color: "#71311b",
  forest_color: "#546c47"
};

export const defaultRecordTypes = [
  { slug: "artifact", label: "Artifact", enabled: true, sort_order: 10 },
  { slug: "archive", label: "Archive", enabled: true, sort_order: 20 },
  { slug: "photograph", label: "Photograph", enabled: true, sort_order: 30 },
  { slug: "oral-history", label: "Oral History", enabled: true, sort_order: 40 },
  { slug: "newspaper-periodical", label: "Newspaper / Periodical", enabled: true, sort_order: 50 },
  { slug: "textile", label: "Textile", enabled: true, sort_order: 60 },
  { slug: "exhibit", label: "Exhibit", enabled: true, sort_order: 70 }
];

export function slugifyRecordType(label) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function sortRecordTypes(types) {
  return [...types].sort((left, right) => {
    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }
    return left.label.localeCompare(right.label);
  });
}

export function applyTheme(settings) {
  const root = document.documentElement;
  root.style.setProperty("--accent", settings.primary_color || defaultSiteSettings.primary_color);
  root.style.setProperty("--accent-deep", settings.accent_deep_color || defaultSiteSettings.accent_deep_color);
  root.style.setProperty("--forest", settings.forest_color || defaultSiteSettings.forest_color);
}
