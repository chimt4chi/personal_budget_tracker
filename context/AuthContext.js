"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 AuthContext: Loading auth state...");

    // Load saved auth state on startup
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    console.log("🔍 Found savedToken:", !!savedToken);
    console.log("🔍 Found savedUser:", savedUser);

    if (savedToken && savedUser && savedUser !== "undefined") {
      setToken(savedToken);
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("🔍 Parsed user:", parsedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Failed to parse saved user:", err);
        localStorage.removeItem("user");
      }
    }
    console.log("🔍 AuthContext: Finished loading");
    setLoading(false);
  }, []);

  const login = (userData, tokenData) => {
    console.log("🔍 Login called with:", userData);
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
