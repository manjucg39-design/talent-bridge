import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { StudentProfile } from '../../types';
import { Search, Star, TrendingUp, Filter } from 'lucide-react';

const SPORTS = ['', 'Athletics', 'Football', 'Hockey', 'Kabaddi', 'Volleyball', 'Basketball', 'Badminton', 'Wrestling', 'Swimming'];

export default function ScoutAthletes() {
  const [searchParams] = useSearchParams();
  const [athletes, setAthletes] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sport: '', state: '', district: '',
    potentialFlag: searchParams.get('potentialFlag') || '',
    improvementFlag: searchParams.get('improvementFlag') || '',
    minScore: '',
  });

  const fetchAthletes = () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/scouts/athletes?${params}`).then(r => setAthletes(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAthletes(); }, []);

  const user = (a: StudentProfile) => a.userId as unknown as { name: string; district: string; state: string };
  const age = (dob: string) => Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Athlete Discovery</h1>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="label">Sport</label>
            <select className="input" value={filters.sport} onChange={e => setFilters(f => ({ ...f, sport: e.target.value }))}>
              {SPORTS.map(s => <option key={s} value={s}>{s || 'All Sports'}</option>)}
            </select>
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))} placeholder="State" />
          </div>
          <div>
            <label className="label">District</label>
            <input className="input" value={filters.district} onChange={e => setFilters(f => ({ ...f, district: e.target.value }))} placeholder="District" />
          </div>
          <div>
            <label className="label">Min Score</label>
            <input type="number" className="input" value={filters.minScore} onChange={e => setFilters(f => ({ ...f, minScore: e.target.value }))} placeholder="e.g. 70" />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-1 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={filters.potentialFlag === 'true'} onChange={e => setFilters(f => ({ ...f, potentialFlag: e.target.checked ? 'true' : '' }))} />
              <Star size={14} className="text-yellow-500" /> Potential
            </label>
          </div>
          <div className="flex items-end">
            <button onClick={fetchAthletes} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="card h-32 animate-pulse bg-gray-100" />)}</div>
      ) : athletes.length === 0 ? (
        <div className="card text-center py-12">
          <Filter size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No athletes found matching your filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {athletes.map(a => (
            <Link key={a._id} to={`/dashboard/scout/athletes/${(a.userId as unknown as { _id: string })?._id || a.userId}`} className="card hover:shadow-md transition-shadow block">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
                  {user(a).name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user(a).name}</p>
                  <p className="text-xs text-gray-500">{age(a.dateOfBirth)} yrs · {user(a).district}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-primary-600">{a.overallScore}</p>
                  <p className="text-xs text-gray-400">Score</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {a.sportInterests?.map(s => <span key={s} className="badge-blue text-xs">{s}</span>)}
                {a.potentialFlag && <span className="badge-green flex items-center gap-1 text-xs"><Star size={10} /> Potential</span>}
                {a.improvementFlag && <span className="badge-blue flex items-center gap-1 text-xs"><TrendingUp size={10} /> Improving</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
