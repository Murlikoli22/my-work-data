export type MotorPhase = 'Single Phase (1Φ)' | 'Three Phase (3Φ)' | 'Two Phase (2Φ)' | 'Other';

export type MotorConnection = 'Star (Y)' | 'Delta (Δ)' | 'Series Star' | 'Parallel Star' | 'Star-Delta' | 'Other';

export type JobStatus = 
  | 'Received'
  | 'Dismantling & Inspection'
  | 'Stripped & Core Cleaned'
  | 'Coil Rewinding'
  | 'Connection & Taping'
  | 'Varnishing & Baking'
  | 'Assembly & Testing'
  | 'Ready for Delivery'
  | 'Delivered';

export interface MotorWindingSpecs {
  slotCount: number; // e.g. 24, 36, 48
  totalCoils: number; // Total coils in stator
  coilPitch: string; // e.g. "1-8, 1-10, 1-12"
  turnsPerCoil: string; // Coil Turns (e.g. "36, 38, 40" or "48 Turns")
  wireGaugeSWG: string; // Gauge (e.g. "21 SWG" or "Double 23 SWG")
  copperWeightKg: number; // Copper wire used in kg
  connection: MotorConnection; // Star, Delta, Other
  otherConnectionDetail?: string;
  runCapacitorMfd?: string; // e.g. "36 MFD"
  startCapacitorMfd?: string; // e.g. "120-150 MFD"
  bearingFront?: string; // e.g. "6205 ZZ"
  bearingRear?: string; // e.g. "6204 2RS"
  insulationClass?: string; // e.g. Class F
  noLoadAmps?: number;
  fullLoadAmps?: number;
}

export interface MotorSpec {
  brand: string; // e.g. "Crompton", "Kirloskar", "Texmo", "Havells", "ABB", "Siemens"
  modelNumber?: string;
  serialNumber?: string; // Motor serial number from nameplate
  hp: number;
  kw?: number;
  phase: MotorPhase;
  otherPhaseDetail?: string;
  rpm: number; // 960, 1440, 2880 or custom
  customRpm?: string;
  poles: number; // 2, 4, 6, 8
  voltage: number; // 230, 415
  application: string; // Submersible, Monoblock, Industrial Induction, Flour Mill, etc.
  windingSpecs: MotorWindingSpecs;
}

export interface CostBreakdown {
  copperWeightKg: number;
  copperRatePerKg: number;
  copperCost: number;
  insulationPaperCost: number;
  varnishCost: number;
  bearingsCost: number;
  bushOrOilSealCost: number;
  capacitorCost: number;
  latheMachiningCost: number;
  otherMaterialsCost: number;
  labourWindingCost: number;
  totalCost: number; // How much spent on this motor
}

export interface JobBilling {
  quoteAmount: number;
  finalBillAmount: number; // How much client was billed
  discount: number;
  gstApplicable: boolean;
  gstRate: number;
  gstAmount: number;
  totalPayable: number;
  advancePaid: number; // Advance paid or not
  amountPaid: number; // Total paid so far
  balanceDue: number; // Payment remaining after work completion
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  paymentMode?: 'Cash' | 'UPI / PhonePe / GPay' | 'Bank Transfer' | 'Cheque';
  profit: number; // finalBillAmount - totalCost
}

