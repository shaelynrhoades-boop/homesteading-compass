import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Animated, Easing, Image, KeyboardAvoidingView, Platform, View } from 'react-native';
import { HomesteadDataProvider } from '../context/homestead-data';
import { StatusOverlayProvider, useStatusOverlay } from '../context/status-overlay';
import ErrorBoundary from '../components/error-boundary';
import { runDataMigrations } from '../context/data-migrations';
import { recordLastError } from '../context/app-health';
import GlobalActions from '../components/global-actions';
import { ThemeProvider } from '../context/theme';
import { AuthProvider, useAuth } from '../context/auth';

function LoadingScreen() {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const circleSize = 280;
  const arrowSize = 140;
  const arrowCenterOffsetY = 0;
  const arrowVisualOffsetY = 16;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F5F0E1',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: circleSize,
          height: circleSize,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: circleSize / 2,
          overflow: 'hidden',
        }}
      >
        <Image
          source={require('./assets/HCIcons/Icon_Homestead/Icon_CompassNew.png')}
          style={{ width: circleSize, height: circleSize, position: 'absolute' }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Animated.Image
          source={require('./assets/HCIcons/Icon_Homestead/Icon_CompassArrowNew.png')}
          style={{
            width: arrowSize,
            height: arrowSize,
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: -arrowSize / 2,
            marginTop: -arrowSize / 2 - arrowCenterOffsetY + arrowVisualOffsetY,
            transform: [
              { translateY: arrowCenterOffsetY },
              { rotate },
              { translateY: -arrowCenterOffsetY },
            ],
          }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
    </View>
  );
}

function RootLayoutContent() {
  const [fontsLoaded] = useFonts({
    SedgwickAve: require('./assets/fonts/SedgwickAve-Regular.ttf'),
  });
  const [fontFailed, setFontFailed] = useState(false);
  const [minLoadingDone, setMinLoadingDone] = useState(false);
  const { showStatus } = useStatusOverlay();
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const isAuthScreen = segments.length > 0 && ['sign-in', 'create-account', 'password-recovery', 'sign-in-confirmation'].includes(segments[0]);

  useEffect(() => {
    void runDataMigrations();
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (!fontsLoaded) {
      timeout = setTimeout(() => {
        setFontFailed(true);
        void recordLastError('Font load timeout');
      }, 4000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [fontsLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingDone(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const publicRoutes = ['sign-in', 'create-account', 'password-recovery', 'sign-in-confirmation', 'auth'];
    const isPublic = segments.length > 0 && publicRoutes.includes(segments[0]);
    if (!session && !isPublic) {
      router.replace('/sign-in');
      return;
    }
    if (session && isPublic) {
      router.replace('/(tabs)/the-homestead');
    }
  }, [isLoading, router, segments, session]);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }
    const checkAssets = async () => {
      try {
        const response = await fetch('http://localhost:8081/__verify-assets__');
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        if (Array.isArray(payload?.missing) && payload.missing.length > 0) {
          showStatus('Missing assets detected. Run npm run verify-assets.', 'warning', 3000);
        }
      } catch {
        // Ignore dev check errors.
      }
    };
    void checkAssets();
  }, [showStatus]);

  if (!fontsLoaded && !fontFailed) {
    return <LoadingScreen />;
  }

  if (isLoading || !fontsLoaded || !minLoadingDone) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={isAuthScreen ? undefined : Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Stack
          screenOptions={{
            gestureEnabled: true,
            headerShown: false,
            contentStyle: { paddingTop: 44 },
          }}
        >
          {/* Load the tabs folder */}
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false, contentStyle: { paddingTop: 0 } }}
          />
        </Stack>
        <GlobalActions />
        <StatusBar style="auto" />
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HomesteadDataProvider>
        <StatusOverlayProvider>
          <ThemeProvider>
            <AuthProvider>
              <RootLayoutContent />
            </AuthProvider>
          </ThemeProvider>
        </StatusOverlayProvider>
      </HomesteadDataProvider>
    </GestureHandlerRootView>
  );
}
