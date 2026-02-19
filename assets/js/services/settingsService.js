import { db } from "../config/firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export async function fetchMasterData() {
  const docRef = doc(db, "settings", "masterData");
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return snapshot.data();
}
