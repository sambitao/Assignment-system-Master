
import React, { useState, useMemo } from 'react';
import { Assignment, Category, JobStatus, MasterData } from '../types';
import { MENU_CONFIG } from '../constants';
import ImportModal from './ImportModal';
import { supabaseService } from '../services/supabaseService';

interface DataTableProps {
  category: Category;
  assignments: Assignment[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onAdd: () => void;
  updateStatus: (id: string, status: JobStatus, extra?: any) => void;
  masterData: MasterData;
  onRefresh?: () => void;
}

const SummaryCard = ({ title, count, colorClass, borderColor }: { title: string, count: number, colorClass: string, borderColor: string }) => (
  <div className={`bg-white rounded-2xl p-4 shadow-sm border-t-4 ${borderColor} flex flex-col justify-between h-24`}>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{title}</p>
      <p className={`text-3xl font-bold ${colorClass}`}>{count}</p>
  </div>
);

const PROGRESS_STEPS_DEF = [
    { key: 'survey', label: 'สำรวจ', val: 10 },
    { key: 'plan', label: 'วางแผน', val: 10 },
    { key: 'req_approve', label: 'ขออนุมัติ', val: 10 },
    { key: 'approve', label: 'อนุมัติ', val: 10 },
    { key: 'plan_cm', label: 'Plan to CM', val: 10 },
    { key: 'cut_cable', label: 'ตัดถ่ายเคเบิล', val: 30 },
    { key: 'cleanup', label: 'เก็บงาน', val: 10 },
    { key: 'remove', label: 'รื้อสาย', val: 10 }
];

const DataTable: React.FC<DataTableProps> = ({ category, assignments, onEdit, onDelete, onAdd, updateStatus, masterData, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(10);
  
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [workflowType, setWorkflowType] = useState<'update_fms' | 'cancel' | null>(null);
  const [tmpInput1, setTmpInput1] = useState('');
  const [tmpInput2, setTmpInput2] = useState('');
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeJobForProgress, setActiveJobForProgress] = useState<Assignment | null>(null);
  const [selectedProgressKeys, setSelectedProgressKeys] = useState<string[]>([]);

  const config = MENU_CONFIG[category];
  const isSummary = category === 'summary_plan';
  const isPlan = category === 'plan_interruption';
  const isSub = config?.isSub;

  const filtered = assignments.filter(a => {
    if (a.category !== category) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    const searchStr = `${a.internalId} ${a.description || ''} ${a.location || ''} ${a.jobType} ${a.routeName || ''} ${a.project || ''} ${a.projectCode || ''} ${a.subcontractor || ''} ${a.teamReq || ''}`.toLowerCase();
    return searchStr.includes(search.toLowerCase());
  });

  const effectiveRowsPerPage = rowsPerPage === 'all' ? filtered.length : rowsPerPage;
  const paginated = filtered.slice((page - 1) * (effectiveRowsPerPage || 1), page * (effectiveRowsPerPage || filtered.length));
  const totalPages = Math.ceil(filtered.length / (effectiveRowsPerPage || 1)) || 1;

  const stats = useMemo(() => {
    const catJobs = assignments.filter(a => a.category === category);
    return {
      new: catJobs.filter(a => a.status === 'new').length,
      process: catJobs.filter(a => a.status === 'process').length,
      complete: catJobs.filter(a => a.status === 'complete' || a.status === 'finish').length,
      update_fms: catJobs.filter(a => a.status === 'update_fms').length,
      cancel: catJobs.filter(a => a.status === 'cancel').length,
    };
  }, [assignments, category]);

  const handleOpenProgress = (job: Assignment) => {
    setActiveJobForProgress(job);
    setSelectedProgressKeys(job.progressSteps || []);
    setShowProgressModal(true);
  };

  const handleSaveProgress = () => {
    if (!activeJobForProgress) return;
    let total = 0;
    PROGRESS_STEPS_DEF.forEach(s => { if (selectedProgressKeys.includes(s.key)) total += s.val; });
    updateStatus(activeJobForProgress.id, 'process', { progressSteps: selectedProgressKeys, progressPercent: Math.min(total, 100) });
    setShowProgressModal(false);
  };

  const handleBatchImport = async (data: Assignment[]) => {
      try {
          await supabaseService.upsertAssignmentsBatch(data);
          if (onRefresh) onRefresh();
          // เปลี่ยน Alert ให้ชัดเจนขึ้น
          alert(`✅ นำเข้าข้อมูลสำเร็จทั้งหมด ${data.length} รายการ\nระบบกำลังซิงค์ข้อมูลใหม่กรุณารอสักครู่...`);
      } catch (error) {
          console.error("Batch Import Failed:", error);
          alert("❌ ไม่สามารถบันทึกข้อมูลเข้าฐานข้อมูลได้ โปรดตรวจสอบความเร็วอินเทอร์เน็ตหรือติดต่อผู้ดูแลระบบ");
      }
  };

  const toggleProgressKey = (key: string) => {
    setSelectedProgressKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const getStatusBadge = (status: JobStatus) => {
    const styles: Record<JobStatus, string> = {
      new: 'text-blue-600 bg-blue-50 border-blue-100',
      process: 'text-orange-600 bg-orange-50 border-orange-100',
      assign: 'text-purple-600 bg-purple-50 border-purple-100',
      approve: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      finish: 'text-green-600 bg-green-50 border-green-100',
      complete: 'text-green-600 bg-green-50 border-green-100',
      update_fms: 'text-cyan-700 bg-cyan-50 border-cyan-100',
      cancel: 'text-red-600 bg-red-50 border-red-100'
    };
    const labels: Record<string, string> = { process: 'Inprocess', new: 'New Job', complete: 'Complete', finish: 'Finish', cancel: 'Cancel', update_fms: 'Update FMS' };
    return <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${styles[status]}`}>{labels[status] || status.replace('_', ' ')}</span>;
  };

  const submitInlineWorkflow = (id: string) => {
    if (workflowType === 'update_fms') {
        if (!tmpInput1) return alert("กรุณาระบุวันที่ Update FMS");
        updateStatus(id, 'update_fms', { fmsUpdateDate: tmpInput1 });
    } else if (workflowType === 'cancel') {
        if (!tmpInput1 || !tmpInput2) return alert("กรุณาเลือกผู้แจ้งและระบุสาเหตุ");
        updateStatus(id, 'cancel', { cancelBy: tmpInput1, cancelReason: tmpInput2, cancelDate: new Date().toISOString() });
    }
    resetWorkflow();
  };

  const resetWorkflow = () => {
    setActiveWorkflowId(null);
    setWorkflowType(null);
    setTmpInput1('');
    setTmpInput2('');
  };

  const renderHeaders = () => {
    const thClass = "p-3 text-[10px] font-bold text-black uppercase tracking-widest text-center border-b border-gray-100";
    if (isSummary) {
        return (
            <>
                <th className={thClass}>Job ID</th>
                <th className={thClass}>Job Type</th>
                <th className={thClass}>Project Code</th>
                <th className={thClass}>Route Name</th>
                <th className={thClass}>Distance</th>
                <th className={thClass}>Due Date</th>
                <th className={thClass}>Sym Impact</th>
                <th className={thClass}>Progress (%)</th>
                <th className={thClass}>NS</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Action</th>
            </>
        );
    } else if (isSub) {
        return (
            <>
                <th className={thClass}>Job ID</th>
                <th className={thClass}>Job Type</th>
                <th className={thClass}>Description</th>
                <th className={thClass}>AS Number</th>
                <th className={thClass}>Objective</th>
                <th className={thClass}>Expenses</th>
                <th className={thClass}>Route Code</th>
                <th className={thClass}>Action Date</th>
                <th className={thClass}>Sub Team</th>
                <th className={thClass}>NS Respond</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Action</th>
            </>
        );
    } else if (isPlan) {
        return (
            <>
                <th className={thClass}>Job ID</th>
                <th className={thClass}>Type</th>
                <th className={thClass}>Project</th>
                <th className={thClass}>Description</th>
                <th className={thClass}>Agency</th>
                <th className={thClass}>Sent Plan</th>
                <th className={thClass}>Action Date</th>
                <th className={thClass}>Location</th>
                <th className={thClass}>NS Respond</th>
                <th className={thClass}>Item</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Action</th>
            </>
        );
    } else {
        return (
            <>
                <th className={thClass}>Job ID</th>
                <th className={thClass}>Job Type</th>
                <th className={thClass}>Description</th>
                <th className={thClass}>Action Date</th>
                <th className={thClass}>Due Date</th>
                <th className={thClass}>Team Req</th>
                <th className={thClass}>NS Respond</th>
                <th className={thClass}>Location</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Action</th>
            </>
        );
    }
  };

  const renderRow = (item: Assignment) => {
    const tdClass = "p-3 text-[11px] text-black align-middle";
    const dateStr = (d?: string) => d ? new Date(d).toLocaleDateString('th-TH') : '-';

    if (isSummary) {
        return (
            <>
                <td className={`${tdClass} font-bold text-brand-600 font-mono`}>{item.internalId}</td>
                <td className={tdClass}>{item.jobType}</td>
                <td className={`${tdClass} font-bold text-blue-600`}>{item.projectCode || '-'}</td>
                <td className={`${tdClass} max-w-[150px] truncate`} title={item.routeName}>{item.routeName || '-'}</td>
                <td className={tdClass}>{item.distance ? `${item.distance} km` : '-'}</td>
                <td className={tdClass}>{dateStr(item.dueDate)}</td>
                <td className={`${tdClass} font-bold ${item.symImpact === 'Impact' ? 'text-orange-600' : 'text-green-600'}`}>{item.symImpact || '-'}</td>
                <td className={tdClass}>
                    <div className="flex flex-col items-center min-w-[100px]">
                        <div className="w-20 bg-gray-100 rounded-full h-2 mb-1 overflow-hidden shadow-inner">
                            <div className={`h-full transition-all ${item.progressPercent === 100 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${item.progressPercent || 0}%` }}></div>
                        </div>
                        <div className="flex items-center gap-1.5 h-3">
                            <span className="font-black text-black">{item.progressPercent || 0}%</span>
                            {item.status === 'process' && <button onClick={() => handleOpenProgress(item)} className="text-gray-400 hover:text-brand-500"><i className="fa-solid fa-pencil text-[9px]"></i></button>}
                        </div>
                    </div>
                </td>
                <td className={`${tdClass} max-w-[100px] truncate`}>{item.nsRespond?.join(', ') || '-'}</td>
                <td className={tdClass}>{getStatusBadge(item.status)}</td>
            </>
        );
    } else if (isSub) {
        return (
            <>
                <td className={`${tdClass} font-bold text-brand-600 font-mono`}>{item.internalId}</td>
                <td className={tdClass}>{item.jobType}</td>
                <td className={`${tdClass} max-w-[150px] truncate text-black`}>{item.description}</td>
                <td className={tdClass}>{item.asNumber || '-'}</td>
                <td className={`${tdClass} max-w-[100px] truncate text-black`}>{item.objective || '-'}</td>
                <td className={tdClass}>{item.expenses ? `${item.expenses.toLocaleString()} ฿` : '-'}</td>
                <td className={tdClass}>{item.routeCode || '-'}</td>
                <td className={tdClass}>{dateStr(item.actionDate)}</td>
                <td className={`${tdClass} font-bold text-blue-700`}>{item.subcontractor || '-'}</td>
                <td className={`${tdClass} max-w-[100px] truncate text-black`}>{item.nsRespond?.join(', ') || '-'}</td>
                <td className={tdClass}>{getStatusBadge(item.status)}</td>
            </>
        );
    } else if (isPlan) {
        return (
            <>
                <td className={`${tdClass} font-bold text-brand-600 font-mono`}>{item.internalId}</td>
                <td className={tdClass}>{item.jobType}</td>
                <td className={tdClass}>{item.project || '-'}</td>
                <td className={`${tdClass} max-w-[200px] truncate text-black`}>{item.description}</td>
                <td className={tdClass}>{item.agency || '-'}</td>
                <td className={tdClass}>{dateStr(item.sentPlanDate)}</td>
                <td className={tdClass}>{dateStr(item.actionDate)}</td>
                <td className={`${tdClass} max-w-[150px] truncate text-black`}>{item.location || '-'}</td>
                <td className={`${tdClass} max-w-[100px] truncate text-black`}>{item.nsRespond?.join(', ') || '-'}</td>
                <td className={tdClass}>{item.itemCount || '0'}</td>
                <td className={tdClass}>{getStatusBadge(item.status)}</td>
            </>
        );
    } else {
        return (
            <>
                <td className={`${tdClass} font-bold text-brand-600 font-mono`}>{item.internalId}</td>
                <td className={tdClass}>{item.jobType}</td>
                <td className={`${tdClass} max-w-[250px] truncate text-black`}>{item.description}</td>
                <td className={tdClass}>{dateStr(item.actionDate)}</td>
                <td className={tdClass}>{dateStr(item.dueDate)}</td>
                <td className={tdClass}>{item.teamReq || '-'}</td>
                <td className={`${tdClass} max-w-[150px] truncate text-black`}>{item.nsRespond?.join(', ') || '-'}</td>
                <td className={`${tdClass} max-w-[150px] truncate text-black`}>{item.location || '-'}</td>
                <td className={tdClass}>{getStatusBadge(item.status)}</td>
            </>
        );
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className={`grid gap-4 ${isPlan ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>
        <SummaryCard title="NEW JOB" count={stats.new} colorClass="text-blue-500" borderColor="border-blue-500" />
        <SummaryCard title="INPROCESS" count={stats.process} colorClass="text-orange-500" borderColor="border-orange-500" />
        <SummaryCard title="COMPLETE" count={stats.complete} colorClass="text-green-500" borderColor="border-green-500" />
        {isPlan && <SummaryCard title="UPDATE FMS" count={stats.update_fms} colorClass="text-cyan-700" borderColor="border-cyan-700" />}
        <SummaryCard title="JOB CANCEL" count={stats.cancel} colorClass="text-red-500" borderColor="border-red-500" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <i className={`fa-solid ${isSummary ? 'fa-diagram-project' : 'fa-list-ul'} text-brand-500 mr-3`}></i>
                {config?.title}
            </h3>
            <div className="flex gap-2">
                <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-green-50 text-green-700 border border-green-100 rounded-xl text-[10px] font-bold hover:bg-green-100 transition">
                    <i className="fa-solid fa-file-excel"></i> Import Excel
                </button>
                {onRefresh && <button onClick={onRefresh} className="p-2.5 text-gray-400 hover:text-brand-500 transition border border-gray-100 rounded-xl"><i className="fa-solid fa-sync"></i></button>}
                <button onClick={onAdd} className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white rounded-xl text-[10px] font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-100">
                    <i className="fa-solid fa-plus"></i> เพิ่มงานใหม่
                </button>
            </div>
        </div>

        <div className="px-6 pb-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input type="text" placeholder="ค้นหาข้อมูล..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-brand-500 outline-none text-[11px] text-black transition" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[11px] outline-none font-bold text-black" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">ทุกสถานะ</option>
                <option value="new">NEW JOB</option>
                <option value="process">INPROCESS</option>
                <option value="complete">COMPLETE</option>
                {isPlan && <option value="update_fms">UPDATE FMS</option>}
                <option value="cancel">CANCEL JOB</option>
            </select>
        </div>

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-gray-50 border-y border-gray-100 sticky top-0 z-10">
              <tr>{renderHeaders()}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors group ${activeWorkflowId === item.id ? 'bg-brand-50/30' : ''}`}>
                  {renderRow(item)}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 min-w-[150px]">
                        {activeWorkflowId === item.id ? (
                            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-brand-200 shadow-sm animate-fadeIn">
                                {workflowType === 'update_fms' && (
                                    <input type="date" className="text-[10px] px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-brand-500 outline-none text-black" value={tmpInput1} onChange={e => setTmpInput1(e.target.value)} />
                                )}
                                {workflowType === 'cancel' && (
                                    <div className="flex flex-col gap-1">
                                        <select className="text-[9px] px-2 py-1 border border-gray-200 rounded outline-none text-black" value={tmpInput1} onChange={e => setTmpInput1(e.target.value)}>
                                            <option value="">เลือกผู้แจ้ง...</option>
                                            {masterData.nsRespond.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
                                        </select>
                                        <input type="text" placeholder="ระบุสาเหตุ..." className="text-[9px] px-2 py-1 border border-gray-200 rounded outline-none text-black" value={tmpInput2} onChange={e => setTmpInput2(e.target.value)} />
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => submitInlineWorkflow(item.id)} className="bg-green-600 text-white w-6 h-6 rounded flex items-center justify-center hover:bg-green-700 transition"><i className="fa-solid fa-check text-[10px]"></i></button>
                                    <button onClick={resetWorkflow} className="bg-gray-200 text-gray-500 w-6 h-6 rounded flex items-center justify-center hover:bg-gray-300 transition"><i className="fa-solid fa-xmark text-[10px]"></i></button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-1 pr-2 border-r border-gray-100">
                                {item.status === 'new' && (
                                    <button onClick={() => updateStatus(item.id, 'process', { receiveDate: new Date().toISOString() })} className="bg-brand-600 text-white px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-brand-700 transition">Receive</button>
                                )}
                                
                                {item.status === 'process' && (
                                    <button 
                                        onClick={() => {
                                            if(isSummary) {
                                                const code = prompt("กรุณาระบุ Project Code:");
                                                if(code) updateStatus(item.id, 'complete', { projectCode: code, progressPercent: 100, completeDate: new Date().toISOString() });
                                            } else {
                                                updateStatus(item.id, 'complete', { completeDate: new Date().toISOString() });
                                            }
                                        }} 
                                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition ${isSummary ? (item.progressPercent === 100 ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed') : 'bg-green-700 text-white'}`} 
                                        disabled={isSummary && item.progressPercent !== 100}
                                    >
                                        Complete
                                    </button>
                                )}

                                {isPlan && item.status === 'complete' && item.jobType === 'Interruption OFC' && (
                                    <button onClick={() => { setActiveWorkflowId(item.id); setWorkflowType('update_fms'); }} className="bg-cyan-800 text-white px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-cyan-900 transition">Update FMS</button>
                                )}

                                {(item.status === 'new' || item.status === 'process') && (
                                    <button onClick={() => { setActiveWorkflowId(item.id); setWorkflowType('cancel'); }} className="bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-red-800 transition">Cancel</button>
                                )}
                            </div>
                        )}

