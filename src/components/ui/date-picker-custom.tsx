
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { fr } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  className?: string
}

export function DatePickerCustom({ date, onDateChange, className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full neo-blur border-white/10 justify-start text-left font-normal",
            !date && "text-white/40",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-white/60" />
          {date ? (
            format(date, "dd/MM/yyyy", { locale: fr })
          ) : (
            <span>Sélectionner une date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 neo-blur border-white/10 bg-black/30 z-50" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="p-3 pointer-events-auto"
          locale={fr}
        />
      </PopoverContent>
    </Popover>
  )
}
