
import React, { useRef, useEffect, useState } from 'react';
import { ArrowUpRight, TrendingUp, DollarSign, Eye, LayoutGrid } from 'lucide-react';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { Reveal } from './ui/Reveal';
import { useLanguage } from '../contexts/LanguageContext';

interface OffersProps {
  onPropertyClick: (id: string) => void;
  onViewAll: () => void;
}

const Offers: React.FC<OffersProps> = ({ onPropertyClick, onViewAll }) => {
  const { listings } = useMarketplace();
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [dynamicHeight, setDynamicHeight] = useState('auto');
  const [translateX, setTranslateX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { t, language } = useLanguage();

  // Helper to format large numbers
  const formatK = (num: number) => {
    return num >= 1000000
      ? `$${(num / 1000000).toFixed(1)}M`
      : `$${(num / 1000).toFixed(0)}k`;
  };

  const activeListings = listings
    .filter(l => l.status === 'active' && l.isPopular)
    .map(b => {
      if (language === 'zh' && b.translations?.zh) {
        return { ...b, ...b.translations.zh };
      }
      return b;
    });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setDynamicHeight('auto');
      setTranslateX(0);
      return;
    }

    const calculateHeight = () => {
      if (itemsRef.current && sectionRef.current) {
        const horizontalWidth = itemsRef.current.scrollWidth;
        const viewportWidth = sectionRef.current.clientWidth;
        const scrollDist = horizontalWidth - viewportWidth;

        if (scrollDist > 0) {
          // Precise calculation: the overflow distance plus one viewport height
          // Adding extra buffer (1.5x) to ensure it doesn't scroll past too quickly
          setDynamicHeight(`${(scrollDist * 1.5) + window.innerHeight}px`);
        } else {
          setDynamicHeight('100vh');
        }
      }
    };

    calculateHeight();

    const resizeObserver = new ResizeObserver(() => {
      calculateHeight();
    });

    if (itemsRef.current) resizeObserver.observe(itemsRef.current);
    if (sectionRef.current) resizeObserver.observe(sectionRef.current);

    return () => resizeObserver.disconnect();
  }, [isMobile, activeListings]);


  useEffect(() => {
    if (isMobile) return;

    let rafId: number;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      // Use requestAnimationFrame for smooth animation
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        if (!sectionRef.current || !itemsRef.current) return;

        const rect = sectionRef.current.getBoundingClientRect();
        const horizontalWidth = itemsRef.current.scrollWidth;
        const viewportWidth = sectionRef.current.clientWidth;
        const maxScroll = horizontalWidth - viewportWidth;

        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
          // Calculate progress percentage through the sticky section
          const totalScrollableHeight = rect.height - window.innerHeight;
          const progress = Math.min(1, Math.max(0, Math.abs(rect.top) / totalScrollableHeight));

          // Linear progress for direct 1:1 feel
          const amount = progress * maxScroll;
          setTranslateX(-amount);
        } else if (rect.top > 0) {
          setTranslateX(0);
        } else if (rect.bottom < window.innerHeight) {
          setTranslateX(-maxScroll);
        }

        lastScrollY = window.scrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile, dynamicHeight]);

  return (
    <section
      ref={sectionRef}
      id="offers"
      className="relative bg-[#EEF1EE]"
      style={{ height: dynamicHeight }}
    >
      {/* Sticky container uses flex column to separate header and cards vertically */}
      <div className={`${isMobile ? 'relative py-12' : 'sticky top-0 h-screen flex flex-col overflow-hidden'}`}>

        {/* Header Section */}
        <div className={`${isMobile ? 'mb-8' : 'pt-20 md:pt-24 pb-8'} px-4 md:px-8 shrink-0`}>
          <div className="flex justify-between items-end max-w-[1400px] mx-auto w-full">
            <Reveal>
              <div className="flex flex-col">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-black mb-4">{t('offers.title')}</h2>
                <p className="text-brand-text-grey max-w-sm text-sm font-medium">{t('offers.subtitle')}</p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <button
                onClick={onViewAll}
                className="hidden md:flex items-center gap-2 border border-brand-black/10 bg-white/50 backdrop-blur-md px-8 py-3 rounded-full text-sm font-bold hover:bg-brand-black hover:text-white transition-all shadow-sm"
              >
                {t('offers.viewAll')}
              </button>
            </Reveal>
          </div>
        </div>

        {/* Cards Section - Centered in remaining space */}
        <div className={`w-full ${!isMobile ? 'flex-1 flex items-center' : ''}`}>
          <div
            ref={itemsRef}
            className={`
              flex gap-6 px-4 md:px-8 items-stretch 
              ${isMobile ? 'overflow-x-auto snap-x snap-mandatory pb-8 no-scrollbar w-full scroll-pl-4' : 'w-max'}
            `}
            style={!isMobile ? {
              transform: `translate3d(${translateX}px, 0, 0)`,
              willChange: 'transform',
              transition: 'transform 0.1s cubic-bezier(0.33, 1, 0.68, 1)'
            } : { overscrollBehaviorX: 'contain' }}
          >
            {activeListings.slice(0, 6).map((business) => (
              <div
                key={business.id}
                onClick={() => onPropertyClick(business.id)}
                className="w-[85vw] md:w-[480px] group bg-white p-4 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-transparent hover:border-gray-100 flex flex-col shrink-0 snap-center"
              >
                <div
                  className="relative h-64 md:h-72 rounded-[2rem] overflow-hidden mb-5 shrink-0 bg-gray-50 border border-gray-100"
                  style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
                >
                  <img
                    src={business.image}
                    alt={business.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-bold text-brand-black shadow-sm uppercase tracking-wider">
                      {t(`options.${business.category.toLowerCase()}`) || business.category}
                    </div>
                    <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Eye size={12} className="text-white" />
                      <span className="text-[10px] font-bold text-white">{(business.views || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="px-3 pb-2 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-2xl font-display font-bold text-brand-black group-hover:text-gray-700 transition-colors line-clamp-1">{business.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm font-medium mb-6 flex items-center gap-1 line-clamp-1">
                    {business.location}
                  </p>

                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 group-hover:bg-gray-100 transition-colors">
                      <DollarSign size={14} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-700 whitespace-nowrap">{t('offers.rev')}: {formatK(business.grossRevenue)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100 group-hover:bg-green-100 transition-colors">
                      <TrendingUp size={14} className="text-green-600" />
                      <span className="text-xs font-bold text-green-700 whitespace-nowrap">{t('offers.cf')}: {formatK(business.cashFlow)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Asking Price</span>
                      <span className="text-2xl font-display font-bold text-brand-black">
                        ${business.price.toLocaleString()}
                      </span>
                    </div>
                    <button className="w-14 h-14 bg-brand-black text-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:rotate-45 shadow-xl shadow-black/10">
                      <ArrowUpRight size={24} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* "View All" Card */}
            <div
              onClick={onViewAll}
              className="w-[85vw] md:w-[480px] group bg-white p-4 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-transparent hover:border-gray-100 flex flex-col shrink-0 snap-center"
            >
              <div className="relative h-64 md:h-72 rounded-[2rem] overflow-hidden mb-5 shrink-0 bg-brand-black flex items-center justify-center">
                <div className="absolute inset-0 opacity-40">
                  <img
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2670&auto=format&fit=crop&fm=webp"
                    alt="Background"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-brand-black group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                    <LayoutGrid size={32} />
                  </div>
                </div>
              </div>

              <div className="px-3 pb-2 flex-1 flex flex-col">
                <div className="flex-1 flex flex-col items-center text-center justify-center py-6">
                  <h3 className="text-3xl font-display font-bold text-brand-black mb-3">{t('offers.viewAll')}</h3>
                  <p className="text-gray-400 text-sm font-medium max-w-[280px]">
                    Discover {listings.length}+ verified business opportunities currently available on the market.
                  </p>
                </div>

                <div className="mt-auto w-full pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand-black font-bold uppercase tracking-widest text-xs group-hover:gap-4 transition-all duration-300">
                    Explore Marketplace
                  </div>
                  <button className="w-14 h-14 bg-brand-black text-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:rotate-45 shadow-xl shadow-black/10">
                    <ArrowUpRight size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="w-8 shrink-0"></div>
          </div>

          {/* Mobile View All Button */}
          {isMobile && (
            <div className="mt-8 px-4 flex justify-center">
              <button
                onClick={onViewAll}
                className="flex items-center gap-2 border border-brand-black bg-transparent px-8 py-4 rounded-full text-sm font-bold active:bg-brand-black active:text-white transition-colors"
              >
                {t('offers.viewAll')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Offers;
