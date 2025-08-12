// src/components/reports/ReportDashboard.tsx
import { useState, useEffect } from "react"
import { Calendar, TrendingUp, Zap, AlertTriangle, Activity } from "lucide-react"
import { useReports } from "@/hooks/useReports"
import { useDevice } from "@/hooks/useDevices"
import { ExportButton } from "./ExportButton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const ReportDashboard = () => {
  const { devices, fetchDevices } = useDevice()
  const {
    dailyReport,
    anomalyReport,
    kpis,
    loading,
    error,
    generateDailyReport,
    generateAnomalyReport,
    getKpis
  } = useReports()

  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    to: new Date().toISOString().split('T')[0] // today
  })
  const [reportType, setReportType] = useState<"daily" | "anomaly" | "kpis">("daily")

  useEffect(() => {
    fetchDevices()
  }, [])

  useEffect(() => {
    if (devices.length > 0 && !selectedDevice && devices[0].id) {
      setSelectedDevice(devices[0].id)
    }
  }, [devices, selectedDevice])

  const handleGenerateReport = async () => {
    if (!selectedDevice) return

    try {
      switch (reportType) {
        case "daily":
          await generateDailyReport(selectedDevice, dateRange.to)
          break
        case "anomaly":
          await generateAnomalyReport(dateRange.from, dateRange.to, selectedDevice)
          break
        case "kpis":
          await getKpis(selectedDevice, dateRange.from, dateRange.to)
          break
      }
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600 mt-1">
            Genera reportes detallados sobre el consumo energético
          </p>
        </div>
        <ExportButton 
          data={dailyReport || anomalyReport || kpis}
          filename={`reporte_${reportType}_${selectedDevice}_${dateRange.to}`}
          disabled={!dailyReport && !anomalyReport && !kpis}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuración del Reporte</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Device Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dispositivo
            </label>
            <select
              value={selectedDevice}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDevice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Seleccionar dispositivo</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} - {device.location}
                </option>
              ))}
            </select>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select
              value={reportType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReportType(e.target.value as "daily" | "anomaly" | "kpis")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="daily">Reporte Diario</option>
              <option value="anomaly">Análisis de Anomalías</option>
              <option value="kpis">Indicadores KPI</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Desde
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setDateRange(prev => ({ ...prev, from: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setDateRange(prev => ({ ...prev, to: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <Button 
            onClick={handleGenerateReport}
            disabled={!selectedDevice || loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            {loading ? "Generando..." : "Generar Reporte"}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-red-800 font-medium">Error al generar reporte</h3>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Daily Report */}
      {reportType === "daily" && dailyReport && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Reporte Diario</h2>
            <Badge variant="outline">{formatDate(dailyReport.date)}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Consumo Total</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatNumber(dailyReport.totalConsumption)} kWh
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Voltaje Promedio</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatNumber(dailyReport.avgVoltage, 1)} V
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Corriente Promedio</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {formatNumber(dailyReport.avgCurrent, 2)} A
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Anomalías</span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {dailyReport.anomalyCount}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Report */}
      {reportType === "anomaly" && anomalyReport && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Análisis de Anomalías</h2>
            <Badge variant="outline">{anomalyReport.reportPeriod}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Summary */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Resumen</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de anomalías:</span>
                  <span className="font-semibold">{anomalyReport.totalCount}</span>
                </div>
                {Object.entries(anomalyReport.anomaliesByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-gray-600">{type}:</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Anomalies */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Anomalías Recientes</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {anomalyReport.anomalies.slice(0, 10).map((anomaly) => (
                  <div key={anomaly.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {anomaly.anomalyType}
                        </span>
                        <p className="text-xs text-gray-600">
                          Valor: {formatNumber(anomaly.value)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(anomaly.detectedAt).toLocaleTimeString('es-ES')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Report */}
      {reportType === "kpis" && kpis && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Indicadores KPI</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Potencia Actual</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatNumber(kpis.currentPower, 0)} W
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Potencia Promedio</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatNumber(kpis.avgPower, 0)} W
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Eficiencia</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {formatNumber(kpis.efficiency, 1)}%
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Tiempo Activo</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {formatNumber(kpis.uptimeHours, 1)} h
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Estado</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                <Badge 
                  className={kpis.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {kpis.status === "ACTIVE" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !dailyReport && !anomalyReport && !kpis && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay reportes generados
          </h3>
          <p className="text-gray-600 mb-4">
            Selecciona un dispositivo y genera tu primer reporte
          </p>
          <Button 
            onClick={handleGenerateReport}
            disabled={!selectedDevice}
            variant="outline"
          >
            Generar Reporte
          </Button>
        </div>
      )}
    </div>
  )
}