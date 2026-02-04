import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import stravaApi from '@/services/stravaApi'

import { AppSidebar } from '@/components/app-sidebar'
import { TopNavBar } from '@/components/top-navbar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Plus, Calendar, BarChart3, Upload, Wand2 } from 'lucide-react'

import RaceGoalWizard from '@/components/training/RaceGoalWizard'
import CSVUploadWizard from '@/components/training/CSVUploadWizard'
import TrainingCalendar from '@/components/training/TrainingCalendar'
import PlanSummary from '@/components/training/PlanSummary'
import WorkoutCard from '@/components/training/WorkoutCard'

import {
  getActivePlan,
  savePlan,
  deletePlan,
  updateWorkoutCompletion,
  getCurrentWeekInfo,
} from '@/utils/trainingPlanGenerator'

const Training = () => {
  useAuth() // Ensure user is authenticated
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [showWizard, setShowWizard] = useState(false)
  const [wizardType, setWizardType] = useState(null) // 'generate' or 'csv'
  const [activeTab, setActiveTab] = useState('overview')

  // Load activities and active plan
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Load recent activities for fitness calculation (last 60 days)
      const sixtyDaysAgo = Math.floor((Date.now() - 60 * 24 * 60 * 60 * 1000) / 1000)
      const data = await stravaApi.getAllActivities(sixtyDaysAgo, null)
      setActivities(data)

      // Load active training plan from localStorage
      const plan = getActivePlan()
      setActivePlan(plan)

      // If no plan exists, show wizard selection
      if (!plan) {
        setShowWizard(true)
        setWizardType(null) // Show selection screen
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle plan generation
  const handlePlanGenerated = (plan) => {
    savePlan(plan)
    setActivePlan(plan)
    setShowWizard(false)
    setWizardType(null)
    setActiveTab('calendar')
  }

  // Handle plan deletion
  const handleDeletePlan = (planId) => {
    deletePlan(planId)
    setActivePlan(null)
    setShowWizard(true)
    setWizardType(null)
  }

  // Handle wizard cancel
  const handleWizardCancel = () => {
    if (activePlan) {
      setShowWizard(false)
      setWizardType(null)
    } else {
      setWizardType(null) // Go back to selection
    }
  }

  // Handle starting a new plan (from existing plan)
  const handleCreateNew = () => {
    setShowWizard(true)
    setWizardType(null)
  }

  // Handle workout completion toggle
  const handleToggleComplete = (workoutDate, completed) => {
    if (activePlan) {
      updateWorkoutCompletion(activePlan.id, workoutDate, completed)
      // Reload plan to get updated state
      setActivePlan(getActivePlan())
    }
  }

  // Get current week's workouts
  const weekInfo = activePlan ? getCurrentWeekInfo(activePlan) : null
  const currentWeekWorkouts = weekInfo?.currentWeek?.workouts || []

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AppSidebar />
      <main className="ml-0 md:ml-[88px]">
        <TopNavBar
          title="Training Plan"
          subtitle="AI-powered training insights"
          showFilters={false}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {loading ? (
            <LoadingSkeleton />
          ) : showWizard ? (
            wizardType === 'generate' ? (
              <RaceGoalWizard
                activities={activities}
                onPlanGenerated={handlePlanGenerated}
                onCancel={handleWizardCancel}
              />
            ) : wizardType === 'csv' ? (
              <CSVUploadWizard
                onPlanGenerated={handlePlanGenerated}
                onCancel={handleWizardCancel}
              />
            ) : (
              <WizardSelection
                onSelectGenerate={() => setWizardType('generate')}
                onSelectCSV={() => setWizardType('csv')}
                onCancel={() => {
                  if (activePlan) {
                    setShowWizard(false)
                  }
                }}
                hasExistingPlan={!!activePlan}
              />
            )
          ) : activePlan ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </TabsTrigger>
                <TabsTrigger value="week" className="flex items-center gap-2">
                  <span className="hidden sm:inline">This Week</span>
                  <span className="sm:hidden">Week</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <PlanSummary
                      plan={activePlan}
                      onDeletePlan={handleDeletePlan}
                      onCreateNew={handleCreateNew}
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">This Week's Workouts</h3>
                    {currentWeekWorkouts.length > 0 ? (
                      <div className="space-y-3">
                        {currentWeekWorkouts.map((workout) => (
                          <WorkoutCard
                            key={workout.date}
                            workout={workout}
                            onToggleComplete={handleToggleComplete}
                          />
                        ))}
                      </div>
                    ) : (
                      <Card className="rounded-3xl border-0 shadow-sm bg-white">
                        <CardContent className="py-8 text-center text-[#6B7280]">
                          No workouts scheduled for this week
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                <TrainingCalendar
                  plan={activePlan}
                  onToggleComplete={handleToggleComplete}
                />
              </TabsContent>

              <TabsContent value="week" className="mt-6">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-1">
                      Week {weekInfo?.currentWeek?.weekNumber || '-'}
                    </h2>
                    <p className="text-muted-foreground">
                      {weekInfo?.currentWeek
                        ? `${weekInfo.currentWeek.totalDistance} km total - ${weekInfo.currentWeek.phase} phase`
                        : 'No current week data'}
                    </p>
                  </div>

                  {currentWeekWorkouts.length > 0 ? (
                    <div className="space-y-4">
                      {currentWeekWorkouts.map((workout) => (
                        <WorkoutCard
                          key={workout.date}
                          workout={workout}
                          onToggleComplete={handleToggleComplete}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="rounded-3xl border-0 shadow-sm bg-white">
                      <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#F1F3F5] flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-8 w-8 text-[#6B7280]" />
                        </div>
                        <p className="text-[#6B7280]">
                          No workouts scheduled for the current week.
                          <br />
                          Check the calendar for upcoming training.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <PlanSummary
              plan={null}
              onDeletePlan={handleDeletePlan}
              onCreateNew={handleCreateNew}
            />
          )}
        </div>
      </main>
    </div>
  )
}

// Wizard selection screen
const WizardSelection = ({ onSelectGenerate, onSelectCSV, onCancel, hasExistingPlan }) => (
  <div className="w-full max-w-2xl mx-auto">
    <Card className="rounded-3xl border-0 shadow-sm bg-white">
      <CardHeader className="text-center">
        <h2 className="text-2xl font-semibold">Create Training Plan</h2>
        <p className="text-muted-foreground">
          Choose how you want to create your training plan
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 pb-6">
        {/* Generate with AI option */}
        <button
          onClick={onSelectGenerate}
          className="flex flex-col items-center p-6 rounded-2xl border-2 border-transparent bg-[#F8F9FA] hover:border-primary hover:bg-primary/5 transition-all text-center group"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Wand2 className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Generate Plan</h3>
          <p className="text-sm text-muted-foreground">
            Answer a few questions and we'll create a personalized training plan based on your goals and fitness
          </p>
        </button>

        {/* Import CSV option */}
        <button
          onClick={onSelectCSV}
          className="flex flex-col items-center p-6 rounded-2xl border-2 border-transparent bg-[#F8F9FA] hover:border-primary hover:bg-primary/5 transition-all text-center group"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Import from CSV</h3>
          <p className="text-sm text-muted-foreground">
            Upload your own training plan from a CSV file with custom workouts, dates, and paces
          </p>
        </button>
      </CardContent>
      {hasExistingPlan && (
        <div className="px-6 pb-6 pt-0">
          <Button variant="ghost" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </div>
      )}
    </Card>
  </div>
)

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-5 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="rounded-3xl border-0 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="rounded-3xl border-0 shadow-sm bg-white">
      <CardHeader>
        <Skeleton className="h-5 w-32 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </CardContent>
    </Card>
  </div>
)

export default Training
