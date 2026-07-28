export const defaultSiteSettings = {
  id: "default",
  brand_name: "Smith Robertson Museum + Cultural Center",
  museum_name: "Smith Robertson Museum + Cultural Center",
  manager_headline: "A shared collections database for Jackson history.",
  manager_intro:
    "Built for a real museum workflow: staff and students can log in, catalog the same records, upload object photos, and manage collections tied to African American history, Jackson history, and Farish Street.",
  public_catalog_title: "Public archive and research portal",
  public_catalog_intro:
    "Browse the public archive as a researcher-facing portal for object discovery, contextual reading, and citation-ready record pages.",
  public_gallery_title: "Smith Robertson Museum + Cultural Center Digital Collections",
  public_gallery_intro:
    "Explore guided exhibits and collection spotlights, then move into the public archive for deeper research across school history, neighborhood memory, civil rights, medicine, art, and Farish Street culture.",
  public_font_theme: "editorial",
  public_slideshow_accessions: [],
  public_featured_accessions: [],
  primary_color: "#9f4728",
  accent_deep_color: "#71311b",
  forest_color: "#546c47"
};

export const publicFontThemes = [
  {
    value: "editorial",
    label: "Editorial",
    displayFont: "\"Cormorant Garamond\", serif",
    bodyFont: "\"Manrope\", sans-serif"
  },
  {
    value: "heritage",
    label: "Heritage",
    displayFont: "\"Libre Baskerville\", serif",
    bodyFont: "\"Source Sans 3\", sans-serif"
  },
  {
    value: "modern",
    label: "Modern",
    displayFont: "\"Fraunces\", serif",
    bodyFont: "\"DM Sans\", sans-serif"
  }
];

export const defaultRecordTypes = [
  { slug: "artifact", label: "Artifact", enabled: true, sort_order: 10 },
  { slug: "archive", label: "Archive", enabled: true, sort_order: 20 },
  { slug: "photograph", label: "Photograph", enabled: true, sort_order: 30 },
  { slug: "oral-history", label: "Oral History", enabled: true, sort_order: 40 },
  { slug: "newspaper-periodical", label: "Newspaper / Periodical", enabled: true, sort_order: 50 },
  { slug: "textile", label: "Textile", enabled: true, sort_order: 60 },
  { slug: "exhibit", label: "Exhibit", enabled: true, sort_order: 70 }
];

export const defaultTaxonomyGroups = [
  {
    slug: "status",
    label: "Statuses",
    description: "Workflow and storage status options for records.",
    public_visible: false,
    sort_order: 10
  },
  {
    slug: "historical-theme",
    label: "Themes",
    description: "Themes used for filtering and interpretation.",
    public_visible: true,
    sort_order: 20
  },
  {
    slug: "neighborhood",
    label: "Geographies",
    description: "Key locations, campuses, regions, or geographic contexts.",
    public_visible: true,
    sort_order: 30
  },
  {
    slug: "rights-status",
    label: "Rights",
    description: "Usage and rights statements.",
    public_visible: false,
    sort_order: 40
  },
  {
    slug: "condition",
    label: "Condition",
    description: "Condition and conservation states for records.",
    public_visible: false,
    sort_order: 45
  },
  {
    slug: "sensitivity",
    label: "Sensitivity",
    description: "Internal/public sensitivity levels.",
    public_visible: false,
    sort_order: 50
  },
  {
    slug: "suggested-tag",
    label: "Suggested Tags",
    description: "Reusable tags surfaced in the catalog UI.",
    public_visible: false,
    sort_order: 60
  }
];

