const storageKey = "hcWebsitePreviewState";
let deferredInstallPrompt = null;
let currentUser = null;
let cloudSaveTimer = null;
let appRecordSaveTimer = null;
let profileContactSaveTimer = null;
let operationsSaveTimer = null;
let logBookSaveTimer = null;
let syncingFromCloud = false;
let appRecordSyncEnabled = false;

const appRecordLabels = {
  "homestead:data": "Recipes, Notebook, Almanac, Trading Post, Outpost",
  "homestead:recipe-book:recipes": "Recipe Book backup",
  "homestead:trading-listings": "Trading Post backup",
  "homestead:log-book": "Livestock Log Book",
  "homestead:animal-logs": "Animal records",
  "homestead:horse-log": "Horse Log",
  "homestead:workshop-log": "Workshop Log",
  "homestead:chore-list": "Chores and To-Dos",
  "draft:farm-stand": "Farm Stand",
  "homestead:emergency:contacts": "Shared Contacts",
  "homestead:profile": "Homestead Profile",
  "waystation:notification-preferences": "Notifications",
};

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
    {
      id: "project-1",
      title: "Goat Shelter Refresh",
      status: "Idea",
      category: "Livestock",
      supplies: [
        { item: "Cattle panel", quantity: "2", total: "$58", detail: "$29 each at farm store. Check gate width first." },
        { item: "Roof screws", quantity: "1 box", total: "$14", detail: "Use washer-head screws for metal panels." },
      ],
    },
    {
      id: "project-2",
      title: "Butcher Workstation",
      status: "Plan",
      category: "Harvest",
      supplies: [
        { item: "Stainless table", quantity: "1", total: "$120", detail: "Used restaurant prep table is fine if surface is clean." },
      ],
    },
    {
      id: "project-3",
      title: "Farm Stand Cooler Shelf",
      status: "Plan",
      category: "Farm Stand",
      supplies: [
        { item: "Shelf board", quantity: "2", total: "$24", detail: "Seal edges before installing near cooler condensation." },
      ],
    },
  ],
  fieldGuideEntries: [
    {
      id: "guide-1",
      section: "Barnyard",
      title: "Goat Shelter",
      sentence: "A dry sleeping area with wind protection matters more than a fully enclosed warm room.",
      path: "Livestock > Goats > Shelter",
    },
    {
      id: "guide-2",
      section: "Garden",
      title: "Fall Brassicas",
      sentence: "Start brassicas early enough that they size up before short daylight slows growth.",
      path: "Garden > Fall Planting > Brassicas",
    },
    {
      id: "guide-3",
      section: "Pantry",
      title: "Pantry Rotation",
      sentence: "Keep the oldest jars at the front and write the month and year where it can be seen quickly.",
      path: "Pantry > Canning > Rotation",
    },
    {
      id: "guide-4",
      section: "Workshop",
      title: "Project Supplies",
      sentence: "Track quantity and total price first, then expand the row only when you need source or per-item notes.",
      path: "Workshop > Project Planning > Supplies",
    },
  ],
  notificationPrefs: [
    { id: "new-recipe", title: "New Recipe", detail: "Breakfast, dinner, soups, baking, canning, and other recipe categories.", enabled: true },
    { id: "new-trading-post", title: "New Trading Post Listing", detail: "Livestock, food, farm supplies, equipment, and radius filters.", enabled: true },
    { id: "new-farm-stand", title: "New Farm Stand", detail: "Nearby stands with location radius.", enabled: false },
    { id: "front-porch-events", title: "Front Porch Events", detail: "Local events with radius options.", enabled: false },
    { id: "porch-light-map", title: "Porch Light Turned On", detail: "Nearby homestead, Farm Stand, Trading Post, and Outpost pins.", enabled: true },
    { id: "weather-time", title: "Weather and Time", detail: "Morning weather checks, freeze alerts, heat reminders, and chore timing.", enabled: true },
  ],
  emergencyPlan: {
    propertyName: "Sunny Ridge Homestead",
    location: "Lebanon, TN",
    activeType: "",
    peoplePets: [
      { id: "safe-1", name: "Shaelyn", role: "Adult", detail: "Primary property contact", safe: true },
      { id: "safe-2", name: "Farm Sitter", role: "Shared access", detail: "Has gate code and animal movement instructions", safe: false },
      { id: "safe-3", name: "House Dogs", role: "Pets", detail: "Two dogs, crates in laundry room", safe: true },
      { id: "safe-4", name: "Rabbitry", role: "Animals", detail: "Travel cages by back gate", safe: false },
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
    { id: "todo-1", text: "Check Farm Stand eggs before noon", category: "Farm Stand", due: "2026-08-24", done: false },
    { id: "todo-2", text: "Update garden watering notes", category: "Garden", due: "2026-08-25", done: true },
  ],
  chores: [
    { id: "chore-1", name: "Refill poultry waterers", category: "Chickens", frequency: "Daily", timeBlock: "AM", done: false },
    { id: "chore-2", name: "Turn compost and check moisture", category: "Garden", frequency: "Weekly", timeBlock: "PM", done: false },
    { id: "chore-3", name: "Inventory freezer and pantry shelves", category: "Pantry", frequency: "Monthly", timeBlock: "Daily", done: true },
  ],
  supplyRuns: [
    { id: "supply-1", item: "Layer feed", category: "Chickens", quantity: "2", unit: "bags", preferredPlace: "Co-op", destination: "Feed room" },
    { id: "supply-2", item: "Wormer", category: "Horses", quantity: "1", unit: "tube", preferredPlace: "Tractor Supply", destination: "Horse cabinet" },
  ],
  preferredPlaces: ["Co-op", "Tractor Supply", "Feed Mill"],
  quickAccess: ["log-book", "farm-stand", "notebook", "trading-post"],
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
    supplyRuns: Array.isArray(saved.supplyRuns) ? saved.supplyRuns : clone(defaultState.supplyRuns),
    preferredPlaces: Array.isArray(saved.preferredPlaces) ? saved.preferredPlaces : clone(defaultState.preferredPlaces),
    quickAccess: Array.isArray(saved.quickAccess) ? saved.quickAccess : clone(defaultState.quickAccess),
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
    fieldGuideEntries: Array.isArray(saved.fieldGuideEntries)
      ? saved.fieldGuideEntries
      : clone(defaultState.fieldGuideEntries),
    notificationPrefs: Array.isArray(saved.notificationPrefs)
      ? saved.notificationPrefs
      : clone(defaultState.notificationPrefs),
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
  scheduleCentralAppDataSave();
  scheduleProfileContactSave();
  scheduleOperationsSave();
  scheduleLogBookSave();
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

function scheduleCentralAppDataSave() {
  if (syncingFromCloud || !appRecordSyncEnabled) return;
  const adapter = getSupabaseAdapter();
  if (!currentUser || !adapter?.saveScopedRecord) return;
  window.clearTimeout(appRecordSaveTimer);
  appRecordSaveTimer = window.setTimeout(() => {
    saveCentralAppData({ quiet: true });
  }, 1200);
}

function scheduleProfileContactSave() {
  if (syncingFromCloud || !appRecordSyncEnabled) return;
  const adapter = getSupabaseAdapter();
  if (!currentUser || !adapter?.saveScopedRecord) return;
  window.clearTimeout(profileContactSaveTimer);
  profileContactSaveTimer = window.setTimeout(() => {
    saveProfileAndContacts({ quiet: true });
  }, 1600);
}

function scheduleOperationsSave() {
  if (syncingFromCloud || !appRecordSyncEnabled) return;
  const adapter = getSupabaseAdapter();
  if (!currentUser || !adapter?.saveScopedRecord) return;
  window.clearTimeout(operationsSaveTimer);
  operationsSaveTimer = window.setTimeout(() => {
    saveOperationalAppData({ quiet: true });
  }, 2000);
}

function scheduleLogBookSave() {
  if (syncingFromCloud || !appRecordSyncEnabled) return;
  const adapter = getSupabaseAdapter();
  if (!currentUser || !adapter?.saveScopedRecord) return;
  window.clearTimeout(logBookSaveTimer);
  logBookSaveTimer = window.setTimeout(() => {
    saveLogBookAppData({ quiet: true });
  }, 2400);
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

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function mergeById(existing, incoming) {
  const merged = new Map();
  [...asArray(existing), ...asArray(incoming)].forEach((item) => {
    if (!item || typeof item !== "object") return;
    const id = item.id || item.recordId || `${item.title || item.name || "item"}-${merged.size}`;
    merged.set(String(id), { ...item, id: String(id) });
  });
  return [...merged.values()];
}

function firstText(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

function mapRecipe(recipe) {
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .map((item) => [item.quantity, item.unit, item.name || item.item].filter(Boolean).join(" "))
        .filter(Boolean)
        .join(", ")
    : recipe.ingredients;
  const type = Array.isArray(recipe.mealTypes)
    ? recipe.mealTypes.join(", ")
    : firstText(recipe.type, recipe.category, recipe.mealType, recipe.section, "Recipe");
  return {
    id: String(recipe.id || `recipe-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title: firstText(recipe.title, recipe.name, "Untitled Recipe"),
    type,
    ingredients: firstText(ingredients, recipe.ingredientText, recipe.description),
    notes: firstText(recipe.notes, recipe.instructions, recipe.description, recipe.body),
    lastCooked: recipe.lastCooked || recipe.lastCookedDate || "",
    source: recipe.source || "Your Recipe",
    published: Boolean(recipe.published || recipe.isPublic),
  };
}

function mapTradingListing(listing) {
  return {
    id: String(listing.id || `listing-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    category: firstText(listing.category, listing.type, "Trading Post"),
    title: firstText(listing.title, listing.name, listing.itemName, "Untitled listing"),
    location: firstText(listing.location, listing.area, listing.pickupLocation, state.profile.area),
    price: firstText(listing.price, listing.priceLabel, listing.amount, "Contact seller"),
    detail: firstText(listing.detail, listing.description, listing.notes),
    saved: Boolean(listing.saved),
    seller: firstText(listing.sellerName, listing.seller, listing.homesteadName, listing.ownerName, "Homestead Seller"),
    phone: firstText(listing.phone, listing.sellerPhone),
    email: firstText(listing.email, listing.sellerEmail),
    photo: firstText(listing.photo, listing.photoUrl, listing.imageUrl, asArray(listing.photos)[0]),
  };
}

function mapNotebookEntry(note) {
  return {
    id: String(note.id || `notebook-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title: firstText(note.notebook, note.subject, note.title, "Homestead Goals"),
    path: firstText(note.category, note.path, "General"),
    body: firstText(note.body, note.note, note.notes, note.description),
    projectId: firstText(note.linkedWorkshopProjectId, note.projectId),
    source: note.source || "Notebook",
  };
}

function mapContact(contact) {
  return {
    id: String(contact.id || `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: firstText(contact.name, contact.title, "Saved Contact"),
    type: firstText(contact.type, contact.role, contact.category, "Contact"),
    detail: [contact.phone, contact.email, contact.location, contact.notes, contact.when].filter(Boolean).join(" · "),
  };
}

function mapAnimalRecord(record, fallbackSpecies = "Animal") {
  const notes = asArray(record.notes || record.records || record.entries || record.careLogs).map((note) => ({
    id: String(note.id || `note-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    type: firstText(note.type, note.recordType, note.category, "General"),
    body: firstText(note.body, note.details, note.notes, note.description, note.title),
    date: firstText(note.date, note.eventDate, note.createdAt, new Date().toISOString().slice(0, 10)).slice(0, 10),
  }));
  return {
    id: String(record.id || record.animalId || `animal-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: firstText(record.name, record.animalName, record.registeredName, record.callName, record.title, "Unnamed animal"),
    species: firstText(record.species, record.animalType, record.type, fallbackSpecies),
    tag: firstText(record.tag, record.tagNumber, record.identifier, record.registrationNumber),
    status: firstText(record.status, record.stage, record.condition, "Active"),
    contactId: "",
    photo: firstText(record.photo, record.photoUri, record.imageUrl, asArray(record.photos)[0]),
    notes,
    sales: asArray(record.sales || record.saleRecords).map((sale) => ({
      id: String(sale.id || `sale-${Date.now()}-${Math.random().toString(16).slice(2)}`),
      amount: firstText(sale.amount, sale.price, sale.total, sale.netTotal, "Sale"),
      date: firstText(sale.date, sale.saleDate, sale.createdAt, new Date().toISOString().slice(0, 10)).slice(0, 10),
    })),
  };
}

function mapWorkshopProject(project) {
  return {
    id: String(project.id || `project-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title: firstText(project.title, project.name, "Workshop Project"),
    status: /plan|finished|complete/i.test(project.status || project.mode || "") ? "Plan" : "Idea",
    category: firstText(project.categoryPath, project.category, "Workshop"),
    supplies: asArray(project.supplies || project.materials || project.rows).map((supply) => ({
      item: firstText(supply.item, supply.name, supply.material, "Supply"),
      quantity: firstText(supply.quantity, supply.qty, "1"),
      total: firstText(supply.total, supply.totalPrice, supply.cost, ""),
      detail: firstText(supply.detail, supply.notes, supply.source),
    })),
  };
}

function buildWebsiteStateFromAppRecords(records) {
  const next = {};
  const homesteadData = records["homestead:data"] || {};

  const recipes = mergeById(
    asArray(homesteadData.recipes).map(mapRecipe),
    asArray(records["homestead:recipe-book:recipes"]).map(mapRecipe),
  );
  if (recipes.length) next.recipes = mergeById(state.recipes, recipes);

  const listings = mergeById(
    asArray(homesteadData.tradingListings).map(mapTradingListing),
    asArray(records["homestead:trading-listings"]).map(mapTradingListing),
  );
  if (listings.length) next.listings = mergeById(state.listings, listings);

  const quickNotes = asArray(homesteadData.quickNotes).map(mapNotebookEntry);
  if (quickNotes.length) next.notebookEntries = mergeById(state.notebookEntries, quickNotes);

  const outpostListings = asArray(homesteadData.outpostListings).map((listing) => ({
    id: `pin-${listing.id || Date.now()}`,
    type: "Outpost",
    name: firstText(listing.title, listing.businessName, listing.name, "Outpost"),
    location: firstText(listing.location, listing.serviceArea, state.profile.area),
    detail: firstText(listing.description, listing.details, listing.notes),
    inventory: asArray(listing.services || listing.tags).map(String),
    seller: firstText(listing.businessName, listing.name, "Outpost"),
    saved: false,
  }));
  if (outpostListings.length) next.pins = mergeById(state.pins, outpostListings);

  const profile = records["homestead:profile"];
  if (profile && typeof profile === "object") {
    next.profile = {
      ...state.profile,
      displayName: firstText(profile.displayName, profile.name, profile.homesteadName, state.profile.displayName),
      area: firstText(profile.area, profile.location, profile.cityState, state.profile.area),
      tier: firstText(profile.tier, profile.subscriptionTier, state.profile.tier),
    };
  }

  const farmStand = records["draft:farm-stand"];
  if (farmStand && typeof farmStand === "object") {
    const stands = asArray(farmStand.farmStands).map((stand) => ({
      id: String(stand.id || `stand-${Date.now()}-${Math.random().toString(16).slice(2)}`),
      name: firstText(stand.name, stand.title, "Farm Stand"),
      location: firstText(stand.location, stand.address, state.profile.area),
      notes: firstText(stand.description, stand.notes, "Farm Stand profile"),
      items: asArray(farmStand.items)
        .filter((item) => !item.standId || item.standId === stand.id)
        .map((item) => ({
          id: String(item.id || `item-${Date.now()}-${Math.random().toString(16).slice(2)}`),
          name: firstText(item.name, item.title, "Inventory item"),
          category: firstText(item.category, item.type, "Inventory"),
          quantity: Number(item.quantity ?? item.qty ?? 0),
          lowAt: Number(item.lowAt ?? item.lowStockAt ?? 3),
          unit: firstText(item.unit, item.quantityUnit),
          price: firstText(item.price, item.priceLabel),
          date: firstText(item.date, item.bakedDate, item.harvestDate, item.expirationDate).slice(0, 10),
          description: firstText(item.description, item.notes),
        })),
    }));
    if (stands.length) {
      next.stands = mergeById(state.stands, stands);
      next.selectedStandId = stands[0].id;
    }
  }

  const choreStore = records["homestead:chore-list"];
  if (choreStore && typeof choreStore === "object") {
    const todos = asArray(choreStore.todos).map((todo) => ({
      id: String(todo.id || `todo-${Date.now()}`),
      text: firstText(todo.title, todo.text, todo.name, "To-Do"),
      category: firstText(todo.category, "General"),
      due: firstText(todo.due, todo.date, todo.todoDue).slice(0, 10),
      done: Boolean(todo.done || todo.completed),
    }));
    const chores = asArray(choreStore.chores).map((chore) => ({
      id: String(chore.id || `chore-${Date.now()}`),
      name: firstText(chore.title, chore.name, "Chore"),
      category: firstText(chore.category, "General"),
      frequency: firstText(chore.frequency, "Daily"),
      timeBlock: firstText(chore.timeBlock, asArray(chore.timeSlots)[0], "Daily"),
      done: Boolean(chore.done || chore.completed),
    }));
    if (todos.length) next.todos = mergeById(state.todos, todos);
    if (chores.length) next.chores = mergeById(state.chores, chores);
  }

  const contacts = asArray(records["homestead:emergency:contacts"]).map(mapContact);
  if (contacts.length) next.contacts = mergeById(state.contacts, contacts);

  const workshop = records["homestead:workshop-log"];
  const projects = asArray(workshop?.projects).map(mapWorkshopProject);
  if (projects.length) next.workshopProjects = mergeById(state.workshopProjects, projects);

  const livestock = asArray(records["homestead:log-book"]?.livestockLogs).map((record) => mapAnimalRecord(record));
  const animalLogs = asArray(records["homestead:animal-logs"]?.records).map((record) => mapAnimalRecord(record));
  const horses = asArray(records["homestead:horse-log"]?.horses).map((record) => mapAnimalRecord(record, "Horse"));
  const animals = mergeById(mergeById(livestock, animalLogs), horses);
  if (animals.length) next.animals = mergeById(state.animals, animals);

  const notificationPrefs = asArray(records["waystation:notification-preferences"]).map((pref) => ({
    id: String(pref.id || pref.feature || `notification-${Date.now()}`),
    title: firstText(pref.title, pref.feature, "Notification"),
    detail: firstText(pref.detail, pref.category, pref.species, "App notification preference"),
    enabled: Boolean(pref.enabled),
  }));
  if (notificationPrefs.length) next.notificationPrefs = mergeById(state.notificationPrefs, notificationPrefs);

  return next;
}

function mergePreservingExisting(existing, incoming) {
  const merged = new Map();
  asArray(existing).forEach((item) => {
    if (!item || typeof item !== "object") return;
    const id = String(item.id || item.recordId || `${item.title || item.name || "item"}-${merged.size}`);
    merged.set(id, { ...item, id });
  });
  asArray(incoming).forEach((item) => {
    if (!item || typeof item !== "object") return;
    const id = String(item.id || item.recordId || `${item.title || item.name || "item"}-${merged.size}`);
    merged.set(id, { ...(merged.get(id) || {}), ...item, id });
  });
  return [...merged.values()];
}

function websiteRecipeToApp(recipe) {
  const existingIngredientText = firstText(recipe.ingredientText, recipe.ingredients);
  return {
    id: String(recipe.id),
    title: firstText(recipe.title, "Untitled Recipe"),
    category: firstText(recipe.type, recipe.category, "Recipe"),
    type: firstText(recipe.type, recipe.category, "Recipe"),
    notes: firstText(recipe.notes),
    ingredientText: existingIngredientText,
    lastCooked: recipe.lastCooked || "",
    source: recipe.source || "Your Recipe",
    published: Boolean(recipe.published),
    updatedAt: new Date().toISOString(),
  };
}

function websiteNotebookToApp(note) {
  return {
    id: String(note.id),
    subject: firstText(note.title, "Notebook"),
    title: firstText(note.title, "Notebook"),
    category: firstText(note.path, "General"),
    body: firstText(note.body),
    linkedWorkshopProjectId: firstText(note.projectId),
    source: note.source || "Notebook",
    createdAt: note.createdAt || new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
  };
}

function websiteListingToApp(listing) {
  return {
    id: String(listing.id),
    title: firstText(listing.title, "Trading Post listing"),
    category: firstText(listing.category, "Trading Post"),
    description: firstText(listing.detail),
    detail: firstText(listing.detail),
    price: firstText(listing.price),
    location: firstText(listing.location, state.profile.area),
    sellerName: firstText(listing.seller, state.profile.displayName),
    phone: firstText(listing.phone),
    email: firstText(listing.email),
    photo: firstText(listing.photo),
    saved: Boolean(listing.saved),
    updatedAt: new Date().toISOString(),
  };
}

function websiteNotificationToApp(pref) {
  return {
    id: String(pref.id),
    feature: firstText(pref.feature, pref.id),
    title: firstText(pref.title, pref.feature, pref.id),
    detail: firstText(pref.detail),
    enabled: Boolean(pref.enabled),
    updatedAt: new Date().toISOString(),
  };
}

function websiteAlmanacToApp(event) {
  return {
    id: String(event.id),
    title: firstText(event.title, "Reminder"),
    date: firstText(event.date).slice(0, 10),
    source: firstText(event.source, "Website"),
    updatedAt: new Date().toISOString(),
  };
}

function websiteContactToApp(contact) {
  const role = firstText(contact.type, "Contact");
  const detail = firstText(contact.detail);
  const phoneMatch = detail.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return {
    id: String(contact.id),
    name: firstText(contact.name, "Saved Contact"),
    role,
    category: /vet|veterinary/i.test(role)
      ? "Veterinary Support"
      : /sitter|family|house/i.test(role)
        ? "Household & Family"
        : /haul|transport/i.test(role)
          ? "Hauling & Transport"
          : "Local Resources",
    status: "Primary",
    phone: phoneMatch?.[0] || "",
    notes: detail,
    when: "",
    updatedAt: new Date().toISOString(),
  };
}

function buildProfilePayload(existing = {}) {
  return {
    ...existing,
    displayName: firstText(state.profile.displayName, existing.displayName),
    name: firstText(state.profile.displayName, existing.name),
    homesteadName: firstText(state.profile.displayName, existing.homesteadName),
    area: firstText(state.profile.area, existing.area),
    location: firstText(state.profile.area, existing.location),
    tier: firstText(state.profile.tier, existing.tier),
    updatedAt: new Date().toISOString(),
  };
}

function buildCentralAppDataPayload(existing = {}) {
  return {
    ...existing,
    almanacEntries: mergePreservingExisting(existing.almanacEntries, state.almanacEvents.map(websiteAlmanacToApp)),
    tradingListings: mergePreservingExisting(existing.tradingListings, state.listings.map(websiteListingToApp)),
    recipes: mergePreservingExisting(existing.recipes, state.recipes.map(websiteRecipeToApp)),
    publicRecipes: asArray(existing.publicRecipes),
    notificationPreferences: mergePreservingExisting(
      existing.notificationPreferences,
      state.notificationPrefs.map(websiteNotificationToApp),
    ),
    quickNotes: mergePreservingExisting(existing.quickNotes, state.notebookEntries.map(websiteNotebookToApp)),
    outpostListings: asArray(existing.outpostListings),
  };
}

async function saveCentralAppData(options = {}) {
  const adapter = getSupabaseAdapter();
  if (!adapter?.loadScopedRecord || !adapter?.saveScopedRecord) {
    if (!options.quiet) notify("Supabase app record saving is not available in this website build.");
    return false;
  }
  try {
    const user = currentUser || (await refreshCurrentUser());
    if (!user) {
      if (!options.quiet) notify("Sign in before saving app records.");
      return false;
    }
    const existing = (await adapter.loadScopedRecord("homestead:data")) || {};
    const payload = buildCentralAppDataPayload(existing && typeof existing === "object" ? existing : {});
    await adapter.saveScopedRecord("homestead:data", payload);
    await adapter.saveScopedRecord("homestead:recipe-book:recipes", payload.recipes);
    await adapter.saveScopedRecord("homestead:trading-listings", payload.tradingListings);
    appRecordSyncEnabled = true;
    if (!options.quiet) notify("Section 1 app records saved.");
    return true;
  } catch {
    if (!options.quiet) notify("Section 1 app records could not be saved.");
    return false;
  }
}

async function saveProfileAndContacts(options = {}) {
  const adapter = getSupabaseAdapter();
  if (!adapter?.loadScopedRecord || !adapter?.saveScopedRecord) {
    if (!options.quiet) notify("Supabase profile/contact saving is not available in this website build.");
    return false;
  }
  try {
    const user = currentUser || (await refreshCurrentUser());
    if (!user) {
      if (!options.quiet) notify("Sign in before saving profile and contacts.");
      return false;
    }
    const existingProfile = (await adapter.loadScopedRecord("homestead:profile")) || {};
    const existingContacts = await adapter.loadScopedRecord("homestead:emergency:contacts");
    await adapter.saveScopedRecord(
      "homestead:profile",
      buildProfilePayload(existingProfile && typeof existingProfile === "object" ? existingProfile : {}),
    );
    await adapter.saveScopedRecord(
      "homestead:emergency:contacts",
      mergePreservingExisting(asArray(existingContacts), state.contacts.map(websiteContactToApp)),
    );
    appRecordSyncEnabled = true;
    if (!options.quiet) notify("Section 2 profile and contacts saved.");
    return true;
  } catch {
    if (!options.quiet) notify("Section 2 profile and contacts could not be saved.");
    return false;
  }
}

function websiteTodoToApp(todo) {
  return {
    id: String(todo.id),
    title: firstText(todo.text, todo.title, "To-Do"),
    text: firstText(todo.text, todo.title, "To-Do"),
    category: firstText(todo.category, "General"),
    due: firstText(todo.due).slice(0, 10),
    date: firstText(todo.due).slice(0, 10),
    done: Boolean(todo.done),
    updatedAt: new Date().toISOString(),
  };
}

function websiteChoreToApp(chore) {
  return {
    id: String(chore.id),
    title: firstText(chore.name, chore.title, "Chore"),
    name: firstText(chore.name, chore.title, "Chore"),
    category: firstText(chore.category, "General"),
    frequency: firstText(chore.frequency, "Daily"),
    timeBlock: firstText(chore.timeBlock, "Daily"),
    timeSlots: chore.timeBlock && chore.timeBlock !== "Daily" ? [chore.timeBlock] : [],
    done: Boolean(chore.done),
    updatedAt: new Date().toISOString(),
  };
}

function buildChoreListPayload(existing = {}) {
  return {
    ...existing,
    activeList: existing.activeList || "chores",
    chores: mergePreservingExisting(existing.chores, state.chores.map(websiteChoreToApp)),
    todos: mergePreservingExisting(existing.todos, state.todos.map(websiteTodoToApp)),
    sortTodosByDate: Boolean(existing.sortTodosByDate),
    lastResetDate: existing.lastResetDate || "",
  };
}

function websiteStandToApp(stand) {
  return {
    id: String(stand.id),
    name: firstText(stand.name, "Farm Stand"),
    title: firstText(stand.name, "Farm Stand"),
    location: firstText(stand.location, state.profile.area),
    address: firstText(stand.location, state.profile.area),
    description: firstText(stand.notes),
    notes: firstText(stand.notes),
    updatedAt: new Date().toISOString(),
  };
}

function websiteFarmStandItemToApp(item, stand) {
  return {
    id: String(item.id),
    standId: String(stand.id),
    name: firstText(item.name, "Inventory item"),
    title: firstText(item.name, "Inventory item"),
    category: firstText(item.category, "Inventory"),
    type: firstText(item.category, "Inventory"),
    quantity: Number(item.quantity || 0),
    qty: Number(item.quantity || 0),
    lowAt: Number(item.lowAt || 0),
    lowStockAt: Number(item.lowAt || 0),
    unit: firstText(item.unit),
    price: firstText(item.price),
    date: firstText(item.date).slice(0, 10),
    description: firstText(item.description),
    notes: firstText(item.description),
    updatedAt: new Date().toISOString(),
  };
}

function buildFarmStandPayload(existing = {}) {
  const farmStands = state.stands.map(websiteStandToApp);
  const items = state.stands.flatMap((stand) => asArray(stand.items).map((item) => websiteFarmStandItemToApp(item, stand)));
  return {
    ...existing,
    farmStands: mergePreservingExisting(existing.farmStands, farmStands),
    items: mergePreservingExisting(existing.items, items),
    sales: asArray(existing.sales),
    activeStandId: state.selectedStandId || existing.activeStandId || farmStands[0]?.id || "",
    showContactDetails: Boolean(existing.showContactDetails),
    showInventoryForm: Boolean(existing.showInventoryForm),
    showInventoryList: existing.showInventoryList !== false,
    email: existing.email || "",
    phone: existing.phone || "",
    website: existing.website || "",
  };
}

function websiteWorkshopToApp(project) {
  return {
    id: String(project.id),
    title: firstText(project.title, "Workshop Project"),
    name: firstText(project.title, "Workshop Project"),
    status: firstText(project.status, "Idea"),
    mode: firstText(project.status, "Idea"),
    category: firstText(project.category, "Workshop"),
    categoryPath: firstText(project.category, "Workshop"),
    supplies: asArray(project.supplies).map((supply, index) => ({
      id: String(supply.id || `${project.id}-supply-${index}`),
      item: firstText(supply.item, "Supply"),
      name: firstText(supply.item, "Supply"),
      quantity: firstText(supply.quantity, "1"),
      total: firstText(supply.total),
      totalPrice: firstText(supply.total),
      detail: firstText(supply.detail),
      notes: firstText(supply.detail),
    })),
    updatedAt: new Date().toISOString(),
  };
}

function buildWorkshopPayload(existing = {}) {
  return {
    ...existing,
    projects: mergePreservingExisting(existing.projects, state.workshopProjects.map(websiteWorkshopToApp)),
  };
}

async function saveOperationalAppData(options = {}) {
  const adapter = getSupabaseAdapter();
  if (!adapter?.loadScopedRecord || !adapter?.saveScopedRecord) {
    if (!options.quiet) notify("Supabase operational record saving is not available in this website build.");
    return false;
  }
  try {
    const user = currentUser || (await refreshCurrentUser());
    if (!user) {
      if (!options.quiet) notify("Sign in before saving operational app records.");
      return false;
    }
    const [existingChores, existingFarmStand, existingWorkshop] = await Promise.all([
      adapter.loadScopedRecord("homestead:chore-list"),
      adapter.loadScopedRecord("draft:farm-stand"),
      adapter.loadScopedRecord("homestead:workshop-log"),
    ]);
    await Promise.all([
      adapter.saveScopedRecord(
        "homestead:chore-list",
        buildChoreListPayload(existingChores && typeof existingChores === "object" ? existingChores : {}),
      ),
      adapter.saveScopedRecord(
        "draft:farm-stand",
        buildFarmStandPayload(existingFarmStand && typeof existingFarmStand === "object" ? existingFarmStand : {}),
      ),
      adapter.saveScopedRecord(
        "homestead:workshop-log",
        buildWorkshopPayload(existingWorkshop && typeof existingWorkshop === "object" ? existingWorkshop : {}),
      ),
    ]);
    appRecordSyncEnabled = true;
    if (!options.quiet) notify("Section 3 operational records saved.");
    return true;
  } catch {
    if (!options.quiet) notify("Section 3 operational records could not be saved.");
    return false;
  }
}

function websiteAnimalNotesToApp(animal) {
  return asArray(animal.notes).map((note) => ({
    id: String(note.id || `${animal.id}-note-${Date.now()}`),
    type: firstText(note.type, "General"),
    recordType: firstText(note.type, "General"),
    body: firstText(note.body),
    details: firstText(note.body),
    notes: firstText(note.body),
    date: firstText(note.date, new Date().toISOString().slice(0, 10)).slice(0, 10),
    createdAt: firstText(note.date, new Date().toISOString()),
  }));
}

function websiteAnimalToLivestockLog(animal) {
  const notes = websiteAnimalNotesToApp(animal);
  return {
    id: String(animal.id),
    animalId: String(animal.id),
    animalName: firstText(animal.name, "Unnamed animal"),
    name: firstText(animal.name, "Unnamed animal"),
    species: firstText(animal.species, "Animal"),
    animalType: firstText(animal.species, "Animal"),
    tagNumber: firstText(animal.tag),
    tag: firstText(animal.tag),
    status: firstText(animal.status, "Active"),
    photo: firstText(animal.photo),
    photos: animal.photo ? [animal.photo] : [],
    records: notes,
    notes,
    sales: asArray(animal.sales),
    updatedAt: new Date().toISOString(),
  };
}

function websiteAnimalToAnimalRecord(animal) {
  return {
    ...websiteAnimalToLivestockLog(animal),
    title: firstText(animal.name, "Unnamed animal"),
    type: firstText(animal.species, "Animal"),
  };
}

function websiteAnimalToHorseProfile(animal) {
  return {
    id: String(animal.id),
    name: firstText(animal.name, "Unnamed horse"),
    registeredName: firstText(animal.name, "Unnamed horse"),
    callName: firstText(animal.name, "Unnamed horse"),
    status: firstText(animal.status, "Active"),
    tag: firstText(animal.tag),
    registrationNumber: firstText(animal.tag),
    photo: firstText(animal.photo),
    photoUri: firstText(animal.photo),
    notes: websiteAnimalNotesToApp(animal),
    records: websiteAnimalNotesToApp(animal),
    updatedAt: new Date().toISOString(),
  };
}

function buildLivestockLogPayload(existing = {}) {
  return {
    ...existing,
    livestockLogs: mergePreservingExisting(
      existing.livestockLogs,
      state.animals.map(websiteAnimalToLivestockLog),
    ),
  };
}

function buildAnimalLogsPayload(existing = {}) {
  return {
    ...existing,
    records: mergePreservingExisting(existing.records, state.animals.map(websiteAnimalToAnimalRecord)),
  };
}

function buildHorseLogPayload(existing = {}) {
  const horses = state.animals
    .filter((animal) => /horse/i.test(animal.species || ""))
    .map(websiteAnimalToHorseProfile);
  return {
    ...existing,
    horses: mergePreservingExisting(existing.horses, horses),
  };
}

async function saveLogBookAppData(options = {}) {
  const adapter = getSupabaseAdapter();
  if (!adapter?.loadScopedRecord || !adapter?.saveScopedRecord) {
    if (!options.quiet) notify("Supabase Log Book saving is not available in this website build.");
    return false;
  }
  try {
    const user = currentUser || (await refreshCurrentUser());
    if (!user) {
      if (!options.quiet) notify("Sign in before saving Log Book app records.");
      return false;
    }
    const [existingLivestock, existingAnimalLogs, existingHorseLog] = await Promise.all([
      adapter.loadScopedRecord("homestead:log-book"),
      adapter.loadScopedRecord("homestead:animal-logs"),
      adapter.loadScopedRecord("homestead:horse-log"),
    ]);
    await Promise.all([
      adapter.saveScopedRecord(
        "homestead:log-book",
        buildLivestockLogPayload(existingLivestock && typeof existingLivestock === "object" ? existingLivestock : {}),
      ),
      adapter.saveScopedRecord(
        "homestead:animal-logs",
        buildAnimalLogsPayload(existingAnimalLogs && typeof existingAnimalLogs === "object" ? existingAnimalLogs : {}),
      ),
      adapter.saveScopedRecord(
        "homestead:horse-log",
        buildHorseLogPayload(existingHorseLog && typeof existingHorseLog === "object" ? existingHorseLog : {}),
      ),
    ]);
    appRecordSyncEnabled = true;
    if (!options.quiet) notify("Section 4 Log Book records saved.");
    return true;
  } catch {
    if (!options.quiet) notify("Section 4 Log Book records could not be saved.");
    return false;
  }
}

async function loadAppRecordsIntoWebsite() {
  const adapter = getSupabaseAdapter();
  if (!adapter?.loadAppRecords) {
    notify("Supabase app record loading is not available in this website build.");
    return;
  }
  try {
    const user = currentUser || (await refreshCurrentUser());
    if (!user) {
      notify("Sign in before loading app records.");
      return;
    }
    const records = await adapter.loadAppRecords();
    const recordCount = Object.keys(records).length;
    if (!recordCount) {
      notify("No app records found for this account yet.");
      renderAppRecordSummary(records);
      return;
    }
    syncingFromCloud = true;
    state = normalizeState({ ...state, ...buildWebsiteStateFromAppRecords(records) });
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    appRecordSyncEnabled = true;
    renderAll();
    renderAppRecordSummary(records);
    notify(`Loaded ${recordCount} app record groups.`);
    syncingFromCloud = false;
    await saveCloudState({ quiet: true });
  } catch (error) {
    syncingFromCloud = false;
    notify("App records could not be loaded. Check sign-in and Supabase access.");
  }
}

function renderAppRecordSummary(records = null) {
  const target = $("#appRecordSummary");
  if (!target) return;
  if (!records) {
    target.innerHTML = Object.entries(appRecordLabels)
      .map(([key, label]) => `<li><span>${e(label)}</span><em>${e(key)}</em></li>`)
      .join("");
    return;
  }
  target.innerHTML = Object.entries(appRecordLabels)
    .map(([key, label]) => {
      const hasRecord = Object.prototype.hasOwnProperty.call(records, key);
      return `<li class="${hasRecord ? "synced" : ""}"><span>${e(label)}</span><em>${hasRecord ? "Found" : "No record yet"}</em></li>`;
    })
    .join("");
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

function inventoryCategoryOptions(selected = "Produce") {
  return ["Baked Goods", "Eggs", "Flowers", "Honey", "Livestock", "Meat", "Milk", "Produce", "Seedlings", "Supplies"]
    .map((category) => `<option${category === selected ? " selected" : ""}>${e(category)}</option>`)
    .join("");
}

function openInventoryEditor(itemId) {
  const stand = state.stands.find((item) => item.id === state.selectedStandId);
  const item = stand?.items.find((entry) => entry.id === itemId);
  if (!stand || !item) return;
  $("#editItemId").value = item.id;
  $("#editItemName").value = item.name || "";
  $("#editItemCategory").value = item.category || "Produce";
  $("#editItemQty").value = item.quantity ?? 0;
  $("#editItemLow").value = item.lowAt ?? 0;
  $("#editItemUnit").value = item.unit || "";
  $("#editItemPrice").value = item.price || "";
  $("#editItemDate").value = item.date || "";
  $("#editItemDescription").value = item.description || "";
  $("#inventoryDialog")?.showModal();
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

function messageStatus(message) {
  if (message.status === "Completed" || message.completed) return "Completed";
  if (message.status === "In Progress") return "In Progress";
  return "Received";
}

function setMessageStatus(messageId, status) {
  state.messages = state.messages.map((message) =>
    message.id === messageId
      ? { ...message, status, unread: status === "Completed" ? false : message.unread }
      : message,
  );
  saveState();
  renderMessages();
  notify(status === "Completed" ? "Message moved to Completed." : "Message updated.");
}

function openMessageReader(messageId) {
  const message = state.messages.find((item) => item.id === messageId);
  if (!message) return;
  state.messages = state.messages.map((item) => (item.id === messageId ? { ...item, unread: false } : item));
  saveState();
  const title = $("#messageReadTitle");
  const body = $("#messageReadBody");
  const meta = $("#messageReadMeta");
  const photos = $("#messageReadPhotos");
  if (title) title.textContent = message.subject || "Message";
  if (meta) {
    meta.textContent = `${messageStatus(message)} · ${message.category || "General"} · ${formatDate(message.createdAt)}`;
  }
  if (body) body.textContent = message.body || "";
  if (photos) {
    const allPhotos = Array.isArray(message.photos) ? message.photos : message.photo ? [message.photo] : [];
    photos.innerHTML = allPhotos
      .map((photo) => `<img class="message-photo large-photo" src="${e(photo)}" alt="Attached message preview" />`)
      .join("");
  }
  const progress = $("#readerInProgress");
  const complete = $("#readerComplete");
  if (progress) progress.dataset.messageStatusId = message.id;
  if (complete) complete.dataset.messageStatusId = message.id;
  $("#messageReadDialog")?.showModal();
  renderMessages();
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
  const grouped = state.todos.reduce((groups, todo) => {
    const category = todo.category || "General";
    groups[category] = groups[category] || [];
    groups[category].push(todo);
    return groups;
  }, {});
  list.innerHTML = Object.entries(grouped)
    .map(
      ([category, todos]) => `
        <details class="group-panel" open>
          <summary>${e(category)}</summary>
          ${todos
            .map(
              (todo) => `
                <button class="list-row ${todo.done ? "done" : ""}" type="button" data-toggle-todo="${todo.id}">
                  <span>${todo.done ? "✓" : "○"}</span>
                  <strong>${e(todo.text)}</strong>
                  <em>${todo.due ? formatShortDate(todo.due) : "No due date"}</em>
                </button>
              `,
            )
            .join("")}
        </details>
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
  const grouped = state.chores.reduce((groups, chore) => {
    const group = `${chore.category || "General"} · ${chore.timeBlock || "Daily"}`;
    groups[group] = groups[group] || [];
    groups[group].push(chore);
    return groups;
  }, {});
  list.innerHTML = Object.entries(grouped)
    .map(
      ([group, chores]) => `
        <details class="group-panel" open>
          <summary>${e(group)}</summary>
          ${chores
            .map(
              (chore) => `
                <button class="list-row ${chore.done ? "done" : ""}" type="button" data-toggle-chore="${chore.id}">
                  <span>${chore.done ? "✓" : "○"}</span>
                  <strong>${e(chore.name)}</strong>
                  <em>${e(chore.frequency)}</em>
                </button>
              `,
            )
            .join("")}
        </details>
      `,
    )
    .join("");
}

function renderSupplyRuns() {
  const list = $("#supplyRunList");
  const count = $("#supplyRunCount");
  const placeSelect = $("#supplyPlace");
  const placeButtons = $("#preferredPlaceButtons");
  if (!list) return;
  if (count) count.textContent = String(state.supplyRuns.length);
  if (placeSelect) {
    placeSelect.innerHTML = state.preferredPlaces.map((place) => `<option>${e(place)}</option>`).join("");
  }
  if (placeButtons) {
    placeButtons.innerHTML = state.preferredPlaces
      .map((place) => `<button class="button compact secondary" type="button" data-preferred-place="${e(place)}">${e(place)}</button>`)
      .join("");
  }
  list.innerHTML = state.supplyRuns
    .map(
      (run) => `
        <article class="list-row supply-row-preview">
          <span>□</span>
          <strong>${e(run.item)}</strong>
          <em>${e(run.category)} · ${e(run.quantity)} ${e(run.unit)} · ${e(run.preferredPlace)}</em>
        </article>
      `,
    )
    .join("");
}

const quickAccessOptions = [
  ["almanac", "Almanac"],
  ["alerts", "Weather & Alerts"],
  ["farm-stand", "Farm Stand"],
  ["emergency-plan", "Emergency Plan"],
  ["post-box", "Post Box"],
  ["log-book", "Log Book"],
  ["field-guide", "Field Guide"],
  ["workshop", "Workshop"],
  ["recipe-book", "Recipe Book"],
  ["notebook", "Notebook & Contacts"],
  ["porch-light", "Porch Light Map"],
  ["trading-post", "Trading Post"],
  ["outpost", "Outpost"],
  ["front-porch", "Front Porch"],
  ["notifications", "Notifications"],
];

function renderQuickAccess() {
  const menu = $("#quickAccessMenu");
  if (!menu) return;
  const slots = [...state.quickAccess].slice(0, 4);
  while (slots.length < 4) slots.push("");
  menu.innerHTML = slots
    .map((tab, index) => {
      const option = quickAccessOptions.find(([id]) => id === tab);
      return `
        <div class="quick-slot">
          <button type="button" data-menu-tab="${e(tab || "almanac")}">${e(option?.[1] || "Empty")}</button>
          <select data-quick-slot="${index}" aria-label="Choose quick access ${index + 1}">
            <option value="">Empty</option>
            ${quickAccessOptions
              .map(([id, label]) => `<option value="${e(id)}"${id === tab ? " selected" : ""}>${e(label)}</option>`)
              .join("")}
          </select>
        </div>
      `;
    })
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
                    <select id="itemCategory" aria-label="Inventory category">
                      ${inventoryCategoryOptions()}
                    </select>
                    <input id="itemQty" type="number" min="0" placeholder="Qty" required />
                    <input id="itemUnit" type="text" placeholder="Unit" />
                    <input id="itemPrice" type="text" placeholder="Price" />
                    <input id="itemDate" type="date" aria-label="Baked, harvested, or packed date" />
                    <input id="itemDescription" type="text" placeholder="Description" />
                    <button class="button compact" type="submit">Add</button>
                  </form>
                  <div class="inventory-list">
                    ${stand.items
                      .map(
                        (item) => `
                          <div class="inventory-row ${Number(item.quantity) <= Number(item.lowAt) ? "low" : ""}">
                            <button class="inventory-edit-button" type="button" data-edit-item="${item.id}">
                              <strong>${e(item.name)}</strong>
                              <em>${e(item.category || "Inventory")} · ${e(item.price || "No price")} ${item.date ? `· ${formatShortDate(item.date)}` : ""}</em>
                              ${item.description ? `<small>${e(item.description)}</small>` : ""}
                            </button>
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

  const unread = state.messages.some((message) => message.unread && messageStatus(message) !== "Completed");
  indicator.classList.toggle("visible", unread);
  if (openCount) openCount.textContent = String(state.messages.filter((message) => messageStatus(message) !== "Completed").length);
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

  const renderMessageCard = (message) => {
    const status = messageStatus(message);
    const preview = firstText(message.body).slice(0, 140);
    return `
      <article class="message-card ${message.unread ? "unread" : ""}">
        <button class="message-card-main" type="button" data-open-message="${e(message.id)}">
          <div class="message-meta">
            <span>${e(status)}</span>
            <span>${e(message.category)}</span>
            <span>${formatDate(message.createdAt)}</span>
          </div>
          <h3>${e(message.subject)}</h3>
          ${message.recipientName ? `<p class="seller-line">To: ${e(message.recipientName)}</p>` : ""}
          <p>${e(preview)}${message.body && message.body.length > preview.length ? "..." : ""}</p>
        </button>
        <div class="message-actions">
          <button class="button compact secondary" type="button" data-message-status-id="${e(message.id)}" data-message-status="In Progress">In Progress</button>
          <button class="button compact secondary" type="button" data-message-status-id="${e(message.id)}" data-message-status="Completed">Completed</button>
          <button class="button compact secondary" type="button" data-read-message="${e(message.id)}">
            ${message.unread ? "Mark Read" : "Mark Unread"}
          </button>
        </div>
      </article>
    `;
  };
  const activeMessages = messages.filter((message) => messageStatus(message) !== "Completed");
  const completedMessages = messages.filter((message) => messageStatus(message) === "Completed");
  const grouped = activeMessages.reduce((groups, message) => {
    const categoryName = message.category || "General";
    groups[categoryName] = groups[categoryName] || [];
    groups[categoryName].push(message);
    return groups;
  }, {});
  const activeMarkup =
    Object.entries(grouped)
      .map(
        ([categoryName, groupMessages]) => `
          <details class="group-panel message-group" open>
            <summary>${e(categoryName)} <span>${groupMessages.length}</span></summary>
            ${groupMessages.map(renderMessageCard).join("")}
          </details>
        `,
      )
      .join("") || `<p class="muted">No active messages match these filters.</p>`;
  const completedMarkup = completedMessages.length
    ? `
      <details class="group-panel message-group completed-group">
        <summary>Completed <span>${completedMessages.length}</span></summary>
        ${completedMessages.map(renderMessageCard).join("")}
      </details>
    `
    : "";
  list.innerHTML = `${activeMarkup}${completedMarkup}`;
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
          <strong>${e(person.name)}<small>${e(person.detail || person.role)}</small></strong>
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
  const workspace = $("#desktopRecordWorkspace");
  if (!board || !areas) return;
  const filter = $("#animalSpeciesFilter")?.value || "all";
  const animals = filter === "all" ? state.animals : state.animals.filter((animal) => animal.species === filter);
  const selectedAnimal = animals[0] || state.animals[0];

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
          ${animal.photo ? `<img class="listing-photo animal-photo" src="${e(animal.photo)}" alt="" />` : ""}
          <p class="stand-location">${e(animal.tag || "No tag")}</p>
          ${contact ? `<p class="seller-line">Contact: ${e(contact.name)} (${e(contact.type)})</p>` : ""}
          <p>${lastNote ? e(lastNote.body) : "No notes yet."}</p>
          ${
            animal.sales?.length
              ? `<p class="seller-line">Sales: ${animal.sales.map((sale) => `${e(sale.amount)} on ${formatShortDate(sale.date)}`).join(", ")}</p>`
              : ""
          }
          <div class="button-row">
            <button class="button compact secondary" type="button" data-log-sale="${animal.id}">Sales</button>
            <button class="button compact secondary" type="button" data-open-message-contact="contact-${e(animal.contactId || "")}">Contact</button>
          </div>
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

  if (workspace) {
    if (!selectedAnimal) {
      workspace.innerHTML = `<p class="muted">No animal records loaded yet. Add an animal or load app records from Account.</p>`;
    } else {
      const contact = state.contacts.find((item) => item.id === selectedAnimal.contactId);
      workspace.innerHTML = `
        <div class="panel-title-row">
          <div>
            <div class="eyebrow">Desktop Record Workspace</div>
            <h3>${e(selectedAnimal.name)}</h3>
          </div>
          <span class="count-pill">${e(selectedAnimal.species)}</span>
        </div>
        <div class="record-workspace-grid">
          <div>
            <strong>Profile</strong>
            <span>${e(selectedAnimal.tag || "No tag")} · ${e(selectedAnimal.status || "Active")}</span>
            ${contact ? `<span>${e(contact.name)} · ${e(contact.type)}</span>` : `<span>No contact linked yet</span>`}
          </div>
          <div>
            <strong>Recent records</strong>
            ${asArray(selectedAnimal.notes)
              .slice(0, 4)
              .map((note) => `<span>${formatShortDate(note.date)} · ${e(note.type)} · ${e(note.body)}</span>`)
              .join("") || "<span>No records yet</span>"}
          </div>
          <div>
            <strong>Sales</strong>
            ${asArray(selectedAnimal.sales)
              .slice(0, 3)
              .map((sale) => `<span>${formatShortDate(sale.date)} · ${e(sale.amount)}</span>`)
              .join("") || "<span>No sales yet</span>"}
          </div>
        </div>
        <form class="inline-form note-form desktop-note-form" data-animal-note="${e(selectedAnimal.id)}">
          <select name="type">
            <option>Health</option>
            <option>Medication</option>
            <option>Breeding</option>
            <option>Feed</option>
            <option>Training</option>
            <option>Production</option>
            <option>General</option>
          </select>
          <input name="body" type="text" placeholder="Add a detailed desktop note" required />
          <button class="button compact" type="submit">Save Record</button>
        </form>
      `;
    }
  }
}

function renderFieldGuide() {
  const list = $("#fieldGuideList");
  if (!list) return;
  const filter = $("#fieldGuideFilter")?.value || "all";
  const entries =
    filter === "all"
      ? state.fieldGuideEntries
      : state.fieldGuideEntries.filter((entry) => entry.section === filter);
  list.innerHTML = entries
    .map(
      (entry) => `
        <article class="guide-card">
          <div class="message-meta">
            <span>${e(entry.section)}</span>
            <span>${e(entry.path)}</span>
          </div>
          <h3>${e(entry.title)}</h3>
          <p>${e(entry.sentence)}</p>
          <button class="button compact secondary" type="button" data-guide-note="${entry.id}">Use This Sentence</button>
        </article>
      `,
    )
    .join("");
}

function renderWorkshop() {
  const ideas = $("#workshopIdeas");
  const plans = $("#workshopPlans");
  const ideaCount = $("#workshopIdeaCount");
  const planCount = $("#workshopPlanCount");
  if (!ideas || !plans) return;
  const ideaProjects = state.workshopProjects.filter((project) => project.status !== "Plan");
  const planProjects = state.workshopProjects.filter((project) => project.status === "Plan");
  if (ideaCount) ideaCount.textContent = String(ideaProjects.length);
  if (planCount) planCount.textContent = String(planProjects.length);
  const renderProject = (project) => `
    <article class="workshop-project">
      <div class="message-meta">
        <span>${e(project.category || "Workshop")}</span>
        <span>${e(project.status)}</span>
      </div>
      <h3>${e(project.title)}</h3>
      <details>
        <summary>Supplies</summary>
        <div class="supply-list">
          ${(project.supplies || [])
            .map(
              (supply) => `
                <details class="supply-row">
                  <summary>
                    <strong>${e(supply.item)}</strong>
                    <span>${e(supply.quantity)} · ${e(supply.total)}</span>
                  </summary>
                  <p>${e(supply.detail || "No extra details yet.")}</p>
                </details>
              `,
            )
            .join("")}
        </div>
      </details>
      ${
        project.status !== "Plan"
          ? `<button class="button compact secondary" type="button" data-finish-project="${project.id}">Finished</button>`
          : `<button class="button compact secondary" type="button" data-copy-project="${project.id}">Duplicate Plan</button>`
      }
    </article>
  `;
  ideas.innerHTML = ideaProjects.map(renderProject).join("");
  plans.innerHTML = planProjects.map(renderProject).join("");
}

function renderNotifications() {
  const list = $("#notificationList");
  const count = $("#notificationCount");
  if (!list) return;
  const enabled = state.notificationPrefs.filter((pref) => pref.enabled).length;
  if (count) count.textContent = `${enabled} on`;
  list.innerHTML = state.notificationPrefs
    .map(
      (pref) => `
        <article class="notification-card">
          <div>
            <strong>${e(pref.title)}</strong>
            <span>${e(pref.detail)}</span>
          </div>
          <button class="toggle-button ${pref.enabled ? "on" : ""}" type="button" data-toggle-notification="${pref.id}" aria-pressed="${pref.enabled}">
            ${pref.enabled ? "On" : "Off"}
          </button>
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
          ${recipe.lastCooked ? `<p class="seller-line">Last cooked: ${formatShortDate(recipe.lastCooked)}</p>` : ""}
          <p>${e(recipe.notes)}</p>
          <div class="reaction-row" aria-label="Public recipe actions">
            <button type="button" data-toggle-recipe-like="${recipe.id}">${recipe.liked ? "♥ Liked" : "♡ Like"}</button>
            <button type="button" data-save-neighbor-recipe="${recipe.id}">☆ Save</button>
            <button type="button" data-duplicate-recipe="${recipe.id}">Duplicate</button>
            ${recipe.published ? "<span>Published</span>" : ""}
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
          <div class="notebook-tree">
            ${renderNotebookTree(entries)}
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

function renderNotebookTree(entries) {
  const paths = entries.map((entry) => entry.path || "General");
  const roots = {};
  paths.forEach((path) => {
    let node = roots;
    path
      .split(">")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        node[part] = node[part] || {};
        node = node[part];
      });
  });
  const renderBranch = (branch) =>
    Object.entries(branch)
      .map(([name, children]) => {
        const childMarkup = renderBranch(children);
        return `<li><span>${e(name)}</span>${childMarkup ? `<ul>${childMarkup}</ul>` : ""}</li>`;
      })
      .join("");
  return `<ul>${renderBranch(roots)}</ul>`;
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
  renderSupplyRuns();
  renderQuickAccess();
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
  renderFieldGuide();
  renderWorkshop();
  renderNotifications();
  renderRecipes();
  renderNotebook();
  renderProfile();
  renderConnectionStatus();
  renderAppRecordSummary();
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

  if (target.dataset.openMessage) {
    openMessageReader(target.dataset.openMessage);
  }

  if (target.id === "closeMessageReadDialog") {
    $("#messageReadDialog")?.close();
  }

  if (target.dataset.messageStatusId && target.dataset.messageStatus) {
    setMessageStatus(target.dataset.messageStatusId, target.dataset.messageStatus);
    if (target.id === "readerComplete") $("#messageReadDialog")?.close();
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

  if (target.dataset.preferredPlace) {
    const select = $("#supplyPlace");
    if (select) select.value = target.dataset.preferredPlace;
    notify(`Preferred place set to ${target.dataset.preferredPlace}.`);
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

  if (target.dataset.editItem) {
    openInventoryEditor(target.dataset.editItem);
  }

  if (target.id === "closeInventoryDialog") {
    $("#inventoryDialog")?.close();
  }

  if (target.id === "deleteInventoryItem") {
    const itemId = $("#editItemId")?.value;
    if (!itemId || !window.confirm("Delete this inventory item?")) return;
    state.stands = state.stands.map((stand) =>
      stand.id === state.selectedStandId
        ? { ...stand, items: stand.items.filter((item) => item.id !== itemId) }
        : stand,
    );
    $("#inventoryDialog")?.close();
    saveState();
    renderAll();
    notify("Inventory item deleted.");
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
    if (!window.confirm("Are you sure you want to delete this? Choose OK to Trash Recipe or Cancel to Keep Recipe.")) return;
    state.recipes = state.recipes.filter((recipe) => recipe.id !== target.dataset.deleteRecipe);
    saveState();
    renderRecipes();
    notify("Recipe removed.");
  }

  if (target.dataset.duplicateRecipe) {
    const recipe = state.recipes.find((item) => item.id === target.dataset.duplicateRecipe);
    if (!recipe) return;
    state.recipes.unshift({
      ...recipe,
      id: `recipe-${Date.now()}`,
      title: `${recipe.title} Copy`,
      source: "Your Recipe",
      published: false,
    });
    saveState();
    renderRecipes();
    notify("Recipe duplicated.");
  }

  if (target.dataset.saveNeighborRecipe) {
    const recipe = state.recipes.find((item) => item.id === target.dataset.saveNeighborRecipe);
    if (!recipe) return;
    state.recipes.unshift({
      ...recipe,
      id: `recipe-${Date.now()}`,
      source: "Neighbor's Recipe",
      saved: true,
      published: false,
    });
    saveState();
    renderRecipes();
    notify("Saved to Neighbor's Recipe.");
  }

  if (target.dataset.toggleRecipeLike) {
    state.recipes = state.recipes.map((recipe) =>
      recipe.id === target.dataset.toggleRecipeLike ? { ...recipe, liked: !recipe.liked } : recipe,
    );
    saveState();
    renderRecipes();
  }

  if (target.dataset.logSale) {
    const animal = state.animals.find((item) => item.id === target.dataset.logSale);
    if (!animal) return;
    const amount = window.prompt(`Sale amount for ${animal.name}`, "$");
    if (!amount?.trim()) return;
    animal.sales = [
      { id: `sale-${Date.now()}`, amount: amount.trim(), date: new Date().toISOString().slice(0, 10) },
      ...(animal.sales || []),
    ];
    saveState();
    renderAnimals();
    notify("Livestock sale saved.");
  }

  if (target.id === "insertChecklistNote") {
    const body = $("#notebookBody");
    if (body) body.value = `${body.value}${body.value ? "\n" : ""}[ ] Checklist item`;
    body?.focus();
  }

  if (target.id === "insertBulletNote") {
    const body = $("#notebookBody");
    if (body) body.value = `${body.value}${body.value ? "\n" : ""}- Bullet point\n  - Sub bullet`;
    body?.focus();
  }

  if (target.id === "createWorkshopProjectFromNote") {
    const title = $("#notebookTitle")?.value.trim() || "Notebook Project";
    const project = { id: `project-${Date.now()}`, title, status: "Idea" };
    state.workshopProjects.unshift(project);
    const select = $("#notebookProject");
    saveState();
    renderNotebook();
    if (select) select.value = project.id;
    notify("Workshop project created and linked.");
  }

  if (target.dataset.guideNote) {
    const entry = state.fieldGuideEntries.find((item) => item.id === target.dataset.guideNote);
    if (!entry) return;
    $("#fieldGuidePath").value = entry.path;
    $("#fieldGuideSelection").value = entry.sentence;
    notify("Sentence ready to save to Notebook.");
  }

  if (target.id === "saveFieldGuideNote") {
    const body = $("#fieldGuideSelection")?.value.trim();
    if (!body) {
      notify("Choose or type the sentence you want to save.");
      return;
    }
    state.notebookEntries.unshift({
      id: `notebook-${Date.now()}`,
      title: "Homestead Goals",
      path: $("#fieldGuidePath")?.value.trim() || "Field Guide",
      body,
      projectId: "",
      source: "Field Guide",
    });
    $("#fieldGuideSelection").value = "";
    saveState();
    renderAll();
    notify("Field Guide note saved to Notebook.");
  }

  if (target.id === "addWorkshopProject") {
    const title = window.prompt("Project title", "New Workshop Project");
    if (!title?.trim()) return;
    state.workshopProjects.unshift({
      id: `project-${Date.now()}`,
      title: title.trim(),
      status: "Idea",
      category: "Workshop",
      supplies: [],
    });
    saveState();
    renderAll();
    notify("Workshop project created.");
  }

  if (target.dataset.finishProject) {
    state.workshopProjects = state.workshopProjects.map((project) =>
      project.id === target.dataset.finishProject ? { ...project, status: "Plan" } : project,
    );
    saveState();
    renderWorkshop();
    notify("Project moved to Plans.");
  }

  if (target.dataset.copyProject) {
    const project = state.workshopProjects.find((item) => item.id === target.dataset.copyProject);
    if (!project) return;
    state.workshopProjects.unshift({
      ...project,
      id: `project-${Date.now()}`,
      title: `${project.title} Copy`,
      status: "Idea",
    });
    saveState();
    renderWorkshop();
    renderNotebook();
    notify("Workshop plan duplicated as an idea.");
  }

  if (target.dataset.toggleNotification) {
    state.notificationPrefs = state.notificationPrefs.map((pref) =>
      pref.id === target.dataset.toggleNotification ? { ...pref, enabled: !pref.enabled } : pref,
    );
    saveState();
    renderNotifications();
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

  if (target.id === "loadAppRecords") {
    loadAppRecordsIntoWebsite();
  }

  if (target.id === "saveCentralAppData") {
    saveCentralAppData();
  }

  if (target.id === "saveProfileContacts") {
    saveProfileAndContacts();
  }

  if (target.id === "saveOperationalAppData") {
    saveOperationalAppData();
  }

  if (target.id === "saveLogBookAppData") {
    saveLogBookAppData();
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
    state.todos.unshift({
      id: `todo-${Date.now()}`,
      text: input.value.trim(),
      category: $("#todoCategory")?.value || "General",
      due: new Date().toISOString().slice(0, 10),
      done: false,
    });
    input.value = "";
    saveState();
    renderTodos();
  }

  if (event.target.id === "choreForm") {
    const frequency = $("#choreFrequency").value;
    const base = {
      id: `chore-${Date.now()}`,
      name: $("#choreName").value.trim(),
      category: $("#choreCategory").value,
      frequency,
      timeBlock: $("#choreTimeBlock").value,
      done: false,
    };
    if (frequency === "Twice Daily") {
      state.chores.unshift({ ...base, id: `chore-${Date.now()}-pm`, timeBlock: "PM" });
      state.chores.unshift({ ...base, id: `chore-${Date.now()}-am`, timeBlock: "AM" });
    } else {
      state.chores.unshift(base);
    }
    event.target.reset();
    saveState();
    renderAll();
  }

  if (event.target.id === "supplyRunForm") {
    const place = $("#supplyPlace").value;
    state.supplyRuns.unshift({
      id: `supply-${Date.now()}`,
      item: $("#supplyItem").value.trim(),
      category: $("#supplyCategory").value,
      quantity: $("#supplyQuantity").value.trim() || "1",
      unit: $("#supplyUnit").value.trim() || "item",
      preferredPlace: place,
      destination: `${$("#supplyCategory").value} storage`,
    });
    if (place && !state.preferredPlaces.includes(place)) state.preferredPlaces.unshift(place);
    event.target.reset();
    saveState();
    renderAll();
    notify("Supply run item saved.");
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
      category: $("#itemCategory").value,
      quantity: Number($("#itemQty").value || 0),
      lowAt: 3,
      unit: $("#itemUnit").value.trim(),
      price: $("#itemPrice").value.trim(),
      date: $("#itemDate").value,
      description: $("#itemDescription").value.trim(),
    });
    event.target.reset();
    saveState();
    renderAll();
  }

  if (event.target.id === "inventoryEditForm") {
    const itemId = $("#editItemId").value;
    state.stands = state.stands.map((stand) =>
      stand.id === state.selectedStandId
        ? {
            ...stand,
            items: stand.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    name: $("#editItemName").value.trim(),
                    category: $("#editItemCategory").value,
                    quantity: Number($("#editItemQty").value || 0),
                    lowAt: Number($("#editItemLow").value || 0),
                    unit: $("#editItemUnit").value.trim(),
                    price: $("#editItemPrice").value.trim(),
                    date: $("#editItemDate").value,
                    description: $("#editItemDescription").value.trim(),
                  }
                : item,
            ),
          }
        : stand,
    );
    $("#inventoryDialog")?.close();
    saveState();
    renderAll();
    notify("Inventory item saved.");
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
    const photoFile = $("#animalPhoto").files?.[0];
    const photo = photoFile ? await fileToDataUrl(photoFile) : "";
    state.animals.unshift({
      id: `animal-${Date.now()}`,
      name: $("#animalName").value.trim(),
      species: $("#animalSpecies").value,
      tag: $("#animalTag").value.trim(),
      status: "Active",
      contactId: $("#animalContact")?.value || "",
      photo,
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
    const publish = event.submitter?.dataset.recipePublish === "true";
    state.recipes.unshift({
      id: `recipe-${Date.now()}`,
      title: $("#recipeTitle").value.trim(),
      type: $("#recipeType").value,
      ingredients: $("#recipeIngredients").value.trim(),
      notes: $("#recipeNotes").value.trim(),
      lastCooked: $("#recipeLastCooked").value,
      source: "Your Recipe",
      published: publish,
    });
    event.target.reset();
    saveState();
    renderRecipes();
    notify(publish ? "Recipe saved and published." : "Recipe saved.");
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
  if (event.target.id === "fieldGuideFilter") renderFieldGuide();
  if (event.target.dataset.quickSlot) {
    const index = Number(event.target.dataset.quickSlot);
    state.quickAccess[index] = event.target.value;
    state.quickAccess = state.quickAccess.slice(0, 4);
    saveState();
    renderQuickAccess();
    notify("Quick Access updated.");
  }
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
