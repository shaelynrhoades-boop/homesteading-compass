(() => {
  const browserConfig = globalThis.HC_SUPABASE_CONFIG || {};
  const supabaseConfig = {
    url: browserConfig.url || "",
    anonKey: browserConfig.anonKey || "",
  };
  const recordKey = "website_preview_state";
  const sdk = globalThis.supabase;
  const client =
    supabaseConfig.url && supabaseConfig.anonKey && sdk?.createClient
      ? sdk.createClient(supabaseConfig.url, supabaseConfig.anonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          },
        })
      : null;

  function isSupabaseConfigured() {
    return Boolean(client);
  }

  async function loadCurrentUser() {
    if (!client) return null;
    const {
      data: { user },
    } = await client.auth.getUser();
    return user || null;
  }

  async function getSession() {
    if (!client) return null;
    const {
      data: { session },
    } = await client.auth.getSession();
    return session || null;
  }

  async function signInWithEmail(email, password) {
    if (!client) throw new Error("Supabase is not configured for this website.");
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signUpWithEmail(email, password) {
    if (!client) throw new Error("Supabase is not configured for this website.");
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  async function loadWebsiteState() {
    if (!client) return null;
    const user = await loadCurrentUser();
    if (!user) return null;
    const { data, error } = await client
      .from("user_cloud_records")
      .select("value")
      .eq("user_id", user.id)
      .eq("record_key", recordKey)
      .maybeSingle();
    if (error) throw error;
    return typeof data?.value === "string" ? JSON.parse(data.value) : null;
  }

  async function saveWebsiteState(value) {
    if (!client) return false;
    const user = await loadCurrentUser();
    if (!user) return false;
    const { error } = await client.from("user_cloud_records").upsert({
      user_id: user.id,
      record_key: recordKey,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return true;
  }

  globalThis.HC_SUPABASE_ADAPTER = {
    client,
    supabaseConfig,
    isSupabaseConfigured,
    getSession,
    loadCurrentUser,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    loadWebsiteState,
    saveWebsiteState,
  };
})();
