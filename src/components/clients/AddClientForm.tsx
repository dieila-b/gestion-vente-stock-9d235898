
import { useState } from "react";
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

interface AddClientFormProps {
  isOpen: boolean;
  onClose: () => void;
}

type ClientFormData = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

export const AddClientForm = ({ isOpen, onClose }: AddClientFormProps) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    mobile_1: "",
    mobile_2: "",
    whatsapp: "",
    address: "",
    tax_number: "",
    payment_terms: "",
    credit_limit: 0,
    city: "",
    status: "particulier",
    client_type: "occasionnel"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credit_limit' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('clients')
        .insert(formData);

      if (error) throw error;

      toast.success("Client ajouté avec succès");
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error("Erreur lors de l'ajout du client");
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
                <ClientFormHeader onClose={onClose} title="Nouveau Client" />
                
                <ClientFormFields 
                  formData={formData}
                  onChange={handleChange}
                  onSelectChange={handleSelectChange}
                />
                
                <ClientFormActions 
                  onClose={onClose}
                  isLoading={isLoading}
                />
              </form>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Dialog>
  );
};
