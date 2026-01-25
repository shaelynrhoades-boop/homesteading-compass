import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

export default function PasswordRecoveryScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 24 }}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Back</Text>
      </Pressable>

      <Text style={{ fontSize: 28, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
        Password Recovery
      </Text>
      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 18 }}>
        Enter your email and we will send reset instructions.
      </Text>

      <View
        style={{
          backgroundColor: '#FFF1D8',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.5,
          borderColor: '#D8C4A8',
          borderStyle: 'dashed',
        }}
      >
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          Email address
        </Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#A08974"
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
          }}
        />
      </View>

      <Pressable
        style={{
          backgroundColor: '#8B5E3C',
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: 'center',
          marginTop: 18,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve', fontSize: 18 }}>
          Send Reset Link
        </Text>
      </Pressable>
    </ScrollView>
  );
}
