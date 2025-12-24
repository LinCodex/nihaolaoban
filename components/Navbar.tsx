
import React, { useState, useEffect } from 'react';
import { Menu, X, Glasses, User } from 'lucide-react';
import { NAVIGATION_LINKS } from '../constants';
import { SearchFilters } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  onLoginClick: () => void;
  isLoggedIn: boolean;
  onNavigate: (page: string, filters?: SearchFilters) => void;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, isLoggedIn, onNavigate, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (label === 'about') {
        onNavigate('about');
        return;
    }

    if (href === '#listings' || href === '#buy') {
        onNavigate('listings');
    } else if (href === '#brokers') {
        onNavigate('brokers');
    } else if (href === '#services') {
        onNavigate('home');
        setTimeout(() => {
            const element = document.querySelector(href);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    } else {
        onNavigate('home');
        window.scrollTo(0, 0);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 transition-colors duration-300 py-6 ${isScrolled ? 'bg-[#EEF1EE]/95 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-[1400px] px-4 md:px-8 mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="#" onClick={(e) => handleLinkClick(e, '#root', 'home')} className="flex items-center gap-2 group cursor-pointer">
          <Glasses size={32} className="text-brand-accent transition-transform group-hover:scale-110 group-hover:rotate-12" />
          <span className="text-xl font-bold font-display tracking-tight text-brand-black">
            {language === 'zh' ? '你好老板' : 'NiHao Laoban'}
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 bg-white/60 backdrop-blur-sm px-8 py-3 rounded-full border border-white/50 shadow-sm hover:shadow-md transition-all">
          {NAVIGATION_LINKS.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              onClick={(e) => handleLinkClick(e, link.href, link.label)}
              className="text-sm font-bold text-brand-black hover:text-brand-text-grey transition-colors uppercase tracking-wider"
            >
              {t(`nav.${link.label}`)}
            </a>
          ))}
        </div>

        {/* CTA & Language */}
        <div className="hidden md:flex items-center gap-3">
          <button 
             onClick={toggleLanguage}
             className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 hover:bg-white transition-colors text-brand-black"
             aria-label="Toggle Language"
          >
             {language === 'en' ? 'CN' : 'EN'}
          </button>
          
          {isLoggedIn ? (
             <div className="flex items-center gap-2">
                 <button 
                    onClick={() => onNavigate('dashboard')}
                    className="bg-brand-black text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-all duration-300 uppercase tracking-wide hover:scale-105 active:scale-95 shadow-lg shadow-black/10 flex items-center gap-2"
                 >
                    <User size={16} /> {t('nav.dashboard')}
                 </button>
             </div>
          ) : (
            <button 
                onClick={onLoginClick}
                className="bg-brand-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-all duration-300 uppercase tracking-wide hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
            >
                {t('nav.login')}
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
           <button 
             onClick={toggleLanguage}
             className="w-8 h-8 rounded-full flex items-center justify-center bg-white/50 text-xs font-bold"
           >
             {language === 'en' ? 'CN' : 'EN'}
           </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-brand-black">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#EEF1EE] border-b border-gray-200 p-6 shadow-xl h-screen z-50 animate-fade-up">
          <div className="flex flex-col gap-6">
            {NAVIGATION_LINKS.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                onClick={(e) => handleLinkClick(e, link.href, link.label)}
                className="text-lg font-bold text-brand-black border-b border-gray-200 pb-2 uppercase tracking-wide"
              >
                {t(`nav.${link.label}`)}
              </a>
            ))}
            
            {isLoggedIn ? (
               <>
                 <button 
                    onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('dashboard');
                    }}
                    className="bg-brand-black text-white px-6 py-4 rounded-full text-lg font-bold w-full shadow-lg uppercase tracking-wide flex items-center justify-center gap-2"
                 >
                    <User size={20} /> {t('nav.dashboard')}
                 </button>
                 <button 
                    onClick={() => {
                        setMobileMenuOpen(false);
                        if(onLogout) onLogout();
                    }}
                    className="text-center text-gray-500 font-bold"
                 >
                    {t('nav.logout')}
                 </button>
               </>
            ) : (
                <button 
                    onClick={() => {
                        setMobileMenuOpen(false);
                        onLoginClick();
                    }}
                    className="bg-brand-black text-white px-6 py-4 rounded-full text-lg font-bold w-full shadow-lg uppercase tracking-wide"
                >
                    {t('nav.login')}
                </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
