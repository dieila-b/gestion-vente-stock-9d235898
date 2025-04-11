
import { useState } from "react";
import { Form } from "@/components/ui/form";
import { 
  NameFields,
  EmailField,
  PasswordFields,
  PhoneField,
  AddressField,
  RoleField,
  StatusField,
  PhotoField
} from "./FormFields";
import { FormActions } from "./FormActions";
import { UserFormValues } from "../validation/user-form-schema";
import { useForm } from "react-hook-form";
import { InternalUser } from "@/types/internal-user";

interface FormContentProps {
  onSubmit: (user: UserFormValues) => Promise<void>;
  onCancel: () => void;
  selectedUser: InternalUser | null;
}

export const FormContent = ({ 
  onSubmit, 
  onCancel, 
  selectedUser 
}: FormContentProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!selectedUser;
  
  const form = useForm<UserFormValues>({
    defaultValues: {
      first_name: selectedUser?.first_name || "",
      last_name: selectedUser?.last_name || "",
      email: selectedUser?.email || "",
      phone: selectedUser?.phone || "",
      address: selectedUser?.address || "",
      role: selectedUser?.role as "admin" | "manager" | "employee" || "employee",
      password: "",
      confirm_password: "",
      is_active: selectedUser?.is_active ?? true,
      photo_url: selectedUser?.photo_url || null,
    }
  });

  const handleSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <PhotoField form={form} />
        <NameFields form={form} />
        <EmailField form={form} />
        <PasswordFields form={form} />
        <PhoneField form={form} />
        <AddressField form={form} />
        <RoleField form={form} />
        <StatusField form={form} />
        
        <FormActions 
          isSubmitting={isSubmitting} 
          onCancel={onCancel} 
          isEditMode={isEditMode} 
        />
      </form>
    </Form>
  );
};
