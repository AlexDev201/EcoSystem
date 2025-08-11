// src/components/dashboard/DashboardMain.tsx
import { useAlerts } from "@/hooks/useAlerts"
import { useReadings } from "@/hooks/useReadings"
import { RealTimeChart } from "@/components/charts/RealTimeChart"
import { GaugeChart } from "@/components/charts/GaugeChart"
import { MultiDeviceChart } from "@/components/charts/MultiDeviceChart"

export const DashboardMain = () => {
  const { alerts, unreadCount } = useAlerts()
  const { readings, latestReading } = useReadings()

  return (
    <div className="space-y-6">
      {/* Gauges en tiempo real */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(latestReading).map(([deviceId, reading]) => (
          <div key={`gauges-${deviceId}`} className="space-y-2">
            <GaugeChart
              value={reading.voltage}
              maxValue={250}
              title={`Voltaje - ${deviceId}`}
              unit="V"
              color="#3b82f6"
            />
            <GaugeChart
              value={reading.current}
              maxValue={20}
              title={`Corriente - ${deviceId}`}
              unit="A"
              color="#10b981"
            />
          </div>
        ))}
      </div>

      {/* Gráficos de comparación entre dispositivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MultiDeviceChart
          latestReadings={latestReading}
          dataKey="power"
          title="Potencia"
          unit="W"
          color="#f59e0b"
        />
        <MultiDeviceChart
          latestReadings={latestReading}
          dataKey="temperature"
          title="Temperatura"
          unit="°C"
          color="#ef4444"
        />
      </div>

      {/* Gráficos de tendencias en tiempo real */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {Object.entries(readings).map(([deviceId, deviceReadings]) => (
          <div key={`charts-${deviceId}`} className="space-y-4">
            <RealTimeChart
              readings={deviceReadings}
              dataKey="power"
              title="Potencia"
              color="#f59e0b"
              unit="W"
              deviceId={deviceId}
            />
            <RealTimeChart
              readings={deviceReadings}
              dataKey="voltage"
              title="Voltaje"
              color="#3b82f6"
              unit="V"
              deviceId={deviceId}
            />
          </div>
        ))}
      </div>

      {/* Panel de alertas y resumen textual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resumen textual */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Estado actual</h2>
          {Object.entries(latestReading).map(([deviceId, reading]) => (
            <div key={deviceId} className="mb-2">
              <p className="font-medium">{deviceId}</p>
              <ul className="text-sm text-gray-600">
                <li>Voltaje: {reading.voltage.toFixed(2)} V</li>
                <li>Corriente: {reading.current.toFixed(2)} A</li>
                <li>Potencia: {reading.power.toFixed(2)} W</li>
                <li>Temperatura: {reading.temperature.toFixed(2)} °C</li>
              </ul>
            </div>
          ))}
        </div>

        {/* Panel de alertas */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Alertas activas ({unreadCount})</h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-500">No hay alertas activas.</p>
          ) : (
            <ul className="text-sm">
              {alerts.slice(0, 5).map((a) => (
                <li key={a.timestamp} className="mb-1">
                  <span className="font-medium">{a.deviceId}</span>: {a.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
