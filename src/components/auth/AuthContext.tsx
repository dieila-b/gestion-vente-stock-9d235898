
import { createContext } from "react";
import { User } from "@/types/user";

export type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;
