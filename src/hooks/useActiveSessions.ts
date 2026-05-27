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
import type { SessionEntry } from "@/types/game";

export const useActiveSessions = (limitCount = 120) => {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  useEffect(() => {
    const sessionsRef = collection(db, "sessions");
    const sessionsQuery = query(
      sessionsRef,
      orderBy("updatedAt", "desc"),
      limit(limitCount)
    );
    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const entries = snapshot.docs.map((doc) => {
        const data = doc.data();
        const updatedAt = data.updatedAt as Timestamp | undefined;
        return {
          guestId: String(data.guestId ?? ""),
          status: (data.status as "playing" | "idle") ?? "idle",
          updatedAt: updatedAt?.toDate() ?? new Date(0),
          lastIsotope:
            typeof data.lastIsotope === "string" ? data.lastIsotope : undefined,
        } as SessionEntry;
      });
      setSessions(entries);
    });

    return () => unsubscribe();
  }, [limitCount]);

  return useMemo(() => sessions, [sessions]);
};
