import { firebaseConfig } from "./config.js";
// 1. Importando as ferramentas do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// Inicialização das instâncias do Firebase (Correção essencial)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variáveis de controle globais
let usuarioId = null;
let radarChart = null;
let especieTemporaria = "";
let classeSelecionadaTemporaria = "";
let atributoFiltroAtual = "todas";
let imagemBase64Ficha = "";
let timeoutSalvamento;

// Controle do temporizador para não estourar o limite de requisições (Debounce)
function dispararSalvarComDebounce() {
    clearTimeout(timeoutSalvamento);
    timeoutSalvamento = setTimeout(() => {
        salvarDadosFicha();
    }, 2000);
}

// Função para Salvar os dados do Topo da Ficha até as Perícias
async function salvarDadosFicha() {
    const usuario = auth.currentUser;
    if (!usuario) return;

    const uid = usuario.uid;
    const docRef = doc(db, "usuarios", uid);

    try {
        const docSnap = await getDoc(docRef);
        let dadosAntigos = docSnap.exists() ? docSnap.data() : {};

        // Montagem unificada do objeto que será salvo no Firestore
        const dadosFicha = {
            topo: {
                nivel: document.getElementById("campo_lv")?.value || dadosAntigos.topo?.nivel || "0",
                nomeJogador: document.getElementById("player_nome_input")?.value || dadosAntigos.topo?.nomeJogador || "",
                persona: document.querySelector('.tabela-dados tr:nth-child(1) input')?.value || dadosAntigos.topo?.persona || "",
                especie: document.getElementById("especie_input")?.value || dadosAntigos.topo?.especie || "",
                classe: document.getElementById("classe_input")?.value || dadosAntigos.topo?.classe || "",
                foto: imagemBase64Ficha || dadosAntigos.topo?.foto || ""
            },
            status: {
                pv: {
                    total: document.getElementById("pv_total")?.value || "0",
                    dano: document.getElementById("pv_dano")?.value || "0",
                    dadoVal: document.querySelector(".borda-pv .dado-val")?.value || "",
                    bonusVal: document.querySelector(".borda-pv .bonus-val")?.value || ""
                },
                ps: {
                    total: document.getElementById("ps_total")?.value || "0",
                    dano: document.getElementById("ps_dano")?.value || "0",
                    dadoVal: document.querySelector(".borda-ps .dado-val")?.value || "",
                    bonusVal: document.querySelector(".borda-ps .bonus-val")?.value || ""
                },
                pe: {
                    total: document.getElementById("pe_total")?.value || "0",
                    dano: document.getElementById("pe_dano")?.value || "0",
                    dadoVal: document.querySelector(".borda-pe .dado-val")?.value || "",
                    bonusVal: document.querySelector(".borda-pe .bonus-val")?.value || ""
                }
            },
            testesMorte: {
                morte_1: document.getElementById("morte_1")?.checked || false,
                morte_2: document.getElementById("morte_2")?.checked || false,
                morte_3: document.getElementById("morte_3")?.checked || false
            },
            atributos: {
                forca: document.getElementById("base_for")?.value || "+0",
                vigor: document.getElementById("base_vig")?.value || "+0",
                destreza: document.getElementById("base_des")?.value || "+0",
                carisma: document.getElementById("base_car")?.value || "+0",
                intelecto: document.getElementById("base_int")?.value || "+0",
                sorte: document.getElementById("sorte_input")?.value || "+0",
                defesa: document.getElementById("defesa_input")?.value || "10"
            },
            pericias: {
                bonusGeral: document.getElementById("bonus_geral_pericias")?.value || "0",
                dadosTreino: obterValoresTreinoPericias()
            },
            aparencia: {
                corTema: document.getElementById("seletor-cor")?.value || dadosAntigos.aparencia?.corTema || "#ed1c24",
                modoBrilho: localStorage.getItem('modoBrilhoFicha') || dadosAntigos.aparencia?.modoBrilho || 'claro'
            },
            atualizadoEm: new Date().toISOString()
        };

        await setDoc(docRef, dadosFicha, { merge: true });
        console.log("Ficha, atributos e perícias salvos com sucesso!");

    } catch (error) {
        console.error("Erro ao salvar dados no Firestore:", error);
    }
}

// Função auxiliar para mapear dinamicamente o valor de treino digitado
function obterValoresTreinoPericias() {
    const mapaTreino = {};
    document.querySelectorAll('.inputs-tres').forEach((container, index) => {
        const inputs = container.querySelectorAll('input');
        if (inputs.length >= 2) {
            const idInput = inputs[1].id || `treino_pericia_${index}`;
            mapaTreino[idInput] = inputs[1].value || "+0"; // Corrigido de mapPreino para mapaTreino
        }
    });
    return mapaTreino;
}

