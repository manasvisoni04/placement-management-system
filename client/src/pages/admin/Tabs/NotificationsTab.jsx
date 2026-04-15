import React, { useState } from 'react';
import { Bell, Trash2, CalendarDays } from 'lucide-react';
import api from '../../../utils/api';

export default function NotificationsTab({ notifications, refreshData }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/notifications', { message });
      setMessage('');
      refreshData();
    } catch (err) {
      alert('Failed to post notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/notifications/${id}`);
      refreshData();
    } catch (err) {
      alert('Error deleting notification');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Compose Form */}
      <div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Bell size={20} className="text-primary-600"/> Post Announcement</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Message Content</label>
              <textarea 
                required 
                className="input-field py-3 min-h-[120px] resize-none" 
                placeholder="Write an important update for students..." 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Posting...' : 'Publish Announcement'}
            </button>
          </form>
        </div>
      </div>

      {/* Feed */}
      <div>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
              No announcements made yet.
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.notification_id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 group relative">
                <button onClick={() => handleDelete(n.notification_id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={18} />
                </button>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Bell size={16} />
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <CalendarDays size={12} />
                    {new Date(n.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed text-sm whitespace-pre-wrap">
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
