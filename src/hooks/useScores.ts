import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ScoreEntry } from "@/types";
import { formatIsotopeLabel } from "@/lib/isotope-utils";

const GUEST_ID_STORAGE_KEY = "atomgame-guest-id";

const getOrCreateGuestId = () => {
  if (typeof window === "undefined") {
    return "Guest-unknown";
  }

  const storedGuestId = window.localStorage.getItem(GUEST_ID_STORAGE_KEY);
  if (storedGuestId) {
    return storedGuestId;
  }

  const guestId = `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
  window.localStorage.setItem(GUEST_ID_STORAGE_KEY, guestId);
  return guestId;
};

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
      const newScores = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          isotope: formatIsotopeLabel(String(data.isotope ?? "")),
        } as ScoreEntry;
      });
      setScores(newScores);
    });

    // Recent fails (last 20 games played)
    const failsQuery = query(
      collection(db, "scores"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribeFails = onSnapshot(failsQuery, (snapshot) => {
      const newFails = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          isotope: formatIsotopeLabel(String(data.isotope ?? "")),
        } as ScoreEntry;
      });
      setRecentFails(newFails);
    });

    return () => {
      unsubscribeScores();
      unsubscribeFails();
    };
  }, []);

  const submitScore = async (entry: Omit<ScoreEntry, "id" | "createdAt" | "guestId" | "playerName">) => {
    const playerName = localStorage.getItem("atom_player_name") || "Unknown";
    const guestId = getOrCreateGuestId();
    const createdAt = Date.now();
    const scorePayload = {
      ...entry,
      isotope: formatIsotopeLabel(entry.isotope),
      guestId,
      playerName,
      createdAt,
    };

    try {
      console.debug("Submitting Firestore score", scorePayload);
      await addDoc(collection(db, "scores"), scorePayload);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return { scores, recentFails, submitScore };
}
