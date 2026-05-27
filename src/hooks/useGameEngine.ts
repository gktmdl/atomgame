import { useState, useEffect, useRef, useCallback } from "react";
import { isotopeData } from "@/data/isotopes";
import { GameState } from "@/types";
import { useScores } from "./useScores";

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    survivalTime: 0,
    proton: 1,
    neutron: 0,
    electron: 1,
    statusMessage: "원자를 구성하고 START를 누르세요.",
    isDead: false,
  });

  const { submitScore } = useScores();

  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const targetLifetimeRef = useRef<number>(0);

  // Automatically update neutrons when protons change, if not playing
  const setProton = useCallback((newProton: number) => {
    if (gameState.isPlaying || gameState.isDead) return;
    const clamped = Math.max(1, Math.min(newProton, 118));
    const data = isotopeData[clamped];
    setGameState((prev) => ({
      ...prev,
      proton: clamped,
      neutron: data ? data.stableNeutrons : prev.neutron,
      electron: clamped, // Auto-balance electrons to make it easier to start
      statusMessage: "원자를 구성하고 START를 누르세요.",
    }));
  }, [gameState.isPlaying, gameState.isDead]);

  const setNeutron = useCallback((newNeutron: number) => {
    if (gameState.isPlaying || gameState.isDead) return;
    setGameState((prev) => ({
      ...prev,
      neutron: Math.max(0, newNeutron),
      statusMessage: "원자를 구성하고 START를 누르세요.",
    }));
  }, [gameState.isPlaying, gameState.isDead]);

  const setElectron = useCallback((newElectron: number) => {
    if (gameState.isPlaying || gameState.isDead) return;
    setGameState((prev) => ({
      ...prev,
      electron: Math.max(0, newElectron),
      statusMessage: "원자를 구성하고 START를 누르세요.",
    }));
  }, [gameState.isPlaying, gameState.isDead]);

  const startGame = useCallback(() => {
    if (gameState.isPlaying) return;

    let finalLifetime = 0;
    let message = "생존 중...";
    let initialDead = false;
    let finalScore = 0;

    const data = isotopeData[gameState.proton];

    if (!data) {
      initialDead = true;
      message = "존재하지 않는 원소입니다.";
    } else if (gameState.electron !== gameState.proton) {
      initialDead = true;
      message = "전하가 불안정하여 원자가 즉시 붕괴했습니다.";
    } else {
      const baseLifetime = data.baseLifetimeSeconds || 0;
      const instabilityMultiplier = Math.pow(3, Math.abs(gameState.neutron - data.stableNeutrons));
      let calculatedLifetime = baseLifetime / instabilityMultiplier;
      
      // Add random noise (+/- 5%)
      const noise = 1 + (Math.random() * 0.1 - 0.05);
      finalLifetime = Math.max(0.1, calculatedLifetime * noise);

      if (finalLifetime < 0.1) {
         initialDead = true;
         message = "극도로 불안정하여 즉시 붕괴했습니다.";
      }
    }

    targetLifetimeRef.current = finalLifetime;
    
    if (initialDead) {
      setGameState((prev) => ({
        ...prev,
        isPlaying: false,
        isDead: true,
        survivalTime: 0,
        score: 0,
        statusMessage: message,
      }));
      submitScore({
        score: 0,
        survivalTime: 0,
        proton: gameState.proton,
        neutron: gameState.neutron,
        electron: gameState.electron,
        isotope: `${data?.symbol || "?"}-${gameState.proton + gameState.neutron}`,
        elementName: data?.koreanName || "Unknown",
      });
      return;
    }

    setGameState((prev) => ({
      ...prev,
      isPlaying: true,
      isDead: false,
      score: 0,
      survivalTime: 0,
      statusMessage: message,
    }));
    startTimeRef.current = performance.now();
  }, [gameState, submitScore]);

  const resetGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      isDead: false,
      score: 0,
      survivalTime: 0,
      statusMessage: "원자를 구성하고 START를 누르세요.",
    }));
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  const updateGame = useCallback((time: number) => {
    if (!gameState.isPlaying || gameState.isDead) return;

    const elapsedSeconds = (time - startTimeRef.current) / 1000;
    
    if (elapsedSeconds >= targetLifetimeRef.current) {
      // Game Over
      const finalSurvival = targetLifetimeRef.current;
      const finalScore = Math.floor(
        1_000_000_000 * ((Math.exp(5 * finalSurvival / 30) - 1) / (Math.exp(5) - 1))
      );

      const data = isotopeData[gameState.proton];
      
      setGameState((prev) => ({
        ...prev,
        isPlaying: false,
        isDead: true,
        survivalTime: finalSurvival,
        score: finalScore,
        statusMessage: "원자가 붕괴했습니다!",
      }));

      submitScore({
        score: finalScore,
        survivalTime: finalSurvival,
        proton: gameState.proton,
        neutron: gameState.neutron,
        electron: gameState.electron,
        isotope: `${data?.symbol || "?"}-${gameState.proton + gameState.neutron}`,
        elementName: data?.koreanName || "Unknown",
      });
      return;
    }

    // Still surviving
    const currentScore = Math.floor(
      1_000_000_000 * ((Math.exp(5 * elapsedSeconds / 30) - 1) / (Math.exp(5) - 1))
    );

    setGameState((prev) => ({
      ...prev,
      survivalTime: elapsedSeconds,
      score: currentScore,
    }));

    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameState.isPlaying, gameState.isDead, gameState.proton, gameState.neutron, gameState.electron, submitScore]);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isDead) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState.isPlaying, gameState.isDead, updateGame]);

  return {
    gameState,
    setProton,
    setNeutron,
    setElectron,
    startGame,
    resetGame,
  };
}
