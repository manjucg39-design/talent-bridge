import { Link } from 'react-router-dom';
import { Trophy, Target, Users, Zap, CheckCircle, ArrowRight, Star, TrendingUp, Shield, Search, Building2, Sparkles, BadgeCheck } from 'lucide-react';

const stats = [
  { label: 'Talent profiles', value: '2,400+' },
  { label: 'Verified projects', value: '680+' },
  { label: 'Opportunities listed', value: '95+' },
  { label: 'Organizations connected', value: '60+' },
];

const talentDomains = ['Technology', 'Innovation', 'Research', 'Sports', 'Creative', 'Entrepreneurship', 'Leadership', 'Social impact'];

const steps = [
  { step: '01', title: 'Create one talent profile', desc: 'Bring together skills, projects, certificates, achievements, sports and goals in one verified identity.' },
  { step: '02', title: 'Let AI understand your work', desc: 'A transparent recommendation layer extracts strengths, opportunity categories and development areas.' },
  { step: '03', title: 'Discover the right path', desc: 'See explainable matches across internships, challenges, trials, scholarships, research and mentorship.' },
  { step: '04', title: 'Organizations search talent', desc: 'Companies, government accounts, clubs and incubators can find relevant verified talent and projects.' },
  { step: '05', title: 'Connect with consent', desc: 'Shortlist, request a connection and collaborate without exposing private contact details by default.' },
  { step: '06', title: 'People make decisions', desc: 'AI suggests potential matches; organizations and qualified reviewers make every official decision.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
              <span className="font-bold text-gray-900">Talent Bridge</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#how-it-works" className="hover:text-primary-600">How It Works</a>
            <a href="#ecosystem" className="hover:text-primary-600">For organizations</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-1.5 px-3">Sign In</Link>
            <Link to="/demo" className="text-sm font-semibold text-primary-700 hover:text-primary-900">Launch SIH Demo</Link>
            <Link to="/register" className="btn-primary text-sm py-1.5 px-3">Create profile</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-primary-950 to-primary-800 text-white py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
          <div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm mb-6">
            <Sparkles size={14} className="text-cyan-300" />
            <span>AI-powered talent-to-opportunity infrastructure</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
            Your talent deserves<br /><span className="text-cyan-300">the right opportunity.</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-xl">
            Showcase your skills, projects and achievements. Let governments, companies, clubs and innovation organizations discover what you can do.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/register" className="bg-cyan-300 text-slate-950 font-semibold px-6 py-3 rounded-lg hover:bg-cyan-200 transition-colors flex items-center justify-center gap-2">
              Create your talent profile <ArrowRight size={18} />
            </Link>
            <Link to="/demo" className="border border-white/25 font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors text-center">Launch SIH Demo</Link>
          </div>
          </div>
          <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-2xl rotate-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><p className="text-xs uppercase tracking-widest text-primary-600 font-bold">Talent intelligence</p><p className="text-xl font-bold mt-1">Rahul Kumar</p></div><BadgeCheck className="text-emerald-500" /></div>
            <p className="text-sm text-slate-500 mt-4">AI/ML student specializing in computer vision and IoT with 3 verified projects.</p>
            <div className="flex flex-wrap gap-2 mt-4">{['Python', 'IoT', 'Computer Vision', 'React'].map(skill => <span key={skill} className="badge-blue">{skill}</span>)}</div>
            <div className="mt-5 bg-cyan-50 border border-cyan-100 rounded-xl p-4"><div className="flex justify-between text-sm font-semibold gap-3"><span>Smart City Innovation Program</span><span className="text-emerald-600 whitespace-nowrap">95% match</span></div><p className="text-xs text-slate-500 mt-2">✓ IoT project relevance &nbsp; ✓ Verified work &nbsp; ✓ Interest aligned</p></div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-800 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-yellow-400">{s.value}</p>
              <p className="text-sm text-primary-200 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Talent is fragmented. Opportunity is fragmented.</h2>
              <p className="text-gray-600 mb-6">A student’s real capability is spread across resumes, certificates, projects, sports records and competitions. Organizations still search through disconnected channels.</p>
              <div className="space-y-3">
                {['Potential hidden across disconnected documents', 'Rural and emerging talent lacks visibility', 'Organizations search without context', 'Students miss opportunities they never hear about'].map(p => (
                  <div key={p} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-500 text-xs">✕</span>
                    </div>
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-primary-600" /> Our Platform Changes This</h3>
              <div className="space-y-3">
                {['One verified talent identity', 'AI-assisted profile insights', 'Transparent opportunity matching', 'Reverse talent discovery', 'Consent-based connections', 'Human-led evaluation pathway'].map(p => (
                  <div key={p} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600">From a first project upload to a meaningful collaboration.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map(s => (
              <div key={s.step} className="card hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-primary-100 mb-3">{s.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ecosystem" className="py-16 px-4 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div><p className="text-cyan-300 text-sm font-bold uppercase tracking-widest mb-3">One ecosystem, many futures</p><h2 className="text-3xl font-bold mb-4">A profile can open more than one door.</h2><p className="text-slate-300">Technology, sports, research, creative work and social impact belong in the same talent graph. Students choose what to share; organizations discover relevance.</p></div>
          <div className="grid grid-cols-2 gap-3">{talentDomains.map((domain, index) => <div key={domain} className={`p-4 rounded-xl border ${index % 2 ? 'border-cyan-300/30 bg-cyan-300/10' : 'border-white/10 bg-white/5'}`}><p className="text-sm font-semibold">{domain}</p><p className="text-xs text-slate-400 mt-1">Discoverable talent</p></div>)}</div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Built for Everyone in the Ecosystem</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Users size={24} />, title: 'Students & Athletes', desc: 'Create your digital athlete profile, track progress, and discover opportunities matched to your sport and location.', color: 'bg-blue-50 text-blue-600' },
              { icon: <Shield size={24} />, title: 'PE Teachers', desc: 'Conduct structured fitness tests, upload results, and track your students\' development over time.', color: 'bg-green-50 text-green-600' },
              { icon: <Search size={24} />, title: 'Scouts & Coaches', desc: 'Discover flagged talent from rural areas, review performance history, and shortlist athletes for evaluation.', color: 'bg-purple-50 text-purple-600' },
              { icon: <Building2 size={24} />, title: 'Sports Clubs', desc: 'Connect with eligible athletes in your area and manage training programmes.', color: 'bg-orange-50 text-orange-600' },
              { icon: <Target size={24} />, title: 'Government Bodies', desc: 'Publish verified trials, camps, and scholarships. Reach eligible athletes directly.', color: 'bg-red-50 text-red-600' },
              { icon: <Star size={24} />, title: 'Khelo India Centres', desc: 'List your centre, sports offered, and eligibility so athletes can find and apply for training.', color: 'bg-yellow-50 text-yellow-600' },
            ].map(r => (
              <div key={r.title} className="card hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-lg ${r.color} flex items-center justify-center mb-4`}>{r.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{r.title}</h3>
                <p className="text-sm text-gray-600">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Disclaimer */}
      <section className="py-10 px-4 bg-blue-50 border-y border-blue-100">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap size={20} className="text-primary-600" />
            <h3 className="font-semibold text-gray-900">About AI-Assisted Assessment</h3>
          </div>
          <p className="text-sm text-gray-600">
            The platform uses a preliminary AI scoring engine to help identify athletes who may benefit from further evaluation. <strong>AI does not make final selection decisions.</strong> All official selections are made by qualified coaches, scouts, and government sports authorities.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Make talent easier to find.</h2>
          <p className="text-primary-200 mb-8">Create a profile, explore a potential match, or launch the SIH demo for the full student-to-organization journey.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors">
              Create talent profile
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy size={16} className="text-primary-400" />
          <span className="text-white font-semibold">Talent Bridge</span>
        </div>
        <p>Discover Talent. Connect Opportunities. Build Futures.</p>
        <p className="mt-2 text-xs text-gray-600">Prototype platform. Government and organization accounts are demo experiences unless officially configured.</p>
      </footer>
    </div>
  );
}

