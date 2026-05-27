"use client";
import React from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { AtomVisualizer } from "./AtomVisualizer";
import { Controls } from "./Controls";
import { Leaderboard } from "./Leaderboard";

export function GameClient() {
  const { gameState, setProton, setNeutron, setElectron, startGame, resetGame } = useGameEngine();

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent drop-shadow-md">
            원자 안정성 시뮬레이터
          </h1>
          <p className="text-gray-400 font-medium mt-1">Atomic Stability Survival</p>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visualizer & Status */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl relative">
            <AtomVisualizer 
              proton={gameState.proton}
              neutron={gameState.neutron}
              electron={gameState.electron}
              isDead={gameState.isDead}
              isPlaying={gameState.isPlaying}
            />
            
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-700 pointer-events-auto">
                <div className="text-sm text-gray-400 font-bold mb-1">생존 시간</div>
                <div className="text-3xl font-black text-white tabular-nums tracking-wider">{gameState.survivalTime.toFixed(1)}s</div>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-700 pointer-events-auto text-right">
                <div className="text-sm text-gray-400 font-bold mb-1">현재 점수</div>
                <div className="text-3xl font-black text-blue-400 tabular-nums">{gameState.score.toLocaleString()}</div>
              </div>
            </div>

            {/* Status Message */}
            <div className="absolute bottom-6 left-6 right-6 pointer-events-none flex justify-center">
              <div className={`px-6 py-3 rounded-full text-center font-bold text-lg backdrop-blur-md border shadow-xl ${
                gameState.isDead ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                gameState.isPlaying ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                'bg-gray-800/80 text-gray-300 border-gray-700'
              }`}>
                {gameState.statusMessage}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={startGame}
              disabled={gameState.isPlaying}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-2xl py-6 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 border border-blue-400/50"
            >
              START
            </button>
            <button
              onClick={resetGame}
              disabled={!gameState.isPlaying && !gameState.isDead}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-2xl py-6 rounded-2xl shadow-lg transition-all active:scale-95 border border-gray-600"
            >
              RESET
            </button>
          </div>
        </div>

        {/* Right Column: Controls & Leaderboard */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Controls 
            proton={gameState.proton}
            neutron={gameState.neutron}
            electron={gameState.electron}
            setProton={setProton}
            setNeutron={setNeutron}
            setElectron={setElectron}
            isPlaying={gameState.isPlaying}
            isDead={gameState.isDead}
          />
          <Leaderboard />
        </div>
      </main>
    </div>
  );
}
