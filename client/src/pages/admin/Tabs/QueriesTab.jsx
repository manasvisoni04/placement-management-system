import React, { useState } from 'react';
import { MessageSquare, Reply, User, Clock, CheckCircle2 } from 'lucide-react';
import api from '../../../utils/api';

const QueryCard = ({ q, isPending, replyText, handleReplyChange, submitReply, loading }) => (
  <div className="glass-card mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div className="p-5 flex flex-col md:flex-row justify-between gap-4 border-b border-slate-100 bg-white/40">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded flex items-center gap-1">
            <User size={12}/> {q.student_name} ({q.roll_no})
          </span>
          <span className="text-xs text-slate-500 font-semibold">{q.branch}</span>
        </div>
        <h4 className="font-bold text-slate-800 text-lg">{q.subject}</h4>
        <p className="text-sm text-slate-600 mt-1 pl-3 border-l-2 border-slate-200">{q.message}</p>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
         <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{new Date(q.created_at).toLocaleString()}</span>
         {q.status === 'Answered' ? (
           <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"><CheckCircle2 size={14}/> Answered</span>
         ) : (
           <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"><Clock size={14}/> Pending Action</span>
         )}
      </div>
    </div>

    {isPending ? (
      <div className="p-5 bg-indigo-50/50">
        <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Reply size={14} /> Write Reply
        </label>
        <div className="flex gap-3">
           <textarea 
             className="flex-1 px-4 py-2 rounded-xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y min-h-[46px] text-sm"
             placeholder="Type your response to the student..."
             value={replyText[q.query_id] || ''}
             onChange={(e) => handleReplyChange(q.query_id, e.target.value)}
           />
           <button 
             onClick={() => submitReply(q.query_id)}
             disabled={loading === q.query_id || !replyText[q.query_id]?.trim()}
             className="btn-primary px-6 py-2 h-fit bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none"
           >
             {loading === q.query_id ? 'Sending...' : 'Send'}
           </button>
        </div>
      </div>
    ) : (
      <div className="p-5 bg-emerald-50/30 border-l-4 border-l-emerald-400">
         <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-2">
           <MessageSquare size={14} /> Your Reply
         </h5>
         <p className="text-sm font-medium text-slate-700">{q.reply}</p>
      </div>
    )}
  </div>
);
export default function QueriesTab({ queries, refreshData }) {
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(null);

  const pendingQueries = queries.filter(q => q.status === 'Pending');
  const answeredQueries = queries.filter(q => q.status === 'Answered');

  const handleReplyChange = (id, text) => {
    setReplyText(prev => ({ ...prev, [id]: text }));
  };

  const submitReply = async (queryId) => {
    const text = replyText[queryId];
    if (!text || !text.trim()) return;

    setLoading(queryId);
    try {
      await api.post(`/admin/queries/${queryId}/reply`, { reply: text });
      refreshData();
    } catch (error) {
      alert('Failed to send reply');
    } finally {
      setLoading(null);
    }
  };



  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Pending Queries List */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
             <Clock className="text-amber-500" /> Pending Queries ({pendingQueries.length})
          </h3>
          {pendingQueries.length === 0 ? (
            <div className="p-8 text-center glass-panel border-dashed border-2 text-slate-500">No pending queries! All caught up.</div>
          ) : (
            pendingQueries.map(q => <QueryCard key={q.query_id} q={q} isPending={true} replyText={replyText} handleReplyChange={handleReplyChange} submitReply={submitReply} loading={loading} />)
          )}
        </div>

        {/* Answered Queries List */}
        <div>
           <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
             <CheckCircle2 className="text-emerald-500" /> Answered Queries
          </h3>
          <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
            {answeredQueries.length === 0 ? (
              <div className="p-8 text-center glass-panel border-dashed border-2 text-slate-500">No answered queries yet.</div>
            ) : (
              answeredQueries.map(q => <QueryCard key={q.query_id} q={q} isPending={false} replyText={replyText} handleReplyChange={handleReplyChange} submitReply={submitReply} loading={loading} />)
            )}
          </div>
        </div>
      </div>
    
    </div>
  );
}
