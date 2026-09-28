import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Opportunity } from '../../types';
import { PlusCircle, Target, CheckCircle, Clock, Pencil, Trash2, Users, Save, X, Eye, Search } from 'lucide-react';

const statusColors: Record<string, string> = { draft: 'badge-gray', published: 'badge-green', closed: 'badge-red' };
const verifyColors: Record<string, string> = { pending: 'badge-orange', approved: 'badge-green', rejected: 'badge-red' };

export default function GovDashboard() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [editingApplication, setEditingApplication] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState('under_review');

  const load = () => Promise.all([api.get('/opportunities/my'), api.get('/opportunities/applications/org')]).then(([opportunities, applicationResponse]) => { setOpps(opportunities.data.data || []); setApplications(applicationResponse.data.data || []); }).catch(() => setError('Unable to load organization data.')).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const deleteOpportunity = async (id: string, status: string) => {
    if (status === 'published') { setError('Published opportunities cannot be deleted.'); return; }
    if (!window.confirm('Delete this opportunity?')) return;
    try { await api.delete(`/opportunities/${id}`); await load(); } catch (err: any) { setError(err.response?.data?.message || 'Unable to delete opportunity.'); }
  };

  const saveApplication = async (id: string) => {
    try { await api.put(`/opportunities/applications/${id}/status`, { status: applicationStatus }); setApplications(items => items.map(item => item._id === id ? { ...item, status: applicationStatus } : item)); setEditingApplication(null); } catch (err: any) { setError(err.response?.data?.message || 'Unable to update application.'); }
  };

  if (loading) return <div className="card h-48 animate-pulse bg-gray-100" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Organization Dashboard</h1>
        <Link to="/dashboard/gov/create" className="btn-primary flex items-center gap-2 text-sm">
          <PlusCircle size={16} /> Create Opportunity
        </Link>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      <div className="card bg-slate-950 text-white border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-cyan-300 text-xs font-bold uppercase tracking-widest">Reverse talent discovery</p><h2 className="text-xl font-bold mt-2">Find capability, not just applicants.</h2><p className="text-sm text-slate-400 mt-1">Search verified talent and projects using the problem you need to solve.</p></div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm"><Search size={16} /> emergency traffic / IoT / GPS</div>
        </div>
        <div className="mt-5 bg-white rounded-xl p-4 text-slate-900 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">RK</div><div><p className="font-semibold">Rahul Kumar <span className="badge-green ml-2">Verified project</span></p><p className="text-xs text-slate-500 mt-1">Smart Green Corridor for Emergency Ambulances</p><div className="flex flex-wrap gap-1 mt-2">{['IoT', 'GPS', 'LoRa', 'Embedded Systems'].map(skill => <span key={skill} className="badge-blue">{skill}</span>)}</div></div></div>
          <div className="text-right"><p className="text-2xl font-bold text-emerald-600">95%</p><p className="text-xs text-slate-500">potential relevance</p><p className="text-xs text-slate-500 mt-1">Matched on project context and skills</p></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: opps.length, icon: <Target size={20} className="text-blue-600" />, bg: 'bg-blue-100' },
          { label: 'Published', value: opps.filter(o => o.status === 'published').length, icon: <CheckCircle size={20} className="text-green-600" />, bg: 'bg-green-100' },
          { label: 'Pending Review', value: opps.filter(o => o.verificationStatus === 'pending').length, icon: <Clock size={20} className="text-orange-600" />, bg: 'bg-orange-100' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
            <div><p className="text-2xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">My Opportunities</h3>
        {opps.length === 0 ? (
          <div className="text-center py-8">
            <Target size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No opportunities created yet.</p>
            <Link to="/dashboard/gov/create" className="btn-primary text-sm mt-4 inline-block">Create First Opportunity</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {opps.map(o => (
              <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{o.title}</p>
                  <p className="text-xs text-gray-500">{o.sport} · {o.type} · Deadline: {new Date(o.registrationDeadline).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0"><Link title="View opportunity details" aria-label={`View ${o.title}`} to={`/opportunities/${o._id}`} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"><Eye size={15} /></Link><Link title="Edit opportunity" aria-label={`Edit ${o.title}`} to={`/dashboard/gov/opportunities/${o._id}/edit`} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"><Pencil size={15} /></Link><button title="Delete opportunity" aria-label={`Delete ${o.title}`} onClick={() => deleteOpportunity(o._id, o.status)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                  <span className={verifyColors[o.verificationStatus] || 'badge-gray'}>{o.verificationStatus}</span>
                  <span className={statusColors[o.status] || 'badge-gray'}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card"><h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Users size={18} /> Applications ({applications.length})</h3>{applications.length === 0 ? <p className="text-sm text-gray-500">No applications received yet.</p> : <div className="space-y-3">{applications.map(application => <div key={application._id} className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3"><div><p className="font-medium text-gray-900">{application.studentId?.name || 'Student'}</p><p className="text-xs text-gray-500">{application.opportunityId?.title} · Applied {new Date(application.submittedAt).toLocaleDateString('en-IN')}</p></div>{editingApplication === application._id ? <div className="flex items-center gap-2"><select className="input text-xs py-1" value={applicationStatus} onChange={event => setApplicationStatus(event.target.value)}><option value="submitted">Submitted</option><option value="under_review">Under Review</option><option value="shortlisted">Shortlisted</option><option value="selected">Selected</option><option value="rejected">Rejected</option><option value="completed">Completed</option></select><button title="Save status" onClick={() => saveApplication(application._id)} className="p-1.5 text-green-600"><Save size={15} /></button><button title="Cancel" onClick={() => setEditingApplication(null)} className="p-1.5 text-gray-400"><X size={15} /></button></div> : <div className="flex items-center gap-2"><span className="badge-blue">{application.status.replace('_', ' ')}</span><button title="Edit application status" onClick={() => { setEditingApplication(application._id); setApplicationStatus(application.status); }} className="p-1.5 text-gray-400 hover:text-primary-600"><Pencil size={15} /></button></div>}</div>)}</div>}</div>

      <div className="card bg-blue-50 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-2">Verification Process</h3>
        <ol className="space-y-1 text-sm text-gray-600">
          {['Submit opportunity details', 'Admin reviews for accuracy and compliance', 'Approved opportunities are published', 'Eligible athletes receive automatic notifications'].map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
