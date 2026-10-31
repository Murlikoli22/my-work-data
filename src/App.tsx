import React, { useState, useEffect } from 'react';
import { 
  Header, 
  ActiveTab 
} from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MotorWindingsList } from './components/MotorWindingsList';
import { MotorJobModal } from './components/MotorJobModal';
import { MotorJobDetailModal } from './components/MotorJobDetailModal';
import { ElectricalSitesList } from './components/ElectricalSitesList';
import { ElectricalSiteModal } from './components/ElectricalSiteModal';
import { StaffManager } from './components/StaffManager';
import { MyWorkManager } from './components/MyWorkManager';
import { DocumentGenerator, DocumentType } from './components/DocumentGenerator';
import { SettingsModal } from './components/SettingsModal';

import {
  MotorJob,
  ElectricalSiteWork,
  StaffMember,
  StaffDailyAttendance,
  MyWorkCompanyLog,
  TechnicalWindingDatabaseEntry,
  WorkshopSettings,
  Client,
  WorkshopExpense
} from './types';

import {
  getStoredSettings,
  saveStoredSettings,
  getStoredClients,
  saveStoredClients,
  getStoredMotorJobs,
  saveStoredMotorJobs,
  getStoredElectricalSites,
  saveStoredElectricalSites,
  getStoredStaff,
  saveStoredStaff,
  getStoredStaffAttendance,
  saveStoredStaffAttendance,
  getStoredMyWorkLogs,
  saveStoredMyWorkLogs,
  getStoredWindingDb,
  saveStoredWindingDb,
  getStoredExpenses
} from './utils/storage';

