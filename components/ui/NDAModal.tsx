
import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Download } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface NDAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: () => void;
  propertyTitle: string;
  signerName?: string;
}

export const NDAModal: React.FC<NDAModalProps> = ({ isOpen, onClose, onSign, propertyTitle, signerName = '' }) => {
  const [signature, setSignature] = useState(signerName);
  const [step, setStep] = useState<'review' | 'signed'>('review');
  const { t, language } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSignature(signerName); // Prefill if available
      setStep('review');
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, signerName]);

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (signature.trim().length > 0) {
        onSign(); // Notify parent
        setStep('signed');
    }
  };

  const handleDownload = () => {
      // Create a printable view
      const printWindow = window.open('', '_blank');
      if (printWindow) {
          const dateStr = new Date().toLocaleDateString();
          // We use the same translation keys to generate the PDF so it matches the UI
          printWindow.document.write(`
            <html>
                <head>
                    <title>NDA - ${propertyTitle}</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #000; }
                        .header { text-align: center; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
                        h1 { font-size: 24px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
                        .disclaimer { font-size: 10px; color: #666; font-style: italic; }
                        h2 { font-size: 14px; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                        p { margin-bottom: 15px; text-align: justify; font-size: 14px; }
                        .signature-box { margin-top: 60px; background: #f9f9f9; padding: 30px; border: 1px solid #ddd; page-break-inside: avoid; }
                        .sig-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
                        .sig-label { font-weight: bold; font-size: 12px; text-transform: uppercase; color: #666; }
                        .sig-value { font-family: 'Courier New', monospace; font-size: 18px; border-bottom: 1px solid #000; padding-bottom: 5px; min-width: 200px; display: inline-block; }
                        .footer { margin-top: 50px; font-size: 10px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                        .marketplace-note { background: #f0f0f0; padding: 10px; font-size: 12px; border-left: 3px solid #666; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${t('nda.modalTitle')}</h1>
                        <div class="disclaimer">Facilitated by NiHao Laoban Marketplace</div>
                    </div>

                    <p>${t('nda.intro')} <strong>${propertyTitle}</strong>.</p>
                    
                    <div class="marketplace-note">
                        <strong>${t('nda.disclaimerTitle')}:</strong> ${t('nda.disclaimer')}
                    </div>

                    <h2>${t('nda.p1_title')}</h2>
                    <p>${t('nda.p1_text')}</p>
                    
                    <h2>${t('nda.p2_title')}</h2>
                    <p>${t('nda.p2_text')}</p>
                    
                    <h2>${t('nda.p3_title')}</h2>
                    <p>${t('nda.p3_text')}</p>
                    
                    <h2>${t('nda.p4_title')}</h2>
                    <p>${t('nda.p4_text')}</p>
                    
                    <div class="signature-box">
                        <p style="margin-bottom: 20px; font-weight: bold;">${t('nda.agreed')}:</p>
                        <div class="sig-row">
                            <div>
                                <div class="sig-label">${t('nda.signature')} (Electronic)</div>
                                <div class="sig-value">${signature}</div>
                            </div>
                            <div>
                                <div class="sig-label">${t('nda.date')}</div>
                                <div class="sig-value">${dateStr}</div>
                            </div>
                        </div>
                        <div class="sig-row">
                            <div>
                                <div class="sig-label">${t('nda.listingRef')}</div>
                                <div style="font-size: 14px;">${propertyTitle}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        Generated securely by NiHao Laoban Platform | ID: ${Date.now().toString(36).toUpperCase()}
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
          `);
          printWindow.document.close();
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4 animate-modal-fade">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-modal-slide overflow-hidden flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors bg-gray-50 rounded-full z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {step === 'review' ? (
            <>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-brand-black p-3 rounded-full text-white">
                        <FileText size={24} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-black">
                        {t('nda.modalTitle')}
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-6 font-serif text-gray-700 leading-relaxed text-sm">
                    <h3 className="font-bold text-center text-lg mb-4 uppercase">{t('nda.modalTitle')}</h3>
                    <p className="mb-4">
                        {t('nda.intro')} <strong>{propertyTitle}</strong>.
                    </p>
                    
                    <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4 text-xs italic text-gray-500">
                        <strong>{t('nda.disclaimerTitle')}:</strong> {t('nda.disclaimer')}
                    </div>

                    <h4 className="font-bold uppercase text-xs mb-2 mt-4">{t('nda.p1_title')}</h4>
                    <p className="mb-2">{t('nda.p1_text')}</p>
                    
                    <h4 className="font-bold uppercase text-xs mb-2 mt-4">{t('nda.p2_title')}</h4>
                    <p className="mb-2">{t('nda.p2_text')}</p>
                    
                    <h4 className="font-bold uppercase text-xs mb-2 mt-4">{t('nda.p3_title')}</h4>
                    <p className="mb-2">{t('nda.p3_text')}</p>
                    
                    <h4 className="font-bold uppercase text-xs mb-2 mt-4">{t('nda.p4_title')}</h4>
                    <p className="mb-2">{t('nda.p4_text')}</p>

                    <p className="text-sm text-gray-500 mt-8 pt-4 border-t border-gray-300">
                    {t('nda.date')}: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <form onSubmit={handleSign} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">{t('nda.signLabel')}</label>
                        <input 
                            type="text" 
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder="Type full legal name"
                            required
                            className="w-full bg-white border-2 border-gray-200 rounded-xl px-5 py-4 text-brand-black font-display font-bold text-xl focus:outline-none focus:border-brand-black transition-colors placeholder:text-gray-300 placeholder:font-sans"
                        />
                        {signerName && signature !== signerName && (
                            <p className="text-xs text-orange-500 mt-1 ml-1">Name must match your account name: {signerName}</p>
                        )}
                    </div>

                    <button 
                        type="submit"
                        disabled={!signature.trim()}
                        className="w-full bg-brand-black text-white py-4 rounded-2xl font-bold hover:bg-gray-900 transition-all active:scale-95 shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {t('nda.submit')} <CheckCircle2 size={18} />
                    </button>
                </form>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-fade-up">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-display font-bold text-brand-black mb-2">{t('nda.signedSuccess')}</h2>
                <p className="text-gray-500 max-w-sm mb-8">You now have access to the detailed financials and operational data for {propertyTitle}.</p>
                
                <div className="flex flex-col w-full gap-3">
                    <button 
                        onClick={onClose}
                        className="w-full bg-brand-black text-white py-4 rounded-2xl font-bold hover:bg-gray-900 transition-all shadow-lg"
                    >
                        {t('nda.viewDetails')}
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="w-full bg-white border border-gray-200 text-brand-black py-4 rounded-2xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={18} /> {t('nda.downloadPdf')}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
