import React, { useState } from 'react';
import { Plus, Calendar, Target, Users, MoreHorizontal } from 'lucide-react';

export default function SprintManagement() {
  const [sprints] = useState([
    { id: 's42', name: 'Sprint 42: Kinetic Echo', status: 'Active', startDate: '2026-04-01', endDate: '2026-04-14', completion: 68, points: 42 },
    { id: 's43', name: 'Sprint 43: Lunar Phase', status: 'Planned', startDate: '2026-04-15', endDate: '2026-04-28', completion: 0, points: 38 },
    { id: 's41', name: 'Sprint 41: Solar Flare', status: 'Completed', startDate: '2026-03-15', endDate: '2026-03-28', completion: 100, points: 45 },
  ]);

  return (
    <div className="h-full flex flex-col p-10 space-y-8 max-w-[1600px] mx-auto w-full">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Sprint Management</h2>
          <p className="text-slate-500 mt-2">Plan and track your team's iterations.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-95 transition-all">
          <Plus size={20} />
          New Sprint
        </button>
      </div>

      <div className="grid gap-6">
        {sprints.map(sprint => (
          <div key={sprint.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                sprint.status === 'Active' ? 'bg-primary/10 text-primary' :
                sprint.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                'bg-slate-100 text-slate-400'
              }`}>
                <Target size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-black text-slate-800">{sprint.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    sprint.status === 'Active' ? 'bg-primary text-white' :
                    sprint.status === 'Completed' ? 'bg-emerald-500 text-white' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                    {sprint.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {sprint.startDate} - {sprint.endDate}</span>
                  <span className="flex items-center gap-1"><Target size={14} /> {sprint.points} Points</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="w-48">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500 uppercase tracking-widest">Progress</span>
                  <span className="text-primary">{sprint.completion}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${sprint.status === 'Completed' ? 'bg-emerald-500' : 'bg-primary'}`} 
                    style={{ width: `${sprint.completion}%` }}
                  ></div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
