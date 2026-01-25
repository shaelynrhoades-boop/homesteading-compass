import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

type AlertContentBase = {
  title: string;
  description: string;
  garden?: {
    open: string[];
    container: string[];
    greenhouse: string[];
  };
  livestockTemplates?: string[];
  livestockBySpecies?: Record<string, string[]>;
  extraSections?: Array<{ heading: string; tips: string[] }>;
};

const livestockSpecies = [
  'Chicken',
  'Duck',
  'Turkey',
  'Quail',
  'Rabbit',
  'Goat',
  'Sheep',
  'Cow',
  'Pig',
  'Horse',
  'Bee',
  'Livestock Guardian',
];

const livestockExtraTips: Record<string, string> = {
  Chicken: 'Have: Electrolytes and extra drinkers ready.',
  Duck: 'Have: Extra water tubs for cooling and rinsing.',
  Turkey: 'Have: Extra shaded roosting space available.',
  Quail: 'Have: Frozen bottles or tiles for quick cooling.',
  Rabbit: 'Have: Frozen bottles and extra water bottles ready.',
  Goat: 'Have: Minerals and fresh water in every pasture.',
  Sheep: 'Have: Shade and clean water close to grazing.',
  Cow: 'Have: Extra trough capacity and backup water.',
  Pig: 'Have: Wallow access or cooling misters.',
  Horse: 'Have: Electrolytes and clean buckets ready.',
  Bee: 'Have: A clean water source with landing stones.',
  'Livestock Guardian': 'Have: Extra water bowls near patrol routes.',
};

const popularSpecies = ['Chicken', 'Goat', 'Cow', 'Pig', 'Sheep', 'Duck', 'Rabbit', 'Horse'];

const advisoryGroups: Record<string, 'heat' | 'cold' | 'wet' | 'storm' | 'fire'> = {
  drought: 'heat',
  heat: 'heat',
  humidity: 'heat',
  freeze: 'cold',
  snow: 'cold',
  frost: 'cold',
  windchill: 'cold',
  ice: 'cold',
  rain: 'wet',
  flood: 'wet',
  thunderstorm: 'storm',
  tornado: 'storm',
  hail: 'storm',
  wind: 'storm',
  fire: 'fire',
  smoke: 'fire',
};

const popularSpeciesGroupExtras: Record<string, Record<string, string[]>> = {
  heat: {
    Chicken: ['Check: Cool coop early and add extra shade cloth.', 'Watch for: Pale combs or egg drop.'],
    Goat: ['Check: Mineral intake and signs of heat stress.', 'Watch for: Reduced browsing and lagging.'],
    Cow: ['Check: Water flow and shade access mid-day.', 'Watch for: Drooling or reduced cud chewing.'],
    Pig: ['Check: Wallow access and shade coverage.', 'Watch for: Red skin or heavy panting.'],
    Sheep: ['Check: Flock spacing and water access.', 'Watch for: Panting or crowding in shade.'],
    Duck: ['Check: Pool temperature and shade coverage.', 'Watch for: Lethargy after heat spikes.'],
    Rabbit: ['Check: Ear temperature and airflow.', 'Watch for: Heat collapse signs.'],
    Horse: ['Check: Sweating and hydration recovery.', 'Watch for: Rapid breathing after light work.'],
  },
  cold: {
    Chicken: ['Check: Frostbite risk on combs and wattles.', 'Have: Extra bedding for coop floors.'],
    Goat: ['Check: Kid areas for drafts and damp bedding.', 'Have: Extra hay before cold nights.'],
    Cow: ['Check: Waterers for ice buildup.', 'Have: Windbreaks or shelters ready.'],
    Pig: ['Check: Bedding depth for burrowing.', 'Have: Heat lamps secured safely.'],
    Sheep: ['Check: Newborns and thin animals for chill.', 'Have: Extra bedding ready.'],
    Duck: ['Check: Water access without freezing.', 'Have: Dry shelter for wet birds.'],
    Rabbit: ['Check: Hutch drafts and dampness.', 'Have: Straw or insulation ready.'],
    Horse: ['Check: Blanket fit and dryness.', 'Have: Extra hay for warmth.'],
  },
  wet: {
    Chicken: ['Check: Litter dryness and ammonia build-up.', 'Watch for: Muddy run areas.'],
    Goat: ['Check: Hoof trimming needs after wet days.', 'Watch for: Foot rot signs.'],
    Cow: ['Check: Udder cleanliness in muddy areas.', 'Watch for: Mastitis risk.'],
    Pig: ['Check: Pen drainage and dry bedding.', 'Watch for: Skin irritation.'],
    Sheep: ['Check: Feet and wool dryness.', 'Watch for: Foot scald.'],
    Duck: ['Check: Runoff pooling near shelters.', 'Watch for: Wet bedding.'],
    Rabbit: ['Check: Hutch floors for dampness.', 'Watch for: Respiratory issues.'],
    Horse: ['Check: Hoof softness after rain.', 'Watch for: Thrush signs.'],
  },
  storm: {
    Chicken: ['Check: Coop latches before storms.', 'Watch for: Fence damage afterward.'],
    Goat: ['Check: Shelter access during heavy wind.', 'Watch for: Fencing damage.'],
    Cow: ['Check: Shelter gates and water access.', 'Watch for: Downed fence lines.'],
    Pig: ['Check: Roof panels and pen covers.', 'Watch for: Stress pacing.'],
    Sheep: ['Check: Windbreaks and fencing.', 'Watch for: Lamb stress.'],
    Duck: ['Check: Shelter access during storms.', 'Watch for: Flooded bedding.'],
    Rabbit: ['Check: Hutch covers and latches.', 'Watch for: Wind chill exposure.'],
    Horse: ['Check: Shelter access and gate latches.', 'Watch for: Startle injuries.'],
  },
  fire: {
    Chicken: ['Check: Smoke exposure inside coops.', 'Have: Evac carriers ready.'],
    Goat: ['Check: Dry brush near pens.', 'Have: Halters ready for quick moves.'],
    Cow: ['Check: Pasture edges for smoke and embers.', 'Have: Move plan to safe paddock.'],
    Pig: ['Check: Bedding dryness near heat sources.', 'Have: Evac trailers ready.'],
    Sheep: ['Check: Fencelines near dry grass.', 'Have: Move plan to open pasture.'],
    Duck: ['Check: Smoke near water areas.', 'Have: Water tubs ready for moves.'],
    Rabbit: ['Check: Air quality in hutches.', 'Have: Carriers and cool water ready.'],
    Horse: ['Check: Smoke exposure during turnout.', 'Have: Halters and trailer ready.'],
  },
};

