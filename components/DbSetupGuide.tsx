
import React, { useState } from 'react';

const SQL_SAFE = `-- 1. ตรวจสอบและสร้างตาราง
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  internal_id TEXT,
  job_type TEXT,
  description TEXT,
  agency TEXT,
  location TEXT,
  remark TEXT,
  ns_respond TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'new',
  action_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  details JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS master_config (
  id TEXT PRIMARY KEY DEFAULT 'current_config',
  subcontractors TEXT[] DEFAULT '{}',
  ns_respond JSONB DEFAULT '[]'::jsonb,
  rr_indexes JSONB DEFAULT '{}'::jsonb,
  link_support JSONB DEFAULT '[]'::jsonb
);

-- 2. จัดการเรื่องความปลอดภัยแบบ Full Access (รวมถึงการลบ)
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access" ON assignments;
DROP POLICY IF EXISTS "Allow all access" ON master_config;

-- สร้างนโยบายที่อนุญาต SELECT, INSERT, UPDATE, DELETE ให้กับทุกคน (Public)
CREATE POLICY "Allow all access" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON master_config FOR ALL USING (true) WITH CHECK (true);

-- 3. ให้สิทธิ์ DB Roles (ต้องมีเพื่อให้ Supabase ยอมรับคำขอจาก Anon Key)
GRANT ALL ON TABLE assignments TO anon, authenticated, service_role;
GRANT ALL ON TABLE master_config TO anon, authenticated, service_role;

-- 4. ตั้งค่าเริ่มต้น
INSERT INTO master_config (id, subcontractors, ns_respond)
VALUES ('current_config', ARRAY['Sub A', 'Sub B', 'Sub C'], '[{"name": "Admin", "phone": "08x-xxx-xxxx"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;`;

const SQL_RESET = `-- ⚠️ คำเตือน: สคริปต์นี้จะลบข้อมูลทิ้งและเริ่มต้นใหม่ทั้งหมด
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS master_config CASCADE;

CREATE TABLE assignments (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  internal_id TEXT,
  job_type TEXT,
  description TEXT,
  agency TEXT,
  location TEXT,
  remark TEXT,
  ns_respond TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'new',
  action_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  details JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE master_config (
  id TEXT PRIMARY KEY DEFAULT 'current_config',
  subcontractors TEXT[] DEFAULT '{}',
  ns_respond JSONB DEFAULT '[]'::jsonb,
  rr_indexes JSONB DEFAULT '{}'::jsonb,
  link_support JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON master_config FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON TABLE assignments TO anon, authenticated, service_role;
GRANT ALL ON TABLE master_config TO anon, authenticated, service_role;
INSERT INTO master_config (id, subcontractors, ns_respond) VALUES ('current_config', ARRAY['Sub A', 'Sub B', 'Sub C'], '[{"name": "Admin", "phone": ""}]'::jsonb);`;

const DbSetupGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'safe' | 'reset'>('safe');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('คัดลอกสคริปต์ SQL แล้ว! โปรดไปรันที่ Supabase SQL Editor');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-white font-sans selection:bg-brand-500/30">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-brand-600 to-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-500/30 rotate-3">
            <i className="fa-solid fa-database text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight">Database Actions Fix</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">หากคุณไม่สามารถ "ลบ" ข้อมูลได้ โปรดรันสคริปต์ด้านล่างนี้ใน Supabase SQL Editor เพื่อปลดล็อกสิทธิ์ครับ</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-700 p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-8 w-fit">
                <button 
                    onClick={() => setActiveTab('safe')}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'safe' ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <i className="fa-solid fa-shield-halved mr-2"></i> Fix Permissions (Safe)
                </button>
                <button 
                    onClick={() => setActiveTab('reset')}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'reset' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <i className="fa-solid fa-triangle-exclamation mr-2"></i> Factory Reset
                </button>
            </div>

            <div className="space-y-6">
                <div className="relative group">
                    <pre className="bg-slate-950 p-6 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-x-auto custom-scrollbar h-72 border border-slate-900 shadow-inner">
                        {activeTab === 'safe' ? SQL_SAFE : SQL_RESET}
                    </pre>
                    <button 
                        onClick={() => copyToClipboard(activeTab === 'safe' ? SQL_SAFE : SQL_RESET)}
                        className="absolute top-4 right-4 bg-slate-800 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xl flex items-center gap-2"
                    >
                        <i className="fa-solid fa-copy"></i> Copy SQL
                    </button>
                </div>

                <div className="flex justify-center">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-12 py-5 bg-white text-slate-900 rounded-2xl text-xs font-black hover:bg-brand-500 hover:text-white transition-all shadow-xl flex items-center gap-3 active:scale-95"
                    >
                        <i className="fa-solid fa-arrows-rotate text-lg"></i> REFRESH APP AFTER SQL RUN
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DbSetupGuide;
