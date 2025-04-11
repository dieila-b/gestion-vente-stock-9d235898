
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SupplierOrderProduct } from "@/types/supplierOrder";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { createTableQuery } from '@/hooks/use-supabase-table-extension';

interface PriceRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplier: any;
}

export function PriceRequestForm({ isOpen, onClose, onSuccess, supplier }: PriceRequestFormProps) {
  const [subject, setSubject] = useState(`Demande de prix - ${new Date().toLocaleDateString()}`);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<Partial<SupplierOrderProduct>[]>([
    {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unitPrice: 0,
      category: "",
      reference: "",
      priceRequested: true
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        id: uuidv4(),
        name: "",
        quantity: 1,
        unitPrice: 0,
        category: "",
        reference: "",
        priceRequested: true
      }
    ]);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleProductChange = (id: string, field: string, value: string | number) => {
    setProducts(
      products.map(product => 
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplier || !supplier.email) {
      toast.error("L'email du fournisseur est requis");
      return;
    }
    
    if (products.some(p => !p.name)) {
      toast.error("Tous les produits doivent avoir un nom");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the email content
      const productsList = products.map(p => 
        `- ${p.name} (${p.reference || 'Réf. non spécifiée'}) - Quantité: ${p.quantity}`
      ).join('\n');
      
      const emailContent = `
Bonjour,

${message}

Produits concernés:
${productsList}

Merci de nous faire parvenir vos tarifs pour ces produits.

Cordialement,
L'équipe commerciale
      `;
      
      // Use createTableQuery to access the price_requests table
      const priceRequestsTable = createTableQuery('price_requests');
      
      // Save the price request in the database
      const { error } = await priceRequestsTable
        .insert({
          supplier_id: supplier.id,
          subject,
          message: emailContent,
          products,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // In a real app, you would send the email here
      // For now, we'll just simulate it
      console.log("Email would be sent to:", supplier.email);
      console.log("Subject:", subject);
      console.log("Content:", emailContent);
      
      toast.success("Demande de prix envoyée avec succès");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error sending price request:", error);
      toast.error("Erreur lors de l'envoi de la demande de prix");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Demande de prix à {supplier?.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nous souhaitons connaître vos tarifs pour les produits suivants..."
              rows={4}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Produits</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddProduct}
              >
                Ajouter un produit
              </Button>
            </div>
            
            {products.map((product, index) => (
              <div key={product.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    placeholder="Nom du produit"
                    value={product.name || ''}
                    onChange={(e) => handleProductChange(product.id!, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Référence"
                    value={product.reference || ''}
                    onChange={(e) => handleProductChange(product.id!, 'reference', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Quantité"
                    value={product.quantity || ''}
                    onChange={(e) => handleProductChange(product.id!, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Catégorie"
                    value={product.category || ''}
                    onChange={(e) => handleProductChange(product.id!, 'category', e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  {products.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(product.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
