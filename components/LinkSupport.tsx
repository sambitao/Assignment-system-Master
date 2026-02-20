
import React, { useState } from 'react';
import { MasterData, LinkItem } from '../types';

interface LinkSupportProps {
  masterData: MasterData;
  setMasterData: React.Dispatch<React.SetStateAction<MasterData>>;
}

const LinkSupport: React.FC<LinkSupportProps> = ({ masterData, setMasterData }) => {
  const [form, setForm] = useState<LinkItem>({ name: '', url: '', type: 'Support', detail: '' });

  const addLink = () => {
    if (!form.name || !form.url) return;
    setMasterData(prev => ({ ...prev, linkSupport: [...prev.linkSupport, form] }));
    setForm({ name: '', url: '', type: 'Support', detail: '' });
  };

  const removeLink = (index: number) => {
    setMasterData(prev => ({ ...prev, linkSupport: prev.linkSupport.filter((_, i) => i !== index) }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-teal-100 text-teal-600 p-2 rounded-xl mr-3"><i className="fa-solid fa-link"></i></span>
              Support Resources
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <input 
                type="text" placeholder="Site Name" 
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              />
              <input 
                type="text" placeholder="URL (https://...)" 
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.url} onChange={e => setForm({...form, url: e.target.value})}
              />
              <select 
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              >
                  <option>Support</option>
                  <option>Site Access</option>
                  <option>Documentation</option>
                  <option>Other</option>
              </select>
              <button onClick={addLink} className="bg-brand-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-100 hover:bg-brand-600 transition">Add Resource</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {masterData.linkSupport.map((link, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition relative group">
                      <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-500 flex items-center justify-center mr-3"><i className="fa-solid fa-globe text-xs"></i></div>
                          <div>
                              <p className="font-bold text-gray-800 text-sm">{link.name}</p>
                              <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">{link.type}</p>
                          </div>
                      </div>
                      <a href={link.url} target="_blank" className="text-xs text-blue-500 hover:underline line-clamp-1 break-all mb-1">{link.url}</a>
                      <button onClick={() => removeLink(i)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><i className="fa-solid fa-trash-can text-xs"></i></button>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default LinkSupport;
