import { useState, useEffect } from 'react'
import { format, addMonths } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import {
  RACE_TYPES,
  calculateCurrentFitness,
  estimateFinishTime,
  generateTrainingPlan,
} from '@/utils/trainingPlanGenerator'

const STEPS = [
  { id: 1, title: 'Race Details', description: 'Tell us about your race' },
  { id: 2, title: 'Current Fitness', description: 'Your running background' },
  { id: 3, title: 'Preferences', description: 'Customize your plan' },
  { id: 4, title: 'Review', description: 'Generate your plan' },
]

const RaceGoalWizard = ({ activities, onPlanGenerated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Race Details
    raceType: '',
    raceDate: null,
    raceName: '',

    // Step 2: Current Fitness
    weeklyMileage: 0,
    longestRun: 0,
    experienceLevel: 'intermediate',
    recentRaceTime: '',

    // Step 3: Preferences
    trainingDays: 5,
    longRunDay: 'saturday',
    intensity: 'moderate',
  })

  // Auto-calculate fitness from Strava data
  useEffect(() => {
    if (activities && activities.length > 0) {
      const fitness = calculateCurrentFitness(activities)
      setFormData((prev) => ({
        ...prev,
        weeklyMileage: fitness.weeklyMileage,
        longestRun: fitness.longestRun,
      }))
    }
  }, [activities])

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.raceType && formData.raceDate
      case 2:
        return formData.weeklyMileage >= 0 && formData.experienceLevel
      case 3:
        return formData.trainingDays >= 3 && formData.longRunDay
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)

    try {
      const plan = generateTrainingPlan({
        raceType: formData.raceType,
        raceDate: formData.raceDate,
        raceName: formData.raceName,
        weeklyMileage: formData.weeklyMileage,
        longestRun: formData.longestRun,
        experienceLevel: formData.experienceLevel,
        trainingDays: formData.trainingDays,
        longRunDay: formData.longRunDay,
        intensity: formData.intensity,
        recentRaceTime: formData.recentRaceTime,
      })

      // Simulate a brief delay for UX
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onPlanGenerated(plan)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const progressValue = (currentStep / STEPS.length) * 100

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Create Training Plan</CardTitle>
            <CardDescription>
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </CardDescription>
          </div>
          <span className="text-sm text-muted-foreground">
            {Math.round(progressValue)}% complete
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Race Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="raceType">Race Type *</Label>
              <Select
                value={formData.raceType}
                onValueChange={(value) => updateFormData('raceType', value)}
              >
                <SelectTrigger id="raceType" className="w-full">
                  <SelectValue placeholder="Select race distance" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RACE_TYPES).map(([key, race]) => (
                    <SelectItem key={key} value={key}>
                      {race.name} ({race.distance} km)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Race Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.raceDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.raceDate ? (
                      format(formData.raceDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.raceDate}
                    onSelect={(date) => updateFormData('raceDate', date)}
                    disabled={(date) => date < new Date()}
                    defaultMonth={addMonths(new Date(), 2)}
                  />
                </PopoverContent>
              </Popover>
              {formData.raceType && RACE_TYPES[formData.raceType] && (
                <p className="text-xs text-muted-foreground">
                  Minimum {RACE_TYPES[formData.raceType].minWeeks} weeks recommended for a{' '}
                  {RACE_TYPES[formData.raceType].name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="raceName">Race Name (Optional)</Label>
              <Input
                id="raceName"
                placeholder="e.g., Boston Marathon 2026"
                value={formData.raceName}
                onChange={(e) => updateFormData('raceName', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Current Fitness */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 mb-4">
              <p className="text-sm text-muted-foreground">
                We've analyzed your recent Strava activities to estimate your current fitness.
                Feel free to adjust these values.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weeklyMileage">Weekly Mileage (km)</Label>
                <Input
                  id="weeklyMileage"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.weeklyMileage}
                  onChange={(e) => updateFormData('weeklyMileage', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Average over the last 4 weeks
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longestRun">Longest Recent Run (km)</Label>
                <Input
                  id="longestRun"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.longestRun}
                  onChange={(e) => updateFormData('longestRun', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  From the last 4 weeks
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Running Experience</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) => updateFormData('experienceLevel', value)}
              >
                <SelectTrigger id="experienceLevel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">
                    Beginner (Less than 1 year running)
                  </SelectItem>
                  <SelectItem value="intermediate">
                    Intermediate (1-3 years running)
                  </SelectItem>
                  <SelectItem value="advanced">
                    Advanced (3+ years running)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recentRaceTime">Recent Race Time (Optional)</Label>
              <Input
                id="recentRaceTime"
                placeholder="e.g., 25:00 for 5K or 1:45:00 for half"
                value={formData.recentRaceTime}
                onChange={(e) => updateFormData('recentRaceTime', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If you have a recent race result, enter it here for better pace predictions
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Training Preferences */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trainingDays">Training Days Per Week</Label>
              <Select
                value={formData.trainingDays.toString()}
                onValueChange={(value) => updateFormData('trainingDays', parseInt(value))}
              >
                <SelectTrigger id="trainingDays" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days (Minimal)</SelectItem>
                  <SelectItem value="4">4 days (Light)</SelectItem>
                  <SelectItem value="5">5 days (Balanced)</SelectItem>
                  <SelectItem value="6">6 days (Serious)</SelectItem>
                  <SelectItem value="7">7 days (Elite)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longRunDay">Preferred Long Run Day</Label>
              <Select
                value={formData.longRunDay}
                onValueChange={(value) => updateFormData('longRunDay', value)}
              >
                <SelectTrigger id="longRunDay" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intensity">Plan Intensity</Label>
              <Select
                value={formData.intensity}
                onValueChange={(value) => updateFormData('intensity', value)}
              >
                <SelectTrigger id="intensity" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">
                    Conservative (Lower mileage, more rest)
                  </SelectItem>
                  <SelectItem value="moderate">
                    Balanced (Recommended for most runners)
                  </SelectItem>
                  <SelectItem value="aggressive">
                    Aggressive (Higher mileage, faster progression)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.intensity === 'easy' &&
                  'Great for injury-prone runners or those with limited time'}
                {formData.intensity === 'moderate' &&
                  'Good balance of training stress and recovery'}
                {formData.intensity === 'aggressive' &&
                  'For experienced runners looking to push limits'}
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold">Plan Summary</h3>

              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Race</span>
                  <span className="font-medium">
                    {formData.raceName || RACE_TYPES[formData.raceType]?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Race Date</span>
                  <span className="font-medium">
                    {formData.raceDate ? format(formData.raceDate, 'PPP') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-medium">
                    {RACE_TYPES[formData.raceType]?.distance} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Weekly Mileage</span>
                  <span className="font-medium">{formData.weeklyMileage} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Training Days</span>
                  <span className="font-medium">{formData.trainingDays} days/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Long Run Day</span>
                  <span className="font-medium capitalize">{formData.longRunDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan Intensity</span>
                  <span className="font-medium capitalize">{formData.intensity}</span>
                </div>
              </div>
            </div>

            {formData.raceType && formData.weeklyMileage > 0 && (
              <div className="rounded-lg bg-primary/10 p-4">
                <h4 className="font-medium text-primary mb-1">Estimated Finish Time</h4>
                <p className="text-2xl font-bold">
                  {estimateFinishTime(
                    formData.raceType,
                    formData.weeklyMileage,
                    formData.longestRun,
                    formData.experienceLevel,
                    formData.recentRaceTime
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on your current fitness and training plan
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack} disabled={generating}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={onCancel} disabled={generating}>
                Cancel
              </Button>
            )}
          </div>

          <div>
            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleGenerate} disabled={generating || !canProceed()}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RaceGoalWizard