export default function App() {
  // Main Data States loaded from local persistence
  const [settings, setSettings] = useState<WorkshopSettings>(getStoredSettings);
  const [clients, setClients] = useState<Client[]>(getStoredClients);
  const [motorJobs, setMotorJobs] = useState<MotorJob[]>(getStoredMotorJobs);
  const [electricalSites, setElectricalSites] = useState<ElectricalSiteWork[]>(getStoredElectricalSites);
  const [staff, setStaff] = useState<StaffMember[]>(getStoredStaff);
  const [staffAttendance, setStaffAttendance] = useState<StaffDailyAttendance[]>(getStoredStaffAttendance);
  const [myWorkLogs, setMyWorkLogs] = useState<MyWorkCompanyLog[]>(getStoredMyWorkLogs);
  const [windingDb, setWindingDb] = useState<TechnicalWindingDatabaseEntry[]>(getStoredWindingDb);
  const [expenses] = useState<WorkshopExpense[]>(getStoredExpenses);

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals
  const [isMotorModalOpen, setIsMotorModalOpen] = useState(false);
  const [editingMotorJob, setEditingMotorJob] = useState<MotorJob | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMotorJob, setSelectedMotorJob] = useState<MotorJob | null>(null);

  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<ElectricalSiteWork | null>(null);

  const [documentSelectedJob, setDocumentSelectedJob] = useState<MotorJob | null>(null);

  // Auto-sync state changes to LocalStorage
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredClients(clients);
  }, [clients]);

  useEffect(() => {
    saveStoredMotorJobs(motorJobs);
  }, [motorJobs]);

  useEffect(() => {
    saveStoredElectricalSites(electricalSites);
  }, [electricalSites]);

  useEffect(() => {
    saveStoredStaff(staff);
  }, [staff]);

  useEffect(() => {
    saveStoredStaffAttendance(staffAttendance);
  }, [staffAttendance]);

  useEffect(() => {
    saveStoredMyWorkLogs(myWorkLogs);
  }, [myWorkLogs]);

  useEffect(() => {
    saveStoredWindingDb(windingDb);
  }, [windingDb]);

  // Handlers for Motor Jobs
  const handleSaveMotorJob = (job: MotorJob) => {
    const exists = motorJobs.some(j => j.id === job.id);
    let updated: MotorJob[];
    if (exists) {
      updated = motorJobs.map(j => (j.id === job.id ? job : j));
    } else {
      updated = [job, ...motorJobs];
    }
    setMotorJobs(updated);

    // If client is new, automatically save to client list
    if (!clients.some(c => c.name.toLowerCase() === job.clientName.toLowerCase())) {
      const newClient: Client = {
        id: job.clientId,
        name: job.clientName,
        companyName: job.companyName,
        phone: job.clientPhone,
        address: job.clientAddress,
        city: settings.city,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setClients(prev => [newClient, ...prev]);
    }
  };

  const handleDeleteMotorJob = (jobId: string) => {
    if (confirm('Are you sure you want to delete this motor job card?')) {
      setMotorJobs(prev => prev.filter(j => j.id !== jobId));
      if (selectedMotorJob?.id === jobId) {
        setSelectedMotorJob(null);
        setIsDetailModalOpen(false);
      }
    }
  };


  const handleUpdateMotorStatus = (jobId: string, newStatus: MotorJob['status']) => {
    setMotorJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: newStatus,
          deliveredDate: newStatus === 'Delivered' ? new Date().toISOString().split('T')[0] : j.deliveredDate
        };
      }
      return j;
    }));

    if (selectedMotorJob && selectedMotorJob.id === jobId) {
      setSelectedMotorJob(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Handlers for Electrical Sites
  const handleSaveSite = (site: ElectricalSiteWork) => {
    const exists = electricalSites.some(s => s.id === site.id);
    if (exists) {
      setElectricalSites(prev => prev.map(s => s.id === site.id ? site : s));
    } else {
      setElectricalSites(prev => [site, ...prev]);
    }
  };

  const handleDeleteSite = (siteId: string) => {
    if (confirm('Are you sure you want to delete this electrical site work project?')) {
      setElectricalSites(prev => prev.filter(s => s.id !== siteId));
    }
  };

  // Handlers for Staff & Attendance
  const handleSaveStaff = (member: StaffMember) => {
    const exists = staff.some(s => s.id === member.id);
    if (exists) {
      setStaff(prev => prev.map(s => s.id === member.id ? member : s));
    } else {
      setStaff(prev => [...prev, member]);
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaff(prev => prev.filter(s => s.id !== staffId));
    }
  };

  const handleSaveAttendance = (log: StaffDailyAttendance) => {
    setStaffAttendance(prev => [log, ...prev]);
  };

  const handleDeleteAttendance = (attendanceId: string) => {
    if (confirm('Delete this daily attendance record?')) {
      setStaffAttendance(prev => prev.filter(a => a.id !== attendanceId));
    }
  };

  // Handlers for My Work Logs
  const handleSaveMyWork = (log: MyWorkCompanyLog) => {
    const exists = myWorkLogs.some(l => l.id === log.id);
    if (exists) {
      setMyWorkLogs(prev => prev.map(l => l.id === log.id ? log : l));
    } else {
      setMyWorkLogs(prev => [log, ...prev]);
    }
  };

  const handleDeleteMyWork = (logId: string) => {
    if (confirm('Delete this company work record?')) {
      setMyWorkLogs(prev => prev.filter(l => l.id !== logId));
    }
  };

  // Handlers for Winding Data Bank
  const handleAddWindingEntry = (entry: TechnicalWindingDatabaseEntry) => {
    setWindingDb(prev => [entry, ...prev]);
  };

  const handleDeleteWindingEntry = (id: string) => {
    if (confirm('Remove this winding specification from library?')) {
      setWindingDb(prev => prev.filter(w => w.id !== id));
    }
  };

  // Triggering document generation
  const handleGenerateDocument = (job: MotorJob, docType: DocumentType) => {
    setDocumentSelectedJob(job);
    setIsDetailModalOpen(false);
    setActiveTab('documents');
  };

  // Counts for Badges
  const activeMotorsCount = motorJobs.filter(j => j.status !== 'Delivered').length;
  const readyForPickupCount = motorJobs.filter(j => j.status === 'Ready for Delivery').length;
  const activeSitesCount = electricalSites.filter(s => s.status !== 'Completed').length;
  const totalPendingBalance = motorJobs.reduce((sum, j) => sum + (j.billing.balanceDue || 0), 0);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Workshop Navigation Header */}
      <Header
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewMotorClick={() => {
          setEditingMotorJob(null);
          setIsMotorModalOpen(true);
        }}
        onNewSiteClick={() => {
          setEditingSite(null);
          setIsSiteModalOpen(true);
        }}
        activeMotorsCount={activeMotorsCount}
        activeSitesCount={activeSitesCount}
        readyForPickupCount={readyForPickupCount}
        motorJobs={motorJobs}
        electricalSites={electricalSites}
        onSelectMotorJob={(job) => {
          setSelectedMotorJob(job);
          setIsDetailModalOpen(true);
          setActiveTab('motors');
        }}
        onSelectSite={(site) => {
          setEditingSite(site);
          setIsSiteModalOpen(true);
          setActiveTab('electrical-sites');
        }}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Dashboard
            jobs={motorJobs}
            sites={electricalSites}
            clients={clients}
            expenses={expenses}
            staffLogs={staffAttendance}
            settings={settings}
            onSelectJob={(job) => {
              setSelectedMotorJob(job);
              setIsDetailModalOpen(true);
            }}
            onNewJobClick={() => {
              setEditingMotorJob(null);
              setIsMotorModalOpen(true);
            }}
            onViewDocuments={(job, type) => handleGenerateDocument(job, type)}
            onFilterStatus={(status) => {
              setActiveTab('motors');
            }}
          />
        )}

        {/* TAB 2: MOTOR WINDINGS (JOBS + TECHNICAL WINDING DATA BANK & CALCULATORS) */}
        {(activeTab === 'motors' || activeTab === 'technical') && (
          <MotorWindingsList
            jobs={motorJobs}
            onSelectJob={(job) => {
              setSelectedMotorJob(job);
              setIsDetailModalOpen(true);
            }}
            onEditJob={(job) => {
              setEditingMotorJob(job);
              setIsMotorModalOpen(true);
            }}
            onDeleteJob={handleDeleteMotorJob}
            onNewJobClick={() => {
              setEditingMotorJob(null);
              setIsMotorModalOpen(true);
            }}
            onGenerateDoc={handleGenerateDocument}
            settings={settings}
            windingDb={windingDb}
            onAddWindingEntry={handleAddWindingEntry}
            onDeleteWindingEntry={handleDeleteWindingEntry}
            initialSubView={activeTab === 'technical' ? 'technical' : 'jobs'}
          />
        )}

        {/* TAB 3: ELECTRICAL WORK (WIRING IN HOME, SHOP, COMPANY, SOCIETY) */}
        {activeTab === 'electrical-sites' && (
          <ElectricalSitesList
            sites={electricalSites}
            onNewSiteClick={() => {
              setEditingSite(null);
              setIsSiteModalOpen(true);
            }}
            onEditSite={(site) => {
              setEditingSite(site);
              setIsSiteModalOpen(true);
            }}
            onDeleteSite={handleDeleteSite}
            settings={settings}
          />
        )}

        {/* TAB 4: STAFF & DAILY WORK TIMING IN AND OUT */}
        {activeTab === 'staff' && (
          <StaffManager
            staff={staff}
            attendanceLogs={staffAttendance}
            onSaveStaff={handleSaveStaff}
            onDeleteStaff={handleDeleteStaff}
            onSaveAttendance={handleSaveAttendance}
            onDeleteAttendance={handleDeleteAttendance}
          />
        )}

        {/* TAB 5: MY WORK (WHAT I WORKED IN COMPANIES, WHICH COMPANY, WHERE, IN/OUT) */}
        {activeTab === 'my-work' && (
          <MyWorkManager
            logs={myWorkLogs}
            onSaveLog={handleSaveMyWork}
            onDeleteLog={handleDeleteMyWork}
            settings={settings}
          />
        )}

        {/* TAB 6: INVOICES, CHALLANS & BILLS FOR SHREE GAYATRI ELECTRICALS */}
        {activeTab === 'documents' && (
          <DocumentGenerator
            jobs={motorJobs}
            selectedJob={documentSelectedJob || motorJobs[0]}
            settings={settings}
          />
        )}

        {/* TAB 8: SETTINGS & BACKUP */}
        {activeTab === 'settings' && (
          <SettingsModal
            settings={settings}
            onSaveSettings={setSettings}
            motorJobs={motorJobs}
            onDataReset={() => {
              setSettings(getStoredSettings());
              setClients(getStoredClients());
              setMotorJobs(getStoredMotorJobs());
              setElectricalSites(getStoredElectricalSites());
              setStaff(getStoredStaff());
              setStaffAttendance(getStoredStaffAttendance());
              setMyWorkLogs(getStoredMyWorkLogs());
              setWindingDb(getStoredWindingDb());
            }}
          />
        )}

      </main>

      {/* MODAL 1: ADD / EDIT MOTOR JOB CARD */}
      <MotorJobModal
        isOpen={isMotorModalOpen}
        onClose={() => {
          setIsMotorModalOpen(false);
          setEditingMotorJob(null);
        }}
        onSave={handleSaveMotorJob}
        clients={clients}
        staff={staff}
        windingDb={windingDb}
        settings={settings}
        existingJob={editingMotorJob}
      />

      {/* MODAL 2: MOTOR JOB CARD DETAIL & STATUS INSPECTOR */}
      <MotorJobDetailModal
        job={selectedMotorJob}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMotorJob(null);
        }}
        onEdit={(job) => {
          setIsDetailModalOpen(false);
          setEditingMotorJob(job);
          setIsMotorModalOpen(true);
        }}
        onStatusChange={handleUpdateMotorStatus}
        onGenerateDocument={handleGenerateDocument}
        settings={settings}
      />

      {/* MODAL 3: ADD / EDIT ELECTRICAL SITE PROJECT */}
      <ElectricalSiteModal
        isOpen={isSiteModalOpen}
        onClose={() => {
          setIsSiteModalOpen(false);
          setEditingSite(null);
        }}
        onSave={handleSaveSite}
        staff={staff}
        existingSite={editingSite}
      />

      {/* Quick Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-3 text-center no-print">
        <p>
          <strong className="text-white capitalize">{settings.shopName}</strong> — My Work Data • Motor Rewindings, Electrical Contracting & Industrial Services
        </p>
      </footer>

    </div>
  );
}
