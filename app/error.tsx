import { useEffect } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

type ErrorBoundaryProps = {
  error: Error;
  retry?: () => void;
};

export default function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('App error boundary caught:', error);
  }, [error]);

  const handleCopy = async () => {
    const payload = `Message: ${error?.message || 'Unknown error'}\nStack: ${error?.stack || 'No stack available'}`;
    try {
      await Clipboard.setStringAsync(payload);
      Alert.alert('Copied', 'Error details copied to clipboard.');
    } catch {
      Alert.alert('Copy failed', 'Unable to copy error details.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 28, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
        Something went wrong
      </Text>
      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 18 }}>
        We hit an unexpected issue. You can try again or return to the home screen.
      </Text>
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        {retry && (
          <Pressable
            onPress={retry}
            style={{
              backgroundColor: '#8B5E3C',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Try Again</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleCopy}
          style={{
            backgroundColor: '#D8C4A8',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Copy Error</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/')}
          style={{
            backgroundColor: '#D8C4A8',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Go Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
