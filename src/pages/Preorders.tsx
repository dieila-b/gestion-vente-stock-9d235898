import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, XCircle } from "lucide-react";
import { useCart } from "@/store/cart";
import { ProductCard } from "@/components/pos/ProductCard";
import { Product } from "@/types/pos";
import { toast } from "sonner";
import { PreorderCart } from "@/components/pos/PreorderCart";
import { Client } from "@/types/client_unified";
import { PreorderInvoiceView } from "@/components/preorder/PreorderInvoiceView";
import useEditOrder from "@/hooks/use-edit-order";
import { usePreorderPayment } from "@/components/preorder/hooks/usePreorderPayment";

export default function Preorders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editOrder');
  const isEditing = !!editId;

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCart,
    updateDiscount,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentPreorder, setCurrentPreorder] = useState<any>(null);

  const editOrderData = useEditOrder();

  useEffect(() => {
    if (editOrderData && !editOrderData.isLoading && editOrderData.selectedClient) {
      setCurrentClient(editOrderData.selectedClient as any);
      if (editOrderData.cart && editOrderData.cart.length > 0) {
        handleSetCart(editOrderData.cart);
      }
    }
  }, [editOrderData, setCurrentClient, setCart]);

  useEffect(() => {
    // Fetch products from your data source here
    // For example:
    const fetchProducts = async () => {
      // Replace this with your actual data fetching logic
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Product 1",
          price: 1000,
          category: "Category 1",
          stock: 10,
          reference: "REF123",
          image_url: "https://via.placeholder.com/150",
        },
        {
          id: "2",
          name: "Product 2",
          price: 2000,
          category: "Category 2",
          stock: 5,
          reference: "REF456",
          image_url: "https://via.placeholder.com/150",
        },
      ];
      setProducts(mockProducts);
    };

    fetchProducts();
  }, []);

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const calculateTotalDiscount = () => {
    return cart.reduce((acc, item) => acc + (item.discount || 0), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateTotalDiscount();
  };

  const validatePreorder = () => {
    if (!currentClient) {
      toast.warning("Veuillez sélectionner un client pour finaliser la précommande");
      return false;
    }

    if (cart.length === 0) {
      toast.error("Veuillez ajouter des produits à la précommande");
      return false;
    }

    return true;
  };

  const { handleCheckout, handlePayment } = usePreorderPayment(
    currentClient,
    cart,
    clearCart,
    setShowPaymentDialog,
    setCurrentPreorder,
    setShowInvoiceDialog,
    isEditing,
    editId,
    setIsLoading
  );

  // Replace the cart and state setting functions with updated versions that correctly handle type conversion
  const handleSetCart = (newCart: any[]) => {
    // Convert cart items from pos.CartItem to CartState.CartItem format
    const convertedCart = newCart.map(item => ({
      ...item,
      subtotal: (item.price * item.quantity) - (item.discount || 0) // Ensure subtotal is calculated
    }));
    setCart(convertedCart);
  };

  // Update the onUpdateDiscount handler to match expected parameter count
  const handleUpdateDiscount = (discount: number) => {
    // This is a wrapper to adapt signature
    // You might need implementation based on your actual requirements
    console.log("Update discount called with:", discount);
  };

  // For specific functions that require the wrong signature, create adapters
  const adaptedUpdateDiscount = (id: string, discount: number) => {
    // Original function that takes both parameters
    updateDiscount(id, discount);
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Créer une précommande</CardTitle>
          <CardDescription>
            Sélectionnez un client et ajoutez des produits à la commande.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <Select
                value={currentClient?.id}
                onValueChange={(value) => {
                  const selectedClient = editOrderData?.orderData?.client || null;
                  setCurrentClient(selectedClient);
                }}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {/* Replace this with your actual client list */}
                  {/* For example: */}
                  {/* {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company_name || client.contact_name}
                    </SelectItem>
                  ))} */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Ajouter des notes à la commande"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>

          <PreorderCart
            items={cart}
            onRemoveItem={removeFromCart}
            onQuantityChange={updateQuantity}
            onSubmit={() => handleCheckout(validatePreorder)}
            onNotesChange={setNotes}
            notes={notes}
            isLoading={isLoading}
            clearCart={clearCart}
            selectedClient={currentClient}
            onUpdateDiscount={adaptedUpdateDiscount}
          />

          <Button onClick={() => navigate('/preorder-invoices')}>
            Voir les précommandes
          </Button>
        </CardContent>
      </Card>

      <PreorderInvoiceView
        cart={cart}
        client={currentClient}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onRequestPayment={() => handleCheckout(validatePreorder)}
        isLoading={isLoading}
        isInvoiceOpen={showInvoiceDialog}
        setIsInvoiceOpen={setShowInvoiceDialog}
        calculateTotal={calculateTotal}
        calculateSubtotal={calculateSubtotal}
        calculateTotalDiscount={calculateTotalDiscount}
        onUpdateDiscount={updateDiscount}
        notes={notes}
        onUpdateNotes={setNotes}
        showInvoiceDialog={showInvoiceDialog}
        handleCloseInvoice={() => setShowInvoiceDialog(false)}
        currentPreorder={currentPreorder}
        handlePrintInvoice={() => window.print()}
      />
    </div>
  );
}
