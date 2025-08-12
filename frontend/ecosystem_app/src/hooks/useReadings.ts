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
  // mapa opcional para recordar deviceId original cuando nos suscriben por otra clave
  const subKeyToDeviceId = useRef<Record<string, string>>({});

  useEffect(() => {
    // Intentar conectar (idempotente si connect maneja reconexión internamente)
    try {
      webSocketService.connect();
    } catch (e) {
      console.warn('webSocketService.connect() falló:', e);
    }

    return () => {
      // limpiar suscripciones al desmontar
      Object.values(subscriptions.current).forEach(unsub => {
        try { unsub(); } catch (err) { console.warn('unsubscribe error', err); }
      });
      subscriptions.current = {};
      subKeyToDeviceId.current = {};
      // opcional: webSocketService.disconnect();
    };
  }, []);

  const subscribeToDevice = useCallback((subscriptionKey: string, deviceId?: string) => {
    if (!subscriptionKey) {
      console.warn('subscribeToDevice: subscriptionKey vacío', { deviceId });
      return;
    }
    if (subscriptions.current[subscriptionKey]) {
      // ya suscrito
      return;
    }

    const topic = `/topic/energy-data/${subscriptionKey}`;
    if (deviceId) subKeyToDeviceId.current[subscriptionKey] = deviceId;

    console.info('WS subscribing', { subscriptionKey, topic, deviceId });

    const unsubscribe = webSocketService.subscribe<Reading>(topic, (newReading) => {
      // DEBUG: mostrar lo que llega
      console.debug('WS incoming', {
        subscriptionKey,
        mappedDeviceId: subKeyToDeviceId.current[subscriptionKey],
        newReading
      });

      if (!newReading || typeof newReading !== 'object') {
        console.warn('WS payload inválido', { subscriptionKey, newReading });
        return;
      }

      // Construir conjunto de claves donde guardaremos la lectura
      const keys = new Set<string>();
      keys.add(subscriptionKey);
      if (deviceId) keys.add(deviceId);
      const payloadDeviceId = (newReading as any).deviceId;
      const ubidotsLabel = (newReading as any).ubidotsLabel;
      if (payloadDeviceId) keys.add(payloadDeviceId);
      if (ubidotsLabel) keys.add(ubidotsLabel);

      const keysArray = Array.from(keys);
      console.debug('WS storing under keys', { keys: keysArray });

      // Actualizar readings y latestReading en bloque (una única actualización por mapa)
      setReadings(prev => {
        const next = { ...prev };
        keysArray.forEach(key => {
          const arr = [...(next[key] || []), newReading].slice(-50); // keep last 50
          next[key] = arr;
        });
        return next;
      });

      setLatestReading(prev => {
        const next = { ...prev };
        keysArray.forEach(key => {
          next[key] = newReading;
        });
        return next;
      });
    });

    subscriptions.current[subscriptionKey] = unsubscribe;
  }, []);

  const unsubscribeFromDevice = useCallback((subscriptionKey: string) => {
    const unsubscribe = subscriptions.current[subscriptionKey];
    if (unsubscribe) {
      try { unsubscribe(); } catch (e) { console.warn('unsubscribe error', e); }
      delete subscriptions.current[subscriptionKey];
    }
    if (subKeyToDeviceId.current[subscriptionKey]) {
      delete subKeyToDeviceId.current[subscriptionKey];
    }
  }, []);

  return {
    readings,
    latestReading,
    subscribeToDevice,
    unsubscribeFromDevice,
    isConnected: Boolean(webSocketService?.stompClient?.active),
  };
}
