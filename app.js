const DB_NAME = "smith-robertson-museum-db";
const DB_VERSION = 1;
const STORE_NAME = "records";

const sampleRecords = [
  {
    id: crypto.randomUUID(),
    accessionNumber: "SRM-FS-1952-001",
    title: "Farish Street Beauty Shop Sign",
    type: "Artifact",
    status: "On Display",
    collectionName: "Farish Street Business District",
    location: "Gallery 2",
    historicalTheme: "Farish Street Business District",
    neighborhood: "Farish Street",
    timePeriod: "1950s",
    donor: "Farish Street Heritage Project",
    era: "ca. 1952",
    format: "painted metal sign",
    people: "Farish Street shop owners and beauticians",
    description: "Storefront sign from a Black-owned beauty shop that served the Farish Street business district.",
    significance:
      "The sign represents Black entrepreneurship and the commercial life of Farish Street during segregation, when African American business districts were essential community anchors.",
    provenance: "Donated by a former business owner's family.",
    condition: "Stable",
    rights: "Educational Use Approved",
    sensitivity: "Open Access",
    studentSummary:
      "This sign helps students see how Farish Street supported Black business owners, workers, and customers in Jackson.",
    classroomConnection:
      "Use this record in lessons about segregation, local business history, and how neighborhoods create economic opportunity.",
    tags: ["Farish Street", "business history", "Jackson history", "African American entrepreneurship"],
    notes: "Surface paint loss along right edge.",
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    accessionNumber: "SRM-EDU-1912-004",
    title: "Smith Robertson School Attendance Register",
    type: "Archive",
    status: "Digitized",
    collectionName: "Smith Robertson School Records",
    location: "Archive Cabinet A",
    historicalTheme: "African American Education",
    neighborhood: "Smith Robertson Campus",
    timePeriod: "1910s",
    donor: "City of Jackson Transfer",
    era: "1912",
    format: "bound paper ledger",
    people: "Students, teachers, and school administrators",
    description: "Attendance register documenting enrollment at Smith Robertson School in the early twentieth century.",
    significance:
      "The register shows the importance of Black education in Jackson and helps researchers trace names, school routines, and the growth of educational institutions for African American families.",
    provenance: "Transferred from city school storage to museum archives.",
    condition: "Fragile",
    rights: "Museum Use Only",
    sensitivity: "Review Before Classroom Use",
    studentSummary:
      "This ledger shows that education was a major priority in Jackson's Black community and that schools kept detailed records of student life.",
    classroomConnection:
      "Use with discussions about access to education, historical recordkeeping, and the role of schools in community leadership.",
    tags: ["Smith Robertson", "African American education", "student research", "Jackson history"],
    notes: "Handle with supports; digitized images available for classroom use.",
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    accessionNumber: "SRM-OH-1987-012",
    title: "Interview With Former Farish Street Musician",
    type: "Oral History",
    status: "Needs Review",
    collectionName: "Community Oral Histories",
    location: "Digital Audio Server",
    historicalTheme: "Arts And Culture",
    neighborhood: "Farish Street",
    timePeriod: "1930s-1960s memories",
    donor: "Museum Oral History Initiative",
    era: "Recorded 1987",
    format: "audio cassette transfer",
    people: "Farish Street musicians, club owners, neighborhood residents",
    description: "Recorded interview describing nightlife, performance spaces, and neighborhood culture on Farish Street.",
    significance:
      "The interview preserves memory that may not appear in official written records and captures community knowledge about music, business, and daily life.",
    provenance: "Recorded by museum volunteers and digitized from cassette.",
    condition: "Needs Conservation",
    rights: "Rights Unknown",
    sensitivity: "Review Before Classroom Use",
    studentSummary:
      "This interview lets students hear how local residents remembered the energy and creativity of Farish Street.",
    classroomConnection:
      "Useful for oral history projects, neighborhood studies, and conversations about how memory works as a historical source.",
    tags: ["oral history", "Farish Street", "music", "community memory"],
    notes: "Transcript needs cleanup before wider classroom use.",
    updatedAt: new Date().toISOString()
  }
];

const state = {
  records: [],
  selectedId: null
};

