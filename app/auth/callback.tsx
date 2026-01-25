import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AuthCallbackScreen() {
  const [message, setMessage] = useState('Finishing sign-in...');

  useEffect(() => {
    let isMounted = true;

    const handleUrl = async (url: string | null) => {
      if (!url) {
        if (isMounted) {
          setMessage('Missing callback URL.');
        }
        return;
      }

      const { queryParams } = Linking.parse(url);
      const hashParams = url.includes('#') ? new URLSearchParams(url.split('#')[1]) : new URLSearchParams();
      const getParam = (key: string) =>
        (queryParams?.[key] ? String(queryParams[key]) : '') || hashParams.get(key) || '';

      const code = getParam('code');
      const accessToken = getParam('access_token');
      const refreshToken = getParam('refresh_token');
      const token = getParam('token');
      const tokenHash = getParam('token_hash');
      const type = getParam('type');

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
      } else if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change',
          token_hash: tokenHash,
        });
        if (error) {
          throw error;
        }
      } else if (token && type) {
        const { error } = await supabase.auth.verifyOtp({
          type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change',
          token_hash: token,
        });
        if (error) {
          throw error;
        }
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            throw error;
          }
        } else {
          throw new Error('Missing auth tokens. Try opening the newest verification email.');
        }

        if (isMounted) {
          setMessage('Success! Redirecting...');
          router.replace('/(tabs)/the-homestead');
        }
      } catch (error) {
        if (isMounted) {
          const details = error instanceof Error ? error.message : 'Unable to complete sign-in.';
          setMessage(details);
        }
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E1' }}>
      <ActivityIndicator size="large" color="#8B5E3C" />
      <Text style={{ marginTop: 16, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{message}</Text>
      {message.toLowerCase().includes('missing') && (
        <Pressable onPress={() => router.replace('/sign-in')} style={{ marginTop: 12 }}>
          <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Back to Sign In</Text>
        </Pressable>
      )}
    </View>
  );
}
