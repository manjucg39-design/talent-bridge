import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy } from 'lucide-react';

const ROLES = [
  { value: 'STUDENT', label: 'Student / Athlete' },
  { value: 'PE_TEACHER', label: 'PE Teacher' },
  { value: 'CLUB', label: 'Sports Club' },
  { value: 'SCOUT', label: 'Scout / Coach' },
  { value: 'GOVERNMENT_ORGANIZATION', label: 'Government Organization' },
];

const STATES = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Odisha', 'West Bengal', 'Punjab', 'Haryana'];

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'STUDENT',
    state: '', district: '', location: '',
    dateOfBirth: '', gender: 'male', school: '', sportInterests: '', parentConsent: false,
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload: Record<string, unknown> = { ...form };
      if (form.role === 'STUDENT') {
        payload.sportInterests = form.sportInterests.split(',').map(s => s.trim()).filter(Boolean);
      }
      await register(payload);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Talent Bridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        </div>

        <div className="card">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">I am a</label>
                <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your full name" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="10-digit number" />
              </div>
              <div>
                <label className="label">State</label>
                <select className="input" value={form.state} onChange={e => set('state', e.target.value)} required>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">District</label>
                <input className="input" value={form.district} onChange={e => set('district', e.target.value)} required placeholder="Your district" />
              </div>
              <div className="col-span-2">
                <label className="label">Password</label>
                <input type="password" className="input" value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} placeholder="Min 8 characters" />
              </div>
            </div>

            {form.role === 'STUDENT' && (
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <p className="text-sm font-semibold text-gray-700">Student Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Date of Birth</label>
                    <input type="date" className="input" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="label">School Name</label>
                    <input className="input" value={form.school} onChange={e => set('school', e.target.value)} placeholder="Your school name" required />
                  </div>
                  <div className="col-span-2">
                    <label className="label">Sport Interests (comma separated)</label>
                    <input className="input" value={form.sportInterests} onChange={e => set('sportInterests', e.target.value)} placeholder="Athletics, Football, Kabaddi" />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="consent" checked={form.parentConsent} onChange={e => set('parentConsent', e.target.checked)} className="rounded" required />
                    <label htmlFor="consent" className="text-sm text-gray-700">Parent/guardian consent obtained for platform participation</label>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
