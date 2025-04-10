
import { AuthContext } from "./context/AuthContext";
import { useAuthProvider } from "./hooks/useAuthProvider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useAuthProvider();
  
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}
