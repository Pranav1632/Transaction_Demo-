import React, { createContext, useEffect, useState } from "react";
import { setAuthToken } from "../api/apiClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const token = localStorage.getItem("session_jwt");
    setAuthToken(token);
  }, []);

  const loginWithJwt = (jwt, userObj) => {
    localStorage.setItem("session_jwt", jwt);
    localStorage.setItem("user", JSON.stringify(userObj));
    setAuthToken(jwt);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem("session_jwt");
    localStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithJwt, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
