import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import InfoButton from '../../../components/info-button';
import { evaluateWeatherAlerts } from '../../../data/weather-alerts';
import { useHomesteadData } from '../../../context/homestead-data';
import { isOnline, useStatusOverlay } from '../../../context/status-overlay';


type FarmAlert = {
  id: string;
  title: string;
  summary: string;
  category: 'Fire & Safety' | 'Livestock' | 'Water' | 'Garden & Crops' | 'Weather';
  detailType: 'drought' | 'fire' | 'freeze' | 'rain';
  severity?: 'important' | 'critical';
  actions?: Array<{
    id: string;
    label: string;
    action_kind: string;
    default_chore?: {
      title: string;
      notes: string;
      estimated_minutes: number;
      recurrence: string;
    };
  }>;
  ctas?: Array<{ id: string; label: string; kind: string; target?: string }>;
  why?: string;
};

export default function WeatherScreen() {
  const { addAlmanacEntry, removeAlmanacEntries } = useHomesteadData();
  const { showStatus } = useStatusOverlay();
  const router = useRouter();
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');
  const [manualLocation, setManualLocation] = useState('');
  const [resolvedLocation, setResolvedLocation] = useState('');
  const [geoMatches, setGeoMatches] = useState<string[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial');
  const [isFetching, setIsFetching] = useState(false);
  const [alerts, setAlerts] = useState<FarmAlert[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [audienceFlags, setAudienceFlags] = useState<Record<string, boolean>>({
    has_livestock: true,
    has_garden: true,
    has_logged_water_source: true,
  });
  const [autoAddCriticalChores, setAutoAddCriticalChores] = useState(false);
  const [handledAlerts, setHandledAlerts] = useState<string[]>([]);
  const [snoozedAlerts, setSnoozedAlerts] = useState<Record<string, number>>({});
  const [morningTime, setMorningTime] = useState('7:00 AM');
  const [middayTime, setMiddayTime] = useState('12:00 PM');
  const [eveningTime, setEveningTime] = useState('6:00 PM');
  const [weeklyDigestTime, setWeeklyDigestTime] = useState('Sunday 6:00 PM');
  const [todaySunsetTime, setTodaySunsetTime] = useState<string | null>(null);
  const [timePickerField, setTimePickerField] = useState<null | 'morning' | 'midday' | 'evening' | 'weekly'>(null);
  const [currentConditions, setCurrentConditions] = useState<{
    temperature: number;
    temperatureApparent: number;
    humidity: number;
    windSpeed: number;
    precipitationProbability: number;
    weatherCode: number;
  } | null>(null);
  const [dailyForecast, setDailyForecast] = useState<
    Array<{
      date: string;
      temperatureMax: number;
      temperatureMin: number;
      precipitationProbability: number;
      weatherCode: number;
      sunriseTime?: string;
      sunsetTime?: string;
    }>
  >([]);

  const apiKey = process.env.EXPO_PUBLIC_TOMORROW_API_KEY ?? '';

  const weatherCodeLabel = (code: number) => {
    const lookup: Record<number, string> = {
      1000: 'Clear',
      1100: 'Mostly Clear',
      1101: 'Partly Cloudy',
      1102: 'Mostly Cloudy',
      1001: 'Cloudy',
      2000: 'Fog',
      2100: 'Light Fog',
      4000: 'Drizzle',
      4001: 'Rain',
      4200: 'Light Rain',
      4201: 'Heavy Rain',
      5000: 'Snow',
      5001: 'Flurries',
      5100: 'Light Snow',
      5101: 'Heavy Snow',
      8000: 'Thunderstorm',
    };
    return lookup[code] ?? 'Weather';
  };

  const formatDayLabel = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem('homestead:weather-settings');
        if (!stored) return;
        const parsed = JSON.parse(stored);
        if (parsed.locationMode === 'gps' || parsed.locationMode === 'manual') {
          setLocationMode(parsed.locationMode);
        }
        if (typeof parsed.manualLocation === 'string') {
          setManualLocation(parsed.manualLocation);
        }
        if (parsed.units === 'imperial' || parsed.units === 'metric') {
          setUnits(parsed.units);
        }
        if (Array.isArray(parsed.activeCategories)) {
          setActiveCategories(parsed.activeCategories);
        }
        if (parsed.audienceFlags && typeof parsed.audienceFlags === 'object') {
          setAudienceFlags((prev) => ({ ...prev, ...parsed.audienceFlags }));
        }
        if (typeof parsed.autoAddCriticalChores === 'boolean') {
          setAutoAddCriticalChores(parsed.autoAddCriticalChores);
        }
        if (typeof parsed.morningTime === 'string') setMorningTime(parsed.morningTime);
        if (typeof parsed.middayTime === 'string') setMiddayTime(parsed.middayTime);
        if (typeof parsed.eveningTime === 'string') setEveningTime(parsed.eveningTime);
        if (typeof parsed.weeklyDigestTime === 'string') setWeeklyDigestTime(parsed.weeklyDigestTime);
        if (Array.isArray(parsed.handledAlerts)) {
          setHandledAlerts(parsed.handledAlerts);
        }
        if (parsed.snoozedAlerts && typeof parsed.snoozedAlerts === 'object') {
          setSnoozedAlerts(parsed.snoozedAlerts);
        }
      } catch {
        // Ignore settings load errors.
      }
    };
    void loadSettings();
  }, []);

  useEffect(() => {
    const persistSettings = async () => {
      try {
        await AsyncStorage.setItem(
          'homestead:weather-settings',
          JSON.stringify({
            locationMode,
            manualLocation,
            units,
            activeCategories,
            audienceFlags,
            autoAddCriticalChores,
            morningTime,
            middayTime,
            eveningTime,
            weeklyDigestTime,
            handledAlerts,
            snoozedAlerts,
          })
        );
      } catch {
        // Ignore settings save errors.
      }
    };
    void persistSettings();
  }, [
    locationMode,
    manualLocation,
    units,
    activeCategories,
    audienceFlags,
    autoAddCriticalChores,
    morningTime,
    middayTime,
    eveningTime,
    weeklyDigestTime,
    handledAlerts,
    snoozedAlerts,
  ]);

  useEffect(() => {
    if (!apiKey || locationMode !== 'manual') {
      setGeoMatches([]);
      return;
    }
    const value = manualLocation.trim();
    if (value.length < 3) {
      setGeoMatches([]);
      return;
    }
    setIsGeocoding(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.tomorrow.io/v4/geocode?text=${encodeURIComponent(value)}&apikey=${apiKey}`
        );
        if (!response.ok) {
          setGeoMatches([]);
          return;
        }
        const data = await response.json();
        const results = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data?.results)
            ? data.data.results
            : [];
        const matches = results
          .map((entry: { name?: string; address?: { formattedAddress?: string; formatted?: string } }) => {
            return entry.name ?? entry.address?.formattedAddress ?? entry.address?.formatted;
          })
          .filter(Boolean)
          .slice(0, 4) as string[];
        setGeoMatches(matches);
      } catch {
        setGeoMatches([]);
      } finally {
        setIsGeocoding(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [apiKey, manualLocation, locationMode]);


  const generateAlerts = (
    forecast: Array<{
      date: string;
      temperatureMax: number;
      temperatureMin: number;
      precipitationProbability: number;
    }>,
    conditions: typeof currentConditions
  ) => {
    if (!forecast.length) return [];
    const normalized = forecast.map((day) => ({
      temperatureMax: day.temperatureMax,
      temperatureMin: day.temperatureMin,
      precipitationProbability: day.precipitationProbability,
    }));
    const evaluated = evaluateWeatherAlerts(
      normalized,
      conditions?.windSpeed ?? 0,
      units,
      audienceFlags
    );
    return evaluated.map((alert) => ({
      id: alert.id,
      title: alert.title,
      summary: alert.summary,
      category:
        alert.category === 'safety'
          ? 'Fire & Safety'
          : alert.category === 'garden'
            ? 'Garden & Crops'
            : alert.category === 'livestock'
              ? 'Livestock'
              : alert.category === 'water'
                ? 'Water'
                : 'Weather',
      detailType: alert.detailType,
      severity: alert.severity,
      actions: alert.actions,
      ctas: alert.ctas,
      why: alert.why,
    }));
  };

  const queueChores = async (alert: FarmAlert) => {
    if (!alert.actions) return;
    const choreActions = alert.actions.filter((action) => action.action_kind === 'chore' && action.default_chore);
    if (!choreActions.length) return;
    const stored = await AsyncStorage.getItem('homestead:queued-chores');
    const existing = stored ? JSON.parse(stored) : [];
    const queued = Array.isArray(existing) ? existing : [];
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const nextItems = [
      ...queued,
      ...choreActions.map((action) => ({
        id: `${alert.id}-${action.id}`,
        title: action.default_chore?.title ?? action.label,
        notes: action.default_chore?.notes ?? '',
        frequency: 'As needed',
        due: [todayName],
        color: alert.category === 'Fire & Safety' ? '#B65C3A' : '#8B5E3C',
      })),
    ].filter(
      (item, index, self) => self.findIndex((entry) => entry.id === item.id) === index
    );
    await AsyncStorage.setItem('homestead:queued-chores', JSON.stringify(nextItems));
  };

  const filteredAlerts = useMemo(() => {
    const now = Date.now();
    const base = alerts.filter((alert) => !handledAlerts.includes(alert.id));
    const unsnoozed = base.filter((alert) => {
      const snoozeUntil = snoozedAlerts[alert.id];
      return !snoozeUntil || snoozeUntil <= now;
    });
    if (!activeCategories.length) return unsnoozed;
    return unsnoozed.filter((alert) => activeCategories.includes(alert.category));
  }, [alerts, activeCategories, handledAlerts, snoozedAlerts]);

  const toggleCategory = (value: string) => {
    setActiveCategories((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const markHandled = (alertId: string) => {
    setHandledAlerts((prev) => (prev.includes(alertId) ? prev : [...prev, alertId]));
    showStatus("You're all set for today.", 'success', 1400);
  };

  const snoozeAlert = (alertId: string, hours: number) => {
    const until = Date.now() + hours * 60 * 60 * 1000;
    setSnoozedAlerts((prev) => ({ ...prev, [alertId]: until }));
    showStatus(`Snoozed for ${hours} hours.`, 'info', 1200);
  };

  const snoozeUntilTomorrow = (alertId: string) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0);
    setSnoozedAlerts((prev) => ({ ...prev, [alertId]: tomorrow.getTime() }));
    showStatus('Snoozed until tomorrow.', 'info', 1200);
  };

  const getTimeLabelForAction = (actionId: string, actionLabel: string) => {
    if (actionId.includes('EVENING') || actionLabel.toLowerCase().includes('evening')) {
      if (todaySunsetTime) {
        const sunset = new Date(todaySunsetTime);
        if (!Number.isNaN(sunset.getTime())) {
          sunset.setHours(sunset.getHours() - 1);
          return sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }
      }
      return eveningTime;
    }
    if (actionId.includes('BEFORE_NOON') || actionLabel.toLowerCase().includes('morning')) {
      return morningTime;
    }
    if (actionLabel.toLowerCase().includes('observe') || actionLabel.toLowerCase().includes('check')) {
      return middayTime;
    }
    return morningTime;
  };

  const formatTimeLabel = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const getPickerDate = (label: string) => {
    const timePart = label.replace(/^Sunday\s+/i, '');
    const match = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    const date = new Date();
    if (!match) return date;
    const hoursRaw = Number.parseInt(match[1], 10);
    const minutes = Number.parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    let hours = hoursRaw % 12;
    if (ampm === 'PM') hours += 12;
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const handleTimePicked = (date: Date) => {
    const timeLabel = formatTimeLabel(date);
    if (timePickerField === 'morning') {
      setMorningTime(timeLabel);
    } else if (timePickerField === 'midday') {
      setMiddayTime(timeLabel);
    } else if (timePickerField === 'evening') {
      setEveningTime(timeLabel);
    } else if (timePickerField === 'weekly') {
      setWeeklyDigestTime(`Sunday ${timeLabel}`);
    }
  };

  const getNextSundayDate = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = (7 - day) % 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + diff);
    return nextSunday.toISOString().slice(0, 10);
  };

  const addAlmanacEventsForAlert = async (alert: FarmAlert) => {
    if (!alert.actions?.length) return false;
    const today = new Date().toISOString().slice(0, 10);
    const stored = await AsyncStorage.getItem('homestead:weather-alert-almanac');
    const existing = stored ? JSON.parse(stored) : {};
    const createdIds: string[] = Array.isArray(existing?.ids) ? existing.ids : [];
    const ids = new Set(createdIds);
    let added = 0;

    alert.actions
      .filter((action) => action.action_kind === 'chore')
      .forEach((action) => {
        const timeLabel = getTimeLabelForAction(action.id, action.label);
        const entryId = `alert-${alert.id}-${action.id}-${today}`;
        if (ids.has(entryId)) return;
        addAlmanacEntry({
          id: entryId,
          date: today,
          label: `${timeLabel} • ${action.label}`,
          type: 'chore',
          source: `Alert: ${alert.category}`,
          color: alert.category === 'Fire & Safety' ? '#B65C3A' : '#8B5E3C',
          details: alert.why ?? alert.summary,
        });
        ids.add(entryId);
        added += 1;
      });

    if (alert.detailType === 'drought') {
      const digestDate = getNextSundayDate();
      const digestId = `alert-${alert.id}-weekly-digest-${digestDate}`;
      if (!ids.has(digestId)) {
        addAlmanacEntry({
          id: digestId,
          date: digestDate,
          label: `${weeklyDigestTime} • Weekly drought digest`,
          type: 'todo',
          source: 'Alert: Drought',
          color: '#8B5E3C',
          details: 'Review drought conditions and adjust water plans.',
        });
        ids.add(digestId);
        added += 1;
      }
    }

    if (added > 0) {
      await AsyncStorage.setItem('homestead:weather-alert-almanac', JSON.stringify({ ids: [...ids] }));
      return true;
    }
    return false;
  };

  const notifyAlerts = async (nextAlerts: FarmAlert[]) => {
    if (!nextAlerts.length) return;
    const stored = await AsyncStorage.getItem('homestead:weather-alert-seen');
    const seen = stored ? JSON.parse(stored) : [];
    const seenSet = new Set<string>(Array.isArray(seen) ? seen : []);
    const newAlerts = nextAlerts.filter((alert) => !seenSet.has(alert.id));
    if (!newAlerts.length) return;
    newAlerts.forEach((alert) => seenSet.add(alert.id));
    await AsyncStorage.setItem('homestead:weather-alert-seen', JSON.stringify([...seenSet]));

    const message = newAlerts[0];
    showStatus(message.title, 'info', 1600);
  };

  const syncForecastToAlmanac = (
    forecast: Array<{
      date: string;
      temperatureMax: number;
      temperatureMin: number;
      precipitationProbability: number;
      weatherCode: number;
    }>
  ) => {
    if (forecast.length === 0) return;
    const ids = forecast.map((day) => `tomorrow-forecast-${day.date}`);
    removeAlmanacEntries(ids);
    forecast.forEach((day) => {
      const unitLabel = units === 'metric' ? 'C' : 'F';
      const summary = [
        weatherCodeLabel(day.weatherCode),
        `High ${Math.round(day.temperatureMax)}°${unitLabel}`,
        `Low ${Math.round(day.temperatureMin)}°${unitLabel}`,
        `${Math.round(day.precipitationProbability)}% precip`,
      ].join(' • ');
      addAlmanacEntry({
        id: `tomorrow-forecast-${day.date}`,
        date: day.date,
        label: `Forecast: ${summary}`,
        type: 'weather',
        source: 'Tomorrow.io',
        color: '#3F7C8C',
      });
    });
  };

  const getLocationQuery = async () => {
    if (locationMode === 'manual') {
      if (!manualLocation.trim()) {
        throw new Error('Enter a city or ZIP code.');
      }
      return manualLocation.trim();
    }

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      throw new Error('Location permission denied.');
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return `${position.coords.latitude},${position.coords.longitude}`;
  };

  const fetchForecast = async () => {
    if (!apiKey) {
      showStatus('Tomorrow.io API key missing', 'warning', 1800);
      Alert.alert('Missing API Key', 'Add EXPO_PUBLIC_TOMORROW_API_KEY to your .env to use Tomorrow.io.');
      return;
    }
    if (!isOnline()) {
      showStatus('No internet, weather unavailable', 'warning', 1800);
      return;
    }
    setIsFetching(true);
    try {
      const location = await getLocationQuery();
      const response = await fetch(
        `https://api.tomorrow.io/v4/weather/forecast?location=${encodeURIComponent(
          location
        )}&apikey=${apiKey}&units=${units}`
      );
      if (!response.ok) {
        throw new Error('Weather service unavailable.');
      }
      const data = await response.json();
      if (data?.location?.name) {
        setResolvedLocation(String(data.location.name));
      } else if (locationMode === 'manual' && manualLocation.trim()) {
        setResolvedLocation(manualLocation.trim());
      }
      const rawTimelines = data?.timelines ?? data?.data?.timelines;
      const timelines = Array.isArray(rawTimelines)
        ? rawTimelines
        : rawTimelines && typeof rawTimelines === 'object'
          ? Object.entries(rawTimelines).map(([key, intervals]) => ({
              timestep: key === 'daily' ? '1d' : key === 'hourly' ? '1h' : key,
              intervals,
            }))
          : [];
      const hourly = timelines.find((timeline: { timestep: string }) => timeline.timestep === '1h');
      const daily = timelines.find((timeline: { timestep: string }) => timeline.timestep === '1d');

      if (!timelines.length) {
        throw new Error('Weather service response missing timelines.');
      }

      if (hourly?.intervals?.length) {
        const current = hourly.intervals[0].values;
        setCurrentConditions({
          temperature: Number(current.temperature ?? 0),
          temperatureApparent: Number(current.temperatureApparent ?? current.temperature ?? 0),
          humidity: Number(current.humidity ?? 0),
          windSpeed: Number(current.windSpeed ?? 0),
          precipitationProbability: Number(current.precipitationProbability ?? 0),
          weatherCode: Number(current.weatherCode ?? 1000),
        });
      }

      const nextDaily =
        daily?.intervals
          ?.map((entry: { startTime?: string; time?: string; timestamp?: string; values: Record<string, number | string> }) => {
            const dateValue = entry.startTime ?? entry.time ?? entry.timestamp;
            if (!dateValue) {
              return null;
            }
            return {
              date: dateValue.slice(0, 10),
              temperatureMax: Number(entry.values.temperatureMax ?? 0),
              temperatureMin: Number(entry.values.temperatureMin ?? 0),
              precipitationProbability: Number(entry.values.precipitationProbability ?? 0),
              weatherCode: Number(entry.values.weatherCode ?? 1000),
              sunriseTime: entry.values.sunriseTime ? String(entry.values.sunriseTime) : undefined,
              sunsetTime: entry.values.sunsetTime ? String(entry.values.sunsetTime) : undefined,
            };
          })
          .filter(Boolean) ?? [];
      if (nextDaily.length > 0) {
        const today = new Date().toISOString().slice(0, 10);
        const todayEntry = nextDaily.find((day) => day.date === today) ?? nextDaily[0];
        setTodaySunsetTime(todayEntry?.sunsetTime ?? null);
      }
      setDailyForecast(nextDaily);
      syncForecastToAlmanac(nextDaily);
      const generatedAlerts = generateAlerts(nextDaily, currentConditions);
      setAlerts(generatedAlerts);
      if (autoAddCriticalChores) {
        const criticalAlerts = generatedAlerts.filter((alert) => alert.severity === 'critical');
        for (const alert of criticalAlerts) {
          // eslint-disable-next-line no-await-in-loop
          await queueChores(alert);
        }
        if (criticalAlerts.length > 0) {
          showStatus('Critical alert chores added to Chore List.', 'success', 1600);
        }
      }
      void notifyAlerts(generatedAlerts);
      showStatus('Forecast synced to Almanac', 'success', 1600);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load weather.';
      showStatus(message, 'error', 1800);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F1E8D8' }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <View
        style={{
          backgroundColor: '#EADBCB',
          borderRadius: 18,
          padding: 16,
          borderWidth: 1,
          borderColor: '#D6C2AC',
          marginBottom: 18,
          shadowColor: '#3A2E24',
          shadowOpacity: 0.12,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text style={{ fontSize: 30, textAlign: 'center', color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
          Weather
        </Text>
        <Text style={{ textAlign: 'center', color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 4 }}>
          Farmstead Forecasts & Sky Notes
        </Text>
        <View style={{ alignItems: 'flex-end', marginTop: 6 }}>
          <InfoButton text="Forecasts sync to the Almanac for day-by-day planning." />
        </View>
        {resolvedLocation ? (
          <View
            style={{
              alignSelf: 'center',
              marginTop: 10,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#C9B299',
              backgroundColor: '#F7F1E8',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{resolvedLocation}</Text>
          </View>
        ) : null}
      </View>

      <View
        style={{
          backgroundColor: '#FFF8EE',
          borderRadius: 16,
          padding: 16,
          marginTop: 18,
          borderWidth: 1,
          borderColor: '#E2D4C1',
        }}
      >
        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Location</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <Pressable
            onPress={() => setLocationMode('gps')}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: locationMode === 'gps' ? '#4C7744' : '#D7C9B7',
              backgroundColor: locationMode === 'gps' ? '#D8E6D2' : '#FFFFFF',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Use GPS</Text>
          </Pressable>
          <Pressable
            onPress={() => setLocationMode('manual')}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: locationMode === 'manual' ? '#4C7744' : '#D7C9B7',
              backgroundColor: locationMode === 'manual' ? '#D8E6D2' : '#FFFFFF',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Enter location</Text>
          </Pressable>
        </View>
        {locationMode === 'manual' && (
          <View style={{ marginBottom: 10 }}>
            <TextInput
              placeholder="City, State or ZIP"
              value={manualLocation}
              onChangeText={setManualLocation}
              placeholderTextColor="#A89C8E"
              style={{
                borderWidth: 1,
                borderColor: '#D7C9B7',
                borderRadius: 8,
                padding: 10,
                color: '#3A2E24',
                fontFamily: 'SedgwickAve',
                backgroundColor: '#FFFDF7',
              }}
            />
            {isGeocoding ? (
              <Text style={{ marginTop: 6, color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                Looking up location...
              </Text>
            ) : null}
            {geoMatches.length > 0 ? (
              <View style={{ marginTop: 6 }}>
                {geoMatches.map((match) => (
                  <Pressable
                    key={`geo-${match}`}
                    onPress={() => {
                      setManualLocation(match);
                      setResolvedLocation(match);
                      setGeoMatches([]);
                    }}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                      backgroundColor: '#FFF8EE',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{match}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {resolvedLocation ? (
              <Text style={{ marginTop: 6, color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                Closest match: {resolvedLocation}
              </Text>
            ) : null}
          </View>
        )}
        <Text style={{ color: '#3A2E24', marginBottom: 6, fontFamily: 'SedgwickAve' }}>Units</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <Pressable
            onPress={() => setUnits('imperial')}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: units === 'imperial' ? '#8B5E3C' : '#D7C9B7',
              backgroundColor: units === 'imperial' ? '#EADBCB' : '#FFFFFF',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Fahrenheit</Text>
          </Pressable>
          <Pressable
            onPress={() => setUnits('metric')}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: units === 'metric' ? '#8B5E3C' : '#D7C9B7',
              backgroundColor: units === 'metric' ? '#EADBCB' : '#FFFFFF',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Celsius</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={fetchForecast}
          style={{
            backgroundColor: '#4C7744',
            paddingVertical: 10,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#375A33',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>
            {isFetching ? 'Gathering the forecast...' : 'Load Forecast'}
          </Text>
        </Pressable>

        {currentConditions && (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 14,
              padding: 14,
              marginBottom: 12,
              backgroundColor: '#FFFDF7',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 8 }}>
              Current conditions
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 36, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                  {Math.round(currentConditions.temperature)}°{units === 'metric' ? 'C' : 'F'}
                </Text>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  Feels {Math.round(currentConditions.temperatureApparent)}°{units === 'metric' ? 'C' : 'F'}
                </Text>
              </View>
              <View>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  {weatherCodeLabel(currentConditions.weatherCode)}
                </Text>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  Wind {Math.round(currentConditions.windSpeed)}
                </Text>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  Humidity {Math.round(currentConditions.humidity)}%
                </Text>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  Precip {Math.round(currentConditions.precipitationProbability)}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {dailyForecast.length > 0 && (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#D7C9B7',
              borderRadius: 12,
              padding: 12,
              backgroundColor: '#FFFDF7',
            }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 10 }}>
              7-day outlook
            </Text>
            {dailyForecast.slice(0, 7).map((day) => (
              <View
                key={`forecast-${day.date}`}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: '#F4ECE0',
                  borderWidth: 1,
                  borderColor: '#E0D2BE',
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{formatDayLabel(day.date)}</Text>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
                    {Math.round(day.temperatureMax)}°/{Math.round(day.temperatureMin)}°
                  </Text>
                </View>
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                  {weatherCodeLabel(day.weatherCode)} • {Math.round(day.precipitationProbability)}% chance
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View
        style={{
          backgroundColor: '#FFF6E6',
          borderRadius: 16,
          padding: 16,
          marginTop: 18,
          borderWidth: 1,
          borderColor: '#E0C9B0',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Farm Alerts</Text>
          <Pressable
            onPress={() => setActiveCategories([])}
            style={{
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#D7C9B7',
            }}
          >
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Clear Filters</Text>
          </Pressable>
        </View>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 6, marginBottom: 10 }}>
          These alerts turn the forecast into practical homestead actions. Filter by what you raise or grow, then tap a
          button to add today’s chores or view details. Chore timing follows your Morning/Midday/Evening settings below.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {['Fire & Safety', 'Livestock', 'Water', 'Garden & Crops', 'Weather'].map((category) => {
            const selected = activeCategories.includes(category);
            return (
              <Pressable
                key={`alert-filter-${category}`}
                onPress={() => toggleCategory(category)}
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: selected ? '#4C7744' : '#D7C9B7',
                  backgroundColor: selected ? '#D8E6D2' : '#FFFDF7',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{category}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {[
            { key: 'has_livestock', label: 'Livestock' },
            { key: 'has_garden', label: 'Garden' },
            { key: 'has_logged_water_source', label: 'Water Sources' },
          ].map((item) => {
            const selected = audienceFlags[item.key];
            return (
              <Pressable
                key={`audience-${item.key}`}
                onPress={() =>
                  setAudienceFlags((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key],
                  }))
                }
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: selected ? '#8B5E3C' : '#D7C9B7',
                  backgroundColor: selected ? '#EADBCB' : '#FFFDF7',
                }}
              >
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={() => setAutoAddCriticalChores((prev) => !prev)}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: autoAddCriticalChores ? '#4C7744' : '#D7C9B7',
            backgroundColor: autoAddCriticalChores ? '#D8E6D2' : '#FFFDF7',
            alignSelf: 'flex-start',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>
            {autoAddCriticalChores ? 'Auto-add chores on critical alerts' : 'Auto-add chores off'}
          </Text>
        </Pressable>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>Chore timing</Text>
          <View style={{ gap: 8 }}>
            {[
              { key: 'morning', label: 'Morning chores time', value: morningTime },
              { key: 'midday', label: 'Midday checks time', value: middayTime },
              { key: 'evening', label: 'Evening top-off time', value: eveningTime },
              { key: 'weekly', label: 'Weekly drought digest', value: weeklyDigestTime },
            ].map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setTimePickerField(item.key as typeof timePickerField)}
                style={{
                  borderWidth: 1,
                  borderColor: '#D7C9B7',
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: '#FFFDF6',
                }}
              >
                <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', fontSize: 12 }}>{item.label}</Text>
                <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', fontSize: 16 }}>{item.value}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {filteredAlerts.length === 0 ? (
          <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
            No alerts right now. Check back after your next forecast update.
          </Text>
        ) : (
          filteredAlerts.map((alert) => (
            <View
              key={alert.id}
              style={{
                borderWidth: 1,
                borderColor: '#E0D2BE',
                backgroundColor: '#FFFDF7',
                borderRadius: 12,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{alert.title}</Text>
              {alert.severity === 'critical' ? (
                <Text style={{ color: '#8B3A2E', fontFamily: 'SedgwickAve', marginTop: 4 }}>
                  Fire danger is high. Skip anything that throws sparks today.
                </Text>
              ) : null}
              {alert.id === 'LIVESTOCK_DEHYDRATION_RISK' ? (
                <Text style={{ color: '#8B3A2E', fontFamily: 'SedgwickAve', marginTop: 4 }}>
                  If an animal is weak, wobbling, or not drinking — treat this as urgent.
                </Text>
              ) : null}
              {alert.why ? (
                <Text style={{ color: '#7A6A5B', fontFamily: 'SedgwickAve', marginTop: 4 }}>{alert.why}</Text>
              ) : null}
              <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 4 }}>{alert.summary}</Text>
              {alert.actions && alert.actions.length > 0 ? (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 4 }}>
                    Do this today
                  </Text>
                  {alert.actions
                    .filter((action) => action.action_kind === 'chore')
                    .map((action) => (
                      <Text key={action.id} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                        • {action.label}
                      </Text>
                    ))}
                  {alert.actions.some((action) => action.action_kind === 'checklist') ? (
                    <>
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 8, marginBottom: 4 }}>
                        If you’ve got time
                      </Text>
                      {alert.actions
                        .filter((action) => action.action_kind === 'checklist')
                        .map((action) => (
                          <Text key={action.id} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                            • {action.label}
                          </Text>
                        ))}
                    </>
                  ) : null}
                  {alert.actions.some((action) => action.action_kind === 'log_prompt') ? (
                    <>
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve', marginTop: 8, marginBottom: 4 }}>
                        Keep an eye out
                      </Text>
                      {alert.actions
                        .filter((action) => action.action_kind === 'log_prompt')
                        .map((action) => (
                          <Text key={action.id} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
                            • {action.label}
                          </Text>
                        ))}
                    </>
                  ) : null}
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                <Pressable
                  onPress={() => router.push(`/screens/homestead/weather-alert-details?type=${alert.detailType}`)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#4C7744',
                    backgroundColor: '#E2EEDB',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>More info</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    const stored = await AsyncStorage.getItem('homestead:weather-alert-feedback');
                    const feedback = stored ? JSON.parse(stored) : {};
                    feedback[alert.id] = 'useful';
                    await AsyncStorage.setItem('homestead:weather-alert-feedback', JSON.stringify(feedback));
                    showStatus('Thanks for the feedback!', 'success', 1200);
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Useful</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    const stored = await AsyncStorage.getItem('homestead:weather-alert-feedback');
                    const feedback = stored ? JSON.parse(stored) : {};
                    feedback[alert.id] = 'not_useful';
                    await AsyncStorage.setItem('homestead:weather-alert-feedback', JSON.stringify(feedback));
                    showStatus('Thanks for the feedback!', 'success', 1200);
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Not useful</Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                <Pressable
                  onPress={async () => {
                    const added = await addAlmanacEventsForAlert(alert);
                    await queueChores(alert);
                    showStatus(
                      added ? 'Added to your chores for today.' : 'Still dry — keep today’s drought chores going',
                      'success',
                      1400
                    );
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#4C7744',
                    backgroundColor: '#E2EEDB',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Add today’s chores</Text>
                </Pressable>
                <Pressable
                  onPress={() => markHandled(alert.id)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Mark as handled</Text>
                </Pressable>
                {alert.actions?.some((action) => action.action_kind === 'log_prompt') ? (
                  <Pressable
                    onPress={() => {
                      router.push('/screens/homestead/the-log-book');
                      showStatus('Logged — good recordkeeping.', 'success', 1400);
                    }}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: '#D7C9B7',
                    }}
                  >
                    <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Log what you saw</Text>
                  </Pressable>
                ) : null}
                {alert.detailType === 'drought' ? (
                  <>
                    <Pressable
                      onPress={() => {
                        const today = new Date().toISOString().slice(0, 10);
                        const reminderId = `alert-${alert.id}-evening-${today}`;
                        addAlmanacEntry({
                          id: reminderId,
                          date: today,
                          label: `${eveningTime} • Evening top-off reminder`,
                          type: 'todo',
                          source: 'Alert: Drought',
                          color: '#8B5E3C',
                        });
                        showStatus('Reminder set for this evening.', 'success', 1400);
                      }}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#D7C9B7',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Remind me tonight</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        router.push('/screens/homestead/almanac');
                        showStatus('Open drought plan.', 'info', 1200);
                      }}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#D7C9B7',
                      }}
                    >
                      <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Open drought plan</Text>
                    </Pressable>
                  </>
                ) : null}
                <Pressable
                  onPress={() => {
                    router.push('/screens/homestead/almanac');
                    showStatus('View today’s priorities.', 'info', 1200);
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                  }}
                >
                  <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>View today’s priorities</Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                <Pressable
                  onPress={() => snoozeAlert(alert.id, 6)}
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                  }}
                >
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Snooze 6 hours</Text>
                </Pressable>
                <Pressable
                  onPress={() => snoozeUntilTomorrow(alert.id)}
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                  }}
                >
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Snooze until tomorrow</Text>
                </Pressable>
                <Pressable
                  onPress={() => snoozeAlert(alert.id, 72)}
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#D7C9B7',
                  }}
                >
                  <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Quiet for 3 days</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {timePickerField && (
        <DateTimePicker
          value={
            timePickerField === 'morning'
              ? getPickerDate(morningTime)
              : timePickerField === 'midday'
              ? getPickerDate(middayTime)
              : timePickerField === 'evening'
              ? getPickerDate(eveningTime)
              : getPickerDate(weeklyDigestTime)
          }
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (Platform.OS === 'android' && event.type === 'dismissed') {
              setTimePickerField(null);
              return;
            }
            if (date) {
              handleTimePicked(date);
            }
            setTimePickerField(null);
          }}
        />
      )}
    </ScrollView>
  );
}
