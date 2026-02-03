import { Bell, ChevronDown, LogOut, Settings, Search } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  sportFilter,
  onSportFilterChange,
  showFilters = true,
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-black/5">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Section Context */}
        <div className="flex items-center gap-4 min-w-[200px]">
          {(title || subtitle) && (
            <div>
              {title && (
                <h1 className="text-lg font-bold text-black tracking-tight">{title}</h1>
              )}
              {subtitle && (
                <p className="text-xs text-[#6B7280] font-medium">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Center: Pill-Style Filter Tabs */}
        {showFilters && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              {/* Time Range Pills */}
              {onTimeRangeChange && (
                <div className="flex items-center bg-[#F1F3F5] rounded-2xl p-1">
                  {QUICK_TIME_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => onTimeRangeChange(filter.value)}
                      className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200 ${
                        timeRange === filter.value
                          ? 'bg-black text-white shadow-sm'
                          : 'text-[#6B7280] hover:text-black'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
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

        {/* Spacer when no filters */}
        {!showFilters && <div className="flex-1" />}

        {/* Right: Global Actions & User Controls */}
        <div className="flex items-center gap-3 min-w-[200px] justify-end">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-[#6B7280] hover:text-black hover:bg-[#F1F3F5]"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-[#6B7280] hover:text-black hover:bg-[#F1F3F5] relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#EDFD93] rounded-full border-2 border-white" />
          </Button>

          {/* Divider */}
          <div className="w-px h-8 bg-[#E5E7EB]" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 gap-3 px-3 rounded-xl hover:bg-[#F1F3F5] focus-visible:ring-0"
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
                <ChevronDown className="h-4 w-4 text-[#6B7280]" />
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
