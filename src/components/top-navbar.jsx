import { useState, useEffect, useCallback } from "react"
import { Bell, ChevronDown, LogOut, Settings, Search, CalendarDays, Heart, MessageCircle, Trophy, Medal, Loader2, MapPin, Clock, X, Filter, SlidersHorizontal } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { format, formatDistanceToNow } from "date-fns"
import stravaApi from "@/services/stravaApi"
import { formatDistance, formatDuration } from "@/utils/dataProcessing"
import { useIsMobile } from "@/hooks/useIsMobile"
import { MobileNav } from "@/components/MobileNav"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"

const QUICK_TIME_FILTERS = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '3M' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'All' },
]

const QUICK_SPORT_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Run', label: 'Run' },
  { value: 'Ride', label: 'Ride' },
  { value: 'Swim', label: 'Swim' },
]

export function TopNavBar({
  title,
  subtitle,
  timeRange,
  onTimeRangeChange,
  customDateRange,
  onCustomDateRangeChange,
  sportFilter,
  onSportFilterChange,
  showFilters = true,
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [dateRange, setDateRange] = useState(customDateRange || { from: undefined, to: undefined })
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [hasLoadedNotifications, setHasLoadedNotifications] = useState(false)

  // Search state
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [allActivities, setAllActivities] = useState([])
  const [hasLoadedActivities, setHasLoadedActivities] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Load activities for search when search opens
  useEffect(() => {
    if (searchOpen && !hasLoadedActivities) {
      loadActivitiesForSearch()
    }
  }, [searchOpen])

  // Search through activities when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const filtered = allActivities.filter(activity =>
        activity.name.toLowerCase().includes(query) ||
        activity.type.toLowerCase().includes(query) ||
        (activity.location_city && activity.location_city.toLowerCase().includes(query)) ||
        (activity.location_country && activity.location_country.toLowerCase().includes(query))
      ).slice(0, 10) // Limit to 10 results
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, allActivities])

  const loadActivitiesForSearch = async () => {
    setSearchLoading(true)
    try {
      const data = await stravaApi.getAllActivities(null, null, () => {})
      setAllActivities(data)
      setHasLoadedActivities(true)
    } catch (error) {
      console.error('Failed to load activities for search:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const getActivityTypeColor = (type) => {
    const colors = {
      Run: 'bg-orange-100 text-orange-700',
      Ride: 'bg-blue-100 text-blue-700',
      Swim: 'bg-cyan-100 text-cyan-700',
      Walk: 'bg-green-100 text-green-700',
      Hike: 'bg-emerald-100 text-emerald-700',
      WeightTraining: 'bg-purple-100 text-purple-700',
      Yoga: 'bg-pink-100 text-pink-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const handleSearchResultClick = (activityId) => {
    setSearchOpen(false)
    setSearchQuery('')
    navigate('/activities')
  }

  // Load notifications when dropdown opens
  useEffect(() => {
    if (notificationsOpen && !hasLoadedNotifications) {
      loadNotifications()
    }
  }, [notificationsOpen])

  const loadNotifications = async () => {
    setNotificationsLoading(true)
    try {
      const data = await stravaApi.getNotifications()
      setNotifications(data)
      setHasLoadedNotifications(true)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'kudos':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'pr':
        return <Medal className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'kudos':
        return `${notification.user.firstname} ${notification.user.lastname} gave you kudos on "${notification.activity.name}"`
      case 'comment':
        return `${notification.user.firstname} ${notification.user.lastname} commented: "${notification.text?.slice(0, 50)}${notification.text?.length > 50 ? '...' : ''}"`
      case 'achievement':
        return `You earned ${notification.count} achievement${notification.count > 1 ? 's' : ''} on "${notification.activity.name}"`
      case 'pr':
        return `You set ${notification.count} personal record${notification.count > 1 ? 's' : ''} on "${notification.activity.name}"`
      default:
        return 'New notification'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const handleDateRangeSelect = (range) => {
    setDateRange(range || { from: undefined, to: undefined })
  }

  const handleApplyDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      onTimeRangeChange?.('custom')
      onCustomDateRangeChange?.(dateRange)
      setIsCalendarOpen(false)
    }
  }

  const handleClearDateRange = () => {
    setDateRange({ from: undefined, to: undefined })
  }

  const formatCustomRange = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
    }
    return 'Custom'
  }

  // Get current filter label for mobile dropdown
  const currentTimeLabel = QUICK_TIME_FILTERS.find(f => f.value === timeRange)?.label ||
    (timeRange === 'custom' ? formatCustomRange() : timeRange)
  const currentSportLabel = QUICK_SPORT_FILTERS.find(f => f.value === sportFilter)?.label || sportFilter

  return (
    <header className="sticky top-0 z-30 pt-3 px-3">
      <div className="flex h-14 items-center justify-between px-3 sm:px-6 rounded-3xl
        bg-white/80 backdrop-blur-xl border border-black/5
        shadow-lg shadow-black/5">
        {/* Left: Mobile hamburger + Section Context */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 sm:min-w-[200px]">
          {/* Mobile Navigation Trigger */}
          <MobileNav />

          {(title || subtitle) && (
            <div className="min-w-0">
              {title && (
                <h1 className="text-base sm:text-lg font-bold text-black tracking-tight truncate">{title}</h1>
              )}
              {subtitle && (
                <p className="text-xs text-[#6B7280] font-medium hidden sm:block">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Center: Pill-Style Filter Tabs (Desktop only) */}
        {showFilters && (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2">
              {/* Time Range Pills */}
              {onTimeRangeChange && (
                <div className="flex items-center bg-[#F1F3F5] rounded-2xl p-1">
                  {QUICK_TIME_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        onTimeRangeChange(filter.value)
                        if (filter.value !== 'custom') {
                          setDateRange({ from: undefined, to: undefined })
                        }
                      }}
                      className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200 ${
                        timeRange === filter.value
                          ? 'bg-black text-white shadow-sm'
                          : 'text-[#6B7280] hover:text-black'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}

                  {/* Custom Date Range */}
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        className={`px-3 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                          timeRange === 'custom'
                            ? 'bg-black text-white shadow-sm'
                            : 'text-[#6B7280] hover:text-black'
                        }`}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {timeRange === 'custom' ? formatCustomRange() : 'Custom'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl" align="center">
                      <div className="p-3 border-b border-[#F1F3F5]">
                        <p className="text-sm font-semibold text-black">Select date range</p>
                        <p className="text-xs text-[#6B7280]">
                          {dateRange?.from ? (
                            dateRange.to ? (
                              `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                            ) : (
                              `${format(dateRange.from, 'MMM d, yyyy')} - Select end date`
                            )
                          ) : (
                            'Click to select start date'
                          )}
                        </p>
                      </div>
                      <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={handleDateRangeSelect}
                        numberOfMonths={isMobile ? 1 : 2}
                        disabled={{ after: new Date() }}
                        className="rounded-2xl"
                      />
                      <div className="p-3 border-t border-[#F1F3F5] flex items-center justify-between gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearDateRange}
                          className="text-[#6B7280] hover:text-black"
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleApplyDateRange}
                          disabled={!dateRange?.from || !dateRange?.to}
                          className="bg-black text-white hover:bg-black/90 rounded-xl"
                        >
                          Apply
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Divider */}
              {onTimeRangeChange && onSportFilterChange && (
                <div className="w-px h-8 bg-[#E5E7EB] mx-2" />
              )}

              {/* Sport Filter Pills */}
              {onSportFilterChange && (
                <div className="flex items-center gap-1">
                  {QUICK_SPORT_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => onSportFilterChange(filter.value)}
                      className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200 ${
                        sportFilter === filter.value
                          ? 'bg-[#EDFD93] text-black'
                          : 'text-[#6B7280] hover:text-black hover:bg-[#F1F3F5]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spacer when no filters (desktop) */}
        {!showFilters && <div className="hidden md:flex flex-1" />}

        {/* Right: Global Actions & User Controls */}
        <div className="flex items-center gap-1 sm:gap-3 min-w-0 sm:min-w-[200px] justify-end">
          {/* Mobile Filters Dropdown */}
          {showFilters && (onTimeRangeChange || onSportFilterChange) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-10 w-10 rounded-xl text-[#6B7280] hover:text-black hover:bg-[#F1F3F5]"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                {onTimeRangeChange && (
                  <>
                    <DropdownMenuLabel className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-2">
                      Time Range
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={timeRange} onValueChange={(value) => {
                      onTimeRangeChange(value)
                      if (value !== 'custom') {
                        setDateRange({ from: undefined, to: undefined })
                      }
                    }}>
                      {QUICK_TIME_FILTERS.map((filter) => (
                        <DropdownMenuRadioItem
                          key={filter.value}
                          value={filter.value}
                          className="rounded-xl py-2 px-3 text-[13px] font-medium cursor-pointer"
                        >
                          {filter.label === '7D' ? 'Last 7 Days' :
                           filter.label === '30D' ? 'Last 30 Days' :
                           filter.label === '3M' ? 'Last 3 Months' :
                           filter.label === '1Y' ? 'Last Year' :
                           filter.label === 'All' ? 'All Time' : filter.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                    {/* Custom Date Range for Mobile */}
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button
                          className={`w-full text-left rounded-xl py-2 px-3 text-[13px] font-medium transition-colors flex items-center gap-2 ${
                            timeRange === 'custom'
                              ? 'bg-[#F1F3F5] text-black'
                              : 'text-[#6B7280] hover:bg-[#F1F3F5] hover:text-black'
                          }`}
                        >
                          <CalendarDays className="h-4 w-4" />
                          {timeRange === 'custom' ? formatCustomRange() : 'Custom Range'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[calc(100vw-2rem)] max-w-[320px] p-0 rounded-2xl" align="end">
                        <div className="p-3 border-b border-[#F1F3F5]">
                          <p className="text-sm font-semibold text-black">Select date range</p>
                          <p className="text-xs text-[#6B7280]">
                            {dateRange?.from ? (
                              dateRange.to ? (
                                `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                              ) : (
                                `${format(dateRange.from, 'MMM d, yyyy')} - Select end date`
                              )
                            ) : (
                              'Click to select start date'
                            )}
                          </p>
                        </div>
                        <Calendar
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={handleDateRangeSelect}
                          numberOfMonths={1}
                          disabled={{ after: new Date() }}
                          className="rounded-2xl"
                        />
                        <div className="p-3 border-t border-[#F1F3F5] flex items-center justify-between gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearDateRange}
                            className="text-[#6B7280] hover:text-black"
                          >
                            Clear
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleApplyDateRange}
                            disabled={!dateRange?.from || !dateRange?.to}
                            className="bg-black text-white hover:bg-black/90 rounded-xl"
                          >
                            Apply
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </>
                )}

                {onTimeRangeChange && onSportFilterChange && (
                  <DropdownMenuSeparator className="bg-[#F1F3F5] my-2" />
                )}

                {onSportFilterChange && (
                  <>
                    <DropdownMenuLabel className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider px-2">
                      Activity Type
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={sportFilter} onValueChange={onSportFilterChange}>
                      {QUICK_SPORT_FILTERS.map((filter) => (
                        <DropdownMenuRadioItem
                          key={filter.value}
                          value={filter.value}
                          className="rounded-xl py-2 px-3 text-[13px] font-medium cursor-pointer"
                        >
                          {filter.label === 'all' ? 'All Activities' : filter.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Search */}
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-[#6B7280] hover:text-black hover:bg-[#F1F3F5]"
              >
                <Search className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] p-0 rounded-2xl" align="end">
              <div className="p-3 border-b border-[#F1F3F5]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <Input
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-10 rounded-xl border-[#E5E7EB] focus-visible:ring-1 focus-visible:ring-black"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <ScrollArea className="h-[300px] sm:h-[350px]">
                {searchLoading && !hasLoadedActivities ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#6B7280] mb-3" />
                    <p className="text-sm text-[#6B7280]">Loading activities...</p>
                  </div>
                ) : searchQuery && searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 rounded-2xl bg-[#F1F3F5] flex items-center justify-center mb-3">
                      <Search className="h-6 w-6 text-[#6B7280]" />
                    </div>
                    <p className="text-sm font-medium text-black">No results found</p>
                    <p className="text-xs text-[#6B7280]">Try a different search term</p>
                  </div>
                ) : !searchQuery ? (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Recent Activities</p>
                    <div className="space-y-1">
                      {allActivities.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="p-3 rounded-xl hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                          onClick={() => handleSearchResultClick(activity.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`${getActivityTypeColor(activity.type)} border-0 text-[11px] font-semibold`}>
                              {activity.type}
                            </Badge>
                            <span className="text-[13px] font-medium text-black truncate flex-1">
                              {activity.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 text-[11px] text-[#6B7280]">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {formatDistance(activity.distance)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(activity.moving_time)}
                            </span>
                            <span className="hidden sm:inline">{format(new Date(activity.start_date), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </p>
                    <div className="space-y-1">
                      {searchResults.map((activity) => (
                        <div
                          key={activity.id}
                          className="p-3 rounded-xl hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                          onClick={() => handleSearchResultClick(activity.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`${getActivityTypeColor(activity.type)} border-0 text-[11px] font-semibold`}>
                              {activity.type}
                            </Badge>
                            <span className="text-[13px] font-medium text-black truncate flex-1">
                              {activity.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 text-[11px] text-[#6B7280]">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {formatDistance(activity.distance)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(activity.moving_time)}
                            </span>
                            <span className="hidden sm:inline">{format(new Date(activity.start_date), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>
              <div className="p-3 border-t border-[#F1F3F5]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-[13px] text-[#6B7280] hover:text-black"
                  onClick={() => {
                    setSearchOpen(false)
                    navigate('/activities')
                  }}
                >
                  View all activities
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex h-10 w-10 rounded-xl text-[#6B7280] hover:text-black hover:bg-[#F1F3F5] relative"
              >
                <Bell className="h-5 w-5" />
                {(unreadCount > 0 || !hasLoadedNotifications) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#EDFD93] rounded-full border-2 border-white" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96 max-w-96 p-0 rounded-2xl" align="end">
              <div className="p-4 border-b border-[#F1F3F5] flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-black">Notifications</p>
                  <p className="text-xs text-[#6B7280]">
                    {notifications.length > 0
                      ? `${notifications.length} recent notifications`
                      : 'Your recent activity'
                    }
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadNotifications}
                  disabled={notificationsLoading}
                  className="text-xs text-[#6B7280] hover:text-black"
                >
                  {notificationsLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>
              <ScrollArea className="h-[350px] sm:h-[400px]">
                {notificationsLoading && notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#6B7280] mb-3" />
                    <p className="text-sm text-[#6B7280]">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 rounded-2xl bg-[#F1F3F5] flex items-center justify-center mb-3">
                      <Bell className="h-6 w-6 text-[#6B7280]" />
                    </div>
                    <p className="text-sm font-medium text-black">No notifications yet</p>
                    <p className="text-xs text-[#6B7280]">We'll notify you when something happens</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F1F3F5]">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                        onClick={() => {
                          navigate(`/activities`)
                          setNotificationsOpen(false)
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F1F3F5] flex items-center justify-center flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-black leading-snug">
                              {getNotificationMessage(notification)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-[#6B7280]">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                              </span>
                              <span className="text-[11px] text-[#6B7280]">•</span>
                              <span className="text-[11px] text-[#6B7280] capitalize">
                                {notification.activity.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-[#F1F3F5]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[13px] text-[#6B7280] hover:text-black"
                    onClick={() => {
                      navigate('/activities')
                      setNotificationsOpen(false)
                    }}
                  >
                    View all activities
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Divider - hidden on small mobile */}
          <div className="hidden sm:block w-px h-8 bg-[#E5E7EB]" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 gap-2 sm:gap-3 px-2 sm:px-3 rounded-xl hover:bg-[#F1F3F5] focus-visible:ring-0"
              >
                <Avatar className="h-8 w-8 rounded-xl">
                  <AvatarImage src={user?.profile} alt={user?.firstname} />
                  <AvatarFallback className="bg-black text-white text-xs font-semibold rounded-xl">
                    {user?.firstname?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-[13px] font-semibold text-black leading-tight">
                    {user?.firstname}
                  </span>
                  <span className="text-[11px] text-[#6B7280] leading-tight">
                    Athlete
                  </span>
                </div>
                <ChevronDown className="hidden sm:block h-4 w-4 text-[#6B7280]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
              <div className="px-3 py-3 mb-1">
                <p className="text-sm font-bold text-black">{user?.firstname} {user?.lastname}</p>
                <p className="text-xs text-[#6B7280]">
                  {user?.city ? `${user.city}, ${user.country}` : "Strava Athlete"}
                </p>
              </div>
              <DropdownMenuSeparator className="bg-[#F1F3F5]" />
              <DropdownMenuItem
                onClick={() => navigate('/settings')}
                className="rounded-xl py-2.5 px-3 text-[13px] font-medium cursor-pointer focus:bg-[#F1F3F5]"
              >
                <Settings className="mr-3 h-4 w-4 text-[#6B7280]" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#F1F3F5]" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-xl py-2.5 px-3 text-[13px] font-medium text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-600"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
