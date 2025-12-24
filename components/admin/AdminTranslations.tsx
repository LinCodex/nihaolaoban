
import React, { useState, useMemo } from 'react';
import { Search, Save, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const AdminTranslations: React.FC = () => {
    const { getAllTranslations, updateTranslation, resetTranslations, t } = useLanguage();
    const allTranslations = getAllTranslations();
    
    const [search, setSearch] = useState('');
    const [edits, setEdits] = useState<Record<string, { en?: string, zh?: string }>>({});

    // Flatten logic
    const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
        return Object.keys(obj).reduce((acc: Record<string, string>, k) => {
            const pre = prefix.length ? prefix + '.' : '';
            if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
                Object.assign(acc, flattenObject(obj[k], pre + k));
            } else {
                acc[pre + k] = Array.isArray(obj[k]) ? JSON.stringify(obj[k]) : obj[k];
            }
            return acc;
        }, {});
    };

    const flattened = useMemo(() => {
        const enFlat = flattenObject(allTranslations.en);
        const zhFlat = flattenObject(allTranslations.zh);
        
        const keys = Array.from(new Set([...Object.keys(enFlat), ...Object.keys(zhFlat)])).sort();
        
        return keys.map(key => ({
            key,
            en: enFlat[key] || '',
            zh: zhFlat[key] || '',
        }));
    }, [allTranslations]);

    const filtered = useMemo(() => {
        if (!search) return flattened;
        const lowerSearch = search.toLowerCase();
        return flattened.filter(item => 
            item.key.toLowerCase().includes(lowerSearch) ||
            item.en.toLowerCase().includes(lowerSearch) ||
            item.zh.toLowerCase().includes(lowerSearch)
        );
    }, [flattened, search]);

    const handleEdit = (key: string, field: 'en' | 'zh', value: string) => {
        setEdits(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    const handleSave = (key: string) => {
        const edit = edits[key];
        if (!edit) return;

        if (edit.en !== undefined) updateTranslation(key, edit.en, 'en');
        if (edit.zh !== undefined) updateTranslation(key, edit.zh, 'zh');

        // Clear edit state for this key
        setEdits(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleResetAll = () => {
        if (window.confirm("Are you sure you want to reset all translations to default? This cannot be undone.")) {
            resetTranslations();
            setEdits({});
        }
    };

    return (
        <div className="max-w-full pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">{t('admin.translationManager')}</h1>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder={t('admin.search')} 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-black/10 bg-white"
                        />
                    </div>
                    <button 
                        onClick={handleResetAll}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors whitespace-nowrap"
                    >
                        <RotateCcw size={18} /> {t('admin.reset')}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {filtered.length > 0 ? filtered.map((item) => {
                    const pendingEdits = edits[item.key];
                    const hasChanges = pendingEdits && (pendingEdits.en !== undefined || pendingEdits.zh !== undefined);
                    
                    return (
                        <div key={item.key} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{item.key}</span>
                                {hasChanges && (
                                    <button 
                                        onClick={() => handleSave(item.key)}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-brand-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-bold shadow-sm"
                                    >
                                        <Save size={14} /> Save Changes
                                    </button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                        🇺🇸 English
                                    </label>
                                    <textarea 
                                        value={pendingEdits?.en ?? item.en}
                                        onChange={(e) => handleEdit(item.key, 'en', e.target.value)}
                                        className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/10 transition-all resize-y min-h-[80px] ${pendingEdits?.en !== undefined ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                        🇨🇳 Chinese
                                    </label>
                                    <textarea 
                                        value={pendingEdits?.zh ?? item.zh}
                                        onChange={(e) => handleEdit(item.key, 'zh', e.target.value)}
                                        className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/10 transition-all resize-y min-h-[80px] ${pendingEdits?.zh !== undefined ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
                        No translations found matching "{search}".
                    </div>
                )}
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-xl border border-blue-100">
                <AlertTriangle size={16} className="text-blue-500" />
                <span>Changes are saved locally to your browser. Use Reset to revert to code defaults.</span>
            </div>
        </div>
    );
};
