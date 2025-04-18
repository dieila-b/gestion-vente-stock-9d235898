
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ClientFormHeader } from "./forms/ClientFormHeader";
import { ClientFormFields } from "./forms/ClientFormFields";
import { ClientFormActions } from "./forms/ClientFormActions";
import { db } from "@/utils/db-adapter";

interface AddClientFormProps {
  isOpen: boolean;
  onClose: () => void;
}

type ClientFormData = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

// Fonction pour générer un code client basé sur le nom et un nombre aléatoire
const generateClientCode = (clientName: string): string => {
  // Prendre les 3 premiers caractères du nom (ou moins si le nom est plus court)
  const prefix = clientName.trim().toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
  
  // Générer un nombre aléatoire à 4 chiffres
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  
  // Combiner le préfixe et le nombre aléatoire
  return `${prefix}${randomNumber}`;
};

export const AddClientForm = ({ isOpen, onClose }: AddClientFormProps) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    mobile_1: "",
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

    try {
      // Générer un code client basé sur le nom de l'entreprise ou du contact
      const nameForCode = formData.status === 'entreprise' ? formData.company_name : formData.contact_name;
      const clientCode = generateClientCode(nameForCode);
      
      // Ajouter le code client aux données du formulaire
      const clientDataWithCode = {
        ...formData,
        client_code: clientCode
      };
      
      console.log("Submitting client data:", clientDataWithCode);
      
      // Utiliser l'adaptateur de base de données pour éviter les problèmes de RLS
      const result = await db.insert('clients', clientDataWithCode);

      if (!result) {
        throw new Error("Échec de l'ajout du client");
      }

      toast.success("Client ajouté avec succès");
      // Invalidation de la requête pour rafraîchir la liste des clients
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
    } catch (error: any) {
      console.error('Error adding client:', error);
      toast.error(`Erreur lors de l'ajout du client: ${error.message || 'Erreur inconnue'}`);
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
