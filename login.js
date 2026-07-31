import { buildConfiguredSiteSettings } from "./csv-data.js";
import {
  buildArchiveLoginUrl,
  clearArchiveAccess,
  getRequestedArchiveDestination,
  grantArchiveAccess,
  isArchiveAuthorized,
  isArchiveGateEnabled
} from "./public-auth.js";

const destinationUrl = getRequestedArchiveDestination();

const elements = {
  eyebrow: document.querySelector("#loginEyebrow"),
  title: document.querySelector("#loginTitle"),
  intro: document.querySelector("#loginIntro"),
  message: document.querySelector("#loginMessage"),
  form: document.querySelector("#archiveLoginForm"),
  password: document.querySelector("#archivePassword"),
  submit: document.querySelector("#archiveSubmit"),
  signOut: document.querySelector("#archiveSignOut"),
  archiveLink: document.querySelector("#loginArchiveLink")
};

function setMessage(message, isError = false) {
  elements.message.textContent = message;
  elements.message.classList.toggle("help-text--error", isError);
}

async function loadLoginBranding() {
  const settings = buildConfiguredSiteSettings();
  document.title = `Archive Access | ${settings.brand_name}`;
  elements.eyebrow.textContent = `${settings.brand_name} Archive Access`;

  if (!isArchiveGateEnabled()) {
    elements.title.textContent = "Archive access is currently open.";
    elements.intro.textContent =
      "No password is configured for this front-end archive gate right now, so the archive can be opened directly.";
    return;
  }

  elements.title.textContent = "Enter the archive password.";
  elements.intro.textContent =
    "Public visitors can explore exhibit lead records and selected highlights. Full archive browsing and most record pages are available after entering the archive password.";
}

function updateLoginState() {
  const authorized = isArchiveAuthorized();

  if (elements.archiveLink) {
    elements.archiveLink.href = authorized ? destinationUrl : buildArchiveLoginUrl(destinationUrl);
    elements.archiveLink.textContent = authorized ? "Go to Archive" : "Archive Login";
  }

  if (elements.signOut) {
    elements.signOut.hidden = !authorized;
  }

  if (elements.submit) {
    elements.submit.textContent = authorized ? "Archive Unlocked" : "Open Archive";
    elements.submit.disabled = authorized;
  }

  if (elements.password) {
    elements.password.disabled = authorized || !isArchiveGateEnabled();
    if (authorized) {
      elements.password.value = "";
    }
  }

  if (!isArchiveGateEnabled()) {
    setMessage("No password is configured in data-source-config.js, so the archive gate is effectively off.");
    return;
  }

  if (authorized) {
    setMessage("Archive access is unlocked in this browser session.");
    return;
  }

  setMessage("Enter the password to open archive browsing and protected record pages.");
}

function handleSubmit(event) {
  event.preventDefault();

  if (!isArchiveGateEnabled()) {
    window.location.href = destinationUrl;
    return;
  }

  const password = elements.password?.value || "";
  if (!grantArchiveAccess(password)) {
    setMessage("That password did not match the current archive access password.", true);
    return;
  }

  updateLoginState();
  window.location.href = destinationUrl;
}

async function initialize() {
  await loadLoginBranding();
  updateLoginState();

  elements.form?.addEventListener("submit", handleSubmit);
  elements.signOut?.addEventListener("click", () => {
    clearArchiveAccess();
    updateLoginState();
    setMessage("Archive access has been cleared in this browser session.");
  });
}

initialize().catch((error) => setMessage(error.message, true));
