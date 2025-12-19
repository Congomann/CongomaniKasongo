
import React from 'react';
import { useData } from '../../context/DataContext';
import { Search, Hash } from 'lucide-react';

interface ChatSidebarProps {
  activeId: string | null;
  onSelect: (id: string, type: 'user' | 'lead' | 'group') => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ activeId, onSelect }) => {
  const { colleagues } = useData();
  const [search, setSearch] = React.useState('');

  // Mock Groups for demo
  const groups = [
    { id: 'g-1', name: 'Sales Team', type: 'group' },
    { id: 'g-2', name: 'Underwriting', type: 'group' },
  ];

  const filteredColleagues = colleagues.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-80 flex flex-col border-r border-white/20 bg-white/30 backdrop-blur-xl h-full">
      {/* Header & Search */}
      <div className="p-5 pb-2">
        <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Messages</h2>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100/50 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-200 rounded-xl py-2 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-inner"
          />
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-6 scrollbar-hide mt-2">
        
        {/* Groups */}
        <div>
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Groups</h3>
          <div className="space-y-0.5">
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => onSelect(g.id, 'group')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${activeId === g.id ? 'bg-blue-500 text-white shadow-md' : 'text-slate-700 hover:bg-white/40'}`}
              >
                <div className={`p-1.5 rounded-md ${activeId === g.id ? 'bg-white/20' : 'bg-slate-200'}`}>
                  <Hash className="h-4 w-4" />
                </div>
                <span className="font-medium">{g.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Direct Messages */}
        <div>
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Direct Messages</h3>
          <div className="space-y-0.5">
            {filteredColleagues.map(c => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id, 'user')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeId === c.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-700 hover:bg-white/50'}`}
              >
                <div className="relative">
                  <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-200 border border-white/10" />
                  {c.status === 'online' && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold truncate">{c.name}</span>
                    {/* Mock Unread */}
                    {Math.random() > 0.7 && activeId !== c.id && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                  </div>
                  <p className={`text-xs truncate ${activeId === c.id ? 'text-blue-100' : 'text-slate-500'}`}>{c.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
