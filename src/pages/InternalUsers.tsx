
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInternalUsers } from "@/hooks/internal-users/use-internal-users";
import { InternalUsersHeader } from "@/components/internal-users/InternalUsersHeader";
import { InternalUserForm } from "@/components/internal-users/InternalUserForm";
import { InternalUsersTable } from "@/components/internal-users/InternalUsersTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        toast.error("Vous devez être connecté pour accéder à cette page");
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

  if (isAuthenticated === null) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center h-[80vh]">
          <div className="animate-pulse text-center">
            <p>Vérification de l'authentification...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isAuthenticated === false) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Accès refusé</AlertTitle>
            <AlertDescription>
              Vous devez être connecté pour accéder à la gestion des utilisateurs internes.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/auth")}>Se connecter</Button>
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
          ) : users && users.length > 0 ? (
            <InternalUsersTable
              users={users}
              getRoleBadgeColor={getRoleBadgeColor}
              onEdit={handleDialogOpen}
              onDelete={handleDelete}
            />
          ) : (
            <div className="py-8 text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-muted-foreground mb-6">
                Créez votre premier utilisateur interne pour commencer à gérer l'accès à votre système.
              </p>
              <Button 
                onClick={() => handleDialogOpen(null)}
                className="mx-auto"
              >
                Ajouter un utilisateur
              </Button>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternalUsers;
