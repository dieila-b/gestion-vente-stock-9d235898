
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuoteFormProps {
  selectedClient?: {
    id: string;
    company_name?: string;
    contact_name?: string;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({ 
  selectedClient, 
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    clientId: selectedClient?.id || '',
    clientName: selectedClient?.company_name || selectedClient?.contact_name || '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    totalAmount: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    if (!formData.totalAmount) {
      toast.error("Veuillez entrer un montant");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Generate a quote number
      const quoteNumber = `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Insert the quote
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          client_id: formData.clientId,
          issue_date: formatDate(formData.issueDate),
          expiry_date: formatDate(formData.expiryDate),
          total_amount: parseFloat(formData.totalAmount),
          notes: formData.notes,
          status: 'pending',
          quote_number: quoteNumber
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success("Devis créé avec succès");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error("Erreur lors de la création du devis");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un nouveau devis</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="clientName" className="text-sm font-medium">
                Client
              </label>
              <Input
                id="clientName"
                name="clientName"
                value={formData.clientName}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="issueDate" className="text-sm font-medium">
                Date d'émission
              </label>
              <Input
                id="issueDate"
                name="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="expiryDate" className="text-sm font-medium">
                Date d'expiration
              </label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="totalAmount" className="text-sm font-medium">
                Montant total
              </label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                placeholder="0.00"
                value={formData.totalAmount}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Entrez des notes ou informations complémentaires..."
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer le devis'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
