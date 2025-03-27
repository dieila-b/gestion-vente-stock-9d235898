
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ArrowLeft, FileText, Package, Plus, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { SupplierReturn, SupplierReturnItem } from "@/types/purchase";

const SupplierReturnsPage = () => {
  const [purchaseInvoice, setPurchaseInvoice] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    reason: string;
  }>>([]);

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, {
      product_id: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      reason: ""
    }]);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async () => {
    try {
      const returnNumber = `SR-${Date.now()}`;
      const { data: returnData, error: returnError } = await supabase
        .from('supplier_returns')
        .insert({
          return_number: returnNumber,
          purchase_invoice_id: purchaseInvoice,
          reason,
          notes,
          total_amount: calculateTotal(),
          status: 'pending'
        })
        .select()
        .single();

      if (returnError) throw returnError;

      const returnItems = selectedProducts.map(item => ({
        supplier_return_id: returnData.id,
        ...item
      }));

      const { error: itemsError } = await supabase
        .from('supplier_return_items')
        .insert(returnItems);

      if (itemsError) throw itemsError;

      toast.success("Retour fournisseur créé avec succès");
    } catch (error) {
      console.error('Error creating supplier return:', error);
      toast.error("Erreur lors de la création du retour fournisseur");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gradient">Nouveau Retour Fournisseur</h1>
            <p className="text-muted-foreground">Enregistrez un retour de marchandises au fournisseur</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="neo-blur">
              <FileText className="w-4 h-4 mr-2" />
              Aperçu
            </Button>
            <Button onClick={handleSubmit} className="neo-blur">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="p-6 neo-blur">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Facture d'achat associée</Label>
                <Select value={purchaseInvoice} onValueChange={setPurchaseInvoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une facture" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Add purchase invoices list here */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Motif général du retour</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Raison principale du retour"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 neo-blur">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Produits à retourner</h2>
                <Button onClick={handleAddProduct} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>

              <div className="space-y-4">
                {selectedProducts.map((item, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 p-4 rounded-lg neo-blur">
                    <Select
                      value={item.product_id}
                      onValueChange={(value) => {
                        const newProducts = [...selectedProducts];
                        newProducts[index] = { ...newProducts[index], product_id: value };
                        setSelectedProducts(newProducts);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Add products list here */}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newProducts = [...selectedProducts];
                        const quantity = parseInt(e.target.value);
                        newProducts[index] = {
                          ...newProducts[index],
                          quantity,
                          total_price: quantity * item.unit_price
                        };
                        setSelectedProducts(newProducts);
                      }}
                      min={1}
                      placeholder="Quantité"
                    />
                    <Input
                      type="text"
                      value={item.reason}
                      onChange={(e) => {
                        const newProducts = [...selectedProducts];
                        newProducts[index] = { ...newProducts[index], reason: e.target.value };
                        setSelectedProducts(newProducts);
                      }}
                      placeholder="Motif du retour"
                    />
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => {
                        const newProducts = [...selectedProducts];
                        const unitPrice = parseFloat(e.target.value);
                        newProducts[index] = {
                          ...newProducts[index],
                          unit_price: unitPrice,
                          total_price: item.quantity * unitPrice
                        };
                        setSelectedProducts(newProducts);
                      }}
                      min={0}
                      placeholder="Prix unitaire"
                    />
                    <Input
                      value={item.total_price}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 neo-blur">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes additionnelles..."
                className="min-h-[100px]"
              />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SupplierReturnsPage;
