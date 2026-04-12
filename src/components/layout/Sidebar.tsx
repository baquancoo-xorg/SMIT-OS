import { LayoutDashboard, Target, KanbanSquare, Trello, Filter, CalendarSync, Settings } from 'lucide-react';
import { ViewType } from '../../App';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="h-full flex flex-col p-6 bg-white/70 backdrop-blur-xl rounded-r-3xl w-72 shadow-2xl z-50">
      <div className="flex flex-col items-start mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl soft-gradient flex items-center justify-center text-white font-black text-xl">S</div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary font-headline leading-none">SMIT OS</h1>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">The Kinetic Workspace</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Strategic</p>
          <NavItem 
            icon="grid_view" 
            label="Overview" 
            active={currentView === 'dashboard'} 
            onClick={() => onViewChange('dashboard')} 
          />
          <NavItem 
            icon="track_changes" 
            label="OKRs" 
            active={currentView === 'okrs'} 
            onClick={() => onViewChange('okrs')} 
          />
        </div>

        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Operations</p>
          <NavItem 
            icon="terminal" 
            label="Tech&Product" 
            active={currentView === 'tech'} 
            onClick={() => onViewChange('tech')} 
          />
          <NavItem 
            icon="layers" 
            label="Marketing" 
            active={currentView === 'mkt'} 
            onClick={() => onViewChange('mkt')} 
          />
          <NavItem 
            icon="video_library" 
            label="Media" 
            active={currentView === 'media'} 
            onClick={() => onViewChange('media')} 
          />
          <NavItem 
            icon="payments" 
            label="Sales" 
            active={currentView === 'sale'} 
            onClick={() => onViewChange('sale')} 
          />
        </div>

        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">System</p>
          <NavItem 
            icon="event_repeat" 
            label="Reports" 
            active={currentView === 'sync'} 
            onClick={() => onViewChange('sync')} 
          />
        </div>
      </nav>

      <div className="mt-auto space-y-1 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-4 px-4 py-2 text-slate-500 hover:text-primary transition-transform duration-200 ease-in-out hover:scale-95 cursor-pointer">
          <span className="material-symbols-outlined">help</span>
          <span className="font-medium text-sm">Help</span>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ease-in-out hover:scale-95 group ${
        active 
          ? 'text-primary font-bold bg-primary/5' 
          : 'text-slate-500 hover:text-primary'
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}