const elements = {
  form: document.querySelector("#recordForm"),
  formHeading: document.querySelector("#formHeading"),
  recordId: document.querySelector("#recordId"),
  accessionNumber: document.querySelector("#accessionNumber"),
  title: document.querySelector("#title"),
  recordType: document.querySelector("#recordType"),
  recordStatus: document.querySelector("#recordStatus"),
  collectionName: document.querySelector("#collectionName"),
  location: document.querySelector("#location"),
  historicalTheme: document.querySelector("#historicalTheme"),
  neighborhood: document.querySelector("#neighborhood"),
  timePeriod: document.querySelector("#timePeriod"),
  people: document.querySelector("#people"),
  donor: document.querySelector("#donor"),
  era: document.querySelector("#era"),
  format: document.querySelector("#format"),
  condition: document.querySelector("#condition"),
  rights: document.querySelector("#rights"),
  sensitivity: document.querySelector("#sensitivity"),
  description: document.querySelector("#description"),
  significance: document.querySelector("#significance"),
  provenance: document.querySelector("#provenance"),
  notes: document.querySelector("#notes"),
  studentSummary: document.querySelector("#studentSummary"),
  classroomConnection: document.querySelector("#classroomConnection"),
  tags: document.querySelector("#tags"),
  recordList: document.querySelector("#recordList"),
  recordCountLabel: document.querySelector("#recordCountLabel"),
  totalRecordsMetric: document.querySelector("#totalRecordsMetric"),
  farishMetric: document.querySelector("#farishMetric"),
  studentReadyMetric: document.querySelector("#studentReadyMetric"),
  reviewMetric: document.querySelector("#reviewMetric"),
  searchInput: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  themeFilter: document.querySelector("#themeFilter"),
  neighborhoodFilter: document.querySelector("#neighborhoodFilter"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  clearDataButton: document.querySelector("#clearDataButton"),
  seedDataButton: document.querySelector("#seedDataButton"),
  resetFormButton: document.querySelector("#resetFormButton"),
  duplicateButton: document.querySelector("#duplicateButton"),
  presetTags: document.querySelector("#presetTags"),
  template: document.querySelector("#recordCardTemplate")
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, handler) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const result = handler(store);

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function loadRecords() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(
        request.result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
    };

    request.onerror = () => reject(request.error);
  });
}

async function saveRecord(record) {
  await withStore("readwrite", (store) => {
    store.put(record);
  });
}

async function deleteRecord(id) {
  await withStore("readwrite", (store) => {
    store.delete(id);
  });
}

async function clearRecords() {
  await withStore("readwrite", (store) => {
    store.clear();
  });
}

