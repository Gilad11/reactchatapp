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
  // Call this endpoint to save/update the game
  saveGame: async (gameData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/game/savegame`, // Ensure your .NET API has a matching endpoint.
        gameData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("✅ Game saved:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error saving game:", error.response?.data || error.message);
    }
  },
  // Optionally: An endpoint to retrieve game data
  getGame: async (senderId, receiverId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/game/getGame/${senderId}/${receiverId}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error getting game:", error.response?.data || error.message);
    }
  },
  getGames: async (myId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/game/getGames/${myId}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error getting games:", error.response?.data || error.message);
    }
  }
};

// Export all controllers in a single object
export { UsersController, MessageController, AuthController, GameController };
