'use client';

import { useEffect, useRef, useState } from 'react';

export function LoadingScreen() {
    const [visible, setVisible] = useState(true);
    const [phase, setPhase] = useState<'logo' | 'bars'>('logo');
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const run = async () => {
            try {
                const { animate, stagger } = await import('animejs');

                // Phase 1: Logo appears
                animate(textRef.current!, {
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 600,
                    ease: 'outExpo',
                });

                // Phase 2: Bars animate
                setTimeout(() => {
                    setPhase('bars');
                }, 500);

                // Phase 3: Progress bar fills
                setTimeout(() => {
                    if (progressRef.current) {
                        animate(progressRef.current, {
                            width: ['0%', '100%'],
                            duration: 900,
                            ease: 'inOutQuart',
                        });
                    }
                }, 800);

                // Phase 4: Fade out the whole screen
                setTimeout(() => {
                    if (containerRef.current) {
                        animate(containerRef.current, {
                            opacity: [1, 0],
                            translateY: [0, -10],
                            duration: 500,
                            ease: 'inExpo',
                            onComplete: () => setVisible(false),
                        });
                    }
                }, 1900);

            } catch {
                // CSS fallback animation
                if (textRef.current) textRef.current.style.opacity = '1';
                setTimeout(() => setPhase('bars'), 500);
                setTimeout(() => setVisible(false), 2200);
            }
        };

        run();
    }, []);

    if (!visible) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 flex flex-col items-center justify-center"
            style={{
                zIndex: 100000,
                background: 'radial-gradient(circle at center, #050f07 0%, #050505 60%)',
            }}
        >
            {/* Grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-5"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(0,255,157,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,157,0.3) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="flex flex-col items-center gap-6">
                {/* Logo text */}
                <div ref={textRef} style={{ opacity: 0 }} className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-bdie-accent animate-pulse" />
                        <span className="font-mono text-[10px] tracking-[0.4em] text-bdie-accent/60 uppercase">Initializing System</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-bdie-accent animate-pulse" />
                    </div>
                    <h1
                        className="font-mono font-bold text-6xl tracking-widest text-white"
                        style={{ textShadow: '0 0 40px rgba(0,255,157,0.4), 0 0 80px rgba(0,255,157,0.1)' }}
                    >
                        BDIE
                    </h1>
                    <p className="font-mono text-xs tracking-[0.3em] text-bdie-text-secondary mt-2 uppercase">
                        Behavioral Drift Intelligence Engine
                    </p>
                </div>

                {/* Equalizer bars */}
                {phase === 'bars' && (
                    <div className="flex items-end gap-1 h-8 mt-1">
                        {Array.from({ length: 18 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-1 rounded-t-sm"
                                style={{
                                    height: `${30 + Math.sin(i * 0.8) * 40 + 30}%`,
                                    background: `rgba(0,255,157,${0.3 + (i % 4) * 0.15})`,
                                    animation: `barPulse ${0.4 + (i % 3) * 0.15}s ${(i % 5) * 0.06}s ease-in-out infinite alternate`,
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Progress bar */}
                <div className="w-64 h-px bg-white/10 rounded-full overflow-hidden">
                    <div
                        ref={progressRef}
                        className="h-full rounded-full"
                        style={{
                            width: '0%',
                            background: 'linear-gradient(90deg, rgba(0,255,157,0.4), #00ff9d)',
                            boxShadow: '0 0 10px rgba(0,255,157,0.6)',
                        }}
                    />
                </div>

                <span className="font-mono text-[10px] text-bdie-text-secondary tracking-widest">
                    LOADING INTELLIGENCE CORE...
                </span>
            </div>

            <style>{`
        @keyframes barPulse {
          from { transform: scaleY(0.35); opacity: 0.5; }
          to { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
