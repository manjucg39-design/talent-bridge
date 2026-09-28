import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { PlusCircle, CheckCircle } from 'lucide-react';

const SPORTS = ['Athletics', 'Football', 'Hockey', 'Kabaddi', 'Volleyball', 'Basketball', 'Badminton', 'Wrestling', 'Swimming'];
const TYPES = ['Government Selection Trial', 'Talent Identification Camp', 'Training Camp', 'Competition', 'Scholarship', 'Khelo India Opportunity', 'SAI-related Opportunity', 'Club Competition', 'District Trial', 'State Trial'];
const STATES = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Bihar'];

export default function CreateOpportunity() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(editing);
  const [form, setForm] = useState({
    title: '', type: TYPES[0], sport: 'Athletics', description: '',
    startDate: '', endDate: '', registrationDeadline: '',
    location: '', state: '', district: '',
    ageMin: '12', ageMax: '18', gender: 'all',
    eligibility: '', selectionProcess: '', applicationUrl: '',
    contactEmail: '', contactPhone: '', slots: '0',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!id) return;
    api.get(`/opportunities/${id}`).then(response => {
      const opportunity = response.data.data;
      setForm({
        title: opportunity.title, type: opportunity.type, sport: opportunity.sport, description: opportunity.description,
        startDate: opportunity.startDate.slice(0, 10), endDate: opportunity.endDate.slice(0, 10), registrationDeadline: opportunity.registrationDeadline.slice(0, 10),
        location: opportunity.location, state: opportunity.state, district: opportunity.district || '', ageMin: String(opportunity.ageMin), ageMax: String(opportunity.ageMax), gender: opportunity.gender,
        eligibility: opportunity.eligibility || '', selectionProcess: opportunity.selectionProcess || '', applicationUrl: opportunity.applicationUrl || '', contactEmail: opportunity.contactEmail || '', contactPhone: opportunity.contactPhone || '', slots: String(opportunity.slots || 0),
      });
    }).catch(() => setError('Unable to load opportunity details.')).finally(() => setLoadingRecord(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, ageMin: Number(form.ageMin), ageMax: Number(form.ageMax), slots: Number(form.slots) };
      if (id) await api.put(`/opportunities/${id}`, payload);
      else await api.post('/opportunities', payload);
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto card text-center py-10">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{editing ? 'Opportunity Updated' : 'Opportunity Submitted'}</h2>
        <p className="text-gray-600 mb-6">{editing ? 'Your updated opportunity is pending admin verification again.' : 'Your opportunity has been submitted for admin verification. It will be published once approved.'}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setSuccess(false); setForm(f => ({ ...f, title: '', description: '' })); }} className="btn-secondary">{editing ? 'Edit Again' : 'Create Another'}</button>
          <button onClick={() => navigate('/dashboard/gov')} className="btn-primary">View My Opportunities</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <PlusCircle size={24} className="text-primary-600" /> {editing ? 'Edit Opportunity' : 'Create Opportunity'}
      </h1>
      {loadingRecord && <div className="card h-20 animate-pulse bg-gray-100" />}
      {!loadingRecord && <div className="card">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Opportunity Title</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. District Athletics Selection Trial 2025" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sport</label>
              <select className="input" value={form.sport} onChange={e => set('sport', e.target.value)}>
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Describe the opportunity, events, and what athletes can expect..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" value={form.endDate} onChange={e => set('endDate', e.target.value)} required />
            </div>
            <div>
              <label className="label">Registration Deadline</label>
              <input type="date" className="input" value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Venue / Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} required placeholder="Stadium name, city" />
            </div>
            <div>
              <label className="label">State</label>
              <select className="input" value={form.state} onChange={e => set('state', e.target.value)} required>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Min Age</label>
              <input type="number" className="input" value={form.ageMin} onChange={e => set('ageMin', e.target.value)} required />
            </div>
            <div>
              <label className="label">Max Age</label>
              <input type="number" className="input" value={form.ageMax} onChange={e => set('ageMax', e.target.value)} required />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="all">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Eligibility Criteria</label>
            <textarea className="input" rows={2} value={form.eligibility} onChange={e => set('eligibility', e.target.value)} placeholder="Domicile, school enrollment, previous participation requirements..." />
          </div>
          <div>
            <label className="label">Selection Process</label>
            <textarea className="input" rows={2} value={form.selectionProcess} onChange={e => set('selectionProcess', e.target.value)} placeholder="How athletes will be evaluated and selected..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Email</label>
              <input type="email" className="input" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
            </div>
            <div>
              <label className="label">Available Slots</label>
              <input type="number" className="input" value={form.slots} onChange={e => set('slots', e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Saving...' : editing ? 'Save Changes for Verification' : 'Submit for Verification'}
          </button>
        </form>
      </div>
      }
    </div>
  );
}
