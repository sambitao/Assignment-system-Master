
import { createClient } from '@supabase/supabase-js';
import { Assignment, MasterData, NSRespondItem } from '../types';

const supabaseUrl = 'https://mtwzxewaocauedlpffad.supabase.co';
const supabaseKey = 'sb_publishable_gjAH4q6zHonQ1E8uvBovDg_zAEFzpZf';

export const supabase = createClient(supabaseUrl, supabaseKey);

const cleanNsRespondList = (list: any[]): NSRespondItem[] => {
  if (!Array.isArray(list)) return [];
  
  return list.map(item => {
    if (typeof item === 'string') {
      if (item.startsWith('{')) {
        try {
          const parsed = JSON.parse(item);
          return { name: parsed.name || item, phone: parsed.phone || '' };
        } catch (e) {
          return { name: item, phone: '' };
        }
      }
      return { name: item, phone: '' };
    }
    
    if (typeof item === 'object' && item !== null) {
      let name = item.name || '';
      let phone = item.phone || '';
      return { name: String(name), phone: String(phone) };
    }
    
    return { name: 'Unknown', phone: '' };
  });
};

export const supabaseService = {
  async fetchAssignments(): Promise<Assignment[]> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(row => {
        return {
          ...row,
          ...row.details,
          nsRespond: row.ns_respond || [],
          internalId: row.internal_id,
          jobType: row.job_type,
          actionDate: row.action_date,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      });
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      return [];
    }
  },

  async upsertAssignment(job: Assignment) {
    const { id, category, internalId, jobType, description, agency, location, remark, nsRespond, status, actionDate, createdAt, updatedAt, ...details } = job;
    
    const dbRow = {
      id,
      category,
      internal_id: internalId,
      job_type: jobType,
      description,
      agency,
      location,
      remark,
      ns_respond: nsRespond, 
      status: status || 'new',
      action_date: actionDate,
      updated_at: new Date().toISOString(),
      details
    };

    const { error } = await supabase.from('assignments').upsert(dbRow);
    if (error) throw error;
  },

  async upsertAssignmentsBatch(jobs: Assignment[]) {
    const rows = jobs.map(job => {
      const { id, category, internalId, jobType, description, agency, location, remark, nsRespond, status, actionDate, createdAt, updatedAt, ...details } = job;
      return {
        id,
        category,
        internal_id: internalId,
        job_type: jobType,
        description,
        agency,
        location,
        remark,
        ns_respond: nsRespond,
        status: status || 'new',
        action_date: actionDate,
        updated_at: new Date().toISOString(),
        details
      };
    });

    const { error } = await supabase.from('assignments').upsert(rows);
    if (error) throw error;
  },

  async deleteAssignment(id: string) {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    return error;
  },

  async fetchMasterData(): Promise<MasterData | null> {
    try {
      const { data, error } = await supabase.from('master_config').select('*').eq('id', 'current_config').single();
      if (error) return null;
      return {
        subcontractors: data.subcontractors || [],
        nsRespond: cleanNsRespondList(data.ns_respond || []),
        rrIndexes: data.rr_indexes || {},
        linkSupport: data.link_support || []
      };
    } catch (err) { return null; }
  },

  async saveMasterData(config: MasterData) {
    const { error } = await supabase.from('master_config').upsert({
      id: 'current_config',
      subcontractors: config.subcontractors,
      ns_respond: config.nsRespond,
      rr_indexes: config.rrIndexes,
      link_support: config.linkSupport
    });
    if (error) throw error;
  }
};
