
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const NameFields = ({ form }: { form: any }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <FormField
      control={form.control}
      name="first_name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Prénom</FormLabel>
          <FormControl>
            <Input placeholder="Prénom" {...field} />
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
            <Input placeholder="Nom" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

export const EmailField = ({ form }: { form: any }) => (
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="Email" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const PasswordFields = ({ form }: { form: any }) => {
  const isEditMode = form.getValues().id ? true : false;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEditMode ? "Nouveau mot de passe" : "Mot de passe"}</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={isEditMode ? "Laisser vide pour ne pas changer" : "Mot de passe"} 
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-xs">
                8 caractères min. avec majuscules, minuscules, chiffres et caractères spéciaux
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
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

      <FormField
        control={form.control}
        name="force_password_change"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Obliger l'utilisateur à changer son mot de passe à la première connexion
              </FormLabel>
              <FormDescription>
                L'utilisateur devra définir un nouveau mot de passe lors de sa première connexion
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export const PhoneField = ({ form }: { form: any }) => (
  <FormField
    control={form.control}
    name="phone"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Téléphone</FormLabel>
        <FormControl>
          <Input placeholder="Téléphone" {...field} value={field.value || ""} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const AddressField = ({ form }: { form: any }) => (
  <FormField
    control={form.control}
    name="address"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Adresse</FormLabel>
        <FormControl>
          <Textarea 
            placeholder="Adresse" 
            {...field} 
            value={field.value || ""} 
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const RoleField = ({ form }: { form: any }) => (
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
              <SelectValue placeholder="Sélectionnez un rôle" />
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
