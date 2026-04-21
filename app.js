import { createBrowserClient, isSupabaseReady, museumBucketName } from "./supabase-client.js";
import {
  applyTheme,
  defaultTaxonomyGroups,
  defaultTaxonomyTerms,
  defaultRecordTypes,
  defaultSiteSettings,
  publicFontThemes,
  slugifyRecordType,
  sortRecordTypes,
  sortTaxonomyEntries
} from "./platform-config.js";

const sampleRecords = [
  {
    accession_number: "SRM-FS-1952-001",
    title: "Farish Street Beauty Shop Sign",
    record_type: "Artifact",
    status: "On Display",
    collection_name: "Farish Street Business District",
    location: "Gallery 2",
    historical_theme: "Farish Street Business District",
    neighborhood: "Farish Street",
    time_period: "1950s",
    donor: "Farish Street Heritage Project",
    object_date: "ca. 1952",
    format_material: "painted metal sign",
    people: "Farish Street shop owners and beauticians",
    description: "Storefront sign from a Black-owned beauty shop that served the Farish Street business district.",
    significance:
      "The sign represents Black entrepreneurship and the commercial life of Farish Street during segregation.",
    provenance: "Donated by a former business owner's family.",
    condition: "Stable",
    rights_status: "Educational Use Approved",
    sensitivity: "Open Access",
    photo_url: "",
    photo_path: "",
    photo_credit: "",
    is_public: true,
    tags: ["Farish Street", "business history", "Jackson history", "African American entrepreneurship"],
    notes: "Surface paint loss along right edge."
  },
  {
    accession_number: "SRM-TX-1948-003",
    title: "Church Choir Robe",
    record_type: "Textile",
    status: "In Storage",
    collection_name: "Faith And Community Life",
    location: "Textile Cabinet 1",
    historical_theme: "Faith And Community Life",
    neighborhood: "Downtown Jackson",
    time_period: "1940s",
    donor: "Mt. Olive Collection Transfer",
    object_date: "ca. 1948",
    format_material: "fabric textile",
    people: "Church choir members",
    description: "Ceremonial choir robe associated with African American church life in Jackson.",
    significance: "The robe connects worship, music, and community leadership in Black church history.",
    provenance: "Transferred from congregational storage.",
    condition: "Fragile",
    rights_status: "Museum Use Only",
    sensitivity: "Review Before Public Display",
    photo_url: "",
    photo_path: "",
    photo_credit: "",
    is_public: false,
    tags: ["textiles", "church life", "Jackson history"],
    notes: "Needs conservation review before display."
  },
  {
    accession_number: "SRM-SR-1931-004",
    title: "Smith Robertson School Graduation Photograph",
    record_type: "Photograph",
    status: "Digitized",
    collection_name: "School History Collection",
    location: "Digital Archive",
    historical_theme: "African American Education",
    neighborhood: "Smith Robertson Campus",
    time_period: "1930s",
    donor: "Smith Robertson Alumni Circle",
    object_date: "1931",
    format_material: "gelatin silver print",
    people: "Smith Robertson School graduating class",
    description: "Class portrait documenting student life and graduation at Smith Robertson School.",
    significance: "The image speaks directly to Black education history in Jackson and the museum's own site history.",
    provenance: "Scanned from family album loaned by alumni descendants.",
    condition: "Stable",
    rights_status: "Educational Use Approved",
    sensitivity: "Open Access",
    photo_url: "",
    photo_path: "",
    photo_credit: "",
    is_public: true,
    tags: ["Smith Robertson", "African American education", "Jackson history"],
    notes: "Original print housed in archival sleeve."
  }
];

const state = {
  records: [],
  siteSettings: { ...defaultSiteSettings },
  recordTypes: [...defaultRecordTypes],
  taxonomyGroups: [...defaultTaxonomyGroups],
  taxonomyTerms: [...defaultTaxonomyTerms],
  collectionEntities: [],
  personEntities: [],
  placeEntities: [],
  selectedId: null,
  currentUser: null,
  isAdmin: false,
  isStaff: false,
  activeView: "table",
  photoUploadPath: "",
  photoPreviewUrl: "",
  supabase: createBrowserClient()
};

