import {
  createContext,
  useContext,
} from "react";

import type { User } from "@/types";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  stationId: string | null;
  login: (token: string, user: User, stationId: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
