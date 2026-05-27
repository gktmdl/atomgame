"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "atomgame-guest-id";

const createGuestId = () => {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `Guest-${suffix}`;
};

export const useGuestId = () => {
  const [guestId, setGuestId] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setGuestId(stored);
      return;
    }
    const id = createGuestId();
    window.localStorage.setItem(STORAGE_KEY, id);
    setGuestId(id);
  }, []);

  return guestId;
};