export const defaultTaxonomyTerms = [
  { group_slug: "status", slug: "in-storage", label: "In Storage", enabled: true, sort_order: 10 },
  { group_slug: "status", slug: "on-display", label: "On Display", enabled: true, sort_order: 20 },
  { group_slug: "status", slug: "digitized", label: "Digitized", enabled: true, sort_order: 30 },
  { group_slug: "status", slug: "needs-review", label: "Needs Review", enabled: true, sort_order: 40 },
  { group_slug: "status", slug: "in-research", label: "In Research", enabled: true, sort_order: 50 },
  { group_slug: "historical-theme", slug: "african-american-education", label: "African American Education", enabled: true, sort_order: 10 },
  { group_slug: "historical-theme", slug: "arts-and-culture", label: "Arts And Culture", enabled: true, sort_order: 20 },
  { group_slug: "historical-theme", slug: "agriculture-and-labor", label: "Agriculture and Labor", enabled: true, sort_order: 30 },
  { group_slug: "historical-theme", slug: "black-business-and-professional-life", label: "Black Business and Professional Life", enabled: true, sort_order: 40 },
  { group_slug: "historical-theme", slug: "black-health-and-medicine", label: "Black Health and Medicine", enabled: true, sort_order: 50 },
  { group_slug: "historical-theme", slug: "civil-rights-and-citizenship", label: "Civil Rights and Citizenship", enabled: true, sort_order: 60 },
  { group_slug: "historical-theme", slug: "civic-leadership", label: "Civic Leadership", enabled: true, sort_order: 70 },
  { group_slug: "historical-theme", slug: "community-and-professional-life", label: "Community and Professional Life", enabled: true, sort_order: 80 },
  { group_slug: "historical-theme", slug: "faith-and-community-life", label: "Faith And Community Life", enabled: true, sort_order: 90 },
  { group_slug: "historical-theme", slug: "family-and-local-life", label: "Family And Local Life", enabled: true, sort_order: 100 },
  { group_slug: "historical-theme", slug: "material-culture-and-interpretation", label: "Material Culture and Interpretation", enabled: true, sort_order: 110 },
  { group_slug: "historical-theme", slug: "midwives-and-motherhood", label: "Midwives and Motherhood", enabled: true, sort_order: 120 },
  { group_slug: "historical-theme", slug: "migration-and-memory", label: "Migration And Memory", enabled: true, sort_order: 130 },
  { group_slug: "historical-theme", slug: "military-service", label: "Military Service", enabled: true, sort_order: 140 },
  { group_slug: "historical-theme", slug: "portraiture-and-community-memory", label: "Portraiture and Community Memory", enabled: true, sort_order: 150 },
  { group_slug: "neighborhood", slug: "farish-street", label: "Farish Street", enabled: true, sort_order: 10 },
  { group_slug: "neighborhood", slug: "downtown-jackson", label: "Downtown Jackson", enabled: true, sort_order: 20 },
  { group_slug: "neighborhood", slug: "smith-robertson-campus", label: "Smith Robertson Campus", enabled: true, sort_order: 30 },
  { group_slug: "neighborhood", slug: "west-jackson", label: "West Jackson", enabled: true, sort_order: 40 },
  { group_slug: "neighborhood", slug: "belhaven", label: "Belhaven", enabled: true, sort_order: 50 },
  { group_slug: "neighborhood", slug: "statewide-mississippi", label: "Statewide Mississippi", enabled: true, sort_order: 60 },
  { group_slug: "rights-status", slug: "museum-use-only", label: "Museum Use Only", enabled: true, sort_order: 10 },
  { group_slug: "rights-status", slug: "educational-use-approved", label: "Educational Use Approved", enabled: true, sort_order: 20 },
  { group_slug: "rights-status", slug: "public-domain", label: "Public Domain", enabled: true, sort_order: 30 },
  { group_slug: "rights-status", slug: "rights-unknown", label: "Rights Unknown", enabled: true, sort_order: 40 },
  { group_slug: "condition", slug: "excellent", label: "Excellent", enabled: true, sort_order: 10 },
  { group_slug: "condition", slug: "stable", label: "Stable", enabled: true, sort_order: 20 },
  { group_slug: "condition", slug: "fragile", label: "Fragile", enabled: true, sort_order: 30 },
  { group_slug: "condition", slug: "needs-conservation", label: "Needs Conservation", enabled: true, sort_order: 40 },
  { group_slug: "sensitivity", slug: "open-access", label: "Open Access", enabled: true, sort_order: 10 },
  { group_slug: "sensitivity", slug: "review-before-public-display", label: "Review Before Public Display", enabled: true, sort_order: 20 },
  { group_slug: "sensitivity", slug: "restricted", label: "Restricted", enabled: true, sort_order: 30 },
  { group_slug: "suggested-tag", slug: "farish-street", label: "Farish Street", enabled: true, sort_order: 10 },
  { group_slug: "suggested-tag", slug: "jackson-history", label: "Jackson history", enabled: true, sort_order: 20 },
  { group_slug: "suggested-tag", slug: "african-american-education", label: "African American education", enabled: true, sort_order: 30 },
  { group_slug: "suggested-tag", slug: "civil-rights", label: "civil rights", enabled: true, sort_order: 40 },
  { group_slug: "suggested-tag", slug: "church-life", label: "church life", enabled: true, sort_order: 50 },
  { group_slug: "suggested-tag", slug: "business-history", label: "business history", enabled: true, sort_order: 60 },
  { group_slug: "suggested-tag", slug: "oral-history", label: "oral history", enabled: true, sort_order: 70 },
  { group_slug: "suggested-tag", slug: "textiles", label: "textiles", enabled: true, sort_order: 80 },
  { group_slug: "suggested-tag", slug: "r-jess-brown", label: "R. Jess Brown", enabled: true, sort_order: 90 }
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

export function sortTaxonomyEntries(entries) {
  return [...entries].sort((left, right) => {
    if ((left.sort_order ?? 0) !== (right.sort_order ?? 0)) {
      return (left.sort_order ?? 0) - (right.sort_order ?? 0);
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

export function getPublicFontTheme(value) {
  return publicFontThemes.find((theme) => theme.value === value) || publicFontThemes[0];
}

export function applyPublicSiteTheme(settings) {
  applyTheme(settings);
  const root = document.documentElement;
  const theme = getPublicFontTheme(settings.public_font_theme);
  root.style.setProperty("--catalog-display-font", theme.displayFont);
  root.style.setProperty("--catalog-body-font", theme.bodyFont);
  document.body.dataset.publicTheme = theme.value;
}
