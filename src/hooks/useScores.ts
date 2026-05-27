import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ScoreEntry } from "@/types";

export function useScores() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [recentFails, setRecentFails] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    // Top 20 scores
    const scoresQuery = query(
      collection(db, "scores"),
      orderBy("score", "desc"),
      limit(20)
    );

    const unsubscribeScores = onSnapshot(scoresQuery, (snapshot) => {
      const newScores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScoreEntry[];
      setScores(newScores);
    });

    // Recent fails (last 20 games played)
    const failsQuery = query(
      collection(db, "scores"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribeFails = onSnapshot(failsQuery, (snapshot) => {
      const newFails = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScoreEntry[];
      setRecentFails(newFails);
    });

    return () => {
      unsubscribeScores();
      unsubscribeFails();
    };
  }, []);

  const submitScore = async (entry: Omit<ScoreEntry, "id" | "createdAt" | "guestId">) => {
    let guestId = localStorage.getItem("atom_guest_id");
    if (!guestId) {
      guestId = `Guest-${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem("atom_guest_id", guestId);
    }

    try {
      await addDoc(collection(db, "scores"), {
        ...entry,
        guestId,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return { scores, recentFails, submitScore };
}
