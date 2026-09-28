import { useEffect, useState } from 'react';
import api from '../../services/api';
import { User } from '../../types';
import { Users, ShieldCheck, ShieldOff } from 'lucide-react';

const roleColors: Record<string, string> = {
  STUDENT: 'badge-blue', PE_TEACHER: 'badge-green', CLUB: 'badge-orange',
  SCOUT: 'badge-gray', GOVERNMENT_ORGANIZATION: 'badge-blue', ADMIN: 'badge-red',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      const records = Array.isArray(response.data?.data) ? response.data.data : [];
      setUsers(records);
      setError('');
    } catch (err: any) {
      const message = err.response?.data?.message || (err.response?.status === 401 ? 'Admin session expired. Please sign in again.' : err.response?.status === 403 ? 'Admin access is required to view users.' : 'Unable to load users. Check that the backend is running.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const setActive = async (user: User, active: boolean) => {
    if (!active && !window.confirm(`Suspend ${user.name}?`)) return;
    try {
      const id = user.id || String((user as unknown as { _id: string })._id);
      const response = await api.put(`/admin/users/${id}/status`, { active });
      setUsers(items => items.map(item => (item.id || String((item as unknown as { _id: string })._id)) === id ? response.data.data : item));
    } catch (err: any) { setError(err.response?.data?.message || 'Unable to update user status.'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="card h-48 animate-pulse bg-gray-100" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Users size={24} /> All Users ({users.length})</h1>
        <input className="input w-64" placeholder="Search by name, email, role..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center justify-between gap-3"><span>{error}</span><button type="button" onClick={loadUsers} className="btn-secondary text-xs py-1.5 px-3">Retry</button></div>}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-gray-500 font-medium">Name</th>
              <th className="text-left py-2 px-3 text-gray-500 font-medium">Email</th>
              <th className="text-left py-2 px-3 text-gray-500 font-medium">Role</th>
              <th className="text-left py-2 px-3 text-gray-500 font-medium">Location</th>
              <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
              <th className="text-right py-2 px-3 text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id || String((u as unknown as { _id: string })._id)} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-900">{u.name}</td>
                <td className="py-2 px-3 text-gray-500">{u.email}</td>
                <td className="py-2 px-3"><span className={roleColors[u.role] || 'badge-gray'}>{u.role.replace('_', ' ')}</span></td>
                <td className="py-2 px-3 text-gray-500">{u.district}, {u.state}</td>
                <td className="py-2 px-3">
                  <span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.verificationStatus || (u.isActive ? 'Active' : 'Suspended')}</span>
                </td>
                <td className="py-2 px-3 text-right"><button title={u.isActive ? 'Suspend user' : 'Reactivate user'} onClick={() => setActive(u, !u.isActive)} className={`p-1.5 rounded ${u.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>{u.isActive ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No users found.</p>}
      </div>
    </div>
  );
}
