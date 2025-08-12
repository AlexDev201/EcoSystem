// src/hooks/useDevice.ts
import { useState, useEffect } from "react";
import {
  getDevices,
  getDeviceById,
  createDevice,
  updateDevice,
  deleteDevice,
} from "../services/api"

import { Device } from "../services/types";

export function useDevice() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los dispositivos
  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDevices();
      setDevices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Obtener un dispositivo por ID
  const fetchDeviceById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDeviceById(id);
      setSelectedDevice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo dispositivo
  const createNewDevice = async (device: Device) => {
    setLoading(true);
    setError(null);
    try {
      const newDevice = await createDevice(device);
      setDevices((prev) => [...prev, newDevice]);
      return newDevice;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un dispositivo
  const updateExistingDevice = async (id: string, device: Device) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateDevice(id, device);
      setDevices((prev) =>
        prev.map((d) => (d.id === id ? updated : d))
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un dispositivo
  const removeDevice = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDevice(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar dispositivos al montar (opcional)
  useEffect(() => {
    fetchDevices();
  }, []);

  return {
    devices,
    selectedDevice,
    loading,
    error,
    fetchDevices,
    fetchDeviceById,
    createNewDevice,
    updateExistingDevice,
    removeDevice,
  };
}
