
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useInternalUsers } from "@/hooks/internal-users/use-internal-users";
import { InternalUsersHeader } from "@/components/internal-users/InternalUsersHeader";
import { InternalUserForm } from "@/components/internal-users/InternalUserForm";
import { InternalUsersTable } from "@/components/internal-users/InternalUsersTable";
import { LogIn } from "lucide-react";

const InternalUsers = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  const {
    users,
    isLoading,
    error,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedUser,
    setSelectedUser,
    activeTab,
    setActiveTab,
    securitySettings,
    setSecuritySettings,
    handleCreateUser,
    handleUpdateUser,
    handleDelete,
    handleResetPassword,
    handleDialogOpen,
    getRoleBadgeColor,
  } = useInternalUsers();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        if (!session) {
          console.log("User not authenticated");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Log error if any
  useEffect(() => {
    if (error) {
      console.error("Error in internal users page:", error);
      toast.error("Une erreur est survenue lors du chargement des utilisateurs");
    }
  }, [error]);

  // Afficher un message si l'authentification est en cours de vérification
  if (isAuthenticated === null) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Vérification de l'authentification...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Afficher un message si l'utilisateur n'est pas authentifié
  if (isAuthenticated === false) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center h-full">
          <Card className="p-8 max-w-md w-full">
            <div className="text-center space-y-6">
              <div className="mx-auto bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                <LogIn className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold">Accès non autorisé</h2>
              <p className="text-muted-foreground">
                Vous devez être connecté pour accéder à cette page.
              </p>
              <Button 
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Se connecter
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <InternalUsersHeader onAddClick={() => handleDialogOpen(null)} />

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
              </DialogTitle>
            </DialogHeader>
            
            <InternalUserForm
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedUser={selectedUser}
              securitySettings={securitySettings}
              setSecuritySettings={setSecuritySettings}
              onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
              onCancel={() => {
                setIsAddDialogOpen(false);
                setSelectedUser(null);
              }}
              onResetPassword={handleResetPassword}
            />
          </DialogContent>
        </Dialog>

        <Card className="p-6">
          {isLoading ? (
            <div className="text-center py-6">Chargement des utilisateurs...</div>
          ) : (
            <InternalUsersTable
              users={users}
              getRoleBadgeColor={getRoleBadgeColor}
              onEdit={handleDialogOpen}
              onDelete={handleDelete}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternalUsers;
