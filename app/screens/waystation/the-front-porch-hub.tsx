import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import SafeImage from '../../../components/safe-image';
import InfoButton from '../../../components/info-button';

export default function FrontPorchHubScreen() {
  const categories = ['Q & As', 'Marketplace', 'Events', 'Offering Support'];
  const posts = [
    {
      id: 'post-1',
      name: 'Ann Morris',
      subtitle: 'Three Duck Farm • Carboro, NC',
      body: 'My blue egg laying Ameraucanas are starting to hatch! Very adorable little chicks so far!',
      meta: 'Posted 28m',
    },
    {
      id: 'post-2',
      name: 'Tim Parker',
      subtitle: 'Crooked Pine Ranch • Radford, VA',
      body: 'Pros and cons of solar fencing for pastured sheep?',
      meta: 'Posted 29m',
    },
    {
      id: 'post-3',
      name: 'Chelsea Thompson',
      subtitle: 'Creekside Herbs • Shepherdstown, WV',
      body: 'Community Herb Workshop next Saturday! I’ll be showing how to make tinctures and salves.',
      meta: 'Posted 1h',
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#E8D9C6' }} contentContainerStyle={{ paddingBottom: 32 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <SafeImage
        source={require('../../assets/HCIcons/Icon_Waystation/TheFrontPorchHubTop.png')}
        style={{ width: '100%', height: 220 }}
        resizeMode="cover"
      />

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
          <InfoButton text="Share updates, ask questions, and connect with nearby homesteaders. Connects to: Waystation." />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {categories.map((category, index) => (
            <Pressable
              key={category}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: '#3A2E24',
                backgroundColor: index === 0 ? '#6B4E3D' : '#C9B8A6',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: index === 0 ? '#F7E9D4' : '#3A2E24',
                  fontFamily: 'SedgwickAve',
                  fontSize: 12,
                }}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </View>

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
          <Text style={{ fontSize: 18, marginBottom: 10, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            Community Posts
          </Text>
          {posts.map((post) => (
            <View
              key={post.id}
              style={{
                borderWidth: 1,
                borderColor: '#E2D4C1',
                borderRadius: 12,
                padding: 10,
                marginBottom: 10,
                backgroundColor: '#FFF7E6',
              }}
            >
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: '#D9C2A5',
                    borderWidth: 1,
                    borderColor: '#A88C70',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18 }}>🌾</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 16 }}>
                    {post.name}
                  </Text>
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                    {post.subtitle}
                  </Text>
                </View>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                  {post.meta}
                </Text>
              </View>
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 8 }}>
                {post.body}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
