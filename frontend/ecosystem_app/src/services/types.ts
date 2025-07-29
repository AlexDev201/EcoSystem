//Interfaz deL Device
export interface Device{
    id : string;
    name: string;
    type:string;
    location: string;
    status:DeviceStatus;
    ubidotosLabel: string;
}

export enum DeviceStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    MAINTENANCE = 'MAINTENANCE'
}

//Interfaz del Reading

export interface Readings{
    deviceId : string;
    voltage : number;
    current: number;
    power: number;
    temperature: number;
    timestamp: string; 
}

// Interfaz de Anomaly 
export interface Anomaly {
  id: string;
  deviceId: string;
  anomalyType: string;
  value: number;
  detectedAt: string;
}

// Mensaje del WebSocket
export interface AlertNotification {
  deviceId: string;
  type: string;
  message: string;
  data: any;
  timestamp: string;
}

//Api Response Type

export interface ApiResponse<T>{
  data: T
  success: string;
  message?:string;
}

//WebSocketTypes


export interface WebSocketMessage{
  type: 'energy_data' | 'connection' | 'subscribed' | 'alert'
  deviceId?: string;
  data?: any;
  timestamp?: string;
}

type WebSocketEventType = 'energy_data' | 'alert' | 'connection';