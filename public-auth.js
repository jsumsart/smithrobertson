import { dataSourceConfig } from "./csv-data.js";

const ARCHIVE_AUTH_STORAGE_KEY = "smith-robertson-archive-access-v1";

function getBrowserSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch (_error) {
    return null;
  }
}

export function getConfiguredArchivePassword() {
  return String(dataSourceConfig.publicArchivePassword || "").trim();
}

export function isArchiveGateEnabled() {
  return Boolean(getConfiguredArchivePassword());
}

export function isArchiveAuthorized() {
  if (!isArchiveGateEnabled()) {
    return true;
  }

  const storage = getBrowserSessionStorage();
  if (!storage) {
    return false;
  }

  return storage.getItem(ARCHIVE_AUTH_STORAGE_KEY) === getConfiguredArchivePassword();
}

export function grantArchiveAccess(password) {
  if (String(password || "") !== getConfiguredArchivePassword()) {
    return false;
  }

  const storage = getBrowserSessionStorage();
  if (!storage) {
    return false;
  }

  storage.setItem(ARCHIVE_AUTH_STORAGE_KEY, getConfiguredArchivePassword());
  return true;
}

export function clearArchiveAccess() {
  const storage = getBrowserSessionStorage();
  storage?.removeItem(ARCHIVE_AUTH_STORAGE_KEY);
}

export function buildArchiveLoginUrl(nextUrl = "./archive.html") {
  const target = String(nextUrl || "./archive.html");
  return `./login.html?next=${encodeURIComponent(target)}`;
}

export function getRequestedArchiveDestination() {
  if (typeof window === "undefined") {
    return "./archive.html";
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("next") || "./archive.html";
}
