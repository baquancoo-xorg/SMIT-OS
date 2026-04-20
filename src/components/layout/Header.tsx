import { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronRight, User as UserIcon, Calendar, Tag, Menu, X } from 'lucide-react';
import { WorkItem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import DateCalendarWidget from './DateCalendarWidget';
import SprintContextWidget from './SprintContextWidget';
import NotificationCenter from './NotificationCenter';
import { ViewType } from '../../App';

export default function Header({ onMenuClick, onViewChange }: {
  onMenuClick?: () => void;
  onViewChange?: (view: ViewType) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<WorkItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const { users } = useAuth();
  const [allWorkItems, setAllWorkItems] = useState<WorkItem[]>([]);


  useEffect(() => {
    const fetchAllWorkItems = async () => {
      try {
        const res = await fetch('/api/work-items');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllWorkItems(data);
        }
      } catch (error) {
        console.error('Failed to fetch work items for search:', error);
      }
    };
    fetchAllWorkItems();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = allWorkItems.filter(item => {
      const assignee = users.find(u => u.id === item.assigneeId);
      const searchStr = `${item.title} ${item.description || ''} ${assignee?.fullName || ''}`.toLowerCase();
      return searchStr.includes(query.toLowerCase());
    });
    setSearchResults(filtered.slice(0, 8)); // Limit to 8 results
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/5">
      <div className="w-full h-full px-[var(--content-px-mobile)] md:px-[var(--content-px-tablet)] xl:pl-72 xl:pr-[var(--content-px-desktop)] flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="xl:hidden w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>

          {/* Mobile: Search icon button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="tablet:hidden w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
            aria-label="Open search"
          >
            <Search size={20} />
          </button>

          {/* Tablet+: Search input */}
          <div className="hidden tablet:flex flex-1 max-w-[200px] lg:max-w-xs xl:max-w-md relative ml-4 xl:ml-[var(--content-px-desktop)]" ref={searchRef}>
            <div className="relative group w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
              <input
                className="w-full bg-white shadow-sm rounded-2xl py-2.5 pl-12 pr-4 text-sm text-on-surface focus:ring-4 focus:ring-primary/10 focus:shadow-md transition-all placeholder:text-slate-400 font-medium"
                placeholder="Search..."
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden max-h-[400px] flex flex-col min-w-[300px]"
                >
                  <div className="p-4 border-b border-outline-variant/5 bg-slate-50/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Search Results ({searchResults.length})</p>
                  </div>
                  <div className="overflow-y-auto p-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((item) => {
                        const assignee = users.find(u => u.id === item.assigneeId);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group min-h-[56px]"
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <span className="material-symbols-outlined text-[20px]">
                                {item.type === 'Deal' ? 'payments' : 'task_alt'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">{item.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                  <Tag size={10} />
                                  {item.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">search_off</span>
                        <p className="text-sm font-medium text-slate-400">No results</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile: Full screen search overlay */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-white tablet:hidden"
              >
                <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                  <button
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                    className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl"
                  >
                    <X size={24} />
                  </button>
                  <input
                    autoFocus
                    className="flex-1 bg-slate-100 rounded-xl py-3 px-4 text-base text-on-surface placeholder:text-slate-400"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 72px)' }}>
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => {
                      const assignee = users.find(u => u.id === item.assigneeId);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">
                              {item.type === 'Deal' ? 'payments' : 'task_alt'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-on-surface truncate">{item.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-bold text-slate-400 uppercase">{item.type}</span>
                              {assignee && <span className="text-xs text-slate-400">{assignee.fullName}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : searchQuery.trim() ? (
                    <div className="p-10 text-center">
                      <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">search_off</span>
                      <p className="text-base font-medium text-slate-400">No results for "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">search</span>
                      <p className="text-base font-medium text-slate-400">Search for tasks, deals...</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Widgets - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <NotificationCenter />
          <DateCalendarWidget workItems={allWorkItems} />
          <SprintContextWidget onViewSprint={() => onViewChange?.('sprint')} />
        </div>
      </div>
    </header>
  );
}
