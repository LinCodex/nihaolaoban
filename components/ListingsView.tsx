
import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  ArrowLeft, Search, Filter, TrendingUp, DollarSign, ArrowUpRight, 
  BadgeCheck, Heart, Eye, ChevronLeft, ChevronRight, Star, MapPin as MapPinIcon,
  LayoutGrid, Map as MapIcon
} from 'lucide-react';
import { SearchFilters, Business } from '../types';
import { Reveal } from './ui/Reveal';
import { CustomSelect, Option } from './ui/CustomSelect';
import { LocationSelector } from './ui/LocationSelector';
import { MapView } from './MapView';
import { useLanguage } from '../contexts/LanguageContext';
import { useMarketplace } from '../contexts/MarketplaceContext';

// Helper for formatting money
const formatK = (num: number) => {
    return num >= 1000000 
      ? `$${(num / 1000000).toFixed(1)}M` 
      : `$${(num / 1000).toFixed(0)}k`;
};

// Externalize Options with clear labels
const getPriceOptions = (t: any): Option[] => [
    { label: `${t('hero.price')}: ${t('options.any')}`, value: 'Any' },
    { label: `${t('hero.price')}: ${t('options.lowPrice')}`, value: 'low' },
    { label: `${t('hero.price')}: ${t('options.midPrice')}`, value: 'mid' },
    { label: `${t('hero.price')}: ${t('options.highPrice')}`, value: 'high' }
];

const getCategoryOptions = (t: any): Option[] => [
    { label: `${t('hero.category')}: ${t('options.any')}`, value: 'Any' },
    { label: `${t('hero.category')}: ${t('options.restaurant')}`, value: 'Restaurant' },
    { label: `${t('hero.category')}: ${t('options.beauty')}`, value: 'Beauty' },
    { label: `${t('hero.category')}: ${t('options.retail')}`, value: 'Retail' },
    { label: `${t('hero.category')}: ${t('options.service')}`, value: 'Service' },
    { label: `${t('hero.category')}: ${t('options.other')}`, value: 'Other' }
];

const getCashFlowOptions = (t: any): Option[] => [
    { label: `${t('hero.cashFlow')}: ${t('options.any')}`, value: 'Any' },
    { label: `${t('hero.cashFlow')}: ${t('options.cf50')}`, value: '50k' },
    { label: `${t('hero.cashFlow')}: ${t('options.cf100')}`, value: '100k' },
    { label: `${t('hero.cashFlow')}: ${t('options.cf250')}`, value: '250k' }
];

const getSortOptions = (t: any): Option[] => [
    { label: `${t('listings.sortBy')}: ${t('listings.sortRecent')}`, value: 'recent' },
    { label: `${t('listings.sortBy')}: ${t('listings.sortViews')}`, value: 'views' }
];

