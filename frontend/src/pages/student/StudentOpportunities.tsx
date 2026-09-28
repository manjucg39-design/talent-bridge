import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Opportunity } from '../../types';
import { Target, MapPin, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

export default function StudentOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/opportunities/matched').then(r => setOpportunities(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const apply = async (oppId: string) => {
    setApplying(oppId);
    try {
      await api.post('/opportunities/apply', { opportunityId: oppId });
      setApplied(prev => new Set([...prev, oppId]));
      setMsg('Application submitted successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: unknown) {
      setMsg((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Application failed');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setApplying(null);
    }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-32 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Matched Opportunities</h1>
        <Link to="/opportunities" className="btn-secondary text-sm">Browse All</Link>
      </div>

      {msg && <div className={`rounded-lg p-3 text-sm ${msg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg}</div>}

      {opportunities.length === 0 ? (
        <div className="card text-center py-12">
          <Target size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No matching opportunities found.</p>
          <p className="text-sm text-gray-400 mt-1">Complete your profile and ensure your sport interests are set.</p>
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
                  {opp.matchReasons && opp.matchReasons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {opp.matchReasons.map(r => (
                        <span key={r} className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} /> {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{opp.matchScore}%</div>
                    <p className="text-xs text-gray-500">Match</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/opportunities/${opp._id}`} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                      Details <ArrowRight size={12} />
                    </Link>
                    {applied.has(opp._id) ? (
                      <span className="badge-green flex items-center gap-1 px-3 py-1.5"><CheckCircle size={12} /> Applied</span>
                    ) : (
                      <button onClick={() => apply(opp._id)} disabled={applying === opp._id} className="btn-primary text-xs py-1.5 px-3">
                        {applying === opp._id ? 'Applying...' : 'Apply Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
