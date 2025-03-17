import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../axiosInstance"; // Ensure axios is configured with your baseURL

const AuthContext = createContext();

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return authContext;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveToken = (token) => {
    setToken(token);
    sessionStorage.setItem("token", token);
  };

  useEffect(() => {
    const savedToken = sessionStorage.getItem("token"); // Load token from storage
    if (savedToken) {
      setToken(savedToken); // Set token in state
    }
    setLoading(false); // Mark loading as complete
  }, []);

  useEffect(() => {
    const authInterceptor = axiosInstance.interceptors.request.use((config) => {
      config.headers.Authorization = token
        ? `Bearer ${token}`
        : config.headers.Authorization;
      return config;
    });
    return () => {
      axiosInstance.interceptors.request.eject(authInterceptor); // Cleanup on unmount
    };
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, setToken: saveToken }}>
      {children}
    </AuthContext.Provider>
  );
};
