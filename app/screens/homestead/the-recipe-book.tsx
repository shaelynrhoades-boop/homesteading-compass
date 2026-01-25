import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View, ViewStyle } from 'react-native';
import { Recipe, useHomesteadData } from '../../../context/homestead-data';
import { isOnline, useStatusOverlay } from '../../../context/status-overlay';
import InfoButton from '../../../components/info-button';
import AsyncStorage from '@react-native-async-storage/async-storage';

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

type ListItem = {
  id: string;
  value: string;
};

type IngredientItem = {
  id: string;
  name: string;
  amount: string;
  unit: string;
};

const getCookTimeMinutes = (value: string, unit: 'minutes' | 'hours') => {
  if (!value.trim()) return null;
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) return null;
  return unit === 'hours' ? Math.round(parsed * 60) : Math.round(parsed);
};

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
const categoryTags = ['Soup', 'Pasta', 'Stew', 'Bread', 'Dessert', 'Beverage'];
const cuisineTags = ['American', 'Mexican', 'Italian', 'French', 'Mediterranean', 'Asian', 'Southern'];
const dietaryTags = ['Gluten-Free', 'Dairy-Free', 'Low Sugar', 'Vegetarian', 'Vegan'];
const preservingMethods = ['Canned', 'Freeze', 'Dehydrate', 'Dry Shelf Stable', 'Fermented', 'Pickled'];
const ingredientUnits = ['cups', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'ml', 'pinch', 'each'];
const ingredientCountOptions = [
  { label: 'Under 5', max: 5 },
  { label: 'Under 10', max: 10 },
  { label: 'Under 15', max: 15 },
];
const cookTimeFilters = [
  { label: 'Under 30 min', max: 30 },
  { label: 'Under 60 min', max: 60 },
  { label: 'Over 60 min', min: 61 },
];

const parchmentBase: ViewStyle = {
  backgroundColor: '#FFF1D8',
  borderRadius: 18,
  padding: 16,
  marginBottom: 18,
  borderWidth: 1.5,
  borderColor: '#D8C4A8',
  borderStyle: 'dashed',
  position: 'relative',
  shadowColor: '#3A2E24',
  shadowOpacity: 0.08,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
};

function CornerDots() {
  const dotStyle: ViewStyle = {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8C4A8',
    opacity: 0.6,
  };
  return (
    <>
      <View style={[dotStyle, { top: 8, left: 8 }]} />
      <View style={[dotStyle, { top: 8, right: 8 }]} />
      <View style={[dotStyle, { bottom: 8, left: 8 }]} />
      <View style={[dotStyle, { bottom: 8, right: 8 }]} />
    </>
  );
}

function ParchmentCard({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[parchmentBase, style]}>
      <CornerDots />
      {children}
    </View>
  );
}

