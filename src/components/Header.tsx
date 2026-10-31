import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Zap, 
  PlusCircle, 
  FileText, 
  Users, 
  Wrench, 
  BookOpen, 
  Settings, 
  LayoutDashboard,
  Briefcase,
  Building2,
  Clock,
  Phone,
  Search,
  X,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { WorkshopSettings, MotorJob, ElectricalSiteWork } from '../types';
import { formatCurrency, getStatusColor } from '../utils/formatters';

export type ActiveTab = 
  | 'dashboard' 
  | 'motors' 
  | 'electrical-sites' 
  | 'staff' 
  | 'my-work' 
  | 'documents' 
  | 'technical' 
  | 'settings';

interface HeaderProps {
  settings: WorkshopSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewMotorClick: () => void;
  onNewSiteClick: () => void;
  activeMotorsCount: number;
  activeSitesCount: number;
  readyForPickupCount: number;
  motorJobs?: MotorJob[];
  electricalSites?: ElectricalSiteWork[];
  onSelectMotorJob?: (job: MotorJob) => void;
  onSelectSite?: (site: ElectricalSiteWork) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  setActiveTab,
  onNewMotorClick,
  onNewSiteClick,
  activeMotorsCount,
  activeSitesCount,
  readyForPickupCount,
  motorJobs = [],
  electricalSites = [],
  onSelectMotorJob,
  onSelectSite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcuts: "/" or "Ctrl+K" / "Cmd+K" to focus search, "Escape" to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live filter results
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchingMotors = useMemo(() => {
    if (!trimmedQuery) return [];
    return motorJobs.filter(job => {
      const clientName = job.clientName?.toLowerCase() || '';
      const companyName = job.companyName?.toLowerCase() || '';
      const jobNumber = job.jobNumber?.toLowerCase() || '';
      const serialNumber = (job.serialNumber || job.motorSpec?.serialNumber || '').toLowerCase();
      const modelNumber = (job.motorSpec?.modelNumber || '').toLowerCase();
      const brand = (job.motorSpec?.brand || '').toLowerCase();
      const application = (job.motorSpec?.application || '').toLowerCase();
      const phone = (job.clientPhone || '').toLowerCase();
      const status = (job.status || '').toLowerCase();

      return (
        clientName.includes(trimmedQuery) ||
        companyName.includes(trimmedQuery) ||
        serialNumber.includes(trimmedQuery) ||
        jobNumber.includes(trimmedQuery) ||
        modelNumber.includes(trimmedQuery) ||
        brand.includes(trimmedQuery) ||
        application.includes(trimmedQuery) ||
        phone.includes(trimmedQuery) ||
        status.includes(trimmedQuery)
      );
    });
  }, [motorJobs, trimmedQuery]);

  const matchingSites = useMemo(() => {
    if (!trimmedQuery) return [];
    return electricalSites.filter(site => {
      const clientName = site.clientName?.toLowerCase() || '';
      const companyOrSociety = site.companyOrSocietyName?.toLowerCase() || '';
      const projectCode = site.projectCode?.toLowerCase() || '';
      const title = site.title?.toLowerCase() || '';
      const address = site.siteAddress?.toLowerCase() || '';
      const phone = site.clientPhone?.toLowerCase() || '';
      const siteType = site.siteType?.toLowerCase() || '';
      const status = site.status?.toLowerCase() || '';

      return (
        clientName.includes(trimmedQuery) ||
        companyOrSociety.includes(trimmedQuery) ||
        projectCode.includes(trimmedQuery) ||
        title.includes(trimmedQuery) ||
        address.includes(trimmedQuery) ||
        phone.includes(trimmedQuery) ||
        siteType.includes(trimmedQuery) ||
        status.includes(trimmedQuery)
      );
    });
  }, [electricalSites, trimmedQuery]);

  const totalResults = matchingMotors.length + matchingSites.length;

