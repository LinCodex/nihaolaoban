
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, List, Users, LogOut, Glasses, UserCog, ScrollText, Flag, Globe, Menu, X, Languages, ExternalLink, Mail } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMarketplace } from '../../contexts/MarketplaceContext';

interface AdminLayoutProps {
  onLogout?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { adminMessages } = useMarketplace();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadCount = adminMessages.filter(m => m.status === 'unread').length;

  const menuItems = [
    { icon: LayoutDashboard, label: t('admin.dashboard'), path: '/admin' },
    { icon: Mail, label: 'Messages', path: '/admin/messages', badge: unreadCount > 0 ? unreadCount : undefined },
    { icon: List, label: t('admin.listings'), path: '/admin/listings' },
    { icon: Users, label: t('admin.brokers'), path: '/admin/brokers' },
    { icon: UserCog, label: t('admin.users'), path: '/admin/users' },
    { icon: Flag, label: t('admin.reports'), path: '/admin/reports' },
    { icon: Languages, label: t('admin.translations'), path: '/admin/translations' },
    { icon: ScrollText, label: t('admin.logs'), path: '/admin/logs' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans overflow-x-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-brand-black text-white flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <Glasses className="text-brand-accent" size={24} />
          <span className="font-display font-bold text-xl tracking-tight">NiHao Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-brand-black text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 border-b border-gray-800 hidden md:flex items-center gap-2">
          <Glasses className="text-brand-accent" size={24} />
          <span className="font-display font-bold text-xl tracking-tight">NiHao Admin</span>
        </div>

        {/* Mobile Header inside Sidebar (for when open) */}
        <div className="md:hidden p-4 border-b border-gray-800 flex items-center justify-between">
          <span className="font-bold text-lg">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${location.pathname === item.path ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={20} />
              {item.label}
              {item.badge && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Globe size={20} />
            {language === 'en' ? 'Switch to Chinese' : 'Switch to English'}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ExternalLink size={20} />
            View Live Site
          </a>
          <button
            onClick={() => {
              if (onLogout) onLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
