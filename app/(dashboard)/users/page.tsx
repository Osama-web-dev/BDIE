'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Activity, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  risk_score: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-sans font-medium tracking-tight text-white">Digital Twins</h1>
          <p className="text-sm text-bdie-text-secondary mt-1">Monitor behavioral drift across all network entities.</p>
        </div>
        <div className="flex items-center gap-2 text-bdie-text-secondary bg-black/40 px-4 py-2 rounded-xl border border-white/5">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search entities..." 
            className="bg-transparent border-none outline-none text-sm w-48 focus:text-white transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-mono text-bdie-text-secondary uppercase tracking-widest bg-black/20">
          <div className="col-span-3">Entity Name</div>
          <div className="col-span-3">Department</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Risk Score</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {isLoading ? (
            <div className="w-full h-32 flex items-center justify-center text-bdie-text-secondary">Loading entities...</div>
          ) : users.length === 0 ? (
            <div className="w-full h-32 flex items-center justify-center text-bdie-text-secondary">No entities found.</div>
          ) : (
            users.map((user, i) => (
              <motion.div 
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 hover:bg-white/5 transition-colors rounded-lg"
              >
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Users size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{user.name}</span>
                    <span className="text-[10px] text-bdie-text-secondary font-mono">{user.email}</span>
                  </div>
                </div>
                <div className="col-span-3 text-sm text-bdie-text-secondary">{user.department}</div>
                <div className="col-span-2 text-sm text-bdie-text-secondary">{user.role}</div>
                <div className="col-span-2 flex items-center gap-2">
                  <span className={`font-mono text-sm ${user.risk_score > 75 ? 'text-bdie-danger' : user.risk_score > 50 ? 'text-bdie-warning' : 'text-bdie-accent'}`}>
                    {user.risk_score.toFixed(1)}
                  </span>
                  {user.risk_score > 75 && <ShieldAlert size={14} className="text-bdie-danger animate-pulse" />}
                </div>
                <div className="col-span-2 text-right">
                  <Link 
                    href={`/users/${user._id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white transition-colors"
                  >
                    <Activity size={12} />
                    Inspect
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
