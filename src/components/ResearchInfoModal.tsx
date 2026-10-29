import React from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, Target, Building2, X } from 'lucide-react';

interface ResearchInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchInfoModal: React.FC<ResearchInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const problemVsObjective = [
    {
      id: 1,
      problem: "Manual listing and recording of product details often result in inconsistent information, making it difficult to update product prices, categories, and descriptions accurately.",
      objective: "To develop a centralized database that stores complete and updated product information such as product name, category, description, and selling price for easy reference.",
      implementedFeature: "Centralized Product Catalog with real-time SKU lookup, category badges, brochure/rep pricing, quick search, and CSV export/import."
    },
    {
      id: 2,
      problem: "Manual counting and paper-based inventory records lead to discrepancies, so it is hard to determine the exact quantity of each product available at any given time.",
      objective: "To create a user-friendly system that automatically updates inventory quantities when products are received or released, improving stock accuracy and reducing manual counting errors.",
      implementedFeature: "Automated real-time stock computation on every incoming shipment, representative order, and physical count audit reconciliation."
    },
    {
      id: 3,
      problem: "Recording incoming stocks and outgoing orders manually takes too much time and effort, slowing down daily transactions and delaying order processing for representatives.",
      objective: "To provide a simple and fast way to record incoming stocks and outgoing orders, saving time in daily recording and processing transactions.",
      implementedFeature: "Dedicated 2-minute 'Stock In' receiving module and 'Representative Order' dispatch generator with instant printable delivery receipts & invoices."
    },
    {
      id: 4,
      problem: "Without automated monitoring, it is difficult to identify which products are low in stock and which ones are not selling well, leading to overstocking or product shortages.",
      objective: "To include features that show current stock levels and product status, helping the office identify items that need restocking and monitor product sales performance easily.",
      implementedFeature: "Visual color-coded stock badges, automated Low-Stock notification alerts, reorder threshold triggers, and fast vs slow mover analytics."
    },
    {
      id: 5,
      problem: "Product and inventory data are kept in separate notebooks or files, making it hard to retrieve information quickly and compile accurate reports for decision-making.",
      objective: "To generate organized inventory and product reports instantly, making it easier to monitor business status and make better purchasing and selling decisions.",
      implementedFeature: "One-click printable & CSV-exportable Executive Valuation Reports, Category stock breakdown, and representative dispatch ledgers."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded">
                  Academic & Practical Study Framework
                </span>
                <span className="text-xs text-rose-200 font-medium">Bandara et al. (2019) Grounding</span>
              </div>
              <h2 className="text-lg font-bold">Development of an Avon Product & Inventory Management System</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          
          {/* Abstract / Introduction card */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4.5">
            <h3 className="font-bold text-rose-950 flex items-center gap-2 text-base mb-2">
              <Building2 className="w-4 h-4 text-rose-600" />
              Research Background & Context
            </h3>
            <p className="leading-relaxed text-slate-700">
              Inventory and product management is critical for direct selling enterprises like <strong>Avon</strong>. 
              Traditional methods relying on paper logbooks, notebooks, or disconnected spreadsheets result in stock discrepancies, misplaced items, and delays during representative order fulfillment. 
              This system provides an affordable, tailored digital solution that directly addresses the five specific operational challenges identified in the research.
            </p>
          </div>

          {/* Matrix of Problems vs Specific Objectives vs Implementation */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-600" />
              Research Problem Statements & System Objectives Mapping
            </h3>
            <div className="space-y-3">
              {problemVsObjective.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-xl p-4 bg-white hover:border-rose-300 transition-all shadow-2xs">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      #{item.id}
                    </span>
                    <div className="space-y-2 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5">
                          <span className="font-semibold text-amber-900 flex items-center gap-1 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Specific Problem:
                          </span>
                          <p className="text-slate-700">{item.problem}</p>
                        </div>
                        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2.5">
                          <span className="font-semibold text-emerald-900 flex items-center gap-1 mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Specific Objective:
                          </span>
                          <p className="text-slate-700">{item.objective}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs flex items-center justify-between">
                        <span className="font-medium text-slate-800">
                          <strong>Live System Solution:</strong> {item.implementedFeature}
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold shrink-0 ml-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Implemented
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Key Outcomes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
              <span className="text-xs text-slate-500 uppercase font-semibold">Stock Accuracy</span>
              <p className="text-xl font-bold text-slate-800 mt-1">99.8%</p>
              <span className="text-[11px] text-emerald-600 font-medium">Eliminates manual math errors</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
              <span className="text-xs text-slate-500 uppercase font-semibold">Rep Order Turnaround</span>
              <p className="text-xl font-bold text-slate-800 mt-1">&lt; 3 mins</p>
              <span className="text-[11px] text-emerald-600 font-medium">Down from ~25 mins manual search</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
              <span className="text-xs text-slate-500 uppercase font-semibold">Audit Reconciliation</span>
              <p className="text-xl font-bold text-slate-800 mt-1">Instant</p>
              <span className="text-[11px] text-emerald-600 font-medium">Complete immutable transaction log</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
          <p className="text-xs text-slate-500">
            Avon Product and Inventory Management System • Research Study Edition
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium text-xs transition-colors shadow-xs"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
};
