import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, Star, TrendingUp, Users, Filter } from 'lucide-react';

interface Stats { totalAthletes: number; flagged: number; improving: number; shortlisted: number; }

export default function ScoutDashboard() {
  const [stats, setStats] = useState<Stats>({ totalAthletes: 0, flagged: 0, improving: 0, shortlisted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/scouts/stats').then(r => setStats(r.data.data)).catch(() => setError('Unable to load scouting data.')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Scouting Dashboard</h1>
        <Link to="/dashboard/scout/athletes" className="btn-primary flex items-center gap-2 text-sm">
          <Search size={16} /> Discover Athletes
        </Link>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Athletes', value: stats.totalAthletes, icon: <Users size={20} className="text-blue-600" />, bg: 'bg-blue-100' },
          { label: 'Potential Flagged', value: stats.flagged, icon: <Star size={20} className="text-yellow-600" />, bg: 'bg-yellow-100' },
          { label: 'Improving Athletes', value: stats.improving, icon: <TrendingUp size={20} className="text-green-600" />, bg: 'bg-green-100' },
          { label: 'My Shortlist', value: stats.shortlisted, icon: <Filter size={20} className="text-purple-600" />, bg: 'bg-purple-100' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { to: '/dashboard/scout/athletes?potentialFlag=true', label: 'View Potential Flagged Athletes', sub: 'Athletes flagged by AI assessment', icon: <Star size={18} className="text-yellow-500" /> },
              { to: '/dashboard/scout/athletes?improvementFlag=true', label: 'View Improving Athletes', sub: 'Athletes showing significant improvement', icon: <TrendingUp size={18} className="text-green-500" /> },
              { to: '/dashboard/scout/shortlist', label: 'My Shortlist', sub: 'Athletes you have shortlisted', icon: <Filter size={18} className="text-purple-500" /> },
            ].map(a => (
              <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                {a.icon}
                <div>
                  <p className="text-sm font-medium text-gray-700">{a.label}</p>
                  <p className="text-xs text-gray-500">{a.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Scouting Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              'AI assessments are preliminary — use as a screening tool only',
              'Review full performance history before shortlisting',
              'Consider improvement trajectory, not just current score',
              'Shortlisting does not constitute official selection',
              'Refer athletes to official trials for formal evaluation',
            ].map((g, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
