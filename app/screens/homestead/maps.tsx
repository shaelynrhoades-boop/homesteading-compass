import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import InfoButton from '../../../components/info-button';

export default function MapsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 28, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
        Maps
      </Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <InfoButton text="Save homestead maps, property notes, and directions for quick access. Connects to: Community Map." />
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
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Map Library</Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
          Add parcels, pastures, and plot layouts here.
        </Text>
      </View>
    </ScrollView>
  );
}
