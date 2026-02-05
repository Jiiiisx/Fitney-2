"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <h3 className="font-bold text-sm sm:text-base text-foreground">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-full transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-full transition-colors">
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 mb-1 sm:mb-2 text-center">
        {weekDays.map(day => (
          <div key={day} className="text-[10px] sm:text-xs font-bold text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-0.5 sm:gap-y-1 text-center">
        {calendarDays.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={idx} 
              className={`
                text-[11px] sm:text-sm py-1 sm:py-1.5 rounded-full flex items-center justify-center
                ${!isCurrentMonth ? 'text-muted-foreground/30' : 'text-foreground'}
                ${isToday ? 'bg-primary text-primary-foreground font-bold shadow-sm' : ''}
              `}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
