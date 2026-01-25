import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { isOnline, useStatusOverlay } from '../../../context/status-overlay';
import InfoButton from '../../../components/info-button';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sellOptions = [
  'Produce',
  'Eggs',
  'Dairy',
  'Meat cuts',
  'Baked goods',
  'Canned goods',
  'Herbs',
  'Plants',
  'Crafts',
  'Equipment',
  'Feed & supplies',
  'Livestock',
  'Other',
];

const serviceOptions = [
  'Classes',
  'Harvesting',
  'Transport',
  'Animal breeding',
  'Greenhouse starts',
  'Garden installs',
  'Mentoring',
  'Custom orders',
  'Other',
];

const yearsOptions = [
  'Just starting',
  '0-1 years',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10-20 years',
  '20+ years',
];

const listingCategories = [
  'Livestock',
  'Gardening',
  'Canned goods',
  'Baked goods',
  'Crafts',
  'Equipment',
  'Feed & supplies',
  'Services',
];

const listingSubcategories: Record<string, string[]> = {
  Livestock: ['Breeding stock', 'Eggs', 'Milk animals', 'Meat animals', 'Pets', 'Other'],
  Gardening: ['Seeds', 'Starts', 'Produce', 'Herbs', 'Flowers', 'Soil amendments'],
  'Canned goods': ['Jam', 'Pickles', 'Salsa', 'Sauces', 'Broths'],
  'Baked goods': ['Bread', 'Pies', 'Cookies', 'Cakes', 'Sourdough'],
  Crafts: ['Soaps', 'Candles', 'Textiles', 'Woodwork', 'Art'],
  Equipment: ['Tractors', 'Tillers', 'ATV/UTV', 'Tools', 'Fencing'],
  'Feed & supplies': ['Feed', 'Bedding', 'Minerals', 'Tack', 'Supplements'],
  Services: [
    'Animal breeding',
    'Transport',
    'Harvesting services',
    'Greenhouse',
    'Farm sitting',
    'Fence/building help',
  ],
};

