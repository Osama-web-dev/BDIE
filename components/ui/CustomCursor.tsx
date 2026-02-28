'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
    const ringRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const ring = ringRef.current;
        const dot = dotRef.current;
        const canvas = canvasRef.current;
        if (!ring || !dot || !canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        // ── Spring physics constants ───────────────────────────────────
        // Equation: a = stiffness*(target-pos) - damping*vel
        // Damping ratio ζ = damping / (2 * sqrt(stiffness))
        // ζ < 1 → underdamped (subtle overshoot, feels alive)
        // ζ ≈ 0.7 is the "golden ratio" of feel: snappy & smooth
        const STIFFNESS = 280;   // spring strength (speed to target)
        const DAMPING = 28;    // resistance (ζ = 28/(2*√280) ≈ 0.84 — near-critically damped)

        // ── State ──────────────────────────────────────────────────────
        let mouseX = -300, mouseY = -300;
        let ringX = -300, ringY = -300;
        let velX = 0, velY = 0;     // ring velocity
        let lastTime = performance.now();
        let rafId = 0;

        // Trail: store last N positions of the ring (not mouse) for smoothness
        const TRAIL_LEN = 16;
        const trailX = new Float32Array(TRAIL_LEN).fill(-300);
        const trailY = new Float32Array(TRAIL_LEN).fill(-300);
        let trailHead = 0;

        // ── Canvas resize ──────────────────────────────────────────────
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize, { passive: true });

        // ── Dot: instant zero-lag update directly in mousemove ─────────
        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Dot follows native cursor exactly — write directly, skip RAF
            dot.style.transform = `translate3d(${mouseX - 3}px,${mouseY - 3}px,0)`;
        };
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        // ── RAF: spring physics + smooth bezier trail ──────────────────
        const animate = (now: number) => {
            const raw = now - lastTime;
            lastTime = now;
            // Sub-step large frames so physics stays stable
            const dt = Math.min(raw, 20) / 1000; // seconds, max 20ms

            // Spring-damper integration (semi-implicit Euler)
            const ax = STIFFNESS * (mouseX - ringX) - DAMPING * velX;
            const ay = STIFFNESS * (mouseY - ringY) - DAMPING * velY;
            velX += ax * dt;
            velY += ay * dt;
            ringX += velX * dt;
            ringY += velY * dt;

            ring.style.transform = `translate3d(${ringX - 14}px,${ringY - 14}px,0)`;

            // Record ring position into circular trail buffer
            trailX[trailHead] = ringX;
            trailY[trailHead] = ringY;
            trailHead = (trailHead + 1) % TRAIL_LEN;

            // ── Draw trail as smooth quadratic bézier path ─────────────
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Collect ordered trail points (oldest → newest)
            const pts: [number, number][] = [];
            for (let i = 0; i < TRAIL_LEN; i++) {
                const idx = (trailHead + i) % TRAIL_LEN;
                pts.push([trailX[idx], trailY[idx]]);
            }

            if (pts.length >= 3) {
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.shadowBlur = 7;
                ctx.shadowColor = 'rgba(0,255,157,0.4)';

                // Draw many short segments with alpha fading oldest→newest
                for (let i = 1; i < pts.length - 1; i++) {
                    const progress = i / (pts.length - 1); // 0 (old) → 1 (new)
                    const alpha = progress * progress * 0.55; // quadratic fade
                    const width = 0.5 + progress * 1.8;

                    // Midpoints for smooth quadratic bézier
                    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
                    const my = (pts[i][1] + pts[i + 1][1]) / 2;

                    ctx.beginPath();
                    ctx.moveTo((pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2);
                    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
                    ctx.strokeStyle = `rgba(0,255,157,${alpha.toFixed(3)})`;
                    ctx.lineWidth = width;
                    ctx.stroke();
                }
            }

            rafId = requestAnimationFrame(animate);
        };

        rafId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <>
            {/* Smooth bezier trail */}
            <canvas
                ref={canvasRef}
                className="pointer-events-none fixed inset-0"
                style={{ zIndex: 99997 }}
            />

            {/* Ring — spring-physics follow */}
            <div
                ref={ringRef}
                className="pointer-events-none fixed top-0 left-0 will-change-transform"
                style={{ zIndex: 99998, transform: 'translate3d(-300px,-300px,0)' }}
            >
                <div
                    className="w-7 h-7 rounded-full border border-bdie-accent/50"
                    style={{ boxShadow: '0 0 10px rgba(0,255,157,0.15), inset 0 0 6px rgba(0,255,157,0.05)' }}
                />
            </div>

            {/* Precision dot — zero-lag, native-speed */}
            <div
                ref={dotRef}
                className="pointer-events-none fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-bdie-accent will-change-transform"
                style={{
                    zIndex: 99999,
                    boxShadow: '0 0 8px rgba(0,255,157,0.9)',
                    transform: 'translate3d(-300px,-300px,0)',
                }}
            />
        </>
    );
}
