import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/types/Category";

interface Income {
  id?: string;
  amount: number;
  description?: string;
  category_id: string;
  created_at?: string;
}

interface IncomeFormProps {
  onSubmit: (data: Partial<Income>) => Promise<any>;
  categories: Category[];
  isLoading?: boolean;
}

export function IncomeForm({ onSubmit, categories, isLoading = false }: IncomeFormProps) {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && description && categoryId) {
      try {
        await onSubmit({
          amount,
          description,
          category_id: categoryId
        });
        setAmount(0);
        setDescription("");
        setCategoryId("");
      } catch (error) {
        console.error("Error submitting income:", error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un revenu</CardTitle>
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
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer le revenu"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
