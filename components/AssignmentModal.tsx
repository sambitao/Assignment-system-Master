
import React, { useState, useEffect } from 'react';
import { Assignment, Category, MasterData } from '../types';
import { JOB_TYPES, AGENCIES, PROJECTS, MENU_CONFIG, TEAM_REQUESTS, SIDE_COUNTS, IMPACT_STATUS } from '../constants';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Assignment) => void;
  editingId: string | null;
  assignments: Assignment[];
  category: Category;
  masterData: MasterData;
  setMasterData: React.Dispatch<React.SetStateAction<MasterData>>;
}

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Input = ({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: string }) => (
  <div className="relative flex items-center">
    {icon && (
        <div className="absolute left-3.5 text-gray-400 pointer-events-none text-xs">
            <i className={`fa-solid ${icon}`}></i>
        </div>
    )}
    <input 
        {...props} 
        className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 text-xs focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition disabled:opacity-50 ${icon ? 'pl-9 pr-4' : 'px-4'}`} 
    />
  </div>
);

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition appearance-none cursor-pointer">
    {children}
  </select>
);

const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, onSave, editingId, assignments, category, masterData, setMasterData }) => {
  const [formData, setFormData] = useState<Partial<Assignment>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const config = MENU_CONFIG[category];
  const isSummary = category === 'summary_plan';
  const isPlan = config?.isPlan && !isSummary;
  const isSub = config?.isSub;

  useEffect(() => {
    if (editingId) {
      const item = assignments.find(a => a.id === editingId);
      if (item) setFormData(item);
    } else {
        const prefix = config?.prefix || 'JOB';
        const year = new Date().getFullYear().toString().slice(-2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const count = assignments.filter(a => a.category === category).length + 1;
        const padLen = isSummary ? 4 : 3;
        const internalId = `${prefix}${year}${month}${count.toString().padStart(padLen, '0')}`;
        
        let initialData: Partial<Assignment> = {
            internalId, category, status: 'new', jobType: '', description: '',
            nsRespond: [], actionDate: new Date().toISOString().slice(0, 16),
        };

        if (isSub) {
            const rr = masterData.rrIndexes[category] || { index: 0, lastJob: '-' };
            const subList = masterData.subcontractors;
            if (subList.length > 0) initialData.subcontractor = subList[rr.index % subList.length];
        }
        setFormData(initialData);
    }
  }, [editingId, assignments, category, config, masterData, isSub, isSummary]);

  const handleJobTypeChange = (val: string) => {
    setFormData(prev => {
        const updated = { ...prev, jobType: val };
        if (isSub && !editingId) {
            if (val === 'Special Job') updated.subcontractor = ''; // ให้เลือกเอง
            else {
                const rr = masterData.rrIndexes[category] || { index: 0, lastJob: '-' };
                const subList = masterData.subcontractors;
                if (subList.length > 0) updated.subcontractor = subList[rr.index % subList.length];
            }
        }
        return updated;
    });
  };

  const toggleNs = (name: string) => {
    setFormData(prev => {
      const current = prev.nsRespond || [];
      return { ...prev, nsRespond: current.includes(name) ? current.filter(n => n !== name) : [...current, name] };
    });
  };

  const validate = () => {
    const errs: string[] = [];
    if (!formData.jobType) errs.push("เลือก Job Type");
    if (isSummary) {
        if (!formData.routeName) errs.push("ใส่ Route Name");
        if (!formData.symImpact) errs.push("เลือก Sym Impact");
    } else {
        if (!formData.description) errs.push("ใส่ Description");
        if (!formData.agency) errs.push("เลือก Agency Inf.");
    }
    if (isSub && !formData.subcontractor) errs.push("ระบุผู้รับเหมา");
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (!editingId && isSub && formData.jobType !== 'Special Job') {
        const nextIdx = (masterData.rrIndexes[category]?.index || 0) + 1;
        setMasterData(prev => ({
            ...prev, rrIndexes: { ...prev.rrIndexes, [category]: { index: nextIdx, lastJob: formData.description || '-' } }
        }));
    }

    onSave({
      ...formData,
      id: editingId || `JOB-${Date.now()}`,
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Assignment);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl relative animate-fadeIn">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <span className="w-10 h-10 bg-brand-500 text-white rounded-xl flex items-center justify-center"><i className="fa-solid fa-pen-to-square"></i></span>
                {editingId ? 'แก้ไขข้อมูล' : 'บันทึกงานใหม่'} : {config?.title}
                <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-lg font-mono text-gray-500 uppercase tracking-tighter ml-2">ID: {formData.internalId}</span>
            </h3>
            <button onClick={onClose} className="w-10 h-10 hover:bg-gray-100 rounded-xl transition text-gray-400"><i className="fa-solid fa-xmark"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            {errors.length > 0 && <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-2xl"><ul className="list-disc list-inside">{errors.map((e, i) => <li key={i} className="text-[10px] text-red-600 font-bold uppercase">{e}</li>)}</ul></div>}

            {isSub && (
                <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>ทีมก่อนหน้า (Previous)</Label>
                            <p className="text-sm font-bold text-gray-400">{masterData.rrIndexes[category]?.lastJob || '-'}</p>
                        </div>
                        <div className="text-right">
                            <Label>ทีมที่ได้รับงาน (Subcontractor)</Label>
                            {formData.jobType === 'Special Job' ? (
                                <Select value={formData.subcontractor || ''} onChange={e => setFormData({...formData, subcontractor: e.target.value})}>
                                    <option value="">เลือกทีมเอง (Special Job)...</option>
                                    {masterData.subcontractors.map(s => <option key={s} value={s}>{s}</option>)}
                                </Select>
                            ) : (
                                <p className="text-3xl font-black text-brand-600 uppercase tracking-tight">{formData.subcontractor || 'No Team'}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isPlan && (
                    <>
                        <div><Label>Interruption ID - CM</Label><Input icon="fa-fingerprint" value={formData.cmId || ''} onChange={e => setFormData({...formData, cmId: e.target.value})} /></div>
                        <div><Label>Project</Label><Select value={formData.project || ''} onChange={e => setFormData({...formData, project: e.target.value})}><option value="">เลือก...</option>{PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}</Select></div>
                    </>
                )}
                <div><Label required>Job Type</Label><Select value={formData.jobType || ''} onChange={e => handleJobTypeChange(e.target.value)} required><option value="">เลือก...</option>{JOB_TYPES[config?.jobTypeKey as keyof typeof JOB_TYPES]?.map(t => <option key={t} value={t}>{t}</option>)}</Select></div>
                
                {!isSummary && <div className="lg:col-span-2"><Label required>Description</Label><Input value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="ระบุรายละเอียดงาน..." required /></div>}
                
                {!isSummary && <div><Label required>Agency Inf.</Label><Select value={formData.agency || ''} onChange={e => setFormData({...formData, agency: e.target.value})} required><option value="">เลือก...</option>{AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}</Select></div>}
                
                {isPlan ? (
                    <>
                        <div><Label>Action Date (วันที่ปฏิบัติงาน)</Label><Input icon="fa-calendar-day" type="date" value={formData.planDate || ''} onChange={e => setFormData({...formData, planDate: e.target.value, actionDate: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Start</Label><Input icon="fa-clock" type="time" value={formData.planStartTime || ''} onChange={e => setFormData({...formData, planStartTime: e.target.value})} /></div>
                            <div><Label>End</Label><Input icon="fa-clock" type="time" value={formData.planEndTime || ''} onChange={e => setFormData({...formData, planEndTime: e.target.value})} /></div>
                        </div>
                        <div><Label>Sent Plan Date (วันที่ส่งแผน)</Label><Input icon="fa-paper-plane" type="date" value={formData.sentPlanDate || ''} onChange={e => setFormData({...formData, sentPlanDate: e.target.value})} /></div>
                        <div className="lg:col-span-2"><Label>Unplanned Impact</Label><Input icon="fa-circle-exclamation" value={formData.unplannedImpact || ''} onChange={e => setFormData({...formData, unplannedImpact: e.target.value})} /></div>
                        <div><Label>Interruption Item (ลูกค้าที่กระทบ)</Label><Input icon="fa-users" type="number" value={formData.itemCount || ''} onChange={e => setFormData({...formData, itemCount: e.target.value})} /></div>
                    </>
                ) : !isSummary && (
                    <>
                        <div><Label required>Action Date</Label><Input icon="fa-calendar-check" type="datetime-local" value={formData.actionDate?.slice(0, 16) || ''} onChange={e => setFormData({...formData, actionDate: e.target.value})} required /></div>
                        <div><Label>Due Date</Label><Input icon="fa-calendar-day" type="date" value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} /></div>
                    </>
                )}

                {isSummary && (
                    <>
                        <div><Label>รหัสเส้นทาง (Route Code)</Label><Input icon="fa-hashtag" value={formData.routeCode || ''} onChange={e => setFormData({...formData, routeCode: e.target.value})} /></div>
                        <div><Label>ไฟฟ้าเขต (District)</Label><Input icon="fa-bolt" value={formData.electricDistrict || ''} onChange={e => setFormData({...formData, electricDistrict: e.target.value})} /></div>
                        <div className="lg:col-span-2"><Label required>ชื่อเส้นทาง (Route Name)</Label><Input icon="fa-road" value={formData.routeName || ''} onChange={e => setFormData({...formData, routeName: e.target.value})} /></div>
                        <div><Label>จำนวนฝั่ง (Side Count)</Label><Select value={formData.sideCount || ''} onChange={e => setFormData({...formData, sideCount: e.target.value})}><option value="">เลือก...</option>{SIDE_COUNTS.map(s => <option key={s} value={s}>{s}</option>)}</Select></div>
                        <div><Label>จุดเริ่ม GPS</Label><Input icon="fa-location-dot" value={formData.gpsStart || ''} onChange={e => setFormData({...formData, gpsStart: e.target.value})} /></div>
                        <div><Label>จุดสิ้นสุด GPS</Label><Input icon="fa-location-crosshairs" value={formData.gpsEnd || ''} onChange={e => setFormData({...formData, gpsEnd: e.target.value})} /></div>
                        <div><Label>ระยะทาง (กม.)</Label><Input icon="fa-arrows-left-right" type="number" step="0.01" value={formData.distance || ''} onChange={e => setFormData({...formData, distance: parseFloat(e.target.value)})} /></div>
                        <div><Label>OWNER (บริษัทที่รับผิดชอบ)</Label><Input icon="fa-building-shield" value={formData.owner || ''} onChange={e => setFormData({...formData, owner: e.target.value})} /></div>
                        <div className="lg:col-span-2"><Label>ข้อกำหนดแนวข้าม (Cross Req)</Label><Input icon="fa-file-lines" value={formData.crossReq || ''} onChange={e => setFormData({...formData, crossReq: e.target.value})} /></div>
                        <div><Label>วันตัดสาย (Due Date)</Label><Input icon="fa-calendar-xmark" type="date" value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} /></div>
                        <div><Label required>Sym Impact</Label><Select value={formData.symImpact || ''} onChange={e => setFormData({...formData, symImpact: e.target.value})} required><option value="">เลือก...</option>{IMPACT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}</Select></div>
                    </>
                )}

                {isSub && (
                    <>
                        <div className="lg:col-span-2"><Label>รายละเอียดราคา (Objective)</Label><Input icon="fa-bullseye" value={formData.objective || ''} onChange={e => setFormData({...formData, objective: e.target.value})} /></div>
                        <div><Label>ราคาประมาณการ (Expenses)</Label><Input icon="fa-coins" type="number" value={formData.expenses || ''} onChange={e => setFormData({...formData, expenses: parseFloat(e.target.value)})} /></div>
                        <div><Label>Route Code</Label><Input icon="fa-route" value={formData.routeCode || ''} onChange={e => setFormData({...formData, routeCode: e.target.value})} /></div>
                    </>
                )}

                {!isSummary && !isPlan && !isSub && (
                    <>
                        <div><Label>Team Request</Label><Select value={formData.teamReq || ''} onChange={e => setFormData({...formData, teamReq: e.target.value})}><option value="">เลือก...</option>{TEAM_REQUESTS.map(t => <option key={t} value={t}>{t}</option>)}</Select></div>
                        <div><Label>Req Person (จำนวนคน)</Label><Input icon="fa-person-digging" type="number" min="1" value={formData.reqPerson || 1} onChange={e => setFormData({...formData, reqPerson: parseInt(e.target.value)})} /></div>
                        <div><Label>Ref Job ID</Label><Input icon="fa-link" value={formData.refJobId || ''} onChange={e => setFormData({...formData, refJobId: e.target.value})} /></div>
                    </>
                )}

                {!isSummary && <div className="lg:col-span-2"><Label>Location / Road</Label><Input icon="fa-map-pin" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} /></div>}
                
                <div className="row-span-2 space-y-3">
                    <Label required>NS Respond (ผู้รับผิดชอบ)</Label>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 max-h-[150px] overflow-y-auto custom-scrollbar">
                        <div className="flex flex-wrap gap-2">
                            {masterData.nsRespond.map((n, i) => (
                                <button key={i} type="button" onClick={() => toggleNs(n.name)} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition border ${formData.nsRespond?.includes(n.name) ? 'bg-brand-500 text-white border-brand-600' : 'bg-white text-gray-500 border-gray-100 hover:border-brand-200'}`}>{n.name}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {!isSummary && <div><Label>GPS / Remark</Label><textarea value={formData.remark || ''} onChange={e => setFormData({...formData, remark: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand-500 outline-none h-20" placeholder="พิกัด หรือ หมายเหตุอื่นๆ..."></textarea></div>}
            </div>
        </form>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
            <button type="button" onClick={onClose} className="px-8 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-100 font-bold text-xs uppercase transition">Cancel</button>
            <button type="submit" onClick={handleSubmit} className="px-12 py-3 bg-brand-600 text-white rounded-xl shadow-xl shadow-brand-100 hover:bg-brand-700 font-black text-xs uppercase tracking-widest transition active:scale-95 flex items-center gap-2"><i className="fa-solid fa-save"></i> บันทึกข้อมูล</button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
