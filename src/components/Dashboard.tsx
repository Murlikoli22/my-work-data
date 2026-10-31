import React, { useState } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  PlusCircle, 
  FileText, 
  Share2, 
  Eye, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Gauge, 
  DollarSign, 
  Building2, 
  Calendar, 
  PieChart, 
  Percent, 
  Coins, 
  CheckCheck 
} from 'lucide-react';
import { 
  MotorJob, 
  ElectricalSiteWork, 
  Client, 
  WorkshopExpense, 
  StaffDailyAttendance, 
  WorkshopSettings, 
  JobStatus 
} from '../types';
import { formatCurrency, formatDate, getStatusColor, generateWhatsAppLink } from '../utils/formatters';

interface DashboardProps {
  jobs: MotorJob[];
  sites?: ElectricalSiteWork[];
  clients: Client[];
  expenses: WorkshopExpense[];
  staffLogs: StaffDailyAttendance[];
  settings: WorkshopSettings;
  onSelectJob: (job: MotorJob) => void;
  onNewJobClick: () => void;
  onViewDocuments: (job: MotorJob, docType: 'invoice' | 'challan') => void;
  onFilterStatus: (status: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  jobs,
  sites = [],
  clients,
  expenses,
  staffLogs,
  settings,
  onSelectJob,
  onNewJobClick,
  onViewDocuments,
  onFilterStatus,
}) => {
  // Month selector for the Monthly Performance section: 'current', 'previous', 'all'
  const [selectedMonth, setSelectedMonth] = useState<'current' | 'previous' | 'all'>('current');

  // Basic workshop counts
  const activeJobs = jobs.filter(j => j.status !== 'Delivered');
  const readyJobs = jobs.filter(j => j.status === 'Ready for Delivery');
  const rewindingJobs = jobs.filter(j => j.status === 'Coil Rewinding' || j.status === 'Connection & Taping');
  const bakingTestingJobs = jobs.filter(j => j.status === 'Varnishing & Baking' || j.status === 'Assembly & Testing');

  // Khata / Outstanding
  const totalReceivableBalance = jobs.reduce((sum, j) => sum + (j.billing.balanceDue || 0), 0);
  const totalBilledValue = jobs.reduce((sum, j) => sum + (j.billing.finalBillAmount || 0), 0);
  const totalCollectedValue = jobs.reduce((sum, j) => sum + (j.billing.amountPaid || 0), 0);

  // Month date filter helper
  const isDateInMonth = (dateStr?: string, monthType: 'current' | 'previous' | 'all' = 'current') => {
    if (monthType === 'all') return true;
    if (!dateStr) return false;
    const yearMonth = dateStr.slice(0, 7); // e.g. "2026-10"
    if (monthType === 'current') return yearMonth === '2026-10';
    if (monthType === 'previous') return yearMonth === '2026-09';
    return true;
  };

  // Completed motor jobs and electrical sites
  const completedMotors = jobs.filter(j => 
    (j.status === 'Delivered' || j.status === 'Ready for Delivery') &&
    isDateInMonth(j.deliveredDate || j.receivedDate, selectedMonth)
  );

  const completedSites = sites.filter(s => 
    s.status === 'Completed' &&
    isDateInMonth(s.actualCompletionDate || s.startDate, selectedMonth)
  );

  const periodExpenses = expenses.filter(e => isDateInMonth(e.date, selectedMonth));
  const totalPeriodOverhead = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 1. Motor Windings Division Totals
  const motorRevenue = completedMotors.reduce((sum, j) => sum + (j.billing.finalBillAmount - j.billing.discount), 0);
  const motorExpenses = completedMotors.reduce((sum, j) => sum + j.costBreakdown.totalCost, 0);
  const motorProfit = Math.round(motorRevenue - motorExpenses);
  const motorProfitMargin = motorRevenue > 0 ? Math.round((motorProfit / motorRevenue) * 100) : 0;

  // 2. Electrical Sites Division Totals
  const siteRevenue = completedSites.reduce((sum, s) => sum + s.contractAmount, 0);
  const siteExpenses = completedSites.reduce((sum, s) => sum + s.totalCost, 0);
  const siteProfit = Math.round(siteRevenue - siteExpenses);
  const siteProfitMargin = siteRevenue > 0 ? Math.round((siteProfit / siteRevenue) * 100) : 0;

  // 3. Combined Business Figures
  const totalCombinedRevenue = motorRevenue + siteRevenue;
  const totalDirectCosts = motorExpenses + siteExpenses;
  const totalCombinedExpenses = totalDirectCosts + totalPeriodOverhead;
  const totalCombinedProfit = Math.round(totalCombinedRevenue - totalCombinedExpenses);
  const overallProfitMargin = totalCombinedRevenue > 0 
    ? Math.round((totalCombinedProfit / totalCombinedRevenue) * 100) 
    : 0;

  const pipelineStages: { label: JobStatus; count: number; icon: React.ReactNode }[] = [
    { label: 'Received', count: jobs.filter(j => j.status === 'Received').length, icon: <Clock className="w-3.5 h-3.5 text-blue-400" /> },
    { label: 'Dismantling & Inspection', count: jobs.filter(j => j.status === 'Dismantling & Inspection').length, icon: <Gauge className="w-3.5 h-3.5 text-cyan-400" /> },
    { label: 'Stripped & Core Cleaned', count: jobs.filter(j => j.status === 'Stripped & Core Cleaned').length, icon: <Wrench className="w-3.5 h-3.5 text-indigo-400" /> },
    { label: 'Coil Rewinding', count: rewindingJobs.length, icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
    { label: 'Varnishing & Baking', count: bakingTestingJobs.length, icon: <Flame className="w-3.5 h-3.5 text-purple-400" /> },
    { label: 'Ready for Delivery', count: readyJobs.length, icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Workshop Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800 border border-slate-800 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Workshop Live Operations
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white capitalize">
            {settings.shopName} — Workshop Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Currently tracking <strong className="text-white">{activeJobs.length} active motors</strong> in shop,{' '}
            <strong className="text-emerald-400">{readyJobs.length} motors tested & ready</strong> for pickup, and{' '}
            <strong className="text-amber-400">{formatCurrency(totalReceivableBalance)}</strong> in pending customer khata.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid - 2 Executive Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Workshop Motors (In Shop & Ready) */}
        <div 
          onClick={() => onFilterStatus('Active')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Motors in Workshop</span>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 my-1">
            <div>
              <span className="text-xs text-slate-400 block font-medium">In Repair</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white">{activeJobs.length}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">motors in shop</span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-xs text-emerald-400 block font-medium">Ready for Pickup</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{readyJobs.length}</span>
              <span className="text-[11px] text-emerald-300/80 block mt-0.5">tested & ready</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Rewinding: <strong className="text-slate-200">{rewindingJobs.length}</strong></span>
            <span>Baking/Testing: <strong className="text-slate-200">{bakingTestingJobs.length}</strong></span>
          </div>
        </div>

        {/* Merged Card 2 & 3: Billing, Collected Revenue & Pending Khata */}
        <div 
          onClick={() => onFilterStatus('Pending')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Billing & Collections</span>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 my-1">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Collected (Cash & UPI)</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {formatCurrency(totalCollectedValue)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Billed: <strong className="text-slate-200">{formatCurrency(totalBilledValue)}</strong>
              </span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-xs text-rose-400 block font-medium">Khata (Pending Due)</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
                {formatCurrency(totalReceivableBalance)}
              </span>
              <span className="text-[11px] text-rose-300/80 block mt-0.5">
                From {jobs.filter(j => j.billing.balanceDue > 0).length} jobs
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">Realized Margin ~35%</span>
            <span className="font-semibold text-rose-400 group-hover:underline">Manage Khata →</span>
          </div>
        </div>
      </div>

      {/* MONTHLY REVENUE, EXPENSES & PROFIT MARGINS SUMMARY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
        
        {/* Section Header with Timeframe Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Monthly Performance & Profitability Summary
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Consolidated financial report from completed motor winding jobs and electrical contracting sites.
            </p>
          </div>

          {/* Timeframe Switcher Tabs */}
          <div className="inline-flex rounded-xl p-1 bg-slate-950 border border-slate-800 text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedMonth('current')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedMonth === 'current'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Current (Oct 2026)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMonth('previous')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedMonth === 'previous'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Sep 2026</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMonth('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedMonth === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>All Time</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Gross Revenue */}
          <div className="bg-slate-950 border border-slate-800 text-white rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Monthly Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {formatCurrency(totalCombinedRevenue)}
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
              <span>Motors: <strong className="text-slate-200">{formatCurrency(motorRevenue)}</strong></span>
              <span>Sites: <strong className="text-slate-200">{formatCurrency(siteRevenue)}</strong></span>
            </div>
          </div>

          {/* KPI 2: Total Expenses */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Expenses & Costs</span>
              <Coins className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-300 font-mono">
              {formatCurrency(totalCombinedExpenses)}
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
              <span>Jobs Cost: <strong className="text-slate-200">{formatCurrency(totalDirectCosts)}</strong></span>
              <span>Overheads: <strong className="text-slate-200">{formatCurrency(totalPeriodOverhead)}</strong></span>
            </div>
          </div>

          {/* KPI 3: Net Profit Realized */}
          <div className={`rounded-xl p-4 shadow-xs space-y-2 border ${
            totalCombinedProfit >= 0
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-100'
              : 'bg-rose-950/40 border-rose-800/80 text-rose-100'
          }`}>
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Net Realized Profit</span>
              <CheckCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {formatCurrency(totalCombinedProfit)}
            </div>
            <div className="text-[11px] text-emerald-300/80 font-medium pt-1 border-t border-emerald-900/60 flex justify-between">
              <span>Motor Div: <strong className="text-emerald-200">{formatCurrency(motorProfit)}</strong></span>
              <span>Site Div: <strong className="text-emerald-200">{formatCurrency(siteProfit)}</strong></span>
            </div>
          </div>

          {/* KPI 4: Profit Margin % */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Overall Profit Margin</span>
              <Percent className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {overallProfitMargin}%
              </span>
              <span className="text-xs font-semibold text-slate-400">
                return on billing
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, overallProfitMargin))}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* 2 Columns: Division-by-Division Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          
          {/* Division A: Completed Motor Windings */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Motor Windings Division</h4>
                  <span className="text-[11px] text-slate-400">{completedMotors.length} completed & delivered motors</span>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {motorProfitMargin}% Margin
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Revenue</span>
                <span className="font-bold text-white font-mono">{formatCurrency(motorRevenue)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Spent Costs</span>
                <span className="font-semibold text-slate-300 font-mono">{formatCurrency(motorExpenses)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Division Profit</span>
                <span className="font-bold text-emerald-400 font-mono">{formatCurrency(motorProfit)}</span>
              </div>
            </div>

            {/* List of recent completed motors */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Completed Motors in Period:
              </span>
              {completedMotors.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No completed motors in this timeframe.</p>
              ) : (
                completedMotors.map(m => {
                  const jobProfit = m.billing.profit || (m.billing.finalBillAmount - m.costBreakdown.totalCost);
                  return (
                    <div 
                      key={m.id}
                      onClick={() => onSelectJob(m)}
                      className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-xs hover:border-amber-500/50 cursor-pointer transition-all"
                    >
                      <div>
                        <span className="font-bold text-white">{m.motorSpec.hp} HP {m.motorSpec.brand}</span>
                        <span className="text-slate-400 text-[11px] ml-1.5">• {m.clientName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-white mr-2">{formatCurrency(m.billing.finalBillAmount)}</span>
                        <span className="font-mono text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/80 text-[10px]">
                          + {formatCurrency(jobProfit)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Division B: Completed Electrical Sites */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Electrical Contracting Sites</h4>
                  <span className="text-[11px] text-slate-400">{completedSites.length} completed wiring contracts</span>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                {siteProfitMargin}% Margin
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Contracts</span>
                <span className="font-bold text-white font-mono">{formatCurrency(siteRevenue)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Site Expenses</span>
                <span className="font-semibold text-slate-300 font-mono">{formatCurrency(siteExpenses)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Division Profit</span>
                <span className="font-bold text-emerald-400 font-mono">{formatCurrency(siteProfit)}</span>
              </div>
            </div>

            {/* List of recent completed sites */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Completed Sites in Period:
              </span>
              {completedSites.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No completed electrical sites in this timeframe.</p>
              ) : (
                completedSites.map(s => (
                  <div 
                    key={s.id}
                    className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{s.title}</span>
                      <div className="text-[11px] text-slate-400">{s.clientName} • {s.siteType}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white mr-2">{formatCurrency(s.contractAmount)}</span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/80 text-[10px]">
                        + {formatCurrency(s.profit)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Motor Repair Workflow Status Funnel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-500" />
            Motor Repair Pipeline Stages
          </h3>
          <span className="text-xs text-slate-500">Click stage to filter list</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {pipelineStages.map((stage) => (
            <button
              key={stage.label}
              onClick={() => onFilterStatus(stage.label)}
              className="p-3 rounded-xl border border-slate-800 hover:border-amber-500/50 bg-slate-950/70 hover:bg-amber-950/20 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                {stage.icon}
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 group-hover:border-amber-400/50">
                  {stage.count}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-amber-400">
                {stage.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Section: Ready for Pickup vs Active Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Urgent Ready for Delivery / Pickup Alert */}
        <div className="lg:col-span-1 bg-slate-900 border border-emerald-800/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="text-base font-bold text-white">
                Ready for Pickup ({readyJobs.length})
              </h3>
            </div>
            <span className="text-xs font-medium text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Tested & Baked
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Notify customers directly on WhatsApp with invoice balance details for speedy pickup and khata payment.
          </p>

          {readyJobs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs bg-slate-950 rounded-xl border border-dashed border-slate-800">
              No motors currently waiting in ready rack.
            </div>
          ) : (
            <div className="space-y-3">
              {readyJobs.map((job) => {
                const message = `Namaste ${job.clientName} ji, Your motor (${job.motorSpec.hp} HP ${job.motorSpec.brand} ${job.motorSpec.application}) is fully rewound, tested and READY FOR PICKUP at Shree Gayatri electricals. Total payable: ₹${job.billing.totalPayable}, Balance Due: ₹${job.billing.balanceDue}. Job No: ${job.jobNumber}. Workshop address: ${settings.address}, ${settings.city}. Contact: ${settings.phone}.`;
                const whatsappUrl = generateWhatsAppLink(job.clientPhone, message);

                return (
                  <div 
                    key={job.id}
                    className="p-3.5 rounded-xl border border-emerald-900/60 bg-emerald-950/20 hover:bg-emerald-950/40 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-400">{job.jobNumber}</span>
                        <h4 className="text-sm font-bold text-white leading-snug">{job.clientName}</h4>
                        <p className="text-xs text-slate-400">{job.motorSpec.hp} HP {job.motorSpec.brand} • {job.motorSpec.phase}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-400 block font-mono">
                          Due: {formatCurrency(job.billing.balanceDue)}
                        </span>
                        <span className="text-[11px] text-slate-400">Total: {formatCurrency(job.billing.totalPayable)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-emerald-900/40">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Send WhatsApp</span>
                      </a>
                      <button
                        onClick={() => onViewDocuments(job, 'challan')}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                        title="Print Delivery Challan"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Challan</span>
                      </button>
                      <button
                        onClick={() => onSelectJob(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="View Job Card"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Active In-Progress Motors Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Current Active Jobs</h3>
              <p className="text-xs text-slate-400">Motors being serviced on workshop benches</p>
            </div>
            <button
              onClick={() => onFilterStatus('Active')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({activeJobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/60 font-semibold">
                  <th className="py-2.5 px-3">Job #</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Motor Specs</th>
                  <th className="py-2.5 px-3">Stage / Status</th>
                  <th className="py-2.5 px-3">Assigned To</th>
                  <th className="py-2.5 px-3 text-right">Bill / Due</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {activeJobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      No active motors in shop currently. Click <button onClick={onNewJobClick} className="text-amber-400 font-bold hover:underline cursor-pointer">+ New Motor</button> to add your first motor.
                    </td>
                  </tr>
                ) : (
                  activeJobs.slice(0, 6).map((job) => {
                  const statusStyle = getStatusColor(job.status);
                  return (
                    <tr 
                      key={job.id} 
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectJob(job)}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {job.jobNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{job.clientName}</div>
                        {job.companyName && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                            {job.companyName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-200">{job.motorSpec.hp} HP {job.motorSpec.brand}</span>
                        <div className="text-[11px] text-slate-400">{job.motorSpec.phase} • {job.motorSpec.rpm} RPM</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] border font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {job.assignedStaffName || <span className="text-slate-500 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="font-semibold text-white block font-mono">
                          {formatCurrency(job.billing.finalBillAmount)}
                        </span>
                        {job.billing.balanceDue > 0 ? (
                          <span className="text-[10px] text-rose-400 font-semibold font-mono">
                            Due: {formatCurrency(job.billing.balanceDue)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            Full Paid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectJob(job)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            title="Open Job Card"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onViewDocuments(job, 'invoice')}
                            className="p-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer"
                            title="Invoice & Bill"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Workshop Security & Quality Commitment Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>
            <strong className="text-slate-200">Shree Gayatri electricals Guarantee:</strong> 100% Electrolytic Grade-1 Copper Wires, Nomex Class F/H slot insulation, and genuine SKF/NBC bearings on every overhaul.
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 whitespace-nowrap font-medium">
          <span>Total Serviced Motors: <strong className="text-white">{jobs.length}</strong></span>
          <span>Registered Clients: <strong className="text-white">{clients.length}</strong></span>
        </div>
      </div>

    </div>
  );
};
