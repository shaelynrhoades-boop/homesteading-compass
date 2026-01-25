import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import CalendarWithYear from '../../../components/calendar-with-year';
import { TradingListing, useHomesteadData } from '../../../context/homestead-data';
import { isOnline, useStatusOverlay } from '../../../context/status-overlay';
import SafeImage from '../../../components/safe-image';
import InfoButton from '../../../components/info-button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDisplayDate } from '../../../lib/format-date';

type MarketListing = {
  id: string;
  title: string;
  price: string;
  category: string;
  badge?: string;
};

const detectCurrency = () => {
  try {
    return new Intl.NumberFormat().resolvedOptions().currency ?? 'USD';
  } catch {
    return 'USD';
  }
};

const calendarTheme = {
  backgroundColor: '#FFFDF6',
  calendarBackground: '#FFFDF6',
  textSectionTitleColor: '#4C7744',
  dayTextColor: '#3A2E24',
  todayTextColor: '#4C7744',
  monthTextColor: '#4C7744',
  arrowColor: '#4C7744',
  textMonthFontFamily: 'SedgwickAve',
  textDayHeaderFontFamily: 'SedgwickAve',
  textDayFontFamily: 'SedgwickAve',
  textDayFontSize: 14,
  textMonthFontSize: 16,
};

