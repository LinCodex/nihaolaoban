
import React, { useState } from 'react';
import { ArrowLeft, Calculator, DollarSign, TrendingUp, Info, RefreshCw } from 'lucide-react';
import { Reveal } from './ui/Reveal';
import { CustomSelect, Option } from './ui/CustomSelect';
import { useLanguage } from '../contexts/LanguageContext';

interface ValuationToolProps {
  onBack: () => void;
}

export const ValuationTool: React.FC<ValuationToolProps> = ({ onBack }) => {
  const [revenue, setRevenue] = useState<string>('');
  const [cashFlow, setCashFlow] = useState<string>('');
  const [industry, setIndustry] = useState<string>('Restaurant');
  const [calculated, setCalculated] = useState<boolean>(false);
  const [range, setRange] = useState<{min: number, max: number} | null>(null);
  const { t } = useLanguage();

  const industryOptions: Option[] = [
    { label: t('options.restaurant'), value: 'Restaurant' },
    { label: t('options.beauty'), value: 'Beauty' },
    { label: t('options.other'), value: 'Other' }
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const cf = parseFloat(cashFlow.replace(/,/g, ''));
    
    if (isNaN(cf)) return;

    // Simplified Multipliers
    let multiplierMin = 2.0;
    let multiplierMax = 3.0;

    switch (industry) {
        case 'Beauty':
            multiplierMin = 2.0;
            multiplierMax = 3.5;
            break;
        case 'Other':
            multiplierMin = 2.5;
            multiplierMax = 4.0;
            break;
        case 'Restaurant':
        default:
            multiplierMin = 1.8;
            multiplierMax = 2.8;
            break;
    }

    setRange({
        min: cf * multiplierMin,
        max: cf * multiplierMax
    });
    setCalculated(true);
  };

  const formatMoney = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="min-h-screen bg-[#EEF1EE] pt-6 pb-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-brand-black font-medium mb-8 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={20} /> {t('listings.back')}
        </button>

        <Reveal width="100%">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-0 opacity-50 translate-x-1/3 -translate-y-1/3"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-brand-black p-3 rounded-2xl text-white">
                            <Calculator size={24} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-black">{t('valuation.title')}</h1>
                    </div>
                    <p className="text-gray-500 mb-8 ml-1">{t('valuation.subtitle')}</p>

                    <form onSubmit={handleCalculate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('valuation.industry')}</label>
                                <CustomSelect 
                                    options={industryOptions} 
                                    value={industry} 
                                    onChange={setIndustry} 
                                    className="bg-gray-50 px-4 py-3 rounded-2xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('valuation.rev')}</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="number" 
                                        value={revenue}
                                        onChange={(e) => setRevenue(e.target.value)}
                                        placeholder="1,000,000"
                                        className="w-full bg-gray-50 rounded-2xl py-3 pl-10 pr-4 font-bold text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-black/5"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                    {t('valuation.cf')}
                                    <div className="group relative">
                                        <Info size={14} className="text-gray-400 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-black text-white text-xs p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                                            Seller's Discretionary Earnings or EBITDA.
                                        </div>
                                    </div>
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="number" 
                                        value={cashFlow}
                                        onChange={(e) => setCashFlow(e.target.value)}
                                        placeholder="250,000"
                                        className="w-full bg-gray-50 rounded-2xl py-3 pl-10 pr-4 font-bold text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-black/5"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-brand-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                        >
                            {t('valuation.calc')} <TrendingUp size={18} />
                        </button>
                    </form>

                    {calculated && range && (
                        <div className="mt-8 pt-8 border-t border-gray-100 animate-fade-up">
                            <h3 className="text-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('valuation.est')}</h3>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                                <div className="text-center">
                                    <p className="text-4xl md:text-5xl font-display font-bold text-brand-black">{formatMoney(range.min)}</p>
                                    <p className="text-sm text-gray-400 font-medium mt-1">{t('valuation.conservative')}</p>
                                </div>
                                <div className="hidden md:block w-12 h-1 bg-gray-100 rounded-full"></div>
                                <div className="text-center">
                                    <p className="text-4xl md:text-5xl font-display font-bold text-brand-black">{formatMoney(range.max)}</p>
                                    <p className="text-sm text-gray-400 font-medium mt-1">{t('valuation.aggressive')}</p>
                                </div>
                            </div>
                            
                            <div className="mt-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                <p className="text-sm text-center text-gray-600">
                                    <span className="font-bold text-brand-black">{t('valuation.note')}:</span> Estimated based on industry multiplier of {industry === 'Other' ? '2.5x-4.0x' : '1.8x-3.5x'}.
                                </p>
                            </div>
                            
                            <div className="mt-6 text-center">
                                <button onClick={() => { setCalculated(false); setRange(null); setRevenue(''); setCashFlow(''); }} className="text-sm font-bold text-gray-400 hover:text-brand-black flex items-center justify-center gap-2 mx-auto">
                                    <RefreshCw size={14} /> {t('valuation.reset')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Reveal>
      </div>
    </div>
  );
};
