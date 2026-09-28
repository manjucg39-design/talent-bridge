import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Application } from '../../types';
import { ClipboardList } from 'lucide-react';

const statusColors: Record<string, string> = {
  submitted: 'badge-blue',
  under_review: 'badge-orange',
  shortlisted: 'badge-green',
  selected: 'badge-green',
  rejected: 'badge-red',
};

export default function StudentApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/opportunities/applications/my').then(r => setApplications(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card h-48 animate-pulse bg-gray-100" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No applications yet.</p>
          <p className="text-sm text-gray-400 mt-1">Browse opportunities and apply to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <div key={app._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{app.opportunityId?.title || 'Opportunity'}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {app.opportunityId?.sport} · {app.opportunityId?.location}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Applied: {new Date(app.submittedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={statusColors[app.status] || 'badge-gray'}>{app.status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
