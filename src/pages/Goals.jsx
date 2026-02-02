import { useState, useEffect, useCallback, useMemo } from 'react'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import stravaApi from '@/services/stravaApi'
import { toUnixTimestamp } from '@/utils/dateHelpers'
import {
  formatDistance,
  formatDuration,
  calculateAggregateStats,
  metersToKm,
} from '@/utils/dataProcessing'

import { AppSidebar } from '@/components/app-sidebar'
import { TopNavBar } from '@/components/top-navbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Target,
  Plus,
  Trophy,
  TrendingUp,
  Clock,
  MapPin,
  Flame,
  Calendar,
  RefreshCw,
  Check,
  X,
  Edit2,
  Trash2,
  Zap,
  Mountain,
} from 'lucide-react'

const GOAL_TYPES = [
  { value: 'distance', label: 'Distance', unit: 'km', icon: MapPin },
  { value: 'time', label: 'Time', unit: 'hours', icon: Clock },
  { value: 'activities', label: 'Activities', unit: 'count', icon: Flame },
  { value: 'elevation', label: 'Elevation', unit: 'm', icon: Mountain },
]

const GOAL_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const DEFAULT_GOALS = [
  { id: 'weekly-distance', type: 'distance', period: 'weekly', target: 30, activityType: 'all' },
  { id: 'weekly-activities', type: 'activities', period: 'weekly', target: 4, activityType: 'all' },
  { id: 'monthly-distance', type: 'distance', period: 'monthly', target: 100, activityType: 'all' },
  { id: 'yearly-distance', type: 'distance', period: 'yearly', target: 1000, activityType: 'all' },
]

