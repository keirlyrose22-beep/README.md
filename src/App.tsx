import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProductCatalog } from './components/ProductCatalog';
import { StockInReceiving } from './components/StockInReceiving';
import { RepresentativeOrders } from './components/RepresentativeOrders';
import { StockMovementLedger } from './components/StockMovementLedger';
import { LowStockAlerts } from './components/LowStockAlerts';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { ResearchInfoModal } from './components/ResearchInfoModal';
import { SettingsModal } from './components/SettingsModal';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isResearchOpen, setIsResearchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [prefillStockInProductId, setPrefillStockInProductId] = useState<string | undefined>(undefined);
  const [openAddProductModal, setOpenAddProductModal] = useState<boolean>(false);

  const handleNavigate = (tab: string, state?: any) => {
    setActiveTab(tab);
    if (state?.prefillProduct) {
      setPrefillStockInProductId(state.prefillProduct);
    }
  };

  const handleNavigateToStockIn = (productId: string) => {
    setPrefillStockInProductId(productId);
    setActiveTab('stockin');
  };

  const handleOpenAddProduct = () => {
    setOpenAddProductModal(true);
    setActiveTab('catalog');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans">
      {/* Sticky Header with Avon Branding, Low Stock Counter & Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenResearch={() => setIsResearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            onNavigate={handleNavigate} 
            onOpenNewProduct={handleOpenAddProduct} 
          />
        )}

        {activeTab === 'catalog' && (
          <ProductCatalog 
            initialOpenAddModal={openAddProductModal}
            onClearInitialAddModal={() => setOpenAddProductModal(false)}
            onNavigateToStockIn={handleNavigateToStockIn}
          />
        )}

        {activeTab === 'stockin' && (
          <StockInReceiving 
            prefillProductId={prefillStockInProductId}
            onClearPrefill={() => setPrefillStockInProductId(undefined)}
          />
        )}

        {activeTab === 'orders' && (
          <RepresentativeOrders />
        )}

        {activeTab === 'ledger' && (
          <StockMovementLedger />
        )}

        {activeTab === 'alerts' && (
          <LowStockAlerts onNavigateToStockIn={handleNavigateToStockIn} />
        )}

        {activeTab === 'reports' && (
          <ReportsAnalytics />
        )}
      </main>

      {/* Research Framework & Methodology Modal */}
      <ResearchInfoModal
        isOpen={isResearchOpen}
        onClose={() => setIsResearchOpen(false)}
      />

      {/* Branch & Office Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-rose-900 tracking-wider">AVON</span>
            <span>• Product & Inventory Management System</span>
          </div>
          <p className="text-slate-400">
            Based on the research framework for local Avon direct selling distribution offices
          </p>
          <button
            onClick={() => setIsResearchOpen(true)}
            className="text-rose-700 hover:text-rose-900 font-semibold hover:underline"
          >
            Research Study Objectives & Verification
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <MainAppContent />
    </InventoryProvider>
  );
}
