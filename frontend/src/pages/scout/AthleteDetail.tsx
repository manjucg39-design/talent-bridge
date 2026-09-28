import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { StudentProfile, FitnessTest, AIAssessment, Achievement } from '../../types';
import { Star, TrendingUp, Zap, Trophy, ArrowLeft, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AthleteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<{ profile: StudentProfile; tests: FitnessTest[]; assessments: AIAssessment[]; achievements: Achievement[]; isShortlisted: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [shortlisting, setShortlisting] = useState(false);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/scouts/athletes/${id}`).then(r => setData(r.data.data)).catch(() => setError('Unable to load athlete details.')).finally(() => setLoading(false));
  }, [id]);

  const shortlist = async () => {
    setShortlisting(true);
    try {
      await api.post('/scouts/shortlist', { studentId: id, notes, status: 'shortlisted' });
      setData(d => d ? { ...d, isShortlisted: true } : d);
      setMsg('Athlete shortlisted successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to shortlist.');
    } finally {
      setShortlisting(false);
    }
  };

  const scoutAction = async (status: 'evaluation_requested' | 'referred') => {
    try {
      await api.post('/scouts/shortlist', { studentId: id, notes, status });
      setData(d => d ? { ...d, isShortlisted: true } : d);
      setMsg(status === 'evaluation_requested' ? 'Further evaluation requested.' : 'Training recommendation recorded.');
    } catch (err: any) { setError(err.response?.data?.message || 'Unable to save scout action.'); }
  };

  if (loading) return <div className="card h-64 animate-pulse bg-gray-100" />;
  if (!data) return <div className="card text-center py-12 text-gray-500">{error || 'Athlete not found.'}</div>;

  const { profile, tests, assessments, achievements, isShortlisted } = data;
  const user = profile.userId as unknown as { name: string; district: string; state: string; email: string };
  const age = Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const latest = assessments[0];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to Athletes
      </button>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">{msg}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-2xl font-bold flex-shrink-0">
              {user.name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                {profile.potentialFlag && <span className="badge-green flex items-center gap-1"><Star size={12} /> Potential</span>}
                {profile.improvementFlag && <span className="badge-blue flex items-center gap-1"><TrendingUp size={12} /> Improving</span>}
              </div>
              <p className="text-gray-500 text-sm">{age} years · {profile.gender} · {profile.school}</p>
              <p className="text-gray-500 text-sm">{user.district}, {user.state}</p>
              <div className="flex flex-wrap gap-1 mt-2">{profile.sportInterests?.map(s => <span key={s} className="badge-blue">{s}</span>)}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{profile.overallScore}</div>
              <p className="text-xs text-gray-500">Overall Score</p>
            </div>
            {isShortlisted ? (
              <span className="badge-green flex items-center gap-1 px-3 py-1.5"><CheckCircle size={14} /> Shortlisted</span>
            ) : (
              <div className="flex flex-col gap-2">
                <textarea className="input text-xs" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Scout notes (optional)" />
                <div className="flex flex-wrap gap-2"><button onClick={shortlist} disabled={shortlisting} className="btn-primary text-sm flex items-center gap-2"><Star size={14} /> {shortlisting ? 'Shortlisting...' : 'Shortlist Athlete'}</button><button onClick={() => scoutAction('evaluation_requested')} className="btn-secondary text-xs">Request Evaluation</button><button onClick={() => scoutAction('referred')} className="btn-secondary text-xs">Recommend Training</button></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Assessment */}
        {latest && (
          <div className="card border-l-4 border-primary-500">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-primary-600" />
              <h3 className="font-semibold text-gray-900">AI-Assisted Assessment</h3>
              <span className="badge-blue ml-auto">Preliminary</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{latest.performanceScore}</p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold">{latest.confidenceScore}%</p>
                <p className="text-xs text-gray-500">Confidence</p>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Strengths</p>
              <div className="flex flex-wrap gap-1">{latest.strengthAreas.map(s => <span key={s} className="badge-green text-xs">{s}</span>)}</div>
            </div>
            <p className="text-xs text-gray-600 bg-blue-50 rounded-lg p-2 mt-2">{latest.recommendation}</p>
            <p className="text-xs text-gray-400 mt-2 italic">Preliminary assessment only. Not an official selection.</p>
          </div>
        )}

        {/* Recent Tests */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Fitness Tests</h3>
          {tests.length > 0 ? (
            <div className="space-y-2">
              {tests.slice(0, 5).map(t => (
                <div key={t._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <span className="font-medium capitalize">{t.testType}</span>
                    <span className="text-gray-500 ml-2">{t.sport}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs">{new Date(t.testDate).toLocaleDateString('en-IN')}</span>
                    <span className="font-semibold text-primary-600">{t.score}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No tests recorded yet.</p>}
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Trophy size={18} className="text-yellow-500" /> Achievements</h3>
          <div className="space-y-2">
            {achievements.map(a => (
              <div key={a._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <Trophy size={14} className="text-yellow-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.organization} · {new Date(a.date).toLocaleDateString('en-IN')}</p>
                </div>
                {a.result && <span className="badge-green text-xs">{a.result}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
