import React, { useState } from 'react';
import { Trash2, Building, MapPin, IndianRupee, Briefcase } from 'lucide-react';
import api from '../../../utils/api';

export default function CompaniesTab({ companies, refreshData }) {
  const [formData, setFormData] = useState({ company_name: '', job_role: '', package: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/admin/companies', formData);
      setFormData({ company_name: '', job_role: '', package: '', location: '' });
      refreshData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add company');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company? This will also remove associated drives and skills.')) return;
    try {
      await api.delete(`/admin/companies/${id}`);
      refreshData();
    } catch (err) {
      alert('Error deleting company');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Add Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Building size={20} className="text-primary-600"/> Add New Company</h3>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
              <input required type="text" className="input-field py-2" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Job Role</label>
              <input required type="text" className="input-field py-2" value={formData.job_role} onChange={e => setFormData({...formData, job_role: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Package (CTC)</label>
              <input required type="text" className="input-field py-2" placeholder="e.g. 15 LPA" value={formData.package} onChange={e => setFormData({...formData, package: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
              <input required type="text" className="input-field py-2" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Adding...' : 'Add Company'}
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.length === 0 ? (
            <div className="col-span-2 text-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
              No companies added yet.
            </div>
          ) : (
            companies.map(c => (
              <div key={c.company_id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-primary-300 transition-colors group relative">
                <button onClick={() => handleDelete(c.company_id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={18} />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xl">
                    {c.company_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">{c.company_name}</h4>
                    <span className="text-xs text-slate-500 font-medium">ID: #{c.company_id}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><Briefcase size={14} className="text-slate-400"/> {c.job_role}</div>
                  <div className="flex items-center gap-2"><IndianRupee size={14} className="text-emerald-500"/> <span className="font-semibold text-emerald-600">{c.package}</span></div>
                  <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {c.location}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
