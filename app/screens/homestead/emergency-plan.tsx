import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import InfoButton from '../../../components/info-button';

export default function EmergencyPlanScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 28, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
        Emergency Plan
      </Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <InfoButton text="Keep emergency contacts, protocols, and supplies organized in one place. Connects to: Quick Notes." />
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
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Emergency Contacts</Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 12 }}>
          Add contacts for vets, neighbors, and local services.
        </Text>
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Plans & Checklists</Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
          Draft evacuation steps, supply lists, and animal care notes.
        </Text>
      </View>
    </ScrollView>
  );
}
