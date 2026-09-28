import { useEffect, useState } from 'react';
import api from '../services/api';
import { Notification } from '../types';
import { Bell, CheckCheck } from 'lucide-react';

const typeColors: Record<string, string> = {
  opportunity: 'bg-blue-100 text-blue-600',
  event: 'bg-rose-100 text-rose-600',
  application: 'bg-green-100 text-green-600',
  assessment: 'bg-purple-100 text-purple-600',
  club: 'bg-orange-100 text-orange-600',
  scout: 'bg-yellow-100 text-yellow-600',
  training: 'bg-teal-100 text-teal-600',
  verification: 'bg-indigo-100 text-indigo-600',
  profile: 'bg-pink-100 text-pink-600',
  general: 'bg-gray-100 text-gray-600',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    api.get('/notifications').then(r => setNotifications(r.data.data || [])).catch(() => setError('Unable to load notifications. Please refresh the page.')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    } catch { setError('Unable to update this notification.'); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(n => n.map(x => ({ ...x, read: true })));
    } catch { setError('Unable to mark notifications as read.'); }
  };

  const unread = notifications.filter(n => !n.read).length;

  if (loading) return <div className="card h-48 animate-pulse bg-gray-100" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell size={24} /> Notifications
          {unread > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unread}</span>}
        </h1>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-2">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n._id} onClick={() => !n.read && markRead(n._id)}
              className={`card cursor-pointer transition-colors ${!n.read ? 'border-l-4 border-primary-500 bg-primary-50/30' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[n.type] || typeColors.general}`}>
                  <Bell size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
