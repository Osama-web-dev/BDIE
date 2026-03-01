'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Activity, ShieldAlert, Filter, ChevronRight, MoreVertical } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  risk_score: number;
  status: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || u.role === filter || u.department === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="text-bdie-accent" />
            Digital Twin Repository
          </h1>
          <p className="text-sm text-bdie-text-secondary mt-1">Enterprise-wide behavioral monitoring for {users.length} monitored entities.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-bdie-text-secondary bg-black/40 px-4 py-2 rounded-xl border border-white/5 focus-within:border-bdie-accent/50 transition-all">
            <Search size={16} />
            <input
              type="text"
              placeholder="Filter by name/ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-48 focus:text-white"
            />
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-bdie-text-secondary hover:text-white transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-xl">
        <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/10 text-[10px] font-mono text-bdie-text-secondary uppercase tracking-[0.2em] bg-white/2">
          <div className="col-span-4">Entity Identity</div>
          <div className="col-span-3">Department / Unit</div>
          <div className="col-span-2">Access Level</div>
          <div className="col-span-2">Risk Vector</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-bdie-accent/20 border-t-bdie-accent rounded-full animate-spin" />
                <span className="text-xs font-mono text-bdie-text-secondary animate-pulse">QUERYING REPOSITORY...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-sm text-bdie-text-secondary italic">No matching entities found in current partition.</p>
              </div>
            ) : (
              filteredUsers.map((user, i) => (
                <motion.div
                  key={user._id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 hover:bg-bdie-accent/[0.03] transition-all group"
                >
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-bdie-text-secondary group-hover:text-bdie-accent group-hover:border-bdie-accent/30 transition-all">
                      <Users size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white group-hover:text-bdie-accent transition-colors truncate">{user.name}</span>
                      <span className="text-[10px] text-bdie-text-secondary font-mono truncate uppercase tracking-tighter">{user.email}</span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-bdie-text-secondary uppercase tracking-widest font-mono">
                      {user.department}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${user.role === 'admin' ? 'text-bdie-danger bg-bdie-danger/10 border-bdie-danger/20' :
                        user.role === 'analyst' ? 'text-bdie-accent bg-bdie-accent/10 border-bdie-accent/20' :
                          'text-blue-400 bg-blue-400/10 border-blue-400/20'
                      }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${user.risk_score}%` }}
                        className={`h-full ${user.risk_score > 75 ? 'bg-bdie-danger' : user.risk_score > 50 ? 'bg-bdie-warning' : 'bg-bdie-accent'}`}
                      />
                    </div>
                    <span className={`font-mono text-xs font-bold w-8 ${user.risk_score > 75 ? 'text-bdie-danger' : 'text-bdie-text-primary'}`}>
                      {Math.round(user.risk_score)}%
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <Link
                      href={`/users/${user._id}`}
                      className="inline-flex items-center justify-center w-8 h-8 bg-white/5 hover:bg-bdie-accent/20 border border-white/10 hover:border-bdie-accent/40 rounded-lg text-bdie-text-secondary hover:text-bdie-accent transition-all"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
