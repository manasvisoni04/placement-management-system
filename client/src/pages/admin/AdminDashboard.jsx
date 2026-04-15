import React, { useState } from 'react';
import { Building2, Briefcase, Target, Bell } from 'lucide-react';
import NotificationsTab from './Tabs/NotificationsTab';
import StudentsTab from './Tabs/StudentsTab';
import ApplicationsTab from './Tabs/ApplicationsTab';
import QueriesTab from './Tabs/QueriesTab';
import HiringSetupTab from './Tabs/HiringSetupTab';

export default function AdminDashboardContainer({ data, refreshData }) {
  const [activeTab, setActiveTab] = useState('hiring');
  const [selectedDriveId, setSelectedDriveId] = useState('');

  const handleViewApplicants = (driveId) => {
    setSelectedDriveId(driveId.toString());
    setActiveTab('applications');
  };

  const tabs = [
    { id: 'hiring', label: 'Hiring Workspace', icon: <Building2 size={18} /> },
    { id: 'applications', label: 'Applications', icon: <Briefcase size={18} /> },
    { id: 'notifs', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'queries', label: 'Helpdesk Queries', icon: <Bell size={18} /> },
    { id: 'students', label: 'Students Directory', icon: <Target size={18} /> },
  ];

  return (
    <div className="space-y-6">
        <div className="mb-10 p-8 glass-card border-l-4 border-l-primary-500 rounded-l-none rounded-r-2xl transform hover:scale-[1.01] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-16 bg-gradient-to-bl from-primary-100 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 relative z-10">Admin Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10 mt-4">
        {[
          { label: 'Total Companies', val: data.stats.totalCompanies, color: 'text-blue-600', bg: 'bg-blue-50/80', iconColor:'text-blue-500', icon: <Building2/> },
          { label: 'Active Drives', val: data.stats.totalDrives, color: 'text-emerald-600', bg: 'bg-emerald-50/80', iconColor:'text-emerald-500', icon: <Briefcase/> },
          { label: 'Total Applications', val: data.stats.totalApplications, color: 'text-indigo-600', bg: 'bg-indigo-50/80', iconColor:'text-indigo-500', icon: <Target/> },
          { label: 'Registered Students', val: data.stats.totalStudents, color: 'text-purple-600', bg: 'bg-purple-50/80', iconColor:'text-purple-500', icon: <Target/> },
          { label: 'Announcements', val: data.stats.totalNotifications, color: 'text-amber-600', bg: 'bg-amber-50/80', iconColor:'text-amber-500', icon: <Bell/> },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl glass-panel ${stat.bg} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group border-white/60`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-4xl font-extrabold ${stat.color} drop-shadow-sm`}>{stat.val}</h3>
              <div className={`p-2.5 rounded-xl bg-white/70 shadow-sm border border-white group-hover:scale-110 transition-transform duration-300 ${stat.iconColor}`}>
                {React.cloneElement(stat.icon, { size: 22, strokeWidth: 2.5 })}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-3">{stat.label}</p>
          </div>
        ))}
        </div>

      {/* Main Tabbed Interface */}
      <div className="glass-card overflow-hidden mt-6">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200/60 overflow-x-auto hide-scrollbar bg-white/40">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-4.5 text-sm font-bold transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'text-primary-700 border-b-2 border-primary-600 bg-white shadow-[inset_0_-2px_10px_rgba(255,255,255,0.8)]' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="p-6 md:p-8 min-h-[500px]">
          {activeTab === 'hiring' && <HiringSetupTab companies={data.companies} drives={data.drives} skills={data.skills} refreshData={refreshData} onViewApplicants={handleViewApplicants} />}
          {activeTab === 'applications' && <ApplicationsTab applications={data.applications} drives={data.drives} selectedDriveId={selectedDriveId} setSelectedDriveId={setSelectedDriveId} refreshData={refreshData} />}
          {activeTab === 'notifs' && <NotificationsTab notifications={data.notifications} refreshData={refreshData} />}
          {activeTab === 'queries' && <QueriesTab queries={data.queries || []} refreshData={refreshData} />}
          {activeTab === 'students' && <StudentsTab students={data.students} />}
        </div>
      </div>
    </div>
  );
}
