"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Create the context (the mailbox)
const AuthContext = createContext();

// Create the provider component (the mailman)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved user when app starts
    const savedUser = localStorage.getItem("dev-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (email, password, displayName) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("dev-user", JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: "Registration failed" };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("dev-user", JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("dev-user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Create the custom hook (the mailbox key)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
