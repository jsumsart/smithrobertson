import {
  applyPublicSiteTheme,
  defaultRecordTypes,
  defaultSiteSettings,
  defaultTaxonomyGroups,
  defaultTaxonomyTerms,
  sortRecordTypes,
  sortTaxonomyEntries
} from "./platform-config.js";
import { buildConfiguredSiteSettings, buildImageSrc, dataSourceConfig, fetchPublishedRecords } from "./csv-data.js?v=20260704b";

const pageMode = document.body.dataset.publicPage || "gallery";
const collectionView = document.body.dataset.collectionView || "";

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildSearchHaystack(record) {
  return normalizeText(
    [
      record.accession_number,
      record.title,
      record.record_type,
      record.historical_theme,
      record.neighborhood,
      record.time_period,
      record.object_date,
      record.people,
      record.organizations,
      record.description,
      record.significance,
      record.curator_notes,
      ...(record.tags || [])
    ].join(" ")
  );
}

function matchesKeyword(record, keywords) {
  const haystack = buildSearchHaystack(record);
  return keywords.some((keyword) => haystack.includes(normalizeText(keyword)));
}

const collectionViews = {
  "scott-ford": {
    navLabel: "Scott Ford Houses",
    deck: "Home, kinship, and neighborhood memory tied to the Scott Ford Houses.",
    title: "Scott Ford Houses Records",
    intro:
      "This focused public view gathers published records tied to the Scott Ford Houses and the residents whose lives help tell that story.",
    status: "Showing the Scott Ford Houses public view.",
    matches(record) {
      return matchesKeyword(record, ["Scott Ford Houses", "Mary Scott", "Virginia Scott"]);
    }
  },
  "smith-robertson-history": {
    navLabel: "Smith Robertson History",
    deck: "School history, leadership, and memory across the Smith Robertson story.",
    title: "Smith Robertson History Records",
    intro:
      "This view highlights published records about the school's history, its leadership, and the people who shaped the Smith Robertson story.",
    status: "Showing the Smith Robertson history public view.",
    matches(record) {
      return matchesKeyword(record, [
        "Smith Robertson",
        "Smith Robertson Campus",
        "principal",
        "A.N. Jackson",
        "James Gooden",
        "Luther Marshall",
        "Charles S. Wilson",
        "Lv Randolph"
      ]);
    }
  },
  "civil-rights": {
    navLabel: "Civil Rights",
    deck: "Organizing, protest, and public memory linked to civil rights history.",
    title: "Civil Rights Related Records",
    intro:
      "This public view gathers published records connected to local and regional civil rights history, activism, and organizing.",
    status: "Showing the civil rights public view.",
    matches(record) {
      if (normalizeText(record.historical_theme) === normalizeText("Civil Rights")) {
        return true;
      }
      return matchesKeyword(record, [
        "civil rights",
        "Medgar Evers",
        "Fannie Lou Hamer",
        "SNCC",
        "SCLC",
        "Poor People's Campaign",
        "freedom movement"
      ]);
    }
  },
  "farish-street-history": {
    navLabel: "Farish Street History",
    deck: "Business, culture, and community life connected to Farish Street.",
    title: "Farish Street History Records",
    intro:
      "This public view gathers published records tied to Farish Street, its businesses, institutions, and community memory.",
    status: "Showing the Farish Street history public view.",
    matches(record) {
      return matchesKeyword(record, [
        "Farish Street",
        "Alamo Theatre",
        "Mount Helm",
        "Farish Street Historic District"
      ]);
    }
  }
};

