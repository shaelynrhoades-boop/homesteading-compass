import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { ASSETS } from '../../constants/assets';
import SafeImage from '../../components/safe-image';
import { useTheme } from '../../context/theme';

const buttons = [
  {
    label: 'Weather',
    screen: '/screens/homestead/weather',
    icon: ASSETS.homestead.weather,
  },
  {
    label: 'Chore List',
    screen: '/screens/homestead/chore-list',
    icon: ASSETS.homestead.choreList,
  },
  {
    label: 'Almanac',
    screen: '/screens/homestead/almanac',
    icon: ASSETS.homestead.almanac,
  },
  {
    label: 'The Log Book',
    screen: '/screens/homestead/the-log-book',
    icon: ASSETS.homestead.logBook,
  },
  {
    label: 'The Recipe Book',
    screen: '/screens/homestead/the-recipe-book',
    icon: ASSETS.homestead.recipeBook,
  },
  {
    label: 'The Farm Stand',
    screen: '/screens/homestead/farm-stand',
    icon: ASSETS.homestead.farmStand,
  },
  {
    label: 'Community Map',
    screen: '/screens/waystation/homestead-map',
    icon: ASSETS.homestead.communityMap,
  },
  {
    label: 'Emergency Plan',
    screen: '/screens/homestead/emergency-plan',
    icon: ASSETS.homestead.emergencyPlan,
  },
  {
    label: 'Quick Notes',
    screen: '/screens/homestead/quick-notes',
    icon: ASSETS.homestead.quickNotes,
  },
  {
    label: 'The Post Box',
    screen: '/screens/homestead/support-messages',
    icon: ASSETS.homestead.postBox,
  },
];

export default function HomeSteadTab() {
  const { darkMode } = useTheme();
  const palette = darkMode
    ? {
        background: '#1F1B16',
        title: '#F4EBDD',
        text: '#D8CBB8',
        tile: '#3B2F25',
        tileText: '#F9F2E7',
      }
    : {
        background: '#F5F0E1',
        title: '#3A2E24',
        text: '#3A2E24',
        tile: '#8B5E3C',
        tileText: '#FFFFFF',
      };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 28 }}
    >
      <Text
        style={{
          fontSize: 44,
          textAlign: 'center',
          color: palette.title,
          marginBottom: 2,
          marginTop: 34,
          fontFamily: 'SedgwickAve',
        }}
      >
        The Homestead
      </Text>

      <SafeImage
        source={ASSETS.homestead.header}
        style={{ width: 280, height: 280, alignSelf: 'center', marginTop: -52, marginBottom: -8 }}
        resizeMode="contain"
      />

      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          marginTop: -34,
          marginBottom: 24,
          textAlign: 'center',
          fontFamily: 'SedgwickAve',
          color: palette.text,
        }}
      >
        Start here to track animals, gardens, and daily homestead notes.
      </Text>


      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {buttons.map((btn, index) => (
          <Pressable
            key={index}
            onPress={() => router.push(btn.screen)}
            style={{
              width: '48%', // 2 columns
              paddingVertical: 6,
              backgroundColor: palette.tile,
              marginBottom: 8,
              borderRadius: 6,
              alignItems: 'center',
            }}
          >
            <SafeImage
              source={btn.icon}
              style={{
                width: btn.label === 'Almanac' ? 105 : 120,
                height: btn.label === 'Almanac' ? 105 : 120,
                marginBottom: -6,
              }}
              resizeMode="contain"
            />
            <Text
              style={{
                color: palette.tileText,
                fontSize: btn.label === 'Almanac' ? 18 : 16,
                fontFamily: 'SedgwickAve',
                marginTop: btn.label === 'Almanac' ? 2 : -6,
              }}
            >
              {btn.label}
            </Text>
          </Pressable>
        ))}
      </View>

    </ScrollView>
  );
}
