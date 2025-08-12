// src/hooks/useAlerts.ts
import { useState } from "react"
import { AlertNotification } from "../services/types"

// Hook para gestionar alertas
export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertNotification[]>([])
  const [alertHistory, setAlertHistory] = useState<AlertNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Agregar una alerta nueva
  const addAlert = (alert: AlertNotification) => {
    setAlerts((prev) => [alert, ...prev])
    setAlertHistory((prev) => [alert, ...prev])
    setUnreadCount((prev) => prev + 1)
  }

  // Marcar una alerta como leída
  const markAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.deviceId === alertId ? { ...alert, read: true } : alert
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  // Remover una alerta activa
  const clearAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.deviceId !== alertId))
  }

  // Limpiar todas las alertas activas
  const clearAll = () => {
    setAlerts([])
    setUnreadCount(0)
  }

  // Función para simular alertas (puedes reemplazar esto con llamadas a tu API)
  const simulateAlert = (deviceId: string, type: string, message: string) => {
    const newAlert: AlertNotification = {
      deviceId,
      type,
      message,
      data: { deviceId, type },
      timestamp: new Date().toISOString(),
      read: false,
    }
    addAlert(newAlert)
  }

  return {
    alerts,
    alertHistory,
    unreadCount,
    addAlert,
    markAsRead,
    clearAlert,
    clearAll,
    simulateAlert, // Nueva función para testing
  }
}
