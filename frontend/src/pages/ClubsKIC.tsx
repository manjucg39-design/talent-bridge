import { useEffect, useState } from 'react';
import api from '../services/api';
import { Club, KIC } from '../types';
import { Building2, MapPin, Phone, CheckCircle } from 'lucide-react';

export default function ClubsKIC() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [kics, setKics] = useState<KIC[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'clubs' | 'kic'>('clubs');
  const [sport, setSport] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/clubs${sport ? `?sport=${sport}` : ''}`),
      api.get(`/kic${sport ? `?sport=${sport}` : ''}`),
    ]).then(([c, k]) => {
      setClubs(c.data.data || []);
      setKics(k.data.data || []);
    }).finally(() => setLoading(false));
  }, [sport]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Clubs & Khelo India Centres</h1>
        <div className="flex items-center gap-3">
          <select className="input w-40" value={sport} onChange={e => setSport(e.target.value)}>
            <option value="">All Sports</option>
            {['Athletics', 'Football', 'Hockey', 'Kabaddi', 'Volleyball', 'Basketball', 'Badminton', 'Wrestling', 'Swimming'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('clubs')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'clubs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Sports Clubs ({clubs.length})
        </button>
        <button onClick={() => setTab('kic')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'kic' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Khelo India Centres ({kics.length})
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="card h-40 animate-pulse bg-gray-100" />)}</div>
      ) : tab === 'clubs' ? (
        clubs.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">No clubs found.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map(c => (
              <div key={c._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-orange-600" />
                  </div>
                  {c.verificationStatus === 'verified' && <span className="badge-green flex items-center gap-1 text-xs"><CheckCircle size={10} /> Verified</span>}
                  {c.isDemo && <span className="badge-gray text-xs">DEMO</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{c.name}</h3>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin size={10} /> {c.district}, {c.state}</p>
                <div className="flex flex-wrap gap-1 mb-2">{c.sports.map(s => <span key={s} className="badge-blue text-xs">{s}</span>)}</div>
                <div className="flex flex-wrap gap-1 mb-2">{c.ageGroups.map(a => <span key={a} className="badge-gray text-xs">{a}</span>)}</div>
                {c.coaches.length > 0 && <p className="text-xs text-gray-500">Coaches: {c.coaches.join(', ')}</p>}
                {c.contactPhone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone size={10} /> {c.contactPhone}</p>}
              </div>
            ))}
          </div>
        )
      ) : (
        kics.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">No Khelo India Centres found.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kics.map(k => (
              <div key={k._id} className="card hover:shadow-md transition-shadow border-l-4 border-primary-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-primary-600" />
                  </div>
                  <div className="flex gap-1">
                    {k.verificationStatus === 'verified' && <span className="badge-green flex items-center gap-1 text-xs"><CheckCircle size={10} /> Verified</span>}
                    {k.isDemo && <span className="badge-gray text-xs">DEMO</span>}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{k.name}</h3>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin size={10} /> {k.district}, {k.state}</p>
                <div className="flex flex-wrap gap-1 mb-2">{k.sports.map(s => <span key={s} className="badge-blue text-xs">{s}</span>)}</div>
                {k.eligibility && <p className="text-xs text-gray-600 bg-blue-50 rounded p-2 mb-2">{k.eligibility}</p>}
                {k.trainingInfo && <p className="text-xs text-gray-500">{k.trainingInfo}</p>}
                {k.contactPhone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone size={10} /> {k.contactPhone}</p>}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
