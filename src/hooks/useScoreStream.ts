"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ScoreEntry } from "@/types/game";

export const useScoreStream = (limitCount = 50) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    const scoresRef = collection(db, "scores");
    const scoresQuery = query(
      scoresRef,
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const unsubscribe = onSnapshot(scoresQuery, (snapshot) => {
      const entries = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt as Timestamp | undefined;
        return {
          score: Number(data.score ?? 0),
          survivalTime: Number(data.survivalTime ?? 0),
          proton: Number(data.proton ?? 0),
          neutron: Number(data.neutron ?? 0),
          electron: Number(data.electron ?? 0),
          isotope: String(data.isotope ?? ""),
          elementName: String(data.elementName ?? ""),
          guestId: String(data.guestId ?? ""),
          createdAt: createdAt?.toDate() ?? new Date(0),
        } as ScoreEntry;
      });
      setScores(entries);
    });

    return () => unsubscribe();
  }, [limitCount]);

  return useMemo(() => scores, [scores]);
};
