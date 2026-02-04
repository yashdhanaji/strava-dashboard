/**
 * Convert CSV workout data to Training Plan structure
 */

import { startOfWeek, addDays, format, differenceInDays, parseISO } from 'date-fns'
import { WORKOUT_TYPES, RACE_TYPES } from './trainingPlanGenerator'

/**
 * Generate a unique ID
 */
const generateId = () => Math.random().toString(36).substr(2, 9)

/**
 * Determine training phase based on position in plan
 * @param {number} weekIndex - Current week index (0-based)
 * @param {number} totalWeeks - Total number of weeks
 * @returns {string}
 */
const determinePhase = (weekIndex, totalWeeks) => {
  const progress = weekIndex / totalWeeks

  // Last 15% is taper
  if (progress >= 0.85) return 'taper'
  // 60-85% is peak
  if (progress >= 0.6) return 'peak'
  // 30-60% is build
  if (progress >= 0.3) return 'build'
  // First 30% is base
  return 'base'
}

/**
 * Get workout defaults based on type
 * @param {string} type
 * @returns {object}
 */
const getWorkoutDefaults = (type) => {
  const workoutType = WORKOUT_TYPES[type]
  if (!workoutType) {
    return {
      title: 'Workout',
      description: '',
      paceZone: 'Moderate',
    }
  }

  return {
    title: workoutType.name,
    description: workoutType.description,
    paceZone: workoutType.paceZone,
  }
}

/**
 * Convert flat workout rows to week-based training plan structure
 * @param {object[]} workouts - Array of validated workout rows
 * @param {object} raceInfo - Race information
 * @param {string} raceInfo.raceName - Name of the race
 * @param {string} raceInfo.raceType - Type of race (5k, 10k, half, marathon)
 * @param {Date|string} raceInfo.raceDate - Race date
 * @returns {object} Training plan object
 */
export const convertToTrainingPlan = (workouts, raceInfo) => {
  if (!workouts || workouts.length === 0) {
    throw new Error('No workouts provided')
  }

  // Sort workouts by date
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )

  // Get date range
  const firstDate = parseISO(sortedWorkouts[0].date)
  const lastDate = parseISO(sortedWorkouts[sortedWorkouts.length - 1].date)
  const raceDate = raceInfo.raceDate
    ? new Date(raceInfo.raceDate)
    : addDays(lastDate, 1) // Default: day after last workout

  // Find first week start (Sunday)
  const planStartDate = startOfWeek(firstDate, { weekStartsOn: 0 })

  // Calculate total weeks (including partial weeks)
  const totalDays = differenceInDays(raceDate, planStartDate) + 1
  const totalWeeks = Math.ceil(totalDays / 7)

  // Create a map of date -> workout for quick lookup
  const workoutMap = new Map()
  sortedWorkouts.forEach((workout) => {
    workoutMap.set(workout.date, workout)
  })

  // Generate weeks
  const weeks = []

  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
    const weekStart = addDays(planStartDate, weekIndex * 7)
    const phase = determinePhase(weekIndex, totalWeeks)
    const weekWorkouts = []

    // Generate workouts for each day of the week
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = addDays(weekStart, dayOffset)
      const dateKey = format(currentDate, 'yyyy-MM-dd')
      const existingWorkout = workoutMap.get(dateKey)

      if (existingWorkout) {
        // Use the imported workout
        const defaults = getWorkoutDefaults(existingWorkout.type)

        weekWorkouts.push({
          date: currentDate.toISOString(),
          type: existingWorkout.type,
          title: existingWorkout.title || defaults.title,
          description: existingWorkout.description || defaults.description,
          distance: existingWorkout.distance || 0,
          duration: existingWorkout.duration || 0,
          pace: existingWorkout.pace || 'N/A',
          completed: false,
          actualActivityId: null,
        })
      } else {
        // Fill with rest day if no workout defined
        weekWorkouts.push({
          date: currentDate.toISOString(),
          type: 'rest',
          title: 'Rest Day',
          description: 'Complete rest or light cross-training. Let your body recover and adapt.',
          distance: 0,
          duration: 0,
          pace: 'N/A',
          completed: false,
          actualActivityId: null,
        })
      }
    }

    // Calculate total distance for the week
    const weekDistance = weekWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0)

    // Detect if this is a recovery week (significantly less volume than previous)
    const isRecoveryWeek = weeks.length > 0 && weekDistance < weeks[weeks.length - 1].totalDistance * 0.75

    weeks.push({
      weekNumber: weekIndex + 1,
      startDate: weekStart.toISOString(),
      phase,
      isRecoveryWeek,
      totalDistance: Math.round(weekDistance * 10) / 10,
      workouts: weekWorkouts,
    })
  }

  // Calculate summary stats
  const peakWeek = weeks.reduce(
    (max, w) => (w.totalDistance > max.totalDistance ? w : max),
    weeks[0]
  )

  const totalDistance = weeks.reduce((sum, w) => sum + w.totalDistance, 0)
  const avgWeeklyDistance = Math.round((totalDistance / weeks.length) * 10) / 10

  // Get race type info
  const race = RACE_TYPES[raceInfo.raceType] || {
    name: 'Custom Race',
    distance: null,
  }

  return {
    id: generateId(),
    raceName: raceInfo.raceName || `${race.name} Race`,
    raceType: raceInfo.raceType || 'custom',
    raceDate: raceDate.toISOString(),
    createdAt: new Date().toISOString(),
    importedFromCSV: true,
    weeks,
    paceZones: null, // No calculated pace zones for imported plans
    summary: {
      totalWeeks: weeks.length,
      peakWeekDistance: peakWeek.totalDistance,
      estimatedFinishTime: null, // User can manually set
      startingMileage: weeks[0]?.totalDistance || 0,
      peakMileage: peakWeek.totalDistance,
      averageWeeklyDistance: avgWeeklyDistance,
      trainingApproach: 'Custom imported plan',
    },
    settings: {
      experienceLevel: 'intermediate', // Default
      trainingDays: calculateAvgTrainingDays(weeks),
      longRunDay: detectLongRunDay(weeks),
      volumeProgression: 'custom',
      difficulty: 'custom',
    },
  }
}

