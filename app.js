let radarChart;
let especieTemporaria = ""; // Armazena a escolha antes de confirmar

// 1. Inicializa o Gráfico Radar
function initChart() {
    const ctx = document.getElementById('radarChart');
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['FOR', 'VIG', 'DES', 'CAR', 'INT'],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(237, 28, 36, 0.3)',
                borderColor: '#ed1c24',
                pointRadius: 2
            }]
        },
        options: {
            scales: { r: { min: 0, max: 5, ticks: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

// 2. Atualiza o Gráfico e os Modificadores [+x]
function atualizarTudo() {
    const vals = [
        parseInt(document.getElementById('base_for').value) || 0,
        parseInt(document.getElementById('base_vig').value) || 0,
        parseInt(document.getElementById('base_des').value) || 0,
        parseInt(document.getElementById('base_car').value) || 0,
        parseInt(document.getElementById('base_int').value) || 0
    ];

    radarChart.data.datasets[0].data = vals;
    radarChart.update();

    const ids = ['p_for', 'p_vig', 'p_des', 'p_car', 'p_int'];
    ids.forEach((id, index) => {
        document.getElementById(id).innerText = `[+${vals[index] + 2}]`;
    });
}

// 3. Sistema de Upload de Foto
function carregarFoto(event) {
    const reader = new FileReader();
    const file = event.target.files[0];

    if (file) {
        reader.onload = () => {
            const img = document.getElementById('preview_img');
            const placeholder = document.getElementById('placeholder_upload');
            const container = document.getElementById('container_foto');

            img.src = reader.result;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            container.classList.add('foto-postada');

            img.style.opacity = 0;
            setTimeout(() => {
                img.style.opacity = 1;
                img.style.transition = "opacity 0.5s ease";
            }, 10);
        };
        reader.readAsDataURL(file);
    }
}

function abrirModal() {
    document.getElementById('modal_especies').style.display = 'block';
    document.body.classList.add('modal-aberto'); // Trava a rolagem do fundo
}

function fecharModal() {
    document.getElementById('modal_especies').style.display = 'none';
    document.body.classList.remove('modal-aberto'); // Devolve a rolagem ao fundo
}

function fecharDetalhes() {
    document.getElementById('modal_detalhes').style.display = 'none';
}

// Fecha modais ao clicar fora
window.onclick = function (event) {
    const modalEspecies = document.getElementById('modal_especies');
    const modalDetalhes = document.getElementById('modal_detalhes');
    if (event.target == modalEspecies) fecharModal();
    if (event.target == modalDetalhes) fecharDetalhes();
}

// 5. Banco de Dados das Espécies
const dadosEspecies = {
    //NULO - HUMANO
    "Humanos": {
        attr: "NUL",
        resumo: "A raça mais versátil e ambiciosa das terras conhecidas.",
        bonus: "Seu status de Nulo aumenta em +1",
        desc: "Variam imensamente em aparência, altura e cultura.",
        idade: "Maturidade aos 18, vivem até os 90 anos.",
        tamanho: "Médio",
        img: "https://via.placeholder.com/150" // Troque pelo link real
    },
    //FORÇA - DRAGÕES, FERAS E MUTANTE
    "Dragões": {
        attr: "FOR",
        resumo: "Seres de linhagem ancestral e imenso poder físico.",
        bonus: "Seu status de Força aumenta em +1",
        desc: "Escamas resistentes e feições imponentes.",
        idade: "Podem viver milênios.",
        tamanho: "Grande",
        img: "https://via.placeholder.com/150"
    },
    "Feras": {
        attr: "FOR",
        resumo: "Híbridos com instintos aguçados e conexão selvagem.",
        bonus: "Seu status de Força aumenta em +1",
        desc: "Humanoides com aspectos físicos do reino animal.",
        idade: "Maturidade aos 18 anos, vivem cerca de 90 anos.",
        tamanho: "Pequeno/Médio/Grande",
        img: "https://via.placeholder.com/150"
    },
    "Mutante": {
        attr: "FOR",
        resumo: "Seres mutados com poderes únicos e instáveis latentes.",
        bonus: "Seu status de Constituição aumenta em +1",
        desc: "Humanoides com mutações físicas variadas e traços anormais.",
        idade: "Maturidade aos 16 anos, vivem cerca de 80 anos.",
        tamanho: "Pequeno/Médio/Grande",
        img: "https://via.placeholder.com/150"
    },
    //VIGOR - PLANTAS, REENCARNADOS, VAMPIROS
    "Plantas": {
        attr: "VIG",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
    "Reencarnados": {
        attr: "VIG",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
    "Vampiros": {
        attr: "VIG",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
    //DESTREZA - GOBLINS, INSECTOS, LIMOSOS
    "Goblins": {
        attr: "DES",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
    "Insectos": {
        attr: "DES",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
    "Limosos": {
        attr: "DES",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
    //CARISMA - ANJOS, DEMÔNIOS, GEMAS
    "Anjos": {
        attr: "CAR",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
    "Demônios": {
        attr: "CAR",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
    "Gemas": {
        attr: "CAR",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
    //INTELECTO - CONSTRUTOS, ELFOS, MARCIANOS
    "Construtos": {
        attr: "INT",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
    "Elfos": {
        attr: "INT",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
    "Marcianos": {
        attr: "INT",
        resumo: "???",
        bonus: "???",
        desc: "???",
        idade: "???",
        tamanho: "???",
        img: "https://via.placeholder.com/150"
    },
};

// 6. Lógica de Seleção e Exibição de Detalhes
function selecionarEspecie(nome) {
    const info = dadosEspecies[nome];
    if (!info) return;

    especieTemporaria = nome; // Guarda o nome para confirmar depois

    // Preenche o Modal de Detalhes
    document.getElementById('detalhe_nome').innerText = nome;
    document.getElementById('detalhe_tag').innerText = info.attr;
    document.getElementById('detalhe_resumo_curto').innerText = info.resumo;
    document.getElementById('detalhe_bonus').innerText = info.bonus;
    document.getElementById('detalhe_desc').innerText = info.desc;
    document.getElementById('detalhe_idade').innerText = info.idade;
    document.getElementById('detalhe_tamanho').innerText = info.tamanho;
    document.getElementById('detalhe_img').src = info.img;
    

    // Aplica a cor da tag
    document.getElementById('detalhe_tag').className = `tag-attr ${info.attr.toLowerCase()}`;

    // Abre a mini ficha
    document.getElementById('modal_detalhes').style.display = 'block';
    document.body.classList.add('modal-aberto'); 
}

function fecharDetalhes() {
    document.getElementById('modal_detalhes').style.display = 'none';
    // Só remove se o outro modal também estiver fechado
    if(document.getElementById('modal_especies').style.display !== 'block') {
        document.body.classList.remove('modal-aberto');
    }
}

function confirmarEscolha() {
    if (especieTemporaria) {
        const inputEspecie = document.getElementById('especie_input');
        inputEspecie.value = especieTemporaria; // Coloca o nome (ex: Feras)
        
        // FORÇA a lixeira a aparecer adicionando a classe
        inputEspecie.classList.add('tem-conteudo'); 

        fecharDetalhes();
        fecharModal();
        
        if (typeof atualizarTudo === "function") atualizarTudo();
    }
}
// Inicialização
window.onload = function () {
    initChart();
}

function atualizarVisibilidadeLixeira() {
    const input = document.getElementById('especie_input');
    const btn = document.getElementById('btn_limpar_especie');
    
    // Se o valor não for vazio e não for o placeholder padrão
    if (input.value.trim() !== "" && input.value !== "Selecione...") {
        input.classList.add('tem-conteudo');
    } else {
        input.classList.remove('tem-conteudo');
    }
}

// E a função de limpar deve REMOVER a classe
function limparEspecie() {
    const inputEspecie = document.getElementById('especie_input');
    inputEspecie.value = ""; 
    
    // REMOVE a lixeira
    inputEspecie.classList.remove('tem-conteudo'); 
    
    if (typeof atualizarTudo === "function") atualizarTudo();
}

function atualizarStatus(tipo) {
    const total = parseFloat(document.getElementById(tipo + '_total').value) || 0;
    const dano = parseFloat(document.getElementById(tipo + '_dano').value) || 0;
    
    let atual = total - dano;
    if (atual < 0) atual = 0;
    
    document.getElementById(tipo + '_atual').value = atual;
    
    const porcentagem = total > 0 ? (atual / total) * 100 : 0;
    document.getElementById('barra_' + tipo).style.width = porcentagem + "%";
}

function calcularStatus(tipo) {
    // Pega os valores dos campos
    const total = parseFloat(document.getElementById(`${tipo}_total`).value) || 0;
    const dano = parseFloat(document.getElementById(`${tipo}_dano`).value) || 0;
    
    // Lógica: Vida Atual é o Total menos o que foi perdido
    let atual = total - dano;

    // Impede que a vida fique negativa (opcional)
    if (atual < 0) atual = 0;

    // Atualiza o campo vermelho (Bloqueado)
    document.getElementById(`${tipo}_atual`).value = atual;

    // Atualiza a Barra Visual (porcentagem)
    const porcentagem = total > 0 ? (atual / total) * 100 : 0;
    document.getElementById(`barra_${tipo}`).style.width = porcentagem + "%";
}

// Função para o "+" automático no bônus
function formatarBonus(input) {
    let valor = input.value.replace(/[^0-9-]/g, ''); // Permite apenas números e o sinal de menos
    if (valor !== "" && !valor.startsWith('-')) {
        input.value = "+" + valor;
    } else {
        input.value = valor;
    }
}

function autoMais(el) {
    let val = el.value.replace(/[^0-9-]/g, ''); // Remove letras
    if (val !== "" && !val.startsWith('-')) {
        el.value = "+" + val;
    } else {
        el.value = val;
    }
}

function atualizar(status) {
    const total = parseFloat(document.getElementById(status + '_total').value) || 0;
    const dano = parseFloat(document.getElementById(status + '_dano').value) || 0;
    
    let atual = total - dano;
    if (atual < 0) atual = 0;
    
    document.getElementById(status + '_atual').value = atual;
    
    const porcento = total > 0 ? (atual / total) * 100 : 0;
    document.getElementById('barra_' + status).style.width = porcento + "%";
}
