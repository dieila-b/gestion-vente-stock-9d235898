
import { CategoryList } from "./CategoryList";
import { useCategoriesData } from "./useCategoriesData";

export function CategoryListContainer() {
  const { categories, refetch } = useCategoriesData();

  return (
    <CategoryList 
      categories={categories} 
      onRefetch={refetch} 
    />
  );
}