interface BusinessCardProps {
    business: Business;
    onClick: (id: string) => void;
    t: any;
    index: number;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

// Memoized Card Component
const BusinessCard = memo(({ business, onClick, t, index, isFavorite, onToggleFavorite }: BusinessCardProps) => (
    <Reveal delay={index * 50} width="100%">
        <div 
            onClick={() => onClick(business.id)}
            className={`bg-white p-4 rounded-[2.5rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full flex flex-col border ${business.isPopular ? 'border-yellow-200 ring-4 ring-yellow-50' : 'border-transparent hover:border-gray-200'} relative`}
        >
            <div 
                className="relative h-64 w-full overflow-hidden rounded-[2rem] mb-4 shrink-0 bg-gray-50 isolate border border-gray-100"
                style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
            >
                <img 
                    src={business.image} 
                    alt={business.title} 
                    className="w-full h-full object-cover rounded-[2rem] group-hover:scale-105 transition-transform duration-700" 
                    loading="lazy"
                    decoding="async"
                />
                
                <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                    <div className="flex gap-2">
                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-black shadow-sm">
                            {t(`options.${business.category.toLowerCase()}`) || business.category}
                        </div>
                        {business.views > 0 && (
                            <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <Eye size={10} className="text-white" />
                                <span className="text-[10px] font-bold text-white">{business.views.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                    {business.isPopular && (
                        <div className="bg-yellow-400 text-brand-black px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm flex items-center gap-1">
                            <Star size={10} fill="currentColor" /> {t('listings.popular')}
                        </div>
                    )}
                </div>

                 <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${business.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {t(`listings.${business.status}`)}
                </div>
                
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <BadgeCheck size={12} className="text-white" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t(`sellerType.${business.sellerType}`)}</span>
                </div>

                <button 
                    onClick={(e) => onToggleFavorite(e, business.id)}
                    className="absolute bottom-4 right-4 w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all group/fav shadow-sm"
                >
                    <Heart size={20} className={`transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
            </div>
            
            <div className="px-2 flex-1 flex flex-col">
                <h3 className="text-xl font-display font-bold text-brand-black mb-1 line-clamp-1">{business.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-1 flex items-center gap-1">
                  <MapPinIcon size={14} className="text-gray-400" /> {business.location}
                </p>
                
                <div className="flex gap-3 mb-6">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                        <DollarSign size={14} /> {t('offers.rev')}: {formatK(business.grossRevenue)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                        <TrendingUp size={14} /> {t('offers.cf')}: {formatK(business.cashFlow)}
                    </span>
                </div>

                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-xl font-display font-bold">
                        ${business.price.toLocaleString()}
                    </div>
                    <div className="w-10 h-10 bg-black rounded-full text-white flex items-center justify-center group-hover:rotate-45 transition-transform shadow-lg shadow-black/20">
                        <ArrowUpRight size={18} />
                    </div>
                </div>
            </div>
        </div>
    </Reveal>
));

interface ListingsViewProps {
  initialFilters: SearchFilters;
  onBack: () => void;
  onPropertyClick: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const ITEMS_PER_PAGE = 20;

export const ListingsView: React.FC<ListingsViewProps> = ({ initialFilters, onBack, onPropertyClick, favorites, onToggleFavorite }) => {
  const { listings } = useMarketplace();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialFilters.location || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (viewMode === 'grid') {
        window.scrollTo(0, 0);
    }
  }, [currentPage, viewMode]);

  useEffect(() => {
    const handler = setTimeout(() => {
        setFilters(prev => ({ ...prev, location: searchTerm }));
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    let result = listings.filter(l => l.status === 'active' || l.status === 'sold');

    if (filters.category && filters.category !== 'Any') {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters.location) {
      result = result.filter(p => p.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }

    if (filters.priceRange && filters.priceRange !== 'Any') {
      if (filters.priceRange === 'low') {
        result = result.filter(p => p.price <= 200000);
      } else if (filters.priceRange === 'mid') {
        result = result.filter(p => p.price > 200000 && p.price <= 1000000);
      } else if (filters.priceRange === 'high') {
        result = result.filter(p => p.price > 1000000);
      }
    }

    if (filters.cashFlow && filters.cashFlow !== 'Any') {
       const minCashFlow = parseInt(filters.cashFlow.replace('k', '000'));
       result = result.filter(p => p.cashFlow >= minCashFlow);
    }

    result.sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;

        if (sortBy === 'views') {
            return b.views - a.views;
        } else {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return parseInt(b.id) - parseInt(a.id);
        }
    });

    const localizedResult = result.map(b => {
        if (language === 'zh' && b.translations?.zh) {
            return { ...b, ...b.translations.zh };
        }
        return b;
    });

    setFilteredBusinesses(localizedResult);
    setCurrentPage(1);
  }, [filters, listings, sortBy, language]); 

  const handleFavoriteClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onToggleFavorite(id);
  }, [onToggleFavorite]);

  const toggleDropdown = (id: string) => setActiveDropdown(prev => prev === id ? null : id);
  const closeAll = () => setActiveDropdown(null);

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE);
  const paginatedBusinesses = filteredBusinesses.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#EEF1EE] pt-6 pb-16 px-4 md:px-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-brand-black font-medium hover:opacity-70 transition-opacity"
            >
                <ArrowLeft size={20} /> {t('listings.back')}
            </button>
            
            {/* View Mode Toggle */}
            <div className="bg-white p-1 rounded-2xl flex border border-gray-100 shadow-sm">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-brand-black text-white' : 'text-gray-400 hover:text-brand-black'}`}
                >
                    <LayoutGrid size={18} /> Grid
                </button>
                <button 
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-brand-black text-white' : 'text-gray-400 hover:text-brand-black'}`}
                >
                    <MapIcon size={18} /> Map
                </button>
            </div>
        </div>

        <Reveal width="100%">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-black mb-4">
              {t('listings.title')}
            </h1>
        </Reveal>
        
        {/* Filter Bar */}
        <div className="bg-white p-3 rounded-[2.5rem] shadow-sm mt-8 flex flex-col xl:flex-row gap-4 items-center z-40 relative border border-gray-100">
            <div className="flex-1 w-full relative">
                <LocationSelector 
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={t('listings.searchPlaceholder')}
                    className="w-full px-4"
                    isOpen={activeDropdown === 'location'}
                    onToggle={() => toggleDropdown('location')}
                    onClose={closeAll}
                />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full xl:w-auto items-center px-2 overflow-visible">
                <div className="w-[calc(50%-4px)] md:w-[180px] shrink-0">
                  <CustomSelect 
                    options={getCategoryOptions(t)}
                    value={filters.category || 'Any'}
                    onChange={(val) => setFilters({...filters, category: val})}
                    className="bg-gray-50 px-4 py-2 rounded-xl border border-transparent hover:border-gray-200 transition-colors"
                    dropdownClassName="w-[200px]"
                    isOpen={activeDropdown === 'category'}
                    onToggle={() => toggleDropdown('category')}
                    onClose={closeAll}
                  />
                </div>

                <div className="w-[calc(50%-4px)] md:w-[180px] shrink-0">
                  <CustomSelect 
                    options={getPriceOptions(t)}
                    value={filters.priceRange || 'Any'}
                    onChange={(val) => setFilters({...filters, priceRange: val})}
                    className="bg-gray-50 px-4 py-2 rounded-xl border border-transparent hover:border-gray-200 transition-colors"
                    dropdownClassName="w-[200px]"
                    isOpen={activeDropdown === 'price'}
                    onToggle={() => toggleDropdown('price')}
                    onClose={closeAll}
                  />
                </div>

                 <div className="w-[calc(50%-4px)] md:w-[180px] shrink-0">
                  <CustomSelect 
                    options={getCashFlowOptions(t)}
                    value={filters.cashFlow || 'Any'}
                    onChange={(val) => setFilters({...filters, cashFlow: val})}
                    className="bg-gray-50 px-4 py-2 rounded-xl border border-transparent hover:border-gray-200 transition-colors"
                    dropdownClassName="w-[200px]"
                    isOpen={activeDropdown === 'cashflow'}
                    onToggle={() => toggleDropdown('cashflow')}
                    onClose={closeAll}
                  />
                </div>

                <div className="w-[calc(50%-4px)] md:w-[180px] shrink-0">
                  <CustomSelect 
                    options={getSortOptions(t)}
                    value={sortBy}
                    onChange={(val) => setSortBy(val)}
                    className="bg-gray-50 px-4 py-2 rounded-xl border border-transparent hover:border-gray-200 transition-colors"
                    dropdownClassName="w-[200px]"
                    isOpen={activeDropdown === 'sort'}
                    onToggle={() => toggleDropdown('sort')}
                    onClose={closeAll}
                  />
                </div>
                
                <button 
                  onClick={() => { setFilters({}); setSearchTerm(''); setSortBy('recent'); }}
                  className="w-full md:w-auto px-6 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 h-[48px] whitespace-nowrap shadow-sm"
                >
                    <Filter size={16} /> {t('listings.reset')}
                </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {viewMode === 'grid' ? (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {paginatedBusinesses.length > 0 ? (
                        paginatedBusinesses.map((business, idx) => (
                            <BusinessCard 
                                key={business.id} 
                                business={business} 
                                onClick={onPropertyClick} 
                                t={t} 
                                index={idx}
                                isFavorite={favorites.includes(business.id)}
                                onToggleFavorite={handleFavoriteClick}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <h3 className="text-2xl font-display font-bold text-gray-400">{t('listings.noResults')}</h3>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-4">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-brand-black"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        
                        <div className="bg-white px-6 py-3 rounded-full shadow-sm text-sm font-bold text-brand-black">
                            Page {currentPage} of {totalPages}
                        </div>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-brand-black"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </>
        ) : (
            <MapView 
                businesses={filteredBusinesses} 
                onPropertyClick={onPropertyClick} 
            />
        )}
      </div>
    </div>
  );
};