const gardenExtrasByGroup: Record<
  string,
  {
    open: string[];
    container: string[];
    greenhouse: string[];
  }
> = {
  heat: {
    open: ['Have: Shade cloth or row cover ready.', 'Watch for: Blossom drop during heat spikes.'],
    container: ['Have: Light-colored pots to reduce heat load.', 'Watch for: Fast dry-out in small pots.'],
    greenhouse: ['Have: Extra ventilation or fans ready.', 'Watch for: Tip burn on seedlings.'],
  },
  cold: {
    open: ['Have: Frost blankets or row cover ready.', 'Watch for: Leaf burn after cold nights.'],
    container: ['Have: Insulation wraps for pots.', 'Watch for: Cracked pots after freezes.'],
    greenhouse: ['Have: Backup heat or thermal blankets ready.', 'Watch for: Condensation freeze on leaves.'],
  },
  wet: {
    open: ['Have: Drainage paths cleared.', 'Watch for: Soil compaction and root rot.'],
    container: ['Have: Pot feet or blocks for drainage.', 'Watch for: Waterlogged soil.'],
    greenhouse: ['Have: Airflow fans ready.', 'Watch for: Mold or mildew buildup.'],
  },
  storm: {
    open: ['Have: Extra ties and supports ready.', 'Watch for: Wind damage after storms.'],
    container: ['Have: A sheltered spot for pots.', 'Watch for: Tipped containers.'],
    greenhouse: ['Have: Straps or braces ready.', 'Watch for: Panel movement or leaks.'],
  },
  fire: {
    open: ['Have: Hose access near beds.', 'Watch for: Ember drift on windy days.'],
    container: ['Have: Water nearby to dampen dry materials.', 'Watch for: Heat stress near walls.'],
    greenhouse: ['Have: Extinguisher within reach.', 'Watch for: Smoke or ash buildup.'],
  },
};

const livestockGroupExtras: Record<string, string[]> = {
  heat: [
    'Check: Water temperature and refill more often for {species}.',
    'Watch for: Lethargy or open-mouth breathing in {species}.',
  ],
  cold: [
    'Check: Bedding dryness and wind breaks for {species}.',
    'Watch for: Shivering or huddling in {species}.',
  ],
  wet: [
    'Check: Hoof or foot health for {species} after wet days.',
    'Watch for: Mud buildup and skin irritation on {species}.',
  ],
  storm: [
    'Check: Shelter access and fencing for {species}.',
    'Watch for: Stress or pacing during storms.',
  ],
  fire: [
    'Check: Smoke exposure for {species} and move to cleaner air if needed.',
    'Watch for: Coughing or breathing stress in {species}.',
  ],
};

