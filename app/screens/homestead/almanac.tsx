import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import CalendarWithYear from '../../../components/calendar-with-year';
import { AlmanacEntry, useHomesteadData } from '../../../context/homestead-data';
import { formatDisplayDate, formatMonthDay } from '../../../lib/format-date';
import InfoButton from '../../../components/info-button';

const eventColors: Record<AlmanacEntry['type'], string> = {
  todo: '#4C7744',
  chore: '#8B5E3C',
  log: '#6B4E3D',
  weather: '#3F7C8C',
  seasonal: '#7A5E9A',
};

const calendarTheme = {
  backgroundColor: '#FFF8EE',
  calendarBackground: '#FFF8EE',
  textSectionTitleColor: '#6B4E3D',
  dayTextColor: '#3A2E24',
  todayTextColor: '#8B5E3C',
  monthTextColor: '#6B4E3D',
  arrowColor: '#6B4E3D',
  textMonthFontFamily: 'SedgwickAve',
  textDayHeaderFontFamily: 'SedgwickAve',
  textDayFontFamily: 'SedgwickAve',
  textDayFontSize: 14,
  textMonthFontSize: 16,
};

const parchmentPanel: ViewStyle = {
  backgroundColor: '#FFF1D8',
  borderRadius: 16,
  padding: 14,
  marginBottom: 16,
  borderWidth: 1.5,
  borderColor: '#D8C4A8',
  borderStyle: 'dashed',
  position: 'relative',
  shadowColor: '#3A2E24',
  shadowOpacity: 0.08,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
};

const stripListPrefix = (label: string) =>
  label.replace(/^Chore:\s*/i, '').replace(/^To-Do:\s*/i, '');

function CornerDots() {
  const dotStyle: ViewStyle = {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8C4A8',
    opacity: 0.6,
  };
  return (
    <>
      <View style={[dotStyle, { top: 8, left: 8 }]} />
      <View style={[dotStyle, { top: 8, right: 8 }]} />
      <View style={[dotStyle, { bottom: 8, left: 8 }]} />
      <View style={[dotStyle, { bottom: 8, right: 8 }]} />
    </>
  );
}

function ParchmentPanel({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[parchmentPanel, style]}>
      <CornerDots />
      {children}
    </View>
  );
}

