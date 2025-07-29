import { useCallback, useState } from "react"
import type { AlertNotification, WebSocketMessage } from "../services/types"


export const useWebSocket = (url: string) => {
  // Estados internos de la conexión WebSocket
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [alerts, setAlerts] = useState<AlertNotification[]>([])

  // Conectar al WebSocket
  const connect = useCallback(() => {
    
    const ws = new WebSocket(url)
    
    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onmessage = (event) => handleMessage(event)

    const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data)

        switch (data.type) {
         case "energy_data":
         setMessages(prev => [...prev, data])
            break

        case "anomaly_alert":
        case "prediction_alert":
        case "system":
        setAlerts(prev => [...prev, data])
        break

        default:
        console.warn("Unknown WebSocket message type:", data.type)
  }
}   
    setSocket(ws)
  }, [url])

  // Métodos para manejar mensajes entrantes
  const subscribe = (deviceId: string) => {
    socket?.send(JSON.stringify({type: 'subscribe', deviceId}))
  }

  //Cerrar la conexión WebSocket
  const disconnect = () => {
    socket?.close()
  }

  // Return
  return { isConnected, messages, alerts, connect, subscribe, disconnect }
}


