
import React, { useEffect, useState } from 'react';
import { X, Check, Send } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle?: string;
  context?: 'listing' | 'broker';
  isNDASigned?: boolean;
  currentUser?: { name: string, email?: string } | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({ 
    isOpen, 
    onClose, 
    propertyTitle, 
    context = 'listing', 
    isNDASigned = false,
    currentUser = null
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsSubmitted(false);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1000);
  };

  if (!isOpen) return null;

  // Header Logic
  const getHeader = () => {
      if (context === 'broker') return t('contact.brokerTitle');
      return isNDASigned ? t('contact.inquiryTitle') : t('contact.title');
  };

  const getSubtitle = () => {
      if (context === 'broker') return propertyTitle ? `${t('contact.brokerSubtitle')} ${propertyTitle}` : t('contact.brokerSubtitle');
      if (isNDASigned) return t('contact.inquirySubtitle');
      return propertyTitle ? `${t('contact.subtitle')} Ref: ${propertyTitle}` : t('contact.subtitle');
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4 animate-modal-fade">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl animate-modal-slide overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors bg-gray-50 rounded-full"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Check size={32} />
            </div>
            <h3 className="text-2xl font-display font-bold text-brand-black mb-2">{t('contact.sent')}</h3>
            <p className="text-gray-500">{t('contact.sentDesc')}</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-display font-bold text-brand-black mb-2">
              {getHeader()}
            </h3>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
               {getSubtitle()}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Only show Name/Email if user is NOT logged in */}
              {!currentUser && (
                  <>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-2">{t('contact.name')}</label>
                        <input 
                        type="text" 
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-brand-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-gray-400"
                        placeholder="Boss Laoban"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-2">{t('contact.email')}</label>
                        <input 
                        type="email" 
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-brand-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-gray-400"
                        placeholder="boss@example.com"
                        />
                    </div>
                  </>
              )}

              {currentUser && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-2">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Sending as</p>
                      <p className="font-bold text-brand-black">{currentUser.name}</p>
                  </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-2">{t('contact.message')}</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-brand-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none placeholder:text-gray-400"
                  placeholder={context === 'broker' ? "Hi, I would like to connect..." : "I am interested in this listing..."}
                />
              </div>

              <button 
                type="submit"
                className="mt-2 w-full bg-brand-black text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-gray-900 transition-all hover:scale-[1.01] active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-3"
              >
                {t('contact.send')} <Send size={20} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
