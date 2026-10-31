import React, { useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Trash2,
  Share2
} from 'lucide-react';
import { ElectricalSiteWork, WorkshopSettings } from '../types';
import { formatCurrency, formatDate, generateWhatsAppLink } from '../utils/formatters';

interface ElectricalSitesListProps {
  sites: ElectricalSiteWork[];
  onNewSiteClick: () => void;
  onEditSite: (site: ElectricalSiteWork) => void;
  onDeleteSite: (siteId: string) => void;
  settings: WorkshopSettings;
}

export const ElectricalSitesList: React.FC<ElectricalSitesListProps> = ({
  sites,
  onNewSiteClick,
  onEditSite,
  onDeleteSite,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const filteredSites = sites.filter(site => {
    const matchesSearch = 
      site.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.companyOrSocietyName && site.companyOrSocietyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      site.siteAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All' ? true : site.siteType === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalContract = filteredSites.reduce((sum, s) => sum + s.contractAmount, 0);
  const totalCost = filteredSites.reduce((sum, s) => sum + s.totalCost, 0);
  const totalProfit = filteredSites.reduce((sum, s) => sum + s.profit, 0);
  const totalPending = filteredSites.reduce((sum, s) => sum + s.balancePending, 0);

  return (
    <div className="space-y-5 pb-12 text-slate-100">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Electrical Contracting Division
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Electrical Site Work & Wiring Projects
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Wiring in Homes, Shops, Companies, Housing Societies; site workers deployment, materials spent and site profits.
          </p>
        </div>

        <button
          onClick={onNewSiteClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-950/50 transition-all hover:scale-[1.02] self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add New Electrical Site</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Site Contracts</span>
          <span className="text-xl sm:text-2xl font-extrabold text-white font-mono block mt-1">
            {formatCurrency(totalContract)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">From {filteredSites.length} sites</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Spent (Materials + Labor)</span>
          <span className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono block mt-1">
            {formatCurrency(totalCost)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Wire, pipes, worker wages</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-emerald-900/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">Net Site Profit</span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono block mt-1">
            {formatCurrency(totalProfit)}
          </span>
          <span className="text-[11px] text-emerald-500/80 mt-1 block font-medium">Billed minus Spent</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-rose-900/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">Pending Balance to Collect</span>
          <span className="text-xl sm:text-2xl font-extrabold text-rose-400 font-mono block mt-1">
            {formatCurrency(totalPending)}
          </span>
          <span className="text-[11px] text-rose-500/80 mt-1 block font-medium">Khata / Udhaari</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client, title, society, address..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-400 font-medium">Category:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-950 font-semibold text-slate-200 focus:outline-hidden focus:border-cyan-500"
          >
            <option value="All">All Sites</option>
            <option value="Home / Residential">Home / Residential</option>
            <option value="Shop / Commercial">Shop / Commercial</option>
            <option value="Company / Factory">Company / Factory</option>
            <option value="Housing Society">Housing Society</option>
            <option value="Agricultural Farm">Agricultural Farm</option>
            <option value="Other">Other Category</option>
          </select>
        </div>
      </div>

      {/* Sites Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSites.length === 0 ? (
          <div className="md:col-span-2 py-12 text-center text-slate-400 text-xs bg-slate-900 rounded-2xl border border-slate-800">
            No electrical site works found matching criteria.
          </div>
        ) : (
          filteredSites.map((site) => {
            const message = `Namaste ${site.clientName} ji,\nUpdate on your electrical wiring project (*${site.title}*) by Shree Gayatri electricals.\nStatus: *${site.status}*\nTotal Contract: ₹${site.contractAmount}\nAdvance Received: ₹${site.advanceReceived}\nBalance Pending: *₹${site.balancePending}*.\nFor inquiry contact: ${settings.phone}.`;
            const whatsappUrl = generateWhatsAppLink(site.clientPhone, message);

            return (
              <div
                key={site.id}
                className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-sm space-y-4 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                        {site.projectCode}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        • {site.siteType === 'Other' && site.otherSiteTypeDetail ? site.otherSiteTypeDetail : site.siteType}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base mt-1 group-hover:text-cyan-300 transition-colors">
                      {site.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="font-semibold text-slate-200">{site.clientName}</span>
                      {site.companyOrSocietyName && (
                        <span>({site.companyOrSocietyName})</span>
                      )}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    site.status === 'Completed' ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800' :
                    site.status === 'In Progress' ? 'bg-blue-950/70 text-blue-300 border border-blue-800' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {site.status}
                  </span>
                </div>

                {/* Address & Scope */}
                <div className="text-xs space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span>{site.siteAddress}</span>
                  </div>
                  <div className="text-slate-300 font-medium pt-1 line-clamp-2">
                    Scope: {site.workScope}
                  </div>
                </div>

                {/* Workers Working on this Site */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    Workers on Site:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {site.assignedWorkerNames.map(w => (
                      <span key={w} className="px-2 py-0.5 rounded-md bg-cyan-950/50 text-cyan-300 border border-cyan-800/60 text-xs font-medium">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Financials & Profit */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contract</span>
                    <span className="font-bold text-white font-mono">{formatCurrency(site.contractAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cost (Mat+Lab)</span>
                    <span className="font-semibold text-amber-400 font-mono">{formatCurrency(site.totalCost)}</span>
                  </div>
                  <div className="bg-emerald-950/60 border border-emerald-900/60 rounded-lg p-1">
                    <span className="text-emerald-400 font-bold block text-[10px]">Profit I Got</span>
                    <span className="font-extrabold text-emerald-300 font-mono">{formatCurrency(site.profit)}</span>
                  </div>
                </div>

                {/* Bottom Row with Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    {site.balancePending > 0 ? (
                      <span className="text-rose-400 font-bold font-mono">
                        Due: {formatCurrency(site.balancePending)}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">
                        Fully Cleared
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 transition-colors"
                      title="WhatsApp Client"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => onEditSite(site)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                      title="Edit Site"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSite(site.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
