import React, { useState } from 'react';
import { Building2, Briefcase, Target, Trash2, PlusCircle, CheckCircle, ChevronRight, Users } from 'lucide-react';
import api from '../../../utils/api';

export default function HiringSetupTab({ companies, drives, skills, refreshData, onViewApplicants }) {
  const [activeCompany, setActiveCompany] = useState(null);
  
  // Forms
  const [companyForm, setCompanyForm] = useState({ company_name: '', job_role: '', package: '', location: '' });
  const [driveForm, setDriveForm] = useState({ eligibility_cgpa: '', timing: '', venue: '', rounds_of_procedure: '', eligible_courses: '', eligible_branches: '', deadline: '' });
  const [skillForm, setSkillForm] = useState({ skill_name: '' });
  
  const [loading, setLoading] = useState(false);

  // Dynamic filter lists for active company
  const companyDrives = activeCompany ? drives.filter(d => d.company_id === activeCompany.company_id) : [];
  const companySkills = activeCompany ? skills.filter(s => s.company_id === activeCompany.company_id) : [];

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/companies', companyForm);
      setCompanyForm({ company_name: '', job_role: '', package: '', location: '' });
      await refreshData();
      // Auto select the new company (mock approach)
      const newCompany = { ...companyForm, company_id: res.data.id };
      setActiveCompany(newCompany);
    } catch (err) {
      alert('Failed to add company');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!activeCompany) return;
    setLoading(true);
    try {
      await api.post('/admin/drives', { ...driveForm, company_id: activeCompany.company_id });
      setDriveForm({ eligibility_cgpa: '', timing: '', venue: '', rounds_of_procedure: '', eligible_courses: '', eligible_branches: '', deadline: '' });
      refreshData();
    } catch (err) {
      alert('Failed to create drive');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!activeCompany) return;
    setLoading(true);
    try {
      await api.post('/admin/skills', { skill_name: skillForm.skill_name, company_id: activeCompany.company_id });
      setSkillForm({ skill_name: '' });
      refreshData();
    } catch (err) {
      alert('Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      await api.delete(`/admin/${type}/${id}`);
      if (type === 'companies' && activeCompany?.company_id === id) setActiveCompany(null);
      refreshData();
    } catch (err) {
      alert(`Error deleting ${type}`);
    }
  };

  const updateDriveStatus = async (id, status) => {
    try {
      await api.put(`/admin/drives/${id}/status`, { status });
      refreshData();
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      
      {/* LEFT PANE: Companies List & Creation */}
      <div className="xl:col-span-4 flex flex-col h-full space-y-6">
        <div className="glass-card p-6 border-t-4 border-t-primary-500">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Building2 size={20} className="text-primary-600"/> Add Target Company</h3>
           <form onSubmit={handleCreateCompany} className="space-y-4">
             <input required type="text" className="input-field py-2 text-sm" placeholder="Company Name" value={companyForm.company_name} onChange={e => setCompanyForm({...companyForm, company_name: e.target.value})} />
             <div className="grid grid-cols-2 gap-3">
               <input required type="text" className="input-field py-2 text-sm" placeholder="Job Role" value={companyForm.job_role} onChange={e => setCompanyForm({...companyForm, job_role: e.target.value})} />
               <input required type="text" className="input-field py-2 text-sm" placeholder="Package (LPA)" value={companyForm.package} onChange={e => setCompanyForm({...companyForm, package: e.target.value})} />
             </div>
             <input required type="text" className="input-field py-2 text-sm" placeholder="Location" value={companyForm.location} onChange={e => setCompanyForm({...companyForm, location: e.target.value})} />
             <button type="submit" disabled={loading} className="btn-primary w-full py-2 flex justify-center items-center gap-2 text-sm">
               {!loading && <PlusCircle size={16}/>} {loading ? 'Adding...' : 'Add Company'}
             </button>
           </form>
        </div>

        <div className="glass-card flex-1 p-6 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
            Your Companies <span className="bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-md text-xs">{companies.length}</span>
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 mb-2">
            {companies.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">No companies yet.</p>
            ) : (
              companies.map(c => (
                <div 
                  key={c.company_id} 
                  onClick={() => setActiveCompany(c)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${activeCompany?.company_id === c.company_id ? 'bg-primary-50 border-primary-400 shadow-sm' : 'bg-white border-slate-200 hover:border-primary-200 hover:bg-slate-50'}`}
                >
                   <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800 flex items-center gap-2">{c.company_name}</div>
                      <ChevronRight size={16} className={activeCompany?.company_id === c.company_id ? 'text-primary-500' : 'text-slate-400'}/>
                   </div>
                   <div className="text-xs text-slate-500 font-medium mt-1">{c.job_role} • {c.package}</div>
                   
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleDelete('companies', c.company_id); }}
                     className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 size={16}/>
                   </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Workspace for Selected Company */}
      <div className="xl:col-span-8 flex flex-col h-full space-y-6">
        {!activeCompany ? (
           <div className="h-full glass-card flex flex-col items-center justify-center p-12 text-center text-slate-500 border-dashed border-2">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-inner">
               <Briefcase size={36}/>
             </div>
             <h3 className="text-xl font-bold text-slate-700 mb-2">Workspace Empty</h3>
             <p className="max-w-xs">Select a company from the left panel to configure its Placement Drives and Required Skills.</p>
           </div>
        ) : (
          <>
            {/* Active Company Header */}
            <div className="glass-card p-6 bg-gradient-to-r from-slate-800 to-slate-700 text-white relative overflow-hidden shrink-0">
               <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                 <Building2 size={150} />
               </div>
               <div className="relative z-10">
                 <span className="bg-white/20 text-white border border-white/30 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3">Active Workspace</span>
                 <h2 className="text-3xl font-extrabold mb-1">{activeCompany.company_name}</h2>
                 <p className="text-slate-300 font-medium flex items-center gap-3 text-sm">
                   <span>Role: {activeCompany.job_role}</span> • <span>Package: <strong className="text-white">{activeCompany.package}</strong></span> • <span>Loc: {activeCompany.location}</span>
                 </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
               {/* Drives Column */}
               <div className="glass-card p-6 flex flex-col border-t-4 border-t-emerald-500">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase size={20} className="text-emerald-600"/> Placement Drives</h3>
                  
                  <div className="space-y-4 mb-6">
                    {companyDrives.length === 0 ? (
                      <p className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed text-center">No drives created yet.</p>
                    ) : (
                      companyDrives.map(d => (
                         <div key={d.drive_id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm relative group">
                            <div className="flex justify-between items-start mb-2">
                               <div className="font-bold text-slate-800 text-sm">Target: {d.eligibility_cgpa}+ CGPA</div>
                               <select 
                                  className={`text-xs font-bold rounded-full py-0.5 px-2 focus:ring-0 ${d.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}
                                  value={d.status}
                                  onChange={e => updateDriveStatus(d.drive_id, e.target.value)}
                                >
                                  <option value="Open">Open</option>
                                  <option value="Closed">Closed</option>
                                </select>
                            </div>
                            <div className="text-xs text-slate-600 space-y-1 mt-3">
                               <div><strong>Deadline:</strong> {new Date(d.deadline).toLocaleDateString()}</div>
                               <div><strong>Timing & Venue:</strong> {d.timing} / {d.venue}</div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                               <button 
                                onClick={() => onViewApplicants?.(d.drive_id)}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
                               >
                                <Users size={12}/> View {d.applicant_count} Applicants
                               </button>

                               <button 
                                 onClick={() => handleDelete('drives', d.drive_id)} 
                                 className="text-slate-400 hover:text-red-500 transition-colors"
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                      ))
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-200">
                     <h4 className="text-sm font-bold text-slate-700 mb-3">Add New Drive</h4>
                     <form onSubmit={handleCreateDrive} className="space-y-3">
                       <div className="grid grid-cols-2 gap-2">
                         <input required type="number" step="0.01" className="input-field py-1.5 text-xs" placeholder="Min CGPA" value={driveForm.eligibility_cgpa} onChange={e => setDriveForm({...driveForm, eligibility_cgpa: e.target.value})} />
                         <input required type="date" className="input-field py-1.5 text-xs" value={driveForm.deadline} onChange={e => setDriveForm({...driveForm, deadline: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                         <input type="text" className="input-field py-1.5 text-xs" placeholder="Timing (e.g. 10 AM)" value={driveForm.timing} onChange={e => setDriveForm({...driveForm, timing: e.target.value})} />
                         <input type="text" className="input-field py-1.5 text-xs" placeholder="Venue" value={driveForm.venue} onChange={e => setDriveForm({...driveForm, venue: e.target.value})} />
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                           <input type="text" className="input-field py-1.5 text-xs" placeholder="Eligible Courses" value={driveForm.eligible_courses} onChange={e => setDriveForm({...driveForm, eligible_courses: e.target.value})} />
                           <input type="text" className="input-field py-1.5 text-xs" placeholder="Eligible Branches" value={driveForm.eligible_branches} onChange={e => setDriveForm({...driveForm, eligible_branches: e.target.value})} />
                       </div>
                       <input type="text" className="input-field py-1.5 text-xs" placeholder="Rounds (e.g. Test, HR)" value={driveForm.rounds_of_procedure} onChange={e => setDriveForm({...driveForm, rounds_of_procedure: e.target.value})} />
                       <button type="submit" disabled={loading} className="w-full py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition flex justify-center items-center gap-1">
                         <PlusCircle size={14}/> Create Drive
                       </button>
                     </form>
                  </div>
               </div>

               {/* Skills Column */}
               <div className="glass-card p-6 flex flex-col border-t-4 border-t-indigo-500">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Target size={20} className="text-indigo-600"/> Required Skills</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {companySkills.length === 0 ? (
                      <p className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed text-center w-full">No specific skills listed.</p>
                    ) : (
                      companySkills.map(s => (
                         <div key={s.skill_id} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold shadow-sm pr-2">
                           {s.skill_name}
                           <button onClick={() => handleDelete('skills', s.skill_id)} className="text-indigo-400 hover:text-red-500 transition-colors ml-1 border-l border-indigo-200 pl-1.5">
                             <Trash2 size={12}/>
                           </button>
                         </div>
                      ))
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-200">
                     <h4 className="text-sm font-bold text-slate-700 mb-3">Add Skill Requirement</h4>
                     <form onSubmit={handleCreateSkill} className="flex gap-2">
                       <input required type="text" className="input-field py-1.5 text-xs flex-1" placeholder="e.g. React, Python" value={skillForm.skill_name} onChange={e => setSkillForm({...skillForm, skill_name: e.target.value})} />
                       <button type="submit" disabled={loading} className="py-1.5 px-4 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition flex shrink-0 justify-center items-center gap-1">
                         <PlusCircle size={14}/> Add
                       </button>
                     </form>
                  </div>
               </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