export default function TradingPostScreen() {
  const { tradingListings, addTradingListing, updateTradingListing, removeTradingListing } = useHomesteadData();
  const { showStatus } = useStatusOverlay();
  const [showListingModal, setShowListingModal] = useState(false);
  const [editingListing, setEditingListing] = useState<TradingListing | null>(null);
  const [listingTitle, setListingTitle] = useState('');
  const [listingDetails, setListingDetails] = useState('');
  const [listingCategory, setListingCategory] = useState('Produce');
  const [listingPrice, setListingPrice] = useState('');
  const [listingCurrency, setListingCurrency] = useState(() => detectCurrency());
  const [listingQuantity, setListingQuantity] = useState('');
  const [listingUnit, setListingUnit] = useState('');
  const [listingLocation, setListingLocation] = useState('');
  const [listingContact, setListingContact] = useState('');
  const [animalSpecies, setAnimalSpecies] = useState('');
  const [animalBreed, setAnimalBreed] = useState('');
  const [animalSex, setAnimalSex] = useState<'Male' | 'Female' | 'Mixed' | ''>('');
  const [animalAge, setAnimalAge] = useState('');
  const [animalPurpose, setAnimalPurpose] = useState('');
  const [animalHealth, setAnimalHealth] = useState('');
  const [produceType, setProduceType] = useState('');
  const [produceOrganic, setProduceOrganic] = useState<'Yes' | 'No' | ''>('');
  const [produceHarvestDate, setProduceHarvestDate] = useState('');
  const [showProduceCalendar, setShowProduceCalendar] = useState(false);
  const [produceSelections, setProduceSelections] = useState<string[]>([]);
  const [dairyType, setDairyType] = useState('');
  const [dairyAnimal, setDairyAnimal] = useState('');
  const [dairyTreatment, setDairyTreatment] = useState<'Raw' | 'Pasteurized' | ''>('');
  const [meatAnimal, setMeatAnimal] = useState('');
  const [meatCut, setMeatCut] = useState('');
  const [meatWeight, setMeatWeight] = useState('');
  const [meatFrozen, setMeatFrozen] = useState<'Yes' | 'No' | ''>('');
  const [bakedItem, setBakedItem] = useState('');
  const [bakedBatch, setBakedBatch] = useState('');
  const [bakedIngredients, setBakedIngredients] = useState('');
  const [bakedAllergens, setBakedAllergens] = useState('');
  const [craftItem, setCraftItem] = useState('');
  const [craftMaterials, setCraftMaterials] = useState('');
  const [craftSize, setCraftSize] = useState('');
  const [craftCustom, setCraftCustom] = useState<'Yes' | 'No' | ''>('');
  const [feedItem, setFeedItem] = useState('');
  const [feedBrand, setFeedBrand] = useState('');
  const [feedSpecies, setFeedSpecies] = useState('');
  const [feedBagSize, setFeedBagSize] = useState('');
  const [suppliesItem, setSuppliesItem] = useState('');
  const [suppliesCondition, setSuppliesCondition] = useState('');
  const [suppliesQuantity, setSuppliesQuantity] = useState('');
  const [hideAnimal, setHideAnimal] = useState('');
  const [hideTanned, setHideTanned] = useState<'Yes' | 'No' | ''>('');
  const [hideSize, setHideSize] = useState('');
  const [equipmentItem, setEquipmentItem] = useState('');
  const [equipmentCondition, setEquipmentCondition] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('');
  const [equipmentNotes, setEquipmentNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [draftLoaded, setDraftLoaded] = useState(false);

  const categories = ['All', 'Produce', 'Meat', 'Baked Goods', 'Crafts', 'Feed Store', 'Supplies', 'Hides', 'Misc'];
  const listingCategories = [
    'Animals',
    'Produce',
    'Dairy',
    'Meat Cuts',
    'Baked Goods',
    'Crafts',
    'Feed Store',
    'Supplies',
    'Hides',
    'Equipment',
    'Misc',
  ];
  const livestockSpecies = [
    'Chickens',
    'Ducks',
    'Turkeys',
    'Quail',
    'Rabbits',
    'Goats',
    'Sheep',
    'Cows',
    'Pigs',
    'Horses',
    'Bees',
    'Livestock Guardians',
  ];
  const unitOptions = ['each', 'dozen', 'lb', 'kg', 'oz', 'pint', 'quart', 'gallon', 'bundle', 'bale'];
  const dairyOptions = ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream'];
  const currencyOptions = ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'NZD'];
  const currencySymbols: Record<string, string> = {
    USD: '$',
    CAD: '$',
    GBP: '£',
    EUR: '€',
    AUD: '$',
    NZD: '$',
  };
  const produceOptions = ['Vegetables', 'Fruit', 'Herbs', 'Eggs', 'Honey', 'Milk', 'Cheese', 'Jams', 'Flowers'];
  const featuredListings: MarketListing[] = [
    { id: 'featured-produce', title: 'Farm Fresh Produce', price: '$10', category: 'Produce', badge: 'For Sale' },
    { id: 'featured-meat', title: 'Beef & Pork Cuts', price: '$30', category: 'Meat', badge: 'For Sale' },
    { id: 'featured-jam', title: 'Homemade Jam & Honey', price: '$25', category: 'Baked Goods', badge: 'For Sale' },
  ];
  const freshListings: MarketListing[] = [
    { id: 'fresh-noodles', title: 'Homemade Egg Noodles', price: '$8', category: 'Baked Goods' },
    { id: 'fresh-eggs', title: 'Free-Range Eggs', price: '$6', category: 'Produce' },
    { id: 'fresh-bread', title: 'Sourdough Bread', price: '$10', category: 'Baked Goods' },
    { id: 'fresh-milk', title: 'Fresh Cream & Milk', price: '$12', category: 'Produce' },
    { id: 'fresh-cheese', title: 'Farmstead Cheese', price: '$14', category: 'Produce' },
    { id: 'fresh-candles', title: 'Beeswax Candles', price: '$18', category: 'Crafts' },
  ];

  const filteredFeatured = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return featuredListings.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = !term || item.title.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [featuredListings, activeCategory, searchQuery]);

  const filteredFresh = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return freshListings.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = !term || item.title.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [freshListings, activeCategory, searchQuery]);

  const filteredUserListings = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return tradingListings.filter((item) => {
      if (!term) {
        return true;
      }
      return [item.title, item.details, item.source].some((value) =>
        value.toLowerCase().includes(term)
      );
    });
  }, [tradingListings, searchQuery]);

  const openCreateListing = () => {
    setEditingListing(null);
    setListingTitle('');
    setListingDetails('');
    setListingCategory('Produce');
    setListingPrice('');
    setListingCurrency(detectCurrency());
    setListingQuantity('');
    setListingUnit('');
    setListingLocation('');
    setListingContact('');
    setAnimalSpecies('');
    setAnimalBreed('');
    setAnimalSex('');
    setAnimalAge('');
    setAnimalPurpose('');
    setAnimalHealth('');
    setProduceType('');
    setProduceOrganic('');
    setProduceHarvestDate('');
    setShowProduceCalendar(false);
    setProduceSelections([]);
    setDairyType('');
    setDairyAnimal('');
    setDairyTreatment('');
    setMeatAnimal('');
    setMeatCut('');
    setMeatWeight('');
    setMeatFrozen('');
    setBakedItem('');
    setBakedBatch('');
    setBakedIngredients('');
    setBakedAllergens('');
    setCraftItem('');
    setCraftMaterials('');
    setCraftSize('');
    setCraftCustom('');
    setFeedItem('');
    setFeedBrand('');
    setFeedSpecies('');
    setFeedBagSize('');
    setSuppliesItem('');
    setSuppliesCondition('');
    setSuppliesQuantity('');
    setHideAnimal('');
    setHideTanned('');
    setHideSize('');
    setEquipmentItem('');
    setEquipmentCondition('');
    setEquipmentModel('');
    setEquipmentNotes('');
    setShowListingModal(true);
  };

  const openEditListing = (listing: TradingListing) => {
    setEditingListing(listing);
    setListingTitle(listing.title);
    setListingDetails(listing.details);
    setListingCategory('Misc');
    setShowListingModal(true);
  };

  const clearDraft = () => {
    Alert.alert('Clear draft?', 'This removes any in-progress listing data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          openCreateListing();
          try {
            await AsyncStorage.removeItem('draft:trading-post');
          } catch {
            // Ignore storage errors.
          }
        },
      },
    ]);
  };

  const saveListing = () => {
    if (!listingTitle.trim()) {
      showStatus('Log unable to save', 'error', 1400);
      return;
    }
    const numericPattern = /^\d+(\.\d+)?$/;
    if (listingPrice && !numericPattern.test(listingPrice.trim())) {
      showStatus('Enter a valid price', 'error', 1600);
      return;
    }
    if (listingQuantity && !numericPattern.test(listingQuantity.trim())) {
      showStatus('Enter a valid quantity', 'error', 1600);
      return;
    }
    if (listingCategory === 'Animals' && !animalSpecies) {
      showStatus('Select a species', 'error', 1600);
      return;
    }
    if (listingCategory === 'Produce' && produceSelections.length === 0 && !produceType.trim()) {
      showStatus('Select produce type', 'error', 1600);
      return;
    }
    if (listingCategory === 'Dairy' && !dairyType.trim()) {
      showStatus('Select a dairy type', 'error', 1600);
      return;
    }
    if (listingCategory === 'Meat Cuts' && !meatCut.trim()) {
      showStatus('Select a meat cut', 'error', 1600);
      return;
    }
    if (listingCategory === 'Baked Goods' && !bakedItem.trim()) {
      showStatus('Add a baked item', 'error', 1600);
      return;
    }
    if (listingCategory === 'Crafts' && !craftItem.trim()) {
      showStatus('Add a craft item', 'error', 1600);
      return;
    }
    if (listingCategory === 'Feed Store' && !feedItem.trim()) {
      showStatus('Add a feed item', 'error', 1600);
      return;
    }
    if (listingCategory === 'Supplies' && !suppliesItem.trim()) {
      showStatus('Add a supply item', 'error', 1600);
      return;
    }
    if (listingCategory === 'Hides' && !hideAnimal.trim()) {
      showStatus('Select a hide animal', 'error', 1600);
      return;
    }
    if (listingCategory === 'Equipment' && !equipmentItem.trim()) {
      showStatus('Add an equipment item', 'error', 1600);
      return;
    }
    if (!isOnline()) {
      showStatus('No internet, logs will not save', 'warning', 1800);
      return;
    }
    showStatus('Log saving...', 'info', 900);
    const buildDetails = () => {
      const detailLines = [
        listingCategory && `Category: ${listingCategory}`,
        listingPrice && `Price: ${currencySymbols[listingCurrency] ?? ''}${listingPrice} ${listingCurrency}`,
        listingQuantity && `Quantity: ${listingQuantity}${listingUnit ? ` ${listingUnit}` : ''}`,
        listingLocation && `Location: ${listingLocation}`,
        listingContact && `Contact: ${listingContact}`,
        listingCategory === 'Animals' && animalSpecies && `Species: ${animalSpecies}`,
        listingCategory === 'Animals' && animalBreed && `Breed: ${animalBreed}`,
        listingCategory === 'Animals' && animalSex && `Sex: ${animalSex}`,
        listingCategory === 'Animals' && animalAge && `Age: ${animalAge}`,
        listingCategory === 'Animals' && animalPurpose && `Purpose: ${animalPurpose}`,
        listingCategory === 'Animals' && animalHealth && `Health: ${animalHealth}`,
        listingCategory === 'Produce' &&
          (produceSelections.length > 0 ? `Produce: ${produceSelections.join(', ')}` : produceType) &&
          `Produce: ${produceSelections.length > 0 ? produceSelections.join(', ') : produceType}`,
        listingCategory === 'Produce' && produceOrganic && `Organic: ${produceOrganic}`,
        listingCategory === 'Produce' && produceHarvestDate && `Harvested: ${produceHarvestDate}`,
        listingCategory === 'Dairy' && dairyType && `Dairy type: ${dairyType}`,
        listingCategory === 'Dairy' && dairyAnimal && `From: ${dairyAnimal}`,
        listingCategory === 'Dairy' && dairyTreatment && `Treatment: ${dairyTreatment}`,
        listingCategory === 'Meat Cuts' && meatAnimal && `Animal: ${meatAnimal}`,
        listingCategory === 'Meat Cuts' && meatCut && `Cut: ${meatCut}`,
        listingCategory === 'Meat Cuts' && meatWeight && `Weight: ${meatWeight}`,
        listingCategory === 'Meat Cuts' && meatFrozen && `Frozen: ${meatFrozen}`,
        listingCategory === 'Baked Goods' && bakedItem && `Item: ${bakedItem}`,
        listingCategory === 'Baked Goods' && bakedBatch && `Batch size: ${bakedBatch}`,
        listingCategory === 'Baked Goods' && bakedIngredients && `Ingredients: ${bakedIngredients}`,
        listingCategory === 'Baked Goods' && bakedAllergens && `Allergens: ${bakedAllergens}`,
        listingCategory === 'Crafts' && craftItem && `Item: ${craftItem}`,
        listingCategory === 'Crafts' && craftMaterials && `Materials: ${craftMaterials}`,
        listingCategory === 'Crafts' && craftSize && `Size: ${craftSize}`,
        listingCategory === 'Crafts' && craftCustom && `Custom: ${craftCustom}`,
        listingCategory === 'Feed Store' && feedItem && `Feed: ${feedItem}`,
        listingCategory === 'Feed Store' && feedBrand && `Brand: ${feedBrand}`,
        listingCategory === 'Feed Store' && feedSpecies && `For: ${feedSpecies}`,
        listingCategory === 'Feed Store' && feedBagSize && `Bag size: ${feedBagSize}`,
        listingCategory === 'Supplies' && suppliesItem && `Item: ${suppliesItem}`,
        listingCategory === 'Supplies' && suppliesCondition && `Condition: ${suppliesCondition}`,
        listingCategory === 'Supplies' && suppliesQuantity && `Quantity: ${suppliesQuantity}`,
        listingCategory === 'Hides' && hideAnimal && `Animal: ${hideAnimal}`,
        listingCategory === 'Hides' && hideTanned && `Tanned: ${hideTanned}`,
        listingCategory === 'Hides' && hideSize && `Size: ${hideSize}`,
        listingCategory === 'Equipment' && equipmentItem && `Item: ${equipmentItem}`,
        listingCategory === 'Equipment' && equipmentCondition && `Condition: ${equipmentCondition}`,
        listingCategory === 'Equipment' && equipmentModel && `Model: ${equipmentModel}`,
        listingCategory === 'Equipment' && equipmentNotes && `Notes: ${equipmentNotes}`,
      ]
        .filter(Boolean)
        .join('\n');
      if (listingDetails.trim()) {
        return detailLines ? `${detailLines}\n${listingDetails.trim()}` : listingDetails.trim();
      }
      return detailLines;
    };
    const nextListing: TradingListing = {
      id: editingListing?.id ?? `${Date.now()}`,
      title: listingTitle.trim(),
      details: buildDetails(),
      source: editingListing?.source ?? 'Manual Listing',
      date: editingListing?.date ?? new Date().toISOString().slice(0, 10),
    };
    if (editingListing) {
      updateTradingListing(nextListing);
    } else {
      addTradingListing(nextListing);
    }
    setShowListingModal(false);
    setEditingListing(null);
    setListingTitle('');
    setListingDetails('');
    setTimeout(() => showStatus('Log saved', 'success', 1400), 900);
  };

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const stored = await AsyncStorage.getItem('draft:trading-post');
        if (!stored) {
          setDraftLoaded(true);
          return;
        }
        const draft = JSON.parse(stored);
        setListingTitle(draft.listingTitle ?? '');
        setListingDetails(draft.listingDetails ?? '');
        setListingCategory(draft.listingCategory ?? 'Produce');
        setListingPrice(draft.listingPrice ?? '');
        setListingCurrency(draft.listingCurrency ?? detectCurrency());
        setListingQuantity(draft.listingQuantity ?? '');
        setListingUnit(draft.listingUnit ?? '');
        setListingLocation(draft.listingLocation ?? '');
        setListingContact(draft.listingContact ?? '');
        setAnimalSpecies(draft.animalSpecies ?? '');
        setAnimalBreed(draft.animalBreed ?? '');
        setAnimalSex(draft.animalSex ?? '');
        setAnimalAge(draft.animalAge ?? '');
        setAnimalPurpose(draft.animalPurpose ?? '');
        setAnimalHealth(draft.animalHealth ?? '');
        setProduceType(draft.produceType ?? '');
        setProduceOrganic(draft.produceOrganic ?? '');
        setProduceHarvestDate(draft.produceHarvestDate ?? '');
        setProduceSelections(Array.isArray(draft.produceSelections) ? draft.produceSelections : []);
        setDairyType(draft.dairyType ?? '');
        setDairyAnimal(draft.dairyAnimal ?? '');
        setDairyTreatment(draft.dairyTreatment ?? '');
        setMeatAnimal(draft.meatAnimal ?? '');
        setMeatCut(draft.meatCut ?? '');
        setMeatWeight(draft.meatWeight ?? '');
        setMeatFrozen(draft.meatFrozen ?? '');
        setBakedItem(draft.bakedItem ?? '');
        setBakedBatch(draft.bakedBatch ?? '');
        setBakedIngredients(draft.bakedIngredients ?? '');
        setBakedAllergens(draft.bakedAllergens ?? '');
        setCraftItem(draft.craftItem ?? '');
        setCraftMaterials(draft.craftMaterials ?? '');
        setCraftSize(draft.craftSize ?? '');
        setCraftCustom(draft.craftCustom ?? '');
        setFeedItem(draft.feedItem ?? '');
        setFeedBrand(draft.feedBrand ?? '');
        setFeedSpecies(draft.feedSpecies ?? '');
        setFeedBagSize(draft.feedBagSize ?? '');
        setSuppliesItem(draft.suppliesItem ?? '');
        setSuppliesCondition(draft.suppliesCondition ?? '');
        setSuppliesQuantity(draft.suppliesQuantity ?? '');
        setHideAnimal(draft.hideAnimal ?? '');
        setHideTanned(draft.hideTanned ?? '');
        setHideSize(draft.hideSize ?? '');
        setEquipmentItem(draft.equipmentItem ?? '');
        setEquipmentCondition(draft.equipmentCondition ?? '');
        setEquipmentModel(draft.equipmentModel ?? '');
        setEquipmentNotes(draft.equipmentNotes ?? '');
      } catch {
        // Ignore draft load errors.
      } finally {
        setDraftLoaded(true);
      }
    };
    void loadDraft();
  }, []);

  useEffect(() => {
    if (!draftLoaded || editingListing) {
      return;
    }
    const persistDraft = async () => {
      try {
        await AsyncStorage.setItem(
          'draft:trading-post',
          JSON.stringify({
            listingTitle,
            listingDetails,
            listingCategory,
            listingPrice,
            listingCurrency,
            listingQuantity,
            listingUnit,
            listingLocation,
            listingContact,
            animalSpecies,
            animalBreed,
            animalSex,
            animalAge,
            animalPurpose,
            animalHealth,
            produceType,
            produceOrganic,
            produceHarvestDate,
            produceSelections,
            dairyType,
            dairyAnimal,
            dairyTreatment,
            meatAnimal,
            meatCut,
            meatWeight,
            meatFrozen,
            bakedItem,
            bakedBatch,
            bakedIngredients,
            bakedAllergens,
            craftItem,
            craftMaterials,
            craftSize,
            craftCustom,
            feedItem,
            feedBrand,
            feedSpecies,
            feedBagSize,
            suppliesItem,
            suppliesCondition,
            suppliesQuantity,
            hideAnimal,
            hideTanned,
            hideSize,
            equipmentItem,
            equipmentCondition,
            equipmentModel,
            equipmentNotes,
          })
        );
      } catch {
        // Ignore draft save errors.
      }
    };
    void persistDraft();
  }, [
    draftLoaded,
    editingListing,
    listingTitle,
    listingDetails,
    listingCategory,
    listingPrice,
    listingCurrency,
    listingQuantity,
    listingUnit,
    listingLocation,
    listingContact,
    animalSpecies,
    animalBreed,
    animalSex,
    animalAge,
    animalPurpose,
    animalHealth,
    produceType,
    produceOrganic,
    produceHarvestDate,
    produceSelections,
    dairyType,
    dairyAnimal,
    dairyTreatment,
    meatAnimal,
    meatCut,
    meatWeight,
    meatFrozen,
    bakedItem,
    bakedBatch,
    bakedIngredients,
    bakedAllergens,
    craftItem,
    craftMaterials,
    craftSize,
    craftCustom,
    feedItem,
    feedBrand,
    feedSpecies,
    feedBagSize,
    suppliesItem,
    suppliesCondition,
    suppliesQuantity,
    hideAnimal,
    hideTanned,
    hideSize,
    equipmentItem,
    equipmentCondition,
    equipmentModel,
    equipmentNotes,
  ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#E8D9C6' }} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View
        style={{
          backgroundColor: '#B47E4D',
          paddingTop: 0,
          paddingHorizontal: 0,
          paddingBottom: 16,
          borderBottomWidth: 4,
          borderBottomColor: '#6B4E3D',
        }}
      >
        <SafeImage
          source={require('../../assets/HCIcons/Icon_Waystation/TradingPostPageTop.png')}
          style={{ width: '100%', height: 200 }}
          resizeMode="cover"
        />
        <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
          <Text
            style={{
              fontSize: 14,
              textAlign: 'center',
              color: '#F7E9D4',
              fontFamily: 'SedgwickAve',
            }}
          >
            A rustic marketplace for homestead goods, trades, and local finds.
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
          <InfoButton text="List goods for sale or browse local listings from nearby homesteads. Connects to: Log Book." />
        </View>
        <Pressable
          onPress={openCreateListing}
          style={{
            backgroundColor: '#6B4E3D',
            paddingVertical: 10,
            borderRadius: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#3A2E24',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#F7E9D4', fontFamily: 'SedgwickAve' }}>Create Listing</Text>
        </Pressable>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F7E9D4',
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: '#C8B09A',
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
          <TextInput
            placeholder="Search listings..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8D7764"
            style={{
              flex: 1,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
              paddingVertical: 4,
            }}
          />
          <Pressable
            style={{
              backgroundColor: '#D9C2A5',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#A88C70',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Filters</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {categories.map((category) => {
              const selected = activeCategory === category;
              return (
                <Pressable
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selected ? '#3A2E24' : '#A88C70',
                    backgroundColor: selected ? '#6B4E3D' : '#D9C2A5',
                  }}
                >
                  <Text style={{ color: selected ? '#F7E9D4' : '#3A2E24', fontFamily: 'SedgwickAve' }}>
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Featured Listings</Text>
          <View style={{ height: 2, width: 120, backgroundColor: '#A88C70', marginTop: 4 }} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {filteredFeatured.map((listing) => (
            <View
              key={listing.id}
              style={{
                width: '48%',
                backgroundColor: '#6F4A33',
                borderRadius: 16,
                padding: 4,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: '#3A2E24',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  top: 6,
                  left: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  top: 6,
                  right: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  bottom: 6,
                  left: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  bottom: 6,
                  right: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  backgroundColor: '#FFF1D8',
                  borderRadius: 14,
                  padding: 12,
                  borderWidth: 1.5,
                  borderColor: '#D8C4A8',
                  borderStyle: 'dashed',
                }}
              >
              <View
                style={{
                  height: 130,
                  backgroundColor: '#F3E1C9',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D8C4A8',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  position: 'relative',
                }}
              >
                <Text style={{ fontSize: 24 }}>🧺</Text>
                {listing.badge && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -6,
                      left: 8,
                      backgroundColor: '#6B4E3D',
                      paddingVertical: 2,
                      paddingHorizontal: 6,
                      borderRadius: 6,
                      transform: [{ rotate: '-6deg' }],
                    }}
                  >
                    <Text style={{ color: '#F7E9D4', fontFamily: 'SedgwickAve', fontSize: 10 }}>
                      {listing.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 14, marginBottom: 6 }}>
                {listing.title}
              </Text>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#6B4E3D',
                  borderRadius: 10,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#F7E9D4', fontFamily: 'SedgwickAve' }}>{listing.price}</Text>
              </View>
              <Pressable
                style={{
                  backgroundColor: '#B47E4D',
                  paddingVertical: 6,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#F7E9D4', fontFamily: 'SedgwickAve' }}>View Listing</Text>
              </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Fresh Listings</Text>
          <View style={{ height: 2, width: 100, backgroundColor: '#A88C70', marginTop: 4 }} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {filteredFresh.map((listing) => (
            <View
              key={listing.id}
              style={{
                width: '48%',
                backgroundColor: '#6F4A33',
                borderRadius: 16,
                padding: 4,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: '#3A2E24',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  top: 6,
                  left: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  top: 6,
                  right: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  bottom: 6,
                  left: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  bottom: 6,
                  right: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  backgroundColor: '#FFF1D8',
                  borderRadius: 14,
                  padding: 12,
                  borderWidth: 1.5,
                  borderColor: '#D8C4A8',
                  borderStyle: 'dashed',
                }}
              >
              <View
                style={{
                  height: 110,
                  backgroundColor: '#F3E1C9',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D8C4A8',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 24 }}>🍞</Text>
              </View>
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 14, marginBottom: 6 }}>
                {listing.title}
              </Text>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#6B4E3D',
                  borderRadius: 10,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#F7E9D4', fontFamily: 'SedgwickAve' }}>{listing.price}</Text>
              </View>
              <Pressable
                style={{
                  backgroundColor: '#B47E4D',
                  paddingVertical: 6,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#F7E9D4', fontFamily: 'SedgwickAve' }}>View Listing</Text>
              </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Your Listings</Text>
          <View style={{ height: 2, width: 110, backgroundColor: '#A88C70', marginTop: 4 }} />
        </View>
        <Pressable
          onPress={openCreateListing}
          style={{
            backgroundColor: '#6B4E3D',
            paddingVertical: 10,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#3A2E24',
          }}
        >
          <Text style={{ color: '#F7E9D4', fontFamily: 'SedgwickAve' }}>Create Listing</Text>
        </Pressable>
        {filteredUserListings.length === 0 ? (
          <View style={{ backgroundColor: '#FFF1D8', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#D8C4A8' }}>
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              No listings yet. Tap Create Listing or use “List in Trading Post” from a livestock log.
            </Text>
            <Pressable
              onPress={openCreateListing}
              style={{
                backgroundColor: '#8B5E3C',
                paddingVertical: 8,
                borderRadius: 10,
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Create Listing</Text>
            </Pressable>
          </View>
        ) : (
          filteredUserListings.map((listing) => (
            <View
              key={listing.id}
              style={{
                backgroundColor: '#6F4A33',
                borderWidth: 2,
                borderColor: '#3A2E24',
                borderRadius: 14,
                padding: 4,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  top: 6,
                  left: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  top: 6,
                  right: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  bottom: 6,
                  left: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C9B8A6',
                  bottom: 6,
                  right: 6,
                  borderWidth: 1,
                  borderColor: '#6B4E3D',
                }}
              />
              <View
                style={{
                  backgroundColor: '#FFF1D8',
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1.5,
                  borderColor: '#D8C4A8',
                  borderStyle: 'dashed',
                }}
              >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 16 }}>
                {listing.title}
              </Text>
              {!!listing.details && (
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  {listing.details}
                </Text>
              )}
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 2 }}>
                {formatDisplayDate(listing.date)} • {listing.source}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Pressable onPress={() => openEditListing(listing)}>
                  <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert('Remove listing?', 'This will delete the listing.', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => removeTradingListing(listing.id),
                      },
                    ])
                  }
                >
                  <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve' }}>Remove</Text>
                </Pressable>
              </View>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal
        visible={showListingModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowListingModal(false)}
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
              maxHeight: '90%',
            }}
          >
            <ScrollView>
              <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                {editingListing ? 'Edit Listing' : 'Create Listing'}
              </Text>
              {!editingListing && (
                <Pressable
                  onPress={clearDraft}
                  style={{
                    alignSelf: 'flex-start',
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    backgroundColor: '#FFF7E6',
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Clear Draft</Text>
                </Pressable>
              )}
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {listingCategories.map((category) => {
                    const selected = listingCategory === category;
                    return (
                      <Pressable
                        key={category}
                        onPress={() => setListingCategory(category)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 12,
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
              </ScrollView>
              <TextInput
                placeholder="Listing title"
                value={listingTitle}
                onChangeText={setListingTitle}
                placeholderTextColor="#A08974"
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 10,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                  backgroundColor: '#FFFDF6',
                }}
              />
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: '#FFFDF6',
                  minWidth: 48,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                  {currencySymbols[listingCurrency] ?? '$'}
                </Text>
              </View>
              <TextInput
                placeholder="Price"
                value={listingPrice}
                onChangeText={setListingPrice}
                placeholderTextColor="#A08974"
                keyboardType="numeric"
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 10,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                  backgroundColor: '#FFFDF6',
                }}
              />
            </View>
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Currency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {currencyOptions.map((currency) => {
                  const selected = listingCurrency === currency;
                  return (
                    <Pressable
                      key={currency}
                      onPress={() => setListingCurrency(currency)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                        backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{currency}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <TextInput
                  placeholder="Quantity"
                  value={listingQuantity}
                  onChangeText={setListingQuantity}
                  placeholderTextColor="#A08974"
                  keyboardType="numeric"
                  style={{
                    width: 90,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 10,
                    color: '#3A2E24',
                    fontFamily: 'SedgwickAve',
                    backgroundColor: '#FFFDF6',
                  }}
                />
                <View style={{ flex: 1, marginBottom: 10 }}>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Unit</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {unitOptions.map((unit) => {
                      const selected = listingUnit === unit;
                      return (
                        <Pressable
                          key={unit}
                          onPress={() => setListingUnit(selected ? '' : unit)}
                          style={{
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                            {unit}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
              <TextInput
                placeholder="Pickup location"
                value={listingLocation}
                onChangeText={setListingLocation}
                placeholderTextColor="#A08974"
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 10,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                  backgroundColor: '#FFFDF6',
                }}
              />
              <Pressable
                onPress={() => setListingLocation('Current location (GPS)')}
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  paddingVertical: 8,
                  alignItems: 'center',
                  marginBottom: 10,
                  backgroundColor: '#F7E9D4',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Use current location (GPS)</Text>
              </Pressable>
              <TextInput
                placeholder="Contact info"
                value={listingContact}
                onChangeText={setListingContact}
                placeholderTextColor="#A08974"
                keyboardType="phone-pad"
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 10,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                  backgroundColor: '#FFFDF6',
                }}
              />

              {listingCategory === 'Animals' && (
                <>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Species</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {livestockSpecies.map((species) => {
                      const selected = animalSpecies === species;
                      return (
                        <Pressable
                          key={species}
                          onPress={() => setAnimalSpecies(selected ? '' : species)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{species}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TextInput
                    placeholder="Breed"
                    value={animalBreed}
                    onChangeText={setAnimalBreed}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Sex</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    {(['Male', 'Female', 'Mixed'] as const).map((value) => {
                      const selected = animalSex === value;
                      return (
                        <Pressable
                          key={value}
                          onPress={() => setAnimalSex(selected ? '' : value)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TextInput
                    placeholder="Age"
                    value={animalAge}
                    onChangeText={setAnimalAge}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Purpose (dairy, fiber, meat, breeding)"
                    value={animalPurpose}
                    onChangeText={setAnimalPurpose}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Health notes"
                    value={animalHealth}
                    onChangeText={setAnimalHealth}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                </>
              )}

              {listingCategory === 'Produce' && (
                <>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Produce type
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {produceOptions.map((option) => {
                      const selected = produceSelections.includes(option);
                      return (
                        <Pressable
                          key={option}
                          onPress={() =>
                            setProduceSelections((prev) =>
                              prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
                            )
                          }
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
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Organic</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    {(['Yes', 'No'] as const).map((value) => {
                      const selected = produceOrganic === value;
                      return (
                        <Pressable
                          key={value}
                          onPress={() => setProduceOrganic(selected ? '' : value)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Pressable
                    onPress={() => setShowProduceCalendar((prev) => !prev)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      backgroundColor: '#FFFDF6',
                    }}
                  >
                    <Text style={{ color: produceHarvestDate ? '#3A2E24' : '#A08974', fontFamily: 'SedgwickAve' }}>
                      {produceHarvestDate || 'Harvest date'}
                    </Text>
                  </Pressable>
                  {showProduceCalendar && (
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#D7C9B7',
                        borderRadius: 10,
                        overflow: 'hidden',
                        marginBottom: 10,
                        backgroundColor: '#FFFDF6',
                      }}
                    >
                      <CalendarWithYear
                        onDayPress={(day) => {
                          setProduceHarvestDate(day.dateString);
                          setShowProduceCalendar(false);
                        }}
                        markedDates={
                          produceHarvestDate
                            ? {
                                [produceHarvestDate]: {
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

              {listingCategory === 'Dairy' && (
                <>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Dairy product
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {dairyOptions.map((option) => {
                      const selected = dairyType === option;
                      return (
                        <Pressable
                          key={option}
                          onPress={() => setDairyType(selected ? '' : option)}
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
                  <TextInput
                    placeholder="From animal (cow, goat, sheep)"
                    value={dairyAnimal}
                    onChangeText={setDairyAnimal}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Treatment</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    {(['Raw', 'Pasteurized'] as const).map((value) => {
                      const selected = dairyTreatment === value;
                      return (
                        <Pressable
                          key={value}
                          onPress={() => setDairyTreatment(selected ? '' : value)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {listingCategory === 'Meat Cuts' && (
                <>
                  <TextInput
                    placeholder="Animal (rabbit, chicken, beef)"
                    value={meatAnimal}
                    onChangeText={setMeatAnimal}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Cut (whole chicken, pork chops)"
                    value={meatCut}
                    onChangeText={setMeatCut}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Weight (ex: 12 lb)"
                    value={meatWeight}
                    onChangeText={setMeatWeight}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Frozen</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    {(['Yes', 'No'] as const).map((value) => {
                      const selected = meatFrozen === value;
                      return (
                        <Pressable
                          key={value}
                          onPress={() => setMeatFrozen(selected ? '' : value)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {listingCategory === 'Baked Goods' && (
                <>
                  <TextInput
                    placeholder="Item (bread, cookies)"
                    value={bakedItem}
                    onChangeText={setBakedItem}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Batch size"
                    value={bakedBatch}
                    onChangeText={setBakedBatch}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Key ingredients"
                    value={bakedIngredients}
                    onChangeText={setBakedIngredients}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Allergens"
                    value={bakedAllergens}
                    onChangeText={setBakedAllergens}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                </>
              )}

              {listingCategory === 'Crafts' && (
                <>
                  <TextInput
                    placeholder="Craft item"
                    value={craftItem}
                    onChangeText={setCraftItem}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Materials"
                    value={craftMaterials}
                    onChangeText={setCraftMaterials}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Size / dimensions"
                    value={craftSize}
                    onChangeText={setCraftSize}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                    Custom orders
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    {(['Yes', 'No'] as const).map((value) => {
                      const selected = craftCustom === value;
                      return (
                        <Pressable
                          key={value}
                          onPress={() => setCraftCustom(selected ? '' : value)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {listingCategory === 'Feed Store' && (
                <>
                  <TextInput
                    placeholder="Feed item"
                    value={feedItem}
                    onChangeText={setFeedItem}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Brand"
                    value={feedBrand}
                    onChangeText={setFeedBrand}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="For species"
                    value={feedSpecies}
                    onChangeText={setFeedSpecies}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Bag size"
                    value={feedBagSize}
                    onChangeText={setFeedBagSize}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                </>
              )}

              {listingCategory === 'Supplies' && (
                <>
                  <TextInput
                    placeholder="Supply item"
                    value={suppliesItem}
                    onChangeText={setSuppliesItem}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Condition"
                    value={suppliesCondition}
                    onChangeText={setSuppliesCondition}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Quantity"
                    value={suppliesQuantity}
                    onChangeText={setSuppliesQuantity}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                </>
              )}

              {listingCategory === 'Hides' && (
                <>
                  <TextInput
                    placeholder="Animal (cow, goat, deer)"
                    value={hideAnimal}
                    onChangeText={setHideAnimal}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Tanned</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    {(['Yes', 'No'] as const).map((value) => {
                      const selected = hideTanned === value;
                      return (
                        <Pressable
                          key={value}
                          onPress={() => setHideTanned(selected ? '' : value)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                            backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TextInput
                    placeholder="Hide size"
                    value={hideSize}
                    onChangeText={setHideSize}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                </>
              )}

              {listingCategory === 'Equipment' && (
                <>
                  <TextInput
                    placeholder="Equipment item"
                    value={equipmentItem}
                    onChangeText={setEquipmentItem}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Condition"
                    value={equipmentCondition}
                    onChangeText={setEquipmentCondition}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Model / brand"
                    value={equipmentModel}
                    onChangeText={setEquipmentModel}
                    placeholderTextColor="#A08974"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                  <TextInput
                    placeholder="Notes"
                    value={equipmentNotes}
                    onChangeText={setEquipmentNotes}
                    placeholderTextColor="#A08974"
                    multiline
                    style={{
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      color: '#3A2E24',
                      fontFamily: 'SedgwickAve',
                      backgroundColor: '#FFFDF6',
                    }}
                  />
                </>
              )}

              <TextInput
                placeholder="Extra notes"
                value={listingDetails}
                onChangeText={setListingDetails}
                placeholderTextColor="#A08974"
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  padding: 10,
                  minHeight: 90,
                  marginBottom: 12,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                  backgroundColor: '#FFFDF6',
                }}
              />
              <Pressable
                onPress={saveListing}
                style={{
                  backgroundColor: '#8B5E3C',
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>
                  {editingListing ? 'Save Listing' : 'Add Listing'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowListingModal(false)}
                style={{ alignItems: 'center', paddingVertical: 4 }}
              >
                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
