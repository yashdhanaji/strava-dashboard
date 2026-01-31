import { useState, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { WORKOUT_TYPES } from '@/utils/trainingPlanGenerator'
import WorkoutCard from './WorkoutCard'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TrainingCalendar = ({ plan, onToggleComplete }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Create a map of date -> workout for quick lookup
  const workoutsByDate = useMemo(() => {
    const map = new Map()
    if (plan?.weeks) {
      plan.weeks.forEach((week) => {
        week.workouts.forEach((workout) => {
          const dateKey = format(new Date(workout.date), 'yyyy-MM-dd')
          map.set(dateKey, { ...workout, phase: week.phase, weekNumber: week.weekNumber })
        })
      })
    }
    return map
  }, [plan])

  // Get all days to display in the calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Jump to current week
  const handleToday = () => setCurrentMonth(new Date())

  // Jump to race date
  const handleRaceDate = () => {
    if (plan?.raceDate) {
      setCurrentMonth(new Date(plan.raceDate))
    }
  }

  const today = new Date()
  const raceDate = plan?.raceDate ? new Date(plan.raceDate) : null

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Training Calendar</CardTitle>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            {raceDate && (
              <Button variant="outline" size="sm" onClick={handleRaceDate}>
                Race Day
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Workout type legend */}
        <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b">
          {Object.entries(WORKOUT_TYPES).map(([key, type]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <div className={cn('h-3 w-3 rounded-full', type.color)} />
              <span className="text-muted-foreground">{type.name}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const workout = workoutsByDate.get(dateKey)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, today)
            const isRaceDay = raceDate && isSameDay(day, raceDate)

            return (
              <div
                key={dateKey}
                className={cn(
                  'min-h-[80px] sm:min-h-[100px] p-1 border rounded-md',
                  !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                  isToday && 'ring-2 ring-primary',
                  isRaceDay && 'ring-2 ring-yellow-500'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isToday &&
                        'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {workout && (
                    <span className="text-[10px] text-muted-foreground uppercase">
                      W{workout.weekNumber}
                    </span>
                  )}
                </div>

                {workout && (
                  <WorkoutCard
                    workout={workout}
                    onToggleComplete={onToggleComplete}
                    compact
                  />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default TrainingCalendar
