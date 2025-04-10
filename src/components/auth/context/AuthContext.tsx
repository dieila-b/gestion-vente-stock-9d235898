
import { createContext } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isSubmitting: boolean;
  isDevelopmentMode: boolean;
  testingMode: boolean;
  enableTestingMode: () => void;
  disableTestingMode: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
