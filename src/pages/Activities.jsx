import { useState, useEffect, useCallback, useMemo } from 'react'
import { subDays } from 'date-fns'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import stravaApi from '@/services/stravaApi'
import { toUnixTimestamp } from '@/utils/dateHelpers'
import { formatDistance, formatDuration, formatPace, formatSpeed, formatElevation } from '@/utils/dataProcessing'

import { AppSidebar } from '@/components/app-sidebar'
import { DateRangePicker } from '@/components/date-range-picker'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

import {
  Activity,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  Clock,
  TrendingUp,
  Zap,
  Calendar,
  ExternalLink,
  LayoutGrid,
  List,
} from 'lucide-react'

// Default to last 30 days
const getDefaultDateRange = () => ({
  start: subDays(new Date(), 30),
  end: new Date(),
})

const ITEMS_PER_PAGE = 15

const Activities = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [dateRange, setDateRange] = useState(getDefaultDateRange)
  const [selectedTypes, setSelectedTypes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'start_date', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [viewMode, setViewMode] = useState('table')

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
      setCurrentPage(1)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  // Get unique activity types
  const activityTypes = useMemo(() => {
    return [...new Set(activities.map((a) => a.type))]
  }, [activities])

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = activities

    // Filter by type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((activity) => selectedTypes.includes(activity.type))
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((activity) =>
        activity.name.toLowerCase().includes(query) ||
        activity.type.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]

      // Handle date sorting
      if (sortConfig.key === 'start_date') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [activities, selectedTypes, searchQuery, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE)
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredActivities.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredActivities, currentPage])

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4" />
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  // Get activity type color
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Activities</h1>
              <p className="text-sm text-muted-foreground">
                {filteredActivities.length} activities found
              </p>
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Date Range Picker */}
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />

              {/* Search and View Toggle */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <Tabs value={viewMode} onValueChange={setViewMode}>
                  <TabsList className="h-9">
                    <TabsTrigger value="table" className="px-2">
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="px-2">
                      <LayoutGrid className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Activity Type Filters */}
            {activityTypes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Filter by type:</span>
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
                      setCurrentPage(1)
                    }}
                  >
                    {type}
                  </Badge>
                ))}
                {selectedTypes.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedTypes([])
                    setCurrentPage(1)
                  }}>
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
          ) : viewMode === 'table' ? (
            /* Table View */
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('start_date')}
                        >
                          <div className="flex items-center gap-2">
                            Date
                            {getSortIcon('start_date')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            Name
                            {getSortIcon('name')}
                          </div>
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 text-right"
                          onClick={() => handleSort('distance')}
                        >
                          <div className="flex items-center justify-end gap-2">
                            Distance
                            {getSortIcon('distance')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 text-right"
                          onClick={() => handleSort('moving_time')}
                        >
                          <div className="flex items-center justify-end gap-2">
                            Duration
                            {getSortIcon('moving_time')}
                          </div>
                        </TableHead>
                        <TableHead className="text-right hidden md:table-cell">Pace/Speed</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 text-right hidden lg:table-cell"
                          onClick={() => handleSort('total_elevation_gain')}
                        >
                          <div className="flex items-center justify-end gap-2">
                            Elevation
                            {getSortIcon('total_elevation_gain')}
                          </div>
                        </TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedActivities.map((activity) => (
                        <TableRow
                          key={activity.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedActivity(activity)}
                        >
                          <TableCell className="font-medium">
                            {format(new Date(activity.start_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={activity.name}>
                              {activity.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getTypeColor(activity.type)}>
                              {activity.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDistance(activity.distance)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDuration(activity.moving_time)}
                          </TableCell>
                          <TableCell className="text-right hidden md:table-cell">
                            {activity.type === 'Run' || activity.type === 'Walk' || activity.type === 'Hike'
                              ? formatPace(activity.average_speed)
                              : formatSpeed(activity.average_speed)}
                          </TableCell>
                          <TableCell className="text-right hidden lg:table-cell">
                            {formatElevation(activity.total_elevation_gain)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            /* Grid View */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onClick={() => setSelectedActivity(activity)}
                  getTypeColor={getTypeColor}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredActivities.length)} of {filteredActivities.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-9"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
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

const ActivityCard = ({ activity, onClick, getTypeColor }) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Badge variant="outline" className={getTypeColor(activity.type)}>
            {activity.type}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(new Date(activity.start_date), 'MMM d, yyyy')}
          </span>
        </div>
        <CardTitle className="text-base truncate">{activity.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatDistance(activity.distance)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatDuration(activity.moving_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {activity.type === 'Run' || activity.type === 'Walk' || activity.type === 'Hike'
                ? formatPace(activity.average_speed)
                : formatSpeed(activity.average_speed)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatElevation(activity.total_elevation_gain)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

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
          </div>
          <DialogTitle>{activity.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(date, 'EEEE, MMMM d, yyyy')} at {format(date, 'h:mm a')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Stats Grid */}
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

          {/* Additional Stats */}
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
                {activity.suffer_score && (
                  <StatItem label="Suffer Score" value={activity.suffer_score} />
                )}
              </div>
            </>
          )}

          {/* Description */}
          {activity.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{activity.description}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
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
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48 flex-1" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export default Activities
