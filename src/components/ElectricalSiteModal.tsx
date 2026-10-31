import React, { useState } from 'react';
import { X, Building2, Users, DollarSign, Check, Calendar, MapPin, Wrench } from 'lucide-react';
import { ElectricalSiteWork, StaffMember, ElectricalSiteType } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ElectricalSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (site: ElectricalSiteWork) => void;
  staff: StaffMember[];
  existingSite?: ElectricalSiteWork | null;
}

export const ElectricalSiteModal: React.FC<ElectricalSiteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  staff,
  existingSite,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(existingSite?.title || '');
  const [siteType, setSiteType] = useState<ElectricalSiteType>(existingSite?.siteType || 'Home / Residential');
  const [otherSiteTypeDetail, setOtherSiteTypeDetail] = useState(existingSite?.otherSiteTypeDetail || '');
  const [clientName, setClientName] = useState(existingSite?.clientName || '');
  const [companyOrSocietyName, setCompanyOrSocietyName] = useState(existingSite?.companyOrSocietyName || '');
  const [clientPhone, setClientPhone] = useState(existingSite?.clientPhone || '');
  const [siteAddress, setSiteAddress] = useState(existingSite?.siteAddress || '');
  const [startDate, setStartDate] = useState(existingSite?.startDate || new Date().toISOString().split('T')[0]);
  const [targetCompletionDate, setTargetCompletionDate] = useState(
    existingSite?.targetCompletionDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<ElectricalSiteWork['status']>(existingSite?.status || 'In Progress');
  const [workScope, setWorkScope] = useState(
    existingSite?.workScope || 'Concealed PVC conduit pipe laying, FRLS copper wire pulling, modular switchboards, distribution box & earthing.'
  );
  
  // Workers assigned on this electrical site
  const [assignedWorkerNames, setAssignedWorkerNames] = useState<string[]>(
    existingSite?.assignedWorkerNames || (staff.length > 0 ? [staff[0].name] : [])
  );
  const [isAddingOtherWorker, setIsAddingOtherWorker] = useState(false);
  const [otherWorkerInput, setOtherWorkerInput] = useState('');

  // Financials & Costs
  const [contractAmount, setContractAmount] = useState<number>(existingSite?.contractAmount || 45000);
  const [materialCost, setMaterialCost] = useState<number>(existingSite?.materialCost || 22000);
  const [workerLabourCost, setWorkerLabourCost] = useState<number>(existingSite?.workerLabourCost || 11000);
  const [advanceReceived, setAdvanceReceived] = useState<number>(existingSite?.advanceReceived || 15000);
  const [notes, setNotes] = useState(existingSite?.notes || '');

  // Calculated fields
  const totalCost = Number(materialCost || 0) + Number(workerLabourCost || 0);
  const profit = Math.round(Number(contractAmount || 0) - totalCost);
  const balancePending = Math.max(0, Number(contractAmount || 0) - Number(advanceReceived || 0));
  const paymentStatus: ElectricalSiteWork['paymentStatus'] = 
    balancePending <= 0 ? 'Paid' : (advanceReceived > 0 ? 'Partial' : 'Pending');

  const toggleWorker = (name: string) => {
    if (assignedWorkerNames.includes(name)) {
      setAssignedWorkerNames(assignedWorkerNames.filter(n => n !== name));
    } else {
      setAssignedWorkerNames([...assignedWorkerNames, name]);
    }
  };

  const handleAddOtherWorker = () => {
    const trimmed = otherWorkerInput.trim();
    if (trimmed) {
      if (!assignedWorkerNames.includes(trimmed)) {
        setAssignedWorkerNames(prev => [...prev, trimmed]);
      }
      setOtherWorkerInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) {
      alert('Please fill project title and client name.');
      return;
    }

    const newSite: ElectricalSiteWork = {
      id: existingSite?.id || `site-${Date.now()}`,
      projectCode: existingSite?.projectCode || `EW-2026-${Math.floor(10 + Math.random() * 90)}`,
      title,
      siteType,
      otherSiteTypeDetail: siteType === 'Other' ? otherSiteTypeDetail : undefined,
      clientName,
      companyOrSocietyName: companyOrSocietyName || undefined,
      clientPhone,
      siteAddress,
      startDate,
      targetCompletionDate,
      status,
      workScope,
      assignedWorkerNames,
      materialCost,
      workerLabourCost,
      totalCost,
      contractAmount,
      advanceReceived,
      balancePending,
      profit,
      paymentStatus,
      notes: notes || undefined,
      createdAt: existingSite?.createdAt || new Date().toISOString()
    };

    onSave(newSite);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl my-auto overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {existingSite ? `Edit Electrical Work: ${existingSite.projectCode}` : 'New Electrical Site Project'}
              </h3>
              <p className="text-xs text-slate-400">
                Wiring in Home, Shop, Company, Society & On-Site Workers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          
          {/* Project Title & Site Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Project Title / Description <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3-BHK Concealed Wiring & Panel Fitting"
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Site Category</label>
              <select
                value={siteType}
                onChange={(e) => setSiteType(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-200 font-semibold focus:outline-hidden focus:border-cyan-500"
              >
                <option value="Home / Residential">Home / Residential</option>
                <option value="Shop / Commercial">Shop / Commercial</option>
                <option value="Company / Factory">Company / Factory</option>
                <option value="Housing Society">Housing Society</option>
                <option value="Agricultural Farm">Agricultural Farm</option>
                <option value="Other">Other</option>
              </select>
              {siteType === 'Other' && (
                <input
                  type="text"
                  value={otherSiteTypeDetail}
                  onChange={(e) => setOtherSiteTypeDetail(e.target.value)}
                  placeholder="Specify site category (e.g. Hospital, School, Temple, Warehouse...)"
                  className="mt-2 w-full text-xs px-3 py-2 bg-slate-900 border border-amber-500/60 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              )}
            </div>
          </div>

          {/* Client, Society & Location */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Client & Site Location Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Client / Owner Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Company / Society / Shop Name
                </label>
                <input
                  type="text"
                  value={companyOrSocietyName}
                  onChange={(e) => setCompanyOrSocietyName(e.target.value)}
                  placeholder="e.g. Gokul Dham Society or Soni Jewellers"
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Client Phone Number
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="e.g. 9825123456"
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Exact Site Address (Wiring Location)
                </label>
                <input
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  placeholder="e.g. Plot No. 18, Shanti Niketan Society, Motipura Road, Mehsana"
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Wiring Scope of Work & Items
            </label>
            <textarea
              rows={2}
              value={workScope}
              onChange={(e) => setWorkScope(e.target.value)}
              placeholder="e.g. PVC conduit piping, wire pulling, switchboards, MCB distribution box, earthing, lighting points..."
              className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
            />
          </div>

          {/* Workers Working on this Site */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Workers Details Working for Electrical Work on Site
              </label>
              <button
                type="button"
                onClick={() => setIsAddingOtherWorker(prev => !prev)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  isAddingOtherWorker
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-amber-400 hover:border-amber-500/40'
                }`}
              >
                <span>+ Other Worker</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {staff.map(member => {
                const isSelected = assignedWorkerNames.includes(member.name);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleWorker(member.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-xs' 
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {member.name} ({member.role}) {isSelected && '✓'}
                  </button>
                );
              })}

              {/* Custom / Other Workers Added */}
              {assignedWorkerNames
                .filter(name => !staff.some(s => s.name === name))
                .map(customName => (
                  <button
                    key={customName}
                    type="button"
                    onClick={() => toggleWorker(customName)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-500/60 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Click to remove other worker"
                  >
                    <span>Other: {customName}</span>
                    <span className="font-bold">✓</span>
                    <span className="text-amber-400/80 hover:text-amber-100 font-bold ml-0.5">×</span>
                  </button>
                ))}

              {/* Other Worker Quick Action Button */}
              <button
                type="button"
                onClick={() => setIsAddingOtherWorker(prev => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                  isAddingOtherWorker 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' 
                    : 'bg-slate-900 text-amber-400 border-dashed border-amber-500/50 hover:bg-slate-800'
                }`}
              >
                <span>+ Other</span>
              </button>
            </div>

            {/* Input field to specify other worker name or contractor role */}
            {isAddingOtherWorker && (
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={otherWorkerInput}
                  onChange={(e) => setOtherWorkerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOtherWorker();
                    }
                  }}
                  placeholder="Enter other worker or helper name (e.g. Daily Helper Raju, Subcontractor Manoj)..."
                  className="flex-1 text-xs px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddOtherWorker}
                  disabled={!otherWorkerInput.trim()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  + Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingOtherWorker(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {assignedWorkerNames.length === 0 && (
              <p className="text-[11px] text-amber-400 mt-1.5">Please select at least one worker for site deployment.</p>
            )}
          </div>

          {/* Timeline & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Completion</label>
              <input
                type="date"
                value={targetCompletionDate}
                onChange={(e) => setTargetCompletionDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Work Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-white focus:border-cyan-500 focus:outline-hidden"
              >
                <option value="In Progress">In Progress</option>
                <option value="Under Inspection">Under Inspection</option>
                <option value="Completed">Completed</option>
                <option value="Pending Approval">Pending Approval</option>
              </select>
            </div>
          </div>

          {/* Financials & Profit Calculator */}
          <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Site Financials & Profit Calculator
              </h4>
              <div className="text-xs font-bold text-emerald-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                Site Profit: <span className="text-emerald-400 font-mono text-sm">{formatCurrency(profit)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Contract / Quote Amount (₹)</label>
                <input
                  type="number"
                  value={contractAmount}
                  onChange={(e) => setContractAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Materials Cost (Wires/Pipes) (₹)</label>
                <input
                  type="number"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Worker Labour Cost (₹)</label>
                <input
                  type="number"
                  value={workerLabourCost}
                  onChange={(e) => setWorkerLabourCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-mono focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Advance Received (₹)</label>
                <input
                  type="number"
                  value={advanceReceived}
                  onChange={(e) => setAdvanceReceived(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-300 font-mono font-semibold focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Total Cost Spent on Site: <strong className="text-white">{formatCurrency(totalCost)}</strong></span>
              <span>Pending Collection: <strong className="text-rose-400 font-mono">{formatCurrency(balancePending)}</strong></span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Instructions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Society meeting balance clearance, inspection date..."
              className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Electrical Site</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
