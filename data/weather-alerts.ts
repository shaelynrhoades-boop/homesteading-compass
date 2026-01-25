export type AlertCategory = 'livestock' | 'garden' | 'water' | 'safety' | 'weather';
export type AlertSeverity = 'important' | 'critical';
export type AlertActionKind = 'chore' | 'checklist' | 'log_prompt' | 'info_ack' | 'reminder';
export type AlertCtaKind =
  | 'bulk_create_chores'
  | 'create_chore'
  | 'open_log'
  | 'create_reminder'
  | 'open_plan';

export type WeatherAlertAction = {
  id: string;
  label: string;
  action_kind: AlertActionKind;
  checklist_items?: string[];
  log_target?: string;
  fields?: string[];
  default_chore?: {
    title: string;
    notes: string;
    estimated_minutes: number;
    recurrence: 'once';
  };
  default_reminder?: {
    title: string;
    time_hint: string;
  };
};

export type WeatherAlertCta = {
  id: string;
  label: string;
  kind: AlertCtaKind;
  target?: string;
  targets?: string[];
  link?: string;
};

export type WeatherAlertConfig = {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title_template: string;
  why_template: string;
  audience_rules?: {
    requires?: string[];
    requires_any?: string[];
  };
  trigger_rules: {
    type: 'drought' | 'garden_stress' | 'water_drop' | 'fire_risk';
    minDryDays?: number;
    minWetDays?: number;
    minWindMph?: number;
    minAvgTempF?: number;
    minTempF?: number;
    maxTempF?: number;
  };
  today_actions: WeatherAlertAction[];
  optional_actions?: WeatherAlertAction[];
  cta_buttons?: WeatherAlertCta[];
  cooldown?: {
    min_hours_between_push: number;
    dismiss_snooze_hours: number[];
  };
  suppression_keys?: string[];
  detail_type: 'drought' | 'fire' | 'freeze' | 'rain';
};

export type WeatherAlert = {
  id: string;
  title: string;
  summary: string;
  category: AlertCategory;
  severity: AlertSeverity;
  detailType: WeatherAlertConfig['detail_type'];
  actions: WeatherAlertAction[];
  ctas: WeatherAlertCta[];
  why: string;
};