const elements = {
  authForm: document.querySelector("#authForm"),
  signUpButton: document.querySelector("#signUpButton"),
  signOutButton: document.querySelector("#signOutButton"),
  signedOutView: document.querySelector("#signedOutView"),
  signedInView: document.querySelector("#signedInView"),
  currentUserEmail: document.querySelector("#currentUserEmail"),
  authMessage: document.querySelector("#authMessage"),
  topbarBrand: document.querySelector("#topbarBrand"),
  heroEyebrow: document.querySelector("#heroEyebrow"),
  heroHeadline: document.querySelector("#heroHeadline"),
  heroIntro: document.querySelector("#heroIntro"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  setupBanner: document.querySelector("#setupBanner"),
  setupDetails: document.querySelector("#setupDetails"),
  form: document.querySelector("#recordForm"),
  formHeading: document.querySelector("#formHeading"),
  recordsToolbar: document.querySelector("#recordsToolbar"),
  browseTableTab: document.querySelector("#browseTableTab"),
  editorTab: document.querySelector("#editorTab"),
  settingsTab: document.querySelector("#settingsTab"),
  tableView: document.querySelector("#tableView"),
  editorView: document.querySelector("#editorView"),
  settingsView: document.querySelector("#settingsView"),
  siteSettingsForm: document.querySelector("#siteSettingsForm"),
  settingsBrandName: document.querySelector("#settingsBrandName"),
  settingsMuseumName: document.querySelector("#settingsMuseumName"),
  settingsManagerHeadline: document.querySelector("#settingsManagerHeadline"),
  settingsManagerIntro: document.querySelector("#settingsManagerIntro"),
  settingsPublicTitle: document.querySelector("#settingsPublicTitle"),
  settingsPublicIntro: document.querySelector("#settingsPublicIntro"),
  settingsPublicFontTheme: document.querySelector("#settingsPublicFontTheme"),
  settingsGalleryTitle: document.querySelector("#settingsGalleryTitle"),
  settingsGalleryIntro: document.querySelector("#settingsGalleryIntro"),
  settingsSlideshowAccessions: document.querySelector("#settingsSlideshowAccessions"),
  settingsFeaturedAccessions: document.querySelector("#settingsFeaturedAccessions"),
  settingsPrimaryColor: document.querySelector("#settingsPrimaryColor"),
  settingsAccentDeepColor: document.querySelector("#settingsAccentDeepColor"),
  settingsForestColor: document.querySelector("#settingsForestColor"),
  settingsMessage: document.querySelector("#settingsMessage"),
  settingsAdminNotice: document.querySelector("#settingsAdminNotice"),
  recordTypeSettingsList: document.querySelector("#recordTypeSettingsList"),
  entityDirectorySettings: document.querySelector("#entityDirectorySettings"),
  taxonomySettingsList: document.querySelector("#taxonomySettingsList"),
  addRecordTypeButton: document.querySelector("#addRecordTypeButton"),
  recordId: document.querySelector("#recordId"),
  accessionNumber: document.querySelector("#accessionNumber"),
  title: document.querySelector("#title"),
  recordType: document.querySelector("#recordType"),
  recordStatus: document.querySelector("#recordStatus"),
  collectionName: document.querySelector("#collectionName"),
  collectionEntityId: document.querySelector("#collectionEntityId"),
  location: document.querySelector("#location"),
  historicalTheme: document.querySelector("#historicalTheme"),
  neighborhood: document.querySelector("#neighborhood"),
  placeEntityId: document.querySelector("#placeEntityId"),
  timePeriod: document.querySelector("#timePeriod"),
  people: document.querySelector("#people"),
  peopleEntityPicker: document.querySelector("#peopleEntityPicker"),
  donor: document.querySelector("#donor"),
  objectDate: document.querySelector("#era"),
  formatMaterial: document.querySelector("#format"),
  condition: document.querySelector("#condition"),
  rightsStatus: document.querySelector("#rights"),
  sensitivity: document.querySelector("#sensitivity"),
  isPublic: document.querySelector("#isPublic"),
  photoFile: document.querySelector("#photoFile"),
  photoUrl: document.querySelector("#photoUrl"),
  photoCredit: document.querySelector("#photoCredit"),
  photoStatus: document.querySelector("#photoStatus"),
  photoPreview: document.querySelector("#photoPreview"),
  removePhotoButton: document.querySelector("#removePhotoButton"),
  description: document.querySelector("#description"),
  significance: document.querySelector("#significance"),
  provenance: document.querySelector("#provenance"),
  notes: document.querySelector("#notes"),
  tags: document.querySelector("#tags"),
  tableCountLabel: document.querySelector("#tableCountLabel"),
  activeFilterPills: document.querySelector("#activeFilterPills"),
  recordTableBody: document.querySelector("#recordTableBody"),
  totalRecordsMetric: document.querySelector("#totalRecordsMetric"),
  farishMetric: document.querySelector("#farishMetric"),
  textileMetric: document.querySelector("#textileMetric"),
  publicMetric: document.querySelector("#publicMetric"),
  reviewMetric: document.querySelector("#reviewMetric"),
  searchInput: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  themeFilter: document.querySelector("#themeFilter"),
  neighborhoodFilter: document.querySelector("#neighborhoodFilter"),
  visibilityFilter: document.querySelector("#visibilityFilter"),
  exportButton: document.querySelector("#exportButton"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  importInput: document.querySelector("#importInput"),
  clearDataButton: document.querySelector("#clearDataButton"),
  resetFormButton: document.querySelector("#resetFormButton"),
  duplicateButton: document.querySelector("#duplicateButton"),
  presetTags: document.querySelector("#presetTags"),
  sectionJumpButtons: document.querySelectorAll("[data-section-target]"),
  tableRowTemplate: document.querySelector("#recordTableRowTemplate"),
  recordTypeSettingTemplate: document.querySelector("#recordTypeSettingTemplate"),
  entityDirectoryTemplate: document.querySelector("#entityDirectoryTemplate"),
  entityRowTemplate: document.querySelector("#entityRowTemplate")
};

function normalizedTags(value) {
  return (value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function setAuthMessage(message, isError = false) {
  elements.authMessage.textContent = message;
  elements.authMessage.classList.toggle("help-text--error", isError);
}

function setPhotoStatus(message, isError = false) {
  elements.photoStatus.textContent = message;
  elements.photoStatus.classList.toggle("help-text--error", isError);
}

function setSettingsMessage(message, isError = false) {
  elements.settingsMessage.textContent = message;
  elements.settingsMessage.classList.toggle("help-text--error", isError);
}

function setPhotoPreview(url = "") {
  state.photoPreviewUrl = url;
  elements.photoPreview.hidden = !url;
  elements.photoPreview.src = url || "";
  elements.removePhotoButton.hidden = !url;
}

function getEnabledRecordTypes() {
  return sortRecordTypes(state.recordTypes).filter((type) => type.enabled);
}

function applySiteSettingsToPage() {
  const settings = state.siteSettings;
  elements.topbarBrand.textContent = settings.brand_name;
  elements.heroEyebrow.textContent = settings.museum_name;
  elements.heroHeadline.textContent = settings.manager_headline;
  elements.heroIntro.textContent = settings.manager_intro;
  document.title = `${settings.brand_name} Manager`;
  applyTheme(settings);
}

function parseCommaSeparatedList(value) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderPublicFontThemeOptions() {
  const currentValue = elements.settingsPublicFontTheme.value || state.siteSettings.public_font_theme;
  elements.settingsPublicFontTheme.replaceChildren();

  for (const optionDef of publicFontThemes) {
    const option = document.createElement("option");
    option.value = optionDef.value;
    option.textContent = optionDef.label;
    elements.settingsPublicFontTheme.appendChild(option);
  }

  elements.settingsPublicFontTheme.value = [...elements.settingsPublicFontTheme.options].some(
    (option) => option.value === currentValue
  )
    ? currentValue
    : publicFontThemes[0].value;
}

function normalizeEntity(entry, entityType) {
  return {
    id: entry.id || crypto.randomUUID(),
    entity_type: entityType,
    label: entry.label || "",
    summary: entry.summary || "",
    enabled: entry.enabled ?? true,
    sort_order: entry.sort_order ?? 0
  };
}

function sortEntities(entries) {
  return [...entries].sort((left, right) => {
    if ((left.sort_order ?? 0) !== (right.sort_order ?? 0)) {
      return (left.sort_order ?? 0) - (right.sort_order ?? 0);
    }
    return (left.label || "").localeCompare(right.label || "");
  });
}

function getEnabledEntities(entityType) {
  const map = {
    collection: state.collectionEntities,
    person: state.personEntities,
    place: state.placeEntities
  };

  return sortEntities(map[entityType] || []).filter((entry) => entry.enabled);
}

function buildEntitySelect(select, entityType, blankLabel) {
  const currentValue = select.value;
  select.replaceChildren();

  const blankOption = document.createElement("option");
  blankOption.value = "";
  blankOption.textContent = blankLabel;
  select.appendChild(blankOption);

  for (const entry of getEnabledEntities(entityType)) {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.label;
    select.appendChild(option);
  }

  select.value = [...select.options].some((option) => option.value === currentValue) ? currentValue : "";
}

function updateEntityAt(entityType, id, nextValues) {
  const key = `${entityType}Entities`;
  const index = state[key].findIndex((entry) => entry.id === id);
  if (index === -1) {
    return;
  }
  state[key][index] = {
    ...state[key][index],
    ...nextValues
  };
}

function renderEntityPicker() {
  elements.peopleEntityPicker.replaceChildren();

  const selected = new Set((elements.peopleEntityPicker.dataset.selectedIds || "").split(",").filter(Boolean));

  for (const person of getEnabledEntities("person")) {
    const label = document.createElement("label");
    label.className = "toggle entity-picker__option";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = person.id;
    input.checked = selected.has(person.id);
    input.addEventListener("change", () => {
      const current = new Set((elements.peopleEntityPicker.dataset.selectedIds || "").split(",").filter(Boolean));
      if (input.checked) {
        current.add(person.id);
      } else {
        current.delete(person.id);
      }
      elements.peopleEntityPicker.dataset.selectedIds = [...current].join(",");
    });
    const span = document.createElement("span");
    span.textContent = person.label;
    label.append(input, span);
    elements.peopleEntityPicker.appendChild(label);
  }
}

function getSelectedPeopleEntityIds() {
  return (elements.peopleEntityPicker.dataset.selectedIds || "").split(",").filter(Boolean);
}

function getEntityLabelById(entityType, id) {
  return getEnabledEntities(entityType)
    .concat(sortEntities(state[`${entityType}Entities`]))
    .find((entry) => entry.id === id)?.label;
}

function renderEntityOptions() {
  buildEntitySelect(elements.collectionEntityId, "collection", "No linked collection");
  buildEntitySelect(elements.placeEntityId, "place", "No linked place");
  renderEntityPicker();
}

function renderEntityDirectorySettings() {
  const directoryConfigs = [
    {
      entityType: "collection",
      title: "Collections",
      description: "Shared collection names for structured cataloging and public storytelling."
    },
    {
      entityType: "person",
      title: "People",
      description: "Named individuals, families, groups, or organizations linked across records."
    },
    {
      entityType: "place",
      title: "Places",
      description: "Key locations that can be connected to records, exhibitions, and archival descriptions."
    }
  ];

  elements.entityDirectorySettings.replaceChildren();

  for (const config of directoryConfigs) {
    const fragment = elements.entityDirectoryTemplate.content.cloneNode(true);
    fragment.querySelector('[data-role="eyebrow"]').textContent = config.entityType;
    fragment.querySelector('[data-role="title"]').textContent = config.title;
    fragment.querySelector('[data-role="description"]').textContent = config.description;

    const list = fragment.querySelector('[data-role="list"]');
    const addButton = fragment.querySelector('[data-role="add"]');

    addButton.addEventListener("click", () => {
      state[`${config.entityType}Entities`].push(
        normalizeEntity(
          {
            label: `New ${config.title.slice(0, -1)}`,
            sort_order: state[`${config.entityType}Entities`].length * 10 + 10
          },
          config.entityType
        )
      );
      renderEntityDirectorySettings();
      renderEntityOptions();
    });

    for (const entry of getEnabledEntities(config.entityType).concat(
      sortEntities(state[`${config.entityType}Entities`]).filter((item) => !item.enabled)
    )) {
      const row = elements.entityRowTemplate.content.cloneNode(true);
      const labelInput = row.querySelector('[data-role="label"]');
      const summaryInput = row.querySelector('[data-role="summary"]');
      const sortInput = row.querySelector('[data-role="sort"]');
      const enabledInput = row.querySelector('[data-role="enabled"]');

      labelInput.value = entry.label;
      summaryInput.value = entry.summary || "";
      sortInput.value = String(entry.sort_order ?? 0);
      enabledInput.checked = Boolean(entry.enabled);

      labelInput.addEventListener("input", (event) => {
        updateEntityAt(config.entityType, entry.id, { label: event.target.value });
      });
      summaryInput.addEventListener("input", (event) => {
        updateEntityAt(config.entityType, entry.id, { summary: event.target.value });
      });
      sortInput.addEventListener("input", (event) => {
        updateEntityAt(config.entityType, entry.id, { sort_order: Number(event.target.value || 0) });
      });
      enabledInput.addEventListener("change", (event) => {
        updateEntityAt(config.entityType, entry.id, { enabled: event.target.checked });
        renderEntityOptions();
      });

      list.appendChild(row);
    }

    elements.entityDirectorySettings.appendChild(fragment);
  }
}

function populateSettingsForm() {
  const settings = state.siteSettings;
  elements.settingsBrandName.value = settings.brand_name;
  elements.settingsMuseumName.value = settings.museum_name;
  elements.settingsManagerHeadline.value = settings.manager_headline;
  elements.settingsManagerIntro.value = settings.manager_intro;
  elements.settingsPublicTitle.value = settings.public_catalog_title;
  elements.settingsPublicIntro.value = settings.public_catalog_intro;
  renderPublicFontThemeOptions();
  elements.settingsPublicFontTheme.value = settings.public_font_theme;
  elements.settingsGalleryTitle.value = settings.public_gallery_title;
  elements.settingsGalleryIntro.value = settings.public_gallery_intro;
  elements.settingsSlideshowAccessions.value = (settings.public_slideshow_accessions || []).join(", ");
  elements.settingsFeaturedAccessions.value = (settings.public_featured_accessions || []).join(", ");
  elements.settingsPrimaryColor.value = settings.primary_color;
  elements.settingsAccentDeepColor.value = settings.accent_deep_color;
  elements.settingsForestColor.value = settings.forest_color;
}

function normalizeTaxonomyGroup(group) {
  if (!group) {
    return null;
  }

  if (group.slug === "neighborhood") {
    return {
      ...group,
      label: "Geographies",
      description: "Key locations, campuses, regions, or geographic contexts."
    };
  }

  return group;
}

function normalizeTaxonomyTerm(term) {
  if (!term) {
    return null;
  }

  if (term.group_slug === "historical-theme" && term.slug === "family-and-neighborhood-life") {
    return {
      ...term,
      label: "Family And Local Life"
    };
  }

  return term;
}

function getTaxonomyGroup(groupSlug) {
  return normalizeTaxonomyGroup(state.taxonomyGroups.find((item) => item.slug === groupSlug) || null);
}

function getEnabledTaxonomyTerms(groupSlug) {
  return sortTaxonomyEntries(state.taxonomyTerms).filter((term) => term.group_slug === groupSlug && term.enabled);
}

function buildTaxonomyOptions(select, groupSlug, { includeAll = false, includeBlank = false, blankLabel = "Select an option" } = {}) {
  const currentValue = select.value;
  select.replaceChildren();

  if (includeAll) {
    const option = document.createElement("option");
    option.value = "all";
    option.textContent = `All ${getTaxonomyGroup(groupSlug)?.label?.toLowerCase() || "options"}`;
    select.appendChild(option);
  }

  if (includeBlank) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = blankLabel;
    select.appendChild(option);
  }

  for (const term of getEnabledTaxonomyTerms(groupSlug)) {
    const option = document.createElement("option");
    option.value = term.label;
    option.textContent = term.label;
    select.appendChild(option);
  }

  if ([...select.options].some((option) => option.value === currentValue)) {
    select.value = currentValue;
  } else if (includeAll) {
    select.value = "all";
  } else if (includeBlank) {
    select.value = "";
  } else if (select.options.length) {
    select.value = select.options[0].value;
  }
}

function renderManagedMetadataOptions() {
  buildTaxonomyOptions(elements.statusFilter, "status", { includeAll: true });
  buildTaxonomyOptions(elements.themeFilter, "historical-theme", { includeAll: true });
  buildTaxonomyOptions(elements.neighborhoodFilter, "neighborhood", { includeAll: true });
  buildTaxonomyOptions(elements.recordStatus, "status");
  buildTaxonomyOptions(elements.historicalTheme, "historical-theme", {
    includeBlank: true,
    blankLabel: "Select a theme"
  });
  buildTaxonomyOptions(elements.neighborhood, "neighborhood", {
    includeBlank: true,
    blankLabel: "Select a place"
  });
  buildTaxonomyOptions(elements.condition, "condition", {
    includeBlank: true,
    blankLabel: "Select condition"
  });
  buildTaxonomyOptions(elements.rightsStatus, "rights-status", {
    includeBlank: true,
    blankLabel: "Select rights status"
  });
  buildTaxonomyOptions(elements.sensitivity, "sensitivity", {
    includeBlank: true,
    blankLabel: "Select sensitivity"
  });
}

function renderPresetTagButtons() {
  elements.presetTags.replaceChildren();

  for (const term of getEnabledTaxonomyTerms("suggested-tag")) {
    const button = document.createElement("button");
    button.className = "chip";
    button.type = "button";
    button.dataset.tag = term.label;
    button.textContent = term.label;
    elements.presetTags.appendChild(button);
  }
}

function buildRecordTypeOptions(select, includeAll = false) {
  const currentValue = select.value;
  select.replaceChildren();

  if (includeAll) {
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All types";
    select.appendChild(allOption);
  }

  for (const type of getEnabledRecordTypes()) {
    const option = document.createElement("option");
    option.value = type.label;
    option.textContent = type.label;
    select.appendChild(option);
  }

  if ([...select.options].some((option) => option.value === currentValue)) {
    select.value = currentValue;
  } else if (includeAll) {
    select.value = "all";
  } else if (select.options.length) {
    select.value = select.options[0].value;
  }
}

function renderRecordTypeOptions() {
  buildRecordTypeOptions(elements.typeFilter, true);
  buildRecordTypeOptions(elements.recordType, false);
}

function updateRecordTypeAt(index, nextValues) {
  state.recordTypes[index] = {
    ...state.recordTypes[index],
    ...nextValues
  };
}

function renderRecordTypeSettings() {
  const sortedTypes = sortRecordTypes(state.recordTypes);
  elements.recordTypeSettingsList.replaceChildren();

  for (const type of sortedTypes) {
    const index = state.recordTypes.findIndex((item) => item.slug === type.slug);
    const fragment = elements.recordTypeSettingTemplate.content.cloneNode(true);
    const labelInput = fragment.querySelector('[data-role="label"]');
    const sortInput = fragment.querySelector('[data-role="sort"]');
    const enabledInput = fragment.querySelector('[data-role="enabled"]');

    labelInput.value = type.label;
    sortInput.value = String(type.sort_order);
    enabledInput.checked = type.enabled;

    labelInput.addEventListener("input", (event) => {
      updateRecordTypeAt(index, {
        label: event.target.value,
        slug: slugifyRecordType(event.target.value || type.slug)
      });
    });
    sortInput.addEventListener("input", (event) => {
      updateRecordTypeAt(index, {
        sort_order: Number(event.target.value || 0)
      });
    });
    enabledInput.addEventListener("change", (event) => {
      updateRecordTypeAt(index, {
        enabled: event.target.checked
      });
    });

    elements.recordTypeSettingsList.appendChild(fragment);
  }
}

async function loadSiteSettings() {
  if (!isSupabaseReady) {
    state.siteSettings = { ...defaultSiteSettings };
    applySiteSettingsToPage();
    populateSettingsForm();
    return;
  }

  const { data, error } = await state.supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();
  if (error) {
    throw error;
  }

  state.siteSettings = {
    ...defaultSiteSettings,
    ...(data || {})
  };
  applySiteSettingsToPage();
  populateSettingsForm();
}

async function loadRecordTypes() {
  if (!isSupabaseReady) {
    state.recordTypes = [...defaultRecordTypes];
    renderRecordTypeOptions();
    renderRecordTypeSettings();
    return;
  }

  const { data, error } = await state.supabase.from("record_type_definitions").select("*").order("sort_order");
  if (error) {
    throw error;
  }

  state.recordTypes = data?.length
    ? data.map((type) => ({
        slug: type.slug,
        label: type.label,
        enabled: type.enabled,
        sort_order: type.sort_order
      }))
    : [...defaultRecordTypes];

  renderRecordTypeOptions();
  renderRecordTypeSettings();
}

async function loadEntityDirectories() {
  if (!isSupabaseReady) {
    state.collectionEntities = [
      normalizeEntity({ label: "School History Collection", summary: "School records, memorabilia, and educational materials.", sort_order: 10 }, "collection"),
      normalizeEntity({ label: "Farish Street Business District", summary: "Business history and entrepreneurship linked to Farish Street.", sort_order: 20 }, "collection")
    ];
    state.personEntities = [
      normalizeEntity({ label: "Smith Robertson Alumni Circle", summary: "Alumni and descendants connected to Smith Robertson School.", sort_order: 10 }, "person"),
      normalizeEntity({ label: "Farish Street shop owners", summary: "Business owners and entrepreneurs active in the district.", sort_order: 20 }, "person")
    ];
    state.placeEntities = [
      normalizeEntity({ label: "Smith Robertson Campus", summary: "Museum site and former school campus.", sort_order: 10 }, "place"),
      normalizeEntity({ label: "Farish Street", summary: "Historic commercial and cultural corridor in Jackson.", sort_order: 20 }, "place")
    ];
    renderEntityDirectorySettings();
    renderEntityOptions();
    return;
  }

  const { data, error } = await state.supabase.from("linked_entities").select("*").order("sort_order");
  if (error) {
    if (error.message?.includes("linked_entities")) {
      state.collectionEntities = [];
      state.personEntities = [];
      state.placeEntities = [];
      renderEntityDirectorySettings();
      renderEntityOptions();
      return;
    }
    throw error;
  }

  const entries = data || [];
  state.collectionEntities = entries
    .filter((entry) => entry.entity_type === "collection")
    .map((entry) => normalizeEntity(entry, "collection"));
  state.personEntities = entries
    .filter((entry) => entry.entity_type === "person")
    .map((entry) => normalizeEntity(entry, "person"));
  state.placeEntities = entries
    .filter((entry) => entry.entity_type === "place")
    .map((entry) => normalizeEntity(entry, "place"));

  renderEntityDirectorySettings();
  renderEntityOptions();
}

async function saveEntityDirectories() {
  const payload = [...state.collectionEntities, ...state.personEntities, ...state.placeEntities]
    .map((entry, index) => ({
      id: entry.id,
      entity_type: entry.entity_type,
      label: entry.label?.trim() || "",
      summary: entry.summary?.trim() || "",
      enabled: Boolean(entry.enabled),
      sort_order: Number(entry.sort_order ?? index * 10)
    }))
    .filter((entry) => entry.label);

  const { error } = await state.supabase.from("linked_entities").upsert(payload, { onConflict: "id" });
  if (error) {
    if (error.message?.includes("linked_entities")) {
      throw new Error("Linked entity directories need the latest Supabase schema. Re-run supabase/schema.sql once, then save again.");
    }
    throw error;
  }

  state.collectionEntities = payload
    .filter((entry) => entry.entity_type === "collection")
    .map((entry) => normalizeEntity(entry, "collection"));
  state.personEntities = payload
    .filter((entry) => entry.entity_type === "person")
    .map((entry) => normalizeEntity(entry, "person"));
  state.placeEntities = payload
    .filter((entry) => entry.entity_type === "place")
    .map((entry) => normalizeEntity(entry, "place"));

  renderEntityDirectorySettings();
  renderEntityOptions();
}

function updateTaxonomyGroupAt(groupSlug, nextValues) {
  const index = state.taxonomyGroups.findIndex((group) => group.slug === groupSlug);
  if (index === -1) {
    return;
  }
  state.taxonomyGroups[index] = {
    ...state.taxonomyGroups[index],
    ...nextValues
  };
}

function updateTaxonomyTermAt(groupSlug, slug, nextValues) {
  const index = state.taxonomyTerms.findIndex((term) => term.group_slug === groupSlug && term.slug === slug);
  if (index === -1) {
    return;
  }
  state.taxonomyTerms[index] = {
    ...state.taxonomyTerms[index],
    ...nextValues
  };
}

function renderTaxonomySettings() {
  elements.taxonomySettingsList.replaceChildren();

  for (const group of sortTaxonomyEntries(state.taxonomyGroups)) {
    const card = document.createElement("article");
    card.className = "taxonomy-card";

    const header = document.createElement("div");
    header.className = "taxonomy-card__header";

    const copy = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = group.slug;
    const heading = document.createElement("h3");
    heading.textContent = group.label;
    const description = document.createElement("p");
    description.className = "help-text";
    description.textContent = group.description || "No description yet.";
    copy.append(eyebrow, heading, description);

    const addTermButton = document.createElement("button");
    addTermButton.type = "button";
    addTermButton.className = "button button--ghost";
    addTermButton.textContent = "Add Term";
    addTermButton.addEventListener("click", () => {
      state.taxonomyTerms.push({
        group_slug: group.slug,
        slug: `${group.slug}-${Date.now()}`,
        label: "New Term",
        enabled: true,
        sort_order: getEnabledTaxonomyTerms(group.slug).length * 10 + 10
      });
      renderTaxonomySettings();
    });

    header.append(copy, addTermButton);

    const controls = document.createElement("div");
    controls.className = "taxonomy-card__controls";

    const groupLabel = document.createElement("label");
    groupLabel.className = "field";
    groupLabel.innerHTML = "<span>Display Label</span>";
    const groupLabelInput = document.createElement("input");
    groupLabelInput.value = group.label;
    groupLabelInput.addEventListener("input", (event) => {
      updateTaxonomyGroupAt(group.slug, { label: event.target.value });
    });
    groupLabel.appendChild(groupLabelInput);

    const groupDescription = document.createElement("label");
    groupDescription.className = "field field--wide";
    groupDescription.innerHTML = "<span>Description</span>";
    const groupDescriptionInput = document.createElement("textarea");
    groupDescriptionInput.rows = 2;
    groupDescriptionInput.value = group.description || "";
    groupDescriptionInput.addEventListener("input", (event) => {
      updateTaxonomyGroupAt(group.slug, { description: event.target.value });
    });
    groupDescription.appendChild(groupDescriptionInput);

    const publicToggle = document.createElement("label");
    publicToggle.className = "toggle";
    const publicCheckbox = document.createElement("input");
    publicCheckbox.type = "checkbox";
    publicCheckbox.checked = Boolean(group.public_visible);
    publicCheckbox.addEventListener("change", (event) => {
      updateTaxonomyGroupAt(group.slug, { public_visible: event.target.checked });
    });
    const publicText = document.createElement("span");
    publicText.textContent = "Show this vocabulary on the public site";
    publicToggle.append(publicCheckbox, publicText);

    controls.append(groupLabel, groupDescription, publicToggle);

    const termsList = document.createElement("div");
    termsList.className = "taxonomy-terms";

    for (const term of sortTaxonomyEntries(state.taxonomyTerms.filter((entry) => entry.group_slug === group.slug))) {
      const row = document.createElement("div");
      row.className = "taxonomy-term-row";

      const labelField = document.createElement("label");
      labelField.className = "field";
      labelField.innerHTML = "<span>Term Label</span>";
      const labelInput = document.createElement("input");
      labelInput.value = term.label;
      labelInput.addEventListener("input", (event) => {
        updateTaxonomyTermAt(group.slug, term.slug, { label: event.target.value });
      });
      labelField.appendChild(labelInput);

      const sortField = document.createElement("label");
      sortField.className = "field";
      sortField.innerHTML = "<span>Sort Order</span>";
      const sortInput = document.createElement("input");
      sortInput.type = "number";
      sortInput.min = "0";
      sortInput.step = "1";
      sortInput.value = String(term.sort_order ?? 0);
      sortInput.addEventListener("input", (event) => {
        updateTaxonomyTermAt(group.slug, term.slug, { sort_order: Number(event.target.value || 0) });
      });
      sortField.appendChild(sortInput);

      const enabledToggle = document.createElement("label");
      enabledToggle.className = "toggle taxonomy-term-row__toggle";
      const enabledCheckbox = document.createElement("input");
      enabledCheckbox.type = "checkbox";
      enabledCheckbox.checked = Boolean(term.enabled);
      enabledCheckbox.addEventListener("change", (event) => {
        updateTaxonomyTermAt(group.slug, term.slug, { enabled: event.target.checked });
      });
      const enabledText = document.createElement("span");
      enabledText.textContent = "Enabled";
      enabledToggle.append(enabledCheckbox, enabledText);

      row.append(labelField, sortField, enabledToggle);
      termsList.appendChild(row);
    }

    card.append(header, controls, termsList);
    elements.taxonomySettingsList.appendChild(card);
  }
}

async function loadTaxonomies() {
  if (!isSupabaseReady) {
    state.taxonomyGroups = [...defaultTaxonomyGroups];
    state.taxonomyTerms = [...defaultTaxonomyTerms];
    renderManagedMetadataOptions();
    renderPresetTagButtons();
    renderTaxonomySettings();
    return;
  }

  const [{ data: groupsData, error: groupsError }, { data: termsData, error: termsError }] = await Promise.all([
    state.supabase.from("taxonomy_groups").select("*").order("sort_order"),
    state.supabase.from("taxonomy_terms").select("*").order("sort_order")
  ]);

  if (groupsError || termsError) {
    state.taxonomyGroups = [...defaultTaxonomyGroups];
    state.taxonomyTerms = [...defaultTaxonomyTerms];
  } else {
    state.taxonomyGroups = groupsData?.length
      ? groupsData.map((group) =>
          normalizeTaxonomyGroup({
            slug: group.slug,
            label: group.label,
            description: group.description || "",
            public_visible: group.public_visible,
            sort_order: group.sort_order
          })
        )
      : [...defaultTaxonomyGroups];
    state.taxonomyTerms = termsData?.length
      ? termsData.map((term) =>
          normalizeTaxonomyTerm({
            group_slug: term.group_slug,
            slug: term.slug,
            label: term.label,
            enabled: term.enabled,
            sort_order: term.sort_order
          })
        )
      : [...defaultTaxonomyTerms];
  }

  renderManagedMetadataOptions();
  renderPresetTagButtons();
  renderTaxonomySettings();
}

async function saveSiteSettings() {
  const payload = {
    id: "default",
    brand_name: elements.settingsBrandName.value.trim() || defaultSiteSettings.brand_name,
    museum_name: elements.settingsMuseumName.value.trim() || defaultSiteSettings.museum_name,
    manager_headline: elements.settingsManagerHeadline.value.trim() || defaultSiteSettings.manager_headline,
    manager_intro: elements.settingsManagerIntro.value.trim() || defaultSiteSettings.manager_intro,
    public_catalog_title: elements.settingsPublicTitle.value.trim() || defaultSiteSettings.public_catalog_title,
    public_catalog_intro: elements.settingsPublicIntro.value.trim() || defaultSiteSettings.public_catalog_intro,
    public_gallery_title: elements.settingsGalleryTitle.value.trim() || defaultSiteSettings.public_gallery_title,
    public_gallery_intro: elements.settingsGalleryIntro.value.trim() || defaultSiteSettings.public_gallery_intro,
    public_font_theme: elements.settingsPublicFontTheme.value || defaultSiteSettings.public_font_theme,
    public_slideshow_accessions: parseCommaSeparatedList(elements.settingsSlideshowAccessions.value),
    public_featured_accessions: parseCommaSeparatedList(elements.settingsFeaturedAccessions.value),
    primary_color: elements.settingsPrimaryColor.value,
    accent_deep_color: elements.settingsAccentDeepColor.value,
    forest_color: elements.settingsForestColor.value
  };

  const { error } = await state.supabase.from("site_settings").upsert(payload);
  if (error) {
    if (
      error.message?.includes("public_featured_accessions") ||
      error.message?.includes("public_slideshow_accessions") ||
      error.message?.includes("public_gallery_title") ||
      error.message?.includes("public_gallery_intro") ||
      error.message?.includes("public_font_theme")
    ) {
      throw new Error(
        "The public-site editor needs the latest Supabase schema. Re-run supabase/schema.sql once, then try saving again."
      );
    }
    throw error;
  }

  state.siteSettings = payload;
  applySiteSettingsToPage();
  populateSettingsForm();
}

async function saveRecordTypes() {
  const payload = sortRecordTypes(state.recordTypes).map((type, index) => ({
    slug: slugifyRecordType(type.label || `type-${index + 1}`),
    label: type.label.trim(),
    enabled: Boolean(type.enabled),
    sort_order: Number(type.sort_order ?? index * 10)
  }));

  const cleaned = payload.filter((type) => type.label);

  const { error } = await state.supabase.from("record_type_definitions").upsert(cleaned, { onConflict: "slug" });
  if (error) {
    throw error;
  }

  state.recordTypes = cleaned;
  renderRecordTypeOptions();
  renderRecordTypeSettings();
}

async function saveTaxonomies() {
  const groupsPayload = sortTaxonomyEntries(state.taxonomyGroups).map((group, index) => ({
    slug: group.slug,
    label: group.label?.trim() || group.slug,
    description: group.description?.trim() || "",
    public_visible: Boolean(group.public_visible),
    sort_order: Number(group.sort_order ?? index * 10)
  }));

  const termsPayload = sortTaxonomyEntries(state.taxonomyTerms)
    .map((term, index) => ({
      group_slug: term.group_slug,
      slug: term.slug,
      label: term.label?.trim() || "",
      enabled: Boolean(term.enabled),
      sort_order: Number(term.sort_order ?? index * 10)
    }))
    .filter((term) => term.label);

  const [{ error: groupsError }, { error: termsError }] = await Promise.all([
    state.supabase.from("taxonomy_groups").upsert(groupsPayload, { onConflict: "slug" }),
    state.supabase.from("taxonomy_terms").upsert(termsPayload, { onConflict: "group_slug,slug" })
  ]);

  if (groupsError) {
    throw groupsError;
  }
  if (termsError) {
    throw termsError;
  }

  state.taxonomyGroups = groupsPayload;
  state.taxonomyTerms = termsPayload.map((term) => normalizeTaxonomyTerm(term));
  renderManagedMetadataOptions();
  renderPresetTagButtons();
  renderTaxonomySettings();
}

function currentUserIsAdmin(user = state.currentUser) {
  return Boolean(user);
}

function currentUserIsStaff(user = state.currentUser) {
  return user?.app_metadata?.museum_role === "staff";
}

function canEditSharedData() {
  return !isSupabaseReady || Boolean(state.currentUser);
}

function canDeleteRecords() {
  return !isSupabaseReady || Boolean(state.currentUser);
}

function updateAuthUI() {
  const signedIn = Boolean(state.currentUser);
  elements.signedOutView.hidden = signedIn;
  elements.signedInView.hidden = !signedIn;
  elements.currentUserEmail.textContent = signedIn ? `Signed in as ${state.currentUser.email}` : "";
  state.isAdmin = currentUserIsAdmin();
  state.isStaff = currentUserIsStaff();

  const isDisabled = !canEditSharedData();
  elements.form.querySelectorAll("input, select, textarea, button").forEach((element) => {
    const protectedIds = new Set(["emailInput", "passwordInput", "signUpButton", "signOutButton"]);
    if (protectedIds.has(element.id)) {
      return;
    }
    if (isDisabled) {
      element.setAttribute("disabled", "disabled");
    } else {
      element.removeAttribute("disabled");
    }
  });

  elements.siteSettingsForm.querySelectorAll("input, textarea, select, button").forEach((element) => {
    if (isDisabled || !state.isAdmin) {
      element.setAttribute("disabled", "disabled");
    } else {
      element.removeAttribute("disabled");
    }
  });

  elements.clearDataButton.hidden = !state.isStaff;
  elements.settingsTab.hidden = (!signedIn || !state.isAdmin) && isSupabaseReady;
  elements.settingsAdminNotice.hidden = state.isAdmin || !isSupabaseReady;

  if (state.activeView === "settings" && !state.isAdmin && isSupabaseReady) {
    setActiveView("table");
  }
}

function setActiveView(view) {
  state.activeView = view;
  const views = {
    table: elements.tableView,
    editor: elements.editorView,
    settings: elements.settingsView
  };
  const tabs = {
    table: elements.browseTableTab,
    editor: elements.editorTab,
    settings: elements.settingsTab
  };

  Object.entries(views).forEach(([key, node]) => {
    const active = key === view;
    node.hidden = !active;
    node.classList.toggle("panel-view--active", active);
  });

  Object.entries(tabs).forEach(([key, node]) => {
    node.classList.toggle("is-active", key === view);
  });

  if (view === "editor") {
    elements.recordsToolbar.hidden = true;
    jumpToSection("editorBasicsSection", false);
  } else if (view === "settings") {
    elements.recordsToolbar.hidden = true;
    jumpToSection("settingsBrandSection", false);
  } else {
    elements.recordsToolbar.hidden = false;
    elements.sectionJumpButtons.forEach((button) => button.classList.remove("is-active"));
  }
}

function jumpToSection(targetId, shouldScroll = true) {
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  elements.sectionJumpButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.sectionTarget === targetId);
  });

  if (target.tagName === "DETAILS") {
    target.open = true;
  }

  if (shouldScroll) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function applyInitialRoute() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  const section = params.get("section");

  if (view === "settings") {
    setActiveView("settings");
    if (section) {
      requestAnimationFrame(() => jumpToSection(section));
    }
    return;
  }

  if (view === "editor") {
    setActiveView("editor");
    if (section) {
      requestAnimationFrame(() => jumpToSection(section));
    }
    return;
  }

  if (view === "records" || view === "table") {
    setActiveView("table");
  }
}

