
import React from 'react';
import { STATS } from '../constants';
import { Reveal } from './ui/Reveal';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Target, ShieldCheck, Zap, Handshake } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const { t } = useLanguage();

  const coreValues = [
    {
      icon: <Target className="text-brand-accent" size={24} />,
      title: t('about.missionTitle'),
      desc: t('about.missionDesc')
    },
    {
      icon: <ShieldCheck className="text-brand-accent" size={24} />,
      title: t('about.trustTitle'),
      desc: t('about.trustDesc')
    },
    {
      icon: <Zap className="text-brand-accent" size={24} />,
      title: t('about.efficiencyTitle'),
      desc: t('about.efficiencyDesc')
    },
    {
      icon: <Handshake className="text-brand-accent" size={24} />,
      title: t('about.connectorTitle'),
      desc: t('about.connectorDesc')
    }
  ];

  return (
    <div className="min-h-screen bg-[#EEF1EE] pt-6 pb-24 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-brand-black font-medium mb-8 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={20} /> {t('about.back')}
        </button>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <Reveal>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-brand-black mb-8 leading-tight">
                {t('about.title')}
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-xl text-brand-text-grey leading-relaxed mb-10 max-w-xl">
                {t('about.desc')}
              </p>
            </Reveal>
            
            {/* Stats Grid inside Page - Uniform container sizing */}
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              {STATS.map((stat, index) => (
                <Reveal key={stat.id} delay={index * 100} width="100%">
                  <div className="flex flex-col p-6 rounded-3xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full justify-center">
                    <span className="text-3xl md:text-4xl font-display font-bold text-brand-black mb-1">{stat.value}</span>
                    <span className="text-[10px] font-bold text-brand-text-grey uppercase tracking-widest leading-tight">{t(`about.stats.${stat.label}`)}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={300} width="100%">
            <div className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl group">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop&fm=webp" 
                alt="NiHao Laoban Office"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
              <div className="absolute bottom-8 left-8 right-8">
                 <div className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/40 shadow-2xl">
                    <h4 className="text-xl font-display font-bold mb-2 text-brand-black">{t('about.overlayTitle')}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{t('about.overlayDesc')}</p>
                 </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Story & Values Section */}
        <div className="bg-white rounded-[4rem] p-8 md:p-20 shadow-sm border border-gray-100 mb-20">
           <div className="max-w-4xl mx-auto">
              <Reveal>
                <span className="text-brand-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">{t('about.ourDna')}</span>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-black mb-12 leading-tight">{t('about.bridgeTitle')}</h2>
              </Reveal>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                 <Reveal delay={100}>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {t('about.bridgeDesc1')}
                    </p>
                 </Reveal>
                 <Reveal delay={200}>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {t('about.bridgeDesc2')}
                    </p>
                 </Reveal>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {coreValues.map((value, i) => (
                   <Reveal key={i} delay={i * 100} className="h-full" width="100%">
                      <div className="p-8 bg-gray-50 rounded-[2.5rem] h-full border border-transparent hover:border-brand-accent/20 transition-all group flex flex-col">
                         <div className="mb-4 p-3 bg-white w-fit rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                            {value.icon}
                         </div>
                         <h4 className="text-xl font-bold text-brand-black mb-2">{value.title}</h4>
                         <p className="text-gray-500 text-sm leading-relaxed flex-grow">{value.desc}</p>
                      </div>
                   </Reveal>
                ))}
              </div>
           </div>
        </div>

        {/* CTA Banner */}
        <Reveal width="100%">
           <div className="bg-brand-black rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 relative z-10">{t('about.ctaTitle')}</h2>
              <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto relative z-10">{t('about.ctaDesc')}</p>
              <div className="flex flex-wrap justify-center gap-4 relative z-10">
                 <button onClick={() => onBack()} className="bg-white text-brand-black px-12 py-5 rounded-full font-bold hover:scale-105 transition-transform shadow-xl text-lg">
                    {t('about.getStarted')}
                 </button>
              </div>
           </div>
        </Reveal>
      </div>
    </div>
  );
};
