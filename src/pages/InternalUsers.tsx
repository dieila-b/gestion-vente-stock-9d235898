
import { UserFormList } from "@/components/internal-users/UserFormList";
import { UsersTable } from "@/components/internal-users/UsersTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternalUsers } from "@/hooks/internal-users";

const InternalUsers = () => {
  const { 
    users,
    isLoading,
    newUserData, 
    passwordConfirmation,
    showPassword,
    handleInputChange,
    handlePasswordConfirmationChange,
    handleAddUser, 
    handleRemoveUser, 
    handleBulkInsert,
    togglePasswordVisibility,
    onDeleteUser,
    onEditUser,
    handleImageUpload
  } = useInternalUsers();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs Internes</h1>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Liste des utilisateurs</TabsTrigger>
          <TabsTrigger value="add">Ajouter des utilisateurs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
          <UsersTable 
            users={users} 
            isLoading={isLoading}
            onDeleteUser={onDeleteUser}
            onEditUser={onEditUser}
          />
        </TabsContent>
        
        <TabsContent value="add">
          <UserFormList
            newUserData={newUserData}
            passwordConfirmation={passwordConfirmation}
            showPassword={showPassword}
            onAddUser={handleAddUser}
            onBulkInsert={handleBulkInsert}
            onInputChange={handleInputChange}
            onPasswordConfirmationChange={handlePasswordConfirmationChange}
            onRemoveUser={handleRemoveUser}
            onTogglePasswordVisibility={togglePasswordVisibility}
            onImageUpload={handleImageUpload}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InternalUsers;
