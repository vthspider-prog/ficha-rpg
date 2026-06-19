let radarChart;
let especieTemporaria = ""; // Armazena a escolha antes de confirmar

function initChart() {
    // Verifica se a classe Chart existe no escopo global antes de tentar instanciar
    if (typeof Chart === "undefined") {
        console.error("Erro crítico: A biblioteca Chart.js não foi carregada no HTML. O gráfico não será iniciado.");
        return;
    }

    const ctx = document.getElementById('radarChart');
    if (!ctx) return;

    if (radarChart) {
        radarChart.destroy();
    }

    try {
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
                    r: {
                        min: 0,
                        max: 6,
                        ticks: { display: false, stepSize: 1 },
                        grid: { color: '#ddd' },
                        angleLines: { color: '#ddd' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Roda a primeira atualização de valores
        atualizarTudo();
    } catch (e) {
        console.error("Erro ao inicializar o Chart.js: ", e);
    }
}

// ==========================================================================
// SISTEMA DE COR DINÂMICA (ALTERAR TEMA DA FICHA)
// ==========================================================================
function atualizarTemaFicha(novaCor) {
    // 1. Altera a variável do CSS (muda a listra lateral e topo de perícias)
    document.documentElement.style.setProperty('--cor-tema', novaCor);
    
    // 2. Altera a cor do gráfico Radar se ele já estiver criado
    if (typeof radarChart !== "undefined" && radarChart && radarChart.data && radarChart.data.datasets[0]) {
        // Altera a linha do gráfico
        radarChart.data.datasets[0].borderColor = novaCor;
        
        // Altera o preenchimento de dentro do gráfico (adicionando opacidade de 30%)
        // O "4d" no final converte a cor para transparente (equivalente ao seu antigo rgba 0.3)
        radarChart.data.datasets[0].backgroundColor = novaCor + "4d"; 
        
        // Renderiza o gráfico com a cor nova na tela
        radarChart.update();
    }
    
    // 3. Salva a cor no navegador para o jogador não perder ao atualizar a página
    localStorage.setItem('temaFichaRPG', novaCor);
}

// 2. FUNÇÃO ÚNICA: Atualiza o Gráfico, Perícias e Status Secundários
function atualizarTudo() {
    try {
        const ids = ['base_for', 'base_vig', 'base_des', 'base_car', 'base_int'];

        // Mapeia os valores prevenindo erros de IDs ausentes
        const vals = ids.map(id => {
            const input = document.getElementById(id);
            if (!input || !input.value) return 0;
            let texto = input.value.replace('+', '').trim();
            let numero = parseInt(texto);
            return isNaN(numero) ? 0 : numero;
        });

        // Atualiza o gráfico radar se ele estiver pronto
        if (radarChart && radarChart.data && radarChart.data.datasets[0]) {
            radarChart.data.datasets[0].data = vals;
            radarChart.update();
        }

        // Atualiza os modificadores de perícia [+x]
        const modIds = ['p_for', 'p_vig', 'p_des', 'p_car', 'p_int'];
        modIds.forEach((id, index) => {
            const el = document.getElementById(id);
            if (el) {
                el.innerText = `[+${vals[index] + 2}]`;
            }
        });

        // Executa os cálculos secundários (Defesa / Domínio)
        atualizarStatusSecundariosSeguro(vals);
    } catch (error) {
        console.error("Erro na função atualizarTudo():", error);
    }
}

// 3. Atualização de Defesa e Domínio (Tratando Inputs e Tags de texto)
function atualizarStatusSecundariosSeguro(valoresAtributos) {
    try {
        const campoDefesa = document.getElementById('defesa_input');
        
        if (campoDefesa) {
            // Se o campo estiver completamente vazio (primeiro carregamento), define o padrão 10
            if (campoDefesa.value.trim() === "") {
                campoDefesa.value = 10;
            }
            
            // Aqui você pode somar bônus automáticos vindos de 'valoresAtributos' se quiser,
            // mas como ele é totalmente editável, o usuário pode alterar o valor direto na ficha.
        }
    
    } catch (e) {
        console.error("Erro ao atualizar status secundários:", e);
    }
}

// 4. Validação rápida ao digitar (Sem loops de evento)
function validarRapido(input) {
    if (!input) return;
    let valor = input.value.replace(/[^\d-]/g, '');

    if (valor === "" || valor === "-") return;

    let n = parseInt(valor);
    if (isNaN(n)) n = 0;
    if (n > 6) n = 6;
    if (n < -1) n = -1;

    input.value = (n > 0) ? "+" + n : n;

    atualizarTudo();
}

// 5. Sistema de Upload de Foto
function carregarFoto(event) {
    const reader = new FileReader();
    const file = event.target.files[0];

    if (file) {
        reader.onload = () => {
            const img = document.getElementById('preview_img');
            const placeholder = document.getElementById('placeholder_upload');
            const container = document.getElementById('container_foto');

            if (img) {
                img.src = reader.result;
                img.style.display = 'block';
                img.style.opacity = 0;
                setTimeout(() => {
                    img.style.opacity = 1;
                    img.style.transition = "opacity 0.5s ease";
                }, 10);
            }
            if (placeholder) placeholder.style.display = 'none';
            if (container) container.classList.add('foto-postada');
        };
        reader.readAsDataURL(file);
    }
}

// 6. Modais de Espécies
function abrirModal() {
    const modal = document.getElementById('modal_especies');
    if (modal) modal.style.display = 'block';
    document.body.classList.add('modal-aberto');
}

function fecharModal() {
    const modal = document.getElementById('modal_especies');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-aberto');
}

function fecharDetalhes() {
    const modal = document.getElementById('modal_detalhes');
    if (modal) modal.style.display = 'none';
}

// Fecha modais ao clicar fora
window.onclick = function (event) {
    const modalEspecies = document.getElementById('modal_especies');
    const modalDetalhes = document.getElementById('modal_detalhes');
    if (event.target == modalEspecies) fecharModal();
    if (event.target == modalDetalhes) fecharDetalhes();
    if (event.target.classList && event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// Substitua o objeto dadosEspecies por esta versão sem links externos nocivos:
const dadosEspecies = {
    "Humanos": { attr: "NUL", resumo: "A raça mais versátil e ambiciosa.", bonus: "Seu status de Nulo aumenta em +1", desc: "Variam imensamente.", idade: "Maturidade aos 18, vivem até os 90 anos.", tamanho: "Médio", img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' fill='%23eee'/></svg>" },
    "Dragões": { attr: "FOR", resumo: "Seres de linhagem ancestral.", bonus: "Seu status de Força aumenta em +1", desc: "Escamas resistentes.", idade: "Podem viver milênios.", tamanho: "Grande", img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' fill='%23eee'/></svg>" },
    "Feras": { attr: "FOR", resumo: "Híbridos com instintos aguçados.", bonus: "Seu status de Força aumenta em +1", desc: "Humanoides com aspectos animais.", idade: "Maturidade aos 18 anos.", tamanho: "Médio", img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' fill='%23eee'/></svg>" },
    "Mutante": { attr: "FOR", resumo: "Seres mutados com poderes únicos.", bonus: "Seu status de Constituição aumenta em +1", desc: "Traços anormais.", idade: "Maturidade aos 16 anos.", tamanho: "Médio", img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'><rect width='150' height='150' fill='%23eee'/></svg>" },
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

// 8. Seleção de Espécies
function selecionarEspecie(nome) {
    const info = dadosEspecies[nome];
    if (!info) return;

    especieTemporaria = nome;

    const dNome = document.getElementById('detalhe_nome');
    const dTag = document.getElementById('detalhe_tag');
    const dRes = document.getElementById('detalhe_resumo_curto');
    const dBon = document.getElementById('detalhe_bonus');
    const dDesc = document.getElementById('detalhe_desc');
    const dIda = document.getElementById('detalhe_idade');
    const dTam = document.getElementById('detalhe_tamanho');
    const dImg = document.getElementById('detalhe_img');

    if (dNome) dNome.innerText = nome;
    if (dRes) dRes.innerText = info.resumo;
    if (dBon) dBon.innerText = info.bonus;
    if (dDesc) dDesc.innerText = info.desc;
    if (dIda) dIda.innerText = info.idade;
    if (dTam) dTam.innerText = info.tamanho;
    if (dImg) dImg.src = info.img;

    if (dTag) {
        dTag.innerText = info.attr;
        dTag.className = `tag-attr ${info.attr.toLowerCase()}`;
    }

    const mDetalhes = document.getElementById('modal_detalhes');
    if (mDetalhes) mDetalhes.style.display = 'block';
    document.body.classList.add('modal-aberto');
}

function confirmarEscolha() {
    if (especieTemporaria) {
        const inputEspecie = document.getElementById('especie_input');
        if (inputEspecie) {
            inputEspecie.value = especieTemporaria;
            inputEspecie.classList.add('tem-conteudo');
        }
        fecharDetalhes();
        fecharModal();
        atualizarTudo();
    }
}

function limparEspecie() {
    const inputEspecie = document.getElementById('especie_input');
    if (inputEspecie) {
        inputEspecie.value = "";
        inputEspecie.classList.remove('tem-conteudo');
    }
    atualizarTudo();
}

// 9. Status de Vida, Sanidade e Energia (PV, PS, PE)
function calcularStatus(tipo) {
    const totalEl = document.getElementById(`${tipo}_total`);
    const danoEl = document.getElementById(`${tipo}_dano`);
    const atualEl = document.getElementById(`${tipo}_atual`);
    const barraEl = document.getElementById(`barra_${tipo}`);

    const total = totalEl ? (parseFloat(totalEl.value) || 0) : 0;
    const dano = danoEl ? (parseFloat(danoEl.value) || 0) : 0;

    let atual = total - dano;
    if (atual < 0) atual = 0;

    if (atualEl) atualEl.value = atual;

    const porcentagem = total > 0 ? (atual / total) * 100 : 0;
    if (barraEl) barraEl.style.width = porcentagem + "%";
}

function formatarSinal(input) {
    let valor = input.value.replace(/[^\d-]/g, "");

    if (valor === "") {
        input.value = "";
        return;
    }

    if (valor.startsWith("-")) {
        let numeros = valor.replace(/-/g, "");
        input.value = numeros === "" ? "-" : "-" + parseInt(numeros);
    } else {
        let numeroPuro = parseInt(valor);
        input.value = isNaN(numeroPuro) ? "" : "+" + numeroPuro;
    }
}

// 2. AUTOMAÇÃO DOS SINAIS DE BÔNUS (5 -> +5)
function autoMais(input) {
    let valor = input.value.replace(/[^\d-]/g, "");

    if (valor === "") {
        input.value = "";
        return;
    }

    if (valor.startsWith("-")) {
        let numeros = valor.replace(/-/g, "");
        input.value = numeros === "" ? "-" : "-" + parseInt(numeros);
    } else {
        let numeroPuro = parseInt(valor);
        input.value = isNaN(numeroPuro) ? "" : "+" + numeroPuro;
    }
}
/*função pra adicionar o d automatico*/

// 1. AUTOMAÇÃO DOS DADOS (1 -> 1d -> 1d10)
function autoDado(input) {
    let valor = input.value;

    // Se apagar tudo, deixa limpo para o placeholder aparecer
    if (valor === "") return;

    // Se digitou apenas números (ex: "1" ou "2"), adiciona o "d" automaticamente
    if (/^\d+$/.test(valor)) {
        input.value = valor + "d";
        return;
    }

    // Limpeza de segurança: aceita apenas números e a letra "d" (minúscula)
    let limpo = valor.replace(/[^0-9dD]/g, "").toLowerCase();

    // Evita múltiplos "d" seguidos por erro de digitação (ex: 1dd10 vira 1d10)
    let partes = limpo.split('d');
    if (partes.length > 2) {
        limpo = partes[0] + "d" + partes.slice(1).join("");
    }

    // Só atualiza o campo se o texto mudou (evita perder a posição do cursor)
    if (input.value !== limpo) {
        input.value = limpo;
    }
}

// Apelidos de funções legadas para manter compatibilidade com o seu HTML antigo
function atualizarStatus(tipo) { calcularStatus(tipo); }
function atualizar(status) { calcularStatus(status); }

function removerSinal(input) {
    if (input) input.value = input.value.replace("+", "");
}

// 10. Modais de Classes e Abas
function abrirModalExclusivo(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = "block";
}

function fecharModalClasse(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) modal.style.display = "none";
}

function trocarAbaClasse(evt, abaId) {
    // Esconde todos os conteúdos de classes
    const conteudos = document.getElementsByClassName("conteudo-classe");
    for (let i = 0; i < conteudos.length; i++) {
        conteudos[i].classList.remove("active");
    }

    // Remove active de todos os botões de classe
    const botoes = document.getElementsByClassName("tab-btn-classe");
    for (let i = 0; i < botoes.length; i++) {
        botoes[i].classList.remove("active");
    }

    // Ativa a aba clicada
    document.getElementById(abaId).classList.add("active");
    evt.currentTarget.classList.add("active");
}

function finalizarEscolha(nome) {
    // Preenche o input na ficha principal
    // Use o ID correto do seu input de classe
    document.getElementById("input-classe").value = nome;
    fecharModal('modalClasse');
}

function mostrarDetalhesClasse(idDetalhe) {
    const grids = document.getElementsByClassName("grid-classes");
    for (let i = 0; i < grids.length; i++) {
        grids[i].style.display = "none";
    }
    const detalhes = document.getElementsByClassName("detalhe-classe");
    for (let i = 0; i < detalhes.length; i++) {
        detalhes[i].style.display = "none";
    }
    const targetDet = document.getElementById(idDetalhe);
    if (targetDet) targetDet.style.display = "block";
}

function fecharDetalhesClasse() {
    const detalhes = document.getElementsByClassName("detalhe-classe");
    for (let i = 0; i < detalhes.length; i++) {
        detalhes[i].style.display = "none";
    }
    const grids = document.getElementsByClassName("grid-classes");
    for (let i = 0; i < grids.length; i++) {
        grids[i].style.display = "grid";
    }
}

// Substitua o bloco de inicialização do final do arquivo por este:
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        initChart();
        // Carrega a cor salva se ela existir
        const corSalva = localStorage.getItem('temaFichaRPG');
        if (corSalva) {
            atualizarTemaFicha(corSalva);
            const inputCor = document.getElementById('seletor-cor');
            if (inputCor) inputCor.value = corSalva;
        }
    });
} else {
    initChart();
    const corSalva = localStorage.getItem('temaFichaRPG');
    if (corSalva) {
        atualizarTemaFicha(corSalva);
        const inputCor = document.getElementById('seletor-cor');
        if (inputCor) inputCor.value = corSalva;
    }
}

/*teste classe detelahes*/

let classeSelecionadaTemporaria = "";

// Banco de Dados contendo os textos de cada classe da sua aba FOR
const dadosDasClasses = {
    "Bárbaro": {
        tag: "VIG",
        proficiencias: "Armas: Simples, Marciais e de Impacto.<br>Armaduras: Leves, Médias e Escudos.",
        habNome: "Fúria Incontrolável",
        habDesc: "Você pode entrar em fúria como uma ação bônus. Recebe +2 em testes de Força e resistência a danos físicos por 1 minuto."
    },
    "Ceifador": {
        tag: "DES",
        proficiencias: "Armas: Cortantes, Pesadas e de Duas Mãos.<br>Armaduras: Médias.",
        habNome: "Golpe Executor",
        habDesc: "Seu ataque causa dano crítico massivo contra alvos que estejam debilitados ou com menos da metade da vida total."
    },
    "Performático": {
        tag: "CAR",
        proficiencias: "Armas: Ágeis, Floretes e de Arremesso.<br>Armaduras: Leves.",
        habNome: "Distração Teatral",
        habDesc: "Sua movimentação exótica confunde os oponentes, concedendo vantagem em testes de esquiva ou enganação durante o combate."
    },
    "Exorcista": {
        tag: "INT",
        proficiencias: "Armas: Simples, Cetros e Itens Sagrados.<br>Armaduras: Leves e Médias.",
        habNome: "Purificação de Aura",
        habDesc: "Consegue conjurar uma barreira mística que repele danos sobrenaturais ou detecta a presença de entidades corrompidas."
    },
    /* ABAS DE VIGOR (VIG) */
    "Sentinela": {
        tag: "FOR",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    "Monge": {
        tag: "DES",
        proficiencias: "???",
        habNome: "Fluxo de Ki",
        habDesc: "???"
    },
    "Paladino": {
        tag: "CAR",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    "Socorrista": {
        tag: "INT",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    /* ABAS DE DESTREZA (DES) */
    "Assassino": {
        tag: "FOR",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    "Caçador": {
        tag: "VIG",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    "Gatuno": {
        tag: "CAR",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    "Hacker": {
        tag: "INT",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    /* ABAS DE CARISMA (CAR) */
    "Cozinheiro": {
        tag: "FOR",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    "Maestro": {
        tag: "VIG",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    "Alfaiate": {
        tag: "DES",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    "Ocultista": {
        tag: "INT",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    /* ABAS DE INTELECTO (INT) */
    "Mecânico": {
        tag: "FOR",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    "Alquimista": {
        tag: "VIG",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    "Investigador": {
        tag: "DES",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    },
    "Arcanista": {
        tag: "CAR",
        proficiencias: "???",
        habNome: "???",
        habDesc: "???"
    }
};

// 1. Função chamada ao clicar em um card da sua tela atual
function selecionarClasse(nomeClasse) {
    const info = dadosDasClasses[nomeClasse];
    if (!info) return;

    classeSelecionadaTemporaria = nomeClasse;

    // 1. Atualiza os textos
    document.getElementById('detalhe_classe_nome').innerText = nomeClasse.toUpperCase();

    const badge = document.getElementById('detalhe_classe_tag');
    if (badge) {
        badge.innerText = info.tag;
        // Limpa classes de cores antigas e adiciona a nova com base no atributo
        badge.className = "badge-status-classe " + info.tag.toLowerCase();
    }

    document.getElementById('detalhe_classe_proficiencias').innerHTML = info.proficiencias;
    document.getElementById('detalhe_classe_hab_nome').innerText = info.habNome;
    document.getElementById('detalhe_classe_hab_desc').innerText = info.habDesc;

    // 2. Alterna os modais
    fecharModalClasse('modalClasse');
    document.getElementById('modal_detalhes_classe').style.display = 'block';
}

// 2. Botão VOLTAR: Fecha a tela de detalhes e reabre a lista original
function voltarParaListaClasses() {
    document.getElementById('modal_detalhes_classe').style.display = 'none';
    abrirModalExclusivo('modalClasse'); // Reabre o modal da imagem que você enviou
}

function confirmarEscolhaClasseFinal() {
    if (classeSelecionadaTemporaria) {
        // CORREÇÃO: Mudado de 'input-classe' para 'classe_input' para bater com seu HTML
        const inputClasse = document.getElementById('classe_input'); 
        if (inputClasse) {
            inputClasse.value = classeSelecionadaTemporaria;
        }

        // Mostra o botão "✕" de limpar
        const btnLimpar = document.getElementById('btn_limpar_classe');
        if (btnLimpar) {
            btnLimpar.style.display = 'inline-block';
        }

        // Fecha o modal de detalhes
        const modalDetalhes = document.getElementById('modal_detalhes_classe');
        if (modalDetalhes) {
            modalDetalhes.style.display = 'none';
        }

        // Atualiza a ficha e o gráfico
        if (typeof atualizarTudo === "function") {
            atualizarTudo();
        }
    }
}

/*LIMPAR CLASSE */

// Substitua essas duas funções no seu arquivo script.js para casar com o seu HTML de tabela:

function limparClasse() {
    const inputClasse = document.getElementById('classe_input');
    if (inputClasse) {
        inputClasse.value = "";
    }

    const btnLimpar = document.getElementById('btn_limpar_classe');
    if (btnLimpar) {
        btnLimpar.style.display = 'none'; // Esconde o X depois de limpar
    }

    if (typeof atualizarTudo === "function") atualizarTudo();
}


function atualizarTesteMorte() {
    const m1 = document.getElementById('morte_1').checked;
    const m2 = document.getElementById('morte_2').checked;
    const m3 = document.getElementById('morte_3').checked;

    if (m1 && m2 && m3) {
        // Alerta opcional para dinâmicas do jogo
        console.log("O personagem acumulou 3 falhas no Teste de Morte.");
    }
}


/* PERICIAS */

document.addEventListener("DOMContentLoaded", function () {
    
    // 1. FUNÇÃO PARA CALCULAR OS TOTAIS EM TEMPO REAL
    function calcularTotalLinha(inputsTresContainer) {
        const inputs = inputsTresContainer.querySelectorAll('input');
        if (inputs.length >= 3) {
            const inputBase = inputs[0];  // Base
            const inputBuild = inputs[1]; // Build
            const inputTotal = inputs[2]; // Total

            // Remove tudo o que não for número ou sinal de menos para não quebrar o cálculo
            let valorBase = parseInt(inputBase.value.replace(/[^\d-]/g, '')) || 0;
            let valorBuild = parseInt(inputBuild.value.replace(/[^\d-]/g, '')) || 0;

            // Soma e joga no campo Total
            inputTotal.value = valorBase + valorBuild;
        }
    }

    // 2. FUNÇÃO PARA VINCULAR O ATRIBUTO PRINCIPAL À BASE
    function vincularAtributoPericia(idAtributo, classePericias) {
        const inputAtributo = document.getElementById(idAtributo);
        const inputsBasePericias = document.querySelectorAll('.' + classePericias);
        
        if (inputAtributo) {
            // Toda vez que o atributo mudar, atualiza as bases ligadas a ele
            inputAtributo.addEventListener("input", function () {
                let valor = inputAtributo.value;
                let valorLimpo = valor.replace(/[^\d-]/g, '') || "0";

                inputsBasePericias.forEach(function (inputBase) {
                    inputBase.value = valorLimpo;
                    
                    // Como a base mudou, força o recálculo do Total daquela linha
                    const container = inputBase.closest('.inputs-tres');
                    calcularTotalLinha(container);
                });
            });
        }
    }

    // 3. MONITORAR, SOMAR E FORMATAR O CAMPO "BUILD" (COM O SINAL DE "+")
    document.querySelectorAll('.inputs-tres').forEach(function (container) {
        const inputs = container.querySelectorAll('input');
        if (inputs.length >= 2) {
            const inputBuild = inputs[1]; // O campo do meio (Build)

            // Enquanto o jogador digita, o Total atualiza instantaneamente
            inputBuild.addEventListener("input", function () {
                calcularTotalLinha(container);
            });

            // Quando o jogador clica fora do campo (blur): Formata colocando o "+"
            inputBuild.addEventListener("blur", function () {
                let valorPuro = parseInt(inputBuild.value.replace(/[^\d-]/g, ''));
                
                if (!isNaN(valorPuro) && valorPuro > 0) {
                    inputBuild.value = "+" + valorPuro; // Ex: vira +2
                } else if (!isNaN(valorPuro) && valorPuro === 0) {
                    inputBuild.value = "+0";
                }
            });

            // Quando o jogador clica para editar (focus): Remove temporariamente o "+" para facilitar a digitação
            inputBuild.addEventListener("focus", function () {
                if (inputBuild.value.startsWith("+")) {
                    inputBuild.value = inputBuild.value.replace("+", "");
                }
            });
        }
    });

    // 4. ATIVAR OS VÍNCULOS DOS ATRIBUTOS COM AS SUAS RESPECTIVAS BASES
    vincularAtributoPericia("base_for", "pericia-base-for"); // Força
    vincularAtributoPericia("base_vig", "pericia-base-vig"); // Vigor
    vincularAtributoPericia("base_des", "pericia-base-des"); // Destreza
    vincularAtributoPericia("base_car", "pericia-base-car"); // Carisma
    vincularAtributoPericia("base_int", "pericia-base-int"); // Intelecto

});

// Abre e fecha o menu dropdown ao clicar no lápis
function toggleMenuTema(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('menu-tema-dropdown');
    dropdown.classList.toggle('ativo');
}

// Fecha o menu se o jogador clicar em qualquer outro lugar da tela
document.addEventListener('click', () => {
    const dropdown = document.getElementById('menu-tema-dropdown');
    if (dropdown) dropdown.classList.remove('ativo');
});

// Evita fechar o menu se clicar dentro dele
const dropdownMenu = document.getElementById('menu-tema-dropdown');
if (dropdownMenu) {
    dropdownMenu.addEventListener('click', (e) => e.stopPropagation());
}

// Função para mudar entre modo Claro e Escuro
function mudarModoBrilho(modo) {
    if (modo === 'escuro') {
        // Altera o fundo da folha para escuro e os textos para branco
        document.documentElement.style.setProperty('--fundo-folha', '#3f3f3f');
        document.documentElement.style.setProperty('--texto-padrao', '#ffffff');
        // Se quiser mudar o fundo de fora da ficha também:
        document.body.style.backgroundColor = '#2c2c2c'; 
    } else {
        // Modo Escuro invertido (Folha branca tradicional)
        document.documentElement.style.setProperty('--fundo-folha', '#ffffff');
        document.documentElement.style.setProperty('--texto-padrao', '#000000');
        document.body.style.backgroundColor = '#1a191f';
    }
    localStorage.setItem('modoBrilhoFicha', modo);
}

// Carregar as configurações salvas assim que a página abrir
document.addEventListener("DOMContentLoaded", () => {
    const modoSalvo = localStorage.getItem('modoBrilhoFicha');
    if (modoSalvo) {
        mudarModoBrilho(modoSalvo);
    }
});


/**
 * Alterna dinamicamente entre as sub-abas principais do Perfil (Personagem, Diário, Inventário)
 */
function alternarSubAba(botao, idSubAba) {
    // 1. Remove o estado ativo de todos os botões do menu superior de sub-abas
    const containerMenu = botao.closest('.menu-sub-abas-rpg');
    if (containerMenu) {
        containerMenu.querySelectorAll('.btn-sub-aba').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // 2. Ativa o botão que foi clicado
    botao.classList.add('active');
    
    // 3. Esconde todos os blocos de conteúdo das sub-abas do perfil
    document.querySelectorAll('.bloco-sub-aba-conteudo').forEach(bloco => {
        bloco.classList.remove('active');
    });
    
    // 4. Mostra apenas o bloco correspondente ao ID clicado
    const blocoAlvo = document.getElementById(idSubAba);
    if (blocoAlvo) {
        blocoAlvo.classList.add('active');
    }
}

/**
 * Controla os sub-botões internos do Diário de Campanha alterando o placeholder do único textarea
 */
function mudarNotaInterna(botao, tipoNota) {
    // 1. Limpa o active dos botões internos do diário
    const containerBotoes = botao.closest('.abas-anotacoes-botoes');
    if (containerBotoes) {
        containerBotoes.querySelectorAll('.aba-nota').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // 2. Ativa o botão clicado
    botao.classList.add('active');
    
    // 3. Modifica o placeholder do textarea conforme a nota selecionada
    const textarea = document.getElementById('texto_notas_perfil');
    if (textarea) {
        if (tipoNota === 'historia') {
            textarea.placeholder = "Escreva o passado e as origens do seu personagem aqui...";
        } else if (tipoNota === 'objetivos') {
            textarea.placeholder = "Metas atuais: Missões em andamento, ambições e desejos...";
        } else if (tipoNota === 'geral') {
            textarea.placeholder = "Rumores, pistas, nomes de locais importantes e anotações soltas...";
        }
    }
}

/**
 * NOVO: Atualiza visualmente a barra de progresso e a cor do peso carregado
 */
function atualizarBarraCarga() {
    const inputCarga = document.getElementById('input_carga_num');
    const barraVisual = document.getElementById('barra_peso_visual');
    const textoCarga = document.getElementById('peso_atual_texto');
    
    if (!inputCarga || !barraVisual || !textoCarga) return;

    let pesoAtual = parseFloat(inputCarga.value) || 0;
    const limiteMaximo = 20;

    // Impede pesos menores que zero
    if (pesoAtual < 0) {
        pesoAtual = 0;
        inputCarga.value = 0;
    }

    // Calcula a porcentagem de preenchimento da barra
    let porcentagem = (pesoAtual / limiteMaximo) * 100;
    if (porcentagem > 100) porcentagem = 100; 

    barraVisual.style.width = porcentagem + "%";
    textoCarga.innerText = pesoAtual.toFixed(1) + " / " + limiteMaximo + " KG";

    // Mudança dinâmica de cor com base no limite
    if (pesoAtual > limiteMaximo) {
        barraVisual.style.backgroundColor = "#e53e3e"; // Vermelho se ultrapassar o limite
    } else if (pesoAtual > limiteMaximo * 0.8) {
        barraVisual.style.backgroundColor = "#dd6b20"; // Laranja para aviso de sobrecarga (80%+)
    } else {
        barraVisual.style.backgroundColor = "var(--cor-tema, #9127b3)"; // Roxo padrão da ficha
    }
}

/**
 * NOVO: Ajuste rápido via botões de + e - na seção de carga
 */
function ajustarPesoRapido(valor) {
    const inputCarga = document.getElementById('input_carga_num');
    if (!inputCarga) return;

    let valorAtual = parseFloat(inputCarga.value) || 0;
    inputCarga.value = Math.max(0, valorAtual + valor);
    
    atualizarBarraCarga();
}

/**
 * Calcula o patrimônio total dinamicamente com base no sistema decimal ($1, $10, $100, $1000)
 */
function calcularPatrimonioTotal() {
    const inputsMoedas = document.querySelectorAll('.input-moeda-nova');
    if (inputsMoedas.length < 4) return; // Agora espera os 4 inputs do novo HTML
    
    // Captura os valores na ordem exata de exibição do HTML
    const platina = parseFloat(inputsMoedas[0].value) || 0;
    const ouro    = parseFloat(inputsMoedas[1].value) || 0;
    const prata   = parseFloat(inputsMoedas[2].value) || 0;
    const bronze  = parseFloat(inputsMoedas[3].value) || 0;
    
    // Aplica a multiplicação direta do seu sistema de RPG
    const totalSoma = (platina * 1000) + (ouro * 100) + (prata * 10) + (bronze * 1);
    
    // Atualiza o visor principal formatando como número inteiro com o caractere "$" na frente
    const painelTotal = document.getElementById('total_carteira');
    if (painelTotal) {
        painelTotal.innerText = "$" + totalSoma.toLocaleString('pt-BR');
    }
}

/**
 * Ativa os corações até o nível selecionado e atualiza visualmente (Estilo Stardew Valley)
 */
function definirAfinidadeCoracao(elementoCoracao, nivelSelecionado) {
    const container = elementoCoracao.parentElement;
    if (!container) return;

    // Salva o valor escolhido no atributo do container
    container.setAttribute("data-valor", nivelSelecionado);

    // Pega todos os corações dentro deste bloco específico
    const coracoes = container.querySelectorAll(".coracao-rpg");

    coracoes.forEach((coracao, indice) => {
        if (indice < nivelSelecionado) {
            coracao.classList.add("active");
        } else {
            coracao.classList.remove("active");
        }
    });
}

/**
 * Adiciona dinamicamente uma nova linha de NPC com o sistema de 5 corações clicáveis
 */
function adicionarNovaRelacao() {
    const lista = document.getElementById("lista-relacoes");
    if (!lista) return;

    const novoItem = document.createElement("div");
    novoItem.className = "item-relacao";

    novoItem.innerHTML = `
        <input type="text" class="nome-npc" placeholder="Nome do Aliado / NPC">
        <div class="container-coracoes" data-valor="0">
            <span class="coracao-rpg" onclick="definirAfinidadeCoracao(this, 1)">♥</span>
            <span class="coracao-rpg" onclick="definirAfinidadeCoracao(this, 2)">♥</span>
            <span class="coracao-rpg" onclick="definirAfinidadeCoracao(this, 3)">♥</span>
            <span class="coracao-rpg" onclick="definirAfinidadeCoracao(this, 4)">♥</span>
            <span class="coracao-rpg" onclick="definirAfinidadeCoracao(this, 5)">♥</span>
        </div>
    `;

    novoItem.style.opacity = "0";
    novoItem.style.transition = "opacity 0.2s ease-in-out";
    
    lista.appendChild(novoItem);

    setTimeout(() => {
        novoItem.style.opacity = "1";
    }, 10);
}

// Inicializador executado assim que a página carrega completamente
document.addEventListener("DOMContentLoaded", () => {
    // Renderiza e acende os corações das relações já salvas/fixadas no HTML
    const containersExistentes = document.querySelectorAll(".container-coracoes");
    containersExistentes.forEach(container => {
        const valorInicial = parseInt(container.getAttribute("data-valor")) || 0;
        const primeiroCoracao = container.querySelector(".coracao-rpg");
        if (primeiroCoracao && valorInicial > 0) {
            definirAfinidadeCoracao(primeiroCoracao, valorInicial);
        }
    });
    
    // Roda os cálculos e renderizações visuais do novo inventário
    atualizarBarraCarga();
    calcularPatrimonioTotal();
});
