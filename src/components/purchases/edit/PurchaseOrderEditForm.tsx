
import React, { useState, useEffect } from 'react';
import { usePurchaseEdit } from '@/hooks/purchases/use-purchase-edit';
import { PurchaseOrder } from "@/types/purchase-order";
import { Loader, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatGNF } from "@/lib/currency";
import { ProductsSection } from "./FormSections/ProductsSection";

interface PurchaseOrderEditFormProps {
  orderId: string;
  onClose: () => void;
}

export function PurchaseOrderEditForm({ orderId, onClose }: PurchaseOrderEditFormProps) {
  console.log("Editing purchase order with ID:", orderId);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  
  const { 
    purchase, 
    isLoading, 
    formData,
    updateFormField,
    saveChanges,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    addItem,
    deliveryStatus, 
    paymentStatus, 
    updateStatus, 
    updatePaymentStatus,
    orderItems,
    refreshTotals
  } = usePurchaseEdit(orderId);
  
  // Log pour debugging
  useEffect(() => {
    console.log("Form render - Purchase data:", purchase ? "loaded" : "not loaded");
    console.log("Form render - Order items count:", orderItems?.length || 0);
    console.log("Form render - Form data:", formData);
    console.log("Form render - Is loading:", isLoading);
  }, [purchase, orderItems, formData, isLoading]);

  // Refresh totals when items change
  useEffect(() => {
    if (orderId && orderItems && orderItems.length > 0) {
      console.log("Items changed, refreshing totals...");
      refreshTotals();
    }
  }, [orderItems, refreshTotals, orderId]);

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await refreshTotals();
      const success = await saveChanges();
      
      if (success) {
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        await queryClient.invalidateQueries({ queryKey: ['purchase', orderId] });
        toast.success("Bon de commande mis à jour avec succès");
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Erreur lors de l'enregistrement des modifications");
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate remaining amount
  const remainingAmount = (formData.total_amount || 0) - (formData.paid_amount || 0);
  
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Chargement du bon de commande...</p>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <p className="text-lg">Bon de commande non trouvé</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-semibold text-white">Modifier Bon de Commande #{purchase.order_number}</h2>
        <p className="text-white/60">Modifiez les détails du bon de commande</p>
      </div>

      {/* Fournisseur */}
      <div className="space-y-2">
        <Label className="text-white/80">Fournisseur</Label>
        <Select value={purchase.supplier?.name || ''} disabled>
          <SelectTrigger className="neo-blur">
            <SelectValue placeholder="Sélectionner un fournisseur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={purchase.supplier?.name || ''}>{purchase.supplier?.name || 'Non défini'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date et Statuts */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-white/80">Date de livraison prévue</Label>
          <Input 
            type="date"
            value={formData.expected_delivery_date ? formData.expected_delivery_date.split('T')[0] : ''}
            onChange={(e) => updateFormField('expected_delivery_date', e.target.value)}
            className="neo-blur"
          />
        </div>

        <div>
          <Label className="text-white/80">Statut de la commande</Label>
          <Select value={deliveryStatus} onValueChange={updateStatus}>
            <SelectTrigger className="neo-blur">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="delivered">Livré</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white/80">Statut du paiement</Label>
          <Select value={paymentStatus} onValueChange={updatePaymentStatus}>
            <SelectTrigger className="neo-blur">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="partial">Partiel</SelectItem>
              <SelectItem value="paid">Payé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Produits</h3>
        <ProductsSection 
          items={orderItems || []}
          updateItemQuantity={updateItemQuantity}
          updateItemPrice={updateItemPrice}
          removeItem={removeItem}
          addItem={addItem}
        />
      </div>

      {/* Coûts additionnels */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-white/80">Frais de livraison</Label>
          <Input 
            type="number"
            value={formData.shipping_cost || 0}
            onChange={(e) => updateFormField('shipping_cost', Number(e.target.value))}
            className="neo-blur"
          />
        </div>
        
        <div>
          <Label className="text-white/80">Transit & Douane</Label>
          <Input 
            type="number"
            value={formData.transit_cost || 0}
            onChange={(e) => updateFormField('transit_cost', Number(e.target.value))}
            className="neo-blur"
          />
        </div>
        
        <div>
          <Label className="text-white/80">Frais de logistique</Label>
          <Input 
            type="number"
            value={formData.logistics_cost || 0}
            onChange={(e) => updateFormField('logistics_cost', Number(e.target.value))}
            className="neo-blur"
          />
        </div>

        <div>
          <Label className="text-white/80">Remise</Label>
          <Input 
            type="number"
            value={formData.discount || 0}
            onChange={(e) => updateFormField('discount', Number(e.target.value))}
            className="neo-blur"
          />
        </div>
        
        <div>
          <Label className="text-white/80">TVA (%)</Label>
          <Input 
            type="number"
            value={formData.tax_rate || 0}
            onChange={(e) => updateFormField('tax_rate', Number(e.target.value))}
            className="neo-blur"
          />
        </div>
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white/80">Sous-total</Label>
          <Input 
            value={formatGNF(formData.subtotal || 0)}
            readOnly
            className="neo-blur bg-white/5 border-blue-500"
          />
        </div>
        
        <div>
          <Label className="text-white/80">TVA</Label>
          <Input 
            value={formatGNF(formData.tax_amount || 0)}
            readOnly
            className="neo-blur bg-white/5 border-blue-500"
          />
        </div>
      </div>

      <div>
        <Label className="text-white/80">Total TTC</Label>
        <Input 
          value={formatGNF(formData.total_ttc || 0)}
          readOnly
          className="neo-blur bg-white/5 border-blue-500"
        />
      </div>

      {/* Détails de paiement */}
      <div className="space-y-4 border border-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white">Détails de paiement</h3>
        
        <div>
          <Label className="text-white/80">Statut du paiement</Label>
          <RadioGroup value={paymentStatus} onValueChange={updatePaymentStatus} className="flex gap-6 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pending" id="pending" />
              <Label htmlFor="pending" className="text-white/80">En attente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partial" id="partial" />
              <Label htmlFor="partial" className="text-white/80">Partiel</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paid" id="paid" />
              <Label htmlFor="paid" className="text-white/80">Payé</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4 border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-white/80">💰</span>
            <h4 className="font-medium text-white">Compteur de Paiements</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white/60">Montant payé</Label>
              <Input 
                type="number"
                value={formData.paid_amount || 0}
                onChange={(e) => updateFormField('paid_amount', Number(e.target.value))}
                className="neo-blur"
              />
            </div>
            
            <div>
              <Label className="text-white/60">Montant total</Label>
              <Input 
                value={formatGNF(formData.total_amount || 0)}
                readOnly
                className="neo-blur bg-white/5"
              />
            </div>
            
            <div>
              <Label className="text-white/60">Montant restant</Label>
              <Input 
                value={formatGNF(remainingAmount)}
                readOnly
                className="neo-blur bg-white/5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-white/80">Notes</Label>
        <Textarea 
          value={formData.notes || ''}
          onChange={(e) => updateFormField('notes', e.target.value)}
          rows={3}
          className="neo-blur"
          placeholder="Ajouter des notes..."
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
        <Button 
          variant="outline"
          onClick={onClose}
          disabled={isSaving}
          className="neo-blur"
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
}
