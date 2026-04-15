import React, { useState } from 'react';
import { Target, Trash2 } from 'lucide-react';
import api from '../../../utils/api';

export default function SkillsTab({ skills, companies, refreshData }) {
  const [formData, setFormData] = useState({ company_id: '', skill_name: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/skills', formData);
      setFormData({ company_id: '', skill_name: '' });
      refreshData();
    } catch (err) {
      alert('Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/skills/${id}`);
      refreshData();
    } catch (err) {
      alert('Error deleting skill');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Target size={20} className="text-primary-600"/> Add Skill</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Company</label>
              <select required className="input-field py-2" value={formData.company_id} onChange={e => setFormData({...formData, company_id: e.target.value})}>
                <option value="" disabled>Select a company</option>
                {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Skill Name</label>
              <input required type="text" className="input-field py-2" placeholder="e.g. React, Node.js" value={formData.skill_name} onChange={e => setFormData({...formData, skill_name: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Adding...' : 'Add Skill'}
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <div className="flex flex-wrap gap-3">
             {skills.length === 0 ? (
               <div className="text-center w-full py-8 text-slate-500">No skills added yet.</div>
             ) : (
               skills.map(s => (
                 <div key={s.skill_id} className="group relative flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                   <span>{s.skill_name}</span>
                   <span className="text-xs text-slate-400 font-normal px-1 border-l border-slate-300">{s.company_name}</span>
                   <button onClick={() => handleDelete(s.skill_id)} className="text-slate-400 hover:text-red-500 transition-colors ml-1">
                     <Trash2 size={14} />
                   </button>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
