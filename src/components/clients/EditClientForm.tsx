
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ClientFormFields } from "./forms/ClientFormFields";
import { ClientFormHeader } from "./forms/ClientFormHeader";
import { ClientFormActions } from "./forms/ClientFormActions";
import { Client } from "@/types/client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditClientFormProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

export const EditClientForm = ({ client, isOpen, onClose }: EditClientFormProps) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'created_at' | 'updated_at'>>({
    company_name: client.company_name,
    contact_name: client.contact_name,
    email: client.email || '',
    phone: client.phone || '',
    mobile_1: client.mobile_1 || '',
    mobile_2: client.mobile_2 || '',
    whatsapp: client.whatsapp || '',
    address: client.address || '',
    credit_limit: client.credit_limit || 0,
    status: client.status,
    client_type: client.client_type || '',
    city: client.city || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', client.id);

      if (error) throw error;

      toast.success("Client modifié avec succès");
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error("Erreur lors de la modification du client");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <ClientFormHeader 
            onClose={onClose} 
            title="Modifier un client"
          />
          
          <ClientFormFields
            formData={formData}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
          />

          <ClientFormActions
            onClose={onClose}
            isLoading={isLoading}
            submitLabel="Modifier"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