function createTagElements(tags) {
  const fragment = document.createDocumentFragment();
  const values = tags?.length ? tags : ["untagged"];

  for (const value of values) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tag tag--interactive";
    button.textContent = value;
    button.addEventListener("click", () => {
      setActiveView("table");
      elements.searchInput.value = value;
      renderViews().catch((error) => setAuthMessage(error.message, true));
    });
    fragment.appendChild(button);
  }

  return fragment;
}

function renderActiveFilterPills() {
  const pills = [];
  const query = elements.searchInput.value.trim();
  if (query) {
    pills.push({ label: `Search: ${query}`, clear: () => (elements.searchInput.value = "") });
  }
  if (elements.typeFilter.value !== "all") {
    pills.push({ label: elements.typeFilter.value, clear: () => (elements.typeFilter.value = "all") });
  }
  if (elements.statusFilter.value !== "all") {
    pills.push({ label: elements.statusFilter.value, clear: () => (elements.statusFilter.value = "all") });
  }
  if (elements.themeFilter.value !== "all") {
    pills.push({ label: elements.themeFilter.value, clear: () => (elements.themeFilter.value = "all") });
  }
  if (elements.neighborhoodFilter.value !== "all") {
    pills.push({ label: elements.neighborhoodFilter.value, clear: () => (elements.neighborhoodFilter.value = "all") });
  }
  if (elements.visibilityFilter.value !== "all") {
    pills.push({
      label: elements.visibilityFilter.value === "public" ? "Public catalog" : "Internal only",
      clear: () => (elements.visibilityFilter.value = "all")
    });
  }

  elements.activeFilterPills.replaceChildren();

  if (!pills.length) {
    const hint = document.createElement("p");
    hint.className = "help-text";
    hint.textContent = "Use search, tags, or filters to narrow the collection.";
    elements.activeFilterPills.appendChild(hint);
    return;
  }

  for (const pill of pills) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-pill";
    button.textContent = `${pill.label} ×`;
    button.addEventListener("click", () => {
      pill.clear();
      renderViews().catch((error) => setAuthMessage(error.message, true));
    });
    elements.activeFilterPills.appendChild(button);
  }
}

