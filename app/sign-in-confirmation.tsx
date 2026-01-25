import { Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export default function SignInConfirmationScreen() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadEmail = async () => {
      try {
        const stored = await AsyncStorage.getItem('auth:lastEmail');
        if (stored) {
          setEmail(stored);
        }
      } catch {
        // Ignore storage errors.
      }
    };
    void loadEmail();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 24 }}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Back</Text>
      </Pressable>

      <Text style={{ fontSize: 28, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
        Check Your Email
      </Text>
      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
        Verify your email to finish setting up your account.
      </Text>

      <View
        style={{
          marginTop: 18,
          backgroundColor: '#FFF1D8',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1.5,
          borderColor: '#D8C4A8',
          borderStyle: 'dashed',
        }}
      >
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
          Open the verification email and tap the link to complete sign-in.
        </Text>
      </View>

      <Pressable
        onPress={async () => {
          if (!email || isSending) {
            return;
          }
          setIsSending(true);
          setStatus('');
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
          });
          if (error) {
            setStatus(error.message);
            setIsSending(false);
            return;
          }
          setStatus('Verification email sent.');
          setIsSending(false);
        }}
        style={{
          marginTop: 18,
          backgroundColor: '#8B5E3C',
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: 'center',
          opacity: email ? 1 : 0.6,
        }}
        disabled={!email || isSending}
      >
        <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve', fontSize: 16 }}>
          Resend Verification Email
        </Text>
      </Pressable>
      {!!status && (
        <Text style={{ marginTop: 10, color: '#6E5B4B', fontFamily: 'SedgwickAve', textAlign: 'center' }}>
          {status}
        </Text>
      )}
    </ScrollView>
  );
}