/**
 * Calculate average training days per week
 * @param {object[]} weeks
 * @returns {number}
 */
const calculateAvgTrainingDays = (weeks) => {
  if (weeks.length === 0) return 5

  const totalTrainingDays = weeks.reduce((sum, week) => {
    return sum + week.workouts.filter((w) => w.type !== 'rest').length
  }, 0)

  return Math.round(totalTrainingDays / weeks.length)
}

/**
 * Detect the most common long run day
 * @param {object[]} weeks
 * @returns {string}
 */
const detectLongRunDay = (weeks) => {
  const dayCount = {}
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  weeks.forEach((week) => {
    week.workouts.forEach((workout, index) => {
      if (workout.type === 'long') {
        const dayName = days[index]
        dayCount[dayName] = (dayCount[dayName] || 0) + 1
      }
    })
  })

  // Find most common day
  let maxDay = 'saturday'
  let maxCount = 0
  Object.entries(dayCount).forEach(([day, count]) => {
    if (count > maxCount) {
      maxDay = day
      maxCount = count
    }
  })

  return maxDay
}

/**
 * Merge imported workouts with existing plan (for updating)
 * @param {object} existingPlan
 * @param {object[]} newWorkouts
 * @returns {object} Updated plan
 */
export const mergeWorkoutsIntoPlan = (existingPlan, newWorkouts) => {
  // Create a map of date -> workout for new workouts
  const newWorkoutMap = new Map()
  newWorkouts.forEach((workout) => {
    newWorkoutMap.set(workout.date, workout)
  })

  // Update existing plan weeks
  const updatedWeeks = existingPlan.weeks.map((week) => {
    const updatedWorkouts = week.workouts.map((workout) => {
      const dateKey = format(new Date(workout.date), 'yyyy-MM-dd')
      const newWorkout = newWorkoutMap.get(dateKey)

      if (newWorkout) {
        const defaults = getWorkoutDefaults(newWorkout.type)
        return {
          ...workout,
          type: newWorkout.type,
          title: newWorkout.title || defaults.title,
          description: newWorkout.description || defaults.description,
          distance: newWorkout.distance || 0,
          duration: newWorkout.duration || 0,
          pace: newWorkout.pace || 'N/A',
        }
      }

      return workout
    })

    const weekDistance = updatedWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0)

    return {
      ...week,
      workouts: updatedWorkouts,
      totalDistance: Math.round(weekDistance * 10) / 10,
    }
  })

  return {
    ...existingPlan,
    weeks: updatedWeeks,
    importedFromCSV: true,
  }
}
