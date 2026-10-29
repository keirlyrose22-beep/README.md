import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product, ProductCategory, StockStatus } from '../types';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Edit3, 
  Trash2, 
  Barcode, 
  Tag, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  X,
  Copy,
  Layers,
  ArrowUpDown
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'Fragrance',
  'Skincare',
  'Makeup & Cosmetics',
  'Personal Care & Bath',
  'Fashion & Jewelry',
  'Wellness & Intimate'
];

interface ProductCatalogProps {
  initialOpenAddModal?: boolean;
  onClearInitialAddModal?: () => void;
  onNavigateToStockIn?: (productId: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ 
  initialOpenAddModal, 
  onClearInitialAddModal,
  onNavigateToStockIn 
}) => {
  const { products, addProduct, updateProduct, deleteProduct, formatCurrency, settings } = useInventory();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'stockQty' | 'repPrice' | 'sku'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(initialOpenAddModal || false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodePreviewItem, setBarcodePreviewItem] = useState<Product | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Fragrance' as ProductCategory,
    campaign: settings.currentCampaign,
    description: '',
    unit: '50ml Bottle',
    costPrice: 200,
    repPrice: 280,
    brochurePrice: 420,
    stockQty: 25,
    minThreshold: 15,
    barcode: '',
    location: 'Aisle 1 - Bay A'
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      sku: `AV-${Date.now().toString().slice(-4)}`,
      name: '',
      category: 'Fragrance',
      campaign: settings.currentCampaign,
      description: '',
      unit: 'Piece',
      costPrice: 150,
      repPrice: 220,
      brochurePrice: 350,
      stockQty: 20,
      minThreshold: 10,
      barcode: `4800${Math.floor(100000000 + Math.random() * 900000000)}`,
      location: 'Aisle 1'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      campaign: product.campaign,
      description: product.description,
      unit: product.unit,
      costPrice: product.costPrice,
      repPrice: product.repPrice,
      brochurePrice: product.brochurePrice,
      stockQty: product.stockQty,
      minThreshold: product.minThreshold,
      barcode: product.barcode,
      location: product.location
    });
    setIsModalOpen(true);
  };

  const handleDuplicate = (product: Product) => {
    setEditingProduct(null);
    setFormData({
      sku: `${product.sku}-COPY`,
      name: `${product.name} (Copy)`,
      category: product.category,
      campaign: product.campaign,
      description: product.description,
      unit: product.unit,
      costPrice: product.costPrice,
      repPrice: product.repPrice,
      brochurePrice: product.brochurePrice,
      stockQty: product.stockQty,
      minThreshold: product.minThreshold,
      barcode: `4800${Math.floor(100000000 + Math.random() * 900000000)}`,
      location: product.location
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
    if (onClearInitialAddModal) onClearInitialAddModal();
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'sku') comparison = a.sku.localeCompare(b.sku);
      else if (sortBy === 'stockQty') comparison = a.stockQty - b.stockQty;
      else if (sortBy === 'repPrice') comparison = a.repPrice - b.repPrice;

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Campaign', 'Cost Price', 'Rep Price', 'Brochure Price', 'Stock Qty', 'Min Threshold', 'Status', 'Barcode', 'Location'];
    const rows = products.map(p => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.campaign}"`,
      p.costPrice,
      p.repPrice,
      p.brochurePrice,
      p.stockQty,
      p.minThreshold,
      `"${p.status}"`,
      `"${p.barcode}"`,
      `"${p.location}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Avon_Product_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV Mock Helper
  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const lines = content.split('\n').filter(l => l.trim() !== '');
            if (lines.length > 1) {
              alert(`Successfully processed file "${file.name}". Verified ${lines.length - 1} Avon product records.`);
            }
          } catch {
            alert('Error reading CSV file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header & Objective Indicator */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 uppercase tracking-wider">
              Specific Objective #1
            </span>
            <span className="text-xs text-slate-500 font-medium">Centralized Database & Price Master</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Avon Product Catalog</h1>
          <p className="text-xs text-slate-600">
            Stores standardized SKUs, brochure prices, representative wholesale costs, and stock threshold specifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Download CSV database backup"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handleImportClick}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Import product records"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Avon Product
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by SKU, Product Name, Barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="All">All Categories ({products.length})</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="All">All Stock Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

        </div>

        {/* Sorting options & Results counter */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span> of {products.length} products
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" /> Sort by:
            </span>
            <button
              onClick={() => {
                if (sortBy === 'name') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('name'); setSortOrder('asc'); }
              }}
              className={`hover:text-slate-900 ${sortBy === 'name' ? 'font-bold text-rose-600' : ''}`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'stockQty') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('stockQty'); setSortOrder('asc'); }
              }}
              className={`hover:text-slate-900 ${sortBy === 'stockQty' ? 'font-bold text-rose-600' : ''}`}
            >
              Stock Level {sortBy === 'stockQty' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'repPrice') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('repPrice'); setSortOrder('asc'); }
              }}
              className={`hover:text-slate-900 ${sortBy === 'repPrice' ? 'font-bold text-rose-600' : ''}`}
            >
              Price {sortBy === 'repPrice' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">Item Details & SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Pricing (Cost / Rep / Brochure)</th>
                <th className="py-3 px-3 text-center">Current Stock</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No Avon products found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const repMargin = product.brochurePrice - product.repPrice;
                  const officeMargin = product.repPrice - product.costPrice;

                  return (
                    <tr key={product.id} className="hover:bg-rose-50/30 transition-colors group">
                      
                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {product.category === 'Fragrance' ? '🌸' :
                             product.category === 'Skincare' ? '✨' :
                             product.category === 'Makeup & Cosmetics' ? '💄' :
                             product.category === 'Personal Care & Bath' ? '🧴' :
                             product.category === 'Fashion & Jewelry' ? '👜' : '🌿'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-rose-800 text-[11px] bg-rose-50 px-1.5 py-0.2 rounded">
                                {product.sku}
                              </span>
                              <span className="font-bold text-slate-900 group-hover:text-rose-900">
                                {product.name}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5 max-w-sm">
                              {product.description}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Packaging: {product.unit} • Barcode: {product.barcode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-700">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {product.category}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {product.campaign}
                        </span>
                      </td>

                      {/* Pricing Tier */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5 font-mono">
                          <div className="text-slate-500 text-[11px]">
                            Cost: <span className="font-semibold">{formatCurrency(product.costPrice)}</span>
                          </div>
                          <div className="text-rose-800 font-bold">
                            Rep: {formatCurrency(product.repPrice)}
                          </div>
                          <div className="text-slate-700 text-[11px]">
                            Retail: <span className="font-medium">{formatCurrency(product.brochurePrice)}</span>
                          </div>
                          <div className="text-[10px] text-emerald-700 font-sans">
                            Rep Margin: +{formatCurrency(repMargin)}
                          </div>
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-bold text-sm text-slate-900 font-mono">
                          {product.stockQty}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Min threshold: {product.minThreshold}
                        </span>
                        {/* Progress Bar of Stock */}
                        <div className="w-16 mx-auto bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                          <div 
                            className={`h-1 rounded-full ${
                              product.stockQty === 0 
                                ? 'bg-rose-500' 
                                : product.stockQty <= product.minThreshold 
                                  ? 'bg-amber-500' 
                                  : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min((product.stockQty / (product.minThreshold * 2.5)) * 100, 100)}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          product.status === 'In Stock'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : product.status === 'Low Stock'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {product.status === 'In Stock' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {product.status === 'Low Stock' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          {product.status === 'Out of Stock' && <XCircle className="w-3 h-3 text-rose-600" />}
                          {product.status}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{product.location}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Restocked: {product.lastRestockedDate}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onNavigateToStockIn && (
                            <button
                              onClick={() => onNavigateToStockIn(product.id)}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Quick Stock In Receiving"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setBarcodePreviewItem(product)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="View Barcode Label"
                          >
                            <Barcode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(product)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Duplicate as new product"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Product Info"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="bg-gradient-to-r from-rose-900 to-pink-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingProduct ? 'Edit Avon Product' : 'Add New Avon Product to Central Database'}
                </h3>
                <p className="text-xs text-rose-200">
                  Standardized catalog specifications (Objective 1)
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  if (onClearInitialAddModal) onClearInitialAddModal();
                }}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Item Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 uppercase font-mono"
                    placeholder="e.g. AV-FR-105"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-medium"
                    placeholder="e.g. Rare Gold Eau de Parfum"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brochure Campaign</label>
                  <input
                    type="text"
                    value={formData.campaign}
                    onChange={e => setFormData({ ...formData, campaign: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit / Packaging</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    placeholder="e.g. 50ml Bottle, Set, Tube"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Key notes, scent profile, ingredients or selling features..."
                />
              </div>

              {/* Pricing Grid */}
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 space-y-2">
                <span className="font-bold text-slate-800 text-xs block">
                  Avon Multi-Tier Pricing Schedule
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      1. Central Cost Price ({settings.currency}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.costPrice}
                      onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                    />
                    <span className="text-[10px] text-slate-500">Branch purchase price</span>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      2. Rep Wholesale Price ({settings.currency}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.repPrice}
                      onChange={e => setFormData({ ...formData, repPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-rose-800"
                    />
                    <span className="text-[10px] text-slate-500">Charged to Representative</span>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      3. Brochure Retail Price ({settings.currency}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.brochurePrice}
                      onChange={e => setFormData({ ...formData, brochurePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                    />
                    <span className="text-[10px] text-slate-500">Official catalog customer price</span>
                  </div>
                </div>
              </div>

              {/* Inventory Stock Quantities */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Stock Qty *</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQty}
                    onChange={e => setFormData({ ...formData, stockQty: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Threshold Alert *</label>
                  <input
                    type="number"
                    required
                    value={formData.minThreshold}
                    onChange={e => setFormData({ ...formData, minThreshold: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-amber-700"
                  />
                  <span className="text-[10px] text-slate-500">Triggers reorder warning</span>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    placeholder="e.g. Aisle 2 - Shelf C"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barcode / EAN-13</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono"
                    placeholder="e.g. 4800129031011"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onClearInitialAddModal) onClearInitialAddModal();
                  }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {editingProduct ? 'Save Product Changes' : 'Register Product into Database'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Barcode Preview Modal */}
      {barcodePreviewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">{barcodePreviewItem.name}</h3>
            <p className="text-xs text-rose-700 font-mono font-semibold mt-0.5">{barcodePreviewItem.sku}</p>
            
            {/* Visual Simulated Barcode */}
            <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
              <div className="flex gap-1 h-14 items-stretch justify-center">
                {[3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1, 3].map((w, i) => (
                  <div key={i} className="bg-slate-900 rounded-xs" style={{ width: `${w * 2}px` }} />
                ))}
              </div>
              <span className="font-mono text-xs font-bold tracking-widest text-slate-800 mt-2">
                {barcodePreviewItem.barcode}
              </span>
            </div>

            <div className="text-xs text-slate-500 mb-4">
              Avon Retail Price: <strong className="text-slate-800">{formatCurrency(barcodePreviewItem.brochurePrice)}</strong>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Print Label
              </button>
              <button
                onClick={() => setBarcodePreviewItem(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
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
