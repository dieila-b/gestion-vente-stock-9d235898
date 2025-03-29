import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { UserFormValues } from "../validation/user-form-schema";

interface FormFieldsProps {
  form: UseFormReturn<UserFormValues>;
}

export const NameFields = ({ form }: FormFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="first_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prénom</FormLabel>
            <FormControl>
              <Input placeholder="Jean" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="last_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom</FormLabel>
            <FormControl>
              <Input placeholder="Dupont" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export const EmailField = ({ form }: FormFieldsProps) => {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input 
              type="email" 
              placeholder="jean.dupont@example.com" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const PasswordFields = ({ form }: FormFieldsProps) => {
  const isEditMode = !!form.getValues().id;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isEditMode ? "Nouveau mot de passe (facultatif)" : "Mot de passe"}</FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder={isEditMode ? "Laisser vide pour ne pas changer" : "Mot de passe"} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="confirm_password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isEditMode ? "Confirmer le nouveau mot de passe" : "Confirmer le mot de passe"}</FormLabel>
            <FormControl>
              <Input 
                type="password" 
                placeholder="Confirmer le mot de passe"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export const PhoneField = ({ form }: FormFieldsProps) => {
  return (
    <FormField
      control={form.control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Téléphone</FormLabel>
          <FormControl>
            <Input 
              type="tel" 
              placeholder="+33 6 12 34 56 78"
              value={field.value || ""}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const AddressField = ({ form }: FormFieldsProps) => {
  return (
    <FormField
      control={form.control}
      name="address"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Adresse</FormLabel>
          <FormControl>
            <Input 
              placeholder="123 Rue de Paris, 75000 Paris"
              value={field.value || ""}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const RoleField = ({ form }: FormFieldsProps) => {
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Rôle</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="admin">Administrateur</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employé</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
