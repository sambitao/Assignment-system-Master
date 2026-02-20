
export type JobStatus = 'new' | 'process' | 'assign' | 'approve' | 'finish' | 'complete' | 'update_fms' | 'cancel';

export type Category = 
  | 'plan_interruption' 
  | 'summary_plan' 
  | 'team' 
  | 'sub_preventive' 
  | 'sub_reroute' 
  | 'sub_reconfigure' 
  | 'dashboard_analytics' 
  | 'sub_dashboard'
  | 'summary_dashboard'
  | 'setting'
  | 'link_support'
  | 'calendar';

export interface NSRespondItem {
  name: string;
  phone: string;
}

export interface Assignment {
  id: string;
  category: Category;
  internalId: string;
  jobType: string;
  description: string;
  agency?: string;
  location?: string;
  remark?: string;
  nsRespond: string[];
  status: JobStatus;
  actionDate: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  // Plan Interruption specific
  cmId?: string;
  project?: string;
  itemCount?: string;
  planDate?: string;
  planStartTime?: string;
  planEndTime?: string;
  sentPlanDate?: string;
  unplannedImpact?: string;
  // Summary Plan specific
  routeCode?: string;
  electricDistrict?: string;
  routeName?: string;
  sideCount?: string;
  gpsStart?: string;
  gpsEnd?: string;
  distance?: number;
  owner?: string;
  crossReq?: string;
  symImpact?: string;
  progressPercent?: number;
  progressSteps?: string[];
  projectCode?: string;
  // Subcontractor & Technical Details
  objective?: string;
  expenses?: number;
  subcontractor?: string;
  asNumber?: string;
  asDate?: string;        // Added
  ssfNumber?: string;
  ssfDate?: string;       // Added
  fmsUpdateDate?: string; // Added
  approveDate?: string;   // Added
  teamReq?: string;
  reqPerson?: number;
  refJobId?: string;
  gps?: string;
  fileUrl?: string;
  fileName?: string;
  // Cancellation logic
  cancelBy?: string;
  cancelReason?: string;
  cancelDate?: string;
}

export interface MasterData {
  subcontractors: string[];
  nsRespond: NSRespondItem[];
  rrIndexes: Record<string, { index: number; lastJob: string }>;
  linkSupport: LinkItem[];
}

export interface LinkItem {
  name: string;
  url: string;
  type: string;
  detail: string;
}