export default function RecipeBookScreen() {
  const { recipes, addRecipe, updateRecipe, removeRecipe } = useHomesteadData();
  const { showStatus } = useStatusOverlay();
  const [recipeTitle, setRecipeTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<IngredientItem[]>([
    { id: makeId(), name: '', amount: '', unit: 'cups' },
    { id: makeId(), name: '', amount: '', unit: 'cups' },
  ]);
  const [steps, setSteps] = useState<ListItem[]>([
    { id: makeId(), value: '' },
    { id: makeId(), value: '' },
  ]);
  const [mealType, setMealType] = useState('');
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [lastCookedDate, setLastCookedDate] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [dietary, setDietary] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [servings, setServings] = useState('');
  const [prepTimeValue, setPrepTimeValue] = useState('');
  const [prepTimeUnit, setPrepTimeUnit] = useState<'minutes' | 'hours'>('minutes');
  const [cookTimeValue, setCookTimeValue] = useState('');
  const [cookTimeUnit, setCookTimeUnit] = useState<'minutes' | 'hours'>('minutes');
  const [isCrockpot, setIsCrockpot] = useState(false);
  const [crockpotNotes, setCrockpotNotes] = useState('');
  const [preservingSelections, setPreservingSelections] = useState<string[]>([]);
  const [preservingNotes, setPreservingNotes] = useState<Record<string, string>>({});
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterCuisines, setFilterCuisines] = useState<string[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string[]>([]);
  const [filterMealTypes, setFilterMealTypes] = useState<string[]>([]);
  const [filterIngredientMax, setFilterIngredientMax] = useState<number | null>(null);
  const [filterCookTimeRange, setFilterCookTimeRange] = useState<{ min?: number; max?: number } | null>(null);
  const [filterCrockpotOnly, setFilterCrockpotOnly] = useState(false);
  const [showRecipeFilters, setShowRecipeFilters] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanStep, setScanStep] = useState<'upload' | 'review'>('upload');
  const [recipeView, setRecipeView] = useState<'create' | 'current'>('create');
  const [ingredientUnitPickerId, setIngredientUnitPickerId] = useState<string | null>(null);
  const [showPreservingOptions, setShowPreservingOptions] = useState(false);

  const updateList = (
    items: ListItem[],
    setItems: React.Dispatch<React.SetStateAction<ListItem[]>>,
    id: string,
    value: string
  ) => {
    setItems(items.map((item) => (item.id === id ? { ...item, value } : item)));
  };

  const updateIngredient = (id: string, updates: Partial<IngredientItem>) => {
    setIngredients((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const toggleMulti = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const toggleSingle = (
    value: string,
    current: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(current === value ? '' : value);
  };

  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === selectedRecipeId) ?? null,
    [recipes, selectedRecipeId]
  );

  const filteredRecipes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const ingredientNeedle = ingredientSearch.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const matchesTerm =
        !term ||
        recipe.title.toLowerCase().includes(term) ||
        recipe.description.toLowerCase().includes(term) ||
        recipe.ingredients.some((item) => item.name.toLowerCase().includes(term));
      const matchesIngredient =
        !ingredientNeedle ||
        recipe.ingredients.some((item) => item.name.toLowerCase().includes(ingredientNeedle));
      const matchesCategory =
        filterCategories.length === 0 || filterCategories.some((tag) => recipe.categories.includes(tag));
      const matchesCuisine =
        filterCuisines.length === 0 || filterCuisines.some((tag) => recipe.cuisines.includes(tag));
      const matchesDifficulty =
        filterDifficulty.length === 0 || filterDifficulty.includes(recipe.difficulty);
      const matchesMealType =
        filterMealTypes.length === 0 || filterMealTypes.includes(recipe.mealType);
      const ingredientCount = recipe.ingredients.filter((item) => item.name.trim()).length;
      const matchesIngredientCount =
        filterIngredientMax == null || ingredientCount <= filterIngredientMax;
      const minutes = getCookTimeMinutes(recipe.cookTimeValue, recipe.cookTimeUnit);
      const matchesCookTime =
        filterCookTimeRange == null ||
        (minutes != null &&
          (filterCookTimeRange.min == null || minutes >= filterCookTimeRange.min) &&
          (filterCookTimeRange.max == null || minutes <= filterCookTimeRange.max));
      const matchesCrockpot = !filterCrockpotOnly || recipe.isCrockpot;
      return (
        matchesTerm &&
        matchesIngredient &&
        matchesCategory &&
        matchesCuisine &&
        matchesDifficulty &&
        matchesMealType &&
        matchesIngredientCount &&
        matchesCookTime &&
        matchesCrockpot
      );
    });
  }, [
    recipes,
    searchTerm,
    ingredientSearch,
    filterCategories,
    filterCuisines,
    filterDifficulty,
    filterMealTypes,
    filterIngredientMax,
    filterCookTimeRange,
    filterCrockpotOnly,
  ]);

  const sortedRecipes = useMemo(() => {
    return [...filteredRecipes].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }
      if (a.lastCookedDate && b.lastCookedDate && a.lastCookedDate !== b.lastCookedDate) {
        return a.lastCookedDate > b.lastCookedDate ? -1 : 1;
      }
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      return a.title.localeCompare(b.title);
    });
  }, [filteredRecipes]);

  const saveRecipe = () => {
    if (!recipeTitle.trim()) {
      showStatus('Log unable to save', 'error', 1400);
      return;
    }
    const cleanedIngredients = ingredients
      .map((item) => ({
        name: item.name.trim(),
        amount: item.amount.trim(),
        unit: item.unit,
      }))
      .filter((item) => item.name);
    const cleanedSteps = steps.map((item) => item.value.trim()).filter(Boolean);
    if (cleanedIngredients.length === 0) {
      showStatus('Add at least one ingredient', 'error', 1600);
      return;
    }
    if (cleanedSteps.length === 0) {
      showStatus('Add at least one step', 'error', 1600);
      return;
    }
    if (!isOnline()) {
      showStatus('No internet, logs will not save', 'warning', 1800);
      return;
    }
    showStatus('Log saving...', 'info', 900);
    const servingsValue = servings.trim();
    if (servingsValue && !/^\d+(\.\d+)?$/.test(servingsValue)) {
      showStatus('Servings must be a number', 'error', 1600);
      return;
    }
    if (rating && (rating < 1 || rating > 10)) {
      showStatus('Rating must be between 1 and 10', 'error', 1600);
      return;
    }
    if (prepTimeValue.trim() && !/^\d+(\.\d+)?$/.test(prepTimeValue.trim())) {
      showStatus('Prep time must be a number', 'error', 1600);
      return;
    }
    if (cookTimeValue.trim() && !/^\d+(\.\d+)?$/.test(cookTimeValue.trim())) {
      showStatus('Cook time must be a number', 'error', 1600);
      return;
    }
    const newRecipe: Recipe = {
      id: editingRecipeId ?? makeId(),
      title: recipeTitle.trim(),
      description: description.trim(),
      rating,
      isFavorite,
      lastCookedDate,
      mealType,
      difficulty,
      dietary,
      categories,
      cuisines,
      servings: servingsValue,
      prepTimeValue: prepTimeValue.trim(),
      prepTimeUnit,
      cookTimeValue: cookTimeValue.trim(),
      cookTimeUnit,
      isCrockpot,
      crockpotNotes: crockpotNotes.trim(),
      preserving: preservingSelections.map((method) => ({
        method,
        notes: preservingNotes[method]?.trim() ?? '',
      })),
      ingredients: cleanedIngredients,
      steps: cleanedSteps,
      source: source.trim(),
      notes: notes.trim(),
    };
    if (editingRecipeId) {
      updateRecipe(newRecipe);
    } else {
      addRecipe(newRecipe);
    }
    setRecipeTitle('');
    setDescription('');
    setMealType('');
    setDifficulty('');
    setDietary([]);
    setCategories([]);
    setCuisines([]);
    setServings('');
    setIngredients([{ id: makeId(), name: '', amount: '', unit: 'cups' }]);
    setSteps([{ id: makeId(), value: '' }]);
    setSource('');
    setNotes('');
    setRating(0);
    setIsFavorite(false);
    setLastCookedDate('');
    setPrepTimeValue('');
    setPrepTimeUnit('minutes');
    setCookTimeValue('');
    setCookTimeUnit('minutes');
    setIsCrockpot(false);
    setCrockpotNotes('');
    setPreservingSelections([]);
    setPreservingNotes({});
    setEditingRecipeId(null);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
    setTimeout(() => showStatus('Log saved', 'success', 1400), 900);
  };

  const resetDraftFields = () => {
    setRecipeTitle('');
    setDescription('');
    setMealType('');
    setDifficulty('');
    setDietary([]);
    setCategories([]);
    setCuisines([]);
    setServings('');
    setIngredients([{ id: makeId(), name: '', amount: '', unit: 'cups' }]);
    setSteps([{ id: makeId(), value: '' }]);
    setSource('');
    setNotes('');
    setRating(0);
    setIsFavorite(false);
    setLastCookedDate('');
    setPrepTimeValue('');
    setPrepTimeUnit('minutes');
    setCookTimeValue('');
    setCookTimeUnit('minutes');
    setIsCrockpot(false);
    setCrockpotNotes('');
    setPreservingSelections([]);
    setPreservingNotes({});
    setIngredientUnitPickerId(null);
    setShowPreservingOptions(false);
  };

  const clearDraft = () => {
    Alert.alert('Clear draft?', 'This removes any in-progress recipe data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          resetDraftFields();
          try {
            await AsyncStorage.removeItem('draft:recipe-book');
          } catch {
            // Ignore storage errors.
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const stored = await AsyncStorage.getItem('draft:recipe-book');
        if (!stored) {
          setDraftLoaded(true);
          return;
        }
        const draft = JSON.parse(stored);
        setRecipeTitle(draft.recipeTitle ?? '');
        setDescription(draft.description ?? '');
        const loadedIngredients = Array.isArray(draft.ingredients)
          ? draft.ingredients.map((item: any) => {
              if (typeof item?.value === 'string') {
                return { id: item.id ?? makeId(), name: item.value, amount: '', unit: 'cups' };
              }
              return {
                id: item.id ?? makeId(),
                name: item.name ?? '',
                amount: item.amount ?? '',
                unit: item.unit ?? 'cups',
              };
            })
          : [{ id: makeId(), name: '', amount: '', unit: 'cups' }];
        setIngredients(loadedIngredients);
        setSteps(Array.isArray(draft.steps) ? draft.steps : [{ id: makeId(), value: '' }]);
        setMealType(draft.mealType ?? '');
        setDifficulty(draft.difficulty ?? '');
        setDietary(Array.isArray(draft.dietary) ? draft.dietary : []);
        setCategories(Array.isArray(draft.categories) ? draft.categories : []);
        setCuisines(Array.isArray(draft.cuisines) ? draft.cuisines : []);
        setServings(draft.servings ?? '');
        setPrepTimeValue(draft.prepTimeValue ?? '');
        setPrepTimeUnit(draft.prepTimeUnit ?? 'minutes');
        setCookTimeValue(draft.cookTimeValue ?? '');
        setCookTimeUnit(draft.cookTimeUnit ?? 'minutes');
        setIsCrockpot(Boolean(draft.isCrockpot));
        setCrockpotNotes(draft.crockpotNotes ?? '');
        setRating(Number(draft.rating ?? 0));
        setIsFavorite(Boolean(draft.isFavorite));
        setLastCookedDate(draft.lastCookedDate ?? '');
        setPreservingSelections(Array.isArray(draft.preservingSelections) ? draft.preservingSelections : []);
        setPreservingNotes(draft.preservingNotes ?? {});
        setSource(draft.source ?? '');
        setNotes(draft.notes ?? '');
      } catch {
        // Ignore load errors.
      } finally {
        setDraftLoaded(true);
      }
    };
    if (!editingRecipeId) {
      void loadDraft();
    } else {
      setDraftLoaded(true);
    }
  }, [editingRecipeId]);

  useEffect(() => {
    if (!draftLoaded || editingRecipeId) {
      return;
    }
    const persistDraft = async () => {
      try {
        await AsyncStorage.setItem(
          'draft:recipe-book',
          JSON.stringify({
            recipeTitle,
            description,
            ingredients,
            steps,
            mealType,
            difficulty,
            dietary,
            categories,
            cuisines,
            servings,
            prepTimeValue,
            prepTimeUnit,
            cookTimeValue,
            cookTimeUnit,
            isCrockpot,
            crockpotNotes,
            rating,
            isFavorite,
            lastCookedDate,
            preservingSelections,
            preservingNotes,
            source,
            notes,
          })
        );
      } catch {
        // Ignore save errors.
      }
    };
    void persistDraft();
  }, [
    draftLoaded,
    editingRecipeId,
    recipeTitle,
    description,
    ingredients,
    steps,
    mealType,
    difficulty,
    dietary,
    categories,
    cuisines,
    servings,
    prepTimeValue,
    prepTimeUnit,
    cookTimeValue,
    cookTimeUnit,
    isCrockpot,
    crockpotNotes,
    rating,
    isFavorite,
    lastCookedDate,
    preservingSelections,
    preservingNotes,
    source,
    notes,
  ]);

  useEffect(() => {
    if (editingRecipeId) {
      setRecipeView('create');
    }
  }, [editingRecipeId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 36,
          textAlign: 'center',
          color: '#3A2E24',
          marginTop: 8,
          marginBottom: 10,
          fontFamily: 'SedgwickAve',
        }}
      >
        The Recipe Book
      </Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <InfoButton text="Save, categorize, and search your homestead recipes in one place. Connects to: Global Search." />
      </View>

      <Image
        source={require('../../assets/HCIcons/Icon_Extra/Icon_BookCompass.png')}
        style={{ width: 200, height: 200, alignSelf: 'center', marginTop: -12, marginBottom: 10 }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <Pressable
          onPress={() => setRecipeView('create')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: recipeView === 'create' ? '#8B5E3C' : '#EFE4D4',
            borderWidth: 1,
            borderColor: '#D7C9B7',
          }}
        >
          <Text
            style={{
              color: recipeView === 'create' ? '#FFFFFF' : '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          >
            Create Recipe Log
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setRecipeView('current')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: recipeView === 'current' ? '#8B5E3C' : '#EFE4D4',
            borderWidth: 1,
            borderColor: '#D7C9B7',
          }}
        >
          <Text
            style={{
              color: recipeView === 'current' ? '#FFFFFF' : '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          >
            Current Recipes
          </Text>
        </Pressable>
      </View>

      {recipeView === 'create' ? (
        <>
          <ParchmentCard>
            <View
              style={{
                height: 10,
                borderRadius: 8,
                backgroundColor: '#EADBCB',
                marginBottom: 12,
              }}
            />
            <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              Recipe Details
            </Text>

            <TextInput
              placeholder="Recipe title"
              value={recipeTitle}
              onChangeText={setRecipeTitle}
              placeholderTextColor="#A89C8E"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
              }}
            />
        <TextInput
          placeholder="Short description"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />
        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Recipe rating (1 = not great, 10 = Favorite Meal)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
            <Pressable
              key={`rating-${value}`}
              onPress={() => setRating((prev) => (prev === value ? 0 : value))}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: rating === value ? '#4C7744' : '#D7C9B7',
                backgroundColor: rating === value ? '#D8E6D2' : '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>{value}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Favorite</Text>
          <Pressable
            onPress={() => setIsFavorite((prev) => !prev)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isFavorite ? '#4C7744' : '#D7C9B7',
              backgroundColor: isFavorite ? '#D8E6D2' : '#FFFFFF',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              {isFavorite ? 'Starred' : 'Not starred'}
            </Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {mealTypes.map((type) => (
            <Pressable
              key={type}
              onPress={() => toggleSingle(type, mealType, setMealType)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: mealType === type ? '#8B5E3C' : '#D7C9B7',
                backgroundColor: mealType === type ? '#EADBCB' : '#FFFFFF',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{type}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Dietary tags</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {dietaryTags.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => toggleMulti(tag, setDietary)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: dietary.includes(tag) ? '#8B5E3C' : '#D7C9B7',
                backgroundColor: dietary.includes(tag) ? '#EADBCB' : '#FFFFFF',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{tag}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Categories</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {categoryTags.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => toggleMulti(tag, setCategories)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: categories.includes(tag) ? '#8B5E3C' : '#D7C9B7',
                backgroundColor: categories.includes(tag) ? '#EADBCB' : '#FFFFFF',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{tag}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Preserving category
        </Text>
        <Pressable
          onPress={() => setShowPreservingOptions((prev) => !prev)}
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
            backgroundColor: '#FFFFFF',
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            {preservingSelections.length > 0
              ? preservingSelections.join(', ')
              : 'Select preserving method'}
          </Text>
        </Pressable>
        {showPreservingOptions && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {preservingMethods.map((method) => (
              <Pressable
                key={method}
                onPress={() => toggleMulti(method, setPreservingSelections)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: preservingSelections.includes(method) ? '#4C7744' : '#D7C9B7',
                  backgroundColor: preservingSelections.includes(method) ? '#D8E6D2' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{method}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {preservingSelections.map((method) => (
          <TextInput
            key={`preserve-note-${method}`}
            placeholder={`Notes for ${method}`}
            value={preservingNotes[method] ?? ''}
            onChangeText={(value) =>
              setPreservingNotes((prev) => ({
                ...prev,
                [method]: value,
              }))
            }
            placeholderTextColor="#A89C8E"
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />
        ))}

        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Cuisine type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {cuisineTags.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => toggleMulti(tag, setCuisines)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: cuisines.includes(tag) ? '#8B5E3C' : '#D7C9B7',
                backgroundColor: cuisines.includes(tag) ? '#EADBCB' : '#FFFFFF',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{tag}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            placeholder="Servings"
            value={servings}
            onChangeText={setServings}
            placeholderTextColor="#A89C8E"
            keyboardType="numeric"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />
        </View>
        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Prep time</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              placeholder="Number"
              value={prepTimeValue}
              onChangeText={setPrepTimeValue}
              placeholderTextColor="#A89C8E"
              keyboardType="numeric"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
              }}
            />
            {(['minutes', 'hours'] as const).map((unit) => (
              <Pressable
                key={`prep-${unit}`}
                onPress={() => setPrepTimeUnit(unit)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: prepTimeUnit === unit ? '#4C7744' : '#D7C9B7',
                  backgroundColor: prepTimeUnit === unit ? '#D8E6D2' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                  {unit === 'minutes' ? 'min' : 'hrs'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Cook time</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              placeholder="Number"
              value={cookTimeValue}
              onChangeText={setCookTimeValue}
              placeholderTextColor="#A89C8E"
              keyboardType="numeric"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
              }}
            />
            {(['minutes', 'hours'] as const).map((unit) => (
              <Pressable
                key={`cook-${unit}`}
                onPress={() => setCookTimeUnit(unit)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: cookTimeUnit === unit ? '#4C7744' : '#D7C9B7',
                  backgroundColor: cookTimeUnit === unit ? '#D8E6D2' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                  {unit === 'minutes' ? 'min' : 'hrs'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Last cooked</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={lastCookedDate}
              onChangeText={setLastCookedDate}
              placeholderTextColor="#A89C8E"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
              }}
            />
            <Pressable
              onPress={() => setLastCookedDate(new Date().toISOString().slice(0, 10))}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#D7C9B7',
                backgroundColor: '#FFF1D8',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Today</Text>
            </Pressable>
          </View>
        </View>
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Crockpot meal</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Pressable
            onPress={() => setIsCrockpot(true)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isCrockpot ? '#4C7744' : '#D7C9B7',
              backgroundColor: isCrockpot ? '#D8E6D2' : '#FFFFFF',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Yes</Text>
          </Pressable>
          {isCrockpot && (
            <Pressable
              onPress={() => setIsCrockpot(false)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#D7C9B7',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Clear</Text>
            </Pressable>
          )}
        </View>
        {isCrockpot && (
          <TextInput
            placeholder="What to change to make it a Crockpot Meal."
            value={crockpotNotes}
            onChangeText={setCrockpotNotes}
            placeholderTextColor="#A89C8E"
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />
        )}

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
          <Pressable
            onPress={() => {}}
            style={{
              flex: 1,
              backgroundColor: '#8B5E3C',
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Photo</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setShowScanModal(true);
              setScanStep('upload');
            }}
            style={{
              flex: 1,
              backgroundColor: '#6B4E3D',
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Scan Recipe</Text>
          </Pressable>
        </View>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
          Photo upload and scan will be enabled later.
        </Text>
      </ParchmentCard>

      <ParchmentCard>
        <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
          Ingredients
        </Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
          Ingredient count: {ingredients.filter((item) => item.name.trim()).length}
        </Text>
        {ingredients.map((item) => (
          <View key={item.id} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                placeholder="Ingredient"
                placeholderTextColor="#A89C8E"
                value={item.name}
                onChangeText={(value) => updateIngredient(item.id, { name: value })}
                style={{
                  flex: 2,
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 8,
                  padding: 10,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                }}
              />
              <TextInput
                placeholder="Amount"
                placeholderTextColor="#A89C8E"
                value={item.amount}
                onChangeText={(value) => updateIngredient(item.id, { amount: value })}
                keyboardType="numeric"
                style={{
                  width: 90,
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 8,
                  padding: 10,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                }}
              />
              <Pressable
                onPress={() =>
                  setIngredientUnitPickerId((prev) => (prev === item.id ? null : item.id))
                }
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  justifyContent: 'center',
                  backgroundColor: '#FFFDF6',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{item.unit}</Text>
              </Pressable>
            </View>
            {ingredientUnitPickerId === item.id && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {ingredientUnits.map((unit) => (
                  <Pressable
                    key={`${item.id}-${unit}`}
                    onPress={() => {
                      updateIngredient(item.id, { unit });
                      setIngredientUnitPickerId(null);
                    }}
                    style={{
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: item.unit === unit ? '#4C7744' : '#D7C9B7',
                      backgroundColor: item.unit === unit ? '#D8E6D2' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                      {unit}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ))}
        <Pressable
          onPress={() =>
            setIngredients((prev) => [...prev, { id: makeId(), name: '', amount: '', unit: 'cups' }])
          }
          style={{
            backgroundColor: '#C9B8A6',
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Add Ingredient</Text>
        </Pressable>
      </ParchmentCard>

      <ParchmentCard>
        <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
          Instructions
        </Text>
        {steps.map((item, index) => (
          <TextInput
            key={item.id}
            placeholder={`Step ${index + 1}`}
            placeholderTextColor="#A89C8E"
            value={item.value}
            onChangeText={(value) => updateList(steps, setSteps, item.id, value)}
            multiline
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              marginBottom: 8,
              minHeight: 70,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />
        ))}
        <Pressable
          onPress={() => setSteps((prev) => [...prev, { id: makeId(), value: '' }])}
          style={{
            backgroundColor: '#C9B8A6',
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Add Step</Text>
        </Pressable>
      </ParchmentCard>

      <ParchmentCard>
        <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
          Notes & Source
        </Text>
        <TextInput
          placeholder="Source (family, cookbook, website)"
          value={source}
          onChangeText={setSource}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />
        <TextInput
          placeholder="Notes, substitutions, or memories"
          value={notes}
          onChangeText={setNotes}
          placeholderTextColor="#A89C8E"
          multiline
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            minHeight: 90,
            marginBottom: 12,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={saveRecipe}
            style={{
              flex: 1,
              backgroundColor: '#8B5E3C',
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
              {editingRecipeId ? 'Save Changes' : 'Save Recipe'}
            </Text>
          </Pressable>
          {!editingRecipeId && (
            <Pressable
              onPress={clearDraft}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: '#FFF1D8',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#D8C4A8',
              }}
            >
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Clear Draft</Text>
            </Pressable>
          )}
          {editingRecipeId && (
            <Pressable
              onPress={() => {
                setEditingRecipeId(null);
                resetDraftFields();
              }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: '#C9B8A6',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Cancel</Text>
            </Pressable>
          )}
        </View>
        {savedMessage && (
          <Text style={{ color: '#4C7744', marginTop: 8, fontFamily: 'SedgwickAve' }}>
            Saved locally for now.
          </Text>
        )}
      </ParchmentCard>
        </>
      ) : (
        <ParchmentCard>
          <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            Current Recipes
          </Text>
          {recipes.length === 0 ? (
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              No recipes yet. Save your first recipe from the Create Recipe Log tab.
            </Text>
          ) : selectedRecipe ? (
            <>
              <Pressable onPress={() => setSelectedRecipeId(null)} style={{ marginBottom: 10 }}>
                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Back to list</Text>
              </Pressable>
              <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                {selectedRecipe.title}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'center' }}>
                <Pressable
                  onPress={() => {
                    setEditingRecipeId(selectedRecipe.id);
                    setRecipeTitle(selectedRecipe.title);
                    setDescription(selectedRecipe.description);
                  setMealType(selectedRecipe.mealType);
                  setDifficulty(selectedRecipe.difficulty);
                  setDietary(selectedRecipe.dietary);
                  setCategories(selectedRecipe.categories);
        setCuisines(selectedRecipe.cuisines);
        setServings(selectedRecipe.servings);
        setPrepTimeValue(selectedRecipe.prepTimeValue);
        setPrepTimeUnit(selectedRecipe.prepTimeUnit);
        setCookTimeValue(selectedRecipe.cookTimeValue);
        setCookTimeUnit(selectedRecipe.cookTimeUnit);
        setIsCrockpot(Boolean(selectedRecipe.isCrockpot));
        setCrockpotNotes(selectedRecipe.crockpotNotes ?? '');
        setRating(Number(selectedRecipe.rating ?? 0));
        setIsFavorite(Boolean(selectedRecipe.isFavorite));
        setLastCookedDate(selectedRecipe.lastCookedDate ?? '');
        setPreservingSelections(
          Array.isArray(selectedRecipe.preserving)
            ? selectedRecipe.preserving.map((entry) => entry.method)
            : []
        );
                  setPreservingNotes(
                    Array.isArray(selectedRecipe.preserving)
                      ? selectedRecipe.preserving.reduce<Record<string, string>>((acc, entry) => {
                          acc[entry.method] = entry.notes;
                          return acc;
                        }, {})
                      : {}
                  );
        setIngredients(
          selectedRecipe.ingredients.length > 0
            ? selectedRecipe.ingredients.map((value) => ({
                id: makeId(),
                name: value.name,
                amount: value.amount,
                unit: value.unit,
              }))
            : [{ id: makeId(), name: '', amount: '', unit: 'cups' }]
        );
        setSteps(
                      selectedRecipe.steps.length > 0
                        ? selectedRecipe.steps.map((value) => ({ id: makeId(), value }))
                        : [{ id: makeId(), value: '' }]
                    );
                    setSource(selectedRecipe.source);
                    setNotes(selectedRecipe.notes);
                    setSelectedRecipeId(null);
                  }}
                >
                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
              </Pressable>
                <Pressable
                  onPress={() => {
                    setEditingRecipeId(null);
                    setRecipeTitle(`${selectedRecipe.title} (Copy)`);
                    setDescription(selectedRecipe.description);
                    setMealType(selectedRecipe.mealType);
                    setDifficulty(selectedRecipe.difficulty);
                    setDietary(selectedRecipe.dietary);
                    setCategories(selectedRecipe.categories);
                    setCuisines(selectedRecipe.cuisines);
                    setServings(selectedRecipe.servings);
                    setPrepTimeValue(selectedRecipe.prepTimeValue);
                    setPrepTimeUnit(selectedRecipe.prepTimeUnit);
                    setCookTimeValue(selectedRecipe.cookTimeValue);
                    setCookTimeUnit(selectedRecipe.cookTimeUnit);
                    setIsCrockpot(Boolean(selectedRecipe.isCrockpot));
                    setCrockpotNotes(selectedRecipe.crockpotNotes ?? '');
                    setRating(Number(selectedRecipe.rating ?? 0));
                    setIsFavorite(Boolean(selectedRecipe.isFavorite));
                    setLastCookedDate(selectedRecipe.lastCookedDate ?? '');
                    setPreservingSelections(
                      Array.isArray(selectedRecipe.preserving)
                        ? selectedRecipe.preserving.map((entry) => entry.method)
                        : []
                    );
                    setPreservingNotes(
                      Array.isArray(selectedRecipe.preserving)
                        ? selectedRecipe.preserving.reduce<Record<string, string>>((acc, entry) => {
                            acc[entry.method] = entry.notes;
                            return acc;
                          }, {})
                        : {}
                    );
                    setIngredients(
                      selectedRecipe.ingredients.length > 0
                        ? selectedRecipe.ingredients.map((value) => ({
                            id: makeId(),
                            name: value.name,
                            amount: value.amount,
                            unit: value.unit,
                          }))
                        : [{ id: makeId(), name: '', amount: '', unit: 'cups' }]
                    );
                    setSteps(
                      selectedRecipe.steps.length > 0
                        ? selectedRecipe.steps.map((value) => ({ id: makeId(), value }))
                        : [{ id: makeId(), value: '' }]
                    );
                    setSource(selectedRecipe.source);
                    setNotes(selectedRecipe.notes);
                    setSelectedRecipeId(null);
                    setRecipeView('create');
                  }}
                >
                  <Text style={{ color: '#D07A3A', fontFamily: 'SedgwickAve' }}>Duplicate</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert('Duplicate recipe', 'Use this to create variations of the same recipe.')
                  }
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 1,
                    borderColor: '#D07A3A',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#D07A3A', fontFamily: 'SedgwickAve', fontSize: 12 }}>i</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert('Delete recipe?', 'This cannot be undone.', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          removeRecipe(selectedRecipe.id);
                          setSelectedRecipeId(null);
                        },
                      },
                    ])
                  }
                >
                  <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve' }}>Delete</Text>
                </Pressable>
              </View>
              {!!selectedRecipe.description && (
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                  {selectedRecipe.description}
                </Text>
              )}
              {selectedRecipe.isFavorite && (
                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                  ★ Favorite
                </Text>
              )}
              {selectedRecipe.lastCookedDate && (
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                  Last cooked: {selectedRecipe.lastCookedDate}
                </Text>
              )}
              {selectedRecipe.rating > 0 && (
                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                  Rating: {selectedRecipe.rating}/10
                </Text>
              )}
              {selectedRecipe.isCrockpot && (
                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                  Crockpot-friendly
                </Text>
              )}
              {selectedRecipe.isCrockpot && selectedRecipe.crockpotNotes ? (
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                  Crockpot notes: {selectedRecipe.crockpotNotes}
                </Text>
              ) : null}
              {selectedRecipe.preserving.length > 0 && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                    Preserving
                  </Text>
                  {selectedRecipe.preserving.map((entry) => (
                    <Text key={entry.method} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                      {entry.method}
                      {entry.notes ? ` • ${entry.notes}` : ''}
                    </Text>
                  ))}
                </View>
              )}
              {(selectedRecipe.prepTimeValue || selectedRecipe.cookTimeValue) && (
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                  {selectedRecipe.prepTimeValue
                    ? `Prep: ${selectedRecipe.prepTimeValue} ${selectedRecipe.prepTimeUnit}`
                    : ''}
                  {selectedRecipe.prepTimeValue && selectedRecipe.cookTimeValue ? ' • ' : ''}
                  {selectedRecipe.cookTimeValue
                    ? `Cook: ${selectedRecipe.cookTimeValue} ${selectedRecipe.cookTimeUnit}`
                    : ''}
                </Text>
              )}
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                Ingredients
              </Text>
              {selectedRecipe.ingredients.map((ingredient) => (
                <Text
                  key={`${ingredient.name}-${ingredient.amount}-${ingredient.unit}`}
                  style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}
                >
                  • {ingredient.name}
                  {ingredient.amount ? ` — ${ingredient.amount} ${ingredient.unit}` : ''}
                </Text>
              ))}
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 10, marginBottom: 6 }}>
                Steps
              </Text>
              {selectedRecipe.steps.map((step, index) => (
                <Text key={`${selectedRecipe.id}-step-${index}`} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  {index + 1}. {step}
                </Text>
              ))}
              {!!selectedRecipe.notes && (
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 10 }}>
                  Notes: {selectedRecipe.notes}
                </Text>
              )}
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <TextInput
                  placeholder="Search recipes"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholderTextColor="#A89C8E"
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <Pressable
                  onPress={() => setShowRecipeFilters((prev) => !prev)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    backgroundColor: '#FFF1D8',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                    {showRecipeFilters ? 'Hide Filters' : 'Filters'}
                  </Text>
                </Pressable>
              </View>
              {showRecipeFilters && (
                <>
                  <TextInput
                    placeholder="Filter by ingredient (chicken, spinach, etc)"
                    value={ingredientSearch}
                    onChangeText={setIngredientSearch}
                    placeholderTextColor="#A89C8E"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 8,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                    Time of day
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {mealTypes.map((tag) => (
                      <Pressable
                        key={tag}
                        onPress={() => toggleMulti(tag, setFilterMealTypes)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: filterMealTypes.includes(tag) ? '#8B5E3C' : '#D7C9B7',
                          backgroundColor: filterMealTypes.includes(tag) ? '#EADBCB' : '#FFFFFF',
                        }}
                      >
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{tag}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                    Categories
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {categoryTags.map((tag) => (
                      <Pressable
                        key={tag}
                        onPress={() => toggleMulti(tag, setFilterCategories)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: filterCategories.includes(tag) ? '#8B5E3C' : '#D7C9B7',
                          backgroundColor: filterCategories.includes(tag) ? '#EADBCB' : '#FFFFFF',
                        }}
                      >
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{tag}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                    Cuisine type
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {cuisineTags.map((tag) => (
                      <Pressable
                        key={tag}
                        onPress={() => toggleMulti(tag, setFilterCuisines)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: filterCuisines.includes(tag) ? '#8B5E3C' : '#D7C9B7',
                          backgroundColor: filterCuisines.includes(tag) ? '#EADBCB' : '#FFFFFF',
                        }}
                      >
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{tag}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                    Ingredient count
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {ingredientCountOptions.map((option) => (
                      <Pressable
                        key={option.label}
                        onPress={() =>
                          setFilterIngredientMax((prev) => (prev === option.max ? null : option.max))
                        }
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: filterIngredientMax === option.max ? '#8B5E3C' : '#D7C9B7',
                          backgroundColor: filterIngredientMax === option.max ? '#EADBCB' : '#FFFFFF',
                        }}
                      >
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                    Cook time
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {cookTimeFilters.map((option) => {
                      const isSelected =
                        filterCookTimeRange?.min === option.min && filterCookTimeRange?.max === option.max;
                      return (
                        <Pressable
                          key={option.label}
                          onPress={() =>
                            setFilterCookTimeRange((prev) =>
                              prev?.min === option.min && prev?.max === option.max
                                ? null
                                : { min: option.min, max: option.max }
                            )
                          }
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: isSelected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: isSelected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Crockpot meals</Text>
                    <Pressable
                      onPress={() => setFilterCrockpotOnly((prev) => !prev)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: filterCrockpotOnly ? '#4C7744' : '#D7C9B7',
                        backgroundColor: filterCrockpotOnly ? '#D8E6D2' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                        {filterCrockpotOnly ? 'Yes' : 'Yes'}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => {
                      setIngredientSearch('');
                      setFilterMealTypes([]);
                      setFilterCategories([]);
                      setFilterCuisines([]);
                      setFilterDifficulty([]);
                      setFilterIngredientMax(null);
                      setFilterCookTimeRange(null);
                      setFilterCrockpotOnly(false);
                    }}
                    style={{ marginBottom: 12 }}
                  >
                    <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Clear filters</Text>
                  </Pressable>
                </>
              )}
              {sortedRecipes.length === 0 ? (
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  No recipes match your filters.
                </Text>
              ) : (
                sortedRecipes.map((recipe) => (
                  <View
                    key={recipe.id}
                    style={{
                      borderWidth: 1,
                      borderColor: '#E2D4C1',
                      borderRadius: 12,
                      padding: 10,
                      marginBottom: 8,
                      backgroundColor: '#FFFDF6',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 16 }}>
                        {recipe.title}
                      </Text>
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                        {recipe.rating > 0 ? `Rating: ${recipe.rating}/10` : 'Rating: --'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setSelectedRecipeId(recipe.id)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 12,
                        backgroundColor: '#8B5E3C',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Show More</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </>
          )}
        </ParchmentCard>
      )}

      <Modal
        visible={showScanModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowScanModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(58, 46, 36, 0.45)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFF1D8',
              borderRadius: 20,
              padding: 16,
              borderWidth: 1.5,
              borderColor: '#D8C4A8',
              borderStyle: 'dashed',
            }}
          >
            <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
              Scan Recipe
            </Text>
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
              Upload a recipe photo or screenshot. We will add OCR later.
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                backgroundColor: '#FFF7E6',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                {scanStep === 'upload' ? 'No image selected' : 'Preview ready'}
              </Text>
              <Text style={{ color: '#A08974', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                Image upload will be enabled later.
              </Text>
            </View>

            {scanStep === 'upload' ? (
              <Pressable
                onPress={() => setScanStep('review')}
                style={{
                  backgroundColor: '#8B5E3C',
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Select Photo</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  setShowScanModal(false);
                  setScanStep('upload');
                }}
                style={{
                  backgroundColor: '#8B5E3C',
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save to Recipe</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => {
                setShowScanModal(false);
                setScanStep('upload');
              }}
              style={{ alignItems: 'center', paddingVertical: 6 }}
            >
              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
