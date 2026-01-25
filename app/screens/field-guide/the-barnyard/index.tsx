import { router } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import InfoButton from '../../../../components/info-button';

const COLORS = {
  background: '#F4EFE6',
  primary: '#7A5C3E',
  textLight: '#FFFFFF',
  textDark: '#3A2E24',
};

// Add the animal display name and the route to its page
const topics = [
  {
    name: 'Chickens',
    route: '/screens/field-guide/the-barnyard/chickens',
    icon: require('../../../assets/HCIcons/animals/Icon_ChickenOnEgg.png'),
  },
  {
    name: 'Ducks',
    route: '/screens/field-guide/the-barnyard/ducks',
    icon: require('../../../assets/HCIcons/animals/Icon_Duck.png'),
  },
  {
    name: 'Turkeys',
    route: '/screens/field-guide/the-barnyard/turkeys',
    icon: require('../../../assets/HCIcons/animals/Icon_Turkey.png'),
  },
  {
    name: 'Quail',
    route: '/screens/field-guide/the-barnyard/quail',
    icon: require('../../../assets/HCIcons/animals/Icon_Quail.png'),
  },
  {
    name: 'Rabbits',
    route: '/screens/field-guide/the-barnyard/rabbits',
    icon: require('../../../assets/HCIcons/animals/Icon_Rabbit.png'),
  },
  {
    name: 'Goats',
    route: '/screens/field-guide/the-barnyard/goats',
    icon: require('../../../assets/HCIcons/animals/Icon_Goat.png'),
  },
  {
    name: 'Sheep',
    route: '/screens/field-guide/the-barnyard/sheep',
    icon: require('../../../assets/HCIcons/animals/Icon_SheepEwe.png'),
  },
  {
    name: 'Cows',
    route: '/screens/field-guide/the-barnyard/cows',
    icon: require('../../../assets/HCIcons/animals/Icon_Cow.png'),
  },
  {
    name: 'Pigs',
    route: '/screens/field-guide/the-barnyard/pigs',
    icon: require('../../../assets/HCIcons/animals/Icon_Pig.png'),
  },
  {
    name: 'Horses',
    route: '/screens/field-guide/the-barnyard/horses',
    icon: require('../../../assets/HCIcons/animals/Icon_Horse.png'),
  },
  {
    name: 'Bees',
    route: '/screens/field-guide/the-barnyard/bees',
    icon: require('../../../assets/HCIcons/animals/Icon_Bee.png'),
  },
  {
    name: 'Livestock Guardians',
    route: '/screens/field-guide/the-barnyard/livestock-guardians',
    icon: require('../../../assets/HCIcons/misc/Icon_Lantern.png'),
  },
];

export default function BarnyardScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
    >
      <Text
        style={{
          fontSize: 26,
          fontWeight: '700',
          textAlign: 'center',
          marginTop: 40,
          marginBottom: 12,
          color: COLORS.textDark,
          fontFamily: 'SedgwickAve',
        }}
      >
        The Barnyard
      </Text>
      <Image
        source={require('../../../assets/HCIcons/Icon_FieldGuide/Icon_TheBarnyard/ICON_Barnyard1.png')}
        style={{ width: 210, height: 160, alignSelf: 'center', marginBottom: 0 }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <InfoButton text="Choose an animal to explore care, housing, and seasonal guidance. Connects to: Log Book." />
      </View>

      <Text
        style={{
          fontSize: 16,
          textAlign: 'center',
          marginTop: -24,
          marginBottom: 24,
          color: COLORS.textDark,
          fontFamily: 'SedgwickAve',
        }}
      >
        Care, housing, feeding, breeding, and daily management of your livestock.
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
            onPress={() => router.push(item.route)}
            style={{
              width: '48%',
              backgroundColor: COLORS.primary,
              paddingVertical: 8,
              marginBottom: 10,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Image
              source={item.icon}
              style={{ width: 68, height: 68, marginBottom: 8 }}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
            <Text style={{ color: COLORS.textLight, fontSize: 14, fontFamily: 'SedgwickAve' }}>
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
