import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Representative, 
  StockTransaction, 
  TransactionType,
  RepresentativeOrder, 
  StockInRecord, 
  OfficeSettings, 
  StockStatus,
  StockInItem,
  OrderItem
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_REPRESENTATIVES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_ORDERS, 
  INITIAL_STOCK_INS, 
  INITIAL_OFFICE_SETTINGS 
} from '../data/initialData';

interface InventoryContextType {
  products: Product[];
  representatives: Representative[];
  transactions: StockTransaction[];
  orders: RepresentativeOrder[];
  stockIns: StockInRecord[];
  settings: OfficeSettings;
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'status' | 'totalSoldUnits' | 'lastRestockedDate'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Stock In action
  recordStockIn: (record: {
    referenceNo: string;
    supplier: string;
    items: { productId: string; quantity: number; costPrice: number; batchNumber: string; expiryDate?: string }[];
    notes?: string;
  }) => void;
  // Representative Order action
  recordRepresentativeOrder: (order: {
    repId: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
    paymentStatus: 'Paid' | 'Unpaid' | 'Pending Credit';
  }) => { success: boolean; error?: string; order?: RepresentativeOrder };
  // Stock adjustment / reconciliation action
  adjustStock: (productId: string, newQuantity: number, reason: string, notes?: string) => void;
  // Representative actions
  addRepresentative: (rep: Omit<Representative, 'id' | 'totalOrdersCount' | 'totalSpent'>) => void;
  // Settings actions
  updateSettings: (newSettings: Partial<OfficeSettings>) => void;
  resetAllData: () => void;
  // Helpers
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  totalStockUnits: number;
  totalCostValuation: number;
  totalRetailValuation: number;
  formatCurrency: (amount: number) => string;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('avon_pims_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [representatives, setRepresentatives] = useState<Representative[]>(() => {
    try {
      const saved = localStorage.getItem('avon_pims_reps');
      return saved ? JSON.parse(saved) : INITIAL_REPRESENTATIVES;
    } catch {
      return INITIAL_REPRESENTATIVES;
    }
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('avon_pims_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [orders, setOrders] = useState<RepresentativeOrder[]>(() => {
    try {
      const saved = localStorage.getItem('avon_pims_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [stockIns, setStockIns] = useState<StockInRecord[]>(() => {
    try {
      const saved = localStorage.getItem('avon_pims_stockins');
      return saved ? JSON.parse(saved) : INITIAL_STOCK_INS;
    } catch {
      return INITIAL_STOCK_INS;
    }
  });

  const [settings, setSettings] = useState<OfficeSettings>(() => {
    try {
      const saved = localStorage.getItem('avon_pims_settings');
      return saved ? JSON.parse(saved) : INITIAL_OFFICE_SETTINGS;
    } catch {
      return INITIAL_OFFICE_SETTINGS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('avon_pims_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('avon_pims_reps', JSON.stringify(representatives));
  }, [representatives]);

  useEffect(() => {
    localStorage.setItem('avon_pims_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('avon_pims_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('avon_pims_stockins', JSON.stringify(stockIns));
  }, [stockIns]);

  useEffect(() => {
    localStorage.setItem('avon_pims_settings', JSON.stringify(settings));
  }, [settings]);

  const computeStatus = (qty: number, min: number): StockStatus => {
    if (qty <= 0) return 'Out of Stock';
    if (qty <= min) return 'Low Stock';
    return 'In Stock';
  };

  const formatCurrency = (amount: number) => {
    return `${settings.currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Add Product
  const addProduct = (item: Omit<Product, 'id' | 'status' | 'totalSoldUnits' | 'lastRestockedDate'>) => {
    const newId = `prod-${Date.now()}`;
    const status = computeStatus(item.stockQty, item.minThreshold);
    const today = new Date().toISOString().split('T')[0];
    const newProduct: Product = {
      ...item,
      id: newId,
      status,
      totalSoldUnits: 0,
      lastRestockedDate: today
    };

    setProducts(prev => [newProduct, ...prev]);

    // Initial audit transaction if initial stock > 0
    if (item.stockQty > 0) {
      const tx: StockTransaction = {
        id: `tx-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        type: 'Stock In',
        referenceNo: `INIT-${newProduct.sku}`,
        productId: newId,
        productName: newProduct.name,
        sku: newProduct.sku,
        quantityChange: item.stockQty,
        previousStock: 0,
        newStock: item.stockQty,
        unitPrice: item.costPrice,
        totalValue: item.costPrice * item.stockQty,
        recipientOrSupplier: 'Initial Product Setup',
        performedBy: settings.managerName,
        notes: 'Initial opening stock entry'
      };
      setTransactions(prev => [tx, ...prev]);
    }
  };

  // Update Product
  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newStock = updated.stockQty !== undefined ? updated.stockQty : p.stockQty;
      const newMin = updated.minThreshold !== undefined ? updated.minThreshold : p.minThreshold;
      return {
        ...p,
        ...updated,
        status: computeStatus(newStock, newMin)
      };
    }));
  };

  // Delete Product
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Record Stock In (Batch Receiving from Central Office)
  const recordStockIn = ({
    referenceNo,
    supplier,
    items,
    notes
  }: {
    referenceNo: string;
    supplier: string;
    items: { productId: string; quantity: number; costPrice: number; batchNumber: string; expiryDate?: string }[];
    notes?: string;
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toLocaleString();

    let totalUnits = 0;
    let totalCost = 0;
    const stockInItems: StockInItem[] = [];
    const newTxList: StockTransaction[] = [];

    // Map of updated products
    const productUpdates = new Map<string, { qty: number; lastDate: string }>();

    items.forEach(itm => {
      const prod = products.find(p => p.id === itm.productId);
      if (!prod) return;

      totalUnits += itm.quantity;
      totalCost += itm.quantity * itm.costPrice;

      stockInItems.push({
        productId: prod.id,
        sku: prod.sku,
        productName: prod.name,
        category: prod.category,
        quantity: itm.quantity,
        costPrice: itm.costPrice,
        batchNumber: itm.batchNumber,
        expiryDate: itm.expiryDate
      });

      const currentQty = productUpdates.has(prod.id) 
        ? productUpdates.get(prod.id)!.qty 
        : prod.stockQty;
      const nextQty = currentQty + itm.quantity;

      productUpdates.set(prod.id, {
        qty: nextQty,
        lastDate: today
      });

      newTxList.push({
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeNow,
        type: 'Stock In',
        referenceNo: referenceNo || `REC-${Date.now().toString().slice(-4)}`,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantityChange: itm.quantity,
        previousStock: currentQty,
        newStock: nextQty,
        unitPrice: itm.costPrice,
        totalValue: itm.costPrice * itm.quantity,
        recipientOrSupplier: supplier || 'Avon Central Warehouse',
        performedBy: settings.managerName,
        notes: notes || `Batch: ${itm.batchNumber}`
      });
    });

    // Update products state
    setProducts(prev => prev.map(p => {
      if (productUpdates.has(p.id)) {
        const update = productUpdates.get(p.id)!;
        return {
          ...p,
          stockQty: update.qty,
          lastRestockedDate: update.lastDate,
          status: computeStatus(update.qty, p.minThreshold)
        };
      }
      return p;
    }));

    // Save Stock In record
    const record: StockInRecord = {
      id: `stkin-${Date.now()}`,
      referenceNo: referenceNo || `REC-${Date.now().toString().slice(-4)}`,
      supplier: supplier || 'Avon Central Distribution Hub',
      receivedDate: today,
      items: stockInItems,
      totalUnits,
      totalCost,
      status: 'Completed',
      receivedBy: settings.managerName,
      notes
    };

    setStockIns(prev => [record, ...prev]);
    setTransactions(prev => [...newTxList, ...prev]);
  };

  // Record Representative Order (Stock Out Dispatch)
  const recordRepresentativeOrder = ({
    repId,
    items,
    notes,
    paymentStatus
  }: {
    repId: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
    paymentStatus: 'Paid' | 'Unpaid' | 'Pending Credit';
  }): { success: boolean; error?: string; order?: RepresentativeOrder } => {
    const rep = representatives.find(r => r.id === repId);
    if (!rep) {
      return { success: false, error: 'Representative not found' };
    }

    // Verify stock availability
    for (const itm of items) {
      const prod = products.find(p => p.id === itm.productId);
      if (!prod) {
        return { success: false, error: `Product ID ${itm.productId} not found` };
      }
      if (prod.stockQty < itm.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for "${prod.name}". Requested: ${itm.quantity}, Available: ${prod.stockQty}` 
        };
      }
    }

    const orderNumber = `AV-ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toLocaleString();

    let totalBrochureValue = 0;
    let totalRepAmount = 0;
    let totalOfficeCost = 0;
    const orderItems: OrderItem[] = [];
    const newTxList: StockTransaction[] = [];
    const productQtyMap = new Map<string, number>();

    items.forEach(itm => {
      const prod = products.find(p => p.id === itm.productId)!;
      const subtotal = prod.repPrice * itm.quantity;
      const brochureSubtotal = prod.brochurePrice * itm.quantity;
      const costSubtotal = prod.costPrice * itm.quantity;

      totalBrochureValue += brochureSubtotal;
      totalRepAmount += subtotal;
      totalOfficeCost += costSubtotal;

      orderItems.push({
        productId: prod.id,
        sku: prod.sku,
        productName: prod.name,
        unitPrice: prod.repPrice,
        brochurePrice: prod.brochurePrice,
        quantity: itm.quantity,
        subtotal
      });

      const currentStock = prod.stockQty;
      const newStock = currentStock - itm.quantity;
      productQtyMap.set(prod.id, newStock);

      newTxList.push({
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeNow,
        type: 'Representative Order',
        referenceNo: orderNumber,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantityChange: -itm.quantity,
        previousStock: currentStock,
        newStock: newStock,
        unitPrice: prod.repPrice,
        totalValue: subtotal,
        recipientOrSupplier: `${rep.fullName} (${rep.repNumber})`,
        performedBy: settings.managerName,
        notes: notes || 'Counter Order Dispatch'
      });
    });

    // Update Products stock and total sold units
    setProducts(prev => prev.map(p => {
      if (productQtyMap.has(p.id)) {
        const nextQty = productQtyMap.get(p.id)!;
        const itm = items.find(i => i.productId === p.id);
        const soldAddition = itm ? itm.quantity : 0;
        return {
          ...p,
          stockQty: nextQty,
          totalSoldUnits: (p.totalSoldUnits || 0) + soldAddition,
          status: computeStatus(nextQty, p.minThreshold)
        };
      }
      return p;
    }));

    // Update representative statistics
    setRepresentatives(prev => prev.map(r => {
      if (r.id === repId) {
        return {
          ...r,
          totalOrdersCount: r.totalOrdersCount + 1,
          totalSpent: r.totalSpent + totalRepAmount
        };
      }
      return r;
    }));

    const newOrder: RepresentativeOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: today,
      repId: rep.id,
      repName: rep.fullName,
      repNumber: rep.repNumber,
      items: orderItems,
      totalBrochureValue,
      totalRepAmount,
      estimatedRepDiscount: totalBrochureValue - totalRepAmount,
      officeMargin: totalRepAmount - totalOfficeCost,
      paymentStatus,
      orderStatus: 'Dispatched',
      dispatchedBy: settings.managerName,
      notes
    };

    setOrders(prev => [newOrder, ...prev]);
    setTransactions(prev => [...newTxList, ...prev]);

    return { success: true, order: newOrder };
  };

  // Manual Stock Adjustment (Physical Count Reconciliation / Damaged Write-off)
  const adjustStock = (productId: string, newQuantity: number, reason: string, notes?: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const diff = newQuantity - prod.stockQty;
    if (diff === 0) return;

    const isDamage = reason.toLowerCase().includes('damage') || reason.toLowerCase().includes('write-off');
    const type: TransactionType = isDamage ? 'Damaged / Write-Off' : 'Audit Adjustment';

    const tx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      type,
      referenceNo: `ADJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantityChange: diff,
      previousStock: prod.stockQty,
      newStock: newQuantity,
      unitPrice: prod.costPrice,
      totalValue: Math.abs(diff) * prod.costPrice,
      recipientOrSupplier: 'Physical Count Reconciliation',
      performedBy: settings.managerName,
      notes: `${reason} - ${notes || 'Stock reconciled'}`
    };

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stockQty: newQuantity,
          status: computeStatus(newQuantity, p.minThreshold)
        };
      }
      return p;
    }));

    setTransactions(prev => [tx, ...prev]);
  };

  // Add Representative
  const addRepresentative = (rep: Omit<Representative, 'id' | 'totalOrdersCount' | 'totalSpent'>) => {
    const newRep: Representative = {
      ...rep,
      id: `rep-${Date.now()}`,
      totalOrdersCount: 0,
      totalSpent: 0
    };
    setRepresentatives(prev => [newRep, ...prev]);
  };

  // Update Settings
  const updateSettings = (newSettings: Partial<OfficeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Reset to initial research dataset
  const resetAllData = () => {
    localStorage.removeItem('avon_pims_products');
    localStorage.removeItem('avon_pims_reps');
    localStorage.removeItem('avon_pims_transactions');
    localStorage.removeItem('avon_pims_orders');
    localStorage.removeItem('avon_pims_stockins');
    localStorage.removeItem('avon_pims_settings');

    setProducts(INITIAL_PRODUCTS);
    setRepresentatives(INITIAL_REPRESENTATIVES);
    setTransactions(INITIAL_TRANSACTIONS);
    setOrders(INITIAL_ORDERS);
    setStockIns(INITIAL_STOCK_INS);
    setSettings(INITIAL_OFFICE_SETTINGS);
  };

  // Derived state
  const lowStockProducts = products.filter(p => p.status === 'Low Stock');
  const outOfStockProducts = products.filter(p => p.status === 'Out of Stock');
  const totalStockUnits = products.reduce((acc, p) => acc + p.stockQty, 0);
  const totalCostValuation = products.reduce((acc, p) => acc + (p.stockQty * p.costPrice), 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + (p.stockQty * p.brochurePrice), 0);

  return (
    <InventoryContext.Provider
      value={{
        products,
        representatives,
        transactions,
        orders,
        stockIns,
        settings,
        addProduct,
        updateProduct,
        deleteProduct,
        recordStockIn,
        recordRepresentativeOrder,
        adjustStock,
        addRepresentative,
        updateSettings,
        resetAllData,
        lowStockProducts,
        outOfStockProducts,
        totalStockUnits,
        totalCostValuation,
        totalRetailValuation,
        formatCurrency
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
