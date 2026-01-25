import { Tabs } from 'expo-router';
import { Image, View } from 'react-native';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: {
            fontFamily: 'SedgwickAve',
          },
          tabBarShowLabel: false,
          sceneContainerStyle: {
            paddingTop: 64,
          },
        }}
      >
        {/* Permanent Tabs */}
        <Tabs.Screen
          name="the-homestead"
          options={{
            title: 'The Homestead',
            tabBarIcon: ({ size }) => (
              <Image
                source={require('../assets/HCIcons/Icon_Homestead/ICON_Homestead1.png')}
                style={{ width: size * 4.8, height: size * 4.8, marginTop: 12 }}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            ),
          }}
        />

        <Tabs.Screen
          name="the-field-guide"
          options={{
            title: 'The Field Guide',
            tabBarIcon: ({ size }) => (
              <Image
                source={require('../assets/HCIcons/Icon_FieldGuide/Icon_TheFieldGuide.png')}
                style={{ width: size * 4.8, height: size * 4.8, marginTop: 12 }}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            ),
          }}
        />

        <Tabs.Screen
          name="waystation"
          options={{
            title: 'The Waystation',
            tabBarIcon: ({ size }) => (
              <Image
                source={require('../assets/HCIcons/Icon_Waystation/Icon_TheWaystation.png')}
                style={{ width: size * 4.8, height: size * 4.8, marginTop: 12 }}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
