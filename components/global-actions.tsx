import { useMemo, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useHomesteadData } from '../context/homestead-data';

type SearchItem = {
  id: string;
  label: string;
  route: string;
  keywords: string[];
  group: 'Homestead' | 'Field Guide' | 'Waystation' | 'Logs' | 'Weather';
};

const groupIcons: Record<SearchItem['group'], string> = {
  Homestead: '🏡',
  'Field Guide': '📗',
  Waystation: '🧭',
  Logs: '🪵',
  Weather: '☀️',
};

const staticSearchItems: SearchItem[] = [
  { id: 'homestead', label: 'The Homestead', route: '/(tabs)/the-homestead', keywords: ['home', 'homestead'], group: 'Homestead' },
  { id: 'chore-list', label: 'Chore List', route: '/screens/homestead/chore-list', keywords: ['chores', 'to-do', 'tasks'], group: 'Logs' },
  { id: 'almanac', label: 'The Almanac', route: '/screens/homestead/almanac', keywords: ['calendar', 'planner', 'frost', 'alerts'], group: 'Homestead' },
  { id: 'log-book', label: 'The Log Book', route: '/screens/homestead/the-log-book', keywords: ['logs', 'records', 'livestock', 'garden', 'pantry', 'harvest', 'finances'], group: 'Logs' },
  { id: 'recipe-book', label: 'The Recipe Book', route: '/screens/homestead/the-recipe-book', keywords: ['recipes', 'cooking', 'baking'], group: 'Homestead' },
  { id: 'weather', label: 'Weather', route: '/screens/homestead/weather', keywords: ['forecast', 'sun', 'rain', 'frost'], group: 'Weather' },
  { id: 'farm-stand', label: 'The Farm Stand', route: '/screens/homestead/farm-stand', keywords: ['market', 'business', 'farm stand'], group: 'Homestead' },
  { id: 'emergency', label: 'Emergency Plan', route: '/screens/homestead/emergency-plan', keywords: ['emergency', 'plan', 'safety'], group: 'Homestead' },
  { id: 'quick-notes', label: 'Quick Notes', route: '/screens/homestead/quick-notes', keywords: ['notes', 'quick notes'], group: 'Homestead' },
  { id: 'support', label: 'The Post Box', route: '/screens/homestead/support-messages', keywords: ['support', 'feedback', 'bug report', 'message', 'post box'], group: 'Homestead' },
  { id: 'maps', label: 'Maps', route: '/screens/homestead/maps', keywords: ['maps', 'navigation'], group: 'Homestead' },
  { id: 'field-guide', label: 'The Field Guide', route: '/(tabs)/the-field-guide', keywords: ['field guide', 'reference', 'featured guides'], group: 'Field Guide' },
  { id: 'barnyard', label: 'The Barnyard', route: '/screens/field-guide/the-barnyard', keywords: ['barnyard', 'livestock'], group: 'Field Guide' },
  { id: 'garden-guide', label: 'The Garden', route: '/screens/field-guide/the-garden', keywords: ['garden', 'plants', 'seeds'], group: 'Field Guide' },
  { id: 'pantry-guide', label: 'The Pantry', route: '/screens/field-guide/the-pantry', keywords: ['pantry', 'preserving'], group: 'Field Guide' },
  { id: 'workshop', label: 'The Workshop', route: '/screens/field-guide/the-workshop', keywords: ['workshop', 'tools'], group: 'Field Guide' },
  { id: 'stockyard', label: 'The Stockyard Harvest', route: '/screens/field-guide/the-stockyard-harvest', keywords: ['harvest', 'stockyard'], group: 'Field Guide' },
  { id: 'chickens', label: 'Chickens', route: '/screens/field-guide/the-barnyard/chickens', keywords: ['chickens', 'eggs'], group: 'Field Guide' },
  { id: 'ducks', label: 'Ducks', route: '/screens/field-guide/the-barnyard/ducks', keywords: ['ducks'], group: 'Field Guide' },
  { id: 'turkeys', label: 'Turkeys', route: '/screens/field-guide/the-barnyard/turkeys', keywords: ['turkeys'], group: 'Field Guide' },
  { id: 'quail', label: 'Quail', route: '/screens/field-guide/the-barnyard/quail', keywords: ['quail'], group: 'Field Guide' },
  { id: 'rabbits', label: 'Rabbits', route: '/screens/field-guide/the-barnyard/rabbits', keywords: ['rabbits'], group: 'Field Guide' },
  { id: 'goats', label: 'Goats', route: '/screens/field-guide/the-barnyard/goats', keywords: ['goats', 'dairy goats', 'milk'], group: 'Field Guide' },
  { id: 'sheep', label: 'Sheep', route: '/screens/field-guide/the-barnyard/sheep', keywords: ['sheep', 'wool'], group: 'Field Guide' },
  { id: 'cows', label: 'Cows', route: '/screens/field-guide/the-barnyard/cows', keywords: ['cows', 'dairy cows', 'beef'], group: 'Field Guide' },
  { id: 'pigs', label: 'Pigs', route: '/screens/field-guide/the-barnyard/pigs', keywords: ['pigs'], group: 'Field Guide' },
  { id: 'horses', label: 'Horses', route: '/screens/field-guide/the-barnyard/horses', keywords: ['horses'], group: 'Field Guide' },
  { id: 'bees', label: 'Bees', route: '/screens/field-guide/the-barnyard/bees', keywords: ['bees', 'honey'], group: 'Field Guide' },
  { id: 'guardians', label: 'Livestock Guardians', route: '/screens/field-guide/the-barnyard/livestock-guardians', keywords: ['guardians', 'dogs'], group: 'Field Guide' },
  { id: 'waystation', label: 'The Waystation', route: '/(tabs)/waystation', keywords: ['waystation', 'community'], group: 'Waystation' },
  { id: 'trading-post', label: 'The Trading Post', route: '/screens/waystation/the-trading-post', keywords: ['trading', 'market', 'listings'], group: 'Waystation' },
  { id: 'outpost', label: 'The Outpost', route: '/screens/waystation/the-outpost', keywords: ['outpost'], group: 'Waystation' },
  { id: 'outpost-profile', label: 'Outpost Profile', route: '/screens/waystation/outpost-profile', keywords: ['outpost', 'profile', 'business'], group: 'Waystation' },
  { id: 'front-porch', label: 'The Front Porch Hub', route: '/screens/waystation/the-front-porch-hub', keywords: ['front porch', 'hub'], group: 'Waystation' },
  { id: 'homestead-map', label: 'Homestead Map', route: '/screens/waystation/homestead-map', keywords: ['map', 'homestead', 'nearby', 'local'], group: 'Waystation' },
  { id: 'sign-in', label: 'Sign In', route: '/sign-in', keywords: ['sign in', 'login', 'create account'], group: 'Homestead' },
];

