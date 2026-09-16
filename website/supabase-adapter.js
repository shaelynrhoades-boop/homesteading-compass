(() => {
  const browserConfig = globalThis.HC_SUPABASE_CONFIG || {};
  const supabaseConfig = {
    url: browserConfig.url || "",
    anonKey: browserConfig.anonKey || "",
  };
  const recordKey = "website_preview_state";
  const appRecordKeys = [
    "homestead:data",
    "homestead:recipe-book:recipes",
    "homestead:trading-listings",
    "homestead:log-book",
    "homestead:animal-logs",
    "homestead:horse-log",
    "homestead:workshop-log",
    "homestead:chore-list",
    "draft:farm-stand",
    "homestead:emergency:contacts",
    "homestead:profile",
    "waystation:notification-preferences",
  ];
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

  function scopedRecordKey(baseKey, userId) {
    return `${baseKey}:${userId || "guest"}`;
  }

  async function loadScopedRecord(baseKey) {
    if (!client) return null;
    const user = await loadCurrentUser();
    if (!user) return null;
    const { data, error } = await client
      .from("user_cloud_records")
      .select("value")
      .eq("user_id", user.id)
      .eq("record_key", scopedRecordKey(baseKey, user.id))
      .maybeSingle();
    if (error) throw error;
    if (typeof data?.value !== "string") return null;
    try {
      return JSON.parse(data.value);
    } catch {
      return data.value;
    }
  }

  async function saveScopedRecord(baseKey, value) {
    if (!client) return false;
    const user = await loadCurrentUser();
    if (!user) return false;
    const { error } = await client.from("user_cloud_records").upsert({
      user_id: user.id,
      record_key: scopedRecordKey(baseKey, user.id),
      value: typeof value === "string" ? value : JSON.stringify(value),
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return true;
  }

  async function loadAppRecords(keys = appRecordKeys) {
    if (!client) return {};
    const user = await loadCurrentUser();
    if (!user) return {};
    const scopedKeys = keys.map((key) => scopedRecordKey(key, user.id));
    const { data, error } = await client
      .from("user_cloud_records")
      .select("record_key,value")
      .eq("user_id", user.id)
      .in("record_key", scopedKeys);
    if (error) throw error;
    return (data || []).reduce((records, row) => {
      const baseKey = keys.find((key) => scopedRecordKey(key, user.id) === row.record_key);
      if (!baseKey) return records;
      try {
        records[baseKey] = JSON.parse(row.value);
      } catch {
        records[baseKey] = row.value;
      }
      return records;
    }, {});
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
    scopedRecordKey,
    loadScopedRecord,
    saveScopedRecord,
    loadAppRecords,
  };
})();
