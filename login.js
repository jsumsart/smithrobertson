import { createBrowserClient, isSupabaseReady } from "./supabase-client.js";
import { defaultSiteSettings } from "./platform-config.js";
import { buildConfiguredSiteSettings, dataSourceConfig } from "./csv-data.js";

const supabase = createBrowserClient();

const elements = {
  eyebrow: document.querySelector("#loginEyebrow"),
  title: document.querySelector("#loginTitle"),
  intro: document.querySelector("#loginIntro"),
  form: document.querySelector("#loginForm"),
  email: document.querySelector("#loginEmail"),
  password: document.querySelector("#loginPassword"),
  createAccount: document.querySelector("#loginCreateAccount"),
  message: document.querySelector("#loginMessage"),
  csvActions: document.querySelector("#loginCsvActions"),
  dashboardLink: document.querySelector("#loginDashboardLink"),
  googleFormLink: document.querySelector("#loginGoogleFormLink"),
  googleSheetLink: document.querySelector("#loginGoogleSheetLink")
};

function setMessage(message, isError = false) {
  elements.message.textContent = message;
  elements.message.classList.toggle("help-text--error", isError);
}

function goToDashboard() {
  window.location.replace("./index.html");
}

async function loadLoginBranding() {
  if (!isSupabaseReady || !supabase) {
    const settings = buildConfiguredSiteSettings();
    document.title = `${settings.brand_name} Collections Access`;
    elements.eyebrow.textContent = `${settings.brand_name} Workflow`;
    elements.title.textContent = "Open the collections workspace.";
    elements.intro.textContent =
      "This site is running in CSV / Google Sheets mode. Use the Google Form for data entry, the Google Sheet for review, or the CSV workspace for import and export.";
    return;
  }

  const { data } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();
  const settings = { ...defaultSiteSettings, ...(data || {}) };
  document.title = `${settings.brand_name} Login`;
  elements.eyebrow.textContent = `${settings.brand_name} Login`;
  elements.title.textContent = `Sign in to ${settings.brand_name}.`;
  elements.intro.textContent =
    "Use your account to enter the private collections dashboard for records, media, taxonomies, and publishing tools.";
}

async function initialize() {
  if (!isSupabaseReady || !supabase) {
    await loadLoginBranding();
    elements.form.hidden = true;
    elements.csvActions.hidden = false;
    elements.dashboardLink.href = "./index.html";
    if (dataSourceConfig.googleFormUrl) {
      elements.googleFormLink.hidden = false;
      elements.googleFormLink.href = dataSourceConfig.googleFormUrl;
    }
    if (dataSourceConfig.googleSheetUrl) {
      elements.googleSheetLink.hidden = false;
      elements.googleSheetLink.href = dataSourceConfig.googleSheetUrl;
    }
    setMessage("Supabase sign-in is off. Use the Google workflow or the CSV workspace instead.");
    return;
  }

  await loadLoginBranding();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session?.user) {
    goToDashboard();
    return;
  }

  supabase.auth.onAuthStateChange((_event, sessionData) => {
    if (sessionData?.user) {
      goToDashboard();
    }
  });
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const { error } = await supabase.auth.signInWithPassword({
    email: elements.email.value,
    password: elements.password.value
  });

  if (error) {
    setMessage(error.message, true);
    return;
  }

  setMessage("Signed in. Redirecting to the dashboard...");
});

elements.createAccount.addEventListener("click", async () => {
  const { error } = await supabase.auth.signUp({
    email: elements.email.value,
    password: elements.password.value
  });

  if (error) {
    setMessage(error.message, true);
    return;
  }

  setMessage("Account created. Check your Supabase email confirmation settings if needed.");
});

initialize().catch((error) => setMessage(error.message, true));
