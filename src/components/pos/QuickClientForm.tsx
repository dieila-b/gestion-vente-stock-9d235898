
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Mail, Phone, MapPin, Wallet, Building, User } from "lucide-react";

interface QuickClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client: Client) => void;
}

export function QuickClientForm({ isOpen, onClose, onClientCreated }: QuickClientFormProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    credit_limit: 0,
    status: "particulier",
    client_type: "occasionnel"
  });

  const generateClientCode = (name: string): string => {
    const prefix = name.trim().toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNumber}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contact_name.trim()) {
      toast.error("Le nom du contact est requis");
      return;
    }

    // Vérification des données obligatoires selon le statut
    if (formData.status === 'entreprise' && !formData.company_name.trim()) {
      toast.error("Le nom de la société est requis pour les clients de type société");
      return;
    }

    setIsLoading(true);

    try {
      const nameForCode = formData.status === 'entreprise' ? formData.company_name : formData.contact_name;
      const clientCode = generateClientCode(nameForCode);
      
      const clientData = {
        ...formData,
        client_code: clientCode,
        credit_limit: Number(formData.credit_limit) || 0
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Client créé avec succès");
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClientCreated(data);
      onClose();
      
      // Réinitialiser le formulaire
      setFormData({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        whatsapp: "",
        address: "",
        city: "",
        credit_limit: 0,
        status: "particulier",
        client_type: "occasionnel"
      });
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error(`Erreur lors de la création du client: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credit_limit' ? (parseFloat(value) || 0) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear company_name if client is individual
      ...(name === 'status' && value === 'particulier' ? { company_name: "" } : {})
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau client</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de l'entreprise</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Entreprise ABC"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type de Client</Label>
                <Select
                  value={formData.client_type}
                  onValueChange={(value) => handleSelectChange("client_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="occasionnel">Occasionnel</SelectItem>
                    <SelectItem value="regulier">Régulier</SelectItem>
                    <SelectItem value="grossiste">Grossiste</SelectItem>
                    <SelectItem value="semi-grossiste">Semi-Grossiste</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="contact@entreprise.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="+224 123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ville</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Conakry"
                  />
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Statut Client</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particulier">Particulier</SelectItem>
                    <SelectItem value="entreprise">Professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nom du contact *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    required
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="+224 123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adresse</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="123 Rue Principale"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Limite de crédit (GNF)</Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="number"
                    name="credit_limit"
                    value={formData.credit_limit}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Création..." : "Créer le client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
