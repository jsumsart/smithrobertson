import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.SUPABASE_CONFIG || {};

export const isSupabaseReady = Boolean(config.url && config.anonKey);
export const museumBucketName = config.bucketName || "museum-photos";

export function createBrowserClient() {
  if (!isSupabaseReady) {
    return null;
  }

  return createClient(config.url, config.anonKey);
}
