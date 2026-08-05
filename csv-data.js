import { defaultSiteSettings } from "./platform-config.js";

export const dataSourceConfig = {
  publishedJsonUrl: "",
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
  ...((typeof window !== "undefined" && window.COLLECTIONS_DATA_SOURCE) || {})
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
      .split(";")
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

export function normalizeImageFile(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/^\.?\/*public-images\//i, "")
    .replace(/^\.?\/*public-thumbs\//i, "thumbs/");
  return normalized.replace(/^\/+/, "");
}

export function buildThumbnailImageFile(imageFile) {
  const normalized = normalizeImageFile(imageFile);
  if (!normalized) {
    return "";
  }

  const extension = /(\.[^./]+)$/.exec(normalized);
  if (!extension) {
    return `thumbs/${normalized}.jpg`;
  }

  return `thumbs/${normalized.slice(0, -extension[1].length)}.jpg`;
}

export function buildImageSrc(imageFile) {
  const normalized = normalizeImageFile(imageFile);
  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("thumbs/")) {
    return `./public-thumbs/${normalized.slice("thumbs/".length)}`;
  }

  return `./public-images/${normalized}`;
}

export function normalizeImportedRecord(record) {
  return {
    id: record.id || crypto.randomUUID(),
    accession_number: String(record.accession_number || "").trim(),
    alternate_accession_number: String(record.alternate_accession_number || "").trim(),
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
    image_file: normalizeImageFile(record.image_file),
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
    "alternate_accession_number",
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
    "image_file",
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
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load the published CSV source (${response.status}).`);
  }

  const csvText = await response.text();
  return dedupeRecordsByAccession(parseCsvRecords(csvText)).filter((record) => record.is_public);
}

export async function fetchCsvRecords(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load the CSV source (${response.status}).`);
  }

  const csvText = await response.text();
  return dedupeRecordsByAccession(parseCsvRecords(csvText));
}

export function buildPublishedRecordsPayload(records) {
  const publicRecords = dedupeRecordsByAccession(records).filter((record) => record.is_public);

  return {
    generated_at: new Date().toISOString(),
    total_public_records: publicRecords.length,
    records: publicRecords.map((record) => ({
      ...record,
      image_thumb_file: buildThumbnailImageFile(record.image_file)
    }))
  };
}

export async function fetchPublishedRecords({ jsonUrl = "", csvUrl = "" } = {}) {
  if (jsonUrl) {
    const response = await fetch(jsonUrl);
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload?.records)) {
        return dedupeRecordsByAccession(payload.records).filter((record) => record.is_public);
      }
      throw new Error("Published JSON is missing a records array.");
    }
  }

  if (csvUrl) {
    return fetchPublishedCsvRecords(csvUrl);
  }

  throw new Error("Add a published JSON or CSV URL in data-source-config.js to load the public site.");
}