// Função para carregar os dados do Topo da Ficha até Perícias
async function carregarDadosFicha(uid) {
    try {
        const docRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const dados = docSnap.data();

            // 1. CARREGANDO O TOPO DA FICHA
            if (dados.topo) {
                const t = dados.topo;
                if (document.getElementById("campo_lv")) document.getElementById("campo_lv").value = t.nivel || "0";
                if (document.getElementById("player_nome_input")) document.getElementById("player_nome_input").value = t.nomeJogador || "";
                if (document.getElementById("especie_input")) document.getElementById("especie_input").value = t.especie || "";
                if (document.getElementById("classe_input")) document.getElementById("classe_input").value = t.classe || "";

                const inputPersona = document.querySelector('.tabela-dados tr:nth-child(1) input');
                if (inputPersona) inputPersona.value = t.persona || "";

                if (t.foto) {
                    imagemBase64Ficha = t.foto;
                    const previewImg = document.getElementById("preview_img");
                    const placeholder = document.getElementById("placeholder_upload");
                    const containerFoto = document.getElementById("container_foto");

                    if (previewImg) { previewImg.src = t.foto; previewImg.style.display = "block"; }
                    if (placeholder) placeholder.style.display = "none";
                    if (containerFoto) containerFoto.style.borderStyle = "solid";
                }
            }

            // 2. CARREGANDO APARÊNCIA E TEMA
            if (dados.aparencia) {
                const ap = dados.aparencia;
                const seletorCor = document.getElementById("seletor-cor");
                if (seletorCor && ap.corTema) {
                    seletorCor.value = ap.corTema;
                    setTimeout(() => {
                        if (typeof window.atualizarTemaFicha === "function") {
                            window.atualizarTemaFicha(ap.corTema);
                        }
                    }, 0);
                }
                if (ap.modoBrilho) {
                    setTimeout(() => {
                        if (typeof window.mudarModoBrilho === "function") {
                            window.mudarModoBrilho(ap.modoBrilho);
                        }
                    }, 0);
                }
            }

            // 3. CARREGANDO VALORES DE STATUS (PV, PS, PE)
            if (dados.status) {
                const s = dados.status;
                const tipos = ['pv', 'ps', 'pe'];

                tipos.forEach(tipo => {
                    if (s[tipo]) {
                        const totalInput = document.getElementById(`${tipo}_total`);
                        const danoInput = document.getElementById(`${tipo}_dano`);
                        const dadoInput = document.querySelector(`.borda-${tipo} .dado-val`);
                        const bonusInput = document.querySelector(`.borda-${tipo} .bonus-val`);

                        if (totalInput) totalInput.value = s[tipo].total || "0";
                        if (danoInput) danoInput.value = s[tipo].dano || "0";
                        if (dadoInput) dadoInput.value = s[tipo].dadoVal || "";
                        if (bonusInput) bonusInput.value = s[tipo].bonusVal || "";

                        setTimeout(() => {
                            if (typeof window.atualizarStatus === "function") {
                                window.atualizarStatus(tipo);
                            }
                        }, 0);
                    }
                });
            }

            // 4. CARREGANDO TESTES DE MORTE
            if (dados.testesMorte) {
                const tm = dados.testesMorte;
                for (let i = 1; i <= 3; i++) {
                    const chk = document.getElementById(`morte_${i}`);
                    if (chk) chk.checked = tm[`morte_${i}`] || false;
                }
            }

            // 5. CARREGANDO ATRIBUTOS, SORTE E DEFESA
            if (dados.atributos) {
                const atr = dados.atributos;

                if (document.getElementById("base_for")) document.getElementById("base_for").value = atr.forca || "+0";
                if (document.getElementById("base_vig")) document.getElementById("base_vig").value = atr.vigor || "+0";
                if (document.getElementById("base_des")) document.getElementById("base_des").value = atr.destreza || "+0";
                if (document.getElementById("base_car")) document.getElementById("base_car").value = atr.carisma || "+0";
                if (document.getElementById("base_int")) document.getElementById("base_int").value = atr.intelecto || "+0";
                if (document.getElementById("sorte_input")) document.getElementById("sorte_input").value = atr.sorte || "+0";
                if (document.getElementById("defesa_input")) document.getElementById("defesa_input").value = atr.defesa || "10";

                setTimeout(() => {
                    if (typeof window.atualizarTudo === "function") window.atualizarTudo();

                    // FORÇA O PREENCHIMENTO AUTOMÁTICO DAS BASES DAS PERÍCIAS APÓS CARREGAR DO BANCO
                    if (typeof window.disparar_vinculo_base_for === "function") window.disparar_vinculo_base_for();
                    if (typeof window.disparar_vinculo_base_vig === "function") window.disparar_vinculo_base_vig();
                    if (typeof window.disparar_vinculo_base_des === "function") window.disparar_vinculo_base_des();
                    if (typeof window.disparar_vinculo_base_car === "function") window.disparar_vinculo_base_car();
                    if (typeof window.disparar_vinculo_base_int === "function") window.disparar_vinculo_base_int();
                }, 300);
            }

            // 6. CARREGANDO ABAS DE PERÍCIAS
            if (dados.pericias) {
                const per = dados.pericias;

                const inputBonusGeral = document.getElementById("bonus_geral_pericias");
                if (inputBonusGeral && per.bonusGeral) inputBonusGeral.value = per.bonusGeral;

                if (per.dadosTreino) {
                    document.querySelectorAll('.inputs-tres').forEach((container, index) => {
                        const inputs = container.querySelectorAll('input');
                        if (inputs.length >= 2) {
                            const idInput = inputs[1].id || `treino_pericia_${index}`;
                            if (per.dadosTreino[idInput] !== undefined) {
                                inputs[1].value = per.dadosTreino[idInput];

                                // Executa o cálculo automático da linha ao carregar
                                if (typeof window.calcularTotalLinhaGlobal === "function") {
                                    window.calcularTotalLinhaGlobal(container);
                                }
                            }
                        }
                    });
                }
            }

            console.log("Ficha carregada com perícias e gráfico com sucesso!");
        }
    } catch (error) {
        console.error("Erro ao carregar dados do Firestore:", error);
    }
}

// 3. MONITOR DE LOGIN (Unificado e Corrigido)
onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioId = user.uid;
        console.log("Jogador conectado:", user.email);

        inicializarFicha();
        carregarDadosFicha(user.uid);

        const todosInputs = document.querySelectorAll("input, textarea, select");
        todosInputs.forEach(input => {
            if (!input.hasAttribute("readonly") && input.id !== "seletor-cor" && input.id !== "input_foto") {
                input.addEventListener("input", dispararSalvarComDebounce);
                input.addEventListener("change", dispararSalvarComDebounce);
            }
        });
    } else {
        usuarioId = null;
        alert("Você precisa fazer login para acessar a ficha!");
        window.location.href = "login.html";
    }
});