const alertTips: Record<string, AlertContentBase> = {
  drought: {
    title: 'Drought Watch',
    description: 'Actionable guidance for dry stretches and water stress.',
    garden: {
      open: [
        'Do: Water early morning; avoid midday irrigation.',
        'Check: Soil moisture daily and mulch bare beds.',
        'Have: Extra mulch, shade cloth, and drip supplies ready.',
        'Precaution: Delay new transplants during peak heat.',
        'Watch for: Wilting, blossom drop, and leaf curl.',
        'Do: Deep water less often to encourage roots.',
        'Check: Drip lines and emitters for clogs.',
      ],
      container: [
        'Do: Water containers early and check again at dusk.',
        'Check: Pots for heat stress and dry edges.',
        'Have: Extra water trays and larger saucers ready.',
        'Precaution: Move pots into partial shade during heat spikes.',
        'Watch for: Rapid wilt or leaf scorch.',
        'Do: Group pots together to reduce evaporation.',
        'Check: Soil shrinkage pulling from pot edges.',
      ],
      greenhouse: [
        'Do: Vent early, open shade cloth, and increase airflow.',
        'Check: Fans, vents, and irrigation lines daily.',
        'Have: Backup water and misting tools ready.',
        'Precaution: Avoid midday planting or pruning.',
        'Watch for: Heat stress and tip burn.',
        'Do: Water paths to cool air temperature.',
        'Check: Drip timers for longer run windows.',
      ],
    },
    livestockBySpecies: {
      Chicken: [
        'Do: Provide extra clean water in shaded areas.',
        'Check: Coops for airflow and open vents.',
        'Have: Electrolytes on hand for heat spikes.',
        'Precaution: Avoid handling birds in midday heat.',
        'Watch for: Panting, droopy wings, or pale combs.',
      ],
      Duck: [
        'Do: Offer deep water for dunking and cooling.',
        'Check: Shade over pools and wet areas.',
        'Have: Extra water tubs ready for hot afternoons.',
        'Precaution: Clean wet areas daily to prevent heat stress.',
        'Watch for: Lethargy or heavy panting.',
      ],
      Turkey: [
        'Do: Increase shaded loafing areas.',
        'Check: Waterers twice daily for flow and temp.',
        'Have: Extra troughs spread across pens.',
        'Precaution: Limit handling during heat peaks.',
        'Watch for: Open-mouth breathing or drooped wings.',
      ],
      Quail: [
        'Do: Keep cages in shade with airflow.',
        'Check: Water levels and clean drinkers daily.',
        'Have: Freeze bottles for quick cooling.',
        'Precaution: Avoid crowding in hot weather.',
        'Watch for: Rapid breathing or listlessness.',
      ],
      Rabbit: [
        'Do: Provide frozen bottles or tiles for cooling.',
        'Check: Hutches for airflow and shade.',
        'Have: Extra water bottles ready.',
        'Precaution: Avoid handling in midday heat.',
        'Watch for: Heat stress and reduced appetite.',
      ],
      Goat: [
        'Do: Keep shade and mineral access available.',
        'Check: Water troughs morning and evening.',
        'Have: Extra buckets in distant paddocks.',
        'Precaution: Avoid hauling or transport in heat.',
        'Watch for: Rapid breathing or fatigue.',
      ],
      Sheep: [
        'Do: Provide shade and steady water access.',
        'Check: Flock movement for heat stress.',
        'Have: Extra water points ready.',
        'Precaution: Avoid shearing during peak heat.',
        'Watch for: Panting or lagging behind.',
      ],
      Cow: [
        'Do: Keep water troughs full and cool.',
        'Check: Shade structures and airflow.',
        'Have: Extra troughs in pasture corners.',
        'Precaution: Avoid long drives in high heat.',
        'Watch for: Reduced feed intake or drooling.',
      ],
      Pig: [
        'Do: Offer wallows or cooling areas.',
        'Check: Shade and water access often.',
        'Have: Extra water lines in pens.',
        'Precaution: Avoid handling in high heat.',
        'Watch for: Heavy panting or red skin.',
      ],
      Horse: [
        'Do: Provide shade and frequent water checks.',
        'Check: Buckets and troughs for algae.',
        'Have: Electrolytes ready after heat stress.',
        'Precaution: Ride or work early morning only.',
        'Watch for: Sweating then sudden fatigue.',
      ],
      Bee: [
        'Do: Provide a reliable water source with landing spots.',
        'Check: Hive ventilation and entrance reducers.',
        'Have: Shade cloth for hives in full sun.',
        'Precaution: Avoid opening hives during peak heat.',
        'Watch for: Bearding or high hive temps.',
      ],
      'Livestock Guardian': [
        'Do: Ensure shaded rest spots and water access.',
        'Check: Paws and pads for hot ground.',
        'Have: Extra water bowls in patrol areas.',
        'Precaution: Avoid working dogs in midday heat.',
        'Watch for: Heavy panting or sluggish movement.',
      ],
    },
    extraSections: [
      {
        heading: 'Water management',
        tips: [
          'Water check: Stock pond level trending down faster than usual.',
          'Well watch: Drought can stress shallow wells — conserve where you can.',
          'Restriction notice: Outdoor watering limits may be active locally.',
        ],
      },
    ],
  },
  fire: {
    title: 'Fire & Safety Alert',
    description: 'High-risk conditions call for extra caution.',
    garden: {
      open: [
        'Do: Clear dry debris around beds and paths.',
        'Check: Irrigation lines and hose access.',
        'Have: Extinguisher and hose ready near work zones.',
        'Precaution: Skip burning or spark tools today.',
        'Watch for: Wind shifts and dry air spikes.',
      ],
      container: [
        'Do: Move dry mulch or straw away from pots.',
        'Check: Hose access near container areas.',
        'Have: Water nearby to dampen dry material.',
        'Precaution: Avoid grinding or mowing near containers.',
        'Watch for: Ember drift on windy days.',
      ],
      greenhouse: [
        'Do: Clear dry leaves and keep exits open.',
        'Check: Electrical cords and fan wiring.',
        'Have: Fire extinguisher within reach.',
        'Precaution: Avoid hot work near plastic or dry material.',
        'Watch for: Smoke or ash buildup.',
      ],
    },
    livestockTemplates: [
      'Do: Keep {species} away from smoke if possible.',
      'Check: Water access and shade near shelters.',
      'Have: Evac plan and halters/crates ready.',
      'Precaution: Avoid sparks near barns or bedding.',
      'Watch for: Breathing stress in {species}.',
    ],
  },
  freeze: {
    title: 'Freeze Prep',
    description: 'Cold snaps can catch systems off guard.',
    garden: {
      open: [
        'Do: Cover sensitive crops overnight.',
        'Check: Soil moisture before freezing nights.',
        'Have: Row cover, cloth, or cloches ready.',
        'Precaution: Harvest tender crops early.',
        'Watch for: Frost damage on leaves.',
      ],
      container: [
        'Do: Move pots to sheltered areas or indoors.',
        'Check: Containers for ice and cracked soil.',
        'Have: Frost blankets or wraps ready.',
        'Precaution: Avoid watering late in the day.',
        'Watch for: Root exposure in small pots.',
      ],
      greenhouse: [
        'Do: Close vents before sunset.',
        'Check: Heaters and thermostats early.',
        'Have: Backup heat or thermal blankets ready.',
        'Precaution: Avoid late-day watering.',
        'Watch for: Condensation freezing on leaves.',
      ],
    },
    livestockTemplates: [
      'Do: Keep water thawed for {species}.',
      'Check: Bedding depth and wind breaks.',
      'Have: Extra hay or feed staged.',
      'Precaution: Limit drafts in shelters.',
      'Watch for: Shivering or stiffness in {species}.',
    ],
  },
  rain: {
    title: 'Rainy Week',
    description: 'Extended rain changes watering and pasture plans.',
    garden: {
      open: [
        'Do: Pause extra watering and monitor drainage.',
        'Check: Low spots for pooling and root saturation.',
        'Have: Stakes and supports ready for wind.',
        'Precaution: Avoid soil compaction while wet.',
        'Watch for: Leaf spots or fungal spread.',
      ],
      container: [
        'Do: Elevate pots to improve drainage.',
        'Check: Saucers for standing water.',
        'Have: Pot feet or blocks ready.',
        'Precaution: Reduce watering until pots drain.',
        'Watch for: Root rot in low-drain pots.',
      ],
      greenhouse: [
        'Do: Vent to reduce humidity.',
        'Check: Roof leaks and pooled water.',
        'Have: Fans and airflow ready.',
        'Precaution: Space plants to reduce mildew.',
        'Watch for: Mold or damping off.',
      ],
    },
    livestockTemplates: [
      'Do: Provide dry footing for {species}.',
      'Check: Mud buildup and hoof health.',
      'Have: Extra bedding ready.',
      'Precaution: Rotate high-traffic areas.',
      'Watch for: Skin or hoof issues in {species}.',
    ],
  },
  heat: {
    title: 'Heat Advisory',
    description: 'Hot stretches call for extra water, shade, and pacing.',
    garden: {
      open: [
        'Do: Water early and protect tender crops.',
        'Check: Soil moisture and mulch depth.',
        'Have: Shade cloth ready for heat spikes.',
        'Precaution: Delay planting during peak heat.',
        'Watch for: Wilting or sunscald.',
      ],
      container: [
        'Do: Move pots into partial shade.',
        'Check: Pots for rapid dry-out.',
        'Have: Extra water and larger saucers ready.',
        'Precaution: Avoid pruning during heat.',
        'Watch for: Leaf scorch.',
      ],
      greenhouse: [
        'Do: Open vents and shade cloth early.',
        'Check: Fans and misting lines.',
        'Have: Backup airflow and water ready.',
        'Precaution: Avoid midday work inside.',
        'Watch for: Heat stress on seedlings.',
      ],
    },
    livestockTemplates: [
      'Do: Keep {species} in shade during peak heat.',
      'Check: Water levels and airflow often.',
      'Have: Extra water points ready.',
      'Precaution: Handle animals early or late.',
      'Watch for: Panting and heat stress in {species}.',
    ],
  },
  thunderstorm: {
    title: 'Thunderstorm Watch',
    description: 'Storms can bring wind, lightning, and sudden downpours.',
    garden: {
      open: [
        'Do: Secure row covers and tall supports.',
        'Check: Drainage and low areas.',
        'Have: Stakes or tie-downs ready.',
        'Precaution: Avoid metal tools during lightning.',
        'Watch for: Wind damage after the storm.',
      ],
      container: [
        'Do: Move pots under shelter if possible.',
        'Check: Overfilled saucers.',
        'Have: Tarp or cover ready.',
        'Precaution: Avoid handling during lightning.',
        'Watch for: Broken stems or toppled pots.',
      ],
      greenhouse: [
        'Do: Close vents before gusts.',
        'Check: Door latches and panels.',
        'Have: Straps or braces ready.',
        'Precaution: Keep electricals away from water.',
        'Watch for: Panel movement.',
      ],
    },
    livestockTemplates: [
      'Do: Move {species} away from exposed fencing if possible.',
      'Check: Shelter access and dry footing.',
      'Have: Dry bedding staged.',
      'Precaution: Avoid handling during thunder.',
      'Watch for: Fence damage after storms.',
    ],
  },
  ice: {
    title: 'Ice Storm',
    description: 'Ice can down lines and make travel hazardous.',
    garden: {
      open: [
        'Do: Harvest tender crops early.',
        'Check: Supports for snow/ice load.',
        'Have: Covers ready for exposed plants.',
        'Precaution: Avoid travel on iced paths.',
        'Watch for: Broken branches or trellises.',
      ],
      container: [
        'Do: Move pots indoors or against shelter.',
        'Check: Containers for freeze expansion.',
        'Have: Insulation or wraps ready.',
        'Precaution: Avoid watering before a freeze.',
        'Watch for: Cracked pots.',
      ],
      greenhouse: [
        'Do: Close vents and secure doors.',
        'Check: Heater and backup power.',
        'Have: Extra insulation on hand.',
        'Precaution: Avoid opening doors during ice.',
        'Watch for: Ice load on panels.',
      ],
    },
    livestockTemplates: [
      'Do: Keep water thawed for {species}.',
      'Check: Ice buildup on walkways.',
      'Have: Extra bedding ready.',
      'Precaution: Limit travel on icy ground.',
      'Watch for: Slips or cold stress in {species}.',
    ],
  },
  wind: {
    title: 'Wind Advisory',
    description: 'High winds can stress animals and damage structures.',
    garden: {
      open: [
        'Do: Stake tall crops and trellises.',
        'Check: Row covers and netting.',
        'Have: Extra ties and clips ready.',
        'Precaution: Avoid spraying in gusts.',
        'Watch for: Broken stems.',
      ],
      container: [
        'Do: Group pots in sheltered areas.',
        'Check: Lightweight containers for tipping.',
        'Have: Weights or blocks ready.',
        'Precaution: Avoid leaving tools loose.',
        'Watch for: Soil blowing out.',
      ],
      greenhouse: [
        'Do: Close vents and secure doors.',
        'Check: Panels for rattling.',
        'Have: Braces or straps ready.',
        'Precaution: Avoid roof work.',
        'Watch for: Panel shift.',
      ],
    },
    livestockTemplates: [
      'Do: Close windward shelter panels for {species}.',
      'Check: Gates and fencing.',
      'Have: Extra bedding ready.',
      'Precaution: Avoid moving animals during gusts.',
      'Watch for: Fence damage after wind.',
    ],
  },
  hail: {
    title: 'Hail Risk',
    description: 'Hail can damage crops, roofs, and equipment.',
    garden: {
      open: [
        'Do: Cover tender crops if possible.',
        'Check: Supports and stakes.',
        'Have: Tarps or row covers ready.',
        'Precaution: Avoid working outside during hail.',
        'Watch for: Leaf tearing after storm.',
      ],
      container: [
        'Do: Move pots under shelter.',
        'Check: Overhanging eaves for coverage.',
        'Have: Lightweight cover ready.',
        'Precaution: Avoid glass or exposed areas.',
        'Watch for: Leaf bruising.',
      ],
      greenhouse: [
        'Do: Secure doors and panels.',
        'Check: Panel integrity before storms.',
        'Have: Repair tape ready.',
        'Precaution: Avoid standing near panels.',
        'Watch for: Cracked glazing.',
      ],
    },
    livestockTemplates: [
      'Do: Move {species} to covered shelter.',
      'Check: Roofing and shelter integrity.',
      'Have: Extra bedding ready.',
      'Precaution: Avoid open pasture during hail.',
      'Watch for: Skin or eye injuries in {species}.',
    ],
  },
  flood: {
    title: 'Flood Watch',
    description: 'Heavy rain can cause sudden runoff and flooding.',
    garden: {
      open: [
        'Do: Clear drains and low spots.',
        'Check: Bed edges for erosion.',
        'Have: Sandbags if needed.',
        'Precaution: Avoid driving through water.',
        'Watch for: Soil washouts.',
      ],
      container: [
        'Do: Elevate pots on blocks.',
        'Check: Saucers for standing water.',
        'Have: Covers ready.',
        'Precaution: Avoid low-lying patio areas.',
        'Watch for: Root rot.',
      ],
      greenhouse: [
        'Do: Check gutters and drains.',
        'Check: Door thresholds for leaks.',
        'Have: Pumps or squeegees ready.',
        'Precaution: Avoid standing water near outlets.',
        'Watch for: Mold growth.',
      ],
    },
    livestockTemplates: [
      'Do: Move {species} to higher ground.',
      'Check: Access to shelter stays dry.',
      'Have: Feed stored above flood level.',
      'Precaution: Avoid low crossings.',
      'Watch for: Waterborne illness signs.',
    ],
  },
  tornado: {
    title: 'Tornado Watch',
    description: 'Conditions are favorable for severe storms.',
    garden: {
      open: [
        'Do: Secure loose items now.',
        'Check: Trellises and fences.',
        'Have: Emergency tools ready.',
        'Precaution: Delay outdoor tasks when warnings hit.',
        'Watch for: Flying debris.',
      ],
      container: [
        'Do: Move pots indoors if possible.',
        'Check: Patio and porch items.',
        'Have: Cover or shelter ready.',
        'Precaution: Stay indoors during warnings.',
        'Watch for: Debris damage.',
      ],
      greenhouse: [
        'Do: Close vents and lock doors.',
        'Check: Panel latches.',
        'Have: Quick cover or bracing ready.',
        'Precaution: Keep clear during warnings.',
        'Watch for: Structural damage.',
      ],
    },
    livestockTemplates: [
      'Do: Keep {species} near sturdy shelter.',
      'Check: Gates and fencing.',
      'Have: Halters or crates ready.',
      'Precaution: Avoid moving animals during sirens.',
      'Watch for: Post-storm injuries.',
    ],
  },
  smoke: {
    title: 'Air Quality / Smoke',
    description: 'Smoke can stress lungs and reduce visibility.',
    garden: {
      open: [
        'Do: Water early to reduce plant stress.',
        'Check: Leaves for ash buildup.',
        'Have: Wash tools after smoky days.',
        'Precaution: Limit outdoor work.',
        'Watch for: Sunscald from smoke haze.',
      ],
      container: [
        'Do: Move pots closer to shelter.',
        'Check: Leaf surfaces for ash.',
        'Have: Clean water for rinsing.',
        'Precaution: Avoid dusty handling.',
        'Watch for: Leaf spotting.',
      ],
      greenhouse: [
        'Do: Close vents if smoke is heavy.',
        'Check: Filters or fans.',
        'Have: Fresh water ready.',
        'Precaution: Limit airflow during peak smoke.',
        'Watch for: Plant stress.',
      ],
    },
    livestockTemplates: [
      'Do: Limit handling of {species} during heavy smoke.',
      'Check: Breathing and coughing.',
      'Have: Extra clean water ready.',
      'Precaution: Keep shelters closed to smoke.',
      'Watch for: Respiratory distress in {species}.',
    ],
  },
  snow: {
    title: 'Snowstorm / Blizzard',
    description: 'Snow and wind can cut access and visibility.',
    garden: {
      open: [
        'Do: Clear snow from low tunnels gently.',
        'Check: Supports for weight.',
        'Have: Covers ready for cold dips.',
        'Precaution: Avoid snapping branches.',
        'Watch for: Ice load on trellises.',
      ],
      container: [
        'Do: Move pots under shelter.',
        'Check: Freeze expansion in pots.',
        'Have: Insulation or wraps ready,',
        'Precaution: Avoid watering before freezes.',
        'Watch for: Cracked pots.',
      ],
      greenhouse: [
        'Do: Brush snow from panels.',
        'Check: Heater and backup power.',
        'Have: Extra fuel ready.',
        'Precaution: Keep vents closed.',
        'Watch for: Ice buildup on doors.',
      ],
    },
    livestockTemplates: [
      'Do: Check waterers for freeze for {species}.',
      'Check: Wind breaks and bedding.',
      'Have: Extra feed staged.',
      'Precaution: Limit travel during whiteouts.',
      'Watch for: Cold stress in {species}.',
    ],
  },
  frost: {
    title: 'Early / Late Frost',
    description: 'Frost can damage tender crops and starts.',
    garden: {
      open: [
        'Do: Cover tender crops overnight.',
        'Check: Forecast lows each evening.',
        'Have: Row cover or cloth ready.',
        'Precaution: Harvest tender crops early.',
        'Watch for: Frost-burned leaves.',
      ],
      container: [
        'Do: Move pots indoors or cover them.',
        'Check: Soil surface for ice.',
        'Have: Frost blankets ready.',
        'Precaution: Avoid late watering.',
        'Watch for: Leaf damage.',
      ],
      greenhouse: [
        'Do: Close vents early.',
        'Check: Heaters before dark.',
        'Have: Thermal blankets ready.',
        'Precaution: Avoid cold drafts.',
        'Watch for: Condensation freeze.',
      ],
    },
    livestockTemplates: [
      'Do: Keep water thawed for {species}.',
      'Check: Shelter drafts.',
      'Have: Extra bedding ready.',
      'Precaution: Limit wet bedding.',
      'Watch for: Cold stress in {species}.',
    ],
  },
  humidity: {
    title: 'Heat Index / Humidity',
    description: 'High humidity makes heat harder to tolerate.',
    garden: {
      open: [
        'Do: Water early to reduce stress.',
        'Check: Fungal pressure and leaf spots.',
        'Have: Pruners for airflow.',
        'Precaution: Avoid overhead watering.',
        'Watch for: Mildew or blight.',
      ],
      container: [
        'Do: Space pots for airflow.',
        'Check: Soil staying too wet.',
        'Have: Fans or ventilation ready.',
        'Precaution: Avoid crowding.',
        'Watch for: Mold on soil surface.',
      ],
      greenhouse: [
        'Do: Vent early and increase airflow.',
        'Check: Condensation on panels.',
        'Have: Fans and airflow tools ready.',
        'Precaution: Avoid overwatering.',
        'Watch for: Mold or mildew.',
      ],
    },
    livestockTemplates: [
      'Do: Increase airflow for {species}.',
      'Check: Water intake and panting.',
      'Have: Extra shade ready.',
      'Precaution: Handle early or late.',
      'Watch for: Heat stress in {species}.',
    ],
  },
  windchill: {
    title: 'Wind Chill',
    description: 'Cold wind can rapidly drop body temperature.',
    garden: {
      open: [
        'Do: Cover sensitive beds.',
        'Check: Wind exposure on seedlings.',
        'Have: Windbreaks ready.',
        'Precaution: Avoid pruning in cold wind.',
        'Watch for: Desiccation.',
      ],
      container: [
        'Do: Move pots to wind-sheltered areas.',
        'Check: Soil moisture before freeze.',
        'Have: Insulation wraps ready.',
        'Precaution: Avoid watering late.',
        'Watch for: Leaf burn.',
      ],
      greenhouse: [
        'Do: Close vents and block drafts.',
        'Check: Heater output.',
        'Have: Extra insulation ready.',
        'Precaution: Avoid opening doors often.',
        'Watch for: Temperature dips.',
      ],
    },
    livestockTemplates: [
      'Do: Close windward shelter openings for {species}.',
      'Check: Bedding depth and dryness.',
      'Have: Extra hay ready.',
      'Precaution: Reduce time in open wind.',
      'Watch for: Shivering or lethargy in {species}.',
    ],
  },
};

