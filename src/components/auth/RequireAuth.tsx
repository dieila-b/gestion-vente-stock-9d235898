
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // Redirect if on login page
  useEffect(() => {
    console.log("RequireAuth: Authentication bypass enabled - granting all access");
    
    // If on login page, redirect to dashboard
    if (window.location.pathname === "/login") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Always grant full access without verification
  return <>{children}</>;
}
