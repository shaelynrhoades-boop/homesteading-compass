import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

type TypeContent = {
  summary: string;
  bullets: string[];
};

const typeTemplates: Record<string, TypeContent> = {
  'Meat Chickens': {
    summary: 'Fast-growing birds raised for efficient meat production.',
    bullets: [
      'Plan for rapid growth and higher feed intake.',
      'Focus on clean bedding and steady ventilation.',
      'Schedule processing dates early.',
    ],
  },
  'Egg Layers': {
    summary: 'Birds bred for consistent egg production.',
    bullets: [
      'Provide calcium and clean nesting boxes.',
      'Track egg counts and laying patterns.',
      'Adjust light and feed in winter.',
    ],
  },
  'Meat Ducks': {
    summary: 'Heavier breeds raised for rich, flavorful meat.',
    bullets: [
      'Provide deep bedding and dry footing.',
      'Use higher-protein feed during growth.',
      'Plan processing dates for ideal weight.',
    ],
  },
  'Meat Turkeys': {
    summary: 'Large birds raised for holiday and freezer meat.',
    bullets: [
      'Provide extra space and sturdy roosts.',
      'Use grower feed with balanced protein.',
      'Watch leg health as they gain size.',
    ],
  },
  'Heritage Turkeys': {
    summary: 'Traditional breeds with slower growth and strong foraging traits.',
    bullets: [
      'Provide more space for roaming and foraging.',
      'Expect slower growth compared to commercial birds.',
      'Plan processing dates further out.',
    ],
  },
  'Commercial Turkeys': {
    summary: 'Fast-growing lines bred for efficient meat production.',
    bullets: [
      'Provide sturdy shelter and clean bedding.',
      'Track weight gain and mobility as they grow.',
      'Plan processing dates early.',
    ],
  },
  'Meat Goats': {
    summary: 'Goats raised for meat with hardy, efficient growth.',
    bullets: [
      'Focus on browse, pasture, and minerals.',
      'Track growth rates and body condition.',
      'Plan herd rotations for parasite control.',
    ],
  },
  'Dairy Goats': {
    summary: 'Goats bred for milk production and steady lactation.',
    bullets: [
      'Provide balanced grain and quality hay.',
      'Track milk output and udder health.',
      'Maintain consistent milking routines.',
    ],
  },
  'Fiber Goats': {
    summary: 'Goats raised for mohair or cashmere fiber.',
    bullets: [
      'Schedule shearing and fiber collection.',
      'Keep coats clean and protected from burrs.',
      'Monitor nutrition to support coat quality.',
    ],
  },
  'Dairy Cows': {
    summary: 'Cattle bred for steady, high-volume milk production.',
    bullets: [
      'Maintain a reliable milking schedule.',
      'Track feed intake and milk output.',
      'Watch udder health and mastitis signs.',
    ],
  },
  'Beef Cows': {
    summary: 'Cattle raised for meat with focus on growth and finishing.',
    bullets: [
      'Monitor weight gain and body condition.',
      'Plan finishing diets if needed.',
      'Keep pasture and water access consistent.',
    ],
  },
  'Sheep Wool': {
    summary: 'Sheep raised for wool production and fiber quality.',
    bullets: [
      'Schedule shearing and fleece care.',
      'Provide shelter to keep wool clean.',
      'Support nutrition for healthy fleece.',
    ],
  },
  'Meat Sheep': {
    summary: 'Sheep raised for meat with strong growth traits.',
    bullets: [
      'Track weight gain and pasture quality.',
      'Plan market weights and processing dates.',
      'Monitor parasite loads closely.',
    ],
  },
  'Dairy Sheep': {
    summary: 'Sheep bred for milk used in cheese and yogurt.',
    bullets: [
      'Provide energy-dense feed during lactation.',
      'Track milk output and lamb needs.',
      'Maintain udder hygiene.',
    ],
  },
  'Fiber Sheep': {
    summary: 'Sheep raised for wool quality and fleece production.',
    bullets: [
      'Schedule shearing and fleece care.',
      'Keep bedding clean to protect fleece.',
      'Support nutrition for fiber growth.',
    ],
  },
  'Meat Pigs': {
    summary: 'Pigs raised for pork with fast growth.',
    bullets: [
      'Provide balanced feed and clean water.',
      'Keep pens dry to protect hooves.',
      'Plan processing weights and dates.',
    ],
  },
  'Heritage Pigs': {
    summary: 'Traditional breeds known for hardiness and flavor.',
    bullets: [
      'Provide space for rooting and grazing.',
      'Expect slower growth and richer meat.',
      'Plan processing dates further out.',
    ],
  },
  'Commercial Pigs': {
    summary: 'Fast-growing lines raised for efficient meat production.',
    bullets: [
      'Use balanced feed to support quick growth.',
      'Monitor weight gain and body condition.',
      'Plan processing dates early.',
    ],
  },
  'Angora Rabbits': {
    summary: 'Rabbits raised for long, spinnable fiber.',
    bullets: [
      'Schedule grooming and fiber harvests.',
      'Keep housing clean to protect coats.',
      'Support nutrition for fiber quality.',
    ],
  },
  'Pet/Companion Rabbits': {
    summary: 'Rabbits raised as companions or for youth projects.',
    bullets: [
      'Provide spacious hutches and enrichment.',
      'Offer balanced pellets and fresh hay.',
      'Handle gently for socialization.',
    ],
  },
  'Meat Rabbits': {
    summary: 'Rabbits raised for efficient meat production.',
    bullets: [
      'Focus on clean cages and steady feed.',
      'Track growth rates by litter.',
      'Plan processing dates early.',
    ],
  },
  'Work Horses': {
    summary: 'Horses bred or trained for farm work and hauling.',
    bullets: [
      'Maintain hoof care and conditioning.',
      'Provide calorie-dense forage.',
      'Plan workload around weather.',
    ],
  },
  'Riding Horses': {
    summary: 'Horses kept for riding, training, or sport.',
    bullets: [
      'Maintain consistent exercise routines.',
      'Track tack fit and saddle health.',
      'Schedule regular farrier visits.',
    ],
  },
  Warmblood: {
    summary: 'Athletic, versatile horses often used for sport.',
    bullets: [
      'Balance conditioning with recovery time.',
      'Provide steady forage and mineral support.',
      'Monitor joints and hoof health.',
    ],
  },
  Coldblood: {
    summary: 'Heavy, calm horses built for pulling and farm work.',
    bullets: [
      'Watch body condition to avoid excess weight.',
      'Provide traction-safe footing.',
      'Keep grooming and hoof care consistent.',
    ],
  },
  Hotblood: {
    summary: 'Sensitive, energetic horses suited for speed and agility.',
    bullets: [
      'Use consistent handling and routines.',
      'Provide turnout and controlled exercise.',
      'Monitor stress and digestion.',
    ],
  },
  Ponies: {
    summary: 'Smaller equines with hardy metabolisms.',
    bullets: [
      'Avoid overfeeding rich pasture.',
      'Use slow-feed hay nets when needed.',
      'Keep hooves trimmed to prevent laminitis.',
    ],
  },
  'Egg Quail': {
    summary: 'Quail raised for small, nutrient-rich eggs.',
    bullets: [
      'Provide high-protein feed and calcium.',
      'Maintain clean nest pads or trays.',
      'Collect eggs frequently.',
    ],
  },
  'Meat Quail': {
    summary: 'Quail raised for meat with short grow-out.',
    bullets: [
      'Use grower feed for fast growth.',
      'Keep brooders warm and dry.',
      'Plan processing dates early.',
    ],
  },
};

export default function AnimalTypeScreen() {
  const params = useLocalSearchParams();
  const animal = typeof params.animal === 'string' ? params.animal : 'Animal';
  const type = typeof params.type === 'string' ? params.type : 'Type';
  const content = typeTemplates[type] ?? {
    summary: `Key notes for raising ${type.toLowerCase()} on your homestead.`,
    bullets: [
      'Match housing and feed to this type.',
      'Track growth or production targets.',
      'Adjust care routines by season.',
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
        {type}
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
        Add more details as you refine your setup.
      </Text>
    </ScrollView>
  );
}
