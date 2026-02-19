import { db } from "../config/firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const colRef = collection(db, "jobs");

export async function fetchJobs() {
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addJob(data) {
  await addDoc(colRef, {
    ...data,
    createdAt: new Date()
  });
}

export async function removeJob(id) {
  await deleteDoc(doc(db, "jobs", id));
}

export async function editJob(id, data) {
  await updateDoc(doc(db, "jobs", id), data);
}
