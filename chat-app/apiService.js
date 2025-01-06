import axios from "axios";

const API_BASE_URL = "http://localhost:5266"; // Replace with your .NET server URL

// Fetch data from the server
export const fetchData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Chat`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Rethrow the error for handling in the component
  }
};


// Add more API calls as needed, e.g., POST, PUT, DELETE
export const postData = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/Chat`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};