export const WEATHER_ALERT_CONFIG: WeatherAlertConfig[] = [
  {
    id: 'LIVESTOCK_DEHYDRATION_RISK',
    category: 'livestock',
    severity: 'important',
    title_template: 'Dehydration risk is elevated today.',
    why_template: 'Heat + drought can raise water needs and stress.',
    audience_rules: { requires: ['has_livestock'] },
    trigger_rules: {
      type: 'drought',
      minDryDays: 5,
      minAvgTempF: 85,
    },
    today_actions: [
      {
        id: 'REFILL_TROUGHS_BEFORE_NOON',
        label: 'Refill all troughs before noon',
        action_kind: 'chore',
        default_chore: {
          title: 'Refill all troughs',
          notes: 'Top off every trough/bucket. Prioritize shade locations.',
          estimated_minutes: 15,
          recurrence: 'once',
        },
      },
      {
        id: 'ADD_EXTRA_WATER_POINTS',
        label: 'Add extra troughs/buckets if available',
        action_kind: 'chore',
        default_chore: {
          title: 'Add extra water points',
          notes: 'Set 1–2 extra buckets/troughs in shaded spots.',
          estimated_minutes: 10,
          recurrence: 'once',
        },
      },
      {
        id: 'MOVE_WATER_TO_SHADE',
        label: 'Move water into shaded areas',
        action_kind: 'chore',
        default_chore: {
          title: 'Move water to shade',
          notes: 'Relocate containers to shade to keep water cooler longer.',
          estimated_minutes: 10,
          recurrence: 'once',
        },
      },
      {
        id: 'CHECK_AUTO_WATERERS',
        label: 'Check automatic waterers (flow + clogs)',
        action_kind: 'checklist',
        checklist_items: ['Confirm water is flowing', 'Clear debris/algae if present', 'Verify float valves move freely'],
      },
      {
        id: 'OBSERVE_ANIMALS_FOR_SIGNS',
        label: 'Observe animals for dehydration signs',
        action_kind: 'log_prompt',
        log_target: 'animal_health',
        fields: ['panting', 'lethargy', 'reduced_feed_intake', 'notes'],
      },
    ],
    optional_actions: [
      {
        id: 'EVENING_REFILL_REMINDER',
        label: 'Plan an evening top-off',
        action_kind: 'reminder',
        default_reminder: { title: 'Evening trough top-off', time_hint: 'sunset_minus_1h' },
      },
    ],
    cta_buttons: [
      {
        id: 'CTA_ADD_TODAY_CHORES',
        label: 'Add today’s chores',
        kind: 'bulk_create_chores',
        targets: ['REFILL_TROUGHS_BEFORE_NOON', 'ADD_EXTRA_WATER_POINTS', 'MOVE_WATER_TO_SHADE'],
      },
      { id: 'CTA_LOG_HYDRATION_CHECK', label: 'Log hydration check', kind: 'open_log', target: 'animal_health' },
      {
        id: 'CTA_REMIND_THIS_EVENING',
        label: 'Remind me this evening',
        kind: 'create_reminder',
        target: 'EVENING_REFILL_REMINDER',
      },
    ],
    cooldown: { min_hours_between_push: 18, dismiss_snooze_hours: [6, 12, 24] },
    suppression_keys: ['drought-main'],
    detail_type: 'drought',
  },
  {
    id: 'GARDEN_CROP_STRESS_RISK',
    category: 'garden',
    severity: 'important',
    title_template: 'Crop stress risk is high today.',
    why_template: 'Heat + low moisture can stunt growth and reduce yields.',
    audience_rules: { requires: ['has_garden'] },
    trigger_rules: {
      type: 'garden_stress',
      minDryDays: 4,
      minAvgTempF: 85,
    },
    today_actions: [
      {
        id: 'WATER_EARLY_ONLY',
        label: 'Water early morning (avoid midday)',
        action_kind: 'chore',
        default_chore: {
          title: 'Morning watering',
          notes: 'Water at dawn/early morning for best efficiency.',
          estimated_minutes: 20,
          recurrence: 'once',
        },
      },
      {
        id: 'PRIORITIZE_TRANSPLANTS_FRUITING',
        label: 'Prioritize transplants + fruiting plants',
        action_kind: 'checklist',
        checklist_items: ['New transplants', 'Fruiting plants', 'Containers/pots'],
      },
      {
        id: 'MULCH_EXPOSED_SOIL',
        label: 'Mulch exposed soil',
        action_kind: 'chore',
        default_chore: {
          title: 'Mulch exposed beds',
          notes: 'Add 2–4 inches of mulch to reduce evaporation.',
          estimated_minutes: 25,
          recurrence: 'once',
        },
      },
      { id: 'SKIP_FERTILIZING_TODAY', label: 'Skip fertilizing today', action_kind: 'info_ack' },
    ],
    cta_buttons: [
      { id: 'CTA_ADD_WATERING_CHORE', label: 'Add morning watering', kind: 'create_chore', target: 'WATER_EARLY_ONLY' },
      { id: 'CTA_LOG_STRESSED_CROPS', label: 'Log stressed crops', kind: 'open_log', target: 'garden_health' },
      { id: 'CTA_DELAY_PLANTING', label: 'Delay planting in Almanac', kind: 'open_plan', target: 'planting' },
    ],
    cooldown: { min_hours_between_push: 24, dismiss_snooze_hours: [12, 24, 48] },
    suppression_keys: ['drought-main'],
    detail_type: 'drought',
  },
  {
    id: 'WATER_SOURCE_DROPPING_FAST',
    category: 'water',
    severity: 'important',
    title_template: 'Water levels are dropping faster than normal.',
    why_template: 'Drought + heat increases evaporation and demand.',
    audience_rules: { requires_any: ['has_logged_water_source', 'has_livestock', 'has_garden'] },
    trigger_rules: { type: 'water_drop', minDryDays: 5, minAvgTempF: 85 },
    today_actions: [
      {
        id: 'MEASURE_AND_LOG_LEVEL',
        label: 'Measure and log water level',
        action_kind: 'log_prompt',
        log_target: 'water_sources',
        fields: ['source', 'level_percent', 'notes'],
      },
      {
        id: 'CHECK_FOR_LEAKS',
        label: 'Check hoses/fittings for leaks',
        action_kind: 'chore',
        default_chore: {
          title: 'Leak check (hoses + fittings)',
          notes: 'Inspect connections, valves, and lines for drips/leaks.',
          estimated_minutes: 15,
          recurrence: 'once',
        },
      },
      {
        id: 'PRIORITIZE_WATER_USE',
        label: 'Prioritize water use: livestock → household → garden',
        action_kind: 'info_ack',
      },
    ],
    cta_buttons: [
      { id: 'CTA_LOG_WATER_LEVEL', label: 'Log water level', kind: 'open_log', target: 'water_sources' },
      { id: 'CTA_ADD_LEAK_CHECK', label: 'Add leak check chore', kind: 'create_chore', target: 'CHECK_FOR_LEAKS' },
      { id: 'CTA_OPEN_WATER_PLAN', label: 'Open drought plan', kind: 'open_plan', target: 'drought_water_plan' },
    ],
    cooldown: { min_hours_between_push: 24, dismiss_snooze_hours: [24, 48, 72] },
    suppression_keys: ['drought-main'],
    detail_type: 'drought',
  },
  {
    id: 'FIRE_RISK_EXTREME',
    category: 'safety',
    severity: 'critical',
    title_template: 'Extreme fire danger today.',
    why_template: 'Dry fuels + heat + wind can turn a spark into a wildfire fast.',
    trigger_rules: { type: 'fire_risk', minDryDays: 3, minWindMph: 20, minAvgTempF: 75 },
    today_actions: [
      {
        id: 'AVOID_SPARK_WORK',
        label: 'Avoid spark work (burning, mowing dry grass, welding)',
        action_kind: 'info_ack',
      },
      {
        id: 'STAGE_WATER_AND_EXTINGUISHERS',
        label: 'Stage hoses/extinguishers where you can reach them fast',
        action_kind: 'chore',
        default_chore: {
          title: 'Stage fire-ready gear',
          notes: 'Check hose connections + place extinguishers in key spots.',
          estimated_minutes: 10,
          recurrence: 'once',
        },
      },
      {
        id: 'CLEAR_DEBRIS_NEAR_BUILDINGS',
        label: 'Clear dry debris near buildings',
        action_kind: 'chore',
        default_chore: {
          title: 'Clear dry debris near buildings',
          notes: 'Rake/clear dry grass, leaves, brush near structures.',
          estimated_minutes: 20,
          recurrence: 'once',
        },
      },
    ],
    cta_buttons: [
      {
        id: 'CTA_LOCK_RISKY_CHORES',
        label: 'Lock risky chores today',
        kind: 'open_plan',
        target: 'fire_safety',
        link: '/screens/homestead/emergency-plan',
      },
      {
        id: 'CTA_REVIEW_WILDFIRE_PLAN',
        label: 'Review wildfire plan',
        kind: 'open_plan',
        target: 'wildfire_plan',
        link: '/screens/homestead/emergency-plan',
      },
      {
        id: 'CTA_ADD_FIRE_READY_CHORES',
        label: 'Add fire-ready chores',
        kind: 'bulk_create_chores',
        targets: ['STAGE_WATER_AND_EXTINGUISHERS', 'CLEAR_DEBRIS_NEAR_BUILDINGS'],
      },
    ],
    cooldown: { min_hours_between_push: 12, dismiss_snooze_hours: [6, 12, 24] },
    suppression_keys: ['fire-main'],
    detail_type: 'fire',
  },
  {
    id: 'FREEZE_ALERT',
    category: 'weather',
    severity: 'important',
    title_template: 'Freezing weather forecasted this week.',
    why_template: 'Nighttime lows are expected to drop below freezing.',
    trigger_rules: { type: 'drought', minTempF: 32 },
    today_actions: [
      {
        id: 'CHECK_WATER_HEATERS',
        label: 'Plug in water heaters and test them',
        action_kind: 'chore',
        default_chore: {
          title: 'Check water heaters',
          notes: 'Test heaters and clear any ice risks early.',
          estimated_minutes: 15,
          recurrence: 'once',
        },
      },
      {
        id: 'INSULATE_LINES',
        label: 'Wrap exposed spigots and hoses',
        action_kind: 'chore',
        default_chore: {
          title: 'Insulate water lines',
          notes: 'Cover exposed spigots, hoses, and shallow lines.',
          estimated_minutes: 20,
          recurrence: 'once',
        },
      },
    ],
    cta_buttons: [
      {
        id: 'CTA_REVIEW_FREEZE_PLAN',
        label: 'View freeze prep list',
        kind: 'open_plan',
        target: 'freeze_plan',
      },
    ],
    cooldown: { min_hours_between_push: 24, dismiss_snooze_hours: [12, 24, 48] },
    suppression_keys: ['freeze-main'],
    detail_type: 'freeze',
  },
  {
    id: 'HEAT_STRESS_ALERT',
    category: 'livestock',
    severity: 'important',
    title_template: 'Heat stress risk for livestock.',
    why_template: 'High temps mean extra shade and water checks.',
    trigger_rules: { type: 'garden_stress', minAvgTempF: 90 },
    today_actions: [
      {
        id: 'SHADE_CHECK',
        label: 'Confirm shade and airflow',
        action_kind: 'chore',
        default_chore: {
          title: 'Shade & airflow check',
          notes: 'Move animals to shade and improve airflow if needed.',
          estimated_minutes: 15,
          recurrence: 'once',
        },
      },
      {
        id: 'COOL_WATER_TOP_OFF',
        label: 'Top off cool water midday',
        action_kind: 'chore',
        default_chore: {
          title: 'Midday water top-off',
          notes: 'Refresh warm troughs during the hottest hours.',
          estimated_minutes: 10,
          recurrence: 'once',
        },
      },
    ],
    cooldown: { min_hours_between_push: 18, dismiss_snooze_hours: [6, 12, 24] },
    suppression_keys: ['heat-main'],
    detail_type: 'drought',
  },
  {
    id: 'HEAVY_RAIN_RUNOFF',
    category: 'garden',
    severity: 'important',
    title_template: 'Heavy rain and runoff risk.',
    why_template: 'Multiple wet days can stress beds and wash out soil.',
    trigger_rules: { type: 'garden_stress', minWetDays: 3 },
    today_actions: [
      {
        id: 'CHECK_DRAINAGE',
        label: 'Check drainage and low spots',
        action_kind: 'chore',
        default_chore: {
          title: 'Check drainage',
          notes: 'Clear channels and protect low beds from pooling.',
          estimated_minutes: 20,
          recurrence: 'once',
        },
      },
      {
        id: 'PAUSE_IRRIGATION',
        label: 'Pause irrigation until beds dry',
        action_kind: 'info_ack',
      },
    ],
    cooldown: { min_hours_between_push: 24, dismiss_snooze_hours: [12, 24, 48] },
    suppression_keys: ['rain-main'],
    detail_type: 'rain',
  },
  {
    id: 'PEST_PRESSURE_ALERT',
    category: 'garden',
    severity: 'important',
    title_template: 'Pest pressure likely to rise.',
    why_template: 'Warm, humid stretches often trigger pests.',
    trigger_rules: { type: 'garden_stress', minWetDays: 2, minAvgTempF: 80 },
    today_actions: [
      {
        id: 'SCOUT_FOR_PESTS',
        label: 'Scout leaves and stems for pests',
        action_kind: 'checklist',
        checklist_items: ['Look under leaves', 'Check new growth', 'Inspect fruiting plants'],
      },
      {
        id: 'LOG_PEST_FINDINGS',
        label: 'Log any pest pressure',
        action_kind: 'log_prompt',
        log_target: 'garden_health',
        fields: ['pest', 'severity', 'notes'],
      },
    ],
    cooldown: { min_hours_between_push: 36, dismiss_snooze_hours: [24, 48, 72] },
    suppression_keys: ['pest-main'],
    detail_type: 'drought',
  },
];