function inicializarFicha() {
    console.log("Ficha pronta para uso.");

    // Declaração das funções internas ANTES do uso para evitar erros de Hoisting (is not defined)
    function calcularTotalLinha(inputsTresContainer) {
        const inputs = inputsTresContainer.querySelectorAll('input');
        if (inputs.length >= 3) {
            let valorBase = parseInt(inputs[0].value.replace(/[^\d-]/g, '')) || 0;
            let valorBuild = parseInt(inputs[1].value.replace(/[^\d-]/g, '')) || 0;
            inputs[2].value = valorBase + valorBuild;
        }
    }
    window.calcularTotalLinhaGlobal = calcularTotalLinha; // expõe para o carregamento do Firestore

    function vincularAtributoPericia(idAtributo, classePericias) {
        const inputAtributo = document.getElementById(idAtributo);
        const inputsBasePericias = document.querySelectorAll('.' + classePericias);
        if (inputAtributo) {
            // Criamos uma função separada para poder chamá-la a qualquer momento
            const atualizarCamposFilhos = function () {
                let valorLimpo = inputAtributo.value.replace(/[^\d-]/g, '') || "0";
                inputsBasePericias.forEach(function (inputBase) {
                    inputBase.value = valorLimpo;
                    const container = inputBase.closest('.inputs-tres');
                    calcularTotalLinha(container);
                });
            };

            // Roda quando o usuário digita
            inputAtributo.addEventListener("input", function () {
                atualizarCamposFilhos();
                if (typeof dispararSalvarComDebounce === "function") dispararSalvarComDebounce();
            });

            // Deixamos exposto globalmente para a função de carregar usar!
            window[`disparar_vinculo_${idAtributo}`] = atualizarCamposFilhos;
        }
    }

    function atualizarTudo() {
        const ids = ['base_for', 'base_vig', 'base_des', 'base_car', 'base_int'];
        const vals = ids.map(id => {
            const input = document.getElementById(id);
            if (!input || !input.value) return 0;
            let valorLimpo = input.value.replace(/[^\d-]/g, '');
            return parseInt(valorLimpo) || 0;
        });

        if (radarChart && radarChart.data && radarChart.data.datasets[0]) {
            radarChart.data.datasets[0].data = vals;
            radarChart.update();
        }

        ['p_for', 'p_vig', 'p_des', 'p_car', 'p_int'].forEach((id, index) => {
            const el = document.getElementById(id);
            if (el) el.innerText = `[+${vals[index] + 2}]`;
        });

        const campoDefesa = document.getElementById('defesa_input');
        if (campoDefesa && campoDefesa.value.trim() === "") campoDefesa.value = 10;
    }
    window.atualizarTudo = atualizarTudo; // Torna global imediatamente de forma segura

    function initChart() {
        if (typeof Chart === "undefined") { console.error("Chart.js ausente."); return; }
        const ctx = document.getElementById('radarChart');
        if (!ctx) return;
        if (radarChart) radarChart.destroy();
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['FOR', 'VIG', 'DES', 'CAR', 'INT'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(237, 28, 36, 0.3)',
                    borderColor: '#ed1c24',
                    pointRadius: 3,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: { min: 0, max: 6, ticks: { display: false, stepSize: 1 }, grid: { color: '#ddd' }, angleLines: { color: '#ddd' } }
                },
                plugins: { legend: { display: false } }
            }
        });
        atualizarTudo();
    }

    function calcularStatus(tipo) {
        const totalEl = document.getElementById(`${tipo}_total`);
        const danoEl = document.getElementById(`${tipo}_dano`);
        const updatedEl = document.getElementById(`${tipo}_atual`);
        const barraEl = document.getElementById(`barra_${tipo}`);
        const total = totalEl ? (parseFloat(totalEl.value) || 0) : 0;
        const dano = danoEl ? (parseFloat(danoEl.value) || 0) : 0;
        let atual = Math.max(0, total - dano);
        if (updatedEl) updatedEl.value = atual;
        const porcentagem = total > 0 ? (atual / total) * 100 : 0;
        if (barraEl) barraEl.style.width = porcentagem + "%";
    }

    function formatarSinal(input) {
        let valor = input.value.replace(/[^\d-]/g, "");
        if (valor === "") { input.value = ""; return; }
        if (valor.startsWith("-")) {
            let numeros = valor.replace(/-/g, "");
            input.value = numeros === "" ? "-" : "-" + parseInt(numeros);
        } else {
            let numeroPuro = parseInt(valor);
            input.value = isNaN(numeroPuro) ? "" : "+" + numeroPuro;
        }
    }

    // Objetos estáticos de raças e classes
    const dadosEspecies = {
        "Humanos": { attr: "NUL", resumo: "A raça mais versátil e ambiciosa.", bonus: "Seu status de Nulo aumenta em +1", desc: "Variam imensamente.", idade: "Maturidade aos 18, vivem até os 90 anos.", tamanho: "Médio", img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' fill='%23eee'/></svg>" },
        "Dragões": { attr: "FOR", resumo: "Seres de linhagem ancestral.", bonus: "Seu status de Força aumenta em +1", desc: "Escamas resistentes.", idade: "Podem viver milênios.", tamanho: "Grande", img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' fill='%23eee'/></svg>" },
        "Feras": { attr: "FOR", resumo: "Híbridos com instintos aguçados.", bonus: "Seu status de Força aumenta em +1", desc: "Humanoides com aspectos animais.", idade: "Maturidade aos 18 anos.", tamanho: "Médio", img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' fill='%23eee'/></svg>" },
        "Mutante": { attr: "FOR", resumo: "Seres mutados com poderes uniques.", bonus: "Seu status de Constituição aumenta em +1", desc: "Traços anormais.", idade: "Maturidade aos 16 anos.", tamanho: "Médio", img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' fill='%23eee'/></svg>" },
        "Plantas": { attr: "VIG", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" },
        "Reencarnados": { attr: "VIG", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" },
        "Vampiros": { attr: "VIG", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" },
        "Goblins": { attr: "DES", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" },
        "Insectos": { attr: "DES", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" },
        "Limosos": { attr: "DES", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" },
        "Anjos": { attr: "CAR", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" },
        "Demônios": { attr: "CAR", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" },
        "Gemas": { attr: "CAR", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" },
        "Construtos": { attr: "INT", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" },
        "Elfos": { attr: "INT", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" },
        "Marcianos": { attr: "INT", resumo: "???", bonus: "???", desc: "???", idade: "???", tamanho: "???", img: "" }
    };

    const dadosDasClasses = {
        "Bárbaro": { tag: "VIG", proficiencias: "Armas: Simples, Marciais e de Impacto.<br>Armaduras: Leves, Médias e Escudos.", habNome: "Fúria Incontrolável", habDesc: "Você pode entrar em fúria como uma ação bônus. Recebe +2 em testes de Força e resistência a danos físicos por 1 minuto." },
        "Ceifador": { tag: "DES", proficiencias: "Armas: Cortantes, Pesadas e de Duas Mãos.<br>Armaduras: Médias.", habNome: "Golpe Executor", habDesc: "Seu ataque causa dano crítico massivo contra alvos que estejam debilitados ou com menos da metade da vida total." },
        "Performático": { tag: "CAR", proficiencias: "Armas: Ágeis, Floretes e de Arremesso.<br>Armaduras: Leves.", habNome: "Distração Teatral", habDesc: "Sua movimentação exótica confunde os oponentes, concedendo vantagem em testes de esquiva ou enganação durante o combate." },
        "Exorcista": { tag: "INT", proficiencias: "Armas: Simples, Cetros e Itens Sagrados.<br>Armaduras: Leves e Médias.", habNome: "Purificação de Aura", habDesc: "Consegue conjurar uma barreira mística que repele danos sobrenaturais ou detecta a presença de entidades corrompidas." },
        "Sentinela": { tag: "FOR", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Monge": { tag: "DES", proficiencias: "???", habNome: "Fluxo de Ki", habDesc: "???" },
        "Paladino": { tag: "CAR", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Socorrista": { tag: "INT", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Assassino": { tag: "FOR", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Caçador": { tag: "VIG", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Gatuno": { tag: "CAR", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Hacker": { tag: "INT", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Cozinheiro": { tag: "FOR", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Maestro": { tag: "VIG", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Alfaiate": { tag: "DES", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Ocultista": { tag: "INT", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Mecânico": { tag: "FOR", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Alquimista": { tag: "VIG", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Investigador": { tag: "DES", proficiencias: "???", habNome: "???", habDesc: "???" },
        "Arcanista": { tag: "CAR", proficiencias: "???", habNome: "???", habDesc: "???" }
    };

    window.atualizarTesteMorte = function () {
        const m1 = document.getElementById('morte_1')?.checked;
        const m2 = document.getElementById('morte_2')?.checked;
        const m3 = document.getElementById('morte_3')?.checked;
        if (m1 && m2 && m3) console.log("O personagem acumulou 3 falhas no Teste de Morte.");
    };

    window.abrirModal = function () {
        const modal = document.getElementById('modal_especies');
        if (modal) modal.style.display = 'block';
        document.body.classList.add('modal-aberto');
    };

    window.fecharModal = function () {
        const modal = document.getElementById('modal_especies');
        if (modal) modal.style.display = 'none';
        document.body.classList.remove('modal-aberto');
    };

    window.fecharDetalhes = function () {
        const modal = document.getElementById('modal_detalhes');
        if (modal) modal.style.display = 'none';
    };

    window.selecionarEspecie = function (nome) {
        const info = dadosEspecies[nome];
        if (!info) {
            console.error(`A espécie "${nome}" não foi encontrada no objeto dadosEspecies.`);
            return;
        }

        especieTemporaria = nome;

        // Mapeamento dos campos do modal para as chaves reais do objeto
        ['detalhe_nome', 'detalhe_resumo_curto', 'detalhe_bonus', 'detalhe_desc', 'detalhe_idade', 'detalhe_tamanho'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Se for o campo de nome, e info.nome não existir, usamos o parâmetro 'nome' que veio no clique
                if (id === 'detalhe_nome') {
                    el.innerText = info.nome || nome; // Garante que nunca fique "undefined"
                } else {
                    const chaveObjeto = id.replace('detalhe_', '') === 'resumo_curto' ? 'resumo' : id.replace('detalhe_', '');
                    el.innerText = info[chaveObjeto] !== undefined ? info[chaveObjeto] : "???";
                }
            }
        });

        const dImg = document.getElementById('detalhe_img');
        if (dImg) dImg.src = info.img || ""; // Evita imagens quebradas

        const dTag = document.getElementById('detalhe_tag');
        if (dTag && info.attr) {
            dTag.innerText = info.attr;
            dTag.className = `tag-attr ${info.attr.toLowerCase()}`;
        } else if (dTag) {
            dTag.innerText = "INT"; // Valor padrão caso não tenha atributo
            dTag.className = "tag-attr int";
        }

        const mDetalhes = document.getElementById('modal_detalhes');
        if (mDetalhes) mDetalhes.style.display = 'block';
        document.body.classList.add('modal-aberto');
    };

    window.confirmarEscolha = function () {
        if (especieTemporaria) {
            const inputEspecie = document.getElementById('especie_input');
            if (inputEspecie) {
                inputEspecie.value = especieTemporaria;
                inputEspecie.classList.add('tem-conteudo');
            }
            window.fecharDetalhes();
            window.fecharModal();
            atualizarTudo();
        }
    };

    window.limparEspecie = function () {
        const inputEspecie = document.getElementById('especie_input');
        if (inputEspecie) {
            inputEspecie.value = "";
            inputEspecie.classList.remove('tem-conteudo');
        }
        atualizarTudo();
    };

    window.abrirModalExclusivo = function (id) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = "block";
    };

    window.fecharModalClasse = function (idModal) {
        const modal = document.getElementById(idModal);
        if (modal) modal.style.display = "none";
    };

    window.trocarAbaClasse = function (evt, abaId) {
        const conteudos = document.getElementsByClassName("conteudo-classe");
        for (let i = 0; i < conteudos.length; i++) conteudos[i].classList.remove("active");
        const botoes = document.getElementsByClassName("tab-btn-classe");
        for (let i = 0; i < botoes.length; i++) botoes[i].classList.remove("active");
        document.getElementById(abaId).classList.add("active");
        evt.currentTarget.classList.add("active");
    };

    window.selecionarClasse = function (nomeClasse) {
        const info = dadosDasClasses[nomeClasse];
        if (!info) return;
        classeSelecionadaTemporaria = nomeClasse;
        document.getElementById('detalhe_classe_nome').innerText = nomeClasse.toUpperCase();
        const badge = document.getElementById('detalhe_classe_tag');
        if (badge) {
            badge.innerText = info.tag;
            badge.className = "badge-status-classe " + info.tag.toLowerCase();
        }
        document.getElementById('detalhe_classe_proficiencias').innerHTML = info.proficiencias;
        document.getElementById('detalhe_classe_hab_nome').innerText = info.habNome;
        document.getElementById('detalhe_classe_hab_desc').innerText = info.habDesc;
        window.fecharModalClasse('modalClasse');
        document.getElementById('modal_detalhes_classe').style.display = 'block';
    };

    window.voltarParaListaClasses = function () {
        document.getElementById('modal_detalhes_classe').style.display = 'none';
        window.abrirModalExclusivo('modalClasse');
    };

    window.confirmarEscolhaClasseFinal = function () {
        if (classeSelecionadaTemporaria) {
            const inputClasse = document.getElementById('classe_input');
            if (inputClasse) inputClasse.value = classeSelecionadaTemporaria;
            const btnLimpar = document.getElementById('btn_limpar_classe');
            if (btnLimpar) btnLimpar.style.display = 'inline-block';
            document.getElementById('modal_detalhes_classe').style.display = 'none';
            atualizarTudo();
        }
    };

    window.limparClasse = function () {
        const inputClasse = document.getElementById('classe_input');
        if (inputClasse) inputClasse.value = "";
        const btnLimpar = document.getElementById('btn_limpar_classe');
        if (btnLimpar) btnLimpar.style.display = 'none';
        atualizarTudo();
    };

    window.mostrarDetalhesClasse = function (idDetalhe) {
        const grids = document.getElementsByClassName("grid-classes");
        for (let i = 0; i < grids.length; i++) grids[i].style.display = "none";
        const detalhes = document.getElementsByClassName("detalhe-classe");
        for (let i = 0; i < detalhes.length; i++) detalhes[i].style.display = "none";
        const targetDet = document.getElementById(idDetalhe);
        if (targetDet) targetDet.style.display = "block";
    };

    window.fecharDetalhesClasse = function () {
        const detalhes = document.getElementsByClassName("detalhe-classe");
        for (let i = 0; i < detalhes.length; i++) detalhes[i].style.display = "none";
        const grids = document.getElementsByClassName("grid-classes");
        for (let i = 0; i < grids.length; i++) grids[i].style.display = "grid";
    };

    window.alternarSubAba = function (botao, idSubAba) {
        const containerMenu = botao.closest('.menu-sub-abas-rpg');
        if (containerMenu) containerMenu.querySelectorAll('.btn-sub-aba').forEach(btn => btn.classList.remove('active'));
        botao.classList.add('active');
        document.querySelectorAll('.bloco-sub-aba-conteudo').forEach(bloco => bloco.classList.remove('active'));
        const blocoAlvo = document.getElementById(idSubAba);
        if (blocoAlvo) blocoAlvo.classList.add('active');
    };

    window.carregarFoto = function (event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewImg = document.getElementById("preview_img");
            const placeholder = document.getElementById("placeholder_upload");
            const containerFoto = document.getElementById("container_foto");

            if (previewImg) { previewImg.src = e.target.result; previewImg.style.display = "block"; }
            if (placeholder) placeholder.style.display = "none";
            if (containerFoto) containerFoto.style.borderStyle = "solid";

            imagemBase64Ficha = e.target.result;
            dispararSalvarComDebounce();
        };
        reader.readAsDataURL(file);
    };

    window.validarRapido = function (input) {
        if (!input) return;
        let valor = input.value.replace(/[^\d-]/g, '');
        if (valor === "" || valor === "-") return;
        let n = parseInt(valor);
        if (isNaN(n)) n = 0;
        if (n > 6) n = 6;
        if (n < -1) n = -1;
        input.value = (n > 0) ? "+" + n : n;
        atualizarTudo();
    };

    // CAMPO "PERSONAGEM" DA FICHA

    // Função que gerencia a troca entre Dropdown e Texto Personalizado
window.verificarOpcaoRelacao = function (selectElement) {
    if (selectElement.value === "outro") {
        const container = selectElement.closest(".container-select-relacao");
        const selectWrapper = container.querySelector(".select-wrapper-rpg");
        const customWrapper = container.querySelector(".custom-input-wrapper");
        const inputPersonalizado = customWrapper.querySelector(".input-relacao-personalizado");
        
        selectWrapper.style.display = "none";
        customWrapper.style.display = "flex";
        
        inputPersonalizado.focus();

        if (!inputPersonalizado.dataset.ouvinteAtivo) {
            inputPersonalizado.addEventListener("input", function() {
                this.value = this.value.replace(/(^\w{1})|(\s+\w{1})/g, letra => letra.toUpperCase());
            });
            inputPersonalizado.dataset.ouvinteAtivo = "true";
        }
    }
};

// Função para cancelar a digitação personalizada e voltar para o Dropdown
window.cancelarOpcaoPersonalizada = function (botaoVoltar) {
    const container = botaoVoltar.closest(".container-select-relacao");
    const selectWrapper = container.querySelector(".select-wrapper-rpg");
    const customWrapper = container.querySelector(".custom-input-wrapper");
    const selectElement = selectWrapper.querySelector(".select-relacao-tipo");
    const inputElement = customWrapper.querySelector(".input-relacao-personalizado");

    inputElement.value = "";
    selectElement.value = "";

    customWrapper.style.display = "none";
    selectWrapper.style.display = "block";
};

// Altere o nome da função para fazer sentido com corações
window.definirAfinidadeCoracao = function (elementoCoracao, nivelSelecionado) {
    const container = elementoCoracao.parentElement;
    if (!container) return;
    
    container.setAttribute("data-valor", nivelSelecionado);
    const coracoes = container.querySelectorAll(".coracao-rpg");
    
    coracoes.forEach((coracao, indice) => {
        if (indice < nivelSelecionado) {
            coracao.classList.add("active");
        } else {
            coracao.classList.remove("active");
        }
    });
};

window.removerRelacao = function (botaoRemover) {
    const item = botaoRemover.closest(".item-relacao-rpg");
    if (!item) return;

    item.style.opacity = "0";
    item.style.transform = "scale(0.9) translateY(-10px)";
    
    setTimeout(() => {
        item.remove();
    }, 200);
};

// Função de adicionar atualizada com Corações ♥
window.adicionarNovaRelacao = function () {
    const lista = document.getElementById("lista-relacoes");
    if (!lista) return;

    const novoItem = document.createElement("div");
    novoItem.className = "item-relacao-rpg"; 
    
    novoItem.innerHTML = `
        <input type="text" class="input-relacao-nome" placeholder="Nome do Aliado / NPC">
        
        <div class="container-coracoes-wrapper">
            <div class="coracoes-afinidade" data-valor="1">
                <span class="coracao-rpg active" onclick="definirAfinidadeCoracao(this, 1)">♥</span>
                <span class="coracao-rpg" onclick="definirAfinidadeCoracao(this, 2)">♥</span>
                <span class="coracao-rpg" onclick="definirAfinidadeCoracao(this, 3)">♥</span>
                <span class="coracao-rpg" onclick="definirAfinidadeCoracao(this, 4)">♥</span>
                <span class="coracao-rpg" onclick="definirAfinidadeCoracao(this, 5)">♥</span>
            </div>
        </div>
        
        <div class="container-select-relacao">
            <div class="select-wrapper-rpg">
                <select class="select-relacao-tipo" onchange="verificarOpcaoRelacao(this)">
                    <option value="" disabled selected>Escolha a relação...</option>
                    <option value="amigo">Amigo(a)</option>
                    <option value="rival">Rival</option>
                    <option value="aliado">Aliado(a)</option>
                    <option value="lider">Líder / Mentor</option>
                    <option value="esposa_marido">Esposa / Marido</option>
                    <option value="namorado">Namorado(a)</option>
                    <option value="pai_mae">Pai / Mãe</option>
                    <option value="filho_filha">Filho / Filha</option>
                    <option value="outro">Outro...</option>
                </select>
            </div>

            <div class="custom-input-wrapper" style="display: none;">
                <input type="text" class="input-relacao-personalizado" placeholder="Escreva a relação...">
                <button type="button" class="btn-cancelar-custom" onclick="cancelarOpcaoPersonalizada(this)" title="Voltar para opções prontas">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
            </div>
        </div>

        <button type="button" class="btn-remover-relacao" onclick="removerRelacao(this)" title="Excluir Relação">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    novoItem.style.opacity = "0";
    novoItem.style.transition = "all 0.2s ease-in-out";
    novoItem.style.transform = "translateY(10px)";
    
    lista.appendChild(novoItem);
    
    setTimeout(() => { 
        novoItem.style.opacity = "1"; 
        novoItem.style.transform = "translateY(0)";
        lista.scrollTop = lista.scrollHeight;
    }, 10);
};

// CAMPO HABILIDADES - PERFIL
// ==========================================================================
// CONTROLE DE ABAS E CARDS DE HABILIDADES EDITÁVEIS
// ==========================================================================

// Dados iniciais genéricos para quando a ficha for aberta pela primeira vez
const habilidadesPadrao = {
    especie: [
        { subtitulo: "Subtítulo", nome: "Nome da Habilidade", descricao: "Escreva aqui os detalhes e efeitos desta habilidade...", atual: 1, maximo: 1, tipoRecurso: "usos", custo: "" }
    ],
    classe: [
        { subtitulo: "Subtítulo", nome: "Nome da Habilidade", descricao: "Escreva aqui os detalhes e efeitos desta habilidade...", atual: 1, maximo: 1, tipoRecurso: "usos", custo: "" }
    ],
    outros: [
        { subtitulo: "Subtítulo", nome: "Nome da Habilidade", descricao: "Escreva aqui os detalhes e efeitos desta habilidade...", atual: 1, maximo: 1, tipoRecurso: "usos", custo: "" }
    ]
};

// Garante o carregamento inicial das habilidades na tela ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
    carregarHabilidades();
});

// Forçando as funções principais a entrarem no escopo global (window) do navegador
window.mudarAbaHabilidades = function(botao, categoria) {
    const containerAbas = botao.closest('.card-perfil-rpg');
    if (!containerAbas) return;
    
    containerAbas.querySelectorAll('.btn-aba-interna').forEach(btn => {
        btn.classList.remove('active');
    });
    botao.classList.add('active');

    document.querySelectorAll('.secao-habilidade-conteudo').forEach(secao => {
        secao.style.display = 'none';
        secao.classList.remove('active');
    });

    const secaoAlvo = document.getElementById(`hab-${categoria}`);
    if (secaoAlvo) {
        secaoAlvo.style.display = 'block';
        secaoAlvo.classList.add('active');
    }
};

window.adicionarNovoCardHabilidade = function(categoria) {
    let dadosSalvos = localStorage.getItem("rpg_habilidades_personagem");
    let dados = dadosSalvos ? JSON.parse(dadosSalvos) : JSON.parse(JSON.stringify(habilidadesPadrao));

    // Adiciona um card totalmente genérico e limpo
    dados[categoria].push({
        subtitulo: "Subtítulo",
        nome: "Nome da Habilidade",
        descricao: "Escreva aqui os detalhes e efeitos desta habilidade...",
        atual: 1,
        maximo: 1,
        tipoRecurso: "usos",
        custo: "1 PE"
    });

    localStorage.setItem("rpg_habilidades_personagem", JSON.stringify(dados));
    carregarHabilidades();
};

window.excluirHabilidade = function(categoria, index) {
    if (!confirm("Deseja mesmo apagar esta habilidade de sua ficha?")) return;
    
    let dadosSalvos = localStorage.getItem("rpg_habilidades_personagem");
    if (!dadosSalvos) return;
    
    let dados = JSON.parse(dadosSalvos);
    dados[categoria].splice(index, 1);
    
    localStorage.setItem("rpg_habilidades_personagem", JSON.stringify(dados));
    carregarHabilidades();
};

window.alterarTipoRecurso = function(selectElement, categoria, index) {
    let dadosSalvos = localStorage.getItem("rpg_habilidades_personagem");
    if (!dadosSalvos) return;

    let dados = JSON.parse(dadosSalvos);
    const novoTipo = selectElement.value;
    
    dados[categoria][index].tipoRecurso = novoTipo;

    if (novoTipo === 'usos') {
        dados[categoria][index].atual = 1;
        dados[categoria][index].maximo = 1;
    } else {
        dados[categoria][index].custo = novoTipo === 'pe' ? '1 PE' : '1 PS';
    }

    localStorage.setItem("rpg_habilidades_personagem", JSON.stringify(dados));
    carregarHabilidades();
};

window.alterarUsoLocal = function(botao, valor) {
    const card = botao.closest('.card-habilidade');
    const index = parseInt(card.dataset.index, 10);
    const categoria = card.dataset.categoria;

    let dadosSalvos = localStorage.getItem("rpg_habilidades_personagem");
    if (!dadosSalvos) return;

    let dados = JSON.parse(dadosSalvos);
    let atual = dados[categoria][index].atual || 0;
    const maximo = dados[categoria][index].maximo || 0;

    atual += valor;
    if (atual < 0) atual = 0;
    if (atual > maximo) atual = maximo;

    dados[categoria][index].atual = atual;
    localStorage.setItem("rpg_habilidades_personagem", JSON.stringify(dados));

    card.querySelector('.atual').textContent = atual;
};

window.atualizarMaximoLocal = function(input) {
    const card = input.closest('.card-habilidade');
    const index = parseInt(card.dataset.index, 10);
    const categoria = card.dataset.categoria;

    let dadosSalvos = localStorage.getItem("rpg_habilidades_personagem");
    if (!dadosSalvos) return;

    let dados = JSON.parse(dadosSalvos);
    let novoMax = parseInt(input.value, 10) || 1;
    if (novoMax < 1) novoMax = 1;

    dados[categoria][index].maximo = novoMax;
    
    if (dados[categoria][index].atual > novoMax) {
        dados[categoria][index].atual = novoMax;
        card.querySelector('.atual').textContent = novoMax;
    }

    localStorage.setItem("rpg_habilidades_personagem", JSON.stringify(dados));
};

window.salvarProgressoHabilidades = function() {
    let dados = { especie: [], classe: [], outros: [] };

    document.querySelectorAll('.card-habilidade-editavel').forEach(card => {
        const categoria = card.dataset.categoria;
        
        const subtitulo = card.querySelector('.input-hab-subtitulo').value;
        const nome = card.querySelector('.input-hab-nome').value;
        const descricao = card.querySelector('.textarea-hab-sobre').value;
        const tipoRecurso = card.querySelector('.select-tipo-recurso').value;

        let recursoDados = { subtitulo, nome, descricao, tipoRecurso, atual: 0, maximo: 0, custo: "" };

        if (tipoRecurso === 'usos') {
            recursoDados.atual = parseInt(card.querySelector('.atual').textContent, 10) || 0;
            recursoDados.maximo = parseInt(card.querySelector('.input-limite-maximo').value, 10) || 1;
        } else {
            recursoDados.custo = card.querySelector('.input-custo-badge').value;
        }

        dados[categoria].push(recursoDados);
    });

    localStorage.setItem("rpg_habilidades_personagem", JSON.stringify(dados));
};

// Carrega os dados salvos e os renderiza na tela
function carregarHabilidades() {
    let dadosSalvos = localStorage.getItem("rpg_habilidades_personagem");
    let dados = dadosSalvos ? JSON.parse(dadosSalvos) : habilidadesPadrao;

    renderizarAbaHabilidades('especie', dados.especie);
    renderizarAbaHabilidades('classe', dados.classe);
    renderizarAbaHabilidades('outros', dados.outros);
}

function renderizarAbaHabilidades(categoria, lista) {
    const container = document.getElementById(`lista-hab-${categoria}`);
    if (!container) return;
    container.innerHTML = "";

    lista.forEach((hab, index) => {
        const card = document.createElement("div");
        card.className = "card-habilidade card-habilidade-editavel";
        card.dataset.index = index;
        card.dataset.categoria = categoria;

        card.innerHTML = `
            <button type="button" class="btn-excluir-habilidade" title="Excluir habilidade" onclick="excluirHabilidade('${categoria}', ${index})">
                <i class="fa-solid fa-trash-can"></i>
            </button>
            <div class="cabecalho-habilidade">
                <input type="text" class="input-hab-subtitulo" value="${hab.subtitulo}" placeholder="SUBTÍTULO (EX: RITUAIS, MAGIAS)" oninput="salvarProgressoHabilidades()">
                <input type="text" class="input-hab-nome" value="${hab.nome}" placeholder="Nome da Habilidade" oninput="salvarProgressoHabilidades()">
            </div>
            <div class="descricao-habilidade">
                <textarea class="textarea-hab-sobre" placeholder="Escreva os detalhes e efeitos desta habilidade..." oninput="salvarProgressoHabilidades()">${hab.descricao}</textarea>
            </div>
            <div class="rodape-habilidade">
                <div class="recurso-habilidade">
                    <select class="select-tipo-recurso" onchange="alterarTipoRecurso(this, '${categoria}', ${index})">
                        <option value="usos" ${hab.tipoRecurso === 'usos' ? 'selected' : ''}>Contador de Usos</option>
                        <option value="pe" ${hab.tipoRecurso === 'pe' ? 'selected' : ''}>Custo de PE</option>
                        <option value="ps" ${hab.tipoRecurso === 'ps' ? 'selected' : ''}>Custo de PS</option>
                    </select>

                    <div class="container-valores-recurso">
                        ${gerarCamposRecursoHTML(hab)}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function gerarCamposRecursoHTML(hab) {
    if (hab.tipoRecurso === 'usos') {
        return `
            <div class="contador-usos">
                <button type="button" onclick="alterarUsoLocal(this, -1)">-</button>
                <span class="valor-uso">
                    <strong class="atual">${hab.atual}</strong>/<input type="number" class="input-limite-maximo" value="${hab.maximo}" min="1" onchange="atualizarMaximoLocal(this)"> Usos
                </span>
                <button type="button" onclick="alterarUsoLocal(this, 1)">+</button>
            </div>
        `;
    } else {
        const classeBadge = hab.tipoRecurso === 'pe' ? 'pe' : 'ps';
        return `
            <input type="text" class="input-custo-badge ${classeBadge}" value="${hab.custo}" placeholder="Ex: 6 ${hab.tipoRecurso.toUpperCase()}" oninput="salvarProgressoHabilidades()">
        `;
    }
}

// Objeto na memória para guardar os textos de cada aba
const textosAnotacoes = {
    historia: "",
    outros: ""
};

// Mapeamento de placeholders informativos para ajudar o jogador
const placeholdersAnotacoes = {
    historia: "Escreva o passado do seu personagem, origens, motivações ou observações do histórico aqui...",
    outros: "Use este espaço livre para anotar teorias sobre a história, segredos ou metas do seu personagem!"
};

// Variável para acompanhar qual aba está ativa no momento
let abaNotaAtiva = "historia";

window.mudarNotaInterna = function (botaoElemento, tipoAba) {
    const textarea = document.getElementById("texto_notas_perfil");
    if (!textarea) return;

    // 1. Salva o texto que está escrito atualmente antes de mudar
    textosAnotacoes[abaNotaAtiva] = textarea.value;

    // 2. Atualiza qual é a nova aba ativa
    abaNotaAtiva = tipoAba;

    // 3. Remove a classe active de todos os botões e adiciona no clicado
    const containerAbas = botaoElemento.parentElement;
    containerAbas.querySelectorAll(".btn-aba-interna").forEach(btn => {
        btn.classList.remove("active");
    });
    botaoElemento.classList.add("active");

    // 4. Aplica um efeito suave de "fade" no textarea ao carregar o novo conteúdo
    textarea.style.opacity = "0";
    textarea.style.transform = "translateY(5px)";
    
    setTimeout(() => {
        // Recupera o texto salvo da nova aba ativa
        textarea.value = textosAnotacoes[tipoAba];
        // Atualiza o placeholder conforme a aba
        textarea.placeholder = placeholdersAnotacoes[tipoAba];
        
        textarea.style.opacity = "1";
        textarea.style.transform = "translateY(0)";
    }, 120);
};

// Salva o progresso dinamicamente enquanto o jogador digita
document.addEventListener("DOMContentLoaded", () => {
    const textarea = document.getElementById("texto_notas_perfil");
    if (textarea) {
        textarea.addEventListener("input", () => {
            textosAnotacoes[abaNotaAtiva] = textarea.value;
        });
    }
});

    window.mudarFiltroAtributo = function (botaoClicado) {
        const containerBotoes = botaoClicado.parentElement;
        containerBotoes.querySelectorAll('.btn-filtro-rpg').forEach(btn => btn.classList.remove('active'));
        botaoClicado.classList.add('active');
        atributoFiltroAtual = botaoClicado.getAttribute('data-filtro');
        window.filtrarPericias();
    };

    window.filtrarPericias = function () {
        const inputBusca = document.getElementById('busca_pericias');
        const termo = inputBusca ? inputBusca.value.toLowerCase().trim() : "";
        const caixasCategorias = document.querySelectorAll('.caixa-categoria-nova');

        caixasCategorias.forEach(caixa => {
            const topoCat = caixa.querySelector('.topo-cat-pericia');
            let classeAtributo = "";
            if (topoCat) {
                if (topoCat.classList.contains('c-for')) classeAtributo = 'c-for';
                else if (topoCat.classList.contains('c-vig')) classeAtributo = 'c-vig';
                else if (topoCat.classList.contains('c-des')) classeAtributo = 'c-des';
                else if (topoCat.classList.contains('c-car')) classeAtributo = 'c-car';
                else if (topoCat.classList.contains('c-int')) classeAtributo = 'c-int';
            }
            const lines = caixa.querySelectorAll('.linha-pericia-nova');
            let temVisivel = false;
            const catBate = (atributoFiltroAtual === "todas" || atributoFiltroAtual === classeAtributo);

            lines.forEach(linha => {
                const nome = linha.querySelector('span').innerText.toLowerCase();
                const buscaBate = (termo === "" || nome.includes(termo));
                if (catBate && buscaBate) {
                    linha.style.display = "";
                    temVisivel = true;
                    if (termo !== "") linha.classList.add('pericia-destacada');
                    else linha.classList.remove('pericia-destacada');
                } else {
                    linha.style.display = "none";
                    linha.classList.remove('pericia-destacada');
                }
            });
            caixa.style.display = temVisivel ? "" : "none";
        });
    };

    window.autoMais = function (input) { formatarSinal(input); };
    window.autoDado = function (input) {
        let valor = input.value;
        if (valor === "") return;
        if (/^\d+$/.test(valor)) { input.value = valor + "d"; return; }
        let limpo = valor.replace(/[^0-9dD]/g, "").toLowerCase();
        let partes = limpo.split('d');
        if (partes.length > 2) limpo = partes[0] + "d" + partes.slice(1).join("");
        if (input.value !== limpo) input.value = limpo;
    };
    window.removerSinal = function (input) { if (input) input.value = input.value.replace("+", ""); };
    window.atualizarStatus = function (tipo) { calcularStatus(tipo); };
    window.atualizar = function (status) { calcularStatus(status); };
    window.toggleMenuTema = function (event) {
        event.stopPropagation();
        document.getElementById('menu-tema-dropdown').classList.toggle('ativo');
    };

    window.atualizarTemaFicha = function (novaCor) {
        document.documentElement.style.setProperty('--cor-tema', novaCor);
        if (radarChart && radarChart.data && radarChart.data.datasets[0]) {
            radarChart.data.datasets[0].borderColor = novaCor;
            radarChart.data.datasets[0].backgroundColor = novaCor + "4d";
            radarChart.update();
        }
        localStorage.setItem('temaFichaRPG', novaCor);
        dispararSalvarComDebounce();
    };

    // ==========================================================================
    // 1. EXECUÇÕES E VÍNCULOS DE INICIALIZAÇÃO INTERNA
    // ==========================================================================

    // Inicializa o gráfico de atributos
    if (typeof initChart === "function") {
        initChart();
    }

    // Recupera e aplica a cor do tema salva (usando sua chave original 'temaFichaRPG')
    const corSalva = localStorage.getItem('temaFichaRPG');
    if (corSalva) {
        if (typeof window.atualizarTemaFicha === "function") {
            window.atualizarTemaFicha(corSalva);
        }
        const inputCor = document.getElementById('seletor-cor');
        if (inputCor) {
            inputCor.value = corSalva;
        }
    }

    // Funções de atualização e cálculo iniciais
    if (typeof window.atualizarBarraCarga === "function") window.atualizarBarraCarga();
    if (typeof window.calcularPatrimonioTotal === "function") window.calcularPatrimonioTotal();

    // VÍNCULOS DOS ATRIBUTOS (Sem problemas de Hoisting)
    if (typeof vincularAtributoPericia === "function") {
        vincularAtributoPericia("base_for", "pericia-base-for");
        vincularAtributoPericia("base_vig", "pericia-base-vig");
        vincularAtributoPericia("base_des", "pericia-base-des");
        vincularAtributoPericia("base_car", "pericia-base-car");
        vincularAtributoPericia("base_int", "pericia-base-int");
    }

    // ==========================================================================
    // 2. COMPORTAMENTO DO DROPDOWN (PREVINE FECHAMENTO ACIDENTAL)
    // ==========================================================================

    // Evita que cliques dentro do painel de cores ou do botão fechem o menu
    const dropdownMenu = document.getElementById('menu-tema-dropdown');
    if (dropdownMenu) {
        dropdownMenu.addEventListener('click', (e) => e.stopPropagation());
    }

    // Gerencia a abertura e fechamento seguro do menu
    window.toggleMenuTema = function (event) {
        if (event) event.stopPropagation(); // Impede o clique de subir para o document
        const dropdown = document.getElementById('menu-tema-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('ativo');
        }
    };

    // Fecha o menu de temas ao clicar em qualquer lugar fora dele
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('menu-tema-dropdown');
        const botaoLapis = document.getElementById('btn-menu-tema');

        // Só fecha se o clique não foi no próprio menu e nem no botão do lápis
        if (dropdown && !dropdown.contains(e.target) && botaoLapis && !botaoLapis.contains(e.target)) {
            dropdown.classList.remove('ativo');
        }
    });

    // ==========================================================================
    // 3. SISTEMA SEGURO DE RESET DE FICHA (ZONA DE PERIGO)
    // ==========================================================================

    /**
     * Dispara os prompts de dupla confirmação antes de apagar os dados
     */
    window.confirmarResetFicha = function (event) {
        if (event) {
            event.stopPropagation(); // Evita fechar o menu antes de exibir os popups
        }

        const confirmacaoPrimeira = confirm("⚠️ ATENÇÃO:\n\nVocê deseja realmente limpar todos os dados desta ficha?");

        if (confirmacaoPrimeira) {
            const confirmacaoSegunda = confirm("⚠️ TEM CERTEZA ABSOLUTA?\n\nEsta ação apagará de forma irreversível todos os atributos, nomes, inventários e anotações do seu personagem.");

            if (confirmacaoSegunda) {
                // Fecha o dropdown imediatamente antes do reset para evitar gargalos visuais
                const dropdown = document.getElementById('menu-tema-dropdown');
                if (dropdown) {
                    dropdown.classList.remove('ativo');
                }

                // Executa a limpeza pesada
                resetarCamposFicha();
            }
        }
    };

    // VERSÃO INTEGRADA AO FIREBASE:
    // Limpa o banco de dados online, o cache local e reseta a tela de forma limpa.
     
    async function resetarCamposFicha() {
        // 1. Bloqueia o salvamento automático para não salvar campos vazios por engano
        window.onbeforeunload = null;
        window.onunload = null;
        window.autosaveBloqueado = true;
        window.isResetting = true;
        clearTimeout(timeoutSalvamento); // Cancela qualquer salvamento pendente do Debounce

        // 2. Apaga os dados do Firebase (Firestore)
        const usuario = auth.currentUser;
        if (usuario) {
            const uid = usuario.uid;
            const docRef = doc(db, "usuarios", uid);

            try {
                // Define no banco de dados o objeto "limpo" inicial (valores padrão)
                const dadosResetados = {
                    topo: {
                        nivel: "0",
                        nomeJogador: "",
                        persona: "",
                        especie: "",
                        classe: "",
                        foto: "" // Remove a foto Base64 do banco de dados
                    },
                    status: {
                        pv: { total: "0", dano: "0", dadoVal: "", bonusVal: "" },
                        ps: { total: "0", dano: "0", dadoVal: "", bonusVal: "" },
                        pe: { total: "0", dano: "0", dadoVal: "", bonusVal: "" }
                    },
                    testesMorte: { morte_1: false, morte_2: false, morte_3: false },
                    atributos: {
                        forca: "+0",
                        vigor: "+0",
                        destreza: "+0",
                        carisma: "+0",
                        intelecto: "+0",
                        sorte: "+0",
                        defesa: "10"
                    },
                    pericias: {
                        bonusGeral: "0",
                        dadosTreino: {} // Limpa todos os treinos de perícias
                    },
                    // Preservamos apenas a cor do tema que ele configurou para não estragar a estética
                    aparencia: {
                        corTema: document.getElementById("seletor-cor")?.value || "#ed1c24",
                        modoBrilho: "claro"
                    },
                    atualizadoEm: new Date().toISOString()
                };

                // Sobrescreve o documento no Firebase com os dados zerados de forma assíncrona
                await setDoc(docRef, dadosResetados);
                console.log("Banco de dados limpo com sucesso no Firebase!");

            } catch (error) {
                console.error("Erro ao limpar dados no Firestore:", error);
            }
        }

        // 3. Limpa completamente toda a memória local (Cache do navegador)
        localStorage.clear();
        sessionStorage.clear();
        imagemBase64Ficha = ""; // Zera a variável da imagem na memória do script

        // 4. Limpa fisicamente a imagem de visualização do avatar
        const previewImg = document.getElementById("preview_img");
        const placeholder = document.getElementById("placeholder_upload");
        const containerFoto = document.getElementById("container_foto");

        if (previewImg) {
            previewImg.src = "";
            previewImg.style.display = "none";
        }
        if (placeholder) placeholder.style.display = "block";
        if (containerFoto) containerFoto.style.borderStyle = "dashed"; // Volta a borda pontilhada original

        // 5. Exibe mensagem e força o recarregamento total da página de forma limpa
        alert("A ficha foi totalmente limpa e resetada com sucesso!");
        window.location.replace(window.location.href);
    }

    // Expondo a função de reset globalmente para o botão HTML conseguir acessar
    window.resetarCamposFicha = resetarCamposFicha;

    // ==========================================================================
    // 4. COMPORTAMENTO DO CAMPO DE BÔNUS GERAL DE PERÍCIAS
    // ==========================================================================
    const inputBonusGeral = document.getElementById('bonus_geral_pericias');
    if (inputBonusGeral) {
        let valorInicial = parseInt(inputBonusGeral.value.replace(/[^\d-]/g, ''));
        if (!isNaN(valorInicial) && valorInicial > 0) inputBonusGeral.value = "+" + valorInicial;

        inputBonusGeral.addEventListener('change', function () {
            let valor = parseInt(this.value.replace(/[^\d-]/g, ''));
            if (isNaN(valor)) { this.value = "0"; return; }
            this.value = (valor > 0) ? "+" + valor : valor;
        });
        inputBonusGeral.addEventListener('focus', function () { this.value = this.value.replace('+', '').trim(); });
        inputBonusGeral.addEventListener('blur', function () {
            let valor = parseInt(this.value.replace(/[^\d-]/g, ''));
            if (!isNaN(valor) && valor > 0) this.value = "+" + valor;
        });
    }

    // ==========================================================================
    // 5. MONITORAMENTO DE INPUTS DA TABELA DE TRÊS CAMPOS
    // ==========================================================================
    document.querySelectorAll('.inputs-tres').forEach(function (container) {
        const inputs = container.querySelectorAll('input');
        if (inputs.length >= 2) {
            const inputBuild = inputs[1];
            inputBuild.addEventListener("input", () => {
                // Uso seguro da função global que criamos anteriormente
                if (typeof window.calcularTotalLinhaGlobal === "function") {
                    window.calcularTotalLinhaGlobal(container);
                }
            });
            inputBuild.addEventListener("blur", () => {
                let valorPuro = parseInt(inputBuild.value.replace(/[^\d-]/g, ''));
                if (!isNaN(valorPuro) && valorPuro >= 0) inputBuild.value = "+" + valorPuro;
            });
            inputBuild.addEventListener("focus", () => {
                if (inputBuild.value.startsWith("+")) inputBuild.value = inputBuild.value.replace("+", "");
            });
        }
    });

    // ==========================================================================
    // 6. SISTEMA DE FECHAMENTO DOS MODAIS AO CLICAR FORA
    // ==========================================================================
    window.onclick = function (event) {
        const mEspecies = document.getElementById('modal_especies');
        const mDetalhes = document.getElementById('modal_detalhes');
        if (event.target == mEspecies && typeof window.fecharModal === "function") window.fecharModal();
        if (event.target == mDetalhes && typeof window.fecharDetalhes === "function") window.fecharDetalhes();
        if (event.target.classList && event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    };

    // ==========================================================================
    // 7. GATILHOS DE SALVAMENTO AUTOMÁTICO
    // ==========================================================================
    const camposParaSalvar = [
        'campo_lv', 'player_nome_input', 'especie_input', 'classe_input',
        'pv_total', 'pv_dano', 'ps_total', 'ps_dano', 'pe_total', 'pe_dano',
        'base_for', 'base_vig', 'base_des', 'base_car', 'base_int', 'sorte_input', 'defesa_input'
    ];

    camposParaSalvar.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('blur', () => {
                if (typeof window.atualizarTudo === "function") window.atualizarTudo();
                salvarDadosFicha();
            });
        }
    });

    const inputPersona = document.querySelector('.tabela-dados tr:nth-child(1) input');
    if (inputPersona) {
        inputPersona.addEventListener('blur', () => salvarDadosFicha());
    }

    for (let i = 1; i <= 3; i++) {
        const chk = document.getElementById(`morte_${i}`);
        if (chk) {
            chk.addEventListener('change', () => salvarDadosFicha());
        }
    }

    document.querySelectorAll('.inputs-tres').forEach(container => {
        const inputs = container.querySelectorAll('input');
        if (inputs.length >= 2) {
            inputs[1].addEventListener('blur', () => salvarDadosFicha());
        }
    });

    const inputB_Geral = document.getElementById('bonus_geral_pericias');
    if (inputB_Geral) {
        inputB_Geral.addEventListener('blur', () => salvarDadosFicha());
    }

    // === FECHAMENTO SEGURO DA FUNÇÃO inicializarFicha() ===
    // Esta chave fecha a função aberta lá na Parte 2/3!
}