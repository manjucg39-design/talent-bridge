import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Opportunity } from '../types';
import { Target, MapPin, Calendar, Search } from 'lucide-react';

const SPORTS = ['', 'Athletics', 'Football', 'Hockey', 'Kabaddi', 'Volleyball', 'Basketball', 'Badminton', 'Wrestling', 'Swimming'];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sport: '', state: '' });

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.sport) params.set('sport', filters.sport);
    if (filters.state) params.set('state', filters.state);
    api.get(`/opportunities?${params}`).then(r => setOpportunities(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-800 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Opportunity Hub</h1>
          <p className="text-primary-200">Trials, camps, scholarships, and competitions for athletes across India</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="card">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="label">Sport</label>
              <select className="input w-40" value={filters.sport} onChange={e => setFilters(f => ({ ...f, sport: e.target.value }))}>
                {SPORTS.map(s => <option key={s} value={s}>{s || 'All Sports'}</option>)}
              </select>
            </div>
            <div>
              <label className="label">State</label>
              <input className="input w-40" value={filters.state} onChange={e => setFilters(f => ({ ...f, state: e.target.value }))} placeholder="e.g. Karnataka" />
            </div>
            <button onClick={load} className="btn-primary flex items-center gap-2 text-sm">
              <Search size={14} /> Search
            </button>
            <Link to="/login" className="btn-secondary text-sm ml-auto">Sign in for personalized matches</Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)}</div>
        ) : opportunities.length === 0 ? (
          <div className="card text-center py-12">
            <Target size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No opportunities found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map(opp => (
              <div key={opp._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold text-gray-900">{opp.title}</h3>
                      {opp.isDemo && <span className="badge-gray">DEMO</span>}
                      <span className="badge-blue">{opp.type}</span>
                      <span className="badge-green">{opp.sport}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{opp.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {opp.location}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> Deadline: {new Date(opp.registrationDeadline).toLocaleDateString('en-IN')}</span>
                      <span>Age: {opp.ageMin}–{opp.ageMax}</span>
                    </div>
                  </div>
                  <Link to={`/opportunities/${opp._id}`} className="btn-primary text-sm flex-shrink-0">View Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
