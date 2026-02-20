
import React from 'react';

export const PROJECTS = [ "MEA", "PEA", "NBTC", "Sky Train", "Bangkok Metropolis", "BTS", "MRT", "NT", "Customer", "Department Of Highways", "Department Of Rural Road", "Landlord", "Local Authorty", "Motorway", "State Railway OF Thailand", "Underground", "MOI", "Noah", "DWDM", "OLT and ONU", "Site Relocation", "Fiber Infra Sharing", "Improvement", "Migration","Other" ];

export const AGENCIES = [ "MEA", "PEA", "NBTC", "Sky Train", "NPD", "SQM", "Region", "NOC", "SQI", "ROW", "Landlord", "TPD", "Customer", "Bangkok Metropolis", "BTS", "MRT", "NT", "Motorway", "Department Of Highways", "Department Of Rural Road", "Other" ];

export const TEAM_REQUESTS = [ "NOC", "HelpDesk", "TPD", "NPD", "SQM", "SQI", "Sale", "Region BKK", "Cores Network", "Landlord", "SDM", "Region Provincial", "ROW", "Other" ];

export const SIDE_COUNTS = ["1 ฝั่ง", "2 ฝั่ง"];

export const IMPACT_STATUS = ["Impact", "Non Impact", "Risk", "None"];

export const DISTRICTS = ["BKK", "Cen", "North", "East", "South", "West", "NE"];

export const JOB_TYPES = { 
    team: ["Improvement", "Create Route", "Meeting", "Team Daily", "Support", "Other"], 
    plan: ["Interruption OFC", "Interruption Equipment", "Information", "Other"], 
    summary_plan: ["MEA", "PEA","MOI","Sky Trai","Bangkok Metropolis","Department Of Highways","Landlord","Underground","Fiber Infra Sharing", "Other"],
    preventive: ["Preventive มัดรวบสาย", "Preventive ย้ายแนวสาย", "Preventive เข้าคอนใหม่", "Preventive ติดสติ๊กเกอร์", "Preventive รื้อถอนสายตาย", "Preventive Stand by", "Preventive ทำความสะอาดSite","Preventive งานร้องเรียน", "Special Job", "Other"], 
    reroute: ["Reroute Project", "Underground", "MOI", "Reconfig for Reroute", "Special Job", "Other"], 
    reconfigure: ["Reconfig high loss", "Reconfig New Route","Cancle OFC","Special Job", "Other"] 
};

export const MENU_CONFIG: Record<string, { title: string; prefix: string; jobTypeKey: keyof typeof JOB_TYPES; isSub?: boolean; isPlan?: boolean; isSummary?: boolean }> = {
    plan_interruption: { title: 'Interruption Plan', prefix: 'IP', jobTypeKey: 'plan', isPlan: true },
    summary_plan: { title: 'Project Plan', prefix: 'Sum', jobTypeKey: 'summary_plan', isSummary: true },
    team: { title: 'Assignment Interruption Team', prefix: 'AI', jobTypeKey: 'team' },
    sub_preventive: { title: 'Assignment Preventive', prefix: 'PVT', jobTypeKey: 'preventive', isSub: true },
    sub_reroute: { title: 'Assignment Reroute', prefix: 'RER', jobTypeKey: 'reroute', isSub: true },
    sub_reconfigure: { title: 'Assignment Reconfigure & Cancel', prefix: 'REF', jobTypeKey: 'reconfigure', isSub: true }
};