function populateDetailsList(container, entries) {
  container.replaceChildren();

  for (const [label, value] of entries) {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    wrapper.append(dt, dd);
    container.appendChild(wrapper);
  }
}

function getPhotoFolder(isPublic) {
  return isPublic ? "public" : "internal";
}

function photoPathMatchesVisibility(photoPath, isPublic) {
  if (!photoPath) {
    return true;
  }

  return photoPath.split("/")[0] === getPhotoFolder(isPublic);
}

async function resolvePhotoUrl(record) {
  if (record.photo_path && state.supabase) {
    const { data, error } = await state.supabase.storage.from(museumBucketName).createSignedUrl(record.photo_path, 3600);
    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
  }

  return record.photo_url || "";
}

function getFilteredRecords() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const type = elements.typeFilter.value;
  const status = elements.statusFilter.value;
  const theme = elements.themeFilter.value;
  const neighborhood = elements.neighborhoodFilter.value;
  const visibility = elements.visibilityFilter.value;

  return state.records.filter((record) => {
    const matchesType = type === "all" || record.record_type === type;
    const matchesStatus = status === "all" || record.status === status;
    const matchesTheme = theme === "all" || record.historical_theme === theme;
    const matchesNeighborhood = neighborhood === "all" || record.neighborhood === neighborhood;
    const matchesVisibility =
      visibility === "all" ||
      (visibility === "public" && record.is_public) ||
      (visibility === "private" && !record.is_public);

    const haystack = [
      record.accession_number,
      record.title,
      record.collection_name,
      record.location,
      record.historical_theme,
      record.neighborhood,
      record.time_period,
      record.people,
      record.donor,
      record.description,
      record.significance,
      record.notes,
      ...(record.tags || [])
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      matchesType &&
      matchesStatus &&
      matchesTheme &&
      matchesNeighborhood &&
      matchesVisibility &&
      (!query || haystack.includes(query))
    );
  });
}

