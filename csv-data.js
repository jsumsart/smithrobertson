import { defaultSiteSettings } from "./platform-config.js";

export const dataSourceConfig = {
  publishedCsvUrl: "",
  googleSheetUrl: "",
  googleFormUrl: "",
  brandName: defaultSiteSettings.brand_name,
  museumName: defaultSiteSettings.museum_name,
  managerHeadline: defaultSiteSettings.manager_headline,
  managerIntro: defaultSiteSettings.manager_intro,
  publicGalleryTitle: defaultSiteSettings.public_gallery_title,
  publicGalleryIntro: defaultSiteSettings.public_gallery_intro,
  publicArchiveTitle: defaultSiteSettings.public_catalog_title,
  publicArchiveIntro: defaultSiteSettings.public_catalog_intro,
  publicFontTheme: defaultSiteSettings.public_font_theme,
  featuredAccessions: [],
  slideshowAccessions: [],
  ...(window.COLLECTIONS_DATA_SOURCE || {})
};

export const localKeys = {
  records: "smith-robertson.records",
  siteSettings: "smith-robertson.site-settings",
  recordTypes: "smith-robertson.record-types",
  collectionEntities: "smith-robertson.collection-entities",
  personEntities: "smith-robertson.person-entities",
  placeEntities: "smith-robertson.place-entities",
  taxonomyGroups: "smith-robertson.taxonomy-groups",
  taxonomyTerms: "smith-robertson.taxonomy-terms"
};

export function buildConfiguredSiteSettings() {
  return {
    ...defaultSiteSettings,
    brand_name: dataSourceConfig.brandName || defaultSiteSettings.brand_name,
    museum_name: dataSourceConfig.museumName || defaultSiteSettings.museum_name,
    manager_headline: dataSourceConfig.managerHeadline || defaultSiteSettings.manager_headline,
    manager_intro: dataSourceConfig.managerIntro || defaultSiteSettings.manager_intro,
    public_gallery_title: dataSourceConfig.publicGalleryTitle || defaultSiteSettings.public_gallery_title,
    public_gallery_intro: dataSourceConfig.publicGalleryIntro || defaultSiteSettings.public_gallery_intro,
    public_catalog_title: dataSourceConfig.publicArchiveTitle || defaultSiteSettings.public_catalog_title,
    public_catalog_intro: dataSourceConfig.publicArchiveIntro || defaultSiteSettings.public_catalog_intro,
    public_font_theme: dataSourceConfig.publicFontTheme || defaultSiteSettings.public_font_theme,
    public_featured_accessions: Array.isArray(dataSourceConfig.featuredAccessions)
      ? dataSourceConfig.featuredAccessions
      : [],
    public_slideshow_accessions: Array.isArray(dataSourceConfig.slideshowAccessions)
      ? dataSourceConfig.slideshowAccessions
      : []
  };
}

export function loadStoredValue(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return structuredClone(fallback);
    }
    return JSON.parse(raw);
  } catch (_error) {
    return structuredClone(fallback);
  }
}

