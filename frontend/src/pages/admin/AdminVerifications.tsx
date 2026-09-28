import { useEffect, useState } from 'react';
import api from '../../services/api';
import { ShieldCheck, CheckCircle, XCircle, Users, Building2, Target, UserCheck } from 'lucide-react';

interface PendingUser { _id: string; name: string; email: string; role: string; district: string; state: string; createdAt: string; }
interface PendingClub { _id: string; name: string; district: string; state: string; sports: string[]; }
interface PendingOpp  { _id: string; title: string; sport: string; type: string; organizationId: { name: string }; }

interface PendingData {
  organizations: PendingUser[];
  teachers: PendingUser[];
  scouts: PendingUser[];
  clubs: PendingClub[];
  opportunities: PendingOpp[];
}

export default function AdminVerifications() {
  const [data, setData] = useState<PendingData>({ organizations: [], teachers: [], scouts: [], clubs: [], opportunities: [] });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/admin/pending-verifications').then(r => setData(r.data.data)).catch(() => setError('Unable to load verification requests.')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const verify = async (id: string, type: string) => {
    try { await api.put(`/admin/verify/${id}?type=${type}`); flash('Verified successfully'); load(); } catch (err: any) { setError(err.response?.data?.message || 'Verification failed'); }
  };
  const reject = async (id: string, type: string) => {
    try { await api.put(`/admin/reject/${id}?type=${type}`); flash('Rejected'); load(); } catch (err: any) { setError(err.response?.data?.message || 'Rejection failed'); }
  };

  const total = data.organizations.length + data.teachers.length + data.scouts.length + data.clubs.length + data.opportunities.length;

  const UserRow = ({ u, type }: { u: PendingUser; type: string }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
          {u.name[0]}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 text-sm">{u.name}</p>
          <p className="text-xs text-gray-500">{u.email} · {u.district}, {u.state}</p>
          <p className="text-xs text-gray-400">Registered: {new Date(u.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={() => verify(u._id, type)} className="flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors">
          <CheckCircle size={12} /> Approve
        </button>
        <button onClick={() => reject(u._id, type)} className="flex items-center gap-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors">
          <XCircle size={12} /> Reject
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="card h-48 animate-pulse bg-gray-100" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <ShieldCheck size={24} className="text-primary-600" /> Verification Centre
        {total > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{total} pending</span>}
      </h1>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 flex items-center gap-2">
          <CheckCircle size={16} /> {msg}
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      {/* Pending Opportunities */}
      {data.opportunities.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={18} className="text-purple-600" /> Opportunities ({data.opportunities.length})
          </h3>
          <div className="space-y-3">
            {data.opportunities.map(o => (
              <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{o.title}</p>
                  <p className="text-xs text-gray-500">{o.sport} · {o.type} · by {o.organizationId?.name || 'Organization'} · Pending verification</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => verify(o._id, 'opportunity')} className="flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors">
                    <CheckCircle size={12} /> Approve & Publish
                  </button>
                  <button onClick={() => reject(o._id, 'opportunity')} className="flex items-center gap-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors">
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Organizations */}
      {data.organizations.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" /> Government Organizations ({data.organizations.length})
          </h3>
          <div className="space-y-3">
            {data.organizations.map(u => <UserRow key={u._id} u={u} type="organization" />)}
          </div>
        </div>
      )}

      {/* Pending Teachers */}
      {data.teachers.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserCheck size={18} className="text-green-600" /> PE Teachers ({data.teachers.length})
          </h3>
          <div className="space-y-3">
            {data.teachers.map(u => <UserRow key={u._id} u={u} type="teacher" />)}
          </div>
        </div>
      )}

      {/* Pending Scouts */}
      {data.scouts.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} className="text-orange-600" /> Scouts ({data.scouts.length})
          </h3>
          <div className="space-y-3">
            {data.scouts.map(u => <UserRow key={u._id} u={u} type="scout" />)}
          </div>
        </div>
      )}

      {/* Pending Clubs */}
      {data.clubs.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-orange-600" /> Clubs ({data.clubs.length})
          </h3>
          <div className="space-y-3">
            {data.clubs.map(c => (
              <div key={c._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.district}, {c.state} · {c.sports.join(', ')}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => verify(c._id, 'club')} className="flex items-center gap-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors">
                    <CheckCircle size={12} /> Verify
                  </button>
                  <button onClick={() => reject(c._id, 'club')} className="flex items-center gap-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors">
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="card text-center py-12">
          <CheckCircle size={40} className="mx-auto text-green-400 mb-3" />
          <p className="text-gray-500">All caught up! No pending verifications.</p>
        </div>
      )}
    </div>
  );
}
