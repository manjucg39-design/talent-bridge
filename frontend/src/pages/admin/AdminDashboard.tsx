import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, Building2, Target, ShieldCheck, TrendingUp, Star } from 'lucide-react';

interface Stats { students: number; teachers: number; clubs: number; scouts: number; orgs: number; opportunities: number; applications: number; flagged: number; improving: number; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).catch(() => setError('Unable to load admin dashboard data.')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}</div>;

  const cards = [
    { label: 'Students', value: stats?.students, icon: <Users size={20} className="text-blue-600" />, bg: 'bg-blue-100' },
    { label: 'PE Teachers', value: stats?.teachers, icon: <Users size={20} className="text-green-600" />, bg: 'bg-green-100' },
    { label: 'Clubs', value: stats?.clubs, icon: <Building2 size={20} className="text-orange-600" />, bg: 'bg-orange-100' },
    { label: 'Opportunities', value: stats?.opportunities, icon: <Target size={20} className="text-purple-600" />, bg: 'bg-purple-100' },
    { label: 'Applications', value: stats?.applications, icon: <ShieldCheck size={20} className="text-red-600" />, bg: 'bg-red-100' },
    { label: 'Potential Flagged', value: stats?.flagged, icon: <Star size={20} className="text-yellow-600" />, bg: 'bg-yellow-100' },
    { label: 'Improving Athletes', value: stats?.improving, icon: <TrendingUp size={20} className="text-teal-600" />, bg: 'bg-teal-100' },
    { label: 'Organizations', value: stats?.orgs, icon: <Building2 size={20} className="text-indigo-600" />, bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="stat-card">
            <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>{c.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{c.value ?? 0}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Admin Actions</h3>
          <div className="space-y-2">
            <Link to="/dashboard/admin/verifications" className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <ShieldCheck size={18} className="text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Pending Verifications</p>
                <p className="text-xs text-gray-500">Review organizations, clubs, and opportunities</p>
              </div>
            </Link>
            <Link to="/dashboard/admin/users" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Users size={18} className="text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Manage Users</p>
                <p className="text-xs text-gray-500">View and manage all platform users</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Platform Health</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Scouts', value: stats?.scouts },
              { label: 'Government Orgs', value: stats?.orgs },
            ].map(i => (
              <div key={i.label} className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">{i.label}</span>
                <span className="font-semibold text-gray-900">{i.value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
