import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import InfoButton from '../../../../components/info-button';

const rabbitsSections = [
  'Housing & Shelter',
  'Fencing & Predator Protection',
  'Feed & Nutrition',
  'Watering Systems',
  'Maintenance',
  'Health & Common Issues',
  'Summer Considerations',
  'Winter Considerations',
];

const rabbitTypes = ['Angora Rabbits', 'Meat Rabbits'];

const nextSteps = [
  {
    name: 'Selling Rabbit Products',
    alert:
      'Future topics:\n• Selling hide\n• Selling meat\n• Local regulations\n• Pricing & packaging\n• Farmers markets\n\nComing soon 🐄',
  },
  {
    name: 'Find a Rabbit Group',
    alert:
      'Will connect to:\n• The Waystation\n• Local breeders\n• Trades & advice\n\nComing soon 🌱',
  },
  {
    name: 'My Rabbit Log',
    alert:
      'Will link to:\n• Herd records\n• Rabbit log\n• Health notes\n• Breeding plans\n\nComing soon 📓',
  },
];

export default function Rabbits() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }} // lifts buttons above soft buttons
    >
      <Text style={styles.title}>Rabbits</Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <InfoButton text="Guides for rabbit housing, feeding, and health basics. Connects to: Log Book." />
      </View>

      <Text style={styles.intro}>
        Rabbits are one of the most versatile and beginner-friendly livestock
        on the homestead. Whether raising for meat, fur, or both, proper setup
        and care are key to a healthy herd.
      </Text>

      {/* Rabbits Basics */}
      <Text style={styles.sectionHeader}>Rabbits Basics</Text>
      <View style={styles.grid}>
        {rabbitsSections.map((item) => (
          <Pressable
            key={item}
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: '/screens/field-guide/the-barnyard/animal-basics',
                params: { animal: 'Rabbits', topic: item },
              })
            }
          >
            <Text style={styles.buttonText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Rabbit Types */}
      <Text style={styles.sectionHeader}>Rabbit Types</Text>
      <View style={styles.grid}>
        {rabbitTypes.map((item) => (
          <Pressable
            key={item}
            style={styles.buttonAlt}
            onPress={() =>
              router.push({
                pathname: '/screens/field-guide/the-barnyard/animal-type',
                params: { animal: 'Rabbits', type: item },
              })
            }
          >
            <Text style={styles.buttonTextAlt}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Next Steps */}
      <Text style={styles.sectionHeader}>Next Steps</Text>
      <View style={styles.gridNextSteps}>
        {nextSteps.map((step) => (
          <Pressable
            key={step.name}
            style={[styles.buttonNextStep, { backgroundColor: '#73482F' }]} // dark brown for all 3
            onPress={() =>
              router.push({
                pathname: '/screens/field-guide/the-barnyard/animal-next-step',
                params: { animal: 'Rabbits', step: step.name },
              })
            }
          >
            <Text style={styles.buttonTextNextStep}>{step.name}</Text>
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
    marginBottom: 12,
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
    color: '#283618',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'SedgwickAve',
  },
  buttonAlt: {
    width: '48%',
    backgroundColor: '#BC6C25', // deeper brown
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  buttonTextAlt: {
    color: '#FEFAE0',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'SedgwickAve',
  },
  gridNextSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    marginBottom: 20,
  },
  buttonNextStep: {
    width: '32%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonTextNextStep: {
    color: '#FEFAE0',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'SedgwickAve',
  },
});
