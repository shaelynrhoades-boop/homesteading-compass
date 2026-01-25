import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import CalendarWithYear from '../../../components/calendar-with-year';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useHomesteadData } from '../../../context/homestead-data';
import { isOnline, useStatusOverlay } from '../../../context/status-overlay';
import InfoButton from '../../../components/info-button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDisplayDate } from '../../../lib/format-date';

type MetricEntry = {
  id: string;
  value: string;
  date: string;
};

type MilkEntry = {
  id: string;
  date: string;
  time: 'AM' | 'PM' | '';
  method: 'Hand' | 'Machine' | '';
  amount: string;
  amountUnit: string;
  fat: string;
  taste: string;
  handling: string;
};

type ProfitEntry = {
  id: string;
  date: string;
  type: string;
  quantity: string;
  pricePer: string;
  total: string;
  notes: string;
};

type BeeHive = {
  id: string;
  name: string;
  location: string;
  hiveType: string;
  boxesBrood: string;
  boxesHoney: string;
  startDate: string;
  population: string;
};

type BeeQueenLog = {
  id: string;
  date: string;
  hiveId: string;
  queenName: string;
  markingColor: string;
  breed: string;
  origin: string;
  introducedDate: string;
  layingStatus: string;
  temperament: string;
  replacementHistory: string;
  notes: string;
};

type BeeWorkerLog = {
  id: string;
  date: string;
  hiveId: string;
  populationStrength: string;
  behavior: string;
  aggression: string;
  dronePresence: string;
  broodQuantity: string;
  notes: string;
};

type BeeInspectionLog = {
  id: string;
  date: string;
  hiveId: string;
  checks: string[];
  notes: string;
};

type BeeHealthLog = {
  id: string;
  date: string;
  hiveId: string;
  varroaCount: string;
  treatmentType: string;
  treatmentDate: string;
  results: string;
  symptoms: string;
};

type BeeHoneyLog = {
  id: string;
  date: string;
  hiveId: string;
  supersAddedDate: string;
  supersRemovedDate: string;
  framesHarvested: string;
  harvestAmount: string;
  harvestUnit: string;
  honeyType: string;
  honeyLeft: string;
  notes: string;
};

type BeeManagementLog = {
  id: string;
  date: string;
  hiveId: string;
  actions: string[];
  syrupType: string;
  syrupAmount: string;
  notes: string;
};

type BeeSeasonalLog = {
  id: string;
  date: string;
  hiveId: string;
  winterPrepActions: string[];
  insulationAdded: string;
  entranceReducers: string;
  fallStoresEstimate: string;
  springStatus: string;
  notes: string;
};

type LivestockLog = {
  id: string;
  createdAt: string;
  species: string;
  animalName: string;
  pastureName?: string;
  chickenCoopName?: string;
  pigPenName?: string;
  horsePastureName?: string;
  rabbitHousingType?: 'Cage' | 'Pen' | '';
  rabbitHousingName?: string;
  breed: string;
  breedList?: string[];
  breedOther?: string;
  gender: string;
  purpose: string[];
  birthdate?: string | null;
  deformities?: string;
  showQuality?: string;
  pedigree?: string;
  registration?: string;
  weightLogs?: MetricEntry[];
  heightLogs?: MetricEntry[];
  vaccineLogs?: SimpleLog[];
  wormingLogs?: SimpleLog[];
  hoofLogs?: SimpleLog[];
  vetApptLogs?: SimpleLog[];
  woundLogs?: WoundLog[];
  udderCondition?: string;
  udderNotes?: string;
  milkLogs?: MilkEntry[];
  grainBrand?: string;
  grainAmount?: string;
  grainAmountValue?: string;
  grainAmountUnit?: string;
  hayType?: string;
  hayForm?: string[];
  minerals?: string[];
  photoUri?: string | null;
  chickenLogType?: 'Individual' | 'Group' | '';
  chickenGroupGenders?: string[];
  chickenHenCount?: string;
  chickenRoosterCount?: string;
  deformityLogs?: SimpleLog[];
  profitEntries?: ProfitEntry[];
};

type SimpleLog = {
  id: string;
  date: string;
  notes: string;
  label?: string;
};

type WoundLog = {
  id: string;
  date: string;
  notes: string;
  followUps: SimpleLog[];
};

type GardenPlan = {
  label: 'Prep bed' | 'Seed' | 'Fertilize';
  date: string;
  leadDays: string;
};

type GardenLog = {
  id: string;
  date: string;
  bed: string;
  plants: string[];
  crop: string;
  task: string;
  prepDate: string;
  prepNotes: string;
  seedDate: string;
  soil: string;
  watering: string;
  pests: string;
  fertilizer: string;
  fertilizerDate: string;
  weather: string;
  stage: string;
  notes: string;
  plan: GardenPlan[];
  tags: string[];
};

type PantryLog = {
  id: string;
  date: string;
  item: string;
  type: string;
  method: string;
  category: string;
  batch: string;
  location: string;
  quantity: string;
  quantityUnit: string;
  useBy: string;
  ingredients: string;
  notes: string;
};

type HarvestLog = {
  id: string;
  date: string;
  item: string;
  yieldAmount: string;
  yieldUnit: string;
  quality: string;
  location: string;
  storage: string;
  weather: string;
  notes: string;
};

type FinanceLog = {
  id: string;
  date: string;
  type: 'Income' | 'Expense' | '';
  category: string;
  subcategory?: string;
  amount: string;
  quantity?: string;
  quantityUnit?: string;
  animalType?: string;
  receiptUri?: string;
  recurringFrequency?: string;
  vendor: string;
  paymentMethod: string;
  receipt: string;
  notes: string;
};

const animals = [
  'Chicken',
  'Duck',
  'Turkey',
  'Quail',
  'Rabbit',
  'Goat',
  'Sheep',
  'Cow',
  'Pig',
  'Horse',
  'Bee',
  'Livestock Guardian',
];

const speciesLogIcons: Record<string, number> = {
  Bee: require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_Beeslog.png'),
  Chicken: require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_ChickenLog.png'),
  Cow: require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_CowsLog.png'),
  Duck: require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_DucksLog.png'),
  Goat: require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_GoatsLog.png'),
  Horse: require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_HorseLog.png'),
  Pig: require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_PigLog.png'),
  Quail: require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_QuailLog.png'),
  Rabbit: require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_RabbitLog.png'),
  Sheep: require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_SheepLog.png'),
  Turkey: require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_TurkeyLog.png'),
  'Livestock Guardian': require('../../assets/HCIcons/Icon_Homestead/Log Book Icons/Icon_LivestockGuardianLog.png'),
};

const purposeOptionsBySpecies: Record<string, string[]> = {
  Cow: ['Dairy', 'Beef'],
  Goat: ['Meat', 'Dairy', 'Fiber'],
  Sheep: ['Meat', 'Dairy', 'Wool'],
  Chicken: ['Egg Layer', 'Meat'],
  Duck: ['Eggs', 'Meat'],
  Turkey: ['Meat', 'Breeding'],
  Quail: ['Eggs', 'Meat'],
  Rabbit: ['Meat', 'Fiber', 'Breeding', 'Pet'],
  Pig: ['Meat', 'Breeding'],
  Horse: ['Riding', 'Work', 'Breeding'],
  Bee: ['Honey', 'Pollination', 'Breeding'],
  'Livestock Guardian': ['Guarding', 'Breeding'],
};

const genderOptionsBySpecies: Record<string, string[]> = {
  Cow: ['Cow', 'Bull', 'Heifer', 'Steer'],
  Goat: ['Doe', 'Buck', 'Wether'],
  Sheep: ['Ewe', 'Ram', 'Wether'],
  Chicken: ['Hen', 'Rooster', 'Pullet', 'Cockerel'],
  Duck: ['Hen', 'Drake'],
  Turkey: ['Hen', 'Tom', 'Jake', 'Jenny'],
  Quail: ['Hen', 'Cock'],
  Rabbit: ['Doe', 'Buck'],
  Pig: ['Sow', 'Boar', 'Gilt', 'Barrow'],
  Horse: ['Mare', 'Stallion', 'Gelding'],
  Bee: ['Queen', 'Worker', 'Drone'],
  'Livestock Guardian': ['Male', 'Female'],
};

const sortOptions = (options: string[]) => {
  const remaining = options.filter((option) => option !== 'Other');
  const other = options.filter((option) => option === 'Other');
  return [...remaining.sort((a, b) => a.localeCompare(b)), ...other];
};

const breedOptionsBySpecies: Record<string, string[]> = {
  Cow: sortOptions([
    'Holstein',
    'Jersey',
    'Angus',
    'Hereford',
    'Highland',
    'Guernsey',
    'Brown Swiss',
    'Ayrshire',
    'Simmental',
    'Charolais',
    'Longhorn',
    'Shorthorn',
    'Limousin',
    'Other',
  ]),
  Goat: sortOptions([
    'Nubian',
    'Boer',
    'Alpine',
    'Saanen',
    'LaMancha',
    'Toggenburg',
    'Nigerian Dwarf',
    'Kiko',
    'Cashmere',
    'Angora',
    'Spanish',
    'Other',
  ]),
  Sheep: sortOptions([
    'Dorset',
    'Suffolk',
    'Merino',
    'Katahdin',
    'Dorper',
    'Hampshire',
    'Rambouillet',
    'Southdown',
    'Finnsheep',
    'Jacobs',
    'Shetland',
    'Other',
  ]),
  Chicken: sortOptions([
    'Rhode Island Red',
    'Plymouth Rock',
    'Leghorn',
    'Orpington',
    'Australorp',
    'Wyandotte',
    'Sussex',
    'Silkie',
    'Brahma',
    'Marans',
    'Ameraucana',
    'Easter Egger',
    'Cochin',
    'Other',
  ]),
  Duck: sortOptions([
    'Pekin',
    'Khaki Campbell',
    'Rouen',
    'Runner',
    'Muscovy',
    'Cayuga',
    'Buff',
    'Welsh Harlequin',
    'Swedish',
    'Call',
    'Other',
  ]),
  Turkey: sortOptions([
    'Broad Breasted White',
    'Broad Breasted Bronze',
    'Bourbon Red',
    'Narragansett',
    'Standard Bronze',
    'Slate',
    'Royal Palm',
    'Black Spanish',
    'Other',
  ]),
  Quail: sortOptions(['Coturnix', 'Bobwhite', 'Button', 'Japanese', 'Tennessee Red', 'Other']),
  Rabbit: sortOptions([
    'New Zealand',
    'Californian',
    'Rex',
    'Flemish Giant',
    'Mini Rex',
    'Dutch',
    'Lionhead',
    'English Angora',
    'French Angora',
    'Holland Lop',
    'Other',
  ]),
  Pig: sortOptions([
    'Berkshire',
    'Yorkshire',
    'Duroc',
    'KuneKune',
    'Tamworth',
    'Large Black',
    'Mangalitsa',
    'Gloucestershire Old Spots',
    'Landrace',
    'Other',
  ]),
  Horse: sortOptions([
    'Quarter Horse',
    'Thoroughbred',
    'Arabian',
    'Morgan',
    'Paint',
    'Appaloosa',
    'Tennessee Walking Horse',
    'Paso Fino',
    'Draft',
    'Miniature',
    'Other',
  ]),
  Bee: sortOptions(['Italian', 'Carniolan', 'Russian', 'Buckfast', 'Caucasian', 'Other']),
  'Livestock Guardian': sortOptions([
    'Great Pyrenees',
    'Anatolian Shepherd',
    'Maremma',
    'Akbash',
    'Komondor',
    'Kuvasz',
    'Kangal',
    'Other',
  ]),
};

