"use client";

import { useEffect } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const usePresence = (
  guestId: string,
  active: boolean,
  lastIsotope?: string
) => {
  useEffect(() => {
    if (!guestId) return;

    const sessionRef = doc(db, "sessions", guestId);
    let heartbeat: ReturnType<typeof setInterval> | undefined;

    const writeStatus = async (status: "playing" | "idle") => {
      try {
        await setDoc(
          sessionRef,
          {
            guestId,
            status,
            lastIsotope: lastIsotope ?? null,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Failed to update presence", error);
      }
    };

    if (active) {
      writeStatus("playing");
      heartbeat = setInterval(() => writeStatus("playing"), 10000);
    } else {
      writeStatus("idle");
    }

    return () => {
      if (heartbeat) clearInterval(heartbeat);
    };
  }, [guestId, active, lastIsotope]);
};