function renderMetrics(records) {
  elements.totalRecordsMetric.textContent = String(records.length);
  elements.farishMetric.textContent = String(records.filter((record) => record.neighborhood === "Farish Street").length);
  elements.textileMetric.textContent = String(records.filter((record) => record.record_type === "Textile").length);
  elements.publicMetric.textContent = String(records.filter((record) => record.is_public).length);
  elements.reviewMetric.textContent = String(records.filter((record) => record.status === "Needs Review").length);
}

function buildRowActionButton(label, handler, tone = "ghost") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `button button--${tone}`;
  button.textContent = label;
  button.addEventListener("click", handler);
  return button;
}

function renderTableView() {
  const records = getFilteredRecords();
  const signedIn = Boolean(state.currentUser);
  elements.tableCountLabel.textContent = `${records.length} row${records.length === 1 ? "" : "s"}`;
  elements.recordTableBody.replaceChildren();
  renderActiveFilterPills();

  if (!records.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 9;
    cell.className = "records-table__empty";
    cell.textContent = "No records match this view.";
    row.appendChild(cell);
    elements.recordTableBody.appendChild(row);
    return;
  }

  for (const record of records) {
    const fragment = elements.tableRowTemplate.content.cloneNode(true);
    const thumbnailCell = fragment.querySelector('[data-column="thumbnail"]');
    const thumbFrame = document.createElement("div");
    thumbFrame.className = "records-table__thumb";
    thumbFrame.textContent = "No image";

    resolvePhotoUrl(record)
      .then((url) => {
        if (!url) {
          return;
        }

        const image = document.createElement("img");
        image.className = "records-table__thumb-image";
        image.src = url;
        image.alt = `${record.title} thumbnail`;
        thumbFrame.replaceChildren(image);
      })
      .catch(() => {
        thumbFrame.textContent = "No image";
      });

    thumbnailCell.appendChild(thumbFrame);
    fragment.querySelector('[data-column="accession"]').textContent = record.accession_number;
    fragment.querySelector('[data-column="title"]').textContent = record.title;
    fragment.querySelector('[data-column="type"]').textContent = record.record_type;
    fragment.querySelector('[data-column="status"]').textContent = record.status;
    fragment.querySelector('[data-column="theme"]').textContent = record.historical_theme || "—";
    fragment.querySelector('[data-column="neighborhood"]').textContent = record.neighborhood || "—";
    fragment.querySelector('[data-column="visibility"]').textContent = record.is_public ? "Public" : "Internal";

    const actions = fragment.querySelector('[data-column="actions"]');
    actions.appendChild(
      buildRowActionButton("Edit", () => {
        populateForm(record);
        setActiveView("editor");
      })
    );

    if (signedIn && canDeleteRecords()) {
      actions.appendChild(
        buildRowActionButton(
          "Delete",
          async () => {
            const confirmed = window.confirm(`Delete "${record.title}" from the museum database?`);
            if (!confirmed) {
              return;
            }
            try {
              await deleteRecord(record);
              await refresh();
              setAuthMessage("Record deleted.");
            } catch (error) {
              setAuthMessage(error.message, true);
            }
          },
          "danger"
        )
      );
    }

    elements.recordTableBody.appendChild(fragment);
  }
}

