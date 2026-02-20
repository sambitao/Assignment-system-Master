
import React from 'react';
import { Assignment } from '../types';

interface ProjectDashboardProps {
  assignments: Assignment[];
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ assignments }) => {
  const data = assignments.filter(a => a.category === 'summary_plan');
  
  const totalRoutes = data.length;
  const totalDist = data.reduce((sum, a) => sum + (a.distance || 0), 0);
  const impacted = data.filter(a => a.symImpact && a.symImpact !== 'Non Impact').length;
  const completed = data.filter(a => a.status === 'complete' || a.status === 'finish').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProjectCard title="Total Plans" value={totalRoutes} sub={`${totalDist.toFixed(1)} km.`} icon="fa-solid fa-route" color="bg-blue-600" />
          <ProjectCard title="SYMC Impacted" value={impacted} icon="fa-solid fa-triangle-exclamation" color="bg-orange-600" />
          <ProjectCard title="Completed" value={completed} icon="fa-solid fa-circle-check" color="bg-green-600" />
          <ProjectCard title="Success Rate" value={totalRoutes > 0 ? Math.round((completed/totalRoutes)*100)+'%' : '0%'} icon="fa-solid fa-percent" color="bg-brand-600" />
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-6">Recent Project Updates</h4>
        <div className="space-y-4">
            {data.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-500 mr-4 shadow-sm">
                        <i className="fa-solid fa-location-arrow text-xs"></i>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">{item.routeName || 'Unnamed Route'}</p>
                        <p className="text-xs text-gray-400">{item.internalId} • {item.distance} km.</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {item.status.toUpperCase()}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">{item.jobType}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const ProjectCard = ({ title, value, sub, icon, color }: any) => (
    <div className={`${color} p-6 rounded-3xl shadow-xl text-white relative overflow-hidden group`}>
        <div className="relative z-10">
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-2 border-b border-white/20 pb-1">{title}</p>
            <h3 className="text-3xl font-bold leading-none">{value}</h3>
            {sub && <p className="text-[10px] text-white/50 mt-2 font-bold">{sub}</p>}
        </div>
        <i className={`${icon} absolute -bottom-4 -right-4 text-8xl text-white opacity-10 group-hover:scale-110 transition-transform duration-500`}></i>
    </div>
);

export default ProjectDashboard;
