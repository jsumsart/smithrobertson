import {
  applyPublicSiteTheme,
  defaultRecordTypes,
  defaultSiteSettings,
  defaultTaxonomyGroups,
  defaultTaxonomyTerms,
  sortRecordTypes,
  sortTaxonomyEntries
} from "./platform-config.js";
import { buildConfiguredSiteSettings, buildImageSrc, dataSourceConfig, fetchPublishedRecords } from "./csv-data.js?v=20260728a";

const pageMode = document.body.dataset.publicPage || "gallery";
const collectionView = document.body.dataset.collectionView || "";
const logoAssetPath = "./assets/smith-robertson-logo.png";
const PUBLIC_RIGHTS_STATUS = "Rights reserved, contact Smith Robertson";

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getMeaningfulValue(value) {
  const stringValue = String(value || "").trim();
  if (!stringValue) {
    return "";
  }

  if (normalizeText(stringValue) === "none") {
    return "";
  }

  return stringValue;
}

function normalizePublicRecord(record) {
  return {
    ...record,
    rights_status: PUBLIC_RIGHTS_STATUS
  };
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
      record.collection_name,
      record.location,
      record.description,
      record.significance,
      record.provenance,
      record.donor,
      record.rights_status,
      record.format_material,
      record.curator_notes,
      record.notes,
      ...(record.tags || [])
    ].join(" ")
  );
}

function getRecordUrl(record) {
  const accession = String(record?.accession_number || "").trim();
  if (!accession) {
    return "./archive.html";
  }
  return `./record.html?accession=${encodeURIComponent(accession)}`;
}

