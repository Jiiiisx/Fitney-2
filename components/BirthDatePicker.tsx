"use client";

import * as React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format, getDaysInMonth, setMonth, setYear } from "date-fns";

interface BirthDatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function BirthDatePicker({ value, onChange }: BirthDatePickerProps) {
  // Parse initial value
  const initialDate = value ? new Date(value) : null;
  
  const [day, setDay] = React.useState<string>(initialDate ? initialDate.getDate().toString() : "");
  const [month, setMonthIdx] = React.useState<string>(initialDate ? initialDate.getMonth().toString() : "");
  const [year, setYearVal] = React.useState<string>(initialDate ? initialDate.getFullYear().toString() : "");

  // Generate years (from current year down to 100 years ago)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  // Generate days based on month and year
  const daysInMonth = (month && year) 
    ? getDaysInMonth(new Date(parseInt(year), parseInt(month))) 
    : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

  // Update parent when any value changes
  React.useEffect(() => {
    if (day && month && year) {
      const d = parseInt(day);
      const m = parseInt(month);
      const y = parseInt(year);
      
      // Ensure day is valid for the selected month/year
      const maxDays = getDaysInMonth(new Date(y, m));
      const validDay = d > maxDays ? maxDays : d;
      
      if (validDay !== d) {
        setDay(validDay.toString());
        return;
      }
      
      const date = new Date(y, m, validDay);
      const formattedDate = format(date, "yyyy-MM-dd");
      
      // Only call onChange if the value has actually changed to avoid potential loops
      if (formattedDate !== value) {
        onChange(formattedDate);
      }
    }
  }, [day, month, year, onChange, value]);

  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {/* Day */}
      <Select value={day} onValueChange={setDay}>
        <SelectTrigger className="rounded-xl h-14 font-bold border-2">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Month */}
      <Select value={month} onValueChange={setMonthIdx}>
        <SelectTrigger className="rounded-xl h-14 font-bold border-2">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {months.map((m, idx) => (
            <SelectItem key={m} value={idx.toString()}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year */}
      <Select value={year} onValueChange={setYearVal}>
        <SelectTrigger className="rounded-xl h-14 font-bold border-2">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
