import { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronRight, User as UserIcon, Calendar, Tag, Settings, Menu } from 'lucide-react';
import { WorkItem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onViewChange, onMenuClick, isAdmin }: {
  onViewChange?: (view: string) => void;
  onMenuClick?: () => void;
  isAdmin: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<WorkItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const { users } = useAuth();
  const [allWorkItems, setAllWorkItems] = useState<WorkItem[]>([]);


  useEffect(() => {
    const fetchAllWorkItems = async () => {
      try {
        const res = await fetch('/api/work-items');
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
    <header className="fixed top-0 left-0 right-0 h-20 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/5">
      <div className="w-full h-full px-4 md:px-8 xl:pl-80 xl:pr-10 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="xl:hidden w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-xl relative" ref={searchRef}>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              <input
                className="w-full bg-slate-50/50 border border-outline-variant/10 rounded-2xl py-2.5 pl-14 pr-6 text-sm text-on-surface focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all placeholder:text-slate-400 font-medium"
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
                  className="absolute top-full left-0 right-0 mt-2 sm:mt-4 bg-white rounded-2xl sm:rounded-[32px] border border-outline-variant/10 shadow-2xl shadow-slate-200/40 overflow-hidden max-h-[70vh] sm:max-h-[500px] flex flex-col"
                >
                  <div className="p-4 sm:p-6 border-b border-outline-variant/5 bg-slate-50/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Search Results ({searchResults.length})</p>
                  </div>
                  <div className="overflow-y-auto p-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((item) => {
                        const assignee = users.find(u => u.id === item.assigneeId);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-slate-50 rounded-xl sm:rounded-2xl transition-all cursor-pointer group min-h-[56px]"
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <span className="material-symbols-outlined text-[20px]">
                                {item.type === 'Deal' ? 'payments' : 'task_alt'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-on-surface truncate group-hover:text-primary transition-colors">{item.title}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <Tag size={10} />
                                  {item.type}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <UserIcon size={10} />
                                  {assignee?.fullName}
                                </span>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">chevron_right</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-10 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">search_off</span>
                        <p className="text-sm font-medium text-slate-400 italic">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="p-4 bg-slate-50/50 border-t border-outline-variant/5 text-center">
                      <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View all results</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4 ml-8">
          {isAdmin && (
            <button
              onClick={() => onViewChange?.('settings')}
              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-outline-variant/10"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
