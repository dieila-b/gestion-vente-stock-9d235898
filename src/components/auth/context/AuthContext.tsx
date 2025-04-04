
import { createContext } from "react";

export type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  logout: () => Promise<void>;
  isSubmitting?: boolean;
  userRole?: string | null;
};

export const AuthContext = createContext<AuthContextType | null>(null);