const Goals = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [weeklyActivities, setWeeklyActivities] = useState([])
  const [monthlyActivities, setMonthlyActivities] = useState([])
  const [yearlyActivities, setYearlyActivities] = useState([])
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('strava_goals')
    return saved ? JSON.parse(saved) : DEFAULT_GOALS
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('strava_goals', JSON.stringify(goals))
  }, [goals])

  const loadActivities = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()

      // Get date ranges
      const weekStart = startOfWeek(now, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
      const monthStart = startOfMonth(now)
      const monthEnd = endOfMonth(now)
      const yearStart = startOfYear(now)
      const yearEnd = endOfYear(now)

      // Load activities for all periods in parallel
      const [weekly, monthly, yearly] = await Promise.all([
        stravaApi.getAllActivities(toUnixTimestamp(weekStart), toUnixTimestamp(weekEnd)),
        stravaApi.getAllActivities(toUnixTimestamp(monthStart), toUnixTimestamp(monthEnd)),
        stravaApi.getAllActivities(toUnixTimestamp(yearStart), toUnixTimestamp(yearEnd)),
      ])

      setWeeklyActivities(weekly)
      setMonthlyActivities(monthly)
      setYearlyActivities(yearly)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  // Calculate progress for a goal
  const calculateProgress = useCallback(
    (goal) => {
      let activities
      switch (goal.period) {
        case 'weekly':
          activities = weeklyActivities
          break
        case 'monthly':
          activities = monthlyActivities
          break
        case 'yearly':
          activities = yearlyActivities
          break
        default:
          activities = []
      }

      // Filter by activity type if specified
      if (goal.activityType && goal.activityType !== 'all') {
        activities = activities.filter((a) => a.type === goal.activityType)
      }

      const stats = calculateAggregateStats(activities)

      let current = 0
      switch (goal.type) {
        case 'distance':
          current = metersToKm(stats.totalDistance)
          break
        case 'time':
          current = stats.totalTime / 3600 // hours
          break
        case 'activities':
          current = stats.totalActivities
          break
        case 'elevation':
          current = stats.totalElevation
          break
        default:
          current = 0
      }

      const percentage = Math.min((current / goal.target) * 100, 100)
      const isCompleted = current >= goal.target

      return { current, percentage, isCompleted }
    },
    [weeklyActivities, monthlyActivities, yearlyActivities]
  )

  // Get unique activity types
  const activityTypes = useMemo(() => {
    const allActivities = [...weeklyActivities, ...monthlyActivities, ...yearlyActivities]
    return [...new Set(allActivities.map((a) => a.type))]
  }, [weeklyActivities, monthlyActivities, yearlyActivities])

  // Add new goal
  const handleAddGoal = (newGoal) => {
    const goal = {
      ...newGoal,
      id: `${newGoal.period}-${newGoal.type}-${Date.now()}`,
    }
    setGoals([...goals, goal])
    setIsAddDialogOpen(false)
  }

  // Update goal
  const handleUpdateGoal = (updatedGoal) => {
    setGoals(goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)))
    setEditingGoal(null)
  }

  // Delete goal
  const handleDeleteGoal = (goalId) => {
    setGoals(goals.filter((g) => g.id !== goalId))
  }

  // Reset to defaults
  const handleResetGoals = () => {
    setGoals(DEFAULT_GOALS)
  }

  // Group goals by period
  const goalsByPeriod = useMemo(() => {
    return {
      weekly: goals.filter((g) => g.period === 'weekly'),
      monthly: goals.filter((g) => g.period === 'monthly'),
      yearly: goals.filter((g) => g.period === 'yearly'),
    }
  }, [goals])

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const completed = goals.filter((g) => calculateProgress(g).isCompleted).length
    return {
      total: goals.length,
      completed,
      percentage: goals.length > 0 ? (completed / goals.length) * 100 : 0,
    }
  }, [goals, calculateProgress])

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <TopNavBar
          title="Goals"
          subtitle="Track your fitness targets"
          showFilters={false}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* Overview Card */}
              <Card className="bg-gradient-to-br from-primary to-primary/80">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-foreground/80">Goals Completed</p>
                      <p className="text-4xl font-bold text-primary-foreground">
                        {overallStats.completed}/{overallStats.total}
                      </p>
                    </div>
                    <div className="h-20 w-20 rounded-full border-4 border-primary-foreground/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {overallStats.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={overallStats.percentage}
                    className="mt-4 h-2 bg-primary-foreground/20"
                  />
                </CardContent>
              </Card>

              {/* Goals Tabs */}
              <Tabs defaultValue="weekly" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="weekly" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Weekly
                    {goalsByPeriod.weekly.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {goalsByPeriod.weekly.filter((g) => calculateProgress(g).isCompleted).length}/
                        {goalsByPeriod.weekly.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Monthly
                    {goalsByPeriod.monthly.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {goalsByPeriod.monthly.filter((g) => calculateProgress(g).isCompleted).length}/
                        {goalsByPeriod.monthly.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="yearly" className="gap-2">
                    <Trophy className="h-4 w-4" />
                    Yearly
                    {goalsByPeriod.yearly.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {goalsByPeriod.yearly.filter((g) => calculateProgress(g).isCompleted).length}/
                        {goalsByPeriod.yearly.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {GOAL_PERIODS.map((period) => (
                  <TabsContent key={period.value} value={period.value} className="space-y-4">
                    {goalsByPeriod[period.value].length === 0 ? (
                      <Card className="flex flex-col items-center justify-center py-12">
                        <Target className="h-12 w-12 text-muted-foreground mb-4" />
                        <CardTitle className="mb-2">No {period.label} Goals</CardTitle>
                        <CardDescription className="mb-4">
                          Set a target to track your progress
                        </CardDescription>
                        <GoalDialog
                          onSave={handleAddGoal}
                          activityTypes={activityTypes}
                          defaultPeriod={period.value}
                          trigger={
                            <Button>
                              <Plus className="mr-2 h-4 w-4" />
                              Add {period.label} Goal
                            </Button>
                          }
                        />
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {goalsByPeriod[period.value].map((goal) => {
                          const progress = calculateProgress(goal)
                          return (
                            <GoalCard
                              key={goal.id}
                              goal={goal}
                              progress={progress}
                              onEdit={() => setEditingGoal(goal)}
                              onDelete={() => handleDeleteGoal(goal.id)}
                            />
                          )
                        })}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>

              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <QuickStatCard
                  title="This Week"
                  activities={weeklyActivities}
                  icon={<Zap className="h-5 w-5" />}
                />
                <QuickStatCard
                  title="This Month"
                  activities={monthlyActivities}
                  icon={<Calendar className="h-5 w-5" />}
                />
                <QuickStatCard
                  title="This Year"
                  activities={yearlyActivities}
                  icon={<Trophy className="h-5 w-5" />}
                />
              </div>
            </>
          )}
        </div>

        {/* Edit Goal Dialog */}
        {editingGoal && (
          <GoalDialog
            open={!!editingGoal}
            onOpenChange={(open) => !open && setEditingGoal(null)}
            onSave={handleUpdateGoal}
            activityTypes={activityTypes}
            initialGoal={editingGoal}
            isEditing
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}

const GoalCard = ({ goal, progress, onEdit, onDelete }) => {
  const goalType = GOAL_TYPES.find((t) => t.value === goal.type)
  const Icon = goalType?.icon || Target

  const formatValue = (value, type) => {
    switch (type) {
      case 'distance':
        return `${value.toFixed(1)} km`
      case 'time':
        return `${value.toFixed(1)} hrs`
      case 'elevation':
        return `${Math.round(value)} m`
      default:
        return Math.round(value)
    }
  }

  return (
    <Card className={progress.isCompleted ? 'border-green-500 bg-green-50/50' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                progress.isCompleted ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">
                {goalType?.label || goal.type}
                {goal.activityType && goal.activityType !== 'all' && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {goal.activityType}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="capitalize">{goal.period}</CardDescription>
            </div>
          </div>
          {progress.isCompleted && <Check className="h-5 w-5 text-green-600" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold">
              {formatValue(progress.current, goal.type)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {formatValue(goal.target, goal.type)}
            </span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{progress.percentage.toFixed(0)}% complete</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const GoalDialog = ({
  open,
  onOpenChange,
  onSave,
  activityTypes,
  trigger,
  initialGoal,
  isEditing,
  defaultPeriod,
}) => {
  const [formData, setFormData] = useState(
    initialGoal || {
      type: 'distance',
      period: defaultPeriod || 'weekly',
      target: 30,
      activityType: 'all',
    }
  )

  useEffect(() => {
    if (initialGoal) {
      setFormData(initialGoal)
    } else if (defaultPeriod) {
      setFormData((prev) => ({ ...prev, period: defaultPeriod }))
    }
  }, [initialGoal, defaultPeriod])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
    if (!isEditing) {
      setFormData({
        type: 'distance',
        period: defaultPeriod || 'weekly',
        target: 30,
        activityType: 'all',
      })
    }
  }

  const goalType = GOAL_TYPES.find((t) => t.value === formData.type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update your goal target'
                : 'Set a new fitness goal to track your progress'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Goal Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="period">Period</Label>
              <Select
                value={formData.period}
                onValueChange={(value) => setFormData({ ...formData, period: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="target">
                Target ({goalType?.unit || 'units'})
              </Label>
              <Input
                id="target"
                type="number"
                min="1"
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="activityType">Activity Type</Label>
              <Select
                value={formData.activityType}
                onValueChange={(value) => setFormData({ ...formData, activityType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {activityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Save Changes' : 'Add Goal'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const QuickStatCard = ({ title, activities, icon }) => {
  const stats = calculateAggregateStats(activities)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="text-lg font-semibold">{formatDistance(stats.totalDistance)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-lg font-semibold">{formatDuration(stats.totalTime)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Activities</p>
            <p className="text-lg font-semibold">{stats.totalActivities}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Elevation</p>
            <p className="text-lg font-semibold">{Math.round(stats.totalElevation)} m</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardContent className="pt-6">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-12 w-24" />
        <Skeleton className="h-2 w-full mt-4" />
      </CardContent>
    </Card>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-32 mb-2" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

export default Goals
