import { createBrowserClient, isSupabaseReady, museumBucketName } from "./supabase-client.js";

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
  selectedId: null,
  currentUser: null,
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
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  setupBanner: document.querySelector("#setupBanner"),
  setupDetails: document.querySelector("#setupDetails"),
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
  recordList: document.querySelector("#recordList"),
  recordCountLabel: document.querySelector("#recordCountLabel"),
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
  importInput: document.querySelector("#importInput"),
  clearDataButton: document.querySelector("#clearDataButton"),
  seedDataButton: document.querySelector("#seedDataButton"),
  resetFormButton: document.querySelector("#resetFormButton"),
  duplicateButton: document.querySelector("#duplicateButton"),
  presetTags: document.querySelector("#presetTags"),
  template: document.querySelector("#recordCardTemplate")
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

function setPhotoPreview(url = "") {
  state.photoPreviewUrl = url;
  elements.photoPreview.hidden = !url;
  elements.photoPreview.src = url || "";
  elements.removePhotoButton.hidden = !url;
}

function canEditSharedData() {
  return !isSupabaseReady || Boolean(state.currentUser);
}

function updateAuthUI() {
  const signedIn = Boolean(state.currentUser);
  elements.signedOutView.hidden = signedIn;
  elements.signedInView.hidden = !signedIn;
  elements.currentUserEmail.textContent = signedIn ? `Signed in as ${state.currentUser.email}` : "";

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

function renderRecordList() {
  const records = getFilteredRecords();
  const signedIn = Boolean(state.currentUser);

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
    const visibilityBadge = fragment.querySelector(".record-card__visibility");
    const image = fragment.querySelector(".record-card__image");
    const description = fragment.querySelector(".record-card__description");
    const details = fragment.querySelector(".record-card__details");
    const tagList = fragment.querySelector(".tag-list");
    const editButton = fragment.querySelector('[data-action="edit"]');
    const deleteButton = fragment.querySelector('[data-action="delete"]');

    meta.textContent = `${record.record_type} • ${record.accession_number}`;
    title.textContent = record.title;
    submeta.textContent = [record.historical_theme, record.neighborhood].filter(Boolean).join(" • ");
    status.textContent = record.status;
    visibilityBadge.textContent = record.is_public ? "Public catalog" : "Internal only";
    visibilityBadge.classList.toggle("pill--forest", record.is_public);
    description.textContent = record.description || "No description added yet.";

    if (record.photo_url) {
      image.hidden = false;
      image.src = record.photo_url;
      image.alt = `${record.title} photo`;
    }

    const detailEntries = [
      ["Collection", record.collection_name || "Unassigned"],
      ["Location", record.location || "Not set"],
      ["Time Period", record.time_period || record.object_date || "Not set"],
      ["People / Organizations", record.people || "Not set"],
      ["Format", record.format_material || "Not set"],
      ["Condition", record.condition || "Not set"],
      ["Rights", record.rights_status || "Not set"],
      ["Sensitivity", record.sensitivity || "Not set"]
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

    tagList.innerHTML = (record.tags?.length ? record.tags : ["untagged"])
      .map((tag) => `<span class="tag">${tag}</span>`)
      .join("");

    editButton.hidden = !signedIn;
    deleteButton.hidden = !signedIn;

    editButton.addEventListener("click", () => populateForm(record));
    deleteButton.addEventListener("click", async () => {
      if (!canEditSharedData()) {
        setAuthMessage("Sign in before deleting records.", true);
        return;
      }

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
    });

    elements.recordList.appendChild(fragment);
  }
}

function getFormData() {
  return {
    id: elements.recordId.value || crypto.randomUUID(),
    accession_number: elements.accessionNumber.value.trim(),
    title: elements.title.value.trim(),
    record_type: elements.recordType.value,
    status: elements.recordStatus.value,
    collection_name: elements.collectionName.value.trim(),
    location: elements.location.value.trim(),
    historical_theme: elements.historicalTheme.value,
    neighborhood: elements.neighborhood.value,
    time_period: elements.timePeriod.value.trim(),
    people: elements.people.value.trim(),
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
  elements.location.value = record.location || "";
  elements.historicalTheme.value = record.historical_theme || "";
  elements.neighborhood.value = record.neighborhood || "";
  elements.timePeriod.value = record.time_period || "";
  elements.people.value = record.people || "";
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
  setPhotoPreview(record.photo_url || "");
  setPhotoStatus(record.photo_url ? "Photo ready." : "");
}

function resetForm() {
  state.selectedId = null;
  state.photoUploadPath = "";
  elements.formHeading.textContent = "Create A Museum Record";
  elements.form.reset();
  elements.recordId.value = "";
  elements.isPublic.checked = false;
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

  const path = buildPhotoPath(accessionNumber, file.name);
  const { error } = await state.supabase.storage.from(museumBucketName).upload(path, file, {
    cacheControl: "3600",
    upsert: true
  });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl }
  } = state.supabase.storage.from(museumBucketName).getPublicUrl(path);

  state.photoUploadPath = path;
  elements.photoUrl.value = publicUrl;
  setPhotoPreview(publicUrl);
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
  const imported = JSON.parse(await file.text());
  if (!Array.isArray(imported)) {
    throw new Error("Import file must be an array of records.");
  }

  const payload = imported.map((record) => ({
    ...record,
    photo_path: record.photo_path || "",
    is_public: Boolean(record.is_public),
    updated_by: state.currentUser?.email || record.updated_by || null
  }));

  const { error } = await state.supabase.from("museum_records").upsert(payload, { onConflict: "accession_number" });
  if (error) {
    throw error;
  }
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
  renderRecordList();
}

async function initializeAuth() {
  if (!isSupabaseReady) {
    elements.setupBanner.hidden = false;
    elements.setupDetails.textContent =
      "Add your Supabase project URL and anon key in supabase-config.js, then run the SQL in supabase/schema.sql.";
    setAuthMessage("Supabase keys are missing. Shared sign-in and shared records are not active yet.");
    updateAuthUI();
    return;
  }

  elements.setupBanner.hidden = false;
  elements.setupDetails.textContent =
    "Before students start, make sure you have run supabase/schema.sql and created the museum-photos storage bucket.";

  const {
    data: { session }
  } = await state.supabase.auth.getSession();
  state.currentUser = session?.user || null;
  updateAuthUI();

  state.supabase.auth.onAuthStateChange((_event, sessionData) => {
    state.currentUser = sessionData?.user || null;
    updateAuthUI();
    refresh().catch((error) => setAuthMessage(error.message, true));
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

elements.searchInput.addEventListener("input", renderRecordList);
elements.typeFilter.addEventListener("change", renderRecordList);
elements.statusFilter.addEventListener("change", renderRecordList);
elements.themeFilter.addEventListener("change", renderRecordList);
elements.neighborhoodFilter.addEventListener("change", renderRecordList);
elements.visibilityFilter.addEventListener("change", renderRecordList);
elements.exportButton.addEventListener("click", () => downloadJson("smith-robertson-records-backup.json", state.records));
elements.seedDataButton.addEventListener("click", () => seedSampleData());
elements.resetFormButton.addEventListener("click", resetForm);

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
  if (!canEditSharedData()) {
    setAuthMessage("Sign in before deleting records.", true);
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

initializeAuth()
  .then(() => refresh())
  .catch((error) => setAuthMessage(error.message, true));
