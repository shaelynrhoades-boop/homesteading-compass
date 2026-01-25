import { Alert, Pressable, Text, View } from 'react-native';
import InfoButton from '../../../components/info-button';

const COLORS = {
  background: '#F4EFE6',
  primary: '#7A5C3E',
  accent: '#5F7A4A',
  textDark: '#3A2E24',
  textLight: '#FFFFFF',
};

const topics = [
  'Soil Health',
  'Planting',
  'Watering',
  'Pest Control',
  'Harvesting',
  'Seasonal Tasks',
];

export default function GardenScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 26,
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: 12,
          color: COLORS.textDark,
          fontFamily: 'SedgwickAve',
        }}
      >
        The Garden
      </Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <InfoButton text="Explore planting, soil, pests, and seasonal garden guidance. Connects to: Log Book, Almanac." />
      </View>

      <Text
        style={{
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 24,
          color: COLORS.textDark,
          fontFamily: 'SedgwickAve',
        }}
      >
        Growing food, managing soil, and working with the seasons.
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {topics.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => Alert.alert(item, 'Coming soon 🌱')}
            style={{
              width: '48%',
              backgroundColor: COLORS.primary,
              paddingVertical: 16,
              marginBottom: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: COLORS.textLight, fontSize: 16, fontFamily: 'SedgwickAve' }}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