const buildSections = (base: AlertContentBase, key: string) => {
  const sections: Array<{ heading: string; tips: string[] }> = [];
  if (base.garden) {
    const group = advisoryGroups[key];
    const extras = gardenExtrasByGroup[group] ?? { open: [], container: [], greenhouse: [] };
    sections.push({ heading: 'Open garden', tips: [...base.garden.open, ...extras.open] });
    sections.push({ heading: 'Container garden', tips: [...base.garden.container, ...extras.container] });
    sections.push({ heading: 'Greenhouse garden', tips: [...base.garden.greenhouse, ...extras.greenhouse] });
  }
  base.extraSections?.forEach((section) => sections.push(section));
  if (base.livestockBySpecies) {
    livestockSpecies.forEach((species) => {
      const tips = base.livestockBySpecies?.[species];
      if (!tips || tips.length === 0) return;
      const group = advisoryGroups[key];
      const popularExtras = popularSpecies.includes(species)
        ? popularSpeciesGroupExtras[group]?.[species] ?? []
        : [];
      sections.push({
        heading: `Livestock: ${species}`,
        tips: [...tips, ...popularExtras],
      });
    });
  } else if (base.livestockTemplates?.length) {
    const group = advisoryGroups[key];
    livestockSpecies.forEach((species) => {
      const extraTip = livestockExtraTips[species];
      const groupExtras = (livestockGroupExtras[group] ?? []).map((tip) => tip.replace('{species}', species));
      const popularExtras = popularSpecies.includes(species)
        ? popularSpeciesGroupExtras[group]?.[species] ?? []
        : [];
      sections.push({
        heading: `Livestock: ${species}`,
        tips: [
          ...base.livestockTemplates.map((tip) => tip.replace('{species}', species)),
          ...groupExtras,
          ...popularExtras,
          ...(extraTip ? [extraTip] : []),
        ],
      });
    });
  }
  return sections;
};

