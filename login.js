import { createBrowserClient, isSupabaseReady } from "./supabase-client.js";
import { defaultSiteSettings } from "./platform-config.js";

const supabase = createBrowserClient();

const elements = {
  eyebrow: document.querySelector("#loginEyebrow"),
  title: document.querySelector("#loginTitle"),
  intro: document.querySelector("#loginIntro"),
  form: document.querySelector("#loginForm"),
  email: document.querySelector("#loginEmail"),
  password: document.querySelector("#loginPassword"),
  createAccount: document.querySelector("#loginCreateAccount"),
  message: document.querySelector("#loginMessage")
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
    document.title = `${defaultSiteSettings.brand_name} Login`;
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
    setMessage("Supabase is not configured yet, so sign-in is unavailable.", true);
    elements.form.querySelectorAll("input, button").forEach((element) => element.setAttribute("disabled", "disabled"));
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
