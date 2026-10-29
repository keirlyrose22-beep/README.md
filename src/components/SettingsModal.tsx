import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Settings, Save, RotateCcw, X, Building, DollarSign, User, MapPin, Tag } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetAllData } = useInventory();
  const [formData, setFormData] = useState(settings);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    resetAllData();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold">Avon Branch & System Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-rose-600" />
              Branch Office Name
            </label>
            <input
              type="text"
              required
              value={formData.officeName}
              onChange={e => setFormData({ ...formData, officeName: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch Code
              </label>
              <input
                type="text"
                required
                value={formData.branchCode}
                onChange={e => setFormData({ ...formData, branchCode: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-rose-600" />
                Active Brochure Campaign
              </label>
              <input
                type="text"
                required
                value={formData.currentCampaign}
                onChange={e => setFormData({ ...formData, currentCampaign: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                placeholder="e.g. Campaign 10 - 2026"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-600" />
                Branch Officer / Manager
              </label>
              <input
                type="text"
                required
                value={formData.managerName}
                onChange={e => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                Currency Symbol
              </label>
              <select
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
              >
                <option value="₱">₱ (PHP - Philippine Peso)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="R$">R$ (BRL - Brazilian Real)</option>
                <option value="MXN$">MXN$ (Mexican Peso)</option>
                <option value="ZAR">R (ZAR - South African Rand)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              Office Address / Hub Location
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="text-xs text-rose-700 hover:text-rose-800 flex items-center gap-1 font-medium hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Research Sample Data
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saveSuccess ? 'Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>

        {/* Confirm Reset Dialog */}
        {showConfirmReset && (
          <div className="absolute inset-0 bg-white/95 p-6 flex flex-col justify-center items-center text-center">
            <RotateCcw className="w-10 h-10 text-amber-600 mb-2" />
            <h3 className="font-bold text-slate-900 text-base mb-1">Reset All Inventory Data?</h3>
            <p className="text-xs text-slate-600 max-w-sm mb-4">
              This will restore the authentic initial Avon product catalog, sample representative orders, stock intake batches, and study transactions.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
