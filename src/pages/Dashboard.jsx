import { useState, useEffect, useCallback } from 'react'
import { subDays } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import stravaApi from '@/services/stravaApi'
import { toUnixTimestamp } from '@/utils/dateHelpers'
import { calculateAggregateStats, findPersonalRecords, formatDistance, formatDuration, formatPace, groupByWeek, metersToKm } from '@/utils/dataProcessing'

import { AppSidebar } from '@/components/app-sidebar'
import { DateRangePicker } from '@/components/date-range-picker'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts'

import { Activity, TrendingUp, Clock, Zap, Award, MapPin, RefreshCw } from 'lucide-react'

// Default to last 30 days
const getDefaultDateRange = () => ({
  start: subDays(new Date(), 30),
  end: new Date(),
})

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [dateRange, setDateRange] = useState(getDefaultDateRange)
  const [selectedTypes, setSelectedTypes] = useState([])
  const [stats, setStats] = useState(null)
  const [records, setRecords] = useState(null)

  // Load activities when date range changes
  const loadActivities = useCallback(async () => {
    if (!dateRange?.start || !dateRange?.end) return

    setLoading(true)
    try {
      const after = toUnixTimestamp(dateRange.start)
      const before = toUnixTimestamp(dateRange.end)

      const data = await stravaApi.getAllActivities(after, before, (count) => {
        console.log(`Loaded ${count} activities...`)
      })

      setActivities(data)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  // Filter activities by type
  const filterActivities = useCallback(() => {
    let filtered = activities

    if (selectedTypes.length > 0) {
      filtered = activities.filter((activity) =>
        selectedTypes.includes(activity.type)
      )
    }

    setFilteredActivities(filtered)

    if (filtered.length > 0) {
      setStats(calculateAggregateStats(filtered))
      setRecords(findPersonalRecords(filtered))
    } else {
      setStats(null)
      setRecords(null)
    }
  }, [activities, selectedTypes])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  useEffect(() => {
    filterActivities()
  }, [filterActivities])

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange)
  }

  const activityTypes = [...new Set(activities.map((a) => a.type))]

  // Chart data
  const chartData = groupByWeek(filteredActivities).map((item) => ({
    week: item.week.replace(/^\d{4}-W/, 'W'),
    distance: parseFloat(metersToKm(item.distance).toFixed(1)),
  }))

  const chartConfig = {
    distance: {
      label: "Distance (km)",
      color: "var(--chart-1)",
    },
  }

  // Calculate average pace
  const avgPaceValue = stats?.totalDistance > 0 && stats?.totalTime > 0
    ? stats.totalDistance / stats.totalTime
    : 0

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">
                Welcome back, <span className="text-primary">{user?.firstname}</span>!
              </h1>
              <p className="text-sm text-muted-foreground">Here's your athletic performance overview</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadActivities} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {/* Filters Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Date Range Picker */}
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
            />

            {/* Activity Type Filters */}
            {activityTypes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activityTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => {
                      if (selectedTypes.includes(type)) {
                        setSelectedTypes(selectedTypes.filter((t) => t !== type))
                      } else {
                        setSelectedTypes([...selectedTypes, type])
                      }
                    }}
                  >
                    {type}
                  </Badge>
                ))}
                {selectedTypes.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTypes([])}>
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : filteredActivities.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No activities found</CardTitle>
              <CardDescription>Try adjusting your date range or filters</CardDescription>
            </Card>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary to-primary/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-primary-foreground/80">
                      Total Distance
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary-foreground/80" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-foreground">
                      {formatDistance(stats?.totalDistance || 0)}
                    </div>
                    <p className="text-xs text-primary-foreground/60">
                      {stats?.totalActivities || 0} activities this period
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Activities
                    </CardTitle>
                    <Zap className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {stats?.totalActivities || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(stats?.totalTime || 0)} total time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Avg Pace
                    </CardTitle>
                    <Clock className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {formatPace(avgPaceValue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(stats?.totalElevation || 0)}m elevation gain
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Trends</CardTitle>
                  <CardDescription>Weekly distance over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="week"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `${value}`}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <defs>
                        <linearGradient id="fillDistance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-distance)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-distance)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="distance"
                        stroke="var(--color-distance)"
                        strokeWidth={2}
                        fill="url(#fillDistance)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Personal Records & Recent Activities */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Personal Records */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Personal Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {records?.longestDistance && (
                      <RecordItem
                        icon={<MapPin className="h-4 w-4" />}
                        title="Longest Distance"
                        value={formatDistance(records.longestDistance.distance)}
                        subtitle={records.longestDistance.name}
                      />
                    )}
                    {records?.longestDuration && (
                      <RecordItem
                        icon={<Clock className="h-4 w-4" />}
                        title="Longest Duration"
                        value={formatDuration(records.longestDuration.moving_time)}
                        subtitle={records.longestDuration.name}
                      />
                    )}
                    {records?.fastestPace && (
                      <RecordItem
                        icon={<Zap className="h-4 w-4" />}
                        title="Fastest Pace"
                        value={formatPace(records.fastestPace.average_speed)}
                        subtitle={records.fastestPace.name}
                      />
                    )}
                    {records?.mostElevation && (
                      <RecordItem
                        icon={<TrendingUp className="h-4 w-4" />}
                        title="Most Elevation"
                        value={`${Math.round(records.mostElevation.total_elevation_gain)}m`}
                        subtitle={records.mostElevation.name}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Recent Activities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredActivities.slice(0, 5).map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                    {filteredActivities.length > 5 && (
                      <Button variant="ghost" className="w-full mt-4">
                        View all {filteredActivities.length} activities
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

const RecordItem = ({ icon, title, value, subtitle }) => (
  <div className="flex items-center gap-4 rounded-lg border p-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      {icon}
    </div>
    <div className="flex-1 space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
    </div>
  </div>
)

const ActivityItem = ({ activity }) => {
  const date = new Date(activity.start_date)
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Activity className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{activity.name}</p>
        <p className="text-xs text-muted-foreground">
          {formattedDate} • {activity.type}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{formatDistance(activity.distance)}</p>
        <p className="text-xs text-muted-foreground">{formatDuration(activity.moving_time)}</p>
      </div>
    </div>
  )
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
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
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  </div>
)

export default Dashboard
