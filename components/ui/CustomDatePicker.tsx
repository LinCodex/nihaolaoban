import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "Select date",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse value or default to today
  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(initialDate); // For navigating months without changing selection

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDayClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Adjust for timezone offset to ensure the date string is correct
    const offset = newDate.getTimezoneOffset();
    const adjustedDate = new Date(newDate.getTime() - (offset*60*1000));
    
    onChange(adjustedDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const changeMonth = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const days = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const dayElements = [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Header
    const header = (
      <div className="flex items-center justify-between mb-4 px-1">
        <button onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className="p-1 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft size={16} /></button>
        <span className="font-bold text-brand-black text-sm">{monthNames[month]} {year}</span>
        <button onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className="p-1 hover:bg-gray-100 rounded-full text-gray-600"><ChevronRight size={16} /></button>
      </div>
    );

    // Days of week
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
      <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
    ));

    // Empty slots for start of month
    for (let i = 0; i < startDay; i++) {
      dayElements.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days
    for (let d = 1; d <= days; d++) {
        const currentDateStr = formatDate(new Date(year, month, d));
        const isSelected = value === currentDateStr;
        const isToday = formatDate(new Date()) === currentDateStr;

        dayElements.push(
            <button
                key={d}
                onClick={(e) => { e.stopPropagation(); handleDayClick(d); }}
                className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all mx-auto
                    ${isSelected ? 'bg-brand-black text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}
                    ${!isSelected && isToday ? 'text-brand-accent font-bold bg-red-50' : ''}
                `}
            >
                {d}
            </button>
        );
    }

    return (
        <div className="p-4 bg-white rounded-2xl shadow-xl border border-gray-100 w-64">
            {header}
            <div className="grid grid-cols-7 gap-y-1">
                {weekDays}
                {dayElements}
            </div>
            {value && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false); }}
                        className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-full transition-colors"
                    >
                        Clear Date
                    </button>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 cursor-pointer hover:border-brand-black/30 transition-colors
            ${isOpen ? 'ring-2 ring-brand-black/5 border-brand-black/30' : ''}
        `}
      >
        <CalendarIcon size={16} className="text-gray-400" />
        <span className={`text-sm font-medium ${value ? 'text-brand-black' : 'text-gray-400'} truncate select-none`}>
            {value ? new Date(value).toLocaleDateString() : placeholder}
        </span>
        {value && (
            <button 
                onClick={(e) => { e.stopPropagation(); onChange(''); }}
                className="ml-auto p-0.5 hover:bg-gray-100 rounded-full text-gray-400"
            >
                <X size={14} />
            </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 animate-fade-up">
            {renderCalendar()}
        </div>
      )}
    </div>
  );
};