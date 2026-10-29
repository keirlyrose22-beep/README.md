import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  Building2, 
  AlertTriangle, 
  BookOpen, 
  Settings as SettingsIcon,
  Sparkles,
  Tag
} from 'lucide-react';

interface HeaderProps {
  onOpenResearch: () => void;
  onOpenSettings: () => void;
  onSelectTab: (tab: string) => void;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenResearch, 
  onOpenSettings, 
  onSelectTab,
  activeTab 
}) => {
  const { settings, lowStockProducts, outOfStockProducts } = useInventory();
  const alertCount = lowStockProducts.length + outOfStockProducts.length;

  return (
    <header className="bg-white border-b border-rose-100/80 sticky top-0 z-40 shadow-2xs">
      {/* Top Banner - Brand & Office Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-700 via-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <span className="font-extrabold text-sm tracking-tighter">AV</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-rose-950 font-sans">AVON</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-500" /> PIMS
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  <Tag className="w-3 h-3 text-rose-600" /> {settings.currentCampaign}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Product & Inventory Management System
              </p>
            </div>
          </div>

          {/* Center Office Branch indicator (Tablet/Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <Building2 className="w-3.5 h-3.5 text-rose-600" />
            <div>
              <span className="font-semibold text-slate-800">{settings.officeName}</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="text-slate-600 font-mono text-[11px]">{settings.branchCode}</span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Low stock pill */}
            {alertCount > 0 && (
              <button
                onClick={() => onSelectTab('alerts')}
                className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-colors animate-pulse"
                title={`${alertCount} products require restocking`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{alertCount} Alerts</span>
              </button>
            )}

            {/* Research Framework Guide Button */}
            <button
              onClick={onOpenResearch}
              className="flex items-center gap-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors"
              title="View Research Study Background, Problem Statements & Objectives"
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Research Framework</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Office Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-t border-slate-100 bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none text-xs sm:text-sm font-medium">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'catalog', label: 'Product Catalog', icon: '💄', badge: 'Obj 1' },
              { id: 'stockin', label: 'Stock In (Receiving)', icon: '📥', badge: 'Obj 3' },
              { id: 'orders', label: 'Representative Orders', icon: '🛍️', badge: 'Obj 3' },
              { id: 'ledger', label: 'Stock Movement Ledger', icon: '📋', badge: 'Obj 2' },
              { id: 'alerts', label: 'Stock Alerts & Restock', icon: '⚠️', badge: alertCount > 0 ? alertCount : 'Obj 4', alert: alertCount > 0 },
              { id: 'reports', label: 'Reports & Analytics', icon: '📈', badge: 'Obj 5' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-rose-600 text-white font-semibold shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span 
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : tab.alert 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
