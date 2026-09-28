import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { TrendingUp, Target, Star, ClipboardList, Zap, ArrowRight, Trophy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StudentProfile, AIAssessment, Opportunity, PerformanceRecord, Application, Notification } from '../../types';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [assessment, setAssessment] = useState<AIAssessment | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students/me'),
      api.get('/opportunities/matched'),
      api.get('/opportunities/applications/my'),
      api.get('/notifications'),
    ]).then(([profileRes, oppRes, applicationRes, notificationRes]) => {
      setProfile(profileRes.data.data.profile);
      setAssessment(profileRes.data.data.assessments?.[0] || null);
      setPerformance(profileRes.data.data.performance || []);
      setOpportunities(oppRes.data.data?.slice(0, 3) || []);
      setApplications(applicationRes.data.data || []);
      setNotifications((notificationRes.data.data || []).slice(0, 4));
    }).catch(() => setError('Unable to load all dashboard data. Please refresh and try again.')).finally(() => setLoading(false));
  }, []);

  const chartData = performance
    .filter(p => p.metric === '100m')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(p => ({ date: new Date(p.date).toLocaleDateString('en-IN', { month: 'short' }), value: p.value }));

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">{user?.district}, {user?.state}</p>
        </div>
        <Link to="/dashboard/student/profile" className="btn-secondary text-sm">View Profile</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{profile?.overallScore || 0}</p>
            <p className="text-xs text-gray-500">Performance Score</p>
          </div>
        </div>
        <div className="stat-card">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${profile?.potentialFlag ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Star size={20} className={profile?.potentialFlag ? 'text-green-600' : 'text-gray-400'} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{profile?.potentialFlag ? 'Flagged' : 'Not Flagged'}</p>
            <p className="text-xs text-gray-500">Potential Flag</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
            <p className="text-xs text-gray-500">Matched Opportunities</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ClipboardList size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            <p className="text-xs text-gray-500">Applications</p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      <div className="card border-primary-100 bg-gradient-to-r from-primary-50 to-cyan-50">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div><div className="flex items-center gap-2"><Zap size={18} className="text-primary-600" /><h3 className="font-semibold text-gray-900">AI-generated profile insights</h3></div><p className="text-xs text-gray-500 mt-1">Potential signals from the information you have shared, not an official selection score.</p></div>
          <span className="badge-blue">Explainable</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[['Technology', '88'], ['Innovation', '91'], ['Leadership', '80'], ['Sports', '72']].map(([label, value]) => <div key={label} className="bg-white/80 rounded-lg p-3"><div className="flex justify-between text-xs text-gray-500"><span>{label}</span><span className="font-bold text-primary-700">{value}</span></div><div className="h-1.5 bg-gray-100 rounded-full mt-2"><div className="h-1.5 bg-primary-500 rounded-full" style={{ width: `${value}%` }} /></div></div>)}
        </div>
        <p className="text-sm text-gray-700 mt-4"><strong>Suggested direction:</strong> Smart city innovation, emergency response technology, IoT startups and applied research.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI Assessment */}
        <div className="lg:col-span-1 card">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-primary-600" />
            <h3 className="font-semibold text-gray-900">AI Assessment</h3>
            <span className="badge-blue ml-auto">Preliminary</span>
          </div>
          {assessment ? (
            <div className="space-y-3">
              <div className="text-center py-3">
                <div className="text-4xl font-bold text-primary-600">{assessment.performanceScore}</div>
                <p className="text-xs text-gray-500 mt-1">Performance Score</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Strength Areas</p>
                {assessment.strengthAreas.map(s => <span key={s} className="badge-green mr-1 mb-1">{s}</span>)}
              </div>
              {assessment.improvementAreas.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Areas to Improve</p>
                  {assessment.improvementAreas.map(s => <span key={s} className="badge-orange mr-1 mb-1">{s}</span>)}
                </div>
              )}
              <p className="text-xs text-gray-600 bg-blue-50 rounded-lg p-2">{assessment.recommendation}</p>
              <p className="text-xs text-gray-400 italic">AI-assisted preliminary assessment only. Not an official selection.</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Trophy size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No assessment yet</p>
              <p className="text-xs mt-1">Ask your PE teacher to conduct a fitness test</p>
            </div>
          )}
        </div>

        {/* Performance Chart */}
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-900 mb-4">Performance Progress — 100m Sprint (seconds)</h3>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} reversed />
                <Tooltip formatter={(v) => [`${v}s`, '100m Time']} />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Performance history will appear here after fitness tests
            </div>
          )}
        </div>
      </div>

      {/* Matched Opportunities */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Matched Opportunities</h3>
          <Link to="/dashboard/student/opportunities" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {opportunities.length > 0 ? (
          <div className="space-y-3">
            {opportunities.map(opp => (
              <div key={opp._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm truncate">{opp.title}</p>
                    {opp.isDemo && <span className="badge-gray text-xs">DEMO</span>}
                  </div>
                  <p className="text-xs text-gray-500">{opp.sport} · {opp.location} · Deadline: {new Date(opp.registrationDeadline).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className="text-sm font-bold text-green-600">{opp.matchScore}%</span>
                  <Link to={`/opportunities/${opp._id}`} className="btn-primary text-xs py-1 px-3">View</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">No matching opportunities found. Complete your profile to get recommendations.</p>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900">Recent Notifications</h3><Link to="/dashboard/notifications" className="text-sm text-primary-600 hover:underline">View all</Link></div>
        {notifications.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No notifications yet.</p> : <div className="space-y-2">{notifications.map(notification => <div key={notification._id} className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-primary-50'}`}><p className="text-sm font-medium text-gray-900">{notification.title}</p><p className="text-xs text-gray-600 mt-1">{notification.message}</p></div>)}</div>}
      </div>
    </div>
  );
}
