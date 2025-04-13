
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User } from "@/types/user";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserEditDialogProps {
  user: User;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: User) => void;
}

export const UserEditDialog = ({ user, isOpen, onOpenChange, onSave }: UserEditDialogProps) => {
  const [formData, setFormData] = useState<User>({...user});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [activeTab, setActiveTab] = useState("information");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as "admin" | "manager" | "employee"
    }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passwordsMatch = !newPassword || !passwordConfirmation || newPassword === passwordConfirmation;
  
  const getPasswordStrength = () => {
    if (!newPassword) return "";
    if (newPassword.length < 6) return "faible";
    if (newPassword.length < 10) return "moyen";
    return "fort";
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    switch(strength) {
      case "faible": return "bg-red-500";
      case "moyen": return "bg-yellow-500";
      case "fort": return "bg-green-500";
      default: return "bg-transparent";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validation du mot de passe si un nouveau mot de passe est fourni
      if (newPassword) {
        if (newPassword.length < 6) {
          toast.error("Le mot de passe doit contenir au moins 6 caractères");
          setIsLoading(false);
          return;
        }
        
        if (newPassword !== passwordConfirmation) {
          toast.error("Les mots de passe ne correspondent pas");
          setIsLoading(false);
          return;
        }
        
        // Ajouter le nouveau mot de passe aux données du formulaire
        formData.password = newPassword;
      }
      
      onSave(formData);
      toast.success("Utilisateur mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="information">Informations</TabsTrigger>
              <TabsTrigger value="password">Mot de passe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="information" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                  disabled={isLoading}
                >
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
              
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Utilisateur actif</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleActiveChange}
                  disabled={isLoading}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="password" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Laissez vide pour ne pas modifier"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                
                {newPassword && (
                  <div className="mt-1">
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${getStrengthColor()}`} style={{ width: newPassword.length > 12 ? '100%' : `${newPassword.length * 8}%` }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Force du mot de passe: {getPasswordStrength()}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="password_confirmation"
                  className={!passwordsMatch ? "text-destructive" : ""}
                >
                  Confirmation du mot de passe
                </Label>
                <Input
                  id="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  disabled={isLoading}
                  className={!passwordsMatch ? "border-destructive focus:ring-destructive" : ""}
                />
                
                {!passwordsMatch && (
                  <Alert variant="destructive" className="py-2 mt-2">
                    <AlertDescription className="text-xs">
                      Les mots de passe ne correspondent pas
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> Laissez les champs vides si vous ne souhaitez pas modifier le mot de passe.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
