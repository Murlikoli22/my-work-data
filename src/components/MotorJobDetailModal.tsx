import React from 'react';
import { 
  X, 
  Wrench, 
  Coins, 
  FileText, 
  Share2, 
  Clock, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  User, 
  Zap, 
  Edit3,
  Calendar,
  Building,
  DollarSign
} from 'lucide-react';
import { MotorJob, WorkshopSettings } from '../types';
import { formatCurrency, formatDate, getStatusColor, generateWhatsAppLink } from '../utils/formatters';

interface MotorJobDetailModalProps {
  job: MotorJob | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (job: MotorJob) => void;
  onStatusChange: (jobId: string, newStatus: MotorJob['status']) => void;
  onGenerateDocument: (job: MotorJob, docType: 'invoice' | 'challan' | 'bill') => void;
  settings: WorkshopSettings;
}

export const MotorJobDetailModal: React.FC<MotorJobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  onGenerateDocument,
  settings,
}) => {
  if (!isOpen || !job) return null;

  const statusStyle = getStatusColor(job.status);
  const { windingSpecs } = job.motorSpec;
  const { costBreakdown, billing } = job;

  // WhatsApp share link for client
  const message = `Namaste ${job.clientName} ji,\nUpdate regarding your motor (${job.motorSpec.hp} HP ${job.motorSpec.brand} ${job.motorSpec.application}) at Shree Gayatri electricals.\nStatus: *${job.status}*\nJob No: *${job.jobNumber}*\nTotal Bill: ₹${billing.totalPayable}\nAdvance Paid: ₹${billing.advancePaid}\nBalance Due: *₹${billing.balanceDue}*\nFor inquiry contact: ${settings.phone}.`;
  const whatsappUrl = generateWhatsAppLink(job.clientPhone, message);

  const statusOptions: MotorJob['status'][] = [
    'Received',
    'Dismantling & Inspection',
    'Stripped & Core Cleaned',
    'Coil Rewinding',
    'Connection & Taping',
    'Varnishing & Baking',
    'Assembly & Testing',
    'Ready for Delivery',
    'Delivered'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-4xl my-auto overflow-hidden animate-in fade-in duration-200">
        
        {/* Header with Job Number & Status */}
        <div className="bg-slate-950 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400">{job.jobNumber}</span>
                <span className="text-slate-500">•</span>
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {job.motorSpec.hp} HP {job.motorSpec.brand}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                {job.clientName} {job.companyName ? `• ${job.companyName}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              {job.status}
            </span>
            <button
              onClick={() => {
                onClose();
                onEdit(job);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
              title="Edit Job Card"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5">
          
          {/* Quick Actions Row */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Change Status:</span>
              <select
                value={job.status}
                onChange={(e) => onStatusChange(job.id, e.target.value as any)}
                className="text-xs font-semibold border border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-900 text-white cursor-pointer"
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp Client</span>
              </a>

              <button
                onClick={() => onGenerateDocument(job, 'challan')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Delivery Challan</span>
              </button>

              <button
                onClick={() => onGenerateDocument(job, 'invoice')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tax Invoice / Bill</span>
              </button>
            </div>
          </div>

          {/* Motor Profit Highlight Box */}
          <div className="bg-gradient-to-r from-amber-950/20 via-emerald-950/30 to-emerald-950/20 border border-emerald-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                Motor Cost & Profit Breakdown
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {formatCurrency(billing.profit || (billing.finalBillAmount - costBreakdown.totalCost))}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                  Profit I Got
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Client Paid/Billed: <strong className="text-slate-200">{formatCurrency(billing.finalBillAmount - billing.discount)}</strong> &minus; Total Spent on Motor: <strong className="text-slate-200">{formatCurrency(costBreakdown.totalCost)}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-right">
              <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Advance Paid</span>
                <span className="text-xs font-bold text-white font-mono">
                  {formatCurrency(billing.advancePaid)}
                </span>
              </div>
              <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-rose-900/60">
                <span className="text-[10px] text-rose-400 block font-semibold">Payment Remaining</span>
                <span className="text-xs font-bold text-rose-400 font-mono">
                  {formatCurrency(billing.balanceDue)}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Client & Company Info */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                Whos Motor (Client Details)
              </h4>
              <div className="text-xs space-y-1.5">
                <div>
                  <span className="text-slate-500 block text-[11px]">Client Name:</span>
                  <span className="font-bold text-white text-sm">{job.clientName}</span>
                </div>
                {job.companyName && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Company / Farm:</span>
                    <span className="font-medium text-slate-300">{job.companyName}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block text-[11px]">Phone:</span>
                  <a href={`tel:${job.clientPhone}`} className="font-semibold text-blue-400 hover:underline">
                    {job.clientPhone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Address:</span>
                  <span className="text-slate-300">{job.clientAddress || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Motor Model Details */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                Motor Model Details
              </h4>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Make / Brand:</span>
                  <span className="font-bold text-white">{job.motorSpec.brand}</span>
                </div>
                {(job.serialNumber || job.motorSpec.serialNumber) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Serial Number:</span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">{job.serialNumber || job.motorSpec.serialNumber}</span>
                  </div>
                )}
                {job.motorSpec.modelNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Model / Frame:</span>
                    <span className="font-medium text-slate-300">{job.motorSpec.modelNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Rating:</span>
                  <span className="font-bold text-white">{job.motorSpec.hp} HP ({job.motorSpec.kw} kW)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phase & Volts:</span>
                  <span className="font-medium text-slate-300">{job.motorSpec.phase} • {job.motorSpec.voltage}V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">RPM / Poles:</span>
                  <span className="font-medium text-slate-300">{job.motorSpec.rpm} RPM ({job.motorSpec.poles}P)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Application:</span>
                  <span className="font-medium text-slate-300 truncate max-w-[150px]">{job.motorSpec.application}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Karigar:</span>
                  <span className="font-semibold text-amber-400">{job.assignedStaffName || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Exact Winding Specs */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Coil & Winding Specs
              </h4>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Coil Turns:</span>
                  <span className="font-mono font-bold text-white">{windingSpecs.turnsPerCoil}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wire Gauge (SWG):</span>
                  <span className="font-mono font-bold text-amber-400">{windingSpecs.wireGaugeSWG}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Coils:</span>
                  <span className="font-mono font-bold text-white">{windingSpecs.totalCoils || '-'} coils</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stator Slots:</span>
                  <span className="font-mono font-semibold text-slate-200">{windingSpecs.slotCount} Slots</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Connection:</span>
                  <span className="font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {windingSpecs.connection}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Copper Wire Weight:</span>
                  <span className="font-bold text-amber-400">{windingSpecs.copperWeightKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bearings:</span>
                  <span className="font-mono text-[11px] text-slate-300">{windingSpecs.bearingFront} / {windingSpecs.bearingRear}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Cost Spent on Motor Breakdown Table */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              Detailed Workshop Expenses Spent on this Motor
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Copper Wire ({costBreakdown.copperWeightKg} kg @ ₹{costBreakdown.copperRatePerKg}):</span>
                <span className="font-bold text-white font-mono">{formatCurrency(costBreakdown.copperCost)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Insulation Nomex Paper:</span>
                <span className="font-bold text-white font-mono">{formatCurrency(costBreakdown.insulationPaperCost)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Varnish & Baking:</span>
                <span className="font-bold text-white font-mono">{formatCurrency(costBreakdown.varnishCost)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Bearings & Seals:</span>
                <span className="font-bold text-white font-mono">{formatCurrency(costBreakdown.bearingsCost + costBreakdown.bushOrOilSealCost)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Lathe / Machining:</span>
                <span className="font-bold text-white font-mono">{formatCurrency(costBreakdown.latheMachiningCost)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Capacitor & Spares:</span>
                <span className="font-bold text-white font-mono">{formatCurrency(costBreakdown.capacitorCost + costBreakdown.otherMaterialsCost)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Karigar Labour Charge:</span>
                <span className="font-bold text-white font-mono">{formatCurrency(costBreakdown.labourWindingCost)}</span>
              </div>
              <div className="bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/60">
                <span className="text-amber-400 font-bold block text-[11px]">TOTAL SPENT ON MOTOR:</span>
                <span className="font-extrabold text-amber-300 font-mono text-sm">{formatCurrency(costBreakdown.totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Fault Reported & Technician Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-300 block mb-1">Fault Reported:</span>
              <p className="text-slate-400">{job.faultReported}</p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-300 block mb-1">Technician Notes & Test Results:</span>
              <p className="text-slate-400">{job.technicianNotes || 'Standard overhaul and varnishing done. Tested on no-load.'}</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Received Date: {formatDate(job.receivedDate)} • Target Delivery: {formatDate(job.expectedDeliveryDate)}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Card
          </button>
        </div>

      </div>
    </div>
  );
};
