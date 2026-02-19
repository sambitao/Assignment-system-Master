import { db } from "../config/firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const assignmentRef = collection(db, "assignments");

export async function fetchAssignments() {
  const q = query(assignmentRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

export async function addAssignment(data) {
  await addDoc(assignmentRef, {
    ...data,
    createdAt: new Date()
  });
}

export async function updateAssignment(id, data) {
  await updateDoc(doc(db, "assignments", id), data);
}

export async function deleteAssignment(id) {
  await deleteDoc(doc(db, "assignments", id));
}