function normalizedTags(value) {
  return (value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getFilteredRecords() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const type = elements.typeFilter.value;
  const status = elements.statusFilter.value;
  const theme = elements.themeFilter.value;
  const neighborhood = elements.neighborhoodFilter.value;

  return state.records.filter((record) => {
    const matchesType = type === "all" || record.type === type;
    const matchesStatus = status === "all" || record.status === status;
    const matchesTheme = theme === "all" || record.historicalTheme === theme;
    const matchesNeighborhood = neighborhood === "all" || record.neighborhood === neighborhood;

    const haystack = [
      record.accessionNumber,
      record.title,
      record.collectionName,
      record.location,
      record.historicalTheme,
      record.neighborhood,
      record.timePeriod,
      record.people,
      record.donor,
      record.description,
      record.significance,
      record.studentSummary,
      record.classroomConnection,
      record.notes,
      ...(record.tags || [])
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || haystack.includes(query);
    return matchesType && matchesStatus && matchesTheme && matchesNeighborhood && matchesQuery;
  });
}

function renderMetrics(records) {
  const farishCount = records.filter((record) => record.neighborhood === "Farish Street").length;
  const studentReadyCount = records.filter(
    (record) => record.studentSummary && record.classroomConnection && record.sensitivity !== "Restricted"
  ).length;
  const reviewCount = records.filter((record) => record.status === "Needs Review").length;

  elements.totalRecordsMetric.textContent = String(records.length);
  elements.farishMetric.textContent = String(farishCount);
  elements.studentReadyMetric.textContent = String(studentReadyCount);
  elements.reviewMetric.textContent = String(reviewCount);
}

function renderRecordList() {
  const records = getFilteredRecords();
  elements.recordCountLabel.textContent = `${records.length} result${records.length === 1 ? "" : "s"}`;
  elements.recordList.innerHTML = "";

  if (!records.length) {
    elements.recordList.innerHTML = `
      <div class="empty-state">
        <h3>No records match this view.</h3>
        <p>Try changing a filter or create a new Smith Robertson record.</p>
      </div>
    `;
    return;
  }

  for (const record of records) {
    const fragment = elements.template.content.cloneNode(true);
    const meta = fragment.querySelector(".record-card__meta");
    const title = fragment.querySelector("h3");
    const submeta = fragment.querySelector(".record-card__submeta");
    const status = fragment.querySelector(".pill");
    const description = fragment.querySelector(".record-card__description");
    const summary = fragment.querySelector(".record-card__summary");
    const details = fragment.querySelector(".record-card__details");
    const tagList = fragment.querySelector(".tag-list");
    const editButton = fragment.querySelector('[data-action="edit"]');
    const deleteButton = fragment.querySelector('[data-action="delete"]');

    meta.textContent = `${record.type} • ${record.accessionNumber}`;
    title.textContent = record.title;
    submeta.textContent = [record.historicalTheme, record.neighborhood].filter(Boolean).join(" • ");
    status.textContent = record.status;
    description.textContent = record.description || "No description added yet.";
    summary.textContent = record.studentSummary
      ? `Student view: ${record.studentSummary}`
      : "Student view: Add a plain-language summary to make this easier for classes and tours.";

    const detailEntries = [
      ["Collection", record.collectionName || "Unassigned"],
      ["Location", record.location || "Not set"],
      ["Time Period", record.timePeriod || record.era || "Not set"],
      ["People / Organizations", record.people || "Not set"],
      ["Format", record.format || "Not set"],
      ["Condition", record.condition || "Not set"],
      ["Rights", record.rights || "Not set"],
      ["Sensitivity", record.sensitivity || "Not set"],
      ["Last Updated", new Date(record.updatedAt).toLocaleDateString()]
    ];

    details.innerHTML = detailEntries
      .map(
        ([label, value]) => `
          <div>
            <dt>${label}</dt>
            <dd>${value}</dd>
          </div>
        `
      )
      .join("");

    const tags = record.tags?.length ? record.tags : ["untagged"];
    tagList.innerHTML = tags.map((tag) => `<span class="tag">${tag}</span>`).join("");

    editButton.addEventListener("click", () => populateForm(record));
    deleteButton.addEventListener("click", async () => {
      const confirmed = window.confirm(`Delete "${record.title}" from the Smith Robertson database?`);
      if (!confirmed) {
        return;
      }

      if (state.selectedId === record.id) {
        resetForm();
      }

      await deleteRecord(record.id);
      await refresh();
    });

    elements.recordList.appendChild(fragment);
  }
}

function getFormData() {
  return {
    id: elements.recordId.value || crypto.randomUUID(),
    accessionNumber: elements.accessionNumber.value.trim(),
    title: elements.title.value.trim(),
    type: elements.recordType.value,
    status: elements.recordStatus.value,
    collectionName: elements.collectionName.value.trim(),
    location: elements.location.value.trim(),
    historicalTheme: elements.historicalTheme.value,
    neighborhood: elements.neighborhood.value,
    timePeriod: elements.timePeriod.value.trim(),
    people: elements.people.value.trim(),
    donor: elements.donor.value.trim(),
    era: elements.era.value.trim(),
    format: elements.format.value.trim(),
    condition: elements.condition.value,
    rights: elements.rights.value,
    sensitivity: elements.sensitivity.value,
    description: elements.description.value.trim(),
    significance: elements.significance.value.trim(),
    provenance: elements.provenance.value.trim(),
    notes: elements.notes.value.trim(),
    studentSummary: elements.studentSummary.value.trim(),
    classroomConnection: elements.classroomConnection.value.trim(),
    tags: normalizedTags(elements.tags.value),
    updatedAt: new Date().toISOString()
  };
}

function populateForm(record) {
  state.selectedId = record.id;
  elements.formHeading.textContent = `Editing ${record.title}`;
  elements.recordId.value = record.id;
  elements.accessionNumber.value = record.accessionNumber || "";
  elements.title.value = record.title || "";
  elements.recordType.value = record.type || "Artifact";
  elements.recordStatus.value = record.status || "In Storage";
  elements.collectionName.value = record.collectionName || "";
  elements.location.value = record.location || "";
  elements.historicalTheme.value = record.historicalTheme || "";
  elements.neighborhood.value = record.neighborhood || "";
  elements.timePeriod.value = record.timePeriod || "";
  elements.people.value = record.people || "";
  elements.donor.value = record.donor || "";
  elements.era.value = record.era || "";
  elements.format.value = record.format || "";
  elements.condition.value = record.condition || "";
  elements.rights.value = record.rights || "";
  elements.sensitivity.value = record.sensitivity || "";
  elements.description.value = record.description || "";
  elements.significance.value = record.significance || "";
  elements.provenance.value = record.provenance || "";
  elements.notes.value = record.notes || "";
  elements.studentSummary.value = record.studentSummary || "";
  elements.classroomConnection.value = record.classroomConnection || "";
  elements.tags.value = (record.tags || []).join(", ");
  elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  state.selectedId = null;
  elements.formHeading.textContent = "Create A Smith Robertson Record";
  elements.form.reset();
  elements.recordId.value = "";
}

async function refresh() {
  state.records = await loadRecords();
  renderMetrics(state.records);
  renderRecordList();
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

async function importRecords(file) {
  const text = await file.text();
  const imported = JSON.parse(text);

  if (!Array.isArray(imported)) {
    throw new Error("Backup file must contain an array of museum records.");
  }

  for (const record of imported) {
    await saveRecord({
      ...record,
      id: record.id || crypto.randomUUID(),
      tags: Array.isArray(record.tags) ? record.tags : [],
      updatedAt: record.updatedAt || new Date().toISOString()
    });
  }
}

async function seedSampleData() {
  if (state.records.length > 0) {
    const confirmed = window.confirm("The local database already has records. Add Smith Robertson sample records anyway?");
    if (!confirmed) {
      return;
    }
  }

  for (const record of sampleRecords) {
    await saveRecord(record);
  }

  await refresh();
}

function addPresetTag(tag) {
  const currentTags = normalizedTags(elements.tags.value);
  if (!currentTags.includes(tag)) {
    currentTags.push(tag);
    elements.tags.value = currentTags.join(", ");
  }
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const record = getFormData();
  await saveRecord(record);
  await refresh();
  populateForm(record);
});

elements.searchInput.addEventListener("input", renderRecordList);
elements.typeFilter.addEventListener("change", renderRecordList);
elements.statusFilter.addEventListener("change", renderRecordList);
elements.themeFilter.addEventListener("change", renderRecordList);
elements.neighborhoodFilter.addEventListener("change", renderRecordList);

elements.exportButton.addEventListener("click", () => {
  downloadJson("smith-robertson-records-backup.json", state.records);
});

elements.importInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  try {
    await importRecords(file);
    await refresh();
    window.alert("Backup imported successfully.");
  } catch (error) {
    console.error(error);
    window.alert(error.message || "The backup could not be imported.");
  } finally {
    elements.importInput.value = "";
  }
});

