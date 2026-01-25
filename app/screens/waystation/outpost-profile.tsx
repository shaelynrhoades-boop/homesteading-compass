import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useHomesteadData } from '../../../context/homestead-data';
import { isOnline, useStatusOverlay } from '../../../context/status-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InfoButton from '../../../components/info-button';

const businessTypes = ['Mom & Pops', 'Small Business', 'Commercial'] as const;

export default function OutpostProfileScreen() {
  const { addOutpostListing } = useHomesteadData();
  const { showStatus } = useStatusOverlay();
  const [businessType, setBusinessType] = useState<(typeof businessTypes)[number] | ''>('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [offerings, setOfferings] = useState('');
  const [description, setDescription] = useState('');
  const [isLivestockBreeder, setIsLivestockBreeder] = useState(false);
  const [breederSpecies, setBreederSpecies] = useState<string[]>([]);
  const [isHiring, setIsHiring] = useState(false);
  const [hiringTitle, setHiringTitle] = useState('');
  const [hiringDescription, setHiringDescription] = useState('');
  const [hiringLink, setHiringLink] = useState('');
  const [helpNeeded, setHelpNeeded] = useState(false);
  const [helpTags, setHelpTags] = useState<string[]>([]);
  const [helpProject, setHelpProject] = useState('');
  const [showOnMap, setShowOnMap] = useState(false);
  const [mapRadiusMiles, setMapRadiusMiles] = useState(10);
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const breederOptions = [
    'Chickens',
    'Ducks',
    'Turkeys',
    'Quail',
    'Rabbits',
    'Goats',
    'Sheep',
    'Cows',
    'Pigs',
    'Horses',
    'Bees',
    'Livestock Guardians',
  ];

  const saveProfile = () => {
    if (!businessType) {
      showStatus('Select a business type', 'error', 1600);
      return;
    }
    if (!name.trim()) {
      showStatus('Log unable to save', 'error', 1400);
      return;
    }
    if (!location.trim()) {
      showStatus('Add a location', 'error', 1600);
      return;
    }
    if (isHiring && !hiringTitle.trim()) {
      showStatus('Add a hiring title', 'error', 1600);
      return;
    }
    if (!isOnline()) {
      showStatus('No internet, logs will not save', 'warning', 1800);
      return;
    }
    showStatus('Log saving...', 'info', 900);
    addOutpostListing({
      id: `${Date.now()}`,
      name: name.trim(),
      type: businessType || 'Small Business',
      location: location.trim(),
      offerings: [
        offerings.trim(),
        isLivestockBreeder && breederSpecies.length > 0
          ? `Livestock breeder: ${breederSpecies.join(', ')}`
          : '',
      ]
        .filter(Boolean)
        .join(' • '),
      description: [
        description.trim(),
        isLivestockBreeder && breederSpecies.length > 0
          ? `Breeds: ${breederSpecies.join(', ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      website: website.trim(),
      email: email.trim(),
      hiringActive: isHiring,
      hiringTitle: hiringTitle.trim(),
      hiringDescription: hiringDescription.trim(),
      hiringLink: hiringLink.trim(),
      helpNeeded,
      helpTags,
      helpProject: helpProject.trim(),
      showOnMap,
      mapRadiusMiles,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
    setTimeout(() => showStatus('Log saved', 'success', 1400), 900);
  };

  const resetDraftFields = () => {
    setBusinessType('');
    setName('');
    setLocation('');
    setOfferings('');
    setDescription('');
    setIsLivestockBreeder(false);
    setBreederSpecies([]);
    setIsHiring(false);
    setHiringTitle('');
    setHiringDescription('');
    setHiringLink('');
    setHelpNeeded(false);
    setHelpTags([]);
    setHelpProject('');
    setShowOnMap(false);
    setMapRadiusMiles(10);
    setWebsite('');
    setEmail('');
  };

  const clearDraft = () => {
    Alert.alert('Clear draft?', 'This removes any in-progress profile data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          resetDraftFields();
          try {
            await AsyncStorage.removeItem('draft:outpost-profile');
          } catch {
            // Ignore storage errors.
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const stored = await AsyncStorage.getItem('draft:outpost-profile');
        if (!stored) {
          setDraftLoaded(true);
          return;
        }
        const draft = JSON.parse(stored);
        if (draft.businessType) setBusinessType(draft.businessType);
        setName(draft.name ?? '');
        setLocation(draft.location ?? '');
        setOfferings(draft.offerings ?? '');
        setDescription(draft.description ?? '');
        setIsLivestockBreeder(!!draft.isLivestockBreeder);
        setBreederSpecies(Array.isArray(draft.breederSpecies) ? draft.breederSpecies : []);
        setIsHiring(!!draft.isHiring);
        setHiringTitle(draft.hiringTitle ?? '');
        setHiringDescription(draft.hiringDescription ?? '');
        setHiringLink(draft.hiringLink ?? '');
        setHelpNeeded(!!draft.helpNeeded);
        setHelpTags(Array.isArray(draft.helpTags) ? draft.helpTags : []);
        setHelpProject(draft.helpProject ?? '');
        setShowOnMap(!!draft.showOnMap);
        if (typeof draft.mapRadiusMiles === 'number') setMapRadiusMiles(draft.mapRadiusMiles);
        setWebsite(draft.website ?? '');
        setEmail(draft.email ?? '');
      } catch {
        // Ignore load errors.
      } finally {
        setDraftLoaded(true);
      }
    };
    void loadDraft();
  }, []);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }
    const persistDraft = async () => {
      try {
        await AsyncStorage.setItem(
          'draft:outpost-profile',
          JSON.stringify({
            businessType,
            name,
            location,
            offerings,
            description,
            isLivestockBreeder,
            breederSpecies,
            isHiring,
            hiringTitle,
            hiringDescription,
            hiringLink,
            helpNeeded,
            helpTags,
            helpProject,
            showOnMap,
            mapRadiusMiles,
            website,
            email,
          })
        );
      } catch {
        // Ignore save errors.
      }
    };
    void persistDraft();
  }, [
    draftLoaded,
    businessType,
    name,
    location,
    offerings,
    description,
    isLivestockBreeder,
    breederSpecies,
    isHiring,
    hiringTitle,
    hiringDescription,
    hiringLink,
    helpNeeded,
    helpTags,
    helpProject,
    showOnMap,
    mapRadiusMiles,
    website,
    email,
  ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 32, textAlign: 'center', color: '#4C7744', fontFamily: 'SedgwickAve' }}>
        Outpost Profile
      </Text>
      <Text
        style={{ fontSize: 16, textAlign: 'center', marginTop: 10, color: '#4C7744', fontFamily: 'SedgwickAve' }}
      >
        Create a listing so locals can find your business.
      </Text>
      <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
        <InfoButton text="Create your Outpost business profile and manage public listings. Connects to: Outpost, Community Map." />
      </View>

      <View
        style={{
          backgroundColor: '#FFF1D8',
          borderRadius: 16,
          padding: 14,
          marginTop: 18,
          borderWidth: 1.5,
          borderColor: '#D8C4A8',
          borderStyle: 'dashed',
        }}
      >
        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Business Type
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {businessTypes.map((type) => (
            <Pressable
              key={type}
              onPress={() => setBusinessType(type)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: businessType === type ? '#8B5E3C' : '#D7C9B7',
                backgroundColor: businessType === type ? '#EADBCB' : '#FFFFFF',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{type}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          placeholder="Business name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#A08974"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
          }}
        />
        <TextInput
          placeholder="Location (city, state)"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#A08974"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
          }}
        />
        <TextInput
          placeholder="What you offer"
          value={offerings}
          onChangeText={setOfferings}
          placeholderTextColor="#A08974"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
          }}
        />
        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Livestock Breeder
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {['Yes', 'No'].map((value) => {
            const selected = (value === 'Yes') === isLivestockBreeder;
            return (
              <Pressable
                key={value}
                onPress={() => setIsLivestockBreeder(value === 'Yes')}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
              </Pressable>
            );
          })}
        </View>
        {isLivestockBreeder && (
          <>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
              Animals bred
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {breederOptions.map((animal) => {
                const selected = breederSpecies.includes(animal);
                return (
                  <Pressable
                    key={animal}
                    onPress={() =>
                      setBreederSpecies((prev) =>
                        prev.includes(animal) ? prev.filter((item) => item !== animal) : [...prev, animal]
                      )
                    }
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                      backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{animal}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Hiring
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {['Yes', 'No'].map((value) => {
            const selected = (value === 'Yes') === isHiring;
            return (
              <Pressable
                key={value}
                onPress={() => setIsHiring(value === 'Yes')}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
              </Pressable>
            );
          })}
        </View>
        {isHiring && (
          <>
            <TextInput
              placeholder="Hiring title (example: Ranch hand)"
              value={hiringTitle}
              onChangeText={setHiringTitle}
              placeholderTextColor="#A08974"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
                backgroundColor: '#FFFDF6',
              }}
            />
            <TextInput
              placeholder="Short hiring description"
              value={hiringDescription}
              onChangeText={setHiringDescription}
              placeholderTextColor="#A08974"
              multiline
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 10,
                padding: 10,
                minHeight: 70,
                marginBottom: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
                backgroundColor: '#FFFDF6',
              }}
            />
            <TextInput
              placeholder="Application link"
              value={hiringLink}
              onChangeText={setHiringLink}
              placeholderTextColor="#A08974"
              keyboardType="url"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
                backgroundColor: '#FFFDF6',
              }}
            />
          </>
        )}
        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Help Needed
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {['Yes', 'No'].map((value) => {
            const selected = (value === 'Yes') === helpNeeded;
            return (
              <Pressable
                key={value}
                onPress={() => setHelpNeeded(value === 'Yes')}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
              </Pressable>
            );
          })}
        </View>
        {helpNeeded && (
          <>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
              Help tags
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {['Fence', 'Building', 'Electrician', 'Plumbing', 'Roofing', 'Landscaping'].map((tag) => {
                const selected = helpTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() =>
                      setHelpTags((prev) =>
                        prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
                      )
                    }
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                      backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{tag}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              placeholder="Project needed (short description)"
              value={helpProject}
              onChangeText={setHelpProject}
              placeholderTextColor="#A08974"
              multiline
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 10,
                padding: 10,
                minHeight: 70,
                marginBottom: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
                backgroundColor: '#FFFDF6',
              }}
            />
          </>
        )}
        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Show on Homestead Map
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {['Yes', 'No'].map((value) => {
            const selected = (value === 'Yes') === showOnMap;
            return (
              <Pressable
                key={value}
                onPress={() => setShowOnMap(value === 'Yes')}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}</Text>
              </Pressable>
            );
          })}
        </View>
        {showOnMap && (
          <>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
              Approximate radius (miles)
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {[5, 10, 25, 50].map((value) => {
                const selected = mapRadiusMiles === value;
                return (
                  <Pressable
                    key={`${value}`}
                    onPress={() => setMapRadiusMiles(value)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                      backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{value}mi</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
        <TextInput
          placeholder="About your business"
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#A08974"
          multiline
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            minHeight: 90,
            marginBottom: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
          }}
        />
        <TextInput
          placeholder="Website"
          value={website}
          onChangeText={setWebsite}
          placeholderTextColor="#A08974"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
          }}
        />
        <TextInput
          placeholder="Contact email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#A08974"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            marginBottom: 12,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
          }}
        />
        <Pressable
          onPress={saveProfile}
          style={{
            backgroundColor: '#8B5E3C',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Save Profile</Text>
        </Pressable>
        <Pressable
          onPress={clearDraft}
          style={{ alignItems: 'center', paddingVertical: 6, marginTop: 6 }}
        >
          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Clear Draft</Text>
        </Pressable>
        {savedMessage && (
          <Text style={{ color: '#4C7744', marginTop: 8, fontFamily: 'SedgwickAve' }}>
            Saved locally for now.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
