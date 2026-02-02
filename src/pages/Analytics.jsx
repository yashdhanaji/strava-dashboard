import { useState, useEffect, useCallback, useMemo } from 'react'
import { subDays, subMonths, format, startOfYear } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import stravaApi from '@/services/stravaApi'
import { toUnixTimestamp } from '@/utils/dateHelpers'
import {
  formatDistance,
  formatDuration,
  formatPace,
  formatSpeed,
  groupByWeek,
  groupByMonth,
  groupByDayOfWeek,
  groupByTimeOfDay,
  calculateAggregateStats,
  metersToKm,
} from '@/utils/dataProcessing'

import { AppSidebar } from '@/components/app-sidebar'
import { TopNavBar } from '@/components/top-navbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

import {
  BarChart3,
  TrendingUp,
  Clock,
  Calendar,
  RefreshCw,
  Activity,
  MapPin,
  Zap,
  Sun,
  Moon,
  Sunrise,
  Sunset,
} from 'lucide-react'

const TIME_RANGES = [
  { value: '30d', label: 'Last 30 Days', days: 30 },
  { value: '90d', label: 'Last 3 Months', days: 90 },
  { value: '180d', label: 'Last 6 Months', days: 180 },
  { value: 'ytd', label: 'Year to Date', days: null },
  { value: '1y', label: 'Last Year', days: 365 },
  { value: 'all', label: 'All Time', days: null },
]

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

const TYPE_COLORS = {
  Run: '#f97316',
  Ride: '#3b82f6',
  Swim: '#06b6d4',
  Walk: '#22c55e',
  Hike: '#10b981',
  WeightTraining: '#a855f7',
  Yoga: '#ec4899',
}

