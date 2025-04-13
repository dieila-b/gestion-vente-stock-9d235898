
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types/user";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const queryClient = useQueryClient();
  const [userData, setUserData] = useState<User>({ ...user });
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof User, value: any) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const passwordsMatch = !newPassword || !passwordConfirmation || newPassword === passwordConfirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && !passwordsMatch) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Build update object
      const updateData: any = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        address: userData.address,
        is_active: userData.is_active,
        photo_url: userData.photo_url,
      };
      
      // If new password was provided, include it
      if (newPassword) {
        updateData.password = newPassword;
      }
      
      // Update user in the database
      const { error } = await supabase
        .from('internal_users')
        .update(updateData)
        .eq('id', userData.id);
      
      if (error) {
        throw error;
      }
      
      // Refresh internal users data
      await queryClient.invalidateQueries({ queryKey: ['internal-users'] });
      
      // Success message
      toast.success("Utilisateur mis à jour avec succès");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#121212] text-white border-gray-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Modifier l'utilisateur
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="informations" className="mt-4">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="informations" className="rounded-none data-[state=active]:bg-[#1e293b] data-[state=active]:text-white">
                Informations
              </TabsTrigger>
              <TabsTrigger value="password" className="rounded-none data-[state=active]:bg-[#1e293b] data-[state=active]:text-white">
                Mot de passe
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="informations" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-gray-300">Prénom</Label>
                  <Input
                    id="first_name"
                    value={userData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    required
                    className="bg-[#1e1e1e] border-gray-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-gray-300">Nom</Label>
                  <Input
                    id="last_name"
                    value={userData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    required
                    className="bg-[#1e1e1e] border-gray-700 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="bg-[#1e1e1e] border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Téléphone</Label>
                <Input
                  id="phone"
                  value={userData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-[#1e1e1e] border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-300">Adresse</Label>
                <Input
                  id="address"
                  value={userData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="bg-[#1e1e1e] border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-300">Rôle</Label>
                <Select
                  value={userData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger id="role" className="bg-[#1e1e1e] border-gray-700 text-white">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-gray-700 text-white">
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={userData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  className="data-[state=checked]:bg-purple-500"
                />
                <Label htmlFor="is_active" className="text-gray-300">Utilisateur actif</Label>
              </div>
            </TabsContent>
            
            <TabsContent value="password" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Laissez vide pour ne pas modifier"
                    className="pr-10 bg-[#1e1e1e] border-gray-700 text-white"
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon"
                    className="absolute right-0 top-0 h-full text-gray-400"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="password_confirmation" 
                  className={!passwordsMatch ? "text-destructive" : "text-gray-300"}
                >
                  Confirmation du mot de passe
                </Label>
                <Input
                  id="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Confirmation du mot de passe"
                  className={`bg-[#1e1e1e] border-gray-700 text-white ${!passwordsMatch ? "border-destructive" : ""}`}
                />
              </div>
              
              <Alert className="bg-amber-100/20 border-amber-200/30 text-amber-500">
                <AlertDescription>
                  Note: Laissez les champs vides si vous ne souhaitez pas modifier le mot de passe.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6 gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (newPassword && !passwordsMatch)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
