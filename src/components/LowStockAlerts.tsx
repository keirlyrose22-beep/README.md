import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product } from '../types';
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  ArrowDownLeft, 
  TrendingDown, 
  Package, 
  Printer, 
  Download, 
  Sparkles,
  Info
} from 'lucide-react';

interface LowStockAlertsProps {
  onNavigateToStockIn: (productId: string) => void;
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ onNavigateToStockIn }) => {
  const { products, lowStockProducts, outOfStockProducts, formatCurrency, settings } = useInventory();

  // Combine items requiring restocking
  const reorderList = [...outOfStockProducts, ...lowStockProducts].map(prod => {
    // Suggested reorder target: at least 3x the minimum threshold
    const targetStock = prod.minThreshold * 3;
    const suggestedUnits = Math.max(targetStock - prod.stockQty, prod.minThreshold);
    const estimatedCost = suggestedUnits * prod.costPrice;

    return {
      product: prod,
      suggestedUnits,
      estimatedCost,
      urgency: prod.stockQty === 0 ? 'CRITICAL' : 'HIGH'
    };
  });

  const totalReplenishmentCost = reorderList.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalSuggestedUnits = reorderList.reduce((sum, item) => sum + item.suggestedUnits, 0);

  // Slow moving products (stock > 25 and sold < 60)
  const slowMovers = products
    .filter(p => p.stockQty >= 20 && (p.totalSoldUnits || 0) < 60)
    .sort((a, b) => (a.totalSoldUnits || 0) - (b.totalSoldUnits || 0));

  const handleExportReorderList = () => {
    const headers = ['Urgency', 'SKU', 'Product Name', 'Category', 'Current Stock', 'Min Threshold', 'Suggested Reorder Qty', 'Unit Cost', 'Est. Total Cost'];
    const rows = reorderList.map(item => [
      `"${item.urgency}"`,
      `"${item.product.sku}"`,
      `"${item.product.name.replace(/"/g, '""')}"`,
      `"${item.product.category}"`,
      item.product.stockQty,
      item.product.minThreshold,
      item.suggestedUnits,
      item.product.costPrice,
      item.estimatedCost
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Avon_Restock_Order_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Objective */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
              Specific Objective #4
            </span>
            <span className="text-xs text-slate-500 font-medium">Automated Stock Level Monitoring & Shortage Prevention</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Stock Health & Reorder Alerts</h1>
          <p className="text-xs text-slate-600">
            Intelligent threshold monitoring prevents stockouts and overstocking before representative fulfillment is disrupted.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Reorder Sheet
          </button>
          <button
            onClick={handleExportReorderList}
            className="px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Restock PO
          </button>
        </div>
      </div>

      {/* KPI Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Out of Stock Card */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">
              Out of Stock (Critical)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-rose-900 font-mono">
              {outOfStockProducts.length}
            </span>
            <p className="text-xs text-rose-700 mt-1">
              Immediate sales loss. Requires priority delivery from Central.
            </p>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Low Stock Warnings
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-amber-900 font-mono">
              {lowStockProducts.length}
            </span>
            <p className="text-xs text-amber-700 mt-1">
              Items at or below safe buffer threshold.
            </p>
          </div>
        </div>

        {/* Financial Replenishment Estimate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Estimated Restock Budget
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {formatCurrency(totalReplenishmentCost)}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Required for {totalSuggestedUnits} units across {reorderList.length} SKUs.
            </p>
          </div>
        </div>

      </div>

      {/* Recommended Reorder List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              Recommended Avon Restock Requisition
            </h2>
            <p className="text-xs text-slate-500">
              Automatically calculated based on minimum buffer safety thresholds
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            {reorderList.length} Products Need Replenishment
          </span>
        </div>

        {reorderList.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">Inventory Levels Are Optimal</p>
            <p>No products are currently below their minimum safety thresholds.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-3">Product Name & SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Current Stock</th>
                  <th className="py-3 px-3 text-center">Safety Level</th>
                  <th className="py-3 px-3 text-center">Suggested Reorder</th>
                  <th className="py-3 px-3 text-right">Unit Cost</th>
                  <th className="py-3 px-3 text-right">Estimated Investment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reorderList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                    
                    {/* Urgency */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.urgency === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {item.urgency}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{item.product.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        SKU: {item.product.sku} • {item.product.unit}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-slate-600">
                      {item.product.category}
                    </td>

                    {/* Stock on Hand */}
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded ${
                        item.product.stockQty === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.product.stockQty}
                      </span>
                    </td>

                    {/* Min Safety Level */}
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {item.product.minThreshold}
                    </td>

                    {/* Suggested Units */}
                    <td className="py-3 px-3 text-center font-mono font-extrabold text-emerald-700 bg-emerald-50/50">
                      +{item.suggestedUnits} units
                    </td>

                    {/* Unit Cost */}
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatCurrency(item.product.costPrice)}
                    </td>

                    {/* Estimated Total */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.estimatedCost)}
                    </td>

                    {/* Action: Jump to stock in */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigateToStockIn(item.product.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 shadow-xs ml-auto transition-colors"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        Restock
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Overstocking & Slow Movers Warning Box (Problem 4 Solution) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Slow-Moving Products / Overstock Risk Analysis
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Preventing capital lock-in (Objective 4)
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Identifies catalog items with high stock levels relative to low representative order demand, helping branch managers avoid unnecessary re-ordering.
        </p>

        {slowMovers.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No severe overstock risk detected across active campaigns.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slowMovers.map(item => (
              <div key={item.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-xs space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-800 block truncate max-w-[180px]">{item.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px] pt-1">
                  <span>Stock on Hand: <strong className="text-slate-800">{item.stockQty}</strong></span>
                  <span>Sold: <strong className="text-slate-800">{item.totalSoldUnits || 0}</strong></span>
                </div>
                <p className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-1">
                  💡 Recommendation: Feature in next rep brochure promo before reordering.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
