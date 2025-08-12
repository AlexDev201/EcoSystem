// src/components/devices/DeviceCard.tsx
import { Edit, Trash2, Activity, MapPin, Zap, Thermometer, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Device, DeviceStatus, Reading } from "@/services/types"

interface DeviceCardProps {
  device: Device
  reading?: Reading
  onEdit: () => void
  onDelete: () => void
}

export const DeviceCard = ({ device, reading, onEdit, onDelete }: DeviceCardProps) => {
  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.ACTIVE:
        return "bg-green-100 text-green-800 border-green-200"
      case DeviceStatus.INACTIVE:
        return "bg-red-100 text-red-800 border-red-200"
      case DeviceStatus.MAINTENANCE:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.ACTIVE:
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      case DeviceStatus.INACTIVE:
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      case DeviceStatus.MAINTENANCE:
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
            {getStatusIcon(device.status ?? DeviceStatus.INACTIVE)}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span>{device.location}</span>
          </div>
          <Badge className={`text-xs ${getStatusColor(device.status ?? DeviceStatus.INACTIVE)}`}>
            {device.status === DeviceStatus.ACTIVE && "Activo"}
            {device.status === DeviceStatus.INACTIVE && "Inactivo"}
            {device.status === DeviceStatus.MAINTENANCE && "Mantenimiento"}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Device Type */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Activity className="h-3 w-3 mr-1" />
          {device.type}
        </span>
      </div>

      {/* Real-time Readings */}
      {reading ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Última lectura:</span>
            <span className="text-xs text-gray-500">
              {formatTimestamp(reading.timestamp)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-600">Voltaje</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {reading.voltage.toFixed(1)} V
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-gray-600">Corriente</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {reading.current.toFixed(2)} A
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-gray-600">Potencia</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {reading.power.toFixed(0)} W
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className="h-4 w-4 text-red-600" />
                <span className="text-xs font-medium text-gray-600">Temperatura</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {reading.temperature.toFixed(1)} °C
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Sin datos de lectura</p>
          <p className="text-xs text-gray-500 mt-1">
            {device.status === DeviceStatus.INACTIVE 
              ? "Dispositivo inactivo" 
              : "Esperando datos..."}
          </p>
        </div>
      )}

      {/* Ubidots Label */}
      {device.ubidotsLabel && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Ubidots:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              {device.ubidotsLabel}
            </code>
          </div>
        </div>
      )}
    </div>
  )
}