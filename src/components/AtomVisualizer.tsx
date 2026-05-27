"use client";
import React, { useMemo } from "react";

interface AtomVisualizerProps {
  proton: number;
  neutron: number;
  electron: number;
  isDead: boolean;
  isPlaying: boolean;
}

export function AtomVisualizer({ proton, neutron, electron, isDead, isPlaying }: AtomVisualizerProps) {
  // Generate random positions for nucleus particles
  const nucleusParticles = useMemo(() => {
    const particles = [];
    for (let i = 0; i < proton; i++) {
      particles.push({ type: "proton", id: `p-${i}` });
    }
    for (let i = 0; i < neutron; i++) {
      particles.push({ type: "neutron", id: `n-${i}` });
    }
    // Shuffle
    for (let i = particles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [particles[i], particles[j]] = [particles[j], particles[i]];
    }
    return particles.map((p, index) => {
      const angle = (index / particles.length) * Math.PI * 2 * 3.14;
      const radius = Math.sqrt(index) * 2.5; // Spread out spirally
      return {
        ...p,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: Math.sin(angle * 2.5) * radius, // fake 3d
      };
    });
  }, [proton, neutron]);

  // Generate electrons on orbits
  const orbits = useMemo(() => {
    const maxPerOrbit = [2, 8, 18, 32, 32, 18, 8];
    let remaining = electron;
    const shells = [];
    let shellIndex = 0;

    while (remaining > 0 && shellIndex < maxPerOrbit.length) {
      const capacity = maxPerOrbit[shellIndex];
      const count = Math.min(remaining, capacity);
      shells.push({ index: shellIndex, count });
      remaining -= count;
      shellIndex++;
    }
    
    // If there are still electrons left, just shove them in an outer shell
    if (remaining > 0) {
      shells.push({ index: shellIndex, count: remaining });
    }
    return shells;
  }, [electron]);

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center overflow-hidden bg-black/40 rounded-3xl border border-blue-500/20 shadow-[0_0_50px_rgba(0,100,255,0.1)]">
      {/* Background glow when alive */}
      {!isDead && (
        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full animate-pulse transition-opacity duration-1000" />
      )}
      
      {/* If dead, show a red explosion glow */}
      {isDead && (
        <div className="absolute inset-0 bg-red-600/30 blur-[100px] rounded-full animate-ping" style={{ animationDuration: '0.5s', animationIterationCount: 1 }} />
      )}

      {/* The Atom Container */}
      <div className={`relative transition-transform duration-1000 ${isDead ? 'scale-150 opacity-0' : 'scale-100 opacity-100'} ${isPlaying ? 'animate-spin-slow' : ''}`} style={{ width: '100%', height: '100%' }}>
        {/* Nucleus */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
          <div className="relative flex items-center justify-center">
            {nucleusParticles.map((p) => {
              // Scale particles down if there are many to fit
              const scale = Math.max(0.2, 1 - Math.min(0.8, nucleusParticles.length / 400));
              const size = 12 * scale;
              return (
                <div
                  key={p.id}
                  className={`absolute rounded-full shadow-lg ${
                    p.type === "proton" ? "bg-red-500 shadow-red-500/50" : "bg-gray-400 shadow-gray-400/50"
                  }`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    transform: `translate3d(${p.x * scale}px, ${p.y * scale}px, ${p.z * scale}px)`,
                    zIndex: Math.floor(p.z + 100), // fake depth sorting
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Electron Orbits */}
        {orbits.map((shell) => {
          const orbitRadius = 60 + shell.index * 35;
          return (
            <div
              key={`shell-${shell.index}`}
              className="absolute top-1/2 left-1/2 rounded-full border border-blue-400/20 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: `${orbitRadius * 2}px`,
                height: `${orbitRadius * 2}px`,
                animation: isPlaying ? `spin ${4 + shell.index * 2}s linear infinite ${shell.index % 2 === 0 ? 'reverse' : 'normal'}` : 'none',
              }}
            >
              {Array.from({ length: shell.count }).map((_, eIdx) => {
                const angle = (eIdx / shell.count) * Math.PI * 2;
                return (
                  <div
                    key={`e-${shell.index}-${eIdx}`}
                    className="absolute bg-blue-300 w-2.5 h-2.5 rounded-full shadow-[0_0_10px_#60a5fa] blur-[1px]"
                    style={{
                      left: `calc(50% + ${Math.cos(angle) * orbitRadius}px)`,
                      top: `calc(50% + ${Math.sin(angle) * orbitRadius}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* Particle explosion effect when dead */}
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           {Array.from({ length: 30 }).map((_, i) => (
             <div 
               key={`exp-${i}`} 
               className="absolute w-2 h-2 rounded-full bg-red-400 animate-explode"
               style={{
                 '--tx': `${(Math.random() - 0.5) * 400}px`,
                 '--ty': `${(Math.random() - 0.5) * 400}px`,
                 animationDuration: `${0.5 + Math.random() * 0.5}s`,
                 animationFillMode: 'forwards'
               } as React.CSSProperties}
             />
           ))}
        </div>
      )}
    </div>
  );
}
