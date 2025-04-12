
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  onChange?: (date: Date | undefined) => void;  // Added for backward compatibility
  className?: string;
}

export function DatePicker({ 
  date, 
  onSelect, 
  onChange,  // Added this prop for backward compatibility
  className 
}: DatePickerProps) {
  // Handle the onChange and onSelect props together
  const handleSelect = (selectedDate: Date | undefined) => {
    if (onSelect) onSelect(selectedDate);
    if (onChange) onChange(selectedDate);  // Support legacy code
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Sélectionner une date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
