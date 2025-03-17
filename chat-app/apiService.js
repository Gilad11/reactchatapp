import axios from "axios";
const JWT_SECRET_KEY = "YourSuperLongSecretKeyWithMoreThan32Chars";
const jwtSecret = new TextEncoder().encode(JWT_SECRET_KEY);

const API_BASE_URL = "http://localhost:5266"; // Replace with your .NET server URL
const AuthController = axios.create({
  baseURL: "http://localhost:5266", // Replace with your .NET server URL
});
//Authorization
AuthController.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Retrieve token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Add token to request headers
  }
  return config; // Return the modified config
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
        headers: {
          "Content-Type": "application/json",
        },
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
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding user:", error);
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

// ChatsController Functions
const MessageController = {
  sendMessage: async (message) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/message`,
        message,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding chat:", error);
    }
  },

  // Add other group chat-related methods here...
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
  addMessage: async (content, sender, reciver) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/message/${content}/${sender}/${reciver}`
      );

      console.log("✅ Axios Success:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Axios Error:", error.response?.data || error.message);
      throw error;
    }
  },
};

// Export all controllers in a single object
export { UsersController, MessageController, AuthController };
