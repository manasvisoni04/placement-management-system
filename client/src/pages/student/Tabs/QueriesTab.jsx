import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import api from '../../../utils/api';

export default function QueriesTab({ queries, refreshData }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setLoading(true);
    try {
      await api.post('/student/queries', { subject, message });
      setSubject('');
      setMessage('');
      refreshData();
    } catch (error) {
      alert('Failed to submit query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Submit Query Form */}
      <div className="glass-card p-6 border-t-4 border-t-indigo-500">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MessageSquare className="text-indigo-500" /> Have a question? Ask the Admin
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
            <input 
              type="text" 
              required
              placeholder="E.g., Issue with applying to XYZ Drive"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/50"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Your Message</label>
            <textarea 
              required
              rows="4"
              placeholder="Describe your query in detail..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/50 resize-y custom-scrollbar"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading || !subject.trim() || !message.trim()}
              className="btn-primary bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 flex items-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? 'Submitting...' : <><Send size={18} /> Submit Query</>}
            </button>
          </div>
        </form>
      </div>

      {/* Previous Queries List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Your Previous Queries</h3>
        
        {!queries || queries.length === 0 ? (
          <div className="p-8 text-center glass-panel border-dashed border-2 text-slate-500">
            You haven't submitted any queries yet.
          </div>
        ) : (
          queries.map(q => (
            <div key={q.query_id} className="glass-card overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row justify-between gap-4 border-b border-slate-100 bg-white/30">
                 <div>
                   <h4 className="font-bold text-slate-800 text-lg mb-1">{q.subject}</h4>
                   <p className="text-sm text-slate-600">{q.message}</p>
                 </div>
                 <div className="shrink-0 flex flex-col items-end gap-2">
                   {q.status === 'Answered' ? (
                     <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"><CheckCircle2 size={14}/> Answered</span>
                   ) : (
                     <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"><Clock size={14}/> Pending</span>
                   )}
                   <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{new Date(q.created_at).toLocaleString()}</span>
                 </div>
              </div>
              
              {q.status === 'Answered' && q.reply && (
                <div className="p-5 bg-indigo-50/50 border-l-4 border-l-emerald-400">
                   <h5 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                     <MessageSquare size={14} /> Admin Reply
                   </h5>
                   <p className="text-sm font-medium text-slate-700">{q.reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  )
}
