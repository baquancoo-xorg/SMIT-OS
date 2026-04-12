import { useState, useEffect } from 'react';
import { Objective, WorkItem } from '../types';
import { 
  Rocket, 
  TrendingUp, 
  CheckCircle2, 
  Trophy, 
  Megaphone,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PMDashboard() {
  const { currentUser, users } = useAuth();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [itemRes, objRes] = await Promise.all([
        fetch('/api/work-items'),
        fetch('/api/objectives')
      ]);
      const itemData = await itemRes.json();
      const objData = await objRes.json();
      setWorkItems(itemData);
      setObjectives(objData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate metrics
  const totalRevenue = workItems.reduce((sum, item) => sum + (item.dealValue || 0), 0);
  const activeTasks = workItems.filter(item => item.status !== 'Done' && item.status !== 'Completed').length;
  const completedTasks = workItems.filter(item => item.status === 'Done' || item.status === 'Completed').length;
  const efficiency = workItems.length > 0 ? Math.round((completedTasks / workItems.length) * 100) : 0;
  
  // Mock happiness score for now
  const happinessScore = workItems.length > 0 ? 9.2 : 0;

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-12 w-full">
      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <nav className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Overview</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Dashboard</span>
          </nav>
          <h2 className="text-5xl font-extrabold font-headline tracking-tight text-on-surface">Good morning, <span className="text-primary italic">{currentUser.fullName.split(' ')[0]}</span>.</h2>
          <p className="text-lg text-on-surface-variant font-medium max-w-xl">The workspace is pulsing with activity. Here’s your strategic overview for today.</p>
        </div>
        <div className="flex items-center -space-x-4">
          {users.slice(0, 4).map(user => (
            <img 
              key={user.id}
              className="w-14 h-14 rounded-2xl border-4 border-white shadow-xl object-cover hover:-translate-y-2 transition-transform duration-300" 
              src={user.avatar} 
              alt={user.fullName}
              referrerPolicy="no-referrer"
            />
          ))}
          <div className="w-14 h-14 rounded-2xl border-4 border-white bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 shadow-xl">+{Math.max(0, users.length - 4)}</div>
        </div>
      </section>

      {/* Bento Grid Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Total MRR */}
        <div className="md:col-span-2 bg-white p-10 rounded-[48px] flex flex-col justify-between relative overflow-hidden group border border-outline-variant/10 shadow-xl shadow-slate-200/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Revenue Stream</p>
            <h3 className="text-5xl font-black font-headline mb-6">${totalRevenue.toLocaleString()} <span className="text-sm font-bold text-tertiary flex items-center gap-1 inline-flex ml-2"><TrendingUp size={16} /> {workItems.length > 0 ? '12.5%' : '0%'}</span></h3>
            <div className="flex items-end gap-2 h-16">
              {[0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                <div 
                  key={i}
                  className={`w-full rounded-t-xl transition-all duration-700 ${i === 6 ? 'bg-primary' : 'bg-primary/10'}`} 
                  style={{ height: `${workItems.length > 0 ? [40, 70, 50, 90, 60, 80, 100][i] : 0}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="bg-white p-10 rounded-[48px] flex flex-col items-center justify-center text-center group border border-outline-variant/10 shadow-xl shadow-slate-200/20">
          <div className="w-20 h-20 rounded-[32px] bg-secondary/5 flex items-center justify-center text-secondary mb-6 group-hover:rotate-12 transition-transform duration-500 border border-secondary/10">
            <CheckCircle2 size={40} />
          </div>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Active Tasks</p>
          <h3 className="text-5xl font-black font-headline mt-2">{activeTasks}</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">{efficiency}% Efficiency</p>
        </div>

        {/* Team Happiness Score */}
        <div className="bg-white p-10 rounded-[48px] flex flex-col items-center justify-center text-center border border-outline-variant/10 shadow-xl shadow-slate-200/20 group">
          <div className="relative mb-6">
            <svg className="w-24 h-24 transform -rotate-90 group-hover:scale-110 transition-transform duration-500">
              <circle className="text-tertiary/5" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="10"></circle>
              <circle className="text-tertiary" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (happinessScore / 10))} strokeWidth="10" strokeLinecap="round"></circle>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-black text-tertiary font-headline">{happinessScore.toFixed(1)}</span>
          </div>
          <p className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em]">Happiness Score</p>
          <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Vibe: <span className="text-tertiary">{happinessScore > 0 ? 'Kinetic' : 'Neutral'}</span></p>
        </div>
      </section>

      {/* Mission Control & OKR Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Mission Control */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h4 className="text-3xl font-black font-headline flex items-center gap-4">
              <Rocket className="text-primary" />
              Mission Control
            </h4>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All Achievements</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AchievementCard 
              icon={<Trophy size={24} />}
              time="2H AGO"
              title="New Brand Identity"
              description="Successfully delivered the full identity suite for ‘Altamira Labs’. Client ecstatic."
              tags={[{ label: 'Project Finish', color: 'tertiary' }, { label: 'Design', color: 'primary' }]}
            />
            <AchievementCard 
              icon={<Megaphone size={24} />}
              time="5H AGO"
              title="Campaign Launch"
              description="The ‘Echo’ digital campaign is now live across 14 territories."
              tags={[{ label: 'Marketing', color: 'primary' }, { label: 'Global', color: 'secondary' }]}
            />
          </div>

          {/* Asymmetric Content Card */}
          <div className="relative rounded-[48px] overflow-hidden min-h-[350px] flex items-center group">
            <div className="absolute inset-0 z-0">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                src="https://picsum.photos/seed/office/1200/600" 
                alt="Innovation Sprint"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"></div>
            </div>
            <div className="relative z-10 p-16 text-white max-w-xl">
              <h4 className="text-4xl font-black font-headline mb-6 leading-tight">Innovation Sprint: AI Integration Phase 2</h4>
              <p className="text-white/80 mb-8 font-medium text-lg">We're moving ahead of schedule. The new AI-driven asset tagging system is now 70% integrated into the inventory.</p>
              <button className="bg-white text-primary px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:scale-95 transition-transform shadow-xl">Participate Now</button>
            </div>
          </div>
        </div>

        {/* OKR Alignment Tree */}
        <div className="bg-white p-10 rounded-[48px] space-y-8 border border-outline-variant/10 shadow-xl shadow-slate-200/20">
          <h4 className="text-3xl font-black font-headline">OKR Tree</h4>
          <div className="space-y-6">
            {objectives.slice(0, 2).map(obj => (
              <div key={obj.id} className="space-y-6">
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-outline-variant/10 relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-3xl"></div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Objective</p>
                  <h6 className="font-black text-on-surface leading-tight">{obj.title}</h6>
                  <div className="mt-4 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${obj.progressPercentage}%` }}></div>
                  </div>
                </div>
                <div className="ml-8 border-l-2 border-slate-100 pl-8 space-y-6 relative">
                  {obj.keyResults.slice(0, 2).map(kr => (
                    <div key={kr.id} className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm relative group hover:border-primary/20 transition-colors">
                      <div className="absolute -left-[34px] top-1/2 w-8 h-0.5 bg-slate-100"></div>
                      <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Key Result</p>
                      <h6 className="font-bold text-on-surface text-sm leading-tight">{kr.title}</h6>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                        <span className="text-xs font-black text-primary font-headline">{kr.progressPercentage}%</span>
                      </div>
                      <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full transition-all duration-1000" style={{ width: `${kr.progressPercentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AchievementCard({ icon, time, title, description, tags }: any) {
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/20 hover:scale-[1.02] transition-all duration-500 group border border-outline-variant/10">
      <div className="flex items-start justify-between mb-6">
        <div className="bg-slate-50 p-4 rounded-2xl text-on-surface border border-outline-variant/10 group-hover:rotate-6 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
      </div>
      <h5 className="font-black text-xl mb-2 font-headline">{title}</h5>
      <p className="text-sm text-on-surface-variant line-clamp-2 font-medium leading-relaxed">{description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag: any, i: number) => (
          <span 
            key={i} 
            className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${
              tag.color === 'tertiary' ? 'bg-tertiary/5 text-tertiary border-tertiary/10' :
              tag.color === 'primary' ? 'bg-primary/5 text-primary border-primary/10' :
              'bg-secondary/5 text-secondary border-secondary/10'
            }`}
          >
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  );
}