type ForecastDay = {
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
};

type TriggerContext = {
  forecast: ForecastDay[];
  avgTempF: number;
  dryDays: number;
  wetDays: number;
  windMph: number;
  minTempF: number;
};

const toFahrenheit = (value: number, units: 'imperial' | 'metric') => (units === 'metric' ? value * 1.8 + 32 : value);

const buildTriggerContext = (forecast: ForecastDay[], windMph: number, units: 'imperial' | 'metric'): TriggerContext => {
  const avgTempF =
    forecast.reduce((acc, day) => acc + (day.temperatureMax + day.temperatureMin) / 2, 0) /
    Math.max(forecast.length, 1);
  const minTempFValue = Math.min(...forecast.map((day) => day.temperatureMin));
  const dryDays = forecast.filter((day) => day.precipitationProbability <= 20).length;
  const wetDays = forecast.filter((day) => day.precipitationProbability >= 60).length;

  return {
    forecast,
    avgTempF: toFahrenheit(avgTempF, units),
    minTempF: toFahrenheit(minTempFValue, units),
    dryDays,
    wetDays,
    windMph,
  };
};

const passesAudienceRules = (config: WeatherAlertConfig, audienceFlags: Record<string, boolean>) => {
  if (config.audience_rules?.requires) {
    const missing = config.audience_rules.requires.some((flag) => !audienceFlags[flag]);
    if (missing) return false;
  }
  if (config.audience_rules?.requires_any) {
    const anyMatch = config.audience_rules.requires_any.some((flag) => audienceFlags[flag]);
    if (!anyMatch) return false;
  }
  return true;
};