const Analytics = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [timeRange, setTimeRange] = useState('90d')
  const [selectedType, setSelectedType] = useState('all')

  const getDateRange = useCallback(() => {
    const now = new Date()
    const range = TIME_RANGES.find((r) => r.value === timeRange)

    if (timeRange === 'ytd') {
      return { start: startOfYear(now), end: now }
    }
    if (timeRange === 'all') {
      return { start: null, end: null }
    }
    return { start: subDays(now, range.days), end: now }
  }, [timeRange])

  const loadActivities = useCallback(async () => {
    setLoading(true)
    try {
      const { start, end } = getDateRange()
      const after = start ? toUnixTimestamp(start) : null
      const before = end ? toUnixTimestamp(end) : null

      const data = await stravaApi.getAllActivities(after, before, (count) => {
        console.log(`Loaded ${count} activities...`)
      })
      setActivities(data)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }, [getDateRange])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  // Filter activities by type
  const filteredActivities = useMemo(() => {
    if (selectedType === 'all') return activities
    return activities.filter((a) => a.type === selectedType)
  }, [activities, selectedType])

  // Get unique activity types
  const activityTypes = useMemo(() => {
    return [...new Set(activities.map((a) => a.type))]
  }, [activities])

  // Calculate stats
  const stats = useMemo(() => calculateAggregateStats(filteredActivities), [filteredActivities])

  // Weekly trend data
  const weeklyData = useMemo(() => {
    return groupByWeek(filteredActivities).map((item) => ({
      week: item.week.replace(/^\d{4}-/, ''),
      distance: parseFloat(metersToKm(item.distance).toFixed(1)),
      time: Math.round(item.time / 60), // minutes
      elevation: Math.round(item.elevation),
      count: item.count,
    }))
  }, [filteredActivities])

  // Monthly trend data
  const monthlyData = useMemo(() => {
    return groupByMonth(filteredActivities).map((item) => ({
      month: format(new Date(item.month + '-01'), 'MMM yy'),
      distance: parseFloat(metersToKm(item.distance).toFixed(1)),
      time: Math.round(item.time / 60),
      elevation: Math.round(item.elevation),
      count: item.count,
    }))
  }, [filteredActivities])

  // Day of week data
  const dayOfWeekData = useMemo(() => {
    return groupByDayOfWeek(filteredActivities)
  }, [filteredActivities])

  // Time of day data
  const timeOfDayData = useMemo(() => {
    return groupByTimeOfDay(filteredActivities)
  }, [filteredActivities])

  // Activity type distribution
  const typeDistribution = useMemo(() => {
    return Object.entries(stats.byType).map(([type, data]) => ({
      name: type,
      value: data.count,
      distance: data.distance,
      color: TYPE_COLORS[type] || '#6b7280',
    }))
  }, [stats])

  // Pace/Speed trend (for runs)
  const paceTrendData = useMemo(() => {
    const runs = filteredActivities.filter((a) => a.type === 'Run' && a.average_speed > 0)
    return runs
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      .slice(-20)
      .map((activity) => ({
        date: format(new Date(activity.start_date), 'MMM d'),
        pace: parseFloat((1000 / activity.average_speed / 60).toFixed(2)), // min/km
        distance: parseFloat(metersToKm(activity.distance).toFixed(1)),
      }))
  }, [filteredActivities])

  const chartConfig = {
    distance: { label: 'Distance (km)', color: 'hsl(var(--chart-1))' },
    time: { label: 'Time (min)', color: 'hsl(var(--chart-2))' },
    elevation: { label: 'Elevation (m)', color: 'hsl(var(--chart-3))' },
    count: { label: 'Activities', color: 'hsl(var(--chart-4))' },
    pace: { label: 'Pace (min/km)', color: 'hsl(var(--chart-5))' },
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <TopNavBar
          title="Analytics"
          subtitle={`Insights from ${filteredActivities.length} activities`}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          sportFilter={selectedType}
          onSportFilterChange={setSelectedType}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredActivities.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No data to analyze</CardTitle>
              <CardDescription>Try adjusting your time range or filters</CardDescription>
            </Card>
          ) : (
            <Tabs defaultValue="trends" className="space-y-6">
              <TabsList>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="distribution">Distribution</TabsTrigger>
                <TabsTrigger value="patterns">Patterns</TabsTrigger>
                {filteredActivities.some((a) => a.type === 'Run') && (
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                )}
              </TabsList>

              {/* Trends Tab */}
              <TabsContent value="trends" className="space-y-6">
                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard
                    icon={<MapPin className="h-4 w-4" />}
                    label="Total Distance"
                    value={formatDistance(stats.totalDistance)}
                  />
                  <StatCard
                    icon={<Clock className="h-4 w-4" />}
                    label="Total Time"
                    value={formatDuration(stats.totalTime)}
                  />
                  <StatCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Total Elevation"
                    value={`${Math.round(stats.totalElevation).toLocaleString()} m`}
                  />
                  <StatCard
                    icon={<Activity className="h-4 w-4" />}
                    label="Avg per Activity"
                    value={formatDistance(stats.totalDistance / stats.totalActivities)}
                  />
                </div>

                {/* Weekly Distance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Distance</CardTitle>
                    <CardDescription>Distance covered each week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <AreaChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip content={<ChartTooltipContent />} />
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
                          fill="url(#fillDistance)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Monthly Comparison */}
                {monthlyData.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Comparison</CardTitle>
                      <CardDescription>Distance and activity count by month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar dataKey="distance" fill="var(--color-distance)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Distribution Tab */}
              <TabsContent value="distribution" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Activity Type Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Types</CardTitle>
                      <CardDescription>Distribution by activity type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <PieChart>
                          <Pie
                            data={typeDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {typeDistribution.map((entry, index) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Type Stats Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>By Activity Type</CardTitle>
                      <CardDescription>Breakdown of stats per type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(stats.byType)
                          .sort((a, b) => b[1].count - a[1].count)
                          .map(([type, data]) => (
                            <div key={type} className="flex items-center gap-4">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: TYPE_COLORS[type] || '#6b7280' }}
                              />
                              <div className="flex-1">
                                <p className="font-medium">{type}</p>
                                <p className="text-sm text-muted-foreground">
                                  {data.count} activities
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatDistance(data.distance)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDuration(data.time)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Patterns Tab */}
              <TabsContent value="patterns" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Day of Week */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Day of Week</CardTitle>
                      <CardDescription>When you're most active</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <BarChart data={dayOfWeekData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickLine={false} axisLine={false} />
                          <YAxis
                            type="category"
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            width={80}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Time of Day */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Time of Day</CardTitle>
                      <CardDescription>Your preferred workout times</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {timeOfDayData.map((item) => {
                          const total = timeOfDayData.reduce((sum, i) => sum + i.count, 0)
                          const percentage = total > 0 ? (item.count / total) * 100 : 0
                          const Icon = getTimeIcon(item.time)

                          return (
                            <div key={item.time} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{item.time}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {item.count} ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Weekly Activity Heatmap Style */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Frequency</CardTitle>
                    <CardDescription>Number of activities per week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab (Running) */}
              {filteredActivities.some((a) => a.type === 'Run') && (
                <TabsContent value="performance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pace Trend</CardTitle>
                      <CardDescription>Your running pace over recent activities (lower is faster)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {paceTrendData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                          <LineChart data={paceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              domain={['dataMin - 0.5', 'dataMax + 0.5']}
                              tickFormatter={(value) => `${value.toFixed(1)}`}
                            />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                              formatter={(value) => [`${value.toFixed(2)} min/km`, 'Pace']}
                            />
                            <Line
                              type="monotone"
                              dataKey="pace"
                              stroke="var(--color-pace)"
                              strokeWidth={2}
                              dot={{ fill: 'var(--color-pace)', r: 4 }}
                            />
                          </LineChart>
                        </ChartContainer>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No running data available
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Running Stats Summary */}
                  {stats.byType['Run'] && (
                    <div className="grid gap-4 md:grid-cols-4">
                      <StatCard
                        icon={<Activity className="h-4 w-4" />}
                        label="Total Runs"
                        value={stats.byType['Run'].count}
                      />
                      <StatCard
                        icon={<MapPin className="h-4 w-4" />}
                        label="Total Distance"
                        value={formatDistance(stats.byType['Run'].distance)}
                      />
                      <StatCard
                        icon={<Clock className="h-4 w-4" />}
                        label="Total Time"
                        value={formatDuration(stats.byType['Run'].time)}
                      />
                      <StatCard
                        icon={<Zap className="h-4 w-4" />}
                        label="Avg Pace"
                        value={formatPace(stats.byType['Run'].distance / stats.byType['Run'].time)}
                      />
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

const getTimeIcon = (time) => {
  switch (time) {
    case 'Morning':
      return Sunrise
    case 'Afternoon':
      return Sun
    case 'Evening':
      return Sunset
    case 'Night':
      return Moon
    default:
      return Sun
  }
}

const StatCard = ({ icon, label, value }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
)

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  </div>
)

export default Analytics
