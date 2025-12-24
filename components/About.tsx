import React from 'react';
import { STATS } from '../constants';
import { Reveal } from './ui/Reveal';
import { useLanguage } from '../contexts/LanguageContext';

interface AboutProps {
  onExploreClick: () => void;
}

const About: React.FC<AboutProps> = ({ onExploreClick }) => {
  const { t } = useLanguage();
  return (
    <section id="about" className="px-4 md:px-8 py-16">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Left Content */}
        <div className="lg:w-1/3">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-black mb-6">{t('about.title')}</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-brand-text-grey leading-relaxed mb-8">
              {t('about.desc')}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <button 
              onClick={onExploreClick}
              className="bg-brand-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-900 transition-all hover:scale-105 shadow-lg shadow-black/10"
            >
              {t('about.btn')}
            </button>
          </Reveal>
        </div>

        {/* Right Stats */}
        <div className="lg:w-2/3 grid grid-cols-2 gap-y-12 gap-x-8">
          {STATS.map((stat, index) => (
            <Reveal key={stat.id} delay={index * 100}>
              <div className="flex flex-col p-4 rounded-3xl hover:bg-white hover:shadow-lg transition-all duration-300 cursor-default">
                <span className="text-4xl md:text-6xl font-display font-bold text-brand-black mb-2">{stat.value}</span>
                <span className="text-sm font-medium text-brand-text-grey uppercase tracking-wider">{t(`about.stats.${stat.label}`)}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Strategic Acquisitions Image Strip */}
      <Reveal delay={300} width="100%">
        <div className="mt-16 h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden relative group">
           <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop&fm=webp" 
            alt="Corporate Buildings"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
           
           {/* Decorative overlay element */}
           <div className="absolute bottom-0 left-0 p-6 md:p-12 max-w-lg w-full">
              <div className="bg-white/95 backdrop-blur-md p-8 rounded-[2rem] border border-white/40 shadow-2xl">
                 <h4 className="text-xl font-display font-bold mb-2 text-brand-black">{t('about.overlayTitle')}</h4>
                 <p className="text-sm text-gray-600 leading-relaxed">{t('about.overlayDesc')}</p>
              </div>
           </div>
        </div>
      </Reveal>
    </section>
  );
};

export default About;