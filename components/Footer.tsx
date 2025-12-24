
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Glasses } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[#EEF1EE] border-t border-gray-200 mt-0">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => {
                onNavigate('home');
                window.scrollTo(0, 0);
            }}
            >
            <Glasses size={24} className="text-brand-accent group-hover:rotate-12 transition-transform" />
            <span className="text-lg font-bold font-display tracking-tight text-brand-black">
                {language === 'zh' ? '你好老板' : 'NiHao Laoban'}
            </span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-medium text-brand-text-grey">
              <button onClick={() => onNavigate('support')} className="hover:text-brand-black transition-colors px-2 py-1">{t('nav.support')}</button>
              <button onClick={() => onNavigate('privacy')} className="hover:text-brand-black transition-colors px-2 py-1">{t('footer.privacy')}</button>
              <button onClick={() => onNavigate('terms')} className="hover:text-brand-black transition-colors px-2 py-1">{t('footer.terms')}</button>
              <button onClick={() => onNavigate('cookies')} className="hover:text-brand-black transition-colors px-2 py-1">{t('footer.cookies')}</button>
            </div>

            <div className="flex flex-col md:items-end gap-1">
                <div className="text-sm text-brand-text-grey text-center md:text-right">
                    {t('footer.rights')}
                </div>
                <button 
                    onClick={() => onNavigate('admin')} 
                    className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors uppercase tracking-widest"
                >
                    Partner Access
                </button>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
