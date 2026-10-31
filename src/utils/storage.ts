import {
  Client,
  MotorJob,
  ElectricalSiteWork,
  StaffMember,
  StaffDailyAttendance,
  MyWorkCompanyLog,
  WorkshopExpense,
  TechnicalWindingDatabaseEntry,
  WorkshopSettings
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_EXPENSES,
  INITIAL_MOTOR_JOBS,
  INITIAL_ELECTRICAL_SITES,
  INITIAL_SETTINGS,
  INITIAL_STAFF,
  INITIAL_STAFF_ATTENDANCE,
  INITIAL_MY_WORK_LOGS,
  TECHNICAL_WINDING_DATABASE
} from './seedData';

// Production storage keys (Clean, ready-for-use app)
const STORAGE_KEYS = {
  SETTINGS: 'sge_settings_prod_v1',
  CLIENTS: 'sge_clients_prod_v1',
  MOTOR_JOBS: 'sge_motor_jobs_prod_v1',
  ELECTRICAL_SITES: 'sge_electrical_sites_prod_v1',
  STAFF: 'sge_staff_prod_v1',
  STAFF_ATTENDANCE: 'sge_staff_attendance_prod_v1',
  MY_WORK_LOGS: 'sge_my_work_logs_prod_v1',
  EXPENSES: 'sge_expenses_prod_v1',
  WINDING_DB: 'sge_winding_db_prod_v1',
};

// Automatic one-time cleanup of old demo storage keys from previous development previews
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const oldKeys = [
      'sge_clients_v2', 'sge_motor_jobs_v2', 'sge_electrical_sites_v2',
      'sge_staff_v2', 'sge_staff_attendance_v2', 'sge_my_work_logs_v2',
      'sge_expenses_v2', 'sge_clients_v1', 'sge_motor_jobs_v1'
    ];
    oldKeys.forEach(k => localStorage.removeItem(k));
  }
} catch {
  // Ignore in non-browser environment
}

export const getStoredSettings = (): WorkshopSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  } catch {
    return INITIAL_SETTINGS;
  }
};

export const saveStoredSettings = (settings: WorkshopSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const getStoredClients = (): Client[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!data) return INITIAL_CLIENTS;
    return JSON.parse(data);
  } catch {
    return INITIAL_CLIENTS;
  }
};

export const saveStoredClients = (clients: Client[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save clients:', e);
  }
};

export const getStoredMotorJobs = (): MotorJob[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MOTOR_JOBS);
    if (!data) return INITIAL_MOTOR_JOBS;
    return JSON.parse(data);
  } catch {
    return INITIAL_MOTOR_JOBS;
  }
};

export const saveStoredMotorJobs = (jobs: MotorJob[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MOTOR_JOBS, JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save motor jobs:', e);
  }
};

export const getStoredElectricalSites = (): ElectricalSiteWork[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ELECTRICAL_SITES);
    return data ? JSON.parse(data) : INITIAL_ELECTRICAL_SITES;
  } catch {
    return INITIAL_ELECTRICAL_SITES;
  }
};

export const saveStoredElectricalSites = (sites: ElectricalSiteWork[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ELECTRICAL_SITES, JSON.stringify(sites));
  } catch (e) {
    console.error('Failed to save electrical sites:', e);
  }
};

export const getStoredStaff = (): StaffMember[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!data) return INITIAL_STAFF;
    const parsed: StaffMember[] = JSON.parse(data);
    return parsed.map(s => {
      if (s.hourlyRate && s.hourlyRate > 0) return s;
      const defaultRate = 
        s.role === 'Master Rewinder' ? 150 :
        s.role === 'Lathe Craftsman' ? 130 :
        s.role === 'Site Electrician' ? 105 : 70;
      return { ...s, hourlyRate: defaultRate };
    });
  } catch {
    return INITIAL_STAFF;
  }
};

export const saveStoredStaff = (staff: StaffMember[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  } catch (e) {
    console.error('Failed to save staff:', e);
  }
};

export const getStoredStaffAttendance = (): StaffDailyAttendance[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STAFF_ATTENDANCE);
    if (!data) return INITIAL_STAFF_ATTENDANCE;
    return JSON.parse(data);
  } catch {
    return INITIAL_STAFF_ATTENDANCE;
  }
};

