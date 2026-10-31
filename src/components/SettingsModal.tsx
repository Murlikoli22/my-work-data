import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Building2, 
  CreditCard, 
  Coins, 
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { WorkshopSettings, MotorJob } from '../types';
import { exportEntireData, importBackupData, resetToInitialDemoData } from '../utils/storage';

interface SettingsModalProps {
  settings: WorkshopSettings;
  onSaveSettings: (settings: WorkshopSettings) => void;
  motorJobs: MotorJob[];
  onDataReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  motorJobs,
  onDataReset,
}) => {
  const [formData, setFormData] = useState<WorkshopSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadBackup = () => {
    const jsonString = exportEntireData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shree_gayatri_electricals_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (motorJobs.length === 0) {
      alert('No motor jobs to export.');
      return;
    }

    const headers = [
      'Job Number',
      'Client Name',
      'Company Name',
      'Phone',
      'Address',
      'Motor HP',
      'Brand',
      'Phase',
      'Coil Turns',
      'Wire Gauge SWG',
      'Total Coils',
      'Connection',
      'Copper Wt (kg)',
      'Total Spent (Cost)',
      'Billed Amount',
      'Advance Paid',
      'Remaining Due',
      'Profit I Got',
      'Status'
    ];

    const rows = motorJobs.map(j => [
      `"${j.jobNumber}"`,
      `"${j.clientName}"`,
      `"${j.companyName || ''}"`,
      `"${j.clientPhone}"`,
      `"${j.clientAddress}"`,
      j.motorSpec.hp,
      `"${j.motorSpec.brand}"`,
      `"${j.motorSpec.phase}"`,
      `"${j.motorSpec.windingSpecs.turnsPerCoil}"`,
      `"${j.motorSpec.windingSpecs.wireGaugeSWG}"`,
      j.motorSpec.windingSpecs.totalCoils || '',
      `"${j.motorSpec.windingSpecs.connection}"`,
      j.motorSpec.windingSpecs.copperWeightKg,
      j.costBreakdown.totalCost,
      j.billing.finalBillAmount,
      j.billing.advancePaid,
      j.billing.balanceDue,
      j.billing.profit || (j.billing.finalBillAmount - j.costBreakdown.totalCost),
      `"${j.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shree_gayatri_motor_jobs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupData(content);
        if (success) {
          alert('Database restored successfully!');
          window.location.reload();
        } else {
          alert('Failed to parse backup JSON file. Please check file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all workshop jobs, client records, electrical sites, and staff logs for a fresh start?')) {
      resetToInitialDemoData();
      onDataReset();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto text-slate-100">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Workshop Settings & Data Backup
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure workshop name, address, GSTIN, UPI details, default copper wire rate, and backup your work data.
        </p>
      </div>

      {/* Workshop Settings Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 text-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          Workshop Business Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Workshop Name</label>
            <input
              type="text"
              required
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-sm focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Proprietor Name</label>
            <input
              type="text"
              required
              value={formData.proprietor}
              onChange={(e) => setFormData({ ...formData, proprietor: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-300 mb-1">Workshop Tagline / Services</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Primary Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Alternate Phone</label>
            <input
              type="tel"
              value={formData.alternatePhone || ''}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-300 mb-1">Address / Location</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">State & Pincode</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
              />
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* GST & Bank info */}
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5 border-b border-slate-800 pt-2 pb-2">
          <CreditCard className="w-4 h-4 text-blue-400" />
          GSTIN, Banking & Default Benchmark Copper Rate
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-300 mb-1">GSTIN Number</label>
            <input
              type="text"
              value={formData.gstin || ''}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              placeholder="24AAFPS8901M1ZX"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-amber-300 mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Standard Copper Wire Rate (₹ / kg)
            </label>
            <input
              type="number"
              value={formData.copperDefaultRatePerKg}
              onChange={(e) => setFormData({ ...formData, copperDefaultRatePerKg: parseFloat(e.target.value) || 940 })}
              className="w-full px-3 py-2 border border-amber-800/80 bg-amber-950/40 rounded-lg font-mono font-bold text-amber-300 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Bank Name</label>
            <input
              type="text"
              value={formData.bankName || ''}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Account Number & IFSC</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.bankAccountNumber || ''}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                placeholder="A/C Number"
                className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white focus:border-amber-500 focus:outline-hidden"
              />
              <input
                type="text"
                value={formData.bankIfsc || ''}
                onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                placeholder="IFSC Code"
                className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-300 mb-1">UPI ID (For invoices & QR)</label>
            <input
              type="text"
              value={formData.upiId || ''}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              placeholder="e.g. shreegayatri@oksbi"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {saveSuccess ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Settings updated successfully!
            </span>
          ) : (
            <span className="text-slate-400">Printed invoices and challans will reflect these details.</span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Save Workshop Settings
          </button>
        </div>
      </form>

      {/* Data Backup & Export Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Backup, Export & Restore Work Data
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          {/* JSON Backup Download */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
            <span className="font-bold text-white block">Download Full JSON Backup</span>
            <p className="text-slate-400 text-[11px]">
              Saves all motor jobs, site works, staff attendance logs, and winding data to your computer.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="w-full mt-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Excel / CSV Export */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
            <span className="font-bold text-white block">Export Motor Jobs to Excel (CSV)</span>
            <p className="text-slate-400 text-[11px]">
              Export all {motorJobs.length} motor jobs with turns, gauge, costs, and profits into a spreadsheet.
            </p>
            <button
              onClick={handleExportCSV}
              className="w-full mt-2 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV for Excel</span>
            </button>
          </div>

          {/* Restore JSON Backup */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
            <span className="font-bold text-white block">Restore from Backup</span>
            <p className="text-slate-400 text-[11px]">
              Load a previously downloaded backup JSON file to restore all workshop data.
            </p>
            <label className="w-full mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Select Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

        </div>

        {/* Clean data reset */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Need a clean slate? Clear all jobs and logs</span>
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 rounded-lg border border-rose-900/80 text-rose-400 hover:bg-rose-950/40 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All Data (Fresh Start)</span>
          </button>
        </div>
      </div>

    </div>
  );
};
