import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { StockInRecord, Product } from '../types';
import { 
  ArrowDownLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileCheck, 
  Printer, 
  Building2, 
  Calendar, 
  Search, 
  Layers,
  Sparkles,
  Eye,
  X
} from 'lucide-react';

interface StockInReceivingProps {
  prefillProductId?: string;
  onClearPrefill?: () => void;
}

export const StockInReceiving: React.FC<StockInReceivingProps> = ({ prefillProductId, onClearPrefill }) => {
  const { products, stockIns, recordStockIn, formatCurrency, settings } = useInventory();

  // New Receiving Form State
  const [referenceNo, setReferenceNo] = useState(`DR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [supplier, setSupplier] = useState('Avon Central Distribution Hub');
  const [receivedBy, setReceivedBy] = useState(settings.managerName);
  const [notes, setNotes] = useState('Avon Campaign batch replenishment');

  // Multi-item intake rows
  interface IntakeRow {
    productId: string;
    quantity: number;
    costPrice: number;
    batchNumber: string;
    expiryDate: string;
  }

  const [items, setItems] = useState<IntakeRow[]>([
    {
      productId: products[0]?.id || '',
      quantity: 50,
      costPrice: products[0]?.costPrice || 200,
      batchNumber: `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: '2028-12-31'
    }
  ]);

  // Slip preview modal
  const [selectedReceipt, setSelectedReceipt] = useState<StockInRecord | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // If navigated with prefill product
  useEffect(() => {
    if (prefillProductId) {
      const targetProd = products.find(p => p.id === prefillProductId);
      if (targetProd) {
        setItems([
          {
            productId: targetProd.id,
            quantity: Math.max(targetProd.minThreshold * 2, 20),
            costPrice: targetProd.costPrice,
            batchNumber: `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
            expiryDate: '2028-12-31'
          }
        ]);
        if (onClearPrefill) onClearPrefill();
      }
    }
  }, [prefillProductId, products, onClearPrefill]);

  const handleAddItemRow = () => {
    const defaultProduct = products[0];
    setItems(prev => [
      ...prev,
      {
        productId: defaultProduct ? defaultProduct.id : '',
        quantity: 25,
        costPrice: defaultProduct ? defaultProduct.costPrice : 150,
        batchNumber: `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        expiryDate: '2028-12-31'
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const selected = products.find(p => p.id === prodId);
    if (!selected) return;

    setItems(prev => prev.map((row, i) => {
      if (i === index) {
        return {
          ...row,
          productId: prodId,
          costPrice: selected.costPrice
        };
      }
      return row;
    }));
  };

  const handleRowChange = (index: number, field: keyof IntakeRow, value: any) => {
    setItems(prev => prev.map((row, i) => {
      if (i === index) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  // Totals
  const totalUnits = items.reduce((sum, itm) => sum + (Number(itm.quantity) || 0), 0);
  const totalCost = items.reduce((sum, itm) => sum + ((Number(itm.quantity) || 0) * (Number(itm.costPrice) || 0)), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(i => !i.productId || i.quantity <= 0)) {
      alert('Please select valid products with quantity greater than zero.');
      return;
    }

    recordStockIn({
      referenceNo,
      supplier,
      items,
      notes
    });

    setShowSuccessBanner(true);
    setTimeout(() => setShowSuccessBanner(false), 5000);

    // Reset form for next intake
    setReferenceNo(`DR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setItems([
      {
        productId: products[0]?.id || '',
        quantity: 30,
        costPrice: products[0]?.costPrice || 200,
        batchNumber: `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        expiryDate: '2028-12-31'
      }
    ]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Research Statement */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
              Specific Objectives #2 & #3
            </span>
            <span className="text-xs text-slate-500 font-medium">Automated Stock Intake & Batch Receiving</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Stock In / Incoming Shipments</h1>
          <p className="text-xs text-slate-600">
            Rapidly record incoming stock from Avon warehouses. Automatically updates stock on hand, adjusts inventory valuations, and eliminates manual counting errors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>{stockIns.length} Deliveries Accepted</span>
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div className="text-xs text-emerald-900">
              <strong className="font-bold">Stock Successfully Received & Credited!</strong>
              <p>Inventory quantities have been updated instantly in the database with an immutable audit log entry.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSuccessBanner(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two Column Layout: Intake Form (Left) & Recent Shipments (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Fast Batch Intake Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                New Avon Shipment Intake Voucher
              </h2>
              <span className="text-xs text-slate-400">Date: {new Date().toISOString().split('T')[0]}</span>
            </div>

            {/* Shipment Meta Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Delivery Receipt # (DR / Invoice) *
                </label>
                <input
                  type="text"
                  required
                  value={referenceNo}
                  onChange={e => setReferenceNo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Origin / Avon Supplier *
                </label>
                <input
                  type="text"
                  required
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Received & Inspected By *
                </label>
                <input
                  type="text"
                  required
                  value={receivedBy}
                  onChange={e => setReceivedBy(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Products Table in Shipment */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800">
                  Shipment Items ({items.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Product Line
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Product Name & SKU</th>
                        <th className="py-2.5 px-2 text-center w-24">Qty Received</th>
                        <th className="py-2.5 px-2 w-28">Unit Cost</th>
                        <th className="py-2.5 px-2 w-28">Batch / Lot #</th>
                        <th className="py-2.5 px-2 w-28">Expiry Date</th>
                        <th className="py-2.5 px-2 text-right">Subtotal</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((row, index) => {
                        const currentProd = products.find(p => p.id === row.productId);
                        const rowSubtotal = (row.quantity || 0) * (row.costPrice || 0);

                        return (
                          <tr key={index} className="hover:bg-slate-50/60">
                            
                            {/* Product Select */}
                            <td className="py-2.5 px-3">
                              <select
                                value={row.productId}
                                onChange={e => handleProductSelect(index, e.target.value)}
                                className="w-full text-xs border border-slate-200 rounded-lg p-1.5 font-medium bg-white focus:ring-1 focus:ring-emerald-500"
                              >
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>
                                    [{p.sku}] {p.name} (Current: {p.stockQty})
                                  </option>
                                ))}
                              </select>
                              {currentProd && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Current Stock: <span className="font-semibold text-slate-600">{currentProd.stockQty}</span> • 
                                  Post-intake: <span className="font-bold text-emerald-700">{currentProd.stockQty + (Number(row.quantity) || 0)}</span>
                                </div>
                              )}
                            </td>

                            {/* Quantity */}
                            <td className="py-2.5 px-2 text-center">
                              <input
                                type="number"
                                min="1"
                                required
                                value={row.quantity}
                                onChange={e => handleRowChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-20 text-center font-bold text-xs border border-slate-200 rounded-lg p-1.5 focus:ring-1 focus:ring-emerald-500"
                              />
                            </td>

                            {/* Cost Price */}
                            <td className="py-2.5 px-2">
                              <input
                                type="number"
                                step="0.01"
                                required
                                value={row.costPrice}
                                onChange={e => handleRowChange(index, 'costPrice', parseFloat(e.target.value) || 0)}
                                className="w-24 text-right font-mono text-xs border border-slate-200 rounded-lg p-1.5 focus:ring-1 focus:ring-emerald-500"
                              />
                            </td>

                            {/* Batch No */}
                            <td className="py-2.5 px-2">
                              <input
                                type="text"
                                value={row.batchNumber}
                                onChange={e => handleRowChange(index, 'batchNumber', e.target.value)}
                                className="w-24 font-mono text-[11px] border border-slate-200 rounded-lg p-1.5"
                                placeholder="LOT-XXX"
                              />
                            </td>

                            {/* Expiry Date */}
                            <td className="py-2.5 px-2">
                              <input
                                type="date"
                                value={row.expiryDate}
                                onChange={e => handleRowChange(index, 'expiryDate', e.target.value)}
                                className="w-28 text-[11px] border border-slate-200 rounded-lg p-1.5"
                              />
                            </td>

                            {/* Row Subtotal */}
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-800">
                              {formatCurrency(rowSubtotal)}
                            </td>

                            {/* Delete row */}
                            <td className="py-2.5 px-2 text-center">
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(index)}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">
                Receiving Notes / Delivery Remarks
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Received via Central Logistics Truck #12, cartons sealed and intact"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
              />
            </div>

            {/* Summary Bar & Submit */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-slate-500 block">Total Units to Receive:</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {totalUnits} units
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Intake Cost Value:</span>
                  <span className="text-base font-extrabold text-emerald-700 font-mono">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <ArrowDownLeft className="w-4 h-4" />
                Confirm & Post Stock Intake
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Historical Stock In Deliveries */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Past Received Shipments
            </h3>
            <span className="text-xs text-slate-400">Audit History</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px]">
            {stockIns.map(rec => (
              <div 
                key={rec.id}
                className="border border-slate-100 rounded-xl p-3 hover:bg-slate-50/80 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{rec.referenceNo}</span>
                  <span className="text-[10px] text-slate-500">{rec.receivedDate}</span>
                </div>
                
                <p className="text-[11px] text-slate-600 font-medium">
                  {rec.supplier}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500">
                    {rec.items.length} items • <strong className="text-slate-800">{rec.totalUnits} units</strong>
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatCurrency(rec.totalCost)}
                  </span>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">By: {rec.receivedBy}</span>
                  <button
                    onClick={() => setSelectedReceipt(rec)}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                  >
                    <Eye className="w-3 h-3" /> View Slip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Printable Receipt Slip Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            
            {/* Print Header */}
            <div className="border-b border-slate-200 pb-4 text-center">
              <span className="font-extrabold text-lg tracking-wider text-rose-900 font-sans block">AVON</span>
              <h3 className="font-bold text-slate-900 text-sm">GOODS RECEIVING NOTE (GRN)</h3>
              <p className="text-xs text-slate-500">{settings.officeName}</p>
              <div className="flex justify-between text-xs text-slate-600 mt-3 pt-2 border-t border-dashed border-slate-200 font-mono">
                <span>DR Ref: <strong>{selectedReceipt.referenceNo}</strong></span>
                <span>Date: <strong>{selectedReceipt.receivedDate}</strong></span>
              </div>
            </div>

            {/* Slip Items */}
            <div className="py-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[10px]">
                    <th className="py-1">ITEM</th>
                    <th className="py-1 text-center">QTY</th>
                    <th className="py-1 text-right">COST</th>
                    <th className="py-1 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedReceipt.items.map((itm, i) => (
                    <tr key={i}>
                      <td className="py-2">
                        <span className="font-semibold text-slate-800 block">{itm.productName}</span>
                        <span className="text-[10px] font-mono text-slate-400">SKU: {itm.sku} | Lot: {itm.batchNumber}</span>
                      </td>
                      <td className="py-2 text-center font-bold">{itm.quantity}</td>
                      <td className="py-2 text-right font-mono">{formatCurrency(itm.costPrice)}</td>
                      <td className="py-2 text-right font-mono font-semibold">{formatCurrency(itm.quantity * itm.costPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between font-mono font-bold text-sm text-slate-900">
                <span>Total Received Value:</span>
                <span>{formatCurrency(selectedReceipt.totalCost)}</span>
              </div>
            </div>

            {/* Slip Sign-off */}
            <div className="pt-3 border-t border-dashed border-slate-200 text-xs text-slate-600 space-y-1">
              <p>Supplier: <span className="font-medium text-slate-800">{selectedReceipt.supplier}</span></p>
              <p>Verified & Accepted by: <span className="font-medium text-slate-800">{selectedReceipt.receivedBy}</span></p>
            </div>

            {/* Buttons */}
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Voucher
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
