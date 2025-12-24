
import React, { useState } from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { CheckCircle, Trash2, Search, Eye, Edit3, EyeOff, DollarSign, Tag, Plus, Star, MapPin, ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { Business } from '../../types';
import { PropertyModal } from '../PropertyModal';
import { PostListingModal } from '../ui/PostListingModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { ConfirmationModal } from '../ui/ConfirmationModal';

const ITEMS_PER_PAGE = 10;

// Compact Quick View Modal
const AdminQuickViewModal: React.FC<{ listing: Business; onClose: () => void; onToggleStatus: (status: any) => void }> = ({ listing, onClose, onToggleStatus }) => {
    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4 animate-modal-fade">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-modal-slide flex flex-col md:flex-row h-[500px]">
                <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors" aria-label="Close"><X size={20} /></button>
                
                {/* Image Side */}
                <div className="w-full md:w-5/12 h-48 md:h-full relative bg-gray-100">
                    <img src={listing.image} className="w-full h-full object-cover" alt="" />
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-black shadow-sm">
                        {listing.category}
                    </div>
                </div>

                {/* Details Side */}
                <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto">
                    <h2 className="text-2xl font-display font-bold text-brand-black mb-1">{listing.title}</h2>
                    <p className="text-gray-500 text-sm mb-6 flex items-center gap-1"><MapPin size={14} /> {listing.location}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Price</span>
                            <span className="font-bold text-lg text-brand-black">${listing.price.toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Revenue</span>
                            <span className="font-bold text-lg text-brand-black">${listing.grossRevenue.toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                            <span className="text-xs text-green-700 font-bold uppercase block mb-1">Cash Flow</span>
                            <span className="font-bold text-lg text-green-800">${listing.cashFlow.toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Status</span>
                            <span className={`font-bold text-lg uppercase ${listing.status === 'active' ? 'text-green-600' : 'text-orange-500'}`}>{listing.status}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Quick Actions</h4>
                        <div className="flex gap-3">
                            {listing.status !== 'active' && (
                                <button 
                                    onClick={() => onToggleStatus('active')}
                                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                                >
                                    Approve / Activate
                                </button>
                            )}
                            {listing.status === 'active' && (
                                <button 
                                    onClick={() => onToggleStatus('hidden')}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Hide Listing
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AdminListings: React.FC = () => {
  const { listings, updateListing, deleteListing, addListing } = useMarketplace();
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'sold' | 'hidden'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useLanguage();
  
  // Modal States
  const [viewingListing, setViewingListing] = useState<Business | null>(null); // Uses compact modal
  const [editingListing, setEditingListing] = useState<Business | null>(null);
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);

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

  const filteredListings = listings.filter(l => {
      const matchesFilter = filter === 'all' ? true : (l.status || 'active') === filter;
      const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handleSaveEdit = (data: any) => {
      // Data processing helper
      const processedData = {
            ...data,
            price: parseFloat(data.price),
            grossRevenue: parseFloat(data.grossRevenue),
            cashFlow: parseFloat(data.cashFlow),
            ebitda: parseFloat(data.ebitda || 0),
            ffne: parseFloat(data.ffne || 0),
            inventory: parseFloat(data.inventory || 0),
            rent: parseFloat(data.rent || 0),
            yearsEstablished: parseInt(data.yearsEstablished || 0),
            agent: data.agent || {
                name: 'NiHao Admin',
                image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80',
                phone: '+1 800 123 4567',
                email: 'admin@nihao-laoban.com'
            },
            status: editingListing ? data.status : 'active', 
            isPopular: data.isPopular || false
      };

      if (editingListing) {
          updateListing(editingListing.id, processedData);
          setEditingListing(null);
      } else {
          const newId = Date.now().toString();
          addListing({ 
              ...processedData, 
              id: newId, 
              sellerType: 'Dealer', 
              createdAt: new Date() 
          });
          setIsAddListingOpen(false);
      }
  };

  const toggleHide = (listing: Business) => {
      const newStatus = listing.status === 'hidden' ? 'active' : 'hidden';
      const actionText = newStatus === 'hidden' ? t('admin.hide') : t('admin.unhide');
      
      openConfirm(
          `${actionText} Listing`,
          `Are you sure you want to ${actionText.toLowerCase()} "${listing.title}"?`,
          () => updateListing(listing.id, { status: newStatus as any }),
          false,
          actionText
      );
  };

  const togglePopular = (listing: Business) => {
      updateListing(listing.id, { isPopular: !listing.isPopular });
  };

  const ActionButtons = ({ listing }: { listing: Business }) => (
      <div className="flex items-center gap-2">
        {listing.status === 'pending' && (
            <button 
                onClick={() => updateListing(listing.id, { status: 'active' })}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-green-100 shadow-sm"
                title={t('admin.approve')}
            >
                <CheckCircle size={18} />
            </button>
        )}
        
        <button 
            onClick={() => togglePopular(listing)}
            className={`p-2 rounded-lg border transition-colors shadow-sm ${listing.isPopular ? 'text-yellow-500 bg-yellow-50 border-yellow-100' : 'text-gray-400 hover:bg-gray-100 border-gray-100 bg-white'}`}
            title={listing.isPopular ? "Remove Popular" : "Mark Popular"}
        >
            <Star size={18} fill={listing.isPopular ? "currentColor" : "none"} />
        </button>

        <button onClick={() => setViewingListing(listing)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-100 bg-white shadow-sm" title="Quick View">
            <Eye size={18} />
        </button>
        <button onClick={() => setEditingListing(listing)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-100 bg-white shadow-sm" title={t('admin.edit')}>
            <Edit3 size={18} />
        </button>
        <button 
            onClick={() => openConfirm(
                'Delete Listing',
                `Are you sure you want to permanently delete "${listing.title}"? This cannot be undone.`,
                () => deleteListing(listing.id),
                true,
                'Delete'
            )}
            className="p-2 text-red-400 hover:bg-red-50 rounded-lg border border-red-50 hover:border-red-100 bg-white shadow-sm" 
            title={t('admin.delete')}
        >
            <Trash2 size={18} />
        </button>
    </div>
  );

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('admin.manageListings')}</h1>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                 <div className="relative flex-1 md:w-64 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder={t('admin.search')} 
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-black/10"
                    />
                 </div>
                 <button 
                    onClick={() => setIsAddListingOpen(true)}
                    className="bg-brand-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shrink-0 shadow-lg shadow-black/10"
                 >
                    <Plus size={20} /> Add
                 </button>
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {['all', 'pending', 'active', 'sold', 'hidden'].map((f) => (
                <button
                    key={f}
                    onClick={() => { setFilter(f as any); setCurrentPage(1); }}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-colors whitespace-nowrap border ${filter === f ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                    {t(`listings.${f}`) || f}
                </button>
            ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-[40%]">Property</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">{t('hero.price')}</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell w-[15%]">{t('hero.category')}</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-[10%]">{t('admin.status')}</th>
                            <th className="p-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right w-[20%]">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedListings.length > 0 ? paginatedListings.map((listing) => (
                            <tr key={listing.id} className={`hover:bg-gray-50 transition-colors ${listing.status === 'hidden' ? 'bg-gray-50/50' : ''}`}>
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <img src={listing.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-200 shadow-sm shrink-0" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 text-base truncate max-w-[200px] flex items-center gap-2">
                                                {listing.title}
                                                {listing.isPopular && <Star size={12} className="fill-yellow-400 text-yellow-400 shrink-0" />}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-0.5 truncate">{listing.location}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6 text-base font-bold text-brand-black">${listing.price.toLocaleString()}</td>
                                <td className="p-6 hidden lg:table-cell">
                                    <span className="text-sm font-medium text-gray-600 bg-gray-50/50 px-3 py-1 rounded-lg">
                                        {listing.category}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border ${
                                        listing.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                        listing.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 
                                        listing.status === 'hidden' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}>
                                        {t(`listings.${listing.status}`)}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end">
                                        <ActionButtons listing={listing} />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-400">{t('listings.noResults')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
                    <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Mobile View: Card List */}
        <div className="md:hidden space-y-6">
            {paginatedListings.length > 0 ? paginatedListings.map((listing) => (
                <div key={listing.id} className={`bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4 ${listing.status === 'hidden' ? 'opacity-70' : ''}`}>
                    {/* Content ... (Same as before but simplified for brevity) */}
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100">
                            <img src={listing.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-xs font-bold text-brand-black">
                                {listing.category}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-xl text-gray-900 leading-tight mb-2">{listing.title}</h4>
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-lg font-bold text-brand-black">${listing.price.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-gray-100 w-full" />
                    <div className="flex justify-between items-center overflow-x-auto no-scrollbar pb-1">
                        <ActionButtons listing={listing} />
                    </div>
                </div>
            )) : (
                <div className="p-12 text-center text-gray-400 bg-white rounded-[2rem] border border-gray-200 border-dashed flex flex-col items-center gap-2">
                    <Search size={32} className="opacity-20" />
                    <span>{t('listings.noResults')}</span>
                </div>
            )}
             {/* Pagination for Mobile */}
             {totalPages > 1 && (
                <div className="flex justify-center gap-4 py-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white rounded-full shadow disabled:opacity-50">Prev</button>
                    <span className="py-2 text-sm font-bold text-gray-500">{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white rounded-full shadow disabled:opacity-50">Next</button>
                </div>
            )}
        </div>

        {viewingListing && <AdminQuickViewModal listing={viewingListing} onClose={() => setViewingListing(null)} onToggleStatus={(s) => { updateListing(viewingListing.id, { status: s }); setViewingListing(null); }} />}
        <PostListingModal isOpen={!!editingListing || isAddListingOpen} onClose={() => { setEditingListing(null); setIsAddListingOpen(false); }} initialData={editingListing} onSave={handleSaveEdit} />
        <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} isDangerous={confirmModal.isDangerous} confirmText={confirmModal.confirmText} />
    </div>
  );
};
