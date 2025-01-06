// src/services/websocketService.js
class WebSocketService {
  constructor() {
    this.ws = null;
    this.baseUrl = "ws://localhost:5000/ws"; // Update port as needed
  }

  connect() {
    this.ws = new WebSocket(this.baseUrl);

    this.ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Handle received message
      console.log("Received:", message);
    };

    this.ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      // Attempt to reconnect
      setTimeout(() => this.connect(), 3000);
    };
  }

  sendMessage(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

export default new WebSocketService();
