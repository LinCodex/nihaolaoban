import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '../constants';
import { Reveal } from './ui/Reveal';
import { SearchFilters } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ServicesProps {
  onCategoryClick: (filters: SearchFilters) => void;
}

interface ServicesExtendedProps extends ServicesProps {
    onNavigate?: (view: string) => void;
    isLoggedIn?: boolean;
    onStartSelling?: () => void;
}

const Services: React.FC<ServicesExtendedProps> = ({ onCategoryClick, onNavigate, isLoggedIn, onStartSelling }) => {
  const { t } = useLanguage();

  const handleServiceClick = (serviceId: string) => {
    switch (serviceId) {
      case '1':
        // Sell - Check auth
        if (isLoggedIn) {
            if (onNavigate) onNavigate('dashboard');
        } else {
            if (onStartSelling) onStartSelling();
        }
        break;
      case '2':
        // Buy a Business -> Listings
        if (onNavigate) {
            onNavigate('listings');
        } else {
            onCategoryClick({});
        }
        break;
      case '3':
        // Consult a Broker -> Brokers View
        if (onNavigate) {
            onNavigate('brokers');
        }
        break;
      default:
        break;
    }
  };

  return (
    <section id="services" className="px-4 md:px-8 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
        <Reveal>
           <h2 className="text-4xl md:text-6xl font-display font-bold text-brand-black">{t('services.title')}</h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="max-w-md text-brand-text-grey mt-4 md:mt-0 leading-relaxed">
            {t('services.subtitle')}
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((service, index) => {
          // Dynamic translation lookup based on service ID pattern I set in constants
          const titleKey = `services.s${service.id}_title`;
          const descKey = `services.s${service.id}_desc`;
          const btnKey = `services.s${service.id}_btn`;

          // Hide offers count for "Sell Your Business" (id '1')
          const showOffers = service.id !== '1' && (service.offersCount !== undefined);

          return (
          <Reveal key={service.id} delay={index * 150} width="100%">
            <div 
              onClick={() => handleServiceClick(service.id)}
              className={`
                group relative p-6 md:p-8 flex flex-col justify-between overflow-hidden rounded-[2.5rem] transition-all duration-300 hover:shadow-xl cursor-pointer
                ${service.type === 'large' 
                    ? 'bg-[#E5E5E5] lg:col-span-1 h-[400px]' 
                    : 'bg-white min-h-[240px] md:h-[400px]'}
              `}
            >
              {service.image && (
                <>
                  <div className="absolute inset-0 z-0 bg-gray-200">
                    <img src={service.image} alt={t(titleKey)} className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  {showOffers && (
                     <div className="absolute top-6 right-6 z-10 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
                        <span className="text-xs font-semibold text-white">{service.offersCount} {t('services.offers')}</span>
                     </div>
                  )}
                </>
              )}

              {/* Badge for non-image cards */}
              {!service.image && showOffers && (
                 <div className="self-end mb-2 md:mb-0 md:absolute md:top-8 md:right-8 bg-[#EEF1EE] px-4 py-1.5 rounded-full border border-gray-100 z-20">
                    <span className="text-xs font-bold text-brand-black">{service.offersCount} {t('services.requests')}</span>
                 </div>
              )}

              <div className={`relative z-10 flex flex-col h-full ${service.image ? 'justify-end' : ''}`}>
                <div className={`${!service.image ? 'md:pr-20' : ''}`}>
                    <h3 className={`text-2xl md:text-3xl font-display font-bold mb-3 md:mb-4 leading-tight ${service.image ? 'text-white' : 'text-brand-black'}`}>
                    {t(titleKey)}
                    </h3>
                    <p className={`text-sm mb-8 max-w-[250px] font-medium leading-relaxed ${service.image ? 'text-gray-200' : 'text-gray-500'}`}>
                    {t(descKey)}
                    </p>
                </div>
                
                {service.type === 'large' ? (
                   <button className="bg-white text-brand-black px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors w-fit shadow-lg mt-auto">
                     {t(btnKey)}
                   </button>
                ) : (
                  <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-45 absolute bottom-6 right-6 md:bottom-8 md:right-8 shadow-lg ${service.image ? 'bg-white text-brand-black hover:bg-gray-100' : 'bg-brand-black text-white hover:bg-gray-900'}`}>
                    <ArrowUpRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </Reveal>
        )})}
      </div>
    </section>
  );
};

export default Services;