export default function AlmanacScreen() {
  const navigation = useRouter();
  const { almanacEntries } = useHomesteadData();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'year'>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [sourceFilters, setSourceFilters] = useState<string[]>([]);
  const [savedFilters, setSavedFilters] = useState<string[][]>([]);
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedYearOverride, setSelectedYearOverride] = useState<number | null>(null);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const seasonalEntries: AlmanacEntry[] = [
    { id: 'season-1', date: '2025-03-20', label: 'First day of spring', type: 'seasonal', source: 'Seasonal' },
    { id: 'season-2', date: '2025-06-20', label: 'First day of summer', type: 'seasonal', source: 'Seasonal' },
    { id: 'season-3', date: '2025-09-22', label: 'First day of fall', type: 'seasonal', source: 'Seasonal' },
    { id: 'season-4', date: '2025-12-21', label: 'First day of winter', type: 'seasonal', source: 'Seasonal' },
  ];

  const allEntries = [...almanacEntries, ...seasonalEntries];
  const sourceOptions = [
    'To-Do List',
    'Chore List',
    'Garden Log',
    'Garden Plan',
    'Quick Notes',
    'Pantry Log',
    'Harvest Log',
    'Finance Log',
    'Weather',
    'Seasonal',
  ];

  const filteredEntries =
    sourceFilters.length === 0
      ? allEntries
      : allEntries.filter((entry) => sourceFilters.includes(entry.source));

  const entriesByDate = useMemo(() => {
    const grouped: Record<string, AlmanacEntry[]> = {};
    filteredEntries.forEach((entry) => {
      if (!grouped[entry.date]) grouped[entry.date] = [];
      grouped[entry.date].push(entry);
    });
    return grouped;
  }, [filteredEntries]);

  const weekDates = useMemo(() => {
    const base = new Date(`${selectedDay}T12:00:00`);
    const start = new Date(base);
    start.setDate(base.getDate() - base.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day.toISOString().slice(0, 10);
    });
  }, [selectedDay]);

  const weekYear = useMemo(
    () => new Date(`${selectedDay}T12:00:00`).getFullYear(),
    [selectedDay]
  );
  const selectedYear = useMemo(() => {
    if (selectedYearOverride) {
      return selectedYearOverride;
    }
    return new Date(`${selectedDay}T12:00:00`).getFullYear();
  }, [selectedDay, selectedYearOverride]);

  const yearOptions = useMemo(() => {
    const start = selectedYear - 5;
    return Array.from({ length: 11 }, (_, index) => start + index);
  }, [selectedYear]);

  const shiftSelectedDay = (days: number) => {
    const base = new Date(`${selectedDay}T12:00:00`);
    base.setDate(base.getDate() + days);
    setSelectedDay(base.toISOString().slice(0, 10));
    setSelectedYearOverride(null);
  };

  const jumpToMonth = (monthIndex: number) => {
    const date = new Date(`${selectedYear}-01-01T12:00:00`);
    date.setMonth(monthIndex, 1);
    setSelectedDay(date.toISOString().slice(0, 10));
    setSelectedYearOverride(selectedYear);
    setViewMode('month');
  };

  const markedDates = useMemo(() => {
    const marked: Record<string, { dots: { key: string; color: string }[] }> = {};
    filteredEntries.forEach((item) => {
      if (!marked[item.date]) {
        marked[item.date] = { dots: [] };
      }
      marked[item.date].dots.push({ key: item.id, color: item.color ?? eventColors[item.type] });
    });
    return marked;
  }, [filteredEntries]);

  const upcoming = [...filteredEntries].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F0E1' }} contentContainerStyle={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 36,
          textAlign: 'center',
          color: '#3A2E24',
          marginTop: 6,
          marginBottom: 0,
          fontFamily: 'SedgwickAve',
        }}
      >
        The Almanac
      </Text>
      <View style={{ alignItems: 'flex-end', marginBottom: 2 }}>
        <InfoButton text="The Almanac automatically connects with your Chore List, To-Do List, Logs, Quick Notes, and the Farmer-Focused Weather feature so your Homestead stays aligned day by day." />
      </View>

      <Text
        style={{
          fontSize: 16,
          textAlign: 'center',
          color: '#3A2E24',
          marginBottom: 2,
          fontFamily: 'SedgwickAve',
        }}
      >
        Your living homestead calendar — tracking chores, seasons, weather, and daily rhythms all in one place,
        with Weather Guides that translate advisories into what to check, prep, and watch for.
      </Text>

      <ParchmentPanel>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {(['day', 'week', 'month', 'year'] as const).map((mode) => {
            const selected = viewMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => setViewMode(mode)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: selected ? '#6B4E3D' : '#D7C9B7',
                  backgroundColor: selected ? '#EADBCB' : '#FFFDF6',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                  {mode === 'month' ? 'Monthly' : mode === 'week' ? 'Weekly' : mode === 'day' ? 'Daily' : 'Yearly'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={() => setShowFilters((prev) => !prev)}
          style={{
            borderWidth: 1,
            borderColor: '#D7C9B7',
            borderRadius: 8,
            paddingVertical: 6,
            paddingHorizontal: 10,
            alignSelf: 'flex-start',
            marginBottom: 10,
            backgroundColor: '#FFFDF6',
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Text>
        </Pressable>
        {showFilters && (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#E2D4C1',
              borderRadius: 12,
              padding: 10,
              marginBottom: 12,
              backgroundColor: '#FFFDF6',
            }}
          >
            <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>
              Show sources
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {sourceOptions.map((source) => {
                const selected = sourceFilters.includes(source);
                return (
                  <Pressable
                    key={source}
                    onPress={() =>
                      setSourceFilters((prev) =>
                        prev.includes(source)
                          ? prev.filter((item) => item !== source)
                          : [...prev, source]
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
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{source}</Text>
                  </Pressable>
                );
              })}
            </View>
            {savedFilters.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {savedFilters.map((filterSet, index) => (
                  <Pressable
                    key={`saved-${index}`}
                    onPress={() => setSourceFilters(filterSet)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      backgroundColor: '#FFFDF6',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                      Saved {index + 1}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Pressable
              onPress={() => {
                if (sourceFilters.length === 0) {
                  return;
                }
                setSavedFilters((prev) => [...prev, sourceFilters]);
              }}
              style={{ marginBottom: 8 }}
            >
              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Save filters</Text>
            </Pressable>
            <Pressable onPress={() => setSourceFilters([])}>
              <Text style={{ color: '#4C7744', fontFamily: 'SedgwickAve' }}>Clear filters</Text>
            </Pressable>
          </View>
        )}

        {viewMode === 'month' && (
          <CalendarWithYear
            current={selectedDay}
            markingType="multi-dot"
            markedDates={markedDates}
            theme={calendarTheme}
          />
        )}

        {viewMode === 'week' && (
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E2D4C1',
              padding: 10,
              backgroundColor: '#FFF7E6',
            }}
          >
            <Text style={{ color: '#6B4E3D', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
              Sunday - Saturday • {weekYear}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Pressable
                onPress={() => shiftSelectedDay(-7)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  backgroundColor: '#FFFDF6',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>‹ Prev week</Text>
              </Pressable>
              <Pressable
                onPress={() => shiftSelectedDay(7)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  backgroundColor: '#FFFDF6',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Next week ›</Text>
              </Pressable>
            </View>
            {weekDates.map((date) => {
              const dayEntries = entriesByDate[date] ?? [];
              const dayName = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
                weekday: 'short',
              });
              const chores = dayEntries.filter((entry) => entry.type === 'chore');
              const todos = dayEntries.filter((entry) => entry.type === 'todo');
              const weather = dayEntries.filter((entry) => entry.type === 'weather');
              return (
                <View
                  key={date}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E2D4C1',
                    borderRadius: 10,
                    overflow: 'hidden',
                    marginBottom: 10,
                  }}
                >
                  <View style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#E2D4C1', backgroundColor: '#F7ECD6' }}>
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                      {dayName} • {formatMonthDay(date)}
                    </Text>
                  </View>
                  <View style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#E2D4C1' }}>
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Chores</Text>
                    {chores.length === 0 ? (
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>-</Text>
                    ) : (
                      chores.map((item) => (
                        <View key={item.id} style={{ marginBottom: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: item.color ?? eventColors[item.type],
                                marginRight: 6,
                              }}
                            />
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                              {stripListPrefix(item.label)}
                            </Text>
                          </View>
                          {item.details ? (
                            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 11, marginLeft: 12 }}>
                              {item.details}
                            </Text>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                  <View style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#E2D4C1' }}>
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>To-Do</Text>
                    {todos.length === 0 ? (
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>-</Text>
                    ) : (
                      todos.map((item) => (
                        <View key={item.id} style={{ marginBottom: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: item.color ?? eventColors[item.type],
                                marginRight: 6,
                              }}
                            />
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                              {stripListPrefix(item.label)}
                            </Text>
                          </View>
                          {item.details ? (
                            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 11, marginLeft: 12 }}>
                              {item.details}
                            </Text>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                  <View style={{ padding: 8 }}>
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                      Weather Alerts
                    </Text>
                    {weather.length === 0 ? (
                      <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>-</Text>
                    ) : (
                      weather.map((item) => (
                        <View key={item.id} style={{ marginBottom: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: item.color ?? eventColors[item.type],
                                marginRight: 6,
                              }}
                            />
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 12 }}>
                              {stripListPrefix(item.label)}
                            </Text>
                          </View>
                          {item.details ? (
                            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 11, marginLeft: 12 }}>
                              {item.details}
                            </Text>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {viewMode === 'day' && (
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E2D4C1',
              padding: 12,
              backgroundColor: '#FFF7E6',
            }}
          >
            <Text style={{ color: '#6B4E3D', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
              {new Date(`${selectedDay}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' })} • {formatDisplayDate(selectedDay)}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Pressable
                onPress={() => shiftSelectedDay(-1)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  backgroundColor: '#FFFDF6',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>‹ Prev day</Text>
              </Pressable>
              <Pressable
                onPress={() => shiftSelectedDay(1)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  backgroundColor: '#FFFDF6',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Next day ›</Text>
              </Pressable>
            </View>
            {(() => {
              const dayEntries = entriesByDate[selectedDay] ?? [];
              const chores = dayEntries.filter((entry) => entry.type === 'chore');
              const todos = dayEntries.filter((entry) => entry.type === 'todo');
              const weather = dayEntries.filter((entry) => entry.type === 'weather');
              return (
                <>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#E2D4C1',
                      borderRadius: 10,
                      overflow: 'hidden',
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#E2D4C1' }}>
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Chores</Text>
                      {chores.length === 0 ? (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>-</Text>
                      ) : (
                        chores.map((item) => (
                          <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: item.color ?? eventColors[item.type],
                                marginRight: 6,
                              }}
                            />
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                              {stripListPrefix(item.label)}
                            </Text>
                          </View>
                        ))
                      )}
                    </View>
                    <View style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#E2D4C1' }}>
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>To-Do</Text>
                      {todos.length === 0 ? (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>-</Text>
                      ) : (
                        todos.map((item) => (
                          <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: item.color ?? eventColors[item.type],
                                marginRight: 6,
                              }}
                            />
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                              {stripListPrefix(item.label)}
                            </Text>
                          </View>
                        ))
                      )}
                    </View>
                    <View style={{ padding: 8 }}>
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
                        Weather Alerts
                      </Text>
                      {weather.length === 0 ? (
                        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                          No weather notes logged.
                        </Text>
                      ) : (
                        weather.map((item) => (
                          <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: item.color ?? eventColors[item.type],
                                marginRight: 6,
                              }}
                            />
                            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                              {stripListPrefix(item.label)}
                            </Text>
                          </View>
                        ))
                      )}
                    </View>
                  </View>
                </>
              );
            })()}
          </View>
        )}

        {viewMode === 'year' && (
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E2D4C1',
              padding: 12,
              backgroundColor: '#FFF7E6',
            }}
          >
            <Text style={{ color: '#6B4E3D', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
              Yearly Map
            </Text>
            <Pressable
              onPress={() => setShowYearPicker((prev) => !prev)}
              style={{
                alignSelf: 'flex-start',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#D7C9B7',
                backgroundColor: '#FFFDF6',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{selectedYear}</Text>
            </Pressable>
            {showYearPicker && (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {yearOptions.map((year) => {
                  const selected = year === selectedYear;
                  return (
                    <Pressable
                      key={year}
                      onPress={() => {
                        const date = new Date(`${year}-01-01T12:00:00`);
                        setSelectedDay(date.toISOString().slice(0, 10));
                        setSelectedYearOverride(year);
                        setShowYearPicker(false);
                      }}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                        backgroundColor: selected ? '#EADBCB' : '#FFFFFF',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{year}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
              ].map((month, index) => (
                <Pressable
                  key={month}
                  onPress={() => jumpToMonth(index)}
                  style={{
                    width: '30%',
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    borderRadius: 10,
                    paddingVertical: 6,
                    alignItems: 'center',
                    backgroundColor: '#FFFDF6',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{month}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ParchmentPanel>

      <ParchmentPanel style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
          Upcoming Alerts
        </Text>
        <View style={{ marginTop: 8 }}>
          {upcoming.length === 0 ? (
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              No entries yet. Add a to-do, chore, or log to populate the Almanac.
            </Text>
          ) : (
            <>
              {(showAllUpcoming ? upcoming : upcoming.slice(0, 3)).map((item) => (
                <View key={item.id} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: item.color ?? eventColors[item.type],
                      marginRight: 8,
                      marginTop: 2,
                    }}
                  />
                  <View>
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                      {formatDisplayDate(item.date)} • {stripListPrefix(item.label)}
                    </Text>
                    <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>{item.source}</Text>
                  </View>
                </View>
              ))}
              {upcoming.length > 3 ? (
                <Pressable
                  onPress={() => setShowAllUpcoming((prev) => !prev)}
                  style={{
                    alignSelf: 'flex-start',
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                    marginTop: 2,
                  }}
                >
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                    {showAllUpcoming ? 'Show less' : 'Show more'}
                  </Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
        <Pressable
          onPress={() => {}}
          style={{
            marginTop: 4,
            backgroundColor: '#8B5E3C',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'SedgwickAve' }}>
            Add Reminder
          </Text>
        </Pressable>
      </ParchmentPanel>

      <ParchmentPanel style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          Weather Guides
        </Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
          Weather Guides turn each advisory into clear homestead actions — what to check, what to prep, and what to watch for.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'Drought', type: 'drought' },
            { label: 'Freeze', type: 'freeze' },
            { label: 'Heat Advisory', type: 'heat' },
            { label: 'Thunderstorm', type: 'thunderstorm' },
            { label: 'Ice Storm', type: 'ice' },
            { label: 'Wind Advisory', type: 'wind' },
            { label: 'Hail', type: 'hail' },
            { label: 'Flooding', type: 'flood' },
            { label: 'Tornado Watch', type: 'tornado' },
            { label: 'Air Quality', type: 'smoke' },
            { label: 'Snowstorm', type: 'snow' },
            { label: 'Frost', type: 'frost' },
            { label: 'Heat Index', type: 'humidity' },
            { label: 'Wind Chill', type: 'windchill' },
          ].map((item) => (
            <Pressable
              key={item.type}
              onPress={() => navigation.push(`/screens/homestead/weather-alert-details?type=${item.type}`)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#D7C9B7',
                backgroundColor: '#FFFDF6',
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </ParchmentPanel>

      <ParchmentPanel style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 8, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
          Seasonal Markers
        </Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          First frost • Last frost • First day of spring • First day of summer
        </Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
          These will auto-populate from weather data and location settings later.
        </Text>
      </ParchmentPanel>
      <Text style={{ color: '#6E5B4B', fontSize: 12, fontFamily: 'SedgwickAve', textAlign: 'center' }}>
        Connected sources: To-Do List, Chore List, Garden Logs, Livestock Logs, Weather. Local-only for now.
      </Text>
    </ScrollView>
  );
}
