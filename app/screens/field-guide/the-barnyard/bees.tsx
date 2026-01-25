import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import InfoButton from '../../../../components/info-button';

const beeSections = [
  'Hive Setup',
  'Bee Care',
  'Forage & Environment',
  'Health & Pests',
  'Seasonal Care',
  'Harvesting',
  'Safety & Legal',
];

const nextSteps = [
  {
    name: 'Selling Bee Products',
    alert:
      'Future topics:\n• Honey\n• Beeswax\n• Local regulations\n• Packaging & labeling\n• Farmers markets\n\nComing soon 🍯',
  },
  {
    name: 'Find a Bee Group',
    alert:
      'Will connect to:\n• The Waystation\n• Local beekeeping groups\n• Trades & advice\n\nComing soon 🌱',
  },
  {
    name: 'My Bee Log',
    alert:
      'Will link to:\n• Hive records\n• Harvest notes\n• Health notes\n• Feeding logs\n\nComing soon 📓',
  },
];

export default function Bees() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Bees</Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <InfoButton text="Hive care, seasonal management, and honey production basics. Connects to: Log Book." />
      </View>

      <Text style={styles.intro}>
        Beekeeping supports pollination, honey production, and a healthy
        homestead ecosystem. Proper setup and seasonal care are key to a strong,
        productive hive.
      </Text>

      {/* Bee Sections */}
      <View style={styles.grid}>
        {beeSections.map((item) => (
          <Pressable
            key={item}
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: '/screens/field-guide/the-barnyard/animal-basics',
                params: { animal: 'Bees', topic: item },
              })
            }
          >
            <Text style={styles.buttonText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Next Steps */}
      <Text style={styles.sectionHeader}>Next Steps</Text>
      <View style={styles.nextStepsGrid}>
        {nextSteps.map((step) => (
          <Pressable
            key={step.name}
            style={styles.buttonNext}
            onPress={() =>
              router.push({
                pathname: '/screens/field-guide/the-barnyard/animal-next-step',
                params: { animal: 'Bees', step: step.name },
              })
            }
          >
            <Text style={styles.buttonTextNext}>{step.name}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#606C38', // muted green
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FEFAE0',
    marginBottom: 8,
    fontFamily: 'SedgwickAve',
  },
  intro: {
    fontSize: 16,
    color: '#FEFAE0',
    marginBottom: 20,
    lineHeight: 22,
    fontFamily: 'SedgwickAve',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FEFAE0',
    marginBottom: 12,
    marginTop: 8,
    fontFamily: 'SedgwickAve',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '48%',
    backgroundColor: '#DDA15E', // tan
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#283618', // dark green
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'SedgwickAve',
  },
  nextStepsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  buttonNext: {
    flex: 1,
    backgroundColor: '#5C3A21', // dark brown
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonTextNext: {
    color: '#FEFAE0',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'SedgwickAve',
  },
});
