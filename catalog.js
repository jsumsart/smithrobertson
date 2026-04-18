import { createBrowserClient, isSupabaseReady } from "./supabase-client.js";
import { applyTheme, defaultRecordTypes, defaultSiteSettings, sortRecordTypes } from "./platform-config.js";

const state = {
  records: [],
  siteSettings: { ...defaultSiteSettings },
  recordTypes: [...defaultRecordTypes],
  supabase: createBrowserClient()
};

const elements = {
  brand: document.querySelector("#catalogBrand"),
  title: document.querySelector("#catalogTitle"),
  intro: document.querySelector("#catalogIntro"),
  status: document.querySelector("#catalogStatus"),
  total: document.querySelector("#catalogTotal"),
  search: document.querySelector("#catalogSearch"),
  theme: document.querySelector("#catalogTheme"),
  type: document.querySelector("#catalogType"),
  list: document.querySelector("#catalogList"),
  template: document.querySelector("#catalogCardTemplate")
};

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("help-text--error", isError);
}

function createTagElements(tags) {
  const fragment = document.createDocumentFragment();
  const values = tags?.length ? tags : ["Smith Robertson"];

  for (const value of values) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = value;
    fragment.appendChild(span);
  }

  return fragment;
}

async function resolvePublicPhotoUrl(record) {
  if (record.photo_path && state.supabase) {
    const { data, error } = await state.supabase.storage.from("museum-photos").createSignedUrl(record.photo_path, 3600);
    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
  }

  return record.photo_url || "";
}

function applyCatalogSettings() {
  elements.brand.textContent = state.siteSettings.brand_name;
  elements.title.textContent = state.siteSettings.public_catalog_title;
  elements.intro.textContent = state.siteSettings.public_catalog_intro;
  document.title = `${state.siteSettings.brand_name} Public Catalog`;
  applyTheme(state.siteSettings);
}

function renderRecordTypeFilter() {
  const currentValue = elements.type.value;
  elements.type.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All types";
  elements.type.appendChild(allOption);

  for (const type of sortRecordTypes(state.recordTypes).filter((item) => item.enabled)) {
    const option = document.createElement("option");
    option.value = type.label;
    option.textContent = type.label;
    elements.type.appendChild(option);
  }

  elements.type.value = [...elements.type.options].some((option) => option.value === currentValue) ? currentValue : "all";
}

function getFilteredRecords() {
  const query = elements.search.value.trim().toLowerCase();
  const theme = elements.theme.value;
  const type = elements.type.value;

  return state.records.filter((record) => {
    const matchesTheme = theme === "all" || record.historical_theme === theme;
    const matchesType = type === "all" || record.record_type === type;

    const haystack = [
      record.title,
      record.accession_number,
      record.historical_theme,
      record.neighborhood,
      record.description,
      record.significance,
      ...(record.tags || [])
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesTheme && matchesType && (!query || haystack.includes(query));
  });
}

async function renderCatalog() {
  const records = getFilteredRecords();
  elements.total.textContent = `${records.length} public record${records.length === 1 ? "" : "s"}`;
  elements.list.innerHTML = "";

  if (!records.length) {
    elements.list.innerHTML = `
      <div class="empty-state">
        <h3>No public records match this view.</h3>
        <p>Try a broader search or publish more records from the internal catalog.</p>
      </div>
    `;
    return;
  }

  for (const record of records) {
    const fragment = elements.template.content.cloneNode(true);
    const image = fragment.querySelector(".catalog-card__image");
    const title = fragment.querySelector("h3");
    const meta = fragment.querySelector(".catalog-card__meta");
    const description = fragment.querySelector(".catalog-card__description");
    const significance = fragment.querySelector(".catalog-card__significance");
    const tags = fragment.querySelector(".tag-list");

    title.textContent = record.title;
    meta.textContent = [record.record_type, record.neighborhood, record.time_period || record.object_date]
      .filter(Boolean)
      .join(" • ");
    description.textContent = record.description || "No description available.";
    significance.textContent = record.significance || "Historical significance not yet added.";
    tags.replaceChildren(createTagElements(record.tags));

    const resolvedPhotoUrl = await resolvePublicPhotoUrl(record);
    if (resolvedPhotoUrl) {
      image.hidden = false;
      image.src = resolvedPhotoUrl;
      image.alt = `${record.title} image`;
    }

    elements.list.appendChild(fragment);
  }
}

async function loadCatalog() {
  if (!isSupabaseReady) {
    setStatus("Add your Supabase project URL and anon key in supabase-config.js to load the public catalog.", true);
    return;
  }

  const [{ data: settingsData, error: settingsError }, { data: typesData, error: typesError }, { data, error }] =
    await Promise.all([
      state.supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(),
      state.supabase.from("record_type_definitions").select("*").order("sort_order"),
      state.supabase.from("museum_records").select("*").eq("is_public", true).order("updated_at", { ascending: false })
    ]);

  if (settingsError) {
    setStatus(settingsError.message, true);
    return;
  }

  if (typesError) {
    setStatus(typesError.message, true);
    return;
  }

  if (error) {
    setStatus(error.message, true);
    return;
  }

  state.siteSettings = {
    ...defaultSiteSettings,
    ...(settingsData || {})
  };
  state.recordTypes = typesData?.length
    ? typesData.map((type) => ({
        slug: type.slug,
        label: type.label,
        enabled: type.enabled,
        sort_order: type.sort_order
      }))
    : [...defaultRecordTypes];
  state.records = data || [];
  applyCatalogSettings();
  renderRecordTypeFilter();
  setStatus("Showing public Smith Robertson records.");
  await renderCatalog();
}

elements.search.addEventListener("input", () => {
  renderCatalog().catch((error) => setStatus(error.message, true));
});
elements.theme.addEventListener("change", () => {
  renderCatalog().catch((error) => setStatus(error.message, true));
});
elements.type.addEventListener("change", () => {
  renderCatalog().catch((error) => setStatus(error.message, true));
});

loadCatalog().catch((error) => setStatus(error.message, true));
