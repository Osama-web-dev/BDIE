'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, User, Activity, Globe, Ghost, ShieldCheck, Filter } from 'lucide-react';

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAudit() {
            const res = await fetch('/api/audit');
            const data = await res.json();
            setLogs(data.logs || []);
            setLoading(false);
        }
        loadAudit();
    }, []);

    return (
        <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Ghost className="text-bdie-accent" />
                        System Audit Trail
                    </h1>
                    <p className="text-sm text-bdie-text-secondary">Immutable historical record of all operator actions and system mutations.</p>
                </div>
                <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-bdie-text-secondary focus-within:border-bdie-accent/30 transition-all">
                    <Search size={16} />
                    <input type="text" placeholder="Protocol filter..." className="bg-transparent border-none outline-none text-xs w-48 focus:text-white" />
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-xl">
                <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/10 text-[10px] font-mono text-bdie-text-secondary uppercase tracking-[0.2em] bg-white/2">
                    <div className="col-span-3">Operator Context</div>
                    <div className="col-span-3">Action Protocol</div>
                    <div className="col-span-4">Payload Summary</div>
                    <div className="col-span-2 text-right">Provenance</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-20 text-center text-xs font-mono text-bdie-text-secondary animate-pulse uppercase tracking-widest">QUERYING AUDIT ARCHIVE...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-20 text-center text-sm text-bdie-text-secondary italic">No mutation logs found in this partition.</div>
                    ) : (
                        logs.map((log, i) => (
                            <div
                                key={log._id}
                                className="grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 hover:bg-white/5 transition-all group font-mono text-[11px]"
                            >
                                <div className="col-span-3 flex flex-col gap-0.5 min-w-0">
                                    <span className="text-white font-bold truncate">{log.actor_name}</span>
                                    <span className="text-[10px] text-bdie-text-secondary uppercase tracking-tighter">{log.actor_role}</span>
                                </div>
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-bdie-accent/5 border border-bdie-accent/20 flex items-center justify-center text-bdie-accent">
                                        <Activity size={14} />
                                    </div>
                                    <span className="text-white font-bold uppercase tracking-tight">{log.action}</span>
                                </div>
                                <div className="col-span-4 min-w-0">
                                    <p className="text-bdie-text-secondary truncate italic">
                                        {JSON.stringify(log.payload).substring(0, 100)}
                                    </p>
                                </div>
                                <div className="col-span-2 text-right flex flex-col items-end gap-1">
                                    <span className="text-bdie-text-secondary">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                    <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <Globe size={10} />
                                        <span className="text-[9px]">{log.ip_address}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
