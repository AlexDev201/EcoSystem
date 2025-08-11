import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import { Header } from "./components/common/Header"
import { Sidebar } from "./components/common/Sidebar"
import { DashboardMain } from "./components/dashboard/DashboardMain"
import { DeviceList } from "./components/devices/DeviceList"
import { ReportDashboard } from "./components/reports/ReportDashboard"
import { webSocketService } from "./services/websocket"
import "../src/App.css"

export function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    webSocketService.connect()

    return () => {
      webSocketService.disconnect()
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<DashboardMain />} />
              <Route path="/devices" element={<DeviceList />} />
              <Route path="/reports" element={<ReportDashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
