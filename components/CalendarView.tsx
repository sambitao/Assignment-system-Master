
import React, { useState, useMemo } from 'react';
import { Assignment, JobStatus } from '../types';

interface CalendarViewProps {
  assignments: Assignment[];
  onSelectJob: (id: string) => void;
  updateStatus: (id: string, status: JobStatus, extra?: any) => void;
}

type CalendarMode = 'month' | 'week' | 'day';

const CalendarView: React.FC<CalendarViewProps> = ({ assignments, onSelectJob, updateStatus }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');
  const [selectedJob, setSelectedJob] = useState<Assignment | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const changeDate = (offset: number) => {
    const newDate = new Date(currentDate);
    if (mode === 'month') newDate.setMonth(newDate.getMonth() + offset);
    else if (mode === 'week') newDate.setDate(newDate.getDate() + (offset * 7));
    else newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    // กรองเอาเฉพาะงานที่ไม่ใช่ summary_plan (Project Plan) ออกไปจากปฏิทิน
    const dayJobs = assignments.filter(a => 
      a.actionDate.startsWith(dateStr) && 
      a.status !== 'cancel' && 
      a.category !== 'summary_plan'
    );
    
    // เรียงลำดับตามเวลา
    return dayJobs.sort((a, b) => {
      const timeA = a.planStartTime || a.actionDate.split('T')[1] || '00:00';
      const timeB = b.planStartTime || b.actionDate.split('T')[1] || '00:00';
      return timeA.localeCompare(timeB);
    });
  };

  const getStatusStyle = (status: JobStatus) => {
    const styles: Record<JobStatus, string> = {
      new: 'bg-blue-500',
      process: 'bg-orange-500',
      assign: 'bg-purple-500',
      approve: 'bg-cyan-500',
      finish: 'bg-green-500',
      complete: 'bg-green-600',
      update_fms: 'bg-cyan-700',
      cancel: 'bg-red-500'
    };
    return styles[status] || 'bg-gray-400';
  };

  const renderHeader = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let title = `${monthNames[month]} ${year}`;
    
    if (mode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      title = `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getFullYear()}`;
    } else if (mode === 'day') {
      title = `${currentDate.getDate()} ${monthNames[month]} ${year}`;
    }

    return (
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <div className="flex space-x-1">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-200 rounded-lg transition"><i className="fa-solid fa-chevron-left"></i></button>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-200 rounded-lg transition"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
        
        <div className="flex bg-gray-200 p-1 rounded-xl">
          {(['month', 'week', 'day'] as CalendarMode[]).map(m => (
            <button 
              key={m} 
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === m ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-1.5 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-100"
        >Today</button>
      </div>
    );
  };

  const renderMonth = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50/30 h-32 border-b border-r border-gray-100"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const jobs = getJobsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div key={d} className={`min-h-[128px] p-2 border-b border-r border-gray-100 relative group hover:bg-gray-50 transition ${isToday ? 'bg-brand-50/30' : 'bg-white'}`}>
          <div className={`text-[10px] font-bold ${isToday ? 'text-brand-600' : 'text-gray-400'} mb-2 text-right`}>{d}</div>
          <div className="space-y-1 overflow-y-auto max-h-[100px] custom-scrollbar">
            {jobs.map(job => (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job)}
                className="text-[9px] bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm hover:border-brand-300 hover:shadow-md cursor-pointer truncate transition flex items-center"
              >
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${getStatusStyle(job.status)}`}></div>
                <span className="font-bold text-gray-700 mr-1">{job.planStartTime || (job.internalId.slice(-3))}</span>
                <span className="truncate text-gray-500">{job.description}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 text-center bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest py-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="flex-1 grid grid-cols-7 overflow-y-auto custom-scrollbar">{days}</div>
      </div>
    );
  };

  const renderWeek = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const jobs = getJobsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div key={i} className={`flex-1 border-r border-gray-100 flex flex-col ${isToday ? 'bg-brand-50/20' : ''}`}>
          <div className={`p-4 border-b border-gray-50 text-center ${isToday ? 'bg-brand-500 text-white rounded-b-xl' : ''}`}>
            <p className="text-[10px] font-bold uppercase opacity-60">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
            </p>
            <p className="text-xl font-black">{date.getDate()}</p>
          </div>
          <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
            {jobs.map(job => (
              <div 
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-brand-500 transition cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-brand-600 font-mono">{job.planStartTime || job.internalId}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase text-white ${getStatusStyle(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-gray-700 line-clamp-2 leading-tight">{job.description}</p>
                <p className="text-[9px] text-gray-400 mt-2 flex items-center">
                  <i className="fa-solid fa-user-check mr-1"></i> {job.nsRespond && job.nsRespond.length > 0 ? job.nsRespond.join(', ') : 'No Respond'}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div className="flex-1 flex overflow-x-auto overflow-y-hidden">{days}</div>;
  };

  const renderDay = () => {
    const jobs = getJobsForDate(currentDate);
    return (
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-gray-800">Schedule for Today</h3>
            <p className="text-sm text-gray-400 font-medium">You have {jobs.length} tasks assigned for this day</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {jobs.map((job, idx) => (
            <div key={job.id} className="flex gap-6 group">
              <div className="w-20 pt-1 text-right">
                <p className="text-sm font-bold text-gray-800">{job.planStartTime || 'Anytime'}</p>
                <p className="text-[10px] font-medium text-gray-400">{job.planEndTime || ''}</p>
              </div>
              <div className="relative flex-1">
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${getStatusStyle(job.status)}`}></div>
                <div 
                  onClick={() => setSelectedJob(job)}
                  className="ml-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-gray-50 rounded text-[10px] font-bold text-gray-400">{job.internalId}</span>
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{job.jobType}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">{job.description}</h4>
                    <p className="text-xs text-gray-500 flex items-center"><i className="fa-solid fa-user-group mr-2 text-gray-300"></i>{job.nsRespond && job.nsRespond.length > 0 ? job.nsRespond.join(', ') : 'Self Managed'}</p>
                  </div>
                  <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Team / Sub</p>
                      <p className="text-xs font-bold text-gray-700">{job.subcontractor || job.teamReq || 'Internal Team'}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${getStatusStyle(job.status)} shadow-lg shadow-brand-100`}>
                      <i className={job.status === 'complete' ? 'fa-solid fa-check' : 'fa-solid fa-bolt'}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleStatusUpdate = (jobId: string, status: JobStatus, extra?: any) => {
    updateStatus(jobId, status, extra);
    setSelectedJob(null);
  };

  const DetailModal = () => {
    if (!selectedJob) return null;
    const j = selectedJob;
    const isPlan = j.category === 'plan_interruption';
    const isSub = j.category.startsWith('sub_');
    const isSummary = j.category === 'summary_plan';

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest px-2 py-1 bg-brand-50 rounded-lg">{j.internalId}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg text-white ${getStatusStyle(j.status)} uppercase`}>{j.status.replace('_', ' ')}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">{j.jobType}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1.5"><i className="fa-solid fa-clock"></i> Updated: {new Date(j.updatedAt).toLocaleString('th-TH')}</p>
            </div>
            <button onClick={() => setSelectedJob(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 transition"><i className="fa-solid fa-xmark"></i></button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Main Desc */}
            <div className="bg-brand-50/30 p-4 rounded-2xl border border-brand-100">
                <p className="text-[10px] font-bold text-brand-600 uppercase mb-1">รายละเอียดงาน (Description)</p>
                <p className="text-sm font-medium text-gray-700">{j.description || (isSummary ? j.routeName : '-')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <DetailItem label="Action Date" value={new Date(j.actionDate).toLocaleDateString('th-TH')} icon="fa-calendar" />
                {isPlan && <DetailItem label="Time Range" value={`${j.planStartTime} - ${j.planEndTime}`} icon="fa-clock" />}
                <DetailItem label="Location" value={j.location || '-'} icon="fa-location-dot" />
                <DetailItem label="Agency" value={j.agency || '-'} icon="fa-building" />
              </div>
              <div className="space-y-4">
                <DetailItem label="Responsibility" value={j.nsRespond?.join(', ') || '-'} icon="fa-user-group" />
                <DetailItem label="Project/Client" value={j.project || j.projectCode || '-'} icon="fa-diagram-project" />
                <DetailItem label="Route/Ref ID" value={j.routeCode || j.refJobId || '-'} icon="fa-link" />
                {isSub && <DetailItem label="Subcontractor" value={j.subcontractor || '-'} icon="fa-helmet-safety" />}
              </div>
            </div>

            {(j.asNumber || j.ssfNumber) && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                {j.asNumber && <DetailItem label="AS Number" value={`${j.asNumber} (${j.asDate ? new Date(j.asDate).toLocaleDateString() : '-'})`} icon="fa-file-invoice" />}
                {j.ssfNumber && <DetailItem label="SSF Number" value={`${j.ssfNumber} (${j.ssfDate ? new Date(j.ssfDate).toLocaleDateString() : '-'})`} icon="fa-file-signature" />}
              </div>
            )}

            {j.remark && (
              <div className="pt-4 border-t border-gray-100">
                <DetailItem label="Remark / GPS" value={j.remark} icon="fa-note-sticky" />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Actions:</p>
                {j.status === 'new' && (
                    <>
                        <button onClick={() => handleStatusUpdate(j.id, 'process')} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-orange-600 transition">Receive</button>
                        <button onClick={() => handleStatusUpdate(j.id, 'cancel', { cancelDate: new Date().toISOString(), cancelBy: 'Admin' })} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition">Cancel</button>
                    </>
                )}
                {j.status === 'process' && (
                    <>
                        <button onClick={() => handleStatusUpdate(j.id, 'approve', { approveDate: new Date().toISOString() })} className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-cyan-600 transition">Approve</button>
                        <button onClick={() => handleStatusUpdate(j.id, 'complete')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-green-700 transition">Finish</button>
                    </>
                )}
                {j.status === 'approve' && (
                    <button onClick={() => handleStatusUpdate(j.id, 'complete')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-green-700 transition">Finish</button>
                )}
                {j.status === 'complete' && j.jobType === 'Interruption OFC' && (
                    <button onClick={() => handleStatusUpdate(j.id, 'update_fms', { fmsUpdateDate: new Date().toISOString() })} className="px-4 py-2 bg-cyan-800 text-white rounded-xl text-xs font-bold animate-pulse">Update FMS</button>
                )}
            </div>

            <button 
              onClick={() => {
                onSelectJob(j.id);
                setSelectedJob(null);
              }}
              className="flex items-center gap-2 px-6 py-2 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600 transition shadow-lg shadow-brand-100"
            >
              <i className="fa-solid fa-pen-to-square"></i> แก้ไขข้อมูล
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DetailItem = ({ label, value, icon }: { label: string, value: string, icon: string }) => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"><i className={`fa-solid ${icon} text-xs`}></i></div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
        <p className="text-xs font-semibold text-gray-700">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full relative">
      {renderHeader()}
      {mode === 'month' && renderMonth()}
      {mode === 'week' && renderWeek()}
      {mode === 'day' && renderDay()}
      <DetailModal />
    </div>
  );
};

export default CalendarView;
