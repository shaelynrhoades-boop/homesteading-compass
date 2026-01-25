import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ASSETS } from '../../constants/assets';
import SafeImage from '../../components/safe-image';
import { useTheme } from '../../context/theme';

const buttons = [
  {
    label: 'The Trading Post',
    screen: '/screens/waystation/the-trading-post',
    icon: ASSETS.waystation.tradingPost,
  },
  {
    label: 'The Outpost',
    screen: '/screens/waystation/the-outpost',
    icon: ASSETS.waystation.outpost,
  },
  {
    label: 'The Front Porch Hub',
    screen: '/screens/waystation/the-front-porch-hub',
    icon: ASSETS.waystation.frontPorch,
  },
  {
    label: 'Homestead Map',
    screen: '/screens/waystation/homestead-map',
    icon: ASSETS.waystation.homesteadMap,
  },
];

export default function WaystationTab() {
  const { darkMode } = useTheme();
  const palette = darkMode
    ? {
        background: '#1F1B16',
        title: '#F4EBDD',
        text: '#D6C7B4',
        tile: '#3B2F25',
        tileText: '#F9F2E7',
      }
    : {
        background: '#F5F0E1',
        title: '#4C7744',
        text: '#4C7744',
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
          fontSize: 40,
          textAlign: 'center',
          color: palette.title,
          marginTop: 28,
          marginBottom: 2,
          fontFamily: 'SedgwickAve',
        }}
      >
        The Waystation
      </Text>

      <SafeImage
        source={ASSETS.waystation.header}
        style={{ width: 260, height: 260, alignSelf: 'center', marginBottom: 10 }}
        resizeMode="contain"
      />

      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          marginTop: -16,
          marginBottom: 24,
          textAlign: 'center',
          color: palette.text,
          fontFamily: 'SedgwickAve',
        }}
      >
        A Waystation is a shared space among travelers and neighbors to exchange resources, information, and support before continuing on their way.
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
              width: '46%',
              height: 150,
              paddingVertical: 0,
              backgroundColor: palette.tile,
              marginBottom: 8,
              borderRadius: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SafeImage
              source={btn.icon}
              style={{ width: 140, height: 140, marginTop: 26, marginBottom: 0 }}
              resizeMode="contain"
            />
            <Text style={{ color: palette.tileText, fontSize: 12, fontFamily: 'SedgwickAve', opacity: 0 }}>
              {btn.label}
            </Text>
          </Pressable>
        ))}
      </View>

    </ScrollView>
  );
}
