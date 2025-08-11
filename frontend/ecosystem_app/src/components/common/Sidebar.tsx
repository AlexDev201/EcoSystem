// src/components/common/Sidebar.tsx
import { Home, Activity, FileBarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useLocation, Link } from "react-router-dom"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: "Dashboard", icon: Home, path: "/" },
  { label: "Dispositivos", icon: Activity, path: "/devices" },
  { label: "Reportes", icon: FileBarChart2, path: "/reports" },
]

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation()

  const renderNavItem = (item: typeof navItems[number]) => {
    const isActive = location.pathname === item.path
    return (
      <Link to={item.path} key={item.path}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className="w-full justify-start"
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      </Link>
    )
  }

  // Sidebar permanente en desktop
  const sidebarContent = (
    <div className="flex flex-col p-4 w-64 h-full border-r bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Menú</h2>
      <nav className="flex flex-col gap-2">{navItems.map(renderNavItem)}</nav>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar via Sheet */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-64">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex">{sidebarContent}</aside>
    </>
  )
}
