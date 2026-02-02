import { Home, Activity, Award, BarChart3, Target, Brain, Settings } from "lucide-react"
import { NavLink } from "react-router-dom"

import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { title: "Overview", icon: Home, url: "/dashboard" },
  { title: "Activities", icon: Activity, url: "/activities" },
  { title: "Records", icon: Award, url: "/records" },
  { title: "Analytics", icon: BarChart3, url: "/analytics" },
  { title: "Goals", icon: Target, url: "/goals" },
  { title: "Training", icon: Brain, url: "/training" },
  { title: "Settings", icon: Settings, url: "/settings" },
]

export function AppSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="none" className="!w-28 border-r-0 bg-transparent">
      <div className="fixed left-4 top-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center gap-4 py-6 px-3 bg-white/40 backdrop-blur-sm rounded-full border border-white/60 shadow-sm">
          <SidebarMenu className="items-center gap-4">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title} className="flex justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `nav-icon-button ${isActive ? "active" : ""}`
                      }
                    >
                      <item.icon />
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </div>
    </Sidebar>
  )
}
