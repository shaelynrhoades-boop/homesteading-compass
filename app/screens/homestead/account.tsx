import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import InfoButton from '../../../components/info-button';
import AsyncStorage from '@react-native-async-storage/async-storage';

const usStates = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

const homesteadTypeOptions = ['Backyard', 'Suburban', 'Rural', 'Off-grid', 'Urban'];
const licenseOptions = ['Cottage food', 'Livestock sales', 'Meat processing', 'Other'];
const certificationOptions = ['Organic', 'Humane', 'Pasture-raised', 'Other'];
const skillOptions = ['Mentoring', 'Breeding stock', 'Workshops', 'Education', 'Consulting'];
const familyOptions = ['Family-run', 'Solo'];
const climateZones = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];

export default function AccountScreen() {
  const [homesteadName, setHomesteadName] = useState('');
  const [profileIcon, setProfileIcon] = useState<'F' | 'M' | ''>('');
  const [state, setState] = useState('');
  const [county, setCounty] = useState('');
  const [homesteadTypes, setHomesteadTypes] = useState<string[]>([]);
  const [yearsHomesteading, setYearsHomesteading] = useState('');
  const [householdSize, setHouseholdSize] = useState('');
  const [climateZone, setClimateZone] = useState('');
  const [bio, setBio] = useState('');
  const [sellTrade, setSellTrade] = useState<'yes' | 'no' | ''>('');
  const [businessName, setBusinessName] = useState('');
  const [licenses, setLicenses] = useState<string[]>([]);
  const [licenseOther, setLicenseOther] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certificationOther, setCertificationOther] = useState('');
  const [foundingYear, setFoundingYear] = useState('');
  const [familyType, setFamilyType] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showZonePicker, setShowZonePicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showFamilyPicker, setShowFamilyPicker] = useState(false);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const list: string[] = [];
    for (let year = current; year >= 1950; year -= 1) {
      list.push(String(year));
    }
    return list;
  }, []);

  const toggleMulti = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = await AsyncStorage.getItem('homestead:profile');
        if (!stored) return;
        const parsed = JSON.parse(stored);
        setHomesteadName(parsed.homesteadName ?? '');
        setProfileIcon(parsed.profileIcon ?? '');
        setState(parsed.state ?? '');
        setCounty(parsed.county ?? '');
        setHomesteadTypes(Array.isArray(parsed.homesteadTypes) ? parsed.homesteadTypes : []);
        setYearsHomesteading(parsed.yearsHomesteading ?? '');
        setHouseholdSize(parsed.householdSize ?? '');
        setClimateZone(parsed.climateZone ?? '');
        setBio(parsed.bio ?? '');
        setSellTrade(parsed.sellTrade ?? '');
        setBusinessName(parsed.businessName ?? '');
        setLicenses(Array.isArray(parsed.licenses) ? parsed.licenses : []);
        setLicenseOther(parsed.licenseOther ?? '');
        setCertifications(Array.isArray(parsed.certifications) ? parsed.certifications : []);
        setCertificationOther(parsed.certificationOther ?? '');
        setFoundingYear(parsed.foundingYear ?? '');
        setFamilyType(parsed.familyType ?? '');
        setSkills(Array.isArray(parsed.skills) ? parsed.skills : []);
      } catch {
        // Ignore profile load errors.
      }
    };
    void loadProfile();
  }, []);

  useEffect(() => {
    const persist = async () => {
      try {
        await AsyncStorage.setItem(
          'homestead:profile',
          JSON.stringify({
            homesteadName,
            profileIcon,
            state,
            county,
            homesteadTypes,
            yearsHomesteading,
            householdSize,
            climateZone,
            bio,
            sellTrade,
            businessName,
            licenses,
            licenseOther,
            certifications,
            certificationOther,
            foundingYear,
            familyType,
            skills,
          })
        );
      } catch {
        // Ignore storage errors.
      }
    };
    void persist();
  }, [
    homesteadName,
    profileIcon,
    state,
    county,
    homesteadTypes,
    yearsHomesteading,
    householdSize,
    climateZone,
    bio,
    sellTrade,
    businessName,
    licenses,
    licenseOther,
    certifications,
    certificationOther,
    foundingYear,
    familyType,
    skills,
  ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 20 }}>
      <View style={{ alignItems: 'flex-end', marginBottom: 6 }}>
        <InfoButton text="Manage your profile, preferences, and membership details. Connects to: Settings." />
      </View>
      <Text style={{ fontSize: 28, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
        Account
      </Text>
      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 16 }}>
        Set up your homestead profile. All fields can be updated anytime.
      </Text>
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
        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
          Homestead Profile
        </Text>

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Homestead Name</Text>
        <TextInput
          placeholder="Homestead name"
          placeholderTextColor="#A08974"
          value={homesteadName}
          onChangeText={setHomesteadName}
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
            marginBottom: 12,
          }}
        />

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Profile Icon</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          {[
            { id: 'F', label: 'Female', source: require('../../assets/HCIcons/Icon_SignIn/Icon_ProfileF.png') },
            { id: 'M', label: 'Male', source: require('../../assets/HCIcons/Icon_SignIn/Icon_ProfileM.png') },
          ].map((option) => {
            const selected = profileIcon === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setProfileIcon(option.id as 'F' | 'M')}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                  borderRadius: 12,
                  paddingVertical: 10,
                  alignItems: 'center',
                  backgroundColor: selected ? '#EADBCB' : '#FFFDF6',
                }}
              >
                <Image
                  source={option.source}
                  style={{ width: 70, height: 70, marginBottom: 6 }}
                  resizeMode="contain"
                />
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Location – State</Text>
        <Pressable
          onPress={() => setShowStatePicker((prev) => !prev)}
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            backgroundColor: '#FFFDF6',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            {state || 'Select a state'}
          </Text>
        </Pressable>
        {showStatePicker && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {usStates.map((option) => {
              const selected = state === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setState(option);
                    setShowStatePicker(false);
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Homestead Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {homesteadTypeOptions.map((option) => {
            const selected = homesteadTypes.includes(option);
            return (
              <Pressable
                key={option}
                onPress={() => toggleMulti(option, setHomesteadTypes)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          Location – County or Region
        </Text>
        <TextInput
          placeholder="County or region"
          placeholderTextColor="#A08974"
          value={county}
          onChangeText={setCounty}
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
            marginBottom: 12,
          }}
        />

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Years Homesteading</Text>
        <TextInput
          placeholder="Number of years"
          placeholderTextColor="#A08974"
          value={yearsHomesteading}
          onChangeText={setYearsHomesteading}
          keyboardType="number-pad"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
            marginBottom: 12,
          }}
        />

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Household Size</Text>
        <TextInput
          placeholder="Number of people"
          placeholderTextColor="#A08974"
          value={householdSize}
          onChangeText={setHouseholdSize}
          keyboardType="number-pad"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
            marginBottom: 12,
          }}
        />

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Climate Zone</Text>
        <Pressable
          onPress={() => setShowZonePicker((prev) => !prev)}
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            backgroundColor: '#FFFDF6',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            {climateZone ? `Zone ${climateZone}` : 'Select USDA zone'}
          </Text>
        </Pressable>
        {showZonePicker && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {climateZones.map((option) => {
              const selected = climateZone === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setClimateZone(option);
                    setShowZonePicker(false);
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          Bio / About Our Homestead
        </Text>
        <TextInput
          placeholder="Tell a little about your homestead..."
          placeholderTextColor="#A08974"
          value={bio}
          onChangeText={(text) => setBio(text.slice(0, 400))}
          multiline
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            minHeight: 90,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
            backgroundColor: '#FFFDF6',
            marginBottom: 12,
          }}
        />
        <Text style={{ color: '#A08974', fontFamily: 'SedgwickAve', fontSize: 12, marginBottom: 12 }}>
          {bio.length}/400 characters
        </Text>

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          Do You Sell or Trade?
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {(['yes', 'no'] as const).map((option) => {
            const selected = sellTrade === option;
            return (
              <Pressable
                key={option}
                onPress={() => setSellTrade(option)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                  {option === 'yes' ? 'Yes' : 'No'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {sellTrade === 'yes' && (
          <>
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
              Business Name
            </Text>
            <TextInput
              placeholder="Business name"
              placeholderTextColor="#A08974"
              value={businessName}
              onChangeText={setBusinessName}
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 10,
                padding: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
                backgroundColor: '#FFFDF6',
                marginBottom: 12,
              }}
            />

            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
              Licenses Held
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {licenseOptions.map((option) => {
                const selected = licenses.includes(option);
                return (
                  <Pressable
                    key={option}
                    onPress={() => toggleMulti(option, setLicenses)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                      backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
            {licenses.includes('Other') && (
              <TextInput
                placeholder="Other license"
                placeholderTextColor="#A08974"
                value={licenseOther}
                onChangeText={setLicenseOther}
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  padding: 10,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                  backgroundColor: '#FFFDF6',
                  marginBottom: 12,
                }}
              />
            )}

            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
              Certifications
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {certificationOptions.map((option) => {
                const selected = certifications.includes(option);
                return (
                  <Pressable
                    key={option}
                    onPress={() => toggleMulti(option, setCertifications)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                      backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
            {certifications.includes('Other') && (
              <TextInput
                placeholder="Other certification"
                placeholderTextColor="#A08974"
                value={certificationOther}
                onChangeText={setCertificationOther}
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  padding: 10,
                  color: '#3A2E24',
                  fontFamily: 'SedgwickAve',
                  backgroundColor: '#FFFDF6',
                  marginBottom: 12,
                }}
              />
            )}
          </>
        )}

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          Homestead Founding Year
        </Text>
        <Pressable
          onPress={() => setShowYearPicker((prev) => !prev)}
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            backgroundColor: '#FFFDF6',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            {foundingYear || 'Select year'}
          </Text>
        </Pressable>
        {showYearPicker && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {years.map((option) => {
              const selected = foundingYear === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setFoundingYear(option);
                    setShowYearPicker(false);
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Family-run vs Solo</Text>
        <Pressable
          onPress={() => setShowFamilyPicker((prev) => !prev)}
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 10,
            padding: 10,
            backgroundColor: '#FFFDF6',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            {familyType || 'Select an option'}
          </Text>
        </Pressable>
        {showFamilyPicker && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {familyOptions.map((option) => {
              const selected = familyType === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setFamilyType(option);
                    setShowFamilyPicker(false);
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Skills Offered</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {skillOptions.map((option) => {
            const selected = skills.includes(option);
            return (
              <Pressable
                key={option}
                onPress={() => toggleMulti(option, setSkills)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: '#A08974', fontFamily: 'SedgwickAve', fontSize: 12 }}>
          Business fields are structured for The Farm Stand / Trading Post later. Privacy controls will be added in a
          future update.
        </Text>
      </View>
    </ScrollView>
  );
}
