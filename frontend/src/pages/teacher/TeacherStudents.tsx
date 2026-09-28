import { FormEvent, useEffect, useState } from 'react';
import api from '../../services/api';
import { User, StudentProfile } from '../../types';
import { Users, Star, TrendingUp, UserPlus, X, Pencil, Trash2 } from 'lucide-react';

const SPORTS = ['Athletics', 'Football', 'Hockey', 'Kabaddi', 'Volleyball', 'Basketball', 'Badminton', 'Wrestling', 'Swimming'];
const emptyForm = { name: '', email: '', phone: '', password: '', dateOfBirth: '', gender: 'male', school: '', district: '', state: 'Karnataka', sportInterests: 'Athletics', parentConsent: false };

export default function TeacherStudents() {
  const [students, setStudents] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tests/my-students');
      setStudents(response.data.data.students || []);
      setProfiles(response.data.data.profiles || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, sportInterests: form.sportInterests.split(',').map(s => s.trim()).filter(Boolean) };
      if (editingId) {
        await api.put(`/students/${editingId}`, payload);
      } else {
        await api.post('/students', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (student: User) => {
    const studentId = student.id || String((student as unknown as { _id: string })._id);
    const profile = getProfile(studentId);
    setEditingId(studentId);
    setError('');
    setForm({
      name: student.name,
      email: student.email,
      phone: (student as unknown as { phone?: string }).phone || '',
      password: '',
      dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : '',
      gender: profile?.gender || 'male',
      school: profile?.school || '',
      district: student.district || '',
      state: student.state || 'Karnataka',
      sportInterests: profile?.sportInterests?.join(', ') || 'Athletics',
      parentConsent: profile?.parentConsent || false,
    });
    setShowForm(true);
  };

  const removeStudent = async (studentId: string) => {
    if (!window.confirm('Remove this student from your active student list? Their assessment history will be preserved.')) return;
    setDeletingId(studentId);
    setError('');
    try {
      await api.delete(`/students/${studentId}`);
      await loadStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove student');
    } finally {
      setDeletingId(null);
    }
  };

  const getProfile = (userId: string) => profiles.find(profile => String((profile.userId as unknown as { _id: string })?._id || profile.userId) === userId);

  if (loading) return <div className="card h-48 animate-pulse bg-gray-100" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">My Students ({students.length})</h1>
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true); setError(''); }}><UserPlus size={16} /> Add Student</button>
      </div>
      {error && !showForm && <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</p>}
      {showForm && <div className="card">
        <div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-gray-900">{editingId ? 'Edit Student' : 'Register Student'}</h2><button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-700"><X size={18} /></button></div>
        {error && <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</p>}
        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
          {!editingId && <div><label className="label">Temporary Password</label><input type="password" minLength={8} className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>}
          <div><label className="label">Date of Birth</label><input type="date" className="input" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} required /></div>
          <div><label className="label">Gender</label><select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
          <div><label className="label">School</label><input className="input" value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} required /></div>
          <div><label className="label">District</label><input className="input" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} required /></div>
          <div><label className="label">State</label><input className="input" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required /></div>
          <div><label className="label">Sport Interest</label><select className="input" value={form.sportInterests} onChange={e => setForm({ ...form, sportInterests: e.target.value })}>{SPORTS.map(sport => <option key={sport}>{sport}</option>)}</select></div>
          <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.parentConsent} onChange={e => setForm({ ...form, parentConsent: e.target.checked })} required /> Parent/guardian consent has been obtained.</label>
          <div className="md:col-span-2 flex justify-end"><button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Student Profile'}</button></div>
        </form>
      </div>}
      {students.length === 0 ? <div className="card text-center py-12"><Users size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No students added yet.</p><p className="text-sm text-gray-400 mt-1">Use Add Student to create a profile.</p></div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(student => {
          const studentId = student.id || String((student as unknown as { _id: string })._id);
          const profile = getProfile(studentId);
          return <div key={studentId} className="card hover:shadow-md transition-shadow"><div className="flex items-start gap-3 mb-3"><div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">{student.name[0]}</div><div className="flex-1 min-w-0"><p className="font-medium text-gray-900 truncate">{student.name}</p><p className="text-xs text-gray-500">{student.district}, {student.state}</p></div><div className="flex items-center gap-1"><button type="button" title="Edit student" aria-label={`Edit ${student.name}`} onClick={() => startEdit(student)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"><Pencil size={15} /></button><button type="button" title="Remove student" aria-label={`Remove ${student.name}`} onClick={() => removeStudent(studentId)} disabled={deletingId === studentId} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button></div></div><div className="flex items-end justify-between"><div className="flex flex-wrap gap-1">{profile?.sportInterests?.map(sport => <span key={sport} className="badge-blue text-xs">{sport}</span>)}{profile?.potentialFlag && <span className="badge-green flex items-center gap-1 text-xs"><Star size={10} /> Potential</span>}{profile?.improvementFlag && <span className="badge-blue flex items-center gap-1 text-xs"><TrendingUp size={10} /> Improving</span>}</div><div className="text-right ml-2"><p className="text-lg font-bold text-primary-600">{profile?.overallScore || 0}</p><p className="text-xs text-gray-400">Score</p></div></div></div>;
        })}
      </div>}
    </div>
  );
}