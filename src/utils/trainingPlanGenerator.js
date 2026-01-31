import { addDays, differenceInWeeks, startOfWeek, isSameDay } from 'date-fns'

// Race type configurations
export const RACE_TYPES = {
  '5k': {
    name: '5K',
    distance: 5,
    taperWeeks: 1,
    peakLongRunKm: 12,
    minWeeks: 6,
    idealWeeks: 8,
    // Pace zones as % of race pace (lower = faster)
    paceZones: {
      easy: 1.30, // 30% slower than race pace
      long: 1.25,
      tempo: 1.08,
      threshold: 1.0,
      interval: 0.95,
    },
  },
  '10k': {
    name: '10K',
    distance: 10,
    taperWeeks: 1,
    peakLongRunKm: 18,
    minWeeks: 8,
    idealWeeks: 10,
    paceZones: {
      easy: 1.35,
      long: 1.28,
      tempo: 1.10,
      threshold: 1.02,
      interval: 0.95,
    },
  },
  'half': {
    name: 'Half Marathon',
    distance: 21.0975,
    taperWeeks: 2,
    peakLongRunKm: 22,
    minWeeks: 10,
    idealWeeks: 12,
    paceZones: {
      easy: 1.35,
      long: 1.25,
      tempo: 1.05, // Tempo more important for half/marathon
      threshold: 1.0,
      interval: 0.92,
    },
  },
  'marathon': {
    name: 'Marathon',
    distance: 42.195,
    taperWeeks: 3,
    peakLongRunKm: 35,
    minWeeks: 16,
    idealWeeks: 18,
    paceZones: {
      easy: 1.35,
      long: 1.20,
      tempo: 1.0, // Marathon pace = tempo
      threshold: 0.95,
      interval: 0.88,
    },
  },
}

// Workout type configurations (Runna-style)
export const WORKOUT_TYPES = {
  easy: {
    name: 'Easy Run',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    bgLight: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'Conversational pace, RPE 3-4',
    paceZone: 'Easy',
    rpe: '3-4',
  },
  long: {
    name: 'Long Run',
    color: 'bg-purple-500',
    textColor: 'text-purple-500',
    bgLight: 'bg-purple-100 dark:bg-purple-900/30',
    description: 'Building endurance, stay conversational',
    paceZone: 'Easy to Moderate',
    rpe: '4-5',
  },
  tempo: {
    name: 'Tempo Run',
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    bgLight: 'bg-orange-100 dark:bg-orange-900/30',
    description: 'Sustained effort at 70-80%, comfortably hard',
    paceZone: 'Threshold',
    rpe: '6-7',
  },
  threshold: {
    name: 'Threshold Intervals',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    bgLight: 'bg-red-100 dark:bg-red-900/30',
    description: 'Above lactate threshold with recovery periods',
    paceZone: 'Fast',
    rpe: '8-9',
  },
  intervals: {
    name: 'Speed Intervals',
    color: 'bg-red-600',
    textColor: 'text-red-600',
    bgLight: 'bg-red-100 dark:bg-red-900/30',
    description: 'Fast repeats to build speed and VO2max',
    paceZone: 'Very Fast',
    rpe: '9',
  },
  strides: {
    name: 'Easy + Strides',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-500',
    bgLight: 'bg-cyan-100 dark:bg-cyan-900/30',
    description: 'Easy run with 4-6x 20sec pickups for form',
    paceZone: 'Easy + Fast bursts',
    rpe: '3-4 + 8',
  },
  hills: {
    name: 'Hill Training',
    color: 'bg-amber-600',
    textColor: 'text-amber-600',
    bgLight: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'Hill repeats for strength and power',
    paceZone: 'Hard effort uphill',
    rpe: '7-8',
  },
  recovery: {
    name: 'Recovery Run',
    color: 'bg-green-400',
    textColor: 'text-green-400',
    bgLight: 'bg-green-100 dark:bg-green-900/30',
    description: 'Very easy jog, shorter than usual',
    paceZone: 'Very Easy',
    rpe: '2-3',
  },
  rest: {
    name: 'Rest Day',
    color: 'bg-gray-400',
    textColor: 'text-gray-400',
    bgLight: 'bg-gray-100 dark:bg-gray-800/30',
    description: 'Complete rest or light cross-training',
    paceZone: 'N/A',
    rpe: '0-1',
  },
  race: {
    name: 'Race Day',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    bgLight: 'bg-yellow-100 dark:bg-yellow-900/30',
    description: 'The big day! Trust your training.',
    paceZone: 'Goal Pace',
    rpe: '9-10',
  },
}

