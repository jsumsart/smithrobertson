import { createBrowserClient, isSupabaseReady } from "./supabase-client.js";

const state = {
  records: [],
  supabase: createBrowserClient()
};

const elements = {
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

function renderCatalog() {
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
    tags.innerHTML = (record.tags?.length ? record.tags : ["Smith Robertson"]).map((tag) => `<span class="tag">${tag}</span>`).join("");

    if (record.photo_url) {
      image.hidden = false;
      image.src = record.photo_url;
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

  const { data, error } = await state.supabase
    .from("museum_records")
    .select("*")
    .eq("is_public", true)
    .order("updated_at", { ascending: false });

  if (error) {
    setStatus(error.message, true);
    return;
  }

  state.records = data || [];
  setStatus("Showing public Smith Robertson records.");
  renderCatalog();
}

elements.search.addEventListener("input", renderCatalog);
elements.theme.addEventListener("change", renderCatalog);
elements.type.addEventListener("change", renderCatalog);

loadCatalog();
