
import { useQueryClient } from "@tanstack/react-query";
import { useBucketCheck } from "./use-bucket-check";
import { useInternalUsersQuery } from "./use-internal-users-query";
import { useUserFormState } from "./use-user-form-state";
import { useUserValidation } from "./use-user-validation";
import { useUserMutations } from "./use-user-mutations";

export const useInternalUsers = () => {
  const queryClient = useQueryClient();
  
  // Vérification du bucket au chargement du composant
  useBucketCheck();

  // Récupération des utilisateurs existants
  const { data: users = [], isLoading } = useInternalUsersQuery();

  // Gestion des états du formulaire
  const {
    newUserData,
    showPassword,
    passwordConfirmation,
    handleInputChange,
    handlePasswordConfirmationChange,
    handleAddUser,
    handleRemoveUser,
    togglePasswordVisibility,
    resetFormState
  } = useUserFormState();

  // Validation des données utilisateur
  const { validatePasswords, validateRequiredFields } = useUserValidation();

  // Mutations pour ajouter des utilisateurs
  const { handleBulkInsert: bulkInsertUsers } = useUserMutations(queryClient);

  const handleBulkInsert = async () => {
    const validatePasswordsWrapper = () => validatePasswords(newUserData, passwordConfirmation);
    const validateRequiredFieldsWrapper = () => validateRequiredFields(newUserData);
    
    await bulkInsertUsers(
      newUserData,
      validatePasswordsWrapper,
      validateRequiredFieldsWrapper,
      resetFormState
    );
  };

  return {
    users,
    isLoading,
    newUserData,
    showPassword,
    passwordConfirmation,
    handleInputChange,
    handlePasswordConfirmationChange,
    handleAddUser,
    handleRemoveUser,
    togglePasswordVisibility,
    handleBulkInsert,
  };
};
