"use client";

import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DatePickerDemo({ date, setDate }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[110px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 text-sm h-4 w-4" />
          {date ? format(date, "dd/MM/yy") : <span className="text-sm">Choisir</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto flex items-center justify-center flex-col p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
        {date && (
      <Button variant="ghost" className="mb-4" size="icon" onClick={() => setDate(undefined)}>
        <X className="h-4 w-4  text-gray-500" />
      </Button>
    )}
      </PopoverContent>
    
    </Popover>
   
  );
}
