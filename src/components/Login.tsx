"use client";
import React, { useState } from "react";
import { SITE_TITLE } from "@/lib/site-brand";

interface LoginProps {
  onLogin: (name: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="w-full max-w-md bg-gray-900 border border-blue-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
            {SITE_TITLE}
          </h1>
          <p className="text-gray-400">원자 만들기 시뮬레이션에 입장하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 ml-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full bg-black border border-gray-700 rounded-2xl px-6 py-4 text-white font-bold text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xl py-4 rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            입장하기
          </button>
        </form>
      </div>
    </div>
  );
}
