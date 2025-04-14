
import { useState } from "react";
import { CategoriesHeader } from "./categories/CategoriesHeader";
import { CategoryListContainer } from "./categories/CategoryListContainer";
import { AddCategoryDialog } from "./categories/AddCategoryDialog";
import { useCategoriesData } from "./categories/useCategoriesData";

export function CategoriesTab() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { refetch } = useCategoriesData();

  return (
    <div className="space-y-6">
      <div className="relative">
        <CategoriesHeader onAddClick={() => setIsAddDialogOpen(true)} />
        <div className="mt-4">
          <CategoryListContainer />
        </div>
      </div>

      <AddCategoryDialog 
        isOpen={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
