
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Category, Assignment } from '../types';
import { MENU_CONFIG } from '../constants';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category;
    onImportSuccess: (data: Assignment[]) => Promise<void>;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, category, onImportSuccess }) => {
    const [fileData, setFileData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const config = MENU_CONFIG[category];

    const MAPPING_DICTIONARY: Record<string, string[]> = {
        internalId: ['internalid', 'jobid', 'รหัสงาน', 'id', 'job id', 'job_id', 'เลขที่งาน', 'internal_id', 'refid'],
        jobType: ['jobtype', 'type', 'ประเภทงาน', 'job_type', 'ประเภท', 'worktype', 'หมวดงาน'],
        description: ['description', 'detail', 'รายละเอียด', 'รายละเอียดงาน', 'desc', 'งาน', 'subject'],
        agency: ['agency', 'หน่วยงาน', 'agency_inf', 'agency inf', 'agency name', 'หน่วยงานที่แจ้ง', 'ลูกค้า'],
        location: ['location', 'สถานที่', 'road', 'ถนน', 'area', 'พิกัด', 'site', 'sitename'],
        actionDate: ['actiondate', 'date', 'วันที่', 'action date', 'job date', 'วันที่ปฏิบัติงาน', 'start date', 'วันที่เริ่ม', 'plan date'],
        dueDate: ['duedate', 'due date', 'กำหนดเสร็จ', 'วันตัดสาย', 'due_date', 'finish date', 'วันที่เสร็จ'],
        nsRespond: ['nsrespond', 'respond', 'ผู้รับผิดชอบ', 'ns', 'ns respond', 'เจ้าหน้าที่', 'assignee', 'ns_respond'],
        subcontractor: ['subcontractor', 'sub', 'ผู้รับเหมา', 'ทีม', 'team', 'sub team', 'sub_team'],
        project: ['project', 'โครงการ', 'งานโครงการ', 'client', 'customer'],
        projectCode: ['projectcode', 'project code', 'รหัสโครงการ', 'pcode', 'project_code'],
        routeName: ['routename', 'route name', 'ชื่อเส้นทาง', 'route', 'เส้นทาง'],
        routeCode: ['routecode', 'route code', 'รหัสเส้นทาง', 'rcode', 'route_code'],
        // ฟิลด์เพิ่มเติมจากภาพถ่าย
        asNumber: ['asnumber', 'as number', 'เลข as', 'as_number', 'as no'],
        objective: ['objective', 'วัตถุประสงค์', 'เป้าหมาย', 'งานที่ทำ'],
        expenses: ['expenses', 'ราคา', 'ค่าใช้จ่าย', 'งบประมาณ', 'cost', 'amount'],
        status: ['status', 'สถานะ', 'job status', 'state']
    };

    const formatDate = (val: any): string => {
        if (!val || val === '-') return '-';
        if (val instanceof Date) return isNaN(val.getTime()) ? '-' : val.toISOString();
        const d = new Date(val);
        return !isNaN(d.getTime()) ? d.toISOString() : String(val);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { defval: "-", raw: false, dateNF: 'yyyy-mm-dd' });
                setFileData(data);
            } catch (err) {
                alert("ไม่สามารถอ่านไฟล์ได้ โปรดตรวจสอบรูปแบบไฟล์");
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleConfirmImport = async () => {
        if (fileData.length === 0) return;
        setIsLoading(true);
        
        try {
            const prefix = config?.prefix || 'JOB';
            const timestamp = Date.now();
            
            const assignments: Assignment[] = fileData.map((row, idx) => {
                const getMappedValue = (fieldKey: string) => {
                    const synonyms = MAPPING_DICTIONARY[fieldKey] || [fieldKey];
                    const matchKey = Object.keys(row).find(rk => {
                        const cleanKey = rk.toLowerCase().replace(/\s/g, '').replace(/_/g, '');
                        return synonyms.some(s => s.toLowerCase().replace(/\s/g, '').replace(/_/g, '') === cleanKey);
                    });
                    
                    if (matchKey) {
                        const val = row[matchKey];
                        return (val === null || val === undefined || String(val).trim() === '') ? '-' : val;
                    }
                    return '-';
                };

                // จัดการ NS Respond (แปลงจาก "A, B" เป็น ["A", "B"])
                const nsRaw = getMappedValue('nsRespond');
                const nsArray = nsRaw !== '-' 
                    ? String(nsRaw).split(',').map(n => n.trim()).filter(n => n !== '') 
                    : [];

                // จัดการค่าใช้จ่าย (แปลงเป็น Number)
                const expRaw = getMappedValue('expenses');
                const expenses = expRaw !== '-' ? parseFloat(String(expRaw).replace(/,/g, '')) : 0;

                // จัดการสถานะ
                const statusRaw = String(getMappedValue('status')).toLowerCase();
                const validStatus: any = ['new', 'process', 'assign', 'approve', 'finish', 'complete', 'update_fms', 'cancel'].includes(statusRaw) 
                    ? statusRaw 
                    : 'new';

                // เก็บข้อมูลดิบทั้งหมดเพื่อกันข้อมูลหาย
                const sanitizedRow: any = {};
                Object.keys(row).forEach(key => {
                    const v = row[key];
                    sanitizedRow[key] = (v === null || v === undefined || String(v).trim() === '') ? '-' : v;
                });

                return {
                    ...sanitizedRow, // ข้อมูลดั้งเดิมทั้งหมดจะไปอยู่ที่ details ใน DB
                    id: `IMPORT-${timestamp}-${idx}`,
                    category,
                    internalId: String(getMappedValue('internalId')) !== '-' ? String(getMappedValue('internalId')) : `${prefix}${timestamp.toString().slice(-4)}${idx.toString().padStart(3, '0')}`,
                    jobType: String(getMappedValue('jobType')),
                    description: String(getMappedValue('description')),
                    agency: String(getMappedValue('agency')),
                    location: String(getMappedValue('location')),
                    subcontractor: String(getMappedValue('subcontractor')),
                    asNumber: String(getMappedValue('asNumber')),
                    objective: String(getMappedValue('objective')),
                    expenses: isNaN(expenses) ? 0 : expenses,
                    project: getMappedValue('project'),
                    projectCode: getMappedValue('projectCode'),
                    routeName: getMappedValue('routeName'),
                    routeCode: getMappedValue('routeCode'),
                    actionDate: formatDate(getMappedValue('actionDate')) !== '-' ? formatDate(getMappedValue('actionDate')) : new Date().toISOString(),
                    dueDate: formatDate(getMappedValue('dueDate')) !== '-' ? formatDate(getMappedValue('dueDate')) : undefined,
                    status: validStatus,
                    nsRespond: nsArray,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                } as any;
            });

            await onImportSuccess(assignments);
            onClose();
            setFileData([]);
        } catch (error) {
            console.error("Import Error:", error);
            alert("เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col border border-gray-100 max-h-[90vh]">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-green-200">
                            <i className="fa-solid fa-bolt-lightning"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Smart Import Center</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Category: {config?.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 hover:bg-white hover:shadow-md rounded-xl transition text-gray-400 border border-transparent hover:border-gray-100"><i className="fa-solid fa-xmark"></i></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {fileData.length === 0 ? (
                        <div className="border-4 border-dashed border-gray-100 rounded-[2rem] p-12 text-center hover:border-green-200 transition-colors group relative cursor-pointer">
                            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-300 group-hover:text-green-500"></i>
                            </div>
                            <h4 className="text-lg font-bold text-gray-700">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</h4>
                            <p className="text-xs text-gray-400 mt-2 font-medium">รองรับหัวตาราง: AS Number, Objective, Expenses, NS Respond ฯลฯ</p>
                            <div className="mt-8 flex justify-center gap-3">
                                <span className="px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-bold text-gray-500 border border-gray-100">Smart Mapping Engine</span>
                                <span className="px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-bold text-gray-500 border border-gray-100">Auto Array Transform</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h5 className="text-sm font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                                    <i className="fa-solid fa-magnifying-glass text-green-500"></i>
                                    Data Preview ({fileData.length} Items found)
                                </h5>
                                <button onClick={() => setFileData([])} className="text-[10px] font-bold text-red-500 hover:underline uppercase">Change File</button>
                            </div>
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-inner">
                                <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                                    <table className="w-full text-left border-collapse text-[10px]">
                                        <thead className="sticky top-0 bg-white border-b border-gray-100 shadow-sm">
                                            <tr>
                                                {Object.keys(fileData[0]).map(k => (
                                                    <th key={k} className="p-3 font-bold text-gray-400 uppercase tracking-widest">{k}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {fileData.slice(0, 50).map((row, i) => (
                                                <tr key={i} className="hover:bg-white transition-colors">
                                                    {Object.values(row).map((v: any, j) => (
                                                        <td key={j} className="p-3 text-gray-600 font-medium whitespace-nowrap">{String(v)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {fileData.length > 50 && (
                                    <div className="p-3 bg-white border-t border-gray-100 text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest italic">
                                        Showing top 50 rows only...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-4">
                    <button onClick={onClose} className="px-8 py-3.5 bg-white border border-gray-200 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition active:scale-95">Cancel</button>
                    <button 
                        onClick={handleConfirmImport} 
                        disabled={fileData.length === 0 || isLoading}
                        className={`px-12 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition active:scale-95 flex items-center gap-3 ${fileData.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white shadow-green-100 hover:bg-green-700'}`}
                    >
                        {isLoading ? (
                            <><i className="fa-solid fa-circle-notch animate-spin"></i> Syncing...</>
                        ) : (
                            <><i className="fa-solid fa-cloud-arrow-up"></i> Confirm & Sync</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
