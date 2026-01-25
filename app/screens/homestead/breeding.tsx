import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import CalendarWithYear from '../../../components/calendar-with-year';
import InfoButton from '../../../components/info-button';

const dairySpecies = ['Cow', 'Goat', 'Sheep'];
const birthingNotesOptions = [
  'Easy labor',
  'No assistance',
  'Assisted',
  'C-section',
  'Loss',
];

export default function BreedingScreen() {
  const params = useLocalSearchParams();
  const birthdate = typeof params.birthdate === 'string' ? params.birthdate : '';
  const species = typeof params.species === 'string' ? params.species : '';

  const [firstBredDate, setFirstBredDate] = useState<string | null>(null);
  const [showFirstBredCalendar, setShowFirstBredCalendar] = useState(false);
  const [dateBirthed, setDateBirthed] = useState<string | null>(null);
  const [showBirthedCalendar, setShowBirthedCalendar] = useState(false);
  const [bredTo, setBredTo] = useState('');
  const [offspringGirls, setOffspringGirls] = useState('');
  const [offspringBoys, setOffspringBoys] = useState('');
  const [birthingNotes, setBirthingNotes] = useState<string[]>([]);
  const [udderCondition, setUdderCondition] = useState('');
  const [udderNotes, setUdderNotes] = useState('');

  const ageAtFirstBred = useMemo(() => {
    if (!birthdate || !firstBredDate) {
      return '';
    }
    const birth = new Date(`${birthdate}T00:00:00`);
    const bred = new Date(`${firstBredDate}T00:00:00`);
    if (Number.isNaN(birth.getTime()) || Number.isNaN(bred.getTime())) {
      return '';
    }
    const diffMs = bred.getTime() - birth.getTime();
    if (diffMs < 0) {
      return '';
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30.44);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return years > 0 ? `${years}y ${remainingMonths}m` : `${months}m`;
  }, [birthdate, firstBredDate]);

  const toggleNotes = (value: string) => {
    setBirthingNotes((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const udderConditionOptions = ['Excellent', 'Good', 'Fair', 'Needs attention'];

  const submitBreedingRecord = () => {
    Alert.alert('Breeding record saved', 'Your breeding record has been saved.');
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 20 }}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Back</Text>
      </Pressable>
      <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
        <InfoButton text="Record breeding details, dates, and notes for livestock logs. Connects to: Log Book." />
      </View>

      <Text
        style={{
          fontSize: 32,
          textAlign: 'center',
          color: '#3A2E24',
          marginBottom: 12,
          fontFamily: 'SedgwickAve',
        }}
      >
        Breeding Record
      </Text>

      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 }}>
        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          First bred date
        </Text>
        <Pressable
          onPress={() => setShowFirstBredCalendar((prev) => !prev)}
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: firstBredDate ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
            {firstBredDate ?? 'Select date'}
          </Text>
        </Pressable>

        {showFirstBredCalendar && (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 10,
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <CalendarWithYear
              onDayPress={(day) => {
                setFirstBredDate(day.dateString);
                setShowFirstBredCalendar(false);
              }}
              markedDates={
                firstBredDate
                  ? {
                      [firstBredDate]: {
                        selected: true,
                        selectedColor: '#4C7744',
                        selectedTextColor: '#FFFFFF',
                      },
                    }
                  : undefined
              }
              theme={{
                backgroundColor: '#FFFFFF',
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: '#4C7744',
                dayTextColor: '#3A2E24',
                todayTextColor: '#8B5E3C',
                monthTextColor: '#4C7744',
                arrowColor: '#4C7744',
                textMonthFontFamily: 'SedgwickAve',
                textDayHeaderFontFamily: 'SedgwickAve',
                textDayFontFamily: 'SedgwickAve',
                textDayFontSize: 14,
                textMonthFontSize: 16,
              }}
            />
          </View>
        )}

        <Text style={{ color: '#3A2E24', marginBottom: 10, fontFamily: 'SedgwickAve' }}>
          Age at first bred: {ageAtFirstBred || '—'}
        </Text>

        <TextInput
          placeholder="Who bred to"
          value={bredTo}
          onChangeText={setBredTo}
          placeholderTextColor="#A89C8E"
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
            color: '#3A2E24',
            fontFamily: 'SedgwickAve',
          }}
        />

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <TextInput
            placeholder="Girls"
            value={offspringGirls}
            onChangeText={setOffspringGirls}
            placeholderTextColor="#A89C8E"
            keyboardType="number-pad"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />
          <TextInput
            placeholder="Boys"
            value={offspringBoys}
            onChangeText={setOffspringBoys}
            placeholderTextColor="#A89C8E"
            keyboardType="number-pad"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 8,
              padding: 10,
              color: '#3A2E24',
              fontFamily: 'SedgwickAve',
            }}
          />
        </View>

        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Date birthed
        </Text>
        <Pressable
          onPress={() => setShowBirthedCalendar((prev) => !prev)}
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: dateBirthed ? '#3A2E24' : '#A89C8E', fontFamily: 'SedgwickAve' }}>
            {dateBirthed ?? 'Select date'}
          </Text>
        </Pressable>

        {showBirthedCalendar && (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 10,
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <CalendarWithYear
              onDayPress={(day) => {
                setDateBirthed(day.dateString);
                setShowBirthedCalendar(false);
              }}
              markedDates={
                dateBirthed
                  ? {
                      [dateBirthed]: {
                        selected: true,
                        selectedColor: '#4C7744',
                        selectedTextColor: '#FFFFFF',
                      },
                    }
                  : undefined
              }
              theme={{
                backgroundColor: '#FFFFFF',
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: '#4C7744',
                dayTextColor: '#3A2E24',
                todayTextColor: '#8B5E3C',
                monthTextColor: '#4C7744',
                arrowColor: '#4C7744',
                textMonthFontFamily: 'SedgwickAve',
                textDayHeaderFontFamily: 'SedgwickAve',
                textDayFontFamily: 'SedgwickAve',
                textDayFontSize: 14,
                textMonthFontSize: 16,
              }}
            />
          </View>
        )}

        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
          Birthing notes
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {birthingNotesOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => toggleNotes(option)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: birthingNotes.includes(option) ? '#8B5E3C' : '#D7C9B7',
                backgroundColor: birthingNotes.includes(option) ? '#EADBCB' : '#FFFFFF',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
            </Pressable>
          ))}
        </View>

        {dairySpecies.includes(species) && (
          <>
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
              Udder condition rating
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {udderConditionOptions.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setUdderCondition((prev) => (prev === option ? '' : option))}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: udderCondition === option ? '#8B5E3C' : '#D7C9B7',
                    backgroundColor: udderCondition === option ? '#EADBCB' : '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{option}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              placeholder="Udder notes"
              value={udderNotes}
              onChangeText={setUdderNotes}
              placeholderTextColor="#A89C8E"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
              }}
            />
          </>
        )}
        <Pressable
          onPress={submitBreedingRecord}
          style={{
            backgroundColor: '#8B5E3C',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Submit Breeding Record</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
