
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InternalUser } from "@/types/internal-user";
import { userFormSchema, UserFormValues } from "../validation/user-form-schema";
import { Form } from "@/components/ui/form";
import { 
  NameFields, 
  EmailField, 
  PhoneField, 
  AddressField, 
  RoleField 
} from "./FormFields";
import { FormActions } from "./FormActions";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface UserFormContentProps {
  onSubmit: (user: UserFormValues) => Promise<void>;
  onCancel: () => void;
  selectedUser: InternalUser | null;
}

export const UserFormContent = ({ 
  onSubmit, 
  onCancel, 
  selectedUser 
}: UserFormContentProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: selectedUser?.first_name || "",
      last_name: selectedUser?.last_name || "",
      email: selectedUser?.email || "",
      phone: selectedUser?.phone || "",
      address: selectedUser?.address || "",
      role: selectedUser?.role || "employee",
      is_active: selectedUser?.is_active ?? true,
    },
  });

  const handleSubmit = async (values: UserFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      form.reset();
      onCancel();
      toast({
        title: selectedUser ? "Utilisateur mis à jour" : "Utilisateur créé",
        description: "L'opération a été effectuée avec succès",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'opération",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <NameFields form={form} />
        <EmailField form={form} />
        <PhoneField form={form} />
        <AddressField form={form} />
        <RoleField form={form} />
        
        <FormActions 
          isSubmitting={isSubmitting} 
          onCancel={onCancel} 
          isEditMode={!!selectedUser} 
        />
      </form>
    </Form>
  );
};
