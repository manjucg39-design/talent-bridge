import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, ClipboardList, Star, TrendingUp, PlusCircle } from 'lucide-react';

interface Stats { totalTests: number; totalStudents: number; flagged: number; improving: number; }

export default function TeacherDashboard() {
  const [stats, setStats] = useState<Stats>({ totalTests: 0, totalStudents: 0, flagged: 0, improving: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tests/teacher-stats').then(r => setStats(r.data.data)).catch(() => setError('Unable to load teacher dashboard data.')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <Link to="/dashboard/teacher/add-test" className="btn-primary flex items-center gap-2 text-sm">
          <PlusCircle size={16} /> Add Fitness Test
        </Link>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: <Users size={20} className="text-blue-600" />, bg: 'bg-blue-100' },
          { label: 'Tests Conducted', value: stats.totalTests, icon: <ClipboardList size={20} className="text-green-600" />, bg: 'bg-green-100' },
          { label: 'Potential Flagged', value: stats.flagged, icon: <Star size={20} className="text-yellow-600" />, bg: 'bg-yellow-100' },
          { label: 'Improving', value: stats.improving, icon: <TrendingUp size={20} className="text-purple-600" />, bg: 'bg-purple-100' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/dashboard/teacher/add-test" className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              <PlusCircle size={18} className="text-primary-600" />
              <div>
                <p className="text-sm font-medium text-primary-700">Add Fitness Test</p>
                <p className="text-xs text-gray-500">Record a new fitness test for a student</p>
              </div>
            </Link>
            <Link to="/dashboard/teacher/students" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Users size={18} className="text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">View My Students</p>
                <p className="text-xs text-gray-500">See all students you have tested</p>
              </div>
            </Link>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Platform Guide</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            {['Register the student (they create their own account)', 'Conduct a fitness test on the field', 'Enter measurements in Add Fitness Test', 'AI assessment is generated automatically', 'View flagged students for further evaluation'].map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