export default function GlobalActions() {
  const router = useRouter();
  const segments = useSegments();
  const { almanacEntries, tradingListings, recipes, quickNotes, outpostListings } = useHomesteadData();
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dynamicItems: SearchItem[] = useMemo(() => {
    const almanacItems = almanacEntries.map((entry) => ({
      id: `almanac-${entry.id}`,
      label: entry.label,
      route: entry.source.includes('Chore')
        ? '/screens/homestead/chore-list'
        : entry.source.includes('To-Do')
          ? '/screens/homestead/chore-list'
          : entry.source.includes('Weather')
            ? '/screens/homestead/weather'
            : '/screens/homestead/the-log-book',
      keywords: [entry.label, entry.source, entry.type].map((value) => value.toLowerCase()),
      group: 'Logs',
    }));
    const tradingItems = tradingListings.map((listing) => ({
      id: `trading-${listing.id}`,
      label: listing.title,
      route: '/screens/waystation/the-trading-post',
      keywords: [listing.title, listing.details, listing.source].map((value) => value.toLowerCase()),
      group: 'Waystation',
    }));
    const recipeItems = recipes.map((recipe) => ({
      id: `recipe-${recipe.id}`,
      label: recipe.title,
      route: '/screens/homestead/the-recipe-book',
      keywords: [
        recipe.title,
        recipe.description,
        recipe.mealType,
        recipe.difficulty,
        ...recipe.categories,
        ...recipe.cuisines,
        ...recipe.ingredients.map((item) => item.name),
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase()),
      group: 'Homestead',
    }));
    const quickNoteItems = quickNotes.map((note) => ({
      id: `note-${note.id}`,
      label: note.subject,
      route: `/screens/homestead/quick-notes?noteId=${note.id}`,
      keywords: [note.subject, note.category, note.body, note.attachmentNote, note.reminderDate]
        .filter(Boolean)
        .map((value) => value.toLowerCase()),
      group: 'Homestead',
    }));
    const outpostItems = outpostListings.map((listing) => ({
      id: `outpost-${listing.id}`,
      label: listing.name,
      route: '/screens/waystation/the-outpost',
      keywords: [listing.name, listing.type, listing.location, listing.offerings, listing.description]
        .filter(Boolean)
        .map((value) => value.toLowerCase()),
      group: 'Waystation',
    }));
    return [...almanacItems, ...tradingItems, ...recipeItems, ...quickNoteItems, ...outpostItems];
  }, [almanacEntries, tradingListings, recipes, quickNotes, outpostListings]);

  const filteredItems = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) {
      return [];
    }
    const all = [...staticSearchItems, ...dynamicItems];
    return all.filter((item) => {
      const inLabel = item.label.toLowerCase().includes(term);
      const inKeywords = item.keywords.some((keyword) => keyword.toLowerCase().includes(term));
      return inLabel || inKeywords;
    });
  }, [searchQuery, dynamicItems]);

  const quickMatches = filteredItems.slice(0, 6);
  const groupedResults = useMemo(() => {
    const groups: Record<SearchItem['group'], SearchItem[]> = {
      Homestead: [],
      'Field Guide': [],
      Waystation: [],
      Logs: [],
      Weather: [],
    };
    filteredItems.forEach((item) => {
      groups[item.group].push(item);
    });
    return groups;
  }, [filteredItems]);

  const hideGlobalActions =
    segments[0] === 'sign-in' ||
    segments[0] === 'create-account' ||
    segments[0] === 'sign-in-confirmation';

  if (hideGlobalActions) {
    return null;
  }

  return (
    <>
      <View
        style={{
          position: 'absolute',
          top: 28,
          left: 16,
          right: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          zIndex: 50,
        }}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={() => setShowSearch(true)}
          style={{
            backgroundColor: '#FFF1D8',
            borderRadius: 12,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: '#D8C4A8',
            borderStyle: 'dashed',
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>🔍 Search</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => router.push('/screens/homestead/support-messages')}
            style={{
              backgroundColor: '#FFF1D8',
              borderRadius: 12,
              padding: 6,
              borderWidth: 1,
              borderColor: '#D8C4A8',
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={require('../app/assets/HCIcons/Icon_Homestead/Icon_Post.png')}
              style={{ width: 22, height: 22 }}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </Pressable>
          <Pressable
            onPress={() => setShowMenu(true)}
            style={{
              backgroundColor: '#FFF1D8',
              borderRadius: 12,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: '#D8C4A8',
              borderStyle: 'dashed',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>☰ Menu</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={showSearch}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSearch(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(58, 46, 36, 0.45)',
            padding: 20,
            justifyContent: 'center',
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
              maxHeight: '80%',
            }}
          >
            <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
              Quick Search
            </Text>
            <TextInput
              placeholder="Search everything..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#A08974"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 10,
                padding: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
                backgroundColor: '#FFFDF6',
                marginBottom: 10,
              }}
            />

            {searchQuery.trim().length > 0 && quickMatches.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {quickMatches.map((item) => (
                  <Pressable
                    key={`quick-${item.id}`}
                    onPress={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                      router.push(item.route);
                    }}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#8B5E3C',
                      backgroundColor: '#EADBCB',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <ScrollView>
              {searchQuery.trim().length === 0 ? (
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  Start typing to search logs, guides, and homestead tools.
                </Text>
              ) : filteredItems.length === 0 ? (
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  No results yet. Try another keyword.
                </Text>
              ) : (
                (['Homestead', 'Logs', 'Field Guide', 'Weather', 'Waystation'] as const).map((group) =>
                  groupedResults[group].length === 0 ? null : (
                    <View key={group} style={{ marginBottom: 10 }}>
                      <Text
                        style={{
                          color: '#6B4E3D',
                          fontFamily: 'SedgwickAve',
                          marginBottom: 6,
                        }}
                      >
                        {groupIcons[group]} {group}
                      </Text>
                      {groupedResults[group].map((item) => (
                        <Pressable
                          key={item.id}
                          onPress={() => {
                            setShowSearch(false);
                            setSearchQuery('');
                            router.push(item.route);
                          }}
                          style={{
                            borderWidth: 1,
                            borderColor: '#E2D4C1',
                            borderRadius: 12,
                            padding: 10,
                            marginBottom: 8,
                            backgroundColor: '#FFF7E6',
                          }}
                        >
                          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 16 }}>
                            {item.label}
                          </Text>
                          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                            {group}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )
                )
              )}
            </ScrollView>

            <Pressable
              onPress={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              style={{ alignItems: 'center', paddingVertical: 6 }}
            >
              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMenu}
        animationType="fade"
        transparent
        onRequestClose={() => setShowMenu(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(58, 46, 36, 0.45)',
            padding: 20,
            justifyContent: 'center',
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
              Quick Menu
            </Text>
            {[
              { label: 'Account', route: '/screens/homestead/account' },
              { label: 'Settings', route: '/screens/homestead/settings' },
              { label: 'Sign In', route: '/sign-in' },
              { label: 'Quick Notes', route: '/screens/homestead/quick-notes' },
              { label: 'The Post Box', route: '/screens/homestead/support-messages' },
              { label: 'Community Map', route: '/screens/waystation/homestead-map' },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={() => {
                  setShowMenu(false);
                  router.push(item.route);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: '#E2D4C1',
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 8,
                  backgroundColor: '#FFF7E6',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 16 }}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setShowMenu(false)}
              style={{ alignItems: 'center', paddingVertical: 6 }}
            >
              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
