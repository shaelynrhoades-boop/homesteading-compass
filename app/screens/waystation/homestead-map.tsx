import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useHomesteadData } from '../../../context/homestead-data';
import SafeImage from '../../../components/safe-image';
import InfoButton from '../../../components/info-button';

type MapEntry = {
  id: string;
  name: string;
  type: 'Homestead' | 'Business';
  distanceMiles: number;
  tags: string[];
  location: string;
};

const filterOptions = [
  'Cow Milk',
  'Goat Milk',
  'Garden Produce',
  'Eggs',
  'Meat',
  'Nursery',
  'Greenhouse',
  'Honey',
  'Services',
];

const sampleHomesteads: MapEntry[] = [
  {
    id: 'home-1',
    name: 'Willowbrook Homestead',
    type: 'Homestead',
    distanceMiles: 6,
    location: 'Near Springfield',
    tags: ['Garden Produce', 'Eggs', 'Honey'],
  },
  {
    id: 'home-2',
    name: 'Prairie Sun Farm',
    type: 'Homestead',
    distanceMiles: 14,
    location: 'Near Ozark',
    tags: ['Goat Milk', 'Cheese', 'Meat'],
  },
  {
    id: 'home-3',
    name: 'Hollow Creek Greenhouse',
    type: 'Homestead',
    distanceMiles: 22,
    location: 'Near Nixa',
    tags: ['Greenhouse', 'Nursery', 'Garden Produce'],
  },
];

const deriveTags = (offerings: string) => {
  const value = offerings.toLowerCase();
  const tags: string[] = [];
  if (value.includes('milk') && value.includes('goat')) tags.push('Goat Milk');
  if (value.includes('milk') && value.includes('cow')) tags.push('Cow Milk');
  if (value.includes('produce') || value.includes('vegetable') || value.includes('fruit')) tags.push('Garden Produce');
  if (value.includes('egg')) tags.push('Eggs');
  if (value.includes('meat') || value.includes('beef') || value.includes('pork')) tags.push('Meat');
  if (value.includes('nursery')) tags.push('Nursery');
  if (value.includes('greenhouse')) tags.push('Greenhouse');
  if (value.includes('honey')) tags.push('Honey');
  if (value.includes('service') || value.includes('repair')) tags.push('Services');
  return tags;
};

export default function HomesteadMapScreen() {
  const { outpostListings } = useHomesteadData();
  const [activeTypes, setActiveTypes] = useState<Array<MapEntry['type']>>(['Homestead', 'Business']);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [radius, setRadius] = useState(25);

  const mapEntries = useMemo(() => {
    const businessEntries: MapEntry[] = outpostListings
      .filter((listing) => listing.showOnMap)
      .map((listing) => ({
        id: `biz-${listing.id}`,
        name: listing.name,
        type: 'Business',
        distanceMiles: listing.mapRadiusMiles ?? 12,
        location: listing.location || 'Nearby',
        tags: deriveTags(listing.offerings),
      }));
    return [...sampleHomesteads, ...businessEntries];
  }, [outpostListings]);

  const filteredEntries = useMemo(() => {
    return mapEntries.filter((entry) => {
      const matchesType = activeTypes.includes(entry.type);
      const matchesRadius = entry.distanceMiles <= radius;
      const matchesFilters =
        activeFilters.length === 0 || activeFilters.some((filter) => entry.tags.includes(filter));
      return matchesType && matchesRadius && matchesFilters;
    });
  }, [mapEntries, activeTypes, radius, activeFilters]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#E5E2D3' }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View
        style={{
          backgroundColor: '#4C7744',
          borderBottomWidth: 4,
          borderBottomColor: '#3A2E24',
          paddingVertical: 16,
        }}
      >
        <Text style={{ fontSize: 28, textAlign: 'center', color: '#FFF6E6', fontFamily: 'SedgwickAve' }}>
          Homestead Map
        </Text>
        <Text style={{ fontSize: 14, textAlign: 'center', color: '#FFF6E6', fontFamily: 'SedgwickAve' }}>
          Nearby homesteads, greenhouses, nurseries, and local businesses.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
          <InfoButton text="Browse nearby homesteads and businesses, then filter by what you need. Connects to: Outpost, Farm Stand." />
        </View>
        <View
          style={{
            backgroundColor: '#DCE6D5',
            borderRadius: 16,
            padding: 14,
            borderWidth: 1.5,
            borderColor: '#98B08C',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
            Map Preview
          </Text>
          <View
            style={{
              height: 180,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#98B08C',
              backgroundColor: '#F3F7EE',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SafeImage
              source={require('../../assets/HCIcons/Icon_Waystation/Icon_PorchLightPin.png')}
              style={{ width: 36, height: 36, marginBottom: 6 }}
              resizeMode="contain"
            />
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Map pins appear here</Text>
          </View>
        </View>

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          Show on map
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {(['Homestead', 'Business'] as const).map((value) => {
            const selected = activeTypes.includes(value);
            return (
              <Pressable
                key={value}
                onPress={() =>
                  setActiveTypes((prev) =>
                    prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
                  )
                }
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selected ? '#4C7744' : '#D7C9B7',
                  backgroundColor: selected ? '#DDE8D7' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          Radius (miles)
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {[5, 10, 25, 50].map((value) => {
            const selected = radius === value;
            return (
              <Pressable
                key={`${value}`}
                onPress={() => setRadius(value)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selected ? '#4C7744' : '#D7C9B7',
                  backgroundColor: selected ? '#DDE8D7' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}mi</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          Filters
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {filterOptions.map((filter) => {
            const selected = activeFilters.includes(filter);
            return (
              <Pressable
                key={filter}
                onPress={() =>
                  setActiveFilters((prev) =>
                    prev.includes(filter) ? prev.filter((item) => item !== filter) : [...prev, filter]
                  )
                }
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selected ? '#4C7744' : '#D7C9B7',
                  backgroundColor: selected ? '#DDE8D7' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{filter}</Text>
              </Pressable>
            );
          })}
        </View>
        {activeFilters.length > 0 && (
          <Pressable onPress={() => setActiveFilters([])} style={{ marginBottom: 12 }}>
            <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Clear filters</Text>
          </Pressable>
        )}
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
          Nearby Results
        </Text>
        {filteredEntries.length === 0 ? (
          <View
            style={{
              backgroundColor: '#FFF6E6',
              borderRadius: 16,
              padding: 14,
              borderWidth: 1.5,
              borderColor: '#C9D6C3',
              borderStyle: 'dashed',
            }}
          >
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              No listings match your filters yet. Try clearing filters or widening the radius.
            </Text>
          </View>
        ) : (
          filteredEntries.map((entry) => (
            <View
              key={entry.id}
              style={{
                borderWidth: 2,
                borderColor: '#A0B498',
                borderRadius: 14,
                padding: 12,
                marginBottom: 10,
                backgroundColor: '#FFF6E6',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 16 }}>
                  {entry.name}
                </Text>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  {entry.distanceMiles} mi
                </Text>
              </View>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>{entry.location}</Text>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 4 }}>
                {entry.tags.length > 0 ? entry.tags.join(', ') : 'General listings'}
              </Text>
              <View style={{ marginTop: 6, alignSelf: 'flex-start' }}>
                <View
                  style={{
                    backgroundColor: '#4C7744',
                    borderRadius: 10,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ color: '#FFF6E6', fontFamily: 'SedgwickAve' }}>{entry.type}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
