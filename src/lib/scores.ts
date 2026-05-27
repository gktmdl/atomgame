import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ScorePayload } from "@/types/game";

export const submitScore = async (payload: ScorePayload) => {
  const scoresRef = collection(db, "scores");
  await addDoc(scoresRef, {
    ...payload,
    createdAt: Date.now(),
  });
};
