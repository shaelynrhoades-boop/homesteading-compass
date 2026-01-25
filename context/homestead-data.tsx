import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AlmanacEntry = {
  id: string;
  date: string;
  label: string;
  type: 'todo' | 'chore' | 'log' | 'weather' | 'seasonal';
  source: string;
  color?: string;
  details?: string;
};

export type TradingListing = {
  id: string;
  title: string;
  details: string;
  source: string;
  date: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  rating: number;
  isFavorite: boolean;
  lastCookedDate: string;
  mealType: string;
  difficulty: string;
  dietary: string[];
  categories: string[];
  cuisines: string[];
  servings: string;
  prepTimeValue: string;
  prepTimeUnit: 'minutes' | 'hours';
  cookTimeValue: string;
  cookTimeUnit: 'minutes' | 'hours';
  isCrockpot: boolean;
  crockpotNotes: string;
  preserving: {
    method: string;
    notes: string;
  }[];
  ingredients: {
    name: string;
    amount: string;
    unit: string;
  }[];
  steps: string[];
  source: string;
  notes: string;
};

const normalizeRecipe = (recipe: Recipe): Recipe => {
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map((item) =>
        typeof item === 'string'
          ? { name: item, amount: '', unit: 'each' }
          : {
              name: item.name ?? '',
              amount: item.amount ?? '',
              unit: item.unit ?? 'each',
            }
      )
    : [];
  return {
    ...recipe,
    rating: recipe.rating ?? 0,
    isFavorite: Boolean(recipe.isFavorite),
    lastCookedDate: recipe.lastCookedDate ?? '',
    prepTimeValue: recipe.prepTimeValue ?? '',
    prepTimeUnit: recipe.prepTimeUnit ?? 'minutes',
    cookTimeValue: recipe.cookTimeValue ?? '',
    cookTimeUnit: recipe.cookTimeUnit ?? 'minutes',
    isCrockpot: Boolean(recipe.isCrockpot),
    crockpotNotes: recipe.crockpotNotes ?? '',
    preserving: Array.isArray(recipe.preserving)
      ? recipe.preserving.map((entry) => ({
          method: entry.method ?? '',
          notes: entry.notes ?? '',
        }))
      : [],
    ingredients,
  };
};

export type QuickNote = {
  id: string;
  subject: string;
  category: string;
  body: string;
  attachmentLabel: string;
  attachmentNote: string;
  reminderDate: string;
  reminderLeadDays: string;
  almanacId: string | null;
  createdAt: string;
};

export type OutpostListing = {
  id: string;
  name: string;
  type: 'Mom & Pops' | 'Small Business' | 'Commercial';
  location: string;
  offerings: string;
  description: string;
  website: string;
  email: string;
  hiringActive?: boolean;
  hiringTitle?: string;
  hiringDescription?: string;
  hiringLink?: string;
  helpNeeded?: boolean;
  helpTags?: string[];
  helpProject?: string;
  showOnMap?: boolean;
  mapRadiusMiles?: number;
  createdAt: string;
};

type HomesteadDataContextValue = {
  almanacEntries: AlmanacEntry[];
  addAlmanacEntry: (entry: AlmanacEntry) => void;
  removeAlmanacEntries: (ids: string[]) => void;
  tradingListings: TradingListing[];
  addTradingListing: (listing: TradingListing) => void;
  updateTradingListing: (listing: TradingListing) => void;
  removeTradingListing: (id: string) => void;
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  removeRecipe: (id: string) => void;
  quickNotes: QuickNote[];
  addQuickNote: (note: QuickNote) => void;
  updateQuickNote: (note: QuickNote) => void;
  removeQuickNote: (id: string) => void;
  outpostListings: OutpostListing[];
  addOutpostListing: (listing: OutpostListing) => void;
};

const HomesteadDataContext = createContext<HomesteadDataContextValue | null>(null);

export function HomesteadDataProvider({ children }: { children: React.ReactNode }) {
  const [almanacEntries, setAlmanacEntries] = useState<AlmanacEntry[]>([]);
  const [tradingListings, setTradingListings] = useState<TradingListing[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [outpostListings, setOutpostListings] = useState<OutpostListing[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('homestead:data');
        if (!stored) {
          return;
        }
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.almanacEntries)) setAlmanacEntries(parsed.almanacEntries);
        if (Array.isArray(parsed.tradingListings)) setTradingListings(parsed.tradingListings);
        if (Array.isArray(parsed.recipes)) setRecipes(parsed.recipes.map(normalizeRecipe));
        if (Array.isArray(parsed.quickNotes)) setQuickNotes(parsed.quickNotes);
        if (Array.isArray(parsed.outpostListings)) setOutpostListings(parsed.outpostListings);
      } catch {
        // Ignore load errors to avoid blocking the app.
      }
    };
    void loadData();
  }, []);

  useEffect(() => {
    const persist = async () => {
      try {
        await AsyncStorage.setItem(
          'homestead:data',
          JSON.stringify({
            almanacEntries,
            tradingListings,
            recipes,
            quickNotes,
            outpostListings,
          })
        );
      } catch {
        // Ignore save errors to avoid blocking the UI.
      }
    };
    void persist();
  }, [almanacEntries, tradingListings, recipes, quickNotes, outpostListings]);

  const addAlmanacEntry = (entry: AlmanacEntry) => {
    setAlmanacEntries((prev) => [entry, ...prev]);
  };

  const removeAlmanacEntries = (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }
    setAlmanacEntries((prev) => prev.filter((entry) => !ids.includes(entry.id)));
  };

  const addTradingListing = (listing: TradingListing) => {
    setTradingListings((prev) => [listing, ...prev]);
  };

  const updateTradingListing = (listing: TradingListing) => {
    setTradingListings((prev) => prev.map((item) => (item.id === listing.id ? listing : item)));
  };

  const removeTradingListing = (id: string) => {
    setTradingListings((prev) => prev.filter((item) => item.id !== id));
  };

  const addRecipe = (recipe: Recipe) => {
    setRecipes((prev) => [recipe, ...prev]);
  };

  const updateRecipe = (recipe: Recipe) => {
    setRecipes((prev) => prev.map((item) => (item.id === recipe.id ? recipe : item)));
  };

  const removeRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((item) => item.id !== id));
  };

  const addQuickNote = (note: QuickNote) => {
    setQuickNotes((prev) => [note, ...prev]);
  };

  const updateQuickNote = (note: QuickNote) => {
    setQuickNotes((prev) => prev.map((item) => (item.id === note.id ? note : item)));
  };

  const removeQuickNote = (id: string) => {
    setQuickNotes((prev) => prev.filter((item) => item.id !== id));
  };

  const addOutpostListing = (listing: OutpostListing) => {
    setOutpostListings((prev) => [listing, ...prev]);
  };

  const value = useMemo(
    () => ({
      almanacEntries,
      addAlmanacEntry,
      removeAlmanacEntries,
      tradingListings,
      addTradingListing,
      updateTradingListing,
      removeTradingListing,
      recipes,
      addRecipe,
      updateRecipe,
      removeRecipe,
      quickNotes,
      addQuickNote,
      updateQuickNote,
      removeQuickNote,
      outpostListings,
      addOutpostListing,
    }),
    [almanacEntries, tradingListings, recipes, quickNotes, outpostListings]
  );

  return <HomesteadDataContext.Provider value={value}>{children}</HomesteadDataContext.Provider>;
}

export function useHomesteadData() {
  const context = useContext(HomesteadDataContext);
  if (!context) {
    throw new Error('useHomesteadData must be used within HomesteadDataProvider');
  }
  return context;
}
