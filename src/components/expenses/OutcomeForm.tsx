
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/types/category"; // Fixed the casing
import { Outcome } from "@/types/outcome";

interface OutcomeFormProps {
  onSubmit: (data: Partial<Outcome>) => Promise<any>;
  categories: Category[];
  isLoading?: boolean;
}

export function OutcomeForm({ onSubmit, categories, isLoading = false }: OutcomeFormProps) {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [receiptNumber, setReceiptNumber] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && description && categoryId) {
      try {
        await onSubmit({
          amount,
          description,
          category_id: categoryId,
          payment_method: paymentMethod,
          receipt_number: receiptNumber || undefined,
          date: new Date().toISOString()
        });
        // Reset form
        setAmount(0);
        setDescription("");
        setCategoryId("");
        setPaymentMethod("cash");
        setReceiptNumber("");
      } catch (error) {
        console.error("Error submitting outcome:", error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter une dépense</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount">Montant</Label>
            <Input
              id="amount"
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="paymentMethod">Mode de paiement</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="card">Carte bancaire</SelectItem>
                <SelectItem value="transfer">Virement</SelectItem>
                <SelectItem value="check">Chèque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="receiptNumber">Numéro de reçu (optionnel)</Label>
            <Input
              id="receiptNumber"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer la dépense"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
