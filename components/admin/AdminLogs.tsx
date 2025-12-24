
import React, { useState } from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { Search, Filter, Clock, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info, FileText, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { RoleBadge } from '../ui/RoleBadge';
import { CustomDatePicker } from '../ui/CustomDatePicker';

const ITEMS_PER_PAGE = 15;

export const AdminLogs: React.FC = () => {
  const { logs } = useMarketplace();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useLanguage();

  const filteredLogs = logs.filter(log => {
      const matchesSearch = 
        log.user.toLowerCase().includes(search.toLowerCase()) || 
        log.target.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === 'all' ? true : 
                          roleFilter === 'support' ? log.action === 'Support Inquiry' :
                          log.role === roleFilter;
      
      const matchesDate = dateFilter ? new Date(log.timestamp).toISOString().slice(0, 10) === dateFilter : true;

      return matchesSearch && matchesRole && matchesDate;
  });

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const toggleExpand = (id: string) => {
      setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getActionStyle = (action: string) => {
      const lowerAction = action.toLowerCase();
      if (lowerAction.includes('delete') || lowerAction.includes('ban') || lowerAction.includes('remove') || lowerAction.includes('fail')) {
          return { bg: 'bg-red-50', text: 'text-red-700', icon: AlertCircle };
      }
      if (lowerAction.includes('approve') || lowerAction.includes('create') || lowerAction.includes('resolve') || lowerAction.includes('add')) {
          return { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2 };
      }
      if (lowerAction.includes('update') || lowerAction.includes('edit')) {
          return { bg: 'bg-blue-50', text: 'text-blue-700', icon: Info };
      }
      if (lowerAction.includes('support')) {
          return { bg: 'bg-purple-50', text: 'text-purple-700', icon: HelpCircle };
      }
      return { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText };
  };

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('admin.systemLogs')}</h1>
            <div className="flex gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
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

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 text-sm font-bold w-full md:w-auto">
                <Filter size={16} /> {t('admin.filter')}:
            </div>
            
            <select 
                value={roleFilter} 
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/5 capitalize font-medium cursor-pointer w-full md:w-auto"
            >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
                <option value="system">System</option>
                <option value="support">Support Inquiries</option>
            </select>
            
            <div className="w-full md:w-48">
                <CustomDatePicker 
                    value={dateFilter} 
                    onChange={(d) => { setDateFilter(d); setCurrentPage(1); }}
                    placeholder="Filter by Date"
                    className="w-full"
                />
            </div>

            <button 
                onClick={() => { setRoleFilter('all'); setDateFilter(''); setSearch(''); setCurrentPage(1); }}
                className="text-xs font-bold text-gray-500 hover:text-brand-black ml-auto border-b border-gray-300 pb-0.5 hover:border-brand-black transition-colors"
            >
                {t('admin.resetFilters')}
            </button>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase w-[15%]">{t('admin.timestamp')}</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase w-[15%]">User</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase hidden lg:table-cell w-[15%]">{t('admin.role')}</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase w-[20%]">{t('admin.action')}</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase w-[30%]">{t('admin.target')}</th>
                            <th className="p-4 w-[5%]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedLogs.length > 0 ? paginatedLogs.map((log) => {
                            const style = getActionStyle(log.action);
                            const ActionIcon = style.icon;
                            const isExpanded = expandedLogId === log.id;

                            return (
                                <React.Fragment key={log.id}>
                                    <tr 
                                        onClick={() => toggleExpand(log.id)}
                                        className={`cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className="p-4 text-sm text-gray-500 truncate">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-gray-400 shrink-0" />
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-brand-black text-sm truncate">{log.user}</td>
                                        <td className="p-4 hidden lg:table-cell align-middle">
                                            <div className="flex">
                                                <RoleBadge role={log.role} size="sm" />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${style.bg} ${style.text} border border-transparent whitespace-nowrap`}>
                                                <ActionIcon size={12} />
                                                {log.action}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-medium truncate max-w-xs">{log.target}</td>
                                        <td className="p-4 text-gray-400">
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-gray-50 border-t border-gray-100/50">
                                            <td colSpan={6} className="p-0">
                                                <div className="p-6 md:ml-12 border-l-0 md:border-l-2 border-brand-black/10 space-y-3">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Log Details</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500 block mb-1">Event ID</span>
                                                            <span className="font-mono text-gray-800 bg-white px-2 py-1 rounded border border-gray-200 block w-fit">{log.id}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 block mb-1">Full Timestamp</span>
                                                            <span className="font-mono text-gray-800 bg-white px-2 py-1 rounded border border-gray-200 block w-fit">{new Date(log.timestamp).toISOString()}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block mb-1">Details</span>
                                                        <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-700 font-mono text-sm leading-relaxed">
                                                            {log.details || <span className="text-gray-400 italic">No additional details recorded for this event.</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">No logs found matching your criteria.</td>
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
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
            {paginatedLogs.map(log => {
                const style = getActionStyle(log.action);
                const ActionIcon = style.icon;
                const isExpanded = expandedLogId === log.id;
                return (
                    <div key={log.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4" onClick={() => toggleExpand(log.id)}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${style.bg} ${style.text} border border-transparent mb-2`}>
                                        <ActionIcon size={12} />
                                        {log.action}
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm">{log.user}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                    {new Date(log.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 truncate max-w-[200px]">{log.target}</span>
                                <button className="text-gray-400">
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                            </div>
                        </div>
                        {isExpanded && (
                            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                                {/* Expanded content... */}
                                <p className="text-sm text-gray-600 bg-white p-2 rounded-lg border border-gray-200">
                                    {log.details || "No details."}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
            {totalPages > 1 && (
                <div className="flex justify-center gap-4 py-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white rounded-full shadow disabled:opacity-50">Prev</button>
                    <span className="py-2 text-sm font-bold text-gray-500">{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white rounded-full shadow disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    </div>
  );
};
