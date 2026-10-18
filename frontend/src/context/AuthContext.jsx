import { useState } from "react";
import { loginUser } from "../services/authService";
import { AuthContext } from "./authContextObject";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("campusconnect_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("campusconnect_token") || null;
  });

  const login = async (loginData) => {
    const data = await loginUser(loginData);

    localStorage.setItem("campusconnect_token", data.token);
    localStorage.setItem(
      "campusconnect_user",
      JSON.stringify(data.user)
    );

    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("campusconnect_token");
    localStorage.removeItem("campusconnect_user");

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};