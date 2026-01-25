import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

type StepContent = {
  summary: string;
  bullets: string[];
  linkHint: string;
};

const stepTemplates: Record<string, StepContent> = {
  Selling: {
    summary: 'Plan for packaging, pricing, and local rules before you sell.',
    bullets: [
      'Review local regulations and labeling rules.',
      'Plan storage, transport, and display.',
      'Set pricing based on costs and demand.',
    ],
    linkHint: 'Connects to: Trading Post, Farm Stand',
  },
  Find: {
    summary: 'Connect with local groups for advice and trades.',
    bullets: [
      'Look for regional clubs or associations.',
      'Ask for mentor recommendations.',
      'Join swaps and community meetups.',
    ],
    linkHint: 'Connects to: Waystation',
  },
  Log: {
    summary: 'Track health, production, and notes over time.',
    bullets: [
      'Record weights, feed changes, and health checks.',
      'Keep breeding and lineage notes.',
      'Store reminders for seasonal tasks.',
    ],
    linkHint: 'Connects to: Log Book',
  },
};

const getStepContent = (step: string): StepContent => {
  if (step.toLowerCase().includes('selling')) {
    return stepTemplates.Selling;
  }
  if (step.toLowerCase().includes('find')) {
    return stepTemplates.Find;
  }
  if (step.toLowerCase().includes('log')) {
    return stepTemplates.Log;
  }
  return {
    summary: 'Plan the next steps to keep your setup moving forward.',
    bullets: [
      'Define the next milestone for this animal.',
      'Gather tools or supplies you need.',
      'Add reminders to the Almanac.',
    ],
    linkHint: 'Connects to: Almanac, Log Book',
  };
};

export default function AnimalNextStepScreen() {
  const params = useLocalSearchParams();
  const animal = typeof params.animal === 'string' ? params.animal : 'Animal';
  const step = typeof params.step === 'string' ? params.step : 'Next Step';
  const content = getStepContent(step);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F4EFE6' }} contentContainerStyle={{ padding: 20 }}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Back</Text>
      </Pressable>

      <Text style={{ fontSize: 26, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
        {animal}
      </Text>
      <Text style={{ fontSize: 20, color: '#6B4E3D', fontFamily: 'SedgwickAve', marginBottom: 16 }}>
        {step}
      </Text>

      <View
        style={{
          backgroundColor: '#FFF1D8',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.5,
          borderColor: '#D8C4A8',
          borderStyle: 'dashed',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
          {content.summary}
        </Text>
        {content.bullets.map((line) => (
          <Text key={line} style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
            - {line}
          </Text>
        ))}
      </View>

      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>{content.linkHint}</Text>
    </ScrollView>
  );
}