                        <button onClick={() => onEdit(item.id)} className="text-gray-400 hover:text-brand-500 p-1.5 transition"><i className="fa-solid fa-pen-to-square"></i></button>
                        
                        {confirmDeleteId === item.id ? (
                            <button onClick={() => { onDelete(item.id); setConfirmDeleteId(null); }} className="bg-red-600 text-white px-2 py-1 rounded text-[8px] font-black animate-pulse border border-red-700">CONFIRM?</button>
                        ) : (
                            <button onClick={() => setConfirmDeleteId(item.id)} className="text-gray-400 hover:text-red-600 p-1.5 transition"><i className="fa-solid fa-trash-can"></i></button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-50 bg-white flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
                <div className="text-[10px] text-black font-bold uppercase tracking-widest">Total: <span className="text-black">{filtered.length}</span> Items</div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-black uppercase tracking-widest">Rows:</span>
                    <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value)); setPage(1); }} className="text-[10px] font-bold text-black bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none">
                        <option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={50}>50</option><option value={100}>100</option><option value="all">All</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 text-gray-400 hover:text-brand-500 disabled:opacity-20 transition"><i className="fa-solid fa-chevron-left text-[10px]"></i></button>
                <span className="text-[10px] font-black text-black mx-4">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 text-gray-400 hover:text-brand-500 disabled:opacity-20 transition"><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
            </div>
        </div>
      </div>

      <ImportModal 
          isOpen={showImportModal} 
          onClose={() => setShowImportModal(false)} 
          category={category} 
          onImportSuccess={handleBatchImport} 
      />

      {showProgressModal && activeJobForProgress && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-100">
                  <div className="p-8 pb-4">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 shadow-sm"><i className="fa-solid fa-list-check"></i></div>
                          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Job Progress</h3>
                      </div>
                      <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 max-h-[350px] overflow-y-auto custom-scrollbar">
                          {PROGRESS_STEPS_DEF.map(step => (
                              <label key={step.key} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white rounded-xl transition-all">
                                  <input type="checkbox" className="w-5 h-5 border-2 border-brand-300 rounded-lg text-brand-500 focus:ring-0 cursor-pointer" checked={selectedProgressKeys.includes(step.key)} onChange={() => toggleProgressKey(step.key)} />
                                  <div className="flex-1"><p className={`text-sm font-bold ${selectedProgressKeys.includes(step.key) ? 'text-black' : 'text-gray-400'} transition-colors`}>{step.label}</p></div>
                                  <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100">+{step.val}%</span>
                              </label>
                          ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Percent</span>
                          <span className="text-3xl font-black text-brand-500">{PROGRESS_STEPS_DEF.reduce((acc, s) => selectedProgressKeys.includes(s.key) ? acc + s.val : acc, 0)}%</span>
                      </div>
                  </div>
                  <div className="p-8 pt-4 flex gap-3"><button onClick={handleSaveProgress} className="flex-1 bg-brand-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-xl shadow-brand-100 hover:bg-brand-700 transition active:scale-95 uppercase tracking-widest">บันทึก</button><button onClick={() => setShowProgressModal(false)} className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded-2xl text-xs font-black hover:bg-gray-200 transition active:scale-95 uppercase tracking-widest">Cancel</button></div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DataTable;
