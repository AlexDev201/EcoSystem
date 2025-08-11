// src/components/common/Header.tsx
import { Menu } from "lucide-react"
import {Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAlerts } from "../../hooks/useAlerts"

interface HeaderProps {
  onToggleSidebar?: () => void
}

export const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { unreadCount } = useAlerts()

  return (
    <header className="w-full flex items-center justify-between p-4 border-b bg-white shadow-sm">
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-primary">EcoEnergy Monitor</h1>

      {/* Alert Badge */}
      <div className="relative">
        <Badge variant="destructive" className="text-sm">
          Alertas: {unreadCount}
        </Badge>
      </div>
    </header>
  )
}