function getFormData() {
  const collectionEntityId = elements.collectionEntityId.value || null;
  const placeEntityId = elements.placeEntityId.value || null;
  const peopleEntityIds = getSelectedPeopleEntityIds();
  const linkedCollectionLabel = collectionEntityId ? getEntityLabelById("collection", collectionEntityId) : "";
  const linkedPlaceLabel = placeEntityId ? getEntityLabelById("place", placeEntityId) : "";
  const linkedPeopleLabels = peopleEntityIds
    .map((id) => getEntityLabelById("person", id))
    .filter(Boolean);

  return {
    id: elements.recordId.value || crypto.randomUUID(),
    accession_number: elements.accessionNumber.value.trim(),
    title: elements.title.value.trim(),
    record_type: elements.recordType.value,
    status: elements.recordStatus.value,
    collection_entity_id: collectionEntityId,
    collection_name: elements.collectionName.value.trim() || linkedCollectionLabel,
    location: elements.location.value.trim(),
    historical_theme: elements.historicalTheme.value,
    place_entity_id: placeEntityId,
    neighborhood: elements.neighborhood.value || linkedPlaceLabel,
    time_period: elements.timePeriod.value.trim(),
    people_entity_ids: peopleEntityIds,
    people: elements.people.value.trim() || linkedPeopleLabels.join(", "),
    donor: elements.donor.value.trim(),
    object_date: elements.objectDate.value.trim(),
    format_material: elements.formatMaterial.value.trim(),
    condition: elements.condition.value,
    rights_status: elements.rightsStatus.value,
    sensitivity: elements.sensitivity.value,
    photo_url: elements.photoUrl.value.trim(),
    photo_path: state.photoUploadPath,
    photo_credit: elements.photoCredit.value.trim(),
    description: elements.description.value.trim(),
    significance: elements.significance.value.trim(),
    provenance: elements.provenance.value.trim(),
    notes: elements.notes.value.trim(),
    is_public: elements.isPublic.checked,
    tags: normalizedTags(elements.tags.value)
  };
}

