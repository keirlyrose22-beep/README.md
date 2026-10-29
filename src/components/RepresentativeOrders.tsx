import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { RepresentativeOrder, Product, Representative } from '../types';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Printer, 
  User, 
  UserPlus, 
  AlertCircle, 
  FileText, 
  Eye, 
  Sparkles, 
  Tag, 
  Search,
  Check
} from 'lucide-react';

export const RepresentativeOrders: React.FC = () => {
  const { 
    products, 
    representatives, 
    orders, 
    recordRepresentativeOrder, 
    addRepresentative, 
    formatCurrency, 
    settings 
  } = useInventory();

  // Active Tab: 'create' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'history'>('create');

  // Order Creation State
  const [selectedRepId, setSelectedRepId] = useState<string>(representatives[0]?.id || '');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Pending Credit'>('Paid');
  const [orderNotes, setOrderNotes] = useState('Counter pickup - verified');

  // Items in current order
  interface OrderItemDraft {
    productId: string;
    quantity: number;
  }

  const [orderItems, setOrderItems] = useState<OrderItemDraft[]>([
    {
      productId: products.find(p => p.stockQty > 0)?.id || products[0]?.id || '',
      quantity: 5
    }
  ]);

  // Errors / alerts
  const [formError, setFormError] = useState<string | null>(null);
  const [createdOrderSlip, setCreatedOrderSlip] = useState<RepresentativeOrder | null>(null);

  // New Representative Modal
  const [isNewRepModalOpen, setIsNewRepModalOpen] = useState(false);
  const [newRepData, setNewRepData] = useState({
    repNumber: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: '',
    phone: '',
    email: '',
    zoneArea: 'Zone 1 - Main District',
    status: 'Active' as const
  });

  // Add Item Row
  const handleAddItemRow = () => {
    const availableProd = products.find(p => p.stockQty > 0 && !orderItems.some(item => item.productId === p.id));
    setOrderItems(prev => [
      ...prev,
      {
        productId: availableProd ? availableProd.id : (products[0]?.id || ''),
        quantity: 1
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleProductSelect = (index: number, prodId: string) => {
    setOrderItems(prev => prev.map((row, i) => {
      if (i === index) {
        return { ...row, productId: prodId };
      }
      return row;
    }));
  };

  const handleQtyChange = (index: number, qty: number) => {
    setOrderItems(prev => prev.map((row, i) => {
      if (i === index) {
        return { ...row, quantity: qty };
      }
      return row;
    }));
  };

  // Calculations
  const calculatedSummary = orderItems.reduce((acc, row) => {
    const prod = products.find(p => p.id === row.productId);
    if (!prod) return acc;
    const qty = Number(row.quantity) || 0;
    const repSubtotal = prod.repPrice * qty;
    const brochureSubtotal = prod.brochurePrice * qty;
    const costSubtotal = prod.costPrice * qty;

    acc.totalRepAmount += repSubtotal;
    acc.totalBrochureValue += brochureSubtotal;
    acc.totalCost += costSubtotal;
    acc.totalItemsCount += qty;
    return acc;
  }, { totalRepAmount: 0, totalBrochureValue: 0, totalCost: 0, totalItemsCount: 0 });

  const repPotentialProfit = calculatedSummary.totalBrochureValue - calculatedSummary.totalRepAmount;
  const officeEstimatedMargin = calculatedSummary.totalRepAmount - calculatedSummary.totalCost;

  // Submit Order
  const handleProcessOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedRepId) {
      setFormError('Please select an active Avon Sales Representative.');
      return;
    }

    if (orderItems.some(i => !i.productId || i.quantity <= 0)) {
      setFormError('Please specify valid product items with quantities greater than zero.');
      return;
    }

    // Call inventory context action
    const result = recordRepresentativeOrder({
      repId: selectedRepId,
      items: orderItems,
      notes: orderNotes,
      paymentStatus
    });

    if (!result.success) {
      setFormError(result.error || 'Failed to process order.');
      return;
    }

    // Success: open printable slip
    if (result.order) {
      setCreatedOrderSlip(result.order);
    }

    // Reset items draft
    setOrderItems([
      {
        productId: products.find(p => p.stockQty > 0)?.id || products[0]?.id || '',
        quantity: 2
      }
    ]);
  };

  // Save New Representative
  const handleSaveNewRep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepData.fullName) return;

    addRepresentative(newRepData);
    setIsNewRepModalOpen(false);
    setNewRepData({
      repNumber: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: '',
      phone: '',
      email: '',
      zoneArea: 'Zone 1 - Main District',
      status: 'Active'
    });
  };

  const selectedRep = representatives.find(r => r.id === selectedRepId);

  return (
    <div className="space-y-6">
      
      {/* Header & Objective Indicator */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 uppercase tracking-wider">
              Specific Objectives #2 & #3
            </span>
            <span className="text-xs text-slate-500 font-medium">Outgoing Stock & Representative Order Processing</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Avon Representative Orders</h1>
          <p className="text-xs text-slate-600">
            Process representative orders in under 2 minutes. Automatic stock deductions eliminate double-booking and speed up counter fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('create')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'create' ? 'bg-white text-rose-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Order Dispatch
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'history' ? 'bg-white text-rose-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Order History ({orders.length})
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Order Form (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <form onSubmit={handleProcessOrder} className="space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-rose-600" />
                  Representative Order Requisition
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  Order Date: {new Date().toISOString().split('T')[0]}
                </span>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Representative Selection */}
              <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-rose-600" />
                    Select Avon Sales Representative *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewRepModalOpen(true)}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 hover:underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    + Register New Representative
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <select
                      value={selectedRepId}
                      onChange={e => setSelectedRepId(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium focus:ring-2 focus:ring-rose-500"
                    >
                      {representatives.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.fullName} ({r.repNumber}) - {r.zoneArea}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedRep && (
                    <div className="text-[11px] text-slate-600 flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200">
                      <span>Contact: <strong>{selectedRep.phone}</strong></span>
                      <span>Total Rep Orders: <strong>{selectedRep.totalOrdersCount}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-800">
                    Product Order Lines ({orderItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-semibold text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Product Item
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Item Details</th>
                          <th className="py-2.5 px-2 text-center w-24">Available</th>
                          <th className="py-2.5 px-2 text-center w-24">Order Qty</th>
                          <th className="py-2.5 px-2 text-right w-24">Rep Price</th>
                          <th className="py-2.5 px-2 text-right w-24">Subtotal</th>
                          <th className="py-2.5 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orderItems.map((row, index) => {
                          const product = products.find(p => p.id === row.productId);
                          const isOutOfStock = product ? product.stockQty <= 0 : false;
                          const isExceeding = product ? row.quantity > product.stockQty : false;
                          const subtotal = product ? product.repPrice * (row.quantity || 0) : 0;

                          return (
                            <tr key={index} className="hover:bg-slate-50/70">
                              
                              {/* Product selection */}
                              <td className="py-2.5 px-3">
                                <select
                                  value={row.productId}
                                  onChange={e => handleProductSelect(index, e.target.value)}
                                  className="w-full text-xs border border-slate-200 rounded-lg p-1.5 font-medium bg-white focus:ring-1 focus:ring-rose-500"
                                >
                                  {products.map(p => (
                                    <option 
                                      key={p.id} 
                                      value={p.id}
                                      disabled={p.stockQty <= 0}
                                    >
                                      [{p.sku}] {p.name} {p.stockQty <= 0 ? '(OUT OF STOCK)' : `(${p.stockQty} avail)`}
                                    </option>
                                  ))}
                                </select>
                                {product && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Retail Brochure Price: {formatCurrency(product.brochurePrice)} • 
                                    Rep Discount: {formatCurrency(product.brochurePrice - product.repPrice)}/unit
                                  </div>
                                )}
                              </td>

                              {/* Available on hand */}
                              <td className="py-2.5 px-2 text-center font-mono">
                                <span className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] ${
                                  !product || product.stockQty === 0 
                                    ? 'bg-rose-100 text-rose-800' 
                                    : product.stockQty < 10 
                                      ? 'bg-amber-100 text-amber-800' 
                                      : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {product ? product.stockQty : 0}
                                </span>
                              </td>

                              {/* Order Quantity */}
                              <td className="py-2.5 px-2 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  max={product ? product.stockQty : 1}
                                  value={row.quantity}
                                  onChange={e => handleQtyChange(index, parseInt(e.target.value) || 0)}
                                  className={`w-20 text-center font-bold text-xs border rounded-lg p-1.5 ${
                                    isExceeding 
                                      ? 'border-rose-500 bg-rose-50 text-rose-800' 
                                      : 'border-slate-200 focus:ring-1 focus:ring-rose-500'
                                  }`}
                                />
                                {isExceeding && (
                                  <span className="block text-[9px] text-rose-600 font-bold">
                                    Exceeds stock!
                                  </span>
                                )}
                              </td>

                              {/* Unit Price */}
                              <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                                {product ? formatCurrency(product.repPrice) : '-'}
                              </td>

                              {/* Subtotal */}
                              <td className="py-2.5 px-2 text-right font-mono font-bold text-rose-900">
                                {formatCurrency(subtotal)}
                              </td>

                              {/* Remove row */}
                              <td className="py-2.5 px-2 text-center">
                                {orderItems.length > 1 && (
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

              {/* Payment & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Representative Payment Status *
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium"
                  >
                    <option value="Paid">Paid in Full (Cash / Transfer)</option>
                    <option value="Pending Credit">Avon 14-Day Representative Credit</option>
                    <option value="Unpaid">Unpaid / Counter COD</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fulfillment Remarks
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    placeholder="e.g. Counter pickup, packaged in 2 Avon paper bags"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={calculatedSummary.totalItemsCount === 0}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Dispatch Order & Deduct Inventory ({formatCurrency(calculatedSummary.totalRepAmount)})
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Financial Breakdown & Direct Selling Margin Summary */}
          <div className="space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Tag className="w-4 h-4 text-rose-600" />
                Financial Breakdown & Margins
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Total Order Units:</span>
                  <span className="font-mono font-bold text-slate-900">{calculatedSummary.totalItemsCount} units</span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Brochure Retail Value:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(calculatedSummary.totalBrochureValue)}</span>
                </div>

                <div className="flex justify-between items-center text-rose-800 font-bold text-sm pt-2 border-t border-slate-100">
                  <span>Rep Payable Total:</span>
                  <span className="font-mono">{formatCurrency(calculatedSummary.totalRepAmount)}</span>
                </div>

                {/* Direct Selling Rep Profit Card */}
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-800 block">
                    Representative Estimated Earnings:
                  </span>
                  <div className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">
                    {formatCurrency(repPotentialProfit)}
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-0.5">
                    Brochure markup margin earned by the sales representative
                  </p>
                </div>

                {/* Branch Office Margin Card */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-700 block">
                    Branch Office Gross Margin:
                  </span>
                  <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                    {formatCurrency(officeEstimatedMargin)}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Net distribution earnings above Avon Central cost
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Selling Benefits Notice */}
            <div className="bg-gradient-to-br from-rose-950 to-pink-900 text-white rounded-2xl p-5 shadow-xs text-xs space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-rose-200">
                <Sparkles className="w-3.5 h-3.5" /> Direct Stock Deduction
              </span>
              <p className="text-rose-100 leading-relaxed text-[11px]">
                Upon confirming dispatch, stock counts across the central catalog are instantly updated in real-time. 
                Representatives receive their print slip immediately without manual calculation lag.
              </p>
            </div>

          </div>

        </div>
      ) : (
        /* Order History View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              All Completed Representative Orders
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Orders: {orders.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Order # & Date</th>
                  <th className="py-3 px-3">Sales Representative</th>
                  <th className="py-3 px-3 text-center">Items Dispatched</th>
                  <th className="py-3 px-3 text-right">Rep Amount</th>
                  <th className="py-3 px-3 text-right">Brochure Value</th>
                  <th className="py-3 px-3 text-center">Payment</th>
                  <th className="py-3 px-4 text-right">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-rose-900 block">{order.orderNumber}</span>
                      <span className="text-[10px] text-slate-400">{order.date}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block">{order.repName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{order.repNumber}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold text-slate-700">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} units
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({order.items.length} lines)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(order.totalRepAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      {formatCurrency(order.totalBrochureValue)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        order.paymentStatus === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : order.paymentStatus === 'Pending Credit' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setCreatedOrderSlip(order)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md font-semibold text-[11px] flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Avon Representative Order Slip Modal */}
      {createdOrderSlip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            
            {/* Header */}
            <div className="border-b border-slate-200 pb-4 text-center">
              <span className="font-extrabold text-2xl tracking-widest text-rose-900 font-sans block">AVON</span>
              <h3 className="font-bold text-slate-900 text-sm tracking-wide">REPRESENTATIVE DISPATCH INVOICE</h3>
              <p className="text-xs text-slate-500">{settings.officeName}</p>
              
              <div className="grid grid-cols-2 text-left text-xs text-slate-700 mt-4 pt-3 border-t border-dashed border-slate-200">
                <div>
                  <p className="text-[11px] text-slate-500">Order Slip #</p>
                  <p className="font-mono font-bold text-slate-900">{createdOrderSlip.orderNumber}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Order Date</p>
                  <p className="font-medium text-slate-800">{createdOrderSlip.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500">Representative</p>
                  <p className="font-bold text-slate-900">{createdOrderSlip.repName}</p>
                  <p className="font-mono text-slate-600 text-[11px]">{createdOrderSlip.repNumber}</p>
                  <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    {createdOrderSlip.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="py-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                    <th className="py-1">Product Description</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Rep Price</th>
                    <th className="py-1 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {createdOrderSlip.items.map((itm, i) => (
                    <tr key={i}>
                      <td className="py-2">
                        <span className="font-semibold text-slate-900 block">{itm.productName}</span>
                        <span className="text-[10px] font-mono text-slate-400">SKU: {itm.sku}</span>
                      </td>
                      <td className="py-2 text-center font-bold font-mono">{itm.quantity}</td>
                      <td className="py-2 text-right font-mono">{formatCurrency(itm.unitPrice)}</td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900">{formatCurrency(itm.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Catalog Retail Value:</span>
                  <span className="font-mono">{formatCurrency(createdOrderSlip.totalBrochureValue)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Representative Discount / Profit:</span>
                  <span className="font-mono">+{formatCurrency(createdOrderSlip.estimatedRepDiscount)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Net Amount Payable:</span>
                  <span className="font-mono text-rose-900">{formatCurrency(createdOrderSlip.totalRepAmount)}</span>
                </div>
              </div>
            </div>

            {/* Signature sign-offs */}
            <div className="pt-4 border-t border-dashed border-slate-200 text-xs text-slate-500 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="border-b border-slate-300 pb-6 mb-1"></div>
                <span>Dispatched by: {createdOrderSlip.dispatchedBy}</span>
              </div>
              <div>
                <div className="border-b border-slate-300 pb-6 mb-1"></div>
                <span>Received by: {createdOrderSlip.repName}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Representative Order Slip
              </button>
              <button
                onClick={() => setCreatedOrderSlip(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Register New Representative Modal */}
      {isNewRepModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Register Avon Sales Representative</h3>
            <p className="text-xs text-slate-500 mb-4">Add representative to branch records for order fulfillment</p>

            <form onSubmit={handleSaveNewRep} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rep Account # *</label>
                <input
                  type="text"
                  required
                  value={newRepData.repNumber}
                  onChange={e => setNewRepData({ ...newRepData, repNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newRepData.fullName}
                  onChange={e => setNewRepData({ ...newRepData, fullName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="e.g. Maria Teresa Gomez"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile / Phone *</label>
                <input
                  type="text"
                  required
                  value={newRepData.phone}
                  onChange={e => setNewRepData({ ...newRepData, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="+63 9XX XXX XXXX"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newRepData.email}
                  onChange={e => setNewRepData({ ...newRepData, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="rep@avonreps.ph"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Zone / Territory</label>
                <input
                  type="text"
                  value={newRepData.zoneArea}
                  onChange={e => setNewRepData({ ...newRepData, zoneArea: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="e.g. Zone 2 - West District"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRepModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Representative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
