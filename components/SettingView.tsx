
import React, { useState } from 'react';
import { MasterData } from '../types';

interface SettingViewProps {
  masterData: MasterData;
  setMasterData: React.Dispatch<React.SetStateAction<MasterData>>;
}

const SettingView: React.FC<SettingViewProps> = ({ masterData, setMasterData }) => {
  const [newSub, setNewSub] = useState('');
  const [newNsName, setNewNsName] = useState('');
  const [newNsPhone, setNewNsPhone] = useState('');

  const addSub = () => {
    if (!newSub) return;
    setMasterData(prev => ({ ...prev, subcontractors: [...prev.subcontractors, newSub] }));
    setNewSub('');
  };

  const removeSub = (name: string) => {
    setMasterData(prev => ({ ...prev, subcontractors: prev.subcontractors.filter(s => s !== name) }));
  };

  const addNs = () => {
    if (!newNsName) return;
    setMasterData(prev => ({ 
      ...prev, 
      nsRespond: [...prev.nsRespond, { name: newNsName, phone: newNsPhone }] 
    }));
    setNewNsName('');
    setNewNsPhone('');
  };

  const removeNs = (index: number) => {
    setMasterData(prev => ({ 
      ...prev, 
      nsRespond: prev.nsRespond.filter((_, i) => i !== index) 
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subcontractor Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-orange-100 text-orange-600 p-2 rounded-xl mr-3"><i className="fa-solid fa-helmet-safety"></i></span>
                Subcontractor Teams
            </h4>
            <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="Team name..."
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                />
                <button onClick={addSub} className="px-4 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition shadow-lg shadow-brand-100"><i className="fa-solid fa-plus"></i></button>
            </div>
            <div className="space-y-2">
                {masterData.subcontractors.map(s => (
                    <div key={s} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                        <span className="text-sm font-medium text-gray-700">{s}</span>
                        <button onClick={() => removeSub(s)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                ))}
            </div>
        </div>

        {/* NS Respond Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-xl mr-3"><i className="fa-solid fa-user-tag"></i></span>
                NS Respond (เจ้าหน้าที่)
            </h4>
            <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="ชื่อ-นามสกุล"
                      value={newNsName}
                      onChange={(e) => setNewNsName(e.target.value)}
                    />
                    <input 
                      type="text" 
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="เบอร์โทรศัพท์"
                      value={newNsPhone}
                      onChange={(e) => setNewNsPhone(e.target.value)}
                    />
                </div>
                <button onClick={addNs} className="w-full py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-100 font-bold text-xs">
                    <i className="fa-solid fa-plus mr-2"></i> เพิ่มเจ้าหน้าที่
                </button>
            </div>
            <div className="space-y-2">
                {masterData.nsRespond.map((n, idx) => {
                    // ทำความสะอาดชื่อเผื่อกรณีมี JSON หลุดมา
                    let displayName = n.name || '';
                    let displayPhone = n.phone || '';
                    
                    if (typeof displayName === 'string' && displayName.startsWith('{')) {
                        try {
                            const inner = JSON.parse(displayName);
                            displayName = inner.name || displayName;
                            displayPhone = inner.phone || displayPhone;
                        } catch(e) {}
                    }

                    return (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-800">{displayName}</span>
                                {displayPhone && <span className="text-[10px] text-gray-500 flex items-center mt-0.5"><i className="fa-solid fa-phone text-[8px] mr-1.5"></i>{displayPhone}</span>}
                            </div>
                            <button onClick={() => removeNs(idx)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-2"><i className="fa-solid fa-trash-can"></i></button>
                        </div>
                    );
                })}
                {masterData.nsRespond.length === 0 && (
                    <p className="text-center py-8 text-gray-300 text-xs italic">ยังไม่มีรายชื่อเจ้าหน้าที่</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingView;
