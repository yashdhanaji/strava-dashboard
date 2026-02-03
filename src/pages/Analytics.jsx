import { useState, useEffect, useCallback, useMemo } from 'react'
import { subDays, format, startOfYear } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import stravaApi from '@/services/stravaApi'
import { toUnixTimestamp } from '@/utils/dateHelpers'
import {
  formatDistance,
  formatDuration,
  formatPace,
  groupByWeek,
  groupByMonth,
  groupByDayOfWeek,
  groupByTimeOfDay,
  calculateAggregateStats,
  metersToKm,
  findPersonalRecords,
} from '@/utils/dataProcessing'

import { AppSidebar } from '@/components/app-sidebar'
import { TopNavBar } from '@/components/top-navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

import {
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  MapPin,
  Zap,
  Flame,
  Trophy,
  Calendar,
  ArrowUpRight,
  Mountain,
} from 'lucide-react'

const TIME_RANGES = [
  { value: '30d', label: 'Last 30 Days', days: 30 },
  { value: '90d', label: 'Last 3 Months', days: 90 },
  { value: '180d', label: 'Last 6 Months', days: 180 },
  { value: 'ytd', label: 'Year to Date', days: null },
  { value: '1y', label: 'Last Year', days: 365 },
  { value: 'all', label: 'All Time', days: null },
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

      const data = await stravaApi.getAllActivities(after, before)
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

  // Calculate stats
  const stats = useMemo(() => calculateAggregateStats(filteredActivities), [filteredActivities])
  const records = useMemo(() => findPersonalRecords(filteredActivities), [filteredActivities])

  // Weekly trend data
  const weeklyData = useMemo(() => {
    return groupByWeek(filteredActivities).map((item) => ({
      week: item.week.replace(/^\d{4}-/, ''),
      distance: parseFloat(metersToKm(item.distance).toFixed(1)),
      time: Math.round(item.time / 60),
      count: item.count,
    }))
  }, [filteredActivities])

  // Monthly trend data
  const monthlyData = useMemo(() => {
    return groupByMonth(filteredActivities).map((item) => ({
      month: format(new Date(item.month + '-01'), 'MMM'),
      distance: parseFloat(metersToKm(item.distance).toFixed(1)),
      count: item.count,
    }))
  }, [filteredActivities])

  // Day of week data
  const dayOfWeekData = useMemo(() => groupByDayOfWeek(filteredActivities), [filteredActivities])

  // Calculate period comparison (current vs previous)
  const periodComparison = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.value === timeRange)
    if (!range?.days || filteredActivities.length === 0) return null

    const now = new Date()
    const midPoint = subDays(now, Math.floor(range.days / 2))

    const currentPeriod = filteredActivities.filter(a => new Date(a.start_date) >= midPoint)
    const previousPeriod = filteredActivities.filter(a => new Date(a.start_date) < midPoint)

    const currentDistance = currentPeriod.reduce((sum, a) => sum + a.distance, 0)
    const previousDistance = previousPeriod.reduce((sum, a) => sum + a.distance, 0)

    const change = previousDistance > 0
      ? ((currentDistance - previousDistance) / previousDistance) * 100
      : 0

    return { change, isPositive: change >= 0 }
  }, [filteredActivities, timeRange])

  // Top activities
  const topActivities = useMemo(() => {
    return [...filteredActivities]
      .sort((a, b) => b.distance - a.distance)
      .slice(0, 5)
  }, [filteredActivities])

  // Recent activities
  const recentActivities = useMemo(() => {
    return [...filteredActivities]
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      .slice(0, 5)
  }, [filteredActivities])

  // Most active day
  const mostActiveDay = useMemo(() => {
    if (dayOfWeekData.length === 0) return null
    return dayOfWeekData.reduce((max, day) => day.count > max.count ? day : max, dayOfWeekData[0])
  }, [dayOfWeekData])

  const chartConfig = {
    distance: { label: 'Distance (km)', color: 'hsl(var(--chart-1))' },
    count: { label: 'Activities', color: 'hsl(var(--chart-4))' },
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AppSidebar />
      <main className="ml-[88px]">
        <TopNavBar
          title="Analytics"
          subtitle="Deep dive into your performance"
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
            <Card className="flex flex-col items-center justify-center py-16 rounded-3xl border-0 shadow-sm bg-white">
              <div className="w-16 h-16 rounded-2xl bg-[#F1F3F5] flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-[#6B7280]" />
              </div>
              <CardTitle className="mb-2 text-black">No data to analyze</CardTitle>
              <CardDescription className="text-[#6B7280]">Try adjusting your time range or filters</CardDescription>
            </Card>
          ) : (
            <>
              {/* Section 1: High-Level Summary */}
              <div className="grid gap-5 md:grid-cols-4">
                {/* Primary Metric - Total Distance */}
                <Card className="md:col-span-2 rounded-3xl border-0 shadow-sm bg-[#EDFD93]">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-black/60">Total Distance</p>
                        <p className="text-4xl font-bold text-black tracking-tight mt-1">
                          {formatDistance(stats.totalDistance)}
                        </p>
                        <p className="text-sm text-black/50 font-medium mt-1">
                          {stats.totalActivities} activities
                        </p>
                      </div>
                      {periodComparison && (
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          periodComparison.isPositive
                            ? 'bg-black/10 text-black/70'
                            : 'bg-red-500/20 text-red-700'
                        }`}>
                          {periodComparison.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(periodComparison.change).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* KPI Cards */}
                <Card className="relative overflow-hidden rounded-3xl border-0 shadow-sm bg-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#93D6D6]/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-[#6B7280] mb-1">
                      <div className="w-8 h-8 rounded-xl bg-[#93D6D6]/30 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-[#2D8A8A]" />
                      </div>
                      <span className="text-xs font-semibold">Total Time</span>
                    </div>
                    <p className="text-2xl font-bold text-black tracking-tight">{formatDuration(stats.totalTime)}</p>
                    <p className="text-xs text-[#6B7280] font-medium mt-1">
                      Avg {formatDuration(stats.totalTime / stats.totalActivities)} per activity
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-3xl border-0 shadow-sm bg-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8CEE1]/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-[#6B7280] mb-1">
                      <div className="w-8 h-8 rounded-xl bg-[#C8CEE1]/40 flex items-center justify-center">
                        <Mountain className="h-4 w-4 text-[#5B6494]" />
                      </div>
                      <span className="text-xs font-semibold">Elevation Gain</span>
                    </div>
                    <p className="text-2xl font-bold text-black tracking-tight">{Math.round(stats.totalElevation).toLocaleString()}m</p>
                    <p className="text-xs text-[#6B7280] font-medium mt-1">
                      Avg {Math.round(stats.totalElevation / stats.totalActivities)}m per activity
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section 2: Main Visualization + Insights Panel */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Primary Zone - Main Chart */}
                <Card className="lg:col-span-2 rounded-3xl border-0 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-black">Performance Trend</CardTitle>
                        <CardDescription className="text-[#6B7280]">Weekly distance over time</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[320px] w-full">
                      <AreaChart data={weeklyData} margin={{ left: 0, right: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="week"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          width={40}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <defs>
                          <linearGradient id="fillDistance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-distance)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--color-distance)" stopOpacity={0.05} />
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

                {/* Secondary Panel - Insights */}
                <div className="space-y-4">
                  {/* Best Performers */}
                  <Card className="rounded-3xl border-0 shadow-sm bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-black">
                        <div className="w-8 h-8 rounded-xl bg-[#EDFD93] flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-black/70" />
                        </div>
                        Top Performances
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {records.longestDistance && (
                        <InsightRow
                          label="Longest"
                          value={formatDistance(records.longestDistance.distance)}
                          sublabel={records.longestDistance.name}
                        />
                      )}
                      {records.fastestPace && (
                        <InsightRow
                          label="Fastest"
                          value={formatPace(records.fastestPace.average_speed)}
                          sublabel={records.fastestPace.name}
                        />
                      )}
                      {records.mostElevation && (
                        <InsightRow
                          label="Most Climb"
                          value={`${Math.round(records.mostElevation.total_elevation_gain)}m`}
                          sublabel={records.mostElevation.name}
                        />
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card className="rounded-3xl border-0 shadow-sm bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-black">
                        <div className="w-8 h-8 rounded-xl bg-[#93D6D6] flex items-center justify-center">
                          <Zap className="h-4 w-4 text-[#2D8A8A]" />
                        </div>
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <InsightRow
                        label="Avg Distance"
                        value={formatDistance(stats.totalDistance / stats.totalActivities)}
                      />
                      {mostActiveDay && (
                        <InsightRow
                          label="Most Active"
                          value={mostActiveDay.day}
                          sublabel={`${mostActiveDay.count} activities`}
                        />
                      )}
                      <InsightRow
                        label="This Period"
                        value={`${stats.totalActivities} activities`}
                      />
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="rounded-3xl border-0 shadow-sm bg-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-black">
                        <div className="w-8 h-8 rounded-xl bg-[#C8CEE1] flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-[#5B6494]" />
                        </div>
                        Recent
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {recentActivities.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: TYPE_COLORS[activity.type] || '#6b7280' }}
                            />
                            <span className="text-xs truncate">{activity.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {formatDistance(activity.distance)}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Section 3: Detail-Level Sections */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Monthly Breakdown */}
                {monthlyData.length > 1 && (
                  <Card className="rounded-3xl border-0 shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle className="text-base font-bold text-black">Monthly Breakdown</CardTitle>
                      <CardDescription className="text-[#6B7280]">Distance by month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            width={35}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="distance" fill="var(--color-distance)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Activity by Day of Week */}
                <Card className="rounded-3xl border-0 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-black">Weekly Pattern</CardTitle>
                    <CardDescription className="text-[#6B7280]">When you're most active</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                      <BarChart data={dayOfWeekData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis
                          type="number"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                          width={60}
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Section 4: Activity Type Breakdown */}
              {Object.keys(stats.byType).length > 1 && (
                <Card className="rounded-3xl border-0 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-black">Activity Breakdown</CardTitle>
                    <CardDescription className="text-[#6B7280]">Stats by activity type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(stats.byType)
                        .sort((a, b) => b[1].distance - a[1].distance)
                        .map(([type, data]) => (
                          <div
                            key={type}
                            className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${TYPE_COLORS[type]}20` }}
                            >
                              <Activity
                                className="h-5 w-5"
                                style={{ color: TYPE_COLORS[type] || '#6b7280' }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{type}</p>
                              <p className="text-xs text-muted-foreground">
                                {data.count} activities
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm">{formatDistance(data.distance)}</p>
                              <p className="text-xs text-muted-foreground">{formatDuration(data.time)}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 5: Top Activities List */}
              <Card className="rounded-3xl border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-black">Top Activities</CardTitle>
                  <CardDescription className="text-[#6B7280]">Your longest activities this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div
                          className="w-2 h-8 rounded-full"
                          style={{ backgroundColor: TYPE_COLORS[activity.type] || '#6b7280' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.start_date), 'MMM d, yyyy')} · {activity.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatDistance(activity.distance)}</p>
                          <p className="text-xs text-muted-foreground">{formatDuration(activity.moving_time)}</p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

const InsightRow = ({ label, value, sublabel }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground/70 truncate max-w-[120px]">{sublabel}</p>}
    </div>
    <p className="text-sm font-semibold">{value}</p>
  </div>
)

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[320px] w-full" />
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)

export default Analytics
