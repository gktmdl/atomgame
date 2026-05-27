"use client";
import React from "react";
import { useScores } from "@/hooks/useScores";

export function Leaderboard() {
  const { scores } = useScores();

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-2xl h-[500px] flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-yellow-400">🏆</span> 실시간 랭킹 (상위 20)
      </h2>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {scores.length === 0 ? (
          <div className="text-center text-gray-500 py-10">아직 등록된 기록이 없습니다.</div>
        ) : (
          scores.map((score, index) => (
            <div key={score.id} className="bg-black/40 border border-gray-800 rounded-lg p-3 flex items-center justify-between transition-colors hover:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <span className={`font-black w-6 text-center ${index < 3 ? 'text-yellow-400 text-lg' : 'text-gray-500'}`}>
                  {index + 1}
                </span>
                <div>
                  <div className="font-bold text-gray-200">{score.playerName || score.guestId}</div>
                  <div className="text-xs text-gray-500">{score.elementName} • {score.isotope}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-blue-400">{score.score.toLocaleString()} 점</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
