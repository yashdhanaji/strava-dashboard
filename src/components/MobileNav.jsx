import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Home, Activity, Award, BarChart3, Target, Brain, HelpCircle, Settings, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

// Navigation items (same as AppSidebar)
const navItems = [
  { title: 'Overview', icon: Home, url: '/dashboard' },
  { title: 'Activities', icon: Activity, url: '/activities' },
  { title: 'Records', icon: Award, url: '/records' },
  { title: 'Analytics', icon: BarChart3, url: '/analytics' },
  { title: 'Goals', icon: Target, url: '/goals' },
  { title: 'Training', icon: Brain, url: '/training' },
]

const secondaryItems = [
  { title: 'Help', icon: HelpCircle, url: '#help' },
  { title: 'Settings', icon: Settings, url: '/settings' },
]

// Logo component
const Logo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-white"
  >
    <path
      d="M10 4V24M18 4V24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M4 10H24M4 18H24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
)

export function MobileNav() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleNavClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 rounded-xl text-[#6B7280] hover:text-black hover:bg-[#F1F3F5]"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
        <SheetHeader className="p-4 border-b border-[#F1F3F5]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-black">
              <Logo />
            </div>
            <SheetTitle className="text-lg font-bold">Strava Dashboard</SheetTitle>
          </div>
        </SheetHeader>

        {/* Main Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.url
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-[#6B7280] hover:bg-[#F1F3F5] hover:text-black'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </NavLink>
              )
            })}
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-[#F1F3F5]" />

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.url
              const isExternal = !item.url.startsWith('/')

              if (isExternal) {
                return (
                  <a
                    key={item.title}
                    href={item.url}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#6B7280] hover:bg-[#F1F3F5] hover:text-black transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </a>
                )
              }

              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-[#6B7280] hover:bg-[#F1F3F5] hover:text-black'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto p-4 border-t border-[#F1F3F5]">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 rounded-xl">
              <AvatarImage src={user?.profile} alt={user?.firstname} />
              <AvatarFallback className="rounded-xl bg-[#F1F3F5] text-black text-sm font-medium">
                {user?.firstname?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black truncate">
                {user?.firstname} {user?.lastname}
              </p>
              <p className="text-xs text-[#6B7280]">
                {user?.city ? `${user.city}, ${user.country}` : 'Athlete'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => {
              logout()
              setOpen(false)
            }}
          >
            <LogOut className="h-5 w-5" />
            Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav
