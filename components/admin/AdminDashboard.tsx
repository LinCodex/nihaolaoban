
import React, { useState } from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { DollarSign, FileText, Users, AlertCircle, ScrollText, ArrowRight, Clock, CheckCircle2, MapPin, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { CustomDatePicker } from '../ui/CustomDatePicker';

export const AdminDashboard: React.FC = () => {
  const { listings, brokers, logs, reports, isPostingEnabled, togglePostingEnabled } = useMarketplace();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const activeListings = listings.filter(l => l.status === 'active').length;
  const pendingListings = listings.filter(l => l.status === 'pending' as any).length;
  const totalValue = listings.reduce((acc, curr) => acc + curr.price, 0);
  const pendingReports = reports.filter(r => r.status === 'pending');

  const stats = [
    { label: t('admin.activeListings'), value: activeListings, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('admin.pendingReview'), value: pendingListings, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: t('admin.totalBrokers'), value: brokers.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('admin.totalValue'), value: `$${(totalValue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  // Get real recent data
  const recentListings = [...listings].sort((a, b) => 
    (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)
  ).slice(0, 5);

  const recentLogs = logs.slice(0, 5);

  return (
    <div>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm w-full md:w-auto">
             <CustomDatePicker 
                value={dateRange.start} 
                onChange={(d) => setDateRange({...dateRange, start: d})} 
                placeholder="Start Date"
                className="w-full sm:w-36"
             />
             <span className="text-gray-400 font-bold hidden sm:inline">-</span>
             <CustomDatePicker 
                value={dateRange.end} 
                onChange={(d) => setDateRange({...dateRange, end: d})} 
                placeholder="End Date"
                className="w-full sm:w-36"
             />
          </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                        <stat.icon size={24} />
                    </div>
                </div>
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-display font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
            </div>
        ))}
      </div>

      {/* Actionable Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
           
           {/* Recent Listings (Real Data) */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden h-full">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">Newest Listings</h3>
                    <button onClick={() => navigate('/admin/listings')} className="text-xs font-bold text-brand-black hover:underline">View All</button>
               </div>
               <div className="flex-1 overflow-y-auto max-h-[400px]">
                   {recentListings.length > 0 ? (
                       <div className="divide-y divide-gray-100">
                           {recentListings.map(listing => (
                               <div key={listing.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                   <img src={listing.image} className="w-12 h-12 rounded-lg object-cover bg-gray-200" alt="" />
                                   <div className="flex-1 min-w-0">
                                       <p className="text-sm font-bold text-brand-black truncate">{listing.title}</p>
                                       <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} /> {listing.location}</p>
                                   </div>
                                   <div className="text-right">
                                       <p className="text-sm font-bold text-brand-black">${(listing.price / 1000).toFixed(0)}k</p>
                                       <span className={`text-[10px] uppercase font-bold ${listing.status === 'active' ? 'text-green-600' : 'text-orange-500'}`}>{listing.status}</span>
                                   </div>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="p-8 text-center text-gray-400">No listings found.</div>
                   )}
               </div>
           </div>
           
           {/* Pending Reports (Real Data) */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden h-full">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 text-red-600"><AlertCircle size={20} /> Pending Reports</h3>
                    <button onClick={() => navigate('/admin/reports')} className="text-xs font-bold text-brand-black hover:underline">View All</button>
               </div>
               <div className="flex-1 overflow-y-auto max-h-[400px]">
                   {pendingReports.length > 0 ? (
                       <div className="divide-y divide-gray-100">
                           {pendingReports.slice(0, 5).map(report => (
                               <div key={report.id} className="p-4 hover:bg-red-50/30 transition-colors">
                                   <div className="flex justify-between items-start mb-1">
                                       <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">{report.reason}</span>
                                       <span className="text-[10px] text-gray-400">{new Date(report.timestamp).toLocaleDateString()}</span>
                                   </div>
                                   <p className="text-sm text-gray-800 line-clamp-1 italic">"{report.description}"</p>
                                   <p className="text-xs text-gray-500 mt-1">Reported by: {report.reporter}</p>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                           <CheckCircle2 size={32} className="text-green-500 mb-2 opacity-50" />
                           <p>All clear! No pending reports.</p>
                       </div>
                   )}
               </div>
           </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity Logs */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ScrollText size={20} /> {t('admin.recentLogs')}</h3>
                <button onClick={() => navigate('/admin/logs')} className="text-sm font-bold text-brand-black flex items-center gap-1 hover:underline">
                    {t('admin.viewAll')} <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-4 flex-1">
                  {recentLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors group">
                          <div className={`w-2 h-2 rounded-full shrink-0 group-hover:scale-150 transition-transform ${log.role === 'admin' ? 'bg-black' : 'bg-gray-300'}`}></div>
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-gray-900 truncate">{log.action}</p>
                             <p className="text-xs text-gray-500 truncate">by <span className="font-medium text-gray-700">{log.user}</span> • {log.target}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                  ))}
              </div>
          </div>
          
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('admin.systemHealth')}</h3>
              <div className="space-y-6">
                 {/* Global Posting Toggle Card */}
                 <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2">User Posting</span>
                        <span className="text-xs text-gray-500">Allow users to create new listings</span>
                    </div>
                    <button 
                        onClick={togglePostingEnabled}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isPostingEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                        <span 
                            className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${isPostingEnabled ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                    </button>
                 </div>

                 <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-bold text-gray-600">{t('admin.dbStatus')}</span>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full border border-green-200 shadow-sm flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> {t('admin.healthy')}</span>
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
};
