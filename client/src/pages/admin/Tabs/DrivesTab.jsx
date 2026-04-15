import React, { useState } from 'react';
import { Calendar, Trash2, Users } from 'lucide-react';
import api from '../../../utils/api';

export default function DrivesTab({ drives, companies, refreshData, onViewApplicants }) {
  const [formData, setFormData] = useState({ company_id: '', eligibility_cgpa: '', timing: '', venue: '', rounds_of_procedure: '', eligible_courses: '', eligible_branches: '', deadline: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/drives', formData);
      setFormData({ company_id: '', eligibility_cgpa: '', timing: '', venue: '', rounds_of_procedure: '', eligible_courses: '', eligible_branches: '', deadline: '' });
      refreshData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create drive');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/drives/${id}/status`, { status });
      refreshData();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this drive? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/drives/${id}`);
      refreshData();
    } catch (err) {
      alert('Error deleting drive');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Calendar size={20} className="text-primary-600"/> Create Drive</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Company</label>
              <select required className="input-field py-2" value={formData.company_id} onChange={e => setFormData({...formData, company_id: e.target.value})}>
                <option value="" disabled>Select a company</option>
                {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Min. CGPA Cutoff</label>
              <input required type="number" step="0.01" min="0" max="10" className="input-field py-2" placeholder="e.g. 7.5" value={formData.eligibility_cgpa} onChange={e => setFormData({...formData, eligibility_cgpa: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Timing <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="text" className="input-field py-2" placeholder="e.g. 10:00 AM" value={formData.timing} onChange={e => setFormData({...formData, timing: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Venue <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="text" className="input-field py-2" placeholder="Virtual / Main Hall" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Rounds <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="text" className="input-field py-2" placeholder="1. Aptitude, 2. HR" value={formData.rounds_of_procedure} onChange={e => setFormData({...formData, rounds_of_procedure: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Eligible Courses <span className="text-slate-400 font-normal">(Opt)</span></label>
                <input type="text" className="input-field py-2" placeholder="e.g. B.Tech, MCA" value={formData.eligible_courses} onChange={e => setFormData({...formData, eligible_courses: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Eligible Branches <span className="text-slate-400 font-normal">(Opt)</span></label>
                <input type="text" className="input-field py-2" placeholder="e.g. CSE, IT" value={formData.eligible_branches} onChange={e => setFormData({...formData, eligible_branches: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Application Deadline</label>
              <input required type="date" className="input-field py-2" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Creating...' : 'Create Drive'}
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="p-4 font-semibold">Company</th>
                  <th className="p-4 font-semibold">Cutoff</th>
                  <th className="p-4 font-semibold">Deadline</th>
                  <th className="p-4 font-semibold text-center">Applicants</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drives.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">No placement drives found.</td></tr>
                ) : (
                  drives.map(d => (
                    <tr key={d.drive_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{d.company_name}</td>
                      <td className="p-4 font-medium text-primary-600">{d.eligibility_cgpa}+</td>
                      <td className="p-4 text-sm text-slate-600">{new Date(d.deadline).toLocaleDateString()}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => onViewApplicants?.(d.drive_id)}
                          className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors px-2 py-1 rounded-md text-sm font-semibold w-fit mx-auto cursor-pointer"
                          title="View Applications"
                        >
                          <Users size={14}/> {d.applicant_count}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${d.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          className={`text-sm rounded border-slate-200 p-1 font-medium focus:ring-primary-500 ${d.status === 'Open' ? 'bg-white' : 'bg-slate-50'}`}
                          value={d.status}
                          onChange={e => updateStatus(d.drive_id, e.target.value)}
                        >
                          <option value="Open">Open</option>
                          <option value="Closed">Close</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleDelete(d.drive_id)} 
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Delete Drive"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
