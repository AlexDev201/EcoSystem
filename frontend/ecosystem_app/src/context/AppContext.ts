import { Readings, Device, AlertNotification } from "../services/types";

export interface AppContextType {
    devices: Device[];
    alerts: AlertNotification[];
    readings: Map<string, Readings[]>;
    conectionStatus : 'connected' | 'disconnected';
}
