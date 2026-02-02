import { useState, useEffect, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import stravaApi from '@/services/stravaApi'
import {
  formatDistance,
  formatDuration,
  formatPace,
  formatSpeed,
  formatElevation,
  findPersonalRecords,
  calculateAggregateStats,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  Award,
  Trophy,
  Medal,
  MapPin,
  Clock,
  TrendingUp,
  Zap,
  Calendar,
  ExternalLink,
  RefreshCw,
  Route,
  Timer,
  Mountain,
  Flame,
} from 'lucide-react'

const Records = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [selectedActivity, setSelectedActivity] = useState(null)

  const loadActivities = useCallback(async () => {
    setLoading(true)
    try {
      const data = await stravaApi.getAllActivities(null, null, (count) => {
        console.log(`Loaded ${count} activities...`)
      })
      setActivities(data)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  const records = useMemo(() => findPersonalRecords(activities), [activities])
  const stats = useMemo(() => calculateAggregateStats(activities), [activities])

  const getTypeColor = (type) => {
    const colors = {
      Run: 'bg-orange-100 text-orange-700 border-orange-200',
      Ride: 'bg-blue-100 text-blue-700 border-blue-200',
      Swim: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      Walk: 'bg-green-100 text-green-700 border-green-200',
      Hike: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      WeightTraining: 'bg-purple-100 text-purple-700 border-purple-200',
      Yoga: 'bg-pink-100 text-pink-700 border-pink-200',
    }
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <TopNavBar
          title="Personal Records"
          subtitle={`Your all-time bests across ${activities.length} activities`}
          showFilters={false}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Records</TabsTrigger>
                <TabsTrigger value="running">Running</TabsTrigger>
                <TabsTrigger value="by-type">By Activity Type</TabsTrigger>
              </TabsList>

              {/* All Records Tab */}
              <TabsContent value="all" className="space-y-6">
                {/* Primary Records */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <RecordCard
                    icon={<Route className="h-5 w-5" />}
                    title="Longest Distance"
                    activity={records.longestDistance}
                    value={records.longestDistance ? formatDistance(records.longestDistance.distance) : 'N/A'}
                    onClick={() => setSelectedActivity(records.longestDistance)}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                  />
                  <RecordCard
                    icon={<Timer className="h-5 w-5" />}
                    title="Longest Duration"
                    activity={records.longestDuration}
                    value={records.longestDuration ? formatDuration(records.longestDuration.moving_time) : 'N/A'}
                    onClick={() => setSelectedActivity(records.longestDuration)}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                  />
                  <RecordCard
                    icon={<Zap className="h-5 w-5" />}
                    title="Fastest Pace"
                    activity={records.fastestPace}
                    value={records.fastestPace ? formatPace(records.fastestPace.average_speed) : 'N/A'}
                    subtitle="Running only"
                    onClick={() => setSelectedActivity(records.fastestPace)}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                  />
                  <RecordCard
                    icon={<Mountain className="h-5 w-5" />}
                    title="Most Elevation"
                    activity={records.mostElevation}
                    value={records.mostElevation ? formatElevation(records.mostElevation.total_elevation_gain) : 'N/A'}
                    onClick={() => setSelectedActivity(records.mostElevation)}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                  />
                </div>

                {/* Summary Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Lifetime Totals
                    </CardTitle>
                    <CardDescription>
                      Your cumulative achievements across all activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <StatBox
                        label="Total Distance"
                        value={formatDistance(stats.totalDistance)}
                        icon={<MapPin className="h-4 w-4" />}
                      />
                      <StatBox
                        label="Total Time"
                        value={formatDuration(stats.totalTime)}
                        icon={<Clock className="h-4 w-4" />}
                      />
                      <StatBox
                        label="Total Elevation"
                        value={formatElevation(stats.totalElevation)}
                        icon={<TrendingUp className="h-4 w-4" />}
                      />
                      <StatBox
                        label="Total Activities"
                        value={stats.totalActivities}
                        icon={<Flame className="h-4 w-4" />}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Running Records Tab */}
              <TabsContent value="running" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Medal className="h-5 w-5 text-yellow-500" />
                      Best Efforts
                    </CardTitle>
                    <CardDescription>
                      Estimated times based on your fastest runs at each distance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <BestEffortCard
                        distance="5K"
                        activity={records.bestEfforts['5k']}
                        onClick={() => setSelectedActivity(records.bestEfforts['5k'])}
                      />
                      <BestEffortCard
                        distance="10K"
                        activity={records.bestEfforts['10k']}
                        onClick={() => setSelectedActivity(records.bestEfforts['10k'])}
                      />
                      <BestEffortCard
                        distance="Half Marathon"
                        activity={records.bestEfforts['halfMarathon']}
                        onClick={() => setSelectedActivity(records.bestEfforts['halfMarathon'])}
                      />
                      <BestEffortCard
                        distance="Marathon"
                        activity={records.bestEfforts['marathon']}
                        onClick={() => setSelectedActivity(records.bestEfforts['marathon'])}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Running Stats */}
                {stats.byType['Run'] && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Running Summary</CardTitle>
                      <CardDescription>
                        Your lifetime running statistics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatBox
                          label="Total Runs"
                          value={stats.byType['Run'].count}
                          icon={<Flame className="h-4 w-4" />}
                        />
                        <StatBox
                          label="Total Distance"
                          value={formatDistance(stats.byType['Run'].distance)}
                          icon={<MapPin className="h-4 w-4" />}
                        />
                        <StatBox
                          label="Total Time"
                          value={formatDuration(stats.byType['Run'].time)}
                          icon={<Clock className="h-4 w-4" />}
                        />
                        <StatBox
                          label="Total Elevation"
                          value={formatElevation(stats.byType['Run'].elevation)}
                          icon={<TrendingUp className="h-4 w-4" />}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* By Activity Type Tab */}
              <TabsContent value="by-type" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(stats.byType)
                    .sort((a, b) => b[1].count - a[1].count)
                    .map(([type, typeStats]) => (
                      <ActivityTypeCard
                        key={type}
                        type={type}
                        stats={typeStats}
                        getTypeColor={getTypeColor}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Activity Detail Dialog */}
        <ActivityDetailDialog
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          getTypeColor={getTypeColor}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}

const RecordCard = ({ icon, title, activity, value, subtitle, onClick, color, bgColor }) => {
  if (!activity) {
    return (
      <Card className="opacity-60">
        <CardContent className="p-6">
          <div className={`inline-flex p-2 rounded-lg ${bgColor} ${color} mb-3`}>
            {icon}
          </div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">N/A</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className={`inline-flex p-2 rounded-lg ${bgColor} ${color} mb-3`}>
          {icon}
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm font-medium truncate">{activity.name}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(activity.start_date), 'MMM d, yyyy')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

const BestEffortCard = ({ distance, activity, onClick }) => {
  if (!activity) {
    return (
      <Card className="opacity-60">
        <CardContent className="p-6 text-center">
          <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-lg font-bold mb-1">{distance}</p>
          <p className="text-2xl font-bold text-muted-foreground">--:--</p>
          <p className="text-xs text-muted-foreground mt-2">No qualifying runs</p>
        </CardContent>
      </Card>
    )
  }

  const projectedTime = activity.projected_time || activity.moving_time

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6 text-center">
        <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
        <p className="text-lg font-bold mb-1">{distance}</p>
        <p className="text-2xl font-bold">{formatDuration(projectedTime)}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {format(new Date(activity.start_date), 'MMM d, yyyy')}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-1">
          {activity.name}
        </p>
      </CardContent>
    </Card>
  )
}

const ActivityTypeCard = ({ type, stats, getTypeColor }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getTypeColor(type)}>
            {type}
          </Badge>
          <span className="text-2xl font-bold">{stats.count}</span>
        </div>
        <CardDescription>activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Distance</span>
            <span className="font-medium">{formatDistance(stats.distance)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">{formatDuration(stats.time)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Elevation</span>
            <span className="font-medium">{formatElevation(stats.elevation)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const StatBox = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
    <div className="text-muted-foreground">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  </div>
)

const ActivityDetailDialog = ({ activity, onClose, getTypeColor }) => {
  if (!activity) return null

  const date = new Date(activity.start_date)

  return (
    <Dialog open={!!activity} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={getTypeColor(activity.type)}>
              {activity.type}
            </Badge>
            <Badge variant="secondary">
              <Trophy className="h-3 w-3 mr-1" />
              Personal Record
            </Badge>
          </div>
          <DialogTitle>{activity.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(date, 'EEEE, MMMM d, yyyy')} at {format(date, 'h:mm a')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <StatItem icon={<MapPin />} label="Distance" value={formatDistance(activity.distance)} />
            <StatItem icon={<Clock />} label="Duration" value={formatDuration(activity.moving_time)} />
            <StatItem
              icon={<Zap />}
              label={activity.type === 'Run' || activity.type === 'Walk' ? 'Pace' : 'Speed'}
              value={activity.type === 'Run' || activity.type === 'Walk' || activity.type === 'Hike'
                ? formatPace(activity.average_speed)
                : formatSpeed(activity.average_speed)}
            />
            <StatItem icon={<TrendingUp />} label="Elevation" value={formatElevation(activity.total_elevation_gain)} />
          </div>

          {(activity.average_heartrate || activity.max_heartrate || activity.calories) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {activity.average_heartrate && (
                  <StatItem label="Avg Heart Rate" value={`${Math.round(activity.average_heartrate)} bpm`} />
                )}
                {activity.max_heartrate && (
                  <StatItem label="Max Heart Rate" value={`${Math.round(activity.max_heartrate)} bpm`} />
                )}
                {activity.calories && (
                  <StatItem label="Calories" value={`${Math.round(activity.calories)} kcal`} />
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button asChild>
            <a
              href={`https://www.strava.com/activities/${activity.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Strava
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const StatItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
    {icon && <div className="text-muted-foreground">{icon}</div>}
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  </div>
)

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-10 rounded-lg mb-3" />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

export default Records
