
import { useState } from "react";
import { User } from "@/types/user";

export const useUserFormState = () => {
  const initialUserState: Omit<User, 'id'> = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "employee",
    address: "",
    is_active: true,
    photo_url: "",
    password: "",
  };

  const [newUserData, setNewUserData] = useState<Omit<User, 'id'>[]>([]);
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});
  const [passwordConfirmation, setPasswordConfirmation] = useState<{ [key: number]: string }>({});

  const handleInputChange = (index: number, field: string, value: any) => {
    const updatedData = [...newUserData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value,
    };
    setNewUserData(updatedData);
  };

  const handlePasswordConfirmationChange = (index: number, value: string) => {
    setPasswordConfirmation(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleAddUser = () => {
    setNewUserData([
      ...newUserData,
      { ...initialUserState }
    ]);
  };

  const handleRemoveUser = (index: number) => {
    const updatedData = [...newUserData];
    updatedData.splice(index, 1);
    setNewUserData(updatedData);

    // Also clean up password confirmation state
    const updatedConfirmations = { ...passwordConfirmation };
    delete updatedConfirmations[index];
    setPasswordConfirmation(updatedConfirmations);
    
    // Also clean up password visibility state
    const updatedVisibility = { ...showPassword };
    delete updatedVisibility[index];
    setShowPassword(updatedVisibility);
  };

  const togglePasswordVisibility = (index: number) => {
    setShowPassword(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const resetFormState = () => {
    setNewUserData([]);
    setPasswordConfirmation({});
    setShowPassword({});
  };

  return {
    newUserData,
    showPassword,
    passwordConfirmation,
    handleInputChange,
    handlePasswordConfirmationChange,
    handleAddUser,
    handleRemoveUser,
    togglePasswordVisibility,
    resetFormState,
    setNewUserData
  };
};
