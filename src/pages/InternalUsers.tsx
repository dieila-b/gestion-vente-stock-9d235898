
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInternalUsers } from "@/hooks/use-internal-users";
import { InternalUsersHeader } from "@/components/internal-users/InternalUsersHeader";
import { InternalUserForm } from "@/components/internal-users/InternalUserForm";
import { InternalUsersTable } from "@/components/internal-users/InternalUsersTable";

const InternalUsers = () => {
  const navigate = useNavigate();
  const {
    users,
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
      if (!session) {
        toast.error("Vous devez être connecté pour accéder à cette page");
        navigate("/auth"); // Redirection vers la page d'authentification
      }
    };
    
    checkAuth();
  }, [navigate]);

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
          <InternalUsersTable
            users={users}
            getRoleBadgeColor={getRoleBadgeColor}
            onEdit={handleDialogOpen}
            onDelete={handleDelete}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InternalUsers;
