/*
  Supabase connection placeholder for the website.

  The current homepage uses website/app.js and browser localStorage only. When
  the website is ready to share accounts/data with the app, this file is the
  intended boundary:

  - Auth: sign in, sign out, current user
  - Database: support_messages, Farm Stand data, Porch Light pins, listings
  - Storage: support-attachments and public listing/porch-light photos

  Do not put service-role keys in the website. The browser should only ever use
  the public Supabase URL and anon key, protected by row level security.
*/

const browserConfig = globalThis.HC_SUPABASE_CONFIG || {};

export const supabaseConfig = {
  url: browserConfig.url || "",
  anonKey: browserConfig.anonKey || "",
};

export function isSupabaseConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}

export async function signInWithEmail() {
  throw new Error("Supabase Auth is not connected to the website yet.");
}

export async function loadCurrentUser() {
  return null;
}

export async function uploadSupportAttachment() {
  throw new Error("Supabase Storage is not connected to the website yet.");
}

export async function createSupportMessage() {
  throw new Error("Supabase database writes are not connected to the website yet.");
}

export async function loadAlmanacEntries() {
  throw new Error("Supabase Almanac reads are not connected to the website yet.");
}

export async function saveAlmanacEntry() {
  throw new Error("Supabase Almanac writes are not connected to the website yet.");
}

export async function loadChores() {
  throw new Error("Supabase Chore List reads are not connected to the website yet.");
}

export async function saveChore() {
  throw new Error("Supabase Chore List writes are not connected to the website yet.");
}

export async function loadWeatherSettings() {
  throw new Error("Supabase Weather settings reads are not connected to the website yet.");
}

export async function saveWeatherSettings() {
  throw new Error("Supabase Weather settings writes are not connected to the website yet.");
}

export async function loadAnimalRecords() {
  throw new Error("Supabase animal Log Book reads are not connected to the website yet.");
}

export async function saveAnimalRecord() {
  throw new Error("Supabase animal Log Book writes are not connected to the website yet.");
}

export async function loadRecipes() {
  throw new Error("Supabase Recipe Book reads are not connected to the website yet.");
}

export async function saveRecipe() {
  throw new Error("Supabase Recipe Book writes are not connected to the website yet.");
}
