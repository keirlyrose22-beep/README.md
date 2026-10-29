import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PlusCircle, 
  ShoppingBag, 
  FileText, 
  Sparkles,
  Layers
} from 'lucide-react';
import { ProductCategory } from '../types';

interface DashboardProps {
  onNavigate: (tab: string, state?: any) => void;
  onOpenNewProduct: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenNewProduct }) => {
  const { 
    products, 
    transactions, 
    orders, 
    stockIns,
    lowStockProducts, 
    outOfStockProducts,
    totalStockUnits, 
    totalCostValuation, 
    totalRetailValuation, 
    formatCurrency,
    settings 
  } = useInventory();

  // Category counts
  const categoryStats = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.stockQty;
    return acc;
  }, {} as Record<ProductCategory, number>);

  // Top fast-moving products sorted by totalSoldUnits
  const topSellers = [...products]
    .sort((a, b) => (b.totalSoldUnits || 0) - (a.totalSoldUnits || 0))
    .slice(0, 5);

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);

  // Today's movements
  const totalUnitsReceived = stockIns.reduce((sum, s) => sum + s.totalUnits, 0);
  const totalOrdersCount = orders.length;

  return (
    <div className="space-y-6">
      
      {/* Welcome & Research Alignment Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-rose-500/30 text-rose-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-rose-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-300" /> Avon PIMS Core Operations
              </span>
              <span className="text-xs text-rose-200">
                {settings.branchCode}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Avon Product & Inventory Control Center
            </h1>
            <p className="text-rose-100/90 text-sm mt-1 max-w-2xl">
              Automated tracking for Avon direct selling operations. Real-time stock counts replace manual paper logbooks, eliminating recording discrepancies and expediting representative fulfillment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('stockin')}
              className="bg-white text-rose-900 hover:bg-rose-50 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
            >
              <ArrowDownLeft className="w-4 h-4 text-rose-600" />
              Receive Stock In
            </button>
            <button
              onClick={() => onNavigate('orders')}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 border border-rose-400/30 shadow-md transition-all hover:scale-[1.02]"
            >
              <ShoppingBag className="w-4 h-4" />
              Rep Order Dispatch
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total SKUs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Catalog SKUs
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {products.length} <span className="text-xs font-normal text-slate-500">active items</span>
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center gap-1">
              <span>{totalStockUnits.toLocaleString()} total units on hand</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Inventory Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inventory Valuation (Cost)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalCostValuation)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Brochure retail value: <span className="font-semibold text-slate-700">{formatCurrency(totalRetailValuation)}</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Low & Out of Stock Alerts */}
        <div 
          onClick={() => onNavigate('alerts')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            (lowStockProducts.length > 0 || outOfStockProducts.length > 0)
              ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300 shadow-2xs'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Stock Warnings
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-900">
              {lowStockProducts.length + outOfStockProducts.length} <span className="text-xs font-normal text-amber-800">items</span>
            </div>
            <div className="text-xs text-amber-800 mt-1 font-medium">
              <span>{outOfStockProducts.length} out of stock</span> • <span>{lowStockProducts.length} low stock</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Dispatches & Stock In */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Representative Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {totalOrdersCount} <span className="text-xs font-normal text-slate-500">dispatched</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Received in intake: <span className="font-semibold text-slate-700">{totalUnitsReceived} units</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Layout: Left Two Columns & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Alerts Section: Products Requiring Reordering */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  Reorder Attention Required (Objective 4)
                </h2>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                View Full Alert List →
              </button>
            </div>

            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                🎉 All Avon inventory levels are above minimum reorder thresholds!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase font-semibold">
                      <th className="pb-2">SKU & Item Name</th>
                      <th className="pb-2">Category</th>
                      <th className="pb-2 text-center">Current Stock</th>
                      <th className="pb-2 text-center">Min Level</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...outOfStockProducts, ...lowStockProducts].slice(0, 4).map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5">
                          <span className="font-mono text-slate-500 text-[11px] block">{item.sku}</span>
                          <span className="font-semibold text-slate-800">{item.name}</span>
                        </td>
                        <td className="py-2.5 text-slate-600">{item.category}</td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            item.stockQty === 0 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.stockQty} {item.unit.split(' ')[0]}
                          </span>
                        </td>
                        <td className="py-2.5 text-center text-slate-500">{item.minThreshold}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => onNavigate('stockin', { prefillProduct: item.id })}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md font-semibold text-[11px] transition-colors"
                          >
                            + Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Real-time Stock Movement Stream */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  Recent Stock Movements & Audit Trail (Objective 2)
                </h2>
              </div>
              <button
                onClick={() => onNavigate('ledger')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                View Complete Ledger →
              </button>
            </div>

            <div className="space-y-3">
              {recentTransactions.map(tx => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.type === 'Stock In' 
                        ? 'bg-emerald-50 text-emerald-600'
                        : tx.type === 'Representative Order'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-600'
                    }`}>
                      {tx.type === 'Stock In' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : tx.type === 'Representative Order' ? (
                        <ShoppingBag className="w-4 h-4" />
                      ) : (
                        <Layers className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{tx.productName}</span>
                        <span className="font-mono text-[10px] text-slate-400">({tx.sku})</span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-slate-700">{tx.type}</span>
                        <span>•</span>
                        <span>{tx.recipientOrSupplier}</span>
                        <span>•</span>
                        <span>{tx.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-bold font-mono text-sm block ${
                      tx.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Balance: {tx.newStock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Fast-Movers & Category Overview */}
        <div className="space-y-6">
          
          {/* Quick Operation Triggers */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('stockin')}
                className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left border border-slate-700/80 transition-colors"
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="block font-semibold text-xs text-white">Stock In</span>
                <span className="text-[11px] text-slate-400">Receive Batch</span>
              </button>
              <button
                onClick={() => onNavigate('orders')}
                className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left border border-slate-700/80 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-rose-400 mb-1" />
                <span className="block font-semibold text-xs text-white">Rep Order</span>
                <span className="text-[11px] text-slate-400">Dispatch Stock</span>
              </button>
              <button
                onClick={onOpenNewProduct}
                className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left border border-slate-700/80 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-blue-400 mb-1" />
                <span className="block font-semibold text-xs text-white">New Item</span>
                <span className="text-[11px] text-slate-400">Add to Catalog</span>
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl text-left border border-slate-700/80 transition-colors"
              >
                <FileText className="w-4 h-4 text-purple-400 mb-1" />
                <span className="block font-semibold text-xs text-white">Reports</span>
                <span className="text-[11px] text-slate-400">Valuation & Sales</span>
              </button>
            </div>
          </div>

          {/* Top Selling Avon Items */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Top Avon Sellers (Objective 4)
              </h3>
              <span className="text-[11px] text-slate-400">Units Dispatched</span>
            </div>
            <div className="space-y-3">
              {topSellers.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800 truncate max-w-[150px]">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{item.totalSoldUnits} sold</span>
                    <span className="block text-[10px] text-slate-500">
                      {item.stockQty} in stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock by Category Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              Category Distribution
            </h3>
            <div className="space-y-2.5 text-xs">
              {Object.entries(categoryStats).map(([cat, count]) => {
                const percentage = totalStockUnits > 0 ? Math.round((count / totalStockUnits) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span className="font-medium truncate max-w-[160px]">{cat}</span>
                      <span className="font-mono font-semibold">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
