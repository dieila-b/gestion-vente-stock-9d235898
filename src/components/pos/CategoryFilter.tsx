
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryFilterProps {
  categories?: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onCategorySelect?: (category: string) => void;  // Added for backward compatibility
}

export function CategoryFilter({ 
  categories = [], 
  selectedCategory, 
  onSelectCategory,
  onCategorySelect 
}: CategoryFilterProps) {
  const handleSelect = (category: string) => {
    onSelectCategory(category);
    if (onCategorySelect) onCategorySelect(category);
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-2 px-1">
        <Badge
          variant={selectedCategory === "" ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => handleSelect("")}
        >
          Tous
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => handleSelect(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
