
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePurchaseEdit } from "@/hooks/purchases/use-purchase-edit";
import { formatDate } from "@/lib/formatters";

interface PurchaseOrderEditFormProps {
  orderId: string;
  onClose: () => void;
}

export function PurchaseOrderEditForm({ orderId, onClose }: PurchaseOrderEditFormProps) {
  const { 
    purchase, 
    isLoading, 
    formData,
    updateFormField,
    saveChanges,
    updateItemQuantity,
    deliveryStatus, 
    paymentStatus, 
    updateStatus, 
    updatePaymentStatus 
  } = usePurchaseEdit(orderId);
  
  const handleSave = async () => {
    const success = await saveChanges();
    if (success) {
      onClose();
    }
  };
  
  if (isLoading) {
    return <div className="p-6 text-center">Chargement...</div>;
  }
  
  if (!purchase) {
    return <div className="p-6 text-center">Bon de commande non trouvé</div>;
  }
  
  return (
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-semibold">Informations générales</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Numéro de commande</Label>
          <Input 
            value={formData.order_number || ''}
            onChange={(e) => updateFormField('order_number', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Fournisseur</Label>
          <Input value={purchase.supplier?.name} readOnly />
        </div>
        
        <div>
          <Label>Date de création</Label>
          <Input value={formatDate(purchase.created_at)} readOnly />
        </div>
        
        <div>
          <Label>Date de livraison prévue</Label>
          <Input 
            type="date"
            value={formData.expected_delivery_date ? formData.expected_delivery_date.split('T')[0] : ''}
            onChange={(e) => updateFormField('expected_delivery_date', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Statut</Label>
          <Select 
            value={deliveryStatus}
            onValueChange={(value) => updateStatus(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="delivered">Livré</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Statut de paiement</Label>
          <Select 
            value={paymentStatus}
            onValueChange={(value) => updatePaymentStatus(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="partial">Partiel</SelectItem>
              <SelectItem value="paid">Payé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-6">Coûts additionnels</h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Remise</Label>
          <Input 
            type="number"
            value={formData.discount || 0}
            onChange={(e) => updateFormField('discount', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Frais de livraison</Label>
          <Input 
            type="number"
            value={formData.shipping_cost || 0}
            onChange={(e) => updateFormField('shipping_cost', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Frais de transit</Label>
          <Input 
            type="number"
            value={formData.transit_cost || 0}
            onChange={(e) => updateFormField('transit_cost', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Frais logistiques</Label>
          <Input 
            type="number"
            value={formData.logistics_cost || 0}
            onChange={(e) => updateFormField('logistics_cost', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Taux TVA (%)</Label>
          <Input 
            type="number"
            value={formData.tax_rate || 0}
            onChange={(e) => updateFormField('tax_rate', Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Montant total</Label>
          <Input value={`${purchase.total_amount?.toLocaleString('fr-FR')} GNF`} readOnly />
        </div>
      </div>
      
      <div>
        <Label>Notes</Label>
        <Textarea 
          value={formData.notes || ''}
          onChange={(e) => updateFormField('notes', e.target.value)}
          rows={3}
        />
      </div>
        
      <h3 className="text-lg font-semibold mt-6">Produits</h3>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Produit</th>
              <th className="p-2 text-right">Quantité</th>
              <th className="p-2 text-right">Prix unitaire</th>
              <th className="p-2 text-right">Prix vente</th>
              <th className="p-2 text-right">Prix total</th>
            </tr>
          </thead>
          <tbody>
            {purchase.items?.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.product?.name || `Produit #${item.product_id}`}</td>
                <td className="p-2 text-right">
                  <Input
                    type="number"
                    value={item.quantity}
                    className="w-20 text-right"
                    min={1}
                    onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                  />
                </td>
                <td className="p-2 text-right">
                  <Input
                    type="number"
                    value={item.unit_price}
                    className="w-28 text-right"
                    min={0}
                    disabled
                  />
                </td>
                <td className="p-2 text-right">
                  <Input
                    type="number"
                    value={item.selling_price || 0}
                    className="w-28 text-right"
                    min={0}
                    disabled
                  />
                </td>
                <td className="p-2 text-right">{item.total_price?.toLocaleString('fr-FR')} GNF</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <Button 
          variant="outline"
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSave}
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
