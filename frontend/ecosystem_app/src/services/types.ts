//Interfaz del Device
export interface Device{
    id?: string;
    name: string;
    type: string;
    location?: string;
    status?: DeviceStatus;
    ubidotsLabel?: string;
    minVoltage?: number;
    maxVoltage?: number;
    maxCurrent?: number;
    maxTemperature?: number;
    createdAt?: string;
    updatedAt?: string;
}

export enum DeviceStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    MAINTENANCE = 'MAINTENANCE'
}

//Interfaz del Reading

export interface Reading{
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
  read: boolean;
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


export interface DailyReport {
  deviceId: string;
  date: string; // LocalDate as string
  totalConsumption: number;
  avgVoltage: number;
  avgCurrent: number;
  anomalyCount: number;
}

export interface AnomalyReport {
  anomalies: Anomaly[];
  anomaliesByType: Record<string, number>;
  reportPeriod: string; 
  totalCount: number;
}

export interface DeviceKpis {
  deviceId: string;
  currentPower: number;
  avgPower: number;
  efficiency: number; 
  uptimeHours: number;
  status: string;
}