import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Thermometer, Activity, AlertTriangle } from "lucide-react"
import { Reading } from "@/services/types"

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

const MetricCard = ({ title, value, icon, color }: MetricCardProps) => (
  <Card className="shadow-sm">
    <CardHeader className="flex items-center space-x-2 pb-2">
      <div className={`p-2 rounded-full ${color}`}>
        {icon}
      </div>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
)

interface MetricCardsProps {
  latestReading: Record<string, Reading>
  alerts: { deviceId: string; message: string; timestamp: string }[]
}

export const MetricCards = ({ latestReading, alerts }: MetricCardsProps) => {
  const allReadings = Object.values(latestReading)

  const totalPower = allReadings.reduce((sum, r) => sum + r.power, 0)
  const avgTemp = allReadings.length
    ? allReadings.reduce((sum, r) => sum + r.temperature, 0) / allReadings.length
    : 0
  const activeDevices = allReadings.length
  const alertCount = alerts.length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="Consumo Total"
        value={`${totalPower.toFixed(0)} W`}
        icon={<Zap className="h-5 w-5 text-yellow-600" />}
        color="bg-yellow-100"
      />
      <MetricCard
        title="Temperatura Prom."
        value={`${avgTemp.toFixed(1)} °C`}
        icon={<Thermometer className="h-5 w-5 text-red-600" />}
        color="bg-red-100"
      />
      <MetricCard
        title="Dispositivos Activos"
        value={`${activeDevices}`}
        icon={<Activity className="h-5 w-5 text-green-600" />}
        color="bg-green-100"
      />
      <MetricCard
        title="Alertas Activas"
        value={`${alertCount}`}
        icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
        color="bg-orange-100"
      />
    </div>
  )
}
