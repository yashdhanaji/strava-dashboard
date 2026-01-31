import { format } from 'date-fns'
import { Calendar, Clock, Flag, TrendingUp, Trophy, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

import { RACE_TYPES, getPhaseDescription, getCurrentWeekInfo } from '@/utils/trainingPlanGenerator'

const PHASE_COLORS = {
  base: 'bg-blue-500',
  build: 'bg-orange-500',
  peak: 'bg-red-500',
  taper: 'bg-green-500',
}

const PlanSummary = ({ plan, onDeletePlan, onCreateNew }) => {
  if (!plan) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No Active Training Plan</CardTitle>
          <CardDescription className="text-center mb-4">
            Create a personalized training plan to reach your race goals
          </CardDescription>
          <Button onClick={onCreateNew}>Create Training Plan</Button>
        </CardContent>
      </Card>
    )
  }

  const weekInfo = getCurrentWeekInfo(plan)
  const race = RACE_TYPES[plan.raceType]
  const raceDate = new Date(plan.raceDate)
  const isRacePast = raceDate < new Date()

  return (
    <div className="space-y-4">
      {/* Main summary card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                {plan.raceName}
              </CardTitle>
              <CardDescription>
                {race?.name} on {format(raceDate, 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Training Plan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your training plan for {plan.raceName}.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeletePlan(plan.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Plan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Countdown and phase */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {isRacePast ? 'Race was' : 'Days Until Race'}
              </p>
              <p className="text-3xl font-bold text-primary">
                {isRacePast ? 'Completed!' : weekInfo?.daysUntilRace}
              </p>
              {!isRacePast && weekInfo?.weeksUntilRace && (
                <p className="text-xs text-muted-foreground mt-1">
                  ({weekInfo.weeksUntilRace} weeks)
                </p>
              )}
            </div>

            {weekInfo?.currentWeek && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      'h-3 w-3 rounded-full',
                      PHASE_COLORS[weekInfo.currentWeek.phase]
                    )}
                  />
                  <p className="text-sm font-medium capitalize">
                    {weekInfo.currentWeek.phase} Phase
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getPhaseDescription(weekInfo.currentWeek.phase)}
                </p>
              </div>
            )}
          </div>

          {/* This week's target */}
          {weekInfo?.currentWeek && (
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">Week {weekInfo.currentWeek.weekNumber}</span>
                </div>
                <Badge variant="outline">
                  {weekInfo.currentWeek.totalDistance} km target
                </Badge>
              </div>
              {weekInfo.currentWeek.isRecoveryWeek && (
                <p className="text-sm text-muted-foreground">
                  Recovery week - reduced volume
                </p>
              )}
            </div>
          )}

          {/* Progress stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Workout Completion</span>
              <span className="font-medium">
                {weekInfo?.completedCount || 0} / {weekInfo?.totalScheduled || 0} workouts
              </span>
            </div>
            <Progress value={weekInfo?.completionRate || 0} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {weekInfo?.completionRate || 0}% completion rate
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plan details card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Plan Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Weeks</span>
              <span className="font-medium">{plan.summary.totalWeeks}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Peak Week Distance</span>
              <span className="font-medium">{plan.summary.peakWeekDistance} km</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Starting Mileage</span>
              <span className="font-medium">{plan.summary.startingMileage} km/week</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Peak Mileage</span>
              <span className="font-medium">{plan.summary.peakMileage} km/week</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Training Days</span>
              <span className="font-medium">{plan.settings.trainingDays} days/week</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Intensity</span>
              <span className="font-medium capitalize">{plan.settings.intensity}</span>
            </div>
          </div>

          {plan.summary.estimatedFinishTime && (
            <div className="mt-4 rounded-lg bg-primary/10 p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Estimated Finish Time</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {plan.summary.estimatedFinishTime}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Training Phases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1">
            {plan.weeks.map((week) => {
              const isCurrentWeek = weekInfo?.currentWeek?.weekNumber === week.weekNumber
              return (
                <div
                  key={week.weekNumber}
                  className={cn(
                    'flex-1 h-8 rounded-sm transition-all',
                    PHASE_COLORS[week.phase],
                    week.isRecoveryWeek && 'opacity-50',
                    isCurrentWeek && 'ring-2 ring-foreground ring-offset-2'
                  )}
                  title={`Week ${week.weekNumber}: ${week.phase}${
                    week.isRecoveryWeek ? ' (recovery)' : ''
                  } - ${week.totalDistance}km`}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Week 1</span>
            <span>Week {plan.weeks.length}</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {Object.entries(PHASE_COLORS).map(([phase, color]) => (
              <div key={phase} className="flex items-center gap-1.5 text-xs">
                <div className={cn('h-3 w-3 rounded-sm', color)} />
                <span className="capitalize">{phase}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PlanSummary
