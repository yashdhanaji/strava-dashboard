import { Bell, ChevronDown, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"

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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center bg-transparent px-6">
      {/* Left: App Logo */}
      <div className="flex items-center gap-3 min-w-fit">
        <img
          src="/logo.png"
          alt="Muscle and Miles"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="text-base font-bold text-gray-800 leading-tight">Muscle and Miles</span>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Athletic Club</span>
        </div>
      </div>

      {/* Center: Title + Filters */}
      <div className="flex-1 flex items-center justify-center gap-6">
        {(title || subtitle) && (
          <div className="text-center">
            {title && <h1 className="text-base font-semibold text-gray-800">{title}</h1>}
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        )}

        {/* Quick Filters */}
        {showFilters && (
          <div className="hidden md:flex items-center gap-1">
            {/* Time Range Quick Filters */}
            {onTimeRangeChange && (
              <div className="flex items-center bg-white/50 rounded-full p-0.5 border border-gray-200/50">
                {QUICK_TIME_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => onTimeRangeChange(filter.value)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${
                      timeRange === filter.value
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}

            {/* Divider */}
            {onSportFilterChange && <div className="w-px h-4 bg-gray-200/50 mx-2" />}

            {/* Sport Quick Filters */}
            {onSportFilterChange && (
              <div className="flex items-center gap-1">
                {QUICK_SPORT_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => onSportFilterChange(filter.value)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${
                      sportFilter === filter.value
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: User Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-gray-600 hover:bg-transparent">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-3 hover:bg-transparent">
              <Avatar className="h-8 w-8 border border-white/60">
                <AvatarImage src={user?.profile} alt={user?.firstname} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.firstname?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">
                {user?.firstname}
              </span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.firstname} {user?.lastname}</p>
              <p className="text-xs text-muted-foreground">
                {user?.city ? `${user.city}, ${user.country}` : "Athlete"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="text-xs">
              <Settings className="mr-2 h-3.5 w-3.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-xs text-red-600">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
