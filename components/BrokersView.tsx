
import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Phone, BadgeCheck, Languages, Briefcase, Mail } from 'lucide-react';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { Reveal } from './ui/Reveal';
import { useLanguage } from '../contexts/LanguageContext';

interface BrokersViewProps {
  onBack: () => void;
  onContact: (brokerName: string, context?: 'listing' | 'broker', isNDASigned?: boolean, listingId?: string, dealerId?: string) => void;
}

export const BrokersView: React.FC<BrokersViewProps> = ({ onBack, onContact }) => {
  const { brokers } = useMarketplace();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#EEF1EE] pt-6 pb-16 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-black font-medium mb-8 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={20} /> {t('brokers.back')}
        </button>

        <Reveal width="100%">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-black mb-4">{t('brokers.title')}</h1>
            <p className="text-gray-500 text-lg max-w-2xl">{t('brokers.subtitle')}</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {brokers.map((broker, index) => (
            <Reveal key={broker.id} delay={index * 100} className="h-full" width="100%">
              <div className="bg-white rounded-[2.5rem] p-4 h-full flex flex-col gap-4 border border-gray-100 hover:shadow-xl transition-all duration-300 group">

                {/* Top Section: Profile */}
                <div className="bg-gray-50 rounded-[2rem] p-6 flex flex-col items-center text-center relative overflow-hidden group-hover:bg-[#EEF1EE] transition-colors flex-1">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full p-1 bg-white border border-gray-200">
                      <img
                        src={broker.image}
                        alt={broker.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-display text-brand-black mb-1">{broker.name}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-3">{broker.location}</p>

                  {/* Added Description/Bio */}
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4 italic">
                    "{broker.description}"
                  </p>

                  <div className="flex flex-wrap justify-center gap-1.5 mt-auto">
                    {broker.specialties.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-[10px] font-bold bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full uppercase tracking-wide">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Middle Grid: Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-100 rounded-[1.5rem] p-4 flex flex-col justify-center items-center text-center hover:border-gray-200 transition-colors h-24">
                    <Briefcase size={20} className="text-gray-400 mb-2" />
                    <span className="text-2xl font-display font-bold text-brand-black">{broker.experience}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('brokers.years')} {t('brokers.experience')}</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-[1.5rem] p-4 flex flex-col justify-center items-center text-center hover:border-gray-200 transition-colors overflow-hidden h-24">
                    <Languages size={20} className="text-gray-400 mb-2" />
                    <span className="text-xs font-bold text-brand-black line-clamp-2 leading-tight">{broker.languages.join(', ')}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{t('brokers.languages')}</span>
                  </div>
                </div>

                {/* Bottom Section: Actions */}
                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => onContact(broker.name, 'broker', false, undefined, broker.id)}
                    className="w-full bg-brand-black text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg shadow-brand-black/10"
                  >
                    <MessageSquare size={16} /> {t('brokers.contact')}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${broker.phone}`}
                      className="flex items-center justify-center gap-2 py-3 px-2 bg-gray-50 hover:bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 transition-colors group/phone"
                    >
                      <Phone size={14} className="text-gray-400 group-hover/phone:text-brand-black" />
                      <span className="truncate">{broker.phone}</span>
                    </a>
                    <a
                      href={`mailto:${broker.email}`}
                      className="flex items-center justify-center gap-2 py-3 px-2 bg-gray-50 hover:bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 transition-colors group/mail"
                    >
                      <Mail size={14} className="text-gray-400 group-hover/mail:text-brand-black" />
                      <span className="truncate">Email</span>
                    </a>
                  </div>
                </div>

              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
};
