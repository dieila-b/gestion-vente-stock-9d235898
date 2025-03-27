import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CatalogProduct } from "@/types/catalog";
import { useState } from "react";
import { InvoiceProductModal } from "./form/InvoiceProductModal";
import { InvoiceFormHeader } from "./form/InvoiceFormHeader";
import { InvoiceFormActions } from "./form/InvoiceFormActions";
import { InvoiceClientInfo } from "./form/InvoiceClientInfo";
import { InvoiceAmounts } from "./form/InvoiceAmounts";
import { useProducts } from "@/hooks/use-products";
import { Plus, X, FileText } from "lucide-react";
import { formatGNF } from "@/lib/currency";
import { SignatureInput } from "./form/SignatureInput";

interface InvoiceFormProps {
  formData: {
    invoiceNumber: string;
    clientName: string;
    clientEmail: string;
    amount: string;
    description: string;
    vatRate: string;
    signature: string;
    discount: string;
    posLocationId?: string;
  };
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  selectedProducts: InvoiceProduct[];
  onAddProduct: (product: CatalogProduct) => void;
  onRemoveProduct: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onPreviewToggle: () => void;
  onPosLocationChange?: (value: string) => void;
}

interface InvoiceProduct extends CatalogProduct {
  quantity: number;
  discount: number;
}

export const InvoiceForm = ({ 
  formData, 
  onClose, 
  onInputChange,
  onSubmit,
  selectedProducts,
  onAddProduct,
  onRemoveProduct,
  onUpdateQuantity,
  onUpdateDiscount,
  onPreviewToggle,
  onPosLocationChange
}: InvoiceFormProps) => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { products } = useProducts();

  const handleSignatureChange = (value: string) => {
    onInputChange({
      target: {
        name: 'signature',
        value
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.reference && product.reference.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleDiscountChange = (productId: string, value: string) => {
    const discount = parseInt(value) || 0;
    onUpdateDiscount(productId, discount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InvoiceFormHeader onClose={onClose} />
      
      <InvoiceClientInfo 
        formData={formData}
        onInputChange={onInputChange}
        onPosLocationChange={onPosLocationChange}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Produits</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onPreviewToggle}
              className="enhanced-glass"
            >
              <FileText className="h-4 w-4 mr-2" />
              Aperçu facture
            </Button>
            <Button
              type="button"
              onClick={() => setIsProductModalOpen(true)}
              className="enhanced-glass"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {selectedProducts.map(product => (
            <div
              key={product.id}
              className="enhanced-glass p-4 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatGNF(product.price)} × {product.quantity} = {formatGNF(product.price * product.quantity)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => onUpdateQuantity(product.id, parseInt(e.target.value) || 1)}
                    className="w-20 enhanced-glass"
                    min="1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveProduct(product.id)}
                    className="hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <Input
                  type="number"
                  placeholder="Remise en GNF"
                  value={product.discount || ""}
                  onChange={(e) => handleDiscountChange(product.id, e.target.value)}
                  className="enhanced-glass"
                  min="0"
                  max={product.price * product.quantity}
                />
                {product.discount > 0 && (
                  <p className="text-sm text-red-400 mt-1">
                    Remise: -{formatGNF(product.discount)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Description</label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          className="enhanced-glass min-h-[100px]"
          placeholder="Détails de la facture..."
        />
      </div>

      <SignatureInput 
        value={formData.signature}
        onChange={handleSignatureChange}
      />

      <InvoiceFormActions onSubmit={onSubmit} formData={formData} />

      <InvoiceProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddProduct={onAddProduct}
        products={filteredProducts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </form>
  );
};
