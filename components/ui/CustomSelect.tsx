
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  dropdownClassName?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  className = "",
  dropdownClassName = "w-full md:w-[140%]",
  isOpen: controlledIsOpen,
  onToggle,
  onClose
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder || value;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isControlled && onClose) {
            onClose();
        } else {
            setInternalIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isControlled, onClose]);

  // Determine open direction
  useEffect(() => {
    if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 250) { // If less than 250px below, open upwards
            setPosition('top');
        } else {
            setPosition('bottom');
        }
    }
  }, [isOpen]);

  const handleToggle = () => {
      if (isControlled && onToggle) {
          onToggle();
      } else {
          setInternalIsOpen(!internalIsOpen);
      }
  };

  const handleSelect = (val: string) => {
      onChange(val);
      if (isControlled && onClose) {
          onClose();
      } else {
          setInternalIsOpen(false);
      }
  };

  return (
    <div className={`relative ${className} ${isOpen ? 'z-50' : 'z-auto'}`} ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-2 text-left bg-transparent focus:outline-none group/select min-h-[24px]"
      >
        <span className="truncate block font-bold text-brand-black text-sm md:text-base">{selectedLabel}</span>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-300 group-hover/select:text-brand-black ${isOpen ? 'rotate-180 text-brand-black' : 'rotate-0'}`} 
        />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`
          absolute z-50 ${dropdownClassName} bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 py-2 overflow-hidden
          transition-all duration-200 ease-out 
          ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
          ${position === 'bottom' ? 'top-full mt-2 origin-top' : 'bottom-full mb-2 origin-bottom'}
          left-0
        `}
      >
        <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between rounded-xl transition-all duration-200
                ${value === option.value ? 'text-brand-black bg-gray-50' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-black'}
              `}
            >
              {option.label}
              {value === option.value && <Check size={14} className="text-brand-black" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
