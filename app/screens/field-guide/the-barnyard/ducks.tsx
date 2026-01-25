import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import InfoButton from '../../../../components/info-button';

const ducksSections = [
  'Housing & Shelter',
  'Fencing & Predator Protection',
  'Feed & Nutrition',
  'Watering Systems',
  'Maintenance',
  'Health & Common Issues',
  'Summer Considerations',
  'Winter Considerations',
];

const duckTypes = ['Meat Ducks', 'Egg Layers'];

const nextSteps = [
  {
    name: 'Selling Duck Products',
    alert:
      'Future topics:\n• Selling eggs\n• Selling meat birds\n• Local regulations\n• Pricing & packaging\n• Farmers markets\n\nComing soon 🐓',
  },
  {
    name: 'Find a Duck Group',
    alert:
      'Will connect to:\n• The Waystation\n• Local poultry groups\n• Trades & advice\n\nComing soon 🌱',
  },
  {
    name: 'My Duck Log',
    alert:
      'Will link to:\n• Flock records\n• Egg counts\n• Health notes\n• Breeding plans\n\nComing soon 📓',
  },
];

export default function Ducks() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }} // lifts buttons above soft buttons
    >
      <Text style={styles.title}>Ducks</Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <InfoButton text="Basics for housing, feeding, and seasonal duck care. Connects to: Log Book." />
      </View>

      <Text style={styles.intro}>
        Ducks are one of the most versatile and beginner-friendly livestock
        on the homestead. Whether raising for eggs, meat, or both, proper setup
        and care are key to a healthy flock.
      </Text>

      {/* Duck Basics */}
      <Text style={styles.sectionHeader}>Duck Basics</Text>
      <View style={styles.grid}>
        {ducksSections.map((item) => (
          <Pressable
            key={item}
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: '/screens/field-guide/the-barnyard/animal-basics',
                params: { animal: 'Ducks', topic: item },
              })
            }
          >
            <Text style={styles.buttonText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Duck Types */}
      <Text style={styles.sectionHeader}>Duck Types</Text>
      <View style={styles.grid}>
        {duckTypes.map((item) => (
          <Pressable
            key={item}
            style={styles.buttonAlt}
            onPress={() =>
              router.push({
                pathname: '/screens/field-guide/the-barnyard/animal-type',
                params: { animal: 'Ducks', type: item },
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
                params: { animal: 'Ducks', step: step.name },
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