const mineralOptions = ['Added to grain', 'Buffet', 'Block'];
const hayFormOptions = ['Loose', 'Pellets', 'Cubes'];
const weightUnits = ['lb', 'kg', 'oz'];
const heightUnits = ['in', 'cm', 'ft'];
const milkAmountUnits = ['gallon', 'quart', 'ounce', 'liter'];
const milkFatOptions = ['Low', 'Average', 'High', 'Rich'];
const milkTasteOptions = ['Sweet', 'Rich', 'Grassy', 'Strong', 'Off'];
const milkStandingOptions = ['Easy', 'Calm', 'Still', 'Kicker', 'Moves'];
const udderConditionOptions = ['Excellent', 'Good', 'Fair', 'Needs attention'];
const feedAmountUnits = ['cups', 'lb', 'kg'];
const profitOptionsBySpecies: Record<string, string[]> = {
  Chicken: ['Eggs', 'Chicks', 'Meat', 'Other'],
  Duck: ['Eggs', 'Meat', 'Other'],
  Turkey: ['Meat', 'Other'],
  Quail: ['Eggs', 'Meat', 'Other'],
  Rabbit: ['Meat', 'Fiber', 'Breeding stock', 'Other'],
  Goat: ['Milk', 'Cheese', 'Kids sold', 'Meat', 'Fiber', 'Other'],
  Sheep: ['Wool', 'Meat', 'Milk', 'Other'],
  Cow: ['Milk', 'Cheese', 'Butter', 'Meat', 'Other'],
  Pig: ['Meat', 'Breeding stock', 'Other'],
  Horse: ['Breeding stock', 'Training', 'Other'],
  Bee: ['Honey', 'Wax', 'Pollination', 'Other'],
  'Livestock Guardian': ['Breeding stock', 'Training', 'Other'],
};
const gardenPlantOptions = ['Broccoli', 'Squash', 'Herbs', 'Tomatoes', 'Peppers', 'Lettuce', 'Carrots'];
const gardenStageOptions = ['Seedling', 'Sprout', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'];
const gardenEventOptions = [
  'Prep',
  'Seed',
  'Fertilizer',
  'Pests',
  'Watering',
  'Soil',
  'Growth Stage',
  'Weather',
  'Task',
  'Harvest',
  'Planning',
];
const pantryTypes = [
  'Canned',
  'Frozen',
  'Dehydrated',
  'Dry Shelf-Stable',
  'Fermented',
  'Fresh/Cellared',
];
const pantryMethods = ['Canning', 'Fermenting', 'Freezing', 'Dehydrating', 'Freeze Drying'];
const pantryCategoryDefaults = [
  'Vegetables',
  'Fruits',
  'Meat',
  'Dairy',
  'Grains',
  'Herbs',
  'Baked Goods',
  'Prepared Meals',
  'Snacks',
  'Condiments',
  'Drinks',
  'Other',
];
const pantryUnitDefaults = [
  'Jars',
  'Bags',
  'Lbs',
  'Oz',
  'Quarts',
  'Pints',
  'Gallons',
  'Packages',
  'Boxes',
  'Cans',
  'Bottles',
  'Bunches',
];
const pantryLocationDefaults = [
  'Pantry',
  'Freezer',
  'Root Cellar',
  'Fridge',
  'Basement',
  'Shed',
  'Garage',
  'Cold Room',
  'Other',
];
const harvestUnits = ['lb', 'kg', 'oz', 'bunches', 'bags', 'crates'];
const harvestAnimalOptions = ['Cow', 'Goat', 'Sheep', 'Rabbit', 'Chicken', 'Duck', 'Quail', 'Turkey', 'Pig', 'Bee'];
const incomeCategories = [
  'Cow',
  'Goat',
  'Sheep',
  'Pig',
  'Chicken',
  'Duck',
  'Rabbit',
  'Horse',
  'Bee',
  'Garden Produce',
  'Orchard Produce',
  'Honey',
  'Other',
];
const expenseCategories = ['Feed', 'Equipment', 'Seeds', 'Veterinary', 'Markets', 'Shelter', 'Other'];
const paymentMethods = ['Cash', 'Card', 'Check', 'Online'];

const calendarTheme = {
  backgroundColor: '#FFFFFF',
  calendarBackground: '#FFFFFF',
  textSectionTitleColor: '#4C7744',
  dayTextColor: '#3A2E24',
  todayTextColor: '#8B5E3C',
  monthTextColor: '#4C7744',
  arrowColor: '#4C7744',
  textMonthFontFamily: 'SedgwickAve',
  textDayHeaderFontFamily: 'SedgwickAve',
  textDayFontFamily: 'SedgwickAve',
  textDayFontSize: 14,
  textMonthFontSize: 16,
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultLogSettings = {
  livestock: {
    basicInfo: true,
    birthdate: true,
    quality: true,
    metrics: true,
    vetRecords: true,
    breeding: true,
    dairy: true,
    diet: true,
    profit: true,
  },
  garden: {
    bedInfo: true,
    plants: true,
    dates: true,
    soilWater: true,
    pestsWeather: true,
    fertilizer: true,
    growthStage: true,
    planning: true,
    notes: true,
  },
  pantry: {
    basics: true,
    storage: true,
    quantities: true,
    notes: true,
  },
  harvest: {
    basics: true,
    yield: true,
    location: true,
    storage: true,
    weather: true,
    notes: true,
  },
  finances: {
    basics: true,
    category: true,
    payment: true,
    receipt: true,
    notes: true,
  },
};

const basicLogSettings = {
  livestock: {
    basicInfo: true,
    birthdate: true,
    quality: false,
    metrics: true,
    vetRecords: false,
    breeding: false,
    dairy: false,
    diet: false,
    profit: false,
  },
  garden: {
    bedInfo: true,
    plants: true,
    dates: true,
    soilWater: false,
    pestsWeather: false,
    fertilizer: false,
    growthStage: false,
    planning: false,
    notes: true,
  },
  pantry: {
    basics: true,
    storage: true,
    quantities: false,
    notes: true,
  },
  harvest: {
    basics: true,
    yield: true,
    location: false,
    storage: false,
    weather: false,
    notes: true,
  },
  finances: {
    basics: true,
    category: true,
    payment: false,
    receipt: false,
    notes: true,
  },
};

const detailedLogSettings = defaultLogSettings;

const logBookSections = [
  {
    id: 'livestock',
    label: 'Livestock',
    icon: require('../../assets/HCIcons/Icon_Homestead/Icon_LivestockLog.png'),
  },
  {
    id: 'garden',
    label: 'Gardening',
    icon: require('../../assets/HCIcons/Icon_Homestead/Icon_GardeningLog.png'),
  },
  {
    id: 'pantry',
    label: 'Pantry',
    icon: require('../../assets/HCIcons/Icon_Homestead/Icon_PantryLog.png'),
  },
  {
    id: 'harvest',
    label: 'Harvest',
    icon: require('../../assets/HCIcons/Icon_Homestead/Icon_HarvestLog.png'),
  },
  {
    id: 'finances',
    label: 'Finances',
    icon: require('../../assets/HCIcons/Icon_Homestead/Icon_FinanceLog.png'),
  },
] as const;

export default function LogBookScreen() {
  const { addAlmanacEntry, addTradingListing } = useHomesteadData();
  const { showStatus } = useStatusOverlay();
  const [showLogSettings, setShowLogSettings] = useState(false);
  const [logSettings, setLogSettings] = useState(defaultLogSettings);
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [breedSelections, setBreedSelections] = useState<string[]>([]);
  const [breedOther, setBreedOther] = useState('');
  const [gender, setGender] = useState('');
  const [purpose, setPurpose] = useState<string[]>([]);
  const [showBreedPicker, setShowBreedPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
  const [animalName, setAnimalName] = useState('');
  const [pastureName, setPastureName] = useState('');
  const [pastureOptions, setPastureOptions] = useState<string[]>([]);
  const [showPasturePicker, setShowPasturePicker] = useState(false);
  const [newPastureName, setNewPastureName] = useState('');
  const [editingPastureIndex, setEditingPastureIndex] = useState<number | null>(null);
  const [pastureEditValue, setPastureEditValue] = useState('');
  const [goatPastureFilter, setGoatPastureFilter] = useState('All pastures');
  const [chickenCoopName, setChickenCoopName] = useState('');
  const [chickenCoopOptions, setChickenCoopOptions] = useState<string[]>([]);
  const [showChickenCoopPicker, setShowChickenCoopPicker] = useState(false);
  const [newChickenCoopName, setNewChickenCoopName] = useState('');
  const [editingChickenCoopIndex, setEditingChickenCoopIndex] = useState<number | null>(null);
  const [chickenCoopEditValue, setChickenCoopEditValue] = useState('');
  const [chickenCoopFilter, setChickenCoopFilter] = useState('All coops');
  const [pigPenName, setPigPenName] = useState('');
  const [pigPenOptions, setPigPenOptions] = useState<string[]>([]);
  const [showPigPenPicker, setShowPigPenPicker] = useState(false);
  const [newPigPenName, setNewPigPenName] = useState('');
  const [editingPigPenIndex, setEditingPigPenIndex] = useState<number | null>(null);
  const [pigPenEditValue, setPigPenEditValue] = useState('');
  const [pigPenFilter, setPigPenFilter] = useState('All pens');
  const [horsePastureName, setHorsePastureName] = useState('');
  const [horsePastureOptions, setHorsePastureOptions] = useState<string[]>([]);
  const [showHorsePasturePicker, setShowHorsePasturePicker] = useState(false);
  const [newHorsePastureName, setNewHorsePastureName] = useState('');
  const [editingHorsePastureIndex, setEditingHorsePastureIndex] = useState<number | null>(null);
  const [horsePastureEditValue, setHorsePastureEditValue] = useState('');
  const [horsePastureFilter, setHorsePastureFilter] = useState('All pastures');
  const [rabbitHousingOptions, setRabbitHousingOptions] = useState<string[]>([]);
  const [showRabbitHousingPicker, setShowRabbitHousingPicker] = useState(false);
  const [newRabbitHousingName, setNewRabbitHousingName] = useState('');
  const [editingRabbitHousingIndex, setEditingRabbitHousingIndex] = useState<number | null>(null);
  const [rabbitHousingEditValue, setRabbitHousingEditValue] = useState('');
  const [rabbitHousingType, setRabbitHousingType] = useState<'Cage' | 'Pen' | ''>('Cage');
  const [rabbitHousingName, setRabbitHousingName] = useState('');
  const [rabbitHousingFilter, setRabbitHousingFilter] = useState('All housing');
  const [birthdate, setBirthdate] = useState<string | null>(null);
  const [showBirthCalendar, setShowBirthCalendar] = useState(false);
  const [deformities, setDeformities] = useState('');
  const [showQuality, setShowQuality] = useState<'yes' | 'no' | ''>('');
  const [pedigree, setPedigree] = useState('');
  const [registration, setRegistration] = useState('');
  const [animalPhotoUri, setAnimalPhotoUri] = useState<string | null>(null);
  const [chickenLogType, setChickenLogType] = useState<'Individual' | 'Group' | ''>('');
  const [chickenGroupGenders, setChickenGroupGenders] = useState<string[]>([]);
  const [chickenHenCount, setChickenHenCount] = useState('');
  const [chickenRoosterCount, setChickenRoosterCount] = useState('');

  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState<'lb' | 'kg' | 'oz' | ''>('lb');
  const [weightDate, setWeightDate] = useState('');
  const [showWeightCalendar, setShowWeightCalendar] = useState(false);
  const [weightLogs, setWeightLogs] = useState<MetricEntry[]>([]);

  const [heightValue, setHeightValue] = useState('');
  const [heightUnit, setHeightUnit] = useState<'in' | 'cm' | 'ft' | ''>('in');
  const [heightDate, setHeightDate] = useState('');
  const [showHeightCalendar, setShowHeightCalendar] = useState(false);
  const [heightLogs, setHeightLogs] = useState<MetricEntry[]>([]);

  const [vaccineName, setVaccineName] = useState('');
  const [vaccineDate, setVaccineDate] = useState('');
  const [showVaccineCalendar, setShowVaccineCalendar] = useState(false);
  const [vaccineNotes, setVaccineNotes] = useState('');
  const [vaccineLogs, setVaccineLogs] = useState<SimpleLog[]>([]);

  const [wormingProduct, setWormingProduct] = useState('');
  const [wormingDate, setWormingDate] = useState('');
  const [showWormingCalendar, setShowWormingCalendar] = useState(false);
  const [wormingNotes, setWormingNotes] = useState('');
  const [wormingLogs, setWormingLogs] = useState<SimpleLog[]>([]);

  const [hoofDate, setHoofDate] = useState('');
  const [showHoofCalendar, setShowHoofCalendar] = useState(false);
  const [hoofNotes, setHoofNotes] = useState('');
  const [hoofLogs, setHoofLogs] = useState<SimpleLog[]>([]);

  const [vetApptReason, setVetApptReason] = useState('');
  const [vetApptDate, setVetApptDate] = useState('');
  const [showVetApptCalendar, setShowVetApptCalendar] = useState(false);
  const [vetApptNotes, setVetApptNotes] = useState('');
  const [vetApptLogs, setVetApptLogs] = useState<SimpleLog[]>([]);

  const [woundDate, setWoundDate] = useState('');
  const [showWoundCalendar, setShowWoundCalendar] = useState(false);
  const [woundNotes, setWoundNotes] = useState('');
  const [woundLogs, setWoundLogs] = useState<WoundLog[]>([]);
  const [followUpTargetId, setFollowUpTargetId] = useState<string | null>(null);
  const [followUpDate, setFollowUpDate] = useState('');
  const [showFollowUpCalendar, setShowFollowUpCalendar] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState('');

  const [udderCondition, setUdderCondition] = useState('');
  const [udderNotes, setUdderNotes] = useState('');
  const [milkDate, setMilkDate] = useState('');
  const [showMilkCalendar, setShowMilkCalendar] = useState(false);
  const [milkTime, setMilkTime] = useState<'AM' | 'PM' | ''>('');
  const [milkMethod, setMilkMethod] = useState<'Hand' | 'Machine' | ''>('');
  const [milkAmount, setMilkAmount] = useState('');
  const [milkAmountUnit, setMilkAmountUnit] = useState('');
  const [milkFat, setMilkFat] = useState('');
  const [milkTaste, setMilkTaste] = useState('');
  const [milkHandling, setMilkHandling] = useState('');
  const [milkLogs, setMilkLogs] = useState<MilkEntry[]>([]);

  const [grainBrand, setGrainBrand] = useState('');
  const [grainAmount, setGrainAmount] = useState('');
  const [grainAmountValue, setGrainAmountValue] = useState('');
  const [grainAmountUnit, setGrainAmountUnit] = useState('');
  const [hayType, setHayType] = useState('');
  const [hayForm, setHayForm] = useState<string[]>([]);
  const [minerals, setMinerals] = useState<string[]>([]);

  const [profitEntryType, setProfitEntryType] = useState('');
  const [profitEntryOther, setProfitEntryOther] = useState('');
  const [profitEntryQuantity, setProfitEntryQuantity] = useState('');
  const [profitEntryPrice, setProfitEntryPrice] = useState('');
  const [profitEntryNotes, setProfitEntryNotes] = useState('');
  const [profitEntryDate, setProfitEntryDate] = useState('');
  const [showProfitCalendar, setShowProfitCalendar] = useState(false);
  const [profitEntries, setProfitEntries] = useState<ProfitEntry[]>([]);
  const [deformityLogs, setDeformityLogs] = useState<SimpleLog[]>([]);
  const [selectedLivestockEntry, setSelectedLivestockEntry] = useState<LivestockLog | null>(null);
  const [editingLivestockId, setEditingLivestockId] = useState<string | null>(null);
  const [activeBeeSection, setActiveBeeSection] = useState<
    'home' | 'queen' | 'worker' | 'hive' | 'inspection' | 'health' | 'honey' | 'management' | 'seasonal'
  >('home');
  const [beeHives, setBeeHives] = useState<BeeHive[]>([]);
  const [selectedBeeHiveId, setSelectedBeeHiveId] = useState('');
  const [showBeeHivePicker, setShowBeeHivePicker] = useState(false);
  const [showBeePopulationPicker, setShowBeePopulationPicker] = useState(false);
  const [newBeeHiveName, setNewBeeHiveName] = useState('');
  const [renameBeeHiveName, setRenameBeeHiveName] = useState('');

  const [beePopulation, setBeePopulation] = useState('');
  const [beeQueenName, setBeeQueenName] = useState('');
  const [beeQueenMarking, setBeeQueenMarking] = useState('');
  const [beeQueenBreed, setBeeQueenBreed] = useState('');
  const [beeQueenOrigin, setBeeQueenOrigin] = useState('');
  const [beeQueenIntroduced, setBeeQueenIntroduced] = useState('');
  const [beeQueenLaying, setBeeQueenLaying] = useState('');
  const [beeQueenTemperament, setBeeQueenTemperament] = useState('');
  const [beeQueenReplacement, setBeeQueenReplacement] = useState('');
  const [beeQueenNotes, setBeeQueenNotes] = useState('');
  const [beeQueenLogs, setBeeQueenLogs] = useState<BeeQueenLog[]>([]);

  const [beeWorkerStrength, setBeeWorkerStrength] = useState('');
  const [beeWorkerBehavior, setBeeWorkerBehavior] = useState('');
  const [beeWorkerAggression, setBeeWorkerAggression] = useState('');
  const [beeWorkerDronePresence, setBeeWorkerDronePresence] = useState('');
  const [beeWorkerBrood, setBeeWorkerBrood] = useState('');
  const [beeWorkerNotes, setBeeWorkerNotes] = useState('');
  const [beeWorkerLogs, setBeeWorkerLogs] = useState<BeeWorkerLog[]>([]);

  const [beeInspectionDate, setBeeInspectionDate] = useState('');
  const [beeInspectionChecks, setBeeInspectionChecks] = useState<string[]>([]);
  const [beeInspectionNotes, setBeeInspectionNotes] = useState('');
  const [beeInspectionLogs, setBeeInspectionLogs] = useState<BeeInspectionLog[]>([]);

  const [beeHealthDate, setBeeHealthDate] = useState('');
  const [beeHealthVarroa, setBeeHealthVarroa] = useState('');
  const [beeHealthTreatment, setBeeHealthTreatment] = useState('');
  const [beeHealthTreatmentDate, setBeeHealthTreatmentDate] = useState('');
  const [beeHealthResults, setBeeHealthResults] = useState('');
  const [beeHealthSymptoms, setBeeHealthSymptoms] = useState('');
  const [beeHealthLogs, setBeeHealthLogs] = useState<BeeHealthLog[]>([]);

  const [beeHoneyDate, setBeeHoneyDate] = useState('');
  const [beeHoneySupersAdded, setBeeHoneySupersAdded] = useState('');
  const [beeHoneySupersRemoved, setBeeHoneySupersRemoved] = useState('');
  const [beeHoneyFrames, setBeeHoneyFrames] = useState('');
  const [beeHoneyAmount, setBeeHoneyAmount] = useState('');
  const [beeHoneyUnit, setBeeHoneyUnit] = useState('lbs');
  const [beeHoneyType, setBeeHoneyType] = useState('');
  const [beeHoneyLeft, setBeeHoneyLeft] = useState('');
  const [beeHoneyNotes, setBeeHoneyNotes] = useState('');
  const [beeHoneyLogs, setBeeHoneyLogs] = useState<BeeHoneyLog[]>([]);

  const [beeManagementDate, setBeeManagementDate] = useState('');
  const [beeManagementActions, setBeeManagementActions] = useState<string[]>([]);
  const [beeManagementSyrupType, setBeeManagementSyrupType] = useState('');
  const [beeManagementSyrupAmount, setBeeManagementSyrupAmount] = useState('');
  const [beeManagementNotes, setBeeManagementNotes] = useState('');
  const [beeManagementLogs, setBeeManagementLogs] = useState<BeeManagementLog[]>([]);

  const [beeSeasonalDate, setBeeSeasonalDate] = useState('');
  const [beeSeasonalActions, setBeeSeasonalActions] = useState<string[]>([]);
  const [beeSeasonalInsulation, setBeeSeasonalInsulation] = useState('');
  const [beeSeasonalReducers, setBeeSeasonalReducers] = useState('');
  const [beeSeasonalStores, setBeeSeasonalStores] = useState('');
  const [beeSeasonalSpringStatus, setBeeSeasonalSpringStatus] = useState('');
  const [beeSeasonalNotes, setBeeSeasonalNotes] = useState('');
  const [beeSeasonalLogs, setBeeSeasonalLogs] = useState<BeeSeasonalLog[]>([]);
  const [expandedProfileSections, setExpandedProfileSections] = useState<string[]>([]);
  const [profileWeightValue, setProfileWeightValue] = useState('');
  const [profileWeightUnit, setProfileWeightUnit] = useState<'lb' | 'kg' | 'oz'>('lb');
  const [profileWeightDate, setProfileWeightDate] = useState('');
  const [profileDeformityNotes, setProfileDeformityNotes] = useState('');
  const [profileDeformityDate, setProfileDeformityDate] = useState('');
  const [profileHoofNotes, setProfileHoofNotes] = useState('');
  const [profileHoofDate, setProfileHoofDate] = useState('');
  const [profileWoundNotes, setProfileWoundNotes] = useState('');
  const [profileWoundDate, setProfileWoundDate] = useState('');
  const [profileVaccineName, setProfileVaccineName] = useState('');
  const [profileVaccineDate, setProfileVaccineDate] = useState('');
  const [profileVaccineNotes, setProfileVaccineNotes] = useState('');
  const [profileWormingProduct, setProfileWormingProduct] = useState('');
  const [profileWormingDate, setProfileWormingDate] = useState('');
  const [profileWormingNotes, setProfileWormingNotes] = useState('');
  const [profileProfitType, setProfileProfitType] = useState('');
  const [profileProfitOther, setProfileProfitOther] = useState('');
  const [profileProfitQuantity, setProfileProfitQuantity] = useState('');
  const [profileProfitPrice, setProfileProfitPrice] = useState('');
  const [profileProfitDate, setProfileProfitDate] = useState('');
  const [profileProfitNotes, setProfileProfitNotes] = useState('');
  const [activeSection, setActiveSection] = useState<
    'livestock' | 'garden' | 'pantry' | 'harvest' | 'finances' | null
  >(null);
  const [showSubmitMessage, setShowSubmitMessage] = useState(false);
  const [showCreateLog, setShowCreateLog] = useState(false);
  const [livestockLogs, setLivestockLogs] = useState<LivestockLog[]>([]);
  const [expandedLivestockGroups, setExpandedLivestockGroups] = useState<string[]>([]);
  const [showLivestockFilters, setShowLivestockFilters] = useState(false);
  const [livestockSpeciesFilter, setLivestockSpeciesFilter] = useState('All species');
  const [savedLivestockFilters, setSavedLivestockFilters] = useState<{ species: string }[]>([]);
  const [selectedLivestockSpecies, setSelectedLivestockSpecies] = useState<string | null>(null);
  const [visibleLivestockSpecies, setVisibleLivestockSpecies] = useState<string[]>(animals);
  const [gardenCrop, setGardenCrop] = useState('');
  const [gardenTask, setGardenTask] = useState('');
  const [gardenDate, setGardenDate] = useState('');
  const [showGardenDateCalendar, setShowGardenDateCalendar] = useState(false);
  const [gardenBeds, setGardenBeds] = useState<string[]>(['Bed 1']);
  const [selectedBed, setSelectedBed] = useState('');
  const [gardenBedFilter, setGardenBedFilter] = useState('All Beds');
  const [gardenEventFilters, setGardenEventFilters] = useState<string[]>([]);
  const [showGardenFilters, setShowGardenFilters] = useState(false);
  const [savedGardenFilters, setSavedGardenFilters] = useState<
    { bed: string; events: string[] }[]
  >([]);
  const [showPantryFilters, setShowPantryFilters] = useState(false);
  const [pantryMethodFilter, setPantryMethodFilter] = useState('All methods');
  const [pantryTypeFilter, setPantryTypeFilter] = useState('All types');
  const [pantryCategoryFilter, setPantryCategoryFilter] = useState('All categories');
  const [pantryLocationFilter, setPantryLocationFilter] = useState('All locations');
  const [pantryUseByFilter, setPantryUseByFilter] = useState('Any use-by');
  const [pantryStockFilter, setPantryStockFilter] = useState('All stock');
  const [savedPantryFilters, setSavedPantryFilters] = useState<
    { method: string; type: string; category: string; location: string; useBy: string; stock: string }[]
  >([]);
  const [showHarvestFilters, setShowHarvestFilters] = useState(false);
  const [harvestLocationFilter, setHarvestLocationFilter] = useState('All locations');
  const [harvestStorageFilter, setHarvestStorageFilter] = useState('All storage');
  const [savedHarvestFilters, setSavedHarvestFilters] = useState<
    { location: string; storage: string }[]
  >([]);
  const [showFinanceFilters, setShowFinanceFilters] = useState(false);
  const [financeTypeFilter, setFinanceTypeFilter] = useState<string[]>([]);
  const [financeCategoryFilter, setFinanceCategoryFilter] = useState<string[]>([]);
  const [savedFinanceFilters, setSavedFinanceFilters] = useState<
    { type: string[]; category: string[]; animals: string[]; units: string[] }[]
  >([]);
  const [financeMonthFilter, setFinanceMonthFilter] = useState('All months');
  const [financeUnitFilter, setFinanceUnitFilter] = useState<string[]>([]);
  const [newBedName, setNewBedName] = useState('');
  const [renameBedName, setRenameBedName] = useState('');
  const [gardenPlants, setGardenPlants] = useState<string[]>([]);
  const [gardenPrepDate, setGardenPrepDate] = useState('');
  const [showGardenPrepCalendar, setShowGardenPrepCalendar] = useState(false);
  const [gardenPrepNotes, setGardenPrepNotes] = useState('');
  const [gardenSeedDate, setGardenSeedDate] = useState('');
  const [showGardenSeedCalendar, setShowGardenSeedCalendar] = useState(false);
  const [gardenSoil, setGardenSoil] = useState('');
  const [gardenWatering, setGardenWatering] = useState('');
  const [gardenPests, setGardenPests] = useState('');
  const [gardenFertilizer, setGardenFertilizer] = useState('');
  const [gardenFertilizerDate, setGardenFertilizerDate] = useState('');
  const [showGardenFertilizerCalendar, setShowGardenFertilizerCalendar] = useState(false);
  const [gardenWeather, setGardenWeather] = useState('');
  const [gardenStage, setGardenStage] = useState('');
  const [gardenNotes, setGardenNotes] = useState('');
  const [gardenPlanPrepDate, setGardenPlanPrepDate] = useState('');
  const [showGardenPlanPrepCalendar, setShowGardenPlanPrepCalendar] = useState(false);
  const [gardenPlanPrepLead, setGardenPlanPrepLead] = useState('');
  const [gardenPlanSeedDate, setGardenPlanSeedDate] = useState('');
  const [showGardenPlanSeedCalendar, setShowGardenPlanSeedCalendar] = useState(false);
  const [gardenPlanSeedLead, setGardenPlanSeedLead] = useState('');
  const [gardenPlanFertilizeDate, setGardenPlanFertilizeDate] = useState('');
  const [showGardenPlanFertilizeCalendar, setShowGardenPlanFertilizeCalendar] = useState(false);
  const [gardenPlanFertilizeLead, setGardenPlanFertilizeLead] = useState('');
  const [gardenLogs, setGardenLogs] = useState<GardenLog[]>([]);
  const [editingGardenId, setEditingGardenId] = useState<string | null>(null);
  const [harvestLogs, setHarvestLogs] = useState<HarvestLog[]>([]);
  const [editingHarvestId, setEditingHarvestId] = useState<string | null>(null);
  const [pantryItem, setPantryItem] = useState('');
  const [pantryType, setPantryType] = useState('');
  const [pantryMethod, setPantryMethod] = useState('');
  const [pantryCategory, setPantryCategory] = useState('');
  const [pantryBatch, setPantryBatch] = useState('');
  const [pantryDate, setPantryDate] = useState('');
  const [showPantryCalendar, setShowPantryCalendar] = useState(false);
  const [pantryUseBy, setPantryUseBy] = useState('');
  const [showPantryUseByCalendar, setShowPantryUseByCalendar] = useState(false);
  const [pantryLocation, setPantryLocation] = useState('');
  const [pantryQuantity, setPantryQuantity] = useState('');
  const [pantryQuantityUnit, setPantryQuantityUnit] = useState('');
  const [pantryIngredients, setPantryIngredients] = useState('');
  const [pantryNotes, setPantryNotes] = useState('');
  const [showPantryTypePicker, setShowPantryTypePicker] = useState(false);
  const [showPantryMethodPicker, setShowPantryMethodPicker] = useState(false);
  const [showPantryCategoryPicker, setShowPantryCategoryPicker] = useState(false);
  const [showPantryLocationPicker, setShowPantryLocationPicker] = useState(false);
  const [showPantryUnitPicker, setShowPantryUnitPicker] = useState(false);
  const [pantryNewCategory, setPantryNewCategory] = useState('');
  const [pantryRenameCategory, setPantryRenameCategory] = useState('');
  const [customPantryCategories, setCustomPantryCategories] = useState<string[]>([]);
  const [pantryLogs, setPantryLogs] = useState<PantryLog[]>([]);
  const [editingPantryId, setEditingPantryId] = useState<string | null>(null);
  const [harvestItem, setHarvestItem] = useState('');
  const [harvestYield, setHarvestYield] = useState('');
  const [harvestYieldUnit, setHarvestYieldUnit] = useState('lb');
  const [harvestDate, setHarvestDate] = useState('');
  const [showHarvestCalendar, setShowHarvestCalendar] = useState(false);
  const [harvestQuality, setHarvestQuality] = useState('');
  const [harvestLocation, setHarvestLocation] = useState('');
  const [harvestStorage, setHarvestStorage] = useState('');
  const [harvestWeather, setHarvestWeather] = useState('');
  const [harvestNotes, setHarvestNotes] = useState('');
  const [financeType, setFinanceType] = useState<'Income' | 'Expense' | ''>('');
  const [financeCategory, setFinanceCategory] = useState('');
  const [financeSubcategory, setFinanceSubcategory] = useState('');
  const [financeNewSubcategory, setFinanceNewSubcategory] = useState('');
  const [financeAnimalType, setFinanceAnimalType] = useState('');
  const [financeAnimalFilter, setFinanceAnimalFilter] = useState<string[]>([]);
  const [financeNewCategory, setFinanceNewCategory] = useState('');
  const [customIncomeCategories, setCustomIncomeCategories] = useState<string[]>([]);
  const [customExpenseCategories, setCustomExpenseCategories] = useState<string[]>([]);
  const [customFinanceVendors, setCustomFinanceVendors] = useState<string[]>([]);
  const [customFinanceSubcategories, setCustomFinanceSubcategories] = useState<Record<string, string[]>>(
    {}
  );
  const [financeAmount, setFinanceAmount] = useState('');
  const [financeQuantity, setFinanceQuantity] = useState('');
  const [financeQuantityUnit, setFinanceQuantityUnit] = useState('');
  const [financeDate, setFinanceDate] = useState('');
  const [showFinanceCalendar, setShowFinanceCalendar] = useState(false);
  const [financeVendor, setFinanceVendor] = useState('');
  const [financeNewVendor, setFinanceNewVendor] = useState('');
  const [financePaymentMethod, setFinancePaymentMethod] = useState('');
  const [financeReceipt, setFinanceReceipt] = useState('');
  const [financeReceiptUri, setFinanceReceiptUri] = useState<string | null>(null);
  const [financeNotes, setFinanceNotes] = useState('');
  const [financeRecurringFrequency, setFinanceRecurringFrequency] = useState('');
  const [financeLogs, setFinanceLogs] = useState<FinanceLog[]>([]);
  const [editingFinanceId, setEditingFinanceId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const resetDraftFields = (options?: {
    preserveSection?: boolean;
    preserveCreateLog?: boolean;
    preserveSpecies?: boolean;
  }) => {
    const preserveSection = options?.preserveSection ?? false;
    const preserveCreateLog = options?.preserveCreateLog ?? false;
    const preserveSpecies = options?.preserveSpecies ?? false;
    const currentSection = activeSection;
    const currentCreateLog = showCreateLog;
    const currentSpecies = selectedLivestockSpecies;

    setActiveSection(preserveSection ? currentSection : null);
    setShowCreateLog(preserveCreateLog ? currentCreateLog : false);
    setShowSubmitMessage(false);
    setSpecies(preserveSpecies && currentSpecies ? currentSpecies : '');
    setBreed('');
    setBreedSelections([]);
    setBreedOther('');
    setGender('');
    setPurpose([]);
    setAnimalName('');
    setPastureName('');
    setChickenCoopName('');
    setPigPenName('');
    setHorsePastureName('');
    setShowChickenCoopPicker(false);
    setNewChickenCoopName('');
    setEditingChickenCoopIndex(null);
    setChickenCoopEditValue('');
    setRabbitHousingType('Cage');
    setRabbitHousingName('');
    setShowRabbitHousingPicker(false);
    setNewRabbitHousingName('');
    setEditingRabbitHousingIndex(null);
    setRabbitHousingEditValue('');
    setShowPasturePicker(false);
    setShowPigPenPicker(false);
    setShowHorsePasturePicker(false);
    setNewPastureName('');
    setEditingPastureIndex(null);
    setPastureEditValue('');
    setNewPigPenName('');
    setEditingPigPenIndex(null);
    setPigPenEditValue('');
    setNewHorsePastureName('');
    setEditingHorsePastureIndex(null);
    setHorsePastureEditValue('');
    setAnimalPhotoUri(null);
    setChickenLogType('');
    setChickenGroupGenders([]);
    setChickenHenCount('');
    setChickenRoosterCount('');
    setBirthdate(null);
    setDeformities('');
    setShowQuality('');
    setPedigree('');
    setRegistration('');
    setWeightValue('');
    setWeightUnit('lb');
    setWeightDate('');
    setHeightValue('');
    setHeightUnit('in');
    setHeightDate('');
    setVaccineName('');
    setVaccineDate('');
    setVaccineNotes('');
    setWormingProduct('');
    setWormingDate('');
    setWormingNotes('');
    setHoofDate('');
    setHoofNotes('');
    setVetApptReason('');
    setVetApptDate('');
    setVetApptNotes('');
    setWoundDate('');
    setWoundNotes('');
    setFollowUpDate('');
    setFollowUpNotes('');
    setUdderCondition('');
    setUdderNotes('');
    setMilkDate('');
    setMilkTime('');
    setMilkMethod('');
    setMilkAmount('');
    setMilkAmountUnit('');
    setMilkFat('');
    setMilkTaste('');
    setMilkHandling('');
    setGrainBrand('');
    setGrainAmount('');
    setGrainAmountValue('');
    setGrainAmountUnit('');
    setHayType('');
    setHayForm([]);
    setMinerals([]);
    setProfitEntries([]);
    setProfitEntryType('');
    setProfitEntryOther('');
    setProfitEntryQuantity('');
    setProfitEntryPrice('');
    setProfitEntryNotes('');
    setProfitEntryDate('');
    setShowProfitCalendar(false);
    setWeightLogs([]);
    setHeightLogs([]);
    setVaccineLogs([]);
    setWormingLogs([]);
    setHoofLogs([]);
    setVetApptLogs([]);
    setWoundLogs([]);
    setMilkLogs([]);
    setEditingLivestockId(null);
    setDeformityLogs([]);
    setActiveBeeSection('home');
    setSelectedBeeHiveId('');
    setShowBeeHivePicker(false);
    setShowBeePopulationPicker(false);
    setNewBeeHiveName('');
    setRenameBeeHiveName('');
    setBeePopulation('');
    setBeeQueenName('');
    setBeeQueenMarking('');
    setBeeQueenBreed('');
    setBeeQueenOrigin('');
    setBeeQueenIntroduced('');
    setBeeQueenLaying('');
    setBeeQueenTemperament('');
    setBeeQueenReplacement('');
    setBeeQueenNotes('');
    setBeeWorkerStrength('');
    setBeeWorkerBehavior('');
    setBeeWorkerAggression('');
    setBeeWorkerDronePresence('');
    setBeeWorkerBrood('');
    setBeeWorkerNotes('');
    setBeeInspectionDate('');
    setBeeInspectionChecks([]);
    setBeeInspectionNotes('');
    setBeeHealthDate('');
    setBeeHealthVarroa('');
    setBeeHealthTreatment('');
    setBeeHealthTreatmentDate('');
    setBeeHealthResults('');
    setBeeHealthSymptoms('');
    setBeeHoneyDate('');
    setBeeHoneySupersAdded('');
    setBeeHoneySupersRemoved('');
    setBeeHoneyFrames('');
    setBeeHoneyAmount('');
    setBeeHoneyUnit('lbs');
    setBeeHoneyType('');
    setBeeHoneyLeft('');
    setBeeHoneyNotes('');
    setBeeManagementDate('');
    setBeeManagementActions([]);
    setBeeManagementSyrupType('');
    setBeeManagementSyrupAmount('');
    setBeeManagementNotes('');
    setBeeSeasonalDate('');
    setBeeSeasonalActions([]);
    setBeeSeasonalInsulation('');
    setBeeSeasonalReducers('');
    setBeeSeasonalStores('');
    setBeeSeasonalSpringStatus('');
    setBeeSeasonalNotes('');
    setGardenCrop('');
    setGardenTask('');
    setGardenDate('');
    setSelectedBed('');
    setGardenPlants([]);
    setGardenPrepDate('');
    setGardenPrepNotes('');
    setGardenSeedDate('');
    setGardenSoil('');
    setGardenWatering('');
    setGardenPests('');
    setGardenFertilizer('');
    setGardenFertilizerDate('');
    setGardenWeather('');
    setGardenStage('');
    setGardenNotes('');
    setGardenPlanPrepDate('');
    setGardenPlanPrepLead('');
    setGardenPlanSeedDate('');
    setGardenPlanSeedLead('');
    setGardenPlanFertilizeDate('');
    setGardenPlanFertilizeLead('');
    setPantryItem('');
    setPantryType('');
    setPantryMethod('');
    setPantryCategory('');
    setPantryBatch('');
    setPantryDate('');
    setPantryUseBy('');
    setPantryLocation('');
    setPantryQuantity('');
    setPantryQuantityUnit('');
    setPantryIngredients('');
    setPantryNotes('');
    setShowPantryTypePicker(false);
    setShowPantryMethodPicker(false);
    setShowPantryCategoryPicker(false);
    setShowPantryLocationPicker(false);
    setShowPantryUnitPicker(false);
    setShowPantryUseByCalendar(false);
    setPantryNewCategory('');
    setPantryRenameCategory('');
    setHarvestItem('');
    setHarvestYield('');
    setHarvestYieldUnit('lb');
    setHarvestDate('');
    setHarvestQuality('');
    setHarvestLocation('');
    setHarvestStorage('');
    setHarvestWeather('');
    setHarvestNotes('');
    setFinanceType('');
    setFinanceCategory('');
    setFinanceAnimalType('');
    setFinanceNewCategory('');
    setFinanceAmount('');
    setFinanceSubcategory('');
    setFinanceNewSubcategory('');
    setFinanceNewVendor('');
    setFinanceDate('');
    setFinanceVendor('');
    setFinancePaymentMethod('');
    setFinanceReceipt('');
    setFinanceNotes('');
    setFinanceReceiptUri(null);
    setFinanceRecurringFrequency('');
    setFinanceQuantity('');
    setFinanceQuantityUnit('');
  };

  const clearDraft = () => {
    Alert.alert('Clear draft?', 'This removes any in-progress form data on this screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          resetDraftFields({ preserveSection: true, preserveCreateLog: true });
          setAnimalPhotoUri(null);
          setEditingLivestockId(null);
          try {
            const stored = await AsyncStorage.getItem('homestead:log-book');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed && typeof parsed === 'object') {
                delete parsed.draft;
                await AsyncStorage.setItem('homestead:log-book', JSON.stringify(parsed));
              }
            }
          } catch {
            // Ignore storage errors.
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('homestead:log-book');
        if (!stored) {
          setDataLoaded(true);
          return;
        }
        const parsed = JSON.parse(stored);
        if (parsed.logSettings) setLogSettings(parsed.logSettings);
        if (Array.isArray(parsed.gardenBeds)) setGardenBeds(parsed.gardenBeds);
        if (Array.isArray(parsed.gardenLogs)) setGardenLogs(parsed.gardenLogs);
        if (Array.isArray(parsed.pantryLogs)) setPantryLogs(parsed.pantryLogs);
        if (Array.isArray(parsed.harvestLogs)) setHarvestLogs(parsed.harvestLogs);
        if (Array.isArray(parsed.financeLogs)) setFinanceLogs(parsed.financeLogs);
        if (Array.isArray(parsed.weightLogs)) setWeightLogs(parsed.weightLogs);
        if (Array.isArray(parsed.heightLogs)) setHeightLogs(parsed.heightLogs);
        if (Array.isArray(parsed.vaccineLogs)) setVaccineLogs(parsed.vaccineLogs);
        if (Array.isArray(parsed.wormingLogs)) setWormingLogs(parsed.wormingLogs);
        if (Array.isArray(parsed.hoofLogs)) setHoofLogs(parsed.hoofLogs);
        if (Array.isArray(parsed.vetApptLogs)) setVetApptLogs(parsed.vetApptLogs);
        if (Array.isArray(parsed.woundLogs)) setWoundLogs(parsed.woundLogs);
        if (Array.isArray(parsed.milkLogs)) setMilkLogs(parsed.milkLogs);
        if (Array.isArray(parsed.livestockLogs)) setLivestockLogs(parsed.livestockLogs);
        if (Array.isArray(parsed.beeHives)) setBeeHives(parsed.beeHives);
        if (Array.isArray(parsed.beeQueenLogs)) setBeeQueenLogs(parsed.beeQueenLogs);
        if (Array.isArray(parsed.beeWorkerLogs)) setBeeWorkerLogs(parsed.beeWorkerLogs);
        if (Array.isArray(parsed.beeInspectionLogs)) setBeeInspectionLogs(parsed.beeInspectionLogs);
        if (Array.isArray(parsed.beeHealthLogs)) setBeeHealthLogs(parsed.beeHealthLogs);
        if (Array.isArray(parsed.beeHoneyLogs)) setBeeHoneyLogs(parsed.beeHoneyLogs);
        if (Array.isArray(parsed.beeManagementLogs)) setBeeManagementLogs(parsed.beeManagementLogs);
        if (Array.isArray(parsed.beeSeasonalLogs)) setBeeSeasonalLogs(parsed.beeSeasonalLogs);
        if (Array.isArray(parsed.pastureOptions)) setPastureOptions(parsed.pastureOptions);
        if (Array.isArray(parsed.chickenCoopOptions)) setChickenCoopOptions(parsed.chickenCoopOptions);
        if (Array.isArray(parsed.pigPenOptions)) setPigPenOptions(parsed.pigPenOptions);
        if (Array.isArray(parsed.horsePastureOptions)) setHorsePastureOptions(parsed.horsePastureOptions);
        if (Array.isArray(parsed.rabbitHousingOptions)) setRabbitHousingOptions(parsed.rabbitHousingOptions);
        if (Array.isArray(parsed.customIncomeCategories)) setCustomIncomeCategories(parsed.customIncomeCategories);
        if (Array.isArray(parsed.customExpenseCategories)) setCustomExpenseCategories(parsed.customExpenseCategories);
        if (Array.isArray(parsed.customFinanceVendors)) setCustomFinanceVendors(parsed.customFinanceVendors);
        if (parsed.customFinanceSubcategories && typeof parsed.customFinanceSubcategories === 'object') {
          setCustomFinanceSubcategories(parsed.customFinanceSubcategories);
        }
        if (Array.isArray(parsed.customPantryCategories)) setCustomPantryCategories(parsed.customPantryCategories);
        if (Array.isArray(parsed.savedGardenFilters)) setSavedGardenFilters(parsed.savedGardenFilters);
        if (Array.isArray(parsed.savedLivestockFilters)) setSavedLivestockFilters(parsed.savedLivestockFilters);
        if (Array.isArray(parsed.livestockSpeciesVisible)) {
          setVisibleLivestockSpecies(parsed.livestockSpeciesVisible);
        }
        if (Array.isArray(parsed.savedPantryFilters)) {
          const normalized = parsed.savedPantryFilters.map((filter: any) => ({
            method: filter?.method ?? 'All methods',
            type: filter?.type ?? 'All types',
            category: filter?.category ?? 'All categories',
            location: filter?.location ?? 'All locations',
            useBy: filter?.useBy ?? 'Any use-by',
            stock: filter?.stock ?? 'All stock',
          }));
          setSavedPantryFilters(normalized);
        }
        if (Array.isArray(parsed.savedHarvestFilters)) setSavedHarvestFilters(parsed.savedHarvestFilters);
        if (Array.isArray(parsed.savedFinanceFilters)) {
          const normalized = parsed.savedFinanceFilters.map((filter: any) => ({
            type: Array.isArray(filter?.type) ? filter.type : filter?.type ? [filter.type] : [],
            category: Array.isArray(filter?.category) ? filter.category : filter?.category ? [filter.category] : [],
            animals: Array.isArray(filter?.animals) ? filter.animals : [],
            units: Array.isArray(filter?.units) ? filter.units : [],
          }));
          setSavedFinanceFilters(normalized);
        }
        if (parsed.draft) {
          const draft = parsed.draft;
          if (draft.activeSection) setActiveSection(draft.activeSection);
          if (typeof draft.showCreateLog === 'boolean') setShowCreateLog(draft.showCreateLog);
          setSpecies(draft.species ?? '');
          setBreed(draft.breed ?? '');
          setBreedSelections(Array.isArray(draft.breedSelections) ? draft.breedSelections : []);
          setGender(draft.gender ?? '');
          setBreedOther(draft.breedOther ?? '');
          setPurpose(Array.isArray(draft.purpose) ? draft.purpose : []);
          setAnimalName(draft.animalName ?? '');
          setPastureName(draft.pastureName ?? '');
          setChickenCoopName(draft.chickenCoopName ?? '');
          setPigPenName(draft.pigPenName ?? '');
          setHorsePastureName(draft.horsePastureName ?? '');
          setRabbitHousingType(draft.rabbitHousingType ?? 'Cage');
          setRabbitHousingName(draft.rabbitHousingName ?? '');
          setChickenLogType(draft.chickenLogType ?? '');
          setChickenGroupGenders(
            Array.isArray(draft.chickenGroupGenders) ? draft.chickenGroupGenders : []
          );
          setChickenHenCount(draft.chickenHenCount ?? '');
          setChickenRoosterCount(draft.chickenRoosterCount ?? '');
          setBirthdate(draft.birthdate ?? null);
          setDeformities(draft.deformities ?? '');
          setShowQuality(draft.showQuality ?? '');
          setPedigree(draft.pedigree ?? '');
          setRegistration(draft.registration ?? '');
          setWeightValue(draft.weightValue ?? '');
          setWeightUnit(draft.weightUnit ?? 'lb');
          setWeightDate(draft.weightDate ?? '');
          setHeightValue(draft.heightValue ?? '');
          setHeightUnit(draft.heightUnit ?? 'in');
          setHeightDate(draft.heightDate ?? '');
          setVaccineName(draft.vaccineName ?? '');
          setVaccineDate(draft.vaccineDate ?? '');
          setVaccineNotes(draft.vaccineNotes ?? '');
          setWormingProduct(draft.wormingProduct ?? '');
          setWormingDate(draft.wormingDate ?? '');
          setWormingNotes(draft.wormingNotes ?? '');
          setHoofDate(draft.hoofDate ?? '');
          setHoofNotes(draft.hoofNotes ?? '');
          setVetApptReason(draft.vetApptReason ?? '');
          setVetApptDate(draft.vetApptDate ?? '');
          setVetApptNotes(draft.vetApptNotes ?? '');
          setWoundDate(draft.woundDate ?? '');
          setWoundNotes(draft.woundNotes ?? '');
          setFollowUpDate(draft.followUpDate ?? '');
          setFollowUpNotes(draft.followUpNotes ?? '');
          setUdderCondition(draft.udderCondition ?? '');
          setUdderNotes(draft.udderNotes ?? '');
          setMilkDate(draft.milkDate ?? '');
          setMilkTime(draft.milkTime ?? '');
          setMilkMethod(draft.milkMethod ?? '');
          setMilkAmount(draft.milkAmount ?? '');
          setMilkAmountUnit(draft.milkAmountUnit ?? '');
          setMilkFat(draft.milkFat ?? '');
          setMilkTaste(draft.milkTaste ?? '');
          setMilkHandling(draft.milkHandling ?? '');
          setGrainBrand(draft.grainBrand ?? '');
          setGrainAmount(draft.grainAmount ?? '');
          setGrainAmountValue(draft.grainAmountValue ?? '');
          setGrainAmountUnit(draft.grainAmountUnit ?? '');
          setHayType(draft.hayType ?? '');
          setHayForm(Array.isArray(draft.hayForm) ? draft.hayForm : []);
          setMinerals(Array.isArray(draft.minerals) ? draft.minerals : []);
          setDeformityLogs(Array.isArray(draft.deformityLogs) ? draft.deformityLogs : []);
          setProfitEntries(Array.isArray(draft.profitEntries) ? draft.profitEntries : []);
          setProfitEntryType(draft.profitEntryType ?? '');
          setProfitEntryOther(draft.profitEntryOther ?? '');
          setProfitEntryQuantity(draft.profitEntryQuantity ?? '');
          setProfitEntryPrice(draft.profitEntryPrice ?? '');
          setProfitEntryNotes(draft.profitEntryNotes ?? '');
          setProfitEntryDate(draft.profitEntryDate ?? '');
          setGardenCrop(draft.gardenCrop ?? '');
          setGardenTask(draft.gardenTask ?? '');
          setGardenDate(draft.gardenDate ?? '');
          setSelectedBed(draft.selectedBed ?? '');
          setGardenPlants(Array.isArray(draft.gardenPlants) ? draft.gardenPlants : []);
          setGardenPrepDate(draft.gardenPrepDate ?? '');
          setGardenPrepNotes(draft.gardenPrepNotes ?? '');
          setGardenSeedDate(draft.gardenSeedDate ?? '');
          setGardenSoil(draft.gardenSoil ?? '');
          setGardenWatering(draft.gardenWatering ?? '');
          setGardenPests(draft.gardenPests ?? '');
          setGardenFertilizer(draft.gardenFertilizer ?? '');
          setGardenFertilizerDate(draft.gardenFertilizerDate ?? '');
          setGardenWeather(draft.gardenWeather ?? '');
          setGardenStage(draft.gardenStage ?? '');
          setGardenNotes(draft.gardenNotes ?? '');
          setGardenPlanPrepDate(draft.gardenPlanPrepDate ?? '');
          setGardenPlanPrepLead(draft.gardenPlanPrepLead ?? '');
          setGardenPlanSeedDate(draft.gardenPlanSeedDate ?? '');
          setGardenPlanSeedLead(draft.gardenPlanSeedLead ?? '');
          setGardenPlanFertilizeDate(draft.gardenPlanFertilizeDate ?? '');
          setGardenPlanFertilizeLead(draft.gardenPlanFertilizeLead ?? '');
          setPantryItem(draft.pantryItem ?? '');
          setPantryType(draft.pantryType ?? '');
          setPantryMethod(draft.pantryMethod ?? '');
          setPantryCategory(draft.pantryCategory ?? '');
          setPantryBatch(draft.pantryBatch ?? '');
          setPantryDate(draft.pantryDate ?? '');
          setPantryUseBy(draft.pantryUseBy ?? '');
          setPantryLocation(draft.pantryLocation ?? '');
          setPantryQuantity(draft.pantryQuantity ?? draft.pantryJarCount ?? '');
          setPantryQuantityUnit(draft.pantryQuantityUnit ?? '');
          setPantryIngredients(draft.pantryIngredients ?? '');
          setPantryNotes(draft.pantryNotes ?? '');
          setHarvestItem(draft.harvestItem ?? '');
          setHarvestYield(draft.harvestYield ?? '');
          setHarvestYieldUnit(draft.harvestYieldUnit ?? 'lb');
          setHarvestDate(draft.harvestDate ?? '');
          setHarvestQuality(draft.harvestQuality ?? '');
          setHarvestLocation(draft.harvestLocation ?? '');
          setHarvestStorage(draft.harvestStorage ?? '');
          setHarvestWeather(draft.harvestWeather ?? '');
          setHarvestNotes(draft.harvestNotes ?? '');
          setFinanceType(draft.financeType ?? '');
          setFinanceCategory(draft.financeCategory ?? '');
          setFinanceSubcategory(draft.financeSubcategory ?? '');
          setFinanceNewSubcategory(draft.financeNewSubcategory ?? '');
          setFinanceAnimalType(draft.financeAnimalType ?? '');
          setFinanceNewCategory(draft.financeNewCategory ?? '');
          setFinanceAmount(draft.financeAmount ?? '');
          setFinanceQuantity(draft.financeQuantity ?? '');
          setFinanceQuantityUnit(draft.financeQuantityUnit ?? '');
          setFinanceDate(draft.financeDate ?? '');
          setFinanceVendor(draft.financeVendor ?? '');
          setFinancePaymentMethod(draft.financePaymentMethod ?? '');
          setFinanceReceipt(draft.financeReceipt ?? '');
          setFinanceNotes(draft.financeNotes ?? '');
          setFinanceReceiptUri(draft.financeReceiptUri ?? null);
          setFinanceRecurringFrequency(draft.financeRecurringFrequency ?? '');
        }
      } catch {
        // Ignore load errors.
      } finally {
        setDataLoaded(true);
      }
    };
    void loadData();
  }, []);

  useEffect(() => {
    if (!dataLoaded) {
      return;
    }
    const persist = async () => {
      try {
        await AsyncStorage.setItem(
          'homestead:log-book',
          JSON.stringify({
            logSettings,
            gardenBeds,
            gardenLogs,
            pantryLogs,
            harvestLogs,
            financeLogs,
            weightLogs,
            heightLogs,
            vaccineLogs,
            wormingLogs,
            hoofLogs,
            vetApptLogs,
            woundLogs,
            milkLogs,
            livestockLogs,
            beeHives,
            beeQueenLogs,
            beeWorkerLogs,
            beeInspectionLogs,
            beeHealthLogs,
            beeHoneyLogs,
            beeManagementLogs,
            beeSeasonalLogs,
            pastureOptions,
            chickenCoopOptions,
            pigPenOptions,
            horsePastureOptions,
            rabbitHousingOptions,
            customIncomeCategories,
            customExpenseCategories,
            customFinanceVendors,
            customPantryCategories,
            savedGardenFilters,
            savedLivestockFilters,
            livestockSpeciesVisible: visibleLivestockSpecies,
            savedPantryFilters,
            savedHarvestFilters,
            savedFinanceFilters,
            customFinanceSubcategories,
            draft: {
              activeSection,
              showCreateLog,
              species,
              breed,
              breedSelections,
              breedOther,
              gender,
              purpose,
              animalName,
              pastureName,
              chickenCoopName,
              pigPenName,
              horsePastureName,
              rabbitHousingType,
              rabbitHousingName,
              chickenLogType,
              chickenGroupGenders,
              chickenHenCount,
              chickenRoosterCount,
              birthdate,
              deformities,
              showQuality,
              pedigree,
              registration,
              weightValue,
              weightUnit,
              weightDate,
              heightValue,
              heightUnit,
              heightDate,
              vaccineName,
              vaccineDate,
              vaccineNotes,
              wormingProduct,
              wormingDate,
              wormingNotes,
              hoofDate,
              hoofNotes,
              vetApptReason,
              vetApptDate,
              vetApptNotes,
              woundDate,
              woundNotes,
              followUpDate,
              followUpNotes,
              udderCondition,
              udderNotes,
              milkDate,
              milkTime,
              milkMethod,
              milkAmount,
              milkAmountUnit,
              milkFat,
              milkTaste,
              milkHandling,
              grainBrand,
              grainAmount,
              grainAmountValue,
              grainAmountUnit,
              hayType,
              hayForm,
              minerals,
              deformityLogs,
              profitEntryType,
              profitEntryOther,
              profitEntryQuantity,
              profitEntryPrice,
              profitEntryNotes,
              profitEntryDate,
              profitEntries,
              gardenCrop,
              gardenTask,
              gardenDate,
              selectedBed,
              gardenPlants,
              gardenPrepDate,
              gardenPrepNotes,
              gardenSeedDate,
              gardenSoil,
              gardenWatering,
              gardenPests,
              gardenFertilizer,
              gardenFertilizerDate,
              gardenWeather,
              gardenStage,
              gardenNotes,
              gardenPlanPrepDate,
              gardenPlanPrepLead,
              gardenPlanSeedDate,
              gardenPlanSeedLead,
              gardenPlanFertilizeDate,
              gardenPlanFertilizeLead,
              pantryItem,
              pantryType,
              pantryMethod,
              pantryCategory,
              pantryBatch,
              pantryDate,
              pantryUseBy,
              pantryLocation,
              pantryQuantity,
              pantryQuantityUnit,
              pantryIngredients,
              pantryNotes,
              harvestItem,
              harvestYield,
              harvestYieldUnit,
              harvestDate,
              harvestQuality,
              harvestLocation,
              harvestStorage,
              harvestWeather,
              harvestNotes,
              financeType,
              financeCategory,
              financeSubcategory,
              financeNewSubcategory,
              financeAnimalType,
              financeNewCategory,
              financeAmount,
              financeQuantity,
              financeQuantityUnit,
              financeDate,
              financeVendor,
              financePaymentMethod,
              financeReceipt,
              financeNotes,
              financeReceiptUri,
              financeRecurringFrequency,
            },
          })
        );
      } catch {
        // Ignore save errors.
      }
    };
    void persist();
  }, [
    dataLoaded,
    logSettings,
    gardenBeds,
    gardenLogs,
    pantryLogs,
    harvestLogs,
    financeLogs,
    weightLogs,
    heightLogs,
    vaccineLogs,
    wormingLogs,
    hoofLogs,
    vetApptLogs,
    woundLogs,
    milkLogs,
    beeHives,
    beeQueenLogs,
    beeWorkerLogs,
    beeInspectionLogs,
    beeHealthLogs,
    beeHoneyLogs,
    beeManagementLogs,
    beeSeasonalLogs,
    livestockLogs,
    savedGardenFilters,
    savedLivestockFilters,
    visibleLivestockSpecies,
    savedPantryFilters,
    savedHarvestFilters,
    savedFinanceFilters,
    activeSection,
    showCreateLog,
    species,
    breed,
    breedSelections,
    breedOther,
    gender,
    purpose,
    animalName,
    pastureName,
    pigPenName,
    horsePastureName,
    rabbitHousingType,
    rabbitHousingName,
    rabbitHousingOptions,
    pigPenOptions,
    horsePastureOptions,
    beeHives,
    beeQueenLogs,
    beeWorkerLogs,
    beeInspectionLogs,
    beeHealthLogs,
    beeHoneyLogs,
    beeManagementLogs,
    beeSeasonalLogs,
    chickenLogType,
    chickenGroupGenders,
    chickenHenCount,
    chickenRoosterCount,
    birthdate,
    deformities,
    showQuality,
    pedigree,
    registration,
    weightValue,
    weightUnit,
    weightDate,
    heightValue,
    heightUnit,
    heightDate,
    vaccineName,
    vaccineDate,
    vaccineNotes,
    wormingProduct,
    wormingDate,
    wormingNotes,
    hoofDate,
    hoofNotes,
    vetApptReason,
    vetApptDate,
    vetApptNotes,
    woundDate,
    woundNotes,
    followUpDate,
    followUpNotes,
    udderCondition,
    milkDate,
    milkTime,
    milkMethod,
    milkAmount,
    milkFat,
    milkTaste,
    milkHandling,
    grainBrand,
    grainAmount,
    hayType,
    hayForm,
    minerals,
    deformityLogs,
    profitEntryType,
    profitEntryOther,
    profitEntryQuantity,
    profitEntryPrice,
    profitEntryNotes,
    profitEntryDate,
    profitEntries,
    gardenCrop,
    gardenTask,
    gardenDate,
    selectedBed,
    gardenPlants,
    gardenPrepDate,
    gardenPrepNotes,
    gardenSeedDate,
    gardenSoil,
    gardenWatering,
    gardenPests,
    gardenFertilizer,
    gardenFertilizerDate,
    gardenWeather,
    gardenStage,
    gardenNotes,
    gardenPlanPrepDate,
    gardenPlanPrepLead,
    gardenPlanSeedDate,
    gardenPlanSeedLead,
    gardenPlanFertilizeDate,
    gardenPlanFertilizeLead,
    pantryItem,
    pantryType,
    pantryMethod,
    pantryCategory,
    pantryBatch,
    pantryDate,
    pantryUseBy,
    pantryLocation,
    pantryQuantity,
    pantryQuantityUnit,
    pantryIngredients,
    pantryNotes,
    harvestItem,
    harvestYield,
    harvestYieldUnit,
    harvestDate,
    harvestQuality,
    harvestLocation,
    harvestStorage,
    harvestWeather,
    harvestNotes,
    financeType,
    financeCategory,
    financeSubcategory,
    financeNewSubcategory,
    financeAnimalType,
    financeNewCategory,
    financeAmount,
    financeQuantity,
    financeQuantityUnit,
    financeDate,
    financeVendor,
    financePaymentMethod,
    financeReceipt,
    financeReceiptUri,
    financeNotes,
    financeRecurringFrequency,
    customIncomeCategories,
    customExpenseCategories,
    customFinanceVendors,
    customPantryCategories,
    customFinanceSubcategories,
  ]);


  const isDairy = useMemo(() => ['Cow', 'Goat', 'Sheep'].includes(species), [species]);
  const supportsMetrics = useMemo(() => species !== 'Bee', [species]);
  const isChickenGroup = species === 'Chicken' && chickenLogType === 'Group';
  const genderOptions = genderOptionsBySpecies[species] ?? [];
  const breedOptions = breedOptionsBySpecies[species] ?? [];
  const beePopulationOptions = [
    'Less than 10,000',
    '10-20,000',
    '20-30,000',
    '30-40,000',
    '40-50,000',
    '50-60,000',
    '60-70,000',
    '70-80,000',
    '80-90,000',
    '100,000 and above',
  ];
  const beeMarkingOptions = ['White', 'Yellow', 'Red', 'Green', 'Blue'];
  const beeOriginOptions = ['Local breeder', 'Nuc', 'Split', 'Swarm'];
  const beeLayingOptions = ['Good', 'Spotty', 'Failing'];
  const beeTemperamentOptions = ['Calm', 'Busy', 'Defensive', 'Hot'];
  const beeHiveTypes = ['Langstroth', 'Top-Bar', 'Warre'];
  const beeInspectionOptions = [
    'Queen seen',
    'Fresh eggs',
    'Brood pattern healthy',
    'Swarm cells present',
    'Food stores adequate',
    'Pests observed',
  ];
  const beeManagementOptions = [
    'Fed sugar syrup',
    'Added boxes',
    'Removed boxes',
    'Split hive',
    'Requeened',
    'Combined hives',
    'Moved hive location',
  ];
  const beeSeasonalOptions = [
    'Winter prep complete',
    'Added insulation',
    'Entrance reducers installed',
    'Checked fall stores',
  ];
  const getSpeciesLabel = (animal: string) => {
    if (animal === 'Sheep') return 'Sheep';
    if (animal === 'Cow') return 'Cows';
    if (animal === 'Pig') return 'Pigs';
    if (animal === 'Bee') return 'Bees';
    if (animal === 'Livestock Guardian') return 'Livestock Guardians';
    return `${animal}s`;
  };
  const getGenderBorderColor = (value: string) => {
    const normalized = value.toLowerCase();
    const femaleKeys = ['female', 'hen', 'doe', 'ewe', 'cow', 'mare', 'nanny', 'sow', 'queen'];
    const maleKeys = [
      'male',
      'rooster',
      'buck',
      'ram',
      'bull',
      'stallion',
      'boar',
      'drone',
      'cock',
      'gander',
      'tom',
    ];
    if (femaleKeys.some((key) => normalized.includes(key))) {
      return '#E7A6B1';
    }
    if (maleKeys.some((key) => normalized.includes(key))) {
      return '#8CB3E5';
    }
    return '#D7C9B7';
  };
  useEffect(() => {
    if (selectedLivestockSpecies && !visibleLivestockSpecies.includes(selectedLivestockSpecies)) {
      setSelectedLivestockSpecies(null);
      setLivestockSpeciesFilter('All species');
    }
  }, [selectedLivestockSpecies, visibleLivestockSpecies]);
  useEffect(() => {
    if (!selectedLivestockEntry) {
      return;
    }
    const refreshed = livestockLogs.find((entry) => entry.id === selectedLivestockEntry.id);
    if (refreshed && refreshed !== selectedLivestockEntry) {
      setSelectedLivestockEntry(refreshed);
    }
  }, [livestockLogs, selectedLivestockEntry]);
  useEffect(() => {
    if (!selectedLivestockEntry) {
      setExpandedProfileSections([]);
      setProfileWeightValue('');
      setProfileWeightDate('');
      setProfileDeformityNotes('');
      setProfileDeformityDate('');
      setProfileHoofNotes('');
      setProfileHoofDate('');
      setProfileWoundNotes('');
      setProfileWoundDate('');
      setProfileVaccineName('');
      setProfileVaccineDate('');
      setProfileVaccineNotes('');
      setProfileWormingProduct('');
      setProfileWormingDate('');
      setProfileWormingNotes('');
      setProfileProfitType('');
      setProfileProfitOther('');
      setProfileProfitQuantity('');
      setProfileProfitPrice('');
      setProfileProfitDate('');
      setProfileProfitNotes('');
    }
  }, [selectedLivestockEntry]);
  useEffect(() => {
    if (species === 'Bee') {
      setActiveBeeSection('home');
      if (!selectedBeeHiveId && beeHives.length > 0) {
        setSelectedBeeHiveId(beeHives[0].id);
      }
    }
  }, [species, beeHives, selectedBeeHiveId]);
  useEffect(() => {
    if (species !== 'Chicken') {
      setChickenLogType('');
      setChickenGroupGenders([]);
      setChickenHenCount('');
      setChickenRoosterCount('');
      return;
    }
    if (!chickenLogType) {
      setChickenLogType('Individual');
    }
  }, [species, chickenLogType]);
  useEffect(() => {
    if (breed !== 'Other') {
      setBreedOther('');
    }
  }, [breed]);
  useEffect(() => {
    if (!financeCategory) {
      setFinanceSubcategory('');
      return;
    }
    const options = financeSubcategoryOptions[financeCategory];
    if (options && financeSubcategory && !options.includes(financeSubcategory)) {
      setFinanceSubcategory('');
    }
  }, [financeCategory, financeSubcategory, financeSubcategoryOptions]);
  useEffect(() => {
    if (!dataLoaded) {
      return;
    }
    const stored = beeHives.find((hive) => hive.id === selectedBeeHiveId);
    setBeePopulation(stored?.population ?? '');
  }, [dataLoaded, beeHives, selectedBeeHiveId]);
  const toggleChickenGroupGender = (value: string) => {
    setChickenGroupGenders((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };
  const pickAnimalPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to add an animal photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAnimalPhotoUri(result.assets[0].uri);
    }
  };
  const pickFinanceReceipt = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to attach a receipt.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setFinanceReceiptUri(result.assets[0].uri);
    }
  };
  const exportFinanceCsv = async () => {
    if (filteredFinanceLogs.length === 0) {
      Alert.alert('No entries', 'There are no finance logs to export.');
      return;
    }
    const header = [
      'Date',
      'Type',
      'Category',
      'Subcategory',
      'Animal',
      'Quantity',
      'Unit',
      'Amount',
      'Vendor',
      'Payment Method',
      'Recurring',
      'Notes',
    ];
    const rows = filteredFinanceLogs.map((entry) => [
      entry.date,
      entry.type,
      entry.category,
      entry.subcategory ?? '',
      entry.animalType ?? '',
      entry.quantity ?? '',
      entry.quantityUnit ?? '',
      entry.amount,
      entry.vendor,
      entry.paymentMethod,
      entry.recurringFrequency ?? '',
      entry.notes,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    await Clipboard.setStringAsync(csv);
    Alert.alert('Export copied', 'CSV has been copied to your clipboard.');
  };
  const showSaveStatus = (label = 'Log') => {
    if (!isOnline()) {
      showStatus('No internet, logs will not save', 'warning', 1800);
      return false;
    }
    showStatus(`${label} saving...`, 'info', 900);
    setTimeout(() => {
      showStatus(`${label} saved`, 'success', 1400);
    }, 900);
    return true;
  };
  const addProfitEntry = () => {
    if (!profitEntryType) return;
    const label = profitEntryType === 'Other' ? profitEntryOther.trim() : profitEntryType;
    const entryLabel = label || 'Other';
    const quantityValue = profitEntryQuantity.trim();
    const priceValue = profitEntryPrice.trim();
    const quantityNum = Number(quantityValue);
    const priceNum = Number(priceValue);
    const totalValue =
      quantityValue && priceValue && !Number.isNaN(quantityNum) && !Number.isNaN(priceNum)
        ? (quantityNum * priceNum).toFixed(2)
        : '';
    setProfitEntries((prev) => [
      {
        id: makeId(),
        date: profitEntryDate,
        type: entryLabel,
        quantity: quantityValue,
        pricePer: priceValue,
        total: totalValue,
        notes: profitEntryNotes.trim(),
      },
      ...prev,
    ]);
    const financeAmount = totalValue || priceValue || '';
    if (financeAmount) {
      setFinanceLogs((prev) => [
        {
          id: makeId(),
          date: profitEntryDate || new Date().toISOString().slice(0, 10),
          type: 'Income',
          category: `${species || 'Livestock'} Profit`,
          amount: financeAmount,
          animalType: species || '',
          vendor: animalName || species || 'Livestock',
          paymentMethod: '',
          receipt: '',
          notes: `${entryLabel}${profitEntryNotes ? ` • ${profitEntryNotes.trim()}` : ''}`,
        },
        ...prev,
      ]);
    }
    setProfitEntryType('');
    setProfitEntryOther('');
    setProfitEntryQuantity('');
    setProfitEntryPrice('');
    setProfitEntryNotes('');
    setProfitEntryDate('');
  };
  const pantryLocationOptions = useMemo(() => {
    const locations = pantryLogs.map((entry) => entry.location).filter(Boolean);
    const merged = Array.from(new Set([...pantryLocationDefaults, ...locations]));
    return ['All locations', ...merged];
  }, [pantryLogs]);
  const pantryCategoryOptions = useMemo(() => {
    const categories = pantryLogs.map((entry) => entry.category).filter(Boolean);
    const merged = Array.from(new Set([...pantryCategoryDefaults, ...customPantryCategories, ...categories]));
    return merged;
  }, [pantryLogs, customPantryCategories]);
  const pantryTypeOptions = useMemo(() => pantryTypes, []);
  const harvestLocationOptions = useMemo(() => {
    const locations = harvestLogs.map((entry) => entry.location).filter(Boolean);
    return ['All locations', ...Array.from(new Set(locations))];
  }, [harvestLogs]);
  const harvestStorageOptions = useMemo(() => {
    const storage = harvestLogs.map((entry) => entry.storage).filter(Boolean);
    return ['All storage', ...Array.from(new Set(storage))];
  }, [harvestLogs]);
  const filteredPantryLogs = useMemo(() => {
    const now = new Date();
    const getUseByStatus = (dateValue: string) => {
      const parsed = parseDateValue(dateValue);
      if (!parsed) return 'unknown';
      const diffDays = Math.ceil((parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'expired';
      if (diffDays <= 7) return '7';
      if (diffDays <= 30) return '30';
      if (diffDays <= 90) return '90';
      return 'later';
    };
    return pantryLogs.filter((entry) => {
      const matchesMethod = pantryMethodFilter === 'All methods' || entry.method === pantryMethodFilter;
      const matchesType = pantryTypeFilter === 'All types' || entry.type === pantryTypeFilter;
      const matchesCategory = pantryCategoryFilter === 'All categories' || entry.category === pantryCategoryFilter;
      const matchesLocation =
        pantryLocationFilter === 'All locations' || entry.location === pantryLocationFilter;
      const useByStatus = getUseByStatus(entry.useBy);
      const matchesUseBy =
        pantryUseByFilter === 'Any use-by' ||
        (pantryUseByFilter === 'Expired' && useByStatus === 'expired') ||
        (pantryUseByFilter === 'Next 7 days' && useByStatus === '7') ||
        (pantryUseByFilter === 'Next 30 days' && ['7', '30'].includes(useByStatus)) ||
        (pantryUseByFilter === 'Next 90 days' && ['7', '30', '90'].includes(useByStatus));
      const quantityValue = Number(entry.quantity);
      const isLowStock = !Number.isNaN(quantityValue) && quantityValue <= 2;
      const matchesStock =
        pantryStockFilter === 'All stock' ||
        (pantryStockFilter === 'Low stock' && isLowStock);
      return matchesMethod && matchesType && matchesCategory && matchesLocation && matchesUseBy && matchesStock;
    });
  }, [
    pantryLogs,
    pantryMethodFilter,
    pantryTypeFilter,
    pantryCategoryFilter,
    pantryLocationFilter,
    pantryUseByFilter,
    pantryStockFilter,
  ]);
  const filteredHarvestLogs = useMemo(
    () =>
      harvestLogs.filter((entry) => {
        const matchesLocation =
          harvestLocationFilter === 'All locations' || entry.location === harvestLocationFilter;
        const matchesStorage =
          harvestStorageFilter === 'All storage' || entry.storage === harvestStorageFilter;
        return matchesLocation && matchesStorage;
      }),
    [harvestLogs, harvestLocationFilter, harvestStorageFilter]
  );
  const filteredFinanceLogs = useMemo(
    () =>
      financeLogs.filter((entry) => {
        const matchesType =
          financeTypeFilter.length === 0 || financeTypeFilter.includes(entry.type);
        const matchesCategory =
          financeCategoryFilter.length === 0 || financeCategoryFilter.includes(entry.category);
        const matchesAnimal =
          financeAnimalFilter.length === 0 || financeAnimalFilter.includes(entry.animalType ?? '');
        const matchesUnit =
          financeUnitFilter.length === 0 || financeUnitFilter.includes(entry.quantityUnit ?? '');
        const monthKey = getMonthKey(entry.date);
        const matchesMonth = financeMonthFilter === 'All months' || monthKey === financeMonthFilter;
        return matchesType && matchesCategory && matchesAnimal && matchesUnit && matchesMonth;
      }),
    [
      financeLogs,
      financeTypeFilter,
      financeCategoryFilter,
      financeAnimalFilter,
      financeUnitFilter,
      financeMonthFilter,
    ]
  );
  const financeMonthOptions = useMemo(() => {
    const months = financeLogs
      .map((entry) => getMonthKey(entry.date))
      .filter(Boolean);
    const unique = Array.from(new Set(months)).sort().reverse();
    return ['All months', ...unique];
  }, [financeLogs]);
  const financeSummary = useMemo(() => {
    const toNumber = (value: string) => {
      const cleaned = value.replace(/[^0-9.]/g, '');
      const parsed = Number(cleaned);
      return Number.isNaN(parsed) ? 0 : parsed;
    };
    const incomeTotal = filteredFinanceLogs
      .filter((entry) => entry.type === 'Income')
      .reduce((sum, entry) => sum + toNumber(entry.amount), 0);
    const expenseTotal = filteredFinanceLogs
      .filter((entry) => entry.type === 'Expense')
      .reduce((sum, entry) => sum + toNumber(entry.amount), 0);
    const expenseCategories = filteredFinanceLogs
      .filter((entry) => entry.type === 'Expense')
      .reduce<Record<string, number>>((acc, entry) => {
        const key = entry.category || 'Other';
        acc[key] = (acc[key] ?? 0) + toNumber(entry.amount);
        return acc;
      }, {});
    const sortedCategories = Object.entries(expenseCategories).sort((a, b) => b[1] - a[1]);
    const animalTotals = filteredFinanceLogs.reduce<Record<string, { income: number; expense: number }>>(
      (acc, entry) => {
        const key = entry.animalType || 'Unspecified';
        if (!acc[key]) {
          acc[key] = { income: 0, expense: 0 };
        }
        const amount = toNumber(entry.amount);
        if (entry.type === 'Income') {
          acc[key].income += amount;
        } else if (entry.type === 'Expense') {
          acc[key].expense += amount;
        }
        return acc;
      },
      {}
    );
    const sortedAnimalTotals = Object.entries(animalTotals).sort(
      (a, b) => b[1].income + b[1].expense - (a[1].income + a[1].expense)
    );
    const now = new Date();
    const getRangeTotals = (days: number) => {
      const start = new Date(now);
      start.setDate(start.getDate() - days);
      return filteredFinanceLogs.reduce(
        (acc, entry) => {
          const date = parseDateValue(entry.date);
          if (!date || date < start) {
            return acc;
          }
          const amount = toNumber(entry.amount);
          if (entry.type === 'Income') acc.income += amount;
          if (entry.type === 'Expense') acc.expense += amount;
          return acc;
        },
        { income: 0, expense: 0 }
      );
    };
    const last30 = getRangeTotals(30);
    const last90 = getRangeTotals(90);
    return {
      incomeTotal,
      expenseTotal,
      categories: sortedCategories,
      animalTotals: sortedAnimalTotals,
      last30,
      last90,
    };
  }, [filteredFinanceLogs]);
  const financePalette = ['#4C7744', '#8B5E3C', '#C99C6B', '#6B4E3D', '#A7B58A', '#B7775A', '#7C6B5C'];

  const toggleMulti = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const toggleSingle = <T extends string>(
    value: T,
    current: T | '',
    setter: React.Dispatch<React.SetStateAction<T | ''>>
  ) => {
    setter(current === value ? '' : value);
  };

  const parseDateValue = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const parsed = new Date(`${trimmed}T12:00:00`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
      const [month, day, year] = trimmed.split('/');
      const parsed = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const getMonthKey = (value: string) => {
    const date = parseDateValue(value);
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatMonthLabel = (key: string) => {
    if (key === 'All months') return key;
    const [year, month] = key.split('-');
    const index = Number(month) - 1;
    const labels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${labels[index] ?? month} ${year}`;
  };
  const financeQuantityUnits = [
    'ct',
    'dozen',
    'lb',
    'oz',
    'g',
    'kg',
    'gal',
    'qt',
    'pt',
    'l',
    'bale',
    'bag',
    'case',
    'head',
    'crate',
    'bundle',
    'bushel',
    'bottle',
    'jar',
    'box',
    'bunch',
    'visit',
    'dose',
    'packet',
    'tray',
    'day',
    'booth',
    'month',
  ];
  const financeSubcategoryOptions: Record<string, string[]> = {
    Cow: ['Milk', 'Meat', 'Hide', 'Offspring', 'Breeding stock', 'Other'],
    Goat: ['Milk', 'Cheese', 'Hide', 'Offspring', 'Head', 'Fiber', 'Other'],
    Sheep: ['Wool', 'Milk', 'Meat', 'Hide', 'Offspring', 'Head', 'Other'],
    Pig: ['Meat', 'Offspring', 'Head', 'Other'],
    Chicken: ['Eggs', 'Meat', 'Offspring', 'Head', 'Other'],
    Duck: ['Eggs', 'Meat', 'Offspring', 'Head', 'Other'],
    Rabbit: ['Meat', 'Hide', 'Offspring', 'Head', 'Other'],
    Horse: ['Training', 'Breeding', 'Stud fee', 'Head', 'Other'],
    Bee: ['Honey', 'Wax', 'Propolis', 'Pollen', 'Nucs', 'Other'],
    'Garden Produce': ['Vegetables', 'Herbs', 'Flowers', 'Seeds', 'Starts', 'CSA share', 'Other'],
    'Orchard Produce': ['Fruit', 'Cider', 'Juice', 'Jams', 'Other'],
    Honey: ['Raw honey', 'Comb honey', 'Flavored honey', 'Other'],
    Feed: ['Grain', 'Hay', 'Minerals', 'Supplements', 'Other'],
    Veterinary: ['Vaccines', 'Deworming', 'Hoof care', 'Checkup', 'Emergency', 'Other'],
    Equipment: ['Tools', 'Fencing', 'Water systems', 'Processing', 'Other'],
    Seeds: ['Seeds', 'Starts', 'Soil mix', 'Other'],
    Markets: ['Booth fee', 'Labels', 'Packaging', 'Marketing', 'Other'],
    Shelter: ['Bedding', 'Housing', 'Repairs', 'Fencing', 'Other'],
    Other: ['Other'],
  };
  const financeUnitsByCategory: Record<string, string[]> = {
    Cow: ['head', 'lb', 'oz', 'gal', 'qt', 'pt', 'l', 'ct'],
    Goat: ['head', 'lb', 'oz', 'gal', 'qt', 'pt', 'l', 'ct'],
    Sheep: ['head', 'lb', 'oz', 'ct'],
    Pig: ['head', 'lb', 'oz', 'ct'],
    Chicken: ['dozen', 'ct', 'lb', 'oz'],
    Duck: ['dozen', 'ct', 'lb', 'oz'],
    Rabbit: ['head', 'ct', 'lb', 'oz'],
    Horse: ['head', 'ct'],
    Bee: ['ct', 'jar', 'bottle', 'lb', 'oz', 'qt', 'pt'],
    'Garden Produce': ['bushel', 'crate', 'box', 'bunch', 'lb', 'oz', 'ct'],
    'Orchard Produce': ['bushel', 'crate', 'box', 'lb', 'oz', 'ct'],
    Honey: ['jar', 'bottle', 'lb', 'oz', 'qt', 'pt', 'l'],
    Feed: ['bag', 'bale', 'lb', 'oz', 'kg', 'ct'],
    Veterinary: ['visit', 'dose', 'head', 'ct'],
    Equipment: ['ct', 'box', 'bundle'],
    Seeds: ['packet', 'tray', 'ct'],
    Markets: ['day', 'booth', 'month', 'ct'],
    Shelter: ['bale', 'bag', 'ct'],
  };
  const activeFinanceUnits = financeUnitsByCategory[financeCategory] ?? financeQuantityUnits;
  const activeFinanceSubcategories = [
    ...(financeSubcategoryOptions[financeCategory] ?? []),
    ...((customFinanceSubcategories[financeCategory] ?? []) as string[]),
  ];
  const financeVendorOptions = [
    'Farm stand',
    'Local buyer',
    'Farmers market',
    'Feed store',
    'Vet clinic',
    'Online',
    'Other',
  ];
  const activeFinanceVendors = Array.from(
    new Set([...financeVendorOptions, ...customFinanceVendors])
  );

  const quickAddFinance = (type: 'Income' | 'Expense', category: string) => {
    setActiveSection('finances');
    setShowCreateLog(true);
    setEditingFinanceId(null);
    setFinanceType(type);
    setFinanceCategory(category);
    setFinanceSubcategory('');
    setFinanceAmount('');
    setFinanceDate('');
    setFinanceVendor('');
    setFinancePaymentMethod('');
    setFinanceReceipt('');
    setFinanceReceiptUri(null);
    setFinanceNotes('');
    setFinanceRecurringFrequency('');
  };

  const addMetric = (
    value: string,
    unit: string,
    date: string,
    setter: React.Dispatch<React.SetStateAction<MetricEntry[]>>,
    clear: () => void
  ) => {
    if (!value.trim() || !date.trim()) {
      return;
    }
    const formatted = `${value.trim()} ${unit}`.trim();
    setter((prev) => [{ id: makeId(), value: formatted, date: date.trim() }, ...prev]);
    clear();
  };

  const addMilkEntry = () => {
    if (!milkDate.trim()) {
      return;
    }
    setMilkLogs((prev) => [
      {
        id: makeId(),
        date: milkDate.trim(),
        time: milkTime,
        method: milkMethod,
        amount: milkAmount.trim(),
        amountUnit: milkAmountUnit,
        fat: milkFat.trim(),
        taste: milkTaste.trim(),
        handling: milkHandling,
      },
      ...prev,
    ]);
    setMilkDate('');
    setMilkTime('');
    setMilkMethod('');
    setMilkAmount('');
    setMilkAmountUnit('');
    setMilkFat('');
    setMilkTaste('');
    setMilkHandling('');
  };

  const addSimpleLog = (
    label: string | undefined,
    date: string,
    notes: string,
    setter: React.Dispatch<React.SetStateAction<SimpleLog[]>>,
    clear: () => void
  ) => {
    if (!date.trim()) {
      showStatus('Select a date', 'error', 1500);
      return;
    }
    setter((prev) => [{ id: makeId(), date: date.trim(), notes: notes.trim(), label }, ...prev]);
    clear();
  };

  const addWound = () => {
    if (!woundDate.trim()) {
      showStatus('Select a wound date', 'error', 1500);
      return;
    }
    setWoundLogs((prev) => [
      { id: makeId(), date: woundDate.trim(), notes: woundNotes.trim(), followUps: [] },
      ...prev,
    ]);
    setWoundDate('');
    setWoundNotes('');
  };

  const resetGardenForm = () => {
    setGardenCrop('');
    setGardenTask('');
    setGardenDate('');
    setGardenPlants([]);
    setGardenPrepDate('');
    setGardenPrepNotes('');
    setGardenSeedDate('');
    setGardenSoil('');
    setGardenWatering('');
    setGardenPests('');
    setGardenFertilizer('');
    setGardenFertilizerDate('');
    setGardenWeather('');
    setGardenStage('');
    setGardenNotes('');
    setGardenPlanPrepDate('');
    setGardenPlanPrepLead('');
    setGardenPlanSeedDate('');
    setGardenPlanSeedLead('');
    setGardenPlanFertilizeDate('');
    setGardenPlanFertilizeLead('');
  };

  const addGardenLog = () => {
    if (!gardenDate.trim()) {
      showStatus('Select a log date', 'error', 1500);
      return;
    }
    if (!selectedBed) {
      showStatus('Select a bed', 'error', 1500);
      return;
    }
    if (gardenPlants.length === 0 && !gardenCrop.trim()) {
      showStatus('Select a crop', 'error', 1500);
      return;
    }
    const bedLabel = selectedBed || 'Unassigned';
    const plan: GardenPlan[] = [];
    if (gardenPlanPrepDate) {
      plan.push({ label: 'Prep bed', date: gardenPlanPrepDate, leadDays: gardenPlanPrepLead });
    }
    if (gardenPlanSeedDate) {
      plan.push({ label: 'Seed', date: gardenPlanSeedDate, leadDays: gardenPlanSeedLead });
    }
    if (gardenPlanFertilizeDate) {
      plan.push({ label: 'Fertilize', date: gardenPlanFertilizeDate, leadDays: gardenPlanFertilizeLead });
    }
    const tagSet = new Set<string>();
    if (gardenPrepDate) tagSet.add('Prep');
    if (gardenSeedDate) tagSet.add('Seed');
    if (gardenFertilizer || gardenFertilizerDate) tagSet.add('Fertilizer');
    if (gardenPests) tagSet.add('Pests');
    if (gardenWatering) tagSet.add('Watering');
    if (gardenSoil) tagSet.add('Soil');
    if (gardenStage) tagSet.add('Growth Stage');
    if (gardenWeather) tagSet.add('Weather');
    if (gardenTask) tagSet.add('Task');
    if (gardenStage === 'Harvest') tagSet.add('Harvest');
    if (plan.length > 0) tagSet.add('Planning');

    const newEntry: GardenLog = {
      id: editingGardenId ?? makeId(),
      date: gardenDate.trim(),
      bed: bedLabel,
      plants: gardenPlants,
      crop: gardenCrop.trim(),
      task: gardenTask.trim(),
      prepDate: gardenPrepDate,
      prepNotes: gardenPrepNotes.trim(),
      seedDate: gardenSeedDate,
      soil: gardenSoil.trim(),
      watering: gardenWatering.trim(),
      pests: gardenPests.trim(),
      fertilizer: gardenFertilizer.trim(),
      fertilizerDate: gardenFertilizerDate,
      weather: gardenWeather.trim(),
      stage: gardenStage,
      notes: gardenNotes.trim(),
      plan,
      tags: Array.from(tagSet),
    };

    setGardenLogs((prev) =>
      editingGardenId ? prev.map((entry) => (entry.id === editingGardenId ? newEntry : entry)) : [newEntry, ...prev]
    );
    if (!editingGardenId) {
      addAlmanacEntry({
        id: makeId(),
        date: gardenDate.trim(),
        label: `Garden Log: ${bedLabel}`,
        type: 'log',
        source: 'Garden Log',
      });
      plan.forEach((planItem) => {
        addAlmanacEntry({
          id: makeId(),
          date: planItem.date,
          label: `Plan ${planItem.label}: ${bedLabel}`,
          type: 'log',
          source: 'Garden Plan',
        });
      });
    }
    setEditingGardenId(null);
    resetGardenForm();
  };

  const addFollowUp = () => {
    if (!followUpTargetId || !followUpDate.trim()) {
      return;
    }
    setWoundLogs((prev) =>
      prev.map((wound) =>
        wound.id === followUpTargetId
          ? {
              ...wound,
              followUps: [
                { id: makeId(), date: followUpDate.trim(), notes: followUpNotes.trim() },
                ...wound.followUps,
              ],
            }
          : wound
      )
    );
    setFollowUpTargetId(null);
    setFollowUpDate('');
    setFollowUpNotes('');
    setShowFollowUpCalendar(false);
  };

  const addPantryLog = () => {
    if (
      !pantryItem.trim() ||
      !pantryType ||
      !pantryMethod ||
      !pantryCategory ||
      !pantryDate.trim() ||
      !pantryUseBy.trim() ||
      !pantryLocation.trim() ||
      !pantryQuantity.trim() ||
      !pantryQuantityUnit
    ) {
      showStatus('Fill in all required pantry fields', 'error', 1500);
      return;
    }
    const newEntry: PantryLog = {
      id: editingPantryId ?? makeId(),
      date: pantryDate.trim(),
      item: pantryItem.trim(),
      type: pantryType.trim(),
      method: pantryMethod.trim(),
      category: pantryCategory.trim(),
      batch: pantryBatch.trim(),
      location: pantryLocation.trim(),
      quantity: pantryQuantity.trim(),
      quantityUnit: pantryQuantityUnit.trim(),
      useBy: pantryUseBy.trim(),
      ingredients: pantryIngredients.trim(),
      notes: pantryNotes.trim(),
    };
    setPantryLogs((prev) =>
      editingPantryId ? prev.map((entry) => (entry.id === editingPantryId ? newEntry : entry)) : [newEntry, ...prev]
    );
    if (!editingPantryId) {
      addAlmanacEntry({
        id: makeId(),
        date: newEntry.date,
        label: `Pantry: ${newEntry.item}`,
        type: 'log',
        source: 'Pantry Log',
      });
    }
    setEditingPantryId(null);
    setPantryItem('');
    setPantryType('');
    setPantryMethod('');
    setPantryCategory('');
    setPantryBatch('');
    setPantryDate('');
    setPantryUseBy('');
    setPantryLocation('');
    setPantryQuantity('');
    setPantryQuantityUnit('');
    setPantryIngredients('');
    setPantryNotes('');
    setShowPantryCalendar(false);
    setShowPantryUseByCalendar(false);
  };

  const addHarvestLog = () => {
    if (!harvestItem.trim() || !harvestDate.trim()) {
      showStatus('Add item and date', 'error', 1500);
      return;
    }
    const newEntry: HarvestLog = {
      id: editingHarvestId ?? makeId(),
      date: harvestDate.trim(),
      item: harvestItem.trim(),
      yieldAmount: harvestYield.trim(),
      yieldUnit: harvestYieldUnit,
      quality: harvestQuality.trim(),
      location: harvestLocation.trim(),
      storage: harvestStorage.trim(),
      weather: harvestWeather.trim(),
      notes: harvestNotes.trim(),
    };
    setHarvestLogs((prev) =>
      editingHarvestId ? prev.map((entry) => (entry.id === editingHarvestId ? newEntry : entry)) : [newEntry, ...prev]
    );
    if (!editingHarvestId) {
      addAlmanacEntry({
        id: makeId(),
        date: newEntry.date,
        label: `Harvest: ${newEntry.item}`,
        type: 'log',
        source: 'Harvest Log',
      });
    }
    setEditingHarvestId(null);
    setHarvestItem('');
    setHarvestYield('');
    setHarvestYieldUnit('lb');
    setHarvestDate('');
    setHarvestQuality('');
    setHarvestLocation('');
    setHarvestStorage('');
    setHarvestWeather('');
    setHarvestNotes('');
  };

  const addFinanceLog = () => {
    if (!financeDate.trim() || !financeAmount.trim()) {
      showStatus('Add date and amount', 'error', 1500);
      return;
    }
    if (!/^\d+(\.\d+)?$/.test(financeAmount.trim())) {
      showStatus('Amount must be a number', 'error', 1500);
      return;
    }
    const newEntry: FinanceLog = {
      id: editingFinanceId ?? makeId(),
      date: financeDate.trim(),
      type: financeType,
      category: financeCategory.trim(),
      subcategory: financeSubcategory.trim(),
      amount: financeAmount.trim(),
      quantity: financeQuantity.trim(),
      quantityUnit: financeQuantityUnit,
      animalType: financeAnimalType || '',
      receiptUri: financeReceiptUri ?? undefined,
      recurringFrequency: financeRecurringFrequency || '',
      vendor: financeVendor.trim(),
      paymentMethod: financePaymentMethod,
      receipt: financeReceipt.trim(),
      notes: financeNotes.trim(),
    };
    setFinanceLogs((prev) =>
      editingFinanceId ? prev.map((entry) => (entry.id === editingFinanceId ? newEntry : entry)) : [newEntry, ...prev]
    );
    if (!editingFinanceId) {
      addAlmanacEntry({
        id: makeId(),
        date: newEntry.date,
        label: `Finance: ${newEntry.type || 'Entry'} $${newEntry.amount}`,
        type: 'log',
        source: 'Finance Log',
      });
    }
    setEditingFinanceId(null);
    setFinanceType('');
    setFinanceCategory('');
    setFinanceSubcategory('');
    setFinanceNewSubcategory('');
    setFinanceAmount('');
    setFinanceQuantity('');
    setFinanceQuantityUnit('');
    setFinanceDate('');
    setFinanceAnimalType('');
    setFinanceVendor('');
    setFinanceNewVendor('');
    setFinancePaymentMethod('');
    setFinanceReceipt('');
    setFinanceNotes('');
    setFinanceReceiptUri(null);
    setFinanceRecurringFrequency('');
  };

  const addLivestockLog = () => {
    const resolvedBreedList = isChickenGroup
      ? breedSelections
          .map((option) => (option === 'Other' ? breedOther.trim() || 'Other' : option))
          .filter(Boolean)
      : [];
    const resolvedBreed =
      isChickenGroup
        ? resolvedBreedList.join(', ')
        : breed === 'Other'
          ? breedOther.trim()
          : breed;
    const existingEntry = editingLivestockId
      ? livestockLogs.find((item) => item.id === editingLivestockId) ?? null
      : null;
    const grainAmountText =
      grainAmountValue.trim() && grainAmountUnit
        ? `${grainAmountValue.trim()} ${grainAmountUnit}`
        : grainAmount.trim();
    if (species === 'Goat' && pastureName.trim() && !pastureOptions.includes(pastureName.trim())) {
      setPastureOptions((prev) => [...prev, pastureName.trim()]);
    }
    if (species === 'Chicken' && chickenCoopName.trim()) {
      setChickenCoopOptions((prev) =>
        prev.includes(chickenCoopName.trim()) ? prev : [...prev, chickenCoopName.trim()]
      );
    }
    if (species === 'Pig' && pigPenName.trim()) {
      setPigPenOptions((prev) =>
        prev.includes(pigPenName.trim()) ? prev : [...prev, pigPenName.trim()]
      );
    }
    if (species === 'Horse' && horsePastureName.trim()) {
      setHorsePastureOptions((prev) =>
        prev.includes(horsePastureName.trim()) ? prev : [...prev, horsePastureName.trim()]
      );
    }
    if (species === 'Rabbit' && rabbitHousingType && rabbitHousingName.trim()) {
      const housingLabel = `${rabbitHousingType}: ${rabbitHousingName.trim()}`;
      setRabbitHousingOptions((prev) => (prev.includes(housingLabel) ? prev : [...prev, housingLabel]));
    }
    const entry: LivestockLog = {
      id: editingLivestockId ?? makeId(),
      createdAt: existingEntry?.createdAt ?? new Date().toISOString(),
      species: species || 'Unspecified',
      animalName: animalName.trim(),
      pastureName: species === 'Goat' ? pastureName.trim() : '',
      chickenCoopName: species === 'Chicken' ? chickenCoopName.trim() : '',
      pigPenName: species === 'Pig' ? pigPenName.trim() : '',
      horsePastureName: species === 'Horse' ? horsePastureName.trim() : '',
      rabbitHousingType: species === 'Rabbit' ? rabbitHousingType : '',
      rabbitHousingName: species === 'Rabbit' ? rabbitHousingName.trim() : '',
      breed: resolvedBreed || '',
      breedList: resolvedBreedList.length ? resolvedBreedList : undefined,
      breedOther: breedOther.trim() || undefined,
      gender: gender || '',
      purpose,
      birthdate: isChickenGroup ? null : birthdate,
      deformities: isChickenGroup ? '' : deformities,
      deformityLogs: isChickenGroup ? [] : deformityLogs,
      showQuality: isChickenGroup ? '' : showQuality,
      pedigree: isChickenGroup ? '' : pedigree,
      registration: isChickenGroup ? '' : registration,
      weightLogs: isChickenGroup ? [] : weightLogs,
      heightLogs: isChickenGroup ? [] : heightLogs,
      vaccineLogs: isChickenGroup ? [] : vaccineLogs,
      wormingLogs: isChickenGroup ? [] : wormingLogs,
      hoofLogs: isChickenGroup ? [] : hoofLogs,
      vetApptLogs: isChickenGroup ? [] : vetApptLogs,
      woundLogs: isChickenGroup ? [] : woundLogs,
      udderCondition: isChickenGroup ? '' : udderCondition,
      udderNotes: isChickenGroup ? '' : udderNotes.trim(),
      milkLogs: isChickenGroup ? [] : milkLogs,
      grainBrand,
      grainAmount: grainAmountText,
      grainAmountValue: grainAmountValue.trim(),
      grainAmountUnit,
      hayType,
      hayForm,
      minerals,
      photoUri: animalPhotoUri ?? null,
      chickenLogType,
      chickenGroupGenders,
      chickenHenCount,
      chickenRoosterCount,
      profitEntries,
    };
    setLivestockLogs((prev) =>
      editingLivestockId ? prev.map((item) => (item.id === entry.id ? entry : item)) : [entry, ...prev]
    );
    setAnimalPhotoUri(null);
    resetDraftFields({ preserveSection: true, preserveCreateLog: true, preserveSpecies: true });
  };

  const getSelectedHive = () => beeHives.find((hive) => hive.id === selectedBeeHiveId) ?? null;

  const addBeeHive = () => {
    if (!newBeeHiveName.trim()) {
      return;
    }
    const newHive: BeeHive = {
      id: makeId(),
      name: newBeeHiveName.trim(),
      location: '',
      hiveType: '',
      boxesBrood: '',
      boxesHoney: '',
      startDate: '',
      population: '',
    };
    setBeeHives((prev) => [newHive, ...prev]);
    setSelectedBeeHiveId(newHive.id);
    setNewBeeHiveName('');
  };

  const renameBeeHive = () => {
    if (!renameBeeHiveName.trim() || !selectedBeeHiveId) {
      return;
    }
    setBeeHives((prev) =>
      prev.map((hive) =>
        hive.id === selectedBeeHiveId ? { ...hive, name: renameBeeHiveName.trim() } : hive
      )
    );
    setRenameBeeHiveName('');
  };

  const updateBeeHive = (updates: Partial<BeeHive>) => {
    if (!selectedBeeHiveId) {
      return;
    }
    setBeeHives((prev) =>
      prev.map((hive) => (hive.id === selectedBeeHiveId ? { ...hive, ...updates } : hive))
    );
  };

  const addBeeQueenLog = () => {
    if (!selectedBeeHiveId) return;
    const entry: BeeQueenLog = {
      id: makeId(),
      date: new Date().toISOString().slice(0, 10),
      hiveId: selectedBeeHiveId,
      queenName: beeQueenName.trim(),
      markingColor: beeQueenMarking,
      breed: beeQueenBreed,
      origin: beeQueenOrigin,
      introducedDate: beeQueenIntroduced,
      layingStatus: beeQueenLaying,
      temperament: beeQueenTemperament,
      replacementHistory: beeQueenReplacement.trim(),
      notes: beeQueenNotes.trim(),
    };
    setBeeQueenLogs((prev) => [entry, ...prev]);
    setBeeQueenName('');
    setBeeQueenMarking('');
    setBeeQueenBreed('');
    setBeeQueenOrigin('');
    setBeeQueenIntroduced('');
    setBeeQueenLaying('');
    setBeeQueenTemperament('');
    setBeeQueenReplacement('');
    setBeeQueenNotes('');
  };

  const addBeeWorkerLog = () => {
    if (!selectedBeeHiveId) return;
    const entry: BeeWorkerLog = {
      id: makeId(),
      date: new Date().toISOString().slice(0, 10),
      hiveId: selectedBeeHiveId,
      populationStrength: beeWorkerStrength,
      behavior: beeWorkerBehavior,
      aggression: beeWorkerAggression,
      dronePresence: beeWorkerDronePresence,
      broodQuantity: beeWorkerBrood,
      notes: beeWorkerNotes.trim(),
    };
    setBeeWorkerLogs((prev) => [entry, ...prev]);
    setBeeWorkerStrength('');
    setBeeWorkerBehavior('');
    setBeeWorkerAggression('');
    setBeeWorkerDronePresence('');
    setBeeWorkerBrood('');
    setBeeWorkerNotes('');
  };

  const addBeeInspectionLog = () => {
    if (!selectedBeeHiveId || !beeInspectionDate.trim()) return;
    const entry: BeeInspectionLog = {
      id: makeId(),
      date: beeInspectionDate,
      hiveId: selectedBeeHiveId,
      checks: beeInspectionChecks,
      notes: beeInspectionNotes.trim(),
    };
    setBeeInspectionLogs((prev) => [entry, ...prev]);
    setBeeInspectionDate('');
    setBeeInspectionChecks([]);
    setBeeInspectionNotes('');
  };

  const addBeeHealthLog = () => {
    if (!selectedBeeHiveId || !beeHealthDate.trim()) return;
    const entry: BeeHealthLog = {
      id: makeId(),
      date: beeHealthDate,
      hiveId: selectedBeeHiveId,
      varroaCount: beeHealthVarroa.trim(),
      treatmentType: beeHealthTreatment.trim(),
      treatmentDate: beeHealthTreatmentDate,
      results: beeHealthResults.trim(),
      symptoms: beeHealthSymptoms.trim(),
    };
    setBeeHealthLogs((prev) => [entry, ...prev]);
    setBeeHealthDate('');
    setBeeHealthVarroa('');
    setBeeHealthTreatment('');
    setBeeHealthTreatmentDate('');
    setBeeHealthResults('');
    setBeeHealthSymptoms('');
  };

  const addBeeHoneyLog = () => {
    if (!selectedBeeHiveId || !beeHoneyDate.trim()) return;
    const entry: BeeHoneyLog = {
      id: makeId(),
      date: beeHoneyDate,
      hiveId: selectedBeeHiveId,
      supersAddedDate: beeHoneySupersAdded,
      supersRemovedDate: beeHoneySupersRemoved,
      framesHarvested: beeHoneyFrames.trim(),
      harvestAmount: beeHoneyAmount.trim(),
      harvestUnit: beeHoneyUnit,
      honeyType: beeHoneyType.trim(),
      honeyLeft: beeHoneyLeft.trim(),
      notes: beeHoneyNotes.trim(),
    };
    setBeeHoneyLogs((prev) => [entry, ...prev]);
    setBeeHoneyDate('');
    setBeeHoneySupersAdded('');
    setBeeHoneySupersRemoved('');
    setBeeHoneyFrames('');
    setBeeHoneyAmount('');
    setBeeHoneyUnit('lbs');
    setBeeHoneyType('');
    setBeeHoneyLeft('');
    setBeeHoneyNotes('');
  };

  const addBeeManagementLog = () => {
    if (!selectedBeeHiveId || !beeManagementDate.trim()) return;
    const entry: BeeManagementLog = {
      id: makeId(),
      date: beeManagementDate,
      hiveId: selectedBeeHiveId,
      actions: beeManagementActions,
      syrupType: beeManagementSyrupType.trim(),
      syrupAmount: beeManagementSyrupAmount.trim(),
      notes: beeManagementNotes.trim(),
    };
    setBeeManagementLogs((prev) => [entry, ...prev]);
    setBeeManagementDate('');
    setBeeManagementActions([]);
    setBeeManagementSyrupType('');
    setBeeManagementSyrupAmount('');
    setBeeManagementNotes('');
  };

  const addBeeSeasonalLog = () => {
    if (!selectedBeeHiveId || !beeSeasonalDate.trim()) return;
    const entry: BeeSeasonalLog = {
      id: makeId(),
      date: beeSeasonalDate,
      hiveId: selectedBeeHiveId,
      winterPrepActions: beeSeasonalActions,
      insulationAdded: beeSeasonalInsulation,
      entranceReducers: beeSeasonalReducers,
      fallStoresEstimate: beeSeasonalStores.trim(),
      springStatus: beeSeasonalSpringStatus,
      notes: beeSeasonalNotes.trim(),
    };
    setBeeSeasonalLogs((prev) => [entry, ...prev]);
    setBeeSeasonalDate('');
    setBeeSeasonalActions([]);
    setBeeSeasonalInsulation('');
    setBeeSeasonalReducers('');
    setBeeSeasonalStores('');
    setBeeSeasonalSpringStatus('');
    setBeeSeasonalNotes('');
  };

  const toggleProfileSection = (section: string) => {
    setExpandedProfileSections((prev) =>
      prev.includes(section) ? prev.filter((item) => item !== section) : [...prev, section]
    );
  };

  const updateLivestockEntry = (
    entryId: string,
    updater: (entry: LivestockLog) => LivestockLog
  ) => {
    setLivestockLogs((prev) => prev.map((entry) => (entry.id === entryId ? updater(entry) : entry)));
  };

  const addProfileWeightEntry = () => {
    if (!selectedLivestockEntry || !profileWeightValue.trim() || !profileWeightDate.trim()) return;
    const formatted = `${profileWeightValue.trim()} ${profileWeightUnit}`.trim();
    updateLivestockEntry(selectedLivestockEntry.id, (entry) => ({
      ...entry,
      weightLogs: [{ id: makeId(), value: formatted, date: profileWeightDate.trim() }, ...(entry.weightLogs ?? [])],
    }));
    setProfileWeightValue('');
    setProfileWeightDate('');
  };

  const addProfileDeformityEntry = () => {
    if (!selectedLivestockEntry || !profileDeformityNotes.trim() || !profileDeformityDate.trim()) return;
    updateLivestockEntry(selectedLivestockEntry.id, (entry) => ({
      ...entry,
      deformityLogs: [
        { id: makeId(), date: profileDeformityDate.trim(), notes: profileDeformityNotes.trim() },
        ...(entry.deformityLogs ?? []),
      ],
    }));
    setProfileDeformityNotes('');
    setProfileDeformityDate('');
  };

  const addProfileHoofEntry = () => {
    if (!selectedLivestockEntry || !profileHoofDate.trim()) return;
    updateLivestockEntry(selectedLivestockEntry.id, (entry) => ({
      ...entry,
      hoofLogs: [
        { id: makeId(), date: profileHoofDate.trim(), notes: profileHoofNotes.trim() },
        ...(entry.hoofLogs ?? []),
      ],
    }));
    setProfileHoofNotes('');
    setProfileHoofDate('');
  };

  const addProfileWoundEntry = () => {
    if (!selectedLivestockEntry || !profileWoundDate.trim()) return;
    updateLivestockEntry(selectedLivestockEntry.id, (entry) => ({
      ...entry,
      woundLogs: [
        {
          id: makeId(),
          date: profileWoundDate.trim(),
          notes: profileWoundNotes.trim(),
          followUps: [],
        },
        ...(entry.woundLogs ?? []),
      ],
    }));
    setProfileWoundNotes('');
    setProfileWoundDate('');
  };

  const addProfileVaccineEntry = () => {
    if (!selectedLivestockEntry || !profileVaccineDate.trim()) return;
    updateLivestockEntry(selectedLivestockEntry.id, (entry) => ({
      ...entry,
      vaccineLogs: [
        {
          id: makeId(),
          date: profileVaccineDate.trim(),
          notes: profileVaccineNotes.trim(),
          label: profileVaccineName.trim(),
        },
        ...(entry.vaccineLogs ?? []),
      ],
    }));
    setProfileVaccineName('');
    setProfileVaccineDate('');
    setProfileVaccineNotes('');
  };

  const addProfileWormingEntry = () => {
    if (!selectedLivestockEntry || !profileWormingDate.trim()) return;
    updateLivestockEntry(selectedLivestockEntry.id, (entry) => ({
      ...entry,
      wormingLogs: [
        {
          id: makeId(),
          date: profileWormingDate.trim(),
          notes: profileWormingNotes.trim(),
          label: profileWormingProduct.trim(),
        },
        ...(entry.wormingLogs ?? []),
      ],
    }));
    setProfileWormingProduct('');
    setProfileWormingDate('');
    setProfileWormingNotes('');
  };

  const addProfileProfitEntry = () => {
    if (!selectedLivestockEntry || !profileProfitDate.trim() || !profileProfitType.trim()) return;
    const quantityValue = profileProfitQuantity.trim();
    const priceValue = profileProfitPrice.trim();
    const quantityNum = Number(quantityValue);
    const priceNum = Number(priceValue);
    const totalValue =
      quantityValue && priceValue && !Number.isNaN(quantityNum) && !Number.isNaN(priceNum)
        ? (quantityNum * priceNum).toFixed(2)
        : '';
    const typeLabel = profileProfitType === 'Other' ? profileProfitOther.trim() : profileProfitType.trim();
    updateLivestockEntry(selectedLivestockEntry.id, (entry) => ({
      ...entry,
      profitEntries: [
        {
          id: makeId(),
          date: profileProfitDate.trim(),
          type: typeLabel || 'Other',
          quantity: quantityValue,
          pricePer: priceValue,
          total: totalValue,
          notes: profileProfitNotes.trim(),
        },
        ...(entry.profitEntries ?? []),
      ],
    }));
    setProfileProfitType('');
    setProfileProfitOther('');
    setProfileProfitQuantity('');
    setProfileProfitPrice('');
    setProfileProfitDate('');
    setProfileProfitNotes('');
  };

  const loadLivestockDraft = (entry: LivestockLog) => {
    setEditingLivestockId(entry.id);
    setSpecies(entry.species);
    setSelectedLivestockSpecies(entry.species);
    setLivestockSpeciesFilter(entry.species);
    setAnimalName(entry.animalName ?? '');
    setPastureName(entry.pastureName ?? '');
    setChickenCoopName(entry.chickenCoopName ?? '');
    setPigPenName(entry.pigPenName ?? '');
    setHorsePastureName(entry.horsePastureName ?? '');
    setRabbitHousingType(entry.rabbitHousingType ?? 'Cage');
    setRabbitHousingName(entry.rabbitHousingName ?? '');
    setBreed(entry.breed ?? '');
    setBreedSelections(Array.isArray(entry.breedList) ? entry.breedList : []);
    setBreedOther(entry.breedOther ?? '');
    setGender(entry.gender ?? '');
    setPurpose(Array.isArray(entry.purpose) ? entry.purpose : []);
    setBirthdate(entry.birthdate ?? null);
    setDeformities(entry.deformities ?? '');
    setDeformityLogs(Array.isArray(entry.deformityLogs) ? entry.deformityLogs : []);
    setShowQuality(entry.showQuality ?? '');
    setPedigree(entry.pedigree ?? '');
    setRegistration(entry.registration ?? '');
    setWeightLogs(Array.isArray(entry.weightLogs) ? entry.weightLogs : []);
    setHeightLogs(Array.isArray(entry.heightLogs) ? entry.heightLogs : []);
    setVaccineLogs(Array.isArray(entry.vaccineLogs) ? entry.vaccineLogs : []);
    setWormingLogs(Array.isArray(entry.wormingLogs) ? entry.wormingLogs : []);
    setHoofLogs(Array.isArray(entry.hoofLogs) ? entry.hoofLogs : []);
    setVetApptLogs(Array.isArray(entry.vetApptLogs) ? entry.vetApptLogs : []);
    setWoundLogs(Array.isArray(entry.woundLogs) ? entry.woundLogs : []);
    setUdderCondition(entry.udderCondition ?? '');
    setUdderNotes(entry.udderNotes ?? '');
    setMilkLogs(Array.isArray(entry.milkLogs) ? entry.milkLogs : []);
    setGrainBrand(entry.grainBrand ?? '');
    setGrainAmount(entry.grainAmount ?? '');
    setGrainAmountValue(entry.grainAmountValue ?? '');
    setGrainAmountUnit(entry.grainAmountUnit ?? '');
    setHayType(entry.hayType ?? '');
    setHayForm(Array.isArray(entry.hayForm) ? entry.hayForm : []);
    setMinerals(Array.isArray(entry.minerals) ? entry.minerals : []);
    setAnimalPhotoUri(entry.photoUri ?? null);
    setChickenLogType(entry.chickenLogType ?? '');
    setChickenGroupGenders(
      Array.isArray(entry.chickenGroupGenders) ? entry.chickenGroupGenders : []
    );
    setChickenHenCount(entry.chickenHenCount ?? '');
    setChickenRoosterCount(entry.chickenRoosterCount ?? '');
    setProfitEntries(Array.isArray(entry.profitEntries) ? entry.profitEntries : []);
    setShowCreateLog(true);
    setShowSubmitMessage(false);
  };

  const toggleLogSetting = (
    section: keyof typeof defaultLogSettings,
    field: string
  ) => {
    setLogSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field as keyof typeof prev[typeof section]],
      },
    }));
  };

  const visibleAnimals = useMemo(
    () => animals.filter((animal) => visibleLivestockSpecies.includes(animal)),
    [visibleLivestockSpecies]
  );
  const gardenBedOptions = ['All Beds', ...gardenBeds];
  const livestockSpeciesOptions = ['All species', ...visibleAnimals];
  const goatPastureOptions = useMemo(() => {
    const fromLogs = livestockLogs
      .filter((entry) => entry.species === 'Goat')
      .map((entry) => entry.pastureName)
      .filter((value): value is string => Boolean(value));
    const merged = Array.from(new Set([...pastureOptions, ...fromLogs]));
    return ['All pastures', ...merged];
  }, [livestockLogs, pastureOptions]);
  const chickenCoopFilterOptions = useMemo(() => {
    const fromLogs = livestockLogs
      .filter((entry) => entry.species === 'Chicken')
      .map((entry) => entry.chickenCoopName)
      .filter((value): value is string => Boolean(value));
    const merged = Array.from(new Set([...chickenCoopOptions, ...fromLogs]));
    return ['All coops', ...merged];
  }, [livestockLogs, chickenCoopOptions]);
  const rabbitHousingFilterOptions = useMemo(() => {
    const fromLogs = livestockLogs
      .filter((entry) => entry.species === 'Rabbit')
      .map((entry) => {
        const type = entry.rabbitHousingType || '';
        const name = entry.rabbitHousingName || '';
        return type && name ? `${type}: ${name}` : '';
      })
      .filter(Boolean);
    const merged = Array.from(new Set([...rabbitHousingOptions, ...fromLogs]));
    return ['All housing', ...merged];
  }, [livestockLogs, rabbitHousingOptions]);
  const pigPenFilterOptions = useMemo(() => {
    const fromLogs = livestockLogs
      .filter((entry) => entry.species === 'Pig')
      .map((entry) => entry.pigPenName)
      .filter((value): value is string => Boolean(value));
    const merged = Array.from(new Set([...pigPenOptions, ...fromLogs]));
    return ['All pens', ...merged];
  }, [livestockLogs, pigPenOptions]);
  const horsePastureFilterOptions = useMemo(() => {
    const fromLogs = livestockLogs
      .filter((entry) => entry.species === 'Horse')
      .map((entry) => entry.horsePastureName)
      .filter((value): value is string => Boolean(value));
    const merged = Array.from(new Set([...horsePastureOptions, ...fromLogs]));
    return ['All pastures', ...merged];
  }, [livestockLogs, horsePastureOptions]);
  const filteredGardenLogs = gardenLogs.filter((entry) => {
    const matchesBed = gardenBedFilter === 'All Beds' || entry.bed === gardenBedFilter;
    const matchesEvent =
      gardenEventFilters.length === 0 ||
      entry.tags.some((tag) => gardenEventFilters.includes(tag));
    return matchesBed && matchesEvent;
  });
  const activeLivestockSpecies =
    selectedLivestockSpecies ?? (livestockSpeciesFilter === 'All species' ? null : livestockSpeciesFilter);
  const filteredLivestockLogs = useMemo(() => {
    let filtered =
      activeLivestockSpecies == null
        ? livestockLogs
        : livestockLogs.filter((entry) => entry.species === activeLivestockSpecies);
    if (activeLivestockSpecies === 'Goat' && goatPastureFilter !== 'All pastures') {
      filtered = filtered.filter((entry) => entry.pastureName === goatPastureFilter);
    }
    if (activeLivestockSpecies === 'Chicken' && chickenCoopFilter !== 'All coops') {
      filtered = filtered.filter((entry) => entry.chickenCoopName === chickenCoopFilter);
    }
    if (activeLivestockSpecies === 'Rabbit' && rabbitHousingFilter !== 'All housing') {
      const [type, name] = rabbitHousingFilter.split(':').map((part) => part.trim());
      filtered = filtered.filter(
        (entry) => entry.rabbitHousingType === type && entry.rabbitHousingName === name
      );
    }
    if (activeLivestockSpecies === 'Pig' && pigPenFilter !== 'All pens') {
      filtered = filtered.filter((entry) => entry.pigPenName === pigPenFilter);
    }
    if (activeLivestockSpecies === 'Horse' && horsePastureFilter !== 'All pastures') {
      filtered = filtered.filter((entry) => entry.horsePastureName === horsePastureFilter);
    }
    return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [
    livestockLogs,
    activeLivestockSpecies,
    goatPastureFilter,
    chickenCoopFilter,
    rabbitHousingFilter,
    pigPenFilter,
    horsePastureFilter,
  ]);
  const groupedLivestockLogs = useMemo(() => {
    return filteredLivestockLogs.reduce<Record<string, LivestockLog[]>>((acc, entry) => {
      const key = entry.species || 'Unspecified';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    }, {});
  }, [filteredLivestockLogs]);
  const orderedLivestockGroups = useMemo(() => {
    const groups = Object.keys(groupedLivestockLogs);
    const ordered = animals.filter((animal) => groups.includes(animal));
    const extras = groups.filter((group) => !ordered.includes(group)).sort();
    return [...ordered, ...extras];
  }, [groupedLivestockLogs]);
  const groupedLivestockBreeds = useMemo(() => {
    if (!activeLivestockSpecies) {
      return {};
    }
    return filteredLivestockLogs.reduce<Record<string, LivestockLog[]>>((acc, entry) => {
      const key = entry.breed || entry.breedList?.join(', ') || 'Unknown Breed';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    }, {});
  }, [filteredLivestockLogs, activeLivestockSpecies]);
  const groupedLivestockPastures = useMemo(() => {
    if (activeLivestockSpecies !== 'Goat') {
      return {};
    }
    return filteredLivestockLogs.reduce<Record<string, LivestockLog[]>>((acc, entry) => {
      const key = entry.pastureName || 'No pasture';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    }, {});
  }, [filteredLivestockLogs, activeLivestockSpecies]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 20 }}>
      {activeSection == null && (
        <Text
          style={{
            fontSize: 36,
            textAlign: 'center',
            color: '#3A2E24',
            marginTop: 8,
            marginBottom: 12,
            fontFamily: 'SedgwickAve',
          }}
        >
          The Log Book
        </Text>
      )}
      <View style={{ alignItems: 'flex-end', marginBottom: 10, marginTop: activeSection ? 10 : 0 }}>
        <InfoButton
          text={
            activeSection === 'livestock'
              ? 'Create detailed records for each of your livestock animals. Use Customize to shape your form and Filters to find specific records. Connects to: Almanac, Trading Post.'
              : 'Create detailed records for livestock, gardens, pantry, harvest, and finances. Connects to: Almanac, Trading Post.'
          }
        />
      </View>

      <Image
        source={
          activeSection === 'livestock'
            ? speciesLogIcons[selectedLivestockSpecies ?? ''] ??
              require('../../assets/HCIcons/Icon_Homestead/Icon_LivestockLog.png')
            : activeSection === 'garden'
              ? require('../../assets/HCIcons/Icon_Homestead/Icon_GardeningLog.png')
              : activeSection === 'pantry'
                ? require('../../assets/HCIcons/Icon_Homestead/Icon_PantryLog.png')
                : activeSection === 'harvest'
                  ? require('../../assets/HCIcons/Icon_Homestead/Icon_HarvestLog.png')
                  : activeSection === 'finances'
                    ? require('../../assets/HCIcons/Icon_Homestead/Icon_FinanceLog.png')
                    : require('../../assets/HCIcons/Icon_Extra/Icon_LogPencil.png')
        }
        style={{
          width: activeSection === 'pantry' ? 340 : 220,
          height: activeSection === 'pantry' ? 340 : 220,
          alignSelf: 'center',
          marginTop: activeSection === 'pantry' ? -84 : activeSection ? -40 : -56,
          marginBottom: -16,
        }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />

      {!activeSection ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {logBookSections.map((section) => (
              <Pressable
                key={section.id}
                onPress={() => {
                  setActiveSection(section.id);
                  setShowCreateLog(false);
                  setShowSubmitMessage(false);
                }}
                style={{
                  width: '48%',
                  height: 180,
                  paddingVertical: 0,
                  backgroundColor: '#F5F0E1',
                  marginBottom: 10,
                  borderRadius: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={section.icon}
                  style={{
                    width: section.id === 'pantry' ? 170 : 170,
                    height: section.id === 'pantry' ? 170 : 170,
                    marginBottom: 0,
                    transform:
                      section.id === 'pantry'
                        ? [{ scale: 1.7 }, { translateY: 10 }]
                        : section.id === 'finances'
                          ? [{ scale: 1.1 }]
                          : section.id === 'garden'
                            ? [{ scale: 1.08 }]
                            : undefined,
                  }}
                  resizeMode="contain"
                  accessibilityIgnoresInvertColors
                />
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          <Pressable
            onPress={() => {
              if (activeSection === 'livestock' && selectedLivestockSpecies) {
                setSelectedLivestockSpecies(null);
                setLivestockSpeciesFilter('All species');
                setShowCreateLog(false);
                return;
              }
              setActiveSection(null);
              setShowCreateLog(false);
              setShowSubmitMessage(false);
            }}
            style={{
              marginBottom: 12,
              marginTop: activeSection === 'pantry' ? -32 : 16,
            }}
          >
            <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>
              {activeSection === 'livestock' && selectedLivestockSpecies ? 'Back to Species' : 'Back to Log Book'}
            </Text>
          </Pressable>
          <View
            style={{
              flexDirection: activeSection === 'livestock' ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: activeSection === 'livestock' ? 8 : 0,
              alignSelf: 'flex-end',
              marginBottom: 12,
              marginTop:
                activeSection === 'livestock'
                  ? -12
                  : activeSection === 'pantry'
                    ? -72
                    : -32,
            }}
          >
            <Pressable
              onPress={() => setShowLogSettings(true)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: '#EADBCB',
                borderWidth: 1,
                borderColor: '#D7C9B7',
                marginBottom: activeSection === 'livestock' ? 0 : 8,
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Customize Log Options</Text>
            </Pressable>
            {!(activeSection === 'livestock' && selectedLivestockSpecies) && (
              <Pressable
                onPress={clearDraft}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: '#FFF1D8',
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                }}
              >
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Clear Draft</Text>
              </Pressable>
            )}
          </View>

          <Text
            style={{
              fontSize: 22,
              marginBottom: 8,
              marginTop: activeSection === 'pantry' ? -24 : activeSection ? -18 : 0,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
              zIndex: 2,
            }}
          >
            {logBookSections.find((section) => section.id === activeSection)?.label}
          </Text>

          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              marginTop: activeSection === 'pantry' ? -16 : activeSection ? -12 : 0,
              zIndex: 1,
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 6, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              Current Logs
            </Text>
            {activeSection === 'garden' ? (
              <>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <Pressable
                    onPress={() => setShowGardenFilters((prev) => !prev)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 8,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      backgroundColor: '#FFF8EE',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 13 }}>
                      {showGardenFilters ? 'Hide Filters' : 'Filters'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowCreateLog((prev) => !prev)}
                    style={{
                      backgroundColor: '#8B5E3C',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'SedgwickAve' }}>
                      {showCreateLog ? 'Hide Log Form' : 'Create Log'}
                    </Text>
                  </Pressable>
                </View>
                {showGardenFilters && (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#E0D6C7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 12,
                      backgroundColor: '#FFF8EE',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Bed</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {gardenBedOptions.map((bed) => {
                        const selected = gardenBedFilter === bed;
                        return (
                          <Pressable
                            key={bed}
                            onPress={() => setGardenBedFilter(bed)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{bed}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Event type
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      {gardenEventOptions.map((event) => {
                        const selected = gardenEventFilters.includes(event);
                        return (
                          <Pressable
                            key={event}
                            onPress={() => toggleMulti(event, setGardenEventFilters)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{event}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {savedGardenFilters.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        {savedGardenFilters.map((filterSet, index) => (
                          <Pressable
                            key={`saved-garden-${index}`}
                            onPress={() => {
                              setGardenBedFilter(filterSet.bed);
                              setGardenEventFilters(filterSet.events);
                            }}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              backgroundColor: '#FFFDF6',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                              Saved {index + 1}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                    <Pressable
                      onPress={() => {
                        if (gardenBedFilter === 'All Beds' && gardenEventFilters.length === 0) {
                          return;
                        }
                        setSavedGardenFilters((prev) => [
                          ...prev,
                          { bed: gardenBedFilter, events: gardenEventFilters },
                        ]);
                      }}
                      style={{ marginBottom: 8 }}
                    >
                      <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Save filters</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setGardenBedFilter('All Beds');
                        setGardenEventFilters([]);
                      }}
                    >
                      <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Clear filters</Text>
                    </Pressable>
                  </View>
                )}
                {filteredGardenLogs.length === 0 ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
                    No garden logs yet. Create your first entry below.
                  </Text>
                ) : (
                  <View style={{ marginBottom: 12 }}>
                    {filteredGardenLogs.map((entry) => (
                      <View
                        key={entry.id}
                        style={{
                          borderWidth: 1,
                          borderColor: '#E0D6C7',
                          borderRadius: 10,
                          padding: 10,
                          marginBottom: 8,
                          backgroundColor: '#FFF8EE',
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                            {formatDisplayDate(entry.date)} • {entry.bed}
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Pressable
                              onPress={() => {
                                setEditingGardenId(entry.id);
                                setSelectedBed(entry.bed);
                                setGardenDate(entry.date);
                                setGardenPlants(entry.plants);
                                setGardenCrop(entry.crop);
                                setGardenTask(entry.task);
                                setGardenPrepDate(entry.prepDate);
                                setGardenPrepNotes(entry.prepNotes);
                                setGardenSeedDate(entry.seedDate);
                                setGardenSoil(entry.soil);
                                setGardenWatering(entry.watering);
                                setGardenPests(entry.pests);
                                setGardenFertilizer(entry.fertilizer);
                                setGardenFertilizerDate(entry.fertilizerDate);
                                setGardenWeather(entry.weather);
                                setGardenStage(entry.stage);
                                setGardenNotes(entry.notes);
                                setGardenPlanPrepDate(
                                  entry.plan.find((planItem) => planItem.label === 'Prep bed')?.date ?? ''
                                );
                                setGardenPlanPrepLead(
                                  entry.plan.find((planItem) => planItem.label === 'Prep bed')?.leadDays ?? ''
                                );
                                setGardenPlanSeedDate(
                                  entry.plan.find((planItem) => planItem.label === 'Seed')?.date ?? ''
                                );
                                setGardenPlanSeedLead(
                                  entry.plan.find((planItem) => planItem.label === 'Seed')?.leadDays ?? ''
                                );
                                setGardenPlanFertilizeDate(
                                  entry.plan.find((planItem) => planItem.label === 'Fertilize')?.date ?? ''
                                );
                                setGardenPlanFertilizeLead(
                                  entry.plan.find((planItem) => planItem.label === 'Fertilize')?.leadDays ?? ''
                                );
                              }}
                            >
                              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
                            </Pressable>
                            <Pressable
                              onPress={() =>
                                Alert.alert('Delete garden log?', 'This cannot be undone.', [
                                  { text: 'Cancel', style: 'cancel' },
                                  {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () =>
                                      setGardenLogs((prev) => prev.filter((item) => item.id !== entry.id)),
                                  },
                                ])
                              }
                            >
                              <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve' }}>Delete</Text>
                            </Pressable>
                          </View>
                        </View>
                        {entry.tags.length > 0 && (
                          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                            Tags: {entry.tags.join(', ')}
                          </Text>
                        )}
                        {entry.plants.length > 0 && (
                          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                            Plants: {entry.plants.join(', ')}
                          </Text>
                        )}
                        {entry.crop && (
                          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                            Crop: {entry.crop}
                          </Text>
                        )}
                        {entry.fertilizer && (
                          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                            Fertilizer: {entry.fertilizer}
                            {entry.fertilizerDate ? ` (${entry.fertilizerDate})` : ''}
                          </Text>
                        )}
                        {entry.prepDate && (
                          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                            Prep bed: {entry.prepDate}
                          </Text>
                        )}
                        {entry.seedDate && (
                          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                            Seed date: {entry.seedDate}
                          </Text>
                        )}
                        {entry.pests && (
                          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                            Pests: {entry.pests}
                          </Text>
                        )}
                        {entry.stage && (
                          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                            Growth stage: {entry.stage}
                          </Text>
                        )}
                        {entry.plan.length > 0 && (
                          <View style={{ marginTop: 4 }}>
                            {entry.plan.map((planItem) => (
                              <Text
                                key={`${entry.id}-${planItem.label}-${planItem.date}`}
                                style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}
                              >
                                Planned {planItem.label}: {formatDisplayDate(planItem.date)}
                                {planItem.leadDays ? ` (alert ${planItem.leadDays} days early)` : ''}
                              </Text>
                            ))}
                          </View>
                        )}
                        {(entry.task || entry.notes) && (
                          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 4 }}>
                            {[entry.task && `Task: ${entry.task}`, entry.notes && `Notes: ${entry.notes}`]
                              .filter(Boolean)
                              .join(' • ')}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : activeSection === 'livestock' ? (
              <>
                {!selectedLivestockSpecies ? (
                  <>
                    <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                      Choose a species to view your animals by breed.
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                      {visibleAnimals.map((animal) => (
                        <Pressable
                          key={animal}
                          onPress={() => {
                            setSelectedLivestockSpecies(animal);
                            setLivestockSpeciesFilter(animal);
                            setSpecies(animal);
                            setBreed('');
                            setBreedSelections([]);
                            setGender('');
                            setPurpose([]);
                            setAnimalPhotoUri(null);
                            setPastureName('');
                            setGoatPastureFilter('All pastures');
                            setChickenCoopFilter('All coops');
                            setPigPenFilter('All pens');
                            setHorsePastureFilter('All pastures');
                            setRabbitHousingFilter('All housing');
                            setShowSpeciesPicker(false);
                          }}
                          style={{
                            flexBasis: '48%',
                            borderRadius: 12,
                            paddingVertical: 6,
                            paddingHorizontal: 6,
                            alignItems: 'center',
                          }}
                        >
                          {speciesLogIcons[animal] ? (
                            <View
                              style={{
                                width: 110,
                                height: 110,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Image
                                source={speciesLogIcons[animal]}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="contain"
                                accessibilityIgnoresInvertColors
                              />
                            </View>
                          ) : null}
                        </Pressable>
                      ))}
                    </View>
                  </>
                ) : (
                  <>
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                      <Pressable
                        onPress={() => {
                          if (!showCreateLog) {
                            resetDraftFields({ preserveSection: true, preserveCreateLog: false, preserveSpecies: true });
                          }
                          setEditingLivestockId(null);
                          setShowCreateLog((prev) => !prev);
                        }}
                        style={{
                          backgroundColor: '#8B5E3C',
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'SedgwickAve' }}>
                          {showCreateLog ? 'Hide Log Form' : `Create ${getSpeciesLabel(selectedLivestockSpecies)} Log`}
                        </Text>
                      </Pressable>
                    </View>
                    {selectedLivestockSpecies === 'Goat' && goatPastureOptions.length > 1 && (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                          Pasture filter
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {goatPastureOptions.map((option) => {
                            const selected = goatPastureFilter === option;
                            return (
                              <Pressable
                                key={`goat-pasture-${option}`}
                                onPress={() => setGoatPastureFilter(option)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 16,
                                  borderWidth: 1,
                                  borderColor: selected ? '#4C7744' : '#D7C9B7',
                                  backgroundColor: selected ? '#D8E6D2' : '#FFFFFF',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    )}
                    {selectedLivestockSpecies === 'Chicken' && chickenCoopFilterOptions.length > 1 && (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                          Coop filter
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {chickenCoopFilterOptions.map((option) => {
                            const selected = chickenCoopFilter === option;
                            return (
                              <Pressable
                                key={`chicken-coop-${option}`}
                                onPress={() => setChickenCoopFilter(option)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 16,
                                  borderWidth: 1,
                                  borderColor: selected ? '#4C7744' : '#D7C9B7',
                                  backgroundColor: selected ? '#D8E6D2' : '#FFFFFF',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    )}
                    {selectedLivestockSpecies === 'Pig' && pigPenFilterOptions.length > 1 && (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                          Pen filter
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {pigPenFilterOptions.map((option) => {
                            const selected = pigPenFilter === option;
                            return (
                              <Pressable
                                key={`pig-pen-${option}`}
                                onPress={() => setPigPenFilter(option)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 16,
                                  borderWidth: 1,
                                  borderColor: selected ? '#4C7744' : '#D7C9B7',
                                  backgroundColor: selected ? '#D8E6D2' : '#FFFFFF',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    )}
                    {selectedLivestockSpecies === 'Horse' && horsePastureFilterOptions.length > 1 && (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                          Pasture filter
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {horsePastureFilterOptions.map((option) => {
                            const selected = horsePastureFilter === option;
                            return (
                              <Pressable
                                key={`horse-pasture-${option}`}
                                onPress={() => setHorsePastureFilter(option)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 16,
                                  borderWidth: 1,
                                  borderColor: selected ? '#4C7744' : '#D7C9B7',
                                  backgroundColor: selected ? '#D8E6D2' : '#FFFFFF',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    )}
                    {selectedLivestockSpecies === 'Rabbit' && rabbitHousingFilterOptions.length > 1 && (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                          Cage/Pen filter
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {rabbitHousingFilterOptions.map((option) => {
                            const selected = rabbitHousingFilter === option;
                            return (
                              <Pressable
                                key={`rabbit-housing-${option}`}
                                onPress={() => setRabbitHousingFilter(option)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 16,
                                  borderWidth: 1,
                                  borderColor: selected ? '#4C7744' : '#D7C9B7',
                                  backgroundColor: selected ? '#D8E6D2' : '#FFFFFF',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    )}
                    {filteredLivestockLogs.length === 0 ? (
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
                        No {getSpeciesLabel(selectedLivestockSpecies)} yet. Create your first record below.
                      </Text>
                    ) : (
                      <View style={{ gap: 12, marginBottom: 12 }}>
                        {Object.keys(selectedLivestockSpecies === 'Goat' ? groupedLivestockPastures : groupedLivestockBreeds)
                          .sort()
                          .map((groupKey) => {
                            const groupEntries =
                              selectedLivestockSpecies === 'Goat'
                                ? groupedLivestockPastures[groupKey]
                                : groupedLivestockBreeds[groupKey];
                            return (
                              <View key={groupKey}>
                                <Text
                                  style={{
                                    color: '#3A2E24',
                                    fontFamily: 'SedgwickAve',
                                    marginBottom: 8,
                                    fontSize: 16,
                                  }}
                                >
                                  {groupKey} ({groupEntries.length})
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                  {groupEntries.map((entry) => (
                                    <Pressable
                                      key={entry.id}
                                      onPress={() => setSelectedLivestockEntry(entry)}
                                    style={{
                                      width: '48%',
                                      borderWidth: 2,
                                      borderColor: getGenderBorderColor(entry.gender),
                                      borderRadius: 12,
                                      padding: 8,
                                      backgroundColor: '#FFFDF6',
                                      alignItems: 'center',
                                    }}
                                  >
                                    {entry.photoUri ? (
                                      <Image
                                        source={{ uri: entry.photoUri }}
                                        style={{ width: 90, height: 90, borderRadius: 10, marginBottom: 6 }}
                                        resizeMode="cover"
                                      />
                                    ) : (
                                      <View
                                        style={{
                                          width: 90,
                                          height: 90,
                                          borderRadius: 10,
                                          backgroundColor: '#EFE4D4',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          marginBottom: 6,
                                        }}
                                      >
                                        <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve', fontSize: 18 }}>
                                          {entry.animalName?.[0]?.toUpperCase() || '?'}
                                        </Text>
                                      </View>
                                    )}
                                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                                      {entry.animalName || 'Unnamed'}
                                    </Text>
                                    {selectedLivestockSpecies === 'Goat' && entry.pastureName ? (
                                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                                        {entry.pastureName}
                                      </Text>
                                    ) : null}
                                    {selectedLivestockSpecies === 'Chicken' && entry.chickenCoopName ? (
                                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                                        {entry.chickenCoopName}
                                      </Text>
                                    ) : null}
                                    {selectedLivestockSpecies === 'Rabbit' &&
                                    entry.rabbitHousingType &&
                                    entry.rabbitHousingName ? (
                                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                                        {entry.rabbitHousingType}: {entry.rabbitHousingName}
                                      </Text>
                                    ) : null}
                                    {selectedLivestockSpecies === 'Pig' && entry.pigPenName ? (
                                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                                        {entry.pigPenName}
                                      </Text>
                                    ) : null}
                                    {selectedLivestockSpecies === 'Horse' && entry.horsePastureName ? (
                                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                                        {entry.horsePastureName}
                                      </Text>
                                    ) : null}
                                  </Pressable>
                                  ))}
                                </View>
                              </View>
                            );
                          })}
                      </View>
                    )}
                  </>
                )}
              </>
            ) : activeSection === 'pantry' ? (
              <>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <Pressable
                    onPress={() => setShowPantryFilters((prev) => !prev)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 8,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      backgroundColor: '#FFF8EE',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 13 }}>
                      {showPantryFilters ? 'Hide Filters' : 'Filters'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowCreateLog((prev) => !prev)}
                    style={{
                      backgroundColor: '#8B5E3C',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'SedgwickAve' }}>
                      {showCreateLog ? 'Hide Log Form' : 'Create Log'}
                    </Text>
                  </Pressable>
                </View>
                {showPantryFilters && (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#E0D6C7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 12,
                      backgroundColor: '#FFF8EE',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Pantry type
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {['All types', ...pantryTypeOptions].map((type) => {
                        const selected = pantryTypeFilter === type;
                        return (
                          <Pressable
                            key={type}
                            onPress={() => setPantryTypeFilter(type)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{type}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Preservation method
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {['All methods', ...pantryMethods].map((method) => {
                        const selected = pantryMethodFilter === method;
                        return (
                          <Pressable
                            key={method}
                            onPress={() => setPantryMethodFilter(method)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{method}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Category
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {['All categories', ...pantryCategoryOptions].map((category) => {
                        const selected = pantryCategoryFilter === category;
                        return (
                          <Pressable
                            key={category}
                            onPress={() => setPantryCategoryFilter(category)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{category}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Location
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {pantryLocationOptions.map((location) => {
                        const selected = pantryLocationFilter === location;
                        return (
                          <Pressable
                            key={location}
                            onPress={() => setPantryLocationFilter(location)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{location}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Use-by
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {['Any use-by', 'Expired', 'Next 7 days', 'Next 30 days', 'Next 90 days'].map((option) => {
                        const selected = pantryUseByFilter === option;
                        return (
                          <Pressable
                            key={option}
                            onPress={() => setPantryUseByFilter(option)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Stock
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      {['All stock', 'Low stock'].map((option) => {
                        const selected = pantryStockFilter === option;
                        return (
                          <Pressable
                            key={option}
                            onPress={() => setPantryStockFilter(option)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {savedPantryFilters.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        {savedPantryFilters.map((filterSet, index) => (
                          <Pressable
                            key={`saved-pantry-${index}`}
                            onPress={() => {
                              setPantryMethodFilter(filterSet.method);
                              setPantryTypeFilter(filterSet.type);
                              setPantryCategoryFilter(filterSet.category);
                              setPantryLocationFilter(filterSet.location);
                              setPantryUseByFilter(filterSet.useBy);
                              setPantryStockFilter(filterSet.stock);
                            }}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              backgroundColor: '#FFFDF6',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                              Saved {index + 1}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                    <Pressable
                      onPress={() => {
                        if (
                          pantryMethodFilter === 'All methods' &&
                          pantryTypeFilter === 'All types' &&
                          pantryCategoryFilter === 'All categories' &&
                          pantryLocationFilter === 'All locations' &&
                          pantryUseByFilter === 'Any use-by' &&
                          pantryStockFilter === 'All stock'
                        ) {
                          return;
                        }
                        setSavedPantryFilters((prev) => [
                          ...prev,
                          {
                            method: pantryMethodFilter,
                            type: pantryTypeFilter,
                            category: pantryCategoryFilter,
                            location: pantryLocationFilter,
                            useBy: pantryUseByFilter,
                            stock: pantryStockFilter,
                          },
                        ]);
                      }}
                      style={{ marginBottom: 8 }}
                    >
                      <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Save filters</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setPantryMethodFilter('All methods');
                        setPantryTypeFilter('All types');
                        setPantryCategoryFilter('All categories');
                        setPantryLocationFilter('All locations');
                        setPantryUseByFilter('Any use-by');
                        setPantryStockFilter('All stock');
                      }}
                    >
                      <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Clear filters</Text>
                    </Pressable>
                  </View>
                )}
                {filteredPantryLogs.length === 0 ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
                    No pantry logs match those filters yet.
                  </Text>
                ) : (
                  filteredPantryLogs.map((entry) => (
                    <View
                      key={entry.id}
                      style={{
                        borderWidth: 1,
                        borderColor: '#E0D6C7',
                        borderRadius: 10,
                        padding: 10,
                        marginBottom: 8,
                        backgroundColor: '#FFF8EE',
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                          {formatDisplayDate(entry.date)} • {entry.item}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Pressable
                            onPress={() => {
                              setEditingPantryId(entry.id);
                              setPantryItem(entry.item);
                              setPantryType(entry.type);
                              setPantryMethod(entry.method);
                              setPantryCategory(entry.category);
                              setPantryBatch(entry.batch);
                              setPantryDate(entry.date);
                              setPantryUseBy(entry.useBy);
                              setPantryLocation(entry.location);
                              setPantryQuantity(entry.quantity);
                              setPantryQuantityUnit(entry.quantityUnit);
                              setPantryIngredients(entry.ingredients);
                              setPantryNotes(entry.notes);
                            }}
                          >
                            <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
                          </Pressable>
                          <Pressable
                            onPress={() =>
                              Alert.alert('Delete pantry log?', 'This cannot be undone.', [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Delete',
                                  style: 'destructive',
                                  onPress: () =>
                                    setPantryLogs((prev) => prev.filter((item) => item.id !== entry.id)),
                                },
                              ])
                            }
                          >
                            <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve' }}>Delete</Text>
                          </Pressable>
                        </View>
                      </View>
                      {!!entry.type && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Type: {entry.type}
                        </Text>
                      )}
                      {!!entry.method && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Method: {entry.method}
                        </Text>
                      )}
                      {!!entry.category && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Category: {entry.category}
                        </Text>
                      )}
                      {!!entry.batch && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Batch: {entry.batch}
                        </Text>
                      )}
                      {(entry.quantity || entry.quantityUnit) && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Quantity: {[entry.quantity, entry.quantityUnit].filter(Boolean).join(' ')}
                        </Text>
                      )}
                      {!!entry.location && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Stored in: {entry.location}
                        </Text>
                      )}
                      {!!entry.useBy && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Use by: {formatDisplayDate(entry.useBy)}
                        </Text>
                      )}
                      {!!entry.notes && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Notes: {entry.notes}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </>
            ) : activeSection === 'harvest' ? (
              <>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <Pressable
                    onPress={() => setShowHarvestFilters((prev) => !prev)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 8,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      backgroundColor: '#FFF8EE',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 13 }}>
                      {showHarvestFilters ? 'Hide Filters' : 'Filters'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowCreateLog((prev) => !prev)}
                    style={{
                      backgroundColor: '#8B5E3C',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'SedgwickAve' }}>
                      {showCreateLog ? 'Hide Log Form' : 'Create Log'}
                    </Text>
                  </Pressable>
                </View>
                {showHarvestFilters && (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#E0D6C7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 12,
                      backgroundColor: '#FFF8EE',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Location
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {harvestLocationOptions.map((location) => {
                        const selected = harvestLocationFilter === location;
                        return (
                          <Pressable
                            key={location}
                            onPress={() => setHarvestLocationFilter(location)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{location}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Storage
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      {harvestStorageOptions.map((storage) => {
                        const selected = harvestStorageFilter === storage;
                        return (
                          <Pressable
                            key={storage}
                            onPress={() => setHarvestStorageFilter(storage)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{storage}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {savedHarvestFilters.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        {savedHarvestFilters.map((filterSet, index) => (
                          <Pressable
                            key={`saved-harvest-${index}`}
                            onPress={() => {
                              setHarvestLocationFilter(filterSet.location);
                              setHarvestStorageFilter(filterSet.storage);
                            }}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              backgroundColor: '#FFFDF6',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                              Saved {index + 1}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                    <Pressable
                      onPress={() => {
                        if (harvestLocationFilter === 'All locations' && harvestStorageFilter === 'All storage') {
                          return;
                        }
                        setSavedHarvestFilters((prev) => [
                          ...prev,
                          { location: harvestLocationFilter, storage: harvestStorageFilter },
                        ]);
                      }}
                      style={{ marginBottom: 8 }}
                    >
                      <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Save filters</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setHarvestLocationFilter('All locations');
                        setHarvestStorageFilter('All storage');
                      }}
                    >
                      <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Clear filters</Text>
                    </Pressable>
                  </View>
                )}
                {filteredHarvestLogs.length === 0 ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
                    No harvest logs match those filters yet.
                  </Text>
                ) : (
                  filteredHarvestLogs.map((entry) => (
                    <View
                      key={entry.id}
                      style={{
                        borderWidth: 1,
                        borderColor: '#E0D6C7',
                        borderRadius: 10,
                        padding: 10,
                        marginBottom: 8,
                        backgroundColor: '#FFF8EE',
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                          {formatDisplayDate(entry.date)} • {entry.item}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Pressable
                            onPress={() => {
                              setEditingHarvestId(entry.id);
                              setHarvestItem(entry.item);
                              setHarvestYield(entry.yieldAmount);
                              setHarvestYieldUnit(entry.yieldUnit);
                              setHarvestDate(entry.date);
                              setHarvestQuality(entry.quality);
                              setHarvestLocation(entry.location);
                              setHarvestStorage(entry.storage);
                              setHarvestWeather(entry.weather);
                              setHarvestNotes(entry.notes);
                            }}
                          >
                            <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
                          </Pressable>
                          <Pressable
                            onPress={() =>
                              Alert.alert('Delete harvest log?', 'This cannot be undone.', [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Delete',
                                  style: 'destructive',
                                  onPress: () =>
                                    setHarvestLogs((prev) => prev.filter((item) => item.id !== entry.id)),
                                },
                              ])
                            }
                          >
                            <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve' }}>Delete</Text>
                          </Pressable>
                        </View>
                      </View>
                      {!!entry.yieldAmount && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Yield: {entry.yieldAmount} {entry.yieldUnit}
                        </Text>
                      )}
                      {!!entry.location && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Location: {entry.location}
                        </Text>
                      )}
                      {!!entry.notes && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Notes: {entry.notes}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </>
            ) : activeSection === 'finances' ? (
              <>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <Pressable
                    onPress={() => setShowFinanceFilters((prev) => !prev)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 8,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      backgroundColor: '#FFF8EE',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 13 }}>
                      {showFinanceFilters ? 'Hide Filters' : 'Filters'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowCreateLog((prev) => !prev)}
                    style={{
                      backgroundColor: '#8B5E3C',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'SedgwickAve' }}>
                      {showCreateLog ? 'Hide Log Form' : 'Create Log'}
                    </Text>
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <Pressable
                    onPress={() => quickAddFinance('Expense', 'Feed')}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      backgroundColor: '#FFF1D8',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Quick Add: Feed</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => quickAddFinance('Expense', 'Veterinary')}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      backgroundColor: '#FFF1D8',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Quick Add: Vet</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => quickAddFinance('Income', 'Garden Produce')}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      backgroundColor: '#EADBCB',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Quick Add: Sale</Text>
                  </Pressable>
                </View>
                {showFinanceFilters && (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#E0D6C7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 12,
                      backgroundColor: '#FFF8EE',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Entry type
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {['Income', 'Expense'].map((type) => {
                        const selected = financeTypeFilter.includes(type);
                        return (
                          <Pressable
                            key={type}
                            onPress={() => toggleMulti(type, setFinanceTypeFilter)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{type}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                      Category
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      {[
                        ...Array.from(
                          new Set([
                            ...(financeTypeFilter.length === 0
                              ? [
                                  ...incomeCategories,
                                  ...expenseCategories,
                                  ...customIncomeCategories,
                                  ...customExpenseCategories,
                                ]
                              : financeTypeFilter.includes('Income') && financeTypeFilter.includes('Expense')
                                ? [
                                    ...incomeCategories,
                                    ...expenseCategories,
                                    ...customIncomeCategories,
                                    ...customExpenseCategories,
                                  ]
                                : financeTypeFilter.includes('Income')
                                  ? [...incomeCategories, ...customIncomeCategories]
                                  : [...expenseCategories, ...customExpenseCategories]),
                          ])
                        ),
                      ].map((category) => {
                        const selected = financeCategoryFilter.includes(category);
                        return (
                          <Pressable
                            key={category}
                            onPress={() => toggleMulti(category, setFinanceCategoryFilter)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{category}</Text>
                          </Pressable>
                        );
                      })}
                        </View>
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Animal filter
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {visibleAnimals.map((animal) => {
                              const selected = financeAnimalFilter.includes(animal);
                              return (
                                <Pressable
                                  key={`finance-animal-filter-${animal}`}
                                  onPress={() => toggleMulti(animal, setFinanceAnimalFilter)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{animal}</Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Unit filter
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {financeQuantityUnits.map((unit) => {
                              const selected = financeUnitFilter.includes(unit);
                              return (
                                <Pressable
                                  key={`finance-unit-filter-${unit}`}
                                  onPress={() => toggleMulti(unit, setFinanceUnitFilter)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{unit}</Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Month
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {financeMonthOptions.map((month) => {
                              const selected = financeMonthFilter === month;
                              return (
                                <Pressable
                                  key={`finance-month-${month}`}
                                  onPress={() => setFinanceMonthFilter(month)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                                    {formatMonthLabel(month)}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                        {savedFinanceFilters.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        {savedFinanceFilters.map((filterSet, index) => (
                          <Pressable
                            key={`saved-finance-${index}`}
                            onPress={() => {
                              setFinanceTypeFilter(filterSet.type);
                              setFinanceCategoryFilter(filterSet.category);
                              setFinanceAnimalFilter(filterSet.animals ?? []);
                              setFinanceUnitFilter(filterSet.units ?? []);
                            }}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              backgroundColor: '#FFFDF6',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                              Saved {index + 1}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                    <Pressable
                      onPress={() => {
                        if (
                          financeTypeFilter.length === 0 &&
                          financeCategoryFilter.length === 0 &&
                          financeAnimalFilter.length === 0 &&
                          financeUnitFilter.length === 0 &&
                          financeMonthFilter === 'All months'
                        ) {
                          return;
                        }
                        setSavedFinanceFilters((prev) => [
                          ...prev,
                          {
                            type: financeTypeFilter,
                            category: financeCategoryFilter,
                            animals: financeAnimalFilter,
                            units: financeUnitFilter,
                          },
                        ]);
                      }}
                      style={{ marginBottom: 8 }}
                    >
                      <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Save filters</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setFinanceTypeFilter([]);
                        setFinanceCategoryFilter([]);
                        setFinanceAnimalFilter([]);
                        setFinanceMonthFilter('All months');
                        setFinanceUnitFilter([]);
                      }}
                    >
                      <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Clear filters</Text>
                    </Pressable>
                  </View>
                )}
                {(financeSummary.incomeTotal > 0 || financeSummary.expenseTotal > 0) && (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#E0D6C7',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 12,
                      backgroundColor: '#FFF8EE',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                      Money snapshot
                    </Text>
                    <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                      Income vs expense
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        height: 10,
                        borderRadius: 6,
                        overflow: 'hidden',
                        backgroundColor: '#EFE4D4',
                        marginBottom: 6,
                      }}
                    >
                      <View style={{ flex: financeSummary.incomeTotal, backgroundColor: '#4C7744' }} />
                      <View style={{ flex: financeSummary.expenseTotal, backgroundColor: '#8B5E3C' }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                        Income ${financeSummary.incomeTotal.toFixed(2)}
                      </Text>
                      <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                        Expense ${financeSummary.expenseTotal.toFixed(2)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                        Last 30d: +${financeSummary.last30.income.toFixed(0)} / -${financeSummary.last30.expense.toFixed(0)}
                      </Text>
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                        Last 90d: +${financeSummary.last90.income.toFixed(0)} / -${financeSummary.last90.expense.toFixed(0)}
                      </Text>
                    </View>
                    {financeSummary.animalTotals.length > 0 && (
                      <>
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                          By animal
                        </Text>
                        <View style={{ gap: 6, marginBottom: 10 }}>
                          {financeSummary.animalTotals.slice(0, 6).map(([label, totals]) => (
                            <View key={`animal-total-${label}`} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                                {label}
                              </Text>
                              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                                +${totals.income.toFixed(0)} / -${totals.expense.toFixed(0)}
                              </Text>
                            </View>
                          ))}
                          {financeSummary.animalTotals.length > 6 && (
                            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                              and {financeSummary.animalTotals.length - 6} more...
                            </Text>
                          )}
                        </View>
                      </>
                    )}
                    {financeSummary.expenseTotal > 0 && (
                      <>
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                          Expense breakdown
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            height: 10,
                            borderRadius: 6,
                            overflow: 'hidden',
                            backgroundColor: '#EFE4D4',
                            marginBottom: 8,
                          }}
                        >
                          {(() => {
                            const top = financeSummary.categories.slice(0, 5);
                            const otherTotal = financeSummary.categories
                              .slice(5)
                              .reduce((sum, [, value]) => sum + value, 0);
                            const slices = otherTotal > 0 ? [...top, ['Other', otherTotal] as [string, number]] : top;
                            return slices.map(([label, value], index) => (
                              <View
                                key={label}
                                style={{
                                  flex: value,
                                  backgroundColor: financePalette[index % financePalette.length],
                                }}
                              />
                            ));
                          })()}
                        </View>
                        <View style={{ gap: 6 }}>
                          {(() => {
                            const top = financeSummary.categories.slice(0, 5);
                            const otherTotal = financeSummary.categories
                              .slice(5)
                              .reduce((sum, [, value]) => sum + value, 0);
                            const slices = otherTotal > 0 ? [...top, ['Other', otherTotal] as [string, number]] : top;
                            return slices.map(([label, value], index) => (
                              <View key={`${label}-legend`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: financePalette[index % financePalette.length],
                                  }}
                                />
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                                  {label} • {((value / financeSummary.expenseTotal) * 100).toFixed(0)}%
                                </Text>
                              </View>
                            ));
                          })()}
                        </View>
                      </>
                    )}
                    <Pressable
                      onPress={exportFinanceCsv}
                      style={{
                        marginTop: 8,
                        alignSelf: 'flex-start',
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: '#8B5E3C',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Export CSV</Text>
                    </Pressable>
                  </View>
                )}
                {filteredFinanceLogs.length === 0 ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
                    No finance logs match those filters yet.
                  </Text>
                ) : (
                  filteredFinanceLogs.map((entry) => (
                    <View
                      key={entry.id}
                      style={{
                        borderWidth: 1,
                        borderColor: '#E0D6C7',
                        borderRadius: 10,
                        padding: 10,
                        marginBottom: 8,
                        backgroundColor: '#FFF8EE',
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                          {formatDisplayDate(entry.date)} • {entry.type || 'Entry'}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Pressable
                            onPress={() => {
                              setEditingFinanceId(entry.id);
                              setFinanceType(entry.type);
                              setFinanceCategory(entry.category);
                              setFinanceSubcategory(entry.subcategory ?? '');
                              setFinanceAnimalType(entry.animalType ?? '');
                              setFinanceAmount(entry.amount);
                              setFinanceQuantity(entry.quantity ?? '');
                              setFinanceQuantityUnit(entry.quantityUnit ?? '');
                              setFinanceDate(entry.date);
                              setFinanceVendor(entry.vendor);
                              setFinancePaymentMethod(entry.paymentMethod);
                              setFinanceReceipt(entry.receipt);
                              setFinanceReceiptUri(entry.receiptUri ?? null);
                              setFinanceRecurringFrequency(entry.recurringFrequency ?? '');
                              setFinanceNotes(entry.notes);
                            }}
                          >
                            <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
                          </Pressable>
                          <Pressable
                            onPress={() =>
                              Alert.alert('Delete finance log?', 'This cannot be undone.', [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Delete',
                                  style: 'destructive',
                                  onPress: () =>
                                    setFinanceLogs((prev) => prev.filter((item) => item.id !== entry.id)),
                                },
                              ])
                            }
                          >
                            <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve' }}>Delete</Text>
                          </Pressable>
                        </View>
                      </View>
                      {!!entry.amount && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Amount: ${entry.amount}
                        </Text>
                      )}
                      {!!entry.quantity && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Quantity: {entry.quantity} {entry.quantityUnit || ''}
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, marginBottom: 4 }}>
                        {!!entry.category && (
                          <View
                            style={{
                              paddingVertical: 2,
                              paddingHorizontal: 8,
                              borderRadius: 12,
                              backgroundColor: '#EADBCB',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 11 }}>
                              {entry.category}
                            </Text>
                          </View>
                        )}
                        {!!entry.subcategory && (
                          <View
                            style={{
                              paddingVertical: 2,
                              paddingHorizontal: 8,
                              borderRadius: 12,
                              backgroundColor: '#EFE4D4',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 11 }}>
                              {entry.subcategory}
                            </Text>
                          </View>
                        )}
                        {!!entry.animalType && (
                          <View
                            style={{
                              paddingVertical: 2,
                              paddingHorizontal: 8,
                              borderRadius: 12,
                              backgroundColor: '#D8E6D2',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 11 }}>
                              {entry.animalType}
                            </Text>
                          </View>
                        )}
                        {!!entry.recurringFrequency && (
                          <View
                            style={{
                              paddingVertical: 2,
                              paddingHorizontal: 8,
                              borderRadius: 12,
                              backgroundColor: '#EFE4D4',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 11 }}>
                              {entry.recurringFrequency}
                            </Text>
                          </View>
                        )}
                      </View>
                      {!!entry.category && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Category: {entry.category}
                        </Text>
                      )}
                      {!!entry.subcategory && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Subcategory: {entry.subcategory}
                        </Text>
                      )}
                      {!!entry.animalType && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Animal: {entry.animalType}
                        </Text>
                      )}
                      {!!entry.receiptUri && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Receipt photo attached
                        </Text>
                      )}
                      {!!entry.recurringFrequency && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Recurring: {entry.recurringFrequency}
                        </Text>
                      )}
                      {!!entry.notes && (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          Notes: {entry.notes}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </>
            ) : (
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
                No saved logs yet. Create your first record below.
              </Text>
            )}
            {activeSection == null && (
              <Pressable
                onPress={() => setShowCreateLog((prev) => !prev)}
                style={{
                  backgroundColor: '#8B5E3C',
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
                  {showCreateLog ? 'Hide Log Form' : 'Create Log'}
                </Text>
              </Pressable>
            )}
          </View>

          {activeSection === 'livestock' ? (
            <Modal
              transparent
              animationType="slide"
              visible={showCreateLog}
              onRequestClose={() => setShowCreateLog(false)}
            >
              <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderTopLeftRadius: 18,
                    borderTopRightRadius: 18,
                    padding: 16,
                    maxHeight: '92%',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                      {species === 'Bee' ? 'Beekeeping Record' : 'Livestock Record'}
                    </Text>
                    <Pressable onPress={() => setShowCreateLog(false)}>
                      <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Close</Text>
                    </Pressable>
                  </View>
                  <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                    {species === 'Bee' ? (
                      <>
                        {activeBeeSection !== 'home' && (
                          <Pressable
                            onPress={() => setActiveBeeSection('home')}
                            style={{ marginBottom: 12 }}
                          >
                            <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>
                              Back to Beekeeping
                            </Text>
                          </Pressable>
                        )}

                        {activeBeeSection === 'home' && (
                          <>
                            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
                              Bees are logged by hive. Queens are tracked individually. Workers are tracked as a population.
                            </Text>

                            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                              Hive selection
                            </Text>
                            <Pressable
                              onPress={() => setShowBeeHivePicker((prev) => !prev)}
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 8,
                                padding: 10,
                                backgroundColor: '#FFFDF6',
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                                {getSelectedHive()?.name || 'Select a hive'}
                              </Text>
                            </Pressable>
                            {showBeeHivePicker && (
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                {beeHives.map((hive) => (
                                  <Pressable
                                    key={hive.id}
                                    onPress={() => {
                                      setSelectedBeeHiveId(hive.id);
                                      setShowBeeHivePicker(false);
                                    }}
                                    style={{
                                      paddingVertical: 6,
                                      paddingHorizontal: 10,
                                      borderRadius: 16,
                                      borderWidth: 1,
                                      borderColor: hive.id === selectedBeeHiveId ? '#8B5E3C' : '#D7C9B7',
                                      backgroundColor: hive.id === selectedBeeHiveId ? '#EADBCB' : '#FFFFFF',
                                    }}
                                  >
                                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{hive.name}</Text>
                                  </Pressable>
                                ))}
                              </View>
                            )}
                            <View style={{ gap: 8, marginBottom: 12 }}>
                              <TextInput
                                placeholder="Add new hive name"
                                value={newBeeHiveName}
                                onChangeText={setNewBeeHiveName}
                                placeholderTextColor="#A89C8E"
                                style={{
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
                                onPress={addBeeHive}
                                style={{
                                  backgroundColor: '#8B5E3C',
                                  paddingVertical: 8,
                                  borderRadius: 8,
                                  alignItems: 'center',
                                }}
                              >
                                <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Hive</Text>
                              </Pressable>
                              {selectedBeeHiveId ? (
                                <>
                                  <TextInput
                                    placeholder="Rename selected hive"
                                    value={renameBeeHiveName}
                                    onChangeText={setRenameBeeHiveName}
                                    placeholderTextColor="#A89C8E"
                                    style={{
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
                                    onPress={renameBeeHive}
                                    style={{
                                      backgroundColor: '#C9B8A6',
                                      paddingVertical: 8,
                                      borderRadius: 8,
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Rename Hive</Text>
                                  </Pressable>
                                </>
                              ) : null}
                            </View>

                            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                              Population count
                            </Text>
                            <Pressable
                              onPress={() => setShowBeePopulationPicker((prev) => !prev)}
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 8,
                                padding: 10,
                                backgroundColor: '#FFFDF6',
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                                {beePopulation || 'Select population range'}
                              </Text>
                            </Pressable>
                            {showBeePopulationPicker && (
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                {beePopulationOptions.map((option) => (
                                  <Pressable
                                    key={option}
                                    onPress={() => {
                                      setBeePopulation(option);
                                      updateBeeHive({ population: option });
                                      setShowBeePopulationPicker(false);
                                    }}
                                    style={{
                                      paddingVertical: 6,
                                      paddingHorizontal: 10,
                                      borderRadius: 16,
                                      borderWidth: 1,
                                      borderColor: beePopulation === option ? '#8B5E3C' : '#D7C9B7',
                                      backgroundColor: beePopulation === option ? '#EADBCB' : '#FFFFFF',
                                    }}
                                  >
                                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                  </Pressable>
                                ))}
                              </View>
                            )}

                            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                              Bee records
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                              {[
                                { key: 'queen', label: 'Queen Bee' },
                                { key: 'worker', label: 'Worker Bee' },
                                { key: 'hive', label: 'Hive Records' },
                                { key: 'inspection', label: 'Inspections' },
                                { key: 'health', label: 'Health & Treatment' },
                                { key: 'honey', label: 'Honey Production' },
                                { key: 'management', label: 'Management Actions' },
                                { key: 'seasonal', label: 'Seasonal Notes' },
                              ].map((item) => (
                                <Pressable
                                  key={item.key}
                                  onPress={() => setActiveBeeSection(item.key as typeof activeBeeSection)}
                                  style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 12,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#D7C9B7',
                                    backgroundColor: '#FFF8EE',
                                    flexBasis: '48%',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{item.label}</Text>
                                </Pressable>
                              ))}
                            </View>
                          </>
                        )}

                        {activeBeeSection === 'hive' && (
                          <>
                            <Text style={{ color: '#3A2E24', fontSize: 18, fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                              Hive Records
                            </Text>
                            {!selectedBeeHiveId && (
                              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
                                Select or add a hive first.
                              </Text>
                            )}
                            {selectedBeeHiveId ? (
                              <>
                                <TextInput
                                  placeholder="Hive name"
                                  value={getSelectedHive()?.name ?? ''}
                                  onChangeText={(value) => updateBeeHive({ name: value })}
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
                                  placeholder="Location on property"
                                  value={getSelectedHive()?.location ?? ''}
                                  onChangeText={(value) => updateBeeHive({ location: value })}
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
                                  Hive type
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                                  {beeHiveTypes.map((option) => (
                                    <Pressable
                                      key={option}
                                      onPress={() => updateBeeHive({ hiveType: option })}
                                      style={{
                                        paddingVertical: 6,
                                        paddingHorizontal: 10,
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: getSelectedHive()?.hiveType === option ? '#8B5E3C' : '#D7C9B7',
                                        backgroundColor: getSelectedHive()?.hiveType === option ? '#EADBCB' : '#FFFFFF',
                                      }}
                                    >
                                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                    </Pressable>
                                  ))}
                                </View>
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                                  <TextInput
                                    placeholder="Brood boxes"
                                    value={getSelectedHive()?.boxesBrood ?? ''}
                                    onChangeText={(value) => updateBeeHive({ boxesBrood: value })}
                                    keyboardType="number-pad"
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
                                  <TextInput
                                    placeholder="Honey supers"
                                    value={getSelectedHive()?.boxesHoney ?? ''}
                                    onChangeText={(value) => updateBeeHive({ boxesHoney: value })}
                                    keyboardType="number-pad"
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
                                </View>
                                <TextInput
                                  placeholder="Start date (YYYY-MM-DD)"
                                  value={getSelectedHive()?.startDate ?? ''}
                                  onChangeText={(value) => updateBeeHive({ startDate: value })}
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
                              </>
                            ) : null}
                          </>
                        )}

                        {activeBeeSection === 'queen' && (
                          <>
                            <Text style={{ color: '#3A2E24', fontSize: 18, fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                              Queen Bee Records
                            </Text>
                            {!selectedBeeHiveId && (
                              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
                                Select or add a hive first.
                              </Text>
                            )}
                            <TextInput
                              placeholder="Queen ID / Name"
                              value={beeQueenName}
                              onChangeText={setBeeQueenName}
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
                              Marking color (year-based)
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                              {beeMarkingOptions.map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() => toggleSingle(option, beeQueenMarking, setBeeQueenMarking)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: beeQueenMarking === option ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: beeQueenMarking === option ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                </Pressable>
                              ))}
                            </View>
                            <TextInput
                              placeholder="Breed / strain"
                              value={beeQueenBreed}
                              onChangeText={setBeeQueenBreed}
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
                              Origin
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                              {beeOriginOptions.map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() => toggleSingle(option, beeQueenOrigin, setBeeQueenOrigin)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: beeQueenOrigin === option ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: beeQueenOrigin === option ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                </Pressable>
                              ))}
                            </View>
                            <TextInput
                              placeholder="Date introduced or hatched (YYYY-MM-DD)"
                              value={beeQueenIntroduced}
                              onChangeText={setBeeQueenIntroduced}
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
                              Laying status
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                              {beeLayingOptions.map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() => toggleSingle(option, beeQueenLaying, setBeeQueenLaying)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: beeQueenLaying === option ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: beeQueenLaying === option ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                </Pressable>
                              ))}
                            </View>
                            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                              Temperament
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                              {beeTemperamentOptions.map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() => toggleSingle(option, beeQueenTemperament, setBeeQueenTemperament)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: beeQueenTemperament === option ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: beeQueenTemperament === option ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                </Pressable>
                              ))}
                            </View>
                            <TextInput
                              placeholder="Replacement history"
                              value={beeQueenReplacement}
                              onChangeText={setBeeQueenReplacement}
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
                              placeholder="Notes"
                              value={beeQueenNotes}
                              onChangeText={setBeeQueenNotes}
                              placeholderTextColor="#A89C8E"
                              multiline
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 8,
                                padding: 10,
                                minHeight: 80,
                                marginBottom: 10,
                                color: '#3A2E24',
                                fontFamily: 'SedgwickAve',
                                backgroundColor: '#FFFDF6',
                              }}
                            />
                            <Pressable
                              onPress={addBeeQueenLog}
                              style={{
                                backgroundColor: '#8B5E3C',
                                paddingVertical: 8,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginBottom: 12,
                              }}
                            >
                              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save Queen Record</Text>
                            </Pressable>
                            {beeQueenLogs.filter((log) => log.hiveId === selectedBeeHiveId).length === 0 ? (
                              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                                No queen records yet for this hive.
                              </Text>
                            ) : (
                              beeQueenLogs
                                .filter((log) => log.hiveId === selectedBeeHiveId)
                                .map((log) => (
                                  <View
                                    key={log.id}
                                    style={{
                                      borderWidth: 1,
                                      borderColor: '#E0D6C7',
                                      borderRadius: 10,
                                      padding: 10,
                                      marginBottom: 8,
                                      backgroundColor: '#FFF8EE',
                                    }}
                                  >
                                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                                      {log.queenName || 'Queen'} • {log.layingStatus || 'Status unknown'}
                                    </Text>
                                    <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                                      {log.introducedDate || 'Date not set'} • {log.origin || 'Origin'}
                                    </Text>
                                  </View>
                                ))
                            )}
                          </>
                        )}

                        {activeBeeSection === 'worker' && (
                          <>
                            <Text style={{ color: '#3A2E24', fontSize: 18, fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                              Worker Bee Records
                            </Text>
                            {!selectedBeeHiveId && (
                              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
                                Select or add a hive first.
                              </Text>
                            )}
                            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                              Population strength
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                              {beePopulationOptions.map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() => toggleSingle(option, beeWorkerStrength, setBeeWorkerStrength)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: beeWorkerStrength === option ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: beeWorkerStrength === option ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                </Pressable>
                              ))}
                            </View>
                            <TextInput
                              placeholder="Worker behavior (foraging activity)"
                              value={beeWorkerBehavior}
                              onChangeText={setBeeWorkerBehavior}
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
                              placeholder="Aggression level"
                              value={beeWorkerAggression}
                              onChangeText={setBeeWorkerAggression}
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
                              placeholder="Drone presence"
                              value={beeWorkerDronePresence}
                              onChangeText={setBeeWorkerDronePresence}
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
                              placeholder="Brood quantity"
                              value={beeWorkerBrood}
                              onChangeText={setBeeWorkerBrood}
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
                              placeholder="Notes"
                              value={beeWorkerNotes}
                              onChangeText={setBeeWorkerNotes}
                              placeholderTextColor="#A89C8E"
                              multiline
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 8,
                                padding: 10,
                                minHeight: 80,
                                marginBottom: 10,
                                color: '#3A2E24',
                                fontFamily: 'SedgwickAve',
                                backgroundColor: '#FFFDF6',
                              }}
                            />
                            <Pressable
                              onPress={addBeeWorkerLog}
                              style={{
                                backgroundColor: '#8B5E3C',
                                paddingVertical: 8,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginBottom: 12,
                              }}
                            >
                              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>
                                Save Worker Record
                              </Text>
                            </Pressable>
                            {beeWorkerLogs.filter((log) => log.hiveId === selectedBeeHiveId).length === 0 ? (
                              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                                No worker records yet for this hive.
                              </Text>
                            ) : (
                              beeWorkerLogs
                                .filter((log) => log.hiveId === selectedBeeHiveId)
                                .map((log) => (
                                  <View
                                    key={log.id}
                                    style={{
                                      borderWidth: 1,
                                      borderColor: '#E0D6C7',
                                      borderRadius: 10,
                                      padding: 10,
                                      marginBottom: 8,
                                      backgroundColor: '#FFF8EE',
                                    }}
                                  >
                                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                                      {log.populationStrength || 'Population'} • {log.behavior || 'Behavior noted'}
                                    </Text>
                                  </View>
                                ))
                            )}
                          </>
                        )}

                        {activeBeeSection === 'inspection' && (
                          <>
                            <Text style={{ color: '#3A2E24', fontSize: 18, fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                              Inspection Records
                            </Text>
                            <TextInput
                              placeholder="Inspection date (YYYY-MM-DD)"
                              value={beeInspectionDate}
                              onChangeText={setBeeInspectionDate}
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
                              Quick inspection
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                              {beeInspectionOptions.map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() => toggleMulti(option, setBeeInspectionChecks)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: beeInspectionChecks.includes(option)
                                      ? '#8B5E3C'
                                      : '#D7C9B7',
                                    backgroundColor: beeInspectionChecks.includes(option)
                                      ? '#EADBCB'
                                      : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                </Pressable>
                              ))}
                            </View>
                            <TextInput
                              placeholder="Notes"
                              value={beeInspectionNotes}
                              onChangeText={setBeeInspectionNotes}
                              placeholderTextColor="#A89C8E"
                              multiline
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 8,
                                padding: 10,
                                minHeight: 80,
                                marginBottom: 10,
                                color: '#3A2E24',
                                fontFamily: 'SedgwickAve',
                                backgroundColor: '#FFFDF6',
                              }}
                            />
                            <Pressable
                              onPress={addBeeInspectionLog}
                              style={{
                                backgroundColor: '#8B5E3C',
                                paddingVertical: 8,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginBottom: 12,
                              }}
                            >
                              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>
                                Save Inspection
                              </Text>
                            </Pressable>
                          </>
                        )}

                        {activeBeeSection === 'health' && (
                          <>
                            <Text style={{ color: '#3A2E24', fontSize: 18, fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                              Health & Treatment
                            </Text>
                            <TextInput
                              placeholder="Record date (YYYY-MM-DD)"
                              value={beeHealthDate}
                              onChangeText={setBeeHealthDate}
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
                              placeholder="Varroa mite count"
                              value={beeHealthVarroa}
                              onChangeText={setBeeHealthVarroa}
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
                              placeholder="Treatment type"
                              value={beeHealthTreatment}
                              onChangeText={setBeeHealthTreatment}
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
                              placeholder="Treatment date (YYYY-MM-DD)"
                              value={beeHealthTreatmentDate}
                              onChangeText={setBeeHealthTreatmentDate}
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
                              placeholder="Results / follow-up"
                              value={beeHealthResults}
                              onChangeText={setBeeHealthResults}
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
                              placeholder="Disease symptoms observed"
                              value={beeHealthSymptoms}
                              onChangeText={setBeeHealthSymptoms}
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
                            <Pressable
                              onPress={addBeeHealthLog}
                              style={{
                                backgroundColor: '#8B5E3C',
                                paddingVertical: 8,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginBottom: 12,
                              }}
                            >
                              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save Health Log</Text>
                            </Pressable>
                          </>
                        )}

                        {activeBeeSection === 'honey' && (
                          <>
                            <Text style={{ color: '#3A2E24', fontSize: 18, fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                              Honey Production
                            </Text>
                            <TextInput
                              placeholder="Harvest date (YYYY-MM-DD)"
                              value={beeHoneyDate}
                              onChangeText={setBeeHoneyDate}
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
                              placeholder="Date supers added"
                              value={beeHoneySupersAdded}
                              onChangeText={setBeeHoneySupersAdded}
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
                              placeholder="Date supers removed"
                              value={beeHoneySupersRemoved}
                              onChangeText={setBeeHoneySupersRemoved}
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
                              placeholder="Frames harvested"
                              value={beeHoneyFrames}
                              onChangeText={setBeeHoneyFrames}
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
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                              <TextInput
                                placeholder="Amount harvested"
                                value={beeHoneyAmount}
                                onChangeText={setBeeHoneyAmount}
                                keyboardType="numeric"
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
                              <TextInput
                                placeholder="Unit (lbs/jars)"
                                value={beeHoneyUnit}
                                onChangeText={setBeeHoneyUnit}
                                placeholderTextColor="#A89C8E"
                                style={{
                                  width: 120,
                                  borderWidth: 1,
                                  borderColor: '#D7C9B7',
                                  borderRadius: 8,
                                  padding: 10,
                                  color: '#3A2E24',
                                  fontFamily: 'SedgwickAve',
                                }}
                              />
                            </View>
                            <TextInput
                              placeholder="Honey type"
                              value={beeHoneyType}
                              onChangeText={setBeeHoneyType}
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
                              placeholder="Honey left for bees"
                              value={beeHoneyLeft}
                              onChangeText={setBeeHoneyLeft}
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
                              placeholder="Notes"
                              value={beeHoneyNotes}
                              onChangeText={setBeeHoneyNotes}
                              placeholderTextColor="#A89C8E"
                              multiline
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 8,
                                padding: 10,
                                minHeight: 80,
                                marginBottom: 10,
                                color: '#3A2E24',
                                fontFamily: 'SedgwickAve',
                                backgroundColor: '#FFFDF6',
                              }}
                            />
                            <Pressable
                              onPress={addBeeHoneyLog}
                              style={{
                                backgroundColor: '#8B5E3C',
                                paddingVertical: 8,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginBottom: 12,
                              }}
                            >
                              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save Honey Log</Text>
                            </Pressable>
                          </>
                        )}

                        {activeBeeSection === 'management' && (
                          <>
                            <Text style={{ color: '#3A2E24', fontSize: 18, fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                              Management Actions
                            </Text>
                            <TextInput
                              placeholder="Action date (YYYY-MM-DD)"
                              value={beeManagementDate}
                              onChangeText={setBeeManagementDate}
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
                              Actions
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                              {beeManagementOptions.map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() => toggleMulti(option, setBeeManagementActions)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: beeManagementActions.includes(option)
                                      ? '#8B5E3C'
                                      : '#D7C9B7',
                                    backgroundColor: beeManagementActions.includes(option)
                                      ? '#EADBCB'
                                      : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                </Pressable>
                              ))}
                            </View>
                            <TextInput
                              placeholder="Syrup type"
                              value={beeManagementSyrupType}
                              onChangeText={setBeeManagementSyrupType}
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
                              placeholder="Syrup amount"
                              value={beeManagementSyrupAmount}
                              onChangeText={setBeeManagementSyrupAmount}
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
                              placeholder="Notes"
                              value={beeManagementNotes}
                              onChangeText={setBeeManagementNotes}
                              placeholderTextColor="#A89C8E"
                              multiline
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 8,
                                padding: 10,
                                minHeight: 80,
                                marginBottom: 10,
                                color: '#3A2E24',
                                fontFamily: 'SedgwickAve',
                                backgroundColor: '#FFFDF6',
                              }}
                            />
                            <Pressable
                              onPress={addBeeManagementLog}
                              style={{
                                backgroundColor: '#8B5E3C',
                                paddingVertical: 8,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginBottom: 12,
                              }}
                            >
                              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>
                                Save Management Log
                              </Text>
                            </Pressable>
                          </>
                        )}

                        {activeBeeSection === 'seasonal' && (
                          <>
                            <Text style={{ color: '#3A2E24', fontSize: 18, fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                              Seasonal & Overwintering Notes
                            </Text>
                            <TextInput
                              placeholder="Season date (YYYY-MM-DD)"
                              value={beeSeasonalDate}
                              onChangeText={setBeeSeasonalDate}
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
                              Winter prep actions
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                              {beeSeasonalOptions.map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() => toggleMulti(option, setBeeSeasonalActions)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: beeSeasonalActions.includes(option)
                                      ? '#8B5E3C'
                                      : '#D7C9B7',
                                    backgroundColor: beeSeasonalActions.includes(option)
                                      ? '#EADBCB'
                                      : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                </Pressable>
                              ))}
                            </View>
                            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                              Insulation added?
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                              {['Yes', 'No'].map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() => toggleSingle(option, beeSeasonalInsulation, setBeeSeasonalInsulation)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: beeSeasonalInsulation === option ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: beeSeasonalInsulation === option ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                </Pressable>
                              ))}
                            </View>
                            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                              Entrance reducers?
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                              {['Yes', 'No'].map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() => toggleSingle(option, beeSeasonalReducers, setBeeSeasonalReducers)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: beeSeasonalReducers === option ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: beeSeasonalReducers === option ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                </Pressable>
                              ))}
                            </View>
                            <TextInput
                              placeholder="Fall honey stores estimate"
                              value={beeSeasonalStores}
                              onChangeText={setBeeSeasonalStores}
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
                              Spring survival status
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                              {['Alive', 'Weak', 'Lost'].map((option) => (
                                <Pressable
                                  key={option}
                                  onPress={() =>
                                    toggleSingle(option, beeSeasonalSpringStatus, setBeeSeasonalSpringStatus)
                                  }
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: beeSeasonalSpringStatus === option ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: beeSeasonalSpringStatus === option ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                </Pressable>
                              ))}
                            </View>
                            <TextInput
                              placeholder="Notes"
                              value={beeSeasonalNotes}
                              onChangeText={setBeeSeasonalNotes}
                              placeholderTextColor="#A89C8E"
                              multiline
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 8,
                                padding: 10,
                                minHeight: 80,
                                marginBottom: 10,
                                color: '#3A2E24',
                                fontFamily: 'SedgwickAve',
                                backgroundColor: '#FFFDF6',
                              }}
                            />
                            <Pressable
                              onPress={addBeeSeasonalLog}
                              style={{
                                backgroundColor: '#8B5E3C',
                                paddingVertical: 8,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginBottom: 12,
                              }}
                            >
                              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>
                                Save Seasonal Notes
                              </Text>
                            </Pressable>
                          </>
                        )}
                      </>
                    ) : (
                      <View>
                        {logSettings.livestock.basicInfo && (
          <>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Species</Text>
            {selectedLivestockSpecies ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 8,
                  padding: 10,
                  backgroundColor: '#FFF8EE',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{selectedLivestockSpecies}</Text>
              </View>
            ) : (
              <>
                <Pressable
                  onPress={() => setShowSpeciesPicker((prev) => !prev)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: '#FFFFFF',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                    {species || 'Select species'}
                  </Text>
                </Pressable>
                {showSpeciesPicker && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {visibleAnimals.map((animal) => {
                      const selected = species === animal;
                      return (
                        <Pressable
                          key={animal}
                          onPress={() => {
                            toggleSingle(animal, species, setSpecies);
                            setBreed('');
                            setBreedSelections([]);
                            setBreedOther('');
                            setAnimalPhotoUri(null);
                            setShowSpeciesPicker(false);
                          }}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{animal}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </>
            )}

            {species === 'Chicken' && (
              <>
                <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                  Chicken log type
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                  {(['Individual', 'Group'] as const).map((option) => {
                    const selected = chickenLogType === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => {
                          setChickenLogType(option);
                          setChickenGroupGenders([]);
                          setChickenHenCount('');
                          setChickenRoosterCount('');
                          setGender('');
                          setBreed('');
                          setBreedSelections([]);
                          setBreedOther('');
                          if (option === 'Group') {
                            setBirthdate(null);
                            setDeformities('');
                            setDeformityLogs([]);
                            setShowQuality('');
                            setPedigree('');
                            setRegistration('');
                            setWeightLogs([]);
                            setHeightLogs([]);
                            setVaccineLogs([]);
                            setWormingLogs([]);
                            setHoofLogs([]);
                            setVetApptLogs([]);
                            setWoundLogs([]);
                            setUdderCondition('');
                            setMilkLogs([]);
                          }
                        }}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                          backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                        }}
                      >
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                  Coop
                </Text>
                <Pressable
                  onPress={() => setShowChickenCoopPicker((prev) => !prev)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: '#FFFFFF',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: chickenCoopName ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                    {chickenCoopName || 'Select coop'}
                  </Text>
                </Pressable>
                {showChickenCoopPicker && (
                  <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                    {chickenCoopOptions.length === 0 ? (
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                        No coops yet. Add your first coop below.
                      </Text>
                    ) : (
                      chickenCoopOptions.map((option, index) => (
                        <View key={option} style={{ marginBottom: 8 }}>
                          {editingChickenCoopIndex === index ? (
                            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                              <TextInput
                                value={chickenCoopEditValue}
                                onChangeText={setChickenCoopEditValue}
                                placeholder="Coop name"
                                placeholderTextColor="#A89C8E"
                                style={{
                                  flex: 1,
                                  borderWidth: 1,
                                  borderColor: '#D7C9B7',
                                  borderRadius: 8,
                                  padding: 8,
                                  color: '#3A2E24',
                                  fontFamily: 'SedgwickAve',
                                }}
                              />
                              <Pressable
                                onPress={() => {
                                  const trimmed = chickenCoopEditValue.trim();
                                  if (!trimmed) {
                                    setEditingChickenCoopIndex(null);
                                    setChickenCoopEditValue('');
                                    return;
                                  }
                                  setChickenCoopOptions((prev) =>
                                    prev.map((item, i) => (i === index ? trimmed : item))
                                  );
                                  if (chickenCoopName === option) {
                                    setChickenCoopName(trimmed);
                                  }
                                  setEditingChickenCoopIndex(null);
                                  setChickenCoopEditValue('');
                                }}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 8,
                                  backgroundColor: '#8B5E3C',
                                }}
                              >
                                <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setEditingChickenCoopIndex(null);
                                  setChickenCoopEditValue('');
                                }}
                              >
                                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Cancel</Text>
                              </Pressable>
                            </View>
                          ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Pressable
                                onPress={() => {
                                  setChickenCoopName(option);
                                  setShowChickenCoopPicker(false);
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setEditingChickenCoopIndex(index);
                                  setChickenCoopEditValue(option);
                                }}
                              >
                                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      ))
                    )}
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <TextInput
                        value={newChickenCoopName}
                        onChangeText={setNewChickenCoopName}
                        placeholder="Add new coop"
                        placeholderTextColor="#A89C8E"
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 8,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      <Pressable
                        onPress={() => {
                          const trimmed = newChickenCoopName.trim();
                          if (!trimmed) {
                            return;
                          }
                          setChickenCoopOptions((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
                          setChickenCoopName(trimmed);
                          setNewChickenCoopName('');
                          setShowChickenCoopPicker(false);
                        }}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: '#8B5E3C',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </>
            )}

            {species === 'Goat' ? (
              <>
                <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Pasture</Text>
                <Pressable
                  onPress={() => setShowPasturePicker((prev) => !prev)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: '#FFFFFF',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: pastureName ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                    {pastureName || 'Select pasture'}
                  </Text>
                </Pressable>
                {showPasturePicker && (
                  <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                    {pastureOptions.length === 0 ? (
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                        No pastures yet. Add your first pasture below.
                      </Text>
                    ) : (
                      pastureOptions.map((option, index) => (
                        <View key={option} style={{ marginBottom: 8 }}>
                          {editingPastureIndex === index ? (
                            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                              <TextInput
                                value={pastureEditValue}
                                onChangeText={setPastureEditValue}
                                placeholder="Pasture name"
                                placeholderTextColor="#A89C8E"
                                style={{
                                  flex: 1,
                                  borderWidth: 1,
                                  borderColor: '#D7C9B7',
                                  borderRadius: 8,
                                  padding: 8,
                                  color: '#3A2E24',
                                  fontFamily: 'SedgwickAve',
                                }}
                              />
                              <Pressable
                                onPress={() => {
                                  const trimmed = pastureEditValue.trim();
                                  if (!trimmed) {
                                    setEditingPastureIndex(null);
                                    setPastureEditValue('');
                                    return;
                                  }
                                  setPastureOptions((prev) =>
                                    prev.map((item, i) => (i === index ? trimmed : item))
                                  );
                                  if (pastureName === option) {
                                    setPastureName(trimmed);
                                  }
                                  setEditingPastureIndex(null);
                                  setPastureEditValue('');
                                }}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 8,
                                  backgroundColor: '#8B5E3C',
                                }}
                              >
                                <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setEditingPastureIndex(null);
                                  setPastureEditValue('');
                                }}
                              >
                                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Cancel</Text>
                              </Pressable>
                            </View>
                          ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Pressable
                                onPress={() => {
                                  setPastureName(option);
                                  setShowPasturePicker(false);
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setEditingPastureIndex(index);
                                  setPastureEditValue(option);
                                }}
                              >
                                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      ))
                    )}
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <TextInput
                        value={newPastureName}
                        onChangeText={setNewPastureName}
                        placeholder="Add new pasture"
                        placeholderTextColor="#A89C8E"
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 8,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      <Pressable
                        onPress={() => {
                          const trimmed = newPastureName.trim();
                          if (!trimmed) {
                            return;
                          }
                          setPastureOptions((prev) =>
                            prev.includes(trimmed) ? prev : [...prev, trimmed]
                          );
                          setPastureName(trimmed);
                          setNewPastureName('');
                          setShowPasturePicker(false);
                        }}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: '#8B5E3C',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
                <TextInput
                  placeholder="Goat name"
                  value={animalName}
                  onChangeText={setAnimalName}
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
              </>
            ) : species === 'Rabbit' ? (
              <>
                <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Housing</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  {(['Cage', 'Pen'] as const).map((option) => {
                    const selected = rabbitHousingType === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setRabbitHousingType(option)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                          backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                        }}
                      >
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  onPress={() => setShowRabbitHousingPicker((prev) => !prev)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: '#FFFFFF',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: rabbitHousingName ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                    {rabbitHousingName || (rabbitHousingType === 'Pen' ? 'Select pen' : 'Select cage')}
                  </Text>
                </Pressable>
                {showRabbitHousingPicker && (
                  <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                    {rabbitHousingOptions.filter((option) => option.startsWith(`${rabbitHousingType}:`)).length === 0 ? (
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                        No {rabbitHousingType.toLowerCase()}s yet. Add your first one below.
                      </Text>
                    ) : (
                      rabbitHousingOptions
                        .map((option, index) => ({ option, index }))
                        .filter(({ option }) => option.startsWith(`${rabbitHousingType}:`))
                        .map(({ option, index }) => {
                          const label = option.split(':').slice(1).join(':').trim();
                          return (
                            <View key={option} style={{ marginBottom: 8 }}>
                              {editingRabbitHousingIndex === index ? (
                                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                  <TextInput
                                    value={rabbitHousingEditValue}
                                    onChangeText={setRabbitHousingEditValue}
                                    placeholder={`${rabbitHousingType} name`}
                                    placeholderTextColor="#A89C8E"
                                    style={{
                                      flex: 1,
                                      borderWidth: 1,
                                      borderColor: '#D7C9B7',
                                      borderRadius: 8,
                                      padding: 8,
                                      color: '#3A2E24',
                                      fontFamily: 'SedgwickAve',
                                    }}
                                  />
                                  <Pressable
                                    onPress={() => {
                                      const trimmed = rabbitHousingEditValue.trim();
                                      if (!trimmed) {
                                        setEditingRabbitHousingIndex(null);
                                        setRabbitHousingEditValue('');
                                        return;
                                      }
                                      const updated = `${rabbitHousingType}: ${trimmed}`;
                                      setRabbitHousingOptions((prev) =>
                                        prev.map((item, i) => (i === index ? updated : item))
                                      );
                                      if (rabbitHousingName === label) {
                                        setRabbitHousingName(trimmed);
                                      }
                                      setEditingRabbitHousingIndex(null);
                                      setRabbitHousingEditValue('');
                                    }}
                                    style={{
                                      paddingVertical: 6,
                                      paddingHorizontal: 10,
                                      borderRadius: 8,
                                      backgroundColor: '#8B5E3C',
                                    }}
                                  >
                                    <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save</Text>
                                  </Pressable>
                                  <Pressable
                                    onPress={() => {
                                      setEditingRabbitHousingIndex(null);
                                      setRabbitHousingEditValue('');
                                    }}
                                  >
                                    <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Cancel</Text>
                                  </Pressable>
                                </View>
                              ) : (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Pressable
                                    onPress={() => {
                                      setRabbitHousingName(label);
                                      setShowRabbitHousingPicker(false);
                                    }}
                                  >
                                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{label}</Text>
                                  </Pressable>
                                  <Pressable
                                    onPress={() => {
                                      setEditingRabbitHousingIndex(index);
                                      setRabbitHousingEditValue(label);
                                    }}
                                  >
                                    <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
                                  </Pressable>
                                </View>
                              )}
                            </View>
                          );
                        })
                    )}
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <TextInput
                        value={newRabbitHousingName}
                        onChangeText={setNewRabbitHousingName}
                        placeholder={`Add new ${rabbitHousingType.toLowerCase()}`}
                        placeholderTextColor="#A89C8E"
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 8,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      <Pressable
                        onPress={() => {
                          const trimmed = newRabbitHousingName.trim();
                          if (!trimmed) {
                            return;
                          }
                          const updated = `${rabbitHousingType}: ${trimmed}`;
                          setRabbitHousingOptions((prev) => (prev.includes(updated) ? prev : [...prev, updated]));
                          setRabbitHousingName(trimmed);
                          setNewRabbitHousingName('');
                          setShowRabbitHousingPicker(false);
                        }}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: '#8B5E3C',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
                <TextInput
                  placeholder="Rabbit name"
                  value={animalName}
                  onChangeText={setAnimalName}
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
              </>
            ) : species === 'Pig' ? (
              <>
                <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Pen</Text>
                <Pressable
                  onPress={() => setShowPigPenPicker((prev) => !prev)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: '#FFFFFF',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: pigPenName ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                    {pigPenName || 'Select pen'}
                  </Text>
                </Pressable>
                {showPigPenPicker && (
                  <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                    {pigPenOptions.length === 0 ? (
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                        No pens yet. Add your first pen below.
                      </Text>
                    ) : (
                      pigPenOptions.map((option, index) => (
                        <View key={option} style={{ marginBottom: 8 }}>
                          {editingPigPenIndex === index ? (
                            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                              <TextInput
                                value={pigPenEditValue}
                                onChangeText={setPigPenEditValue}
                                placeholder="Pen name"
                                placeholderTextColor="#A89C8E"
                                style={{
                                  flex: 1,
                                  borderWidth: 1,
                                  borderColor: '#D7C9B7',
                                  borderRadius: 8,
                                  padding: 8,
                                  color: '#3A2E24',
                                  fontFamily: 'SedgwickAve',
                                }}
                              />
                              <Pressable
                                onPress={() => {
                                  const trimmed = pigPenEditValue.trim();
                                  if (!trimmed) {
                                    setEditingPigPenIndex(null);
                                    setPigPenEditValue('');
                                    return;
                                  }
                                  setPigPenOptions((prev) =>
                                    prev.map((item, i) => (i === index ? trimmed : item))
                                  );
                                  if (pigPenName === option) {
                                    setPigPenName(trimmed);
                                  }
                                  setEditingPigPenIndex(null);
                                  setPigPenEditValue('');
                                }}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 8,
                                  backgroundColor: '#8B5E3C',
                                }}
                              >
                                <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setEditingPigPenIndex(null);
                                  setPigPenEditValue('');
                                }}
                              >
                                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Cancel</Text>
                              </Pressable>
                            </View>
                          ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Pressable
                                onPress={() => {
                                  setPigPenName(option);
                                  setShowPigPenPicker(false);
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setEditingPigPenIndex(index);
                                  setPigPenEditValue(option);
                                }}
                              >
                                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      ))
                    )}
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <TextInput
                        value={newPigPenName}
                        onChangeText={setNewPigPenName}
                        placeholder="Add new pen"
                        placeholderTextColor="#A89C8E"
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 8,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      <Pressable
                        onPress={() => {
                          const trimmed = newPigPenName.trim();
                          if (!trimmed) {
                            return;
                          }
                          setPigPenOptions((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
                          setPigPenName(trimmed);
                          setNewPigPenName('');
                          setShowPigPenPicker(false);
                        }}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: '#8B5E3C',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
                <TextInput
                  placeholder="Pig name"
                  value={animalName}
                  onChangeText={setAnimalName}
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
              </>
            ) : species === 'Horse' ? (
              <>
                <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Pasture</Text>
                <Pressable
                  onPress={() => setShowHorsePasturePicker((prev) => !prev)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: '#FFFFFF',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: horsePastureName ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                    {horsePastureName || 'Select pasture'}
                  </Text>
                </Pressable>
                {showHorsePasturePicker && (
                  <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 10, padding: 10, marginBottom: 10 }}>
                    {horsePastureOptions.length === 0 ? (
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                        No pastures yet. Add your first pasture below.
                      </Text>
                    ) : (
                      horsePastureOptions.map((option, index) => (
                        <View key={option} style={{ marginBottom: 8 }}>
                          {editingHorsePastureIndex === index ? (
                            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                              <TextInput
                                value={horsePastureEditValue}
                                onChangeText={setHorsePastureEditValue}
                                placeholder="Pasture name"
                                placeholderTextColor="#A89C8E"
                                style={{
                                  flex: 1,
                                  borderWidth: 1,
                                  borderColor: '#D7C9B7',
                                  borderRadius: 8,
                                  padding: 8,
                                  color: '#3A2E24',
                                  fontFamily: 'SedgwickAve',
                                }}
                              />
                              <Pressable
                                onPress={() => {
                                  const trimmed = horsePastureEditValue.trim();
                                  if (!trimmed) {
                                    setEditingHorsePastureIndex(null);
                                    setHorsePastureEditValue('');
                                    return;
                                  }
                                  setHorsePastureOptions((prev) =>
                                    prev.map((item, i) => (i === index ? trimmed : item))
                                  );
                                  if (horsePastureName === option) {
                                    setHorsePastureName(trimmed);
                                  }
                                  setEditingHorsePastureIndex(null);
                                  setHorsePastureEditValue('');
                                }}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 8,
                                  backgroundColor: '#8B5E3C',
                                }}
                              >
                                <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setEditingHorsePastureIndex(null);
                                  setHorsePastureEditValue('');
                                }}
                              >
                                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Cancel</Text>
                              </Pressable>
                            </View>
                          ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Pressable
                                onPress={() => {
                                  setHorsePastureName(option);
                                  setShowHorsePasturePicker(false);
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setEditingHorsePastureIndex(index);
                                  setHorsePastureEditValue(option);
                                }}
                              >
                                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      ))
                    )}
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <TextInput
                        value={newHorsePastureName}
                        onChangeText={setNewHorsePastureName}
                        placeholder="Add new pasture"
                        placeholderTextColor="#A89C8E"
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 8,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      <Pressable
                        onPress={() => {
                          const trimmed = newHorsePastureName.trim();
                          if (!trimmed) {
                            return;
                          }
                          setHorsePastureOptions((prev) =>
                            prev.includes(trimmed) ? prev : [...prev, trimmed]
                          );
                          setHorsePastureName(trimmed);
                          setNewHorsePastureName('');
                          setShowHorsePasturePicker(false);
                        }}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: '#8B5E3C',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
                <TextInput
                  placeholder="Horse name"
                  value={animalName}
                  onChangeText={setAnimalName}
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
              </>
            ) : (
              <TextInput
                placeholder={
                  species === 'Bee'
                    ? 'Hive name'
                    : species === 'Chicken'
                      ? chickenLogType === 'Group'
                        ? 'Coop name'
                        : 'Chicken Name'
                      : species === 'Turkey'
                        ? 'Turkey Name or Coop Name'
                        : species === 'Quail'
                          ? 'Quail Name or Coop Name'
                          : species === 'Rabbit'
                            ? 'Rabbit name'
                            : species === 'Sheep'
                              ? 'Sheep Name or Pasture Name'
                              : species === 'Cow'
                                ? 'Cow Name or Pasture Name'
                                : species === 'Pig'
                                  ? 'Pig Name or Pen Name'
                                  : species === 'Horse'
                                    ? 'Horse Name or Pasture Name'
                                    : 'Animal name'
                }
                value={animalName}
                onChangeText={setAnimalName}
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

            {species === 'Chicken' && chickenLogType === 'Group' ? (
              <>
                <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                  Genders in this coop
                </Text>
                <View style={{ gap: 8, marginBottom: 12 }}>
                  {['Hen', 'Rooster'].map((option) => {
                    const selected = chickenGroupGenders.includes(option);
                    return (
                      <View key={option} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Pressable
                          onPress={() => toggleChickenGroupGender(option)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                        </Pressable>
                        {selected && (
                          <TextInput
                            placeholder="#"
                            value={option === 'Hen' ? chickenHenCount : chickenRoosterCount}
                            onChangeText={option === 'Hen' ? setChickenHenCount : setChickenRoosterCount}
                            keyboardType="number-pad"
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              width: 72,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              </>
            ) : null}

            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Breed</Text>
            <Pressable
              onPress={() => setShowBreedPicker((prev) => !prev)}
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                backgroundColor: '#FFFFFF',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                {isChickenGroup
                  ? breedSelections.length
                    ? breedSelections.join(', ')
                    : 'Select breed(s)'
                  : breed || 'Select breed'}
              </Text>
            </Pressable>
            {showBreedPicker && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {breedOptions.map((option) => {
                  const selected = isChickenGroup ? breedSelections.includes(option) : breed === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        if (isChickenGroup) {
                          toggleMulti(option, setBreedSelections);
                        } else {
                          toggleSingle(option, breed, setBreed);
                          setShowBreedPicker(false);
                        }
                      }}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                        backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            {(breed === 'Other' || (isChickenGroup && breedSelections.includes('Other'))) && (
              <TextInput
                placeholder="Enter breed"
                placeholderTextColor="#A08974"
                value={breedOther}
                onChangeText={setBreedOther}
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 12,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                  backgroundColor: '#FFFDF6',
                }}
              />
            )}

            {!(species === 'Chicken' && chickenLogType === 'Group') && (
              <>
                <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Gender</Text>
                <Pressable
                  onPress={() => setShowGenderPicker((prev) => !prev)}
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    backgroundColor: '#FFFFFF',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                    {gender || 'Select gender'}
                  </Text>
                </Pressable>
                {showGenderPicker && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {genderOptions.map((option) => {
                      const selected = gender === option;
                      return (
                        <Pressable
                          key={option}
                          onPress={() => {
                            toggleSingle(option, gender, setGender);
                            setShowGenderPicker(false);
                          }}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </>
            )}

            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Purpose</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {(purposeOptionsBySpecies[species] ?? []).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => toggleMulti(option, setPurpose)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: purpose.includes(option) ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: purpose.includes(option) ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                </Pressable>
              ))}
            </View>

            {animalPhotoUri ? (
              <Image
                source={{ uri: animalPhotoUri }}
                style={{ width: '100%', height: 180, borderRadius: 12, marginBottom: 10 }}
                resizeMode="cover"
              />
            ) : null}

            <Pressable
              onPress={pickAnimalPhoto}
              style={{
                backgroundColor: '#C9B8A6',
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                {animalPhotoUri ? 'Change Animal Photo' : 'Add Animal Photo'}
              </Text>
            </Pressable>
          </>
        )}

        {logSettings.livestock.birthdate && !isChickenGroup && (
          <>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Birthdate</Text>
            <Pressable
              onPress={() => setShowBirthCalendar((prev) => !prev)}
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: birthdate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                {birthdate ?? 'Select date'}
              </Text>
            </Pressable>

            {showBirthCalendar && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginBottom: 12,
                }}
              >
                <CalendarWithYear
                  onDayPress={(day) => {
                    setBirthdate(day.dateString);
                    setShowBirthCalendar(false);
                  }}
                  markedDates={
                    birthdate
                      ? {
                          [birthdate]: {
                            selected: true,
                            selectedColor: '#4C7744',
                            selectedTextColor: '#FFFFFF',
                          },
                        }
                      : undefined
                  }
                  theme={calendarTheme}
                />
              </View>
            )}
          </>
        )}

        {supportsMetrics && logSettings.livestock.metrics && !isChickenGroup && (
          <>
            <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              Body Metrics
            </Text>

            <TextInput
              placeholder="Weight"
              value={weightValue}
              onChangeText={setWeightValue}
              placeholderTextColor="#A89C8E"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {weightUnits.map((unit) => {
              const selected = weightUnit === unit;
              return (
                <Pressable
                  key={unit}
                  onPress={() => toggleSingle(unit as 'lb' | 'kg' | 'oz', weightUnit, setWeightUnit)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                      borderWidth: 1,
                      borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                      backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{unit}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={() => setShowWeightCalendar((prev) => !prev)}
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: weightDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                {weightDate || 'Weight date'}
              </Text>
            </Pressable>
            {showWeightCalendar && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginBottom: 8,
                }}
              >
                <CalendarWithYear
                  onDayPress={(day) => {
                    setWeightDate(day.dateString);
                    setShowWeightCalendar(false);
                  }}
                  markedDates={
                    weightDate
                      ? {
                          [weightDate]: {
                            selected: true,
                            selectedColor: '#4C7744',
                            selectedTextColor: '#FFFFFF',
                          },
                        }
                      : undefined
                  }
                  theme={calendarTheme}
                />
              </View>
            )}
            <Pressable
              onPress={() =>
                addMetric(weightValue, weightUnit || 'lb', weightDate, setWeightLogs, () => {
                  setWeightValue('');
                  setWeightDate('');
                })
              }
              style={{
                backgroundColor: '#8B5E3C',
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Weight Entry</Text>
            </Pressable>

            {weightLogs.map((entry) => (
              <Text key={entry.id} style={{ color: '#6E5B4B', marginBottom: 4, fontFamily: 'SedgwickAve' }}>
                {formatDisplayDate(entry.date)}: {entry.value}
              </Text>
            ))}

            <TextInput
              placeholder="Height"
              value={heightValue}
              onChangeText={setHeightValue}
              placeholderTextColor="#A89C8E"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginTop: 10,
                marginBottom: 8,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            {heightUnits.map((unit) => {
              const selected = heightUnit === unit;
              return (
                <Pressable
                  key={unit}
                  onPress={() => toggleSingle(unit as 'in' | 'cm' | 'ft', heightUnit, setHeightUnit)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                      borderWidth: 1,
                      borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                      backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{unit}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={() => setShowHeightCalendar((prev) => !prev)}
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: heightDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                {heightDate || 'Height date'}
              </Text>
            </Pressable>
            {showHeightCalendar && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginBottom: 8,
                }}
              >
                <CalendarWithYear
                  onDayPress={(day) => {
                    setHeightDate(day.dateString);
                    setShowHeightCalendar(false);
                  }}
                  markedDates={
                    heightDate
                      ? {
                          [heightDate]: {
                            selected: true,
                            selectedColor: '#4C7744',
                            selectedTextColor: '#FFFFFF',
                          },
                        }
                      : undefined
                  }
                  theme={calendarTheme}
                />
              </View>
            )}
            <Pressable
              onPress={() =>
                addMetric(heightValue, heightUnit || 'in', heightDate, setHeightLogs, () => {
                  setHeightValue('');
                  setHeightDate('');
                })
              }
              style={{
                backgroundColor: '#8B5E3C',
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Height Entry</Text>
            </Pressable>

            {heightLogs.map((entry) => (
              <Text key={entry.id} style={{ color: '#6E5B4B', marginBottom: 4, fontFamily: 'SedgwickAve' }}>
                {formatDisplayDate(entry.date)}: {entry.value}
              </Text>
            ))}
          </>
        )}

        {logSettings.livestock.quality && !isChickenGroup && (
          <>
            <TextInput
              placeholder="Deformities"
              value={deformities}
              onChangeText={setDeformities}
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

            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Show quality</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {['yes', 'no'].map((value) => (
                <Pressable
                  key={value}
                  onPress={() => toggleSingle(value as 'yes' | 'no', showQuality, setShowQuality)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: showQuality === value ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: showQuality === value ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value === 'yes' ? 'Yes' : 'No'}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {logSettings.livestock.vetRecords && !isChickenGroup && (
          <>
            <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              Vet Records
            </Text>

        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Vaccines</Text>
        <TextInput
          placeholder="Vaccine name"
          value={vaccineName}
          onChangeText={setVaccineName}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />
        <Pressable
          onPress={() => setShowVaccineCalendar((prev) => !prev)}
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: vaccineDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
            {vaccineDate || 'Vaccine date'}
          </Text>
        </Pressable>
        {showVaccineCalendar && (
          <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
            <CalendarWithYear
              onDayPress={(day) => {
                setVaccineDate(day.dateString);
                setShowVaccineCalendar(false);
              }}
              markedDates={
                vaccineDate
                  ? { [vaccineDate]: { selected: true, selectedColor: '#4C7744', selectedTextColor: '#FFFFFF' } }
                  : undefined
              }
              theme={calendarTheme}
            />
          </View>
        )}
        <TextInput
          placeholder="Notes"
          value={vaccineNotes}
          onChangeText={setVaccineNotes}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />
        <Pressable
          onPress={() =>
            addSimpleLog(vaccineName.trim() || undefined, vaccineDate, vaccineNotes, setVaccineLogs, () => {
              setVaccineName('');
              setVaccineDate('');
              setVaccineNotes('');
            })
          }
          style={{ backgroundColor: '#8B5E3C', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginBottom: 12 }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Vaccine</Text>
        </Pressable>
        {vaccineLogs.map((entry) => (
          <Text key={entry.id} style={{ color: '#6E5B4B', marginBottom: 4, fontFamily: 'SedgwickAve' }}>
            {formatDisplayDate(entry.date)}: {entry.label || 'Vaccine'} {entry.notes ? `- ${entry.notes}` : ''}
          </Text>
        ))}

        <Text style={{ color: '#3A2E24', marginTop: 10, marginBottom: 6, fontFamily: 'SedgwickAve' }}>Worming</Text>
        <TextInput
          placeholder="Product"
          value={wormingProduct}
          onChangeText={setWormingProduct}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />
        <Pressable
          onPress={() => setShowWormingCalendar((prev) => !prev)}
          style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 8, padding: 10, marginBottom: 8 }}
        >
          <Text style={{ color: wormingDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
            {wormingDate || 'Worming date'}
          </Text>
        </Pressable>
        {showWormingCalendar && (
          <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
            <CalendarWithYear
              onDayPress={(day) => {
                setWormingDate(day.dateString);
                setShowWormingCalendar(false);
              }}
              markedDates={
                wormingDate
                  ? { [wormingDate]: { selected: true, selectedColor: '#4C7744', selectedTextColor: '#FFFFFF' } }
                  : undefined
              }
              theme={calendarTheme}
            />
          </View>
        )}
        <TextInput
          placeholder="Notes"
          value={wormingNotes}
          onChangeText={setWormingNotes}
          placeholderTextColor="#A89C8E"
          style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 8, padding: 10, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}
        />
        <Pressable
          onPress={() =>
            addSimpleLog(wormingProduct.trim() || undefined, wormingDate, wormingNotes, setWormingLogs, () => {
              setWormingProduct('');
              setWormingDate('');
              setWormingNotes('');
            })
          }
          style={{ backgroundColor: '#8B5E3C', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginBottom: 12 }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Worming</Text>
        </Pressable>
        {wormingLogs.map((entry) => (
          <Text key={entry.id} style={{ color: '#6E5B4B', marginBottom: 4, fontFamily: 'SedgwickAve' }}>
            {formatDisplayDate(entry.date)}: {entry.label || 'Worming'} {entry.notes ? `- ${entry.notes}` : ''}
          </Text>
        ))}

        <Text style={{ color: '#3A2E24', marginTop: 10, marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          {species === 'Chicken' ? 'Claws trimmed' : 'Hoof trimming'}
        </Text>
        <Pressable
          onPress={() => setShowHoofCalendar((prev) => !prev)}
          style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 8, padding: 10, marginBottom: 8 }}
        >
          <Text style={{ color: hoofDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
            {hoofDate || (species === 'Chicken' ? 'Claw trim date' : 'Hoof trim date')}
          </Text>
        </Pressable>
        {showHoofCalendar && (
          <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
            <CalendarWithYear
              onDayPress={(day) => {
                setHoofDate(day.dateString);
                setShowHoofCalendar(false);
              }}
              markedDates={
                hoofDate
                  ? { [hoofDate]: { selected: true, selectedColor: '#4C7744', selectedTextColor: '#FFFFFF' } }
                  : undefined
              }
              theme={calendarTheme}
            />
          </View>
        )}
        <TextInput
          placeholder="Notes"
          value={hoofNotes}
          onChangeText={setHoofNotes}
          placeholderTextColor="#A89C8E"
          style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 8, padding: 10, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}
        />
        <Pressable
          onPress={() =>
            addSimpleLog(undefined, hoofDate, hoofNotes, setHoofLogs, () => {
              setHoofDate('');
              setHoofNotes('');
            })
          }
          style={{ backgroundColor: '#8B5E3C', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginBottom: 12 }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>
            {species === 'Chicken' ? 'Add Claw Trim' : 'Add Hoof Trim'}
          </Text>
        </Pressable>
        {hoofLogs.map((entry) => (
          <Text key={entry.id} style={{ color: '#6E5B4B', marginBottom: 4, fontFamily: 'SedgwickAve' }}>
            {formatDisplayDate(entry.date)}: {species === 'Chicken' ? 'Claw trim' : 'Hoof trim'}
            {entry.notes ? `- ${entry.notes}` : ''}
          </Text>
        ))}

        <Text style={{ color: '#3A2E24', marginTop: 10, marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Vet appointments
        </Text>
        <TextInput
          placeholder="Reason"
          value={vetApptReason}
          onChangeText={setVetApptReason}
          placeholderTextColor="#A89C8E"
          style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 8, padding: 10, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}
        />
        <Pressable
          onPress={() => setShowVetApptCalendar((prev) => !prev)}
          style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 8, padding: 10, marginBottom: 8 }}
        >
          <Text style={{ color: vetApptDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
            {vetApptDate || 'Appointment date'}
          </Text>
        </Pressable>
        {showVetApptCalendar && (
          <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
            <CalendarWithYear
              onDayPress={(day) => {
                setVetApptDate(day.dateString);
                setShowVetApptCalendar(false);
              }}
              markedDates={
                vetApptDate
                  ? { [vetApptDate]: { selected: true, selectedColor: '#4C7744', selectedTextColor: '#FFFFFF' } }
                  : undefined
              }
              theme={calendarTheme}
            />
          </View>
        )}
        <TextInput
          placeholder="Notes"
          value={vetApptNotes}
          onChangeText={setVetApptNotes}
          placeholderTextColor="#A89C8E"
          style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 8, padding: 10, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}
        />
        <Pressable
          onPress={() =>
            addSimpleLog(vetApptReason.trim() || undefined, vetApptDate, vetApptNotes, setVetApptLogs, () => {
              setVetApptReason('');
              setVetApptDate('');
              setVetApptNotes('');
            })
          }
          style={{ backgroundColor: '#8B5E3C', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginBottom: 12 }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Appointment</Text>
        </Pressable>
        {vetApptLogs.map((entry) => (
          <Text key={entry.id} style={{ color: '#6E5B4B', marginBottom: 4, fontFamily: 'SedgwickAve' }}>
            {formatDisplayDate(entry.date)}: {entry.label || 'Appointment'} {entry.notes ? `- ${entry.notes}` : ''}
          </Text>
        ))}

        <Text style={{ color: '#3A2E24', marginTop: 10, marginBottom: 6, fontFamily: 'SedgwickAve' }}>Wounds</Text>
        <Pressable
          onPress={() => setShowWoundCalendar((prev) => !prev)}
          style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 8, padding: 10, marginBottom: 8 }}
        >
          <Text style={{ color: woundDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
            {woundDate || 'Wound date'}
          </Text>
        </Pressable>
        {showWoundCalendar && (
          <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
            <CalendarWithYear
              onDayPress={(day) => {
                setWoundDate(day.dateString);
                setShowWoundCalendar(false);
              }}
              markedDates={
                woundDate
                  ? { [woundDate]: { selected: true, selectedColor: '#4C7744', selectedTextColor: '#FFFFFF' } }
                  : undefined
              }
              theme={calendarTheme}
            />
          </View>
        )}
        <TextInput
          placeholder="Wound notes"
          value={woundNotes}
          onChangeText={setWoundNotes}
          placeholderTextColor="#A89C8E"
          style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 8, padding: 10, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}
        />
        <Pressable
          onPress={() => {}}
          style={{ backgroundColor: '#C9B8A6', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Add Wound Photo</Text>
        </Pressable>
        <Pressable
          onPress={addWound}
          style={{ backgroundColor: '#8B5E3C', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginBottom: 12 }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Wound</Text>
        </Pressable>

        {woundLogs.map((wound) => (
          <View key={wound.id} style={{ marginBottom: 10 }}>
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              {formatDisplayDate(wound.date)}: {wound.notes || 'Wound recorded'}
            </Text>
            <Pressable
              onPress={() => setFollowUpTargetId(wound.id)}
              style={{ marginTop: 6, backgroundColor: '#C9B8A6', paddingVertical: 6, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Add Follow-up</Text>
            </Pressable>

            {followUpTargetId === wound.id && (
              <View style={{ marginTop: 8 }}>
                <Pressable
                  onPress={() => setShowFollowUpCalendar((prev) => !prev)}
                  style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 8, padding: 10, marginBottom: 8 }}
                >
                  <Text style={{ color: followUpDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                    {followUpDate || 'Follow-up date'}
                  </Text>
                </Pressable>
                {showFollowUpCalendar && (
                  <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                    <CalendarWithYear
                      onDayPress={(day) => {
                        setFollowUpDate(day.dateString);
                        setShowFollowUpCalendar(false);
                      }}
                      markedDates={
                        followUpDate
                          ? { [followUpDate]: { selected: true, selectedColor: '#4C7744', selectedTextColor: '#FFFFFF' } }
                          : undefined
                      }
                      theme={calendarTheme}
                    />
                  </View>
                )}
                <TextInput
                  placeholder="Follow-up notes"
                  value={followUpNotes}
                  onChangeText={setFollowUpNotes}
                  placeholderTextColor="#A89C8E"
                  style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 8, padding: 10, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}
                />
                <Pressable
                  onPress={() => {}}
                  style={{ backgroundColor: '#C9B8A6', paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Add Follow-up Photo</Text>
                </Pressable>
                <Pressable
                  onPress={addFollowUp}
                  style={{ backgroundColor: '#8B5E3C', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save Follow-up</Text>
                </Pressable>
              </View>
            )}

            {wound.followUps.map((followUp) => (
              <Text key={followUp.id} style={{ color: '#6E5B4B', marginTop: 6, fontFamily: 'SedgwickAve' }}>
                Follow-up {formatDisplayDate(followUp.date)}: {followUp.notes || 'Update'}
              </Text>
            ))}
          </View>
        ))}
          </>
        )}

        {logSettings.livestock.quality && !isChickenGroup && (
          <>
            <Pressable
              onPress={() => {
                if (!animalName.trim()) {
                  Alert.alert('Add a name first', 'Please enter a name before opening the pedigree form.');
                  return;
                }
                router.push({
                  pathname: '/screens/homestead/pedigree',
                  params: {
                    species,
                    animalName,
                    pedigreeKey: `${species}:${animalName.trim()}`,
                  },
                });
              }}
              style={{
                backgroundColor: '#8B5E3C',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Open Pedigree Form</Text>
            </Pressable>
            <TextInput
              placeholder="Registration"
              value={registration}
              onChangeText={setRegistration}
              placeholderTextColor="#A89C8E"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
              }}
            />
          </>
        )}

        {logSettings.livestock.breeding && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/screens/homestead/breeding',
                params: { birthdate: birthdate ?? '', species },
              })
            }
            style={{
              backgroundColor: '#8B5E3C',
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>Breeding Record</Text>
          </Pressable>
        )}

        {isDairy && logSettings.livestock.dairy && (
          <>
            <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              Milk & Udder
            </Text>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
              Udder condition rating
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {udderConditionOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => toggleSingle(option, udderCondition, setUdderCondition)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: udderCondition === option ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: udderCondition === option ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              placeholder="Udder notes"
              value={udderNotes}
              onChangeText={setUdderNotes}
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
            <Pressable
              onPress={() => setShowMilkCalendar((prev) => !prev)}
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: milkDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                {milkDate || 'Milk date'}
              </Text>
            </Pressable>
            {showMilkCalendar && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  overflow: 'hidden',
                  marginBottom: 8,
                }}
              >
                <CalendarWithYear
                  onDayPress={(day) => {
                    setMilkDate(day.dateString);
                    setShowMilkCalendar(false);
                  }}
                  markedDates={
                    milkDate
                      ? {
                          [milkDate]: {
                            selected: true,
                            selectedColor: '#4C7744',
                            selectedTextColor: '#FFFFFF',
                          },
                        }
                      : undefined
                  }
                  theme={calendarTheme}
                />
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              {['AM', 'PM'].map((value) => (
                <Pressable
                  key={value}
                  onPress={() => toggleSingle(value as 'AM' | 'PM', milkTime, setMilkTime)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: milkTime === value ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: milkTime === value ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              {['Hand', 'Machine'].map((value) => (
                <Pressable
                  key={value}
                  onPress={() => toggleSingle(value as 'Hand' | 'Machine', milkMethod, setMilkMethod)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: milkMethod === value ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: milkMethod === value ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              placeholder="Milk amount"
              value={milkAmount}
              onChangeText={setMilkAmount}
              placeholderTextColor="#A89C8E"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginBottom: 6,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
              }}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {milkAmountUnits.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => toggleSingle(unit, milkAmountUnit, setMilkAmountUnit)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: milkAmountUnit === unit ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: milkAmountUnit === unit ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{unit}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Fat content</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {milkFatOptions.map((value) => (
                <Pressable
                  key={value}
                  onPress={() => toggleSingle(value, milkFat, setMilkFat)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: milkFat === value ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: milkFat === value ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Milk taste</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {milkTasteOptions.map((value) => (
                <Pressable
                  key={value}
                  onPress={() => toggleSingle(value, milkTaste, setMilkTaste)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: milkTaste === value ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: milkTaste === value ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Standing quality</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {milkStandingOptions.map((value) => (
                <Pressable
                  key={value}
                  onPress={() => toggleSingle(value, milkHandling, setMilkHandling)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: milkHandling === value ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: milkHandling === value ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={addMilkEntry}
              style={{
                backgroundColor: '#8B5E3C',
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Milk Entry</Text>
            </Pressable>

            {milkLogs.map((entry) => (
              <Text key={entry.id} style={{ color: '#6E5B4B', marginBottom: 4, fontFamily: 'SedgwickAve' }}>
                {formatDisplayDate(entry.date)} {entry.time ? `(${entry.time})` : ''} -{' '}
                {entry.amount || 'Amount'} {entry.amountUnit || ''}
              </Text>
            ))}
          </>
        )}

        {logSettings.livestock.diet && (
          <>
            <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              Diet
            </Text>
            <TextInput
              placeholder="Brand of grain"
              value={grainBrand}
              onChangeText={setGrainBrand}
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
              placeholder="How much per feeding per day"
              value={grainAmountValue}
              onChangeText={setGrainAmountValue}
              placeholderTextColor="#A89C8E"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginBottom: 6,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
              }}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {feedAmountUnits.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => toggleSingle(unit, grainAmountUnit, setGrainAmountUnit)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: grainAmountUnit === unit ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: grainAmountUnit === unit ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{unit}</Text>
                </Pressable>
              ))}
            </View>
            {species !== 'Chicken' && (
              <>
                <TextInput
                  placeholder="Hay type"
                  value={hayType}
                  onChangeText={setHayType}
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
                  Hay form
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {hayFormOptions.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => toggleMulti(option, setHayForm)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: hayForm.includes(option) ? '#8B5E3C' : '#D7C9B7',
                        backgroundColor: hayForm.includes(option) ? '#EADBCB' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Minerals</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {mineralOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => toggleMulti(option, setMinerals)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: minerals.includes(option) ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: minerals.includes(option) ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {logSettings.livestock.profit && (
          <>
            <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              Profit entries
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {(profitOptionsBySpecies[species] ?? ['Other']).map((option) => {
                const selected = profitEntryType === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      if (selected) {
                        setProfitEntryType('');
                        setProfitEntryOther('');
                        setProfitEntryQuantity('');
                        setProfitEntryPrice('');
                        setProfitEntryNotes('');
                        setProfitEntryDate('');
                        setShowProfitCalendar(false);
                        return;
                      }
                      setProfitEntryType(option);
                      if (option !== 'Other') {
                        setProfitEntryOther('');
                      }
                    }}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                      backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
            {profitEntryType === 'Other' && (
              <TextInput
                placeholder="Other (e.g., Petting Zoo)"
                placeholderTextColor="#A89C8E"
                value={profitEntryOther}
                onChangeText={setProfitEntryOther}
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 8,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                  backgroundColor: '#FFFDF6',
                }}
              />
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <TextInput
                placeholder="Quantity"
                value={profitEntryQuantity}
                onChangeText={setProfitEntryQuantity}
                keyboardType="numeric"
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
              <TextInput
                placeholder="Price per"
                value={profitEntryPrice}
                onChangeText={setProfitEntryPrice}
                keyboardType="numeric"
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
            </View>
            {profitEntryQuantity && profitEntryPrice ? (
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                Total: ${(Number(profitEntryQuantity) * Number(profitEntryPrice)).toFixed(2)}
              </Text>
            ) : null}
            <TextInput
              placeholder="Notes (optional)"
              value={profitEntryNotes}
              onChangeText={setProfitEntryNotes}
              placeholderTextColor="#A89C8E"
              multiline
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                minHeight: 70,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
                backgroundColor: '#FFFDF6',
                marginBottom: 8,
              }}
            />
            <Pressable
              onPress={() => setShowProfitCalendar((prev) => !prev)}
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
                backgroundColor: '#FFFDF6',
              }}
            >
              <Text style={{ color: profitEntryDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                {profitEntryDate ? formatDisplayDate(profitEntryDate) : 'Add date (optional)'}
              </Text>
            </Pressable>
            {showProfitCalendar && (
              <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                <CalendarWithYear
                  onDayPress={(day) => {
                    setProfitEntryDate(day.dateString);
                    setShowProfitCalendar(false);
                  }}
                  markedDates={
                    profitEntryDate
                      ? {
                          [profitEntryDate]: {
                            selected: true,
                            selectedColor: '#4C7744',
                            selectedTextColor: '#FFFFFF',
                          },
                        }
                      : {}
                  }
                  theme={calendarTheme}
                />
              </View>
            )}
            <Pressable
              onPress={addProfitEntry}
              style={{
                backgroundColor: '#8B5E3C',
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Profit Entry</Text>
            </Pressable>
            {profitEntries.length > 0 && (
              <View style={{ gap: 6, marginBottom: 12 }}>
                {profitEntries.map((entry) => (
                  <View
                    key={entry.id}
                    style={{
                      borderWidth: 1,
                      borderColor: '#E0D6C7',
                      borderRadius: 8,
                      padding: 8,
                      backgroundColor: '#FFFDF6',
                    }}
                  >
                    <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                      {entry.date ? `${formatDisplayDate(entry.date)} • ` : ''}
                      {entry.type}
                      {entry.quantity ? ` • Qty ${entry.quantity}` : ''}
                      {entry.total ? ` • $${entry.total}` : ''}
                      {entry.notes ? ` • ${entry.notes}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <Pressable
          onPress={() => {
            const listingTitle = animalName.trim()
              ? `${animalName.trim()} (${species || 'Livestock'})`
              : `${species || 'Livestock'} Listing`;
            const detailBreed = isChickenGroup
              ? breedSelections.join(', ')
              : breed === 'Other'
                ? breedOther.trim()
                : breed;
            const detailParts = [
              detailBreed && `Breed: ${detailBreed}`,
              gender && `Gender: ${gender}`,
              purpose.length > 0 && `Purpose: ${purpose.join(', ')}`,
              birthdate && `Birthdate: ${birthdate}`,
              showQuality && `Show quality: ${showQuality}`,
            ]
              .filter(Boolean)
              .join(' • ');
            addTradingListing({
              id: makeId(),
              title: listingTitle,
              details: detailParts || 'Listing created from Log Book.',
              source: 'Livestock Log',
              date: new Date().toISOString().slice(0, 10),
            });
            Alert.alert('Listed in Trading Post', 'You can edit this listing in the Trading Post.');
          }}
          style={{
            backgroundColor: '#6B4E3D',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 12,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
            List in Trading Post
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            addLivestockLog();
            if (showSaveStatus('Log')) {
              setShowSubmitMessage(true);
            }
          }}
          style={{
            backgroundColor: '#8B5E3C',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 16,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>Save Log</Text>
        </Pressable>
        <Pressable onPress={clearDraft} style={{ alignItems: 'center', marginTop: 8 }}>
          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Clear Draft</Text>
        </Pressable>
        {showSubmitMessage && (
          <Text style={{ marginTop: 8, color: '#4C7744', fontFamily: 'SedgwickAve' }}>
            Saved locally for now. We’ll sync to Supabase later.
          </Text>
        )}
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          ) : (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              {!showCreateLog ? (
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  Tap “Create Log” to add a new record for this section.
                </Text>
              ) : (
                <>
                  {activeSection === 'garden' && (
                    <>
                      <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                        Gardening Log
                      </Text>
                      {logSettings.garden.bedInfo && (
                        <>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Crop / Bed
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                            {gardenBeds.map((bed) => {
                              const selected = selectedBed === bed;
                              return (
                                <Pressable
                                  key={bed}
                                  onPress={() => toggleSingle(bed, selectedBed, setSelectedBed)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{bed}</Text>
                                </Pressable>
                              );
                            })}
                          </View>
                          <TextInput
                            placeholder="Add new bed"
                            value={newBedName}
                            onChangeText={setNewBedName}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                          <Pressable
                            onPress={() => {
                              if (newBedName.trim()) {
                                setGardenBeds((prev) => [...prev, newBedName.trim()]);
                                setSelectedBed(newBedName.trim());
                                setNewBedName('');
                              }
                            }}
                            style={{
                              backgroundColor: '#8B5E3C',
                              paddingVertical: 8,
                              borderRadius: 8,
                              alignItems: 'center',
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Bed</Text>
                          </Pressable>
                          <TextInput
                            placeholder="Rename selected bed"
                            value={renameBedName}
                            onChangeText={setRenameBedName}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                          <Pressable
                            onPress={() => {
                              if (!selectedBed || !renameBedName.trim()) {
                                return;
                              }
                              setGardenBeds((prev) =>
                                prev.map((bed) => (bed === selectedBed ? renameBedName.trim() : bed))
                              );
                              if (gardenBedFilter === selectedBed) {
                                setGardenBedFilter(renameBedName.trim());
                              }
                              setSelectedBed(renameBedName.trim());
                              setRenameBedName('');
                            }}
                            style={{
                              backgroundColor: '#C9B8A6',
                              paddingVertical: 8,
                              borderRadius: 8,
                              alignItems: 'center',
                              marginBottom: 12,
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Rename Bed</Text>
                          </Pressable>
                        </>
                      )}
                      {logSettings.finances.category &&
                        financeType === 'Expense' &&
                        (financeCategory === 'Feed' || financeCategory === 'Veterinary') && (
                          <>
                            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                              Animal type
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                              {visibleAnimals.map((animal) => (
                                <Pressable
                                  key={`finance-animal-${animal}`}
                                  onPress={() => toggleSingle(animal, financeAnimalType, setFinanceAnimalType)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: financeAnimalType === animal ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: financeAnimalType === animal ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{animal}</Text>
                                </Pressable>
                              ))}
                            </View>
                          </>
                        )}

                      {logSettings.garden.plants && (
                        <>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Plant / Produce
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                            {gardenPlantOptions.map((plant) => (
                              <Pressable
                                key={plant}
                                onPress={() => toggleMulti(plant, setGardenPlants)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 16,
                                  borderWidth: 1,
                                  borderColor: gardenPlants.includes(plant) ? '#8B5E3C' : '#D7C9B7',
                                  backgroundColor: gardenPlants.includes(plant) ? '#EADBCB' : '#FFFFFF',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{plant}</Text>
                              </Pressable>
                            ))}
                          </View>
                          <TextInput
                            placeholder="Crop / bed"
                            value={gardenCrop}
                            onChangeText={setGardenCrop}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                        </>
                      )}
                      {logSettings.garden.dates && (
                        <>
                          <TextInput
                            placeholder="Task (planting, weeding, etc.)"
                            value={gardenTask}
                            onChangeText={setGardenTask}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                          <Pressable
                            onPress={() => setShowGardenDateCalendar((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ color: gardenDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                              {gardenDate || 'Log date'}
                            </Text>
                          </Pressable>
                          {showGardenDateCalendar && (
                            <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                              <CalendarWithYear
                                onDayPress={(day) => {
                                  setGardenDate(day.dateString);
                                  setShowGardenDateCalendar(false);
                                }}
                                markedDates={
                                  gardenDate
                                    ? {
                                        [gardenDate]: {
                                          selected: true,
                                          selectedColor: '#4C7744',
                                          selectedTextColor: '#FFFFFF',
                                        },
                                      }
                                    : undefined
                                }
                                theme={calendarTheme}
                              />
                            </View>
                          )}

                          <Pressable
                            onPress={() => setShowGardenPrepCalendar((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ color: gardenPrepDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                              {gardenPrepDate || 'Prep bed date'}
                            </Text>
                          </Pressable>
                          {showGardenPrepCalendar && (
                            <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                              <CalendarWithYear
                                onDayPress={(day) => {
                                  setGardenPrepDate(day.dateString);
                                  setShowGardenPrepCalendar(false);
                                }}
                                markedDates={
                                  gardenPrepDate
                                    ? {
                                        [gardenPrepDate]: {
                                          selected: true,
                                          selectedColor: '#4C7744',
                                          selectedTextColor: '#FFFFFF',
                                        },
                                      }
                                    : undefined
                                }
                                theme={calendarTheme}
                              />
                            </View>
                          )}
                          <TextInput
                            placeholder="Prep notes"
                            value={gardenPrepNotes}
                            onChangeText={setGardenPrepNotes}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />

                          <Pressable
                            onPress={() => setShowGardenSeedCalendar((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ color: gardenSeedDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                              {gardenSeedDate || 'Seed date'}
                            </Text>
                          </Pressable>
                          {showGardenSeedCalendar && (
                            <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                              <CalendarWithYear
                                onDayPress={(day) => {
                                  setGardenSeedDate(day.dateString);
                                  setShowGardenSeedCalendar(false);
                                }}
                                markedDates={
                                  gardenSeedDate
                                    ? {
                                        [gardenSeedDate]: {
                                          selected: true,
                                          selectedColor: '#4C7744',
                                          selectedTextColor: '#FFFFFF',
                                        },
                                      }
                                    : undefined
                                }
                                theme={calendarTheme}
                              />
                            </View>
                          )}
                        </>
                      )}
                      {logSettings.garden.soilWater && (
                        <>
                          <TextInput
                            placeholder="Soil notes"
                            value={gardenSoil}
                            onChangeText={setGardenSoil}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                          <TextInput
                            placeholder="Watering"
                            value={gardenWatering}
                            onChangeText={setGardenWatering}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                        </>
                      )}
                      {logSettings.garden.pestsWeather && (
                        <TextInput
                          placeholder="Pests / disease"
                          value={gardenPests}
                          onChangeText={setGardenPests}
                          placeholderTextColor="#A89C8E"
                          style={{
                            borderWidth: 1,
                            borderColor: '#D7C9B7',
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 8,
                            color: '#3A2E24',
                            fontFamily: 'SedgwickAve',
                          }}
                        />
                      )}
                      {logSettings.garden.fertilizer && (
                        <>
                          <TextInput
                            placeholder="Fertilizer / amendments"
                            value={gardenFertilizer}
                            onChangeText={setGardenFertilizer}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                          <Pressable
                            onPress={() => setShowGardenFertilizerCalendar((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <Text
                              style={{
                                color: gardenFertilizerDate ? '#3A2E24' : '#A89C8E',
                                fontFamily: 'SedgwickAve',
                              }}
                            >
                              {gardenFertilizerDate || 'Fertilizer date'}
                            </Text>
                          </Pressable>
                          {showGardenFertilizerCalendar && (
                            <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                              <CalendarWithYear
                                onDayPress={(day) => {
                                  setGardenFertilizerDate(day.dateString);
                                  setShowGardenFertilizerCalendar(false);
                                }}
                                markedDates={
                                  gardenFertilizerDate
                                    ? {
                                        [gardenFertilizerDate]: {
                                          selected: true,
                                          selectedColor: '#4C7744',
                                          selectedTextColor: '#FFFFFF',
                                        },
                                      }
                                    : undefined
                                }
                                theme={calendarTheme}
                              />
                            </View>
                          )}
                        </>
                      )}
                      {logSettings.garden.planning && (
                        <>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Planning (syncs to Almanac later)
                          </Text>
                          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                            Set planned dates and an alert lead time in days.
                          </Text>
                          <Pressable
                            onPress={() => setShowGardenPlanPrepCalendar((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ color: gardenPlanPrepDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                              {gardenPlanPrepDate || 'Plan prep bed date'}
                            </Text>
                          </Pressable>
                          {showGardenPlanPrepCalendar && (
                            <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                              <CalendarWithYear
                                onDayPress={(day) => {
                                  setGardenPlanPrepDate(day.dateString);
                                  setShowGardenPlanPrepCalendar(false);
                                }}
                                markedDates={
                                  gardenPlanPrepDate
                                    ? {
                                        [gardenPlanPrepDate]: {
                                          selected: true,
                                          selectedColor: '#4C7744',
                                          selectedTextColor: '#FFFFFF',
                                        },
                                      }
                                    : undefined
                                }
                                theme={calendarTheme}
                              />
                            </View>
                          )}
                          <TextInput
                            placeholder="Prep bed alert lead (days)"
                            value={gardenPlanPrepLead}
                            onChangeText={setGardenPlanPrepLead}
                            placeholderTextColor="#A89C8E"
                            keyboardType="numeric"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />

                          <Pressable
                            onPress={() => setShowGardenPlanSeedCalendar((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ color: gardenPlanSeedDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                              {gardenPlanSeedDate || 'Plan seed date'}
                            </Text>
                          </Pressable>
                          {showGardenPlanSeedCalendar && (
                            <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                              <CalendarWithYear
                                onDayPress={(day) => {
                                  setGardenPlanSeedDate(day.dateString);
                                  setShowGardenPlanSeedCalendar(false);
                                }}
                                markedDates={
                                  gardenPlanSeedDate
                                    ? {
                                        [gardenPlanSeedDate]: {
                                          selected: true,
                                          selectedColor: '#4C7744',
                                          selectedTextColor: '#FFFFFF',
                                        },
                                      }
                                    : undefined
                                }
                                theme={calendarTheme}
                              />
                            </View>
                          )}
                          <TextInput
                            placeholder="Seed alert lead (days)"
                            value={gardenPlanSeedLead}
                            onChangeText={setGardenPlanSeedLead}
                            placeholderTextColor="#A89C8E"
                            keyboardType="numeric"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />

                          <Pressable
                            onPress={() => setShowGardenPlanFertilizeCalendar((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <Text
                              style={{
                                color: gardenPlanFertilizeDate ? '#3A2E24' : '#A89C8E',
                                fontFamily: 'SedgwickAve',
                              }}
                            >
                              {gardenPlanFertilizeDate || 'Plan fertilizer date'}
                            </Text>
                          </Pressable>
                          {showGardenPlanFertilizeCalendar && (
                            <View style={{ borderWidth: 1, borderColor: '#D7C9B7', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                              <CalendarWithYear
                                onDayPress={(day) => {
                                  setGardenPlanFertilizeDate(day.dateString);
                                  setShowGardenPlanFertilizeCalendar(false);
                                }}
                                markedDates={
                                  gardenPlanFertilizeDate
                                    ? {
                                        [gardenPlanFertilizeDate]: {
                                          selected: true,
                                          selectedColor: '#4C7744',
                                          selectedTextColor: '#FFFFFF',
                                        },
                                      }
                                    : undefined
                                }
                                theme={calendarTheme}
                              />
                            </View>
                          )}
                          <TextInput
                            placeholder="Fertilizer alert lead (days)"
                            value={gardenPlanFertilizeLead}
                            onChangeText={setGardenPlanFertilizeLead}
                            placeholderTextColor="#A89C8E"
                            keyboardType="numeric"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                        </>
                      )}
                      {logSettings.garden.pestsWeather && (
                        <TextInput
                          placeholder="Weather"
                          value={gardenWeather}
                          onChangeText={setGardenWeather}
                          placeholderTextColor="#A89C8E"
                          style={{
                            borderWidth: 1,
                            borderColor: '#D7C9B7',
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 8,
                            color: '#3A2E24',
                            fontFamily: 'SedgwickAve',
                          }}
                        />
                      )}
                      {logSettings.garden.growthStage && (
                        <>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Growth stage
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                            {gardenStageOptions.map((stage) => (
                              <Pressable
                                key={stage}
                                onPress={() => toggleSingle(stage, gardenStage, setGardenStage)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 16,
                                  borderWidth: 1,
                                  borderColor: gardenStage === stage ? '#8B5E3C' : '#D7C9B7',
                                  backgroundColor: gardenStage === stage ? '#EADBCB' : '#FFFFFF',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{stage}</Text>
                              </Pressable>
                            ))}
                          </View>
                        </>
                      )}
                      {logSettings.garden.notes && (
                        <TextInput
                          placeholder="Notes"
                          value={gardenNotes}
                          onChangeText={setGardenNotes}
                          placeholderTextColor="#A89C8E"
                          multiline
                          style={{
                            borderWidth: 1,
                            borderColor: '#D7C9B7',
                            borderRadius: 8,
                            padding: 10,
                            minHeight: 80,
                            marginBottom: 12,
                            color: '#3A2E24',
                            fontFamily: 'SedgwickAve',
                          }}
                        />
                      )}
                      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                        <Pressable
                          onPress={addGardenLog}
                          style={{
                            flex: 1,
                            backgroundColor: '#8B5E3C',
                            paddingVertical: 10,
                            borderRadius: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
                            Save Log
                          </Text>
                        </Pressable>
                        {editingGardenId && (
                          <Pressable
                            onPress={() => {
                              setEditingGardenId(null);
                              resetGardenForm();
                            }}
                            style={{
                              paddingVertical: 10,
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
                    </>
                  )}

                  {activeSection === 'pantry' && (
                    <>
                      <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                        Pantry Log
                      </Text>
                      {logSettings.pantry.basics && (
                        <>
                          <TextInput
                            placeholder="Item"
                            value={pantryItem}
                            onChangeText={setPantryItem}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Pantry type
                          </Text>
                          <Pressable
                            onPress={() => setShowPantryTypePicker((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              backgroundColor: '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: pantryType ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                              {pantryType || 'Select pantry type'}
                            </Text>
                          </Pressable>
                          {showPantryTypePicker && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                              {pantryTypeOptions.map((type) => (
                                <Pressable
                                  key={type}
                                  onPress={() => {
                                    toggleSingle(type, pantryType, setPantryType);
                                    setShowPantryTypePicker(false);
                                  }}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: pantryType === type ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: pantryType === type ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{type}</Text>
                                </Pressable>
                              ))}
                            </View>
                          )}
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Preservation method
                          </Text>
                          <Pressable
                            onPress={() => setShowPantryMethodPicker((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              backgroundColor: '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: pantryMethod ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                              {pantryMethod || 'Select method'}
                            </Text>
                          </Pressable>
                          {showPantryMethodPicker && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                              {pantryMethods.map((method) => (
                                <Pressable
                                  key={method}
                                  onPress={() => {
                                    toggleSingle(method, pantryMethod, setPantryMethod);
                                    setShowPantryMethodPicker(false);
                                  }}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: pantryMethod === method ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: pantryMethod === method ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{method}</Text>
                                </Pressable>
                              ))}
                            </View>
                          )}
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Category
                          </Text>
                          <Pressable
                            onPress={() => setShowPantryCategoryPicker((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              backgroundColor: '#FFFFFF',
                            }}
                          >
                            <Text
                              style={{
                                color: pantryCategory ? '#3A2E24' : '#A89C8E',
                                fontFamily: 'SedgwickAve',
                              }}
                            >
                              {pantryCategory || 'Select category'}
                            </Text>
                          </Pressable>
                          {showPantryCategoryPicker && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                              {pantryCategoryOptions.map((category) => (
                                <Pressable
                                  key={category}
                                  onPress={() => {
                                    toggleSingle(category, pantryCategory, setPantryCategory);
                                    setShowPantryCategoryPicker(false);
                                  }}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: pantryCategory === category ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: pantryCategory === category ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{category}</Text>
                                </Pressable>
                              ))}
                            </View>
                          )}
                          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                            <TextInput
                              value={pantryNewCategory}
                              onChangeText={setPantryNewCategory}
                              placeholder="Add category"
                              placeholderTextColor="#A89C8E"
                              style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 8,
                                padding: 10,
                                color: '#3A2E24',
                                fontFamily: 'SedgwickAve',
                                backgroundColor: '#FFFFFF',
                              }}
                            />
                            <Pressable
                              onPress={() => {
                                const trimmed = pantryNewCategory.trim();
                                if (!trimmed) {
                                  return;
                                }
                                if (!pantryCategoryDefaults.includes(trimmed)) {
                                  setCustomPantryCategories((prev) =>
                                    prev.includes(trimmed) ? prev : [...prev, trimmed]
                                  );
                                }
                                setPantryCategory(trimmed);
                                setPantryNewCategory('');
                              }}
                              style={{
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                borderRadius: 8,
                                backgroundColor: '#8B5E3C',
                              }}
                            >
                              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add</Text>
                            </Pressable>
                          </View>
                          {pantryCategory && (
                            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                              <TextInput
                                value={pantryRenameCategory}
                                onChangeText={setPantryRenameCategory}
                                placeholder="Rename selected category"
                                placeholderTextColor="#A89C8E"
                                style={{
                                  flex: 1,
                                  borderWidth: 1,
                                  borderColor: '#D7C9B7',
                                  borderRadius: 8,
                                  padding: 10,
                                  color: '#3A2E24',
                                  fontFamily: 'SedgwickAve',
                                  backgroundColor: '#FFFFFF',
                                }}
                              />
                              <Pressable
                                onPress={() => {
                                  const trimmed = pantryRenameCategory.trim();
                                  if (!trimmed) {
                                    return;
                                  }
                                  setCustomPantryCategories((prev) => {
                                    const withoutCurrent = prev.filter((item) => item !== pantryCategory);
                                    if (pantryCategoryDefaults.includes(pantryCategory)) {
                                      return withoutCurrent.includes(trimmed)
                                        ? withoutCurrent
                                        : [...withoutCurrent, trimmed];
                                    }
                                    return withoutCurrent.includes(trimmed)
                                      ? withoutCurrent
                                      : [...withoutCurrent, trimmed];
                                  });
                                  setPantryCategory(trimmed);
                                  setPantryRenameCategory('');
                                }}
                                style={{
                                  paddingVertical: 8,
                                  paddingHorizontal: 12,
                                  borderRadius: 8,
                                  backgroundColor: '#C9B8A6',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Rename</Text>
                              </Pressable>
                            </View>
                          )}
                          <TextInput
                            placeholder="Batch / lot"
                            value={pantryBatch}
                            onChangeText={setPantryBatch}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                          <Pressable
                            onPress={() => setShowPantryCalendar((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ color: pantryDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                              {pantryDate || 'Preserved date'}
                            </Text>
                          </Pressable>
                          {showPantryCalendar && (
                            <View
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 10,
                                overflow: 'hidden',
                                marginBottom: 8,
                              }}
                            >
                              <CalendarWithYear
                                onDayPress={(day) => {
                                  setPantryDate(day.dateString);
                                  setShowPantryCalendar(false);
                                }}
                                markedDates={
                                  pantryDate
                                    ? {
                                        [pantryDate]: {
                                          selected: true,
                                          selectedColor: '#4C7744',
                                          selectedTextColor: '#FFFFFF',
                                        },
                                      }
                                    : undefined
                                }
                                theme={calendarTheme}
                              />
                            </View>
                          )}
                        </>
                      )}
                      {logSettings.pantry.storage && (
                        <>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Storage location
                          </Text>
                          <Pressable
                            onPress={() => setShowPantryLocationPicker((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              backgroundColor: '#FFFFFF',
                            }}
                          >
                            <Text
                              style={{
                                color: pantryLocation ? '#3A2E24' : '#A89C8E',
                                fontFamily: 'SedgwickAve',
                              }}
                            >
                              {pantryLocation || 'Select location'}
                            </Text>
                          </Pressable>
                          {showPantryLocationPicker && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                              {pantryLocationOptions
                                .filter((location) => location !== 'All locations')
                                .map((location) => (
                                  <Pressable
                                    key={location}
                                    onPress={() => {
                                      toggleSingle(location, pantryLocation, setPantryLocation);
                                      setShowPantryLocationPicker(false);
                                    }}
                                    style={{
                                      paddingVertical: 6,
                                      paddingHorizontal: 10,
                                      borderRadius: 16,
                                      borderWidth: 1,
                                      borderColor: pantryLocation === location ? '#8B5E3C' : '#D7C9B7',
                                      backgroundColor: pantryLocation === location ? '#EADBCB' : '#FFFFFF',
                                    }}
                                  >
                                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{location}</Text>
                                  </Pressable>
                                ))}
                            </View>
                          )}
                          <Pressable
                            onPress={() => setShowPantryUseByCalendar((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ color: pantryUseBy ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                              {pantryUseBy || 'Use-by date'}
                            </Text>
                          </Pressable>
                          {showPantryUseByCalendar && (
                            <View
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 10,
                                overflow: 'hidden',
                                marginBottom: 8,
                              }}
                            >
                              <CalendarWithYear
                                onDayPress={(day) => {
                                  setPantryUseBy(day.dateString);
                                  setShowPantryUseByCalendar(false);
                                }}
                                markedDates={
                                  pantryUseBy
                                    ? {
                                        [pantryUseBy]: {
                                          selected: true,
                                          selectedColor: '#4C7744',
                                          selectedTextColor: '#FFFFFF',
                                        },
                                      }
                                    : undefined
                                }
                                theme={calendarTheme}
                              />
                            </View>
                          )}
                        </>
                      )}
                      {logSettings.pantry.quantities && (
                        <>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Quantity
                          </Text>
                          <TextInput
                            placeholder="Quantity"
                            value={pantryQuantity}
                            onChangeText={setPantryQuantity}
                            placeholderTextColor="#A89C8E"
                            keyboardType="numeric"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Unit
                          </Text>
                          <Pressable
                            onPress={() => setShowPantryUnitPicker((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              backgroundColor: '#FFFFFF',
                            }}
                          >
                            <Text
                              style={{
                                color: pantryQuantityUnit ? '#3A2E24' : '#A89C8E',
                                fontFamily: 'SedgwickAve',
                              }}
                            >
                              {pantryQuantityUnit || 'Select unit'}
                            </Text>
                          </Pressable>
                          {showPantryUnitPicker && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                              {pantryUnitDefaults.map((unit) => (
                                <Pressable
                                  key={unit}
                                  onPress={() => {
                                    toggleSingle(unit, pantryQuantityUnit, setPantryQuantityUnit);
                                    setShowPantryUnitPicker(false);
                                  }}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: pantryQuantityUnit === unit ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: pantryQuantityUnit === unit ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{unit}</Text>
                                </Pressable>
                              ))}
                            </View>
                          )}
                          <TextInput
                            placeholder="Ingredients list"
                            value={pantryIngredients}
                            onChangeText={setPantryIngredients}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                        </>
                      )}
                      {logSettings.pantry.notes && (
                      <TextInput
                        placeholder="Notes"
                        value={pantryNotes}
                        onChangeText={setPantryNotes}
                        placeholderTextColor="#A89C8E"
                        multiline
                        style={{
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 10,
                          minHeight: 80,
                          marginBottom: 12,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      )}
                      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                        <Pressable
                          onPress={addPantryLog}
                          style={{
                            flex: 1,
                            backgroundColor: '#8B5E3C',
                            paddingVertical: 10,
                            borderRadius: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
                            Save Log
                          </Text>
                        </Pressable>
                        {editingPantryId && (
                          <Pressable
                            onPress={() => {
                              setEditingPantryId(null);
                              setPantryItem('');
                              setPantryType('');
                              setPantryMethod('');
                              setPantryCategory('');
                              setPantryBatch('');
                              setPantryDate('');
                              setPantryUseBy('');
                              setPantryLocation('');
                              setPantryQuantity('');
                              setPantryQuantityUnit('');
                              setPantryIngredients('');
                              setPantryNotes('');
                              setShowPantryTypePicker(false);
                              setShowPantryMethodPicker(false);
                              setShowPantryCategoryPicker(false);
                              setShowPantryLocationPicker(false);
                              setShowPantryUnitPicker(false);
                              setShowPantryUseByCalendar(false);
                              setShowPantryCalendar(false);
                            }}
                            style={{
                              paddingVertical: 10,
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
                    </>
                  )}

                  {activeSection === 'harvest' && (
                    <>
                      <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                        Harvest Log
                      </Text>
                      {logSettings.harvest.basics && (
                        <>
                      <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                        Animal type
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                        {harvestAnimalOptions.map((animal) => {
                          const selected = harvestItem === animal;
                          return (
                            <Pressable
                              key={animal}
                              onPress={() => toggleSingle(animal, harvestItem, setHarvestItem)}
                              style={{
                                paddingVertical: 6,
                                paddingHorizontal: 10,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                                backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                              }}
                            >
                              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{animal}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                        </>
                      )}
                      {logSettings.harvest.yield && (
                        <>
                      <TextInput
                        placeholder="Yield amount"
                        value={harvestYield}
                        onChangeText={setHarvestYield}
                        keyboardType="numeric"
                        inputMode="numeric"
                        placeholderTextColor="#A89C8E"
                        style={{
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 8,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                        Yield unit
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        {harvestUnits.map((unit) => (
                          <Pressable
                            key={unit}
                            onPress={() => setHarvestYieldUnit(unit)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: harvestYieldUnit === unit ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: harvestYieldUnit === unit ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{unit}</Text>
                          </Pressable>
                        ))}
                      </View>
                        </>
                      )}
                      {logSettings.harvest.location && (
                      <TextInput
                        placeholder="Harvest location"
                        value={harvestLocation}
                        onChangeText={setHarvestLocation}
                        placeholderTextColor="#A89C8E"
                        style={{
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 8,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      )}
                      {logSettings.harvest.basics && (
                        <>
                          <Pressable
                            onPress={() => setShowHarvestCalendar((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ color: harvestDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                              {harvestDate || 'Harvest date'}
                            </Text>
                          </Pressable>
                          {showHarvestCalendar && (
                            <View
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 10,
                                overflow: 'hidden',
                                marginBottom: 8,
                              }}
                            >
                              <CalendarWithYear
                                onDayPress={(day) => {
                                  setHarvestDate(day.dateString);
                                  setShowHarvestCalendar(false);
                                }}
                                markedDates={
                                  harvestDate
                                    ? {
                                        [harvestDate]: {
                                          selected: true,
                                          selectedColor: '#4C7744',
                                          selectedTextColor: '#FFFFFF',
                                        },
                                      }
                                    : undefined
                                }
                                theme={calendarTheme}
                              />
                            </View>
                          )}
                        </>
                      )}
                      {logSettings.harvest.basics && (
                      <TextInput
                        placeholder="Quality"
                        value={harvestQuality}
                        onChangeText={setHarvestQuality}
                        placeholderTextColor="#A89C8E"
                        style={{
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 8,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      )}
                      {logSettings.harvest.storage && (
                      <TextInput
                        placeholder="Storage method"
                        value={harvestStorage}
                        onChangeText={setHarvestStorage}
                        placeholderTextColor="#A89C8E"
                        style={{
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 8,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      )}
                      {logSettings.harvest.weather && (
                      <TextInput
                        placeholder="Weather notes"
                        value={harvestWeather}
                        onChangeText={setHarvestWeather}
                        placeholderTextColor="#A89C8E"
                        style={{
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 8,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      )}
                      {logSettings.harvest.notes && (
                      <TextInput
                        placeholder="Notes"
                        value={harvestNotes}
                        onChangeText={setHarvestNotes}
                        placeholderTextColor="#A89C8E"
                        multiline
                        style={{
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 10,
                          minHeight: 80,
                          marginBottom: 12,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      )}
                      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                        <Pressable
                          onPress={addHarvestLog}
                          style={{
                            flex: 1,
                            backgroundColor: '#8B5E3C',
                            paddingVertical: 10,
                            borderRadius: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
                            Save Log
                          </Text>
                        </Pressable>
                        {editingHarvestId && (
                          <Pressable
                            onPress={() => {
                              setEditingHarvestId(null);
                              setHarvestItem('');
                              setHarvestYield('');
                              setHarvestYieldUnit('lb');
                              setHarvestDate('');
                              setHarvestQuality('');
                              setHarvestLocation('');
                              setHarvestStorage('');
                              setHarvestWeather('');
                              setHarvestNotes('');
                            }}
                            style={{
                              paddingVertical: 10,
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
                    </>
                  )}

                  {activeSection === 'finances' && (
                    <>
                      <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                        Finance Log
                      </Text>
                      {logSettings.finances.basics && (
                      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                        {['Income', 'Expense'].map((value) => (
                          <Pressable
                            key={value}
                            onPress={() => toggleSingle(value as 'Income' | 'Expense', financeType, setFinanceType)}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 14,
                              borderRadius: 16,
                              borderWidth: 1,
                              borderColor: financeType === value ? '#8B5E3C' : '#D7C9B7',
                              backgroundColor: financeType === value ? '#EADBCB' : '#FFFFFF',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                          </Pressable>
                        ))}
                      </View>
                      )}
                      {logSettings.finances.category && (
                        <>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Category
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                            {(financeType === 'Income'
                              ? [...incomeCategories, ...customIncomeCategories]
                              : financeType === 'Expense'
                                ? [...expenseCategories, ...customExpenseCategories]
                                : [...expenseCategories, ...customExpenseCategories]
                            ).map((category) => (
                              <Pressable
                                key={category}
                                onPress={() => toggleSingle(category, financeCategory, setFinanceCategory)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 16,
                                  borderWidth: 1,
                                  borderColor: financeCategory === category ? '#8B5E3C' : '#D7C9B7',
                                  backgroundColor: financeCategory === category ? '#EADBCB' : '#FFFFFF',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{category}</Text>
                              </Pressable>
                            ))}
                          </View>
                          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                            <TextInput
                              value={financeNewCategory}
                              onChangeText={setFinanceNewCategory}
                              placeholder="Add a category"
                              placeholderTextColor="#A89C8E"
                              style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 8,
                                padding: 10,
                                color: '#3A2E24',
                                fontFamily: 'SedgwickAve',
                                backgroundColor: '#FFFFFF',
                              }}
                            />
                            <Pressable
                              onPress={() => {
                                const trimmed = financeNewCategory.trim();
                                if (!trimmed || !financeType) {
                                  return;
                                }
                                if (financeType === 'Income') {
                                  if (!incomeCategories.includes(trimmed)) {
                                    setCustomIncomeCategories((prev) =>
                                      prev.includes(trimmed) ? prev : [...prev, trimmed]
                                    );
                                  }
                                } else {
                                  if (!expenseCategories.includes(trimmed)) {
                                    setCustomExpenseCategories((prev) =>
                                      prev.includes(trimmed) ? prev : [...prev, trimmed]
                                    );
                                  }
                                }
                                setFinanceCategory(trimmed);
                                setFinanceNewCategory('');
                              }}
                              style={{
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                borderRadius: 8,
                                backgroundColor: '#8B5E3C',
                              }}
                            >
                              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add</Text>
                            </Pressable>
                          </View>
                          {financeCategory && (
                            <>
                              <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                                Subcategory
                              </Text>
                              {activeFinanceSubcategories.length > 0 && (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                  {activeFinanceSubcategories.map((option) => (
                                    <Pressable
                                      key={`finance-subcategory-${option}`}
                                      onPress={() => toggleSingle(option, financeSubcategory, setFinanceSubcategory)}
                                      style={{
                                        paddingVertical: 6,
                                        paddingHorizontal: 10,
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: financeSubcategory === option ? '#8B5E3C' : '#D7C9B7',
                                        backgroundColor: financeSubcategory === option ? '#EADBCB' : '#FFFFFF',
                                      }}
                                    >
                                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                                    </Pressable>
                                  ))}
                                </View>
                              )}
                              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                                <TextInput
                                  value={financeNewSubcategory}
                                  onChangeText={setFinanceNewSubcategory}
                                  placeholder="Add a subcategory"
                                  placeholderTextColor="#A89C8E"
                                  style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: '#D7C9B7',
                                    borderRadius: 8,
                                    padding: 10,
                                    color: '#3A2E24',
                                    fontFamily: 'SedgwickAve',
                                    backgroundColor: '#FFFFFF',
                                  }}
                                />
                                <Pressable
                                  onPress={() => {
                                    const trimmed = financeNewSubcategory.trim();
                                    if (!trimmed || !financeCategory) {
                                      return;
                                    }
                                    const defaults = financeSubcategoryOptions[financeCategory] ?? [];
                                    setCustomFinanceSubcategories((prev) => {
                                      const existing = prev[financeCategory] ?? [];
                                      if (defaults.includes(trimmed) || existing.includes(trimmed)) {
                                        return prev;
                                      }
                                      return {
                                        ...prev,
                                        [financeCategory]: [...existing, trimmed],
                                      };
                                    });
                                    setFinanceSubcategory(trimmed);
                                    setFinanceNewSubcategory('');
                                  }}
                                  style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    borderRadius: 8,
                                    backgroundColor: '#8B5E3C',
                                  }}
                                >
                                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add</Text>
                                </Pressable>
                              </View>
                            </>
                          )}
                        </>
                      )}
                      {logSettings.finances.basics && (
                        <>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Quantity
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                            <TextInput
                              placeholder="Qty"
                              value={financeQuantity}
                              onChangeText={setFinanceQuantity}
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
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                              {activeFinanceUnits.map((unit) => (
                                <Pressable
                                  key={unit}
                                  onPress={() => toggleSingle(unit, financeQuantityUnit, setFinanceQuantityUnit)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 14,
                                    borderWidth: 1,
                                    borderColor: financeQuantityUnit === unit ? '#8B5E3C' : '#D7C9B7',
                                    backgroundColor: financeQuantityUnit === unit ? '#EADBCB' : '#FFFFFF',
                                  }}
                                >
                                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                                    {unit}
                                  </Text>
                                </Pressable>
                              ))}
                            </View>
                          </View>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Amount ($)
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 16 }}>$</Text>
                            <TextInput
                              placeholder="Amount"
                              value={financeAmount}
                              onChangeText={setFinanceAmount}
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
                          </View>
                          <TextInput
                            placeholder="Date"
                            value={financeDate}
                            onChangeText={setFinanceDate}
                            placeholderTextColor="#A89C8E"
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                              color: '#3A2E24',
                              fontFamily: 'SedgwickAve',
                            }}
                          />
                        </>
                      )}
                      {logSettings.finances.basics && (
                        <>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Vendor / source
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                            {activeFinanceVendors.map((vendor) => (
                              <Pressable
                                key={`finance-vendor-${vendor}`}
                                onPress={() => toggleSingle(vendor, financeVendor, setFinanceVendor)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 16,
                                  borderWidth: 1,
                                  borderColor: financeVendor === vendor ? '#8B5E3C' : '#D7C9B7',
                                  backgroundColor: financeVendor === vendor ? '#EADBCB' : '#FFFFFF',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{vendor}</Text>
                              </Pressable>
                            ))}
                          </View>
                          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                            <TextInput
                              value={financeNewVendor}
                              onChangeText={setFinanceNewVendor}
                              placeholder="Add vendor/source"
                              placeholderTextColor="#A89C8E"
                              style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 8,
                                padding: 10,
                                color: '#3A2E24',
                                fontFamily: 'SedgwickAve',
                                backgroundColor: '#FFFFFF',
                              }}
                            />
                            <Pressable
                              onPress={() => {
                                const trimmed = financeNewVendor.trim();
                                if (!trimmed) {
                                  return;
                                }
                                if (!financeVendorOptions.includes(trimmed)) {
                                  setCustomFinanceVendors((prev) =>
                                    prev.includes(trimmed) ? prev : [...prev, trimmed]
                                  );
                                }
                                setFinanceVendor(trimmed);
                                setFinanceNewVendor('');
                              }}
                              style={{
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                borderRadius: 8,
                                backgroundColor: '#8B5E3C',
                              }}
                            >
                              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add</Text>
                            </Pressable>
                          </View>
                        </>
                      )}
                      {logSettings.finances.payment && (
                        <>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Payment method
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                            {paymentMethods.map((method) => (
                              <Pressable
                                key={method}
                                onPress={() => toggleSingle(method, financePaymentMethod, setFinancePaymentMethod)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 16,
                                  borderWidth: 1,
                                  borderColor: financePaymentMethod === method ? '#8B5E3C' : '#D7C9B7',
                                  backgroundColor: financePaymentMethod === method ? '#EADBCB' : '#FFFFFF',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{method}</Text>
                              </Pressable>
                            ))}
                          </View>
                        </>
                      )}
                      {logSettings.finances.basics && (
                        <>
                          <Pressable
                            onPress={() => setShowFinanceCalendar((prev) => !prev)}
                            style={{
                              borderWidth: 1,
                              borderColor: '#D7C9B7',
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ color: financeDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
                              {financeDate || 'Transaction date'}
                            </Text>
                          </Pressable>
                          {showFinanceCalendar && (
                            <View
                              style={{
                                borderWidth: 1,
                                borderColor: '#D7C9B7',
                                borderRadius: 10,
                                overflow: 'hidden',
                                marginBottom: 8,
                              }}
                            >
                              <CalendarWithYear
                                onDayPress={(day) => {
                                  setFinanceDate(day.dateString);
                                  setShowFinanceCalendar(false);
                                }}
                                markedDates={
                                  financeDate
                                    ? {
                                        [financeDate]: {
                                          selected: true,
                                          selectedColor: '#4C7744',
                                          selectedTextColor: '#FFFFFF',
                                        },
                                      }
                                    : undefined
                                }
                                theme={calendarTheme}
                              />
                            </View>
                          )}
                        </>
                      )}
                      {logSettings.finances.receipt && (
                      <TextInput
                        placeholder="Receipt / invoice note"
                        value={financeReceipt}
                        onChangeText={setFinanceReceipt}
                        placeholderTextColor="#A89C8E"
                        style={{
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 8,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      )}
                      {logSettings.finances.receipt && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <Pressable
                            onPress={pickFinanceReceipt}
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 12,
                              borderRadius: 8,
                              backgroundColor: '#C9B8A6',
                            }}
                          >
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                              {financeReceiptUri ? 'Replace receipt photo' : 'Attach receipt photo'}
                            </Text>
                          </Pressable>
                          {financeReceiptUri ? (
                            <Pressable onPress={() => setFinanceReceiptUri(null)}>
                              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Remove</Text>
                            </Pressable>
                          ) : null}
                        </View>
                      )}
                      {logSettings.finances.basics && (
                        <>
                          <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                            Recurring
                          </Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                            {['Weekly', 'Monthly', 'Quarterly', 'Yearly'].map((option) => (
                              <Pressable
                                key={option}
                                onPress={() => toggleSingle(option, financeRecurringFrequency, setFinanceRecurringFrequency)}
                                style={{
                                  paddingVertical: 6,
                                  paddingHorizontal: 10,
                                  borderRadius: 16,
                                  borderWidth: 1,
                                  borderColor: financeRecurringFrequency === option ? '#8B5E3C' : '#D7C9B7',
                                  backgroundColor: financeRecurringFrequency === option ? '#EADBCB' : '#FFFFFF',
                                }}
                              >
                                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                              </Pressable>
                            ))}
                          </View>
                        </>
                      )}
                      {logSettings.finances.notes && (
                      <TextInput
                        placeholder="Notes"
                        value={financeNotes}
                        onChangeText={setFinanceNotes}
                        placeholderTextColor="#A89C8E"
                        multiline
                        style={{
                          borderWidth: 1,
                          borderColor: '#D7C9B7',
                          borderRadius: 8,
                          padding: 10,
                          minHeight: 80,
                          marginBottom: 12,
                          color: '#3A2E24',
                          fontFamily: 'SedgwickAve',
                        }}
                      />
                      )}
                      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                        <Pressable
                          onPress={addFinanceLog}
                          style={{
                            flex: 1,
                            backgroundColor: '#8B5E3C',
                            paddingVertical: 10,
                            borderRadius: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
                            Save Log
                          </Text>
                        </Pressable>
                        {editingFinanceId && (
                          <Pressable
                            onPress={() => {
                              setEditingFinanceId(null);
                              setFinanceType('');
                              setFinanceCategory('');
                              setFinanceSubcategory('');
                              setFinanceAmount('');
                              setFinanceQuantity('');
                              setFinanceQuantityUnit('');
                              setFinanceDate('');
                              setFinanceVendor('');
                              setFinanceNewVendor('');
                              setFinancePaymentMethod('');
                              setFinanceReceipt('');
                              setFinanceReceiptUri(null);
                              setFinanceRecurringFrequency('');
                              setFinanceAnimalType('');
                              setFinanceNotes('');
                            }}
                            style={{
                              paddingVertical: 10,
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
                    </>
                  )}

                </>
              )}
            </View>
          )}
        </>
      )}

      <Modal
        visible={showLogSettings}
        animationType="fade"
        transparent
        onRequestClose={() => setShowLogSettings(false)}
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
              Customize
            </Text>
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
              Choose which sections appear in your log forms.
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <Pressable
                onPress={() => setLogSettings(basicLogSettings)}
                style={{
                  flex: 1,
                  backgroundColor: '#C9B8A6',
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Basic</Text>
              </Pressable>
              <Pressable
                onPress={() => setLogSettings(detailedLogSettings)}
                style={{
                  flex: 1,
                  backgroundColor: '#8B5E3C',
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Detailed</Text>
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              {(activeSection == null || activeSection === 'livestock') && (
                <>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Livestock
                  </Text>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Species to show
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {animals.map((animal) => {
                      const selected = visibleLivestockSpecies.includes(animal);
                      return (
                        <Pressable
                          key={`visible-${animal}`}
                          onPress={() => {
                            if (selected && visibleLivestockSpecies.length === 1) {
                              return;
                            }
                            setVisibleLivestockSpecies((prev) =>
                              selected ? prev.filter((item) => item !== animal) : [...prev, animal]
                            );
                          }}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{animal}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {!selectedLivestockSpecies &&
                    [
                      ['basicInfo', 'Basic info'],
                      ['birthdate', 'Birthdate'],
                      ['quality', 'Quality / Pedigree'],
                      ['metrics', 'Weight & Height'],
                      ['vetRecords', 'Vet records'],
                      ['breeding', 'Breeding'],
                      ['dairy', 'Dairy / Milk'],
                      ['diet', 'Diet & Minerals'],
                      ['profit', 'Profit'],
                    ].map(([key, label]) => (
                      <Pressable
                        key={key}
                        onPress={() => toggleLogSetting('livestock', key)}
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
                      >
                        <View
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: '#8B5E3C',
                            marginRight: 8,
                            backgroundColor: logSettings.livestock[key as keyof typeof logSettings.livestock]
                              ? '#8B5E3C'
                              : '#FFFDF6',
                          }}
                        />
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{label}</Text>
                      </Pressable>
                    ))}
                </>
              )}

              {(activeSection == null || activeSection === 'garden') && (
                <>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 10, marginBottom: 6 }}>
                    Gardening
                  </Text>
                  {[
                    ['bedInfo', 'Beds'],
                    ['plants', 'Plants'],
                    ['dates', 'Dates'],
                    ['soilWater', 'Soil & Watering'],
                    ['pestsWeather', 'Pests & Weather'],
                    ['fertilizer', 'Fertilizer'],
                    ['growthStage', 'Growth stage'],
                    ['planning', 'Planning'],
                    ['notes', 'Notes'],
                  ].map(([key, label]) => (
                    <Pressable
                      key={key}
                      onPress={() => toggleLogSetting('garden', key)}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: '#8B5E3C',
                          marginRight: 8,
                          backgroundColor: logSettings.garden[key as keyof typeof logSettings.garden]
                            ? '#8B5E3C'
                            : '#FFFDF6',
                        }}
                      />
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{label}</Text>
                    </Pressable>
                  ))}
                </>
              )}

              {(activeSection == null || activeSection === 'pantry') && (
                <>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 10, marginBottom: 6 }}>
                    Pantry
                  </Text>
                  {[
                    ['basics', 'Basics'],
                    ['storage', 'Storage'],
                    ['quantities', 'Quantities'],
                    ['notes', 'Notes'],
                  ].map(([key, label]) => (
                    <Pressable
                      key={key}
                      onPress={() => toggleLogSetting('pantry', key)}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: '#8B5E3C',
                          marginRight: 8,
                          backgroundColor: logSettings.pantry[key as keyof typeof logSettings.pantry]
                            ? '#8B5E3C'
                            : '#FFFDF6',
                        }}
                      />
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{label}</Text>
                    </Pressable>
                  ))}
                </>
              )}

              {(activeSection == null || activeSection === 'harvest') && (
                <>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 10, marginBottom: 6 }}>
                    Harvest
                  </Text>
                  {[
                    ['basics', 'Basics'],
                    ['yield', 'Yield'],
                    ['location', 'Location'],
                    ['storage', 'Storage'],
                    ['weather', 'Weather'],
                    ['notes', 'Notes'],
                  ].map(([key, label]) => (
                    <Pressable
                      key={key}
                      onPress={() => toggleLogSetting('harvest', key)}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: '#8B5E3C',
                          marginRight: 8,
                          backgroundColor: logSettings.harvest[key as keyof typeof logSettings.harvest]
                            ? '#8B5E3C'
                            : '#FFFDF6',
                        }}
                      />
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{label}</Text>
                    </Pressable>
                  ))}
                </>
              )}

              {(activeSection == null || activeSection === 'finances') && (
                <>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 10, marginBottom: 6 }}>
                    Finances
                  </Text>
                  {[
                    ['basics', 'Basics'],
                    ['category', 'Category'],
                    ['payment', 'Payment'],
                    ['receipt', 'Receipt'],
                    ['notes', 'Notes'],
                  ].map(([key, label]) => (
                    <Pressable
                      key={key}
                      onPress={() => toggleLogSetting('finances', key)}
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: '#8B5E3C',
                          marginRight: 8,
                          backgroundColor: logSettings.finances[key as keyof typeof logSettings.finances]
                            ? '#8B5E3C'
                            : '#FFFDF6',
                        }}
                      />
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{label}</Text>
                    </Pressable>
                  ))}
                </>
              )}
            </ScrollView>

            <Pressable
              onPress={() => setShowLogSettings(false)}
              style={{
                marginTop: 12,
                backgroundColor: '#8B5E3C',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={Boolean(selectedLivestockEntry)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedLivestockEntry(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }}>
          <View
            style={{
              backgroundColor: '#FFF8EE',
              borderRadius: 16,
              padding: 18,
              borderWidth: 1.5,
              borderColor: '#D8C4A8',
            }}
          >
            <ScrollView style={{ maxHeight: 520 }}>
              <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                {selectedLivestockEntry?.animalName || 'Livestock Record'}
              </Text>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                {selectedLivestockEntry?.species || 'Livestock'} •{' '}
                {selectedLivestockEntry?.createdAt
                  ? formatDisplayDate(selectedLivestockEntry.createdAt)
                  : 'No date'}
              </Text>
              {selectedLivestockEntry?.photoUri ? (
                <Image
                  source={{ uri: selectedLivestockEntry.photoUri }}
                  style={{ width: '100%', height: 160, borderRadius: 12, marginBottom: 10 }}
                  resizeMode="cover"
                />
              ) : null}

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <Pressable
                  onPress={() => {
                    if (selectedLivestockEntry) {
                      loadLivestockDraft(selectedLivestockEntry);
                      setSelectedLivestockEntry(null);
                    }
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#4C7744',
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Edit Log</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (!selectedLivestockEntry) return;
                    Alert.alert(
                      'Delete this record?',
                      'This will permanently remove this animal profile.',
                      [
                        { text: 'Keep record', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => {
                            setLivestockLogs((prev) =>
                              prev.filter((entry) => entry.id !== selectedLivestockEntry.id)
                            );
                            setSelectedLivestockEntry(null);
                          },
                        },
                      ]
                    );
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#8B5E3C',
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Delete Record</Text>
                </Pressable>
              </View>

              <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Profile basics</Text>
                {selectedLivestockEntry?.species === 'Goat' && selectedLivestockEntry?.pastureName && (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                    Pasture: {selectedLivestockEntry.pastureName}
                  </Text>
                )}
                {selectedLivestockEntry?.species === 'Pig' && selectedLivestockEntry?.pigPenName && (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                    Pen: {selectedLivestockEntry.pigPenName}
                  </Text>
                )}
                {selectedLivestockEntry?.species === 'Horse' && selectedLivestockEntry?.horsePastureName && (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                    Pasture: {selectedLivestockEntry.horsePastureName}
                  </Text>
                )}
                {selectedLivestockEntry?.species === 'Rabbit' &&
                selectedLivestockEntry?.rabbitHousingType &&
                selectedLivestockEntry?.rabbitHousingName ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                    {selectedLivestockEntry.rabbitHousingType}: {selectedLivestockEntry.rabbitHousingName}
                  </Text>
                ) : null}
                {(selectedLivestockEntry?.breed || selectedLivestockEntry?.breedList?.length) && (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                    Breed:{' '}
                    {selectedLivestockEntry.breedList?.length
                      ? selectedLivestockEntry.breedList.join(', ')
                      : selectedLivestockEntry.breed}
                  </Text>
                )}
                {selectedLivestockEntry?.species === 'Chicken' && selectedLivestockEntry?.chickenCoopName ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                    Coop: {selectedLivestockEntry.chickenCoopName}
                  </Text>
                ) : null}
                {!!selectedLivestockEntry?.gender && (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                    Gender: {selectedLivestockEntry.gender}
                  </Text>
                )}
                {selectedLivestockEntry?.birthdate && (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                    Birthdate: {formatDisplayDate(selectedLivestockEntry.birthdate)}
                  </Text>
                )}
              </View>

              <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Weight</Text>
                {selectedLivestockEntry?.weightLogs?.length ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Last recorded: {selectedLivestockEntry.weightLogs[0].value} on{' '}
                    {formatDisplayDate(selectedLivestockEntry.weightLogs[0].date)}
                  </Text>
                ) : (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    No weight entries yet.
                  </Text>
                )}
                {selectedLivestockEntry?.weightLogs && selectedLivestockEntry.weightLogs.length > 1 && (
                  <Pressable onPress={() => toggleProfileSection('weight')} style={{ marginBottom: 6 }}>
                    <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>
                      {expandedProfileSections.includes('weight') ? 'Hide history' : 'Show more'}
                    </Text>
                  </Pressable>
                )}
                {expandedProfileSections.includes('weight') &&
                  selectedLivestockEntry?.weightLogs?.map((entry) => (
                    <Text key={entry.id} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                      {formatDisplayDate(entry.date)} • {entry.value}
                    </Text>
                  ))}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TextInput
                    placeholder="Weight"
                    value={profileWeightValue}
                    onChangeText={setProfileWeightValue}
                    keyboardType="numeric"
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
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {(['lb', 'kg', 'oz'] as const).map((unit) => (
                      <Pressable
                        key={unit}
                        onPress={() => setProfileWeightUnit(unit)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: profileWeightUnit === unit ? '#8B5E3C' : '#D7C9B7',
                          backgroundColor: profileWeightUnit === unit ? '#EADBCB' : '#FFFDF6',
                        }}
                      >
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{unit}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <TextInput
                  placeholder="Date (YYYY-MM-DD)"
                  value={profileWeightDate}
                  onChangeText={setProfileWeightDate}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <Pressable
                  onPress={addProfileWeightEntry}
                  style={{
                    backgroundColor: '#8B5E3C',
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Weight Entry</Text>
                </Pressable>
              </View>

              <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Deformities</Text>
                {selectedLivestockEntry?.deformityLogs?.length ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Last recorded: {selectedLivestockEntry.deformityLogs[0].notes} on{' '}
                    {formatDisplayDate(selectedLivestockEntry.deformityLogs[0].date)}
                  </Text>
                ) : selectedLivestockEntry?.deformities ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Notes: {selectedLivestockEntry.deformities}
                  </Text>
                ) : (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    No deformities logged.
                  </Text>
                )}
                {selectedLivestockEntry?.deformityLogs && selectedLivestockEntry.deformityLogs.length > 1 && (
                  <Pressable onPress={() => toggleProfileSection('deformities')} style={{ marginBottom: 6 }}>
                    <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>
                      {expandedProfileSections.includes('deformities') ? 'Hide history' : 'Show more'}
                    </Text>
                  </Pressable>
                )}
                {expandedProfileSections.includes('deformities') &&
                  selectedLivestockEntry?.deformityLogs?.map((entry) => (
                    <Text key={entry.id} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                      {formatDisplayDate(entry.date)} • {entry.notes}
                    </Text>
                  ))}
                <TextInput
                  placeholder="Deformity notes"
                  value={profileDeformityNotes}
                  onChangeText={setProfileDeformityNotes}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <TextInput
                  placeholder="Date (YYYY-MM-DD)"
                  value={profileDeformityDate}
                  onChangeText={setProfileDeformityDate}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <Pressable
                  onPress={addProfileDeformityEntry}
                  style={{
                    backgroundColor: '#8B5E3C',
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Deformity Entry</Text>
                </Pressable>
              </View>

              <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                  {selectedLivestockEntry?.species === 'Chicken' ? 'Claws trimmed' : 'Hoof trimming'}
                </Text>
                {selectedLivestockEntry?.hoofLogs?.length ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Last recorded: {formatDisplayDate(selectedLivestockEntry.hoofLogs[0].date)}
                  </Text>
                ) : (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    No trimming entries yet.
                  </Text>
                )}
                {selectedLivestockEntry?.hoofLogs && selectedLivestockEntry.hoofLogs.length > 1 && (
                  <Pressable onPress={() => toggleProfileSection('hoof')} style={{ marginBottom: 6 }}>
                    <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>
                      {expandedProfileSections.includes('hoof') ? 'Hide history' : 'Show more'}
                    </Text>
                  </Pressable>
                )}
                {expandedProfileSections.includes('hoof') &&
                  selectedLivestockEntry?.hoofLogs?.map((entry) => (
                    <Text key={entry.id} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                      {formatDisplayDate(entry.date)} • {entry.notes || 'Trim recorded'}
                    </Text>
                  ))}
                <TextInput
                  placeholder="Trim notes"
                  value={profileHoofNotes}
                  onChangeText={setProfileHoofNotes}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <TextInput
                  placeholder="Date (YYYY-MM-DD)"
                  value={profileHoofDate}
                  onChangeText={setProfileHoofDate}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <Pressable
                  onPress={addProfileHoofEntry}
                  style={{
                    backgroundColor: '#8B5E3C',
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Trim Entry</Text>
                </Pressable>
              </View>

              <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Wounds</Text>
                {selectedLivestockEntry?.woundLogs?.length ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Last recorded: {selectedLivestockEntry.woundLogs[0].notes || 'Wound recorded'} on{' '}
                    {formatDisplayDate(selectedLivestockEntry.woundLogs[0].date)}
                  </Text>
                ) : (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    No wounds logged.
                  </Text>
                )}
                {selectedLivestockEntry?.woundLogs && selectedLivestockEntry.woundLogs.length > 1 && (
                  <Pressable onPress={() => toggleProfileSection('wounds')} style={{ marginBottom: 6 }}>
                    <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>
                      {expandedProfileSections.includes('wounds') ? 'Hide history' : 'Show more'}
                    </Text>
                  </Pressable>
                )}
                {expandedProfileSections.includes('wounds') &&
                  selectedLivestockEntry?.woundLogs?.map((entry) => (
                    <Text key={entry.id} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                      {formatDisplayDate(entry.date)} • {entry.notes || 'Wound recorded'}
                    </Text>
                  ))}
                <TextInput
                  placeholder="Wound notes"
                  value={profileWoundNotes}
                  onChangeText={setProfileWoundNotes}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <TextInput
                  placeholder="Date (YYYY-MM-DD)"
                  value={profileWoundDate}
                  onChangeText={setProfileWoundDate}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <Pressable
                  onPress={addProfileWoundEntry}
                  style={{
                    backgroundColor: '#8B5E3C',
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Wound Entry</Text>
                </Pressable>
              </View>

              <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Vaccines</Text>
                {selectedLivestockEntry?.vaccineLogs?.length ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Last recorded: {selectedLivestockEntry.vaccineLogs[0].label || 'Vaccine'} on{' '}
                    {formatDisplayDate(selectedLivestockEntry.vaccineLogs[0].date)}
                  </Text>
                ) : (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    No vaccine entries yet.
                  </Text>
                )}
                {selectedLivestockEntry?.vaccineLogs && selectedLivestockEntry.vaccineLogs.length > 1 && (
                  <Pressable onPress={() => toggleProfileSection('vaccines')} style={{ marginBottom: 6 }}>
                    <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>
                      {expandedProfileSections.includes('vaccines') ? 'Hide history' : 'Show more'}
                    </Text>
                  </Pressable>
                )}
                {expandedProfileSections.includes('vaccines') &&
                  selectedLivestockEntry?.vaccineLogs?.map((entry) => (
                    <Text key={entry.id} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                      {formatDisplayDate(entry.date)} • {entry.label || 'Vaccine'}
                      {entry.notes ? ` • ${entry.notes}` : ''}
                    </Text>
                  ))}
                <TextInput
                  placeholder="Vaccine name"
                  value={profileVaccineName}
                  onChangeText={setProfileVaccineName}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <TextInput
                  placeholder="Date (YYYY-MM-DD)"
                  value={profileVaccineDate}
                  onChangeText={setProfileVaccineDate}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <TextInput
                  placeholder="Notes"
                  value={profileVaccineNotes}
                  onChangeText={setProfileVaccineNotes}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <Pressable
                  onPress={addProfileVaccineEntry}
                  style={{
                    backgroundColor: '#8B5E3C',
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Vaccine Entry</Text>
                </Pressable>
              </View>

              <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Worming</Text>
                {selectedLivestockEntry?.wormingLogs?.length ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Last recorded: {selectedLivestockEntry.wormingLogs[0].label || 'Worming'} on{' '}
                    {formatDisplayDate(selectedLivestockEntry.wormingLogs[0].date)}
                  </Text>
                ) : (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    No worming entries yet.
                  </Text>
                )}
                {selectedLivestockEntry?.wormingLogs && selectedLivestockEntry.wormingLogs.length > 1 && (
                  <Pressable onPress={() => toggleProfileSection('worming')} style={{ marginBottom: 6 }}>
                    <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>
                      {expandedProfileSections.includes('worming') ? 'Hide history' : 'Show more'}
                    </Text>
                  </Pressable>
                )}
                {expandedProfileSections.includes('worming') &&
                  selectedLivestockEntry?.wormingLogs?.map((entry) => (
                    <Text key={entry.id} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                      {formatDisplayDate(entry.date)} • {entry.label || 'Worming'}
                      {entry.notes ? ` • ${entry.notes}` : ''}
                    </Text>
                  ))}
                <TextInput
                  placeholder="Product"
                  value={profileWormingProduct}
                  onChangeText={setProfileWormingProduct}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <TextInput
                  placeholder="Date (YYYY-MM-DD)"
                  value={profileWormingDate}
                  onChangeText={setProfileWormingDate}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <TextInput
                  placeholder="Notes"
                  value={profileWormingNotes}
                  onChangeText={setProfileWormingNotes}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <Pressable
                  onPress={addProfileWormingEntry}
                  style={{
                    backgroundColor: '#8B5E3C',
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Worming Entry</Text>
                </Pressable>
              </View>

              <View style={{ borderWidth: 1, borderColor: '#E0D6C7', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Profit</Text>
                {selectedLivestockEntry?.profitEntries?.length ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Last recorded: {selectedLivestockEntry.profitEntries[0].type} • $
                    {selectedLivestockEntry.profitEntries[0].total || '0.00'} on{' '}
                    {formatDisplayDate(selectedLivestockEntry.profitEntries[0].date)}
                  </Text>
                ) : (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    No profit entries yet.
                  </Text>
                )}
                {selectedLivestockEntry?.profitEntries && selectedLivestockEntry.profitEntries.length > 1 && (
                  <Pressable onPress={() => toggleProfileSection('profit')} style={{ marginBottom: 6 }}>
                    <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>
                      {expandedProfileSections.includes('profit') ? 'Hide history' : 'Show more'}
                    </Text>
                  </Pressable>
                )}
                {expandedProfileSections.includes('profit') &&
                  selectedLivestockEntry?.profitEntries?.map((entry) => (
                    <Text key={entry.id} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                      {formatDisplayDate(entry.date)} • {entry.type} • Qty {entry.quantity} • $
                      {entry.total || '0.00'}
                      {entry.notes ? ` • ${entry.notes}` : ''}
                    </Text>
                  ))}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {(profitOptionsBySpecies[selectedLivestockEntry?.species ?? ''] ?? ['Other']).map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => {
                        if (profileProfitType === option) {
                          setProfileProfitType('');
                          setProfileProfitOther('');
                          return;
                        }
                        setProfileProfitType(option);
                        if (option !== 'Other') {
                          setProfileProfitOther('');
                        }
                      }}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: profileProfitType === option ? '#8B5E3C' : '#D7C9B7',
                        backgroundColor: profileProfitType === option ? '#EADBCB' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
                {profileProfitType === 'Other' && (
                  <TextInput
                    placeholder="Other (e.g., Petting Zoo)"
                    value={profileProfitOther}
                    onChangeText={setProfileProfitOther}
                    placeholderTextColor="#A89C8E"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 8,
                      padding: 10,
                      marginTop: 8,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                )}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TextInput
                    placeholder="Quantity"
                    value={profileProfitQuantity}
                    onChangeText={setProfileProfitQuantity}
                    keyboardType="numeric"
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
                  <TextInput
                    placeholder="Price per"
                    value={profileProfitPrice}
                    onChangeText={setProfileProfitPrice}
                    keyboardType="numeric"
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
                </View>
                {profileProfitQuantity && profileProfitPrice ? (
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 6 }}>
                    Total: ${(Number(profileProfitQuantity) * Number(profileProfitPrice)).toFixed(2)}
                  </Text>
                ) : null}
                <TextInput
                  placeholder="Date (YYYY-MM-DD)"
                  value={profileProfitDate}
                  onChangeText={setProfileProfitDate}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <TextInput
                  placeholder="Notes"
                  value={profileProfitNotes}
                  onChangeText={setProfileProfitNotes}
                  placeholderTextColor="#A89C8E"
                  style={{
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <Pressable
                  onPress={addProfileProfitEntry}
                  style={{
                    backgroundColor: '#8B5E3C',
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Add Profit Entry</Text>
                </Pressable>
              </View>
            </ScrollView>
            <Pressable
              onPress={() => setSelectedLivestockEntry(null)}
              style={{
                marginTop: 12,
                backgroundColor: '#C9B8A6',
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
