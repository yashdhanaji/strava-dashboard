import { useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"
import { Home, Activity, Award, BarChart3, Target, Brain, HelpCircle, Settings, LogOut } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Navigation items configuration
const navItems = [
  { title: "Overview", icon: Home, url: "/dashboard" },
  { title: "Activities", icon: Activity, url: "/activities" },
  { title: "Records", icon: Award, url: "/records" },
  { title: "Analytics", icon: BarChart3, url: "/analytics" },
  { title: "Goals", icon: Target, url: "/goals" },
  { title: "Training", icon: Brain, url: "/training" },
]

const secondaryItems = [
  { title: "Help", icon: HelpCircle, url: "#help" },
  { title: "Settings", icon: Settings, url: "/settings" },
]

// Dock configuration
const DOCK_CONFIG = {
  baseSize: 44,        // Base icon size in pixels
  maxScale: 1.5,       // Maximum scale factor on hover
  distanceRange: 150,  // Distance in pixels for scaling effect
  springConfig: {      // Framer Motion spring configuration
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  }
}

// Logo component
const Logo = () => (
  <svg
    width="20"
    height="20"
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

// Glassmorphism Tooltip Component
const Tooltip = ({ children, isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, x: -8, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -8, scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="absolute left-full ml-3 px-3 py-1.5 rounded-lg
          bg-white/80 backdrop-blur-xl border border-white/20
          shadow-lg shadow-black/5
          text-[12px] font-medium text-gray-800 whitespace-nowrap
          pointer-events-none z-50"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

// Dock Icon Component with proximity-based scaling
const DockIcon = ({ item, mouseY, isActive }) => {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const Icon = item.icon
  const isExternal = !item.url.startsWith('/')

  // Calculate distance from mouse to this icon's center
  const distance = useTransform(mouseY, (val) => {
    if (!ref.current || val === null) return DOCK_CONFIG.distanceRange
    const rect = ref.current.getBoundingClientRect()
    const iconCenterY = rect.top + rect.height / 2
    return Math.abs(val - iconCenterY)
  })

  // Map distance to scale factor using spring physics
  const scaleValue = useTransform(
    distance,
    [0, DOCK_CONFIG.distanceRange],
    [DOCK_CONFIG.maxScale, 1]
  )

  const scale = useSpring(scaleValue, DOCK_CONFIG.springConfig)

  // Map scale to size
  const size = useTransform(scale, (s) => s * DOCK_CONFIG.baseSize)

  const iconContent = (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center justify-center cursor-pointer"
    >
      {/* Icon container */}
      <motion.div
        className={`
          w-full h-full rounded-2xl flex items-center justify-center
          transition-colors duration-200
          ${isActive
            ? "bg-black text-white shadow-lg shadow-black/20"
            : "bg-[#F1F3F5] text-[#6B7280] hover:bg-[#E5E7EB]"
          }
        `}
      >
        <Icon style={{ width: '45%', height: '45%' }} />
      </motion.div>

      {/* Glassmorphism tooltip */}
      <Tooltip isVisible={isHovered}>{item.title}</Tooltip>
    </motion.div>
  )

  if (isExternal) {
    return (
      <a href={item.url} className="relative flex items-center justify-center py-1">
        {iconContent}
      </a>
    )
  }

  return (
    <NavLink to={item.url} className="relative flex items-center justify-center py-1">
      {iconContent}
    </NavLink>
  )
}

// User Profile Dock Icon
const UserDockIcon = ({ user, mouseY, onLogout }) => {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const distance = useTransform(mouseY, (val) => {
    if (!ref.current || val === null) return DOCK_CONFIG.distanceRange
    const rect = ref.current.getBoundingClientRect()
    const iconCenterY = rect.top + rect.height / 2
    return Math.abs(val - iconCenterY)
  })

  const scaleValue = useTransform(
    distance,
    [0, DOCK_CONFIG.distanceRange],
    [DOCK_CONFIG.maxScale, 1]
  )

  const scale = useSpring(scaleValue, DOCK_CONFIG.springConfig)
  const size = useTransform(scale, (s) => s * DOCK_CONFIG.baseSize)

  return (
    <div className="relative">
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowMenu(false)
        }}
        onClick={() => setShowMenu(!showMenu)}
        className="relative flex items-center justify-center cursor-pointer"
      >
        <Avatar className="w-full h-full rounded-xl ring-2 ring-[#E8E8E8]">
          <AvatarImage src={user?.profile} alt={user?.firstname} />
          <AvatarFallback className="rounded-xl bg-black text-white text-sm font-medium">
            {user?.firstname?.[0] || "U"}
          </AvatarFallback>
        </Avatar>

        <Tooltip isVisible={isHovered && !showMenu}>
          {user?.firstname} {user?.lastname}
        </Tooltip>
      </motion.div>

      {/* Dropdown menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-full ml-3 bottom-0 p-2 rounded-xl
              bg-white/90 backdrop-blur-xl border border-white/20
              shadow-xl shadow-black/10 min-w-[160px] z-50"
          >
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-[13px] font-semibold text-black">
                {user?.firstname} {user?.lastname}
              </p>
              <p className="text-[11px] text-gray-500">
                {user?.city ? `${user.city}, ${user.country}` : "Athlete"}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                text-[13px] font-medium text-red-500 hover:bg-red-50
                transition-colors duration-150"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Main Sidebar Component
export function AppSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const mouseY = useMotionValue(null)

  const handleMouseMove = (e) => {
    mouseY.set(e.clientY)
  }

  const handleMouseLeave = () => {
    mouseY.set(null)
  }

  return (
    <aside
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed left-3 top-1/2 -translate-y-1/2 z-40"
    >
      <div className="flex flex-col items-center py-4 px-2.5 rounded-3xl
        bg-white/80 backdrop-blur-xl border border-black/5
        shadow-lg shadow-black/5"
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex size-11 items-center justify-center rounded-2xl bg-black cursor-pointer mb-4 shadow-lg shadow-black/20"
        >
          <Logo />
        </motion.div>

        {/* Main Navigation */}
        <nav className="flex flex-col items-center">
          <div className="flex flex-col items-center space-y-2">
            {navItems.map((item) => (
              <DockIcon
                key={item.title}
                item={item}
                mouseY={mouseY}
                isActive={location.pathname === item.url}
              />
            ))}
          </div>

          {/* Spacer */}
          <div className="h-4" />

          {/* Secondary Items */}
          <div className="flex flex-col items-center space-y-2">
            {secondaryItems.map((item) => (
              <DockIcon
                key={item.title}
                item={item}
                mouseY={mouseY}
                isActive={location.pathname === item.url}
              />
            ))}
          </div>
        </nav>

        {/* Spacer */}
        <div className="h-4" />

        {/* User Profile */}
        <UserDockIcon user={user} mouseY={mouseY} onLogout={logout} />
      </div>
    </aside>
  )
}

// Export configuration for customization
export { DOCK_CONFIG }
