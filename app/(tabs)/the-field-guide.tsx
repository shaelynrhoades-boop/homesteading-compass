import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ASSETS } from '../../constants/assets';
import SafeImage from '../../components/safe-image';
import { useTheme } from '../../context/theme';

const buttons = [
  {
    label: 'The Barnyard',
    screen: '/screens/field-guide/the-barnyard',
    icon: ASSETS.fieldGuide.barnyard,
  },
  {
    label: 'The Garden',
    screen: '/screens/field-guide/the-garden',
    icon: ASSETS.fieldGuide.garden,
  },
  {
    label: 'The Pantry',
    screen: '/screens/field-guide/the-pantry',
    icon: ASSETS.fieldGuide.pantry,
  },
  {
    label: 'The Stockyard Harvest',
    screen: '/screens/field-guide/the-stockyard-harvest',
    icon: ASSETS.fieldGuide.stockyard,
  },
  {
    label: 'The Workshop',
    screen: '/screens/field-guide/the-workshop',
    icon: ASSETS.fieldGuide.workshop,
  },
];

const featuredGuideOptions = [
  {
    id: 'goats-dairy',
    label: 'Dairy Goats 101',
    blurb: 'Milking basics, udder care, and daily routines.',
    screen: '/screens/field-guide/the-barnyard/goats',
    seasons: ['spring', 'summer'],
  },
  {
    id: 'seed-starting',
    label: 'Seed Starting Basics',
    blurb: 'Timing, trays, and sprout success.',
    screen: '/screens/field-guide/the-garden',
    seasons: ['spring'],
  },
  {
    id: 'canning-safety',
    label: 'Canning Safety',
    blurb: 'Pressure vs. water bath and safe storage.',
    screen: '/screens/field-guide/the-pantry',
    seasons: ['summer', 'fall'],
  },
  {
    id: 'winter-coops',
    label: 'Winterizing Coops',
    blurb: 'Drafts, bedding, and cold weather care.',
    screen: '/screens/field-guide/the-barnyard/chickens',
    seasons: ['fall', 'winter'],
  },
  {
    id: 'garden-harvest',
    label: 'Harvest Timing',
    blurb: 'Know when to pick for peak flavor.',
    screen: '/screens/field-guide/the-stockyard-harvest',
    seasons: ['summer', 'fall'],
  },
  {
    id: 'pantry-staples',
    label: 'Pantry Staples',
    blurb: 'Stocking essentials for slow seasons.',
    screen: '/screens/field-guide/the-pantry',
    seasons: ['winter'],
  },
];

export default function FieldGuideTab() {
  const { darkMode } = useTheme();
  const COLORS = darkMode
    ? {
        background: '#1E1B16',
        primary: '#3C3127',
        accent: '#5F7A4A',
        textDark: '#F4EBDD',
        textLight: '#F9F2E7',
        card: '#2A221B',
        border: '#514338',
        mutedText: '#C9BBA8',
      }
    : {
        background: '#F4EFE6',
        primary: '#7A5C3E',
        accent: '#5F7A4A',
        textDark: '#3A2E24',
        textLight: '#FFFFFF',
        card: '#FFF1D8',
        border: '#D8C4A8',
        mutedText: '#6E5B4B',
      };
  const [showFeaturedSettings, setShowFeaturedSettings] = useState(false);
  const [useSeasonalRotation, setUseSeasonalRotation] = useState(true);
  const [selectedFeaturedIds, setSelectedFeaturedIds] = useState<string[]>(
    featuredGuideOptions.slice(0, 4).map((guide) => guide.id)
  );

  const currentSeason = useMemo(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }, []);

  const featuredGuides = useMemo(() => {
    if (useSeasonalRotation) {
      return featuredGuideOptions.filter((guide) => guide.seasons.includes(currentSeason));
    }
    return featuredGuideOptions.filter((guide) => selectedFeaturedIds.includes(guide.id));
  }, [useSeasonalRotation, currentSeason, selectedFeaturedIds]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
    >
      <Text
        style={{
          fontSize: 46,
          textAlign: 'center',
          color: COLORS.textDark,
          marginTop: 30,
          marginBottom: 2,
          fontFamily: 'SedgwickAve',
        }}
      >
        The Field Guide
      </Text>

      <SafeImage
        source={ASSETS.fieldGuide.header}
        style={{ width: 260, height: 260, alignSelf: 'center', marginTop: -26, marginBottom: 10 }}
        resizeMode="contain"
      />

      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
          marginTop: -42,
          marginBottom: 16,
          color: COLORS.textDark,
          fontFamily: 'SedgwickAve',
        }}
      >
        Your go-to reference for practical, hands-on homesteading. From animal care to seasonal tasks and everyday farm life, this guide gives you quick, reliable answers when you need them most.
      </Text>

      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 20, color: COLORS.textDark, fontFamily: 'SedgwickAve' }}>
            Featured Guides
          </Text>
          <Pressable
            onPress={() => setShowFeaturedSettings(true)}
            style={{
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: COLORS.border,
              backgroundColor: COLORS.card,
            }}
          >
            <Text style={{ color: COLORS.textDark, fontFamily: 'SedgwickAve', fontSize: 14 }}>
              Edit
            </Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {featuredGuides.map((guide) => (
            <Pressable
              key={guide.label}
              onPress={() => router.push(guide.screen)}
              style={{
                width: '48%',
                backgroundColor: COLORS.card,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 12,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: COLORS.textDark, fontFamily: 'SedgwickAve', fontSize: 16 }}>
                {guide.label}
              </Text>
              <Text style={{ color: COLORS.mutedText, fontFamily: 'SedgwickAve', marginTop: 4 }}>
                {guide.blurb}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {buttons.map((btn, index) => (
          <Pressable
            key={index}
            onPress={() => router.push(btn.screen)}
            style={{
              width: '48%',
              backgroundColor: COLORS.primary,
              paddingVertical: 2,
              marginBottom: 6,
              borderRadius: 4,
              alignItems: 'center',
            }}
          >
            <SafeImage
              source={btn.icon}
              style={{ width: 120, height: 120, marginBottom: -6 }}
              resizeMode="contain"
            />
            <Text style={{ color: COLORS.textLight, fontSize: 16, fontFamily: 'SedgwickAve', marginTop: -6 }}>
              {btn.label}
            </Text>
          </Pressable>
        ))}
      </View>


      <Modal
        visible={showFeaturedSettings}
        animationType="fade"
        transparent
        onRequestClose={() => setShowFeaturedSettings(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(10, 8, 6, 0.6)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1.5,
              borderColor: COLORS.border,
              borderStyle: 'dashed',
            }}
          >
            <Text style={{ fontSize: 20, color: COLORS.textDark, fontFamily: 'SedgwickAve', marginBottom: 8 }}>
              Featured Guides
            </Text>
            <Text style={{ color: COLORS.mutedText, fontFamily: 'SedgwickAve', marginBottom: 12 }}>
              Choose seasonal rotation or pick your favorites.
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <Pressable
                onPress={() => setUseSeasonalRotation(true)}
                style={{
                  flex: 1,
                  backgroundColor: useSeasonalRotation ? '#8B5E3C' : COLORS.border,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: useSeasonalRotation ? '#FFFFFF' : darkMode ? '#F4EBDD' : '#3A2E24',
                    fontFamily: 'SedgwickAve',
                  }}
                >
                  Seasonal
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setUseSeasonalRotation(false)}
                style={{
                  flex: 1,
                  backgroundColor: !useSeasonalRotation ? '#8B5E3C' : COLORS.border,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: !useSeasonalRotation ? '#FFFFFF' : darkMode ? '#F4EBDD' : '#3A2E24',
                    fontFamily: 'SedgwickAve',
                  }}
                >
                  Custom
                </Text>
              </Pressable>
            </View>

            {!useSeasonalRotation && (
              <ScrollView style={{ maxHeight: 240, marginBottom: 12 }}>
                {featuredGuideOptions.map((guide) => {
                  const selected = selectedFeaturedIds.includes(guide.id);
                  return (
                    <Pressable
                      key={guide.id}
                      onPress={() =>
                        setSelectedFeaturedIds((prev) =>
                          prev.includes(guide.id)
                            ? prev.filter((id) => id !== guide.id)
                            : [...prev, guide.id]
                        )
                      }
                      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: '#8B5E3C',
                          marginRight: 8,
                          backgroundColor: selected ? '#8B5E3C' : COLORS.card,
                        }}
                      />
                      <View>
                        <Text style={{ color: COLORS.textDark, fontFamily: 'SedgwickAve' }}>
                          {guide.label}
                        </Text>
                        <Text style={{ color: COLORS.mutedText, fontFamily: 'SedgwickAve', fontSize: 14 }}>
                          {guide.blurb}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <Pressable
              onPress={() => setShowFeaturedSettings(false)}
              style={{
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
    </ScrollView>
  );
}
