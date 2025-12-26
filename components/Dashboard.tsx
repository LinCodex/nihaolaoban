
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, PlusCircle, MessageSquare, LayoutGrid, Send, Search, Edit3, Clock, CheckCircle, Settings, User, Mail, Phone, LogOut, Ban, TrendingUp, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMarketplace } from '../contexts/MarketplaceContext';
import { Reveal } from './ui/Reveal';
import { Business, Conversation } from '../types';
import { PostListingModal } from './ui/PostListingModal';

interface DashboardProps {
    onBack: () => void;
    user: { name: string };
    favorites: string[];
    conversations: Conversation[];
    onNavigateToProperty: (id: string) => void;
    onLogout: () => void;
}

interface SavedBusinessCardProps {
    business: Business;
    onClick: (id: string) => void;
    t: any;
}

const SavedBusinessCard: React.FC<SavedBusinessCardProps> = ({ business, onClick, t }) => (
    <div
        onClick={() => onClick(business.id)}
        className="bg-white p-4 rounded-[2rem] hover:shadow-lg transition-all cursor-pointer border border-gray-100 flex gap-4 items-center group"
    >
        <img
            src={business.image}
            alt={business.title}
            className="w-24 h-24 rounded-2xl object-cover shrink-0 bg-gray-100 group-hover:scale-105 transition-transform"
        />
        <div className="flex-1 min-w-0">
            <h4 className="font-display font-bold text-brand-black truncate text-lg group-hover:text-brand-accent transition-colors">{business.title}</h4>
            <p className="text-sm text-gray-500 truncate mb-1">{business.location}</p>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-brand-black bg-gray-100 px-2 py-0.5 rounded-lg">${business.price.toLocaleString()}</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">CF: ${business.cashFlow.toLocaleString()}</span>
            </div>
        </div>
    </div>
);

import { useAuth } from '../contexts/AuthContext';

// ... (imports)

