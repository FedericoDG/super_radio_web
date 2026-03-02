import {
  useState,
  useCallback,
  type ReactNode,
} from "react";

import type { User } from "@/types";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode; }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem("token")
  );

  const [stationId, setStationId] = useState<string | null>(() => {
    return localStorage.getItem("stationId");
  });

  const login = useCallback((token: string, userData: User, newStationId: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("stationId", newStationId);
    setUser(userData);
    setStationId(newStationId);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("stationId");
    setUser(null);
    setStationId(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, stationId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