  const handleSelectMotor = (job: MotorJob) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (onSelectMotorJob) {
      onSelectMotorJob(job);
    } else {
      setActiveTab('motors');
    }
  };

  const handleSelectSiteResult = (site: ElectricalSiteWork) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (onSelectSite) {
      onSelectSite(site);
    } else {
      setActiveTab('electrical-sites');
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md no-print">
      {/* Top Banner with Workshop Identity & Search */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Logo & Brand Details */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center shadow-md shadow-amber-950/40 border border-slate-700/60 flex-shrink-0 bg-slate-950">
              <img 
                src="/assets/aistudio/image_d8d9f2b3.png" 
                alt="Shree Gayatri electricals logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white capitalize leading-tight">
                  {settings.shopName}
                </h1>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                <span>Proprietor: <strong className="text-slate-200">{settings.proprietor}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Phone className="w-3 h-3 text-amber-400" />
                  {settings.phone}
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="hidden sm:inline text-slate-400">{settings.city}, {settings.state}</span>
              </p>
            </div>
          </div>

          {/* Global Search Bar in Header */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xl w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className={`w-4 h-4 transition-colors ${isSearchOpen || searchQuery ? 'text-amber-400' : 'text-slate-400'}`} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="Search jobs & sites by client name, serial #, job card..."
                className="w-full pl-9 pr-16 py-1.5 sm:py-2 text-xs bg-slate-950/90 hover:bg-slate-950 border border-slate-700/80 hover:border-slate-600 focus:border-amber-500 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800/80 border border-slate-700 rounded shadow-xs">
                    <span className="text-xs">/</span>
                  </kbd>
                )}
              </div>
            </div>

            {/* Live Search Results Dropdown */}
            {isSearchOpen && trimmedQuery.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-left max-h-[75vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
                
                {/* Search Meta Summary Header */}
                <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    Results for &ldquo;<span className="text-amber-400 font-semibold">{searchQuery}</span>&rdquo;
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {matchingMotors.length} Motors
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {matchingSites.length} Sites
                    </span>
                  </div>
                </div>

                {/* Results List */}
                <div className="overflow-y-auto divide-y divide-slate-800/80">
                  
                  {/* Motor Jobs Category */}
                  {matchingMotors.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Motor Winding Jobs ({matchingMotors.length})</span>
                      </div>
                      {matchingMotors.map(job => {
                        const statusColor = getStatusColor(job.status);
                        const serial = job.serialNumber || job.motorSpec?.serialNumber || job.motorSpec?.modelNumber;
                        return (
                          <div
                            key={job.id}
                            onClick={() => handleSelectMotor(job)}
                            className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-colors border border-transparent hover:border-amber-500/30 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400 font-bold text-xs mt-0.5">
                                  {job.motorSpec?.hp || '—'}HP
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                      {job.clientName}
                                    </span>
                                    {job.companyName && (
                                      <span className="text-[11px] text-slate-400 font-normal truncate max-w-[200px]">
                                        ({job.companyName})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400 mt-0.5">
                                    <span className="font-mono text-slate-300 font-semibold bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                                      {job.jobNumber}
                                    </span>
                                    {serial && (
                                      <span className="font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-900/60">
                                        SN: {serial}
                                      </span>
                                    )}
                                    <span>•</span>
                                    <span>{job.motorSpec?.brand}</span>
                                    <span>•</span>
                                    <span className="truncate max-w-[140px]">{job.motorSpec?.application}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}>
                                  {job.status}
                                </span>
                                {job.billing?.balanceDue > 0 && (
                                  <span className="text-[10px] text-rose-400 font-medium font-mono">
                                    Due: {formatCurrency(job.billing.balanceDue)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Electrical Sites Category */}
                  {matchingSites.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Electrical Site Projects ({matchingSites.length})</span>
                      </div>
                      {matchingSites.map(site => (
                        <div
                          key={site.id}
                          onClick={() => handleSelectSiteResult(site)}
                          className="p-2.5 rounded-xl hover:bg-slate-800/90 cursor-pointer transition-colors border border-transparent hover:border-cyan-500/30 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-400 mt-0.5">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                                    {site.clientName}
                                  </span>
                                  {site.companyOrSocietyName && (
                                    <span className="text-[11px] text-slate-400 font-normal truncate max-w-[200px]">
                                      ({site.companyOrSocietyName})
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400 mt-0.5">
                                  <span className="font-mono text-cyan-300 font-semibold bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                                    {site.projectCode}
                                  </span>
                                  <span>•</span>
                                  <span className="text-slate-300 font-medium truncate max-w-[200px]">{site.title}</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[140px] text-slate-500">{site.siteAddress}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                site.status === 'Completed' 
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                  : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
                              }`}>
                                {site.status}
                              </span>
                              {site.balancePending > 0 && (
                                <span className="text-[10px] text-rose-400 font-medium font-mono">
                                  Pending: {formatCurrency(site.balancePending)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty state when no results */}
                  {totalResults === 0 && (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                        <Search className="w-5 h-5 text-slate-500" />
                      </div>
                      <h4 className="text-xs font-bold text-white">No jobs or site projects found</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        No matches found for &ldquo;<span className="text-slate-200 font-medium">{searchQuery}</span>&rdquo;. Try searching by client name, motor serial number (e.g. SN-CG-98421), job card (e.g. SGE-2026-101), or phone number.
                      </p>
                    </div>
                  )}
                </div>

                {/* Dropdown Footer Tip */}
                <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Tip: Click any result to view full job card or project immediately</span>
                  <span>ESC to close</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto flex-shrink-0">
            {readyForPickupCount > 0 && (
              <button 
                onClick={() => setActiveTab('motors')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 transition-colors cursor-pointer"
                title="Motors finished and ready for customer pickup"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{readyForPickupCount} Ready Pickup</span>
              </button>
            )}

            <button
              onClick={onNewMotorClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Motor Winding</span>
            </button>

            <button
              onClick={onNewSiteClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>+ Electrical Site</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1.5 scrollbar-none text-xs font-medium">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('motors')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'motors'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Motor Windings</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold border border-slate-700">
              {activeMotorsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('electrical-sites')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'electrical-sites'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Electrical Site Work</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-400 text-[10px] font-bold border border-slate-700">
              {activeSitesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff & Daily In/Out</span>
          </button>

          <button
            onClick={() => setActiveTab('my-work')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'my-work'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>My Work (Companies)</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Invoices, Challans & Bills</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ml-auto cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings & Backup</span>
          </button>

        </nav>
      </div>
    </header>
  );
};
