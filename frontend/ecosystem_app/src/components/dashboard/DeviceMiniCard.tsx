import { DeviceStatus, Reading } from "@/services/types"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { Activity, Zap, Thermometer } from "lucide-react"

interface DeviceMiniCardProps {
  deviceId: string
  latest: Reading
  readings: Reading[]
  status?: DeviceStatus
}

export const DeviceMiniCard = ({ deviceId, latest, readings, status }: DeviceMiniCardProps) => {
  const getStatusColor = (status?: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.ACTIVE:
        return "bg-green-500"
      case DeviceStatus.INACTIVE:
        return "bg-red-500"
      case DeviceStatus.MAINTENANCE:
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-800">{deviceId}</h3>
        <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
      </div>

      {/* Mini Chart */}
      <div className="h-20 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={readings}>
            <Line type="monotone" dataKey="power" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <Zap className="h-3 w-3 text-yellow-500" />
          <span>{latest.power.toFixed(0)} W</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Activity className="h-3 w-3 text-blue-500" />
          <span>{latest.voltage.toFixed(1)} V</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Thermometer className="h-3 w-3 text-red-500" />
          <span>{latest.temperature.toFixed(1)} °C</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <span>⎍</span>
          <span>{latest.current.toFixed(2)} A</span>
        </div>
      </div>
    </div>
  )
}
