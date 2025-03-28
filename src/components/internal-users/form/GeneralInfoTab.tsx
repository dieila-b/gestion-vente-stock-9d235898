
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail } from "lucide-react";
import { InternalUser } from "@/types/internal-user";

interface GeneralInfoTabProps {
  selectedUser: InternalUser | null;
}

export const GeneralInfoTab = ({ selectedUser }: GeneralInfoTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="first_name">Prénom</label>
          <Input
            id="first_name"
            name="first_name"
            required
            defaultValue={selectedUser?.first_name || ""}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="last_name">Nom</label>
          <Input
            id="last_name"
            name="last_name"
            required
            defaultValue={selectedUser?.last_name || ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="email">Email</label>
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={selectedUser?.email || ""}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="phone">Téléphone</label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={selectedUser?.phone || ""}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="address">Adresse</label>
        <Input
          id="address"
          name="address"
          defaultValue={selectedUser?.address || ""}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="role">Rôle</label>
        <Select name="role" defaultValue={selectedUser?.role || "employee"}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="employee">Employé</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
