import { db } from "../config/firebase.js";
import { collection, getDocs, addDoc } from 
"https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export async function fetchJobs() {
  const snapshot = await getDocs(collection(db, "jobs"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createJob(data) {
  await addDoc(collection(db, "jobs"), data);
}
