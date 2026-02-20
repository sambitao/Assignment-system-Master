
import React from 'react';
import { Category } from '../types';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currentView: Category;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, setIsSidebarOpen, currentView }) => {
  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard_analytics': return 'Dashboard Analytics';
      case 'calendar': return 'Calendar Schedule';
      case 'summary_dashboard': return 'Project Plan Analytics';
      case 'sub_dashboard': return 'Subcontractor Costs & Stats';
      case 'setting': return 'System Configuration';
      case 'link_support': return 'Support Resources';
      default: return currentView.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  };

  return (
    <header className="bg-white shadow-sm h-16 flex-none flex items-center justify-between px-4 lg:px-8 z-10 border-b border-gray-200 sticky top-0">
      <div className="flex items-center">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-500 hover:text-brand-600 mr-4 focus:outline-none"
        >
          <i className="fa-solid fa-bars-staggered text-xl"></i>
        </button>
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <span className="text-brand-500 mr-3 hidden sm:inline">|</span>
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex flex-col items-end mr-2">
            <div className="text-[10px] font-bold text-green-600 flex items-center bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                SYSTEM ONLINE
            </div>
        </div>
        
        <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
            <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-800 leading-none">Senior Engineer</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase">Admin Access</p>
            </div>
            <div className="h-9 w-9 bg-gradient-to-br from-brand-100 to-orange-200 rounded-xl flex items-center justify-center text-brand-600 shadow-sm border border-white">
                <i className="fa-regular fa-user"></i>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
