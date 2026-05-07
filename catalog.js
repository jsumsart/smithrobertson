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
  archivePagination: {
    page: 1,
    pageSize: 18,
    total: 0
  },
  slideshowIndex: 0,
  currentUser: null,
  archivePreviewUrls: new Map(),
  archiveSearchDebounceId: null,
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
  archivePaginationInfo: document.querySelector("#archivePaginationInfo"),
  archivePrevPage: document.querySelector("#archivePrevPage"),
  archiveNextPage: document.querySelector("#archiveNextPage"),
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

function debounceArchiveRefresh(delay = 250) {
  window.clearTimeout(state.archiveSearchDebounceId);
  state.archiveSearchDebounceId = window.setTimeout(() => {
    refreshArchivePage({ resetPage: true }).catch((error) => setStatus(error.message, true));
  }, delay);
}

function getArchiveFilterState() {
  return {
    query: elements.search?.value.trim() || "",
    theme: elements.theme?.value || "all",
    type: elements.type?.value || "all"
  };
}

function updateArchivePaginationUI() {
  if (!elements.archivePaginationInfo) {
    return;
  }

  const total = state.archivePagination.total;
  const page = state.archivePagination.page;
  const pageSize = state.archivePagination.pageSize;
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = total ? Math.min(page * pageSize, total) : 0;

  elements.archivePaginationInfo.textContent = `Showing ${start}-${end} of ${total} public records`;
  if (elements.archivePrevPage) {
    elements.archivePrevPage.disabled = page <= 1;
  }
  if (elements.archiveNextPage) {
    elements.archiveNextPage.disabled = end >= total;
  }
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

function dedupeRecordsByAccession(records) {
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
  return state.records;
}

function findRecordByAccession(accession) {
  return state.records.find((record) => record.accession_number === accession);
}

function getCuratedRecords(list, fallbackCount) {
  const seen = new Set();
  const curated = (list || [])
    .map(findRecordByAccession)
    .filter((record) => {
      if (!record) {
        return false;
      }
      const key = String(record.accession_number || record.id || "").trim().toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  return curated.length ? curated : state.records.slice(0, fallbackCount);
}

async function fetchGalleryRecords() {
  const curatedAccessions = [
    ...(state.siteSettings.public_slideshow_accessions || []),
    ...(state.siteSettings.public_featured_accessions || [])
  ].filter(Boolean);

  if (curatedAccessions.length) {
    const { data, error } = await state.supabase
      .from("museum_records")
      .select("*")
      .eq("is_public", true)
      .in("accession_number", curatedAccessions);

    if (error) {
      throw error;
    }

    state.records = dedupeRecordsByAccession(data || []);
    return;
  }

  const { data, error } = await state.supabase
    .from("museum_records")
    .select("*")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(6);

  if (error) {
    throw error;
  }

  state.records = dedupeRecordsByAccession(data || []);
}

async function fetchArchiveRecords() {
  const filters = getArchiveFilterState();
  const from = (state.archivePagination.page - 1) * state.archivePagination.pageSize;
  const to = from + state.archivePagination.pageSize - 1;

  let query = state.supabase
    .from("museum_records")
    .select(
      "id,accession_number,title,record_type,historical_theme,neighborhood,time_period,object_date,description,tags,photo_url,photo_path",
      { count: "exact" }
    )
    .eq("is_public", true);

  if (filters.theme !== "all") {
    query = query.eq("historical_theme", filters.theme);
  }
  if (filters.type !== "all") {
    query = query.eq("record_type", filters.type);
  }
  if (filters.query) {
    const safeQuery = filters.query.replaceAll(",", " ").trim();
    query = query.or(
      [
        `accession_number.ilike.%${safeQuery}%`,
        `title.ilike.%${safeQuery}%`,
        `historical_theme.ilike.%${safeQuery}%`,
        `neighborhood.ilike.%${safeQuery}%`,
        `description.ilike.%${safeQuery}%`
      ].join(",")
    );
  }

  const { data, error, count } = await query
    .order("accession_number", { ascending: true })
    .range(from, to);

  if (error) {
    throw error;
  }

  state.archivePagination.total = count || 0;
  state.records = dedupeRecordsByAccession(data || []);
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
  updateArchivePaginationUI();
  if (elements.total) {
    elements.total.textContent = `${state.archivePagination.total} public record${state.archivePagination.total === 1 ? "" : "s"}`;
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
    const media = fragment.querySelector(".archive-row__media");
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

    const cacheKey = record.id || record.accession_number;
    const cachedUrl = state.archivePreviewUrls.get(cacheKey);
    if (cachedUrl) {
      image.hidden = false;
      image.src = cachedUrl;
      image.alt = `${record.title} image`;
    } else if (record.photo_path || record.photo_url) {
      const previewButton = document.createElement("button");
      previewButton.type = "button";
      previewButton.className = "button button--ghost";
      previewButton.textContent = "Load image";
      previewButton.addEventListener("click", async () => {
        previewButton.disabled = true;
        previewButton.textContent = "Loading...";
        try {
          const resolvedPhotoUrl = await resolvePublicPhotoUrl(record);
          if (!resolvedPhotoUrl) {
            previewButton.textContent = "No image";
            return;
          }
          state.archivePreviewUrls.set(cacheKey, resolvedPhotoUrl);
          image.hidden = false;
          image.src = resolvedPhotoUrl;
          image.alt = `${record.title} image`;
          previewButton.remove();
        } catch (_error) {
          previewButton.textContent = "Unavailable";
        }
      });
      media.appendChild(previewButton);
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
    elements.authAction.href = "./login.html";
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
  ] = await Promise.all([
    state.supabase.from("site_settings").select("*").eq("id", "default").maybeSingle(),
    state.supabase.from("record_type_definitions").select("*").order("sort_order"),
    state.supabase.from("taxonomy_groups").select("*").order("sort_order"),
    state.supabase.from("taxonomy_terms").select("*").order("sort_order")
  ]);

  if (settingsError) {
    setStatus(settingsError.message, true);
    return;
  }
  if (typesError) {
    setStatus(typesError.message, true);
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
  state.records = dedupeRecordsByAccession(data || []);

  applyCatalogSettings();
  renderRecordTypeFilter();
  renderThemeFilter();

  if (pageMode === "archive") {
    await refreshArchivePage({ resetPage: true });
    await loadCurrentUser();
    setStatus("Showing the searchable public archive.");
    return;
  }

  await fetchGalleryRecords();
  await Promise.all([renderFeaturedRecords(), renderSlideshow(), loadCurrentUser()]);
  setStatus("Showing the curated digital gallery.");
}

async function refreshArchivePage({ resetPage = false } = {}) {
  if (pageMode !== "archive") {
    return;
  }

  if (resetPage) {
    state.archivePagination.page = 1;
  }

  await fetchArchiveRecords();
  await renderArchive();
}

elements.search?.addEventListener("input", () => {
  debounceArchiveRefresh();
});
elements.theme?.addEventListener("change", () => {
  refreshArchivePage({ resetPage: true }).catch((error) => setStatus(error.message, true));
});
elements.type?.addEventListener("change", () => {
  refreshArchivePage({ resetPage: true }).catch((error) => setStatus(error.message, true));
});
elements.archivePrevPage?.addEventListener("click", () => {
  if (state.archivePagination.page <= 1) {
    return;
  }
  state.archivePagination.page -= 1;
  refreshArchivePage().catch((error) => setStatus(error.message, true));
});
elements.archiveNextPage?.addEventListener("click", () => {
  const pageCount = Math.ceil(state.archivePagination.total / state.archivePagination.pageSize);
  if (state.archivePagination.page >= pageCount) {
    return;
  }
  state.archivePagination.page += 1;
  refreshArchivePage().catch((error) => setStatus(error.message, true));
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