elements.clearDataButton.addEventListener("click", async () => {
  const confirmed = window.confirm(
    "Clear every local Smith Robertson record from this browser? Export a backup first if needed."
  );

  if (!confirmed) {
    return;
  }

  await clearRecords();
  resetForm();
  await refresh();
});

elements.seedDataButton.addEventListener("click", seedSampleData);
elements.resetFormButton.addEventListener("click", resetForm);

elements.duplicateButton.addEventListener("click", async () => {
  if (!state.selectedId) {
    window.alert("Select a record to duplicate first.");
    return;
  }

  const current = state.records.find((record) => record.id === state.selectedId);
  if (!current) {
    return;
  }

  const duplicate = {
    ...current,
    id: crypto.randomUUID(),
    accessionNumber: `${current.accessionNumber}-COPY`,
    title: `${current.title} Copy`,
    updatedAt: new Date().toISOString()
  };

  await saveRecord(duplicate);
  await refresh();
  populateForm(duplicate);
});

elements.presetTags.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tag]");
  if (!button) {
    return;
  }

  addPresetTag(button.dataset.tag);
});

refresh().catch((error) => {
  console.error(error);
  elements.recordList.innerHTML = `
    <div class="empty-state">
      <h3>Database unavailable</h3>
      <p>This browser could not open IndexedDB. Try another browser or check privacy settings.</p>
    </div>
  `;
});
