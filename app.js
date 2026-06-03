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
        const destreza = valoresAtributos[2] || 0;
        const defesaTotal = 0 + destreza;
        const dominioTotal = 0;

        const campoDefesa = document.getElementById('valor_defesa');
        const campoDominio = document.getElementById('valor_dominio');

        if (campoDefesa) {
            if (campoDefesa.tagName === "INPUT") {
                campoDefesa.value = defesaTotal;
            } else {
                campoDefesa.innerText = defesaTotal;
            }
        }

        if (campoDominio) {
            const sinal = dominioTotal >= 0 ? "+" : "";
            if (campoDominio.tagName === "INPUT") {
                campoDominio.value = sinal + dominioTotal;
            } else {
                campoDominio.innerText = sinal + dominioTotal;
            }
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
function confirmarEscolha(){
    if (especieTemporaria){
        const input
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
    // 1. Pega o valor atual e remove tudo o que não for número ou sinal de menos
    let valor = input.value.replace(/[^\d-]/g, "");

    // 2. Se o campo ficar vazio, limpa e deixa o placeholder agir
    if (valor === "") {
        input.value = "";
        return;
    }

    // 3. Se for um número negativo (começa com -), mantém o sinal de menos normal
    if (valor.startsWith("-")) {
        // Evita que o usuário digite mais de um sinal de menos
        input.value = "-" + valor.replace(/-/g, "");
    } else {
        // 4. Se for positivo ou zero, força o sinal de "+" na frente do número
        input.value = "+" + valor;
    }
}

// 2. AUTOMAÇÃO DOS SINAIS DE BÔNUS (5 -> +5)
function autoMais(input) {
    let valor = input.value.replace(/[^\d-]/g, "");

    if (valor === "") {
        input.value = "";
        return;
    }

    // Se for um número negativo, mantém o sinal de menos normal
    if (valor.startsWith("-")) {
        input.value = "-" + valor.replace(/-/g, "");
    } else {
        // Se for positivo ou zero, crava o "+" na frente
        input.value = "+" + valor;
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
    document.addEventListener("DOMContentLoaded", initChart);
} else {
    // Se o DOM já estiver pronto, executa imediatamente sem re-escutar eventos
    initChart();
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
    "Carrasco": {
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

// 3. Botão CONFIRMAR: Salva a escolha no input principal e limpa a tela
function confirmarEscolhaClasseFinal() {
    if (classeSelecionadaTemporaria) {
        const inputClasse = document.getElementById('input-classe'); // Certifique-se de que o ID do seu input de classe é este
        if (inputClasse) {
            inputClasse.value = classeSelecionadaTemporaria;
        }
        
        // Fecha o modal de detalhes
        document.getElementById('modal_detalhes_classe').style.display = 'none';
        
        // Atualiza os gráficos/status se necessário
        if (typeof atualizarTudo === "function") {
            atualizarTudo();
        }
    }
}

/*LIMPAR CLASSE */

// Substitua essas duas funções no seu arquivo script.js para casar com o seu HTML de tabela:

function confirmarEscolhaClasseFinal() {
    if (classeSelecionadaTemporaria) {
        // Coloca o nome da classe no input da tabela
        const inputClasse = document.getElementById('classe_input');
        if (inputClasse) {
            inputClasse.value = classeSelecionadaTemporaria;
        }

        // Mostra o botão "✕" de limpar
        const btnLimpar = document.getElementById('btn_limpar_classe');
        if (btnLimpar) {
            btnLimpar.style.display = 'inline-block';
        }

        // Fecha a tela de detalhes
        document.getElementById('modal_detalhes_classe').style.display = 'none';

        if (typeof atualizarTudo === "function") atualizarTudo();
    }
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
