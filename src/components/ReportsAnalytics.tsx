import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ProductCategory, Product } from '../types';
import { 
  FileText, 
  Download, 
  Printer, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Package, 
  Calendar,
  Sparkles,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const { 
    products, 
    orders, 
    stockIns, 
    transactions, 
    representatives, 
    formatCurrency, 
    totalStockUnits, 
    totalCostValuation, 
    totalRetailValuation,
    settings 
  } = useInventory();

  // Active Report View
  type ReportType = 'valuation' | 'velocity' | 'representatives' | 'mastersheet';
  const [activeReport, setActiveReport] = useState<ReportType>('valuation');

  // Group by category for valuation
  const categoryBreakdown = products.reduce((acc, p) => {
    if (!acc[p.category]) {
      acc[p.category] = {
        category: p.category,
        count: 0,
        totalUnits: 0,
        totalCostValue: 0,
        totalBrochureValue: 0
      };
    }
    acc[p.category].count += 1;
    acc[p.category].totalUnits += p.stockQty;
    acc[p.category].totalCostValue += p.stockQty * p.costPrice;
    acc[p.category].totalBrochureValue += p.stockQty * p.brochurePrice;
    return acc;
  }, {} as Record<ProductCategory, { category: ProductCategory; count: number; totalUnits: number; totalCostValue: number; totalBrochureValue: number }>);

  const categoryList = Object.values(categoryBreakdown);

  // Velocity: fast & slow movers
  const sortedBySales = [...products].sort((a, b) => (b.totalSoldUnits || 0) - (a.totalSoldUnits || 0));

  // Export Current Report to CSV
  const handleExportReportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `Avon_Report_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReport === 'valuation') {
      headers = ['Category', 'Product Count', 'Total Units on Hand', 'Cost Valuation', 'Brochure Retail Value', 'Potential Gross Margin'];
      rows = categoryList.map(c => [
        `"${c.category}"`,
        c.count,
        c.totalUnits,
        c.totalCostValue,
        c.totalBrochureValue,
        c.totalBrochureValue - c.totalCostValue
      ]);
    } else if (activeReport === 'velocity') {
      headers = ['Rank', 'SKU', 'Product Name', 'Category', 'Total Units Sold', 'Stock on Hand', 'Velocity Status'];
      rows = sortedBySales.map((p, i) => [
        i + 1,
        `"${p.sku}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.totalSoldUnits || 0,
        p.stockQty,
        (p.totalSoldUnits || 0) > 100 ? '"Fast-Moving"' : (p.totalSoldUnits || 0) > 40 ? '"Moderate"' : '"Slow-Moving"'
      ]);
    } else if (activeReport === 'representatives') {
      headers = ['Representative #', 'Full Name', 'Zone', 'Total Orders Placed', 'Total Dispatched Value'];
      rows = representatives.map(r => [
        `"${r.repNumber}"`,
        `"${r.fullName}"`,
        `"${r.zoneArea}"`,
        r.totalOrdersCount,
        r.totalSpent
      ]);
    } else {
      headers = ['SKU', 'Product Name', 'Category', 'Packaging', 'Stock Qty', 'Cost Price', 'Rep Price', 'Brochure Price', 'Total Cost Value', 'Status'];
      rows = products.map(p => [
        `"${p.sku}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${p.unit}"`,
        p.stockQty,
        p.costPrice,
        p.repPrice,
        p.brochurePrice,
        p.stockQty * p.costPrice,
        `"${p.status}"`
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
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
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 uppercase tracking-wider">
              Specific Objective #5
            </span>
            <span className="text-xs text-slate-500 font-medium">Instant Reporting & Executive Decision Intelligence</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Avon Management & Inventory Reports</h1>
          <p className="text-xs text-slate-600">
            Replaces manual paper compilation. Generates accurate stock valuation, sales movement velocity, and representative performance reports instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          <button
            onClick={handleExportReportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report (CSV)
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-xl overflow-x-auto gap-1 text-xs font-semibold">
        <button
          onClick={() => setActiveReport('valuation')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
            activeReport === 'valuation' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          Inventory Valuation & Category Summary
        </button>
        <button
          onClick={() => setActiveReport('velocity')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
            activeReport === 'velocity' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          Product Sales Velocity (Fast/Slow Movers)
        </button>
        <button
          onClick={() => setActiveReport('representatives')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
            activeReport === 'representatives' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-600" />
          Representative Dispatch Performance
        </button>
        <button
          onClick={() => setActiveReport('mastersheet')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
            activeReport === 'mastersheet' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-rose-600" />
          Complete Stock Master Balance Sheet
        </button>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 print:p-0 print:border-none space-y-6">
        
        {/* Report Official Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-rose-900 font-sans">AVON</span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                  {settings.branchCode}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {activeReport === 'valuation' && 'Official Inventory Valuation & Asset Report'}
                {activeReport === 'velocity' && 'Product Sales Velocity & Movement Analysis Report'}
                {activeReport === 'representatives' && 'Avon Sales Representative Fulfillment Summary'}
                {activeReport === 'mastersheet' && 'Official Periodic Stock Master Balance Sheet'}
              </h2>
              <p className="text-xs text-slate-500">
                {settings.officeName} • {settings.address}
              </p>
            </div>
            
            <div className="text-left sm:text-right text-xs text-slate-500 font-mono">
              <p>Generated: <strong>{new Date().toLocaleString()}</strong></p>
              <p>Brochure Issue: <strong>{settings.currentCampaign}</strong></p>
              <p>Auditor / Officer: <strong>{settings.managerName}</strong></p>
            </div>
          </div>
        </div>

        {/* REPORT A: INVENTORY VALUATION */}
        {activeReport === 'valuation' && (
          <div className="space-y-6">
            
            {/* Top Aggregate Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Total Inventory Capital (Cost)</span>
                <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                  {formatCurrency(totalCostValuation)}
                </p>
                <span className="text-[11px] text-slate-500">{totalStockUnits.toLocaleString()} total units on hand</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Brochure Retail Potential</span>
                <p className="text-2xl font-extrabold text-rose-900 font-mono mt-1">
                  {formatCurrency(totalRetailValuation)}
                </p>
                <span className="text-[11px] text-slate-500">Full catalog face value</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <span className="text-xs font-semibold text-emerald-800 uppercase">Combined Value Margin</span>
                <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
                  {formatCurrency(totalRetailValuation - totalCostValuation)}
                </p>
                <span className="text-[11px] text-emerald-700">Gross direct selling pipeline margin</span>
              </div>
            </div>

            {/* Category Table */}
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-3">
                Stock Valuation by Avon Product Category
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Product Category</th>
                      <th className="py-2.5 px-2 text-center">SKU Count</th>
                      <th className="py-2.5 px-2 text-center">Units on Hand</th>
                      <th className="py-2.5 px-3 text-right">Cost Value</th>
                      <th className="py-2.5 px-3 text-right">Retail Potential</th>
                      <th className="py-2.5 px-3 text-right">Value Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categoryList.map(cat => {
                      const share = totalCostValuation > 0 ? ((cat.totalCostValue / totalCostValuation) * 100).toFixed(1) : '0';
                      return (
                        <tr key={cat.category} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {cat.category}
                          </td>
                          <td className="py-3 px-2 text-center font-mono">{cat.count}</td>
                          <td className="py-3 px-2 text-center font-mono font-bold">{cat.totalUnits}</td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                            {formatCurrency(cat.totalCostValue)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600">
                            {formatCurrency(cat.totalBrochureValue)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-rose-800">
                            {share}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100/80 font-bold border-t border-slate-200">
                    <tr>
                      <td className="py-3 px-3">Total Inventory Summary</td>
                      <td className="py-3 px-2 text-center font-mono">{products.length}</td>
                      <td className="py-3 px-2 text-center font-mono">{totalStockUnits}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-900">{formatCurrency(totalCostValuation)}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-900">{formatCurrency(totalRetailValuation)}</td>
                      <td className="py-3 px-3 text-right font-mono">100.0%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* REPORT B: PRODUCT SALES VELOCITY */}
        {activeReport === 'velocity' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Sales Movement Velocity & Turnover Classification (Objective 4 & 5)
            </h3>
            <p className="text-xs text-slate-600">
              Categorizes products into Fast-Moving, Moderate, and Slow-Moving based on historical representative demand.
            </p>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                    <th className="py-2.5 px-3">Item Name & SKU</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Units Dispatched</th>
                    <th className="py-2.5 px-3 text-center">Stock Remaining</th>
                    <th className="py-2.5 px-3 text-center">Velocity Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedBySales.map((p, index) => {
                    const sold = p.totalSoldUnits || 0;
                    const isFast = sold >= 100;
                    const isModerate = sold >= 50 && sold < 100;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                          #{index + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-900 block">{p.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">SKU: {p.sku}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-extrabold text-slate-900">
                          {sold}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-600">
                          {p.stockQty}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isFast 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : isModerate 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isFast ? '⚡ Fast-Moving' : isModerate ? '🔄 Steady Mover' : '🐢 Slow-Moving'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT C: REPRESENTATIVE DISPATCH PERFORMANCE */}
        {activeReport === 'representatives' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Avon Sales Representative Fulfillment Summary
            </h3>
            <p className="text-xs text-slate-600">
              Overview of representative ordering volume, territory activity, and revenue contributions.
            </p>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Rep ID</th>
                    <th className="py-2.5 px-3">Representative Full Name</th>
                    <th className="py-2.5 px-3">Assigned Zone</th>
                    <th className="py-2.5 px-3 text-center">Orders Placed</th>
                    <th className="py-2.5 px-3 text-right">Total Dispatched Revenue</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {representatives.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-rose-900">{r.repNumber}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{r.fullName}</td>
                      <td className="py-3 px-3 text-slate-600">{r.zoneArea}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{r.totalOrdersCount}</td>
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900">
                        {formatCurrency(r.totalSpent)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT D: COMPLETE STOCK MASTER BALANCE SHEET */}
        {activeReport === 'mastersheet' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Complete Avon Inventory Balance Sheet
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold uppercase">
                  <tr>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-2">Category</th>
                    <th className="py-2 px-2 text-center">Stock</th>
                    <th className="py-2 px-2 text-right">Cost</th>
                    <th className="py-2 px-2 text-right">Rep Price</th>
                    <th className="py-2 px-2 text-right">Brochure</th>
                    <th className="py-2 px-3 text-right">Total Asset</th>
                    <th className="py-2 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono font-bold text-rose-800 text-[11px]">{p.sku}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{p.name}</td>
                      <td className="py-2 px-2 text-slate-600 text-[11px]">{p.category}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">{p.stockQty}</td>
                      <td className="py-2 px-2 text-right font-mono">{formatCurrency(p.costPrice)}</td>
                      <td className="py-2 px-2 text-right font-mono">{formatCurrency(p.repPrice)}</td>
                      <td className="py-2 px-2 text-right font-mono">{formatCurrency(p.brochurePrice)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(p.stockQty * p.costPrice)}
                      </td>
                      <td className="py-2 px-2 text-center text-[10px] font-bold">
                        <span className={p.stockQty === 0 ? 'text-rose-600' : p.stockQty <= p.minThreshold ? 'text-amber-600' : 'text-emerald-600'}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Official Sign-off Footer */}
        <div className="pt-8 border-t border-slate-200 mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-600 text-center">
          <div>
            <div className="border-b border-slate-300 pb-8 mb-1"></div>
            <p className="font-semibold text-slate-800">Prepared by: Staff Officer</p>
            <p className="text-[10px] text-slate-400">Inventory Custodian</p>
          </div>
          <div>
            <div className="border-b border-slate-300 pb-8 mb-1"></div>
            <p className="font-semibold text-slate-800">Certified by: {settings.managerName}</p>
            <p className="text-[10px] text-slate-400">Branch Officer-in-Charge</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="border-b border-slate-300 pb-8 mb-1"></div>
            <p className="font-semibold text-slate-800">Avon Philippines Central Log</p>
            <p className="text-[10px] text-slate-400">Regional Audit Verification</p>
          </div>
        </div>

      </div>

    </div>
  );
};
