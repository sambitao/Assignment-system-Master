
import React, { useState } from 'react';
import { Category, Assignment } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentView: Category;
  setCurrentView: (view: Category) => void;
  assignments: Assignment[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentView, setCurrentView, assignments }) => {
  const [openMenus, setOpenMenus] = useState<string[]>(['summary', 'sub']);

  const getBadgeCount = (category: Category) => {
    return assignments.filter(a => a.category === category && a.status === 'new').length;
  };

  const toggleMenu = (id: string) => {
    if (!isOpen) {
        setIsOpen(true);
        if (!openMenus.includes(id)) setOpenMenus(prev => [...prev, id]);
        return;
    }
    setOpenMenus(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const NavItem = ({ view, icon, label, badgeCount, isSubItem }: { view: Category; icon: string; label: string; badgeCount?: number; isSubItem?: boolean }) => (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        setCurrentView(view);
      }}
      className={`w-full flex items-center p-3 rounded-xl transition-all group relative ${currentView === view ? 'bg-brand-50 text-brand-600 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-100'} ${isSubItem && isOpen ? 'pl-4 py-2 my-0.5' : ''}`}
    >
      <div className={`w-8 flex justify-center flex-shrink-0 text-lg ${currentView === view ? 'text-brand-500' : 'text-gray-400 group-hover:text-brand-500'}`}>
        <i className={icon}></i>
      </div>
      <span className={`ml-3 text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
        {label}
      </span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className={`absolute right-2 top-2 lg:static ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${!isOpen ? 'scale-75' : ''}`}>
          {badgeCount}
        </span>
      )}
      
      {/* Tooltip for collapsed state (only for top-level or when popover is not shown) */}
      {!isOpen && !isSubItem && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
          {label}
        </div>
      )}
    </button>
  );

  const SubMenuWrapper = ({ id, label, icon, children }: { id: string, label: string, icon: string, children: React.ReactNode }) => {
    const isMenuOpen = openMenus.includes(id);
    
    return (
      <div className="relative group/menu">
        <button 
          onClick={() => toggleMenu(id)}
          className={`w-full flex items-center p-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all group ${isOpen ? 'justify-between' : 'justify-center'}`}
        >
          <div className="flex items-center">
            <div className="w-8 flex justify-center text-lg text-gray-400 group-hover:text-brand-500">
              <i className={icon}></i>
            </div>
            <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
              {label}
            </span>
          </div>
          {isOpen && <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}></i>}
        </button>

        {/* Floating Popover when collapsed */}
        {!isOpen && (
            <div className="absolute left-full top-0 ml-2 w-56 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 hidden group-hover/menu:block z-50 animate-fadeIn transition-all">
                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                </div>
                {children}
            </div>
        )}

        {/* Inline Accordion when expanded */}
        {isOpen && (
            <div className={`space-y-1 mt-1 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-80 pl-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                {children}
            </div>
        )}
      </div>
    );
  };

  return (
    <aside 
      className={`fixed lg:static inset-y-0 left-0 bg-white shadow-xl transition-all duration-300 z-30 flex flex-col h-full border-r border-gray-200 
      ${isOpen ? 'w-72 translate-x-0' : 'w-20 lg:translate-x-0 -translate-x-full'}`}
    >
      <div className={`p-6 border-b border-gray-100 flex items-center bg-gray-50/50 transition-all duration-300 ${isOpen ? 'justify-center' : 'justify-center'}`}>
        <div className="text-center overflow-hidden">
          <div className="flex justify-center items-center mb-3">
            <div className={`rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold shadow-lg border-4 border-white transition-all duration-300 ${isOpen ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-sm'}`}>
              <i className="fa-solid fa-bolt-lightning"></i>
            </div>
          </div>
          <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight whitespace-nowrap">Assignment System</h1>
            <h2 className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-0.5 whitespace-nowrap">Interruption Team Pro</h2>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar overflow-x-hidden">
        <NavItem view="dashboard_analytics" icon="fa-solid fa-chart-pie" label="Overall Dashboard" />
        <NavItem view="calendar" icon="fa-regular fa-calendar-days" label="Calendar Schedule" />
        <NavItem view="plan_interruption" icon="fa-solid fa-clipboard-list" label="Interruption Plan" badgeCount={getBadgeCount('plan_interruption')} />

        <div className="pt-2">
            <SubMenuWrapper id="summary" label="Project Plan" icon="fa-solid fa-file-contract">
                <NavItem view="summary_plan" icon="fa-solid fa-list-check" label="Job List" badgeCount={getBadgeCount('summary_plan')} isSubItem />
                <NavItem view="summary_dashboard" icon="fa-solid fa-chart-simple" label="Project Stats" isSubItem />
            </SubMenuWrapper>
        </div>

        <NavItem view="team" icon="fa-solid fa-users" label="Interruption Team" badgeCount={getBadgeCount('team')} />

        <div className="pt-2">
            <SubMenuWrapper id="sub" label="Subcontractor" icon="fa-solid fa-helmet-safety">
                <NavItem view="sub_dashboard" icon="fa-solid fa-sack-dollar" label="Costs & Stats" isSubItem />
                <NavItem view="sub_preventive" icon="fa-solid fa-shield-halved" label="Preventive" badgeCount={getBadgeCount('sub_preventive')} isSubItem />
                <NavItem view="sub_reroute" icon="fa-solid fa-route" label="Reroute" badgeCount={getBadgeCount('sub_reroute')} isSubItem />
                <NavItem view="sub_reconfigure" icon="fa-solid fa-gears" label="Reconfigure" badgeCount={getBadgeCount('sub_reconfigure')} isSubItem />
            </SubMenuWrapper>
        </div>

        <div className={`border-t border-gray-100 my-4 pt-4 transition-all ${!isOpen ? 'mx-2' : ''}`}>
            <NavItem view="link_support" icon="fa-solid fa-link" label="Link Support" />
            <NavItem view="setting" icon="fa-solid fa-gear" label="System Settings" />
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 text-[10px] text-gray-400 text-center bg-gray-50 overflow-hidden shrink-0">
        {isOpen ? (
          <>
            <p className="whitespace-nowrap">© 2026 AI Support Team</p>
            <p className="whitespace-nowrap">V 5.0 React Edition</p>
          </>
        ) : (
          <p className="font-bold">V5</p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
