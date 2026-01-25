import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import InfoButton from '../../../../components/info-button';

const COLORS = {
  background: '#F4EFE6',
  primary: '#7A5C3E',
  textLight: '#FFFFFF',
  textDark: '#3A2E24',
};

const animalName = 'Livestock Guardians';
const sections = ['Overview', 'Housing', 'Feed', 'Water', 'Maintenance', 'Seasonal Considerations'];

export default function AnimalScreen() {
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
        {animalName}
      </Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <InfoButton text="Guardian animal selection, training, and seasonal care basics. Connects to: Log Book." />
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
        Coming soon 🌱
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {sections.map((section) => (
          <Pressable
            key={section}
            onPress={() =>
              router.push({
                pathname: '/screens/field-guide/the-barnyard/animal-basics',
                params: { animal: animalName, topic: section },
              })
            }
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
              {section}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
