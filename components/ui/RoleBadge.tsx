import React from 'react';
import { ShieldCheck, ShoppingBag, Store, User, Settings } from 'lucide-react';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm' }) => {
  const normalizedRole = role.toLowerCase();
  
  const getRoleConfig = () => {
    switch (normalizedRole) {
      case 'admin':
        return {
          icon: ShieldCheck,
          className: 'bg-brand-black text-white border-brand-black',
          label: 'Administrator'
        };
      case 'seller':
        return {
          icon: Store,
          className: 'bg-purple-100 text-purple-700 border-purple-200',
          label: 'Seller'
        };
      case 'buyer':
        return {
          icon: ShoppingBag,
          className: 'bg-blue-100 text-blue-700 border-blue-200',
          label: 'Buyer'
        };
      case 'system':
        return {
          icon: Settings,
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          label: 'System'
        };
      default:
        return {
          icon: User,
          className: 'bg-gray-50 text-gray-500 border-gray-200',
          label: role
        };
    }
  };

  const config = getRoleConfig();
  const Icon = config.icon;
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-[10px] gap-1' 
    : 'px-3 py-1.5 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-bold uppercase tracking-wider ${config.className} ${sizeClasses}`}>
      <Icon size={size === 'sm' ? 12 : 14} />
      {config.label}
    </span>
  );
};