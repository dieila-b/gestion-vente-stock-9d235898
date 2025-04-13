
import { Input } from "@/components/ui/input";
import { Building2, Mail, Phone, MapPin, Wallet, UserCircle, Building, User } from "lucide-react";
import { Client } from "@/types/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ClientFormData = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

interface ClientFormFieldsProps {
  formData: ClientFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange?: (name: string, value: string) => void;
}

export const ClientFormFields = ({ formData, onChange, onSelectChange }: ClientFormFieldsProps) => {
  const handleSelectChange = (name: string) => (value: string) => {
    if (onSelectChange) {
      onSelectChange(name, value);
    }
  };

  const isIndividual = formData.status === "particulier";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Statut Client</label>
        <Select
          value={formData.status || "none"}
          onValueChange={handleSelectChange("status")}
        >
          <SelectTrigger className="enhanced-glass">
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Non spécifié</SelectItem>
            <SelectItem value="particulier">Particulier</SelectItem>
            <SelectItem value="entreprise">Entreprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Type de Client</label>
        <Select
          value={formData.client_type || "none"}
          onValueChange={handleSelectChange("client_type")}
        >
          <SelectTrigger className="enhanced-glass">
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Non spécifié</SelectItem>
            <SelectItem value="occasionnel">Occasionnel</SelectItem>
            <SelectItem value="grossiste">Grossiste</SelectItem>
            <SelectItem value="semi-grossiste">Semi-Grossiste</SelectItem>
            <SelectItem value="regulier">Régulier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Nom du contact *</label>
        <Input
          required
          name="contact_name"
          value={formData.contact_name}
          onChange={onChange}
          className="enhanced-glass"
          placeholder="Doe"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Prénom</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            name="first_name"
            value={formData.first_name || ''}
            onChange={onChange}
            className="pl-10 enhanced-glass"
            placeholder="John"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Nom de l'entreprise</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            name="company_name"
            value={formData.company_name}
            onChange={onChange}
            className={`pl-10 enhanced-glass ${isIndividual ? 'bg-gray-200 opacity-50' : ''}`}
            placeholder="Entreprise ABC"
            disabled={isIndividual}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={onChange}
            className="pl-10 enhanced-glass"
            placeholder="contact@entreprise.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">WhatsApp</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            name="whatsapp"
            value={formData.whatsapp || ''}
            onChange={onChange}
            className="pl-10 enhanced-glass"
            placeholder="+224 123456789"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Téléphone principal</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            name="phone"
            value={formData.phone || ''}
            onChange={onChange}
            className="pl-10 enhanced-glass"
            placeholder="+224 123456789"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Téléphone secondaire</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            name="mobile_2"
            value={formData.mobile_2 || ''}
            onChange={onChange}
            className="pl-10 enhanced-glass"
            placeholder="+224 123456789"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Adresse</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            name="address"
            value={formData.address || ''}
            onChange={onChange}
            className="pl-10 enhanced-glass"
            placeholder="123 Rue Principale"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Ville</label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            name="city"
            value={formData.city || ''}
            onChange={onChange}
            className="pl-10 enhanced-glass"
            placeholder="Conakry"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Limite de crédit (GNF)</label>
        <div className="relative">
          <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="number"
            name="credit_limit"
            value={formData.credit_limit || ''}
            onChange={onChange}
            className="pl-10 enhanced-glass"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
};
