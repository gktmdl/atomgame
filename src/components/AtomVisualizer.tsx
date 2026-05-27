"use client";
import React, { useMemo, useEffect, useRef, useState } from "react";

interface AtomVisualizerProps {
  proton: number;
  neutron: number;
  electron: number;
  isDead: boolean;
  isPlaying: boolean;
}

interface ElectronState {
  id: string;
  rx: number;
  ry: number;
  angle: number;
  speed: number;
  offset: number;
  driftX: number;
  driftY: number;
}

export function AtomVisualizer({ proton, neutron, electron, isDead, isPlaying }: AtomVisualizerProps) {
  // Nucleus Packing - Using a more spread out cluster approach
  const nucleusParticles = useMemo(() => {
    const particles = [];
    const total = proton + neutron;
    
    // Golden spiral in 3D-ish space for better packing
    const spacing = 14; 
    const phi = (Math.sqrt(5) + 1) / 2;

    for (let i = 0; i < total; i++) {
      const type = i < proton ? "proton" : "neutron";
      
      // Vogel's model for disk packing
      const r = Math.sqrt(i + 0.5) * spacing;
      const theta = 2 * Math.PI * i / (phi * phi);
      
      particles.push({
        type,
        id: `${type}-${i}`,
        x: Math.cos(theta) * r,
        y: Math.sin(theta) * r,
        z: (Math.random() - 0.5) * r * 0.5, // Some depth
      });
    }

    // Shuffle
    for (let i = particles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [particles[i], particles[j]] = [particles[j], particles[i]];
    }

    return particles;
  }, [proton, neutron]);

  // Electron Animation Setup
  const electronRefs = useRef<(HTMLDivElement | null)[]>([]);
  const requestRef = useRef<number>();
  const electronDataRef = useRef<ElectronState[]>([]);

  useEffect(() => {
    // Initialize electron data
    const newData: ElectronState[] = [];
    for (let i = 0; i < electron; i++) {
      newData.push({
        id: `e-${i}`,
        rx: 80 + Math.random() * 120,
        ry: 50 + Math.random() * 100,
        angle: Math.random() * Math.PI * 2,
        speed: (0.01 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1),
        offset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 20,
        driftY: (Math.random() - 0.5) * 20,
      });
    }
    electronDataRef.current = newData;
    electronRefs.current = electronRefs.current.slice(0, electron);
  }, [electron]);

  const animate = (time: number) => {
    electronDataRef.current.forEach((e, i) => {
      const el = electronRefs.current[i];
      if (el) {
        e.angle += e.speed;
        const x = Math.cos(e.angle + e.offset) * e.rx + e.driftX;
        const y = Math.sin(e.angle + e.offset) * e.ry + e.driftY;
        el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0)`;
      }
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center overflow-hidden bg-black/40 rounded-3xl border border-blue-500/20 shadow-[0_0_50px_rgba(0,100,255,0.1)]">
      
      {/* Electron Cloud Background */}
      {!isDead && (
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-[80%] h-[80%] rounded-full bg-blue-400/5 blur-[60px] animate-pulse" />
           <div className="w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[40px]" />
           <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
        </div>
      )}
      
      {/* If dead, show a red explosion glow */}
      {isDead && (
        <div className="absolute inset-0 bg-red-600/30 blur-[100px] rounded-full animate-ping" style={{ animationDuration: '0.5s', animationIterationCount: 1 }} />
      )}

      {/* The Atom Container */}
      <div className={`relative w-full h-full transition-all duration-1000 ${isDead ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}>
        
        {/* Nucleus */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
          <div className="relative">
            {nucleusParticles.map((p) => {
              // Larger particles
              const size = 16; 
              return (
                <div
                  key={p.id}
                  className={`absolute rounded-full shadow-lg border border-white/10 ${
                    p.type === "proton" ? "bg-red-500 shadow-red-500/50" : "bg-gray-300 shadow-gray-400/50"
                  }`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`,
                    zIndex: Math.floor(p.z + 100),
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Electrons (No Orbits) */}
        <div className="absolute inset-0">
          {Array.from({ length: electron }).map((_, i) => (
            <div
              key={`e-${i}`}
              ref={(el) => (electronRefs.current[i] = el) as any}
              className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-300 rounded-full shadow-[0_0_15px_#60a5fa] blur-[0.5px] z-[200]"
              style={{
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Particle explosion effect when dead */}
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           {Array.from({ length: 40 }).map((_, i) => (
             <div 
               key={`exp-${i}`} 
               className="absolute w-2.5 h-2.5 rounded-full bg-red-400 animate-explode"
               style={{
                 '--tx': `${(Math.random() - 0.5) * 500}px`,
                 '--ty': `${(Math.random() - 0.5) * 500}px`,
                 animationDuration: `${0.4 + Math.random() * 0.6}s`,
                 animationFillMode: 'forwards'
               } as React.CSSProperties}
             />
           ))}
        </div>
      )}
    </div>
  );
}
