
import React from 'react';
import { Assignment } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

interface SubDashboardProps {
  assignments: Assignment[];
}

const SubDashboard: React.FC<SubDashboardProps> = ({ assignments }) => {
  const subJobs = assignments.filter(a => ['sub_preventive', 'sub_reroute', 'sub_reconfigure'].includes(a.category));
  
  const totalCost = subJobs.reduce((sum, a) => sum + (a.expenses || 0), 0);
  const totalJobs = subJobs.length;
  const avgCost = totalJobs > 0 ? totalCost / totalJobs : 0;
  
  // Aggregate cost by subcontractor
  const subCosts = subJobs.reduce((acc, curr) => {
    const name = curr.subcontractor || 'Unassigned';
    acc[name] = (acc[name] || 0) + (curr.expenses || 0);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(subCosts).map(([name, cost]) => ({ name, cost }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-emerald-500">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Expenses</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-600">{totalCost.toLocaleString()} ฿</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Total Sub Jobs</p>
            <h3 className="text-2xl font-bold mt-1 text-blue-600">{totalJobs}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-purple-500">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Avg Cost / Job</p>
            <h3 className="text-2xl font-bold mt-1 text-purple-600">{Math.round(avgCost).toLocaleString()} ฿</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h4 className="font-bold text-gray-700 mb-8 flex items-center">
            <i className="fa-solid fa-chart-bar mr-2 text-brand-500"></i>
            Cost Distribution by Team
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" fontSize={10} hide />
                <YAxis dataKey="name" type="category" fontSize={10} width={80} />
                <Tooltip formatter={(value: number) => value.toLocaleString() + ' ฿'} />
                <Bar dataKey="cost" fill="#10b981" radius={[0, 4, 4, 0]}>
                   {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#34d399'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

export default SubDashboard;
