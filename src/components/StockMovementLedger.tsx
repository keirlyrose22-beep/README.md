import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { StockTransaction, TransactionType, Product } from '../types';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ArrowDownLeft, 
  ShoppingBag, 
  SlidersHorizontal, 
  AlertOctagon, 
  CheckCircle2, 
  Layers, 
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const StockMovementLedger: React.FC = () => {
  const { transactions, products, adjustStock, formatCurrency, settings } = useInventory();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Audit Reconciliation Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [physicalCount, setPhysicalCount] = useState<number>(products[0]?.stockQty || 0);
  const [auditReason, setAuditReason] = useState<string>('Physical Cycle Count Reconciliation');
  const [auditNotes, setAuditNotes] = useState<string>('');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // When product changes in audit modal, update physical count default
  const handleProductAuditSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setPhysicalCount(prod.stockQty);
    }
  };

  const handleSaveAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    adjustStock(selectedProductId, physicalCount, auditReason, auditNotes);
    setIsAuditModalOpen(false);
    setAuditNotes('');
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.recipientOrSupplier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'All' || tx.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, selectedType]);

  // Export Ledger to CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Type', 'Reference #', 'SKU', 'Product Name', 'Qty Change', 'Prev Stock', 'New Stock', 'Unit Cost/Price', 'Total Value', 'Entity / Recipient', 'Staff', 'Notes'];
    const rows = transactions.map(tx => [
      `"${tx.timestamp}"`,
      `"${tx.type}"`,
      `"${tx.referenceNo}"`,
      `"${tx.sku}"`,
      `"${tx.productName.replace(/"/g, '""')}"`,
      tx.quantityChange,
      tx.previousStock,
      tx.newStock,
      tx.unitPrice,
      tx.totalValue,
      `"${tx.recipientOrSupplier}"`,
      `"${tx.performedBy}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Avon_Stock_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
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
              Specific Objective #2
            </span>
            <span className="text-xs text-slate-500 font-medium">Automatic Inventory Reconciliation & Audit Trail</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Stock Movement Ledger</h1>
          <p className="text-xs text-slate-600">
            Immutable log of all incoming batches, representative dispatches, and shelf audit adjustments. Eliminates paper discrepancy disputes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
            Physical Count Reconciliation
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Product Name, SKU, Reference #, or Representative..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="All">All Transaction Types ({transactions.length})</option>
              <option value="Stock In">Stock In (Intake)</option>
              <option value="Representative Order">Representative Order (Dispatch)</option>
              <option value="Audit Adjustment">Audit Adjustment</option>
              <option value="Damaged / Write-Off">Damaged / Write-Off</option>
            </select>
          </div>

        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 pt-3 mt-3 border-t border-slate-100">
          <span>Showing <strong>{filteredTransactions.length}</strong> logged transactions</span>
          <span className="text-[11px] text-slate-400">Total lifetime entries: {transactions.length}</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Reference #</th>
                <th className="py-3 px-3">Product & SKU</th>
                <th className="py-3 px-3 text-center">Movement</th>
                <th className="py-3 px-3 text-center">Stock Audit (Before → After)</th>
                <th className="py-3 px-3 text-right">Value</th>
                <th className="py-3 px-4">Entity / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No transactions match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isPositive = tx.quantityChange > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {tx.timestamp}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          tx.type === 'Stock In'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tx.type === 'Representative Order'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {tx.type === 'Stock In' && <ArrowDownLeft className="w-3 h-3 text-emerald-600" />}
                          {tx.type === 'Representative Order' && <ShoppingBag className="w-3 h-3 text-rose-600" />}
                          {tx.type === 'Audit Adjustment' && <SlidersHorizontal className="w-3 h-3 text-amber-600" />}
                          {tx.type === 'Damaged / Write-Off' && <AlertOctagon className="w-3 h-3 text-rose-600" />}
                          {tx.type}
                        </span>
                      </td>

                      {/* Reference # */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {tx.referenceNo}
                      </td>

                      {/* Product Name */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 block max-w-xs truncate">{tx.productName}</span>
                        <span className="font-mono text-[10px] text-rose-800 bg-rose-50 px-1 py-0.2 rounded inline-block mt-0.5">
                          {tx.sku}
                        </span>
                      </td>

                      {/* Movement Qty */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`font-mono font-extrabold text-sm ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isPositive ? `+${tx.quantityChange}` : tx.quantityChange}
                        </span>
                      </td>

                      {/* Before and After */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="font-mono text-xs flex items-center justify-center gap-1.5">
                          <span className="text-slate-400">{tx.previousStock}</span>
                          <span className="text-slate-300">→</span>
                          <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                            {tx.newStock}
                          </span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {formatCurrency(tx.totalValue)}
                      </td>

                      {/* Entity & Remarks */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-900 text-[11px]">{tx.recipientOrSupplier}</div>
                        {tx.notes && (
                          <div className="text-[10px] text-slate-400 line-clamp-1">{tx.notes}</div>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Physical Count Reconciliation Modal (Problem 2 solution) */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Physical Stock Reconciliation</h3>
              </div>
              <button 
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 my-3">
              Performs manual count alignment for physical shelf cycle checks, damaged items, or tester removals, recording an immutable adjustment voucher.
            </p>

            <form onSubmit={handleSaveAudit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product *</label>
                <select
                  value={selectedProductId}
                  onChange={e => handleProductAuditSelect(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium bg-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name} (Current System: {p.stockQty})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Current System Count</span>
                    <p className="text-xl font-extrabold text-slate-800 font-mono mt-0.5">{selectedProduct.stockQty}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Count Variance</span>
                    <p className={`text-xl font-extrabold font-mono mt-0.5 ${
                      physicalCount - selectedProduct.stockQty > 0 
                        ? 'text-emerald-600' 
                        : physicalCount - selectedProduct.stockQty < 0 
                          ? 'text-rose-600' 
                          : 'text-slate-500'
                    }`}>
                      {physicalCount - selectedProduct.stockQty > 0 ? `+${physicalCount - selectedProduct.stockQty}` : physicalCount - selectedProduct.stockQty}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Actual Physical Shelf Count *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={physicalCount}
                  onChange={e => setPhysicalCount(parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Reason *</label>
                <select
                  value={auditReason}
                  onChange={e => setAuditReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="Physical Cycle Count Reconciliation">Periodic Shelf Cycle Count</option>
                  <option value="Damaged Goods / Broken Bottle Write-Off">Damaged Goods / Broken Bottle Write-Off</option>
                  <option value="Avon Representative Sample / Tester Removal">Representative Sample / Tester Removal</option>
                  <option value="Found Unrecorded Box">Found Unrecorded Box / Stock Surplus</option>
                  <option value="Customer Return">Customer Return</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Notes / Explanation</label>
                <textarea
                  rows={2}
                  value={auditNotes}
                  onChange={e => setAuditNotes(e.target.value)}
                  placeholder="e.g. Discrepancy confirmed by Branch Officer during monthly inventory inspection"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Post Stock Adjustment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
