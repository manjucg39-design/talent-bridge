import { useEffect, useState } from 'react';
import api from '../../services/api';
import { ScoutShortlist } from '../../types';
import { Star, ArrowRight, Pencil, Trash2, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ScoutShortlistPage() {
  const [list, setList] = useState<ScoutShortlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('shortlisted');

  useEffect(() => {
    api.get('/scouts/shortlist').then(r => setList(r.data.data || [])).catch(() => setError('Unable to load shortlist.')).finally(() => setLoading(false));
  }, []);

  const beginEdit = (item: ScoutShortlist) => { setEditingId(item._id); setEditNotes(item.notes || ''); setEditStatus(item.status); setError(''); };
  const saveEdit = async (id: string) => {
    try {
      const response = await api.put(`/scouts/shortlist/${id}`, { notes: editNotes, status: editStatus });
      setList(items => items.map(item => item._id === id ? { ...item, ...response.data.data } : item));
      setEditingId(null);
    } catch { setError('Unable to update shortlist entry.'); }
  };
  const remove = async (id: string) => {
    if (!window.confirm('Remove this athlete from your shortlist?')) return;
    try { await api.delete(`/scouts/shortlist/${id}`); setList(items => items.filter(item => item._id !== id)); } catch { setError('Unable to remove shortlist entry.'); }
  };

  if (loading) return <div className="card h-48 animate-pulse bg-gray-100" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Star size={24} className="text-yellow-500" /> My Shortlist</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
      {list.length === 0 ? (
        <div className="card text-center py-12">
          <Star size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No athletes shortlisted yet.</p>
          <Link to="/dashboard/scout/athletes" className="btn-primary text-sm mt-4 inline-block">Discover Athletes</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(item => {
            const profile = item.studentId as unknown as { userId: { name: string; district: string; state: string; _id: string }; sportInterests: string[]; overallScore: number; potentialFlag: boolean; _id: string };
            return (
              <div key={item._id} className="card flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
                    {profile?.userId?.name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{profile?.userId?.name}</p>
                    <p className="text-xs text-gray-500">{profile?.userId?.district}, {profile?.userId?.state}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile?.sportInterests?.map(s => <span key={s} className="badge-blue text-xs">{s}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary-600">{profile?.overallScore}</p>
                    <p className="text-xs text-gray-400">Score</p>
                  </div>
                  <span className={`badge-${item.status === 'shortlisted' ? 'green' : 'blue'}`}>{item.status.replace('_', ' ')}</span>
                  {editingId === item._id ? <div className="flex items-center gap-2"><select className="input text-xs py-1" value={editStatus} onChange={event => setEditStatus(event.target.value)}><option value="shortlisted">Shortlisted</option><option value="evaluation_requested">Evaluation Requested</option><option value="referred">Training Referred</option></select><input className="input text-xs py-1 w-48" value={editNotes} onChange={event => setEditNotes(event.target.value)} placeholder="Scout notes" /><button type="button" title="Save changes" onClick={() => saveEdit(item._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Save size={15} /></button><button type="button" title="Cancel edit" onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded"><X size={15} /></button></div> : <div className="flex items-center gap-1"><button type="button" title="Edit shortlist" onClick={() => beginEdit(item)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"><Pencil size={15} /></button><button type="button" title="Remove from shortlist" onClick={() => remove(item._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={15} /></button></div>}
                  <Link to={`/dashboard/scout/athletes/${profile?.userId?._id}`} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                    View <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
