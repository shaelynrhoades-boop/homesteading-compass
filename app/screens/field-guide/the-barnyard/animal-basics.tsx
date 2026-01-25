import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

type TopicContent = {
  summary: string;
  bullets: string[];
};

const beeTopics: Record<string, TopicContent> = {
  'Hive Setup': {
    summary: 'Start with the right hive style, placement, and equipment for a healthy colony.',
    bullets: [
      'Choose a hive type: Langstroth, Top Bar, or Warre.',
      'Place hives in morning sun with wind protection.',
      'Keep entrances clear and elevated from damp ground.',
      'Have basics ready: smoker, veil, hive tool, feeder.',
    ],
  },
  'Bee Care': {
    summary: 'Regular checks keep the colony productive and calm.',
    bullets: [
      'Inspect brood patterns and queen health.',
      'Watch population levels and space needs.',
      'Check for swarming signs and crowded frames.',
      'Use gentle handling to reduce stress.',
    ],
  },
  'Forage & Environment': {
    summary: 'Strong forage means stronger bees and better honey.',
    bullets: [
      'Plant native blooms with staggered seasons.',
      'Provide clean water sources nearby.',
      'Avoid pesticide drift and treated lawns.',
      'Use supplemental feed during dearths.',
    ],
  },
  'Health & Pests': {
    summary: 'Early detection prevents colony loss.',
    bullets: [
      'Monitor for varroa mites regularly.',
      'Watch for hive beetles and moths.',
      'Recognize foulbrood and viral signs.',
      'Treat with approved methods and timing.',
    ],
  },
  'Seasonal Care': {
    summary: 'Each season needs its own plan.',
    bullets: [
      'Spring: expand space and check queen strength.',
      'Summer: manage heat and swarm pressure.',
      'Fall: feed and treat for mites.',
      'Winter: insulate and reduce drafts.',
    ],
  },
  Harvesting: {
    summary: 'Harvest with care to keep the colony strong.',
    bullets: [
      'Only take capped honey frames.',
      'Leave enough stores for winter.',
      'Use clean tools and food-safe storage.',
      'Save wax for candles or balms.',
    ],
  },
  'Safety & Legal': {
    summary: 'Be safe and compliant with local rules.',
    bullets: [
      'Wear proper protective gear.',
      'Know local registration requirements.',
      'Respect neighbors and property lines.',
      'Have allergy awareness and a plan.',
    ],
  },
};

const topicTemplates: Record<string, TopicContent> = {
  Overview: {
    summary: 'A quick snapshot to orient your setup and daily care.',
    bullets: [
      'Pick a location that stays dry and shaded.',
      'Plan for daily checks and weekly maintenance.',
      'Set up simple routines before adding complexity.',
    ],
  },
  'Housing & Shelter': {
    summary: 'Shelter should be dry, ventilated, and easy to clean.',
    bullets: [
      'Provide space, airflow, and protection from drafts.',
      'Use bedding that absorbs moisture and odor.',
      'Make access easy for cleaning and checks.',
    ],
  },
  'Fencing & Predator Protection': {
    summary: 'Secure fencing prevents escapes and protects from predators.',
    bullets: [
      'Use strong mesh with a buried skirt or apron.',
      'Secure gates and latches against raccoons.',
      'Check for gaps and weak spots weekly.',
    ],
  },
  'Feed & Nutrition': {
    summary: 'Balanced nutrition supports growth, production, and health.',
    bullets: [
      'Provide species-appropriate feed and minerals.',
      'Offer forage or enrichment when safe.',
      'Adjust rations for life stage and season.',
    ],
  },
  'Watering Systems': {
    summary: 'Clean water is essential every day.',
    bullets: [
      'Provide fresh water in easy-to-clean containers.',
      'Keep water shaded to reduce algae.',
      'Prevent freezing in winter with safe heaters.',
    ],
  },
  Maintenance: {
    summary: 'Routine maintenance prevents disease and stress.',
    bullets: [
      'Remove soiled bedding and disinfect surfaces.',
      'Inspect feeders, waterers, and hardware.',
      'Track wear and replace broken items early.',
    ],
  },
  'Health & Common Issues': {
    summary: 'Early observation is your best health tool.',
    bullets: [
      'Watch behavior, appetite, and movement.',
      'Set a parasite and vaccination plan.',
      'Keep a basic first-aid kit on hand.',
    ],
  },
  'Summer Considerations': {
    summary: 'Heat stress prevention keeps animals safe.',
    bullets: [
      'Provide shade and strong airflow.',
      'Increase clean water access.',
      'Schedule chores during cooler hours.',
    ],
  },
  'Winter Considerations': {
    summary: 'Cold weather needs extra protection and calories.',
    bullets: [
      'Block wind while keeping ventilation.',
      'Use deep bedding and dry shelter.',
      'Increase calories as temperatures drop.',
    ],
  },
  Housing: {
    summary: 'Shelter should match working needs and size.',
    bullets: [
      'Provide a secure, dry resting area.',
      'Include a clear line of sight to livestock.',
      'Keep bedding clean and dry.',
    ],
  },
  Feed: {
    summary: 'Nutrition supports stamina and protective behavior.',
    bullets: [
      'Use high-quality feed and fresh water.',
      'Adjust portions based on workload.',
      'Avoid overfeeding to maintain mobility.',
    ],
  },
  Water: {
    summary: 'Reliable water access keeps guardians healthy.',
    bullets: [
      'Provide clean water near patrol zones.',
      'Check daily during heat or freezing weather.',
      "Use sturdy containers that won't tip.",
    ],
  },
  'Seasonal Considerations': {
    summary: 'Plan for heat, cold, and changing workloads.',
    bullets: [
      'Summer: shade, water, and tick checks.',
      'Winter: insulated shelter and extra calories.',
      'Spring/Fall: update parasite prevention.',
    ],
  },
  'Hive Setup': beeTopics['Hive Setup'],
  'Bee Care': beeTopics['Bee Care'],
  'Forage & Environment': beeTopics['Forage & Environment'],
  'Health & Pests': beeTopics['Health & Pests'],
  'Seasonal Care': beeTopics['Seasonal Care'],
  Harvesting: beeTopics.Harvesting,
  'Safety & Legal': beeTopics['Safety & Legal'],
};

export default function AnimalBasicsScreen() {
  const params = useLocalSearchParams();
  const animal = typeof params.animal === 'string' ? params.animal : 'Animal';
  const topic = typeof params.topic === 'string' ? params.topic : 'Basics';
  const content = topicTemplates[topic] ?? {
    summary: `Notes to guide your ${animal.toLowerCase()} setup and care.`,
    bullets: [
      'Start simple and expand as you gain confidence.',
      'Track what works in your Log Book.',
      'Adjust routines for your climate and seasons.',
    ],
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F4EFE6' }} contentContainerStyle={{ padding: 20 }}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Back</Text>
      </Pressable>

      <Text style={{ fontSize: 26, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
        {animal}
      </Text>
      <Text style={{ fontSize: 20, color: '#6B4E3D', fontFamily: 'SedgwickAve', marginBottom: 16 }}>
        {topic}
      </Text>

      <View
        style={{
          backgroundColor: '#FFF1D8',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.5,
          borderColor: '#D8C4A8',
          borderStyle: 'dashed',
          marginBottom: 16,
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

      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
        Add more details here as you learn what works on your homestead.
      </Text>
    </ScrollView>
  );
}
