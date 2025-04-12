
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryFormProps {
  onSubmit: (data: { name: string }) => void;
  isLoading?: boolean;
  type?: 'expense' | 'income';
}

export function CategoryForm({ onSubmit, isLoading = false, type = 'expense' }: CategoryFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name });
      setName("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === 'expense' ? 'Ajouter une catégorie de dépense' : 'Ajouter une catégorie de revenu'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input
                id="name"
                placeholder="Nom de la catégorie"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