export function saveStoredValue(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function extractFirstUrl(value) {
  const stringValue = String(value || "").trim();
  const remoteMatch = stringValue.match(/https?:\/\/[^\s,]+/i);
  if (remoteMatch) {
    return remoteMatch[0];
  }

  const localAssetMatch = stringValue.match(/(\.\/public-images\/[^\s,]+?\.(?:png|jpe?g|webp|gif))/i);
  if (localAssetMatch) {
    return localAssetMatch[1];
  }

  return stringValue;
}

export function normalizeGoogleDriveUrl(value, size = 1200) {
  const rawUrl = extractFirstUrl(value);
  if (!rawUrl || !rawUrl.includes("drive.google.com")) {
    return rawUrl;
  }

  let fileId = "";
  const fileMatch = rawUrl.match(/\/file\/d\/([^/]+)/i);
  const openMatch = rawUrl.match(/[?&]id=([^&#]+)/i);

  if (fileMatch?.[1]) {
    fileId = fileMatch[1];
  } else if (openMatch?.[1]) {
    fileId = openMatch[1];
  }

  if (!fileId) {
    return rawUrl;
  }

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

export function normalizeImageUrl(value) {
  const normalized = extractFirstUrl(value);
  return normalizeGoogleDriveUrl(normalized);
}

export function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return ["true", "1", "yes", "y"].includes(normalized);
}

export function normalizeImportedTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[;,]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

export function normalizeImportedEntityIds(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function normalizeImportedRecord(record) {
  return {
    id: record.id || crypto.randomUUID(),
    accession_number: String(record.accession_number || "").trim(),
    title: String(record.title || "").trim(),
    record_type: String(record.record_type || "Artifact").trim(),
    status: String(record.status || "In Storage").trim(),
    collection_entity_id: String(record.collection_entity_id || "").trim() || null,
    collection_name: String(record.collection_name || "").trim(),
    location: String(record.location || "").trim(),
    historical_theme: String(record.historical_theme || "").trim(),
    place_entity_id: String(record.place_entity_id || "").trim() || null,
    neighborhood: String(record.neighborhood || "").trim(),
    time_period: String(record.time_period || "").trim(),
    people_entity_ids: normalizeImportedEntityIds(record.people_entity_ids),
    people: String(record.people || "").trim(),
    donor: String(record.donor || "").trim(),
    object_date: String(record.object_date || "").trim(),
    format_material: String(record.format_material || "").trim(),
    condition: String(record.condition || "").trim(),
    rights_status: String(record.rights_status || "").trim(),
    sensitivity: String(record.sensitivity || "").trim(),
    photo_url: normalizeImageUrl(record.photo_url || record.image_url || record.image || ""),
    photo_path: String(record.photo_path || "").trim(),
    photo_credit: String(record.photo_credit || "").trim(),
    description: String(record.description || "").trim(),
    significance: String(record.significance || "").trim(),
    provenance: String(record.provenance || "").trim(),
    notes: String(record.notes || "").trim(),
    is_public: parseBoolean(record.is_public),
    tags: normalizeImportedTags(record.tags),
    updated_by: record.updated_by || null
  };
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

export function parseCsvRecords(csvText) {
  const rows = parseCsv(csvText);

  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map((header) => String(header || "").trim());
  const requiredHeaders = ["accession_number", "title"];

  for (const requiredHeader of requiredHeaders) {
    if (!headers.includes(requiredHeader)) {
      throw new Error(`CSV is missing required column: ${requiredHeader}`);
    }
  }

  return rows
    .slice(1)
    .filter((row) => row.some((cell) => String(cell || "").trim() !== ""))
    .map((row, index) => {
      const record = {};

      headers.forEach((header, columnIndex) => {
        record[header] = row[columnIndex] ?? "";
      });

      if (!String(record.accession_number || "").trim()) {
        throw new Error(`CSV row ${index + 2} is missing accession_number.`);
      }

      if (!String(record.title || "").trim()) {
        throw new Error(`CSV row ${index + 2} is missing title.`);
      }

      return normalizeImportedRecord(record);
    });
}

export function escapeCsv(value) {
  const stringValue = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function serializeRecordsToCsv(records) {
  const columns = [
    "accession_number",
    "title",
    "record_type",
    "status",
    "collection_name",
    "location",
    "historical_theme",
    "neighborhood",
    "time_period",
    "people",
    "donor",
    "object_date",
    "format_material",
    "condition",
    "rights_status",
    "sensitivity",
    "is_public",
    "photo_url",
    "photo_credit",
    "description",
    "significance",
    "provenance",
    "notes",
    "tags"
  ];

  return [
    columns.join(","),
    ...records.map((record) => columns.map((column) => escapeCsv(record[column])).join(","))
  ].join("\n");
}

export function dedupeRecordsByAccession(records) {
  const seen = new Set();
  const deduped = [];

  for (const record of records || []) {
    const key = String(record.accession_number || record.id || "").trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(record);
  }

  return deduped;
}

export async function fetchPublishedCsvRecords(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load the published CSV source (${response.status}).`);
  }

  const csvText = await response.text();
  return dedupeRecordsByAccession(parseCsvRecords(csvText)).filter((record) => record.is_public);
}

export async function fetchCsvRecords(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load the CSV source (${response.status}).`);
  }

  const csvText = await response.text();
  return dedupeRecordsByAccession(parseCsvRecords(csvText));
}
