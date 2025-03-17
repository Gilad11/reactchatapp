import * as signalR from "@microsoft/signalr";

let hubConnection = null;

export const startConnection = async (userId) => {
    if (!userId) {
        console.error("User ID is required to start SignalR connection.");
        return;
    }

    hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`http://localhost:5266/chatHub?userId=${userId}`, {
            withCredentials: true,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    try {
        await hubConnection.start();
        console.log("✅ SignalR Connected as:", userId);
    } catch (err) {
        console.error("❌ Error connecting SignalR:", err);
        setTimeout(() => startConnection(userId), 5000); // Retry on failure
    }
};

export const getHubConnection = () => hubConnection;
