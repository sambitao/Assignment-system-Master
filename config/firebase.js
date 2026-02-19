import { initializeApp } from 
"https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";

import { getFirestore } from 
"https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZVvsZcsdrCDYb5JqiZFLaN52hjUi_Arw",
  authDomain: "assignment-interruption-e9481.firebaseapp.com",
  projectId: "assignment-interruption-e9481",
  storageBucket: "assignment-interruption-e9481.firebasestorage.app",
  messagingSenderId: "246855027730",
  appId: "1:246855027730:web:a61bd1dcb9e103c3cc9ccb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
