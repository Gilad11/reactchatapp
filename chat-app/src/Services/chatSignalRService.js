import * as signalR from "@microsoft/signalr";

class ChatSignalRService {
  constructor() {
    this.connection = null;
    this.hubUrl = "http://localhost:5266/chatHub";
    // Callback stubs for different events
    this.messageCallback = null;
    this.gameCallback = null;
  }

  async startConnection(token) {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

      // Set up message handler
      this.connection.on("receivemessage", (senderId, content) => {
        if (this.messageCallback) {
          this.messageCallback(senderId, content);
        }
      });
      
      // Set up game retrieval notification handler
      this.connection.on("ReceiveGame", (gameData) => {
        console.log("Received game data:", gameData);
        if (this.gameCallback) {
          this.gameCallback(gameData);
        }
      });

      await this.connection.start();
      console.log("✅ SignalR Connected");
      return true;
    } catch (error) {
      console.error("❌ SignalR Connection Error:", error);
      return false;
    }
  }

  // Register message callback
  onReceiveMessage(callback) {
    this.messageCallback = callback;
  }

  // Register game notification callback for receiving the game
  onReceiveGame(callback) {
    this.gameCallback = callback;
    console.log("Game callback registered");
  }

  onReceiveGame(callback){
    this.gameUpdateCallback = callback;
  }

  // Send message
  async sendMessage(senderId, receiverId, content) {
    try {
      if (this.connection?.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke("SendMessage", senderId, receiverId, content);
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ SignalR Send Error:", error);
      return false;
    }
  }

  // Disconnect
  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("SignalR disconnected");
      } catch (error) {
        console.error("SignalR disconnect error:", error);
      }
    }
  }
}

export default new ChatSignalRService();
