import { createBrowserClient, isSupabaseReady } from "./supabase-client.js";
import {
  applyPublicSiteTheme,
  defaultRecordTypes,
  defaultSiteSettings,
  defaultTaxonomyGroups,
  defaultTaxonomyTerms,
  sortRecordTypes,
  sortTaxonomyEntries
} from "./platform-config.js";

const pageMode = document.body.dataset.publicPage || "gallery";

const state = {
  records: [],
  siteSettings: { ...defaultSiteSettings },
  recordTypes: [...defaultRecordTypes],
  taxonomyGroups: [...defaultTaxonomyGroups],
  taxonomyTerms: [...defaultTaxonomyTerms],
  slideshowIndex: 0,
  currentUser: null,
  supabase: createBrowserClient()
};

const elements = {
  brand: document.querySelector("#catalogBrand"),
  authAction: document.querySelector("#catalogAuthAction"),
  galleryTitle: document.querySelector("#catalogGalleryTitle"),
  galleryIntro: document.querySelector("#catalogGalleryIntro"),
  archiveTitle: document.querySelector("#catalogTitle"),
  archiveIntro: document.querySelector("#catalogIntro"),
  status: document.querySelector("#catalogStatus"),
  total: document.querySelector("#catalogTotal"),
  search: document.querySelector("#catalogSearch"),
  theme: document.querySelector("#catalogTheme"),
  type: document.querySelector("#catalogType"),
  list: document.querySelector("#catalogList"),
  featuredList: document.querySelector("#featuredList"),
  slideshowStage: document.querySelector("#slideshowStage"),
  slideshowPrev: document.querySelector("#slideshowPrev"),
  slideshowNext: document.querySelector("#slideshowNext"),
  cardTemplate: document.querySelector("#catalogCardTemplate"),
  archiveRowTemplate: document.querySelector("#archiveRowTemplate"),
  slideshowTemplate: document.querySelector("#slideshowTemplate")
};

function setStatus(message, isError = false) {
  if (!elements.status) {
    return;
  }
  elements.status.textContent = message;
  elements.status.classList.toggle("help-text--error", isError);
}

function normalizeTaxonomyTerm(term) {
  if (term.group_slug === "historical-theme" && term.slug === "family-and-neighborhood-life") {
    return {
      ...term,
      label: "Family And Local Life"
    };
  }

  return term;
}

function createTagElements(tags) {
  const fragment = document.createDocumentFragment();
  const values = tags?.length ? tags : ["public archive"];

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
  if (elements.brand) {
    elements.brand.textContent = state.siteSettings.brand_name;
  }
  if (elements.galleryTitle) {
    elements.galleryTitle.textContent = state.siteSettings.public_gallery_title;
  }
  if (elements.galleryIntro) {
    elements.galleryIntro.textContent = state.siteSettings.public_gallery_intro;
  }
  if (elements.archiveTitle) {
    elements.archiveTitle.textContent = state.siteSettings.public_catalog_title;
  }
  if (elements.archiveIntro) {
    elements.archiveIntro.textContent = state.siteSettings.public_catalog_intro;
  }
  document.title =
    pageMode === "archive"
      ? `${state.siteSettings.brand_name} Archive`
      : `${state.siteSettings.brand_name} Digital Gallery`;
  applyPublicSiteTheme(state.siteSettings);
}

function getEnabledTaxonomyTerms(groupSlug) {
  return sortTaxonomyEntries(state.taxonomyTerms).filter((term) => term.group_slug === groupSlug && term.enabled);
}

