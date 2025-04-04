import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatGNF } from "@/lib/currency";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  order: any | null;
}

export function OrderDialog({ open, onClose, onSave, order }: OrderDialogProps) {
  const [formData, setFormData] = useState({
    client_name: "",
    status: "pending",
    items: [] as OrderItem[]
  });
  
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    price: 0
  });

  // Calculate total
  const totalAmount = formData.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (order) {
      setFormData({
        client_name: order.client_name,
        status: order.status,
        items: [...order.items]
      });
    } else {
      setFormData({
        client_name: "",
        status: "pending",
        items: []
      });
    }
  }, [order, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value });
  };

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: name === "quantity" ? parseInt(value) || 0 : name === "price" ? parseFloat(value) || 0 : value });
  };

  const handleAddItem = () => {
    if (!newItem.name || newItem.quantity <= 0 || newItem.price <= 0) return;
    
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: Date.now().toString(),
          name: newItem.name,
          quantity: newItem.quantity,
          price: newItem.price
        }
      ]
    });
    
    // Reset new item form
    setNewItem({
      name: "",
      quantity: 1,
      price: 0
    });
  };

  const handleRemoveItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      total_amount: totalAmount
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{order ? "Modifier la commande" : "Nouvelle commande"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="client_name">Client</Label>
              <Input
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
                placeholder="Nom du client"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="canceled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Items Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Articles</h3>
            
            {/* Existing Items */}
            {formData.items.length > 0 && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead className="text-center">Quantité</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{formatGNF(item.price)}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatGNF(item.price * item.quantity)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                      <TableCell className="text-right font-medium">{formatGNF(totalAmount)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Add New Item */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <Label htmlFor="item_name" className="sr-only">Article</Label>
                <Input
                  id="item_name"
                  name="name"
                  value={newItem.name}
                  onChange={handleNewItemChange}
                  placeholder="Nom de l'article"
                />
              </div>
              <div className="w-full sm:w-24">
                <Label htmlFor="item_quantity" className="sr-only">Quantité</Label>
                <Input
                  id="item_quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={handleNewItemChange}
                  placeholder="Qté"
                />
              </div>
              <div className="w-full sm:w-32">
                <Label htmlFor="item_price" className="sr-only">Prix</Label>
                <Input
                  id="item_price"
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={newItem.price}
                  onChange={handleNewItemChange}
                  placeholder="Prix"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddItem}
                disabled={!newItem.name || newItem.quantity <= 0 || newItem.price <= 0}
                className={cn(formData.items.length === 0 ? "animate-pulse" : "")}
              >
                Ajouter
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={formData.items.length === 0 || !formData.client_name}>
              {order ? "Mettre à jour" : "Créer la commande"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
