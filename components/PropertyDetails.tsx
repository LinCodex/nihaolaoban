
import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, MapPin, DollarSign, TrendingUp, BarChart3, Package, Building2, 
  Users, Calendar, ShieldCheck, Phone, BadgeCheck, FileText, ChevronLeft, ChevronRight, Lock, Box,
  Calculator, Info, ChevronDown, Heart, MessageSquare, Eye, Flag, AlertTriangle, X, Activity, Gauge
} from 'lucide-react';
import { Business, Report } from '../types';
import { Reveal } from './ui/Reveal';
import { useLanguage } from '../contexts/LanguageContext';
import { NDAModal } from './ui/NDAModal';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { CustomSelect } from './ui/CustomSelect';

interface BusinessDetailsProps {
  property: Business;
  onBack: () => void;
  onBookViewing: () => void;
  onNavigate?: (view: string) => void;
  onMessageAgent: (title: string, context?: 'listing' | 'broker', isNDASigned?: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  currentUser?: { name: string, role?: string, id?: string } | null;
  onLoginRequest?: () => void;
}

const ReportModal = ({ isOpen, onClose, onSubmit, t }: { isOpen: boolean, onClose: () => void, onSubmit: (reason: string, desc: string) => void, t: any }) => {
    const [reason, setReason] = useState('spam');
    const [description, setDescription] = useState('');

    const reasonOptions = [
        { label: t('details.reportReasons.spam'), value: 'spam' },
        { label: t('details.reportReasons.scam'), value: 'scam' },
        { label: t('details.reportReasons.inappropriate'), value: 'inappropriate' },
        { label: t('details.reportReasons.other'), value: 'other' }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4 animate-modal-fade">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl animate-modal-slide">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black" aria-label="Close"><X size={20}/></button>
                
                <h3 className="text-xl font-bold text-brand-black mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={20} /> {t('details.reportTitle')}
                </h3>
                <p className="text-gray-500 text-sm mb-6">{t('details.reportDesc')}</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('admin.reason')}</label>
                        <CustomSelect 
                            options={reasonOptions}
                            value={reason}
                            onChange={setReason}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2"
                            dropdownClassName="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Details</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/5 resize-none"
                            placeholder="Optional details..."
                        />
                    </div>
                    <button 
                        onClick={() => onSubmit(reason, description)}
                        className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                        {t('details.submitReport')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({ 
    property: rawBusiness, 
    onBack, 
    onNavigate, 
    onMessageAgent,
    isFavorite,
    onToggleFavorite,
    currentUser,
    onLoginRequest
}) => {
  const { t, language } = useLanguage();
  const { addReport } = useMarketplace();
  
  // Track the ID to avoid unnecessary state resets on re-renders
  const lastPropertyId = useRef<string | null>(null);

  // Merge translations based on current language
  const business = React.useMemo(() => {
      if (language === 'zh' && rawBusiness.translations?.zh) {
          return {
              ...rawBusiness,
              ...rawBusiness.translations.zh
          };
      }
      return rawBusiness;
  }, [rawBusiness, language]);

  const allImages = business.images && business.images.length > 0 ? business.images : [business.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasSignedNDA, setHasSignedNDA] = useState(false);
  const [isNDAOpen, setIsNDAOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Touch state for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Valuation State
  const [valuationMultiplier, setValuationMultiplier] = useState<number>(3.0);
  const [calculatedValuation, setCalculatedValuation] = useState<number>(0);

  useEffect(() => {
    // Only reset state if we are actually viewing a new property
    if (lastPropertyId.current !== business.id) {
        window.scrollTo(0, 0);
        setCurrentImageIndex(0);
        setHasSignedNDA(false); 
        const defaultMult = business.category === 'Other' ? 3.0 : 2.5;
        setValuationMultiplier(defaultMult);
        lastPropertyId.current = business.id;
    }
  }, [business.id, business.category]);

  useEffect(() => {
    setCalculatedValuation(business.cashFlow * valuationMultiplier);
  }, [valuationMultiplier, business.cashFlow]);

  const handleOpenNDA = () => {
      if (!currentUser) {
          if (onLoginRequest) onLoginRequest();
          return;
      }
      setIsNDAOpen(true);
  };

  const handleMessageAction = () => {
      // If NDA is required but not signed, prompt for NDA first
      if (!hasSignedNDA) {
          handleOpenNDA();
      } else {
          // If already signed, open messaging with the NDA Signed flag
          onMessageAgent(business.title, 'listing', true);
      }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); 
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  const formatMoney = (num: number, allowDecimals: boolean = false) => {
      const options: Intl.NumberFormatOptions = { 
          style: 'currency', 
          currency: 'USD', 
          maximumFractionDigits: allowDecimals ? 2 : 0 
      };
      return new Intl.NumberFormat('en-US', options).format(num);
  };

  const formatRent = (val?: number, sqft?: number) => {
      if (!val) return t('details.na');
      if (val > 200) {
          if (sqft && sqft > 0) {
              const perSqft = val / sqft;
              return `$${perSqft.toFixed(2)}/sqft/mo`;
          }
          return `${formatMoney(val, false)}/mo`;
      }
      return `$${val.toFixed(2)}/sqft`;
  };

  const handleReportSubmit = (reason: string, desc: string) => {
      const report: Report = {
          id: Date.now().toString(),
          targetId: business.id,
          targetType: 'listing',
          reason: reason as any,
          description: desc || 'No details provided.',
          reporter: currentUser ? currentUser.name : 'Guest Visitor',
          status: 'pending',
          timestamp: new Date()
      };
      addReport(report);
      setIsReportOpen(false);
      alert(t('details.reportSent'));
  };

  const renderDescription = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-brand-black font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getRealEstateTranslation = (status: string) => {
    switch (status) {
        case 'Included': return t('details.re_included');
        case 'Available': return t('details.re_available');
        case 'Leased': return t('details.re_leased');
        case 'Not Applicable': return t('details.re_na');
        default: return status;
    }
  };

  // Determine score color and label
  const getScoreProps = (score: number) => {
      if (score >= 4.5) return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: t('post.excellent') };
      if (score >= 3.5) return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Good' };
      if (score >= 2.5) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', label: 'Fair' };
      return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: t('post.poor') };
  };
  const scoreProps = getScoreProps(business.rating);

  const SensitiveOverlay = () => (
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-[2.5rem]">
          <div className="bg-white/80 p-6 rounded-3xl shadow-xl flex flex-col items-center border border-white">
            <Lock size={32} className="text-brand-black mb-3" />
            <h4 className="text-xl font-bold text-brand-black mb-2">{t('nda.locked')}</h4>
            <p className="text-gray-500 mb-6 max-w-xs text-center text-sm">{t('nda.lockedDesc')}</p>
            <button 
                onClick={handleOpenNDA}
                className="bg-brand-black text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-colors text-sm"
            >
                {t('nda.button')}
            </button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#EEF1EE] pt-6 pb-24 lg:pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-brand-black font-bold hover:translate-x-[-4px] transition-transform"
            >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <ArrowLeft size={18} /> 
                </div>
                <span>{t('details.back')}</span>
            </button>
            <button 
                onClick={() => onToggleFavorite(business.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all border ${isFavorite ? 'bg-red-50 border-red-100' : 'bg-white border-white'}`}
            >
                <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
            </button>
        </div>

        {/* Hero Section */}
        <Reveal width="100%">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Carousel */}
                <div 
                    className="relative h-[300px] md:h-[500px] w-full group rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-50 select-none touch-pan-y"
                    style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {allImages.map((img, index) => (
                      <img 
                        key={index}
                        src={img} 
                        alt={`${business.title} - ${index + 1}`} 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={index === 0 ? "high" : "auto"}
                        draggable={false}
                      />
                    ))}
                    
                    <div className="absolute inset-0 bg-black/5 pointer-events-none z-10" />
                    
                     <div className="absolute top-6 left-6 flex gap-2 z-20 flex-wrap">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-100 glass-panel">
                            <span className="text-xs font-bold text-brand-black tracking-wide uppercase">
                                {t(`options.${business.category.toLowerCase()}`) || business.category}
                            </span>
                        </div>
                         {business.views > 0 && (
                            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white/10 glass-panel flex items-center gap-1.5">
                                <Eye size={14} className="text-white" />
                                <span className="text-xs font-bold text-white tracking-wide">{business.views.toLocaleString()} {t('details.views')}</span>
                            </div>
                        )}
                    </div>

                    {allImages.length > 1 && (
                      <>
                        <button onClick={handlePrev} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur-md hover:bg-white rounded-full items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-30 glass-panel"><ChevronLeft size={24} /></button>
                        <button onClick={handleNext} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur-md hover:bg-white rounded-full items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-30 glass-panel"><ChevronRight size={24} /></button>
                        
                        {/* Image Previews */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 max-w-[90%] overflow-x-auto no-scrollbar px-4 py-2">
                            {allImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(index);
                                    }}
                                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 shrink-0 shadow-lg ${
                                        index === currentImageIndex 
                                        ? 'border-white scale-110 z-10 ring-2 ring-black/20' 
                                        : 'border-white/40 hover:border-white opacity-80 hover:opacity-100 hover:scale-105'
                                    }`}
                                    aria-label={`View image ${index + 1}`}
                                >
                                    <img 
                                        src={img} 
                                        alt={`Thumbnail ${index + 1}`} 
                                        className={`w-full h-full object-cover transition-all duration-300 ${index === currentImageIndex ? 'brightness-110' : 'brightness-50 grayscale-[30%]'}`} 
                                    />
                                </button>
                            ))}
                        </div>
                      </>
                    )}
                </div>

                {/* Main Info */}
                <div className="flex flex-col justify-center lg:pl-8">
                    <div className="mb-6">
                         <span className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                            {t('details.established')} {business.yearsEstablished} {t('details.years')}
                         </span>
                         {business.tags && business.tags.length > 0 && (
                             <div className="flex flex-wrap gap-2 mb-4">
                                 {business.tags.map(tag => (
                                     <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                                         {t(`tags.${tag}`) !== `tags.${tag}` ? t(`tags.${tag}`) : tag}
                                     </span>
                                 ))}
                             </div>
                         )}
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-brand-black mb-4 leading-tight">{business.title}</h1>
                        <div className="flex items-center gap-3 text-gray-500 mb-8">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                <MapPin size={20} className="text-brand-black" />
                            </div>
                            <span className="font-medium text-lg md:text-xl text-gray-600">{business.location}</span>
                        </div>

                         <div className="flex flex-col mb-10">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('details.askingPrice')}</span>
                            <div className="text-4xl md:text-5xl font-display font-bold text-brand-black">
                                {formatMoney(business.price)}
                            </div>
                            {business.downPayment !== undefined && (
                                <span className="text-sm font-medium text-gray-500 mt-2">
                                    {t('details.minDown')}: <span className="text-brand-black font-bold">{business.downPayment > 0 ? formatMoney(business.downPayment) : 'N/A'}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Reveal>

        {/* Desktop Header - Refined */}
        {/* We move Key Stats here to be above the fold */}
        <Reveal delay={50} width="100%">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/50 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300">
                <DollarSign size={28} className="text-brand-black mb-2 opacity-80" strokeWidth={1.5} />
                <span className="text-lg md:text-2xl font-display font-bold text-brand-black">${(business.grossRevenue / 1000).toFixed(0)}k</span>
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Revenue</span>
              </div>
              <div className="bg-white/60 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/50 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300">
                <TrendingUp size={28} className="text-green-600 mb-2 opacity-80" strokeWidth={1.5} />
                <span className="text-lg md:text-2xl font-display font-bold text-green-700">${(business.cashFlow / 1000).toFixed(0)}k</span>
                <span className="text-[10px] md:text-xs text-green-700/60 font-bold uppercase tracking-widest mt-1">Cash Flow</span>
              </div>
              
              {/* Refined Deal Rating Score Card */}
              <div className={`p-5 rounded-[1.5rem] border flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 ${scoreProps.bg} ${scoreProps.border} relative overflow-hidden group`}>
                <Activity size={28} className={`${scoreProps.color} mb-2`} strokeWidth={2} />
                <div className="flex items-end gap-1 leading-none mb-1">
                    <span className={`text-lg md:text-3xl font-display font-bold ${scoreProps.color}`}>{business.rating}</span>
                    <span className="text-xs font-bold text-gray-400 mb-1">/5</span>
                </div>
                <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${scoreProps.color} opacity-80`}>{scoreProps.label} {t('post.dealScore')}</span>
              </div>

              <div className="bg-white/60 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/50 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300">
                <Calendar size={28} className="text-brand-black mb-2 opacity-80" strokeWidth={1.5} />
                <span className="text-lg md:text-2xl font-display font-bold text-brand-black">{business.yearsEstablished}</span>
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Years Est.</span>
              </div>
            </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2 space-y-12">
                
                {/* Financial Summary (Split) */}
                <Reveal delay={100} width="100%">
                    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm overflow-hidden relative">
                        {!hasSignedNDA && <SensitiveOverlay />}
                        
                        <div className={!hasSignedNDA ? "filter blur-md pointer-events-none select-none" : ""}>
                            <div className="flex items-center gap-3 mb-8">
                                <BarChart3 className="text-brand-black" />
                                <h3 className="text-2xl font-display font-bold text-brand-black">{t('details.financials')}</h3>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t('details.financialsPrivate')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                    <div className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('details.ebitda')}</p>
                                            <p className="text-2xl font-bold text-brand-black">{business.ebitda ? formatMoney(business.ebitda) : t('details.na')}</p>
                                        </div>
                                        <div className="p-2 bg-white rounded-full"><TrendingUp size={20} className="text-gray-400" /></div>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('details.ffne')}</p>
                                            <p className="text-2xl font-bold text-brand-black">{business.ffne ? formatMoney(business.ffne) : t('details.na')}</p>
                                        </div>
                                        <div className="p-2 bg-white rounded-full"><Package size={20} className="text-gray-400" /></div>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('details.inventory')}</p>
                                            <p className="text-2xl font-bold text-brand-black">{business.inventory ? formatMoney(business.inventory) : t('details.notIncluded')}</p>
                                        </div>
                                        <div className="p-2 bg-white rounded-full"><Box size={20} className="text-gray-400" /></div>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('details.realEstateLabel')}</p>
                                            <p className="text-2xl font-bold text-brand-black">{getRealEstateTranslation(business.realEstate)}</p>
                                        </div>
                                        <div className="p-2 bg-white rounded-full"><Building2 size={20} className="text-gray-400" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* Business Description */}
                <Reveal delay={200} width="100%">
                    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm space-y-8 relative overflow-hidden">
                        {!hasSignedNDA && <SensitiveOverlay />}
                        
                        <div className={!hasSignedNDA ? "filter blur-md pointer-events-none select-none" : ""}>
                            <div>
                                <h3 className="text-2xl font-display font-bold mb-4 text-brand-black">{t('details.description')}</h3>
                                <p className="text-gray-600 leading-loose text-lg font-light whitespace-pre-wrap">
                                {renderDescription(business.description)}
                                </p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 mt-6">
                                <div>
                                    <h4 className="font-bold text-brand-black mb-2 flex items-center gap-2"><TrendingUp size={18} /> {t('details.growth')}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">{business.growthExpansion || 'Contact broker for details.'}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-black mb-2 flex items-center gap-2"><ShieldCheck size={18} /> {t('details.competition')}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">{business.competition || 'Contact broker for details.'}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-black mb-2 flex items-center gap-2"><Users size={18} /> {t('details.support')}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">{business.supportTraining || 'Negotiable.'}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-black mb-2 flex items-center gap-2"><FileText size={18} /> {t('details.reason')}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">{business.reasonForSelling || 'Confidential.'}</p>
                                </div>
                            </div>

                            {business.customSections && business.customSections.length > 0 && (
                                <div className="space-y-6 pt-6 border-t border-gray-100 mt-6">
                                    {business.customSections.map(section => (
                                        <div key={section.id}>
                                            <h4 className="font-bold text-brand-black mb-2 text-lg">{section.title}</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{section.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Reveal>

                {/* Operations & Lease */}
                <Reveal delay={300} width="100%">
                    <div>
                        <h3 className="text-2xl font-display font-bold mb-6 text-brand-black px-4">{t('details.operations')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{t('details.employees')}</p>
                                <div className="flex items-center gap-2">
                                    <Users className="text-brand-black" size={20} />
                                    <span className="font-bold text-brand-black text-lg">{business.employees}</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{t('details.rent')}</p>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="text-brand-black" size={20} />
                                    <span className="font-bold text-brand-black text-lg">{formatRent(business.rent, business.sqFt)}</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{t('details.sqft')}</p>
                                <div className="flex items-center gap-2">
                                    <Building2 className="text-brand-black" size={20} />
                                    <span className="font-bold text-brand-black text-lg">{business.sqFt ? `${business.sqFt}` : t('details.na')}</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{t('details.lease')}</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="text-brand-black" size={20} />
                                    <span className="font-bold text-brand-black text-lg">{business.leaseExpiration || t('details.na')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* Sidebar / CTA (Desktop) - Compacted & No Scroll */}
            <div className="hidden lg:block sticky top-24 h-fit">
                <div className="space-y-4">
                    <Reveal delay={400} width="100%">
                        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-xl glass-panel">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative shrink-0">
                                    <img src={business.agent.image} alt={business.agent.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md" loading="lazy" />
                                </div>
                                <div>
                                    <h5 className="font-display font-bold text-xl text-brand-black mb-0.5">
                                    {business.agent.name}
                                    </h5>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Business Broker</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <a 
                                    href={`tel:${business.agent.phone}`}
                                    className="w-full bg-brand-black text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-lg shadow-brand-black/20"
                                >
                                    <Phone size={16} /> {t('details.call')} {business.agent.phone}
                                </a>
                                
                                {/* Refined Message Button Logic */}
                                <button 
                                    onClick={handleMessageAction}
                                    className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] border ${hasSignedNDA ? 'bg-white border-gray-200 text-brand-black hover:bg-gray-50' : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {hasSignedNDA ? (
                                        <>
                                            <MessageSquare size={16} /> {t('details.messageAgent')}
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={16} /> {t('details.nda')} to Message
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    onClick={() => setIsReportOpen(true)}
                                    className="w-full text-gray-400 py-1 text-[10px] font-bold hover:text-red-500 transition-colors flex items-center justify-center gap-1 mt-1"
                                >
                                    <Flag size={10} /> {t('details.report')}
                                </button>
                            </div>
                        </div>
                    </Reveal>

                    {/* Valuation Tool - Clean and Separate */}
                    <Reveal delay={500} width="100%">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600"><Calculator size={18} /></div>
                                <div>
                                    <h4 className="font-bold text-brand-black text-sm">{t('details.valuation')}</h4>
                                    <p className="text-[10px] text-gray-500">Estimator</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="text-xs font-medium text-gray-500">{t('details.cashFlow')}</span>
                                    <span className="font-bold text-brand-black text-base">
                                        {formatMoney(business.cashFlow)}
                                    </span>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-medium">Multiple</span>
                                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{valuationMultiplier.toFixed(1)}x</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="8" 
                                        step="0.1"
                                        value={valuationMultiplier}
                                        onChange={(e) => setValuationMultiplier(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-black"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1">
                                        <span>1.0x</span>
                                        <span>8.0x</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 text-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{t('details.estValue')}</p>
                                    <p className="text-2xl font-display font-bold text-brand-black tracking-tight">{formatMoney(calculatedValuation)}</p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </div>
      </div>
      
      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40 flex items-center justify-between gap-4 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
           <span className="text-xs text-gray-400 font-bold uppercase">{t('details.listingPrice')}</span>
           <span className="text-xl font-display font-bold text-brand-black">{formatMoney(business.price)}</span>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={handleMessageAction}
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-brand-black"
             >
                {hasSignedNDA ? <MessageSquare size={20} /> : <Lock size={20} className="text-gray-400" />}
             </button>
             <a 
                href={`tel:${business.agent.phone}`}
                className="bg-brand-black text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg flex items-center"
             >
                {t('details.call')}
             </a>
        </div>
      </div>
      
      {/* NDA Modal */}
      <NDAModal 
        isOpen={isNDAOpen}
        onClose={() => setIsNDAOpen(false)}
        propertyTitle={business.title}
        onSign={() => setHasSignedNDA(true)}
        signerName={currentUser?.name || ''}
      />

      {/* Report Modal */}
      <ReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmit={handleReportSubmit}
        t={t}
      />
    </div>
  );
};
