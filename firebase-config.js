import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
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
const auth = getAuth(app);
const db = getFirestore(app);

// Variável global para controlar o ID do usuário conectado
let usuarioId = null;

// Monitor do Firebase: ele avisa o seu código se o jogador está logado ou não
onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioId = user.uid;
        console.log("Usuário conectado com sucesso:", usuarioId);
    } else {
        usuarioId = null;
        console.log("Nenhum usuário conectado.");
    }
});

// FUNÇÃO SEGURA para os outros arquivos (como o app.js) pegarem o ID atualizado
export function getUsuarioId() {
    return usuarioId;
}

// Exporta as instâncias para os outros arquivos usarem o banco de dados
export { app, auth, db };