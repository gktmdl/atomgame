import { useState, useEffect, useRef, useCallback } from "react";
import { isotopeData } from "@/data/isotopes";
import { GameState } from "@/types";
import { useScores } from "./useScores";
import {
  calculateFinalLifetime,
  calculateInstabilityMultiplier,
  calculateScore,
} from "@/lib/isotope-utils";
import { getElementLifetimeScale } from "@/lib/stability-tiers";

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    survivalTime: 0,
    proton: 1,
    neutron: 0,
    electron: 1,
    statusMessage: "원자를 구성하고 시작을 누르세요.",
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
      neutron: data ? data.preferredStableNeutrons : prev.neutron,
      // Removed electron synchronization for educational purposes
      statusMessage: "원자를 구성하고 시작을 누르세요.",
    }));
  }, [gameState.isPlaying, gameState.isDead]);

  const setNeutron = useCallback((newNeutron: number) => {
    if (gameState.isPlaying || gameState.isDead) return;
    setGameState((prev) => ({
      ...prev,
      neutron: Math.max(0, newNeutron),
      statusMessage: "원자를 구성하고 시작을 누르세요.",
    }));
  }, [gameState.isPlaying, gameState.isDead]);

  const setElectron = useCallback((newElectron: number) => {
    if (gameState.isPlaying || gameState.isDead) return;
    setGameState((prev) => ({
      ...prev,
      electron: Math.max(0, newElectron),
      statusMessage: "원자를 구성하고 시작을 누르세요.",
    }));
  }, [gameState.isPlaying, gameState.isDead]);

  const startGame = useCallback(() => {
    if (gameState.isPlaying) return;

    let finalLifetime = 0;
    let message = "생존 중...";
    let initialDead = false;
    let resultType:
      | "stable"
      | "nuclear_decay"
      | "charge_failure"
      | "invalid_element" = "nuclear_decay";

    const data = isotopeData[gameState.proton];

    targetLifetimeRef.current = 0;

    if (gameState.proton > 118 || !data) {
      initialDead = true;
      message = "존재하지 않는 원자입니다.";
      resultType = "invalid_element";
    } else if (gameState.electron !== gameState.proton) {
      initialDead = true;
      message = "전하가 불안정하여 원자가 유지되지 못했습니다.";
      resultType = "charge_failure";
    } else {
      const instabilityMultiplier = calculateInstabilityMultiplier(
        gameState.neutron,
        data.stableNeutrons,
        data.preferredStableNeutrons
      );
      finalLifetime = calculateFinalLifetime(
        data.baseLifetimeSeconds || 0,
        instabilityMultiplier
      ) * getElementLifetimeScale(data.symbol);

      if (!data.stableNeutrons.includes(gameState.neutron)) {
        resultType = "nuclear_decay";
      }

      if (finalLifetime < 0.1) {
         initialDead = true;
         message = "원자핵 불안정 붕괴";
        resultType = "nuclear_decay";
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
        isotope: data?.symbol || "?",
        elementName: data?.koreanName || "Unknown",
        resultType,
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
      statusMessage: "원자를 구성하고 시작을 누르세요.",
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
      const finalScore = calculateScore(finalSurvival);

      const data = isotopeData[gameState.proton];
      const isStableIsotope = data
        ? gameState.electron === gameState.proton &&
          data.stableNeutrons.includes(gameState.neutron)
        : false;
      const resultType = isStableIsotope ? "stable" : "nuclear_decay";
      const endMessage = isStableIsotope
        ? "원자가 안정적으로 생존했습니다!"
        : "원자핵 불안정 붕괴";
      
      setGameState((prev) => ({
        ...prev,
        isPlaying: false,
        isDead: true,
        survivalTime: finalSurvival,
        score: finalScore,
        statusMessage: endMessage,
      }));

      submitScore({
        score: finalScore,
        survivalTime: finalSurvival,
        proton: gameState.proton,
        neutron: gameState.neutron,
        electron: gameState.electron,
        isotope: data?.symbol || "?",
        elementName: data?.koreanName || "Unknown",
        resultType,
      });
      return;
    }

    const currentScore = calculateScore(elapsedSeconds);

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
