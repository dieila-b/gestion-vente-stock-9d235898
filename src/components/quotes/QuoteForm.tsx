
import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

interface QuoteFormProps {
  onClose: () => void;
}

interface Client {
  id: string;
  company_name: string;
}

// Define the form data shape
interface QuoteFormData {
  client_id: string;
  issue_date: string;
  expiry_date: string;
  quote_number: string;
  status: string;
  notes: string;
  total_amount: number;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<QuoteFormData>({
    client_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quote_number: `QT-${Date.now().toString().slice(-8)}`,
    status: 'draft',
    notes: '',
    total_amount: 0
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch clients on mount
  React.useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name')
        .order('company_name');
        
      if (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
        return;
      }
      
      setClients(data || []);
    };
    
    fetchClients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create the quote
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          client_id: formData.client_id,
          issue_date: formData.issue_date,
          expiry_date: formData.expiry_date,
          quote_number: formData.quote_number,
          status: formData.status,
          notes: formData.notes,
          total_amount: formData.total_amount
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Quote created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Failed to create quote');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="client_id" className="block text-sm font-medium">Client</label>
        <Select
          value={formData.client_id}
          onValueChange={value => handleSelectChange('client_id', value)}
        >
          <SelectTrigger id="client_id">
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="issue_date" className="block text-sm font-medium">Issue Date</label>
          <Input
            id="issue_date"
            name="issue_date"
            type="date"
            value={formData.issue_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="expiry_date" className="block text-sm font-medium">Expiry Date</label>
          <Input
            id="expiry_date"
            name="expiry_date"
            type="date"
            value={formData.expiry_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="quote_number" className="block text-sm font-medium">Quote Number</label>
          <Input
            id="quote_number"
            name="quote_number"
            value={formData.quote_number}
            onChange={handleChange}
            readOnly
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium">Status</label>
          <Select
            value={formData.status}
            onValueChange={value => handleSelectChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="total_amount" className="block text-sm font-medium">Total Amount</label>
        <Input
          id="total_amount"
          name="total_amount"
          type="number"
          value={formData.total_amount.toString()}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Quote'}
        </Button>
      </div>
    </form>
  );
};
