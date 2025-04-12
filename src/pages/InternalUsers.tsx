
import { UserFormList } from "@/components/internal-users/UserFormList";
import { useInternalUsers } from "@/hooks/use-internal-users";

const InternalUsers = () => {
  const { 
    newUserData, 
    handleInputChange, 
    handleAddUser, 
    handleRemoveUser, 
    handleBulkInsert 
  } = useInternalUsers();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs Internes</h1>

      <div className="mb-4">
        <UserFormList
          newUserData={newUserData}
          onAddUser={handleAddUser}
          onBulkInsert={handleBulkInsert}
          onInputChange={handleInputChange}
          onRemoveUser={handleRemoveUser}
        />
      </div>
    </div>
  );
};

export default InternalUsers;
