import { NavLink } from "react-router-dom"
import { LayoutGrid, BarChart3, Activity, Database } from "lucide-react"

const navItems = [
  { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
  { title: "Analytics", icon: BarChart3, url: "/analytics" },
  { title: "Pulse", icon: Activity, url: "/pulse" },
  { title: "Data", icon: Database, url: "/data" },
]

// Logo component - hashtag/grid pattern like in the reference image
const Logo = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-black"
  >
    {/* Vertical lines */}
    <path
      d="M10 4V24M18 4V24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Horizontal lines */}
    <path
      d="M4 10H24M4 18H24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
)

export function TopNavBar() {
  return (
    <nav className="flex items-center justify-center py-6 relative">
      {/* Logo - positioned to the left of nav bubble */}
      <div className="mr-6 cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-12">
        <Logo />
      </div>

      {/* Navigation Tabs - Bubble Container */}
      <div className="flex items-center gap-0.5 rounded-full bg-[#F5F5F5] p-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) =>
                `group relative flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium
                transition-all duration-300 ease-out
                ${
                  isActive
                    ? "bg-black text-white"
                    : "text-[#666666] hover:text-black hover:bg-white"
                }`
              }
            >
              <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              <span>{item.title}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
