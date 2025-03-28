
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InternalUser } from "@/types/internal-user";

interface InternalUserFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  selectedUser: InternalUser | null;
}

export const InternalUserForm = ({
  isOpen,
  onOpenChange,
  onSubmit,
  selectedUser,
}: InternalUserFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium">Prénom</label>
              <Input
                id="first_name"
                name="first_name"
                required
                defaultValue={selectedUser?.first_name || ""}
                placeholder="Jean"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="last_name" className="text-sm font-medium">Nom</label>
              <Input
                id="last_name"
                name="last_name"
                required
                defaultValue={selectedUser?.last_name || ""}
                placeholder="Dupont"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={selectedUser?.email || ""}
              placeholder="jean.dupont@example.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Téléphone</label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={selectedUser?.phone || ""}
              placeholder="+33 6 12 34 56 78"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">Adresse</label>
            <Input
              id="address"
              name="address"
              defaultValue={selectedUser?.address || ""}
              placeholder="123 Rue de Paris, 75000 Paris"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">Rôle</label>
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
          <div className="flex justify-end gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {selectedUser ? "Mettre à jour" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
