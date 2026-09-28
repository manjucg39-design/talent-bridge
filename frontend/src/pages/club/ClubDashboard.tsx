import { FormEvent, useEffect, useState } from 'react';
import { Activity, CalendarDays, CheckCircle2, Clipboard, Users } from 'lucide-react';
import api from '../../services/api';

interface ClubData {
  club: { name: string; verificationStatus: string; sports: string[]; district: string };
  stats: { activeAthletes: number; newRequests: number; trainingSessions: number; upcomingCompetitions: number };
  requests: Array<{ _id: string; overallScore: number; sportInterests: string[]; userId: { name: string; district: string } }>;
  trainingRecords: Array<{ _id: string; activity: string; performance: string; coachNotes: string; date: string; studentId: { name: string } }>;
}

export default function ClubDashboard() {
  const [data, setData] = useState<ClubData | null>(null);
  const [form, setForm] = useState({ studentId: '', activity: '', performance: '', coachNotes: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/clubs/dashboard').then(response => setData(response.data.data));
  useEffect(() => { load().catch(() => setError('Unable to load club dashboard data.')); }, []);

  const submitTraining = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      await api.post('/clubs/training', form);
      setForm({ studentId: '', activity: '', performance: '', coachNotes: '' });
      setMessage('Training progress recorded and athlete notified.');
      load();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Unable to record training progress.');
    }
  };

  if (!data) return error ? <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div> : <div className="card h-48 animate-pulse bg-gray-100" />;
  const stats = [
    ['Active Athletes', data.stats.activeAthletes, <Users size={20} />],
    ['New Requests', data.stats.newRequests, <Clipboard size={20} />],
    ['Training Sessions', data.stats.trainingSessions, <Activity size={20} />],
    ['Upcoming Competitions', data.stats.upcomingCompetitions, <CalendarDays size={20} />],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-gray-900">{data.club.name}</h1><p className="text-sm text-gray-500">{data.club.district} · {data.club.sports.join(', ')}</p></div><span className={data.club.verificationStatus === 'verified' ? 'badge-green' : 'badge-yellow'}>{data.club.verificationStatus === 'verified' ? 'Verified Club' : 'Pending Verification'}</span></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map(([label, value, icon]) => <div className="stat-card" key={String(label)}><div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">{icon}</div><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-gray-500">{label}</p></div></div>)}</div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card"><h2 className="font-semibold mb-4">Athlete Requests</h2>{data.requests.length === 0 ? <p className="text-sm text-gray-500">No eligible athlete requests yet.</p> : <div className="space-y-3">{data.requests.map(request => <div className="border-b border-gray-100 pb-3" key={request._id}><div className="flex justify-between"><div><p className="font-medium">{request.userId?.name}</p><p className="text-xs text-gray-500">{request.sportInterests.join(', ')} · {request.userId?.district}</p></div><span className="badge-blue">Score {request.overallScore}</span></div></div>)}</div>}</div>
        <form className="card space-y-3" onSubmit={submitTraining}><h2 className="font-semibold">Record Training Progress</h2><p className="text-xs text-gray-500">Use an athlete ID from an authorized club workflow.</p><input className="input" placeholder="Student ID" value={form.studentId} onChange={event => setForm({ ...form, studentId: event.target.value })} required /><input className="input" placeholder="Activity" value={form.activity} onChange={event => setForm({ ...form, activity: event.target.value })} required /><input className="input" placeholder="Performance" value={form.performance} onChange={event => setForm({ ...form, performance: event.target.value })} /><textarea className="input" placeholder="Coach notes" value={form.coachNotes} onChange={event => setForm({ ...form, coachNotes: event.target.value })} /><button className="btn-primary" type="submit">Save Training Record</button>{message && <p className="text-sm text-gray-600">{message}</p>}</form>
      </div>
      <div className="card"><h2 className="font-semibold mb-4">Recent Training Updates</h2>{data.trainingRecords.length === 0 ? <p className="text-sm text-gray-500">No training records yet.</p> : <div className="space-y-3">{data.trainingRecords.map(record => <div className="flex gap-3 border-b border-gray-100 pb-3" key={record._id}><CheckCircle2 size={18} className="text-green-600 mt-0.5" /><div><p className="font-medium">{record.studentId?.name} · {record.activity}</p><p className="text-sm text-gray-600">{record.performance || 'Progress recorded'} {record.coachNotes && `· ${record.coachNotes}`}</p><p className="text-xs text-gray-400">{new Date(record.date).toLocaleDateString()}</p></div></div>)}</div>}</div>
    </div>
  );
}