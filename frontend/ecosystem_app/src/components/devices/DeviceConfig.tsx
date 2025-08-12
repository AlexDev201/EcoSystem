// src/components/devices/DeviceConfig.tsx
import { useState, useEffect } from "react"
import { X, Save, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "../ui/input"
import { Device, DeviceStatus } from "@/services/types"

interface DeviceConfigProps {
  device: Device | null
  isOpen: boolean
  onClose: () => void
  onSave: (deviceData: Partial<Device>) => void
}

const deviceTypes = [
  "Medidor Inteligente",
  "Sensor de Corriente",
  "Monitor de Voltaje",
  "Termostato IoT",
  "Panel Solar",
  "Inversor",
  "Batería",
  "Otro"
]

export const DeviceConfig = ({ device, isOpen, onClose, onSave }: DeviceConfigProps) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    status: DeviceStatus.ACTIVE,
    ubidotsLabel: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || "",
        type: device.type || "",
        location: device.location || "",
        status: device.status || DeviceStatus.ACTIVE,
        ubidotsLabel: device.ubidotsLabel || ""
      })
    } else {
      setFormData({
        name: "",
        type: "",
        location: "",
        status: DeviceStatus.ACTIVE,
        ubidotsLabel: ""
      })
    }
    setErrors({})
  }, [device, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    } else if (formData.name.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres"
    }

    if (!formData.type.trim()) {
      newErrors.type = "El tipo de dispositivo es requerido"
    }

    if (!formData.location.trim()) {
      newErrors.location = "La ubicación es requerida"
    }

    if (!formData.ubidotsLabel.trim()) {
      newErrors.ubidotsLabel = "La etiqueta de Ubidots es requerida"
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.ubidotsLabel)) {
      newErrors.ubidotsLabel = "Solo se permiten letras, números, guiones y guiones bajos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const deviceData = {
        ...formData,
        // No enviamos ID para nuevos dispositivos, el backend lo genera automáticamente
        ...(device?.id && { id: device.id })
      }
      await onSave(deviceData)
    } catch (error) {
      console.error('Error saving device:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {device ? "Editar Dispositivo" : "Nuevo Dispositivo"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Dispositivo *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Medidor Principal"
              className={errors.name ? "border-red-300 focus:border-red-500" : ""}
            />
            {errors.name && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Dispositivo *
            </label>
            <select
              value={formData.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange("type", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.type ? "border-red-300 focus:border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Selecciona un tipo</option>
              {deviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.type}</span>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación *
            </label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("location", e.target.value)}
              placeholder="Ej: Edificio A - Planta 1"
              className={errors.location ? "border-red-300 focus:border-red-500" : ""}
            />
            {errors.location && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.location}</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange("status", e.target.value as DeviceStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={DeviceStatus.ACTIVE}>Activo</option>
              <option value={DeviceStatus.INACTIVE}>Inactivo</option>
              <option value={DeviceStatus.MAINTENANCE}>Mantenimiento</option>
            </select>
          </div>

          {/* Ubidots Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Etiqueta Ubidots *
            </label>
            <Input
              type="text"
              value={formData.ubidotsLabel}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("ubidotsLabel", e.target.value)}
              placeholder="Ej: sensor-001"
              className={errors.ubidotsLabel ? "border-red-300 focus:border-red-500" : ""}
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo letras, números, guiones y guiones bajos
            </p>
            {errors.ubidotsLabel && (
              <div className="mt-1 flex items-center text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>{errors.ubidotsLabel}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}