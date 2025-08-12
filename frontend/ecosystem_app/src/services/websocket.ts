import { Client, IMessage } from '@stomp/stompjs';

const SOCKET_URL = 'ws://localhost:8080/ws-alerts';

class WebSocketService {
  public stompClient: Client;
  private connectionSubscribers: (() => void)[] = [];
  private isConnecting: boolean = false;
  private isConnected: boolean = false;

  constructor() {
    this.stompClient = new Client({
      brokerURL: SOCKET_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('STOMP connected');
        this.isConnecting = false;
        this.isConnected = true;
        this.connectionSubscribers.forEach(cb => cb());
        this.connectionSubscribers = [];
      },
      onDisconnect: () => {
        console.log('STOMP disconnected');
        this.isConnected = false;
        this.isConnecting = false;
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        this.isConnecting = false;
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        this.isConnecting = false;
      },
      onWebSocketClose: (event) => {
        console.log('WebSocket closed:', event);
        this.isConnected = false;
        this.isConnecting = false;
      }
    });
    
    // No conectar automáticamente en el constructor
  }

  private runOnConnected(callback: () => void): void {
    if (this.isConnected && this.stompClient.active) {
      callback();
    } else {
      this.connectionSubscribers.push(callback);
      if (!this.isConnecting && !this.isConnected) {
        this.connect();
      }
    }
  }

  public connect(): void {
    if (!this.stompClient.active && !this.isConnecting) {
      console.log('Attempting to connect WebSocket...');
      this.isConnecting = true;
      try {
        this.stompClient.activate();
      } catch (error) {
        console.error('Error activating STOMP client:', error);
        this.isConnecting = false;
      }
    }
  }

  public disconnect(): void {
    if (this.stompClient.active || this.isConnecting) {
      console.log('Disconnecting WebSocket...');
      this.isConnecting = false;
      this.isConnected = false;
      this.connectionSubscribers = []; // Limpiamos callbacks pendientes
      this.stompClient.deactivate();
    }
  }

  public subscribe<T>(topic: string, callback: (message: T) => void): () => void {
    let unsubscribe = () => {};
    
    this.runOnConnected(() => {
      try {
        const subscription = this.stompClient.subscribe(topic, (message: IMessage) => {
          try {
            const parsedBody = JSON.parse(message.body);
            callback(parsedBody);
          } catch (e) {
            console.error(`Error parsing message on topic ${topic}`, e);
          }
        });
        unsubscribe = () => {
          try {
            subscription.unsubscribe();
          } catch (error) {
            console.error('Error unsubscribing:', error);
          }
        };
      } catch (error) {
        console.error(`Error subscribing to topic ${topic}:`, error);
      }
    });
    
    return unsubscribe;
  }

  // Método para verificar el estado de la conexión
  public isActiveConnection(): boolean {
    return this.isConnected && this.stompClient.active;
  }

  // Método para obtener el estado actual
  public getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.isConnected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }
}

export const webSocketService = new WebSocketService();