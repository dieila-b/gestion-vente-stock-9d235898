
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirection immédiate vers le dashboard
    console.log("Index: Redirection vers /dashboard");
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Redirection vers le tableau de bord...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
