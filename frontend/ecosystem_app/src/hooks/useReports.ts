// src/hooks/useReports.ts
import { useState } from "react"
import {
  getDailyReport,
  getAnomalyReport,
  getDeviceKpis,
  exportToCsv,
} from "../services/api"
import type { DailyReport, AnomalyReport, DeviceKpis } from "../services/types"

export function useReports() {
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null)
  const [anomalyReport, setAnomalyReport] = useState<AnomalyReport | null>(null)
  const [kpis, setKpis] = useState<DeviceKpis | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateDailyReport = async (deviceId: string, date: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDailyReport(deviceId, date)
      setDailyReport(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener el reporte diario"
      )
    } finally {
      setLoading(false)
    }
  }

  const generateAnomalyReport = async (
    from: string,
    to: string,
    deviceId: string
  ) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAnomalyReport(deviceId, from, to)
      setAnomalyReport(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener el reporte de anomalías"
      )
    } finally {
      setLoading(false)
    }
  }

  const getKpis = async (deviceId: string, from: string, to: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDeviceKpis(deviceId, from, to)
      setKpis(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener los KPIs"
      )
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = async (deviceId: string, from: string, to: string) => {
    setLoading(true)
    setError(null)
    try {
      await exportToCsv(deviceId, from, to)
      // Aquí podrías usar una notificación como toast("Exportado con éxito")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al exportar CSV"
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    dailyReport,
    anomalyReport,
    kpis,
    loading,
    error,
    generateDailyReport,
    generateAnomalyReport,
    getKpis,
    exportCsv,
  }
}
