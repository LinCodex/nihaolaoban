
import React, { useState } from 'react';
import { Search, DollarSign, Briefcase, TrendingUp } from 'lucide-react';
import { Reveal } from './ui/Reveal';
import { SearchFilters } from '../types';
import { CustomSelect, Option } from './ui/CustomSelect';
import { LocationSelector } from './ui/LocationSelector';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  onSearch: (filters: SearchFilters) => void;
}

// Externalize static options to prevent recreation on re-render
const getPriceOptions = (t: any): Option[] => [
  { label: t('options.any'), value: 'Any' },
  { label: t('options.lowPrice'), value: 'low' },
  { label: t('options.midPrice'), value: 'mid' },
  { label: t('options.highPrice'), value: 'high' }
];

const getCategoryOptions = (t: any): Option[] => [
  { label: t('options.any'), value: 'Any' },
  { label: t('options.restaurant'), value: 'Restaurant' },
  { label: t('options.beauty'), value: 'Beauty' },
  { label: t('options.other'), value: 'Other' }
];

const getCashFlowOptions = (t: any): Option[] => [
  { label: t('options.any'), value: 'Any' },
  { label: t('options.cf50'), value: '50k' },
  { label: t('options.cf100'), value: '100k' },
  { label: t('options.cf250'), value: '250k' },
];

const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('Any');
  const [category, setCategory] = useState('Any');
  const [cashFlow, setCashFlow] = useState('Any');
  
  // State to manage z-index stacking of dropdowns
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const { t } = useLanguage();

  const handleSearch = () => {
    onSearch({
      location: location || undefined,
      priceRange: price !== 'Any' ? price : undefined,
      category: category !== 'Any' ? category : undefined,
      cashFlow: cashFlow !== 'Any' ? cashFlow : undefined,
    });
  };

  const toggleDropdown = (id: string) => {
      setActiveDropdown(prev => prev === id ? null : id);
  };

  const closeAll = () => setActiveDropdown(null);

  return (
    <section className="relative px-4 md:px-8 pb-12 pt-4 z-40">
      <Reveal width="100%">
        {/* Increased mobile height to prevent layout shift */}
        <div className="relative w-full h-[720px] md:h-[750px] group">
          
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden bg-gray-200">
            {/* LCP Optimization: fetchPriority='high' and eager loading */}
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2670&auto=format&fit=crop&fm=webp" 
              alt="Business Office" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
            
            <div className="absolute top-12 md:top-24 left-6 md:left-16 max-w-3xl z-10 pr-4">
              <h1 className="text-3xl sm:text-4xl md:text-[5.5rem] leading-tight md:leading-[0.95] font-display font-bold text-white tracking-tighter mb-4 md:mb-6 drop-shadow-lg whitespace-pre-wrap">
                {t('hero.title')}
              </h1>
              <p className="text-white/90 text-sm sm:text-xl font-medium max-w-xl leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </div>
          </div>

          <div className="absolute bottom-6 md:bottom-12 left-4 md:left-12 right-4 md:right-12 z-30">
            <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-[2.5rem] p-2 shadow-2xl flex flex-col lg:flex-row items-stretch gap-2 max-w-6xl mx-auto transition-all duration-300 hover:bg-white glass-panel">
              
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                
                {/* Enhanced Location Selector */}
                <div 
                    className={`relative group p-3 md:p-4 rounded-[2rem] hover:bg-gray-50 transition-all duration-300 ${activeDropdown === 'location' ? 'z-50 bg-gray-50' : 'z-10'}`}
                >
                   <LocationSelector 
                     value={location}
                     onChange={setLocation}
                     isOpen={activeDropdown === 'location'}
                     onToggle={() => toggleDropdown('location')}
                     onClose={closeAll}
                   />
                </div>

                {/* Industry Dropdown */}
                <div 
                    onClick={() => toggleDropdown('category')}
                    className={`relative group p-3 md:p-4 rounded-[2rem] hover:bg-gray-50 transition-all duration-300 cursor-pointer ${activeDropdown === 'category' ? 'z-50 bg-gray-50' : 'z-10'}`}
                >
                  <div className="flex items-center gap-3 md:gap-4 h-full pointer-events-none">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-brand-black transition-all duration-300 shadow-sm shrink-0">
                      <Briefcase size={20} className="transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 justify-center relative">
                      <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5 md:mb-1 group-hover:text-brand-black transition-colors">{t('hero.category')}</label>
                      <div className="pointer-events-auto">
                          <CustomSelect 
                            options={getCategoryOptions(t)}
                            value={category}
                            onChange={setCategory}
                            className="w-full text-base"
                            isOpen={activeDropdown === 'category'}
                            onClose={closeAll}
                          />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Dropdown */}
                <div 
                    onClick={() => toggleDropdown('price')}
                    className={`relative group p-3 md:p-4 rounded-[2rem] hover:bg-gray-50 transition-all duration-300 cursor-pointer ${activeDropdown === 'price' ? 'z-50 bg-gray-50' : 'z-10'}`}
                >
                  <div className="flex items-center gap-3 md:gap-4 h-full pointer-events-none">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-brand-black transition-all duration-300 shadow-sm shrink-0">
                      <DollarSign size={20} className="transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 justify-center relative">
                      <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5 md:mb-1 group-hover:text-brand-black transition-colors">{t('hero.price')}</label>
                      <div className="pointer-events-auto">
                          <CustomSelect 
                            options={getPriceOptions(t)}
                            value={price}
                            onChange={setPrice}
                            className="w-full text-base"
                            isOpen={activeDropdown === 'price'}
                            onClose={closeAll}
                          />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cash Flow Dropdown */}
                <div 
                    onClick={() => toggleDropdown('cashflow')}
                    className={`relative group p-3 md:p-4 rounded-[2rem] hover:bg-gray-50 transition-all duration-300 cursor-pointer ${activeDropdown === 'cashflow' ? 'z-50 bg-gray-50' : 'z-10'}`}
                >
                   <div className="flex items-center gap-3 md:gap-4 h-full pointer-events-none">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-brand-black transition-all duration-300 shadow-sm shrink-0">
                      <TrendingUp size={20} className="transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 justify-center relative">
                      <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5 md:mb-1 group-hover:text-brand-black transition-colors">{t('hero.cashFlow')}</label>
                      <div className="pointer-events-auto">
                          <CustomSelect 
                            options={getCashFlowOptions(t)}
                            value={cashFlow}
                            onChange={setCashFlow}
                            className="w-full text-base"
                            isOpen={activeDropdown === 'cashflow'}
                            onClose={closeAll}
                          />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <button 
                onClick={handleSearch}
                className="bg-brand-black text-white rounded-[2rem] px-8 py-4 lg:py-0 lg:h-auto font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-900 hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-brand-black/20 m-2 lg:m-0 z-10"
              >
                <Search size={22} />
                <span className="lg:hidden">{t('hero.search')}</span>
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default Hero;
