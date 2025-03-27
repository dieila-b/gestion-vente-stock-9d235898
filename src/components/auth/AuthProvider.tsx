
import { createContext, useContext, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean; // Add the loading property to the type
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // For development, default to true
  const [loading, setLoading] = useState(false); // Add loading state

  const login = () => {
    setLoading(true);
    // Simulate authentication delay
    setTimeout(() => {
      setIsAuthenticated(true);
      setLoading(false);
    }, 500);
  };
  
  const logout = () => {
    setLoading(true);
    // Simulate authentication delay
    setTimeout(() => {
      setIsAuthenticated(false);
      setLoading(false);
    }, 500);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
