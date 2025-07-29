import axios from 'axios';
import type { Device } from './types';
import type {Anomaly} from './types';
//Devices API Service
// This service provides functions to interact with the devices API.

export function getDevices(): Promise<Device>{
    return axios.get('http://localhost8000/api/devices')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching devices:', error);
            throw error;
        });
}

export function getDeviceById(deviceId: string): Promise<Device> {
    return axios.get(`http://localhost:8000/api/devices/${deviceId}`)
        .then(response => response.data)
        .catch(error => {
            console.error(`Error fetching device with ID ${deviceId}:`, error);
            throw error;
        });
}

export function createDevice(device: Device): Promise<Device> {
    return axios.post('http://localhost:8000/api/devices', device)
        .then(response => response.data)
        .catch(error => {
            console.error('Error creating device:', error);
            throw error;
        });
}

export function updateDevice(deviceId: string, device: Device): Promise<Device> {
    return axios.put(`http://localhost:8000/api/devices/${deviceId}`, device)
        .then(response => response.data)
        .catch(error => {
            console.error(`Error updating device with ID ${deviceId}:`, error);
            throw error;
        });
}

export function deleteDevice(deviceId: string): Promise<void> {
    return axios.delete(`http://localhost:8000/api/devices/${deviceId}`)
        .then(() => {})
        .catch(error => {
            console.error(`Error deleting device with ID ${deviceId}:`, error);
            throw error;
        });
}

//Anomalies Reports Implementation
export function getDailyReport(deviceId: string, date: string): Promise<Anomaly[]> {
    return axios.get(`http://localhost:8000/api/reports/anomalies/daily/{${deviceId}}`, {
        params: { date }
    })
        .then(response => response.data)
        .catch(error => {
            console.error(`Error fetching daily report for device ${deviceId} on ${date}:`, error);
            throw error;
        });
}

export function getAnomalyReport(deviceId: string, startDate: string, endDate: string): Promise<Anomaly[]> {
    return axios.get(`http://localhost:8000/api/reports/anomalies/{${deviceId}}`, {
        params: {from: startDate,to: endDate }
    })
        .then(response => response.data)
        .catch(error => {
            console.error(`Error fetching anomaly report for device ${deviceId} from ${startDate} to ${endDate}:`, error);
            throw error;
        });
}

export function getDeviceKpis(deviceId :string, startDate: string, endDate: string): Promise<any> {
    return axios.get(`http://localhost:8000/api/reports/kpis/{${deviceId}}`, {
        params: { from: startDate, to: endDate }
    })
        .then(response => response.data)
        .catch(error => {
            console.error(`Error fetching KPIs for device ${deviceId} from ${startDate} to ${endDate}:`, error);
            throw error;
        });
}

export function exportToCsv(deviceId: string, startDate: string, endDate: string): Promise<string> {
    return axios.get(`http://localhost:8000/api/reports/export/csv/`, {
        params: { deviceId, from: startDate, to : endDate },
        responseType: 'blob'
    })
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${deviceId}_${startDate}_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            return 'Export successful';
        })
        .catch(error => {
            console.error(`Error exporting report for device ${deviceId} from ${startDate} to ${endDate}:`, error);
            throw error;
        });
}