function populateForm(record) {
  state.selectedId = record.id;
  state.photoUploadPath = record.photo_path || "";
  elements.formHeading.textContent = `Editing ${record.title}`;
  elements.recordId.value = record.id || "";
  elements.accessionNumber.value = record.accession_number || "";
  elements.title.value = record.title || "";
  elements.recordType.value = record.record_type || "Artifact";
  elements.recordStatus.value = record.status || "In Storage";
  elements.collectionName.value = record.collection_name || "";
  elements.collectionEntityId.value = record.collection_entity_id || "";
  elements.location.value = record.location || "";
  elements.historicalTheme.value = record.historical_theme || "";
  elements.neighborhood.value = record.neighborhood || "";
  elements.placeEntityId.value = record.place_entity_id || "";
  elements.timePeriod.value = record.time_period || "";
  elements.people.value = record.people || "";
  elements.peopleEntityPicker.dataset.selectedIds = (record.people_entity_ids || []).join(",");
  renderEntityPicker();
  elements.donor.value = record.donor || "";
  elements.objectDate.value = record.object_date || "";
  elements.formatMaterial.value = record.format_material || "";
  elements.condition.value = record.condition || "";
  elements.rightsStatus.value = record.rights_status || "";
  elements.sensitivity.value = record.sensitivity || "";
  elements.isPublic.checked = Boolean(record.is_public);
  elements.photoUrl.value = record.photo_url || "";
  elements.photoCredit.value = record.photo_credit || "";
  elements.description.value = record.description || "";
  elements.significance.value = record.significance || "";
  elements.provenance.value = record.provenance || "";
  elements.notes.value = record.notes || "";
  elements.tags.value = (record.tags || []).join(", ");
  elements.photoFile.value = "";
  resolvePhotoUrl(record)
    .then((url) => {
      setPhotoPreview(url);
      setPhotoStatus(url ? "Photo ready." : "");
    })
    .catch(() => {
      setPhotoPreview(record.photo_url || "");
      setPhotoStatus(record.photo_url ? "Photo ready." : "");
    });
}

function resetForm() {
  state.selectedId = null;
  state.photoUploadPath = "";
  elements.formHeading.textContent = "Create A Museum Record";
  elements.form.reset();
  elements.recordId.value = "";
  elements.isPublic.checked = false;
  elements.peopleEntityPicker.dataset.selectedIds = "";
  elements.collectionEntityId.value = "";
  elements.placeEntityId.value = "";
  renderEntityPicker();
  setPhotoPreview("");
  setPhotoStatus("");
}

function buildPhotoPath(accessionNumber, fileName) {
  const safeAccession = accessionNumber.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const safeFileName = fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  return `records/${safeAccession}/${Date.now()}-${safeFileName}`;
}

async function uploadPhoto(file) {
  if (!isSupabaseReady) {
    throw new Error("Add Supabase configuration before uploading photos.");
  }
  if (!state.currentUser) {
    throw new Error("Sign in before uploading photos.");
  }

  const accessionNumber = elements.accessionNumber.value.trim();
  if (!accessionNumber) {
    throw new Error("Add an accession ID before uploading a photo.");
  }

  const path = `${getPhotoFolder(elements.isPublic.checked)}/${buildPhotoPath(accessionNumber, file.name)}`;
  const { error } = await state.supabase.storage.from(museumBucketName).upload(path, file, {
    cacheControl: "3600",
    upsert: true
  });

  if (error) {
    throw error;
  }

  const { data: signedData, error: signedError } = await state.supabase.storage
    .from(museumBucketName)
    .createSignedUrl(path, 3600);

  if (signedError) {
    throw signedError;
  }

  state.photoUploadPath = path;
  setPhotoPreview(signedData?.signedUrl || "");
  setPhotoStatus("Photo uploaded.");
}

async function removePhotoAsset() {
  if (!state.photoUploadPath || !isSupabaseReady) {
    return;
  }
  await state.supabase.storage.from(museumBucketName).remove([state.photoUploadPath]);
}

async function loadRecords() {
  if (!isSupabaseReady) {
    return [];
  }

  const { data, error } = await state.supabase
    .from("museum_records")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

async function saveRecord(record) {
  if (!isSupabaseReady) {
    throw new Error("Supabase is not configured yet.");
  }

  const payload = {
    ...record,
    updated_by: state.currentUser?.email || null
  };

  const { error } = await state.supabase.from("museum_records").upsert(payload);
  if (error) {
    if (
      error.message?.includes("collection_entity_id") ||
      error.message?.includes("place_entity_id") ||
      error.message?.includes("people_entity_ids")
    ) {
      throw new Error("Linked records need the latest Supabase schema. Re-run supabase/schema.sql once, then save again.");
    }
    throw error;
  }
}

async function deleteRecord(record) {
  const { error } = await state.supabase.from("museum_records").delete().eq("id", record.id);
  if (error) {
    throw error;
  }

  if (record.photo_path) {
    await state.supabase.storage.from(museumBucketName).remove([record.photo_path]);
  }
}

async function clearRecords() {
  const paths = state.records.map((record) => record.photo_path).filter(Boolean);
  const { error } = await state.supabase.from("museum_records").delete().neq("id", "");
  if (error) {
    throw error;
  }
  if (paths.length) {
    await state.supabase.storage.from(museumBucketName).remove(paths);
  }
}

async function seedSampleData() {
  if (!isSupabaseReady) {
    setAuthMessage("Add Supabase keys first, then seed the shared database.", true);
    return;
  }
  if (!state.currentUser) {
    setAuthMessage("Sign in before loading sample records.", true);
    return;
  }

  const payload = sampleRecords.map((record) => ({
    ...record,
    updated_by: state.currentUser.email
  }));

  const { error } = await state.supabase.from("museum_records").upsert(payload, { onConflict: "accession_number" });
  if (error) {
    setAuthMessage(error.message, true);
    return;
  }

  await refresh();
  setAuthMessage("Sample records loaded.");
}

async function importRecords(file) {
  const fileName = (file?.name || "").toLowerCase();
  const fileText = await file.text();

  let imported;

  if (fileName.endsWith(".json") || file.type === "application/json") {
    imported = JSON.parse(fileText);
    if (!Array.isArray(imported)) {
      throw new Error("Import JSON must be an array of records.");
    }
  } else if (fileName.endsWith(".csv") || file.type === "text/csv") {
    imported = parseCsvRecords(fileText);
    if (!Array.isArray(imported) || !imported.length) {
      throw new Error("CSV file did not contain any records.");
    }
  } else {
    throw new Error("Unsupported file type. Please upload a CSV or JSON file.");
  }

  const payload = imported.map((record) => normalizeImportedRecord(record));

  const { error } = await state.supabase.from("museum_records").upsert(payload, {
    onConflict: "accession_number"
  });

  if (error) {
    throw error;
  }
}

function normalizeImportedRecord(record) {
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
    photo_url: String(record.photo_url || "").trim(),
    photo_path: String(record.photo_path || "").trim(),
    photo_credit: String(record.photo_credit || "").trim(),
    description: String(record.description || "").trim(),
    significance: String(record.significance || "").trim(),
    provenance: String(record.provenance || "").trim(),
    notes: String(record.notes || "").trim(),
    is_public: parseBoolean(record.is_public),
    tags: normalizeImportedTags(record.tags),
    updated_by: state.currentUser?.email || record.updated_by || null
  };
}

