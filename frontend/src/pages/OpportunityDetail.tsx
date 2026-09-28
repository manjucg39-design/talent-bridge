import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Opportunity } from '../types';
import { MapPin, Calendar, Users, FileText, ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/opportunities/${id}`).then(r => setOpp(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  const apply = async () => {
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    try {
      await api.post('/opportunities/apply', { opportunityId: id });
      setApplied(true);
      setMsg('Application submitted successfully!');
    } catch (err: unknown) {
      setMsg((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto p-6 card h-64 animate-pulse bg-gray-100" />;
  if (!opp) return <div className="max-w-3xl mx-auto p-6 text-center text-gray-500">Opportunity not found.</div>;

  const deadline = new Date(opp.registrationDeadline);
  const isOpen = deadline > new Date() && opp.status === 'published';
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-800 text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-200 hover:text-white text-sm mb-4">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="bg-primary-700 text-primary-100 text-xs px-2 py-0.5 rounded-full">{opp.type}</span>
                <span className="bg-green-700 text-green-100 text-xs px-2 py-0.5 rounded-full">{opp.sport}</span>
                {opp.isDemo && <span className="bg-yellow-700 text-yellow-100 text-xs px-2 py-0.5 rounded-full">DEMO</span>}
              </div>
              <h1 className="text-2xl font-bold">{opp.title}</h1>
              <p className="text-primary-200 text-sm mt-1">{(opp.organizationId as unknown as { name: string })?.name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {isOpen ? (
                <div>
                  <span className="badge-green">Open</span>
                  {daysLeft <= 7 && <p className="text-yellow-300 text-xs mt-1">{daysLeft} days left</p>}
                </div>
              ) : (
                <span className="badge-red">Closed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {msg && <div className={`rounded-lg p-3 text-sm ${msg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg}</div>}

        {/* Key details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <MapPin size={16} />, label: 'Location', value: opp.location },
            { icon: <Calendar size={16} />, label: 'Deadline', value: deadline.toLocaleDateString('en-IN') },
            { icon: <Users size={16} />, label: 'Age Group', value: `${opp.ageMin}–${opp.ageMax} years` },
            { icon: <Users size={16} />, label: 'Gender', value: opp.gender === 'all' ? 'All' : opp.gender },
          ].map(d => (
            <div key={d.label} className="card text-center">
              <div className="flex justify-center text-primary-600 mb-1">{d.icon}</div>
              <p className="text-xs text-gray-500">{d.label}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{d.value}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">About This Opportunity</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{opp.description}</p>
        </div>

        {opp.eligibility && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Eligibility Criteria</h3>
            <p className="text-gray-700 text-sm">{opp.eligibility}</p>
          </div>
        )}

        {opp.documents?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileText size={16} /> Required Documents</h3>
            <ul className="space-y-1">
              {opp.documents.map(d => (
                <li key={d} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" /> {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {opp.selectionProcess && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Selection Process</h3>
            <p className="text-gray-700 text-sm">{opp.selectionProcess}</p>
          </div>
        )}

        {/* Apply */}
        <div className="card">
          {applied ? (
            <div className="text-center py-4">
              <CheckCircle size={40} className="mx-auto text-green-500 mb-2" />
              <p className="font-semibold text-gray-900">Application Submitted</p>
              <p className="text-sm text-gray-500 mt-1">Track your application status in your dashboard.</p>
              <Link to="/dashboard/student/applications" className="btn-primary text-sm mt-4 inline-block">View Applications</Link>
            </div>
          ) : isOpen ? (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Apply for This Opportunity</h3>
              {opp.isDemo && <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg p-2 mb-3">This is a DEMO opportunity. Not a real government announcement.</p>}
              {user?.role === 'STUDENT' ? (
                <button onClick={apply} disabled={applying} className="btn-primary w-full py-2.5">
                  {applying ? 'Submitting...' : 'Apply Now'}
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Sign in as a student to apply.</p>
                  <Link to="/login" className="btn-primary text-sm">Sign In to Apply</Link>
                </div>
              )}
              {opp.applicationUrl && (
                <a href={opp.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:underline mt-3">
                  <ExternalLink size={14} /> Official Application Link
                </a>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Registration for this opportunity is closed.</p>
          )}
        </div>

        {(opp.contactEmail || opp.contactPhone) && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
            {opp.contactEmail && <p className="text-sm text-gray-700">{opp.contactEmail}</p>}
            {opp.contactPhone && <p className="text-sm text-gray-700">{opp.contactPhone}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
