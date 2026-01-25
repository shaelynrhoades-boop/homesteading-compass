import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

type CalendarWithYearProps = {
  current?: string;
  markedDates?: Record<string, any>;
  onDayPress?: (day: DateData) => void;
  theme?: Record<string, unknown>;
  [key: string]: any;
};

export default function CalendarWithYear({
  current,
  markedDates,
  onDayPress,
  theme,
  ...calendarProps
}: CalendarWithYearProps) {
  const fallbackDate = new Date().toISOString().slice(0, 10);
  const markedDate = useMemo(() => (markedDates ? Object.keys(markedDates)[0] : undefined), [markedDates]);
  const effectiveDate = current ?? markedDate ?? fallbackDate;
  const initial = new Date(effectiveDate);

  const [year, setYear] = useState(
    Number.isNaN(initial.getTime()) ? new Date().getFullYear() : initial.getFullYear()
  );
  const [month, setMonth] = useState(
    Number.isNaN(initial.getTime()) ? new Date().getMonth() + 1 : initial.getMonth() + 1
  );
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let value = 1900; value <= 2100; value += 1) {
      years.push(value);
    }
    return years;
  }, []);

  useEffect(() => {
    const parsed = new Date(effectiveDate);
    if (!Number.isNaN(parsed.getTime())) {
      setYear(parsed.getFullYear());
      setMonth(parsed.getMonth() + 1);
    }
  }, [effectiveDate]);

  const paddedMonth = String(month).padStart(2, '0');
  const calendarCurrent = `${year}-${paddedMonth}-01`;
  const handleDayPress = onDayPress ?? (() => {});

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#E6D9C8',
          backgroundColor: '#F7F1E8',
        }}
      >
        <Pressable
          onPress={() => setYearPickerOpen(true)}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: '#E9DDC9',
            borderWidth: 1,
            borderColor: '#D7C9B7',
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Year: {year}</Text>
        </Pressable>
      </View>
      <Modal transparent visible={yearPickerOpen} animationType="fade" onRequestClose={() => setYearPickerOpen(false)}>
        <Pressable
          onPress={() => setYearPickerOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: '#F7F1E8',
              borderRadius: 16,
              padding: 16,
              maxHeight: '70%',
              borderWidth: 1,
              borderColor: '#E6D9C8',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8, textAlign: 'center' }}>
              Select a Year
            </Text>
            <View style={{ borderTopWidth: 1, borderTopColor: '#E6D9C8' }} />
            <ScrollView style={{ marginTop: 8 }}>
              {yearOptions.map((value) => {
                const selected = value === year;
                return (
                  <Pressable
                    key={`year-option-${value}`}
                    onPress={() => {
                      setYear(value);
                      setYearPickerOpen(false);
                    }}
                    style={{
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: selected ? '#E9DDC9' : 'transparent',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', textAlign: 'center' }}>
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      <Calendar
        {...calendarProps}
        onDayPress={(day) => {
          setYear(day.year);
          setMonth(day.month);
          handleDayPress(day);
        }}
        onMonthChange={(date) => {
          setYear(date.year);
          setMonth(date.month);
        }}
        current={calendarCurrent}
        markedDates={markedDates}
        theme={theme}
      />
    </View>
  );
}
