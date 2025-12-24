
import React, { useState, useEffect, useMemo } from 'react';
import { 
    LayoutDashboard, List, MessageSquare, User, LogOut, 
    Plus, Search, Edit3, Trash2, Eye,
    CheckCircle, ArrowUpRight, ArrowDownRight,
    Mail, Phone, ExternalLink, ShieldCheck,
    Star, Calendar, ChevronRight, MapPin, 
    Briefcase, Globe, Award, Shield
} from 'lucide-react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Business, Broker, DealerLead, LeadStatus } from '../../types';
import { PostListingModal } from '../ui/PostListingModal';
import { useNavigate } from 'react-router-dom';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { CustomSelect } from '../ui/CustomSelect';

interface DealerDashboardProps {
    dealerId: string;
    onLogout: () => void;
}

const PerformanceChart: React.FC<{ data: number[] }> = ({ data }) => {
    const max = Math.max(...data, 1);
    const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - (val / max) * 100}`).join(' ');
    
    return (
        <div className="h-40 w-full relative mt-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={`M 0,100 L ${points} L 100,100 Z`}
                    fill="url(#chartGradient)"
                />
                <polyline
                    fill="none"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
            </svg>
            <div className="absolute inset-0 flex justify-between items-end pointer-events-none px-2 pb-1">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                    <span key={day} className="text-[7px] font-bold text-gray-300 tracking-widest">{day}</span>
                ))}
            </div>
        </div>
    );
};

export const DealerDashboard: React.FC<DealerDashboardProps> = ({ dealerId, onLogout }) => {
    const { t, language } = useLanguage();
    const { listings, brokers, addListing, updateListing, deleteListing } = useMarketplace();
    const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'leads' | 'profile'>('overview');
    const [currentDealer, setCurrentDealer] = useState<Broker | undefined>(undefined);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState<Business | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [leadFilter, setLeadFilter] = useState<LeadStatus | 'all'>('all');
    const [timeRange, setTimeRange] = useState('7d');

    const [leads, setLeads] = useState<DealerLead[]>([]);

    useEffect(() => {
        const dealer = brokers.find(b => b.id === dealerId);
        if (dealer) {
            setCurrentDealer(dealer);
            const dealerListings = listings.filter(l => l.agent.name === dealer.name);
            const mockLeads: DealerLead[] = [
                { 
                    id: 'L1', 
                    customerName: 'Robert Chen', 
                    customerEmail: 'robert@invest.com', 
                    listingId: dealerListings[0]?.id || '1',
                    listingTitle: dealerListings[0]?.title || 'Prime Restaurant',
                    message: 'I am interested in seeing the profit and loss statement for this location.',
                    timestamp: new Date(Date.now() - 3600000 * 2),
                    status: 'new'
                },
                { 
                    id: 'L2', 
                    customerName: 'Susan Wong', 
                    customerEmail: 'susan.w@gmail.com', 
                    listingId: dealerListings[1]?.id || '2',
                    listingTitle: dealerListings[1]?.title || 'Beauty Center',
                    message: 'Is the rent negotiable with the landlord?',
                    timestamp: new Date(Date.now() - 3600000 * 24),
                    status: 'contacted'
                },
                { 
                    id: 'L3', 
                    customerName: 'Marcus Miller', 
                    customerEmail: 'mm@capital.net', 
                    listingId: dealerListings[0]?.id || '1',
                    listingTitle: dealerListings[0]?.title || 'Prime Restaurant',
                    message: 'Will the owner provide training after the sale?',
                    timestamp: new Date(Date.now() - 3600000 * 48),
                    status: 'negotiating'
                }
            ];
            setLeads(mockLeads);
        }
    }, [dealerId, brokers, listings]);

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

    const dealerListings = useMemo(() => {
        if (!currentDealer) return [];
        return listings.filter(l => l.agent.name === currentDealer.name);
    }, [currentDealer, listings]);

    const filteredListings = useMemo(() => {
        return dealerListings.filter(l => 
            l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            l.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [dealerListings, searchQuery]);

    const filteredLeads = useMemo(() => {
        return leads.filter(l => leadFilter === 'all' ? true : l.status === leadFilter);
    }, [leads, leadFilter]);

    if (!currentDealer) return null;

    const activeListingsCount = dealerListings.filter(l => l.status === 'active').length;
    const totalViews = dealerListings.reduce((acc, curr) => acc + curr.views, 0);

    const handleSaveListing = (data: any) => {
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
            agent: { 
                name: currentDealer.name,
                image: currentDealer.image,
                phone: currentDealer.phone,
                email: currentDealer.email
            },
            status: editingListing ? data.status : 'active', 
            sellerType: 'Dealer' as const,
            views: editingListing ? editingListing.views : 0,
            image: data.image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2670&auto=format&fit=crop&fm=webp'
        };

        if (editingListing) {
            updateListing(editingListing.id, processedData);
        } else {
            addListing({ 
                ...processedData, 
                id: Date.now().toString(), 
                createdAt: new Date() 
            });
        }
        setIsPostModalOpen(false);
        setEditingListing(null);
    };

    const updateLeadStatus = (id: string, status: LeadStatus) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    };

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: t('dealer.overview') },
        { id: 'listings', icon: List, label: t('dealer.listings'), badge: dealerListings.length },
        { id: 'leads', icon: MessageSquare, label: t('dealer.leads'), badge: leads.filter(l => l.status === 'new').length },
        { id: 'profile', icon: User, label: t('dealer.profile') },
    ];

    const leadStatusOptions = [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Negotiating', value: 'negotiating' },
        { label: 'Closed/Sold', value: 'sold' },
        { label: 'Archived', value: 'archived' }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans overflow-hidden">
            {/* Sidebar / Desktop Navigation */}
            <aside className="hidden md:flex bg-brand-black text-white w-64 flex-col fixed inset-y-0 z-50">
                <div className="p-8 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center shadow-lg shadow-brand-accent/20">
                        <ShieldCheck size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-lg tracking-tight">NiHao Portal</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Authorized Dealer</p>
                    </div>
                </div>

                <div className="flex-1 px-4 py-8 space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </div>
                            {item.badge && item.badge > 0 && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === item.id ? 'bg-brand-accent text-white' : 'bg-white/10 text-gray-400'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-4 mt-auto">
                    <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            <img src={currentDealer.image} className="w-10 h-10 rounded-lg object-cover ring-2 ring-white/10" alt="" />
                            <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{currentDealer.name}</p>
                                <p className="text-[10px] text-gray-500 truncate">{currentDealer.email}</p>
                            </div>
                        </div>
                        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors">
                            <LogOut size={14} /> {t('dashboard.signOut')}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header & Tab Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-brand-black text-white flex items-center justify-between px-6 z-50 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center">
                        <ShieldCheck size={18} />
                    </div>
                    <span className="font-display font-bold text-lg">NiHao Portal</span>
                </div>
                <button onClick={onLogout} className="text-red-400 p-2"><LogOut size={20}/></button>
            </div>
            
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 px-6 flex items-center justify-between z-50 safe-area-bottom">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex flex-col items-center gap-1 relative ${activeTab === item.id ? 'text-brand-black' : 'text-gray-400'}`}
                    >
                        <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent text-white text-[8px] rounded-full flex items-center justify-center border-2 border-white">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 p-4 md:p-10 pt-20 md:pt-10 pb-24 md:pb-10 h-screen overflow-y-auto no-scrollbar max-w-full">
                
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-up max-w-[1400px] mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div className="max-w-full">
                                <h1 className="text-3xl font-display font-bold text-brand-black mb-2 break-words">
                                    {language === 'zh' ? `欢迎回来, ${currentDealer.name}` : `Welcome Back, ${currentDealer.name}`}
                                </h1>
                                <p className="text-gray-500 font-medium">Here's how your business portfolio is performing this week.</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => { setEditingListing(null); setIsPostModalOpen(true); }} className="bg-brand-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-black/10 hover:scale-105 transition-transform whitespace-nowrap">
                                    <Plus size={18} /> {t('dashboard.createNew')}
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: t('dealer.totalListings'), value: activeListingsCount, icon: List, color: 'blue', trend: '+2.4%' },
                                { label: t('dealer.totalViews'), value: totalViews.toLocaleString(), icon: Eye, color: 'purple', trend: '+18%' },
                                { label: t('dealer.totalLeads'), value: leads.length, icon: MessageSquare, color: 'emerald', trend: '-4%', trendColor: 'red' },
                                { label: t('dealer.performance'), value: '4.9', icon: Star, color: 'amber' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}><stat.icon size={24}/></div>
                                        {stat.trend && (
                                            <span className={`text-[10px] font-bold bg-${stat.trendColor || 'green'}-50 text-${stat.trendColor || 'green'}-600 px-2 py-1 rounded-lg flex items-center gap-1`}>
                                                {stat.trend.startsWith('+') ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>} {stat.trend}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-3xl md:text-4xl font-display font-bold text-brand-black mb-1 truncate">{stat.value}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                    <div className="min-w-0">
                                        <h3 className="font-display font-bold text-xl text-brand-black">Portfolio Exposure</h3>
                                        <p className="text-sm text-gray-400 font-medium truncate">Daily listing views across all platforms</p>
                                    </div>
                                    <div className="w-full sm:w-40">
                                        <CustomSelect 
                                            options={[
                                                { label: 'Last 7 Days', value: '7d' },
                                                { label: 'Last 30 Days', value: '30d' }
                                            ]}
                                            value={timeRange}
                                            onChange={setTimeRange}
                                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2"
                                        />
                                    </div>
                                </div>
                                <PerformanceChart data={[450, 620, 580, 840, 720, 950, 880]} />
                            </div>

                            <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-display font-bold text-xl text-brand-black shrink-0">{t('dealer.recentLeads')}</h3>
                                    <button onClick={() => setActiveTab('leads')} className="text-[10px] font-bold text-gray-400 hover:text-brand-black transition-colors uppercase tracking-widest whitespace-nowrap">View All</button>
                                </div>
                                <div className="flex-1 space-y-4">
                                    {leads.slice(0, 5).map(lead => (
                                        <div key={lead.id} className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-[#F1F5F9] rounded-2xl transition-colors cursor-pointer group min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-black font-bold border border-gray-100 shrink-0">
                                                {lead.customerName.charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="font-bold text-sm text-brand-black truncate">{lead.customerName}</p>
                                                    <span className="text-[9px] text-gray-400 whitespace-nowrap">{Math.floor(Math.random() * 60)}m ago</span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate mb-2">{lead.listingTitle}</p>
                                                <button className="px-3 py-1 bg-white border border-gray-200 text-[9px] font-bold text-gray-600 rounded-lg group-hover:bg-brand-black group-hover:text-white transition-all">Reply</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'listings' && (
                    <div className="space-y-8 animate-fade-up max-w-[1400px] mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="min-w-0 text-center md:text-left">
                                <h1 className="text-2xl font-display font-bold text-brand-black mb-1">{t('dealer.listings')}</h1>
                                <p className="text-sm text-gray-400 font-medium">Manage your {dealerListings.length} commercial business opportunities</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search listings..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-gray-200 focus:outline-none transition-all font-medium text-sm"
                                    />
                                </div>
                                <button 
                                    onClick={() => { setEditingListing(null); setIsPostModalOpen(true); }}
                                    className="w-full sm:w-auto bg-brand-black text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-black/10 whitespace-nowrap"
                                >
                                    <Plus size={20} /> Create New
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredListings.length > 0 ? filteredListings.map(listing => (
                                <div key={listing.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:border-brand-black/20 hover:shadow-xl transition-all duration-300">
                                    <div className="relative h-56 overflow-hidden bg-gray-100">
                                        <img src={listing.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md border border-white/20 shadow-lg ${listing.status === 'active' ? 'bg-green-500/80 text-white' : 'bg-gray-900/80 text-gray-300'}`}>
                                                {listing.status}
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink size={16} />
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col min-w-0">
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest shrink-0">{listing.category}</span>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 shrink-0"><Eye size={12}/> {listing.views.toLocaleString()}</span>
                                        </div>
                                        <h3 className="text-xl font-display font-bold text-brand-black mb-2 truncate">{listing.title}</h3>
                                        <p className="text-sm text-gray-500 mb-6 flex items-center gap-1 font-medium truncate"><MapPin size={14} className="text-gray-300 shrink-0" /> {listing.location}</p>
                                        
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 min-w-0">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 truncate">Asking Price</p>
                                                <p className="font-bold text-brand-black truncate">${listing.price.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 min-w-0">
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1 truncate">Cash Flow</p>
                                                <p className="font-bold text-emerald-700 truncate">${listing.cashFlow.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex gap-2 pt-6 border-t border-gray-50">
                                            <button 
                                                onClick={() => { setEditingListing(listing); setIsPostModalOpen(true); }}
                                                className="flex-1 py-3 px-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-brand-black font-bold text-xs flex items-center justify-center gap-2 transition-all whitespace-nowrap"
                                            >
                                                <Edit3 size={14} /> {t('dashboard.edit')}
                                            </button>
                                            <button 
                                                onClick={() => openConfirm(
                                                    'Delete Listing',
                                                    'Are you sure you want to permanently delete this listing?',
                                                    () => deleteListing(listing.id),
                                                    true,
                                                    'Delete'
                                                )}
                                                className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-gray-200 border-dashed flex flex-col items-center">
                                    <List size={32} className="text-gray-300 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-400 mb-2">{t('dealer.noListings')}</h3>
                                    <button onClick={() => setIsPostModalOpen(true)} className="bg-brand-black text-white px-8 py-3 rounded-2xl font-bold shadow-lg mt-4">Add First Listing</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'leads' && (
                    <div className="space-y-8 animate-fade-up max-w-[1400px] mx-auto pb-12">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="text-center md:text-left">
                                <h1 className="text-2xl font-display font-bold text-brand-black mb-1">{t('dealer.leads')}</h1>
                                <p className="text-sm text-gray-400 font-medium">Manage and convert your potential buyer inquiries</p>
                            </div>
                            
                            <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto p-1">
                                {(['all', 'new', 'contacted', 'negotiating', 'sold'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setLeadFilter(f)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap border ${leadFilter === f ? 'bg-brand-black text-white border-brand-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            {filteredLeads.length > 0 ? (
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full text-left border-collapse min-w-[900px]">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Buyer Info</th>
                                                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Listing Inquiry</th>
                                                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Received</th>
                                                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Status</th>
                                                <th className="p-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredLeads.map(lead => (
                                                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            <div className="w-10 h-10 rounded-full bg-brand-black text-white flex items-center justify-center font-bold text-sm shrink-0">
                                                                {lead.customerName.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-brand-black truncate">{lead.customerName}</p>
                                                                <p className="text-[10px] text-gray-400 truncate tracking-wide">{lead.customerEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="min-w-0 max-w-[280px]">
                                                            <p className="font-bold text-sm text-gray-700 truncate mb-1">{lead.listingTitle}</p>
                                                            <p className="text-xs text-gray-400 italic line-clamp-1">"{lead.message}"</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold whitespace-nowrap bg-gray-50 w-fit px-3 py-1.5 rounded-full">
                                                            <Calendar size={12} className="text-gray-400" />
                                                            {lead.timestamp.toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="w-36">
                                                            <CustomSelect 
                                                                options={leadStatusOptions}
                                                                value={lead.status}
                                                                onChange={(val) => updateLeadStatus(lead.id, val as LeadStatus)}
                                                                className={`text-[9px] font-bold px-3 py-1.5 rounded-full uppercase border focus:outline-none cursor-pointer transition-colors ${
                                                                    lead.status === 'new' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                                    lead.status === 'contacted' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                                                    lead.status === 'negotiating' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                                    lead.status === 'sold' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                                    'bg-gray-100 text-gray-500 border-gray-200'
                                                                }`}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <button className="p-2.5 bg-gray-100 rounded-xl text-gray-400 hover:bg-brand-black hover:text-white transition-all shadow-sm">
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                                    <MessageSquare size={48} className="opacity-10 mb-4" />
                                    <p className="font-bold">{t('dealer.noLeads')}</p>
                                    <p className="text-sm mt-1">Try changing your filters to see more results.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-12 animate-fade-up max-w-[1400px] mx-auto w-full pb-12">
                        {/* Header Profile Section */}
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                            <div className="md:w-1/3 bg-brand-black p-8 md:p-12 relative flex flex-col items-center justify-center text-center overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-accent/20 to-transparent opacity-50"></div>
                                
                                <div className="relative z-10">
                                    <div className="relative group mb-6 inline-block">
                                        <img src={currentDealer.image} className="w-36 h-36 md:w-44 md:h-44 rounded-[2.5rem] object-cover ring-8 ring-white/10 shadow-2xl bg-white/5" alt="" />
                                        <button className="absolute bottom-2 right-2 p-2.5 bg-white text-brand-black rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                            <Edit3 size={18} />
                                        </button>
                                    </div>
                                    <h2 className="text-3xl font-display font-bold text-white mb-2">{currentDealer.name}</h2>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                                        <MapPin size={14} className="text-brand-accent"/> 
                                        <span className="text-sm font-bold text-white/90">{currentDealer.location}</span>
                                    </div>
                                    
                                    <div className="flex justify-center gap-3">
                                        <button className="bg-white text-brand-black p-3 rounded-2xl hover:bg-gray-100 transition-colors shadow-lg"><Mail size={20}/></button>
                                        <button className="bg-white/10 backdrop-blur-md text-white p-3 rounded-2xl border border-white/20 hover:bg-white/20 transition-colors"><Phone size={20}/></button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-8 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-10">
                                    <div className="group">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Award size={12} className="text-brand-accent"/> Professional Biography
                                        </h4>
                                        <div className="relative">
                                            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-brand-accent/10 rounded-full"></div>
                                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light italic break-words">
                                                "{currentDealer.description || 'Highly experienced business broker specializing in restaurant acquisitions and strategic commercial real estate assets.'}"
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Core Specialties</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {currentDealer.specialties.map(s => (
                                                <span key={s} className="px-6 py-2.5 bg-gray-50 text-brand-black text-xs font-bold rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 hover:bg-white hover:border-brand-accent/20 transition-all cursor-default">
                                                    <CheckCircle size={14} className="text-green-500" /> {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] text-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group">
                                            <Briefcase size={28} className="text-gray-300 group-hover:text-brand-black mb-4 mx-auto transition-colors"/>
                                            <p className="text-4xl font-display font-bold text-brand-black mb-1">{currentDealer.experience}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em]">Years Experience</p>
                                        </div>
                                        <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] text-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group">
                                            <Globe size={28} className="text-gray-300 group-hover:text-brand-black mb-4 mx-auto transition-colors"/>
                                            <p className="text-4xl font-display font-bold text-brand-black mb-1">{currentDealer.languages.length}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em]">Fluent Languages</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Contact Information</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all">
                                                <div className="p-3 bg-brand-black text-white rounded-xl"><Mail size={18}/></div>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Primary Email</p>
                                                    <p className="font-bold text-brand-black text-sm truncate">{currentDealer.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all">
                                                <div className="p-3 bg-brand-black text-white rounded-xl"><Phone size={18}/></div>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Mobile Contact</p>
                                                    <p className="font-bold text-brand-black text-sm truncate">{currentDealer.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6">
                                        <button className="w-full py-5 bg-brand-black text-white rounded-2xl font-bold shadow-xl shadow-black/10 hover:bg-gray-800 transition-all text-sm uppercase tracking-widest">
                                            Edit Public Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                             <div className="flex items-center gap-6">
                                 <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shrink-0">
                                     <Shield size={40}/>
                                 </div>
                                 <div>
                                     <h3 className="text-2xl font-display font-bold text-brand-black">Authorized Dealer Status</h3>
                                     <p className="text-gray-500 font-medium">Your account is fully verified and compliant with NiHao Laoban's professional standards.</p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                                 <CheckCircle size={18} className="text-emerald-600"/>
                                 <span className="font-bold text-emerald-700 uppercase text-xs tracking-widest">Active & Verified</span>
                             </div>
                        </div>
                    </div>
                )}

            </main>

            <PostListingModal 
                isOpen={isPostModalOpen}
                onClose={() => { setIsPostModalOpen(false); setEditingListing(null); }}
                initialData={editingListing}
                onSave={handleSaveListing}
            />

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
