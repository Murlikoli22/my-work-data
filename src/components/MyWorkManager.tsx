import React, { useState } from 'react';
import { 
  Briefcase, 
  PlusCircle, 
  Clock, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  X, 
  Edit3, 
  Trash2, 
  Share2,
  FileCheck
} from 'lucide-react';
import { MyWorkCompanyLog, WorkshopSettings } from '../types';
import { formatCurrency, formatDate, generateWhatsAppLink } from '../utils/formatters';

interface MyWorkManagerProps {
  logs: MyWorkCompanyLog[];
  onSaveLog: (log: MyWorkCompanyLog) => void;
  onDeleteLog: (logId: string) => void;
  settings: WorkshopSettings;
}

export const MyWorkManager: React.FC<MyWorkManagerProps> = ({
  logs,
  onSaveLog,
  onDeleteLog,
  settings,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState<MyWorkCompanyLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inTime, setInTime] = useState('09:00 AM');
  const [outTime, setOutTime] = useState('06:00 PM');
  const [workType, setWorkType] = useState<MyWorkCompanyLog['workType']>('Panel Maintenance & HT/LT Work');
  const [workDescription, setWorkDescription] = useState('');
  const [hoursSpent, setHoursSpent] = useState<number>(8);
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [serviceCharge, setServiceCharge] = useState<number>(3500);
  const [paymentStatus, setPaymentStatus] = useState<'Received' | 'Pending'>('Received');
  const [gatePassNo, setGatePassNo] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingLog(null);
    setCompanyName('');
    setCompanyLocation('');
    setDate(new Date().toISOString().split('T')[0]);
    setInTime('09:00 AM');
    setOutTime('06:00 PM');
    setWorkType('Panel Maintenance & HT/LT Work');
    setWorkDescription('');
    setHoursSpent(8);
    setContactPerson('');
    setContactPhone('');
    setServiceCharge(3500);
    setPaymentStatus('Received');
    setGatePassNo('');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (item: MyWorkCompanyLog) => {
    setEditingLog(item);
    setCompanyName(item.companyName);
    setCompanyLocation(item.companyLocation);
    setDate(item.date);
    setInTime(item.inTime);
    setOutTime(item.outTime);
    setWorkType(item.workType);
    setWorkDescription(item.workDescription);
    setHoursSpent(item.hoursSpent);
    setContactPerson(item.contactPerson || '');
    setContactPhone(item.contactPhone || '');
    setServiceCharge(item.serviceCharge);
    setPaymentStatus(item.paymentStatus);
    setGatePassNo(item.gatePassNo || '');
    setNotes(item.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !workDescription.trim()) {
      alert('Please enter company name and work description.');
      return;
    }

    const newLog: MyWorkCompanyLog = {
      id: editingLog?.id || `mw-${Date.now()}`,
      date,
      companyName,
      companyLocation,
      inTime,
      outTime,
      workType,
      workDescription,
      hoursSpent: Number(hoursSpent || 8),
      contactPerson: contactPerson || undefined,
      contactPhone: contactPhone || undefined,
      serviceCharge: Number(serviceCharge || 0),
      paymentStatus,
      gatePassNo: gatePassNo || undefined,
      notes: notes || undefined
    };

    onSaveLog(newLog);
    setShowModal(false);
  };

  const filteredLogs = logs.filter(l => 
    l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.companyLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.workDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.contactPerson && l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalEarned = logs.filter(l => l.paymentStatus === 'Received').reduce((sum, l) => sum + l.serviceCharge, 0);
  const totalPending = logs.filter(l => l.paymentStatus === 'Pending').reduce((sum, l) => sum + l.serviceCharge, 0);
  const totalHours = logs.reduce((sum, l) => sum + l.hoursSpent, 0);

  return (
    <div className="space-y-5 pb-12 text-slate-100">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-1.5">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            Proprietor Industrial Logbook
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            My Work (Industrial Company Service Log)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-2xl">
            Record what I worked in companies, which company, where is company, and work time IN & OUT with service charges.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/50 transition-all hover:scale-[1.02] self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Log Company Work Today</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Company Visits</span>
          <span className="text-2xl font-extrabold text-white block mt-1">{logs.length} Site Visits</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Industrial maintenance & emergency</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Industrial Hours</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono block mt-1">
            {totalHours.toFixed(1)} hrs
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">On-site technical time</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-emerald-900/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">Service Charges Received</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono block mt-1">
            {formatCurrency(totalEarned)}
          </span>
          <span className="text-[11px] text-emerald-500/80 mt-1 block font-medium">Cash & Bank cleared</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-rose-900/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">Pending Company Bills</span>
          <span className="text-2xl font-extrabold text-rose-400 font-mono block mt-1">
            {formatCurrency(totalPending)}
          </span>
          <span className="text-[11px] text-rose-500/80 mt-1 block font-medium">Credit invoices to collect</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by company name, location, or work description..."
          className="w-full text-xs px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-hidden"
        />
      </div>

      {/* Company Logs List */}
      <div className="space-y-3.5">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-slate-900 rounded-2xl border border-slate-800">
            No company work logs found. Click "+ Log Company Work Today" to create one.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const message = `Namaste ${log.contactPerson || log.companyName} ji,\nWork completed by Mukeshbhai Koli (Shree Gayatri electricals) at *${log.companyName}* on ${formatDate(log.date)}.\nWork: ${log.workDescription}\nTiming: IN ${log.inTime} - OUT ${log.outTime}\nService Charge: *₹${log.serviceCharge}* (${log.paymentStatus}).`;
            const whatsappUrl = log.contactPhone ? generateWhatsAppLink(log.contactPhone, message) : '';

            return (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 transition-all"
              >
                {/* Header: Company, Location, Date & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-white">
                        {log.companyName}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                        {log.workType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <strong className="text-slate-400">Where:</strong> {log.companyLocation}
                      </span>
                      <span>•</span>
                      <span>{formatDate(log.date)}</span>
                      {log.gatePassNo && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-400">Gate Pass: {log.gatePassNo}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Work Time IN and OUT Badge */}
                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-white px-3 py-1.5 rounded-xl font-mono text-xs font-bold shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-emerald-400">IN: {log.inTime}</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-rose-400">OUT: {log.outTime}</span>
                      <span className="text-slate-400 text-[10px] ml-1">({log.hoursSpent}h)</span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      log.paymentStatus === 'Received'
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80'
                        : 'bg-rose-950/70 text-rose-300 border border-rose-800/80'
                    }`}>
                      {log.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* What I worked in company (Work Description) */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">What I Worked in this Company:</strong>
                  {log.workDescription}
                </div>

                {/* Bottom row: Contact & Charges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-1 border-t border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    {log.contactPerson && (
                      <span>Contact: <strong className="text-slate-200">{log.contactPerson}</strong></span>
                    )}
                    {log.contactPhone && (
                      <span>({log.contactPhone})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="font-bold text-white font-mono text-sm">
                      Service Charge: {formatCurrency(log.serviceCharge)}
                    </div>

                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 transition-colors"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => openEditModal(log)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteLog(log.id)}
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

      {/* MODAL: LOG COMPANY WORK */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-2xl my-auto overflow-hidden animate-in fade-in duration-200">
            <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm">
                  {editingLog ? 'Edit Company Work Log' : 'Log What I Worked in Company'}
                </h3>
                <p className="text-[11px] text-slate-400">Company Name, Where is Company, Work Time IN and OUT</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Which Company */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Which Company <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Shivam Dyeing & Chemicals Pvt Ltd"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                {/* Where is Company */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Where is Company (Location / Address) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    placeholder="e.g. Plot No. 88/B, GIDC Phase-II, Mehsana"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Date of Work</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-semibold text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Type of Work</label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-white focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="Panel Maintenance & HT/LT Work">Panel Maintenance & HT/LT Work</option>
                    <option value="Industrial Motor Testing & Commissioning">Industrial Motor Testing & Commissioning</option>
                    <option value="Emergency Breakdown Service">Emergency Breakdown Service</option>
                    <option value="Machine Control Wiring">Machine Control Wiring</option>
                    <option value="DG Set / Generator Sync">DG Set / Generator Sync</option>
                    <option value="Substation & Transformer Overhaul">Substation & Transformer Overhaul</option>
                    <option value="Plant Lighting & Cable Laying">Plant Lighting & Cable Laying</option>
                  </select>
                </div>

                {/* Work Time IN */}
                <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/60">
                  <label className="block font-bold text-emerald-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Work Time IN <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    placeholder="e.g. 08:45 AM"
                    className="w-full px-2.5 py-1.5 border border-emerald-800 rounded-lg font-mono font-bold bg-slate-950 text-emerald-300 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Work Time OUT */}
                <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-900/60">
                  <label className="block font-bold text-rose-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    Work Time OUT <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    placeholder="e.g. 05:30 PM"
                    className="w-full px-2.5 py-1.5 border border-rose-800 rounded-lg font-mono font-bold bg-slate-950 text-rose-300 focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Total Hours Spent</label>
                  <input
                    type="number"
                    step="0.25"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(parseFloat(e.target.value) || 0)}
                    placeholder="8.5"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Plant Gate Pass No.</label>
                  <input
                    type="text"
                    value={gatePassNo}
                    onChange={(e) => setGatePassNo(e.target.value)}
                    placeholder="e.g. GP-2026-991"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                {/* Contact Person & Phone */}
                <div>
                  <label className="block text-slate-400 mb-1">Company Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Dinesh Shah (Plant Head)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 9898456123"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                {/* Financials */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Service Charges (₹)</label>
                  <input
                    type="number"
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
                    placeholder="3500"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-white font-bold focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="Received">Received / Cleared</option>
                    <option value="Pending">Pending Bill</option>
                  </select>
                </div>
              </div>

              {/* Exact What I worked */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  What I Worked in this Company (Detailed Description) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="e.g. Cleaned 400A ACB contacts, checked busbar thermography, replaced CT on R-phase, tested earth resistance..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold cursor-pointer"
                >
                  Save Company Work Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
