
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Client } from "@/types/client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ClientFormHeader } from "./forms/ClientFormHeader";
import { ClientFormFields } from "./forms/ClientFormFields";
import { ClientFormActions } from "./forms/ClientFormActions";

interface EditClientFormProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

type ClientFormData = Omit<Client, 'id' | 'created_at' | 'updated_at'> & { id: string };

export const EditClientForm = ({ client, isOpen, onClose }: EditClientFormProps) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    id: client.id,
    company_name: client.company_name || "",
    contact_name: client.contact_name || "",
    email: client.email || "",
    phone: client.phone || "",
    mobile_1: client.mobile_1 || "",
    whatsapp: client.whatsapp || "",
    address: client.address || "",
    tax_number: client.tax_number || "",
    payment_terms: client.payment_terms || "",
    credit_limit: client.credit_limit || 0,
    city: client.city || "",
    status: client.status || "particulier",
    client_type: client.client_type || "occasionnel"
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: client.id,
        company_name: client.company_name || "",
        contact_name: client.contact_name || "",
        email: client.email || "",
        phone: client.phone || "",
        mobile_1: client.mobile_1 || "",
        whatsapp: client.whatsapp || "",
        address: client.address || "",
        tax_number: client.tax_number || "",
        payment_terms: client.payment_terms || "",
        credit_limit: client.credit_limit || 0,
        city: client.city || "",
        status: client.status || "particulier",
        client_type: client.client_type || "occasionnel"
      });
    }
  }, [client, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Vérification des données obligatoires
    if (formData.status === 'entreprise' && !formData.company_name.trim()) {
      toast.error("Le nom de la société est requis pour les clients de type société");
      setIsLoading(false);
      return;
    }

    if (!formData.contact_name.trim()) {
      toast.error("Le nom du contact est requis");
      setIsLoading(false);
      return;
    }

    // Préparer les données pour la mise à jour
    const { id, ...dataToUpdate } = formData;

    try {
      console.log("Updating client data:", dataToUpdate);
      
      const { error } = await supabase
        .from('clients')
        .update(dataToUpdate)
        .eq('id', id);

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      toast.success("Client modifié avec succès");
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast.error(`Erreur lors de la modification du client: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      >
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6 enhanced-glass">
              <form onSubmit={handleSubmit} className="space-y-6">
                <ClientFormHeader onClose={onClose} title={`Modifier Client: ${client.contact_name || client.company_name}`} />
                
                <ClientFormFields 
                  formData={formData}
                  onChange={handleChange}
                  onSelectChange={handleSelectChange}
                />
                
                <ClientFormActions 
                  onClose={onClose}
                  isLoading={isLoading}
                  submitLabel="Mettre à jour"
                />
              </form>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Dialog>
  );
};