export default function FarmStandScreen() {
  const { showStatus } = useStatusOverlay();
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [sellsSelections, setSellsSelections] = useState<string[]>([]);
  const [servicesSelections, setServicesSelections] = useState<string[]>([]);
  const [about, setAbout] = useState('');
  const [yearsRange, setYearsRange] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [showSellOptions, setShowSellOptions] = useState(false);
  const [showServiceOptions, setShowServiceOptions] = useState(false);
  const [showYearsOptions, setShowYearsOptions] = useState(false);
  const [listingView, setListingView] = useState<'create' | 'current' | null>(null);
  const [listingCategory, setListingCategory] = useState('');
  const [listingSubcategory, setListingSubcategory] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentSubcategories, setCurrentSubcategories] = useState<string[]>([]);
  const [showCurrentFilters, setShowCurrentFilters] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const toggleMulti = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const saveProfile = () => {
    if (!businessName.trim()) {
      showStatus('Add a business name', 'error', 1600);
      return;
    }
    if (sellsSelections.length === 0) {
      showStatus('Add what you sell', 'error', 1600);
      return;
    }
    if (!yearsRange.trim()) {
      showStatus('Select years homesteading', 'error', 1600);
      return;
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      showStatus('Enter a valid email', 'error', 1600);
      return;
    }
    if (!isOnline()) {
      showStatus('No internet, logs will not save', 'warning', 1800);
      return;
    }
    showStatus('Log saving...', 'info', 900);
    setProfileReady(true);
    void AsyncStorage.setItem('farm-stand:profile-ready', 'true');
    setTimeout(() => showStatus('Log saved', 'success', 1400), 900);
  };

  const resetDraftFields = () => {
    setBusinessName('');
    setSellsSelections([]);
    setServicesSelections([]);
    setAbout('');
    setYearsRange('');
    setEmail('');
    setPhone('');
    setWebsite('');
    setListingCategory('');
    setListingSubcategory('');
    setCurrentCategory('');
    setCurrentSubcategories([]);
  };

  const clearDraft = () => {
    Alert.alert('Clear draft?', 'This removes any in-progress profile data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          resetDraftFields();
          try {
            await AsyncStorage.removeItem('draft:farm-stand');
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
        const stored = await AsyncStorage.getItem('draft:farm-stand');
        if (!stored) {
          setDraftLoaded(true);
          return;
        }
        const draft = JSON.parse(stored);
        setBusinessName(draft.businessName ?? '');
        setSellsSelections(Array.isArray(draft.sellsSelections) ? draft.sellsSelections : []);
        setServicesSelections(Array.isArray(draft.servicesSelections) ? draft.servicesSelections : []);
        setAbout(draft.about ?? '');
        setYearsRange(draft.yearsRange ?? '');
        setEmail(draft.email ?? '');
        setPhone(draft.phone ?? '');
        setWebsite(draft.website ?? '');
        const storedReady = await AsyncStorage.getItem('farm-stand:profile-ready');
        setProfileReady(storedReady === 'true');
      } catch {
        // Ignore load errors.
      } finally {
        setDraftLoaded(true);
      }
    };
    void loadDraft();
  }, []);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }
    const persistDraft = async () => {
      try {
        await AsyncStorage.setItem(
          'draft:farm-stand',
          JSON.stringify({
            businessName,
            sellsSelections,
            servicesSelections,
            about,
            yearsRange,
            email,
            phone,
            website,
          })
        );
      } catch {
        // Ignore save errors.
      }
    };
    void persistDraft();
  }, [draftLoaded, businessName, sellsSelections, servicesSelections, about, yearsRange, email, phone, website]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F5F0E1' }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
      <Text
        style={{
          fontSize: 34,
          textAlign: 'center',
          color: '#3A2E24',
          marginTop: 8,
          marginBottom: 10,
          fontFamily: 'SedgwickAve',
        }}
      >
        The Farm Stand
      </Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <InfoButton text="The Farm Stand is where your homestead opens for business. List animals, goods, and services, and let neighbors find what you raise and make." />
      </View>

      {!profileReady ? (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 }}>
        <TextInput
          placeholder="Business name"
          value={businessName}
          onChangeText={setBusinessName}
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
          What you sell
        </Text>
        <Pressable
          onPress={() => setShowSellOptions((prev) => !prev)}
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
            {sellsSelections.length > 0 ? sellsSelections.join(', ') : 'Select what you sell'}
          </Text>
        </Pressable>
        {showSellOptions && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {sellOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => toggleMulti(option, setSellsSelections)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: sellsSelections.includes(option) ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: sellsSelections.includes(option) ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Services offered
        </Text>
        <Pressable
          onPress={() => setShowServiceOptions((prev) => !prev)}
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
            {servicesSelections.length > 0 ? servicesSelections.join(', ') : 'Select services'}
          </Text>
        </Pressable>
        {showServiceOptions && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {serviceOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => toggleMulti(option, setServicesSelections)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: servicesSelections.includes(option) ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: servicesSelections.includes(option) ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <TextInput
          placeholder="About us"
          value={about}
          onChangeText={setAbout}
          placeholderTextColor="#A89C8E"
          multiline
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            minHeight: 90,
            marginBottom: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />

        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Years homesteading
        </Text>
        <Pressable
          onPress={() => setShowYearsOptions((prev) => !prev)}
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
            {yearsRange || 'Select range'}
          </Text>
        </Pressable>
        {showYearsOptions && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {yearsOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setYearsRange((prev) => (prev === option ? '' : option));
                  setShowYearsOptions(false);
                }}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: yearsRange === option ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: yearsRange === option ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <TextInput
          placeholder="Contact email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#A89C8E"
          keyboardType="email-address"
          autoCapitalize="none"
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
          placeholder="Contact phone"
          value={phone}
          onChangeText={setPhone}
          placeholderTextColor="#A89C8E"
          keyboardType="phone-pad"
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
          placeholder="Website"
          value={website}
          onChangeText={setWebsite}
          placeholderTextColor="#A89C8E"
          autoCapitalize="none"
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

        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
          Build your profile, then add listings for what you offer.
        </Text>

          <Pressable
            onPress={saveProfile}
            style={{
              backgroundColor: '#8B5E3C',
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 12,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save Profile</Text>
          </Pressable>
          <Pressable onPress={clearDraft} style={{ alignItems: 'center', paddingVertical: 6 }}>
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Clear Draft</Text>
          </Pressable>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#E2D4C1',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 22, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                {businessName || 'Your Farm Stand'}
              </Text>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                Your business hub for listings, sales, and outreach.
              </Text>
            </View>
            <Pressable onPress={() => setShowProfileModal(true)}>
              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Edit</Text>
            </Pressable>
          </View>
          <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFF8EE',
                borderRadius: 12,
                padding: 10,
                borderWidth: 1,
                borderColor: '#E2D4C1',
              }}
            >
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>Active listings</Text>
              <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>0</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFF8EE',
                borderRadius: 12,
                padding: 10,
                borderWidth: 1,
                borderColor: '#E2D4C1',
              }}
            >
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>Sold this month</Text>
              <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>0</Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFF8EE',
                borderRadius: 12,
                padding: 10,
                borderWidth: 1,
                borderColor: '#E2D4C1',
              }}
            >
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 4 }}>Leads</Text>
              <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>0</Text>
            </View>
          </View>
        </View>
      )}

      {profileReady && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
            Business Dashboard
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Pressable
              onPress={() => router.push('/screens/waystation/the-trading-post')}
              style={{
                flexBasis: '48%',
                backgroundColor: '#EADBCB',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#D7C9B7',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 4 }}>Trading Post</Text>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                View how listings appear to buyers.
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/screens/homestead/the-log-book')}
              style={{
                flexBasis: '48%',
                backgroundColor: '#D8E6D2',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#C0D4BA',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 4 }}>Finances Log</Text>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                Track income, expenses, and sales.
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/screens/waystation/outpost-profile')}
              style={{
                flexBasis: '48%',
                backgroundColor: '#FFF1D6',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#E8D2A8',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 4 }}>Outpost Profile</Text>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                Edit your public business page.
              </Text>
            </Pressable>
            <View
              style={{
                flexBasis: '48%',
                backgroundColor: '#F6EEE1',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#E2D4C1',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 4 }}>Sales Tracker</Text>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                Sold items and payouts will appear here.
              </Text>
            </View>
          </View>
        </View>
      )}

      {profileReady && (
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Pressable
            onPress={() => setListingView('create')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: listingView === 'create' ? '#8B5E3C' : '#EFE4D4',
              borderWidth: 1,
              borderColor: '#D7C9B7',
            }}
          >
            <Text
              style={{ color: listingView === 'create' ? '#FFFFFF' : '#3A2E24', fontFamily: 'SedgwickAve' }}
            >
              Create a Listing
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setListingView('current')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: listingView === 'current' ? '#8B5E3C' : '#EFE4D4',
              borderWidth: 1,
              borderColor: '#D7C9B7',
            }}
          >
            <Text
              style={{ color: listingView === 'current' ? '#FFFFFF' : '#3A2E24', fontFamily: 'SedgwickAve' }}
            >
              Current Listings
            </Text>
          </Pressable>
        </View>
      )}

      {profileReady && listingView === 'create' && (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
            Choose a listing category
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {listingCategories.map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  setListingCategory(category);
                  setListingSubcategory('');
                }}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: listingCategory === category ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: listingCategory === category ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{category}</Text>
              </Pressable>
            ))}
          </View>
          {listingCategory && (
            <>
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                Choose a sub-selection
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                {(listingSubcategories[listingCategory] ?? []).map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setListingSubcategory((prev) => (prev === option ? '' : option))}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: listingSubcategory === option ? '#4C7744' : '#D7C9B7',
                      backgroundColor: listingSubcategory === option ? '#D8E6D2' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                Listing form fields will appear based on your selection.
              </Text>
            </>
          )}
        </View>
      )}

      {profileReady && listingView === 'current' && (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
            Browse your current listings by category
          </Text>
          <Pressable
            onPress={() => setShowCurrentFilters((prev) => !prev)}
            style={{
              alignSelf: 'flex-start',
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#D7C9B7',
              backgroundColor: '#FFF1D8',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              {showCurrentFilters ? 'Hide Filters' : 'Filters'}
            </Text>
          </Pressable>
          {showCurrentFilters && (
            <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {listingCategories.map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  setCurrentCategory((prev) => (prev === category ? '' : category));
                  setCurrentSubcategories([]);
                }}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: currentCategory === category ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: currentCategory === category ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{category}</Text>
              </Pressable>
            ))}
          </View>
          {currentCategory ? (
            <>
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
                Sub-selections
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                {(listingSubcategories[currentCategory] ?? []).map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => toggleMulti(option, setCurrentSubcategories)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: currentSubcategories.includes(option) ? '#4C7744' : '#D7C9B7',
                      backgroundColor: currentSubcategories.includes(option) ? '#D8E6D2' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                Your listings will show here once they are created.
              </Text>
            </>
          ) : (
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              Select a category to view listings and filters.
            </Text>
          )}
            </>
          )}
        </View>
      )}

      {profileReady && (
        <Modal
          visible={showProfileModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowProfileModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, maxHeight: '85%' }}>
              <Text style={{ fontSize: 18, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
                Edit Farm Stand Profile
              </Text>
              <ScrollView keyboardShouldPersistTaps="handled">
                <TextInput
                  placeholder="Business name"
                  value={businessName}
                  onChangeText={setBusinessName}
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
                  placeholder="About us"
                  value={about}
                  onChangeText={setAbout}
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
                  }}
                />
                <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                  What you sell
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {sellOptions.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => toggleMulti(option, setSellsSelections)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: sellsSelections.includes(option) ? '#8B5E3C' : '#D7C9B7',
                        backgroundColor: sellsSelections.includes(option) ? '#EADBCB' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                  Services offered
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {serviceOptions.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => toggleMulti(option, setServicesSelections)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: servicesSelections.includes(option) ? '#8B5E3C' : '#D7C9B7',
                        backgroundColor: servicesSelections.includes(option) ? '#EADBCB' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
                  Years homesteading
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {yearsOptions.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => setYearsRange((prev) => (prev === option ? '' : option))}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: yearsRange === option ? '#8B5E3C' : '#D7C9B7',
                        backgroundColor: yearsRange === option ? '#EADBCB' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  placeholder="Contact email"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#A89C8E"
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                  placeholder="Contact phone"
                  value={phone}
                  onChangeText={setPhone}
                  placeholderTextColor="#A89C8E"
                  keyboardType="phone-pad"
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
                  placeholder="Website"
                  value={website}
                  onChangeText={setWebsite}
                  placeholderTextColor="#A89C8E"
                  autoCapitalize="none"
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
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Pressable
                  onPress={() => {
                    saveProfile();
                    setShowProfileModal(false);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#8B5E3C',
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowProfileModal(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#EFE4D4',
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
