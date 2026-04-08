const DB_NAME = "smith-robertson-museum-db";
const DB_VERSION = 1;
const STORE_NAME = "records";

const sampleRecords = [
  {
    id: crypto.randomUUID(),
    accessionNumber: "SRM-1964-001",
    title: "Freedom Summer Registration Ledger",
    type: "Archive",
    status: "Needs Review",
    collectionName: "Civil Rights Papers",
    location: "Archive Room 2",
    donor: "Jackson Community Project",
    era: "1964",
    description: "Handwritten volunteer registration ledger documenting local organizing activity.",
    tags: ["civil rights", "manuscript", "community history"],
    notes: "Paper is fragile and should be rehoused in acid-free sleeves.",
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    accessionNumber: "SRM-1938-014",
    title: "Student Debate Society Banner",
    type: "Artifact",
    status: "On Display",
    collectionName: "Education and Student Life",
    location: "Gallery A",
    donor: "Robertson Family Estate",
    era: "1938",
    description: "Painted fabric banner used by a local student debate society before desegregation.",
    tags: ["textile", "education", "banner"],
    notes: "Mounted with low-light conservation requirements.",
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    accessionNumber: "SRM-2025-EXH-03",
    title: "Voices of the Neighborhood",
    type: "Exhibit",
    status: "In Storage",
    collectionName: "Traveling Exhibits",
    location: "Crate Storage B",
    donor: "Museum Production",
    era: "2025",
    description: "Portable exhibit panels featuring oral histories and neighborhood maps.",
    tags: ["exhibit", "oral history", "traveling show"],
    notes: "Check media player batteries before next loan.",
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
  donor: document.querySelector("#donor"),
  era: document.querySelector("#era"),
  description: document.querySelector("#description"),
  tags: document.querySelector("#tags"),
  notes: document.querySelector("#notes"),
  recordList: document.querySelector("#recordList"),
  recordCountLabel: document.querySelector("#recordCountLabel"),
  totalRecordsMetric: document.querySelector("#totalRecordsMetric"),
  displayedMetric: document.querySelector("#displayedMetric"),
  reviewMetric: document.querySelector("#reviewMetric"),
  searchInput: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  clearDataButton: document.querySelector("#clearDataButton"),
  seedDataButton: document.querySelector("#seedDataButton"),
  resetFormButton: document.querySelector("#resetFormButton"),
  duplicateButton: document.querySelector("#duplicateButton"),
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
        request.result.sort((a, b) => {
          const dateA = new Date(a.updatedAt).getTime();
          const dateB = new Date(b.updatedAt).getTime();
          return dateB - dateA;
        })
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

function getFilteredRecords() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const type = elements.typeFilter.value;
  const status = elements.statusFilter.value;

  return state.records.filter((record) => {
    const matchesType = type === "all" || record.type === type;
    const matchesStatus = status === "all" || record.status === status;
    const haystack = [
      record.accessionNumber,
      record.title,
      record.collectionName,
      record.location,
      record.donor,
      record.description,
      record.notes,
      ...(record.tags || [])
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || haystack.includes(query);
    return matchesType && matchesStatus && matchesQuery;
  });
}

function renderMetrics(records) {
  const displayed = records.filter((record) => record.status === "On Display").length;
  const review = records.filter((record) => record.status === "Needs Review").length;

  elements.totalRecordsMetric.textContent = String(records.length);
  elements.displayedMetric.textContent = String(displayed);
  elements.reviewMetric.textContent = String(review);
}

function renderRecordList() {
  const records = getFilteredRecords();
  elements.recordCountLabel.textContent = `${records.length} result${records.length === 1 ? "" : "s"}`;
  elements.recordList.innerHTML = "";

  if (!records.length) {
    elements.recordList.innerHTML = `
      <div class="empty-state">
        <h3>No records match this view.</h3>
        <p>Try changing the filters or create a new object record for the museum collection.</p>
      </div>
    `;
    return;
  }

  for (const record of records) {
    const fragment = elements.template.content.cloneNode(true);
    const article = fragment.querySelector(".record-card");
    const meta = fragment.querySelector(".record-card__meta");
    const title = fragment.querySelector("h3");
    const status = fragment.querySelector(".pill");
    const description = fragment.querySelector(".record-card__description");
    const details = fragment.querySelector(".record-card__details");
    const tagList = fragment.querySelector(".tag-list");
    const editButton = fragment.querySelector('[data-action="edit"]');
    const deleteButton = fragment.querySelector('[data-action="delete"]');

    meta.textContent = `${record.type} • ${record.accessionNumber}`;
    title.textContent = record.title;
    status.textContent = record.status;
    description.textContent = record.description || "No description added yet.";

    const detailEntries = [
      ["Collection", record.collectionName || "Unassigned"],
      ["Location", record.location || "Not set"],
      ["Donor / Source", record.donor || "Unknown"],
      ["Date / Era", record.era || "Not set"],
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
      const confirmed = window.confirm(`Delete "${record.title}" from the museum database?`);
      if (!confirmed) {
        return;
      }

      if (state.selectedId === record.id) {
        resetForm();
      }

      await deleteRecord(record.id);
      await refresh();
    });

    article.dataset.recordId = record.id;
    elements.recordList.appendChild(fragment);
  }
}

function getFormData() {
  const id = elements.recordId.value || crypto.randomUUID();
  return {
    id,
    accessionNumber: elements.accessionNumber.value.trim(),
    title: elements.title.value.trim(),
    type: elements.recordType.value,
    status: elements.recordStatus.value,
    collectionName: elements.collectionName.value.trim(),
    location: elements.location.value.trim(),
    donor: elements.donor.value.trim(),
    era: elements.era.value.trim(),
    description: elements.description.value.trim(),
    tags: elements.tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    notes: elements.notes.value.trim(),
    updatedAt: new Date().toISOString()
  };
}

function populateForm(record) {
  state.selectedId = record.id;
  elements.formHeading.textContent = `Editing ${record.title}`;
  elements.recordId.value = record.id;
  elements.accessionNumber.value = record.accessionNumber;
  elements.title.value = record.title;
  elements.recordType.value = record.type;
  elements.recordStatus.value = record.status;
  elements.collectionName.value = record.collectionName || "";
  elements.location.value = record.location || "";
  elements.donor.value = record.donor || "";
  elements.era.value = record.era || "";
  elements.description.value = record.description || "";
  elements.tags.value = (record.tags || []).join(", ");
  elements.notes.value = record.notes || "";
  elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  state.selectedId = null;
  elements.formHeading.textContent = "Create a Museum Record";
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
    const confirmed = window.confirm("The local database already has records. Add sample records anyway?");
    if (!confirmed) {
      return;
    }
  }

  for (const record of sampleRecords) {
    await saveRecord(record);
  }

  await refresh();
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

elements.exportButton.addEventListener("click", () => {
  downloadJson("museum-records-backup.json", state.records);
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
    "Clear every local museum record from this browser? Export a backup first if you need one."
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

refresh().catch((error) => {
  console.error(error);
  elements.recordList.innerHTML = `
    <div class="empty-state">
      <h3>Database unavailable</h3>
      <p>This browser could not open IndexedDB. Try another browser or check privacy settings.</p>
    </div>
  `;
});
