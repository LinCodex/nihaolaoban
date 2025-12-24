
import React, { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, CheckCircle2, DollarSign, MapPin, BarChart3, TrendingUp, Building2, Package, Save, Plus, Trash2, Upload, User, Star, Layout, GripVertical, ChevronDown, ChevronUp, Lightbulb, MoveVertical, Clock, Key } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { CustomSelect } from './CustomSelect';
import { Business, Broker, CustomSection } from '../../types';

interface PostListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Business | null;
  onSave?: (data: any) => void;
}

export const PostListingModal: React.FC<PostListingModalProps> = ({ isOpen, onClose, initialData, onSave }) => {
  const { brokers } = useMarketplace();
  const [step, setStep] = useState(1);
  const [activeLang, setActiveLang] = useState<'en' | 'zh'>('en');
  const [activeTab, setActiveTab] = useState<'financials' | 'operations' | 'details' | 'photos'>('financials');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  // Custom Broker State
  const [customBroker, setCustomBroker] = useState({
      name: '',
      email: '',
      phone: '',
      image: ''
  });

  // Shared Data (Numeric, Images, Relations)
  const [sharedData, setSharedData] = useState({
      id: '',
      price: '',
      downPayment: '',
      grossRevenue: '',
      cashFlow: '',
      ebitda: '',
      ffne: '',
      inventory: '',
      rent: '',
      sqFt: '',
      employees: '',
      yearsEstablished: '',
      leaseExpiration: '',
      realEstate: 'Leased',
      ownerHours: '',
      hoursOfOperation: '',
      isFinancialsEstimated: false,
      category: 'Restaurant',
      sellerType: 'Owner',
      rating: 4.5,
      brokerId: 'owner',
      status: 'pending',
      tags: [] as string[],
      franchise: false
  });

  // Localized Data (Text Content)
  const [enData, setEnData] = useState({
      title: 'Untitled Business',
      location: '',
      description: 'Describe your business highlights here...',
      reasonForSelling: '',
      competition: '',
      growthExpansion: '',
      supportTraining: '',
      customSections: [] as CustomSection[]
  });

  const [zhData, setZhData] = useState({
      title: '未命名生意',
      location: '',
      description: '在此描述您的生意亮点...',
      reasonForSelling: '',
      competition: '',
      growthExpansion: '',
      supportTraining: '',
      customSections: [] as CustomSection[]
  });

  // Tags Input State
  const [tagInput, setTagInput] = useState('');

  const categoryOptions = [
    { label: t('options.restaurant'), value: 'Restaurant' },
    { label: t('options.beauty'), value: 'Beauty' },
    { label: t('options.retail'), value: 'Retail' },
    { label: t('options.service'), value: 'Service' },
    { label: t('options.other'), value: 'Other' }
  ];

  const realEstateOptions = [
      { label: t('details.re_leased'), value: 'Leased' },
      { label: t('details.re_included'), value: 'Included' },
      { label: t('details.re_available'), value: 'Available' },
      { label: t('details.re_na'), value: 'Not Applicable' }
  ];

  const brokerOptions = [
      { label: t('sellerType.Owner'), value: 'owner' },
      ...brokers.map(b => ({ label: `${b.name} (${b.location})`, value: b.id })),
      { label: t('post.manualBroker'), value: 'custom' }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep(1);
      setActiveLang('en');
      setActiveTab('financials');
      
      if (initialData) {
          // Populate Shared
          let brokerId = 'owner';
          const foundBroker = brokers.find(b => b.name === initialData.agent?.name);
          if (foundBroker) {
              brokerId = foundBroker.id;
          } else if (initialData.agent && initialData.agent.name !== 'Owner') {
              brokerId = 'custom';
              setCustomBroker({
                  name: initialData.agent.name,
                  email: initialData.agent.email,
                  phone: initialData.agent.phone,
                  image: initialData.agent.image
              });
          }

          setSharedData({
              id: initialData.id,
              price: initialData.price.toString(),
              downPayment: initialData.downPayment?.toString() || '',
              grossRevenue: initialData.grossRevenue.toString(),
              cashFlow: initialData.cashFlow.toString(),
              ebitda: initialData.ebitda?.toString() || '',
              ffne: initialData.ffne?.toString() || '',
              inventory: initialData.inventory?.toString() || '',
              rent: initialData.rent?.toString() || '',
              sqFt: initialData.sqFt?.toString() || '',
              employees: initialData.employees || '',
              yearsEstablished: initialData.yearsEstablished.toString(),
              leaseExpiration: initialData.leaseExpiration || '',
              realEstate: initialData.realEstate || 'Leased',
              ownerHours: initialData.ownerHours || '',
              hoursOfOperation: initialData.hoursOfOperation || '',
              isFinancialsEstimated: initialData.isFinancialsEstimated || false,
              category: initialData.category,
              sellerType: initialData.sellerType,
              rating: initialData.rating,
              brokerId: brokerId,
              status: initialData.status,
              tags: initialData.tags || [],
              franchise: initialData.franchise || false
          });

          // Populate EN
          setEnData({
              title: initialData.title,
              location: initialData.location,
              description: initialData.description,
              reasonForSelling: initialData.reasonForSelling || '',
              competition: initialData.competition || '',
              growthExpansion: initialData.growthExpansion || '',
              supportTraining: initialData.supportTraining || '',
              customSections: initialData.customSections || []
          });

          // Populate ZH
          if (initialData.translations?.zh) {
              setZhData({
                title: initialData.translations.zh.title,
                location: initialData.translations.zh.location,
                description: initialData.translations.zh.description,
                reasonForSelling: initialData.translations.zh.reasonForSelling || '',
                competition: initialData.translations.zh.competition || '',
                growthExpansion: initialData.translations.zh.growthExpansion || '',
                supportTraining: initialData.translations.zh.supportTraining || '',
                customSections: initialData.translations.zh.customSections || []
              });
          } else {
             setZhData({
                 title: initialData.title, 
                 location: initialData.location,
                 description: '',
                 reasonForSelling: '',
                 competition: '',
                 growthExpansion: '',
                 supportTraining: '',
                 customSections: []
             });
          }
          
          const imgs = initialData.images || (initialData.image ? [initialData.image] : []);
          setImages(imgs);
      } else {
          // Reset
          setImages([]);
          setCustomBroker({ name: '', email: '', phone: '', image: '' });
          setSharedData({
            id: '', price: '', downPayment: '', grossRevenue: '', cashFlow: '', ebitda: '', ffne: '', inventory: '',
            rent: '', sqFt: '', employees: '', yearsEstablished: '', leaseExpiration: '', realEstate: 'Leased',
            ownerHours: '', hoursOfOperation: '', isFinancialsEstimated: false, category: 'Restaurant',
            sellerType: 'Owner', rating: 4.5, brokerId: 'owner', status: 'pending', tags: [], franchise: false
          });
          setEnData({ title: 'Untitled Business', location: '', description: '', reasonForSelling: '', competition: '', growthExpansion: '', supportTraining: '', customSections: [] });
          setZhData({ title: '未命名生意', location: '', description: '', reasonForSelling: '', competition: '', growthExpansion: '', supportTraining: '', customSections: [] });
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, initialData, brokers]);

  // Handlers
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (activeLang === 'en') setEnData(prev => ({ ...prev, [name]: value }));
      else setZhData(prev => ({ ...prev, [name]: value }));
  };

  const handleSharedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setSharedData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomSectionChange = (id: string, field: 'title' | 'content', value: string) => {
      const update = (prev: typeof enData) => ({
          ...prev,
          customSections: prev.customSections.map(s => s.id === id ? { ...s, [field]: value } : s)
      });
      if (activeLang === 'en') setEnData(update);
      else setZhData(update);
  };

  const addCustomSection = () => {
      const newSection = { id: Date.now().toString(), title: '', content: '' };
      setEnData(prev => ({ ...prev, customSections: [...prev.customSections, newSection] }));
      setZhData(prev => ({ ...prev, customSections: [...prev.customSections, { ...newSection }] }));
  };

  const removeCustomSection = (id: string) => {
      setEnData(prev => ({ ...prev, customSections: prev.customSections.filter(s => s.id !== id) }));
      setZhData(prev => ({ ...prev, customSections: prev.customSections.filter(s => s.id !== id) }));
  };

  const addTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && tagInput.trim()) {
          e.preventDefault();
          if (!sharedData.tags.includes(tagInput.trim())) {
              setSharedData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
          }
          setTagInput('');
      }
  };
  
  const removeTag = (tag: string) => {
      setSharedData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file as Blob));
          setImages(prev => [...prev, ...newImages]);
      }
  };

  const removeImage = (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
      if (onSave) {
          let selectedAgent = { name: 'Owner', image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80', phone: '', email: '' };
          if (sharedData.brokerId === 'custom') {
              selectedAgent = { name: customBroker.name || 'Custom Agent', image: customBroker.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80', phone: customBroker.phone, email: customBroker.email };
          } else if (sharedData.brokerId !== 'owner') {
              const broker = brokers.find(b => b.id === sharedData.brokerId);
              if (broker) selectedAgent = { name: broker.name, image: broker.image, phone: broker.phone, email: broker.email };
          }

          const finalData: Business = {
              ...sharedData,
              ...enData, 
              id: sharedData.id || Date.now().toString(),
              price: parseFloat(sharedData.price),
              downPayment: parseFloat(sharedData.downPayment || '0'),
              grossRevenue: parseFloat(sharedData.grossRevenue),
              cashFlow: parseFloat(sharedData.cashFlow),
              ebitda: parseFloat(sharedData.ebitda || '0'),
              ffne: parseFloat(sharedData.ffne || '0'),
              inventory: parseFloat(sharedData.inventory || '0'),
              rent: parseFloat(sharedData.rent || '0'),
              sqFt: parseFloat(sharedData.sqFt || '0'),
              yearsEstablished: parseInt(sharedData.yearsEstablished || '0'),
              rating: Number(sharedData.rating),
              agent: selectedAgent,
              image: images[0] || '',
              images: images,
              views: initialData?.views || 0,
              realEstate: sharedData.realEstate as any,
              leaseExpiration: sharedData.leaseExpiration,
              sellerType: sharedData.brokerId === 'owner' ? 'Owner' : 'Agent',
              category: sharedData.category as any,
              status: sharedData.status as any,
              franchise: sharedData.franchise,
              coordinates: initialData?.coordinates || [-73.97, 40.75],
              translations: { zh: zhData }
          };
          onSave(finalData);
      }
      setStep(2);
      setTimeout(() => { onClose(); setStep(1); }, 2000);
  };

  if (!isOpen) return null;
  const currentData = activeLang === 'en' ? enData : zhData;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center animate-modal-fade bg-white">
      {step === 2 && (
         <div className="flex flex-col items-center justify-center h-full w-full animate-modal-slide px-4 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"><CheckCircle2 size={48} /></div>
            <h3 className="text-4xl font-display font-bold text-brand-black mb-4">Saved Successfully!</h3>
         </div>
      )}

      {step === 1 && (
      <div className="w-full h-full flex flex-col bg-[#EEF1EE] overflow-hidden">
        <div className="h-20 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between shrink-0 z-50">
             <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close modal"><X size={24} /></button>
                <div className="flex flex-col">
                    <span className="font-bold text-lg text-brand-black">{initialData ? t('admin.edit') : t('dashboard.createNew')}</span>
                    <span className="text-xs text-gray-400">Comprehensive Editor</span>
                </div>
             </div>
             <div className="flex bg-gray-100 p-1 rounded-full">
                 <button onClick={() => setActiveLang('en')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeLang === 'en' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500 hover:text-gray-700'}`}>English</button>
                 <button onClick={() => setActiveLang('zh')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeLang === 'zh' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500 hover:text-gray-700'}`}>中文 (Chinese)</button>
             </div>
             <button onClick={handleSubmit} className="bg-brand-black text-white px-6 md:px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition-all hover:scale-105 flex items-center gap-2">
                <Save size={18} /> {t('dashboard.saveChanges')}
             </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
            <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">Sections</div>
                <button onClick={() => setActiveTab('financials')} className={`text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'financials' ? 'bg-brand-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}><DollarSign size={18} /> Financials</button>
                <button onClick={() => setActiveTab('operations')} className={`text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'operations' ? 'bg-brand-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}><Key size={18} /> Operations & Lease</button>
                <button onClick={() => setActiveTab('details')} className={`text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'details' ? 'bg-brand-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}><Layout size={18} /> Description & Content</button>
                <button onClick={() => setActiveTab('photos')} className={`text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'photos' ? 'bg-brand-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}><ImageIcon size={18} /> Media & Broker</button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {activeTab === 'financials' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-brand-black mb-4">Financial Overview</h2>
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Asking Price *</label><input name="price" type="number" value={sharedData.price} onChange={handleSharedChange} className="w-full bg-gray-50 p-4 rounded-xl font-bold text-xl focus:outline-none focus:ring-2 focus:ring-black/5" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Down Payment</label><input name="downPayment" type="number" value={sharedData.downPayment} onChange={handleSharedChange} className="w-full bg-gray-50 p-3 rounded-xl font-bold focus:outline-none" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Gross Revenue *</label><input name="grossRevenue" type="number" value={sharedData.grossRevenue} onChange={handleSharedChange} className="w-full bg-gray-50 p-3 rounded-xl font-bold focus:outline-none" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Cash Flow *</label><input name="cashFlow" type="number" value={sharedData.cashFlow} onChange={handleSharedChange} className="w-full bg-green-50 text-green-700 p-3 rounded-xl font-bold focus:outline-none" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">EBITDA</label><input name="ebitda" type="number" value={sharedData.ebitda} onChange={handleSharedChange} className="w-full bg-gray-50 p-3 rounded-xl font-bold focus:outline-none" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">FF&E Value</label><input name="ffne" type="number" value={sharedData.ffne} onChange={handleSharedChange} className="w-full bg-gray-50 p-3 rounded-xl font-bold focus:outline-none" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Inventory Value</label><input name="inventory" type="number" value={sharedData.inventory} onChange={handleSharedChange} className="w-full bg-gray-50 p-3 rounded-xl font-bold focus:outline-none" /></div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-600 cursor-pointer"><input type="checkbox" checked={sharedData.isFinancialsEstimated} onChange={(e) => setSharedData(prev => ({ ...prev, isFinancialsEstimated: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-brand-black focus:ring-brand-black"/> Financials are estimated</label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'operations' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-brand-black mb-4">Operations & Lease</h2>
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Real Estate Type</label>
                                        <CustomSelect options={realEstateOptions} value={sharedData.realEstate} onChange={(val) => setSharedData(prev => ({ ...prev, realEstate: val }))} className="bg-gray-50 px-4 py-3 rounded-xl" />
                                    </div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Lease Expiration</label><input name="leaseExpiration" value={sharedData.leaseExpiration} onChange={handleSharedChange} className="w-full bg-gray-50 p-3 rounded-xl font-bold focus:outline-none" placeholder="e.g. 2030" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Rent</label><input name="rent" type="number" step="0.01" value={sharedData.rent} onChange={handleSharedChange} className="w-full bg-gray-50 p-3 rounded-xl font-bold focus:outline-none" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Square Footage</label><input name="sqFt" type="number" value={sharedData.sqFt} onChange={handleSharedChange} className="w-full bg-gray-50 p-3 rounded-xl font-bold focus:outline-none" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Employees</label><input name="employees" value={sharedData.employees} onChange={handleSharedChange} className="w-full bg-gray-50 p-3 rounded-xl font-bold focus:outline-none" placeholder="e.g. 4 FT, 2 PT" /></div>
                                    
                                    {/* Years Established - Explicit styling for request */}
                                    <div className="relative group">
                                        <label className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1 flex items-center gap-1">Years Established <Star size={10} fill="currentColor"/></label>
                                        <input 
                                            name="yearsEstablished" 
                                            type="number" 
                                            value={sharedData.yearsEstablished} 
                                            onChange={handleSharedChange} 
                                            className="w-full bg-blue-50 border-2 border-transparent focus:border-blue-200 p-3 rounded-xl font-bold focus:outline-none text-blue-800" 
                                            placeholder="e.g. 10"
                                        />
                                        <div className="absolute right-3 top-8 text-xs font-bold text-blue-300 pointer-events-none">YEARS</div>
                                    </div>

                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Hours of Operation</label><input name="hoursOfOperation" value={sharedData.hoursOfOperation} onChange={handleSharedChange} className="w-full bg-gray-50 p-3 rounded-xl font-bold focus:outline-none" placeholder="e.g. Mon-Sun 10am-9pm" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Owner Hours (Weekly)</label><input name="ownerHours" value={sharedData.ownerHours} onChange={handleSharedChange} className="w-full bg-gray-50 p-3 rounded-xl font-bold focus:outline-none" placeholder="e.g. 20 hours" /></div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-600 cursor-pointer"><input type="checkbox" checked={sharedData.franchise} onChange={(e) => setSharedData(prev => ({ ...prev, franchise: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-brand-black focus:ring-brand-black"/> Is Franchise</label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-brand-black">Description & Content</h2>
                                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wider">Editing: {activeLang === 'en' ? 'English' : 'Chinese'}</span>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                                <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('post.listingTitle')}</label><input name="title" value={currentData.title} onChange={handleTextChange} className="w-full text-xl font-bold text-brand-black border-b-2 border-gray-100 focus:border-brand-black focus:outline-none pb-2 transition-colors" placeholder="Listing Title" /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('post.location')}</label><input name="location" value={currentData.location} onChange={handleTextChange} className="w-full font-bold text-gray-700 focus:outline-none" placeholder="City, State" /></div>
                                <div className="relative"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('post.description')}</label><textarea name="description" rows={5} value={currentData.description} onChange={handleTextChange} className="w-full bg-gray-50 rounded-xl p-4 text-sm focus:outline-none resize-y" /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('post.reason')}</label><textarea name="reasonForSelling" rows={3} value={currentData.reasonForSelling} onChange={handleTextChange} className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none resize-none" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{t('post.growth')}</label><textarea name="growthExpansion" rows={3} value={currentData.growthExpansion} onChange={handleTextChange} className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none resize-none" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Competition</label><textarea name="competition" rows={3} value={currentData.competition} onChange={handleTextChange} className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none resize-none" /></div>
                                    <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Support & Training</label><textarea name="supportTraining" rows={3} value={currentData.supportTraining} onChange={handleTextChange} className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none resize-none" /></div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg">{t('post.customSections')}</h3>
                                    <button onClick={addCustomSection} className="text-xs font-bold bg-brand-black text-white px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus size={14} /> Add</button>
                                </div>
                                <div className="space-y-4">
                                    {currentData.customSections.map((section, idx) => (
                                        <div key={section.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group animate-fade-up">
                                            <input value={section.title} onChange={(e) => handleCustomSectionChange(section.id, 'title', e.target.value)} placeholder="Section Title" className="bg-transparent font-bold text-gray-900 mb-2 w-full focus:outline-none" />
                                            <textarea value={section.content} onChange={(e) => handleCustomSectionChange(section.id, 'content', e.target.value)} placeholder="Content..." rows={2} className="w-full bg-white p-3 rounded-lg text-sm resize-y focus:outline-none" />
                                            <button onClick={() => removeCustomSection(section.id)} className="absolute top-2 right-2 p-1 bg-white rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                    {currentData.customSections.length === 0 && <p className="text-center text-gray-400 text-sm italic">No custom sections. Add one to provide more details.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'photos' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-brand-black mb-4">Media & Broker</h2>
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-6">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Photos</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group bg-gray-100">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button onClick={(e) => removeImage(idx, e)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                            {idx === 0 && <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">Cover</span>}
                                        </div>
                                    ))}
                                    <div onClick={() => fileInputRef.current?.click()} className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors">
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-xs font-bold">Upload</span>
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple accept="image/*" className="hidden" />
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Assign Broker</h3>
                                <div className="relative">
                                    <CustomSelect 
                                        options={brokerOptions}
                                        value={sharedData.brokerId}
                                        onChange={(val) => setSharedData(prev => ({ ...prev, brokerId: val }))}
                                        className="bg-gray-50 px-4 py-3 rounded-xl"
                                        dropdownClassName="w-full max-h-[200px] overflow-y-auto"
                                    />
                                </div>

                                {sharedData.brokerId === 'custom' && (
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4 animate-fade-up">
                                        <input placeholder="Name" value={customBroker.name} onChange={e => setCustomBroker({...customBroker, name: e.target.value})} className="bg-white p-2 rounded-lg text-sm border border-gray-200" />
                                        <input placeholder="Phone" value={customBroker.phone} onChange={e => setCustomBroker({...customBroker, phone: e.target.value})} className="bg-white p-2 rounded-lg text-sm border border-gray-200" />
                                        <input placeholder="Email" value={customBroker.email} onChange={e => setCustomBroker({...customBroker, email: e.target.value})} className="bg-white p-2 rounded-lg text-sm border border-gray-200" />
                                        <input placeholder="Image URL" value={customBroker.image} onChange={e => setCustomBroker({...customBroker, image: e.target.value})} className="bg-white p-2 rounded-lg text-sm border border-gray-200" />
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Metadata</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            {categoryOptions.map(opt => (
                                                <button key={opt.value} onClick={() => setSharedData(prev => ({ ...prev, category: opt.value }))} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${sharedData.category === opt.value ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>{opt.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Tags</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {sharedData.tags.map(tag => (
                                                <span key={tag} className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">{tag} <button onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}><X size={12} /></button></span>
                                            ))}
                                        </div>
                                        <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Add tag + Enter" className="w-full bg-gray-50 p-2 rounded-xl text-sm focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
      )}
    </div>
  );
};
