import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CheckCircle2, Search, Sparkles, Trophy, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const flow = [
  ['01', 'Student profile', 'Rahul brings skills, projects, sports and achievements into one profile.'],
  ['02', 'Project upload', 'Smart Green Corridor for Emergency Ambulances is added to his portfolio.'],
  ['03', 'AI analysis', 'IoT, GPS, LoRa and emergency traffic management are extracted as strengths.'],
  ['04', 'Potential matches', 'Smart City Innovation Program appears at 95% with transparent reasons.'],
  ['05', 'Reverse discovery', 'A government organization searches “emergency traffic / IoT / GPS”.'],
  ['06', 'Talent found', 'Rahul appears because his verified project matches the search intent.'],
  ['07', 'Connect with consent', 'The organization requests collaboration; Rahul controls what happens next.'],
];

export default function DemoPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const enterDemo = async (email: string, destination: string) => {
    setError('');
    try {
      await login(email, 'Demo@123456');
      navigate(destination);
    } catch {
      setError('Demo login needs the backend and seeded demo accounts running.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 px-4">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold"><span className="w-8 h-8 rounded-lg bg-cyan-300 text-slate-950 flex items-center justify-center"><Trophy size={16} /></span>Talent Bridge</Link>
          <Link to="/login" className="text-sm text-slate-300 hover:text-white">Sign in directly</Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-3xl mb-12">
          <p className="text-cyan-300 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles size={16} /> SIH guided demonstration</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">From hidden capability to a real connection.</h1>
          <p className="text-lg text-slate-300 mt-5 max-w-2xl">Follow one project through Talent Bridge: a student profile becomes an explainable opportunity match, then becomes discoverable to the organization that needs it.</p>
        </div>
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <section className="space-y-3">
            {flow.map(([number, title, description], index) => (
              <div key={number} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/[.04]">
                <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${index === 3 ? 'bg-cyan-300 text-slate-950' : 'bg-white/10 text-cyan-200'}`}>{number}</span>
                <div><h2 className="font-semibold">{title}</h2><p className="text-sm text-slate-400 mt-1">{description}</p></div>
              </div>
            ))}
          </section>
          <aside className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xl lg:sticky lg:top-8">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-primary-600">Featured talent</p><h2 className="text-2xl font-bold mt-2">Rahul Kumar</h2></div><BadgeCheck className="text-emerald-500" /></div>
            <p className="text-sm text-slate-500 mt-3">Smart Green Corridor for Emergency Ambulances</p>
            <div className="flex flex-wrap gap-2 mt-4">{['IoT', 'GPS', 'LoRa', 'React', 'Node.js'].map(skill => <span className="badge-blue" key={skill}>{skill}</span>)}</div>
            <div className="mt-5 border border-emerald-100 bg-emerald-50 rounded-xl p-4"><div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 size={16} /> 3 verified projects</div><p className="text-xs text-emerald-700 mt-2">AI-generated profile insights, not an official selection score.</p></div>
            {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
            <div className="mt-6 space-y-3">
              <button disabled={loading} onClick={() => enterDemo('student@demo.com', '/dashboard/student')} className="btn-primary w-full flex items-center justify-center gap-2"><Users size={16} /> Enter as Rahul <ArrowRight size={16} /></button>
              <button disabled={loading} onClick={() => enterDemo('gov@demo.com', '/dashboard/gov')} className="btn-secondary w-full flex items-center justify-center gap-2"><Search size={16} /> Enter organization view</button>
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">Uses the seeded demo account. No official government integration is claimed.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}
