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
  document.title = `${settings.brand_name} Login`;
  elements.eyebrow.textContent = `${settings.brand_name} Login`;
  elements.title.textContent = "Collections manager rebuild in progress.";
  elements.intro.textContent =
    "This site is being migrated to a cleaner CollectionBuilder-style architecture. Public browsing remains available while the editor is rebuilt outside the public site.";
}

async function initialize() {
  await loadLoginBranding();
  setMessage("The old in-browser editor has been retired from the public site during migration.");
}

initialize().catch((error) => setMessage(error.message, true));
