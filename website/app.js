const storageKey = "hcWebsitePreviewState";
let deferredInstallPrompt = null;
let currentUser = null;
let cloudSaveTimer = null;
let syncingFromCloud = false;

const defaultState = {
  selectedStandId: "stand-1",
  profile: {
    displayName: "Homestead Owner",
    area: "Lebanon, TN",
    tier: "Hobby Farm",
  },
  contacts: [
    {
      id: "contact-1",
      name: "Cedar Creek Vet Clinic",
      type: "Vet",
      detail: "Shared between livestock records and the emergency plan.",
    },
    {
      id: "contact-2",
      name: "Mason Farm Sitting",
      type: "Farm Sitter",
      detail: "Can be included on shared emergency plans and Post Box contacts.",
    },
    {
      id: "contact-3",
      name: "Hollow Ridge Farrier",
      type: "Farrier",
      detail: "Linked to horse records and recurring care reminders.",
    },
  ],
  messageDrafts: [],
  notebookEntries: [
    {
      id: "notebook-1",
      title: "Homestead Goals",
      path: "Livestock > Goats > Shelter",
      body: "Build a dry winter shelter with kidding stall panels and a hay shelf.",
      projectId: "project-1",
      source: "Notebook",
    },
    {
      id: "notebook-2",
      title: "Field Guide Notes",
      path: "Livestock > Rabbits > Heat",
      body: "Save only the useful sentence or checklist item from the Field Guide into the category where it belongs.",
      projectId: "",
      source: "Field Guide",
    },
  ],
  workshopProjects: [
    { id: "project-1", title: "Goat Shelter Refresh", status: "Idea" },
    { id: "project-2", title: "Butcher Workstation", status: "Plan" },
    { id: "project-3", title: "Farm Stand Cooler Shelf", status: "Plan" },
  ],
  emergencyPlan: {
    propertyName: "Sunny Ridge Homestead",
    location: "Lebanon, TN",
    activeType: "",
    peoplePets: [
      { id: "safe-1", name: "Shaelyn", role: "Adult", safe: true },
      { id: "safe-2", name: "Farm Sitter", role: "Shared access", safe: false },
      { id: "safe-3", name: "House Dogs", role: "Pets", safe: true },
      { id: "safe-4", name: "Rabbitry", role: "Animals", safe: false },
    ],
    checklist: [
      { id: "em-1", text: "Start group alert and choose emergency type", done: true },
      { id: "em-2", text: "Confirm people and pets are accounted for", done: false },
      { id: "em-3", text: "Move animals according to the movement plan", done: false },
      { id: "em-4", text: "Call emergency services or professional contacts as needed", done: false },
    ],
    animalMovement: [
      { id: "move-1", text: "Rabbits to travel cages by back gate", done: false },
      { id: "move-2", text: "Goats to north dry lot if safe", done: false },
      { id: "move-3", text: "Poultry doors closed after head count", done: false },
    ],
  },
  todos: [
    { id: "todo-1", text: "Check Farm Stand eggs before noon", done: false },
    { id: "todo-2", text: "Update garden watering notes", done: true },
  ],
  chores: [
    { id: "chore-1", name: "Refill poultry waterers", frequency: "Daily", done: false },
    { id: "chore-2", name: "Turn compost and check moisture", frequency: "Weekly", done: false },
    { id: "chore-3", name: "Inventory freezer and pantry shelves", frequency: "Monthly", done: true },
  ],
  almanacEvents: [
    { id: "alm-1", title: "Start fall brassica tray", date: "2026-08-25", source: "Garden" },
    { id: "alm-2", title: "CDT booster check for doelings", date: "2026-08-28", source: "Animal Log" },
    { id: "alm-3", title: "Farm Stand price board refresh", date: "2026-08-30", source: "Chore List" },
  ],
  farmStandSetup: [
    { id: "farm-profile", text: "Farm profile started", done: true },
    { id: "stand-location", text: "Add Farm Stand location", done: false },
    { id: "low-stock", text: "Add low-stock limits", done: false },
    { id: "post-box", text: "Post Box ready", done: true },
  ],
  weather: {
    location: "Lebanon, TN",
    condition: "Hot and humid",
    temp: 92,
    detail: "Heat index watch. Check waterers, shade, and afternoon harvest timing.",
  },
  stands: [
    {
      id: "stand-1",
      name: "Sunny Ridge Farm Stand",
      location: "Lebanon, TN",
      notes: "Self-serve porch cooler. Cash box and pickup notes at the stand.",
      items: [
        { id: "item-1", name: "Eggs", category: "Eggs", quantity: 3, lowAt: 6, unit: "dozen", price: "$5", date: "2026-08-24" },
        { id: "item-2", name: "Honey", category: "Pantry", quantity: 12, lowAt: 4, unit: "jars", price: "$12", date: "2026-08-20" },
        { id: "item-3", name: "Tomatoes", category: "Produce", quantity: 18, lowAt: 8, unit: "pints", price: "$4", date: "2026-08-24" },
      ],
    },
  ],
  messages: [
    {
      id: "msg-1",
      category: "Farm Stand",
      subject: "Photo did not show on receiving end",
      body: "Checking attachment handling before Supabase is connected to the website.",
      createdAt: "2026-08-24T11:20:00.000Z",
      unread: true,
      photo: "",
    },
    {
      id: "msg-2",
      category: "Notebook",
      subject: "Notebook entry disappeared",
      body: "Website preview now includes the Notebook category and clearer save/sync status.",
      createdAt: "2026-08-23T16:45:00.000Z",
      unread: false,
      photo: "",
    },
  ],
  pins: [
    {
      id: "pin-1",
      type: "Farm Stand",
      name: "Sunny Ridge Farm Stand",
      location: "Lebanon, TN",
      detail: "Inventory grouped by the stand, not as loose item cards.",
      inventory: ["Eggs - $5/dozen", "Honey - $12/jar", "Tomatoes - $4/pint"],
      seller: "Sunny Ridge Farm Stand",
      saved: true,
    },
    {
      id: "pin-2",
      type: "Trading Post",
      name: "Hartsville Homestead Listings",
      location: "Watertown, TN",
      detail: "Tap the pin to see seller inventory, then visit their filtered Trading Post view.",
      inventory: ["Nigerian Dwarf doelings - contact seller", "Kidding pen - $80", "Garden stakes - $2/bundle"],
      seller: "Hartsville Homestead",
      saved: false,
    },
    {
      id: "pin-3",
      type: "Outpost",
      name: "Hollow Ridge Farrier",
      location: "Wilson County, TN",
      detail: "OP service profile with contact, radius, and linked availability.",
      inventory: ["Farrier visits", "Hoof trim records", "Emergency lameness referrals"],
      seller: "Hollow Ridge Farrier",
      saved: false,
    },
    {
      id: "pin-4",
      type: "Homestead",
      name: "Porch Light On",
      location: "Gallatin, TN",
      detail: "Shared homestead pin for local connection without exposing a full address.",
      inventory: ["Porch Light profile", "Front Porch posts", "Saved local profile"],
      seller: "Gallatin Homestead",
      saved: false,
    },
  ],
  listings: [
    {
      id: "listing-1",
      category: "Produce",
      title: "Pasture-raised eggs",
      location: "Lebanon, TN",
      price: "$5 / dozen",
      detail: "Pulled from Farm Stand inventory. Message, call, text, or email from seller profile.",
      saved: false,
      seller: "Sunny Ridge Farm Stand",
      phone: "(615) 555-0148",
      email: "stand@example.com",
      photo: "/assets/icon-farm-stand.png",
    },
    {
      id: "listing-2",
      category: "Livestock",
      title: "Nigerian Dwarf doelings",
      location: "Hartsville, TN",
      price: "Contact seller",
      detail: "Listing can reuse livestock photos and records already saved in the Log Book.",
      saved: false,
      seller: "Hartsville Homestead",
      phone: "(615) 555-0182",
      email: "seller@example.com",
      photo: "/assets/icon-logbook.png",
    },
    {
      id: "listing-3",
      category: "Equipment",
      title: "Two-panel kidding pen",
      location: "Gallatin, TN",
      price: "$80",
      detail: "Drafted from Workshop supplies and marked available in Trading Post.",
      saved: true,
      seller: "Cedar Lane Workshop",
      phone: "(615) 555-0120",
      email: "workshop@example.com",
      photo: "/assets/icon-workshop.png",
    },
  ],
  posts: [
    {
      id: "post-1",
      topic: "Knowledge",
      title: "Keeping water cool in August",
      body: "Frozen half-gallon jugs in troughs bought us several cooler hours during the afternoon.",
      createdAt: "2026-08-22T14:10:00.000Z",
    },
    {
      id: "post-2",
      topic: "Question",
      title: "Best mulch around fall brassicas?",
      body: "Looking for something that holds moisture but does not invite too many slugs.",
      createdAt: "2026-08-21T10:30:00.000Z",
    },
  ],
  animals: [
    {
      id: "animal-1",
      name: "Maple",
      species: "Goat",
      tag: "G-014",
      status: "Milking",
      contactId: "contact-1",
      notes: [
        { id: "note-1", type: "Health", body: "CDT current. Hooves due next week.", date: "2026-08-20" },
        { id: "note-2", type: "Production", body: "Good milker, steady on the stand.", date: "2026-08-22" },
      ],
    },
    {
      id: "animal-2",
      name: "June",
      species: "Cattle",
      tag: "B-203",
      status: "Bred",
      contactId: "contact-1",
      notes: [
        { id: "note-3", type: "Breeding", body: "Expected calving window added to Almanac.", date: "2026-08-18" },
      ],
    },
    {
      id: "animal-3",
      name: "North Hive",
      species: "Bee",
      tag: "Hive 1",
      status: "Active",
      notes: [
        { id: "note-4", type: "Inspection", body: "Strong brood pattern. Add super if goldenrod flow starts.", date: "2026-08-19" },
      ],
    },
  ],
  recipes: [
    {
      id: "recipe-1",
      title: "Tomato Basil Skillet Eggs",
      type: "Breakfast",
      ingredients: "eggs, tomatoes, basil",
      notes: "Good for using cracked eggs and ripe tomatoes from the stand.",
      source: "Your Recipe",
    },
    {
      id: "recipe-2",
      title: "Honey Oat Sandwich Bread",
      type: "Baking",
      ingredients: "honey, oats, flour",
      notes: "Two loaf batch. Track honey jars used against pantry stock.",
      source: "Neighbor's Recipe",
    },
    {
      id: "recipe-3",
      title: "Quick Dill Refrigerator Pickles",
      type: "Canning",
      ingredients: "cucumbers, dill, vinegar",
      notes: "Not shelf stable. Label jars with use-by dates.",
      source: "Starter Recipe",
    },
  ],
};