// Volume progression options (Runna-style)
export const VOLUME_PROGRESSIONS = {
  progressive: {
    name: 'Progressive',
    description: 'Higher volume, faster buildup for goal-focused runners',
    weeklyIncrease: 0.10, // 10% increase per week
    peakMultiplier: 1.6,
  },
  steady: {
    name: 'Steady',
    description: 'Balanced progression alongside everyday commitments',
    weeklyIncrease: 0.07, // 7% increase per week
    peakMultiplier: 1.4,
  },
  gradual: {
    name: 'Gradual',
    description: 'Gentle progression, ideal for busy schedules or returning runners',
    weeklyIncrease: 0.05, // 5% increase per week
    peakMultiplier: 1.25,
  },
}

// Training difficulty options
export const DIFFICULTY_LEVELS = {
  challenging: {
    name: 'Challenging',
    description: 'Focus on improving speed and endurance',
    hardSessionsMultiplier: 1.2,
    intensityBonus: 0.05,
  },
  balanced: {
    name: 'Balanced',
    description: 'Challenge with manageable workouts',
    hardSessionsMultiplier: 1.0,
    intensityBonus: 0,
  },
  comfortable: {
    name: 'Comfortable',
    description: 'Prioritize consistency and confidence-building',
    hardSessionsMultiplier: 0.8,
    intensityBonus: -0.05,
  },
}

// Experience level adjustments
const EXPERIENCE_MULTIPLIERS = {
  beginner: { volume: 0.8, intensity: 0.9 },
  intermediate: { volume: 1.0, intensity: 1.0 },
  advanced: { volume: 1.15, intensity: 1.1 },
}

// Generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// Calculate easy/hard split based on training days (Runna methodology)
const getEasyHardSplit = (trainingDays) => {
  if (trainingDays >= 5) {
    // 80/20 split: 4+ easy, 1-2 hard
    return { easyRatio: 0.80, hardRatio: 0.20, maxHardDays: 2 }
  } else if (trainingDays >= 4) {
    // 75/25 split: 3 easy, 1 hard
    return { easyRatio: 0.75, hardRatio: 0.25, maxHardDays: 2 }
  } else if (trainingDays >= 3) {
    // 67/33 split: 2 easy, 1 hard
    return { easyRatio: 0.67, hardRatio: 0.33, maxHardDays: 1 }
  } else {
    // 50/50 for 2 days: 1 easy, 1 hard
    return { easyRatio: 0.50, hardRatio: 0.50, maxHardDays: 1 }
  }
}

// Calculate pace zones from goal time or current fitness
export const calculatePaceZones = (raceType, goalTimeMinutes, weeklyMileage, experienceLevel) => {
  const race = RACE_TYPES[raceType]
  let goalPacePerKm

  if (goalTimeMinutes) {
    // Use goal time to calculate race pace
    goalPacePerKm = goalTimeMinutes / race.distance
  } else {
    // Estimate from weekly mileage (fallback)
    goalPacePerKm = estimatePaceFromMileage(weeklyMileage, raceType, experienceLevel)
  }

  // Apply Runna's pace zone multipliers
  return {
    racePace: formatPace(goalPacePerKm),
    easyPace: formatPace(goalPacePerKm * race.paceZones.easy),
    longPace: formatPace(goalPacePerKm * race.paceZones.long),
    tempoPace: formatPace(goalPacePerKm * race.paceZones.tempo),
    thresholdPace: formatPace(goalPacePerKm * race.paceZones.threshold),
    intervalPace: formatPace(goalPacePerKm * race.paceZones.interval),
    goalPacePerKm,
  }
}

