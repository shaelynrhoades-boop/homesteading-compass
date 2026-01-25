import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import SafeImage from '../../../components/safe-image';
import InfoButton from '../../../components/info-button';
import { router } from 'expo-router';
import { useHomesteadData } from '../../../context/homestead-data';

type BusinessType = 'Mom & Pops' | 'Small Business' | 'Commercial';

const businessTypes: Array<BusinessType | 'All'> = ['All', 'Mom & Pops', 'Small Business', 'Commercial'];
const outpostCategories = ['All', 'Farm Stands', 'Farm Services', 'Crafts & Goods', 'Livestock Breeders'];
const offerFilters = [
  'Farm Stands',
  'Farm Services',
  'Crafts & Goods',
  'Livestock Breeders',
  'Feed Store',
  'Supplies',
  'Equipment',
];
const livestockOptions = [
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
const farmServiceOptions = ['Floating', 'Farrier', 'Goat Trimming', 'Cow Trimming', 'Sheep Shearing', 'Vet Visits'];
const farmStandOptions = ['Vegetables', 'Fruits', 'Honey', 'Bread', 'Eggs', 'Milk', 'Cheese', 'Jam'];
const equipmentOptions = ['Tractor', 'Tiller', 'ATV', 'UTV', 'Brush Hog', 'Baler'];

const sampleListings = [
  {
    id: 'sample-1',
    name: 'Cedar Creek Feed & Supply',
    type: 'Small Business',
    location: 'Springfield, MO',
    offerings: 'Feed, fencing, mineral blocks',
    category: 'Farm Services',
    distance: '25m away',
    description: '',
    website: '',
    email: '',
    createdAt: '2025-01-01',
  },
  {
    id: 'sample-2',
    name: 'Willow Ridge Mercantile',
    type: 'Mom & Pops',
    location: 'Ozark, MO',
    offerings: 'Hand tools, local seeds, canning lids',
    category: 'Crafts & Goods',
    distance: '18m away',
    description: '',
    website: '',
    email: '',
    createdAt: '2025-01-02',
  },
  {
    id: 'sample-3',
    name: 'Prairie Farm Co‑op',
    type: 'Commercial',
    location: 'Branson, MO',
    offerings: 'Bulk feed, livestock equipment',
    category: 'Farm Services',
    distance: '17m away',
    description: '',
    website: '',
    email: '',
    createdAt: '2025-01-03',
  },
  {
    id: 'sample-4',
    name: 'Autumn Ridge Breeders',
    type: 'Mom & Pops',
    location: 'Rolla, MO',
    offerings: 'Registered goats and sheep',
    category: 'Livestock Breeders',
    distance: '12m away',
    description: '',
    website: '',
    email: '',
    createdAt: '2025-01-04',
  },
];

const resolveCategory = (offerings: string) => {
  const value = offerings.toLowerCase();
  if (value.includes('farm stand') || value.includes('produce') || value.includes('bakery')) {
    return 'Farm Stands';
  }
  if (value.includes('service') || value.includes('farrier') || value.includes('vet') || value.includes('repair')) {
    return 'Farm Services';
  }
  if (value.includes('breeder') || value.includes('breeding') || value.includes('livestock')) {
    return 'Livestock Breeders';
  }
  if (value.includes('craft') || value.includes('goods') || value.includes('soap') || value.includes('honey')) {
    return 'Crafts & Goods';
  }
  return 'All';
};

export default function OutpostScreen() {
  const { outpostListings } = useHomesteadData();
  const [selectedType, setSelectedType] = useState<(typeof businessTypes)[number]>('All');
  const [selectedCategory, setSelectedCategory] = useState<(typeof outpostCategories)[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOfferFilters, setSelectedOfferFilters] = useState<string[]>([]);
  const [selectedLivestock, setSelectedLivestock] = useState<string[]>([]);
  const [selectedFarmServices, setSelectedFarmServices] = useState<string[]>([]);
  const [selectedFarmStand, setSelectedFarmStand] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const filteredListings = useMemo(() => {
    const allListings = [
      ...outpostListings.map((listing) => ({
        ...listing,
        category: resolveCategory(listing.offerings),
        distance: 'Nearby',
      })),
      ...sampleListings,
    ];
    return allListings.filter((listing) => {
      const matchesType = selectedType === 'All' || listing.type === selectedType;
      const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory;
      const term = searchQuery.trim().toLowerCase();
      const detailMatches = listing.offerings.toLowerCase();
      const selectedKeywords = [
        ...selectedOfferFilters,
        ...selectedLivestock,
        ...selectedFarmServices,
        ...selectedFarmStand,
        ...selectedEquipment,
      ];
      const matchesOffer =
        selectedKeywords.length === 0 ||
        selectedKeywords.some((filter) => detailMatches.includes(filter.toLowerCase()));
      if (!term) {
        return matchesType && matchesCategory && matchesOffer;
      }
      const searchFields = [listing.name, listing.location, listing.offerings];
      const matchesSearch = searchFields.some((value) => value.toLowerCase().includes(term));
      return matchesType && matchesCategory && matchesOffer && matchesSearch;
    });
  }, [
    selectedType,
    selectedCategory,
    searchQuery,
    outpostListings,
    selectedOfferFilters,
    selectedLivestock,
    selectedFarmServices,
    selectedFarmStand,
    selectedEquipment,
  ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#E8D9C6' }} contentContainerStyle={{ paddingBottom: 32 }}>
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
          source={require('../../assets/HCIcons/Icon_Waystation/TheOutpostPageTop.png')}
          style={{ width: '100%', height: 200 }}
          resizeMode="cover"
        />
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
          <InfoButton text="Find local homestead businesses, services, and breeders near you. Connects to: Farm Stand, Community Map." />
        </View>
        <Pressable
          onPress={() => router.push('/screens/waystation/outpost-profile')}
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
          <Text style={{ color: '#F7E9D4', fontFamily: 'SedgwickAve' }}>Create Profile</Text>
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
            placeholder="Search businesses..."
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
            onPress={() => setShowFilters((prev) => !prev)}
            style={{
              backgroundColor: '#D9C2A5',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#A88C70',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              {showFilters ? 'Close Filters' : 'Filters'}
            </Text>
          </Pressable>
        </View>

        {showFilters && (
          <View
            style={{
              marginTop: 10,
              backgroundColor: '#FFF1D8',
              borderRadius: 12,
              padding: 10,
              borderWidth: 1.5,
              borderColor: '#D8C4A8',
              borderStyle: 'dashed',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
              Filter by offerings
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {offerFilters.map((filter) => {
                const selected = selectedOfferFilters.includes(filter);
                return (
                  <Pressable
                    key={filter}
                    onPress={() =>
                      setSelectedOfferFilters((prev) =>
                        prev.includes(filter) ? prev.filter((item) => item !== filter) : [...prev, filter]
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
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{filter}</Text>
                  </Pressable>
                );
              })}
            </View>
            {selectedOfferFilters.includes('Livestock Breeders') && (
              <>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 10, marginBottom: 6 }}>
                  Livestock
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {livestockOptions.map((animal) => {
                    const selected = selectedLivestock.includes(animal);
                    return (
                      <Pressable
                        key={animal}
                        onPress={() =>
                          setSelectedLivestock((prev) =>
                            prev.includes(animal) ? prev.filter((item) => item !== animal) : [...prev, animal]
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
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{animal}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
            {selectedOfferFilters.includes('Farm Services') && (
              <>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 10, marginBottom: 6 }}>
                  Farm services
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {farmServiceOptions.map((service) => {
                    const selected = selectedFarmServices.includes(service);
                    return (
                      <Pressable
                        key={service}
                        onPress={() =>
                          setSelectedFarmServices((prev) =>
                            prev.includes(service) ? prev.filter((item) => item !== service) : [...prev, service]
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
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{service}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
            {selectedOfferFilters.includes('Farm Stands') && (
              <>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 10, marginBottom: 6 }}>
                  Farm stand items
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {farmStandOptions.map((item) => {
                    const selected = selectedFarmStand.includes(item);
                    return (
                      <Pressable
                        key={item}
                        onPress={() =>
                          setSelectedFarmStand((prev) =>
                            prev.includes(item) ? prev.filter((option) => option !== item) : [...prev, item]
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
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{item}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
            {selectedOfferFilters.includes('Equipment') && (
              <>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 10, marginBottom: 6 }}>
                  Equipment
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {equipmentOptions.map((item) => {
                    const selected = selectedEquipment.includes(item);
                    return (
                      <Pressable
                        key={item}
                        onPress={() =>
                          setSelectedEquipment((prev) =>
                            prev.includes(item) ? prev.filter((option) => option !== item) : [...prev, item]
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
                        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{item}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
            {selectedOfferFilters.length > 0 && (
              <Pressable
                onPress={() => {
                  setSelectedOfferFilters([]);
                  setSelectedLivestock([]);
                  setSelectedFarmServices([]);
                  setSelectedFarmStand([]);
                  setSelectedEquipment([]);
                }}
                style={{ marginTop: 8, alignSelf: 'flex-start' }}
              >
                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Clear filters</Text>
              </Pressable>
            )}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {outpostCategories.map((category) => {
              const selected = selectedCategory === category;
              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
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

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {businessTypes.map((type) => (
            <Pressable
              key={type}
              onPress={() => setSelectedType(type)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: selectedType === type ? '#8B5E3C' : '#D7C9B7',
                backgroundColor: selectedType === type ? '#EADBCB' : '#FFFFFF',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{type}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Business Listings</Text>
          <View style={{ height: 2, width: 140, backgroundColor: '#A88C70', marginTop: 4 }} />
        </View>
        {filteredListings.length === 0 ? (
          <View
            style={{
              backgroundColor: '#FFF1D8',
              borderRadius: 16,
              padding: 14,
              borderWidth: 1.5,
              borderColor: '#D8C4A8',
              borderStyle: 'dashed',
            }}
          >
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              No listings yet for this filter. Try another category or create a profile.
            </Text>
            <Pressable
              onPress={() => router.push('/screens/waystation/outpost-profile')}
              style={{
                backgroundColor: '#8B5E3C',
                paddingVertical: 8,
                borderRadius: 10,
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Create Profile</Text>
            </Pressable>
          </View>
        ) : (
          filteredListings.map((listing) => (
            <View
              key={listing.id}
              style={{
                borderWidth: 2,
                borderColor: '#B99572',
                borderRadius: 14,
                padding: 10,
                marginBottom: 12,
                backgroundColor: '#FFF1D8',
              }}
            >
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View
                  style={{
                    width: 70,
                    backgroundColor: '#E8D9C6',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#D8C4A8',
                    paddingVertical: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                    {listing.category}
                  </Text>
                </View>
                <View
                  style={{
                    width: 90,
                    height: 70,
                    backgroundColor: '#D9C2A5',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#A88C70',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>🏡</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 16 }}>
                    {listing.name}
                  </Text>
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                    {listing.offerings}
                  </Text>
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 2 }}>
                    {listing.location}
                  </Text>
                </View>
              </View>
              {listing.helpNeeded && (
                <View style={{ marginTop: 6 }}>
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: '#C9B8A6',
                      borderRadius: 10,
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: '#A88C70',
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Help Needed</Text>
                  </View>
                  {listing.helpTags && listing.helpTags.length > 0 && (
                    <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                      {listing.helpTags.join(', ')}
                    </Text>
                  )}
                  {listing.helpProject && (
                    <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                      {listing.helpProject}
                    </Text>
                  )}
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>{listing.type}</Text>
                <View
                  style={{
                    backgroundColor: '#6B4E3D',
                    borderRadius: 10,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ color: '#F7E9D4', fontFamily: 'SedgwickAve' }}>{listing.distance}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
