import { useEffect, useState } from 'react';
import api from '../../services/api';
import { StudentProfile, AIAssessment, Achievement } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Star, TrendingUp, Trophy, Plus, Zap, Trash2, CheckCircle } from 'lucide-react';

const ACH_TYPE_ICON: Record<string, string> = {
  medal: '🏅', certificate: '📜', competition_result: '🏆', personal_best: '⚡', participation: '🎽',
};

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [assessments, setAssessments] = useState<AIAssessment[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [achForm, setAchForm] = useState({ title: '', type: 'medal', organization: '', date: '', result: '' });
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get('/students/me').then(r => {
      setProfile(r.data.data.profile);
      setAssessments(r.data.data.assessments || []);
      setAchievements(r.data.data.achievements || []);
    }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const addAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/students/me/achievements', achForm);
      await load();
      setShowAddAchievement(false);
      setAchForm({ title: '', type: 'medal', organization: '', date: '', result: '' });
    } finally {
      setSaving(false);
    }
  };

  const deleteAchievement = async (id: string) => {
    if (!confirm('Delete this achievement?')) return;
    await api.delete(`/students/me/achievements/${id}`);
    setAchievements(a => a.filter(x => x._id !== id));
  };

  const age = profile
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;

  if (loading) return <div className="card h-64 animate-pulse bg-gray-100" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Athlete Profile</h1>

      {/* Basic Info */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-2xl font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              {profile?.potentialFlag && (
                <span className="badge-green flex items-center gap-1"><Star size={12} /> Potential Flagged</span>
              )}
              {profile?.improvementFlag && (
                <span className="badge-blue flex items-center gap-1"><TrendingUp size={12} /> Improving</span>
              )}
              {/* Verification badge */}
              <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                <CheckCircle size={10} /> Verified Student
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{age} years · {profile?.gender} · {profile?.school}</p>
            <p className="text-gray-500 text-sm">{user?.district}, {user?.state}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile?.sportInterests.map(s => <span key={s} className="badge-blue">{s}</span>)}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold text-primary-600">{profile?.overallScore || 0}</div>
            <p className="text-xs text-gray-500">Overall Score</p>
          </div>
        </div>
      </div>

      {/* Latest AI Assessment */}
      {assessments[0] && (
        <div className="card border-l-4 border-primary-500">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} className="text-primary-600" />
            <h3 className="font-semibold text-gray-900">Latest AI-Assisted Assessment</h3>
            <span className="badge-blue ml-auto">Preliminary</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Score', value: assessments[0].performanceScore, big: true },
              { label: 'Confidence', value: `${assessments[0].confidenceScore}%` },
              { label: 'Potential Flag', value: assessments[0].potentialFlag ? 'Yes' : 'No' },
              { label: 'Improvement Flag', value: assessments[0].improvementFlag ? 'Yes' : 'No' },
            ].map(c => (
              <div key={c.label} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className={`font-bold text-primary-600 ${c.big ? 'text-2xl' : 'text-sm'}`}>{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Strength Areas</p>
              <div className="flex flex-wrap gap-1">
                {assessments[0].strengthAreas.map(s => <span key={s} className="badge-green">{s}</span>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Areas to Improve</p>
              <div className="flex flex-wrap gap-1">
                {assessments[0].improvementAreas.map(s => <span key={s} className="badge-orange">{s}</span>)}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">{assessments[0].recommendation}</p>
          <p className="text-xs text-gray-400 mt-2 italic">
            This is a preliminary AI-assisted assessment. It does not constitute an official selection or evaluation.
          </p>
        </div>
      )}

      {/* Achievements */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" /> Achievements ({achievements.length})
          </h3>
          <button
            onClick={() => setShowAddAchievement(!showAddAchievement)}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <Plus size={14} /> Add Achievement
          </button>
        </div>

        {showAddAchievement && (
          <form onSubmit={addAchievement} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700">New Achievement</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Title</label>
                <input
                  className="input"
                  value={achForm.title}
                  onChange={e => setAchForm(f => ({ ...f, title: e.target.value }))}
                  required
                  placeholder="e.g. District 100m — 1st Place"
                />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={achForm.type} onChange={e => setAchForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="medal">🏅 Medal</option>
                  <option value="certificate">📜 Certificate</option>
                  <option value="competition_result">🏆 Competition Result</option>
                  <option value="personal_best">⚡ Personal Best</option>
                  <option value="participation">🎽 Participation</option>
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input" value={achForm.date} onChange={e => setAchForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Organization / Event</label>
                <input className="input" value={achForm.organization} onChange={e => setAchForm(f => ({ ...f, organization: e.target.value }))} placeholder="Organizing body" />
              </div>
              <div>
                <label className="label">Result / Description</label>
                <input className="input" value={achForm.result} onChange={e => setAchForm(f => ({ ...f, result: e.target.value }))} placeholder="e.g. 1st Place, 14.2s" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                {saving ? 'Saving...' : 'Save Achievement'}
              </button>
              <button type="button" onClick={() => setShowAddAchievement(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </form>
        )}

        {achievements.length > 0 ? (
          <div className="space-y-2">
            {achievements.map(a => (
              <div key={a._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                <div className="w-9 h-9 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                  {ACH_TYPE_ICON[a.type] || '🏅'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{a.title}</p>
                  <p className="text-xs text-gray-500">
                    {a.organization && `${a.organization} · `}
                    {new Date(a.date).toLocaleDateString('en-IN')}
                  </p>
                  {a.result && <p className="text-xs text-gray-600 mt-0.5">{a.result}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {a.verified && (
                    <span className="badge-green flex items-center gap-1 text-xs">
                      <CheckCircle size={10} /> Verified
                    </span>
                  )}
                  <button
                    onClick={() => deleteAchievement(a._id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete achievement"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-500">No achievements added yet.</p>
            <p className="text-xs text-gray-400 mt-1">Add your medals, certificates, and competition results.</p>
          </div>
        )}
      </div>
    </div>
  );
}
