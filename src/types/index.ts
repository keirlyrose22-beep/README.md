export type ProductCategory = 
  | 'Fragrance' 
  | 'Skincare' 
  | 'Makeup & Cosmetics' 
  | 'Personal Care & Bath' 
  | 'Fashion & Jewelry' 
  | 'Wellness & Intimate';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
  id: string;
  sku: string; // e.g. "AV-FR-101"
  name: string;
  category: ProductCategory;
  campaign: string; // e.g. "Campaign 10 - 2026"
  description: string;
  unit: string; // e.g., "50ml Bottle", "Piece", "100g Tube"
  costPrice: number; // Branch purchase price from Avon Central
  repPrice: number; // Selling price to Avon Sales Representative
  brochurePrice: number; // Customer retail catalog price
  stockQty: number;
  minThreshold: number; // Reorder alert level
  barcode: string;
  location: string; // e.g., "Aisle A-02", "Shelf B3"
  status: StockStatus;
  lastRestockedDate: string;
  totalSoldUnits: number; // For fast/slow moving classification
}

export interface Representative {
  id: string;
  repNumber: string; // e.g., "REP-4091"
  fullName: string;
  phone: string;
  email: string;
  zoneArea: string;
  status: 'Active' | 'Inactive';
  totalOrdersCount: number;
  totalSpent: number;
}

export type TransactionType = 'Stock In' | 'Representative Order' | 'Audit Adjustment' | 'Damaged / Write-Off' | 'Customer Return';

export interface StockTransaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  referenceNo: string; // e.g. "REC-2026-001" or "INV-8910"
  productId: string;
  productName: string;
  sku: string;
  quantityChange: number; // + for incoming, - for outgoing
  previousStock: number;
  newStock: number;
  unitPrice: number;
  totalValue: number;
  recipientOrSupplier: string; // Representative name or Avon Central Warehouse
  performedBy: string;
  notes?: string;
}

export interface StockInItem {
  productId: string;
  sku: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  costPrice: number;
  batchNumber: string;
  expiryDate?: string;
}

export interface StockInRecord {
  id: string;
  referenceNo: string; // Delivery Receipt #
  supplier: string; // e.g. "Avon Regional Distribution Center"
  receivedDate: string;
  items: StockInItem[];
  totalUnits: number;
  totalCost: number;
  status: 'Completed' | 'Draft';
  receivedBy: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  productName: string;
  unitPrice: number; // Rep price
  brochurePrice: number;
  quantity: number;
  subtotal: number;
}

export interface RepresentativeOrder {
  id: string;
  orderNumber: string; // e.g. "AV-ORD-2026-014"
  date: string;
  repId: string;
  repName: string;
  repNumber: string;
  items: OrderItem[];
  totalBrochureValue: number;
  totalRepAmount: number;
  estimatedRepDiscount: number; // Rep earnings/margin
  officeMargin: number; // Office earnings
  paymentStatus: 'Paid' | 'Unpaid' | 'Pending Credit';
  orderStatus: 'Dispatched' | 'Ready for Pickup' | 'Processing';
  dispatchedBy: string;
  notes?: string;
}

export interface OfficeSettings {
  officeName: string;
  branchCode: string;
  managerName: string;
  address: string;
  phone: string;
  currency: string;
  currentCampaign: string;
}
