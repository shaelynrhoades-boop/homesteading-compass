import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InfoButton from '../../../components/info-button';

type PedigreeRecord = {
  key: string;
  species: string;
  animalName: string;
  sireName: string;
  damName: string;
  sireSire: string;
  sireDam: string;
  damSire: string;
  damDam: string;
  updatedAt: string;
};

export default function PedigreeScreen() {
  const params = useLocalSearchParams();
  const pedigreeKey = typeof params.pedigreeKey === 'string' ? params.pedigreeKey : '';
  const animalName = typeof params.animalName === 'string' ? params.animalName : '';
  const species = typeof params.species === 'string' ? params.species : '';

  const [sireName, setSireName] = useState('');
  const [damName, setDamName] = useState('');
  const [sireSire, setSireSire] = useState('');
  const [sireDam, setSireDam] = useState('');
  const [damSire, setDamSire] = useState('');
  const [damDam, setDamDam] = useState('');
  const [availableAnimals, setAvailableAnimals] = useState<string[]>([]);
  const [showSirePicker, setShowSirePicker] = useState(false);
  const [showDamPicker, setShowDamPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('homestead:pedigrees');
        if (stored) {
          const parsed = JSON.parse(stored) as Record<string, PedigreeRecord>;
          const record = parsed[pedigreeKey];
          if (record) {
            setSireName(record.sireName ?? '');
            setDamName(record.damName ?? '');
            setSireSire(record.sireSire ?? '');
            setSireDam(record.sireDam ?? '');
            setDamSire(record.damSire ?? '');
            setDamDam(record.damDam ?? '');
          }
        }
      } catch {
        // Ignore load errors.
      }
      try {
        const logBook = await AsyncStorage.getItem('homestead:log-book');
        if (logBook) {
          const parsed = JSON.parse(logBook);
          const logs = Array.isArray(parsed?.livestockLogs) ? parsed.livestockLogs : [];
          const names = logs
            .filter((entry) => entry?.species === species && entry?.animalName)
            .map((entry) => entry.animalName as string);
          setAvailableAnimals(Array.from(new Set(names)));
        }
      } catch {
        // Ignore errors.
      }
    };
    void load();
  }, [pedigreeKey, species]);

  const savePedigree = async () => {
    if (!pedigreeKey) {
      Alert.alert('Missing pedigree key', 'Please return and open the pedigree form again.');
      return;
    }
    const record: PedigreeRecord = {
      key: pedigreeKey,
      species,
      animalName,
      sireName: sireName.trim(),
      damName: damName.trim(),
      sireSire: sireSire.trim(),
      sireDam: sireDam.trim(),
      damSire: damSire.trim(),
      damDam: damDam.trim(),
      updatedAt: new Date().toISOString(),
    };
    try {
      const stored = await AsyncStorage.getItem('homestead:pedigrees');
      const parsed = stored ? (JSON.parse(stored) as Record<string, PedigreeRecord>) : {};
      parsed[pedigreeKey] = record;
      await AsyncStorage.setItem('homestead:pedigrees', JSON.stringify(parsed));
      Alert.alert('Pedigree saved', 'Your pedigree record has been saved.');
      router.back();
    } catch {
      Alert.alert('Save failed', 'Unable to save pedigree right now.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 20 }}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Back</Text>
      </Pressable>
      <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
        <InfoButton text="Build a 3-generation pedigree. You can link parents from existing animals or enter names manually." />
      </View>

      <Text
        style={{
          fontSize: 30,
          textAlign: 'center',
          color: '#3A2E24',
          marginBottom: 12,
          fontFamily: 'SedgwickAve',
        }}
      >
        Pedigree
      </Text>
      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', textAlign: 'center', marginBottom: 12 }}>
        {animalName || 'Unnamed'} • {species || 'Livestock'}
      </Text>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 }}>
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Parents</Text>

        <TextInput
          placeholder="Sire (father)"
          value={sireName}
          onChangeText={setSireName}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />
        {availableAnimals.length > 0 && (
          <>
            <Pressable onPress={() => setShowSirePicker((prev) => !prev)} style={{ marginBottom: 10 }}>
              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>
                {showSirePicker ? 'Hide animal list' : 'Link sire from existing animals'}
              </Text>
            </Pressable>
            {showSirePicker && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {availableAnimals.map((name) => (
                  <Pressable
                    key={`sire-${name}`}
                    onPress={() => {
                      setSireName(name);
                      setShowSirePicker(false);
                    }}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      backgroundColor: '#FFF8EE',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

        <TextInput
          placeholder="Dam (mother)"
          value={damName}
          onChangeText={setDamName}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />
        {availableAnimals.length > 0 && (
          <>
            <Pressable onPress={() => setShowDamPicker((prev) => !prev)} style={{ marginBottom: 10 }}>
              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>
                {showDamPicker ? 'Hide animal list' : 'Link dam from existing animals'}
              </Text>
            </Pressable>
            {showDamPicker && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {availableAnimals.map((name) => (
                  <Pressable
                    key={`dam-${name}`}
                    onPress={() => {
                      setDamName(name);
                      setShowDamPicker(false);
                    }}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      backgroundColor: '#FFF8EE',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Grandparents</Text>
        <TextInput
          placeholder="Sire's sire"
          value={sireSire}
          onChangeText={setSireSire}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />
        <TextInput
          placeholder="Sire's dam"
          value={sireDam}
          onChangeText={setSireDam}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />
        <TextInput
          placeholder="Dam's sire"
          value={damSire}
          onChangeText={setDamSire}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />
        <TextInput
          placeholder="Dam's dam"
          value={damDam}
          onChangeText={setDamDam}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />

        <Pressable
          onPress={savePedigree}
          style={{
            backgroundColor: '#8B5E3C',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save Pedigree</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