export interface MotorJob {
  id: string;
  jobNumber: string; // e.g. "SGE-2026-101"
  serialNumber?: string; // Motor serial number from nameplate
  clientId: string;
  clientName: string;
  companyName?: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress: string;
  receivedDate: string;
  expectedDeliveryDate: string;
  deliveredDate?: string;
  status: JobStatus;
  faultReported: string;
  motorSpec: MotorSpec;
  assignedStaffId?: string;
  assignedStaffName?: string;
  costBreakdown: CostBreakdown;
  billing: JobBilling;
  technicianNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Electrical Work on Site (Wiring in Home, Shop, Company, Society)
export type ElectricalSiteType = 'Home / Residential' | 'Shop / Commercial' | 'Company / Factory' | 'Housing Society' | 'Agricultural Farm' | 'Other';

export interface ElectricalSiteWork {
  id: string;
  projectCode: string; // e.g. "EW-2026-01"
  title: string; // e.g. "3-BHK Concealed Wiring & Panel Fitting"
  siteType: ElectricalSiteType;
  otherSiteTypeDetail?: string;
  clientName: string;
  companyOrSocietyName?: string;
  clientPhone: string;
  siteAddress: string;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  status: 'In Progress' | 'Under Inspection' | 'Completed' | 'Pending Approval';
  workScope: string; // e.g. "Concealed conduit piping, wire pulling, switchboard fitting, distribution box, earthing"
  assignedWorkerNames: string[]; // Workers working on this site
  materialCost: number;
  workerLabourCost: number;
  totalCost: number;
  contractAmount: number;
  advanceReceived: number;
  balancePending: number;
  profit: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  notes?: string;
  createdAt: string;
}

// Staff Details & Work Timing
export interface StaffMember {
  id: string;
  name: string;
  age: number;
  phone: string;
  role: 'Master Rewinder' | 'Site Electrician' | 'Helper / Assembling' | 'Lathe Craftsman' | 'Apprentice';
  hourlyRate?: number; // Hourly rate in ₹/hr (used for hourly attendance payroll calculation)
  monthlySalary?: number;
  dailyWage: number;
  joiningDate: string;
  status: 'Active' | 'Inactive';
  emergencyContact?: string;
  address?: string;
}

export interface StaffMonthlyPayrollSummary {
  staffId: string;
  staffName: string;
  role: StaffMember['role'];
  hourlyRate: number;
  totalDaysWorked: number;
  totalHoursWorked: number;
  grossPay: number;
  totalAdvancePaid: number;
  netPayable: number;
  attendanceRecords: StaffDailyAttendance[];
}

export interface StaffDailyAttendance {
  id: string;
  date: string;
  staffId: string;
  staffName: string;
  inTime: string; // e.g. "09:00 AM"
  outTime: string; // e.g. "07:30 PM"
  workType: 'Workshop Motor Winding' | 'Site Electrical Wiring' | 'Lathe / Mechanical';
  jobOrSiteSummary: string; // which motor or which site
  hoursWorked: number;
  dailyWageEarned: number;
  advanceOrPaymentGiven: number; // staff daily payment
  balancePayable: number;
  paymentMode: 'Cash' | 'UPI';
  paymentStatus: 'Paid' | 'Unpaid';
  notes?: string;
}

// "My Work" - What I (Proprietor Mukeshbhai) worked in companies
export interface MyWorkCompanyLog {
  id: string;
  date: string;
  companyName: string; // Which company
  companyLocation: string; // Where is company (e.g., GIDC Phase 1, Chhatral, Sanand)
  inTime: string; // Work time IN (e.g., "08:30 AM")
  outTime: string; // Work time OUT (e.g., "06:00 PM")
  workType: 
    | 'Panel Maintenance & HT/LT Work'
    | 'Industrial Motor Testing & Commissioning'
    | 'Emergency Breakdown Service'
    | 'Machine Control Wiring'
    | 'DG Set / Generator Sync'
    | 'Substation & Transformer Overhaul'
    | 'Plant Lighting & Cable Laying';
  workDescription: string; // What I worked in that company
  hoursSpent: number;
  contactPerson?: string;
  contactPhone?: string;
  serviceCharge: number;
  paymentStatus: 'Received' | 'Pending';
  gatePassNo?: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  phone: string;
  address: string;
  city: string;
  gstin?: string;
  notes?: string;
  createdAt: string;
}

export interface WorkshopExpense {
  id: string;
  date: string;
  category: string;
  amount: number;
  vendorName?: string;
  billNumber?: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank';
  notes?: string;
}

export interface TechnicalWindingDatabaseEntry {
  id: string;
  brand: string;
  hp: number;
  kw: number;
  phase: MotorPhase;
  rpm: number;
  poles: number;
  slots: number;
  totalCoils: number;
  coilPitch: string;
  turns: string;
  swg: string;
  parallelWires: number;
  copperWeightApproxKg: number;
  connection: MotorConnection;
  bearings: string;
  capacitor?: string;
  notes?: string;
}

export interface WorkshopSettings {
  shopName: string;
  proprietor: string;
  tagline: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  upiId?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  copperDefaultRatePerKg: number;
  termsAndConditions: string[];
}
