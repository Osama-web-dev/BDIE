'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { UserCircle, Activity, ShieldAlert, Database, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  risk_score: number;
}

export default function UserDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setIsLoading(false);
      })
      .catch(console.error);
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-bdie-text-secondary">Loading entity data...</div>;
  }

  if (!user) {
    return <div className="p-8 text-bdie-danger">Entity not found.</div>;
  }

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/users" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-bdie-text-secondary hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-sans font-medium tracking-tight text-white">Entity Inspection</h1>
          <p className="text-sm text-bdie-text-secondary mt-1">Detailed behavioral analysis for {user.name}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl border border-white/5 p-6 flex flex-col gap-6"
        >
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white">
              <UserCircle size={32} />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">{user.name}</h2>
              <p className="text-xs font-mono text-bdie-text-secondary">{user.email}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-bdie-text-secondary">Department</span>
              <p className="text-sm text-white mt-1">{user.department}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-bdie-text-secondary">Role</span>
              <p className="text-sm text-white mt-1">{user.role}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-bdie-text-secondary">Current Risk Score</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`font-mono text-xl font-bold ${user.risk_score > 75 ? 'text-bdie-danger' : user.risk_score > 50 ? 'text-bdie-warning' : 'text-bdie-accent'}`}>
                  {user.risk_score.toFixed(1)}
                </span>
                {user.risk_score > 75 && <ShieldAlert size={18} className="text-bdie-danger animate-pulse" />}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-bdie-text-secondary"
        >
          <Activity size={32} className="mb-4 text-white/20" />
          <h3 className="text-lg text-white mb-2">Behavioral Timeline</h3>
          <p className="text-sm text-center max-w-md">Detailed activity logs and anomaly detection timeline will be rendered here.</p>
        </motion.div>
      </div>
    </div>
  );
}
