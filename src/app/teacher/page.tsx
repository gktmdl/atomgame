"use client";
import React, { useMemo } from "react";
import { useScores } from "@/hooks/useScores";
import Link from "next/link";

export default function TeacherDashboard() {
  const { scores, recentFails } = useScores();

  const totalPlayers = useMemo(() => {
    const uniqueIds = new Set(scores.map(s => s.playerName || s.guestId));
    return uniqueIds.size;
  }, [scores]);

  const topScore = scores.length > 0 ? scores[0].score : 0;

  const handleLogout = () => {
    localStorage.removeItem("atom_player_name");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-x-hidden p-4 md:p-8">
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-md">
            교사용 대시보드
          </h1>
          <p className="text-gray-400 font-medium mt-1">실시간 학생 플레이 현황</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-colors border border-gray-700">
            게임 화면으로
          </Link>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-xl font-bold transition-colors border border-red-900/50"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto space-y-8">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="현재 참여 중인 학생 수 (추정)" value={`${totalPlayers}명`} icon="👩‍🎓" />
          <StatCard title="최고 점수" value={topScore.toLocaleString()} icon="🏆" highlight />
          <StatCard title="총 플레이 기록 수" value={`${recentFails.length}+`} icon="📊" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Scores */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-yellow-400">🏅</span> 랭킹 (상위 20)
            </h2>
            <div className="space-y-3 h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {scores.map((score, index) => (
                <div key={score.id} className="bg-black/50 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black ${index < 3 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-gray-800 text-gray-400'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold">{score.playerName || score.guestId}</div>
                      <div className="text-sm text-gray-400">{score.elementName} • {score.isotope}</div>
                    </div>
                  </div>
                  <div className="font-black text-xl text-blue-400">
                    {score.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Fails (Live Log) */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-red-400">💥</span> 최근 붕괴 로그
            </h2>
            <div className="space-y-3 h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {recentFails.map((fail) => {
                const date = new Date(fail.createdAt);
                return (
                  <div key={fail.id} className="bg-red-950/20 p-4 rounded-xl border border-red-900/30 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-red-300">{fail.playerName || fail.guestId}</span>
                        <span className="text-xs text-gray-500">{date.toLocaleTimeString()}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="font-mono bg-black/50 px-2 py-0.5 rounded text-gray-400 mr-2">
                          p:{fail.proton} n:{fail.neutron} e:{fail.electron}
                        </span>
                        {fail.elementName} • {fail.isotope} 구성 후 붕괴
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">최종 점수</div>
                      <div className="font-bold text-white">{fail.score.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, highlight = false }: { title: string, value: string | number, icon: string, highlight?: boolean }) {
  return (
    <div className={`bg-gray-900 border rounded-2xl p-6 flex items-center gap-4 shadow-xl ${highlight ? 'border-blue-500/50' : 'border-gray-800'}`}>
      <div className="text-4xl">{icon}</div>
      <div>
        <div className="text-sm text-gray-400 font-bold mb-1">{title}</div>
        <div className={`text-3xl font-black ${highlight ? 'text-blue-400' : 'text-white'}`}>{value}</div>
      </div>
    </div>
  );
}
