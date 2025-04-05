
import { useState } from "react";
import { toast } from "sonner";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (email: string, password: string) => {
    console.log("No authentication mode: Automatic login");
    setIsAuthenticated(true);
    toast.success("Automatic login");
    return { success: true };
  };
  
  const logout = async () => {
    console.log("No authentication mode: Simulated logout");
    toast.success("You are logged out");
  };

  return { login, logout, isSubmitting: false };
}