const passesTriggers = (config: WeatherAlertConfig, ctx: TriggerContext) => {
  const rules = config.trigger_rules;
  if (rules.minDryDays && ctx.dryDays < rules.minDryDays) return false;
  if (rules.minWetDays && ctx.wetDays < rules.minWetDays) return false;
  if (rules.minWindMph && ctx.windMph < rules.minWindMph) return false;
  if (rules.minAvgTempF && ctx.avgTempF < rules.minAvgTempF) return false;
  if (rules.minTempF && ctx.minTempF > rules.minTempF) return false;
  return true;
};

export const evaluateWeatherAlerts = (
  forecast: ForecastDay[],
  windMph: number,
  units: 'imperial' | 'metric',
  audienceFlags: Record<string, boolean>
) => {
  const ctx = buildTriggerContext(forecast, windMph, units);
  const activeConfigs = WEATHER_ALERT_CONFIG.filter(
    (config) => passesAudienceRules(config, audienceFlags) && passesTriggers(config, ctx)
  );

  const suppressSet = new Set<string>();
  const result: WeatherAlert[] = [];

  activeConfigs.forEach((config) => {
    if (config.suppression_keys?.some((key) => suppressSet.has(key))) {
      return;
    }
    config.suppression_keys?.forEach((key) => suppressSet.add(key));
    result.push({
      id: config.id,
      title: config.title_template,
      summary: config.title_template,
      category: config.category,
      severity: config.severity,
      detailType: config.detail_type,
      actions: config.today_actions,
      ctas: config.cta_buttons ?? [],
      why: config.why_template,
    });
  });

  return result;
};