function renderRecordTypeFilter() {
  if (!elements.type) {
    return;
  }

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

function renderThemeFilter() {
  if (!elements.theme) {
    return;
  }

  const currentValue = elements.theme.value;
  elements.theme.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All themes";
  elements.theme.appendChild(allOption);

  for (const term of getEnabledTaxonomyTerms("historical-theme")) {
    const option = document.createElement("option");
    option.value = term.label;
    option.textContent = term.label;
    elements.theme.appendChild(option);
  }

  elements.theme.value = [...elements.theme.options].some((option) => option.value === currentValue) ? currentValue : "all";
}

function getFilteredRecords() {
  const query = elements.search?.value.trim().toLowerCase() || "";
  const theme = elements.theme?.value || "all";
  const type = elements.type?.value || "all";

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

function findRecordByAccession(accession) {
  return state.records.find((record) => record.accession_number === accession);
}

function getCuratedRecords(list, fallbackCount) {
  const curated = (list || []).map(findRecordByAccession).filter(Boolean);
  return curated.length ? curated : state.records.slice(0, fallbackCount);
}

async function populateCatalogCard(container, record) {
  const fragment = elements.cardTemplate.content.cloneNode(true);
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

  container.appendChild(fragment);
}

async function renderFeaturedRecords() {
  if (!elements.featuredList || !elements.cardTemplate) {
    return;
  }

  const featured = getCuratedRecords(state.siteSettings.public_featured_accessions, 3);
  elements.featuredList.replaceChildren();

  if (!featured.length) {
    elements.featuredList.innerHTML = `
      <div class="empty-state">
        <h3>No featured records yet.</h3>
        <p>Add accession IDs in settings to curate this section.</p>
      </div>
    `;
    return;
  }

  for (const record of featured) {
    await populateCatalogCard(elements.featuredList, record);
  }
}

async function renderSlideshow() {
  if (!elements.slideshowStage || !elements.slideshowTemplate) {
    return;
  }

  const curated = getCuratedRecords(state.siteSettings.public_slideshow_accessions, 4);
  elements.slideshowStage.replaceChildren();

  if (!curated.length) {
    elements.slideshowStage.innerHTML = `
      <div class="empty-state">
        <h3>No slideshow items yet.</h3>
        <p>Choose slideshow accession IDs in settings to build a more curated public front page.</p>
      </div>
    `;
    return;
  }

  const current = curated[state.slideshowIndex % curated.length];
  const fragment = elements.slideshowTemplate.content.cloneNode(true);
  const image = fragment.querySelector(".slideshow-card__image");
  const title = fragment.querySelector("h3");
  const meta = fragment.querySelector(".slideshow-card__meta");
  const description = fragment.querySelector(".slideshow-card__description");

  title.textContent = current.title;
  meta.textContent = [current.record_type, current.neighborhood, current.time_period || current.object_date]
    .filter(Boolean)
    .join(" • ");
  description.textContent = current.significance || current.description || "No description available.";

  const resolvedPhotoUrl = await resolvePublicPhotoUrl(current);
  if (resolvedPhotoUrl) {
    image.hidden = false;
    image.src = resolvedPhotoUrl;
    image.alt = `${current.title} image`;
  }

  elements.slideshowStage.appendChild(fragment);
  if (elements.slideshowPrev) {
    elements.slideshowPrev.disabled = curated.length <= 1;
  }
  if (elements.slideshowNext) {
    elements.slideshowNext.disabled = curated.length <= 1;
  }
}

async function renderArchive() {
  if (!elements.list || !elements.archiveRowTemplate) {
    return;
  }

  const records = getFilteredRecords();
  if (elements.total) {
    elements.total.textContent = `${records.length} public record${records.length === 1 ? "" : "s"}`;
  }
  elements.list.replaceChildren();

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
    const fragment = elements.archiveRowTemplate.content.cloneNode(true);
    const image = fragment.querySelector(".archive-row__image");
    const title = fragment.querySelector("h3");
    const meta = fragment.querySelector(".archive-row__meta");
    const description = fragment.querySelector(".archive-row__description");
    const badges = fragment.querySelector(".archive-row__badges");
    const tags = fragment.querySelector(".tag-list");

    title.textContent = record.title;
    meta.textContent = [
      record.accession_number,
      record.record_type,
      record.neighborhood,
      record.time_period || record.object_date
    ]
      .filter(Boolean)
      .join(" • ");
    description.textContent = record.description || "No description available.";
    tags.replaceChildren(createTagElements(record.tags));

    const themeBadge = document.createElement("span");
    themeBadge.className = "pill";
    themeBadge.textContent = record.historical_theme || "General";
    badges.appendChild(themeBadge);

    const resolvedPhotoUrl = await resolvePublicPhotoUrl(record);
    if (resolvedPhotoUrl) {
      image.hidden = false;
      image.src = resolvedPhotoUrl;
      image.alt = `${record.title} image`;
    }

    elements.list.appendChild(fragment);
  }
}

async function loadCurrentUser() {
  if (!isSupabaseReady || !elements.authAction) {
    return;
  }

  const { data, error } = await state.supabase.auth.getUser();
  if (error) {
    return;
  }

  state.currentUser = data.user || null;

  if (state.currentUser) {
    elements.authAction.textContent = "Dashboard";
    elements.authAction.href = "./index.html";
  } else {
    elements.authAction.textContent = "Log In";
    elements.authAction.href = "./index.html#authPanel";
  }
}

async function loadCatalog() {
  if (!isSupabaseReady) {
    setStatus("Add your Supabase project URL and anon key in supabase-config.js to load the public site.", true);
    return;
  }

  const [
    { data: settingsData, error: settingsError },
    { data: typesData, error: typesError },
    { data: groupsData, error: groupsError },
    { data: termsData, error: termsError },
    { data, error }
  ] = await Promise.all([
    state.supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(),
    state.supabase.from("record_type_definitions").select("*").order("sort_order"),
    state.supabase.from("taxonomy_groups").select("*").order("sort_order"),
    state.supabase.from("taxonomy_terms").select("*").order("sort_order"),
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

  state.siteSettings = { ...defaultSiteSettings, ...(settingsData || {}) };
  state.recordTypes = typesData?.length
    ? typesData.map((type) => ({
        slug: type.slug,
        label: type.label,
        enabled: type.enabled,
        sort_order: type.sort_order
      }))
    : [...defaultRecordTypes];
  state.taxonomyGroups = groupsError || !groupsData?.length ? [...defaultTaxonomyGroups] : groupsData;
  state.taxonomyTerms = termsError || !termsData?.length ? [...defaultTaxonomyTerms] : termsData.map(normalizeTaxonomyTerm);
  state.records = data || [];

  applyCatalogSettings();
  renderRecordTypeFilter();
  renderThemeFilter();
  await Promise.all([renderArchive(), renderFeaturedRecords(), renderSlideshow(), loadCurrentUser()]);
  setStatus(pageMode === "archive" ? "Showing the searchable public archive." : "Showing the curated digital gallery.");
}

elements.search?.addEventListener("input", () => {
  renderArchive().catch((error) => setStatus(error.message, true));
});
elements.theme?.addEventListener("change", () => {
  renderArchive().catch((error) => setStatus(error.message, true));
});
elements.type?.addEventListener("change", () => {
  renderArchive().catch((error) => setStatus(error.message, true));
});
elements.slideshowPrev?.addEventListener("click", () => {
  const curated = getCuratedRecords(state.siteSettings.public_slideshow_accessions, 4);
  state.slideshowIndex = (state.slideshowIndex - 1 + curated.length) % curated.length;
  renderSlideshow().catch((error) => setStatus(error.message, true));
});
elements.slideshowNext?.addEventListener("click", () => {
  const curated = getCuratedRecords(state.siteSettings.public_slideshow_accessions, 4);
  state.slideshowIndex = (state.slideshowIndex + 1) % curated.length;
  renderSlideshow().catch((error) => setStatus(error.message, true));
});

loadCatalog().catch((error) => setStatus(error.message, true));
