
import React, { useState } from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { Search, ShieldAlert, UserCheck, Trash2, Mail, Phone, Calendar, MessageSquare, Send, X, ChevronLeft, ChevronRight, Edit3, Megaphone } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { RoleBadge } from '../ui/RoleBadge';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { User } from '../../types';
import { ConfirmationModal } from '../ui/ConfirmationModal';

const ITEMS_PER_PAGE = 10;

export const AdminUsers: React.FC = () => {
  const { users, deleteUser, updateUserStatus, updateUser, sendMessage, sendAnnouncement } = useMarketplace();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useLanguage();
  
  // Message Modal State
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  
  // Announcement State
  const [announcementData, setAnnouncementData] = useState({ subject: '', message: '' });
  
  // Edit State
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'buyer', phone: '' });

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

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter ? new Date(u.joinedDate).toISOString().slice(0, 10) === dateFilter : true;
    
    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const activeUserCount = users.filter(u => u.status === 'active').length;

  const handleOpenMessage = (user: User) => {
      setSelectedUser(user);
      setMessageText('');
      setMessageModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
      setSelectedUser(user);
      setEditForm({
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || ''
      });
      setEditModalOpen(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedUser && messageText.trim()) {
          sendMessage(selectedUser.id, messageText);
          setMessageModalOpen(false);
          setMessageText('');
          alert(`Message sent to ${selectedUser.name}`);
      }
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
      e.preventDefault();
      if (announcementData.subject && announcementData.message) {
          sendAnnouncement(announcementData.subject, announcementData.message);
          setAnnouncementModalOpen(false);
          setAnnouncementData({ subject: '', message: '' });
          alert(`Announcement sent to ${activeUserCount} active users.`);
      }
  }

  const handleUpdateUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedUser) {
          updateUser(selectedUser.id, {
              name: editForm.name,
              email: editForm.email,
              role: editForm.role as any,
              phone: editForm.phone
          });
          setEditModalOpen(false);
      }
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void, isDangerous = false, confirmText = "Confirm") => {
      setConfirmModal({ isOpen: true, title, message, onConfirm, isDangerous, confirmText });
  };

  const ActionButtons = ({ user }: { user: User }) => (
      <div className="flex items-center gap-2">
        <button 
            onClick={() => handleOpenMessage(user)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-gray-100"
            title="Message User"
        >
            <MessageSquare size={18} />
        </button>
        <button 
            onClick={() => handleOpenEdit(user)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
            title="Edit Profile"
        >
            <Edit3 size={18} />
        </button>
        {user.status === 'active' ? (
            <button 
                onClick={() => openConfirm(
                    t('admin.ban') + ' ' + user.name,
                    `Are you sure you want to ban ${user.name}? They will lose access to the platform immediately.`,
                    () => updateUserStatus(user.id, 'banned'),
                    true,
                    'Ban User'
                )}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
                title={t('admin.ban')}
            >
                <ShieldAlert size={18} />
            </button>
        ) : (
            <button 
                onClick={() => openConfirm(
                    t('admin.unban') + ' ' + user.name,
                    `Are you sure you want to restore access for ${user.name}?`,
                    () => updateUserStatus(user.id, 'active'),
                    false,
                    'Restore Access'
                )}
                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors border border-gray-100"
                title={t('admin.unban')}
            >
                <UserCheck size={18} />
            </button>
        )}
        <button 
            onClick={() => openConfirm(
                'Delete User',
                `Are you sure you want to permanently delete ${user.name}? This action cannot be undone and all associated data will be removed.`,
                () => deleteUser(user.id),
                true,
                'Delete Permanently'
            )}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
            title={t('admin.delete')}
        >
            <Trash2 size={18} />
        </button>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('admin.userManagement')}</h1>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                 <button 
                    onClick={() => setAnnouncementModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-black/10 w-full sm:w-auto justify-center"
                 >
                    <Megaphone size={16} /> Announcement
                 </button>
                 <div className="w-full sm:w-40">
                    <CustomDatePicker 
                        value={dateFilter} 
                        onChange={(d) => { setDateFilter(d); setCurrentPage(1); }} 
                        placeholder="Joined Date"
                        className="w-full"
                    />
                 </div>
                 <div className="relative flex-1 md:w-64 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder={t('admin.search')} 
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-black/10 bg-white"
                    />
                 </div>
            </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase w-[35%]">User</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase w-[15%]">{t('admin.role')}</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase hidden lg:table-cell w-[15%]">{t('admin.joined')}</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase w-[15%]">{t('admin.status')}</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right w-[20%]">{t('admin.actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-gray-900 truncate">{user.name}</span>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 truncate">
                                        <span className="flex items-center gap-1 truncate"><Mail size={10} /> {user.email}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <RoleBadge role={user.role} />
                            </td>
                            <td className="p-4 text-sm text-gray-600 hidden lg:table-cell">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400" />
                                    {user.joinedDate.toLocaleDateString()}
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5 w-fit border ${
                                    user.status === 'active' 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                    {user.status === 'active' ? <UserCheck size={12} /> : <ShieldAlert size={12} />}
                                    {user.status}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end">
                                    <ActionButtons user={user} />
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {paginatedUsers.map(user => (
             <div key={user.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className="font-bold text-gray-900 block text-lg">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                    <RoleBadge role={user.role} />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{user.status}</span>
                    <ActionButtons user={user} />
                </div>
             </div>
        ))}
        {totalPages > 1 && (
            <div className="flex justify-center gap-4 py-4">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white rounded-full shadow disabled:opacity-50">Prev</button>
                <span className="py-2 text-sm font-bold text-gray-500">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white rounded-full shadow disabled:opacity-50">Next</button>
            </div>
        )}
      </div>

      {/* Message Modal */}
      {messageModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-modal-fade">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-modal-slide">
                <button onClick={() => setMessageModalOpen(false)} className="absolute top-4 right-4 p-1 text-gray-400 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Message User</h3>
                <p className="text-sm text-gray-500 mb-6">Send to {selectedUser.name}</p>
                <form onSubmit={handleSendMessage}>
                    <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type your message..." rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-black/5 resize-none" required />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setMessageModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-brand-black text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800">Send <Send size={16} /></button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Announcement Modal */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 p-4 animate-modal-fade">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-modal-slide">
                <button onClick={() => setAnnouncementModalOpen(false)} className="absolute top-4 right-4 p-1 text-gray-400 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Megaphone size={24} /></div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">System Announcement</h3>
                        <p className="text-xs text-gray-500">Messaging {activeUserCount} active users</p>
                    </div>
                </div>
                
                <form onSubmit={handleSendAnnouncement}>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                        <input 
                            type="text" 
                            value={announcementData.subject} 
                            onChange={(e) => setAnnouncementData({...announcementData, subject: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-black/5" 
                            placeholder="Important Update"
                            required 
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message</label>
                        <textarea 
                            value={announcementData.message} 
                            onChange={(e) => setAnnouncementData({...announcementData, message: e.target.value})}
                            placeholder="Type your announcement..." 
                            rows={5} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-black/5 resize-none" 
                            required 
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setAnnouncementModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-brand-black text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800">Broadcast <Send size={16} /></button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-modal-fade">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-modal-slide">
                  <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 p-1 text-gray-400 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h3>
                  <form onSubmit={handleUpdateUser} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                          <input 
                              type="text" 
                              value={editForm.name} 
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-black/5" 
                              required 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                          <input 
                              type="email" 
                              value={editForm.email} 
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-black/5" 
                              required 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                          <input 
                              type="tel" 
                              value={editForm.phone} 
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-black/5" 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role</label>
                          <select 
                              value={editForm.role} 
                              onChange={(e) => setEditForm({...editForm, role: e.target.value})} 
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-black/5"
                          >
                              <option value="buyer">Buyer</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Administrator</option>
                          </select>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-4">
                          <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancel</button>
                          <button type="submit" className="bg-brand-black text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 shadow-md">Save Changes</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} isDangerous={confirmModal.isDangerous} confirmText={confirmModal.confirmText} />
    </div>
  );
};