export default function WeatherAlertDetailsScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const router = useRouter();
  const key = typeof type === 'string' ? type : 'drought';
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const contentBase = alertTips[key] ?? alertTips.drought;
  const content = {
    title: contentBase.title,
    description: contentBase.description,
    sections: buildSections(contentBase, key),
  };
  const allSectionKeys = content.sections.map((section, index) => `${section.heading}-${index}`);
  const allOpen = allSectionKeys.length > 0 && allSectionKeys.every((sectionKey) => openSections[sectionKey]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F3EBDD' }} contentContainerStyle={{ padding: 20 }}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>Back to alerts</Text>
      </Pressable>
      <View
        style={{
          backgroundColor: '#FFF6E6',
          borderRadius: 18,
          padding: 16,
          borderWidth: 1,
          borderColor: '#E0C9B0',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 26, color: '#3A2E24', fontFamily: 'SedgwickAve', marginBottom: 6 }}>
          {content.title}
        </Text>
        <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>{content.description}</Text>
        <Text style={{ color: '#8B7560', fontFamily: 'SedgwickAve', marginTop: 6 }}>
          Tips are tuned to your location and forecast settings.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <Pressable
          onPress={() => {
            const nextState: Record<string, boolean> = {};
            allSectionKeys.forEach((sectionKey) => {
              nextState[sectionKey] = true;
            });
            setOpenSections(nextState);
          }}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#D7C9B7',
            backgroundColor: '#FFFDF6',
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Expand all</Text>
        </Pressable>
        <Pressable
          onPress={() => setOpenSections({})}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#D7C9B7',
            backgroundColor: '#FFFDF6',
          }}
        >
          <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>Collapse all</Text>
        </Pressable>
        {allSectionKeys.length > 0 ? (
          <View style={{ justifyContent: 'center' }}>
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              {allOpen ? 'All open' : 'Compact'}
            </Text>
          </View>
        ) : null}
      </View>

      {content.sections.map((section, index) => {
        const sectionKey = `${section.heading}-${index}`;
        const isOpen = !!openSections[sectionKey];
        return (
        <View
          key={sectionKey}
          style={{
            backgroundColor: '#FFFDF7',
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: '#E0D2BE',
            marginBottom: 12,
          }}
        >
          <Pressable
            onPress={() =>
              setOpenSections((prev) => ({
                ...prev,
                [sectionKey]: !prev[sectionKey],
              }))
            }
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ color: '#3A2E24', fontFamily: 'SedgwickAve' }}>{section.heading}</Text>
            <Text style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve' }}>
              {isOpen ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
          {isOpen
            ? section.tips.map((tip) => (
                <Text key={tip} style={{ color: '#6E5B4B', fontFamily: 'SedgwickAve', marginTop: 6 }}>
                  {tip}
                </Text>
              ))
            : null}
        </View>
      );
      })}

      {key === 'fire' ? (
        <View style={{ marginTop: 8 }}>
          <Pressable
            onPress={() => router.push('/screens/homestead/emergency-plan')}
            style={{
              backgroundColor: '#4C7744',
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'SedgwickAve' }}>Open Emergency Plan</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}
