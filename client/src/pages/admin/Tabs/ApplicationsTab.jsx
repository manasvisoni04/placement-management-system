import React, { useState } from 'react';
import { FileCheck, Building2, MapPin, CalendarDays, ExternalLink, GraduationCap, Filter, Check, X, Clock, User, FileText, Linkedin, Github } from 'lucide-react';
import api from '../../../utils/api';

export default function ApplicationsTab({ applications, drives, selectedDriveId, setSelectedDriveId, refreshData }) {
  const [processingId, setProcessingId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  const handleStatusUpdate = async (appId, status) => {
    setProcessingId(appId);
    try {
      await api.put(`/admin/applications/${appId}/status`, { status });
      refreshData();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };
  const filteredApplications = selectedDriveId
    ? applications.filter(app => app.drive_id.toString() === selectedDriveId.toString())
    : applications;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck className="text-primary-600" /> Application Tracker
          </h3>
          <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm hidden sm:inline-block">
            Total Applications: {filteredApplications.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select 
            className="input-field py-1.5 min-w-[200px] text-sm font-medium"
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
          >
            <option value="">All Drives</option>
            {drives?.map(d => (
              <option key={d.drive_id} value={d.drive_id}>
                {d.company_name} (Cutoff: {d.eligibility_cgpa})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Student Info</th>
                <th className="p-4 font-semibold">Applied Role</th>
                <th className="p-4 font-semibold">Company</th>
                <th className="p-4 font-semibold">Date Applied</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No applications found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{app.student_name}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                           {app.branch} • <GraduationCap size={12}/> {app.cgpa} CGPA
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {app.job_role}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-md bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs">
                          {app.company_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-700">{app.company_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <CalendarDays size={16} />
                        {new Date(app.applied_on).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {app.status === 'Accepted' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700"><Check size={14}/> Accepted</span>}
                      {app.status === 'Rejected' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700"><X size={14}/> Rejected</span>}
                      {(!app.status || app.status === 'Pending') && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700"><Clock size={14}/> Pending</span>}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {(!app.status || app.status === 'Pending') && (
                           <>
                             <button onClick={() => handleStatusUpdate(app.application_id, 'Accepted')} disabled={processingId === app.application_id} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition-colors inline-flex disabled:opacity-50" title="Accept">
                               <Check size={18} />
                             </button>
                             <button onClick={() => handleStatusUpdate(app.application_id, 'Rejected')} disabled={processingId === app.application_id} className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors inline-flex disabled:opacity-50" title="Reject">
                               <X size={18} />
                             </button>
                           </>
                        )}
                        <button onClick={() => setSelectedApp(app)} className="text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 p-2 rounded-lg transition-colors inline-flex" title="View Details">
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><User size={20} className="text-primary-600"/> Applicant Profile</h3>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-200 text-slate-500 rounded-lg"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Name</p>
                  <p className="font-semibold text-slate-800">{selectedApp.student_name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Email</p>
                  <p className="font-semibold text-slate-800">{selectedApp.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Branch & CGPA</p>
                  <p className="font-semibold text-slate-800">{selectedApp.branch} • <span className="text-primary-600">{selectedApp.cgpa}</span></p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Skills</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm font-medium text-slate-700">{selectedApp.skills || 'Not provided'}</div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Experience</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm font-medium text-slate-700 whitespace-pre-wrap">{selectedApp.experience || 'Not provided'}</div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Certifications</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm font-medium text-slate-700 whitespace-pre-wrap">{selectedApp.certifications || 'Not provided'}</div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                {selectedApp.resume_url && (
                  <a href={selectedApp.resume_url.startsWith('http') ? selectedApp.resume_url : `http://localhost:5000${selectedApp.resume_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                    <FileText size={16}/> View Resume
                  </a>
                )}
                {selectedApp.linkedin_url && (
                  <a href={selectedApp.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                    <Linkedin size={16}/> LinkedIn
                  </a>
                )}
                {selectedApp.github_url && (
                  <a href={selectedApp.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-300 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors">
                    <Github size={16}/> Github
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
