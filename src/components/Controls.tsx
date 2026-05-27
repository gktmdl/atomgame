"use client";
import React from "react";
import { isotopeData } from "@/data/isotopes";

interface ControlsProps {
  proton: number;
  neutron: number;
  electron: number;
  setProton: (v: number) => void;
  setNeutron: (v: number) => void;
  setElectron: (v: number) => void;
  isPlaying: boolean;
  isDead: boolean;
}

export function Controls({ proton, neutron, electron, setProton, setNeutron, setElectron, isPlaying, isDead }: ControlsProps) {
  const data = isotopeData[proton];

  const handleAdjust = (setter: (v: number) => void, current: number, delta: number) => {
    setter(current + delta);
  };

  const disabled = isPlaying || isDead;

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
      
      {/* Current Isotope Info */}
      <div className="bg-black/50 rounded-xl p-4 border border-gray-800">
        <div className="flex flex-col mb-2">
          <h2 className="text-3xl font-black text-white">{data?.symbol || "?"}-{proton + neutron}</h2>
          <span className="text-xl font-bold text-gray-400">{data?.koreanName || "알 수 없음"} ({data?.name || "Unknown"})</span>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <ControlRow label="양성자 (Proton)" value={proton} onChange={setProton} onAdjust={(d) => handleAdjust(setProton, proton, d)} color="red" disabled={disabled} />
        <ControlRow label="중성자 (Neutron)" value={neutron} onChange={setNeutron} onAdjust={(d) => handleAdjust(setNeutron, neutron, d)} color="gray" disabled={disabled} />
        <ControlRow label="전자 (Electron)" value={electron} onChange={setElectron} onAdjust={(d) => handleAdjust(setElectron, electron, d)} color="blue" disabled={disabled} />
      </div>

    </div>
  );
}

function ControlRow({ label, value, onChange, onAdjust, color, disabled }: { label: string, value: number, onChange: (v: number) => void, onAdjust: (d: number) => void, color: "red" | "gray" | "blue", disabled: boolean }) {
  const colorClasses = {
    red: "text-red-400 focus:border-red-400 focus:ring-red-400/20",
    gray: "text-gray-300 focus:border-gray-400 focus:ring-gray-400/20",
    blue: "text-blue-400 focus:border-blue-400 focus:ring-blue-400/20",
  }[color];

  const btnClasses = {
    red: "hover:bg-red-500/20 text-red-400 border-red-500/30",
    gray: "hover:bg-gray-500/20 text-gray-300 border-gray-500/30",
    blue: "hover:bg-blue-500/20 text-blue-400 border-blue-500/30",
  }[color];

  return (
    <div className="flex items-center justify-between gap-4">
      <label className={`text-sm font-semibold w-32 ${colorClasses.split(' ')[0]}`}>{label}</label>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onAdjust(-1)} 
          disabled={disabled || value <= (label.includes("양성자") ? 1 : 0)} 
          className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnClasses}`}
        >
          -
        </button>
        <input 
          type="number" 
          value={value} 
          onChange={(e) => onChange(parseInt(e.target.value) || 0)} 
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={`w-20 h-10 bg-black/50 border border-gray-700 rounded-lg text-center font-bold text-lg focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${colorClasses}`}
        />
        <button 
          onClick={() => onAdjust(1)} 
          disabled={disabled}
          className={`w-10 h-10 rounded-lg border flex items-center justify-center text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${btnClasses}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
