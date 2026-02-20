
import React, { useState, useMemo } from 'react';
import { Assignment } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { MENU_CONFIG } from '../constants';

interface DashboardProps {
  assignments: Assignment[];
}

const COLORS = ['#3b82f6', '#f97316', '#a855f7', '#06b6d4', '#22c55e', '#ef4444', '#0891b2', '#6366f1', '#ec4899', '#14b8a6'];

const Dashboard: React.FC<DashboardProps> = ({ assignments }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const setQuickRange = (range: 'today' | 'week' | 'month' | 'last_month') => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (range === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      start.setDate(1);
    } else if (range === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const filteredData = useMemo(() => {
    return assignments.filter(a => {
      const matchCategory = categoryFilter === 'all' ? true : a.category === categoryFilter;
      const jobDate = new Date(a.actionDate).getTime();
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
      const matchStart = start ? jobDate >= start : true;
      const matchEnd = end ? jobDate <= end : true;
      return matchCategory && matchStart && matchEnd;
    });
  }, [assignments, categoryFilter, startDate, endDate]);

  // Data 1: Status Distribution
  const statusChartData = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.toUpperCase().replace('_', ' '), 
      value 
    }));
  }, [filteredData]);

  // Data 2: Trend (Last 7 active days)
  const trendChartData = useMemo(() => {
    const dateGroups = filteredData.reduce((acc, curr) => {
      const date = curr.actionDate.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dateGroups)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  }, [filteredData]);

  // Data 3: Job Types
  const jobTypeChartData = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      acc[curr.jobType] = (acc[curr.jobType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData]);

  // Data 4: Agency
  const agencyChartData = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      const agency = curr.agency || 'Not Specified';
      acc[agency] = (acc[agency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const success = filteredData.filter(a => ['finish', 'complete', 'update_fms'].includes(a.status)).length;
    const pending = filteredData.filter(a => ['new', 'process', 'assign', 'approve'].includes(a.status)).length;
    const cancelled = filteredData.filter(a => a.status === 'cancel').length;
    return {
      total,
      success,
      pending,
      cancelled,
      rate: total > 0 ? Math.round((success / total) * 100) : 0
    };
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1 flex items-center gap-2">
              <i className="fa-solid fa-filter text-brand-500"></i>
              Filter Category
            </label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-black focus:ring-2 focus:ring-brand-500 outline-none transition font-bold"
            >
              <option value="all">View All Categories</option>
              {Object.entries(MENU_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.title}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full lg:w-44 space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-black focus:ring-2 focus:ring-brand-500 outline-none font-bold" 
            />
          </div>
          
          <div className="w-full lg:w-44 space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-black focus:ring-2 focus:ring-brand-500 outline-none font-bold" 
            />
          </div>
          
          <button 
            onClick={() => { setCategoryFilter('all'); setStartDate(''); setEndDate(''); }} 
            className="px-6 h-[42px] bg-gray-100 text-black rounded-xl text-xs font-black hover:bg-brand-500 hover:text-white transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-rotate-right"></i>
            RESET
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50 items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase mr-2">Quick Range:</span>
          {['today', 'week', 'month'].map((r) => (
            <button 
              key={r} 
              onClick={() => setQuickRange(r as any)} 
              className="px-4 py-1.5 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black border border-brand-100 hover:bg-brand-500 hover:text-white transition shadow-sm uppercase"
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Jobs" value={stats.total} color="blue" icon="fa-solid fa-list-ul" />
        <StatCard title="Success Rate" value={`${stats.rate}%`} subtitle={`${stats.success} items`} color="green" icon="fa-solid fa-circle-check" />
        <StatCard title="In Progress" value={stats.pending} color="yellow" icon="fa-solid fa-clock" />
        <StatCard title="Cancelled" value={stats.cancelled} color="red" icon="fa-solid fa-ban" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {/* Status Doughnut */}
        <ChartContainer title="Job Status Distribution" icon="fa-chart-pie">
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {statusChartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: '800' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartContainer>

        {/* Trend Line */}
        <ChartContainer title="Job Entry Trend (Last 7 Days)" icon="fa-chart-line">
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#000', fontWeight: 800}} />
                <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#000', fontWeight: 800}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartContainer>

        {/* Job Type Bar */}
        <ChartContainer title="Top 10 Job Types" icon="fa-tags">
          {jobTypeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobTypeChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={8} width={100} axisLine={false} tickLine={false} tick={{fill: '#000', fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20}>
                  {jobTypeChartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartContainer>

        {/* Agency Bar */}
        <ChartContainer title="Agency Distribution" icon="fa-building">
          {agencyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agencyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={8} axisLine={false} tickLine={false} tick={{fill: '#000', fontWeight: 700}} />
                <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{fill: '#000', fontWeight: 800}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30}>
                  {agencyChartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartContainer>
      </div>
    </div>
  );
};

// Helper Components
const ChartContainer = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[400px]">
    <h4 className="font-black text-black text-xs mb-6 flex items-center uppercase tracking-widest">
      <i className={`fa-solid ${icon} mr-3 text-brand-500`}></i>
      {title}
    </h4>
    <div className="relative flex-1 w-full min-h-0">
      {children}
    </div>
  </div>
);

const StatCard = ({ title, value, subtitle, color, icon }: any) => {
  const colorMap: any = {
    blue: 'border-blue-500 text-blue-600 bg-blue-50/50',
    green: 'border-green-500 text-green-600 bg-green-50/50',
    yellow: 'border-yellow-500 text-yellow-600 bg-yellow-50/50',
    red: 'border-red-500 text-red-600 bg-red-50/50'
  };
  return (
    <div className={`bg-white p-5 rounded-3xl shadow-sm border-l-4 transition-all hover:-translate-y-1 ${colorMap[color].split(' ')[0]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-black text-[10px] font-black uppercase tracking-widest">{title}</p>
          <h3 className={`text-2xl font-black mt-1 ${colorMap[color].split(' ')[1]}`}>{value}</h3>
          {subtitle && <p className="text-[10px] text-gray-400 mt-1 font-bold">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${colorMap[color].split(' ')[2]} ${colorMap[color].split(' ')[1]}`}>
          <i className={icon}></i>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="h-full w-full flex flex-col items-center justify-center text-gray-200">
    <i className="fa-solid fa-chart-bar text-5xl mb-3 opacity-20"></i>
    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No Data to Display</p>
  </div>
);

export default Dashboard;