// Estimate pace from weekly mileage
const estimatePaceFromMileage = (weeklyMileage, raceType, experienceLevel) => {
  const expMultiplier = EXPERIENCE_MULTIPLIERS[experienceLevel]?.intensity || 1

  let basePaceMinPerKm
  if (weeklyMileage >= 80) basePaceMinPerKm = 4.0
  else if (weeklyMileage >= 60) basePaceMinPerKm = 4.5
  else if (weeklyMileage >= 40) basePaceMinPerKm = 5.0
  else if (weeklyMileage >= 25) basePaceMinPerKm = 5.5
  else if (weeklyMileage >= 15) basePaceMinPerKm = 6.0
  else basePaceMinPerKm = 6.5

  // Adjust for experience and race distance
  basePaceMinPerKm = basePaceMinPerKm / expMultiplier

  const race = RACE_TYPES[raceType]
  const distanceFactor = 1 + (race.distance - 5) * 0.008

  return basePaceMinPerKm * distanceFactor
}

// Format pace as mm:ss
const formatPace = (paceMinutes) => {
  const mins = Math.floor(paceMinutes)
  const secs = Math.round((paceMinutes - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}/km`
}

// Estimate finish time
export const estimateFinishTime = (raceType, weeklyMileage, experienceLevel, recentRaceTime) => {
  if (recentRaceTime) {
    return recentRaceTime
  }

  const race = RACE_TYPES[raceType]
  const goalPacePerKm = estimatePaceFromMileage(weeklyMileage, raceType, experienceLevel)
  const totalMinutes = goalPacePerKm * race.distance

  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)
  const seconds = Math.round((totalMinutes % 1) * 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Calculate current fitness from Strava activities
export const calculateCurrentFitness = (activities) => {
  if (!activities || activities.length === 0) {
    return {
      weeklyMileage: 0,
      longestRun: 0,
      avgRunsPerWeek: 0,
      estimatedEasyPace: null,
    }
  }

  const fourWeeksAgo = new Date()
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

  const recentRuns = activities.filter(
    (a) => a.type === 'Run' && new Date(a.start_date) >= fourWeeksAgo
  )

  if (recentRuns.length === 0) {
    return {
      weeklyMileage: 0,
      longestRun: 0,
      avgRunsPerWeek: 0,
      estimatedEasyPace: null,
    }
  }

  const totalDistance = recentRuns.reduce((sum, a) => sum + (a.distance || 0), 0)
  const longestRun = Math.max(...recentRuns.map((a) => a.distance || 0))

  // Calculate average pace from easy runs (slower half of runs)
  const runPaces = recentRuns
    .filter((a) => a.moving_time && a.distance)
    .map((a) => a.moving_time / 60 / (a.distance / 1000)) // min/km
    .sort((a, b) => b - a) // slowest first

  const easyRunPaces = runPaces.slice(0, Math.ceil(runPaces.length / 2))
  const avgEasyPace = easyRunPaces.length > 0
    ? easyRunPaces.reduce((a, b) => a + b, 0) / easyRunPaces.length
    : null

  return {
    weeklyMileage: Math.round((totalDistance / 1000 / 4) * 10) / 10,
    longestRun: Math.round((longestRun / 1000) * 10) / 10,
    avgRunsPerWeek: Math.round((recentRuns.length / 4) * 10) / 10,
    estimatedEasyPace: avgEasyPace ? formatPace(avgEasyPace) : null,
  }
}

// Determine training phase
const getPhase = (weeksUntilRace, totalWeeks, taperWeeks) => {
  const buildStart = Math.floor(totalWeeks * 0.3)
  const peakStart = totalWeeks - taperWeeks - Math.floor(totalWeeks * 0.2)

  if (weeksUntilRace <= taperWeeks) return 'taper'
  if (weeksUntilRace <= totalWeeks - peakStart) return 'peak'
  if (weeksUntilRace <= totalWeeks - buildStart) return 'build'
  return 'base'
}

// Get phase description
export const getPhaseDescription = (phase) => {
  const descriptions = {
    base: 'Building aerobic foundation with easy running and strength work',
    build: 'Increasing distance and introducing quality workouts',
    peak: 'Highest training load with race-specific sessions',
    taper: 'Reducing volume to arrive fresh on race day',
  }
  return descriptions[phase] || ''
}

// Determine if this should be a deload week (flexible 3-5 week cycle)
const isDeloadWeek = (weekNumber, phase, totalWeeks) => {
  if (phase === 'taper') return false

  // Deload every 4th week in base/build, every 3rd week in peak
  if (phase === 'peak') {
    return weekNumber > 0 && weekNumber % 3 === 0
  }
  return weekNumber > 0 && weekNumber % 4 === 0
}

// Get workout type for a quality session based on phase and race type
const getQualityWorkoutType = (phase, raceType, weekNumber, isSecondHardDay) => {
  // Runna logic: tempo for longer races, threshold/intervals for shorter
  const isLongRace = raceType === 'half' || raceType === 'marathon'

  if (phase === 'base') {
    // Base phase: mostly strides and easy hills
    return isSecondHardDay ? 'strides' : 'hills'
  }

  if (phase === 'build') {
    if (isLongRace) {
      // Half/Marathon: tempo focus with some threshold
      return isSecondHardDay ? 'threshold' : 'tempo'
    } else {
      // 5K/10K: threshold focus with some intervals
      return isSecondHardDay ? 'intervals' : 'threshold'
    }
  }

  if (phase === 'peak') {
    // Peak: race-specific intensity
    if (isLongRace) {
      return isSecondHardDay ? 'threshold' : 'tempo'
    } else {
      return weekNumber % 2 === 0 ? 'intervals' : 'threshold'
    }
  }

  // Taper: reduced intensity
  return 'strides'
}

// Generate workout descriptions (Runna-style)
const getWorkoutDescription = (type, raceType, phase, distance, paceZones) => {
  const race = RACE_TYPES[raceType]

  switch (type) {
    case 'easy':
      return `Easy run at conversational pace (${paceZones.easyPace}). You should be able to hold a full conversation. RPE 3-4.`

    case 'long':
      return `Long run building endurance. Start easy (${paceZones.longPace}) and stay relaxed. Focus on time on feet, not pace.`

    case 'recovery':
      return `Very easy recovery jog (slower than ${paceZones.easyPace}). Keep it short and gentle. RPE 2-3.`

    case 'strides':
      return `Easy run with 4-6 x 20-second strides at the end. Strides are controlled accelerations to fast pace, focusing on form. Full recovery between each.`

    case 'hills':
      return `Hill repeats: warm up, then 4-6 x 60-90sec uphill at hard effort. Jog down for recovery. Builds strength and power.`

    case 'tempo':
      if (raceType === 'marathon') {
        return `Tempo run at marathon pace (${paceZones.tempoPace}). Sustained effort at 70-80% - comfortably hard but sustainable. RPE 6-7.`
      }
      return `Tempo run at ${paceZones.tempoPace}. Sustained effort for 20-30 minutes at 70-80%. Should feel comfortably hard. RPE 6-7.`

    case 'threshold':
      return `Threshold intervals at ${paceZones.thresholdPace}. ${getThresholdStructure(raceType, phase)} These improve lactate clearance.`

    case 'intervals':
      return `Speed intervals at ${paceZones.intervalPace}. ${getIntervalStructure(raceType, phase)} Builds VO2max and running economy.`

    default:
      return ''
  }
}

// Get threshold workout structure
const getThresholdStructure = (raceType, phase) => {
  const structures = {
    '5k': {
      build: '4-5 x 1km with 90sec recovery',
      peak: '5-6 x 1km with 60sec recovery',
    },
    '10k': {
      build: '4 x 1.5km with 2min recovery',
      peak: '5 x 1.5km with 90sec recovery',
    },
    'half': {
      build: '3 x 2km with 2min recovery',
      peak: '4 x 2km with 90sec recovery',
    },
    'marathon': {
      build: '3 x 3km with 3min recovery',
      peak: '4 x 2.5km with 2min recovery',
    },
  }
  return structures[raceType]?.[phase] || '4-5 x 1km with 90sec recovery'
}

// Get interval workout structure
const getIntervalStructure = (raceType, phase) => {
  const structures = {
    '5k': {
      build: '6 x 400m with 90sec recovery',
      peak: '8 x 400m with 60sec recovery',
    },
    '10k': {
      build: '5 x 800m with 2min recovery',
      peak: '6 x 800m with 90sec recovery',
    },
    'half': {
      build: '4 x 1km with 2min recovery',
      peak: '5 x 1km with 90sec recovery',
    },
    'marathon': {
      build: '5 x 1km with 2min recovery',
      peak: '6 x 1km with 90sec recovery',
    },
  }
  return structures[raceType]?.[phase] || '5 x 800m with 2min recovery'
}

// Generate a weekly workout schedule (Runna-style logic)
const generateWeekWorkouts = ({
  weekNumber,
  startDate,
  phase,
  targetDistance,
  trainingDays,
  longRunDay,
  raceType,
  isRecoveryWeek,
  isRaceWeek,
  raceDate,
  difficulty,
  paceZones,
}) => {
  const workouts = []
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const longRunDayIndex = daysOfWeek.indexOf(longRunDay)

  // Get easy/hard split based on training days (Runna methodology)
  const split = getEasyHardSplit(trainingDays)
  const difficultySettings = DIFFICULTY_LEVELS[difficulty] || DIFFICULTY_LEVELS.balanced

  // Recovery week reduces volume by 30%
  const weekMultiplier = isRecoveryWeek ? 0.7 : 1.0

  // Calculate workout distribution
  const longRunPct = raceType === 'marathon' ? 0.35 : 0.30
  const longRunDistance = Math.min(
    targetDistance * longRunPct * weekMultiplier,
    RACE_TYPES[raceType].peakLongRunKm
  )

  // Hard sessions get ~20% of remaining after long run
  const hardSessionDistance = (targetDistance - longRunDistance) * split.hardRatio * difficultySettings.hardSessionsMultiplier
  const easyDistance = (targetDistance * weekMultiplier) - longRunDistance - hardSessionDistance

  // Determine training days
  const trainingDayIndices = []
  trainingDayIndices.push(longRunDayIndex)

  const availableDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== longRunDayIndex)
  const daysNeeded = trainingDays - 1
  const spacing = Math.floor(7 / trainingDays)

  for (let i = 0; i < daysNeeded && trainingDayIndices.length < trainingDays; i++) {
    const preferredDay = (longRunDayIndex + 2 + i * spacing) % 7
    if (!trainingDayIndices.includes(preferredDay)) {
      trainingDayIndices.push(preferredDay)
    } else {
      for (const d of availableDays) {
        if (!trainingDayIndices.includes(d)) {
          trainingDayIndices.push(d)
          break
        }
      }
    }
  }
  trainingDayIndices.sort((a, b) => a - b)

  // Determine hard workout days (not adjacent to long run)
  const hardDays = []
  const numHardDays = Math.min(split.maxHardDays, Math.floor(trainingDays * split.hardRatio))

  for (let i = 0; i < numHardDays; i++) {
    const candidateDays = trainingDayIndices.filter((d) => {
      if (d === longRunDayIndex) return false
      if (hardDays.includes(d)) return false
      // Not adjacent to long run (for first hard day)
      if (i === 0 && Math.abs(d - longRunDayIndex) <= 1 && Math.abs(d - longRunDayIndex + 7) % 7 <= 1) return false
      // Not adjacent to other hard days
      return !hardDays.some((hd) => Math.abs(d - hd) <= 1)
    })

    if (candidateDays.length > 0) {
      // Pick day closest to middle of week
      const midWeek = (longRunDayIndex + 3) % 7
      candidateDays.sort((a, b) => Math.abs(a - midWeek) - Math.abs(b - midWeek))
      hardDays.push(candidateDays[0])
    }
  }

  // Determine day after hard sessions for recovery runs
  const recoveryDays = hardDays.map((d) => (d + 1) % 7).filter(
    (d) => trainingDayIndices.includes(d) && d !== longRunDayIndex && !hardDays.includes(d)
  )

  // Calculate easy run distance
  const numEasyDays = trainingDays - 1 - hardDays.length // -1 for long run
  const perEasyRunDistance = numEasyDays > 0 ? easyDistance / numEasyDays : 0

  // Create workouts for each day
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = addDays(startDate, dayOffset)
    const dayIndex = (startDate.getDay() + dayOffset) % 7

    // Race day check
    if (isRaceWeek && isSameDay(date, raceDate)) {
      workouts.push({
        date: date.toISOString(),
        type: 'race',
        title: `Race Day: ${RACE_TYPES[raceType].name}`,
        description: 'Run your race! Trust your training. Start controlled and finish strong.',
        distance: RACE_TYPES[raceType].distance,
        duration: null,
        pace: paceZones.racePace,
        completed: false,
        actualActivityId: null,
      })
      continue
    }

    if (!trainingDayIndices.includes(dayIndex)) {
      // Rest day
      workouts.push({
        date: date.toISOString(),
        type: 'rest',
        title: 'Rest Day',
        description: 'Complete rest or light cross-training. Let your body recover and adapt.',
        distance: 0,
        duration: 0,
        pace: 'N/A',
        completed: false,
        actualActivityId: null,
      })
    } else if (dayIndex === longRunDayIndex) {
      // Long run
      const distance = isRaceWeek ? longRunDistance * 0.5 : longRunDistance
      workouts.push({
        date: date.toISOString(),
        type: 'long',
        title: 'Long Run',
        description: getWorkoutDescription('long', raceType, phase, distance, paceZones),
        distance: Math.round(distance * 10) / 10,
        duration: Math.round(distance * 6.5),
        pace: paceZones.longPace,
        completed: false,
        actualActivityId: null,
      })
    } else if (hardDays.includes(dayIndex) && phase !== 'base') {
      // Hard workout day
      const isSecondHardDay = hardDays.indexOf(dayIndex) === 1
      const workoutType = getQualityWorkoutType(phase, raceType, weekNumber, isSecondHardDay)
      const distance = isRaceWeek ? hardSessionDistance * 0.5 / hardDays.length : hardSessionDistance / hardDays.length

      workouts.push({
        date: date.toISOString(),
        type: workoutType,
        title: WORKOUT_TYPES[workoutType].name,
        description: getWorkoutDescription(workoutType, raceType, phase, distance, paceZones),
        distance: Math.round(distance * 10) / 10,
        duration: Math.round(distance * 5.5),
        pace: workoutType === 'tempo' ? paceZones.tempoPace :
          workoutType === 'threshold' ? paceZones.thresholdPace :
            paceZones.intervalPace,
        completed: false,
        actualActivityId: null,
      })
    } else if (recoveryDays.includes(dayIndex)) {
      // Recovery run (day after hard session)
      const distance = perEasyRunDistance * 0.6 // Shorter than normal easy
      workouts.push({
        date: date.toISOString(),
        type: 'recovery',
        title: 'Recovery Run',
        description: getWorkoutDescription('recovery', raceType, phase, distance, paceZones),
        distance: Math.round(distance * 10) / 10,
        duration: Math.round(distance * 7),
        pace: 'Very Easy',
        completed: false,
        actualActivityId: null,
      })
    } else if (phase === 'base' && hardDays.includes(dayIndex)) {
      // Base phase: strides or hills instead of hard workouts
      const workoutType = weekNumber % 2 === 0 ? 'hills' : 'strides'
      const distance = perEasyRunDistance

      workouts.push({
        date: date.toISOString(),
        type: workoutType,
        title: WORKOUT_TYPES[workoutType].name,
        description: getWorkoutDescription(workoutType, raceType, phase, distance, paceZones),
        distance: Math.round(distance * 10) / 10,
        duration: Math.round(distance * 6),
        pace: paceZones.easyPace,
        completed: false,
        actualActivityId: null,
      })
    } else {
      // Easy run (with occasional strides in build/peak phase)
      const addStrides = phase !== 'base' && weekNumber % 3 === 0 && !recoveryDays.includes(dayIndex)
      const workoutType = addStrides ? 'strides' : 'easy'
      const distance = isRaceWeek ? perEasyRunDistance * 0.5 : perEasyRunDistance

      workouts.push({
        date: date.toISOString(),
        type: workoutType,
        title: addStrides ? 'Easy Run + Strides' : 'Easy Run',
        description: getWorkoutDescription(workoutType, raceType, phase, distance, paceZones),
        distance: Math.round(distance * 10) / 10,
        duration: Math.round(distance * 6.5),
        pace: paceZones.easyPace,
        completed: false,
        actualActivityId: null,
      })
    }
  }

  return workouts.sort((a, b) => new Date(a.date) - new Date(b.date))
}

// Main plan generation function
export const generateTrainingPlan = ({
  raceType,
  raceDate,
  raceName,
  weeklyMileage,
  longestRun,
  experienceLevel,
  trainingDays,
  longRunDay,
  volumeProgression = 'steady',
  difficulty = 'balanced',
  goalTime,
}) => {
  const race = RACE_TYPES[raceType]
  const today = new Date()
  const raceDateObj = new Date(raceDate)

  const weeksUntilRace = differenceInWeeks(raceDateObj, today)

  if (weeksUntilRace < race.minWeeks) {
    throw new Error(`Need at least ${race.minWeeks} weeks to train for a ${race.name}. You have ${weeksUntilRace} weeks.`)
  }

  const totalWeeks = Math.min(weeksUntilRace, race.idealWeeks + 4)

  // Get progression and experience settings
  const progression = VOLUME_PROGRESSIONS[volumeProgression] || VOLUME_PROGRESSIONS.steady
  const expSettings = EXPERIENCE_MULTIPLIERS[experienceLevel] || EXPERIENCE_MULTIPLIERS.intermediate

  // Calculate starting and peak mileage
  const startingMileage = weeklyMileage || 20
  const peakMileage = Math.min(
    startingMileage * progression.peakMultiplier * expSettings.volume,
    race.distance * 3
  )

  // Calculate pace zones
  const goalTimeMinutes = goalTime ? parseTimeToMinutes(goalTime) : null
  const paceZones = calculatePaceZones(raceType, goalTimeMinutes, peakMileage, experienceLevel)

  // Generate weeks
  const weeks = []
  const planStartDate = startOfWeek(addDays(today, 1), { weekStartsOn: 0 })

  for (let w = 0; w < totalWeeks; w++) {
    const weeksRemaining = totalWeeks - w
    const weekStartDate = addDays(planStartDate, w * 7)
    const phase = getPhase(weeksRemaining, totalWeeks, race.taperWeeks)

    // Calculate target distance using progression rate
    let targetDistance
    const buildWeeks = totalWeeks - race.taperWeeks

    if (phase === 'taper') {
      const taperWeek = race.taperWeeks - weeksRemaining + 1
      const taperPct = 1 - (taperWeek * 0.25)
      targetDistance = peakMileage * taperPct
    } else {
      // Progressive build using weekly increase rate
      const weekProgress = Math.min(w / buildWeeks, 1)
      targetDistance = startingMileage + (peakMileage - startingMileage) * weekProgress
    }

    // Check for deload week
    const isRecoveryWeek = isDeloadWeek(w, phase, totalWeeks)
    const isRaceWeek = w === totalWeeks - 1

    const workouts = generateWeekWorkouts({
      weekNumber: w + 1,
      startDate: weekStartDate,
      phase,
      targetDistance,
      trainingDays,
      longRunDay,
      raceType,
      isRecoveryWeek,
      isRaceWeek,
      raceDate: raceDateObj,
      difficulty,
      paceZones,
    })

    const weekDistance = workouts.reduce((sum, wo) => sum + (wo.distance || 0), 0)

    weeks.push({
      weekNumber: w + 1,
      startDate: weekStartDate.toISOString(),
      phase,
      isRecoveryWeek,
      totalDistance: Math.round(weekDistance * 10) / 10,
      workouts,
    })
  }

  const peakWeek = weeks.reduce((max, w) => w.totalDistance > max.totalDistance ? w : max, weeks[0])

  return {
    id: generateId(),
    raceName: raceName || `${race.name} Race`,
    raceType,
    raceDate: raceDateObj.toISOString(),
    createdAt: new Date().toISOString(),
    weeks,
    paceZones,
    summary: {
      totalWeeks,
      peakWeekDistance: peakWeek.totalDistance,
      estimatedFinishTime: goalTime || estimateFinishTime(raceType, peakMileage, experienceLevel),
      startingMileage,
      peakMileage: Math.round(peakMileage * 10) / 10,
      trainingApproach: `${VOLUME_PROGRESSIONS[volumeProgression].name} volume, ${DIFFICULTY_LEVELS[difficulty].name} difficulty`,
    },
    settings: {
      experienceLevel,
      trainingDays,
      longRunDay,
      volumeProgression,
      difficulty,
    },
  }
}

// Parse time string to minutes
const parseTimeToMinutes = (timeStr) => {
  const parts = timeStr.split(':').map(Number)
  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + parts[2] / 60
  } else if (parts.length === 2) {
    return parts[0] + parts[1] / 60
  }
  return null
}

// Storage functions
const STORAGE_KEY = 'strava_training_plans'
const SETTINGS_KEY = 'strava_training_settings'

export const savePlan = (plan) => {
  const stored = getStoredPlans()
  const existingIndex = stored.plans.findIndex((p) => p.id === plan.id)

  if (existingIndex >= 0) {
    stored.plans[existingIndex] = plan
  } else {
    stored.plans.push(plan)
  }

  stored.activePlanId = plan.id
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  return plan
}

export const getStoredPlans = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load training plans:', e)
  }
  return { plans: [], activePlanId: null }
}

export const getActivePlan = () => {
  const stored = getStoredPlans()
  if (!stored.activePlanId) return null
  return stored.plans.find((p) => p.id === stored.activePlanId) || null
}

export const deletePlan = (planId) => {
  const stored = getStoredPlans()
  stored.plans = stored.plans.filter((p) => p.id !== planId)
  if (stored.activePlanId === planId) {
    stored.activePlanId = stored.plans[0]?.id || null
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export const updateWorkoutCompletion = (planId, workoutDate, completed, activityId = null) => {
  const stored = getStoredPlans()
  const plan = stored.plans.find((p) => p.id === planId)

  if (plan) {
    for (const week of plan.weeks) {
      const workout = week.workouts.find((w) => w.date === workoutDate)
      if (workout) {
        workout.completed = completed
        workout.actualActivityId = activityId
        break
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  }
}

export const getTrainingSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load training settings:', e)
  }
  return {
    defaultLongRunDay: 'saturday',
    defaultTrainingDays: 5,
    showCompletedWorkouts: true,
  }
}

export const saveTrainingSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// Get current week info for a plan
export const getCurrentWeekInfo = (plan) => {
  if (!plan) return null

  const today = new Date()
  const raceDate = new Date(plan.raceDate)

  const currentWeek = plan.weeks.find((week) => {
    const weekStart = new Date(week.startDate)
    const weekEnd = addDays(weekStart, 6)
    return today >= weekStart && today <= weekEnd
  })

  const daysUntilRace = Math.ceil((raceDate - today) / (1000 * 60 * 60 * 24))

  const allWorkouts = plan.weeks.flatMap((w) => w.workouts)
  const pastWorkouts = allWorkouts.filter((w) => new Date(w.date) < today && w.type !== 'rest')
  const completedWorkouts = pastWorkouts.filter((w) => w.completed)

  return {
    currentWeek,
    daysUntilRace,
    weeksUntilRace: Math.ceil(daysUntilRace / 7),
    completedCount: completedWorkouts.length,
    totalScheduled: pastWorkouts.length,
    completionRate: pastWorkouts.length > 0 ? Math.round((completedWorkouts.length / pastWorkouts.length) * 100) : 100,
  }
}
