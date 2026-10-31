import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  Calculator, 
  Coins, 
  Sparkles, 
  Zap, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { MotorJob, Client, StaffMember, TechnicalWindingDatabaseEntry, WorkshopSettings, MotorPhase } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MotorJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: MotorJob) => void;
  clients: Client[];
  staff: StaffMember[];
  windingDb: TechnicalWindingDatabaseEntry[];
  settings: WorkshopSettings;
  existingJob?: MotorJob | null;
}

export const MotorJobModal: React.FC<MotorJobModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  staff,
  windingDb,
  settings,
  existingJob,
}) => {
  if (!isOpen) return null;

  // Active step in modal
  const [activeStep, setActiveStep] = useState<'client_motor' | 'technical_winding' | 'cost_profit'>('client_motor');

  // Client Details
  const [selectedClientId, setSelectedClientId] = useState<string>(existingJob?.clientId || '');
  const [clientName, setClientName] = useState<string>(existingJob?.clientName || '');
  const [companyName, setCompanyName] = useState<string>(existingJob?.companyName || '');
  const [clientPhone, setClientPhone] = useState<string>(existingJob?.clientPhone || '');
  const [clientEmail, setClientEmail] = useState<string>(existingJob?.clientEmail || '');
  const [clientAddress, setClientAddress] = useState<string>(existingJob?.clientAddress || '');

  // Motor General Specs
  const standardRpms = [2880, 1440, 960, 720];
  const [brand, setBrand] = useState<string>(existingJob?.motorSpec.brand || 'Crompton Greaves');
  const [modelNumber, setModelNumber] = useState<string>(existingJob?.motorSpec.modelNumber || '');
  const [serialNumber, setSerialNumber] = useState<string>(existingJob?.serialNumber || existingJob?.motorSpec.serialNumber || '');
  const [hp, setHp] = useState<number>(existingJob?.motorSpec.hp || 5);
  const [kw, setKw] = useState<number>(existingJob?.motorSpec.kw || 3.7);
  const [phase, setPhase] = useState<MotorPhase>(existingJob?.motorSpec.phase || 'Three Phase (3Φ)');
  const [otherPhaseDetail, setOtherPhaseDetail] = useState<string>(existingJob?.motorSpec.otherPhaseDetail || '');
  const [rpm, setRpm] = useState<number>(existingJob?.motorSpec.rpm || 1440);
  const [isCustomRpm, setIsCustomRpm] = useState<boolean>(
    existingJob?.motorSpec.rpm ? !standardRpms.includes(existingJob.motorSpec.rpm) : false
  );
  const [poles, setPoles] = useState<number>(existingJob?.motorSpec.poles || 4);
  const [voltage, setVoltage] = useState<number>(existingJob?.motorSpec.voltage || 415);
  const [application, setApplication] = useState<string>(existingJob?.motorSpec.application || 'Submersible Borewell Pump Motor');
  const [faultReported, setFaultReported] = useState<string>(existingJob?.faultReported || 'Burnt winding due to single phasing & dry run');
  const [assignedStaffId, setAssignedStaffId] = useState<string>(existingJob?.assignedStaffId || (staff[0]?.id || ''));

  // Technical Motor Winding Specs
  const [slotCount, setSlotCount] = useState<number>(existingJob?.motorSpec.windingSpecs.slotCount || 36);
  const [totalCoils, setTotalCoils] = useState<number>(existingJob?.motorSpec.windingSpecs.totalCoils || 18);
  const [coilPitch, setCoilPitch] = useState<string>(existingJob?.motorSpec.windingSpecs.coilPitch || '1-8, 1-10, 1-12');
  const [turnsPerCoil, setTurnsPerCoil] = useState<string>(existingJob?.motorSpec.windingSpecs.turnsPerCoil || '36, 38, 40 Turns');
  const [wireGaugeSWG, setWireGaugeSWG] = useState<string>(existingJob?.motorSpec.windingSpecs.wireGaugeSWG || '21 SWG');
  const [copperWeightKg, setCopperWeightKg] = useState<number>(existingJob?.motorSpec.windingSpecs.copperWeightKg || 4.5);
  const [connection, setConnection] = useState<'Star (Y)' | 'Delta (Δ)' | 'Series Star' | 'Parallel Star' | 'Star-Delta' | 'Other'>(
    existingJob?.motorSpec.windingSpecs.connection || 'Delta (Δ)'
  );
  const [otherConnectionDetail, setOtherConnectionDetail] = useState<string>(existingJob?.motorSpec.windingSpecs.otherConnectionDetail || '');
  const [bearingFront, setBearingFront] = useState<string>(existingJob?.motorSpec.windingSpecs.bearingFront || '6208 ZZ');
  const [bearingRear, setBearingRear] = useState<string>(existingJob?.motorSpec.windingSpecs.bearingRear || '6207 2RS');
  const [runCapacitorMfd, setRunCapacitorMfd] = useState<string>(existingJob?.motorSpec.windingSpecs.runCapacitorMfd || '');
  const [noLoadAmps, setNoLoadAmps] = useState<number>(existingJob?.motorSpec.windingSpecs.noLoadAmps || 3.8);
  const [fullLoadAmps, setFullLoadAmps] = useState<number>(existingJob?.motorSpec.windingSpecs.fullLoadAmps || 10.5);

  // Cost Spent on Motor Calculator
  const [copperRatePerKg, setCopperRatePerKg] = useState<number>(existingJob?.costBreakdown.copperRatePerKg || settings.copperDefaultRatePerKg);
  const [insulationPaperCost, setInsulationPaperCost] = useState<number>(existingJob?.costBreakdown.insulationPaperCost || 250);
  const [varnishCost, setVarnishCost] = useState<number>(existingJob?.costBreakdown.varnishCost || 200);
  const [bearingsCost, setBearingsCost] = useState<number>(existingJob?.costBreakdown.bearingsCost || 650);
  const [bushOrOilSealCost, setBushOrOilSealCost] = useState<number>(existingJob?.costBreakdown.bushOrOilSealCost || 100);
  const [capacitorCost, setCapacitorCost] = useState<number>(existingJob?.costBreakdown.capacitorCost || 0);
  const [latheMachiningCost, setLatheMachiningCost] = useState<number>(existingJob?.costBreakdown.latheMachiningCost || 200);
  const [otherMaterialsCost, setOtherMaterialsCost] = useState<number>(existingJob?.costBreakdown.otherMaterialsCost || 100);
  const [labourWindingCost, setLabourWindingCost] = useState<number>(existingJob?.costBreakdown.labourWindingCost || 850);

  // Billing to Client & Advance
  const [quoteAmount, setQuoteAmount] = useState<number>(existingJob?.billing.quoteAmount || 8500);
  const [finalBillAmount, setFinalBillAmount] = useState<number>(existingJob?.billing.finalBillAmount || 8500);
  const [discount, setDiscount] = useState<number>(existingJob?.billing.discount || 0);
  const [advancePaid, setAdvancePaid] = useState<number>(existingJob?.billing.advancePaid || 3000);
  const [amountPaid, setAmountPaid] = useState<number>(existingJob?.billing.amountPaid || 3000);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI / PhonePe / GPay' | 'Bank Transfer' | 'Cheque'>(
    existingJob?.billing.paymentMode || 'Cash'
  );
  const [gstApplicable, setGstApplicable] = useState<boolean>(existingJob?.billing.gstApplicable || false);
  const [gstRate, setGstRate] = useState<number>(existingJob?.billing.gstRate || 18);
  const [status, setStatus] = useState<MotorJob['status']>(existingJob?.status || 'Received');
  const [technicianNotes, setTechnicianNotes] = useState<string>(existingJob?.technicianNotes || '');

  // Auto-calculated costs
  const copperTotalCost = Math.round((copperWeightKg || 0) * (copperRatePerKg || 0));
  const totalSpentOnMotor = Math.round(
    copperTotalCost +
    Number(insulationPaperCost || 0) +
    Number(varnishCost || 0) +
    Number(bearingsCost || 0) +
    Number(bushOrOilSealCost || 0) +
    Number(capacitorCost || 0) +
    Number(latheMachiningCost || 0) +
    Number(otherMaterialsCost || 0) +
    Number(labourWindingCost || 0)
  );

  // Auto-calculated billing & profit
  const gstAmount = gstApplicable ? Math.round((finalBillAmount - discount) * (gstRate / 100)) : 0;
  const totalPayableByClient = Math.round((finalBillAmount - discount) + gstAmount);
  const balanceDue = Math.max(0, totalPayableByClient - (amountPaid || 0));
  const paymentStatus: 'Paid' | 'Partial' | 'Pending' = 
    balanceDue <= 0 ? 'Paid' : (amountPaid > 0 ? 'Partial' : 'Pending');
  
  // Exact Profit I got: Client billed - Total spent
  const profitIGot = Math.round((finalBillAmount - discount) - totalSpentOnMotor);
  const profitMarginPercent = finalBillAmount > 0 ? Math.round((profitIGot / (finalBillAmount - discount)) * 100) : 0;

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setClientName(found.name);
      setCompanyName(found.companyName || '');
      setClientPhone(found.phone);
      setClientAddress(`${found.address}, ${found.city}`);
    }
  };

  // Quick autofill from technical winding bank
  const handleCopyFromDb = (entry: TechnicalWindingDatabaseEntry) => {
    setBrand(entry.brand);
    setHp(entry.hp);
    setKw(entry.kw);
    setPhase(entry.phase);
    setRpm(entry.rpm);
    setPoles(entry.poles);
    setSlotCount(entry.slots);
    setTotalCoils(entry.totalCoils);
    setCoilPitch(entry.coilPitch);
    setTurnsPerCoil(entry.turns);
    setWireGaugeSWG(entry.swg);
    setCopperWeightKg(entry.copperWeightApproxKg);
    setConnection(entry.connection);
    if (entry.bearings) {
      const parts = entry.bearings.split('/');
      setBearingFront(parts[0]?.trim() || entry.bearings);
      if (parts[1]) setBearingRear(parts[1]?.trim());
    }
    if (entry.capacitor) {
      setRunCapacitorMfd(entry.capacitor);
    }
  };

  // Save handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Please enter client name.');
      return;
    }

    const assignedStaff = staff.find(s => s.id === assignedStaffId);

    const newJob: MotorJob = {
      id: existingJob?.id || `job-${Date.now()}`,
      jobNumber: existingJob?.jobNumber || `SGE-2026-${Math.floor(100 + Math.random() * 900)}`,
      serialNumber: serialNumber.trim() || undefined,
      clientId: selectedClientId || `cli-${Date.now()}`,
      clientName,
      companyName,
      clientPhone,
      clientEmail: clientEmail.trim() || undefined,
      clientAddress,
      receivedDate: existingJob?.receivedDate || new Date().toISOString().split('T')[0],
      expectedDeliveryDate: existingJob?.expectedDeliveryDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status,
      faultReported,
      motorSpec: {
        brand,
        modelNumber,
        serialNumber: serialNumber.trim() || undefined,
        hp,
        kw: Number((hp * 0.7457).toFixed(2)),
        phase,
        otherPhaseDetail: phase === 'Other' ? otherPhaseDetail : undefined,
        rpm: Number(rpm) || 1440,
        poles,
        voltage,
        application,
        windingSpecs: {
          slotCount,
          totalCoils,
          coilPitch,
          turnsPerCoil,
          wireGaugeSWG,
          copperWeightKg,
          connection,
          otherConnectionDetail: connection === 'Other' ? otherConnectionDetail : undefined,
          runCapacitorMfd: runCapacitorMfd || undefined,
          bearingFront: bearingFront || undefined,
          bearingRear: bearingRear || undefined,
          insulationClass: 'Class F',
          noLoadAmps,
          fullLoadAmps
        }
      },
      assignedStaffId,
      assignedStaffName: assignedStaff?.name,
      costBreakdown: {
        copperWeightKg,
        copperRatePerKg,
        copperCost: copperTotalCost,
        insulationPaperCost,
        varnishCost,
        bearingsCost,
        bushOrOilSealCost,
        capacitorCost,
        latheMachiningCost,
        otherMaterialsCost,
        labourWindingCost,
        totalCost: totalSpentOnMotor
      },
      billing: {
        quoteAmount,
        finalBillAmount,
        discount,
        gstApplicable,
        gstRate,
        gstAmount,
        totalPayable: totalPayableByClient,
        advancePaid,
        amountPaid,
        balanceDue,
        paymentStatus,
        paymentMode,
        profit: profitIGot
      },
      technicianNotes,
      createdAt: existingJob?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-4xl my-auto overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight text-white">
                {existingJob ? `Edit Motor Job: ${existingJob.jobNumber}` : 'New Motor Winding Job Card'}
              </h3>
              <p className="text-xs text-slate-400">
                Shree Gayatri electricals • Client Details, Technical Coil Specs & Profit Calculator
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

        {/* Step Tabs Navigation */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-5 flex items-center gap-3 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveStep('client_motor')}
            className={`py-3 px-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeStep === 'client_motor'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center text-[10px]">1</span>
            <span>Client & Motor Model</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('technical_winding')}
            className={`py-3 px-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeStep === 'technical_winding'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 inline-flex items-center justify-center text-[10px]">2</span>
            <span>Turns, Gauge & Coils Specs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('cost_profit')}
            className={`py-3 px-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeStep === 'cost_profit'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 inline-flex items-center justify-center text-[10px]">3</span>
            <span>Cost, Spent & Profit Calculator</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
              ₹{profitIGot > 0 ? `+${profitIGot}` : profitIGot}
            </span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} className="p-5 max-h-[75vh] overflow-y-auto space-y-5">

          {/* STEP 1: CLIENT & MOTOR DETAILS */}
          {activeStep === 'client_motor' && (
            <div className="space-y-4">
              
              {/* Client Selection */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    Whos Motor Is This (Client & Company Details)
                  </h4>
                  {clients.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Pick Existing:</span>
                      <select
                        value={selectedClientId}
                        onChange={(e) => handleClientSelect(e.target.value)}
                        className="text-xs border border-slate-700 rounded-lg px-2 py-1 bg-slate-900 text-slate-200"
                      >
                        <option value="">-- Type New or Select --</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Client Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Company / Farm Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Patel Agro Farms or Shivam Dyeing"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Client Email (For Invoices)
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="e.g. client@example.com"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-4">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Address of Client (Village / GIDC / City)
                    </label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="e.g. Survey No. 42, Motipura Road, Mehsana"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Motor Model & Rating Specs */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    Motor Model & Power Rating Details
                  </h4>
                  <div className="text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Calculated Power: <strong>{(hp * 0.7457).toFixed(2)} kW</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Brand / Make</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Crompton, Kirloskar, Texmo..."
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Model / Frame No.</label>
                    <input
                      type="text"
                      value={modelNumber}
                      onChange={(e) => setModelNumber(e.target.value)}
                      placeholder="e.g. CG-132M or V6-5HP"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Motor Serial Number
                    </label>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="e.g. SN-CG-98421"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Motor HP</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.25"
                      value={hp}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setHp(val);
                        setKw(Number((val * 0.7457).toFixed(2)));
                      }}
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Phase</label>
                    <select
                      value={phase}
                      onChange={(e) => setPhase(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="Three Phase (3Φ)">Three Phase (3Φ) - 415V</option>
                      <option value="Single Phase (1Φ)">Single Phase (1Φ) - 230V</option>
                      <option value="Two Phase (2Φ)">Two Phase (2Φ)</option>
                      <option value="Other">Other / Special</option>
                    </select>
                    {phase === 'Other' && (
                      <input
                        type="text"
                        value={otherPhaseDetail}
                        onChange={(e) => setOtherPhaseDetail(e.target.value)}
                        placeholder="Specify phase / DC voltage..."
                        className="w-full text-xs px-3 py-1.5 mt-1.5 border border-slate-700 rounded-lg bg-slate-950 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">RPM (Speed)</label>
                    <select
                      value={isCustomRpm ? 'Other' : rpm}
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          setIsCustomRpm(true);
                        } else {
                          setIsCustomRpm(false);
                          const r = parseInt(e.target.value);
                          setRpm(r);
                          if (r === 2880) setPoles(2);
                          else if (r === 1440) setPoles(4);
                          else if (r === 960) setPoles(6);
                          else if (r === 720) setPoles(8);
                        }
                      }}
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="2880">2880 RPM (2 Pole)</option>
                      <option value="1440">1440 RPM (4 Pole)</option>
                      <option value="960">960 RPM (6 Pole)</option>
                      <option value="720">720 RPM (8 Pole)</option>
                      <option value="Other">Other / Custom RPM</option>
                    </select>
                    {isCustomRpm && (
                      <input
                        type="number"
                        value={rpm}
                        onChange={(e) => setRpm(parseInt(e.target.value) || 0)}
                        placeholder="Enter custom RPM..."
                        className="w-full text-xs px-3 py-1.5 mt-1.5 border border-slate-700 rounded-lg bg-slate-950 text-white placeholder-slate-500 font-mono focus:border-amber-500 focus:outline-hidden"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Poles</label>
                    <input
                      type="number"
                      value={poles}
                      onChange={(e) => setPoles(parseInt(e.target.value) || 4)}
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Voltage (V)</label>
                    <input
                      type="number"
                      value={voltage}
                      onChange={(e) => setVoltage(parseInt(e.target.value) || 415)}
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Karigar</label>
                    <select
                      value={assignedStaffId}
                      onChange={(e) => setAssignedStaffId(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white"
                    >
                      <option value="">-- Not Assigned --</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Motor Application Type</label>
                    <input
                      type="text"
                      value={application}
                      onChange={(e) => setApplication(e.target.value)}
                      placeholder="e.g. Submersible Borewell, Monoblock, Flour Mill..."
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Fault Reported / Symptoms</label>
                    <input
                      type="text"
                      value={faultReported}
                      onChange={(e) => setFaultReported(e.target.value)}
                      placeholder="e.g. Burnt coil, loud bearing noise, dry run..."
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Progress status */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300">Workshop Current Stage:</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="text-xs font-bold border border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-900 text-white"
                  >
                    <option value="Received">Received</option>
                    <option value="Dismantling & Inspection">Dismantling & Inspection</option>
                    <option value="Stripped & Core Cleaned">Stripped & Core Cleaned</option>
                    <option value="Coil Rewinding">Coil Rewinding</option>
                    <option value="Connection & Taping">Connection & Taping</option>
                    <option value="Varnishing & Baking">Varnishing & Baking</option>
                    <option value="Assembly & Testing">Assembly & Testing</option>
                    <option value="Ready for Delivery">Ready for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep('technical_winding')}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Next: Winding Specs →
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: TECHNICAL WINDING SPECS */}
          {activeStep === 'technical_winding' && (
            <div className="space-y-4">
              
              {/* Quick Fill from Winding Data Bank */}
              <div className="bg-amber-950/30 p-3.5 rounded-xl border border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>Autofill from Data Bank:</strong> Click to load standard factory specs for {hp} HP {phase}.
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {windingDb.filter(w => w.hp === hp && (w.phase === phase || w.hp <= 5)).slice(0, 3).map(entry => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => handleCopyFromDb(entry)}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-medium transition-colors cursor-pointer"
                    >
                      {entry.brand} ({entry.slots}S / {entry.swg})
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Technical Fields */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-4 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Winding Coil Specifications (Turns, Gauge, Total Coils, Connection)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  
                  {/* Coil Turns */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Coil Turns <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={turnsPerCoil}
                      onChange={(e) => setTurnsPerCoil(e.target.value)}
                      placeholder="e.g. 36, 38, 40 Turns"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white font-mono focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-slate-400">Number of turns in each coil</span>
                  </div>

                  {/* Wire Gauge (SWG) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Wire Gauge (SWG) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={wireGaugeSWG}
                      onChange={(e) => setWireGaugeSWG(e.target.value)}
                      placeholder="e.g. 21 SWG or Double 23"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 font-mono font-bold text-amber-400 focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-slate-400">Standard Wire Gauge / Poly mm</span>
                  </div>

                  {/* Total Coils */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Total Coils <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={totalCoils}
                      onChange={(e) => setTotalCoils(parseInt(e.target.value) || 0)}
                      placeholder="e.g. 18 or 24"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">Total wound coil sets</span>
                  </div>

                  {/* Slot Count */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">Total Slots</label>
                    <input
                      type="number"
                      value={slotCount}
                      onChange={(e) => setSlotCount(parseInt(e.target.value) || 36)}
                      placeholder="24, 36, 48..."
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white"
                    />
                    <span className="text-[10px] text-slate-400">Stator slot count</span>
                  </div>

                  {/* Coil Pitch */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">Coil Pitch</label>
                    <input
                      type="text"
                      value={coilPitch}
                      onChange={(e) => setCoilPitch(e.target.value)}
                      placeholder="1-8, 1-10, 1-12"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-400">Slot spacing span</span>
                  </div>

                  {/* Connection: Star, Delta, Other */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Connection <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={connection}
                      onChange={(e) => setConnection(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg font-bold bg-slate-900 text-white"
                    >
                      <option value="Star (Y)">Star (Y)</option>
                      <option value="Delta (Δ)">Delta (Δ)</option>
                      <option value="Star-Delta">Star-Delta Dual</option>
                      <option value="Series Star">Series Star</option>
                      <option value="Parallel Star">Parallel Star</option>
                      <option value="Other">Other / Special</option>
                    </select>
                    <span className="text-[10px] text-slate-400">Winding lead terminal link</span>
                  </div>

                  {/* Copper Wire Weight (kg) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Copper Wire Used (kg) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={copperWeightKg}
                      onChange={(e) => setCopperWeightKg(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 4.8"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 font-bold text-amber-400"
                    />
                    <span className="text-[10px] text-slate-400">Exact copper weight spent</span>
                  </div>

                  {/* Bearings */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">Bearings (Front / Rear)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={bearingFront}
                        onChange={(e) => setBearingFront(e.target.value)}
                        placeholder="6208 ZZ"
                        className="w-1/2 text-xs px-2 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white font-mono text-[11px]"
                      />
                      <input
                        type="text"
                        value={bearingRear}
                        onChange={(e) => setBearingRear(e.target.value)}
                        placeholder="6207 2RS"
                        className="w-1/2 text-xs px-2 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white font-mono text-[11px]"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">Drive / Non-drive bearing</span>
                  </div>

                  {connection === 'Other' && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1">Other Connection Details</label>
                      <input
                        type="text"
                        value={otherConnectionDetail}
                        onChange={(e) => setOtherConnectionDetail(e.target.value)}
                        placeholder="Describe special connection"
                        className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Capacitor MFD</label>
                    <input
                      type="text"
                      value={runCapacitorMfd}
                      onChange={(e) => setRunCapacitorMfd(e.target.value)}
                      placeholder="e.g. 36 MFD 440V"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white"
                    />
                    <span className="text-[10px] text-slate-400">Run / Start capacitor value</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Testing No-Load Amps</label>
                    <input
                      type="number"
                      step="0.1"
                      value={noLoadAmps}
                      onChange={(e) => setNoLoadAmps(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 4.2"
                      className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white"
                    />
                    <span className="text-[10px] text-slate-400">Meter ampere upon trial</span>
                  </div>
                </div>
              </div>

              {/* Navigation button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('client_motor')}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 cursor-pointer"
                >
                  ← Back to Motor Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('cost_profit')}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  Next: Cost Spent & Profit Calculator →
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: MOTOR COST CALCULATOR */}
          {activeStep === 'cost_profit' && (
            <div className="space-y-4">
              
              {/* Highlight Profit Banner */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                profitIGot >= 0 
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-100' 
                  : 'bg-rose-950/40 border-rose-800 text-rose-100'
              }`}>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Motor Cost & Profit Calculator
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      {formatCurrency(profitIGot)}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      profitIGot >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {profitMarginPercent}% Net Margin
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Client Billed: <strong className="text-slate-200">{formatCurrency(finalBillAmount - discount)}</strong> &minus; Total Spent: <strong className="text-slate-200">{formatCurrency(totalSpentOnMotor)}</strong> = <strong>Profit I Got</strong>
                  </p>
                </div>

                <div className="bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800 text-right shadow-xs">
                  <span className="text-[11px] text-slate-400 block font-medium">Pending After Work Completion</span>
                  <span className="text-lg font-bold text-rose-400 font-mono">
                    {formatCurrency(balanceDue)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Advance: {formatCurrency(amountPaid)}</span>
                </div>
              </div>

              {/* 2 Column Grid: Spent on Motor vs Billed to Client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Column A: How Much Spent on Motor */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      1. How Much Spent on Motor
                    </h5>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      Total: {formatCurrency(totalSpentOnMotor)}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    
                    {/* Copper Wire */}
                    <div className="bg-amber-950/20 p-2.5 rounded-lg border border-amber-800/40">
                      <div className="flex items-center justify-between font-semibold text-amber-300 mb-1">
                        <span>Copper Wire Cost:</span>
                        <span className="font-mono font-bold text-amber-400">{formatCurrency(copperTotalCost)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <label className="text-slate-400 block">Weight (kg):</label>
                          <input
                            type="number"
                            step="0.1"
                            value={copperWeightKg}
                            onChange={(e) => setCopperWeightKg(parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-900 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block">Rate / kg (₹):</label>
                          <input
                            type="number"
                            value={copperRatePerKg}
                            onChange={(e) => setCopperRatePerKg(parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-slate-700 rounded bg-slate-900 text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-slate-400 block mb-0.5">Insulation Nomex Paper (₹):</label>
                        <input
                          type="number"
                          value={insulationPaperCost}
                          onChange={(e) => setInsulationPaperCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5">Varnish & Baking (₹):</label>
                        <input
                          type="number"
                          value={varnishCost}
                          onChange={(e) => setVarnishCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5">Bearings Replacement (₹):</label>
                        <input
                          type="number"
                          value={bearingsCost}
                          onChange={(e) => setBearingsCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5">Bush / Oil Seal (₹):</label>
                        <input
                          type="number"
                          value={bushOrOilSealCost}
                          onChange={(e) => setBushOrOilSealCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5">Capacitor Cost (₹):</label>
                        <input
                          type="number"
                          value={capacitorCost}
                          onChange={(e) => setCapacitorCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5">Lathe / Machining (₹):</label>
                        <input
                          type="number"
                          value={latheMachiningCost}
                          onChange={(e) => setLatheMachiningCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5">Karigar Labour Wage (₹):</label>
                        <input
                          type="number"
                          value={labourWindingCost}
                          onChange={(e) => setLabourWindingCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5">Other Spares (₹):</label>
                        <input
                          type="number"
                          value={otherMaterialsCost}
                          onChange={(e) => setOtherMaterialsCost(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-white text-xs"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Column B: Client Billing, Advance & Pending Payment */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-blue-400" />
                      2. Client Billing & Payments
                    </h5>
                    <span className="text-xs font-bold text-white font-mono">
                      Payable: {formatCurrency(totalPayableByClient)}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-200 font-bold block mb-1">
                        Final Billed Amount (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={finalBillAmount}
                        onChange={(e) => setFinalBillAmount(parseFloat(e.target.value) || 0)}
                        placeholder="8500"
                        className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white text-sm font-bold font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-slate-400 block mb-0.5">Discount Given (₹):</label>
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5">Payment Mode:</label>
                        <select
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value as any)}
                          className="w-full px-2 py-1.5 border border-slate-700 rounded-lg bg-slate-900 text-white text-xs"
                        >
                          <option value="Cash">Cash</option>
                          <option value="UPI / PhonePe / GPay">UPI / PhonePe / GPay</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>
                    </div>

                    {/* Advance paid or not */}
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-200">
                          Advance Paid by Client (₹):
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          advancePaid > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {advancePaid > 0 ? 'Advance Received' : 'No Advance'}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={advancePaid}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setAdvancePaid(val);
                          setAmountPaid(val);
                        }}
                        placeholder="e.g. 3000"
                        className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-950 text-white font-mono font-bold"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Total Paid So Far:</span>
                        <input
                          type="number"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-0.5 border border-slate-700 bg-slate-950 text-white rounded text-right font-mono"
                        />
                      </div>
                    </div>

                    {/* Balance Due */}
                    <div className="p-3 rounded-xl bg-slate-950 text-white border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Payment Remaining After Completion</span>
                        <span className="text-xs text-amber-400 font-semibold">Khata / Udhaari</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-white font-mono">
                          {formatCurrency(balanceDue)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{paymentStatus}</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Technician Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Workshop Technician Notes / Testing Results (Megger, Heat, Insulation)
                </label>
                <textarea
                  rows={2}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="e.g. Megger test > 100 MΩ, 4.2A current, baked for 5 hours at 110°C..."
                  className="w-full text-xs px-3 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500"
                />
              </div>

            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>All changes automatically saved to Shree Gayatri electricals database</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Motor Job Card</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
