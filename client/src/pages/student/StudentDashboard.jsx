import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Bell, CheckCircle, GraduationCap, Building2, MapPin, IndianRupee, Briefcase, FileCode2, User, Lightbulb } from 'lucide-react';
import api from '../../utils/api';
import ProfileTab from './Tabs/ProfileTab';
import TipsTab from './Tabs/TipsTab';
import QueriesTab from './Tabs/QueriesTab';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(null);
  const [activeTab, setActiveTab] = useState('opportunities');

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/student/dashboard');
      setData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApply = async (driveId) => {
    setApplying(driveId);
    try {
      await api.post(`/student/apply/${driveId}`);
      // Refresh to update the "Applied" state
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error applying to drive');
    } finally {
      setLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;

  const { student, notifications, personalNotifications, drives } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="glass-card mb-8 p-8 border-l-4 border-l-emerald-500 rounded-l-none rounded-r-2xl transform hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <GraduationCap size={200} className="text-emerald-500" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 mb-2">Welcome back, {student.name}!</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-600 text-sm font-medium">
              <span className="flex items-center gap-1 bg-white/60 px-3 py-1.5 rounded-lg border border-slate-200">
                <FileCode2 size={16} className="text-emerald-500"/> {student.branch} Branch
              </span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-8 py-5 rounded-2xl border border-white/50 shadow-sm text-center min-w-[160px] group hover:bg-white transition-colors">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Current CGPA</p>
            <p className="text-4xl font-black text-emerald-600 drop-shadow-sm group-hover:scale-110 transition-transform">{student.cgpa}</p>
          </div>
        </div>
      </div>

      {/* Main Tabbed Interface */}
      <div className="glass-card overflow-hidden mt-6">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200/60 overflow-x-auto hide-scrollbar bg-white/40">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`flex items-center gap-2.5 px-6 py-4.5 text-sm font-bold transition-all whitespace-nowrap
              ${activeTab === 'opportunities' 
                ? 'text-primary-700 border-b-2 border-primary-600 bg-white shadow-[inset_0_-2px_10px_rgba(255,255,255,0.8)]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }
            `}
          >
            <Briefcase size={18} /> Opportunities Feed
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 px-6 py-4.5 text-sm font-bold transition-all whitespace-nowrap
              ${activeTab === 'profile' 
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white shadow-[inset_0_-2px_10px_rgba(255,255,255,0.8)]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }
            `}
          >
            <User size={18} /> My Profile & Resume
          </button>
          
          <button
            onClick={() => setActiveTab('tips')}
            className={`flex items-center gap-2.5 px-6 py-4.5 text-sm font-bold transition-all whitespace-nowrap
              ${activeTab === 'tips' 
                ? 'text-amber-700 border-b-2 border-amber-600 bg-white shadow-[inset_0_-2px_10px_rgba(255,255,255,0.8)]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }
            `}
          >
            <Lightbulb size={18} /> Preparation Tips
          </button>
          
          <button
            onClick={() => setActiveTab('queries')}
            className={`flex items-center gap-2.5 px-6 py-4.5 text-sm font-bold transition-all whitespace-nowrap
              ${activeTab === 'queries' 
                ? 'text-indigo-700 border-b-2 border-indigo-600 bg-white shadow-[inset_0_-2px_10px_rgba(255,255,255,0.8)]' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }
            `}
          >
            <Bell size={18} /> Helpdesk
          </button>
        </div>

        {/* Tab Context Container */}
        <div className="p-6 md:p-8 min-h-[500px]">
          
          {activeTab === 'tips' && <TipsTab />}
          
          {activeTab === 'queries' && <QueriesTab queries={data.queries || []} refreshData={fetchDashboardData} />}
          
          {activeTab === 'profile' && <ProfileTab student={student} refreshData={fetchDashboardData} />}
          
          {activeTab === 'opportunities' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Feed: Placement Drives */}
              <div className="lg:col-span-2 space-y-6 lg:overflow-y-auto lg:max-h-[85vh] custom-scrollbar pr-2 pb-8">
                <div className="flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-20 py-4 -mt-4 mb-2">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 drop-shadow-sm">
                    <Briefcase className="text-emerald-500" size={28}/> Available Opportunities
                  </h2>
                  <span className="text-sm font-bold bg-white text-slate-500 px-3 py-1 rounded-full border border-slate-200 shadow-sm">{drives.length} drives active</span>
                </div>

                {(!student.roll_no || !student.course || !student.batch) && (
                  <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-start gap-4 mb-6 shadow-sm">
                    <div className="p-2 bg-rose-100 rounded-full text-rose-600 shrink-0">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-rose-800 text-lg mb-1">Action Required: Complete Your Profile</h3>
                      <p className="text-rose-600 text-sm font-medium mb-3">You must complete your COMPULSORY academic details (Roll No, Course, Batch) before applying to any placement drives.</p>
                      <button 
                        onClick={() => setActiveTab('profile')}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors"
                      >
                        Update Profile Now
                      </button>
                    </div>
                  </div>
                )}

          <div className="space-y-5">
            {drives.length === 0 ? (
              <div className="glass-panel p-12 text-center text-slate-500 font-medium border-dashed border-2">
                No active placement drives currently.
              </div>
            ) : (
              drives.map(drive => (
                <div key={drive.drive_id} className={`glass-card p-6 md:p-8 relative group transition-all ${drive.isEligible ? 'hover:-translate-y-1 hover:shadow-glass-hover hover:border-emerald-200' : 'opacity-75 grayscale-[20%]'}`}>
                  <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl ${drive.isEligible ? 'bg-gradient-to-b from-emerald-400 to-primary-500' : 'bg-slate-300'}`}></div>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 flex items-center justify-center font-bold text-2xl shadow-inner border border-white">
                        {drive.company_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          {drive.company_name}
                          {!drive.isEligible && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">Not Eligible</span>}
                        </h3>
                        <div className="text-sm font-medium text-slate-600 mt-1">{drive.job_role}</div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5"><IndianRupee size={16} className="text-emerald-500"/> <span className="font-semibold text-emerald-600">{drive.package}</span></span>
                          <span className="flex items-center gap-1.5"><MapPin size={16}/> {drive.location}</span>
                          {drive.venue && drive.venue !== 'TBD' && <span className="flex items-center gap-1.5"><Building2 size={16}/> {drive.venue}</span>}
                          {drive.timing && drive.timing !== 'TBD' && <span className="flex items-center gap-1.5"><CalendarDays size={16}/> {drive.timing}</span>}
                          <span className="flex items-center gap-1.5"><CalendarDays size={16} className={new Date(drive.deadline) < new Date() ? 'text-red-500' : ''}/> Apply by {new Date(drive.deadline).toLocaleDateString()}</span>
                        </div>
                        
                        {(drive.eligible_courses && drive.eligible_courses !== 'All' || drive.eligible_branches && drive.eligible_branches !== 'All') && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {drive.eligible_courses && drive.eligible_courses !== 'All' && (
                              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1"><GraduationCap size={14}/> Courses: {drive.eligible_courses}</span>
                            )}
                            {drive.eligible_branches && drive.eligible_branches !== 'All' && (
                              <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1"><FileCode2 size={14}/> Branches: {drive.eligible_branches}</span>
                            )}
                          </div>
                        )}
                        
                        {drive.rounds_of_procedure && drive.rounds_of_procedure !== 'Not specified' && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Hiring Process</h4>
                            <p className="text-sm text-slate-600">{drive.rounds_of_procedure}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                      <div className="text-sm border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                        Req. CGPA: <strong className={drive.isEligible ? 'text-emerald-600' : 'text-red-600'}>{drive.eligibility_cgpa}+</strong>
                      </div>
                      
                      {drive.hasApplied ? (
                        <button disabled className={`w-full sm:w-auto flex justify-center items-center gap-2 font-bold px-6 py-2.5 rounded-xl border-2 transition-all ${
                           drive.applicationStatus === 'Accepted' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                           drive.applicationStatus === 'Rejected' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                           'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {drive.applicationStatus === 'Accepted' && <CheckCircle size={18} />}
                          {drive.applicationStatus === 'Rejected' && <CheckCircle size={18} className="text-rose-500 opacity-0 hidden" />}
                          {(!drive.applicationStatus || drive.applicationStatus === 'Pending') && <CheckCircle size={18} className="text-slate-400" />}
                          {drive.applicationStatus === 'Accepted' ? 'Selected' : drive.applicationStatus === 'Rejected' ? 'Rejected' : 'Applied (Pending)'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleApply(drive.drive_id)}
                          disabled={!drive.isEligible || drive.status === 'Closed' || applying === drive.drive_id || !student.roll_no || !student.course || !student.batch}
                          className={`w-full sm:w-auto flex justify-center py-2 px-6 rounded-xl font-medium transition-all duration-200 ${
                            !drive.isEligible || drive.status === 'Closed' || !student.roll_no || !student.course || !student.batch
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'btn-primary'
                          }`}
                        >
                          {applying === drive.drive_id ? 'Applying...' : drive.status === 'Closed' ? 'Closed' : !student.roll_no || !student.course || !student.batch ? 'Profile Inc.' : 'Apply Now'}
                        </button>
                      )}
                    </div>
                  </div>

                  {drive.skills && drive.skills.length > 0 && (
                     <div className="mt-5 pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {drive.skills.map((skill, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium shadow-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                     </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Notifications */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3 drop-shadow-sm">
              <Bell className="text-amber-500" size={28}/> Announcements
            </h2>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Personal Application Updates */}
              {personalNotifications?.map(pn => (
                <div key={pn.id} className={`relative p-4 glass-panel border-l-4 group hover:bg-white transition-colors ${pn.type === 'Accepted' ? 'border-l-emerald-500 bg-emerald-50/50' : 'border-l-rose-500 bg-rose-50/50'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2 inline-block shadow-sm ${pn.type === 'Accepted' ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                    Application Result
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed font-bold">
                    {pn.message}
                  </p>
                </div>
              ))}

              {/* General Drive Announcements */}
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500 glass-panel">No new announcements.</div>
              ) : (
                notifications.map(n => (
                  <div key={n.notification_id} className="relative p-4 glass-panel border-l-4 border-l-amber-400 group hover:bg-white transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded mb-2 inline-block shadow-sm">
                      {new Date(n.date).toLocaleDateString()}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium group-hover:text-slate-900 transition-colors">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      )}
        </div>
      </div>
    </div>
  );
}
