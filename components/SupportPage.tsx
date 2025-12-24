
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { ArrowLeft, Send, CheckCircle2, ChevronDown, HelpCircle } from 'lucide-react';
import { CustomSelect, Option } from './ui/CustomSelect';
import { Reveal } from './ui/Reveal';

interface SupportPageProps {
  onBack: () => void;
}

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 py-6 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-brand-black group-hover:text-brand-accent transition-colors">{question}</span>
        <div className={`p-2 rounded-full bg-gray-50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} className="text-gray-400" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
        <p className="text-gray-500 leading-relaxed font-medium">
          {answer}
        </p>
      </div>
    </div>
  );
};

export const SupportPage: React.FC<SupportPageProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { sendSupportInquiry } = useMarketplace();
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      role: 'buyer',
      subject: 'general',
      message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const roleOptions: Option[] = [
      { label: t('support.roles.buyer'), value: 'buyer' },
      { label: t('support.roles.owner'), value: 'owner' },
      { label: t('support.roles.realtor'), value: 'realtor' },
      { label: t('support.roles.other'), value: 'other' }
  ];

  const subjectOptions: Option[] = [
      { label: t('support.subjects.general'), value: 'general' },
      { label: t('support.subjects.listing'), value: 'listing' },
      { label: t('support.subjects.tech'), value: 'tech' },
      { label: t('support.subjects.partner'), value: 'partner' }
  ];

  const faqs = (t('support.faqs') as unknown) as any[];

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('sending');
      
      setTimeout(() => {
          sendSupportInquiry(formData);
          setStatus('success');
          setFormData({ name: '', email: '', role: 'buyer', subject: 'general', message: '' });
          setTimeout(() => setStatus('idle'), 5000);
      }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#EEF1EE] pt-6 pb-24 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-brand-black font-medium mb-8 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Contact Form */}
            <div className="lg:col-span-7">
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100 h-full">
                    <Reveal>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-black mb-4">{t('support.title')}</h1>
                        <p className="text-brand-text-grey leading-relaxed mb-10 max-w-lg">
                            {t('support.subtitle')}
                        </p>
                    </Reveal>

                    {status === 'success' ? (
                        <div className="h-96 flex flex-col items-center justify-center text-center animate-fade-up">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-brand-black mb-2">{t('support.success')}</h3>
                            <p className="text-gray-500 max-w-sm">{t('support.successMsg')}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('support.name')}</label>
                                <input 
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-black/5 transition-all"
                                    placeholder="Boss Laoban"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('support.email')}</label>
                                <input 
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-black/5 transition-all"
                                    placeholder="boss@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('support.role')}</label>
                                <CustomSelect 
                                    options={roleOptions}
                                    value={formData.role}
                                    onChange={(val) => setFormData({...formData, role: val})}
                                    className="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 h-[58px] flex items-center"
                                    dropdownClassName="w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('support.subject')}</label>
                                <CustomSelect 
                                    options={subjectOptions}
                                    value={formData.subject}
                                    onChange={(val) => setFormData({...formData, subject: val})}
                                    className="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 h-[58px] flex items-center"
                                    dropdownClassName="w-full"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('support.message')}</label>
                                <textarea 
                                    required
                                    rows={6}
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-black/5 transition-all resize-none"
                                    placeholder="How can we help you today?"
                                />
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <button 
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full bg-brand-black text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-gray-800 transition-all hover:scale-[1.01] active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {status === 'sending' ? t('support.sending') : (
                                        <>
                                            {t('support.submit')} <Send size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Right: FAQs */}
            <div className="lg:col-span-5">
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100 h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-50 rounded-2xl text-brand-accent">
                            <HelpCircle size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold text-brand-black">{t('support.faqTitle')}</h2>
                            <p className="text-sm text-gray-500">{t('support.faqSubtitle')}</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        {faqs.map((faq, i) => (
                            <Reveal key={i} delay={i * 100} width="100%">
                                <FAQItem question={faq.q} answer={faq.a} />
                            </Reveal>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                        <p className="text-sm text-blue-800 font-medium text-center">
                            Can't find what you're looking for? Feel free to reach out to our customer success team directly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
