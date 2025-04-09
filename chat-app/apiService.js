import axios from "axios";
const JWT_SECRET_KEY = "YourSuperLongSecretKeyWithMoreThan32Chars";
const jwtSecret = new TextEncoder().encode(JWT_SECRET_KEY);

const API_BASE_URL = "http://localhost:5266"; // Replace with your .NET server URL
const AuthController = axios.create({
  baseURL: API_BASE_URL, // Replace with your .NET server URL
});

// Authorization interceptor
AuthController.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Retrieve token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Add token to request headers
  }
  return config;
});

// UsersController Functions
const UsersController = {
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  getUserById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  addUser: async (user) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users`, user, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding user:", error);
    }
  },
  editUser: async (user, id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/users/${id}`,
        user,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error editing user:", error);
    }
  },
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  },
};

// MessageController Functions
const MessageController = {
  sendMessage: async (message) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/message`, message, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Error sending chat message:", error);
    }
  },
  GetMessagesBetweenUsers: async (connectedUserId, otherUserId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/message/${connectedUserId}/${otherUserId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  },
  addMessage: async (content, sender, receiver) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/message/${content}/${sender}/${receiver}`
      );
      console.log("✅ Axios Success:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Axios Error:", error.response?.data || error.message);
      throw error;
    }
  },
};

const GameController = {
  // Modified saveGame method to handle game creation and joining
  saveGame: async (gameData) => {
    try {
      // Check if the game already exists or if it's a new game
      const response = await axios.get(
        `${API_BASE_URL}/api/game/getGame/${gameData.SenderId}/${gameData.ReceiverId}`
      );

      if (response.data) {
        // If the game already exists, just update the game state
        const updatedGame = await axios.post(
          `${API_BASE_URL}/api/game/savegame`, 
          gameData,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("✅ Game updated:", updatedGame.data);
        return updatedGame.data;
      } else {
        // If no existing game, create a new game
        const newGame = await axios.post(
          `${API_BASE_URL}/api/game/savegame`,
          gameData,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("✅ New game created:", newGame.data);
        return newGame.data;
      }
    } catch (error) {
      console.error("❌ Error saving game:", error.response?.data || error.message);
    }
  },
  
  // Optionally: Endpoint to retrieve a specific game
  getGame: async (senderId, receiverId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/game/getGame/${senderId}/${receiverId}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error getting game:", error.response?.data || error.message);
    }
  }
};


// Export all controllers in a single object
export { UsersController, MessageController, AuthController, GameController };
