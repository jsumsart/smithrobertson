import { buildConfiguredSiteSettings } from "./csv-data.js";

const elements = {
  eyebrow: document.querySelector("#loginEyebrow"),
  title: document.querySelector("#loginTitle"),
  intro: document.querySelector("#loginIntro"),
  message: document.querySelector("#loginMessage")
};

function setMessage(message, isError = false) {
  elements.message.textContent = message;
  elements.message.classList.toggle("help-text--error", isError);
}

async function loadLoginBranding() {
  const settings = buildConfiguredSiteSettings();
  document.title = `${settings.brand_name} Editor Status`;
  elements.eyebrow.textContent = `${settings.brand_name} Editor Status`;
  elements.title.textContent = "The public site is live. The old editor is offline.";
  elements.intro.textContent =
    "Published records now come from the CSV stored in this GitHub repository at data/records.csv. There is no active web login or live backend editor at the moment.";
}

async function initialize() {
  await loadLoginBranding();
  setMessage("Current source of truth: data/records.csv in the repository, updated through the spreadsheet-to-GitHub workflow.");
}

initialize().catch((error) => setMessage(error.message, true));
