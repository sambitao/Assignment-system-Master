import { db } from "../config/firebase.js";
import { collection, getDocs, addDoc }
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const colRef = collection(db, "subcontractors");

export async function fetchSubs() {
  const snap = await getDocs(colRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addSub(name) {
  await addDoc(colRef, { name, active: true });
}
