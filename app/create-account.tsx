import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateAccountScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const emailTrimmed = email.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
  const passwordValid = password.length >= 8;
  const showPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    emailTrimmed &&
    emailValid &&
    password &&
    passwordValid &&
    confirmPassword &&
    !showPasswordMismatch;
  const showFirstNameError = (firstNameTouched || submitAttempted) && !firstName.trim();
  const showLastNameError = (lastNameTouched || submitAttempted) && !lastName.trim();
  const showEmailRequired = (emailTouched || submitAttempted) && !emailTrimmed;
  const showEmailInvalid = (emailTouched || submitAttempted) && emailTrimmed && !emailValid;
  const showPasswordRequired = (passwordTouched || submitAttempted) && !password;
  const showPasswordWeak = (passwordTouched || submitAttempted) && password && !passwordValid;
  const showConfirmRequired = (confirmTouched || submitAttempted) && !confirmPassword;
  const showConfirmMismatch = (confirmTouched || submitAttempted) && confirmPassword && showPasswordMismatch;
  const errorBorderColor = '#C89B8A';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#EFE6D7' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
      <Pressable onPress={() => router.back()} style={{ marginBottom: 14 }}>
        <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Back</Text>
      </Pressable>

      <View
        style={{
          backgroundColor: '#F8EEDB',
          borderRadius: 22,
          padding: 18,
          borderWidth: 2,
          borderColor: '#D3BFA2',
          shadowColor: '#7A5B3A',
          shadowOpacity: 0.18,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <Text style={{ fontSize: 30, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
          Join the Homestead
        </Text>

        <View
          style={{
            backgroundColor: '#FFF6E8',
            borderRadius: 16,
            padding: 14,
            borderWidth: 1.5,
            borderColor: '#D8C4A8',
            borderStyle: 'dashed',
          }}
        >
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>First name</Text>
        <TextInput
          placeholder="First name"
          placeholderTextColor="#A08974"
          value={firstName}
          onChangeText={setFirstName}
          onBlur={() => setFirstNameTouched(true)}
          style={{
            borderWidth: 1,
            borderColor: showFirstNameError ? errorBorderColor : '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
            marginBottom: 10,
          }}
        />
        {showFirstNameError && (
          <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
            Please fill out all required fields.
          </Text>
        )}

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Last name</Text>
        <TextInput
          placeholder="Last name"
          placeholderTextColor="#A08974"
          value={lastName}
          onChangeText={setLastName}
          onBlur={() => setLastNameTouched(true)}
          style={{
            borderWidth: 1,
            borderColor: showLastNameError ? errorBorderColor : '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
            marginBottom: 10,
          }}
        />
        {showLastNameError && (
          <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
            Please fill out all required fields.
          </Text>
        )}

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Email</Text>
        <TextInput
          placeholder="Email address"
          placeholderTextColor="#A08974"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setEmailTouched(true)}
          style={{
            borderWidth: 1,
            borderColor: showEmailRequired || showEmailInvalid ? errorBorderColor : '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
            marginBottom: 10,
          }}
        />
        {showEmailRequired && (
          <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
            An email address is required.
          </Text>
        )}
        {showEmailInvalid && (
          <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
            That doesn’t look like a valid email.
          </Text>
        )}

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Password</Text>
        <View style={{ position: 'relative', marginBottom: 10 }}>
          <TextInput
            placeholder="Create a password"
            placeholderTextColor="#A08974"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onBlur={() => setPasswordTouched(true)}
            style={{
              borderWidth: 1,
              borderColor: showPasswordRequired || showPasswordWeak ? errorBorderColor : '#D7C9B7',
              borderRadius: 10,
              padding: 10,
              paddingRight: 70,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
              backgroundColor: '#FFFDF6',
            }}
          />
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={{
              position: 'absolute',
              right: 12,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>
        {showPasswordRequired && (
          <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
            Please create a password.
          </Text>
        )}
        {showPasswordWeak && (
          <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
            Your password needs to be at least 8 characters.
          </Text>
        )}

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          Confirm password
        </Text>
        <View style={{ position: 'relative', marginBottom: 6 }}>
          <TextInput
            placeholder="Re-enter your password"
            placeholderTextColor="#A08974"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => setConfirmTouched(true)}
            style={{
              borderWidth: 1,
              borderColor:
                showConfirmRequired || showConfirmMismatch ? errorBorderColor : '#D7C9B7',
              borderRadius: 10,
              padding: 10,
              paddingRight: 70,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
              backgroundColor: '#FFFDF6',
            }}
          />
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={{
              position: 'absolute',
              right: 12,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        </View>
        {showConfirmRequired && (
          <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
            Please re-enter your password.
          </Text>
        )}
        {showConfirmMismatch && (
          <Text style={{ color: '#8B5E3C', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
            Those passwords don’t match.
          </Text>
        )}
        </View>

        <Pressable
          onPress={async () => {
            if (isSubmitting) {
              return;
            }
            setSubmitAttempted(true);
            if (!canSubmit) {
              setMessage('Please fill out all required fields.');
              return;
            }
            setIsSubmitting(true);
            setMessage('');
            const emailRedirectTo = Linking.createURL('auth/callback');
            const { data, error } = await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: { emailRedirectTo },
            });
            if (error) {
              if (/already registered|already exists|user already/i.test(error.message)) {
                setMessage('This email is already tied to an account. Try signing in instead.');
              } else if (/network|failed to fetch|connection/i.test(error.message)) {
                setMessage('Connection lost. Check your internet and try again.');
              } else {
                setMessage('Something went wrong on our end. Please try again.');
              }
              setIsSubmitting(false);
              return;
            }
            if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
              setMessage('This email is already tied to an account. Try signing in instead.');
              setIsSubmitting(false);
              router.replace('/sign-in');
              return;
            }
            try {
              await AsyncStorage.setItem('auth:lastEmail', email.trim());
            } catch {
              // Ignore storage errors.
            }
            setMessage('Welcome to the Homestead. Your account is ready.');
            router.push('/sign-in-confirmation');
            setIsSubmitting(false);
          }}
          style={{
            backgroundColor: canSubmit ? '#7B4E2F' : '#C9B8A6',
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 16,
            borderWidth: 1.5,
            borderColor: canSubmit ? '#5A3A25' : '#B8A48B',
          }}
        >
          <Text style={{ color: '#FFF6E8', fontFamily: 'SedgwickAve', fontSize: 18 }}>
            Create Account
          </Text>
        </Pressable>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12, marginTop: 10 }}>
          By creating an account, you agree to keep things respectful and lawful.{' '}
          <Text style={{ color: '#4C7744' }} onPress={() => Linking.openURL('https://thehc.farm/terms')}>
            Terms
          </Text>
        </Text>
        {!!message && (
          <Text style={{ marginTop: 12, color: '#6E5B4B', fontFamily: 'SedgwickAve', textAlign: 'center' }}>
            {message}
          </Text>
        )}
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
