
import { useEffect, useCallback, useState } from "react";
import { InternalUser } from "@/types/internal-user";
import { UserFormValues } from "./validation/user-form-schema";
import { useAuth } from "./hooks/useAuth";
import { useUserData } from "./hooks/useUserData";
import { useUserFormState } from "./hooks/useUserFormState";
import { useUserActions } from "./hooks/useUserActions";

export const useInternalUsers = () => {
  // Récupération du statut d'authentification
  const { isAuthChecking, isAuthorized } = useAuth();
  
  // Récupération des données utilisateur et des actions
  const { users, isLoading, fetchUsers, addUser, updateUserInList } = useUserData();
  
  // Gestion de l'état du dialogue
  const { isAddDialogOpen, selectedUser, setIsAddDialogOpen, setSelectedUser } = useUserFormState();
  
  // Actions utilisateur (soumettre, supprimer, basculer le statut)
  const userActions = useUserActions(fetchUsers, addUser, updateUserInList);
  const { handleSubmit: submitUserAction, handleDelete, toggleUserStatus } = userActions;

  // Charger les utilisateurs quand autorisé
  useEffect(() => {
    if (isAuthorized && !isLoading) {
      console.log("Chargement des utilisateurs car autorisé");
      fetchUsers();
    }
  }, [isAuthorized, fetchUsers]);

  // Gestionnaire de soumission de formulaire - mémorisé pour éviter les récréations
  const handleSubmit = useCallback(async (values: UserFormValues): Promise<void> => {
    await submitUserAction(values, selectedUser);
    // Fermer le dialogue après la soumission
    setIsAddDialogOpen(false);
  }, [submitUserAction, selectedUser, setIsAddDialogOpen]);

  // Gestionnaire d'ajout d'utilisateur - mémorisé pour éviter les récréations
  const handleAddClick = useCallback(() => {
    setSelectedUser(null);
    setIsAddDialogOpen(true);
  }, [setSelectedUser, setIsAddDialogOpen]);

  // Gestionnaire de modification d'utilisateur - mémorisé pour éviter les récréations
  const handleEditClick = useCallback((user: InternalUser) => {
    setSelectedUser(user);
    setIsAddDialogOpen(true);
  }, [setSelectedUser, setIsAddDialogOpen]);

  return {
    users,
    isLoading,
    isAuthChecking,
    isAuthorized,
    isAddDialogOpen,
    selectedUser,
    setIsAddDialogOpen,
    setSelectedUser,
    handleSubmit,
    handleDelete,
    toggleUserStatus,
    handleAddClick,
    handleEditClick
  };
};