function normalizeImportedEntityIds(value) {
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

function normalizeImportedTags(value) {
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

function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return ["true", "1", "yes", "y"].includes(normalized);
}

function parseCsvRecords(csvText) {
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

      return record;
    });
}

function parseCsv(text) {
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

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const stringValue = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function downloadCsv(filename, records) {
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
    "photo_credit",
    "description",
    "significance",
    "provenance",
    "notes",
    "tags"
  ];

  const lines = [
    columns.join(","),
    ...records.map((record) => columns.map((column) => escapeCsv(record[column])).join(","))
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function addPresetTag(tag) {
  const currentTags = normalizedTags(elements.tags.value);
  if (!currentTags.includes(tag)) {
    currentTags.push(tag);
    elements.tags.value = currentTags.join(", ");
  }
}

async function refresh() {
  state.records = await loadRecords();
  renderMetrics(state.records);
  await renderViews();
}

async function renderViews() {
  renderTableView();
}

async function initializeAuth() {
  setActiveView("table");

  if (!isSupabaseReady) {
    await loadSiteSettings();
    await loadRecordTypes();
    await loadEntityDirectories();
    await loadTaxonomies();
    elements.setupBanner.hidden = false;
    elements.setupDetails.textContent =
      "Add your Supabase project URL and anon key in supabase-config.js, then run the SQL in supabase/schema.sql.";
    setAuthMessage("Supabase keys are missing. Shared sign-in and shared records are not active yet.");
    updateAuthUI();
    applyInitialRoute();
    return;
  }

  elements.setupBanner.hidden = true;

  await loadSiteSettings();
  await loadRecordTypes();
  await loadEntityDirectories();
  await loadTaxonomies();

  const {
    data: { session }
  } = await state.supabase.auth.getSession();
  state.currentUser = session?.user || null;
  updateAuthUI();
  applyInitialRoute();

  state.supabase.auth.onAuthStateChange((_event, sessionData) => {
    state.currentUser = sessionData?.user || null;
    updateAuthUI();
    Promise.all([loadSiteSettings(), loadRecordTypes(), loadEntityDirectories(), loadTaxonomies(), refresh()]).catch((error) =>
      setAuthMessage(error.message, true)
    );
  });
}

elements.authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isSupabaseReady) {
    return;
  }

  const { error } = await state.supabase.auth.signInWithPassword({
    email: elements.emailInput.value,
    password: elements.passwordInput.value
  });

  if (error) {
    setAuthMessage(error.message, true);
    return;
  }

  setAuthMessage("Signed in.");
  elements.authForm.reset();
});

elements.signUpButton.addEventListener("click", async () => {
  if (!isSupabaseReady) {
    return;
  }

  const { error } = await state.supabase.auth.signUp({
    email: elements.emailInput.value,
    password: elements.passwordInput.value
  });

  if (error) {
    setAuthMessage(error.message, true);
    return;
  }

  setAuthMessage("Account created. Check your Supabase email confirmation settings if needed.");
});

elements.signOutButton.addEventListener("click", async () => {
  if (!isSupabaseReady) {
    return;
  }
  await state.supabase.auth.signOut();
  setAuthMessage("Signed out.");
});

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!canEditSharedData()) {
    setAuthMessage("Sign in before saving records.", true);
    return;
  }

  try {
    if (!photoPathMatchesVisibility(state.photoUploadPath, elements.isPublic.checked)) {
      throw new Error("Photo visibility changed after upload. Remove and upload the photo again.");
    }
    await saveRecord(getFormData());
    await refresh();
    resetForm();
    setAuthMessage("Record saved.");
  } catch (error) {
    setAuthMessage(error.message, true);
  }
});

elements.photoFile.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  try {
    setPhotoStatus("Uploading photo...");
    await uploadPhoto(file);
  } catch (error) {
    setPhotoStatus(error.message, true);
  }
});

elements.isPublic.addEventListener("change", () => {
  if (state.photoUploadPath && !photoPathMatchesVisibility(state.photoUploadPath, elements.isPublic.checked)) {
    setPhotoStatus("Visibility changed. Remove and upload the photo again so its access level matches the record.", true);
  } else if (state.photoUploadPath) {
    setPhotoStatus("Photo visibility matches this record.");
  }
});

elements.removePhotoButton.addEventListener("click", async () => {
  try {
    await removePhotoAsset();
    state.photoUploadPath = "";
    elements.photoUrl.value = "";
    elements.photoFile.value = "";
    setPhotoPreview("");
    setPhotoStatus("Photo removed.");
  } catch (error) {
    setPhotoStatus(error.message, true);
  }
});

elements.typeFilter.addEventListener("change", () => renderViews().catch((error) => setAuthMessage(error.message, true)));
elements.statusFilter.addEventListener("change", () => renderViews().catch((error) => setAuthMessage(error.message, true)));
elements.themeFilter.addEventListener("change", () => renderViews().catch((error) => setAuthMessage(error.message, true)));
elements.neighborhoodFilter.addEventListener("change", () => renderViews().catch((error) => setAuthMessage(error.message, true)));
elements.visibilityFilter.addEventListener("change", () => renderViews().catch((error) => setAuthMessage(error.message, true)));
elements.searchInput.addEventListener("input", () => renderViews().catch((error) => setAuthMessage(error.message, true)));
elements.exportButton.addEventListener("click", () => downloadJson("smith-robertson-records-backup.json", state.records));
elements.resetFormButton.addEventListener("click", () => {
  resetForm();
  setActiveView("editor");
});
elements.exportCsvButton.addEventListener("click", () =>
  downloadCsv("smith-robertson-records.csv", getFilteredRecords())
);
elements.browseTableTab.addEventListener("click", () => setActiveView("table"));
elements.editorTab.addEventListener("click", () => setActiveView("editor"));
elements.settingsTab.addEventListener("click", () => setActiveView("settings"));
elements.addRecordTypeButton.addEventListener("click", () => {
  state.recordTypes.push({
    slug: `custom-type-${Date.now()}`,
    label: "New Record Type",
    enabled: true,
    sort_order: state.recordTypes.length * 10 + 10
  });
  renderRecordTypeSettings();
});
elements.siteSettingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!state.currentUser) {
    setSettingsMessage("Sign in before saving settings.", true);
    return;
  }

  if (!state.isAdmin) {
    setSettingsMessage("A platform admin account is required to save settings.", true);
    return;
  }

  try {
    await saveSiteSettings();
    await saveRecordTypes();
    await saveEntityDirectories();
    await saveTaxonomies();
    await loadRecordTypes();
    await loadEntityDirectories();
    await loadTaxonomies();
    setSettingsMessage("Settings saved.");
  } catch (error) {
    setSettingsMessage(error.message, true);
  }
});

elements.importInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  try {
    if (!state.currentUser) {
      throw new Error("Sign in before importing records.");
    }
    await importRecords(file);
    await refresh();
    setAuthMessage("Records imported.");
  } catch (error) {
    setAuthMessage(error.message, true);
  } finally {
    elements.importInput.value = "";
  }
});

elements.clearDataButton.addEventListener("click", async () => {
  if (!canDeleteRecords()) {
    setAuthMessage("Only museum staff can delete all records.", true);
    return;
  }

  const confirmed = window.confirm("Delete all shared records in the current Supabase project?");
  if (!confirmed) {
    return;
  }

  try {
    await clearRecords();
    await refresh();
    setAuthMessage("All records deleted.");
  } catch (error) {
    setAuthMessage(error.message, true);
  }
});

elements.duplicateButton.addEventListener("click", async () => {
  if (!state.selectedId) {
    setAuthMessage("Select a record to duplicate first.", true);
    return;
  }

  const current = state.records.find((record) => record.id === state.selectedId);
  if (!current) {
    return;
  }

  const duplicate = {
    ...current,
    id: crypto.randomUUID(),
    accession_number: `${current.accession_number}-COPY`,
    title: `${current.title} Copy`,
    is_public: false
  };

  try {
    await saveRecord(duplicate);
    await refresh();
    setAuthMessage("Record duplicated.");
  } catch (error) {
    setAuthMessage(error.message, true);
  }
});

elements.presetTags.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tag]");
  if (!button) {
    return;
  }
  addPresetTag(button.dataset.tag);
});

elements.sectionJumpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    jumpToSection(button.dataset.sectionTarget);
  });
});

initializeAuth()
  .then(() => refresh())
  .catch((error) => setAuthMessage(error.message, true));
