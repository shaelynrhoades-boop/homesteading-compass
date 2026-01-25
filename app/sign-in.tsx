import { ImageBackground, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function SignInScreen() {
  const { width, height } = useWindowDimensions();
  const initialHeight = useRef(height);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputWidth = Math.min(360, width * 0.72);
  const inputLeft = (width - inputWidth) / 2 + 28;
  const passwordOffsetX = 34;

  const layoutHeight = initialHeight.current;
  const emailTop = layoutHeight * 0.26;
  const passwordTop = layoutHeight * 0.38;
  const buttonTop = layoutHeight * 0.585;

  return (
    <ImageBackground
      source={require('./assets/HCIcons/Icon_SignIn/HCsigninsheet.png')}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder=""
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={{
              position: 'absolute',
              top: emailTop,
              left: inputLeft,
              width: inputWidth,
              height: 48,
              paddingTop: 6,
              paddingBottom: 6,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
              fontSize: 18,
              backgroundColor: 'rgba(255,255,255,0.0)',
            }}
          />
          <TextInput
            placeholder=""
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={{
              position: 'absolute',
              top: passwordTop,
              left: inputLeft + passwordOffsetX,
              width: inputWidth,
              height: 48,
              paddingTop: 6,
              paddingBottom: 6,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
              fontSize: 18,
              backgroundColor: 'rgba(255,255,255,0.0)',
            }}
          />
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={{
              position: 'absolute',
              top: passwordTop,
              left: inputLeft + passwordOffsetX + inputWidth - 120,
              width: 54,
              height: 48,
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/password-recovery')}
            style={{
              position: 'absolute',
              top: passwordTop + 52,
              left: inputLeft + passwordOffsetX,
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Forgot password?</Text>
          </Pressable>

          <Pressable
            onPress={async () => {
              if (isSubmitting) {
                return;
              }
              setIsSubmitting(true);
              setMessage('');
              const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
              });
              if (error) {
                setMessage(error.message);
                setIsSubmitting(false);
                return;
              }
              setMessage('Signed in! Redirecting...');
              router.replace('/(tabs)/the-homestead');
            }}
            style={{
              position: 'absolute',
              top: buttonTop - 62,
              left: width * 0.2,
              right: width * 0.2,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'rgba(0,0,0,0)',
              alignItems: 'center',
            }}
          />
          <Pressable
            onPress={() => router.push('/create-account')}
            style={{
              position: 'absolute',
              top: buttonTop,
              left: width * 0.2,
              right: width * 0.2,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'rgba(0,0,0,0)',
              alignItems: 'center',
            }}
          />

          <View
            style={{
              position: 'absolute',
              bottom: 130,
              left: width * 0.28,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              gap: 16,
            }}
          >
            <Pressable>
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Privacy Policy</Text>
            </Pressable>
            <Pressable>
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Terms & Conditions</Text>
            </Pressable>
          </View>
          {!!message && (
            <View style={{ position: 'absolute', bottom: 170, left: width * 0.12, right: width * 0.12 }}>
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', textAlign: 'center' }}>{message}</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