export const Dashboard: React.FC<DashboardProps> = ({ onBack, user: initialUser, favorites, conversations, onNavigateToProperty, onLogout }) => {
    const { user, profile: authProfile } = useAuth();
    const { listings, addListing, updateListing, isPostingEnabled } = useMarketplace();

    const [activeTab, setActiveTab] = useState<'overview' | 'saved' | 'post' | 'messages' | 'settings'>('overview');
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    // Manage user's own listings - simplified for demo
    const [myListings, setMyListings] = useState<Business[]>([]);
    const [editingListing, setEditingListing] = useState<Business | null>(null);

    const [localConversations, setLocalConversations] = useState<Conversation[]>(conversations);

    // Profile State - Sync with AuthContext
    const [profile, setProfile] = useState({
        name: authProfile?.full_name || user?.user_metadata?.full_name || initialUser.name || 'User',
        email: authProfile?.email || user?.email || '',
        phone: authProfile?.phone || '',
        avatar_url: authProfile?.avatar_url || user?.user_metadata?.avatar_url || '',
        role: authProfile?.role || 'buyer'
    });

    useEffect(() => {
        if (authProfile || user) {
            setProfile(prev => ({
                ...prev,
                name: authProfile?.full_name || user?.user_metadata?.full_name || prev.name,
                email: authProfile?.email || user?.email || prev.email,
                phone: authProfile?.phone || prev.phone,
                avatar_url: authProfile?.avatar_url || user?.user_metadata?.avatar_url || prev.avatar_url,
                role: authProfile?.role || prev.role
            }));
        }
    }, [authProfile, user]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const { t, language } = useLanguage();
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    const activeConversation = localConversations.find(c => c.id === selectedConversationId);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeConversation]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversationId) return;

        const newMessage = {
            id: Date.now().toString(),
            sender: 'user' as const,
            text: messageInput,
            timestamp: new Date()
        };

        setLocalConversations(prev => prev.map(c => {
            if (c.id === selectedConversationId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage]
                };
            }
            return c;
        }));

        setMessageInput('');

        // Simulate agent reply
        setTimeout(() => {
            setLocalConversations(prev => prev.map(c => {
                if (c.id === selectedConversationId) {
                    return {
                        ...c,
                        messages: [...c.messages, {
                            id: (Date.now() + 1).toString(),
                            sender: 'agent' as const,
                            text: "Thanks for your message! I'll get back to you with those details shortly.",
                            timestamp: new Date()
                        }]
                    };
                }
                return c;
            }));
        }, 1500);
    };

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
            image: data.image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2670&auto=format&fit=crop&fm=webp',
            views: 0,
            rating: 4.5,
            sellerType: 'Owner' as const,
            agent: {
                name: profile.name,
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80',
                phone: profile.phone,
                email: profile.email
            },
            status: 'pending' as const,
            realEstate: 'Leased' as const
        };

        if (editingListing) {
            updateListing(editingListing.id, processedData);
            setMyListings(prev => prev.map(item => item.id === editingListing.id ? { ...item, ...processedData } : item));
        } else {
            const newId = Date.now().toString();
            const newListing = { ...processedData, id: newId };
            addListing(newListing);
            setMyListings(prev => [newListing, ...prev]);
        }

        setIsPostModalOpen(false);
        setEditingListing(null);
    };

    const handleEditListing = (listing: Business) => {
        setEditingListing(listing);
        setIsPostModalOpen(true);
    };

    const handleCreateNew = () => {
        if (!isPostingEnabled) {
            alert('Posting new listings is currently disabled by the administrator.');
            return;
        }
        setEditingListing(null);
        setIsPostModalOpen(true);
    };

    const handleClosePostModal = () => {
        setIsPostModalOpen(false);
        setEditingListing(null);
    };

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditingProfile(false);
    };

    const getLocalized = (b: Business) => {
        if (language === 'zh' && b.translations?.zh) {
            return { ...b, ...b.translations.zh };
        }
        return b;
    }

    const savedBusinesses = listings
        .filter(p => favorites.includes(p.id))
        .map(getLocalized);

    const localizedMyListings = myListings.map(getLocalized);

    return (
        <div className="min-h-screen bg-[#EEF1EE] pt-6 pb-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-brand-black font-medium mb-8 hover:opacity-70 transition-opacity"
                >
                    <ArrowLeft size={20} /> {t('listings.back')}
                </button>

                <Reveal width="100%">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="md:w-64 shrink-0">
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-6">
                                <div className="w-16 h-16 rounded-full bg-brand-black text-white flex items-center justify-center text-2xl font-bold mb-4 overflow-hidden">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        profile.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <h1 className="text-xl font-display font-bold text-brand-black mb-1 pb-2 break-words leading-relaxed w-full">{profile.name}</h1>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    {profile.role === 'buyer' ? t('dashboard.customer') :
                                        profile.role === 'dealer' ? 'Dealer' :
                                            profile.role === 'admin' ? 'Administrator' :
                                                'Seller'}
                                </p>
                            </div>

                            <nav className="bg-white p-4 rounded-[2rem] shadow-sm flex flex-col gap-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'overview' ? 'bg-brand-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <LayoutGrid size={18} /> {t('dashboard.overview')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('saved')}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'saved' ? 'bg-brand-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Heart size={18} /> {t('dashboard.saved')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('messages')}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'messages' ? 'bg-brand-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <MessageSquare size={18} /> {t('dashboard.messages')}
                                </button>
                                {profile.role !== 'buyer' && (
                                    <button
                                        onClick={() => setActiveTab('post')}
                                        className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'post' ? 'bg-brand-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <PlusCircle size={18} /> {t('dashboard.myListings')}
                                    </button>
                                )}
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-brand-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Settings size={18} /> {t('dashboard.settings')}
                                </button>
                                <button
                                    onClick={() => {
                                        console.log('Dashboard: Logout button clicked');
                                        onLogout();
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors text-red-500 hover:bg-red-50 mt-2"
                                >
                                    <LogOut size={18} /> {t('dashboard.signOut')}
                                </button>
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1">
                            <div className="bg-white min-h-[600px] rounded-[2.5rem] shadow-sm p-6 md:p-8 overflow-hidden flex flex-col">

                                {activeTab === 'overview' && (
                                    <div className="space-y-8 animate-fade-up">
                                        <h2 className="text-2xl font-bold text-brand-black">{t('dashboard.overview')}</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                                                <Heart className="text-red-500 mb-2" size={24} />
                                                <p className="text-2xl font-bold text-brand-black">{savedBusinesses.length}</p>
                                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">{t('dashboard.saved')}</p>
                                            </div>
                                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                                <MessageSquare className="text-blue-500 mb-2" size={24} />
                                                <p className="text-2xl font-bold text-brand-black">{localConversations.length}</p>
                                                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">{t('dashboard.chats')}</p>
                                            </div>
                                            <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                                                <PlusCircle className="text-green-600 mb-2" size={24} />
                                                <p className="text-2xl font-bold text-brand-black">{myListings.length}</p>
                                                <p className="text-xs font-bold text-green-600 uppercase tracking-wider">{t('dashboard.listings')}</p>
                                            </div>
                                            <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100">
                                                <Eye className="text-purple-500 mb-2" size={24} />
                                                <p className="text-2xl font-bold text-brand-black">0</p>
                                                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">{t('dashboard.views')}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-lg text-brand-black">{t('dashboard.recentActivity')}</h3>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400 text-sm italic border border-gray-100">
                                                {t('dashboard.noRecentActivity')}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'saved' && (
                                    savedBusinesses.length > 0 ? (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-fade-up">
                                            {savedBusinesses.map(b => (
                                                <SavedBusinessCard key={b.id} business={b} onClick={onNavigateToProperty} t={t} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center py-12 flex-1">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                                <Heart size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-400">{t('dashboard.noSaved')}</h3>
                                        </div>
                                    )
                                )}

                                {activeTab === 'messages' && (
                                    <div className="flex h-[550px] gap-4">
                                        {/* Conversation List */}
                                        <div className={`w-full md:w-1/3 border-r border-gray-100 pr-4 ${selectedConversationId ? 'hidden md:block' : 'block'}`}>
                                            <h3 className="font-bold text-lg mb-4 px-2">{t('dashboard.conversations')}</h3>
                                            <div className="flex flex-col gap-2 overflow-y-auto h-full pb-4">
                                                {localConversations.length > 0 ? localConversations.map(conv => (
                                                    <button
                                                        key={conv.id}
                                                        onClick={() => setSelectedConversationId(conv.id)}
                                                        className={`text-left p-3 rounded-2xl transition-colors flex gap-3 items-center ${selectedConversationId === conv.id ? 'bg-brand-black text-white' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <img src={conv.agentImage} className="w-10 h-10 rounded-full object-cover bg-gray-200 shrink-0" alt="" />
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-sm truncate">{conv.agentName}</p>
                                                            <p className={`text-xs truncate ${selectedConversationId === conv.id ? 'text-gray-300' : 'text-gray-500'}`}>{conv.businessTitle}</p>
                                                        </div>
                                                    </button>
                                                )) : (
                                                    <p className="text-gray-400 text-sm text-center mt-10">{t('dashboard.noMessages')}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Chat View */}
                                        <div className={`w-full md:w-2/3 flex flex-col ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                                            {activeConversation ? (
                                                <>
                                                    {/* Chat Header */}
                                                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                                                        <button className="md:hidden" onClick={() => setSelectedConversationId(null)}>
                                                            <ArrowLeft size={20} />
                                                        </button>
                                                        <img src={activeConversation.agentImage} className="w-10 h-10 rounded-full object-cover" alt="" />
                                                        <div>
                                                            <h4 className="font-bold text-brand-black">{activeConversation.agentName}</h4>
                                                            <p className="text-xs text-gray-500">{activeConversation.businessTitle}</p>
                                                        </div>
                                                    </div>

                                                    {/* Messages */}
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 p-2">
                                                        {activeConversation.messages.map((msg) => (
                                                            <div key={msg.id} className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-brand-black text-white self-end rounded-tr-sm' : 'bg-gray-100 text-brand-black self-start rounded-tl-sm'}`}>
                                                                {msg.text}
                                                            </div>
                                                        ))}
                                                        <div ref={chatEndRef} />
                                                    </div>

                                                    {/* Input */}
                                                    <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={messageInput}
                                                            onChange={(e) => setMessageInput(e.target.value)}
                                                            placeholder={t('dashboard.typeMessage')}
                                                            className="flex-1 bg-gray-50 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-black"
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="w-10 h-10 bg-brand-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                                                            disabled={!messageInput.trim()}
                                                        >
                                                            <Send size={18} />
                                                        </button>
                                                    </form>
                                                </>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center text-gray-400">
                                                    Select a conversation
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'post' && (
                                    <div className="h-full flex flex-col animate-fade-up">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-brand-black">{t('dashboard.yourListings')}</h3>
                                            <button
                                                onClick={handleCreateNew}
                                                disabled={!isPostingEnabled}
                                                className={`px-6 py-2 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 text-sm ${isPostingEnabled ? 'bg-brand-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                                title={!isPostingEnabled ? "Posting temporarily disabled" : ""}
                                            >
                                                {isPostingEnabled ? <PlusCircle size={16} /> : <Ban size={16} />}
                                                {t('dashboard.createNew')}
                                            </button>
                                        </div>

                                        {!isPostingEnabled && (
                                            <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 px-4 py-3 rounded-xl text-sm font-bold mb-4 flex items-center gap-2">
                                                <Ban size={16} /> New listings are temporarily disabled by the administrator.
                                            </div>
                                        )}

                                        {localizedMyListings.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-4">
                                                {localizedMyListings.map(listing => (
                                                    <div key={listing.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 flex gap-4 items-center group shadow-sm hover:shadow-md transition-all">
                                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-200">
                                                            <img
                                                                src={listing.image}
                                                                alt={listing.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-[2px] ${listing.status === 'active' ? 'bg-black/0' : 'bg-black/20'}`}>
                                                                {listing.status === 'pending' && <Clock size={24} className="text-white drop-shadow-md" />}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-display font-bold text-brand-black truncate text-lg">{listing.title}</h4>
                                                                {listing.status === 'pending' ? (
                                                                    <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Pending</span>
                                                                ) : (
                                                                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1"><CheckCircle size={10} /> Active</span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500 truncate mb-1">{listing.location || 'No location set'}</p>
                                                            <p className="text-sm font-bold text-brand-black">${listing.price?.toLocaleString() || '0'}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleEditListing(listing)}
                                                            className="bg-gray-50 border border-gray-200 p-3 rounded-full hover:bg-brand-black hover:text-white hover:border-brand-black transition-colors shadow-sm"
                                                            title="Edit Listing"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center flex-1 text-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                                    <LayoutGrid size={32} />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-400 mb-2">No listings yet</h3>
                                                <p className="text-gray-400 text-sm max-w-xs mb-6">Create your first listing to reach thousands of potential buyers.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="h-full flex flex-col animate-fade-up">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-brand-black">{t('dashboard.settings')}</h3>
                                        </div>

                                        <div className="flex-1 overflow-y-auto">
                                            <div className="max-w-xl mx-auto space-y-8">
                                                {/* Profile Edit Section */}
                                                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h4 className="font-bold text-lg text-brand-black">{t('dashboard.profileDetails')}</h4>
                                                        <button
                                                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                                                            className="text-sm font-bold text-gray-500 hover:text-brand-black flex items-center gap-1"
                                                        >
                                                            {isEditingProfile ? t('dashboard.cancel') : t('dashboard.edit')}
                                                        </button>
                                                    </div>

                                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-2">Name</label>
                                                            <div className="relative">
                                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                <input
                                                                    type="text"
                                                                    value={profile.name}
                                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                                    disabled={!isEditingProfile}
                                                                    className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-black/5 disabled:bg-gray-100 disabled:text-gray-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-2">Email</label>
                                                            <div className="relative">
                                                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                <input
                                                                    type="email"
                                                                    value={profile.email}
                                                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                                    disabled={!isEditingProfile}
                                                                    className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-black/5 disabled:bg-gray-100 disabled:text-gray-500"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-2">Phone</label>
                                                            <div className="relative">
                                                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                <input
                                                                    type="tel"
                                                                    value={profile.phone}
                                                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                                    disabled={!isEditingProfile}
                                                                    className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-black/5 disabled:bg-gray-100 disabled:text-gray-500"
                                                                />
                                                            </div>
                                                        </div>

                                                        {isEditingProfile && (
                                                            <div className="pt-2">
                                                                <button
                                                                    type="submit"
                                                                    className="w-full bg-brand-black text-white py-3 rounded-2xl font-bold shadow-lg"
                                                                >
                                                                    {t('dashboard.saveChanges')}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </form>
                                                </div>

                                                {/* Logout Section */}
                                                <div className="border-t border-gray-100 pt-8">
                                                    <button
                                                        onClick={onLogout}
                                                        className="w-full bg-red-50 text-red-600 py-4 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                                    >
                                                        <LogOut size={20} /> {t('dashboard.signOut')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>

            <PostListingModal
                isOpen={isPostModalOpen}
                onClose={handleClosePostModal}
                initialData={editingListing as any}
                onSave={handleSaveListing}
            />
        </div>
    );
};
