import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import stravaApi from '@/services/stravaApi'

import { AppSidebar } from '@/components/app-sidebar'
import { TopNavBar } from '@/components/top-navbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Plus, Calendar, BarChart3 } from 'lucide-react'

import RaceGoalWizard from '@/components/training/RaceGoalWizard'
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

      // If no plan exists, show wizard
      if (!plan) {
        setShowWizard(true)
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
    setActiveTab('calendar')
  }

  // Handle plan deletion
  const handleDeletePlan = (planId) => {
    deletePlan(planId)
    setActivePlan(null)
    setShowWizard(true)
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
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
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
            <RaceGoalWizard
              activities={activities}
              onPlanGenerated={handlePlanGenerated}
              onCancel={() => {
                if (activePlan) {
                  setShowWizard(false)
                }
              }}
            />
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
                      onCreateNew={() => setShowWizard(true)}
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
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
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
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
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
              onCreateNew={() => setShowWizard(true)}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  </div>
)

export default Training
