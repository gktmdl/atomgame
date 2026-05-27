import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatIsotopeLabel } from "@/lib/isotope-utils";
import type { ScorePayload } from "@/types/game";

export const submitScore = async (payload: ScorePayload) => {
  const scoresRef = collection(db, "scores");
  await addDoc(scoresRef, {
    ...payload,
    isotope: formatIsotopeLabel(payload.isotope),
    createdAt: Date.now(),
  });
};
