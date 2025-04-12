
import { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CatalogProduct } from "@/types/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { QuoteForm } from "@/components/quotes/QuoteForm";
import { QuoteStats } from "@/components/quotes/QuoteStats";

interface QuoteFormData {
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  validityDate: string;
  notes: string;
  products: Array<{
    product: CatalogProduct;
    quantity: number;
  }>;
}

const initialFormData: QuoteFormData = {
  quoteNumber: `DEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
  clientName: '',
  clientEmail: '',
  validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  notes: '',
  products: []
};

export default function Quotes() {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);

  // Fetch quotes data
  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des devis");
        throw error;
      }

      return data;
    }
  });

  const handleNewQuote = () => {
    setIsCreating(true);
    setFormData({
      ...initialFormData,
      quoteNumber: `DEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' GNF';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Devis
            </h1>
            <p className="text-gray-400">Gérez vos devis clients</p>
          </div>
          <Button 
            onClick={handleNewQuote}
            className="enhanced-glass hover:scale-105 transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Devis
          </Button>
        </div>

        {isCreating && (
          <QuoteForm 
            formData={formData}
            setFormData={setFormData}
            onClose={() => {
              setIsCreating(false);
              setFormData(initialFormData);
            }}
          />
        )}

        {!isCreating && !isLoading && (
          <QuoteStats quotes={quotes || []} formatPrice={formatPrice} />
        )}
      </div>
    </DashboardLayout>
  );
}

