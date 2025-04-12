
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/types/category";

interface IncomeFormProps {
  onSubmit: (data: {
    amount: number;
    description: string;
    category_id: string;
  }) => void;
  categories: Category[];
  isLoading?: boolean;
}

export function IncomeForm({ onSubmit, categories, isLoading = false }: IncomeFormProps) {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0 && description.trim() && categoryId) {
      onSubmit({
        amount,
        description,
        category_id: categoryId
      });
      setAmount(0);
      setDescription("");
      setCategoryId("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un revenu</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="amount">Montant</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Montant"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
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
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description du revenu"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Ajouter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
