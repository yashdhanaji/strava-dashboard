import { useState, useEffect, useCallback } from 'react'
import { subDays } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import stravaApi from '@/services/stravaApi'
import { toUnixTimestamp } from '@/utils/dateHelpers'
import { calculateAggregateStats, findPersonalRecords, formatDistance, formatDuration, formatPace, groupByWeek, metersToKm } from '@/utils/dataProcessing'

import { AppSidebar } from '@/components/app-sidebar'
import { TopNavBar } from '@/components/top-navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts'

import { Activity, TrendingUp, Clock, Zap, Award, MapPin, ChevronRight } from 'lucide-react'

// Time range mapping
const TIME_RANGE_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '180d': 180,
  '1y': 365,
  'all': null,
}

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [timeRange, setTimeRange] = useState('30d')
  const [sportFilter, setSportFilter] = useState('all')
  const [stats, setStats] = useState(null)
  const [records, setRecords] = useState(null)

  // Load activities when time range changes
  const loadActivities = useCallback(async () => {
    setLoading(true)
    try {
      const days = TIME_RANGE_DAYS[timeRange]
      const after = days ? toUnixTimestamp(subDays(new Date(), days)) : null
      const before = toUnixTimestamp(new Date())

      const data = await stravaApi.getAllActivities(after, before, (count) => {
        console.log(`Loaded ${count} activities...`)
      })

      setActivities(data)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  // Filter activities by sport type
  const filterActivities = useCallback(() => {
    let filtered = activities

    if (sportFilter !== 'all') {
      filtered = activities.filter((activity) => activity.type === sportFilter)
    }

    setFilteredActivities(filtered)

    if (filtered.length > 0) {
      setStats(calculateAggregateStats(filtered))
      setRecords(findPersonalRecords(filtered))
    } else {
      setStats(null)
      setRecords(null)
    }
  }, [activities, sportFilter])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  useEffect(() => {
    filterActivities()
  }, [filterActivities])

  // Chart data
  const chartData = groupByWeek(filteredActivities).map((item) => ({
    week: item.week.replace(/^\d{4}-W/, 'W'),
    distance: parseFloat(metersToKm(item.distance).toFixed(1)),
  }))

  const chartConfig = {
    distance: {
      label: "Distance (km)",
      color: "#EDFD93",
    },
  }

  // Calculate average pace
  const avgPaceValue = stats?.totalDistance > 0 && stats?.totalTime > 0
    ? stats.totalDistance / stats.totalTime
    : 0

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Floating Dock Sidebar */}
      <AppSidebar />

      {/* Main Content - with left margin for sidebar */}
      <main className="ml-[88px]">
        <TopNavBar
          title={`Welcome back, ${user?.firstname}`}
          subtitle="Your athletic performance overview"
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          sportFilter={sportFilter}
          onSportFilterChange={setSportFilter}
        />

        {/* Content */}
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredActivities.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 rounded-3xl border-0 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#F1F3F5] flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-[#6B7280]" />
              </div>
              <CardTitle className="mb-2 text-black">No activities found</CardTitle>
              <CardDescription className="text-[#6B7280]">Try adjusting your time range or sport filter</CardDescription>
            </Card>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid gap-5 md:grid-cols-3">
                {/* Featured Card - Lime accent */}
                <Card className="relative overflow-hidden rounded-3xl border-0 shadow-sm bg-[#EDFD93]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-black/60">
                      Total Distance
                    </CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-black/70" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-black tracking-tight">
                      {formatDistance(stats?.totalDistance || 0)}
                    </div>
                    <p className="text-sm text-black/50 mt-1 font-medium">
                      {stats?.totalActivities || 0} activities this period
                    </p>
                  </CardContent>
                </Card>

                {/* Teal accent card */}
                <Card className="relative overflow-hidden rounded-3xl border-0 shadow-sm bg-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#93D6D6]/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-[#6B7280]">
                      Total Activities
                    </CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-[#93D6D6]/30 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-[#2D8A8A]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-black tracking-tight">
                      {stats?.totalActivities || 0}
                    </div>
                    <p className="text-sm text-[#6B7280] mt-1 font-medium">
                      {formatDuration(stats?.totalTime || 0)} total time
                    </p>
                  </CardContent>
                </Card>

                {/* Lavender accent card */}
                <Card className="relative overflow-hidden rounded-3xl border-0 shadow-sm bg-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8CEE1]/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-[#6B7280]">
                      Avg Pace
                    </CardTitle>
                    <div className="w-10 h-10 rounded-xl bg-[#C8CEE1]/40 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-[#5B6494]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-black tracking-tight">
                      {formatPace(avgPaceValue)}
                    </div>
                    <p className="text-sm text-[#6B7280] mt-1 font-medium">
                      {Math.round(stats?.totalElevation || 0)}m elevation gain
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card className="rounded-3xl border-0 shadow-sm bg-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-black">Activity Trends</CardTitle>
                      <CardDescription className="text-[#6B7280]">Weekly distance over the selected period</CardDescription>
                    </div>
                    <Button variant="ghost" className="text-[13px] font-semibold text-[#6B7280] hover:text-black">
                      View Details <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="week"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `${value}`}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <defs>
                        <linearGradient id="fillDistance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EDFD93" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#EDFD93" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="distance"
                        stroke="#C5D63D"
                        strokeWidth={2}
                        fill="url(#fillDistance)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Personal Records & Recent Activities */}
              <div className="grid gap-5 md:grid-cols-2">
                {/* Personal Records */}
                <Card className="rounded-3xl border-0 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg font-bold text-black">
                      <div className="w-10 h-10 rounded-xl bg-[#EDFD93] flex items-center justify-center">
                        <Award className="h-5 w-5 text-black" />
                      </div>
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
                        color="mint"
                      />
                    )}
                    {records?.longestDuration && (
                      <RecordItem
                        icon={<Clock className="h-4 w-4" />}
                        title="Longest Duration"
                        value={formatDuration(records.longestDuration.moving_time)}
                        subtitle={records.longestDuration.name}
                        color="teal"
                      />
                    )}
                    {records?.fastestPace && (
                      <RecordItem
                        icon={<Zap className="h-4 w-4" />}
                        title="Fastest Pace"
                        value={formatPace(records.fastestPace.average_speed)}
                        subtitle={records.fastestPace.name}
                        color="lavender"
                      />
                    )}
                    {records?.mostElevation && (
                      <RecordItem
                        icon={<TrendingUp className="h-4 w-4" />}
                        title="Most Elevation"
                        value={`${Math.round(records.mostElevation.total_elevation_gain)}m`}
                        subtitle={records.mostElevation.name}
                        color="lime"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card className="rounded-3xl border-0 shadow-sm bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-lg font-bold text-black">
                        <div className="w-10 h-10 rounded-xl bg-[#93D6D6] flex items-center justify-center">
                          <Activity className="h-5 w-5 text-black" />
                        </div>
                        Recent Activities
                      </CardTitle>
                      <Button variant="ghost" className="text-[13px] font-semibold text-[#6B7280] hover:text-black">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredActivities.slice(0, 5).map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

const colorMap = {
  lime: { bg: 'bg-[#EDFD93]/30', text: 'text-[#6B8E23]' },
  teal: { bg: 'bg-[#93D6D6]/30', text: 'text-[#2D8A8A]' },
  mint: { bg: 'bg-[#CBE1D6]/40', text: 'text-[#3D7A5C]' },
  lavender: { bg: 'bg-[#C8CEE1]/40', text: 'text-[#5B6494]' },
}

const RecordItem = ({ icon, title, value, subtitle, color = 'lime' }) => (
  <div className="flex items-center gap-4 rounded-2xl bg-[#F8F9FA] p-4 hover:bg-[#F1F3F5] transition-colors">
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorMap[color].bg} ${colorMap[color].text}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">{title}</p>
      <p className="text-lg font-bold text-black">{value}</p>
      <p className="text-xs text-[#6B7280] truncate">{subtitle}</p>
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
    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#F8F9FA] transition-colors cursor-pointer">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F3F5] text-[#6B7280]">
        <Activity className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-black truncate">{activity.name}</p>
        <p className="text-xs text-[#6B7280]">
          {formattedDate} • {activity.type}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-black">{formatDistance(activity.distance)}</p>
        <p className="text-xs text-[#6B7280]">{formatDuration(activity.moving_time)}</p>
      </div>
    </div>
  )
}

const LoadingSkeleton = () => (
  <div className="space-y-5">
    <div className="grid gap-5 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="rounded-3xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-32 mb-2 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-32 rounded-lg" />
        <Skeleton className="h-4 w-48 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </CardContent>
    </Card>
  </div>
)

export default Dashboard