let state = loadState();

function loadState() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? normalizeState(JSON.parse(saved)) : clone(defaultState);
  } catch {
    return clone(defaultState);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeState(saved) {
  return {
    ...clone(defaultState),
    ...saved,
    profile: { ...defaultState.profile, ...(saved.profile || {}) },
    todos: Array.isArray(saved.todos) ? saved.todos : clone(defaultState.todos),
    chores: Array.isArray(saved.chores) ? saved.chores : clone(defaultState.chores),
    almanacEvents: Array.isArray(saved.almanacEvents)
      ? saved.almanacEvents
      : clone(defaultState.almanacEvents),
    weather: { ...defaultState.weather, ...(saved.weather || {}) },
    farmStandSetup: Array.isArray(saved.farmStandSetup)
      ? saved.farmStandSetup
      : clone(defaultState.farmStandSetup),
    contacts: Array.isArray(saved.contacts) ? saved.contacts : clone(defaultState.contacts),
    notebookEntries: Array.isArray(saved.notebookEntries)
      ? saved.notebookEntries
      : clone(defaultState.notebookEntries),
    workshopProjects: Array.isArray(saved.workshopProjects)
      ? saved.workshopProjects
      : clone(defaultState.workshopProjects),
    emergencyPlan: {
      ...clone(defaultState.emergencyPlan),
      ...(saved.emergencyPlan || {}),
      peoplePets: Array.isArray(saved.emergencyPlan?.peoplePets)
        ? saved.emergencyPlan.peoplePets
        : clone(defaultState.emergencyPlan.peoplePets),
      checklist: Array.isArray(saved.emergencyPlan?.checklist)
        ? saved.emergencyPlan.checklist
        : clone(defaultState.emergencyPlan.checklist),
      animalMovement: Array.isArray(saved.emergencyPlan?.animalMovement)
        ? saved.emergencyPlan.animalMovement
        : clone(defaultState.emergencyPlan.animalMovement),
    },
    stands: Array.isArray(saved.stands) ? saved.stands : clone(defaultState.stands),
    messages: Array.isArray(saved.messages) ? saved.messages : clone(defaultState.messages),
    pins: Array.isArray(saved.pins) ? saved.pins : clone(defaultState.pins),
    listings: Array.isArray(saved.listings) ? saved.listings : clone(defaultState.listings),
    messageDrafts: Array.isArray(saved.messageDrafts) ? saved.messageDrafts : clone(defaultState.messageDrafts),
    posts: Array.isArray(saved.posts) ? saved.posts : clone(defaultState.posts),
    animals: Array.isArray(saved.animals) ? saved.animals : clone(defaultState.animals),
    recipes: Array.isArray(saved.recipes) ? saved.recipes : clone(defaultState.recipes),
  };
}

function saveState() {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
  scheduleCloudSave();
}

function getSupabaseAdapter() {
  return window.HC_SUPABASE_ADAPTER || null;
}

function scheduleCloudSave() {
  if (syncingFromCloud) return;
  const adapter = getSupabaseAdapter();
  if (!currentUser || !adapter?.saveWebsiteState) return;
  window.clearTimeout(cloudSaveTimer);
  cloudSaveTimer = window.setTimeout(() => {
    saveCloudState({ quiet: true });
  }, 800);
}

async function refreshCurrentUser() {
  const adapter = getSupabaseAdapter();
  if (!adapter?.loadCurrentUser) {
    currentUser = null;
    return currentUser;
  }
  try {
    currentUser = await adapter.loadCurrentUser();
  } catch {
    currentUser = null;
  }
  renderConnectionStatus();
  return currentUser;
}

async function loadCloudState() {
  const adapter = getSupabaseAdapter();
  if (!adapter?.loadWebsiteState) {
    notify("Supabase is not available on this website build.");
    return;
  }
  try {
    const user = currentUser || (await refreshCurrentUser());
    if (!user) {
      notify("Sign in before loading cloud data.");
      return;
    }
    const cloudState = await adapter.loadWebsiteState();
    if (!cloudState) {
      notify("No cloud data saved for this account yet.");
      return;
    }
    syncingFromCloud = true;
    state = normalizeState(cloudState);
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    renderAll();
    notify("Cloud data loaded.");
  } catch {
    notify("Cloud data could not be loaded.");
  } finally {
    syncingFromCloud = false;
  }
}

async function saveCloudState(options = {}) {
  const adapter = getSupabaseAdapter();
  if (!adapter?.saveWebsiteState) {
    if (!options.quiet) notify("Supabase is not available on this website build.");
    return;
  }
  try {
    const user = currentUser || (await refreshCurrentUser());
    if (!user) {
      if (!options.quiet) notify("Sign in before saving cloud data.");
      return;
    }
    await adapter.saveWebsiteState(state);
    if (!options.quiet) notify("Cloud data saved.");
  } catch {
    if (!options.quiet) notify("Cloud data could not be saved.");
  }
}

function notify(message) {
  const toast = $("#statusToast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(notify.timeoutId);
  notify.timeoutId = window.setTimeout(() => {
    toast.hidden = true;
  }, 3000);
}

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function e(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function activateTab(tabName) {
  $all(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  $all(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${tabName}`);
  });
  $("#app")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setFeatureMenu(open) {
  const menu = $("#featureMenu");
  const toggle = $("#featureMenuToggle");
  if (!menu || !toggle) return;
  menu.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
}

function toggleFeatureMenu() {
  const menu = $("#featureMenu");
  if (!menu) return;
  setFeatureMenu(menu.hidden);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function getLowItems(stand) {
  return stand.items.filter((item) => Number(item.quantity) <= Number(item.lowAt));
}

function getStandStockStatus(stand) {
  if (!stand.items.length) return "empty";
  return getLowItems(stand).length ? "low" : "good";
}

function getMessageContacts() {
  const contacts = new Map();
  contacts.set("support", {
    id: "support",
    name: "App Support",
    detail: "Pinned support and admin contact",
    category: "Support",
    pinned: true,
  });
  state.contacts.forEach((contact) => {
    contacts.set(`contact-${contact.id}`, {
      id: `contact-${contact.id}`,
      name: contact.name,
      detail: `${contact.type} contact`,
      category: contact.type === "Seller" ? "Trading Post" : "Notebook",
    });
  });
  state.listings
    .filter((listing) => listing.saved || listing.seller)
    .forEach((listing) => {
      contacts.set(`seller-${listing.seller || listing.id}`, {
        id: `seller-${listing.seller || listing.id}`,
        name: listing.seller || "Saved Seller",
        detail: `${listing.location} · ${listing.title}`,
        category: "Trading Post",
        listingId: listing.id,
      });
    });
  state.messages.forEach((message) => {
    if (!message.recipientName) return;
    contacts.set(`message-${message.recipientName}`, {
      id: `message-${message.recipientName}`,
      name: message.recipientName,
      detail: `Previously messaged · ${message.category}`,
      category: message.category,
    });
  });
  return [...contacts.values()].sort((a, b) => {
    if (a.pinned) return -1;
    if (b.pinned) return 1;
    return a.name.localeCompare(b.name);
  });
}

function setComposeDraft(contact) {
  $("#composeRecipient").value = contact.id;
  $("#messageDialogTitle").textContent = contact.name;
  $("#composeCategory").value = contact.category || "Support";
  const draft = state.messageDrafts.find((item) => item.recipientId === contact.id);
  $("#composeSubject").value = draft?.subject || "";
  $("#composeBody").value = draft?.body || "";
}

function saveCurrentMessageDraft(options = {}) {
  const recipientId = $("#composeRecipient")?.value;
  const subject = $("#composeSubject")?.value.trim() || "";
  const body = $("#composeBody")?.value.trim() || "";
  if (!recipientId || (!subject && !body)) return false;
  const contact = getMessageContacts().find((item) => item.id === recipientId);
  const draft = {
    id: `draft-${recipientId}`,
    recipientId,
    recipientName: contact?.name || "Post Box contact",
    category: $("#composeCategory")?.value || contact?.category || "Support",
    subject,
    body,
    updatedAt: new Date().toISOString(),
  };
  state.messageDrafts = [draft, ...state.messageDrafts.filter((item) => item.recipientId !== recipientId)];
  saveState();
  if (!options.quiet) notify("Draft saved.");
  return true;
}

function renderFarmStandSetup() {
  const toggle = $("#setupToggle");
  const list = $("#setupList");
  if (!toggle || !list) return;

  const tasks = state.farmStandSetup || [];
  const isComplete = tasks.length > 0 && tasks.every((task) => task.done);
  toggle.hidden = isComplete;
  list.hidden = isComplete || toggle.getAttribute("aria-expanded") !== "true";

  list.innerHTML = tasks
    .map(
      (task) => `
        <button class="setup-item ${task.done ? "done" : "warning"}" type="button" data-toggle-setup="${task.id}">
          <span>${task.done ? "✓" : "!"}</span>
          ${e(task.text)}
        </button>
      `,
    )
    .join("");
}

function renderTodos() {
  const list = $("#todoList");
  const count = $("#todoCount");
  if (!list || !count) return;
  count.textContent = String(state.todos.filter((todo) => !todo.done).length);
  list.innerHTML = state.todos
    .map(
      (todo) => `
        <button class="list-row ${todo.done ? "done" : ""}" type="button" data-toggle-todo="${todo.id}">
          <span>${todo.done ? "✓" : "○"}</span>
          <strong>${e(todo.text)}</strong>
        </button>
      `,
    )
    .join("");
}

function renderChores() {
  const list = $("#choreList");
  const count = $("#choreCount");
  if (!list || !count) return;
  const openChores = state.chores.filter((chore) => !chore.done);
  count.textContent = String(openChores.length);
  list.innerHTML = state.chores
    .map(
      (chore) => `
        <button class="list-row ${chore.done ? "done" : ""}" type="button" data-toggle-chore="${chore.id}">
          <span>${chore.done ? "✓" : "○"}</span>
          <strong>${e(chore.name)}</strong>
          <em>${e(chore.frequency)}</em>
        </button>
      `,
    )
    .join("");
}

function renderAlmanacEvents() {
  const list = $("#almanacEvents");
  const count = $("#almanacCount");
  if (!list || !count) return;
  const events = [...state.almanacEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
  count.textContent = String(events.length);
  list.innerHTML = events
    .map(
      (event) => `
        <article class="calendar-row">
          <time datetime="${e(event.date)}">${formatShortDate(event.date)}</time>
          <div>
            <strong>${e(event.title)}</strong>
            <span>${e(event.source)}</span>
          </div>
          <button class="icon-button" type="button" data-delete-almanac="${event.id}" aria-label="Delete reminder">×</button>
        </article>
      `,
    )
    .join("");
}

function renderStands() {
  const cards = $("#standCards");
  const detail = $("#standDetail");
  if (!cards || !detail) return;
  detail.hidden = true;
  detail.innerHTML = "";

  if (state.stands.length === 1) {
    state.selectedStandId = state.stands[0].id;
  }

  cards.innerHTML = state.stands
    .map((stand) => {
      const status = getStandStockStatus(stand);
      const isActive = stand.id === state.selectedStandId;
      return `
        <article class="stand-card ${isActive ? "active" : ""}">
          <button class="stand-card-main" type="button" data-view-stand="${stand.id}" aria-expanded="${isActive}">
            <span class="stock-dot ${status}" aria-label="${status === "good" ? "Inventory stocked" : status === "low" ? "Inventory low" : "No inventory"}"></span>
            <span>
              <span class="stand-card-title">${e(stand.name)}</span>
              <span class="stand-card-summary">${stand.items.length} items</span>
            </span>
          </button>
          ${
            isActive
              ? `
                <div class="stand-open-panel">
                  <div class="stand-open-top">
                    <details class="info-popover">
                      <summary aria-label="Farm Stand information">i</summary>
                      <div>
                        <strong>Farm Stand Description</strong>
                        <p>${e(stand.notes)}</p>
                        <p><strong>Type:</strong> Self-serve stand</p>
                        <p><strong>Address:</strong> ${e(stand.location)}</p>
                        <div class="legend-row"><span class="stock-dot good"></span> Inventory is stocked.</div>
                        <div class="legend-row"><span class="stock-dot low"></span> One or more items are low.</div>
                        <div class="legend-row"><span class="stock-dot empty"></span> No items are listed yet.</div>
                        <div class="legend-row"><span class="action-glyph">✎</span> Edit stand details.</div>
                        <div class="legend-row"><span class="action-glyph">⇄</span> Share this stand to Trading Post.</div>
                      </div>
                    </details>
                    <div class="stand-action-rail" aria-label="Stand actions">
                      <span class="stock-dot ${status}" aria-hidden="true"></span>
                      <button class="icon-action" type="button" id="editStandButton" aria-label="Edit stand">✎</button>
                      <button class="icon-action" type="button" id="addItemToggle" aria-label="Add item">+</button>
                      <button class="icon-action" type="button" data-share-stand="${stand.id}" aria-label="Share to Trading Post">⇄</button>
                    </div>
                  </div>
                  <form class="inline-form add-item-form" id="itemForm" hidden>
                    <input id="itemName" type="text" placeholder="Item name" required />
                    <input id="itemQty" type="number" min="0" placeholder="Qty" required />
                    <input id="itemUnit" type="text" placeholder="Unit" />
                    <button class="button compact" type="submit">Add</button>
                  </form>
                  <div class="inventory-list">
                    ${stand.items
                      .map(
                        (item) => `
                          <div class="inventory-row ${Number(item.quantity) <= Number(item.lowAt) ? "low" : ""}">
                            <strong>${e(item.name)}</strong>
                            <div class="quantity-control">
                              <button type="button" data-adjust-item="${item.id}" data-delta="-1">−</button>
                              <span>${e(item.quantity)} ${e(item.unit || "")}</span>
                              <button type="button" data-adjust-item="${item.id}" data-delta="1">+</button>
                            </div>
                          </div>
                        `,
                      )
                      .join("")}
                  </div>
                </div>
              `
              : ""
          }
        </article>
      `;
    })
    .join("");
}

function renderMessages() {
  const list = $("#messageList");
  const indicator = $("#unreadIndicator");
  const openCount = $("#openMessageCount");
  const contactList = $("#postboxContactList");
  const contactCount = $("#postboxContactCount");
  if (!list || !indicator) return;

  const search = ($("#messageSearch")?.value || "").trim().toLowerCase();
  const category = $("#messageCategory")?.value || "all";
  const sort = $("#messageSort")?.value || "newest";
  let messages = [...state.messages];

  if (category !== "all") {
    messages = messages.filter((message) => message.category === category);
  }
  if (search) {
    messages = messages.filter((message) =>
      `${message.category} ${message.subject} ${message.body}`.toLowerCase().includes(search),
    );
  }
  messages.sort((a, b) => {
    if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === "unread") return Number(b.unread) - Number(a.unread);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const unread = state.messages.some((message) => message.unread);
  indicator.classList.toggle("visible", unread);
  if (openCount) openCount.textContent = String(state.messages.length);
  const contacts = getMessageContacts();
  if (contactCount) contactCount.textContent = String(Math.max(0, contacts.length - 1));
  if (contactList) {
    contactList.innerHTML = contacts
      .map((contact) => {
        const draft = state.messageDrafts.find((item) => item.recipientId === contact.id);
        return `
          <button class="contact-button ${contact.pinned ? "pinned" : ""}" type="button" data-open-message-contact="${e(contact.id)}">
            <strong>${e(contact.name)}</strong>
            <span>${e(contact.detail)}${draft ? " · Draft saved" : ""}</span>
          </button>
        `;
      })
      .join("");
  }

  list.innerHTML = messages
    .map(
      (message) => `
        <article class="message-card ${message.unread ? "unread" : ""}">
          <div class="message-meta">
            <span>${e(message.category)}</span>
            <span>${formatDate(message.createdAt)}</span>
          </div>
          <h3>${e(message.subject)}</h3>
          ${message.recipientName ? `<p class="seller-line">To: ${e(message.recipientName)}</p>` : ""}
          <p>${e(message.body)}</p>
          ${
            Array.isArray(message.photos)
              ? message.photos.map((photo) => `<img class="message-photo" src="${photo}" alt="Attached preview" />`).join("")
              : message.photo
                ? `<img class="message-photo" src="${message.photo}" alt="Attached preview" />`
                : ""
          }
          <button class="button compact secondary" type="button" data-read-message="${message.id}">
            ${message.unread ? "Mark Read" : "Mark Unread"}
          </button>
        </article>
      `,
    )
    .join("");
}

function renderAlerts() {
  const list = $("#alertList");
  const count = $("#lowInventoryCount");
  if (!list) return;

  const activeFilters = $all("#filterPopover input:checked").map((input) => input.value);
  const lowAlerts = state.stands.flatMap((stand) =>
    getLowItems(stand).map((item) => ({
      type: "Inventory",
      title: `${item.name} is low`,
      detail: `${stand.name} has ${item.quantity} ${item.unit || "left"}.`,
    })),
  );
  const choreAlerts = state.chores
    .filter((chore) => !chore.done)
    .slice(0, 3)
    .map((chore) => ({
      type: "Chores",
      title: chore.name,
      detail: `${chore.frequency} chore is still open.`,
    }));
  const animalAlerts = state.animals
    .filter((animal) => /bred|due|milking|active/i.test(animal.status))
    .slice(0, 3)
    .map((animal) => ({
      type: "Animals",
      title: `${animal.name} needs a quick check`,
      detail: `${animal.species}${animal.tag ? ` ${animal.tag}` : ""}: ${animal.status}.`,
    }));
  const alerts = [
    ...lowAlerts,
    ...choreAlerts,
    { type: "Weather", title: state.weather.condition, detail: state.weather.detail },
    ...animalAlerts,
    ...(state.messages.some((message) => message.unread)
      ? [{ type: "Messages", title: "Unread Post Box message", detail: "Review the newest support thread." }]
      : []),
  ].filter((alert) => activeFilters.includes(alert.type));

  if (count) count.textContent = String(lowAlerts.length);
  list.innerHTML = alerts
    .map(
      (alert) => `
        <article class="alert-row">
          <span>${alert.type}</span>
          <div>
            <strong>${e(alert.title)}</strong>
            <p>${e(alert.detail)}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderEmergencyPlan() {
  const plan = state.emergencyPlan || defaultState.emergencyPlan;
  const propertyName = $("#emergencyPropertyName");
  const propertyDetail = $("#emergencyPropertyDetail");
  const mode = $("#emergencyMode");
  const peopleList = $("#emergencyPeopleList");
  const checklist = $("#emergencyChecklist");
  const movement = $("#animalMovementPlan");
  const contacts = $("#emergencyContactList");
  if (!propertyName || !propertyDetail || !mode || !peopleList || !checklist || !movement || !contacts) return;

  propertyName.textContent = plan.propertyName;
  propertyDetail.textContent =
    `${plan.location}. Shared emergency plans can keep family, workers, and farm sitters working from the same checklist.`;
  mode.textContent = plan.activeType ? `${plan.activeType} active` : "Prepared";
  mode.classList.toggle("danger-pill", Boolean(plan.activeType));

  peopleList.innerHTML = plan.peoplePets
    .map(
      (person) => `
        <button class="setup-item ${person.safe ? "done" : "warning"}" type="button" data-toggle-safe="${person.id}">
          <span>${person.safe ? "✓" : "!"}</span>
          <strong>${e(person.name)}</strong>
          <em>${e(person.role)}</em>
        </button>
      `,
    )
    .join("");

  checklist.innerHTML = plan.checklist
    .map(
      (item) => `
        <button class="list-row ${item.done ? "done" : ""}" type="button" data-toggle-emergency-task="${item.id}">
          <span>${item.done ? "✓" : "○"}</span>
          <strong>${e(item.text)}</strong>
        </button>
      `,
    )
    .join("");

  movement.innerHTML = plan.animalMovement
    .map(
      (item) => `
        <button class="list-row ${item.done ? "done" : ""}" type="button" data-toggle-movement-task="${item.id}">
          <span>${item.done ? "✓" : "○"}</span>
          <strong>${e(item.text)}</strong>
        </button>
      `,
    )
    .join("");

  contacts.innerHTML = state.contacts
    .filter((contact) => ["Vet", "Farm Sitter", "Emergency"].includes(contact.type))
    .map(
      (contact) => `
        <div>
          <strong>${e(contact.name)}</strong>
          <span>${e(contact.type)} · Shared with records and emergency plan</span>
        </div>
      `,
    )
    .join("");
}

function renderWeather() {
  const summary = $("#weatherSummary");
  const temp = $("#weatherTemp");
  const details = $("#weatherDetails");
  const location = $("#weatherLocation");
  const condition = $("#weatherCondition");
  const rules = $("#weatherRules");
  if (!summary || !temp || !details || !location || !condition || !rules) return;

  summary.textContent = state.weather.location;
  temp.textContent = `${state.weather.temp}°`;
  details.textContent = state.weather.detail;
  location.value = state.weather.location;
  condition.value = state.weather.condition;
  rules.innerHTML = [
    ["Heat", "Water checks, shade checks, evening harvest"],
    ["Storm", "Secure tarps, charge radios, close feed bins"],
    ["Frost", "Cover tender crops and protect water lines"],
    ["Rain", "Move hay, check mud, delay tilling"],
  ]
    .map(([label, text]) => `<div><strong>${label}</strong><span>${text}</span></div>`)
    .join("");
}

function getPinInitial(type) {
  const initials = {
    "Trading Post": "TP",
    "Farm Stand": "FS",
    Outpost: "OP",
    Homestead: "✦",
    Swap: "SW",
    Event: "EV",
    Service: "SV",
  };
  return initials[type] || type.slice(0, 2).toUpperCase();
}

function renderPins() {
  const list = $("#pinList");
  const canvas = $("#mapCanvasPreview");
  if (!list) return;
  const filter = $("#pinTypeFilter")?.value || "all";
  const pins = filter === "all" ? state.pins : state.pins.filter((pin) => pin.type === filter);
  if (canvas) {
    const positions = [
      ["28%", "34%"],
      ["66%", "52%"],
      ["46%", "76%"],
      ["76%", "28%"],
      ["18%", "68%"],
    ];
    canvas.querySelectorAll(".map-pin-button").forEach((pin) => pin.remove());
    pins.forEach((pin, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "map-pin-button";
      button.dataset.focusPin = pin.id;
      button.textContent = getPinInitial(pin.type);
      button.style.left = positions[index % positions.length][0];
      button.style.top = positions[index % positions.length][1];
      canvas.appendChild(button);
    });
  }
  list.innerHTML = pins
    .map(
      (pin) => `
        <article class="local-card" id="pin-card-${e(pin.id)}">
          <div class="message-meta">
            <span><strong class="pin-initial">${e(getPinInitial(pin.type))}</strong> ${e(pin.type)}</span>
            <span>${pin.saved ? "Saved" : "Local"}</span>
          </div>
          <h3>${e(pin.name)}</h3>
          <p class="stand-location">${e(pin.location)}</p>
          <p>${e(pin.detail)}</p>
          <div class="mini-inventory">
            ${(pin.inventory || []).map((item) => `<span>${e(item)}</span>`).join("")}
          </div>
          <div class="button-row">
            <button class="button compact secondary" type="button" data-save-pin="${pin.id}">
              ${pin.saved ? "Unsave Pin" : "Save Pin"}
            </button>
            <button class="button compact secondary" type="button" data-visit-pin="${pin.id}">
              ${pin.type === "Trading Post" ? "Visit Trading Post" : pin.type === "Farm Stand" ? "Visit Farm Stand" : "View Profile"}
            </button>
            <button class="button compact secondary" type="button" data-open-message-contact="seller-${e(pin.seller || pin.name)}">
              Message
            </button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderListings() {
  const list = $("#listingList");
  if (!list) return;
  const search = ($("#listingSearch")?.value || "").trim().toLowerCase();
  const listings = state.listings.filter((listing) =>
    `${listing.category} ${listing.title} ${listing.location} ${listing.detail} ${listing.seller || ""}`.toLowerCase().includes(search),
  );
  list.innerHTML = listings
    .map(
      (listing) => `
        <article class="market-card">
          ${listing.photo ? `<img class="listing-photo" src="${e(listing.photo)}" alt="" />` : ""}
          <div class="message-meta">
            <span>${e(listing.category)}</span>
            <span>${listing.saved ? "Saved" : "Open"}</span>
          </div>
          <h3>${e(listing.title)}</h3>
          <p class="seller-line">${e(listing.seller || "Homestead seller")}</p>
          <p class="stand-location">${e(listing.location)}</p>
          <strong>${e(listing.price)}</strong>
          <p>${e(listing.detail)}</p>
          <div class="button-row listing-actions">
            <button class="button compact secondary" type="button" data-save-listing="${listing.id}">
              ${listing.saved ? "Saved Seller" : "Save Seller"}
            </button>
            <button class="button compact secondary" type="button" data-open-message-contact="seller-${e(listing.seller || listing.id)}">
              Message
            </button>
            <a class="button compact secondary" href="tel:${e(listing.phone || "")}">Call</a>
            <a class="button compact secondary" href="sms:${e(listing.phone || "")}">Text</a>
            <a class="button compact secondary" href="mailto:${e(listing.email || "")}">Email</a>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderOutpost() {
  const name = $("#outpostProfileName");
  const detail = $("#outpostProfileDetail");
  const list = $("#outpostCardList");
  if (!name || !detail || !list) return;
  name.textContent = `${state.profile.displayName} Outpost`;
  detail.textContent = `${state.profile.area}. This website preview reuses profile details so Outpost listings do not need duplicate manual entry.`;
  const cards = [
    ["Farm Stand", "Public stand profile, inventory summary, and visit/message actions."],
    ["Trading Post", "Listings can reuse Farm Stand, Workshop, and livestock record details."],
    ["Services", "Farrier, farm sitter, classes, farmhand, or local business listings."],
  ];
  list.innerHTML = cards
    .map(
      ([title, body]) => `
        <article class="market-card">
          <div class="message-meta"><span>Outpost</span><span>Connected</span></div>
          <h3>${e(title)}</h3>
          <p>${e(body)}</p>
        </article>
      `,
    )
    .join("");
}

function renderPosts() {
  const list = $("#frontPorchPosts");
  if (!list) return;
  const filter = $("#postTopicFilter")?.value || "all";
  const posts = (filter === "all" ? state.posts : state.posts.filter((post) => post.topic === filter)).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  list.innerHTML = posts
    .map(
      (post) => `
        <article class="message-card">
          <div class="message-meta">
            <span>${e(post.topic)}</span>
            <span>${formatDate(post.createdAt)}</span>
          </div>
          <h3>${e(post.title)}</h3>
          <p>${e(post.body)}</p>
        </article>
      `,
    )
    .join("");
}

function renderAnimals() {
  const board = $("#animalBoard");
  const areas = $("#recordAreaGrid");
  if (!board || !areas) return;
  const filter = $("#animalSpeciesFilter")?.value || "all";
  const animals = filter === "all" ? state.animals : state.animals.filter((animal) => animal.species === filter);

  board.innerHTML = animals
    .map((animal) => {
      const lastNote = animal.notes?.[0];
      const contact = state.contacts.find((item) => item.id === animal.contactId);
      return `
        <article class="animal-card">
          <div class="message-meta">
            <span>${e(animal.species)}</span>
            <span>${e(animal.status || "Active")}</span>
          </div>
          <h3>${e(animal.name)}</h3>
          <p class="stand-location">${e(animal.tag || "No tag")}</p>
          ${contact ? `<p class="seller-line">Contact: ${e(contact.name)} (${e(contact.type)})</p>` : ""}
          <p>${lastNote ? e(lastNote.body) : "No notes yet."}</p>
          <form class="inline-form note-form" data-animal-note="${animal.id}">
            <select name="type">
              <option>Health</option>
              <option>Breeding</option>
              <option>Production</option>
              <option>Feed</option>
              <option>General</option>
            </select>
            <input name="body" type="text" placeholder="Add quick note" required />
            <button class="button compact" type="submit">Add</button>
          </form>
        </article>
      `;
    })
    .join("");

  const speciesCounts = state.animals.reduce((counts, animal) => {
    counts[animal.species] = (counts[animal.species] || 0) + 1;
    return counts;
  }, {});
  const recordAreas = [
    ["Cattle Log", "Breeding, health, sales, feeder lots, show notes"],
    ["Animal Log", "Goats, poultry, rabbits, horses, bees, farm dogs"],
    ["Garden Log", "Beds, planting dates, soil, harvest notes"],
    ["Pantry Log", "Stored goods, preservation, supply reminders"],
    ["Workshop Log", "Equipment, tools, repairs, project notes"],
    ["Finance Log", "Receipts, sales, expenses, market totals"],
    ["Emergency Plan", "Shared property plans, safe checklists, contacts"],
    ["Sales Records", "Livestock sales pages by animal category"],
  ];
  areas.innerHTML = recordAreas
    .map(
      ([title, detail]) => `
        <article class="feature-card">
          <span class="icon-badge">${e(title.slice(0, 1))}</span>
          <h3>${e(title)}</h3>
          <p>${e(detail)}</p>
          <strong>${title.includes("Animal") ? state.animals.length : title.includes("Cattle") ? speciesCounts.Cattle || 0 : "Ready"}</strong>
        </article>
      `,
    )
    .join("");
}

function renderRecipes() {
  const list = $("#recipeList");
  if (!list) return;
  const search = ($("#recipeSearch")?.value || "").trim().toLowerCase();
  const recipes = state.recipes.filter((recipe) =>
    `${recipe.title} ${recipe.type} ${recipe.ingredients} ${recipe.notes}`.toLowerCase().includes(search),
  );
  list.innerHTML = recipes
    .map(
      (recipe) => `
        <article class="recipe-card">
          <div class="message-meta">
            <span>${e(recipe.type)}</span>
            <span>${e(recipe.source || "Your Recipe")}</span>
          </div>
          <h3>${e(recipe.title)}</h3>
          <p class="stand-location">${e(recipe.ingredients || "No ingredients listed")}</p>
          <p>${e(recipe.notes)}</p>
          <div class="reaction-row" aria-label="Public recipe actions">
            <span>♡ Like</span>
            <span>☆ Save</span>
            <span>Duplicate</span>
          </div>
          <button class="button compact secondary" type="button" data-delete-recipe="${recipe.id}">Remove</button>
        </article>
      `,
    )
    .join("");
}

function renderNotebook() {
  const list = $("#notebookList");
  const contactList = $("#contactList");
  const contactCount = $("#contactCount");
  const projectSelect = $("#notebookProject");
  const animalContact = $("#animalContact");
  if (!list) return;

  if (projectSelect) {
    projectSelect.innerHTML = [
      `<option value="">No workshop project</option>`,
      ...state.workshopProjects.map(
        (project) => `<option value="${e(project.id)}">${e(project.title)} (${e(project.status)})</option>`,
      ),
    ].join("");
  }

  if (animalContact) {
    animalContact.innerHTML = [
      `<option value="">No contact linked</option>`,
      ...state.contacts.map((contact) => `<option value="${e(contact.id)}">${e(contact.name)} - ${e(contact.type)}</option>`),
    ].join("");
  }

  if (contactCount) contactCount.textContent = String(state.contacts.length);
  if (contactList) {
    contactList.innerHTML = state.contacts
      .map(
        (contact) => `
          <div>
            <strong>${e(contact.name)}</strong>
            <span>${e(contact.type)} · ${e(contact.detail || "Reusable app contact")}</span>
          </div>
        `,
      )
      .join("");
  }

  const grouped = state.notebookEntries.reduce((groups, entry) => {
    const title = entry.title || "Notebook";
    groups[title] = groups[title] || [];
    groups[title].push(entry);
    return groups;
  }, {});

  list.innerHTML = Object.entries(grouped)
    .map(
      ([title, entries]) => `
        <article class="tool-panel notebook-group">
          <div class="panel-title-row">
            <div>
              <div class="eyebrow">${e(entries.length)} saved notes</div>
              <h3>${e(title)}</h3>
            </div>
            <button class="button compact secondary" type="button" data-print-notebook="${e(title)}">Print</button>
          </div>
          <div class="notebook-entry-list">
            ${entries
              .map((entry) => {
                const project = state.workshopProjects.find((item) => item.id === entry.projectId);
                return `
                  <div class="notebook-entry">
                    <strong>${e(entry.path || "General")}</strong>
                    <p>${e(entry.body)}</p>
                    <span>${e(entry.source || "Notebook")}${project ? ` · Linked project: ${e(project.title)}` : ""}</span>
                  </div>
                `;
              })
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderProfile() {
  const name = $("#profileName");
  const area = $("#profileArea");
  const tier = $("#profileTier");
  if (!name || !area || !tier) return;
  name.value = state.profile.displayName;
  area.value = state.profile.area;
  tier.value = state.profile.tier;
}

function renderConnectionStatus() {
  const status = $("#supabaseStatus");
  if (!status) return;
  const adapter = getSupabaseAdapter();
  const configured = Boolean(adapter?.isSupabaseConfigured?.());
  status.classList.toggle("connected", configured && Boolean(currentUser));
  status.innerHTML =
    configured && currentUser
      ? `<strong>Signed in</strong><span>${e(currentUser.email || "Supabase account")} is syncing this preview through user_cloud_records.</span>`
      : configured
        ? "<strong>Supabase ready</strong><span>Sign in to load and save this preview with your account.</span>"
        : "<strong>Demo mode</strong><span>This website is saving changes in this browser only. Supabase config or SDK is missing.</span>";
  const pill = $(".sync-pill");
  if (pill) pill.textContent = configured && currentUser ? "Supabase sync on" : "Local preview";
}

function renderAll() {
  renderFarmStandSetup();
  renderTodos();
  renderChores();
  renderAlmanacEvents();
  renderStands();
  renderMessages();
  renderEmergencyPlan();
  renderWeather();
  renderAlerts();
  renderPins();
  renderListings();
  renderOutpost();
  renderPosts();
  renderAnimals();
  renderRecipes();
  renderNotebook();
  renderProfile();
  renderConnectionStatus();
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  if (target.dataset.tab) activateTab(target.dataset.tab);
  if (target.dataset.previewTab) activateTab(target.dataset.previewTab);
  if (target.dataset.jumpTab) activateTab(target.dataset.jumpTab);
  if (target.dataset.menuTab) {
    activateTab(target.dataset.menuTab);
    setFeatureMenu(false);
  }

  if (target.id === "featureMenuToggle" || target.id === "appMenuButton") {
    toggleFeatureMenu();
  }

  if (target.id === "installAppButton" && deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(() => {
      deferredInstallPrompt = null;
      target.hidden = true;
    });
  }

  if (target.dataset.openMessageContact) {
    const contacts = getMessageContacts();
    let contact = contacts.find((item) => item.id === target.dataset.openMessageContact);
    if (!contact && target.dataset.openMessageContact.startsWith("seller-")) {
      const sellerName = target.dataset.openMessageContact.replace("seller-", "");
      const listing = state.listings.find((item) => item.seller === sellerName);
      const pin = state.pins.find((item) => item.seller === sellerName || item.name === sellerName);
      contact = {
        id: target.dataset.openMessageContact,
        name: sellerName,
        detail: listing?.location || pin?.location || "Local seller",
        category: listing ? "Trading Post" : pin?.type || "Porch Light Map",
      };
    }
    if (contact) {
      setComposeDraft(contact);
      $("#messageDialog")?.showModal();
    }
  }

  if (target.id === "closeMessageDialog") {
    const saved = saveCurrentMessageDraft({ quiet: true });
    $("#messageDialog")?.close();
    if (saved) {
      renderMessages();
      notify("Draft saved.");
    }
  }

  if (target.id === "saveMessageDraft") {
    saveCurrentMessageDraft();
    renderMessages();
  }

  if (target.dataset.focusPin) {
    const card = $(`#pin-card-${CSS.escape(target.dataset.focusPin)}`);
    card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    card?.classList.add("focus-card");
    window.setTimeout(() => card?.classList.remove("focus-card"), 1200);
  }

  if (target.dataset.visitPin) {
    const pin = state.pins.find((item) => item.id === target.dataset.visitPin);
    if (!pin) return;
    if (pin.type === "Trading Post") {
      activateTab("trading-post");
      const search = $("#listingSearch");
      if (search) search.value = pin.seller || pin.name;
      renderListings();
      notify("Trading Post filtered to that seller.");
    } else if (pin.type === "Farm Stand") {
      activateTab("farm-stand");
      notify("Farm Stand profile opened.");
    } else {
      activateTab("outpost");
      notify("Outpost profile opened.");
    }
  }

  if (target.dataset.toggleTodo) {
    state.todos = state.todos.map((todo) =>
      todo.id === target.dataset.toggleTodo ? { ...todo, done: !todo.done } : todo,
    );
    saveState();
    renderAll();
  }

  if (target.dataset.toggleChore) {
    state.chores = state.chores.map((chore) =>
      chore.id === target.dataset.toggleChore ? { ...chore, done: !chore.done } : chore,
    );
    saveState();
    renderAll();
  }

  if (target.dataset.toggleSetup) {
    state.farmStandSetup = state.farmStandSetup.map((task) =>
      task.id === target.dataset.toggleSetup ? { ...task, done: !task.done } : task,
    );
    saveState();
    renderFarmStandSetup();
  }

  if (target.id === "emergencyNowButton") {
    state.emergencyPlan.activeType = state.emergencyPlan.activeType || "Fire";
    saveState();
    renderAll();
    notify("Emergency plan opened. Review the shared checklist.");
  }

  if (target.dataset.emergencyType) {
    state.emergencyPlan.activeType = target.dataset.emergencyType;
    saveState();
    renderAll();
    notify(`${target.dataset.emergencyType} plan selected.`);
  }

  if (target.dataset.toggleSafe) {
    state.emergencyPlan.peoplePets = state.emergencyPlan.peoplePets.map((person) =>
      person.id === target.dataset.toggleSafe ? { ...person, safe: !person.safe } : person,
    );
    saveState();
    renderAll();
  }

  if (target.dataset.toggleEmergencyTask) {
    state.emergencyPlan.checklist = state.emergencyPlan.checklist.map((item) =>
      item.id === target.dataset.toggleEmergencyTask ? { ...item, done: !item.done } : item,
    );
    saveState();
    renderAll();
  }

  if (target.dataset.toggleMovementTask) {
    state.emergencyPlan.animalMovement = state.emergencyPlan.animalMovement.map((item) =>
      item.id === target.dataset.toggleMovementTask ? { ...item, done: !item.done } : item,
    );
    saveState();
    renderAll();
  }

  if (target.dataset.deleteAlmanac) {
    state.almanacEvents = state.almanacEvents.filter((event) => event.id !== target.dataset.deleteAlmanac);
    saveState();
    renderAll();
  }

  if (target.dataset.viewStand) {
    state.selectedStandId = target.dataset.viewStand;
    saveState();
    renderStands();
  }

  if (target.id === "addItemToggle") {
    const form = $("#itemForm");
    if (form) {
      form.hidden = !form.hidden;
      if (!form.hidden) $("#itemName")?.focus();
    }
  }

  if (target.dataset.shareStand) {
    const stand = state.stands.find((item) => item.id === target.dataset.shareStand);
    if (stand) {
      const availableItems = stand.items
        .filter((item) => Number(item.quantity) > 0)
        .map((item) => `${item.name} (${item.quantity} ${item.unit || "available"})`)
        .join(", ");
      state.listings.unshift({
        id: `listing-${Date.now()}`,
        category: "Farm Stand",
        title: stand.name,
        location: stand.location,
        price: "Contact stand",
        detail: availableItems || stand.notes,
        saved: false,
        seller: stand.name,
      });
      saveState();
      renderAll();
      notify("Shared to Trading Post.");
    }
  }

  if (target.dataset.adjustItem) {
    const stand = state.stands.find((item) => item.id === state.selectedStandId);
    const delta = Number(target.dataset.delta);
    stand.items = stand.items.map((item) =>
      item.id === target.dataset.adjustItem
        ? { ...item, quantity: Math.max(0, Number(item.quantity) + delta) }
        : item,
    );
    saveState();
    renderAll();
  }

  if (target.dataset.readMessage) {
    state.messages = state.messages.map((message) =>
      message.id === target.dataset.readMessage ? { ...message, unread: !message.unread } : message,
    );
    saveState();
    renderMessages();
  }

  if (target.dataset.savePin) {
    state.pins = state.pins.map((pin) =>
      pin.id === target.dataset.savePin ? { ...pin, saved: !pin.saved } : pin,
    );
    saveState();
    renderPins();
  }

  if (target.dataset.saveListing) {
    const listing = state.listings.find((item) => item.id === target.dataset.saveListing);
    state.listings = state.listings.map((listing) =>
      listing.id === target.dataset.saveListing ? { ...listing, saved: !listing.saved } : listing,
    );
    saveState();
    renderAll();
    notify(listing?.saved ? "Seller removed from saved list." : "Seller saved.");
  }

  if (target.dataset.deleteRecipe) {
    if (!window.confirm("Delete this recipe? Choose OK to remove it from this preview.")) return;
    state.recipes = state.recipes.filter((recipe) => recipe.id !== target.dataset.deleteRecipe);
    saveState();
    renderRecipes();
    notify("Recipe removed.");
  }

  if (target.dataset.printNotebook) {
    const title = target.dataset.printNotebook;
    const entries = state.notebookEntries.filter((entry) => entry.title === title);
    const printable = window.open("", "_blank", "noopener,noreferrer");
    if (!printable) {
      notify("Pop-up blocked. Allow pop-ups to print notebook notes.");
      return;
    }
    printable.document.write(`
      <html>
        <head>
          <title>${e(title)} Notes</title>
          <style>
            body { font-family: system-ui, sans-serif; color: #22251f; padding: 24px; }
            h1 { margin-bottom: 8px; }
            article { border-top: 1px solid #d8d9ce; padding: 14px 0; }
            strong, span { display: block; }
            span { color: #62675c; margin-top: 6px; }
          </style>
        </head>
        <body>
          <h1>${e(title)}</h1>
          ${entries
            .map((entry) => {
              const project = state.workshopProjects.find((item) => item.id === entry.projectId);
              return `
                <article>
                  <strong>${e(entry.path || "General")}</strong>
                  <p>${e(entry.body)}</p>
                  <span>${project ? `Linked workshop project: ${e(project.title)}` : e(entry.source || "Notebook")}</span>
                </article>
              `;
            })
            .join("")}
        </body>
      </html>
    `);
    printable.document.close();
    printable.print();
  }

  if (target.id === "setupToggle") {
    const list = $("#setupList");
    const isHidden = list?.hasAttribute("hidden");
    list?.toggleAttribute("hidden", !isHidden);
    target.setAttribute("aria-expanded", String(isHidden));
  }

  if (target.id === "filterToggle") {
    const popover = $("#filterPopover");
    const isHidden = popover?.hasAttribute("hidden");
    popover?.toggleAttribute("hidden", !isHidden);
    target.setAttribute("aria-expanded", String(isHidden));
  }

  if (target.id === "clearAlertFilters") {
    $all("#filterPopover input").forEach((input) => {
      input.checked = true;
    });
    renderAlerts();
  }

  if (target.id === "addStandButton") {
    const next = state.stands.length + 1;
    const stand = {
      id: `stand-${Date.now()}`,
      name: `Farm Stand ${next}`,
      location: "Add location",
      notes: "Click the name or location to edit this stand.",
      items: [],
    };
    state.stands.push(stand);
    state.selectedStandId = stand.id;
    saveState();
    renderAll();
  }

  if (target.id === "editStandButton" || target.id === "editStandName") {
    const stand = state.stands.find((item) => item.id === state.selectedStandId);
    const nextName = window.prompt("Stand name", stand.name);
    if (nextName?.trim()) {
      stand.name = nextName.trim();
    }
    const nextLocation = window.prompt("Stand location", stand.location);
    if (nextLocation?.trim()) {
      stand.location = nextLocation.trim();
    }
    const nextNotes = window.prompt("Farm Stand description", stand.notes);
    if (nextNotes?.trim()) stand.notes = nextNotes.trim();
    saveState();
    renderStands();
  }

  if (target.id === "editStandLocation") {
    const stand = state.stands.find((item) => item.id === state.selectedStandId);
    const nextLocation = window.prompt("Stand location", stand.location);
    if (nextLocation?.trim()) {
      stand.location = nextLocation.trim();
      saveState();
      renderStands();
    }
  }

  if (target.id === "syncOutpostButton") {
    notify("Outpost preview synced from homestead profile.");
    renderOutpost();
  }

  if (target.id === "exportDemoData") {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "homesteading-compass-demo-data.json";
    link.click();
    URL.revokeObjectURL(url);
    notify("Demo data exported.");
  }

  if (target.id === "resetDemoData") {
    if (!window.confirm("Reset this website preview back to the starting demo data?")) return;
    state = clone(defaultState);
    saveState();
    renderAll();
    notify("Demo data reset.");
  }

  if (target.id === "loadCloudData") {
    loadCloudState();
  }

  if (target.id === "saveCloudData") {
    saveCloudState();
  }

  if (target.id === "signOutButton") {
    const adapter = getSupabaseAdapter();
    try {
      await adapter?.signOut?.();
      currentUser = null;
      renderConnectionStatus();
      notify("Signed out.");
    } catch {
      notify("Sign out failed.");
    }
  }
});

document.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (event.target.id === "todoForm") {
    const input = $("#todoInput");
    if (!input.value.trim()) return;
    state.todos.unshift({ id: `todo-${Date.now()}`, text: input.value.trim(), done: false });
    input.value = "";
    saveState();
    renderTodos();
  }

  if (event.target.id === "choreForm") {
    state.chores.unshift({
      id: `chore-${Date.now()}`,
      name: $("#choreName").value.trim(),
      frequency: $("#choreFrequency").value,
      done: false,
    });
    event.target.reset();
    saveState();
    renderAll();
  }

  if (event.target.id === "almanacForm") {
    state.almanacEvents.unshift({
      id: `alm-${Date.now()}`,
      title: $("#almanacTitle").value.trim(),
      date: $("#almanacDate").value,
      source: $("#almanacSource").value,
    });
    event.target.reset();
    saveState();
    renderAll();
  }

  if (event.target.id === "weatherForm") {
    const condition = $("#weatherCondition").value;
    const weatherDetails = {
      "Hot and humid": ["Heat index watch. Check waterers, shade, and afternoon harvest timing.", 92],
      "Storm watch": ["Secure loose covers, close feed bins, and charge phones.", 78],
      "Frost watch": ["Cover tender crops, check greenhouse heat, and protect outdoor water lines.", 34],
      "Rain coming": ["Move hay under cover and plan muddy-lane chores early.", 68],
      "Clear and mild": ["Good window for planting, repairs, and outdoor wash-downs.", 72],
    };
    const [detail, temp] = weatherDetails[condition] || weatherDetails["Clear and mild"];
    state.weather = {
      location: $("#weatherLocation").value.trim() || defaultState.weather.location,
      condition,
      temp,
      detail,
    };
    saveState();
    renderAll();
    notify("Weather preview updated.");
  }

  if (event.target.id === "itemForm") {
    const stand = state.stands.find((item) => item.id === state.selectedStandId);
    stand.items.push({
      id: `item-${Date.now()}`,
      name: $("#itemName").value.trim(),
      quantity: Number($("#itemQty").value || 0),
      lowAt: 3,
      unit: $("#itemUnit").value.trim(),
    });
    event.target.reset();
    saveState();
    renderAll();
  }

  if (event.target.id === "messageForm") {
    const files = Array.from($("#composePhoto").files || []);
    const photos = await Promise.all(files.map((file) => fileToDataUrl(file)));
    const recipientId = $("#composeRecipient").value;
    const contact = getMessageContacts().find((item) => item.id === recipientId);
    if (!$("#composeSubject").value.trim()) {
      notify("Add a subject before sending so the message can be sorted and found later.");
      return;
    }
    if (!$("#composeBody").value.trim()) {
      notify("Add a message before sending.");
      return;
    }
    state.messages.unshift({
      id: `msg-${Date.now()}`,
      category: $("#composeCategory").value,
      subject: $("#composeSubject").value.trim(),
      body: $("#composeBody").value.trim(),
      createdAt: new Date().toISOString(),
      unread: true,
      recipientId,
      recipientName: contact?.name || "Post Box contact",
      photos,
    });
    state.messageDrafts = state.messageDrafts.filter((draft) => draft.recipientId !== recipientId);
    event.target.reset();
    $("#messageDialog")?.close();
    saveState();
    renderMessages();
    notify("Message sent.");
  }

  if (event.target.id === "frontPorchForm") {
    state.posts.unshift({
      id: `post-${Date.now()}`,
      topic: $("#postTopic").value,
      title: $("#postTitle").value.trim(),
      body: $("#postBody").value.trim(),
      createdAt: new Date().toISOString(),
    });
    event.target.reset();
    saveState();
    renderPosts();
  }

  if (event.target.id === "animalForm") {
    state.animals.unshift({
      id: `animal-${Date.now()}`,
      name: $("#animalName").value.trim(),
      species: $("#animalSpecies").value,
      tag: $("#animalTag").value.trim(),
      status: "Active",
      contactId: $("#animalContact")?.value || "",
      notes: $("#animalNote").value.trim()
        ? [
            {
              id: `note-${Date.now()}`,
              type: "General",
              body: $("#animalNote").value.trim(),
              date: new Date().toISOString().slice(0, 10),
            },
          ]
        : [],
    });
    event.target.reset();
    saveState();
    renderAll();
  }

  if (event.target.id === "notebookForm") {
    state.notebookEntries.unshift({
      id: `notebook-${Date.now()}`,
      title: $("#notebookTitle").value.trim(),
      path: $("#notebookPath").value.trim(),
      body: $("#notebookBody").value.trim(),
      projectId: $("#notebookProject").value,
      source: "Notebook",
    });
    event.target.reset();
    saveState();
    renderAll();
    notify("Notebook note saved.");
  }

  if (event.target.id === "contactForm") {
    state.contacts.push({
      id: `contact-${Date.now()}`,
      name: $("#contactName").value.trim(),
      type: $("#contactType").value,
      detail: "Available across logs, emergency plans, and messages.",
    });
    event.target.reset();
    saveState();
    renderAll();
    notify("Contact saved.");
  }

  if (event.target.dataset.animalNote) {
    const form = event.target;
    const animalId = form.dataset.animalNote;
    const body = new FormData(form).get("body");
    const type = new FormData(form).get("type");
    state.animals = state.animals.map((animal) =>
      animal.id === animalId
        ? {
            ...animal,
            notes: [
              {
                id: `note-${Date.now()}`,
                type: String(type || "General"),
                body: String(body || "").trim(),
                date: new Date().toISOString().slice(0, 10),
              },
              ...(animal.notes || []),
            ],
          }
        : animal,
    );
    form.reset();
    saveState();
    renderAll();
  }

  if (event.target.id === "recipeForm") {
    state.recipes.unshift({
      id: `recipe-${Date.now()}`,
      title: $("#recipeTitle").value.trim(),
      type: $("#recipeType").value,
      ingredients: $("#recipeIngredients").value.trim(),
      notes: $("#recipeNotes").value.trim(),
      source: "Your Recipe",
    });
    event.target.reset();
    saveState();
    renderRecipes();
    notify("Recipe saved.");
  }

  if (event.target.id === "profileForm") {
    state.profile = {
      displayName: $("#profileName").value.trim() || defaultState.profile.displayName,
      area: $("#profileArea").value.trim() || defaultState.profile.area,
      tier: $("#profileTier").value,
    };
    saveState();
    renderProfile();
  }

  if (event.target.id === "authForm") {
    const adapter = getSupabaseAdapter();
    const email = $("#authEmail").value.trim();
    const password = $("#authPassword").value;
    const action = event.submitter?.dataset.authAction || "signin";
    if (!email || !password) {
      notify("Enter an email and password.");
      return;
    }
    try {
      if (action === "signup") {
        await adapter?.signUpWithEmail?.(email, password);
        notify("Account created. Check email if confirmation is required.");
      } else {
        await adapter?.signInWithEmail?.(email, password);
        notify("Signed in.");
      }
      $("#authPassword").value = "";
      await refreshCurrentUser();
      if (currentUser) await loadCloudState();
    } catch {
      notify(action === "signup" ? "Account could not be created." : "Sign in failed.");
    }
  }
});

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

document.addEventListener("input", (event) => {
  if (event.target.id === "messageSearch") renderMessages();
  if (event.target.id === "listingSearch") renderListings();
  if (event.target.id === "recipeSearch") renderRecipes();
});

document.addEventListener("change", (event) => {
  if (event.target.id === "importDemoData") {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = normalizeState(JSON.parse(String(reader.result || "{}")));
        saveState();
        renderAll();
        notify("Demo data imported.");
      } catch {
        notify("That demo data file could not be imported.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  if (event.target.id === "messageCategory" || event.target.id === "messageSort") renderMessages();
  if (event.target.id === "pinTypeFilter") renderPins();
  if (event.target.id === "postTopicFilter") renderPosts();
  if (event.target.id === "animalSpeciesFilter") {
    renderAnimals();
    renderNotebook();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.closest("#filterPopover")) renderAlerts();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  const button = $("#installAppButton");
  if (button) button.hidden = false;
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  const button = $("#installAppButton");
  if (button) button.hidden = true;
});

async function boot() {
  renderAll();
  await refreshCurrentUser();
}

boot();
