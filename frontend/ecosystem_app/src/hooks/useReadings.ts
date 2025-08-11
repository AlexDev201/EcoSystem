// src/hooks/useReadings.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { Reading } from '../services/types';
import { webSocketService } from '../services/websocket';

type ReadingsMap = Record<string, Reading[]>;
type LatestMap = Record<string, Reading>;

export function useReadings() {
  const [readings, setReadings] = useState<ReadingsMap>({});
  const [latestReading, setLatestReading] = useState<LatestMap>({});
  const subscriptions = useRef<Record<string, () => void>>({});

  // Asegurarse de que el cliente STOMP esté conectado
  useEffect(() => {
    webSocketService.connect();

    // Limpieza al desmontar el hook
    return () => {
      Object.values(subscriptions.current).forEach(unsubscribe => unsubscribe());
      subscriptions.current = {};
      // Opcional: desconectar si ningún otro componente lo usa
      // webSocketService.disconnect(); 
    };
  }, []);

  const subscribeToDevice = useCallback((deviceId: string) => {
    // Evitar doble suscripción
    if (subscriptions.current[deviceId]) {
      return;
    }

    const topic = `/topic/energy-data/${deviceId}`;
    
    const unsubscribe = webSocketService.subscribe<Reading>(topic, (newReading) => {
      if (newReading && newReading.deviceId) {
        setReadings((prev) => ({
          ...prev,
          [newReading.deviceId]: [...(prev[newReading.deviceId] || []), newReading].slice(-50), // Mantener solo las últimas 50 lecturas
        }));

        setLatestReading((prev) => ({
          ...prev,
          [newReading.deviceId]: newReading,
        }));
      }
    });

    // Guardar la función de desuscripción
    subscriptions.current[deviceId] = unsubscribe;
  }, []);

  const unsubscribeFromDevice = useCallback((deviceId: string) => {
    const unsubscribe = subscriptions.current[deviceId];
    if (unsubscribe) {
      unsubscribe();
      delete subscriptions.current[deviceId];
    }
  }, []);

  return {
    readings,
    latestReading,
    subscribeToDevice,
    unsubscribeFromDevice,
    isConnected: webSocketService.stompClient.active, // Exponer estado de conexión
  };
}