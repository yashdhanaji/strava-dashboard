import { useState, useEffect, useCallback, useMemo } from 'react'
import { subDays, format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import stravaApi from '@/services/stravaApi'
import { toUnixTimestamp } from '@/utils/dateHelpers'
import { formatDistance, formatDuration, formatPace, formatSpeed, formatElevation } from '@/utils/dataProcessing'
import polyline from '@mapbox/polyline'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { AppSidebar } from '@/components/app-sidebar'
import { TopNavBar } from '@/components/top-navbar'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import {
  Activity,
  Search,
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

// Time range mapping (same as Dashboard)
const TIME_RANGE_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
  'all': null,
}

const ITEMS_PER_PAGE = 15

const Activities = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [timeRange, setTimeRange] = useState('30d')
  const [customDateRange, setCustomDateRange] = useState(null)
  const [sportFilter, setSportFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'start_date', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [viewMode, setViewMode] = useState('table')

  // Load activities when time range changes
  const loadActivities = useCallback(async () => {
    setLoading(true)
    try {
      let after, before

      if (timeRange === 'custom' && customDateRange?.from && customDateRange?.to) {
        after = toUnixTimestamp(customDateRange.from)
        before = toUnixTimestamp(customDateRange.to)
      } else {
        const days = TIME_RANGE_DAYS[timeRange]
        after = days ? toUnixTimestamp(subDays(new Date(), days)) : null
        before = toUnixTimestamp(new Date())
      }

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
  }, [timeRange, customDateRange])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = activities

    // Filter by sport type from TopNavBar
    if (sportFilter !== 'all') {
      filtered = filtered.filter((activity) => activity.type === sportFilter)
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
  }, [activities, sportFilter, searchQuery, sortConfig])

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
    <div className="min-h-screen bg-[#F8F9FA]">
      <AppSidebar />
      <main className="ml-0 md:ml-[88px]">
        <TopNavBar
          title="Activities"
          subtitle={`${filteredActivities.length} activities found`}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
          sportFilter={sportFilter}
          onSportFilterChange={setSportFilter}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {/* Search and View Toggle */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 w-[250px] rounded-xl"
              />
            </div>
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="h-9 rounded-xl">
                <TabsTrigger value="table" className="px-3 rounded-lg">
                  <List className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="grid" className="px-3 rounded-lg">
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : filteredActivities.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 rounded-3xl border-0 shadow-sm bg-white">
              <div className="w-16 h-16 rounded-2xl bg-[#F1F3F5] flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-[#6B7280]" />
              </div>
              <CardTitle className="mb-2 text-black">No activities found</CardTitle>
              <CardDescription className="text-[#6B7280]">Try adjusting your date range or filters</CardDescription>
            </Card>
          ) : viewMode === 'table' ? (
            /* Table View */
            <Card className="rounded-3xl border-0 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA]">
                        <TableHead className="w-[60px] text-center font-bold text-black">#</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-[#E5E7EB] font-bold text-black"
                          onClick={() => handleSort('start_date')}
                        >
                          <div className="flex items-center gap-2">
                            Date
                            {getSortIcon('start_date')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-[#E5E7EB] font-bold text-black"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            Name
                            {getSortIcon('name')}
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-black">Type</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-[#E5E7EB] text-right font-bold text-black"
                          onClick={() => handleSort('distance')}
                        >
                          <div className="flex items-center justify-end gap-2">
                            Distance
                            {getSortIcon('distance')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-[#E5E7EB] text-right font-bold text-black"
                          onClick={() => handleSort('moving_time')}
                        >
                          <div className="flex items-center justify-end gap-2">
                            Duration
                            {getSortIcon('moving_time')}
                          </div>
                        </TableHead>
                        <TableHead className="text-right hidden md:table-cell font-bold text-black">Pace/Speed</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-[#E5E7EB] text-right hidden lg:table-cell font-bold text-black"
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
                      {paginatedActivities.map((activity, index) => (
                        <TableRow
                          key={activity.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedActivity(activity)}
                        >
                          <TableCell className="text-center text-[#6B7280] font-medium">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </TableCell>
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
      </main>
    </div>
  )
}

const ActivityCard = ({ activity, onClick, getTypeColor }) => {
  // Decode polyline for route display
  const routeCoords = useMemo(() => {
    if (activity.map?.summary_polyline) {
      try {
        return polyline.decode(activity.map.summary_polyline)
      } catch {
        return null
      }
    }
    return null
  }, [activity.map?.summary_polyline])

  // Calculate bounds for the map
  const bounds = useMemo(() => {
    if (!routeCoords || routeCoords.length === 0) return null
    const lats = routeCoords.map(c => c[0])
    const lngs = routeCoords.map(c => c[1])
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ]
  }, [routeCoords])

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow rounded-3xl border-0 shadow-sm bg-white overflow-hidden" onClick={onClick}>
      {/* Route Map Preview */}
      {routeCoords && bounds && (
        <div className="h-32 w-full relative">
          <MapContainer
            bounds={bounds}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={false}
            attributionControl={false}
            className="h-full w-full"
            style={{ background: '#F8F9FA' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: '#FF6B35', weight: 3 }}
            />
          </MapContainer>
          {/* Gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
        </div>
      )}

      <CardHeader className={routeCoords ? "pb-2 pt-3" : "pb-2"}>
        <div className="flex items-start justify-between">
          <Badge variant="outline" className={getTypeColor(activity.type)}>
            {activity.type}
          </Badge>
          <span className="text-xs text-[#6B7280]">
            {format(new Date(activity.start_date), 'MMM d, yyyy')}
          </span>
        </div>
        <CardTitle className="text-base truncate text-black">{activity.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EDFD93]/30 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-[#6B8E23]" />
            </div>
            <span className="text-sm font-semibold text-black">{formatDistance(activity.distance)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#93D6D6]/30 flex items-center justify-center">
              <Clock className="h-4 w-4 text-[#2D8A8A]" />
            </div>
            <span className="text-sm font-semibold text-black">{formatDuration(activity.moving_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#CBE1D6]/40 flex items-center justify-center">
              <Zap className="h-4 w-4 text-[#3D7A5C]" />
            </div>
            <span className="text-sm font-semibold text-black">
              {activity.type === 'Run' || activity.type === 'Walk' || activity.type === 'Hike'
                ? formatPace(activity.average_speed)
                : formatSpeed(activity.average_speed)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C8CEE1]/40 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[#5B6494]" />
            </div>
            <span className="text-sm font-semibold text-black">{formatElevation(activity.total_elevation_gain)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ActivityDetailDialog = ({ activity, onClose, getTypeColor }) => {
  // Decode polyline for route display
  const routeCoords = useMemo(() => {
    if (activity?.map?.summary_polyline) {
      try {
        return polyline.decode(activity.map.summary_polyline)
      } catch {
        return null
      }
    }
    return null
  }, [activity?.map?.summary_polyline])

  // Calculate bounds for the map
  const bounds = useMemo(() => {
    if (!routeCoords || routeCoords.length === 0) return null
    const lats = routeCoords.map(c => c[0])
    const lngs = routeCoords.map(c => c[1])
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ]
  }, [routeCoords])

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
          {/* Route Map */}
          {routeCoords && bounds && (
            <div className="h-48 w-full rounded-2xl overflow-hidden relative">
              <MapContainer
                bounds={bounds}
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
                className="h-full w-full"
                style={{ background: '#F8F9FA' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: '#FF6B35', weight: 3 }}
                />
              </MapContainer>
            </div>
          )}

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
  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8F9FA]">
    {icon && <div className="text-[#6B7280]">{icon}</div>}
    <div>
      <p className="text-xs text-[#6B7280]">{label}</p>
      <p className="text-sm font-semibold text-black">{value}</p>
    </div>
  </div>
)

const LoadingSkeleton = () => (
  <Card className="rounded-3xl border-0 shadow-sm bg-white">
    <CardContent className="p-6">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-4 w-48 flex-1 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export default Activities
