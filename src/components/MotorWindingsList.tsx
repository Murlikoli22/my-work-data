import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  PlusCircle, 
  Eye, 
  Edit3, 
  FileText, 
  Share2, 
  Coins, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Trash2,
  Sparkles,
  BookOpen,
  Calculator,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MotorJob, WorkshopSettings, TechnicalWindingDatabaseEntry } from '../types';
import { formatCurrency, formatDate, getStatusColor, generateWhatsAppLink } from '../utils/formatters';
import { TechnicalTools } from './TechnicalTools';

interface MotorWindingsListProps {
  jobs: MotorJob[];
  onSelectJob: (job: MotorJob) => void;
  onEditJob: (job: MotorJob) => void;
  onDeleteJob: (jobId: string) => void;
  onNewJobClick: () => void;
  onGenerateDoc: (job: MotorJob, docType: 'invoice' | 'challan' | 'bill') => void;
  settings: WorkshopSettings;
  windingDb?: TechnicalWindingDatabaseEntry[];
  onAddWindingEntry?: (entry: TechnicalWindingDatabaseEntry) => void;
  onDeleteWindingEntry?: (id: string) => void;
  initialSubView?: 'jobs' | 'technical';
}

export const MotorWindingsList: React.FC<MotorWindingsListProps> = ({
  jobs,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onNewJobClick,
  onGenerateDoc,
  settings,
  windingDb = [],
  onAddWindingEntry = () => {},
  onDeleteWindingEntry = () => {},
  initialSubView = 'jobs',
}) => {
  const [subView, setSubView] = useState<'jobs' | 'technical'>(initialSubView);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [phaseFilter, setPhaseFilter] = useState<string>('All');

  // Filtered jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.companyName && job.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.motorSpec.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${job.motorSpec.hp} HP`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.motorSpec.windingSpecs.wireGaugeSWG.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'All' ? true :
      statusFilter === 'Active' ? job.status !== 'Delivered' :
      statusFilter === 'Pending Payment' ? job.billing.balanceDue > 0 :
      job.status === statusFilter;

    const matchesPhase = 
      phaseFilter === 'All' ? true :
      job.motorSpec.phase.includes(phaseFilter);

    return matchesSearch && matchesStatus && matchesPhase;
  });

  // Summary figures
  const totalBilled = filteredJobs.reduce((sum, j) => sum + (j.billing.finalBillAmount || 0), 0);
  const totalSpent = filteredJobs.reduce((sum, j) => sum + (j.costBreakdown.totalCost || 0), 0);
  const totalProfit = filteredJobs.reduce((sum, j) => sum + (j.billing.profit || 0), 0);
  const totalRemainingDue = filteredJobs.reduce((sum, j) => sum + (j.billing.balanceDue || 0), 0);

  return (
    <div className="space-y-5 pb-12">
      
      {/* Consolidated Motor Windings Sub-Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl p-1 bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSubView('jobs')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                subView === 'jobs'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Workshop Jobs & Work Orders</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                subView === 'jobs' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {jobs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSubView('technical')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                subView === 'technical'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Winding Data Bank & Calculators</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                subView === 'technical' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {windingDb.length}
              </span>
            </button>
          </div>
        </div>

        {/* Action buttons on the right */}
        <div className="flex items-center gap-2 flex-wrap">
          {subView === 'jobs' ? (
            <>

              <button
                onClick={onNewJobClick}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add New Motor Job</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setSubView('jobs')}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>← Back to Active Motor Jobs ({jobs.filter(j => j.status !== 'Delivered').length} in shop)</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: WORKSHOP JOB CARDS */}
      {subView === 'jobs' && (
        <div className="space-y-5">
          {/* Top Banner & Quick Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Motor Rewinding Division</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Motor Windings & Technical Data Cards
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Track client details, motor models, turns, gauge, total coils, star/delta connections, and spent costs vs client payments to calculate your exact profit.
              </p>
            </div>
          </div>

      {/* 4 Financial Metric Cards for Filtered Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Client Billing</span>
          <span className="text-xl sm:text-2xl font-extrabold text-white font-mono block mt-1">
            {formatCurrency(totalBilled)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">From {filteredJobs.length} motor jobs</span>
        </div>

        <div className="bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Spent on Motors (Cost)</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-300 font-mono block mt-1">
            {formatCurrency(totalSpent)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Copper wire, paper, bearings, lathe</span>
        </div>

        <div className="bg-emerald-950/30 p-3.5 sm:p-4 rounded-xl border border-emerald-800/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">Total Profit I Got</span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono block mt-1">
            {formatCurrency(totalProfit)}
          </span>
          <span className="text-[11px] text-emerald-300/80 mt-1 block font-medium">Billed minus Spent</span>
        </div>

        <div className="bg-rose-950/30 p-3.5 sm:p-4 rounded-xl border border-rose-800/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">Pending Payment (Khata)</span>
          <span className="text-xl sm:text-2xl font-extrabold text-rose-400 font-mono block mt-1">
            {formatCurrency(totalRemainingDue)}
          </span>
          <span className="text-[11px] text-rose-300/80 mt-1 block font-medium">To collect after completion</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Job #, Client Name, Company, HP (e.g. 7.5 HP), SWG Gauge..."
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 border border-slate-700 rounded-xl bg-slate-950 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Filter selectors */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-700 rounded-lg px-2.5 py-2 bg-slate-950 font-medium text-slate-200 cursor-pointer"
            >
              <option value="All">All Stages</option>
              <option value="Active">All Active In Shop</option>
              <option value="Received">Received</option>
              <option value="Coil Rewinding">Coil Rewinding</option>
              <option value="Varnishing & Baking">Varnishing & Baking</option>
              <option value="Assembly & Testing">Assembly & Testing</option>
              <option value="Ready for Delivery">Ready for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Pending Payment">Pending Payment Due</option>
            </select>

            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="border border-slate-700 rounded-lg px-2.5 py-2 bg-slate-950 font-medium text-slate-200 cursor-pointer"
            >
              <option value="All">All Phases</option>
              <option value="Three Phase">Three Phase (3Φ)</option>
              <option value="Single Phase">Single Phase (1Φ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Motors Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-3.5">Job Card</th>
                <th className="py-3 px-3.5">Whos Motor (Client & Company)</th>
                <th className="py-3 px-3.5">Motor Model</th>
                <th className="py-3 px-3.5">Turns & Gauge</th>
                <th className="py-3 px-3.5">Coils & Connection</th>
                <th className="py-3 px-3.5 text-right">Spent on Motor</th>
                <th className="py-3 px-3.5 text-right">Client Bill & Profit</th>
                <th className="py-3 px-3.5 text-right">Advance & Due</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 text-xs">
                    No motor winding jobs found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const statusStyle = getStatusColor(job.status);
                  const { windingSpecs } = job.motorSpec;
                  const { costBreakdown, billing } = job;
                  const profit = billing.profit || (billing.finalBillAmount - costBreakdown.totalCost);

                  const message = `Namaste ${job.clientName} ji,\nYour motor (${job.motorSpec.hp} HP ${job.motorSpec.brand}) status: *${job.status}* at Shree Gayatri electricals.\nBill: ₹${billing.totalPayable}, Balance Due: *₹${billing.balanceDue}*.\nJob No: ${job.jobNumber}.`;
                  const whatsappUrl = generateWhatsAppLink(job.clientPhone, message);

                  return (
                    <tr 
                      key={job.id}
                      onClick={() => onSelectJob(job)}
                      className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    >
                      {/* Job Number & Date */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-amber-400 block">{job.jobNumber}</span>
                        <span className="text-[10px] text-slate-500">{formatDate(job.receivedDate)}</span>
                      </td>

                      {/* Client details */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-white">{job.clientName}</div>
                        {job.companyName && (
                          <div className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                            {job.companyName}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                          {job.clientAddress}
                        </div>
                      </td>

                      {/* Motor Model Details */}
                      <td className="py-3 px-3.5">
                        <span className="font-bold text-slate-200">{job.motorSpec.hp} HP {job.motorSpec.brand}</span>
                        <div className="text-[11px] text-slate-400">
                          {job.motorSpec.phase.includes('Three') ? '3-Phase' : '1-Phase'} • {job.motorSpec.rpm} RPM
                        </div>
                      </td>

                      {/* Coil Turns & Gauge */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="text-slate-300 font-medium">
                          Turns: <span className="font-mono font-bold text-white">{windingSpecs.turnsPerCoil}</span>
                        </div>
                        <div className="text-amber-300 text-[11px]">
                          Gauge: <span className="font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded">{windingSpecs.wireGaugeSWG}</span>
                        </div>
                      </td>

                      {/* Total Coils & Connection */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="text-slate-300">
                          Total Coils: <span className="font-mono font-bold text-white">{windingSpecs.totalCoils || '-'}</span>
                        </div>
                        <div className="text-[11px]">
                          Conn: <span className="font-semibold text-slate-200">{windingSpecs.connection}</span>
                        </div>
                      </td>

                      {/* Spent on Motor */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-300 block">
                          {formatCurrency(costBreakdown.totalCost)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {costBreakdown.copperWeightKg} kg copper
                        </span>
                      </td>

                      {/* Client Billed & Exact Profit I Got */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-white block">
                          {formatCurrency(billing.finalBillAmount)}
                        </span>
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono">
                          Profit: {formatCurrency(profit)}
                        </span>
                      </td>

                      {/* Advance Paid & Due */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="text-[11px] text-slate-400">
                          Adv: <span className="font-mono font-medium text-slate-300">{formatCurrency(billing.advancePaid)}</span>
                        </div>
                        {billing.balanceDue > 0 ? (
                          <span className="text-[11px] font-bold text-rose-400 font-mono block">
                            Due: {formatCurrency(billing.balanceDue)}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-400 block">
                            Paid Full
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] border font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {job.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectJob(job)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            title="View Full Job Card"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditJob(job)}
                            className="p-1 rounded bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                            title="Edit Job Card"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 transition-colors cursor-pointer"
                            title="WhatsApp Client"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => onGenerateDoc(job, 'challan')}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
                            title="Delivery Challan"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteJob(job.id)}
                            className="p-1 rounded hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete"
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

      {/* Quick link banner to Technical Winding Data Bank */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Factory Technical Winding Specifications & SWG Calculators</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Looking for original factory turns, coil pitch, wire gauge, or need to calculate equivalent parallel wires? Access our {windingDb.length} verified motor recipes and engineering tools.
            </p>
          </div>
        </div>
        <button
          onClick={() => setSubView('technical')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <span>Open Winding Data Bank</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  )}

  {/* VIEW 2: TECHNICAL WINDING DATA BANK & WIRE CALCULATORS */}
  {subView === 'technical' && (
    <div className="space-y-5">
      <TechnicalTools
        database={windingDb}
        onAddEntry={onAddWindingEntry}
        onDeleteEntry={onDeleteWindingEntry}
      />
    </div>
  )}

</div>
  );
};
