// src/components/dashboard/DashboardMain.tsx
import { useEffect } from "react"
import { useAlerts } from "@/hooks/useAlerts"
import { useReadings } from "@/hooks/useReadings"
import { useDevice } from "@/hooks/useDevices"
import { RealTimeChart } from "@/components/charts/RealTimeChart"
import { GaugeChart } from "@/components/charts/GaugeChart"
import { MultiDeviceChart } from "@/components/charts/MultiDeviceChart"
import { MetricCards } from "./MetricsCards"

export const DashboardMain = () => {
  const { alerts, unreadCount } = useAlerts()
  const { devices } = useDevice()
  const { readings, latestReading, subscribeToDevice } = useReadings()

  // 🔹 Dispositivos activos usando ubidotsLabel (coincide con reading.deviceId del WS)
  const activeDeviceKeys = devices
    .filter((d) => d.status === "ACTIVE")
    .map((d) => d.ubidotsLabel || "")

  // 🔹 Suscripción automática al WS de cada dispositivo activo
  useEffect(() => {
    activeDeviceKeys.forEach((deviceKey) => {
      if (deviceKey) {
        subscribeToDevice(deviceKey)
      }
    })
  }, [activeDeviceKeys, subscribeToDevice])

  // 🔹 Filtrar lecturas solo de dispositivos activos
  const activeLatest = Object.fromEntries(
    Object.entries(latestReading).filter(([key]) =>
      activeDeviceKeys.includes(key)
    )
  )

  const activeReadings = Object.fromEntries(
    Object.entries(readings).filter(([key]) =>
      activeDeviceKeys.includes(key)
    )
  )

  // Debug para confirmar que hay match
  console.log("Active devices (keys):", activeDeviceKeys)
  console.log("Latest reading keys:", Object.keys(latestReading))
  console.log("Active latestReading:", activeLatest)

  return (
    <div className="space-y-6">
      {/* 🔹 Métricas globales */}
      <MetricCards latestReading={activeLatest} alerts={alerts} />

      {/* 🔹 Gauges en tiempo real */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(activeLatest).map(([deviceKey, reading]) => (
          <div key={`gauges-${deviceKey}`} className="space-y-2">
            <GaugeChart
              value={reading.voltage}
              maxValue={250}
              title={`Voltaje - ${deviceKey}`}
              unit="V"
              color="#3b82f6"
            />
            <GaugeChart
              value={reading.current}
              maxValue={20}
              title={`Corriente - ${deviceKey}`}
              unit="A"
              color="#10b981"
            />
          </div>
        ))}
      </div>

      {/* 🔹 Gráficos comparativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MultiDeviceChart
          latestReadings={activeLatest}
          dataKey="power"
          title="Potencia"
          unit="W"
          color="#f59e0b"
        />
        <MultiDeviceChart
          latestReadings={activeLatest}
          dataKey="temperature"
          title="Temperatura"
          unit="°C"
          color="#ef4444"
        />
      </div>

      {/* 🔹 Tendencias en tiempo real */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {Object.entries(activeReadings).map(([deviceKey, deviceReadings]) => (
          <div key={`charts-${deviceKey}`} className="space-y-4">
            <RealTimeChart
              readings={deviceReadings}
              dataKey="power"
              title="Potencia"
              color="#f59e0b"
              unit="W"
              deviceId={deviceKey}
            />
            <RealTimeChart
              readings={deviceReadings}
              dataKey="voltage"
              title="Voltaje"
              color="#3b82f6"
              unit="V"
              deviceId={deviceKey}
            />
          </div>
        ))}
      </div>

      {/* 🔹 Estado actual y alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resumen textual */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Estado actual</h2>
          {Object.entries(activeLatest).map(([deviceKey, reading]) => (
            <div key={deviceKey} className="mb-2">
              <p className="font-medium">{deviceKey}</p>
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
          <h2 className="text-lg font-semibold mb-2">
            Alertas activas ({unreadCount})
          </h2>
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
