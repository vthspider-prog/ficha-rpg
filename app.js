let radarChart;

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

function carregarFoto(event) {
    const reader = new FileReader();
    const file = event.target.files[0];

    if (file) {
        reader.onload = () => {
            const img = document.getElementById('preview_img');
            const placeholder = document.getElementById('placeholder_upload');
            const container = document.getElementById('container_foto');
            
            // Define a imagem e mostra
            img.src = reader.result;
            img.style.display = 'block';
            
            // Esconde o ícone de nuvem e texto
            placeholder.style.display = 'none';
            
            // Aplica a nova classe de estilo (remove tracejado e add borda suave)
            container.classList.add('foto-postada');
            
            // Animação de entrada
            img.style.opacity = 0;
            setTimeout(() => { 
                img.style.opacity = 1; 
                img.style.transition = "opacity 0.5s ease"; 
            }, 10);
        };
        reader.readAsDataURL(file);
    }
}
window.onload = initChart;

function abrirModal() {
    document.getElementById('modal_especies').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modal_especies').style.display = 'none';
}

// Fecha o modal se clicar fora da caixa branca
window.onclick = function(event) {
    let modal = document.getElementById('modal_especies');
    if (event.target == modal) {
        fecharModal();
    }
}

function selecionarEspecie(nome, atributo) {
    // 1. Coloca o nome no input da ficha
    document.getElementById('especie_input').value = nome;
    
    // 2. Fecha o modal
    fecharModal();
    
    // 3. Opcional: Você pode disparar um efeito visual 
    // ou log de console para confirmar o bônus de +1
    console.log(`Espécie selecionada: ${nome}. Atributo beneficiado: ${atributo}`);
    
    // Se quiser que o gráfico atualize automaticamente com o bônus, 
    // você chamaria sua função de atualizar gráfico aqui.
}

// Banco de Dados das Espécies
const dadosEspecies = {
    "Humanos": {
        attr: "NUL",
        bonus: "Seu status de Nulo aumenta em +1",
        desc: "Versáteis e ambiciosos, humanos adaptam-se a qualquer ambiente.",
        idade: "Maturidade aos 18, vivem até os 90 anos.",
        tamanho: "Médio",
        img: "link_da_imagem_humano.jpg"
    },
    "Feras": {
        attr: "FOR",
        bonus: "Seu status de Força aumenta em +1",
        desc: "Seres humanoides com aspectos físicos do reino animal, variando conforme a fera.",
        idade: "Maturidade aos 18 anos, vivem 90 anos no máximo.",
        tamanho: "Pequeno/Médio/Grande",
        img: "link_da_imagem_fera.jpg"
    }
    // Adicione os outros aqui seguindo o mesmo padrão...
};

let especieTemporaria = "";

function selecionarEspecie(nome) {
    const info = dadosEspecies[nome];
    if(!info) return;

    especieTemporaria = nome;

    // Preenche o Modal de Detalhes
    document.getElementById('detalhe_nome').innerText = nome;
    document.getElementById('detalhe_tag').innerText = info.attr;
    document.getElementById('detalhe_tag').className = `tag-attr ${info.attr.toLowerCase()}`;
    document.getElementById('detalhe_bonus').innerText = info.bonus;
    document.getElementById('detalhe_desc').innerText = info.desc;
    document.getElementById('detalhe_idade').innerText = info.idade;
    document.getElementById('detalhe_tamanho').innerText = info.tamanho;
    document.getElementById('detalhe_img').src = info.img;

    // Abre o modal de detalhes
    document.getElementById('modal_detalhes').style.display = 'block';
}

function fecharDetalhes() {
    document.getElementById('modal_detalhes').style.display = 'none';
}

function confirmarEscolha() {
    document.getElementById('especie_input').value = especieTemporaria;
    fecharDetalhes();
    fecharModal(); // Fecha o modal de lista original
}