import React, { useState, useMemo } from 'react';
import { 
  Users, 
  PlusCircle, 
  Clock, 
  DollarSign, 
  Phone, 
  UserPlus, 
  Calendar, 
  CheckCircle2, 
  Edit3, 
  Trash2,
  Briefcase,
  AlertCircle,
  X,
  Calculator,
  FileText,
  Printer,
  ChevronRight,
  Search,
  Check,
  Receipt,
  ArrowUpDown,
  History,
  TrendingUp,
  Coins,
  Eye
} from 'lucide-react';
import { StaffMember, StaffDailyAttendance, StaffMonthlyPayrollSummary } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface StaffManagerProps {
  staff: StaffMember[];
  attendanceLogs: StaffDailyAttendance[];
  onSaveStaff: (member: StaffMember) => void;
  onDeleteStaff: (staffId: string) => void;
  onSaveAttendance: (attendance: StaffDailyAttendance) => void;
  onDeleteAttendance: (attendanceId: string) => void;
}

export const StaffManager: React.FC<StaffManagerProps> = ({
  staff,
  attendanceLogs,
  onSaveStaff,
  onDeleteStaff,
  onSaveAttendance,
  onDeleteAttendance,
}) => {
  const [activeTab, setActiveTab] = useState<'payroll' | 'attendance' | 'members'>('payroll');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

  // Filter attendance date for Daily tab
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form State for Adding/Editing Staff Member
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffMember['role']>('Master Rewinder');
  const [hourlyRate, setHourlyRate] = useState<number>(150);
  const [monthlySalary, setMonthlySalary] = useState<number>(20000);
  const [dailyWage, setDailyWage] = useState<number>(750);
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Form State for Daily Timing (IN and OUT) & Daily Payment
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || '');
  const [attDate, setAttDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inTime, setInTime] = useState<string>('08:30 AM');
  const [outTime, setOutTime] = useState<string>('07:00 PM');
  const [workType, setWorkType] = useState<StaffDailyAttendance['workType']>('Workshop Motor Winding');
  const [jobOrSiteSummary, setJobOrSiteSummary] = useState<string>('');
  const [hoursWorked, setHoursWorked] = useState<number>(10);
  const [dailyWageEarned, setDailyWageEarned] = useState<number>(750);
  const [advanceOrPaymentGiven, setAdvanceOrPaymentGiven] = useState<number>(750);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI'>('Cash');
  const [attNotes, setAttNotes] = useState<string>('');

  // Payroll Calculator State
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10'); // Default to demo month October 2026
  const [payrollSearchQuery, setPayrollSearchQuery] = useState<string>('');
  const [editingRateStaffId, setEditingRateStaffId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<number>(0);
  const [viewingSlipSummary, setViewingSlipSummary] = useState<StaffMonthlyPayrollSummary | null>(null);
  const [viewingLogsSummary, setViewingLogsSummary] = useState<StaffMonthlyPayrollSummary | null>(null);

  // Available months dynamically computed from logs + presets
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    monthSet.add('2026-10');
    monthSet.add('2026-11');
    const now = new Date();
    const currStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(currStr);

    attendanceLogs.forEach(log => {
      if (log.date && log.date.length >= 7) {
        monthSet.add(log.date.substring(0, 7));
      }
    });

    return Array.from(monthSet).sort().reverse();
  }, [attendanceLogs]);

  const formatMonthName = (monthKey: string) => {
    if (monthKey === 'all') return 'All Recorded Months';
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  // Helper for default hourly rate based on skill/role
  const getDefaultHourlyRate = (staffMember: StaffMember): number => {
    if (staffMember.hourlyRate && staffMember.hourlyRate > 0) {
      return staffMember.hourlyRate;
    }
    switch (staffMember.role) {
      case 'Master Rewinder': return 150;
      case 'Lathe Craftsman': return 130;
      case 'Site Electrician': return 105;
      case 'Helper / Assembling': return 80;
      case 'Apprentice': return 70;
      default: return 100;
    }
  };

  // Monthly Payroll Calculation: sum attendance hours * stored hourly rate
  const payrollSummaries: StaffMonthlyPayrollSummary[] = useMemo(() => {
    return staff.map(member => {
      const currentHourlyRate = getDefaultHourlyRate(member);

      // Filter attendance logs for this staff member in selected month
      const matchingLogs = attendanceLogs.filter(log => {
        if (log.staffId !== member.id) return false;
        if (selectedMonth === 'all') return true;
        return log.date.startsWith(selectedMonth);
      });

      // Sum attendance hours
      const totalHoursWorked = matchingLogs.reduce((acc, log) => acc + (Number(log.hoursWorked) || 0), 0);
      const totalDaysWorked = matchingLogs.length;

      // Gross Pay = Total Hours * Stored Hourly Rate
      const grossPay = Math.round(totalHoursWorked * currentHourlyRate);

      // Total Advances or Daily payments already given in that month
      const totalAdvancePaid = matchingLogs.reduce((acc, log) => acc + (Number(log.advanceOrPaymentGiven) || 0), 0);

      // Net Payable to worker
      const netPayable = grossPay - totalAdvancePaid;

      return {
        staffId: member.id,
        staffName: member.name,
        role: member.role,
        hourlyRate: currentHourlyRate,
        totalDaysWorked,
        totalHoursWorked: Number(totalHoursWorked.toFixed(2)),
        grossPay,
        totalAdvancePaid,
        netPayable,
        attendanceRecords: matchingLogs.sort((a, b) => b.date.localeCompare(a.date))
      };
    });
  }, [staff, attendanceLogs, selectedMonth]);

  // Filtered payroll summaries based on search
  const filteredPayroll = useMemo(() => {
    if (!payrollSearchQuery.trim()) return payrollSummaries;
    const query = payrollSearchQuery.toLowerCase();
    return payrollSummaries.filter(p => 
      p.staffName.toLowerCase().includes(query) || 
      p.role.toLowerCase().includes(query)
    );
  }, [payrollSummaries, payrollSearchQuery]);

  // Aggregate stats for the selected month
  const totalPayrollHours = payrollSummaries.reduce((sum, p) => sum + p.totalHoursWorked, 0);
  const totalGrossPayroll = payrollSummaries.reduce((sum, p) => sum + p.grossPay, 0);
  const totalAdvancesPaid = payrollSummaries.reduce((sum, p) => sum + p.totalAdvancePaid, 0);
  const totalNetPayable = payrollSummaries.reduce((sum, p) => sum + p.netPayable, 0);

  // Member Modal Handlers
  const openAddMember = () => {
    setEditingMember(null);
    setName('');
    setAge(30);
    setPhone('');
    setRole('Master Rewinder');
    setHourlyRate(150);
    setMonthlySalary(20000);
    setDailyWage(750);
    setAddress('');
    setEmergencyContact('');
    setShowMemberModal(true);
  };

  const openEditMember = (m: StaffMember) => {
    setEditingMember(m);
    setName(m.name);
    setAge(m.age);
    setPhone(m.phone);
    setRole(m.role);
    setHourlyRate(getDefaultHourlyRate(m));
    setMonthlySalary(m.monthlySalary || 0);
    setDailyWage(m.dailyWage);
    setAddress(m.address || '');
    setEmergencyContact(m.emergencyContact || '');
    setShowMemberModal(true);
  };

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: StaffMember = {
      id: editingMember?.id || `stf-${Date.now()}`,
      name,
      age: Number(age || 25),
      phone,
      role,
      hourlyRate: Number(hourlyRate || 100),
      monthlySalary: Number(monthlySalary || 0),
      dailyWage: Number(dailyWage || 500),
      status: 'Active',
      joiningDate: editingMember?.joiningDate || new Date().toISOString().split('T')[0],
      address,
      emergencyContact
    };

    onSaveStaff(newMember);
    setShowMemberModal(false);
  };

  // Quick Inline Rate Save
  const handleQuickSaveRate = (staffId: string) => {
    const member = staff.find(s => s.id === staffId);
    if (member && tempRate > 0) {
      onSaveStaff({
        ...member,
        hourlyRate: tempRate
      });
    }
    setEditingRateStaffId(null);
  };

  // Attendance Modal Handlers
  const openAddAttendance = (staffId?: string) => {
    if (staff.length === 0) {
      alert('Please add your first staff member before logging daily attendance.');
      openAddMember();
      return;
    }
    const defaultStaff = staffId ? staff.find(s => s.id === staffId) : (staff[0] || null);
    if (defaultStaff) {
      setSelectedStaffId(defaultStaff.id);
      setDailyWageEarned(defaultStaff.dailyWage);
      setAdvanceOrPaymentGiven(defaultStaff.dailyWage);
    }
    setShowAttendanceModal(true);
  };

  const handleStaffChangeInAttendance = (id: string) => {
    setSelectedStaffId(id);
    const selected = staff.find(s => s.id === id);
    if (selected) {
      setDailyWageEarned(selected.dailyWage);
      setAdvanceOrPaymentGiven(selected.dailyWage);
    }
  };

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stf = staff.find(s => s.id === selectedStaffId);
    if (!stf) return;

    const balancePayable = Math.max(0, dailyWageEarned - advanceOrPaymentGiven);
    const paymentStatus: 'Paid' | 'Unpaid' = balancePayable === 0 ? 'Paid' : 'Unpaid';

    const newLog: StaffDailyAttendance = {
      id: `att-${Date.now()}`,
      date: attDate,
      staffId: stf.id,
      staffName: stf.name,
      inTime,
      outTime,
      workType,
      jobOrSiteSummary: jobOrSiteSummary || 'Motor rewinding work in workshop',
      hoursWorked: Number(hoursWorked || 8),
      dailyWageEarned: Number(dailyWageEarned || 0),
      advanceOrPaymentGiven: Number(advanceOrPaymentGiven || 0),
      balancePayable,
      paymentMode,
      paymentStatus,
      notes: attNotes
    };

    onSaveAttendance(newLog);
    setShowAttendanceModal(false);
  };

  // Filter logs for attendance tab
  const displayLogs = filterDate 
    ? attendanceLogs.filter(a => a.date === filterDate)
    : attendanceLogs;

  const totalDailyPayout = attendanceLogs.reduce((sum, a) => sum + a.advanceOrPaymentGiven, 0);
  const totalDailyWages = attendanceLogs.reduce((sum, a) => sum + a.dailyWageEarned, 0);
  const totalPendingWages = attendanceLogs.reduce((sum, a) => sum + a.balancePayable, 0);

  return (
    <div className="space-y-5 pb-12 text-slate-100">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Shree Gayatri Electricals Staff, Attendance & Payroll Management
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Staff Roster, Daily Work Hours & Monthly Payroll</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Calculate accurate monthly staff salaries by summing daily attendance hours against stored hourly rates (₹/hr) with advance tracking and salary slips.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <button
            onClick={() => openAddAttendance()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>+ Record Daily In/Out</span>
          </button>

          <button
            onClick={openAddMember}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md border border-slate-700 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>+ Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'payroll'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4 text-amber-300" />
          <span>Monthly Payroll Calculator</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-950 text-blue-200 border border-blue-400/40 font-mono">
            Hours × Rate
          </span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Daily IN/OUT & Wage Log</span>
          <span className="text-[11px] text-slate-500 font-mono">({attendanceLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'members'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Staff Directory & Hourly Rates</span>
          <span className="text-[11px] text-slate-500 font-mono">({staff.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MONTHLY PAYROLL CALCULATOR (HOURS × HOURLY RATE) */}
      {/* ======================================================== */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          
          {/* Month Selector & Filter Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">Select Payroll Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-950 text-white font-bold focus:border-blue-500 focus:outline-hidden cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthName(m)}
                  </option>
                ))}
                <option value="all">All Available Records</option>
              </select>

              <span className="text-xs text-slate-500 font-medium hidden md:inline">
                • Summing daily attendance hours × stored hourly rate
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={payrollSearchQuery}
                  onChange={(e) => setPayrollSearchQuery(e.target.value)}
                  placeholder="Filter karigar by name..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
                {payrollSearchQuery && (
                  <button 
                    onClick={() => setPayrollSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Month Payroll Financial Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Hours Worked</span>
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-2xl font-extrabold text-white block mt-1 font-mono">
                {totalPayrollHours.toFixed(1)} <span className="text-sm font-semibold text-slate-400">hrs</span>
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Logged in {formatMonthName(selectedMonth)}
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-amber-900/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Gross Calculated Wages</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-2xl font-extrabold text-amber-400 font-mono block mt-1">
                {formatCurrency(totalGrossPayroll)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Sum of (Hours Worked × Rate)
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Advances & Payouts Given</span>
                <Receipt className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-2xl font-extrabold text-slate-200 font-mono block mt-1">
                {formatCurrency(totalAdvancesPaid)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Cash/UPI advances drawn
              </span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-emerald-900/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Net Wages Balance Due</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono block mt-1">
                {formatCurrency(totalNetPayable)}
              </span>
              <span className="text-[11px] text-emerald-500/80 mt-1 block font-medium">
                Remaining to clear at month-end
              </span>
            </div>
          </div>

          {/* Detailed Monthly Payroll Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Monthly Karigar Payroll Sheet: {formatMonthName(selectedMonth)}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Each staff member's total daily attendance hours multiplied against their stored hourly rate.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Showing {filteredPayroll.length} karigars
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-3.5">Staff Karigar</th>
                    <th className="py-3 px-3.5">Designation</th>
                    <th className="py-3 px-3.5 text-center">Stored Hourly Rate</th>
                    <th className="py-3 px-3.5 text-center">Days Worked</th>
                    <th className="py-3 px-3.5 text-center">Total Attendance Hours</th>
                    <th className="py-3 px-3.5 text-right">Gross Calculated Wages</th>
                    <th className="py-3 px-3.5 text-right">Advances Received</th>
                    <th className="py-3 px-3.5 text-right">Net Payable</th>
                    <th className="py-3 px-3.5 text-center">Payment Status</th>
                    <th className="py-3 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPayroll.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                        No staff members found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredPayroll.map((summary) => {
                      const memberObj = staff.find(s => s.id === summary.staffId);
                      const isEditingRate = editingRateStaffId === summary.staffId;

                      return (
                        <tr key={summary.staffId} className="hover:bg-slate-850/60 transition-colors">
                          {/* Staff Name */}
                          <td className="py-3 px-3.5">
                            <span className="font-bold text-white block text-sm">{summary.staffName}</span>
                            <span className="text-[10px] text-slate-400">ID: {summary.staffId}</span>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60">
                              {summary.role}
                            </span>
                          </td>

                          {/* Stored Hourly Rate with Quick Inline Edit */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            {isEditingRate ? (
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number"
                                  value={tempRate}
                                  onChange={(e) => setTempRate(parseFloat(e.target.value) || 0)}
                                  className="w-18 px-1.5 py-1 text-xs border border-blue-500 rounded bg-slate-950 text-white font-mono font-bold text-center focus:outline-hidden"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleQuickSaveRate(summary.staffId)}
                                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                  title="Save Rate"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setEditingRateStaffId(null)}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingRateStaffId(summary.staffId);
                                  setTempRate(summary.hourlyRate);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-amber-300 font-mono font-bold text-xs transition-colors cursor-pointer group"
                                title="Click to edit stored hourly rate"
                              >
                                <span>₹{summary.hourlyRate}/hr</span>
                                <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                              </button>
                            )}
                          </td>

                          {/* Days Worked */}
                          <td className="py-3 px-3.5 text-center font-bold text-slate-200">
                            {summary.totalDaysWorked} <span className="text-[10px] text-slate-500 font-normal">days</span>
                          </td>

                          {/* Total Attendance Hours */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => setViewingLogsSummary(summary)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/70 hover:bg-blue-900 border border-blue-800/80 text-blue-300 font-mono font-bold cursor-pointer transition-colors"
                              title="Click to view daily hours breakdown"
                            >
                              <Clock className="w-3 h-3 text-blue-400" />
                              <span>{summary.totalHoursWorked} hrs</span>
                            </button>
                          </td>

                          {/* Gross Calculated Wages: Hours × Hourly Rate */}
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-white whitespace-nowrap">
                            <span className="block text-amber-300">{formatCurrency(summary.grossPay)}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({summary.totalHoursWorked}h × ₹{summary.hourlyRate})
                            </span>
                          </td>

                          {/* Advances Received */}
                          <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-300 whitespace-nowrap">
                            {formatCurrency(summary.totalAdvancePaid)}
                          </td>

                          {/* Net Payable */}
                          <td className="py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap">
                            {summary.netPayable > 0 ? (
                              <span className="text-emerald-400 text-sm">{formatCurrency(summary.netPayable)}</span>
                            ) : summary.netPayable === 0 ? (
                              <span className="text-slate-400 font-normal">₹0 (Cleared)</span>
                            ) : (
                              <span className="text-rose-400">Advance excess {formatCurrency(Math.abs(summary.netPayable))}</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              summary.netPayable === 0
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80'
                                : summary.netPayable > 0
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80'
                                : 'bg-rose-950/70 text-rose-300 border border-rose-800/80'
                            }`}>
                              {summary.netPayable === 0 ? 'Fully Cleared' : summary.netPayable > 0 ? 'Pending Payout' : 'Excess Advance'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setViewingSlipSummary(summary)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                                title="Generate Salary Voucher / Slip"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Pay Slip</span>
                              </button>

                              <button
                                onClick={() => setViewingLogsSummary(summary)}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                                title="View Day-by-Day Hours"
                              >
                                <Eye className="w-3.5 h-3.5" />
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

            {/* Formula Explanation Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400">Calculation Formula:</span>
                <span>Gross Wages = (Sum of Daily Working Hours Worked) × (Stored Hourly Rate in ₹/hr)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400">Net Salary:</span>
                <span>Gross Wages - Sum of Advances / Daily Payments Received</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DAILY IN/OUT TIMING & PAYMENT LOGS */}
      {/* ======================================================== */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          
          {/* Date Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-300">Filter Work Date:</span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="text-xs px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-950 text-white font-bold focus:border-blue-500 focus:outline-hidden"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-xs text-blue-400 hover:underline font-semibold ml-2 cursor-pointer"
                >
                  Show All Dates
                </button>
              )}
            </div>

            <span className="text-xs text-slate-400">
              Showing {displayLogs.length} attendance records
            </span>
          </div>

          {/* Table of Daily Work Timing IN & OUT */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Staff Name</th>
                    <th className="py-3 px-3.5">Work Timing (IN & OUT)</th>
                    <th className="py-3 px-3.5 text-center">Hours Worked</th>
                    <th className="py-3 px-3.5">Work Assigned</th>
                    <th className="py-3 px-3.5 text-right">Daily Wage Earned</th>
                    <th className="py-3 px-3.5 text-right">Staff Payment Given</th>
                    <th className="py-3 px-3.5 text-right">Balance Due</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {displayLogs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                        No daily work timings recorded for this date. Click "+ Record Daily In/Out" to add.
                      </td>
                    </tr>
                  ) : (
                    displayLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="py-3 px-3.5 font-medium text-slate-200 whitespace-nowrap">
                          {formatDate(log.date)}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-white block">{log.staffName}</span>
                          <span className="text-[10px] text-slate-400">{log.workType}</span>
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded font-bold border border-emerald-800/80">
                              IN: {log.inTime}
                            </span>
                            <span className="text-slate-500">→</span>
                            <span className="font-mono text-rose-300 bg-rose-950/70 px-1.5 py-0.5 rounded font-bold border border-rose-800/80">
                              OUT: {log.outTime}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-bold font-mono text-slate-200 text-center">
                          {log.hoursWorked} hrs
                        </td>
                        <td className="py-3 px-3.5 text-slate-300 max-w-[200px] truncate" title={log.jobOrSiteSummary}>
                          {log.jobOrSiteSummary}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-white">
                          {formatCurrency(log.dailyWageEarned)}
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-emerald-400 block">
                            {formatCurrency(log.advanceOrPaymentGiven)}
                          </span>
                          <span className="text-[10px] text-slate-500">via {log.paymentMode}</span>
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-semibold">
                          {log.balancePayable > 0 ? (
                            <span className="text-rose-400 font-bold">{formatCurrency(log.balancePayable)}</span>
                          ) : (
                            <span className="text-emerald-400 font-medium">₹0 (Cleared)</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.paymentStatus === 'Paid' 
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80' 
                              : 'bg-amber-950/70 text-amber-300 border border-amber-800/80'
                          }`}>
                            {log.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <button
                            onClick={() => onDeleteAttendance(log.id)}
                            className="p-1 rounded hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: STAFF DIRECTORY (STAFF SALARY, HOURLY RATE, AGE) */}
      {/* ======================================================== */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {staff.map((member) => {
            const hrRate = getDefaultHourlyRate(member);
            return (
              <div
                key={member.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 relative group hover:border-blue-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-white leading-tight">
                        {member.name}
                      </h3>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60 mt-1">
                        {member.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditMember(member)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        title="Edit Staff"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteStaff(member.id)}
                        className="p-1 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 cursor-pointer"
                        title="Delete Staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Hourly Rate & Staff Details */}
                  <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800 mt-2">
                    {/* Highlighted Stored Hourly Rate */}
                    <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-400 block">Stored Hourly Rate</span>
                        <span className="text-base font-extrabold text-amber-300 font-mono">₹{hrRate} / hour</span>
                      </div>
                      <Calculator className="w-4 h-4 text-amber-400" />
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Staff Age:</span>
                      <span className="font-bold text-white">{member.age} Years Old</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone Number:</span>
                      <a href={`tel:${member.phone}`} className="font-bold text-blue-400 hover:underline">
                        {member.phone}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Daily Wage Benchmark:</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(member.dailyWage)} / day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Target:</span>
                      <span className="font-mono font-bold text-emerald-400">{formatCurrency(member.monthlySalary || 0)} / mo</span>
                    </div>
                    {member.address && (
                      <div className="text-[11px] text-slate-400 pt-1 truncate">
                        Address: {member.address}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedStaffId(member.id);
                      setDailyWageEarned(member.dailyWage);
                      setAdvanceOrPaymentGiven(member.dailyWage);
                      setShowAttendanceModal(true);
                    }}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-blue-900/40 text-blue-300 border border-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Record In/Out Today</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD/EDIT STAFF MEMBER (WITH HOURLY RATE) */}
      {/* ======================================================== */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm">
                {editingMember ? 'Edit Staff & Hourly Rate Details' : 'Add New Staff Member'}
              </h3>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMemberSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">
                    Staff Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bharatbhai Mistri"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-semibold focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Staff Age (Years) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="16"
                    max="80"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                    placeholder="e.g. 46"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-bold text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Staff Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9824099881"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono font-semibold text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Role / Designation</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-white font-medium focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Master Rewinder">Master Rewinder</option>
                    <option value="Site Electrician">Site Electrician</option>
                    <option value="Helper / Assembling">Helper / Assembling</option>
                    <option value="Lathe Craftsman">Lathe Craftsman</option>
                    <option value="Apprentice">Apprentice</option>
                  </select>
                </div>

                {/* Stored Hourly Rate for Payroll Calculator */}
                <div className="bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/60">
                  <label className="block font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5" />
                    Stored Hourly Rate (₹/hour) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    step="5"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 150"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-amber-700 rounded-lg font-mono font-bold text-amber-300 focus:border-amber-400 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-amber-500/80 block mt-0.5">Used for monthly hours payroll</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Daily Wage Rate (₹)</label>
                  <input
                    type="number"
                    value={dailyWage}
                    onChange={(e) => setDailyWage(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 850"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Monthly Salary Benchmark (₹)</label>
                  <input
                    type="number"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 24000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-emerald-400 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1">Address / Residence</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Prajapati Vas, Mehsana"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1">Emergency Contact Person & Phone</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. Gaurang Mistri (Son) - 9824099882"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RECORD DAILY WORK TIMING & DAILY PAYMENT */}
      {/* ======================================================== */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm">
                  Record Daily Work Timing (IN/OUT) & Daily Payment
                </h3>
                <p className="text-[11px] text-slate-400">Shree Gayatri Electricals Attendance & Work Hour Log</p>
              </div>
              <button onClick={() => setShowAttendanceModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAttendanceSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Select Staff Member</label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => handleStaffChangeInAttendance(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-950 font-bold text-white focus:border-blue-500 focus:outline-hidden cursor-pointer"
                  >
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role} • Hourly Rate ₹{getDefaultHourlyRate(s)}/hr)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-semibold text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Total Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* WORK TIMING IN AND OUT */}
                <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/60">
                  <label className="block font-bold text-emerald-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Work Time IN (Morning)
                  </label>
                  <input
                    type="text"
                    required
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full px-2.5 py-1.5 border border-emerald-800 rounded-lg font-mono font-bold bg-slate-950 text-emerald-300 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-900/60">
                  <label className="block font-bold text-rose-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    Work Time OUT (Evening)
                  </label>
                  <input
                    type="text"
                    required
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    placeholder="e.g. 07:00 PM"
                    className="w-full px-2.5 py-1.5 border border-rose-800 rounded-lg font-mono font-bold bg-slate-950 text-rose-300 focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">Work Description / Motor / Site</label>
                  <input
                    type="text"
                    value={jobOrSiteSummary}
                    onChange={(e) => setJobOrSiteSummary(e.target.value)}
                    placeholder="e.g. 15 HP Kirloskar coil winding or Shivam Dyeing cable tray"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Daily Wage Benchmark (₹)</label>
                  <input
                    type="number"
                    value={dailyWageEarned}
                    onChange={(e) => setDailyWageEarned(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono font-bold text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* STAFF DAILY PAYMENTS */}
                <div>
                  <label className="block font-bold text-emerald-400 mb-1">
                    Staff Daily Payment / Advance Given (₹)
                  </label>
                  <input
                    type="number"
                    value={advanceOrPaymentGiven}
                    onChange={(e) => setAdvanceOrPaymentGiven(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 750"
                    className="w-full px-3 py-2 border border-emerald-800 rounded-lg font-mono font-bold text-emerald-300 bg-emerald-950/40 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-white focus:border-blue-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Cash">Cash in Hand</option>
                    <option value="UPI">UPI / PhonePe</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-1">Remaining Daily Balance</label>
                  <div className="px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 font-mono font-bold text-slate-200">
                    {formatCurrency(Math.max(0, dailyWageEarned - advanceOrPaymentGiven))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Daily Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: SALARY SLIP / VOUCHER VIEW & PRINT */}
      {/* ======================================================== */}
      {viewingSlipSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in duration-200 my-6">
            
            {/* Modal Actions Header */}
            <div className="bg-slate-950 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm">Monthly Salary Slip & Wage Voucher</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button 
                  onClick={() => setViewingSlipSummary(null)} 
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Salary Slip Canvas */}
            <div className="p-6 space-y-5 bg-slate-900 text-slate-100 print:bg-white print:text-black">
              
              {/* Slip Header */}
              <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                    Electrical Engineering & Rewinding Works
                  </span>
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    SHREE GAYATRI ELECTRICALS
                  </h2>
                  <p className="text-xs text-slate-400">
                    Proprietor: Mukeshbhai • Radhanpur Road, Mehsana, Gujarat • Ph: +91 98250 12345
                  </p>
                </div>

                <div className="text-left sm:text-right bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pay Period</span>
                  <span className="text-base font-extrabold text-blue-400 block font-mono">
                    {formatMonthName(selectedMonth)}
                  </span>
                  <span className="text-[10px] text-slate-500">Voucher: SGE-PAY-{viewingSlipSummary.staffId}-{selectedMonth}</span>
                </div>
              </div>

              {/* Staff Details Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Karigar Name</span>
                  <span className="text-sm font-bold text-white block">{viewingSlipSummary.staffName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Role / Designation</span>
                  <span className="text-sm font-semibold text-blue-300 block">{viewingSlipSummary.role}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Stored Hourly Rate</span>
                  <span className="text-sm font-bold text-amber-400 font-mono block">₹{viewingSlipSummary.hourlyRate} / hr</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Days Logged</span>
                  <span className="text-sm font-bold text-white font-mono block">{viewingSlipSummary.totalDaysWorked} Days</span>
                </div>
              </div>

              {/* Calculation Formula Summary */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Total Summed Attendance Hours:</span>
                  <span className="font-mono font-bold text-white text-sm">{viewingSlipSummary.totalHoursWorked} hrs</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Hourly Rate Applied:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">₹{viewingSlipSummary.hourlyRate}.00 / hr</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200">Gross Calculated Wages ({viewingSlipSummary.totalHoursWorked} hrs × ₹{viewingSlipSummary.hourlyRate}):</span>
                  <span className="font-mono font-extrabold text-amber-300 text-base">
                    {formatCurrency(viewingSlipSummary.grossPay)}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-rose-300">
                  <span className="text-xs">Less: Advances & Daily Payments Received:</span>
                  <span className="font-mono font-bold text-sm">
                    - {formatCurrency(viewingSlipSummary.totalAdvancePaid)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-sm font-black text-white block">Net Payable Salary Amount:</span>
                    <span className="text-[10px] text-emerald-400">Final disbursement for {formatMonthName(selectedMonth)}</span>
                  </div>
                  <span className="font-mono text-2xl font-black text-emerald-400">
                    {formatCurrency(viewingSlipSummary.netPayable)}
                  </span>
                </div>
              </div>

              {/* Itemized Day Attendance Log */}
              {viewingSlipSummary.attendanceRecords.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-300 mb-2 block">
                    Daily Punch In/Out Breakdown ({viewingSlipSummary.attendanceRecords.length} records):
                  </span>
                  <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Timing (IN → OUT)</th>
                          <th className="py-2 px-3 text-center">Hours</th>
                          <th className="py-2 px-3">Work Assigned</th>
                          <th className="py-2 px-3 text-right">Advance Received</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                        {viewingSlipSummary.attendanceRecords.map(rec => (
                          <tr key={rec.id}>
                            <td className="py-2 px-3 font-mono text-slate-300 whitespace-nowrap">{formatDate(rec.date)}</td>
                            <td className="py-2 px-3 font-mono text-slate-400 whitespace-nowrap">{rec.inTime} - {rec.outTime}</td>
                            <td className="py-2 px-3 font-mono font-bold text-white text-center">{rec.hoursWorked} hrs</td>
                            <td className="py-2 px-3 text-slate-300 max-w-[200px] truncate">{rec.jobOrSiteSummary}</td>
                            <td className="py-2 px-3 font-mono text-right text-emerald-400 font-semibold">
                              {rec.advanceOrPaymentGiven > 0 ? formatCurrency(rec.advanceOrPaymentGiven) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-800 flex justify-between items-end text-xs">
                <div className="text-center">
                  <div className="w-40 border-b border-slate-700 mb-1"></div>
                  <span className="text-slate-400 block font-medium">Employee Signature</span>
                  <span className="text-[10px] text-slate-500 font-semibold">({viewingSlipSummary.staffName})</span>
                </div>

                <div className="text-center">
                  <div className="w-40 border-b border-slate-700 mb-1"></div>
                  <span className="text-slate-400 block font-bold">Authorized Signatory</span>
                  <span className="text-[10px] text-slate-500 font-semibold">For Shree Gayatri Electricals</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingSlipSummary(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: VIEW DAILY HOURS LOG DRILLDOWN */}
      {/* ======================================================== */}
      {viewingLogsSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in duration-200">
            <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm">
                  Attendance Hours Log: {viewingLogsSummary.staffName}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {formatMonthName(selectedMonth)} • Total Hours: {viewingLogsSummary.totalHoursWorked} hrs @ ₹{viewingLogsSummary.hourlyRate}/hr
                </p>
              </div>
              <button onClick={() => setViewingLogsSummary(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Hours</span>
                  <span className="text-lg font-extrabold text-blue-400 font-mono">{viewingLogsSummary.totalHoursWorked} hrs</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Stored Rate</span>
                  <span className="text-lg font-extrabold text-amber-400 font-mono">₹{viewingLogsSummary.hourlyRate}/hr</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Gross Earned</span>
                  <span className="text-lg font-extrabold text-emerald-400 font-mono">{formatCurrency(viewingLogsSummary.grossPay)}</span>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Timing</th>
                      <th className="py-2.5 px-3 text-center">Hours</th>
                      <th className="py-2.5 px-3">Work Assigned</th>
                      <th className="py-2.5 px-3 text-right">Advance Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {viewingLogsSummary.attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                          No daily logs recorded for this month.
                        </td>
                      </tr>
                    ) : (
                      viewingLogsSummary.attendanceRecords.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-medium text-slate-200 whitespace-nowrap">{formatDate(log.date)}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {log.inTime} - {log.outTime}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-white text-center">{log.hoursWorked} hrs</td>
                          <td className="py-2.5 px-3 text-slate-300 max-w-[180px] truncate" title={log.jobOrSiteSummary}>
                            {log.jobOrSiteSummary}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-right text-emerald-400">
                            {log.advanceOrPaymentGiven > 0 ? formatCurrency(log.advanceOrPaymentGiven) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => {
                    setViewingSlipSummary(viewingLogsSummary);
                    setViewingLogsSummary(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Generate Salary Slip</span>
                </button>
                <button
                  onClick={() => setViewingLogsSummary(null)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
