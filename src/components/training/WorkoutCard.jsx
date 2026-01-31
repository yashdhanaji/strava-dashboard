import { format } from 'date-fns'
import { CheckCircle2, Circle, Clock, MapPin, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { WORKOUT_TYPES } from '@/utils/trainingPlanGenerator'

const WorkoutCard = ({ workout, onToggleComplete, compact = false }) => {
  const workoutType = WORKOUT_TYPES[workout.type] || WORKOUT_TYPES.easy
  const isRest = workout.type === 'rest'
  const isCompleted = workout.completed
  const isPast = new Date(workout.date) < new Date()
  const isToday = format(new Date(workout.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  if (compact) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className={cn(
              'w-full text-left p-1.5 rounded-md transition-colors text-xs',
              workoutType.bgLight,
              'hover:opacity-80 cursor-pointer',
              isCompleted && 'opacity-60'
            )}
          >
            <div className="flex items-center gap-1">
              {isCompleted ? (
                <CheckCircle2 className={cn('h-3 w-3 shrink-0', workoutType.textColor)} />
              ) : (
                <Circle className={cn('h-3 w-3 shrink-0', workoutType.textColor)} />
              )}
              <span className="truncate font-medium">{workoutType.name}</span>
            </div>
            {!isRest && workout.distance > 0 && (
              <div className="text-muted-foreground mt-0.5 ml-4">
                {workout.distance} km
              </div>
            )}
          </button>
        </DialogTrigger>
        <WorkoutDetailDialog
          workout={workout}
          workoutType={workoutType}
          onToggleComplete={onToggleComplete}
          isCompleted={isCompleted}
        />
      </Dialog>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={cn(
            'rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md',
            isToday && 'ring-2 ring-primary',
            isCompleted && 'bg-muted/50'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-3 w-3 rounded-full shrink-0',
                  workoutType.color
                )}
              />
              <div>
                <h4 className="font-medium text-sm">{workout.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(workout.date), 'EEEE, MMM d')}
                </p>
              </div>
            </div>
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            ) : isPast && !isRest ? (
              <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
            ) : null}
          </div>

          {!isRest && (
            <div className="mt-2 flex flex-wrap gap-2">
              {workout.distance > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {workout.distance} km
                </Badge>
              )}
              {workout.duration > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  ~{workout.duration} min
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {workout.pace}
              </Badge>
            </div>
          )}
        </div>
      </DialogTrigger>
      <WorkoutDetailDialog
        workout={workout}
        workoutType={workoutType}
        onToggleComplete={onToggleComplete}
        isCompleted={isCompleted}
      />
    </Dialog>
  )
}

const WorkoutDetailDialog = ({ workout, workoutType, onToggleComplete, isCompleted }) => {
  const isRest = workout.type === 'rest'
  const isRace = workout.type === 'race'

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className={cn('h-4 w-4 rounded-full shrink-0', workoutType.color)} />
          <DialogTitle>{workout.title}</DialogTitle>
        </div>
        <DialogDescription>
          {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <p className="text-sm">{workout.description}</p>

        {!isRest && (
          <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Distance</p>
              <p className="text-lg font-bold">{workout.distance} km</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
              <p className="text-lg font-bold">
                {workout.duration ? `~${workout.duration}m` : '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pace</p>
              <p className="text-lg font-bold">{workout.pace}</p>
            </div>
          </div>
        )}

        <div className="rounded-lg border p-3">
          <h4 className="font-medium text-sm mb-1">Workout Type</h4>
          <div className="flex items-center gap-2">
            <Badge className={cn(workoutType.color, 'text-white')}>
              {workoutType.name}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {workoutType.description}
            </span>
          </div>
        </div>

        {!isRest && !isRace && onToggleComplete && (
          <Button
            onClick={() => onToggleComplete(workout.date, !isCompleted)}
            variant={isCompleted ? 'outline' : 'default'}
            className="w-full"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Incomplete
              </>
            ) : (
              <>
                <Circle className="mr-2 h-4 w-4" />
                Mark as Complete
              </>
            )}
          </Button>
        )}

        {workout.actualActivityId && (
          <div className="text-center text-sm text-muted-foreground">
            Linked to Strava activity #{workout.actualActivityId}
          </div>
        )}
      </div>
    </DialogContent>
  )
}

export default WorkoutCard
