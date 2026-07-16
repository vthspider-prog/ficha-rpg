// Importando as ferramentas necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ⚠️ APAGUE ESTE BLOCO ABAIXO E COLE O SEU CONST FIREBASECONFIG QUE ESTÁ NO SITE!
const firebaseConfig = {
    apiKey: "AIzaSyCW9IT5EiSGuitu-y_hA2wRY8ixDRczQRI",
    authDomain: "ficha-rpg-luves.firebaseapp.com",
    projectId: "ficha-rpg-luves",
    storageBucket: "ficha-rpg-luves.firebasestorage.app",
    messagingSenderId: "1051576175162",
    appId: "1:1051576175162:web:1275c7770a5addf2e94303"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Mapeando os elementos do HTML
const emailInput = document.getElementById('email_input');
const senhaInput = document.getElementById('senha_input');
const confirmarSenhaInput = document.getElementById('confirmar_senha_input');
const btnEntrar = document.getElementById('btn_entrar');
const btnCadastrar = document.getElementById('btn_cadastrar');
const btnGoogle = document.getElementById('btn_google');
const btnEsqueciSenha = document.getElementById('btn_esqueci_senha');

// 📧 1. CADASTRO COM VALIDAÇÃO DUPLA DE SENHA
btnCadastrar.addEventListener('click', () => {
    if (btnCadastrar.classList.contains('escondido')) return;

    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();
    const confirmarSenha = confirmarSenhaInput.value.trim();

    if (!email || !senha || !confirmarSenha) {
        alert("Por favor, preencha todos os campos obrigatórios!");
        return;
    }

    // Validação extra: impede o cadastro se as senhas forem diferentes
    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem! Verifique e tente novamente.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, senha)
        .then(() => {
            alert("Conta criada com sucesso! Seja bem-vindo.");
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                alert("Este e-mail já está cadastrado!");
            } else if (error.code === 'auth/weak-password') {
                alert("A senha precisa ter pelo menos 6 caracteres!");
            } else if (error.code === 'auth/invalid-email') {
                alert("O formato do e-mail é inválido!");
            } else {
                alert("Erro ao cadastrar: " + error.message);
            }
        });
});

// 🔑 2. LOGIN COM E-MAIL E SENHA
btnEntrar.addEventListener('click', () => {
    if (btnEntrar.classList.contains('escondido')) return;

    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();

    if (!email || !senha) {
        alert("Preencha e-mail e senha para entrar!");
        return;
    }

    signInWithEmailAndPassword(auth, email, senha)
        .then(() => {
            alert("Login realizado com sucesso!");
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error(error);
            alert("Erro ao entrar: Verifique seu e-mail e senha.");
        });
});

// 🔄 3. ESQUECI A SENHA (ENVIO DE E-MAIL DE REDEFINIÇÃO)
btnEsqueciSenha.addEventListener('click', () => {
    const email = emailInput.value.trim();

    if (!email) {
        alert("Por favor, digite seu e-mail no campo acima para podermos enviar o link de redefinição!");
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("E-mail de redefinição enviado! Verifique sua caixa de entrada ou spam.");
        })
        .catch((error) => {
            console.error(error);
            if (error.code === 'auth/invalid-email') {
                alert("O formato do e-mail digitado é inválido.");
            } else if (error.code === 'auth/user-not-found') {
                alert("Nenhum usuário encontrado com este e-mail.");
            } else {
                alert("Erro ao enviar e-mail de recuperação: " + error.message);
            }
        });
});

// 🌐 4. LOGIN COM O GOOGLE
const provider = new GoogleAuthProvider();

btnGoogle.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then(() => {
            alert("Login com o Google realizado com sucesso!");
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error(error);
            if (error.code !== 'auth/popup-closed-by-user') {
                alert("Erro ao logar com o Google: " + error.message);
            }
        });
});