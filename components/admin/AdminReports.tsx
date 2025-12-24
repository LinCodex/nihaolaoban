import React, { useState } from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { Check, X, ShieldAlert, Flag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const AdminReports: React.FC = () => {
  const { reports, resolveReport } = useMarketplace();
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');
  const { t } = useLanguage();

  const filteredReports = reports.filter(r => r.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.reportQueue')}</h1>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {['pending', 'resolved', 'dismissed'].map((f) => (
            <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors whitespace-nowrap ${filter === f ? 'bg-brand-black text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
                {f}
            </button>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredReports.length > 0 ? filteredReports.map((report) => (
            <div key={report.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-50 rounded-lg text-red-500 shrink-0">
                        {report.targetType === 'listing' ? <Flag size={16} /> : <ShieldAlert size={16} />}
                    </div>
                    <div>
                        <p className="font-bold text-sm capitalize text-gray-900">{report.targetType} #{report.targetId}</p>
                        <p className="text-xs text-gray-500">{new Date(report.timestamp).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div className="mb-4">
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase mb-2 inline-block">
                        {report.reason}
                    </span>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        "{report.description}"
                    </p>
                    <p className="text-xs text-gray-400 mt-2 text-right">Reported by: <span className="font-bold text-gray-600">{report.reporter}</span></p>
                </div>

                {filter === 'pending' && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button 
                            onClick={() => resolveReport(report.id, 'dismissed')}
                            className="flex-1 py-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-sm"
                        >
                            {t('admin.dismiss')}
                        </button>
                        <button 
                            onClick={() => resolveReport(report.id, 'resolved')}
                            className="flex-1 py-2 text-white bg-brand-black hover:bg-gray-800 rounded-xl font-bold text-sm"
                        >
                            {t('admin.resolve')}
                        </button>
                    </div>
                )}
            </div>
        )) : (
            <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">No reports.</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t('admin.target')}</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t('admin.reason')}</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t('admin.reporter')}</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">{t('admin.timestamp')}</th>
                        {filter === 'pending' && <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">{t('admin.actions')}</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredReports.length > 0 ? filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 rounded-lg text-red-500">
                                        {report.targetType === 'listing' ? <Flag size={16} /> : <ShieldAlert size={16} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm capitalize">{report.targetType} #{report.targetId}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{report.description}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full uppercase">
                                    {report.reason}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-600 font-medium">
                                {report.reporter}
                            </td>
                            <td className="p-4 text-sm text-gray-500">
                                {new Date(report.timestamp).toLocaleDateString()}
                            </td>
                            {filter === 'pending' && (
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => resolveReport(report.id, 'resolved')}
                                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg tooltip"
                                            title={t('admin.resolve')}
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button 
                                            onClick={() => resolveReport(report.id, 'dismissed')}
                                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                                            title={t('admin.dismiss')}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">No reports in this category.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};