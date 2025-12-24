
import React, { useState, useRef } from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { Plus, Trash2, Mail, Phone, Key, RefreshCw, Copy, Check, Edit3, EyeOff, Eye, Image as ImageIcon, Upload } from 'lucide-react';
import { Broker } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { ConfirmationModal } from '../ui/ConfirmationModal';

export const AdminBrokers: React.FC = () => {
  const { brokers, addBroker, updateBroker, deleteBroker } = useMarketplace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
      isDangerous: boolean;
      confirmText?: string;
  }>({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
      isDangerous: false
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void, isDangerous = false, confirmText = "Confirm") => {
      setConfirmModal({ isOpen: true, title, message, onConfirm, isDangerous, confirmText });
  };
  
  const initialBrokerState: Partial<Broker> = {
      name: '',
      email: '',
      phone: '',
      location: '',
      specialties: [],
      experience: 0,
      languages: [],
      description: '',
      image: '', // Start empty to trigger placeholder
      password: '',
      status: 'active'
  };

  const [currentBroker, setCurrentBroker] = useState<Partial<Broker>>(initialBrokerState);

  const generatePassword = () => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
      let pass = "";
      for(let i=0; i<12; i++) {
          pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setGeneratedPassword(pass);
      setCurrentBroker(prev => ({ ...prev, password: pass }));
      setCopied(false);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = (broker: Broker) => {
      setCurrentBroker({
          ...broker,
          specialties: broker.specialties, // Keep as array
          languages: broker.languages // Keep as array
      });
      setEditingId(broker.id);
      setIsModalOpen(true);
      setGeneratedPassword(broker.password || '');
  };

  const handleAdd = () => {
      setCurrentBroker({
          ...initialBrokerState,
          image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop&fm=webp' // Default image
      });
      setEditingId(null);
      setGeneratedPassword('');
      setIsModalOpen(true);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const imageUrl = URL.createObjectURL(file);
          setCurrentBroker(prev => ({ ...prev, image: imageUrl }));
      }
  };

  const toggleHide = (broker: Broker) => {
      const newStatus = broker.status === 'hidden' ? 'active' : 'hidden';
      const actionText = newStatus === 'hidden' ? t('admin.hide') : t('admin.unhide');
      
      openConfirm(
          `${actionText} Broker`,
          `Are you sure you want to ${actionText.toLowerCase()} ${broker.name}?`,
          () => updateBroker(broker.id, { status: newStatus }),
          false,
          actionText
      );
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const brokerData: Broker = {
          ...currentBroker as Broker,
          specialties: typeof currentBroker.specialties === 'string' ? (currentBroker.specialties as string).split(',').map((s: string) => s.trim()) : currentBroker.specialties || [],
          languages: typeof currentBroker.languages === 'string' ? (currentBroker.languages as string).split(',').map((s: string) => s.trim()) : currentBroker.languages || ['English'],
          status: currentBroker.status || 'active',
          image: currentBroker.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop&fm=webp'
      };

      if (editingId) {
          updateBroker(editingId, brokerData);
      } else {
          addBroker({ ...brokerData, id: Date.now().toString() });
      }

      setIsModalOpen(false);
      setCurrentBroker(initialBrokerState);
      setGeneratedPassword('');
      setEditingId(null);
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('admin.manageBrokers')}</h1>
            <button 
                onClick={handleAdd}
                className="bg-brand-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all hover:scale-105 shadow-xl shadow-brand-black/20"
            >
                <div className="bg-white/20 p-1 rounded-full"><Plus size={16} /></div>
                {t('admin.addBroker')}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brokers.map((broker) => (
                <div key={broker.id} className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 relative ${broker.status === 'hidden' ? 'opacity-60 grayscale' : ''}`}>
                    {broker.status === 'hidden' && (
                        <div className="absolute top-4 right-4 bg-gray-200 px-2 py-1 rounded text-xs font-bold text-gray-600">{t('listings.hidden')}</div>
                    )}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <img src={broker.image} alt={broker.name} className="w-16 h-16 rounded-full object-cover bg-gray-100" />
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{broker.name}</h3>
                                <p className="text-sm text-gray-500">{broker.location}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><Mail size={14} /> {broker.email}</div>
                        <div className="flex items-center gap-2"><Phone size={14} /> {broker.phone}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {broker.specialties.map((s, i) => (
                                <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-600">{s}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <button onClick={() => handleEdit(broker)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg hover:text-brand-black" title={t('admin.edit')}>
                                 <Edit3 size={18} />
                             </button>
                             <button onClick={() => toggleHide(broker)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg hover:text-brand-black" title={broker.status === 'hidden' ? t('admin.unhide') : t('admin.hide')}>
                                 {broker.status === 'hidden' ? <Eye size={18} /> : <EyeOff size={18} />}
                             </button>
                         </div>
                         <button 
                            onClick={() => openConfirm(
                                'Delete Broker',
                                `Are you sure you want to delete ${broker.name}? This action cannot be undone.`,
                                () => deleteBroker(broker.id),
                                true,
                                'Delete'
                            )}
                            className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            title={t('admin.delete')}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    {broker.password && (
                        <div className="mt-2">
                             <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 p-2 rounded-lg">
                                <Key size={14} /> Credentials Active
                             </div>
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Add/Edit Broker Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Broker' : 'Add New Broker'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Profile Picture Upload */}
                        <div className="flex justify-center mb-6">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    {currentBroker.image ? (
                                        <img src={currentBroker.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-gray-400" size={32} />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload className="text-white" size={20} />
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                />
                                <p className="text-xs text-center mt-2 text-gray-500 font-bold">Profile Picture</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <input required placeholder="Name" value={currentBroker.name} onChange={e => setCurrentBroker({...currentBroker, name: e.target.value})} className="border p-2 rounded-lg" />
                             <input required placeholder="Experience (Years)" type="number" value={currentBroker.experience} onChange={e => setCurrentBroker({...currentBroker, experience: parseInt(e.target.value)})} className="border p-2 rounded-lg" />
                        </div>
                        <input required placeholder="Email (Username)" type="email" value={currentBroker.email} onChange={e => setCurrentBroker({...currentBroker, email: e.target.value})} className="w-full border p-2 rounded-lg" />
                        <input required placeholder="Phone" value={currentBroker.phone} onChange={e => setCurrentBroker({...currentBroker, phone: e.target.value})} className="w-full border p-2 rounded-lg" />
                        <input required placeholder="Location" value={currentBroker.location} onChange={e => setCurrentBroker({...currentBroker, location: e.target.value})} className="w-full border p-2 rounded-lg" />
                        <input required placeholder="Specialties (comma separated)" value={currentBroker.specialties} onChange={e => setCurrentBroker({...currentBroker, specialties: e.target.value as any})} className="w-full border p-2 rounded-lg" />
                        <textarea placeholder="Bio" value={currentBroker.description} onChange={e => setCurrentBroker({...currentBroker, description: e.target.value})} className="w-full border p-2 rounded-lg" rows={3} />
                        
                        {/* Login Credentials Section */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
                             <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Key size={16} /> Login Credentials</h4>
                             <div className="flex gap-2">
                                 <input 
                                     type="text" 
                                     placeholder={t('auth.password')} 
                                     value={currentBroker.password} 
                                     onChange={e => {
                                         setCurrentBroker({...currentBroker, password: e.target.value});
                                         setGeneratedPassword(e.target.value);
                                     }}
                                     className="flex-1 border p-2 rounded-lg bg-white" 
                                 />
                                 <button type="button" onClick={generatePassword} className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 text-gray-600" title="Generate Password">
                                     <RefreshCw size={18} />
                                 </button>
                                 <button type="button" onClick={copyToClipboard} className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 text-gray-600" title="Copy">
                                     {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                                 </button>
                             </div>
                             {generatedPassword && <p className="text-xs text-gray-500 mt-1">Make sure to copy this password.</p>}
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold">Cancel</button>
                            <button type="submit" className="flex-1 bg-brand-black text-white py-3 rounded-xl font-bold">Save Broker</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal 
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            isDangerous={confirmModal.isDangerous}
            confirmText={confirmModal.confirmText}
        />
    </div>
  );
};
