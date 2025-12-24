
import React, { useEffect, useState } from 'react';
import { 
  X, MapPin, Star, Calendar, Users, 
  Phone, Mail, BadgeCheck, DollarSign, TrendingUp, Building2, Flag, AlertTriangle 
} from 'lucide-react';
import { Business, Report } from '../types';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomSelect } from './ui/CustomSelect';

interface PropertyModalProps {
  property: Business;
  onClose: () => void;
  onBookViewing: () => void;
}

const ReportModal = ({ isOpen, onClose, onSubmit, t }: { isOpen: boolean, onClose: () => void, onSubmit: (reason: string, desc: string) => void, t: any }) => {
    const [reason, setReason] = useState('spam');
    const [description, setDescription] = useState('');

    const reasonOptions = [
        { label: t('details.reportReasons.spam'), value: 'spam' },
        { label: t('details.reportReasons.scam'), value: 'scam' },
        { label: t('details.reportReasons.inappropriate'), value: 'inappropriate' },
        { label: t('details.reportReasons.other'), value: 'other' }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4 animate-modal-fade">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl animate-modal-slide">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black" aria-label="Close"><X size={20}/></button>
                
                <h3 className="text-xl font-bold text-brand-black mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={20} /> {t('details.reportTitle')}
                </h3>
                <p className="text-gray-500 text-sm mb-6">{t('details.reportDesc')}</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('admin.reason')}</label>
                        <CustomSelect 
                            options={reasonOptions}
                            value={reason}
                            onChange={setReason}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2"
                            dropdownClassName="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Details</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/5 resize-none"
                            placeholder="Optional details..."
                        />
                    </div>
                    <button 
                        onClick={() => onSubmit(reason, description)}
                        className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                        {t('details.submitReport')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const PropertyModal: React.FC<PropertyModalProps> = ({ property, onClose, onBookViewing }) => {
  const { addReport } = useMarketplace();
  const { t } = useLanguage();
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleReportSubmit = (reason: string, desc: string) => {
      const report: Report = {
          id: Date.now().toString(),
          targetId: property.id,
          targetType: 'listing',
          reason: reason as any,
          description: desc || 'No details provided.',
          reporter: 'Guest Visitor', // In a real app, use auth user
          status: 'pending',
          timestamp: new Date()
      };
      addReport(report);
      setIsReportOpen(false);
      alert(t('details.reportSent'));
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center px-4 animate-modal-fade">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#EEF1EE] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-modal-slide">
        
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
        >
          <X size={20} />
        </button>

        {/* Image Section - Left Side on Desktop */}
        <div className="relative w-full md:w-5/12 h-64 md:h-auto shrink-0 group bg-gray-50 border-r border-gray-200">
          <img 
            src={property.image} 
            alt={property.title} 
            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5 md:bg-gradient-to-r md:from-transparent md:to-black/5 pointer-events-none" />
          
          <div className="absolute top-6 left-6 flex gap-2 z-10 flex-wrap pr-12">
             <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20">
                <span className="text-xs font-bold text-brand-black tracking-wide uppercase">
                    {t(`options.${property.category.toLowerCase()}`) || property.category}
                </span>
             </div>
             <div className="bg-brand-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">{property.rating}</span>
             </div>
          </div>

           {/* Mobile Title Overlay */}
           <div className="absolute bottom-4 left-4 right-4 md:hidden">
              <h2 className="text-2xl font-display font-bold text-white mb-1 shadow-black/50 drop-shadow-md">{property.title}</h2>
              <p className="text-gray-200 text-sm flex items-center gap-1 drop-shadow-md">
                 <MapPin size={14} /> {property.location}
              </p>
           </div>
        </div>

        {/* Details Section - Right Side on Desktop */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white md:bg-[#F8F9F8]">
          <div className="p-6 md:p-10 flex flex-col min-h-full">
            
            {/* Desktop Header - Refined */}
            <div className="hidden md:flex flex-col mb-8">
              <div className="flex items-center justify-between">
                 <div className="flex gap-3 mb-4">
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                         {property.status === 'active' ? 'Active' : 'Sold'}
                     </span>
                     <span className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                         {t(`options.${property.category.toLowerCase()}`) || property.category}
                     </span>
                 </div>
                 <button 
                    onClick={onClose}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-brand-black hover:bg-gray-100 transition-colors border border-gray-200 shrink-0 shadow-sm"
                 >
                    <X size={24} />
                 </button>
              </div>

              <div>
                <h2 className="text-5xl font-display font-bold text-brand-black mb-3 leading-tight tracking-tight">{property.title}</h2>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={22} className="shrink-0 text-brand-black" />
                  <span className="font-medium text-xl text-gray-600">{property.location}</span>
                </div>
              </div>
            </div>

            {/* Key Stats Bar - Refined Glassmorphism */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
              <div className="bg-white/60 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/50 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300">
                <DollarSign size={28} className="text-brand-black mb-2 opacity-80" strokeWidth={1.5} />
                <span className="text-lg md:text-2xl font-display font-bold text-brand-black">${(property.grossRevenue / 1000).toFixed(0)}k</span>
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Revenue</span>
              </div>
              <div className="bg-white/60 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/50 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300">
                <TrendingUp size={28} className="text-green-600 mb-2 opacity-80" strokeWidth={1.5} />
                <span className="text-lg md:text-2xl font-display font-bold text-green-700">${(property.cashFlow / 1000).toFixed(0)}k</span>
                <span className="text-[10px] md:text-xs text-green-700/60 font-bold uppercase tracking-widest mt-1">Cash Flow</span>
              </div>
              <div className="bg-white/60 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/50 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300">
                <Calendar size={28} className="text-brand-black mb-2 opacity-80" strokeWidth={1.5} />
                <span className="text-lg md:text-2xl font-display font-bold text-brand-black">{property.yearsEstablished}</span>
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Years Est.</span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left Column (Description & Details) */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Description */}
                    <div>
                        <h3 className="text-xl font-display font-bold mb-4 text-brand-black">About this business</h3>
                        <p className="text-gray-600 leading-relaxed text-base">
                            {property.description}
                        </p>
                    </div>

                    {/* Detailed Features Grid - Refined */}
                    <div>
                        <h3 className="text-xl font-display font-bold mb-5 text-brand-black">Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="p-3 bg-gray-50 rounded-xl text-gray-500"><Users size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Employees</p>
                                    <p className="font-bold text-brand-black text-lg">{property.employees}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="p-3 bg-gray-50 rounded-xl text-gray-500"><Building2 size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Real Estate</p>
                                    <p className="font-bold text-brand-black text-sm leading-tight">{property.realEstate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Agent) */}
                <div className="flex flex-col gap-8">
                    {/* Refined Agent Card with Frosted Glass */}
                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-lg shadow-black/5 relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative shrink-0">
                              <img src={property.agent.image} alt={property.agent.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md" />
                              <div className="absolute -bottom-1 -right-1 bg-brand-black text-white p-1 rounded-full border-2 border-white shadow-sm">
                                <BadgeCheck size={14} fill="currentColor" className="text-white" />
                              </div>
                            </div>
                            <div>
                                <h5 className="font-display font-bold text-xl text-brand-black mb-1">
                                  {property.agent.name}
                                </h5>
                                <p className="text-sm text-gray-500 font-medium">Business Broker</p>
                                <div className="flex items-center gap-1.5 mt-2 bg-yellow-50 px-2 py-1 rounded-lg w-fit">
                                   <Star size={12} className="text-yellow-500 fill-yellow-500" /> 
                                   <span className="text-xs font-bold text-yellow-700">Top Rated</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                           <button className="col-span-1 bg-brand-black text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-black/10">
                              <Phone size={18} /> Call
                           </button>
                           <button className="col-span-1 bg-white border border-gray-200 text-brand-black py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all hover:-translate-y-0.5 shadow-sm">
                              <Mail size={18} /> Email
                           </button>
                        </div>

                         <button 
                            onClick={() => setIsReportOpen(true)}
                            className="w-full text-gray-400 py-2 text-xs font-bold hover:text-red-500 transition-colors flex items-center justify-center gap-1 mt-2"
                        >
                            <Flag size={12} /> {t('details.report')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl -mx-6 -mb-6 p-6 md:static md:bg-transparent md:mx-0 md:mb-0 md:p-0 pt-6 mt-auto border-t border-gray-100 md:border-none z-10 rounded-t-3xl md:rounded-none">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="w-full md:w-auto flex justify-between md:block">
                  <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Asking Price</div>
                  <div className="text-4xl font-display font-bold text-brand-black">
                    ${property.price.toLocaleString()}
                  </div>
                </div>
                <button 
                  onClick={onBookViewing}
                  className="w-full md:w-auto flex-1 md:flex-none md:px-12 bg-brand-black text-white h-16 rounded-[2rem] font-bold text-lg hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-brand-black/20"
                >
                  Contact Broker
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Report Modal */}
      <ReportModal 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmit={handleReportSubmit}
        t={t}
      />
    </div>
  );
};
