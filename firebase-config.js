import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// ⚠️ APAGUE ESTE BLOCO ABAIXO E COLE O SEU CONST FIREBASECONFIG QUE ESTÁ NO SITE!
const firebaseConfig = {
  apiKey: "AIzaSyCW9IT5EiSGuitu-y_hA2wRY8ixDRczQRI",
  authDomain: "ficha-rpg-luves.firebaseapp.com",
  projectId: "ficha-rpg-luves",
  storageBucket: "ficha-rpg-luves.firebasestorage.app",
  messagingSenderId: "1051576175162",
  appId: "1:1051576175162:web:1275c7770a5addf2e94303"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que vamos usar nos outros arquivos
export const auth = getAuth(app);
export const db = getFirestore(app);