export const saveStoredStaffAttendance = (attendance: StaffDailyAttendance[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STAFF_ATTENDANCE, JSON.stringify(attendance));
  } catch (e) {
    console.error('Failed to save staff attendance:', e);
  }
};

export const getStoredMyWorkLogs = (): MyWorkCompanyLog[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MY_WORK_LOGS);
    return data ? JSON.parse(data) : INITIAL_MY_WORK_LOGS;
  } catch {
    return INITIAL_MY_WORK_LOGS;
  }
};

export const saveStoredMyWorkLogs = (logs: MyWorkCompanyLog[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MY_WORK_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save company logs:', e);
  }
};

export const getStoredExpenses = (): WorkshopExpense[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : INITIAL_EXPENSES;
  } catch {
    return INITIAL_EXPENSES;
  }
};

export const saveStoredExpenses = (expenses: WorkshopExpense[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses:', e);
  }
};

export const getStoredWindingDb = (): TechnicalWindingDatabaseEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WINDING_DB);
    if (!data) return TECHNICAL_WINDING_DATABASE;
    const parsed: TechnicalWindingDatabaseEntry[] = JSON.parse(data);
    const existingIds = new Set(parsed.map(w => w.id));
    const missing = TECHNICAL_WINDING_DATABASE.filter(w => !existingIds.has(w.id));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(STORAGE_KEYS.WINDING_DB, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch {
    return TECHNICAL_WINDING_DATABASE;
  }
};

export const saveStoredWindingDb = (db: TechnicalWindingDatabaseEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.WINDING_DB, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save winding db:', e);
  }
};

export const resetToDefaultMotorJobs = (): MotorJob[] => {
  saveStoredMotorJobs([]);
  return [];
};

export const clearAllWorkshopData = () => {
  saveStoredClients([]);
  saveStoredMotorJobs([]);
  saveStoredElectricalSites([]);
  saveStoredStaff([]);
  saveStoredStaffAttendance([]);
  saveStoredMyWorkLogs([]);
  saveStoredExpenses([]);
};

export interface FullAppBackup {
  version: string;
  exportDate: string;
  settings: WorkshopSettings;
  clients: Client[];
  motorJobs: MotorJob[];
  electricalSites: ElectricalSiteWork[];
  staff: StaffMember[];
  staffAttendance: StaffDailyAttendance[];
  myWorkLogs: MyWorkCompanyLog[];
  expenses: WorkshopExpense[];
  windingDb: TechnicalWindingDatabaseEntry[];
}

export const exportEntireData = (): string => {
  const backup: FullAppBackup = {
    version: '3.0',
    exportDate: new Date().toISOString(),
    settings: getStoredSettings(),
    clients: getStoredClients(),
    motorJobs: getStoredMotorJobs(),
    electricalSites: getStoredElectricalSites(),
    staff: getStoredStaff(),
    staffAttendance: getStoredStaffAttendance(),
    myWorkLogs: getStoredMyWorkLogs(),
    expenses: getStoredExpenses(),
    windingDb: getStoredWindingDb(),
  };
  return JSON.stringify(backup, null, 2);
};

export const importBackupData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString) as Partial<FullAppBackup>;
    if (data.settings) saveStoredSettings(data.settings);
    if (Array.isArray(data.clients)) saveStoredClients(data.clients);
    if (Array.isArray(data.motorJobs)) saveStoredMotorJobs(data.motorJobs);
    if (Array.isArray(data.electricalSites)) saveStoredElectricalSites(data.electricalSites);
    if (Array.isArray(data.staff)) saveStoredStaff(data.staff);
    if (Array.isArray(data.staffAttendance)) saveStoredStaffAttendance(data.staffAttendance);
    if (Array.isArray(data.myWorkLogs)) saveStoredMyWorkLogs(data.myWorkLogs);
    if (Array.isArray(data.expenses)) saveStoredExpenses(data.expenses);
    if (Array.isArray(data.windingDb)) saveStoredWindingDb(data.windingDb);
    return true;
  } catch (e) {
    console.error('Failed to import backup data:', e);
    return false;
  }
};

export const resetToInitialDemoData = () => {
  clearAllWorkshopData();
};