const state = {
  allRecords: [],
  filteredRecords: [],
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
  archivePreviewUrls: new Map(),
  archiveSearchDebounceId: null
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
  collectionLead: document.querySelector("#collectionLead"),
  collectionHighlights: document.querySelector("#collectionHighlights"),
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

function resolvePublicPhotoUrl(record) {
  return buildImageSrc(record.image_thumb_file || record.image_file);
}

function resolvePrimaryImageUrl(record) {
  return buildImageSrc(record.image_file);
}

function applyRecordImage(image, record, altText, { eager = false } = {}) {
  if (!image || !record) {
    return;
  }

  const thumbUrl = resolvePublicPhotoUrl(record);
  const fullUrl = resolvePrimaryImageUrl(record);
  const initialUrl = thumbUrl || fullUrl;

  if (!initialUrl) {
    image.hidden = true;
    return;
  }

  image.hidden = false;
  image.alt = altText;
  image.loading = eager ? "eager" : "lazy";
  image.decoding = "async";
  image.dataset.fullUrl = fullUrl || "";
  image.dataset.fallbackApplied = "false";
  image.onerror = () => {
    const fallbackUrl = image.dataset.fullUrl;
    if (!fallbackUrl || image.dataset.fallbackApplied === "true" || image.src.endsWith(fallbackUrl)) {
      image.hidden = true;
      image.removeAttribute("src");
      return;
    }

    image.dataset.fallbackApplied = "true";
    image.src = fallbackUrl;
  };
  image.src = initialUrl;
}

function applyCatalogSettings() {
  const activeCollectionView = collectionViews[collectionView];
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
    elements.archiveTitle.textContent = activeCollectionView?.title || state.siteSettings.public_catalog_title;
  }
  if (elements.archiveIntro) {
    elements.archiveIntro.textContent = activeCollectionView?.intro || state.siteSettings.public_catalog_intro;
  }
  document.title =
    pageMode === "gallery"
      ? `${state.siteSettings.brand_name} Digital Gallery`
      : pageMode === "collection" && activeCollectionView
        ? `${activeCollectionView.title} | ${state.siteSettings.brand_name}`
        : `${state.siteSettings.brand_name} Archive`;
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

function getCollectionRecords() {
  return state.filteredRecords.length ? state.filteredRecords : state.records;
}

function findRecordByAccession(accession) {
  return (state.allRecords.length ? state.allRecords : state.records).find((record) => record.accession_number === accession);
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
  const pool = state.allRecords.length ? state.allRecords : state.records;
  return curated.length ? curated : pool.slice(0, fallbackCount);
}

async function loadCsvDataset() {
  if (state.allRecords.length) {
    return state.allRecords;
  }

  state.allRecords = await fetchPublishedRecords({
    jsonUrl: dataSourceConfig.publishedJsonUrl,
    csvUrl: dataSourceConfig.publishedCsvUrl
  });
  return state.allRecords;
}

async function fetchGalleryRecordsFromCsv() {
  const records = await loadCsvDataset();
  state.records = dedupeRecordsByAccession(records);
}

async function fetchArchiveRecordsFromCsv() {
  const filters = getArchiveFilterState();
  const allRecords = await loadCsvDataset();
  const activeCollectionView = collectionViews[collectionView];
  const query = String(filters.query || "")
    .trim()
    .toLowerCase();

  const filtered = allRecords
    .filter((record) => {
      if (pageMode === "collection" && activeCollectionView && !activeCollectionView.matches(record)) {
        return false;
      }
      if (filters.theme !== "all" && record.historical_theme !== filters.theme) {
        return false;
      }
      if (filters.type !== "all" && record.record_type !== filters.type) {
        return false;
      }
      if (!query) {
        return true;
      }

      return [
        record.accession_number,
        record.title,
        record.historical_theme,
        record.neighborhood,
        record.description,
        ...(record.tags || [])
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((left, right) =>
      String(left.accession_number || "").localeCompare(String(right.accession_number || ""), undefined, {
        numeric: true,
        sensitivity: "base"
      })
    );

  state.filteredRecords = filtered;
  state.archivePagination.total = filtered.length;
  const from = (state.archivePagination.page - 1) * state.archivePagination.pageSize;
  const to = from + state.archivePagination.pageSize;
  state.records = filtered.slice(from, to);
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

  applyRecordImage(image, record, `${record.title} image`);

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

async function renderCollectionExhibit() {
  if (pageMode !== "collection") {
    return;
  }

  const allCollectionRecords = getCollectionRecords();

  if (elements.collectionLead) {
    elements.collectionLead.replaceChildren();

    const lead = allCollectionRecords[0];
    if (lead) {
      const article = document.createElement("article");
      article.className = "exhibit-lead";

      const media = document.createElement("div");
      media.className = "exhibit-lead__media";

      const image = document.createElement("img");
      image.className = "exhibit-lead__image";
      applyRecordImage(image, lead, `${lead.title} image`, { eager: true });
      if (!image.hidden) {
        media.appendChild(image);
      }

      const body = document.createElement("div");
      body.className = "exhibit-lead__body";

      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = collectionViews[collectionView]?.navLabel || "Digital Exhibit";

      const title = document.createElement("h2");
      title.textContent = lead.title;

      const meta = document.createElement("p");
      meta.className = "exhibit-lead__meta";
      meta.textContent = [lead.record_type, lead.neighborhood, lead.time_period || lead.object_date]
        .filter(Boolean)
        .join(" • ");

      const description = document.createElement("p");
      description.className = "exhibit-lead__description";
      description.textContent = lead.significance || lead.description || "No description available.";

      const tags = document.createElement("div");
      tags.className = "tag-list";
      tags.replaceChildren(createTagElements(lead.tags));

      body.append(eyebrow, title, meta, description, tags);
      article.append(media, body);
      elements.collectionLead.appendChild(article);
    }
  }

  if (elements.collectionHighlights) {
    elements.collectionHighlights.replaceChildren();

    const highlights = allCollectionRecords.slice(1, 5);
    if (!highlights.length) {
      elements.collectionHighlights.innerHTML = `
        <div class="empty-state">
          <h3>No additional highlights yet.</h3>
          <p>Publish more records in this story view to build out the exhibit.</p>
        </div>
      `;
      return;
    }

    for (const record of highlights) {
      await populateCatalogCard(elements.collectionHighlights, record);
    }
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

  applyRecordImage(image, current, `${current.title} image`, { eager: true });

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
      image.alt = `${record.title} image`;
      image.loading = "lazy";
      image.decoding = "async";
      image.dataset.fullUrl = resolvePrimaryImageUrl(record) || "";
      image.dataset.fallbackApplied = "false";
      image.onerror = () => {
        const fallbackUrl = image.dataset.fullUrl;
        if (!fallbackUrl || image.dataset.fallbackApplied === "true" || image.src.endsWith(fallbackUrl)) {
          media.hidden = true;
          image.removeAttribute("src");
          return;
        }
        image.dataset.fallbackApplied = "true";
        image.src = fallbackUrl;
      };
      image.src = cachedUrl;
    } else if (record.image_file || record.image_thumb_file) {
      try {
        const resolvedPhotoUrl = resolvePublicPhotoUrl(record) || resolvePrimaryImageUrl(record);
        if (resolvedPhotoUrl) {
          state.archivePreviewUrls.set(cacheKey, resolvedPhotoUrl);
          applyRecordImage(image, record, `${record.title} image`);
        }
      } catch (_error) {
        media.hidden = true;
      }
    } else {
      media.hidden = true;
    }

    elements.list.appendChild(fragment);
  }
}

async function loadCurrentUser() {
  if (!elements.authAction) {
    return;
  }
  elements.authAction.textContent = "Collections Manager";
  elements.authAction.href = "./login.html";
}

async function loadCatalog() {
  if (!dataSourceConfig.publishedJsonUrl && !dataSourceConfig.publishedCsvUrl) {
    setStatus("Add a published JSON or CSV URL in data-source-config.js to load the public site.", true);
    return;
  }

  state.siteSettings = buildConfiguredSiteSettings();
  state.recordTypes = [...defaultRecordTypes];
  state.taxonomyGroups = [...defaultTaxonomyGroups];
  state.taxonomyTerms = [...defaultTaxonomyTerms].map(normalizeTaxonomyTerm);

  applyCatalogSettings();
  renderRecordTypeFilter();
  renderThemeFilter();

  if (pageMode === "archive") {
    await fetchArchiveRecordsFromCsv();
    await renderArchive();
    updateArchivePaginationUI();
    await loadCurrentUser();
    setStatus("Showing the searchable public archive.");
    return;
  }

  if (pageMode === "collection") {
    await fetchArchiveRecordsFromCsv();
    await renderCollectionExhibit();
    await renderArchive();
    updateArchivePaginationUI();
    await loadCurrentUser();
    setStatus(collectionViews[collectionView]?.status || "Showing a collection-focused public view.");
    return;
  }

  await fetchGalleryRecordsFromCsv();
  await Promise.all([renderFeaturedRecords(), renderSlideshow(), loadCurrentUser()]);
  setStatus("Showing the curated digital gallery.");
}

async function refreshArchivePage({ resetPage = false } = {}) {
  if (pageMode !== "archive" && pageMode !== "collection") {
    return;
  }

  if (resetPage) {
    state.archivePagination.page = 1;
  }

  if (dataSourceConfig.publishedCsvUrl) {
    await fetchArchiveRecordsFromCsv();
    if (pageMode === "collection") {
      await renderCollectionExhibit();
    }
    await renderArchive();
    return;
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
