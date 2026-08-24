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
        { id: "item-1", name: "Eggs", quantity: 3, lowAt: 6, unit: "dozen" },
        { id: "item-2", name: "Honey", quantity: 12, lowAt: 4, unit: "jars" },
        { id: "item-3", name: "Tomatoes", quantity: 18, lowAt: 8, unit: "pints" },
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
      category: "Farm Alerts",
      subject: "Filter menu request",
      body: "Move alert filters behind a Filter button with Clear Filters inside.",
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
      detail: "Eggs, honey, tomatoes, and porch cooler pickup.",
      saved: true,
    },
    {
      id: "pin-2",
      type: "Swap",
      name: "Seed and Starts Swap",
      location: "Watertown, TN",
      detail: "Tomato starts, herb cuttings, jars, and garden stakes.",
      saved: false,
    },
    {
      id: "pin-3",
      type: "Service",
      name: "Mobile Hoof Trim",
      location: "Wilson County, TN",
      detail: "Goats, sheep, and small herd appointments.",
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
      detail: "Washed or unwashed by request. Pickup near the stand.",
      saved: false,
    },
    {
      id: "listing-2",
      category: "Livestock",
      title: "Nigerian Dwarf doelings",
      location: "Hartsville, TN",
      price: "Contact seller",
      detail: "Bottle raised, friendly, CDT current.",
      saved: false,
    },
    {
      id: "listing-3",
      category: "Equipment",
      title: "Two-panel kidding pen",
      location: "Gallatin, TN",
      price: "$80",
      detail: "Light use, gate latch included.",
      saved: true,
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
    },
    {
      id: "recipe-2",
      title: "Honey Oat Sandwich Bread",
      type: "Baking",
      ingredients: "honey, oats, flour",
      notes: "Two loaf batch. Track honey jars used against pantry stock.",
    },
    {
      id: "recipe-3",
      title: "Quick Dill Refrigerator Pickles",
      type: "Canning",
      ingredients: "cucumbers, dill, vinegar",
      notes: "Not shelf stable. Label jars with use-by dates.",
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
    stands: Array.isArray(saved.stands) ? saved.stands : clone(defaultState.stands),
    messages: Array.isArray(saved.messages) ? saved.messages : clone(defaultState.messages),
    pins: Array.isArray(saved.pins) ? saved.pins : clone(defaultState.pins),
    listings: Array.isArray(saved.listings) ? saved.listings : clone(defaultState.listings),
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

  if (state.stands.length === 1) {
    state.selectedStandId = state.stands[0].id;
  }

  cards.innerHTML = state.stands
    .map((stand) => {
      const lowCount = getLowItems(stand).length;
      return `
        <article class="stand-card ${stand.id === state.selectedStandId ? "active" : ""}">
          <h3>${e(stand.name)}</h3>
          <p>${e(stand.location)}</p>
          <div class="mini-metric"><span>Total Items:</span><strong>${stand.items.length}</strong></div>
          <div class="mini-metric"><span>Low Item Status</span><strong>${lowCount ? `${lowCount} low` : "Good"}</strong></div>
          <button class="button compact" type="button" data-view-stand="${stand.id}">View Stand</button>
        </article>
      `;
    })
    .join("");

  const stand = state.stands.find((item) => item.id === state.selectedStandId) || state.stands[0];
  if (!stand) {
    detail.innerHTML = "<h3>No stand yet</h3><p>Create a stand to start tracking inventory.</p>";
    return;
  }

  detail.innerHTML = `
    <div class="panel-title-row">
      <div>
        <div class="eyebrow">Selected Stand</div>
        <button class="editable-title" type="button" id="editStandName">${e(stand.name)}</button>
      </div>
      <button class="button compact secondary" type="button" id="editStandLocation">Edit Location</button>
    </div>
    <p class="stand-location">${e(stand.location)}</p>
    <p class="muted">${e(stand.notes)}</p>
    <form class="inline-form" id="itemForm">
      <input id="itemName" type="text" placeholder="Item name" required />
      <input id="itemQty" type="number" min="0" placeholder="Qty" required />
      <input id="itemUnit" type="text" placeholder="Unit" />
      <button class="button compact" type="submit">Add Item</button>
    </form>
    <div class="inventory-list">
      ${stand.items
        .map((item) => {
          const low = Number(item.quantity) <= Number(item.lowAt);
          return `
            <div class="inventory-row ${low ? "low" : ""}">
              <div>
                <strong>${e(item.name)}</strong>
                <span>${low ? "Low item" : "In stock"}</span>
              </div>
              <div class="quantity-control">
                <button type="button" data-adjust-item="${item.id}" data-delta="-1">−</button>
                <span>${e(item.quantity)} ${e(item.unit || "")}</span>
                <button type="button" data-adjust-item="${item.id}" data-delta="1">+</button>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderMessages() {
  const list = $("#messageList");
  const indicator = $("#unreadIndicator");
  const openCount = $("#openMessageCount");
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

  list.innerHTML = messages
    .map(
      (message) => `
        <article class="message-card ${message.unread ? "unread" : ""}">
          <div class="message-meta">
            <span>${e(message.category)}</span>
            <span>${formatDate(message.createdAt)}</span>
          </div>
          <h3>${e(message.subject)}</h3>
          <p>${e(message.body)}</p>
          ${message.photo ? `<img class="message-photo" src="${message.photo}" alt="Attached preview" />` : ""}
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

function renderPins() {
  const list = $("#pinList");
  if (!list) return;
  const filter = $("#pinTypeFilter")?.value || "all";
  const pins = filter === "all" ? state.pins : state.pins.filter((pin) => pin.type === filter);
  list.innerHTML = pins
    .map(
      (pin) => `
        <article class="local-card">
          <div class="message-meta">
            <span>${e(pin.type)}</span>
            <span>${pin.saved ? "Saved" : "Local"}</span>
          </div>
          <h3>${e(pin.name)}</h3>
          <p class="stand-location">${e(pin.location)}</p>
          <p>${e(pin.detail)}</p>
          <button class="button compact secondary" type="button" data-save-pin="${pin.id}">
            ${pin.saved ? "Unsave Pin" : "Save Pin"}
          </button>
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
    `${listing.category} ${listing.title} ${listing.location} ${listing.detail}`.toLowerCase().includes(search),
  );
  list.innerHTML = listings
    .map(
      (listing) => `
        <article class="market-card">
          <div class="message-meta">
            <span>${e(listing.category)}</span>
            <span>${listing.saved ? "Saved" : "Open"}</span>
          </div>
          <h3>${e(listing.title)}</h3>
          <p class="stand-location">${e(listing.location)}</p>
          <strong>${e(listing.price)}</strong>
          <p>${e(listing.detail)}</p>
          <button class="button compact secondary" type="button" data-save-listing="${listing.id}">
            ${listing.saved ? "Unsave Listing" : "Save Listing"}
          </button>
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
      return `
        <article class="animal-card">
          <div class="message-meta">
            <span>${e(animal.species)}</span>
            <span>${e(animal.status || "Active")}</span>
          </div>
          <h3>${e(animal.name)}</h3>
          <p class="stand-location">${e(animal.tag || "No tag")}</p>
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
            <span>${e(recipe.ingredients || "No ingredients listed")}</span>
          </div>
          <h3>${e(recipe.title)}</h3>
          <p>${e(recipe.notes)}</p>
          <button class="button compact secondary" type="button" data-delete-recipe="${recipe.id}">Remove</button>
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
  renderTodos();
  renderChores();
  renderAlmanacEvents();
  renderStands();
  renderMessages();
  renderWeather();
  renderAlerts();
  renderPins();
  renderListings();
  renderPosts();
  renderAnimals();
  renderRecipes();
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
    state.listings = state.listings.map((listing) =>
      listing.id === target.dataset.saveListing ? { ...listing, saved: !listing.saved } : listing,
    );
    saveState();
    renderListings();
  }

  if (target.dataset.deleteRecipe) {
    state.recipes = state.recipes.filter((recipe) => recipe.id !== target.dataset.deleteRecipe);
    saveState();
    renderRecipes();
    notify("Recipe removed.");
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

  if (target.id === "editStandName") {
    const stand = state.stands.find((item) => item.id === state.selectedStandId);
    const nextName = window.prompt("Stand name", stand.name);
    if (nextName?.trim()) {
      stand.name = nextName.trim();
      saveState();
      renderStands();
    }
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
    const file = $("#composePhoto").files?.[0];
    const photo = file ? await fileToDataUrl(file) : "";
    state.messages.unshift({
      id: `msg-${Date.now()}`,
      category: $("#composeCategory").value,
      subject: $("#composeSubject").value.trim(),
      body: $("#composeBody").value.trim(),
      createdAt: new Date().toISOString(),
      unread: true,
      photo,
    });
    event.target.reset();
    saveState();
    renderMessages();
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
    });
    event.target.reset();
    saveState();
    renderRecipes();
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
  if (event.target.id === "animalSpeciesFilter") renderAnimals();
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
