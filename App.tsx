
import React, { useState, useEffect, useCallback } from 'react';
import { Category, Assignment, MasterData, JobStatus } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SubDashboard from './components/SubDashboard';
import ProjectDashboard from './components/ProjectDashboard';
import DataTable from './components/DataTable';
import CalendarView from './components/CalendarView';
import SettingView from './components/SettingView';
import LinkSupport from './components/LinkSupport';
import AssignmentModal from './components/AssignmentModal';
import DbSetupGuide from './components/DbSetupGuide';
import { MENU_CONFIG } from './constants';
import { supabaseService } from './services/supabaseService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<Category>('dashboard_analytics');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [masterData, setMasterData] = useState<MasterData>({
    subcontractors: ["Sub A", "Sub B", "Sub C"],
    nsRespond: [],
    rrIndexes: {},
    linkSupport: []
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      const [remoteAssignments, remoteMaster] = await Promise.all([
        supabaseService.fetchAssignments(),
        supabaseService.fetchMasterData()
      ]);
      
      setAssignments(remoteAssignments);
      if (remoteMaster) {
        const sanitizedNs = Array.isArray(remoteMaster.nsRespond) 
          ? remoteMaster.nsRespond.map((item: any) => {
              let name = item.name || '';
              let phone = item.phone || '';
              if (typeof name === 'string' && name.startsWith('{')) {
                try {
                  const inner = JSON.parse(name);
                  name = inner.name || name;
                  phone = inner.phone || phone;
                } catch(e) {}
              }
              return { name: String(name), phone: String(phone) };
            })
          : [];
        setMasterData({ ...remoteMaster, nsRespond: sanitizedNs });
      }
    } catch (error: any) {
      console.error("Fetch error details:", error);
      const errorMsg = error.message?.toLowerCase() || '';
      if (errorMsg.includes('not found') || errorMsg.includes('does not exist') || errorMsg.includes('42p01')) {
        setDbError('TABLE_MISSING');
      } else {
        setDbError('GENERAL_ERROR');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveAssignment = async (data: Assignment) => {
    try {
      await supabaseService.upsertAssignment(data);
      if (editingId) {
        setAssignments(prev => prev.map(a => a.id === editingId ? data : a));
      } else {
        setAssignments(prev => [data, ...prev]);
      }
      setIsModalOpen(false);
      setEditingId(null);
    } catch (error) {
      alert("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่");
    }
  };

  const deleteAssignment = useCallback(async (id: string) => {
    try {
      const error = await supabaseService.deleteAssignment(id);
      if (error) {
        console.error("Delete Error:", error);
        alert(`ลบข้อมูลไม่สำเร็จ: ${error.message}`);
        return;
      }
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (error: any) {
      console.error("Unhandled Delete Exception:", error);
      alert("เกิดข้อผิดพลาดไม่คาดคิด: " + (error.message || "Unknown error"));
    }
  }, []);

  const updateStatus = async (id: string, status: JobStatus, extra: any = {}) => {
    const original = assignments.find(a => a.id === id);
    if (!original) return;

    const updated = { ...original, ...extra, status, updatedAt: new Date().toISOString() };
    try {
      await supabaseService.upsertAssignment(updated);
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const handleUpdateMasterData = async (updater: (prev: MasterData) => MasterData) => {
    const newData = updater(masterData);
    setMasterData(newData);
    try {
      await supabaseService.saveMasterData(newData);
    } catch (error) {
      console.error("Failed to save master data:", error);
    }
  };

  if (dbError === 'TABLE_MISSING') {
    return <DbSetupGuide />;
  }

  const renderContent = () => {
    if (isLoading) return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold uppercase tracking-widest italic text-brand-500">Syncing Data...</p>
      </div>
    );

    switch (currentView) {
      case 'dashboard_analytics':
        return <Dashboard assignments={assignments} />;
      case 'sub_dashboard':
        return <SubDashboard assignments={assignments} />;
      case 'summary_dashboard':
        return <ProjectDashboard assignments={assignments} />;
      case 'calendar':
        return (
          <CalendarView 
            assignments={assignments} 
            updateStatus={updateStatus}
            onSelectJob={(id) => { setEditingId(id); setIsModalOpen(true); }} 
          />
        );
      case 'setting':
        return <SettingView masterData={masterData} setMasterData={(val: any) => handleUpdateMasterData(typeof val === 'function' ? val : () => val)} />;
      case 'link_support':
        return <LinkSupport masterData={masterData} setMasterData={(val: any) => handleUpdateMasterData(typeof val === 'function' ? val : () => val)} />;
      default:
        return (
          <DataTable 
            category={currentView} 
            assignments={assignments} 
            onEdit={(id) => { setEditingId(id); setIsModalOpen(true); }}
            onDelete={deleteAssignment}
            onAdd={() => { setEditingId(null); setIsModalOpen(true); }}
            updateStatus={updateStatus}
            masterData={masterData}
            onRefresh={loadData}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800 font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        assignments={assignments}
      />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-300">
        <Header 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          currentView={currentView}
        />
        
        <div className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {renderContent()}
        </div>
      </main>

      {isModalOpen && (
        <AssignmentModal 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingId(null); }}
          onSave={saveAssignment}
          editingId={editingId}
          assignments={assignments}
          category={currentView}
          masterData={masterData}
          setMasterData={(val: any) => handleUpdateMasterData(typeof val === 'function' ? val : () => val)}
        />
      )}
    </div>
  );
};

export default App;