function setHeadMeta({ name, property, content }) {
  if (!content) {
    return;
  }

  const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
  let meta = document.head.querySelector(selector);
  if (!meta) {
    meta = document.createElement("meta");
    if (property) {
      meta.setAttribute("property", property);
    } else {
      meta.setAttribute("name", name);
    }
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function ensureHeadAssetLinks() {
  const linkDefinitions = [
    { rel: "icon", href: logoAssetPath, type: "image/png" },
    { rel: "apple-touch-icon", href: logoAssetPath }
  ];

  for (const definition of linkDefinitions) {
    let link = document.head.querySelector(`link[rel="${definition.rel}"]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = definition.rel;
      document.head.appendChild(link);
    }
    link.href = definition.href;
    if (definition.type) {
      link.type = definition.type;
    }
  }
}

function matchesKeyword(record, keywords) {
  const haystack = ` ${buildSearchHaystack(record)} `;
  return keywords.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) {
      return false;
    }
    return haystack.includes(` ${normalizedKeyword} `);
  });
}

function matchesAnyField(value, expectedValues) {
  const normalizedValue = normalizeText(value);
  return expectedValues.some((expectedValue) => normalizedValue.includes(normalizeText(expectedValue)));
}

function matchesTheme(record, values) {
  return matchesAnyField(record.historical_theme, values);
}

function matchesCollection(record, values) {
  return matchesAnyField(record.collection_name, values);
}

function matchesNeighborhood(record, values) {
  return matchesAnyField(record.neighborhood, values);
}

function matchesPeople(record, values) {
  return matchesAnyField(record.people, values);
}

const collectionViews = {
  "scott-ford": {
    navLabel: "Midwifery and Motherhood",
    pathLabel: "Interpretive Exhibit",
    pathMeta: "Connects Scott Ford family life, childbirth records, midwifery, and motherhood through a broader history of care, kinship, and neighborhood memory.",
    relationshipLabel: "Related care history",
    deck: "Home life, childbirth records, midwife history, and motherhood tied to the Scott Ford Houses.",
    title: "Midwifery and Motherhood",
    intro:
      "This exhibit follows childbirth records, family photographs, domestic space, and neighborhood memory to interpret Black maternal care and midwifery through the Scott Ford Houses and related records.",
    status: "Showing the Scott Ford Houses, Midwifery and Motherhood public view.",
    leadAccession: "SRM-2026-200",
    highlightAccessions: ["SRM-2026-199", "SRM-2026-201", "SRM-2026-132", "SRM-2026-239"],
    curatedAccessions: [
      "SRM-2026-200",
      "SRM-2026-199",
      "SRM-2026-201",
      "SRM-2026-132",
      "SRM-2026-239"
    ],
    matches(record) {
      return (
        matchesTheme(record, ["Midwives and Motherhood"]) ||
        matchesNeighborhood(record, ["Scott Ford Houses"]) ||
        matchesPeople(record, ["Mary Scott", "Virginia Scott"]) ||
        matchesKeyword(record, [
          "Scott Ford Houses",
          "Mary Scott",
          "Virginia Scott",
          "midwife",
          "motherhood",
          "maternal",
          "birth certificate",
          "obstetrical",
          "T. J. Handy"
        ])
      );
    }
  },
  "smith-robertson-history": {
    navLabel: "Education and Public Memory",
    pathLabel: "Interpretive Exhibit",
    pathMeta: "Centers Black education, school leadership, student life, and the ways educational memory has been carried through photographs, ceremonies, and commemoration.",
    relationshipLabel: "Education exhibit",
    deck: "Black education, school leadership, and public memory across the Smith Robertson story and related records.",
    title: "Education and Public Memory",
    intro:
      "This exhibit interprets Black education through teachers, students, school leadership, graduation rituals, campus life, and the later public memory of Smith Robertson and related educational records.",
    status: "Showing the Education and Public Memory public view.",
    leadAccession: "SRM-2026-030",
    highlightAccessions: ["SRM-2026-370", "SRM-2026-081", "SRM-2026-077", "SRM-P-1955-012"],
    curatedAccessions: [
      "SRM-2026-030",
      "SRM-2026-370",
      "SRM-2026-081",
      "SRM-2026-077",
      "SRM-P-1955-012"
    ],
    matches(record) {
      if (
        matchesKeyword(record, [
          "Maroon and White",
          "Piney Woods",
          "Jerry and Sue Whitt",
          "A Neighborhood Discovery",
          "Farish Street Historic District",
          "Black and Tan Republican Party",
          "Field to Factory",
          "Smith Robertson Museum",
          "architectural rendering"
        ])
      ) {
        return false;
      }

      const isEducationRecord =
        matchesTheme(record, ["African American Education"]) ||
        matchesKeyword(record, [
          "school",
          "education",
          "teacher",
          "student",
          "principal",
          "classroom",
          "graduation",
          "commencement",
          "yearbook",
          "campus",
          "alumni",
          "May Day"
        ]);

      return (
        isEducationRecord ||
        matchesNeighborhood(record, ["Smith Robertson Campus"]) ||
        matchesPeople(record, ["A. N. Jackson", "James Gooden", "Luther Marshall", "Charles S. Wilson", "Lv Randolph"]) ||
        matchesKeyword(record, [
          "Smith Robertson",
          "Smith Robertson Campus",
          "Smith Robertson School",
          "Robertson School",
          "Smith Robinson School",
          "principal",
          "A.N. Jackson",
          "A. N. Jackson",
          "James Gooden",
          "Luther Marshall",
          "Charles S. Wilson",
          "Lv Randolph"
        ])
      );
    }
  },
  "civil-rights": {
    navLabel: "Law, Justice, and Civil Rights",
    pathLabel: "Interpretive Exhibit",
    pathMeta: "Brings together protest, citizenship, legal struggle, public speech, and community memory across Mississippi civil-rights history.",
    relationshipLabel: "Broad legal and civil-rights exhibit",
    deck: "Organizing, protest, legal struggle, and public memory linked to civil rights history.",
    title: "Law, Justice, and Civil Rights",
    intro:
      "This exhibit gathers public records related to civil-rights organizing, legal advocacy, public memory, and the long struggle over citizenship and justice in Mississippi.",
    status: "Showing the Law, Justice, and Civil Rights public view.",
    leadAccession: "SRM-2026-128",
    highlightAccessions: ["SRM-2026-050", "SRM-2026-051", "SRM-2026-219", "SRM-2026-293"],
    relatedSpotlight: {
      href: "./r-jess-brown-collection.html",
      eyebrow: "Collection spotlight",
      title: "R. Jess Brown Collection",
      description:
        "Explore the legal papers, photographs, tributes, and professional records that deepen this broader story of law, justice, and civil-rights work."
    },
    curatedAccessions: [
      "SRM-2026-128",
      "SRM-2026-293",
      "SRM-2026-050",
      "SRM-2026-051",
      "SRM-2026-219"
    ],
    matches(record) {
      if (matchesTheme(record, ["Civil Rights", "Civil Rights and Citizenship"]) || matchesCollection(record, ["Civil Rights Collection"])) {
        return true;
      }
      return matchesKeyword(record, [
        "civil rights",
        "Jackson Movement",
        "Montgomery Bus Boycott",
        "Medgar Evers",
        "Fannie Lou Hamer",
        "SNCC",
        "SCLC",
        "Poor People's Campaign",
        "freedom movement",
        "National Lawyers Guild",
        "legal assistance",
        "constitution of 1890",
        "NAACP",
        "Claiborne Hardware",
        "human rights"
      ]);
    }
  },
  "r-jess-brown": {
    navLabel: "R. Jess Brown Collection",
    pathLabel: "Collection Spotlight",
    pathMeta: "Focuses on one legal archive while connecting it to the broader history of law, justice, and civil-rights advocacy in Mississippi.",
    relationshipLabel: "Featured within the legal history of the site",
    deck: "Law, advocacy, and civil-rights leadership across the life and legacy of R. Jess Brown.",
    title: "R. Jess Brown Collection",
    intro:
      "This collection spotlight gathers legal papers, photographs, honors, and tributes that document the life and work of attorney R. Jess Brown while connecting his archive to a wider civil-rights legal history.",
    status: "Showing the R. Jess Brown collection public view.",
    leadAccession: "SRM-2026-293",
    highlightAccessions: ["SRM-2026-279", "SRM-2026-260", "SRM-2026-263", "SRM-2026-276"],
    relatedSpotlight: {
      href: "./civil-rights.html",
      eyebrow: "Related exhibit",
      title: "Law, Justice, and Civil Rights",
      description:
        "Return to the broader interpretive exhibit to see how Brown’s archive connects to organizing, legal advocacy, and civil-rights public memory."
    },
    curatedAccessions: [
      "SRM-2026-293",
      "SRM-2026-279",
      "SRM-2026-260",
      "SRM-2026-263",
      "SRM-2026-276"
    ],
    matches(record) {
      return (
        matchesCollection(record, ["R. Jess Brown Collection"]) ||
        matchesPeople(record, ["R. Jess Brown", "Richard Jess Brown"]) ||
        matchesKeyword(record, [
          "R. Jess Brown",
          "Richard Jess Brown",
          "Magnolia Bar Association",
          "Brown Alexander Sanders",
          "law office of R. Jess Brown",
          "Attorney R. Jess Brown"
        ])
      );
    }
  },
  "farish-street-history": {
    navLabel: "Farish Street History",
    pathLabel: "Interpretive Exhibit",
    pathMeta: "Ties business, faith, performance, and community life to one historic corridor in Jackson.",
    relationshipLabel: "Neighborhood exhibit",
    deck: "Business, neighborhood culture, and community life connected to Farish Street.",
    title: "Farish Street History",
    intro:
      "This exhibit interprets Farish Street as a corridor of commerce, performance, worship, and neighborhood memory through public records tied to its institutions and built environment.",
    status: "Showing the Neighborhood, Commerce, and Culture public view.",
    leadAccession: "SRM-2026-163",
    highlightAccessions: ["SRM-2026-116", "SRM-2026-028", "SRM-2026-208", "SRM-2026-220"],
    curatedAccessions: [
      "SRM-2026-163",
      "SRM-2026-116",
      "SRM-2026-028",
      "SRM-2026-208",
      "SRM-2026-220"
    ],
    matches(record) {
      return (
        matchesNeighborhood(record, ["Farish Street"]) ||
        matchesCollection(record, ["Farish Street Business District"]) ||
        matchesKeyword(record, [
          "Farish Street",
          "Alamo Theatre",
          "Mount Helm",
          "Farish Street Historic District"
        ])
      );
    }
  },
  "black-health-and-medicine": {
    navLabel: "Health, Family, and Community Care",
    pathLabel: "Interpretive Exhibit",
    pathMeta: "Connects doctors, midwives, motherhood, caregiving, household health, and medical access across Black life in Mississippi.",
    relationshipLabel: "Broad care and medicine exhibit",
    deck: "Doctors, midwives, motherhood, caregiving, and public health records across Mississippi Black life.",
    title: "Health, Family, and Community Care",
    intro:
      "This exhibit gathers records related to physicians, midwives, maternal care, public health, and everyday caregiving across Black community life in Mississippi.",
    status: "Showing the Health, Family, and Community Care public view.",
    leadAccession: "SRM-2026-315",
    highlightAccessions: ["SRM-2026-314", "SRM-2026-316", "SRM-2026-329", "SRM-2026-158"],
    relatedSpotlight: {
      href: "./scott-ford-houses.html",
      eyebrow: "Related collection",
      title: "Scott Ford Houses Collection",
      description:
        "Explore childbirth records, family photographs, and midwife history tied specifically to the Scott Ford Houses."
    },
    curatedAccessions: [
      "SRM-2026-315",
      "SRM-2026-314",
      "SRM-2026-316",
      "SRM-2026-329",
      "SRM-2026-158"
    ],
    matches(record) {
      return (
        matchesTheme(record, ["Black Health and Medicine", "Midwives and Motherhood"]) ||
        matchesKeyword(record, [
          "doctor",
          "physician",
          "medical",
          "dentistry",
          "hygiene",
          "midwife",
          "birth certificate",
          "obstetrical",
          "Board of Health",
          "health worker",
          "Leroy Weathersby",
          "S. A. Miller",
          "L. F. Miller",
          "Robert Smith, M.D.",
          "T. L. Zuber",
          "Dr. Carmichael",
          "Richard H. Beadle Collection of Black Doctors in Mississippi"
        ])
      );
    }
  },
  "arts-and-culture": {
    navLabel: "Arts, Culture, and Public Expression",
    pathLabel: "Interpretive Exhibit",
    pathMeta: "Traces visual culture, performance, pageantry, material culture, and creative public life across the collection.",
    relationshipLabel: "Arts and culture exhibit",
    deck: "Art, performance, pageantry, and material culture across the collection.",
    title: "Arts, Culture, and Public Expression",
    intro:
      "This exhibit gathers visual art, performance materials, pageantry, and cultural objects that carry Black creative expression into the public gallery.",
    status: "Showing the Arts, Culture, and Public Expression public view.",
    leadAccession: "SRM-2026-093",
    highlightAccessions: ["SRM-2026-082", "SRM-2026-097", "SRM-2026-098", "SRM-2026-117"],
    curatedAccessions: [
      "SRM-2026-093",
      "SRM-2026-082",
      "SRM-2026-097",
      "SRM-2026-098",
      "SRM-2026-117"
    ],
    matches(record) {
      if (
        matchesTheme(record, ["African American Education"]) ||
        matchesKeyword(record, [
          "principal",
          "teacher",
          "student",
          "graduation",
          "commencement",
          "school portrait",
          "school photograph",
          "class portrait",
          "yearbook"
        ])
      ) {
        return false;
      }

      return (
        matchesTheme(record, ["Arts And Culture"]) ||
        matchesCollection(record, ["Art Collection"]) ||
        matchesKeyword(record, [
          "art",
          "artist",
          "pageant",
          "pageantry",
          "theatre",
          "theater",
          "painting",
          "print",
          "quilt",
          "sculpture",
          "mask",
          "Kuba",
          "gourd vessel",
          "performance",
          "music",
          "musician",
          "dance",
          "costume",
          "poster",
          "program"
        ])
      );
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
  archiveSearchDebounceId: null,
  archiveListenersAttached: false
};

const elements = {
  brand: document.querySelector("#catalogBrand"),
  authAction: document.querySelector("#catalogAuthAction"),
  heroEyebrow: document.querySelector("#catalogEyebrow"),
  pathMeta: document.querySelector("#catalogPathMeta"),
  heroMetric: document.querySelector(".archive-metric"),
  galleryTitle: document.querySelector("#catalogGalleryTitle"),
  galleryIntro: document.querySelector("#catalogGalleryIntro"),
  archiveTitle: document.querySelector("#catalogTitle"),
  archiveIntro: document.querySelector("#catalogIntro"),
  status: document.querySelector("#catalogStatus"),
  total: document.querySelector("#catalogTotal"),
  search: document.querySelector("#catalogSearch"),
  theme: document.querySelector("#catalogTheme"),
  collection: document.querySelector("#catalogCollection"),
  geography: document.querySelector("#catalogGeography"),
  people: document.querySelector("#catalogPeople"),
  organizations: document.querySelector("#catalogOrganizations"),
  era: document.querySelector("#catalogEra"),
  type: document.querySelector("#catalogType"),
  sort: document.querySelector("#catalogSort"),
  activeFilters: document.querySelector("#archiveActiveFilters"),
  clearFilters: document.querySelector("#archiveClearFilters"),
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
  slideshowTemplate: document.querySelector("#slideshowTemplate"),
  detailShell: document.querySelector("#recordDetail"),
  detailTemplate: document.querySelector("#recordDetailTemplate")
};

function setStatus(message, isError = false) {
  if (!elements.status) {
    return;
  }
  elements.status.textContent = message;
  elements.status.classList.toggle("help-text--error", isError);
}

function formatDateLabel(record) {
  return record.time_period || record.object_date || "Date unknown";
}

function buildMuseumPageTitle(value) {
  return `${value} | Smith Robertson Museum + Cultural Center`;
}

function buildCollectionBadgeText(record) {
  return getMeaningfulValue(record.collection_name) || "Public collection record";
}

function recordHasImage(record) {
  return Boolean(getMeaningfulValue(record.image_file) || getMeaningfulValue(record.image_thumb_file));
}

function compareImagePriority(left, right) {
  const leftHasImage = recordHasImage(left);
  const rightHasImage = recordHasImage(right);
  if (leftHasImage === rightHasImage) {
    return 0;
  }
  return leftHasImage ? -1 : 1;
}

function buildRecordContextText(record) {
  const statements = [
    getMeaningfulValue(record.collection_name)
      ? `Part of the ${getMeaningfulValue(record.collection_name)} collection.`
      : "",
    getMeaningfulValue(record.historical_theme) ? `Filed under ${getMeaningfulValue(record.historical_theme)}.` : "",
    getMeaningfulValue(record.neighborhood) ? `Associated with ${getMeaningfulValue(record.neighborhood)}.` : "",
    getMeaningfulValue(record.people) ? `Connected people: ${getMeaningfulValue(record.people)}.` : "",
    getMeaningfulValue(record.organizations)
      ? `Connected organizations: ${getMeaningfulValue(record.organizations)}.`
      : ""
  ].filter(Boolean);

  return statements.join(" ") || "This public record is part of the museum's digital collections and remains available for ongoing research and interpretation.";
}

function buildBrandMarkup() {
  return `
    <span class="catalog-brand-lockup">
      <img class="catalog-brand-lockup__logo" src="${logoAssetPath}" alt="Smith Robertson Museum and Cultural Center logo" />
      <span class="catalog-brand-lockup__text">
        <span class="catalog-brand-lockup__museum">Smith Robertson Museum + Cultural Center</span>
        <span class="catalog-brand-lockup__program">Digital Collections</span>
      </span>
    </span>
  `;
}

function ensureArchiveToolbarFields() {
  const toolbar = document.querySelector(".archive-toolbar");
  if (!toolbar) {
    return;
  }

  const fieldDefinitions = [
    { id: "catalogPeople", label: "People" },
    { id: "catalogOrganizations", label: "Organization" },
    { id: "catalogEra", label: "Date / Era" }
  ];

  for (const definition of fieldDefinitions) {
    if (document.getElementById(definition.id)) {
      continue;
    }

    const label = document.createElement("label");
    label.className = "field";

    const span = document.createElement("span");
    span.textContent = definition.label;

    const select = document.createElement("select");
    select.id = definition.id;

    label.append(span, select);
    toolbar.appendChild(label);
  }

  elements.people = document.querySelector("#catalogPeople");
  elements.organizations = document.querySelector("#catalogOrganizations");
  elements.era = document.querySelector("#catalogEra");
}

function attachArchiveInteractionHandlers() {
  if (state.archiveListenersAttached) {
    return;
  }

  elements.search?.addEventListener("input", () => {
    debounceArchiveRefresh();
  });
  elements.theme?.addEventListener("change", () => {
    refreshArchivePage({ resetPage: true }).catch((error) => setStatus(error.message, true));
  });
  elements.collection?.addEventListener("change", () => {
    refreshArchivePage({ resetPage: true }).catch((error) => setStatus(error.message, true));
  });
  elements.geography?.addEventListener("change", () => {
    refreshArchivePage({ resetPage: true }).catch((error) => setStatus(error.message, true));
  });
  elements.people?.addEventListener("change", () => {
    refreshArchivePage({ resetPage: true }).catch((error) => setStatus(error.message, true));
  });
  elements.organizations?.addEventListener("change", () => {
    refreshArchivePage({ resetPage: true }).catch((error) => setStatus(error.message, true));
  });
  elements.era?.addEventListener("change", () => {
    refreshArchivePage({ resetPage: true }).catch((error) => setStatus(error.message, true));
  });
  elements.type?.addEventListener("change", () => {
    refreshArchivePage({ resetPage: true }).catch((error) => setStatus(error.message, true));
  });
  elements.sort?.addEventListener("change", () => {
    refreshArchivePage({ resetPage: true }).catch((error) => setStatus(error.message, true));
  });
  elements.clearFilters?.addEventListener("click", () => {
    if (elements.search) {
      elements.search.value = "";
    }
    if (elements.theme) {
      elements.theme.value = "all";
    }
    if (elements.collection) {
      elements.collection.value = "all";
    }
    if (elements.geography) {
      elements.geography.value = "all";
    }
    if (elements.people) {
      elements.people.value = "all";
    }
    if (elements.organizations) {
      elements.organizations.value = "all";
    }
    if (elements.era) {
      elements.era.value = "all";
    }
    if (elements.type) {
      elements.type.value = "all";
    }
    if (elements.sort) {
      elements.sort.value = "recent";
    }
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

  state.archiveListenersAttached = true;
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
    collection: elements.collection?.value || "all",
    geography: elements.geography?.value || "all",
    people: elements.people?.value || "all",
    organizations: elements.organizations?.value || "all",
    era: elements.era?.value || "all",
    type: elements.type?.value || "all",
    sort: elements.sort?.value || "recent"
  };
}

function getRecordDisplayContext(record) {
  const values = [
    record.record_type,
    formatDateLabel(record),
    getMeaningfulValue(record.neighborhood),
    getMeaningfulValue(record.people),
    getMeaningfulValue(record.organizations)
  ].filter(Boolean);

  return values.join(" • ");
}

function getActiveCollectionView() {
  return collectionViews[collectionView];
}

function getScopedArchiveSourceRecords() {
  const records = state.allRecords || [];
  const activeCollectionView = getActiveCollectionView();
  if (pageMode === "collection" && activeCollectionView) {
    return records.filter((record) => activeCollectionView.matches(record));
  }
  return records;
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

  if (term.group_slug === "historical-theme" && term.slug === "civil-rights") {
    return {
      ...term,
      label: "Civil Rights and Citizenship"
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
  const activeCollectionView = getActiveCollectionView();
  const collectionHeading = activeCollectionView?.navLabel || activeCollectionView?.title || "";
  if (elements.brand) {
    elements.brand.innerHTML = buildBrandMarkup();
    elements.brand.setAttribute("aria-label", "Smith Robertson Museum + Cultural Center digital collections");
  }
  if (elements.heroEyebrow) {
    if (pageMode === "collection" && activeCollectionView?.pathLabel) {
      elements.heroEyebrow.textContent = activeCollectionView.pathLabel;
    } else if (pageMode === "record") {
      elements.heroEyebrow.textContent = "Collection record";
    } else if (pageMode === "archive") {
      elements.heroEyebrow.textContent = "Public Archive";
    } else {
      elements.heroEyebrow.textContent = "Digital Gallery";
    }
  }
  if (elements.galleryTitle) {
    elements.galleryTitle.textContent = state.siteSettings.public_gallery_title;
  }
  if (elements.galleryIntro) {
    elements.galleryIntro.textContent = state.siteSettings.public_gallery_intro;
  }
  if (elements.archiveTitle) {
    elements.archiveTitle.textContent = pageMode === "collection" ? collectionHeading : activeCollectionView?.title || state.siteSettings.public_catalog_title;
  }
  if (elements.archiveIntro) {
    elements.archiveIntro.textContent = activeCollectionView?.intro || state.siteSettings.public_catalog_intro;
  }
  if (elements.heroMetric) {
    elements.heroMetric.classList.remove("archive-hero__aside");
    const spotlight = elements.heroMetric.querySelector(".relationship-card");
    spotlight?.remove();
  }
  if (elements.pathMeta) {
    if (pageMode === "collection" && activeCollectionView) {
      const relationship = activeCollectionView.relationshipLabel ? `${activeCollectionView.relationshipLabel}. ` : "";
      const detail = activeCollectionView.pathMeta || "";
      elements.pathMeta.textContent = `${relationship}${detail}`.trim();
    } else {
      elements.pathMeta.textContent = "";
    }
    elements.pathMeta.hidden = !elements.pathMeta.textContent;
  }
  const pageTitle =
    pageMode === "gallery"
      ? "Digital Gallery"
      : pageMode === "collection" && activeCollectionView
        ? collectionHeading
        : pageMode === "record"
          ? "Collection Record"
          : "Public Archive";
  document.title = buildMuseumPageTitle(pageTitle);
  applyPublicSiteTheme(state.siteSettings);
  ensureHeadAssetLinks();
  setHeadMeta({
    name: "description",
    content:
      pageMode === "gallery"
        ? state.siteSettings.public_gallery_intro
        : pageMode === "collection" && activeCollectionView
          ? activeCollectionView.intro
          : state.siteSettings.public_catalog_intro
  });
  setHeadMeta({ property: "og:site_name", content: "Smith Robertson Museum + Cultural Center" });
  setHeadMeta({ property: "og:type", content: "website" });
  setHeadMeta({ property: "og:title", content: document.title });
  setHeadMeta({
    property: "og:description",
    content:
      pageMode === "gallery"
        ? state.siteSettings.public_gallery_intro
        : pageMode === "collection" && activeCollectionView
          ? activeCollectionView.intro
          : state.siteSettings.public_catalog_intro
  });
  setHeadMeta({ property: "og:image", content: logoAssetPath });
  setHeadMeta({ name: "twitter:card", content: "summary_large_image" });
  setHeadMeta({ name: "twitter:title", content: document.title });
  setHeadMeta({
    name: "twitter:description",
    content:
      pageMode === "gallery"
        ? state.siteSettings.public_gallery_intro
        : pageMode === "collection" && activeCollectionView
          ? activeCollectionView.intro
          : state.siteSettings.public_catalog_intro
  });
  setHeadMeta({ name: "twitter:image", content: logoAssetPath });
}

function getEnabledTaxonomyTerms(groupSlug) {
  return sortTaxonomyEntries(state.taxonomyTerms).filter((term) => term.group_slug === groupSlug && term.enabled);
}

function buildSelectOptionsFromRecords(records, fieldName) {
  const values = new Set();
  for (const record of records) {
    const value = getMeaningfulValue(record[fieldName]);
    if (value) {
      values.add(value);
    }
  }
  return [...values].sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
}

function renderRecordTypeFilter() {
  if (!elements.type) {
    return;
  }

  const availableTypes = new Set(buildSelectOptionsFromRecords(getScopedArchiveSourceRecords(), "record_type"));
  const currentValue = elements.type.value;
  elements.type.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All types";
  elements.type.appendChild(allOption);

  for (const type of sortRecordTypes(state.recordTypes).filter((item) => item.enabled && availableTypes.has(item.label))) {
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

  const availableThemes = new Set(buildSelectOptionsFromRecords(getScopedArchiveSourceRecords(), "historical_theme"));
  const currentValue = elements.theme.value;
  elements.theme.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All themes";
  elements.theme.appendChild(allOption);

  for (const term of getEnabledTaxonomyTerms("historical-theme").filter((item) => availableThemes.has(item.label))) {
    const option = document.createElement("option");
    option.value = term.label;
    option.textContent = term.label;
    elements.theme.appendChild(option);
  }

  elements.theme.value = [...elements.theme.options].some((option) => option.value === currentValue) ? currentValue : "all";
}

function renderCollectionFilter() {
  if (!elements.collection) {
    return;
  }

  const currentValue = elements.collection.value;
  elements.collection.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All collections";
  elements.collection.appendChild(allOption);

  for (const value of buildSelectOptionsFromRecords(getScopedArchiveSourceRecords(), "collection_name")) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    elements.collection.appendChild(option);
  }

  elements.collection.value = [...elements.collection.options].some((option) => option.value === currentValue) ? currentValue : "all";
}

function renderPeopleFilter() {
  if (!elements.people) {
    return;
  }

  const currentValue = elements.people.value;
  elements.people.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All people";
  elements.people.appendChild(allOption);

  for (const value of buildSelectOptionsFromRecords(getScopedArchiveSourceRecords(), "people")) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    elements.people.appendChild(option);
  }

  elements.people.value = [...elements.people.options].some((option) => option.value === currentValue) ? currentValue : "all";
}

function renderOrganizationsFilter() {
  if (!elements.organizations) {
    return;
  }

  const currentValue = elements.organizations.value;
  elements.organizations.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All organizations";
  elements.organizations.appendChild(allOption);

  for (const value of buildSelectOptionsFromRecords(getScopedArchiveSourceRecords(), "organizations")) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    elements.organizations.appendChild(option);
  }

  elements.organizations.value = [...elements.organizations.options].some((option) => option.value === currentValue) ? currentValue : "all";
}

function renderEraFilter() {
  if (!elements.era) {
    return;
  }

  const options = new Set();
  for (const record of getScopedArchiveSourceRecords()) {
    const label = formatDateLabel(record);
    if (label && label !== "Date unknown") {
      options.add(label);
    }
  }

  const currentValue = elements.era.value;
  elements.era.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All dates / eras";
  elements.era.appendChild(allOption);

  for (const value of [...options].sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }))) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    elements.era.appendChild(option);
  }

  elements.era.value = [...elements.era.options].some((option) => option.value === currentValue) ? currentValue : "all";
}

function renderGeographyFilter() {
  if (!elements.geography) {
    return;
  }

  const currentValue = elements.geography.value;
  elements.geography.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All geographies";
  elements.geography.appendChild(allOption);

  for (const value of buildSelectOptionsFromRecords(getScopedArchiveSourceRecords(), "neighborhood")) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    elements.geography.appendChild(option);
  }

  elements.geography.value = [...elements.geography.options].some((option) => option.value === currentValue) ? currentValue : "all";
}

function renderSortFilter() {
  if (!elements.sort) {
    return;
  }

  const currentValue = elements.sort.value || "recent";
  const options = [
    ["recent", "Recently added"],
    ["accession", "Accession number"],
    ["title", "Title A-Z"],
    ["date-asc", "Object date, oldest to newest"],
    ["date-desc", "Object date, newest to oldest"]
  ];

  elements.sort.replaceChildren();
  for (const [value, label] of options) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    elements.sort.appendChild(option);
  }

  elements.sort.value = [...elements.sort.options].some((option) => option.value === currentValue) ? currentValue : "recent";
}

function compareAccessions(left, right) {
  return String(left.accession_number || "").localeCompare(String(right.accession_number || ""), undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

function getRecordDateSortValue(record) {
  const candidate = String(record.object_date || record.time_period || "").trim();
  if (!candidate || candidate.toLowerCase() === "undated") {
    return null;
  }

  const parsed = Date.parse(candidate);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const yearMatch = candidate.match(/\b(1[6-9]\d{2}|20\d{2})\b/);
  if (yearMatch) {
    return Date.UTC(Number(yearMatch[1]), 0, 1);
  }

  return null;
}

function sortArchiveRecords(records, sortValue) {
  const sorted = [...records];
  const sortWithImagePriority = (comparator) =>
    sorted.sort((left, right) => compareImagePriority(left, right) || comparator(left, right));

  switch (sortValue) {
    case "title":
      return sortWithImagePriority((left, right) =>
        String(left.title || "").localeCompare(String(right.title || ""), undefined, {
          sensitivity: "base"
        })
      );
    case "date-asc":
      return sortWithImagePriority((left, right) => {
        const leftValue = getRecordDateSortValue(left);
        const rightValue = getRecordDateSortValue(right);
        if (leftValue == null && rightValue == null) {
          return compareAccessions(left, right);
        }
        if (leftValue == null) {
          return 1;
        }
        if (rightValue == null) {
          return -1;
        }
        return leftValue - rightValue || compareAccessions(left, right);
      });
    case "date-desc":
      return sortWithImagePriority((left, right) => {
        const leftValue = getRecordDateSortValue(left);
        const rightValue = getRecordDateSortValue(right);
        if (leftValue == null && rightValue == null) {
          return compareAccessions(right, left);
        }
        if (leftValue == null) {
          return 1;
        }
        if (rightValue == null) {
          return -1;
        }
        return rightValue - leftValue || compareAccessions(right, left);
      });
    case "accession":
      return sortWithImagePriority(compareAccessions);
    case "recent":
    default:
      return sortWithImagePriority((left, right) => compareAccessions(right, left));
  }
}

function renderActiveFilterSummary() {
  if (!elements.activeFilters) {
    return;
  }

  const filters = getArchiveFilterState();
  const activeValues = [];
  if (filters.query) {
    activeValues.push(`Search: ${filters.query}`);
  }
  if (filters.theme !== "all") {
    activeValues.push(`Theme: ${filters.theme}`);
  }
  if (filters.collection !== "all") {
    activeValues.push(`Collection: ${filters.collection}`);
  }
  if (filters.geography !== "all") {
    activeValues.push(`Geography: ${filters.geography}`);
  }
  if (filters.people !== "all") {
    activeValues.push(`People: ${filters.people}`);
  }
  if (filters.organizations !== "all") {
    activeValues.push(`Organization: ${filters.organizations}`);
  }
  if (filters.era !== "all") {
    activeValues.push(`Date / Era: ${filters.era}`);
  }
  if (filters.type !== "all") {
    activeValues.push(`Type: ${filters.type}`);
  }
  if (filters.sort !== "recent") {
    const selectedOption = elements.sort?.selectedOptions?.[0]?.textContent;
    activeValues.push(`Sort: ${selectedOption || filters.sort}`);
  }

  elements.activeFilters.replaceChildren();
  for (const value of activeValues) {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = value;
    elements.activeFilters.appendChild(pill);
  }

  if (elements.clearFilters) {
    elements.clearFilters.disabled = !activeValues.length;
  }
}

function getFilteredRecords() {
  return state.records;
}

function getCollectionRecords() {
  const records = state.filteredRecords.length ? state.filteredRecords : state.records;
  const activeCollectionView = collectionViews[collectionView];
  const curatedAccessions = [
    activeCollectionView?.leadAccession,
    ...(activeCollectionView?.highlightAccessions || []),
    ...(activeCollectionView?.curatedAccessions || [])
  ].filter(Boolean);

  if (!curatedAccessions.length) {
    return records;
  }

  const curated = curatedAccessions
    .map((accession) => records.find((record) => record.accession_number === accession))
    .filter(Boolean);

  if (!curated.length) {
    return records;
  }

  const curatedKeys = new Set(curated.map((record) => String(record.accession_number || "").trim().toLowerCase()));
  const remainder = records.filter((record) => !curatedKeys.has(String(record.accession_number || "").trim().toLowerCase()));
  return [...curated, ...remainder];
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

function getCuratedExhibitLeadRecord(records, activeCollectionView) {
  const accession = activeCollectionView?.leadAccession;
  if (accession) {
    const matched = records.find((record) => record.accession_number === accession);
    if (matched) {
      return matched;
    }
  }
  return records[0] || null;
}

function getCuratedExhibitHighlights(records, activeCollectionView, leadRecord) {
  const highlightAccessions = activeCollectionView?.highlightAccessions || [];
  const leadKey = String(leadRecord?.accession_number || "").trim().toLowerCase();
  const orderedHighlights = highlightAccessions
    .map((accession) => records.find((record) => record.accession_number === accession))
    .filter(Boolean)
    .filter((record) => String(record.accession_number || "").trim().toLowerCase() !== leadKey);

  if (orderedHighlights.length) {
    return orderedHighlights.slice(0, 5);
  }

  return records
    .filter((record) => String(record.accession_number || "").trim().toLowerCase() !== leadKey)
    .slice(0, 4);
}

async function loadCsvDataset() {
  if (state.allRecords.length) {
    return state.allRecords;
  }

  state.allRecords = (
    await fetchPublishedRecords({
      jsonUrl: dataSourceConfig.publishedJsonUrl,
      csvUrl: dataSourceConfig.publishedCsvUrl
    })
  ).map(normalizePublicRecord);
  return state.allRecords;
}

async function fetchGalleryRecordsFromCsv() {
  const records = await loadCsvDataset();
  state.records = dedupeRecordsByAccession(records);
}

async function fetchArchiveRecordsFromCsv() {
  const filters = getArchiveFilterState();
  const allRecords = await loadCsvDataset();
  const activeCollectionView = getActiveCollectionView();
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
      if (filters.collection !== "all" && record.collection_name !== filters.collection) {
        return false;
      }
      if (filters.geography !== "all" && getMeaningfulValue(record.neighborhood) !== filters.geography) {
        return false;
      }
      if (filters.people !== "all" && getMeaningfulValue(record.people) !== filters.people) {
        return false;
      }
      if (filters.organizations !== "all" && getMeaningfulValue(record.organizations) !== filters.organizations) {
        return false;
      }
      if (filters.era !== "all" && formatDateLabel(record) !== filters.era) {
        return false;
      }
      if (filters.type !== "all" && record.record_type !== filters.type) {
        return false;
      }
      if (!query) {
        return true;
      }

      return buildSearchHaystack(record).includes(normalizeText(query));
    });

  const sorted = sortArchiveRecords(filtered, filters.sort);

  state.filteredRecords = sorted;
  state.archivePagination.total = sorted.length;
  const from = (state.archivePagination.page - 1) * state.archivePagination.pageSize;
  const to = from + state.archivePagination.pageSize;
  state.records = sorted.slice(from, to);
}

async function populateCatalogCard(container, record) {
  let image;
  let title;
  let meta;
  let description;
  let significance;
  let tags;
  let fragment;

  if (elements.cardTemplate) {
    fragment = elements.cardTemplate.content.cloneNode(true);
    image = fragment.querySelector(".catalog-card__image");
    title = fragment.querySelector("h3");
    meta = fragment.querySelector(".catalog-card__meta");
    description = fragment.querySelector(".catalog-card__description");
    significance = fragment.querySelector(".catalog-card__significance");
    tags = fragment.querySelector(".tag-list");
  } else {
    const article = document.createElement("article");
    article.className = "catalog-card";

    image = document.createElement("img");
    image.className = "catalog-card__image";
    image.alt = "";
    image.hidden = true;

    const body = document.createElement("div");
    body.className = "catalog-card__body";

    meta = document.createElement("p");
    meta.className = "catalog-card__meta";

    title = document.createElement("h3");

    description = document.createElement("p");
    description.className = "catalog-card__description";

    significance = document.createElement("p");
    significance.className = "catalog-card__significance";

    tags = document.createElement("div");
    tags.className = "tag-list";

    body.append(meta, title, description, significance, tags);
    article.append(image, body);
    fragment = article;
  }

  title.textContent = record.title;
  meta.textContent = [record.accession_number, buildCollectionBadgeText(record), formatDateLabel(record)]
    .filter(Boolean)
    .join(" • ");
  description.textContent = record.description || "No description available.";
  significance.textContent = record.significance || "Historical significance not yet added.";
  tags.replaceChildren(createTagElements(record.tags));

  applyRecordImage(image, record, `${record.title} image`);

  const link = document.createElement("a");
  link.className = "record-link-shell";
  link.href = getRecordUrl(record);
  link.setAttribute("aria-label", `Open record for ${record.title}`);
  link.appendChild(fragment);

  container.appendChild(link);
}

async function renderFeaturedRecords() {
  if (!elements.featuredList || !elements.cardTemplate) {
    return;
  }

  const featured = getCuratedRecords(state.siteSettings.public_featured_accessions, 5);
  elements.featuredList.replaceChildren();

  if (!featured.length) {
    elements.featuredList.innerHTML = `
      <div class="empty-state">
        <h3>Featured records are being prepared.</h3>
        <p>Please explore the exhibits or archive while this section is further curated.</p>
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

  const activeCollectionView = getActiveCollectionView();
  const allCollectionRecords = getCollectionRecords();
  const leadRecord = getCuratedExhibitLeadRecord(allCollectionRecords, activeCollectionView);

  if (elements.collectionLead) {
    elements.collectionLead.replaceChildren();

    const lead = leadRecord;
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
      eyebrow.textContent = activeCollectionView?.relationshipLabel || activeCollectionView?.navLabel || "Digital Exhibit";

      const title = document.createElement("h2");
      const titleLink = document.createElement("a");
      titleLink.href = getRecordUrl(lead);
      titleLink.className = "record-title-link";
      titleLink.textContent = lead.title;
      title.appendChild(titleLink);

      const meta = document.createElement("p");
      meta.className = "exhibit-lead__meta";
      meta.textContent = [lead.accession_number, lead.record_type, formatDateLabel(lead), lead.neighborhood]
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

  if (elements.heroMetric && activeCollectionView?.relatedSpotlight) {
    elements.heroMetric.classList.add("archive-hero__aside");
    const relation = document.createElement("a");
    relation.className = "relationship-card relationship-card--hero";
    relation.href = activeCollectionView.relatedSpotlight.href;
    relation.innerHTML = `
      <p class="eyebrow">${activeCollectionView.relatedSpotlight.eyebrow}</p>
      <h3>${activeCollectionView.relatedSpotlight.title}</h3>
      <p>${activeCollectionView.relatedSpotlight.description}</p>
    `;
    elements.heroMetric.appendChild(relation);
  }

  if (elements.collectionHighlights) {
    elements.collectionHighlights.replaceChildren();

    const highlights = getCuratedExhibitHighlights(allCollectionRecords, activeCollectionView, leadRecord);
    if (!highlights.length) {
      elements.collectionHighlights.innerHTML = `
        <div class="empty-state">
          <h3>No related records are visible yet.</h3>
          <p>This exhibit spotlight will expand as more public records are described and linked.</p>
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
        <h3>Featured objects are being prepared.</h3>
        <p>Return soon for a more fully curated selection of public highlights.</p>
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
        <h3>No records match the current search.</h3>
        <p>Try broadening the filters or returning to the full archive to continue your research.</p>
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

    const titleLink = document.createElement("a");
    titleLink.className = "record-title-link";
    titleLink.href = getRecordUrl(record);
    titleLink.textContent = record.title;
    title.replaceChildren(titleLink);
    meta.textContent = [
      record.accession_number,
      record.record_type,
      formatDateLabel(record),
      getMeaningfulValue(record.neighborhood)
    ]
      .filter(Boolean)
      .join(" • ");
    description.textContent = record.significance || record.description || "No description available.";
    tags.replaceChildren(createTagElements(record.tags));

    const themeBadge = document.createElement("span");
    themeBadge.className = "pill";
    themeBadge.textContent = record.historical_theme || "General";
    badges.appendChild(themeBadge);

    if (getMeaningfulValue(record.collection_name)) {
      const collectionBadge = document.createElement("span");
      collectionBadge.className = "pill";
      collectionBadge.textContent = record.collection_name;
      badges.appendChild(collectionBadge);
    }

    if (getMeaningfulValue(record.people)) {
      const peopleBadge = document.createElement("span");
      peopleBadge.className = "pill";
      peopleBadge.textContent = getMeaningfulValue(record.people);
      badges.appendChild(peopleBadge);
    }

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

function renderRecordMetadataList(record) {
  const fragment = document.createDocumentFragment();
  const metadataRows = [
    ["Accession number", record.accession_number],
    ["Record type", record.record_type],
    ["Date / era", formatDateLabel(record)],
    ["Historical theme", record.historical_theme],
    ["Collection", getMeaningfulValue(record.collection_name)],
    ["Geography", getMeaningfulValue(record.neighborhood)],
    ["People", getMeaningfulValue(record.people)],
    ["Organizations", getMeaningfulValue(record.organizations)],
    ["Donor", getMeaningfulValue(record.donor)],
    ["Rights status", PUBLIC_RIGHTS_STATUS],
    ["Format / material", getMeaningfulValue(record.format_material)]
  ].filter(([, value]) => String(value || "").trim());

  for (const [label, value] of metadataRows) {
    const row = document.createElement("div");
    row.className = "record-detail__meta-row";

    const term = document.createElement("dt");
    term.textContent = label;

    const description = document.createElement("dd");
    description.textContent = value;

    row.append(term, description);
    fragment.appendChild(row);
  }

  return fragment;
}

function buildCitationText(record) {
  const parts = [
    record.title,
    record.object_date || record.time_period,
    record.accession_number,
    "Smith Robertson Museum + Cultural Center Digital Collections"
  ].filter(Boolean);

  return parts.join(". ");
}

async function renderRecordDetailPage() {
  if (pageMode !== "record" || !elements.detailShell || !elements.detailTemplate) {
    return;
  }

  await loadCsvDataset();
  const accession = new URLSearchParams(window.location.search).get("accession") || "";
  const record = findRecordByAccession(accession);
  elements.detailShell.replaceChildren();

  if (!record) {
    elements.detailShell.innerHTML = `
      <div class="empty-state">
        <h2>Record not found</h2>
        <p>The requested accession is not available in the public site. Return to the archive to continue browsing.</p>
      </div>
    `;
    if (elements.archiveTitle) {
      elements.archiveTitle.textContent = "Collection record";
    }
    setStatus("The requested record could not be found.", true);
    return;
  }

  const fragment = elements.detailTemplate.content.cloneNode(true);
  const hero = fragment.querySelector(".record-detail__hero");
  const media = fragment.querySelector(".record-detail__media");
  const image = fragment.querySelector(".record-detail__image");
  const title = fragment.querySelector(".record-detail__title");
  const meta = fragment.querySelector(".record-detail__meta");
  const summary = fragment.querySelector(".record-detail__summary");
  const significance = fragment.querySelector(".record-detail__significance");
  const metadata = fragment.querySelector(".record-detail__metadata");
  const context = fragment.querySelector(".record-detail__context");
  const tags = fragment.querySelector(".record-detail__tags");
  const citation = fragment.querySelector(".record-detail__citation");

  title.textContent = record.title;
  meta.textContent = getRecordDisplayContext(record);
  summary.textContent = record.description || "Description not yet available.";
  significance.textContent = record.significance || "Historical significance not yet available.";
  metadata.replaceChildren(renderRecordMetadataList(record));
  context.textContent = buildRecordContextText(record);
  tags.replaceChildren(createTagElements(record.tags));
  citation.textContent = buildCitationText(record);

  applyRecordImage(image, record, `${record.title} image`, { eager: true });
  if (image.hidden) {
    media.hidden = true;
    hero.classList.add("record-detail__hero--text-only");
  }
  elements.detailShell.appendChild(fragment);

  if (elements.archiveTitle) {
    elements.archiveTitle.textContent = record.title;
  }
  if (elements.archiveIntro) {
    elements.archiveIntro.textContent =
      "Use this page as the authoritative public record view for citation, close reading, and metadata review.";
  }
  if (elements.pathMeta) {
    elements.pathMeta.textContent = buildCollectionBadgeText(record);
    elements.pathMeta.hidden = false;
  }

  document.title = buildMuseumPageTitle(record.title);
  setHeadMeta({ name: "description", content: record.description || record.significance || record.title });
  setHeadMeta({ property: "og:title", content: document.title });
  setHeadMeta({ property: "og:description", content: record.description || record.significance || record.title });
  setHeadMeta({ property: "og:image", content: resolvePrimaryImageUrl(record) || logoAssetPath });
  setHeadMeta({ name: "twitter:title", content: document.title });
  setHeadMeta({ name: "twitter:description", content: record.description || record.significance || record.title });
  setHeadMeta({ name: "twitter:image", content: resolvePrimaryImageUrl(record) || logoAssetPath });
  setStatus(`Showing record ${record.accession_number}.`);
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
    setStatus("The public collections source is not configured yet.", true);
    return;
  }

  state.siteSettings = buildConfiguredSiteSettings();
  state.recordTypes = [...defaultRecordTypes];
  state.taxonomyGroups = [...defaultTaxonomyGroups];
  state.taxonomyTerms = [...defaultTaxonomyTerms].map(normalizeTaxonomyTerm);
  ensureArchiveToolbarFields();
  attachArchiveInteractionHandlers();

  applyCatalogSettings();

  if (pageMode === "record") {
    await renderRecordDetailPage();
    await loadCurrentUser();
    return;
  }

  if (pageMode === "archive") {
    await loadCsvDataset();
    renderRecordTypeFilter();
    renderThemeFilter();
    renderCollectionFilter();
    renderGeographyFilter();
    renderPeopleFilter();
    renderOrganizationsFilter();
    renderEraFilter();
    renderSortFilter();
    await fetchArchiveRecordsFromCsv();
    await renderArchive();
    renderActiveFilterSummary();
    updateArchivePaginationUI();
    await loadCurrentUser();
    setStatus("Showing the searchable public archive.");
    return;
  }

  if (pageMode === "collection") {
    await loadCsvDataset();
    renderRecordTypeFilter();
    renderThemeFilter();
    renderCollectionFilter();
    renderGeographyFilter();
    renderPeopleFilter();
    renderOrganizationsFilter();
    renderEraFilter();
    renderSortFilter();
    await fetchArchiveRecordsFromCsv();
    await renderCollectionExhibit();
    await renderArchive();
    renderActiveFilterSummary();
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
    renderActiveFilterSummary();
    return;
  }

  await fetchArchiveRecords();
  await renderArchive();
}

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
