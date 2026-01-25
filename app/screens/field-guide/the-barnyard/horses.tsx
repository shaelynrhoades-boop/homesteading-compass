import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import InfoButton from '../../../../components/info-button';

const horsesSections = [
  'Housing & Shelter',
  'Fencing & Predator Protection',
  'Feed & Nutrition',
  'Watering Systems',
  'Maintenance',
  'Health & Common Issues',
  'Summer Considerations',
  'Winter Considerations',
];

const horseTypes = ['Warmblood', 'Coldblood', 'Hotblood', 'Ponies'];

const nextSteps = [
  {
    name: 'Buying Horses and Supplies',
    alert:
      'Future topics:\n• Saddle Fitting\n• Buying Horses\n• Local Feed Stores\n• Trailering\n• Tack Store\n\nComing soon 🐎',
  },
  {
    name: 'Find a Horse',
    alert:
      'Will connect to:\n• The Waystation\n• Local stockyards\n• Trades & advice\n\nComing soon 🌱',
  },
  {
    name: 'My Horse Log',
    alert:
      'Will link to:\n• Herd records\n• Farrier Log\n• Health notes\n• Breeding plans\n\nComing soon 📓',
  },
];

export default function Horses() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }} // lifts buttons above soft buttons
    >
      <Text style={styles.title}>Horses</Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <InfoButton text="Basics for horse housing, pasture care, and seasonal health. Connects to: Log Book." />
      </View>

      <Text style={styles.intro}>
        Horses are one of the most versatile and beginner-friendly livestock
        on the homestead. Whether raising for milk, meat, or both, proper setup
        and care are key to a healthy herd.
      </Text>

      {/* Horses Basics */}
      <Text style={styles.sectionHeader}>Horses Basics</Text>
      <View style={styles.grid}>
        {horsesSections.map((item) => (
          <Pressable
            key={item}
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: '/screens/field-guide/the-barnyard/animal-basics',
                params: { animal: 'Horses', topic: item },
              })
            }
          >
            <Text style={styles.buttonText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Horse Types */}
      <Text style={styles.sectionHeader}>Horse Types</Text>
      <View style={styles.grid}>
        {horseTypes.map((item) => (
          <Pressable
            key={item}
            style={styles.buttonAlt}
            onPress={() =>
              router.push({
                pathname: '/screens/field-guide/the-barnyard/animal-type',
                params: { animal: 'Horses', type: item },
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
                params: { animal: 'Horses', step: step.name },
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
