import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 28, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
        Page not found
      </Text>
      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 16 }}>
        That path does not exist yet. We can take you back to the homestead.
      </Text>
      <View
        style={{
          backgroundColor: '#D8C4A8',
          borderRadius: 10,
          paddingVertical: 10,
          paddingHorizontal: 16,
          alignSelf: 'flex-start',
        }}
      >
        <Link href="/" style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
          Back to Home
        </Link>
      </View>
    </ScrollView>
  );
}
