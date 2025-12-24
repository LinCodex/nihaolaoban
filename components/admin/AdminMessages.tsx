
import React, { useState } from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { Mail, Search, Clock, Reply, CheckCircle2, User, ChevronRight, HelpCircle } from 'lucide-react';
import { AdminMessage } from '../../types';

export const AdminMessages: React.FC = () => {
  const { adminMessages, markMessageRead } = useMarketplace();
  const [filter, setFilter] = useState<'all' | 'unread' | 'support'>('all');
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredMessages = adminMessages.filter(m => {
      let matchesFilter = true;
      if (filter === 'unread') matchesFilter = m.status === 'unread';
      if (filter === 'support') matchesFilter = m.type === 'support';
      
      const matchesSearch = 
        m.sender.toLowerCase().includes(search.toLowerCase()) || 
        m.subject.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleMessageClick = (msg: AdminMessage) => {
      setSelectedMessage(msg);
      if (msg.status === 'unread') {
          markMessageRead(msg.id);
      }
  };

  const handleSendReply = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real app, this would send an email/notification
      alert(`Reply sent to ${selectedMessage?.email}: ${replyText}`);
      setReplyText('');
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
        
        <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
            {/* Message List */}
            <div className={`w-full md:w-1/3 flex flex-col border-r border-gray-100 ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search inbox..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/5"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setFilter('all')}
                            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-brand-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setFilter('unread')}
                            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${filter === 'unread' ? 'bg-brand-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            Unread
                        </button>
                        <button 
                            onClick={() => setFilter('support')}
                            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${filter === 'support' ? 'bg-brand-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            <HelpCircle size={12} /> Support
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {filteredMessages.length > 0 ? (
                        filteredMessages.map(msg => (
                            <div 
                                key={msg.id}
                                onClick={() => handleMessageClick(msg)}
                                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMessage?.id === msg.id ? 'bg-gray-50' : ''} ${msg.status === 'unread' ? 'border-l-4 border-l-brand-accent' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm font-bold truncate ${msg.status === 'unread' ? 'text-brand-black' : 'text-gray-600'}`}>{msg.sender}</span>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs font-bold text-gray-800 truncate mb-1">{msg.subject}</p>
                                <p className="text-xs text-gray-500 line-clamp-2">{msg.content}</p>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">No messages found.</div>
                    )}
                </div>
            </div>

            {/* Message Detail */}
            <div className={`w-full md:w-2/3 flex flex-col ${!selectedMessage ? 'hidden md:flex' : 'flex'}`}>
                {selectedMessage ? (
                    <>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <button onClick={() => setSelectedMessage(null)} className="md:hidden text-gray-500 mb-4 flex items-center gap-1 text-sm"><ChevronRight size={16} className="rotate-180" /> Back</button>
                                <h2 className="text-xl font-bold text-brand-black mb-2">{selectedMessage.subject}</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{selectedMessage.sender} <span className="text-gray-400 font-normal">&lt;{selectedMessage.email}&gt;</span></p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} /> {selectedMessage.timestamp.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${selectedMessage.type === 'system' ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-600'}`}>
                                {selectedMessage.type}
                            </span>
                        </div>
                        
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white">
                            <form onSubmit={handleSendReply}>
                                <div className="mb-2 flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Reply to {selectedMessage.sender}</label>
                                </div>
                                <textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/5 resize-none h-32"
                                    placeholder="Type your reply..."
                                />
                                <div className="flex justify-end mt-4">
                                    <button 
                                        type="submit" 
                                        disabled={!replyText.trim()}
                                        className="bg-brand-black text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        <Reply size={16} /> Send Reply
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Mail size={48} className="mb-4 opacity-20" />
                        <p>Select a message to read</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
