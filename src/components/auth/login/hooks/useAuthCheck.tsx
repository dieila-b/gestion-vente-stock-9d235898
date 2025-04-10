
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthCheck(isAuthenticated: boolean, loading: boolean) {
  const navigate = useNavigate();
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log("User already authenticated, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, isAuthenticated, loading]);
}
