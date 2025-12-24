
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X, TrendingUp } from 'lucide-react';
import { POPULAR_LOCATIONS, ALL_LOCATIONS } from '../../constants/locations';
import { useLanguage } from '../../contexts/LanguageContext';

interface LocationSelectorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  value, 
  onChange, 
  placeholder,
  className = "",
  isOpen: controlledIsOpen,
  onToggle,
  onClose
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
      setInputValue(value);
  }, [value]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    if (!isOpen) {
        if (isControlled && onToggle) onToggle();
        else setInternalIsOpen(true);
    }
  };

  const handleSelect = (val: string) => {
    setInputValue(val);
    onChange(val);
    if (isControlled && onClose) onClose();
    else setInternalIsOpen(false);
  };

  const filtered = ALL_LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="flex items-center gap-3 md:gap-4 h-full">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-brand-black transition-all duration-300 shadow-sm shrink-0">
          <MapPin size={20} className="transition-transform group-hover:scale-110" />
        </div>
        <div className="flex flex-col flex-1 min-w-0 justify-center relative h-full">
          <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5 md:mb-1 group-hover:text-brand-black transition-colors">
            {t('hero.location')}
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => {
                  if (isControlled && onToggle) onToggle();
                  else setInternalIsOpen(true);
              }}
              placeholder={placeholder || t('hero.locationPlaceholder')}
              className="w-full bg-transparent font-bold text-base text-brand-black placeholder:text-gray-400 focus:outline-none h-full truncate"
            />
            {inputValue && (
                <button 
                    onClick={() => handleSelect('')}
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-black transition-colors"
                >
                    <X size={14} />
                </button>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <div 
        className={`
          absolute z-50 w-full md:w-[320px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 py-3 overflow-hidden
          transition-all duration-200 ease-out top-full mt-2 origin-top
          ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
          left-0
        `}
      >
        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
          {!inputValue && (
            <div className="mb-2">
                <div className="px-4 py-2 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   <TrendingUp size={12} /> {t('hero.popularLocations')}
                </div>
                {POPULAR_LOCATIONS.map(loc => (
                    <button
                        key={loc}
                        onClick={() => handleSelect(loc)}
                        className="w-full text-left px-4 py-3 text-sm font-bold flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-brand-black transition-all"
                    >
                        <MapPin size={14} className="text-gray-300" />
                        {loc}
                    </button>
                ))}
            </div>
          )}

          {inputValue && (
             <div>
                <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   {t('hero.allLocations')}
                </div>
                {filtered.length > 0 ? filtered.map(loc => (
                    <button
                        key={loc}
                        onClick={() => handleSelect(loc)}
                        className="w-full text-left px-4 py-3 text-sm font-bold flex items-center gap-3 text-gray-600 hover:bg-gray-50 hover:text-brand-black transition-all"
                    >
                        <MapPin size={14} className="text-gray-300" />
                        {loc}
                    </button>
                )) : (
                    <div className="px-4 py-3 text-xs text-gray-400 italic">No matches found</div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
