// src/components/devices/DeviceList.tsx
import { useEffect, useState } from "react"
import { Plus, Search, Filter } from "lucide-react"
import { useDevice } from "@/hooks/useDevices"
import { useReadings } from "@/hooks/useReadings"
import { DeviceCard } from "./DeviceCard"
import { DeviceConfig } from "./DeviceConfig"
import { Button } from "@/components/ui/button"
import { Input } from "../ui/input"
import { Device, DeviceStatus } from "@/services/types"

export const DeviceList = () => {
  const { devices, loading, error, fetchDevices, createNewDevice, updateExistingDevice, removeDevice } = useDevice()
  const { latestReading, subscribeToDevice } = useReadings()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "ALL">("ALL")
  const [showConfig, setShowConfig] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  useEffect(() => {
    fetchDevices()
  }, [])

  useEffect(() => {
    // Suscribirse a lecturas de todos los dispositivos
    devices.forEach(device => {
      subscribeToDevice(device.id || "")
    })
  }, [devices, subscribeToDevice])

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.location || " ".toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || device.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateDevice = () => {
    setSelectedDevice(null)
    setShowConfig(true)
  }

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device)
    setShowConfig(true)
  }

  const handleSaveDevice = async (deviceData: Partial<Device>) => {
    try {
      if (selectedDevice && selectedDevice.id) {
        // Merge existing device data with new data for update
        const updatedDevice: Device = {
          ...selectedDevice,
          ...deviceData
        }
        await updateExistingDevice(selectedDevice.id, updatedDevice)
      } else {
        await createNewDevice(deviceData as Device)
      }
      setShowConfig(false)
      fetchDevices()
    } catch (error) {
      console.error('Error saving device:', error)
    }
  }

  const handleDeleteDevice = async (deviceId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este dispositivo?')) {
      try {
        await removeDevice(deviceId)
      } catch (error) {
        console.error('Error deleting device:', error)
      }
    }
  }

  if (loading && devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dispositivos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error al cargar dispositivos</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <Button 
          onClick={fetchDevices} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispositivos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y monitorea tus dispositivos de energía
          </p>
        </div>
        <Button onClick={handleCreateDevice} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Dispositivo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DeviceStatus | "ALL")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="ALL">Todos los estados</option>
            <option value={DeviceStatus.ACTIVE}>Activo</option>
            <option value={DeviceStatus.INACTIVE}>Inactivo</option>
            <option value={DeviceStatus.MAINTENANCE}>Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">
            Activos: {devices.filter(d => d.status === DeviceStatus.ACTIVE).length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm text-gray-600">
            Inactivos: {devices.filter(d => d.status === DeviceStatus.INACTIVE).length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-sm text-gray-600">
            Mantenimiento: {devices.filter(d => d.status === DeviceStatus.MAINTENANCE).length}
          </span>
        </div>
      </div>

      {/* Device Grid */}
      {filteredDevices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== "ALL" ? "No se encontraron dispositivos" : "No hay dispositivos"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "ALL" 
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza agregando tu primer dispositivo IoT"
            }
          </p>
          {(!searchTerm && statusFilter === "ALL") && (
            <Button onClick={handleCreateDevice} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Dispositivo
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              reading={latestReading[device.id || ""]}
              onEdit={() => handleEditDevice(device)}
              onDelete={() => handleDeleteDevice(device.id || "")}
            />
          ))}
        </div>
      )}

      {/* Device Configuration Modal */}
      {showConfig && (
        <DeviceConfig
          device={selectedDevice}
          isOpen={showConfig}
          onClose={() => setShowConfig(false)}
          onSave={handleSaveDevice}
        />
      )}
    </div>
  )
}