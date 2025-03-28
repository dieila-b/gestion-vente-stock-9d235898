
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { KeyRound, Mail } from "lucide-react";
import { InternalUser } from "@/types/internal-user";

interface InternalUserFormProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedUser: InternalUser | null;
  securitySettings: {
    requirePasswordChange: boolean;
    twoFactorEnabled: boolean;
  };
  setSecuritySettings: (settings: {
    requirePasswordChange: boolean;
    twoFactorEnabled: boolean;
  }) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onResetPassword: (user: InternalUser) => void;
}

export const InternalUserForm = ({
  activeTab,
  setActiveTab,
  selectedUser,
  securitySettings,
  setSecuritySettings,
  onSubmit,
  onCancel,
  onResetPassword,
}: InternalUserFormProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="general">Informations générales</TabsTrigger>
        <TabsTrigger value="security">Sécurité</TabsTrigger>
      </TabsList>

      <form onSubmit={onSubmit} className="mt-4">
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Modifier le mot de passe à la première connexion</div>
                  <div className="text-sm text-muted-foreground">
                    L'utilisateur devra changer son mot de passe lors de sa première connexion
                  </div>
                </div>
                <Switch
                  checked={securitySettings.requirePasswordChange}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({...securitySettings, requirePasswordChange: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Authentification à deux facteurs</div>
                  <div className="text-sm text-muted-foreground">
                    Activer l'authentification à deux facteurs pour cet utilisateur
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({...securitySettings, twoFactorEnabled: checked})}
                />
              </div>

              {selectedUser && (
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => onResetPassword(selectedUser)}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Réinitialiser le mot de passe
                </Button>
              )}
            </div>
          </Card>
        </TabsContent>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button type="submit">
            {selectedUser ? "Mettre à jour" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Tabs>
  );
};
