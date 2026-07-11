let frotasSelecionadas = JSON.parse(localStorage.getItem('filtros_revisao_selecionados') || '[]');
function printRevisoes() {
    const originalTable = document.querySelector("#corpo-revisoes");
    if (!originalTable || originalTable.rows.length === 0) {
        alert("Não há dados para imprimir.");
        return;
    }

    const btn = event.currentTarget;
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = "⌛ GERANDO PRINT...";
    btn.style.opacity = "0.7";

    // 1. Criar um container temporário para o print
    const printContainer = document.createElement('div');
    printContainer.style.position = "fixed";
    printContainer.style.top = "0";
    printContainer.style.left = "0";
    printContainer.style.width = "800px"; // Largura fixa para o print sair padronizado
    printContainer.style.backgroundColor = "white";
    printContainer.style.zIndex = "-1000";
    printContainer.style.padding = "20px";

    // 2. Montar o HTML manual do print para garantir que os valores apareçam
    let tabelaHtml = `
        <div style="font-family: Arial, sans-serif; color: #004A2F; margin-bottom: 10px; font-weight: bold; border-bottom: 2px solid #004A2F; padding-bottom: 5px;">
            REVISÕES E MANUTENÇÃO - CENTRAL SANTA ADÉLIA
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
                <tr style="background-color: #004A2F; color: white;">
                    <th style="border: 1px solid #ddd; padding: 8px;">FROTA</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">DESCRIÇÃO</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">KM ATUAL</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">PRÓX. REV.</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">RESTANTE</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">STATUS</th>
                </tr>
            </thead>
            <tbody>`;

    // 3. Percorrer a tabela original e pegar os valores reais
    const linhas = originalTable.querySelectorAll("tr");
    linhas.forEach(linha => {
        const colunas = linha.querySelectorAll("td");
        const frota = colunas[0].innerText;
        const desc = colunas[1].innerText;
        const kmAtual = colunas[2].innerText;
        
        // PEGA O VALOR REAL DO INPUT E DO SELECT
        const proxRev = colunas[3].querySelector("input").value;
        const restante = colunas[4].innerText;
        const status = colunas[5].querySelector("select").value;

        // Define a cor da linha se for indisponível
        const corFundo = status === "INDISPONIVEL" ? "#ffcccc" : "white";
        const corTexto = status === "INDISPONIVEL" ? "#990000" : "#333";

        tabelaHtml += `
    <tr style="background-color: ${corFundo}; color: ${corTexto}; text-align: center;">
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${frota}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${desc}</td> <td style="border: 1px solid #ddd; padding: 8px;">${kmAtual}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${proxRev}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${restante}</td>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${status}</td>
    </tr>`;
    });

    tabelaHtml += `</tbody></table>`;
    printContainer.innerHTML = tabelaHtml;
    document.body.appendChild(printContainer);

    // 4. Tirar o print do container montado
    html2canvas(printContainer, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false
    }).then(canvas => {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        const data = new Date().toLocaleDateString().replace(/\//g, '-');
        link.download = `Revisoes_${data}.png`;
        link.href = image;
        link.click();

        // Limpeza
        document.body.removeChild(printContainer);
        btn.innerHTML = textoOriginal;
        btn.style.opacity = "1";
    });
}


function toggleCheckboxes() {
    document.getElementById('lista-checkboxes').classList.toggle('show-list');
}

// Fecha o menu ao clicar fora
window.addEventListener('click', function(e) {
    if (!document.querySelector('.multiselect-container').contains(e.target)) {
        document.getElementById('lista-checkboxes').classList.remove('show-list');
    }
});       
function adicionarFrotaAoBoletim() {
    document.getElementById('new_frota_pref').value = "";
    document.getElementById('new_frota_modelo').value = "";
    document.getElementById('modalAddFrotaBoletim').style.display = 'flex';
}
function confirmarAdicaoBoletim() {
    const prefixo = document.getElementById('new_frota_pref').value.trim().toUpperCase();
    const modelo = document.getElementById('new_frota_modelo').value.trim().toUpperCase();

    if (!prefixo) return alert("O prefixo é obrigatório.");

    // Verifica se já existe um objeto com esse prefixo para evitar duplicatas
    const existeNoBanco = db.frota_boletins.find(e => e.prefixo === prefixo);
    if (existeNoBanco) return alert("Este equipamento já está na lista.");

    // ADICIONA APENAS O OBJETO (Corrigindo a duplicidade e o [object Object])
    db.frota_boletins.push({ 
        prefixo: prefixo, 
        descricao: modelo || "S/R" 
    });

    save();
    fecharModal('modalAddFrotaBoletim');
    renderBoletins();
}
// Inicializa a data de conferência com hoje
document.getElementById('filtro_data_boletim').value = new Date().toISOString().split('T')[0];

function renderBoletins() {
    const dataFiltro = document.getElementById('filtro_data_boletim').value;
    const corpo = document.getElementById('corpo-boletins-conferencia');
    if(!corpo) return;
    corpo.innerHTML = "";

    db.frota_boletins.forEach((equip, index) => {
        const tr = document.createElement('tr');
        
        // CORREÇÃO: Trata se o dado for objeto ou apenas texto
        const prefixo = (typeof equip === 'object') ? equip.prefixo : equip;
        const desc = (typeof equip === 'object') ? (equip.descricao || "S/R") : "S/R";

        let html = `
            <td>
                <div class="btn-acao-tabela">
                    <div class="btn-move-grupo">
                        <button class="btn-move" onclick="moverEquipamento(${index}, -1)">▲</button>
                        <button class="btn-move" onclick="moverEquipamento(${index}, 1)">▼</button>
                    </div>
                    <button class="btn-delete-boletim" onclick="removerFrotaDoBoletim('${prefixo}')">🗑️</button>
                    <span class="prefixo-texto">${prefixo}</span>
                </div>
            </td>
            <td style="font-weight:bold; color:#555;">${desc}</td>`;
        
        ['A', 'B', 'C'].forEach(turno => {
            const registro = db.boletins.find(b => b.frota === prefixo && b.data === dataFiltro && b.turno === turno);
            if (registro) {
                html += `
                    <td style="background: #d4edda; color: #155724; cursor:pointer; font-weight:bold;" onclick="abrirPopupBoletim('${prefixo}', '${turno}')">OK</td>
                    <td style="font-weight:bold; background:#f9f9f9;">${registro.numero}</td>`;
            } else {
                html += `
                    <td style="background: #fff3f3; color: #dc3545; font-size:10px; cursor:pointer; font-weight:bold; border: 1px dashed #ffcdd2;" onclick="abrirPopupBoletim('${prefixo}', '${turno}')">PENDENTE</td>
                    <td style="color:#ccc; background:#f9f9f9;">-</td>`;
            }
        });
        
        tr.innerHTML = html;
        corpo.appendChild(tr);
    });
}
function moverEquipamento(index, direcao) {
    const novaPosicao = index + direcao;
    if (novaPosicao < 0 || novaPosicao >= db.frota_boletins.length) return;
    
    const item = db.frota_boletins.splice(index, 1)[0];
    db.frota_boletins.splice(novaPosicao, 0, item);
    
    save();
    renderBoletins();
}
function removerFrotaDoBoletim(pref) {
    if (confirm(`Remover ${pref} da conferência?`)) {
        // Esta linha garante que remova tanto se for objeto quanto se for texto simples
        db.frota_boletins = db.frota_boletins.filter(e => {
            const p = (typeof e === 'object') ? e.prefixo : e;
            return p !== pref;
        });
        
        save();
        renderBoletins(); 
    }
}
function abrirPopupBoletim(frota, turno) {
    document.getElementById('bol_frota').value = frota;
    document.getElementById('bol_turno').value = turno;
    document.getElementById('bol_data').value = document.getElementById('filtro_data_boletim').value;
    document.getElementById('tituloBoletim').innerText = `Boletim: ${frota} - Turno ${turno}`;
    
    
    // Tenta carregar dados se já existir
    const existente = db.boletins.find(b => b.frota === frota && b.data === document.getElementById('bol_data').value && b.turno === turno);
    if(existente) {
        document.getElementById('bol_numero').value = existente.numero;
        document.getElementById('bol_km_ini').value = existente.km_ini;
        document.getElementById('bol_km_fim').value = existente.km_fim;
        document.getElementById('bol_moto').value = existente.moto;
    } else {
        document.getElementById('formBoletim').reset();
        document.getElementById('bol_data').value = document.getElementById('filtro_data_boletim').value;
    }

    document.getElementById('modalDigitarBoletim').style.display = 'flex';
}

function salvarBoletim(e) {
    e.preventDefault();
    const novoBol = {
        frota: document.getElementById('bol_frota').value,
        turno: document.getElementById('bol_turno').value,
        data: document.getElementById('bol_data').value,
        numero: document.getElementById('bol_numero').value,
        km_ini: document.getElementById('bol_km_ini').value,
        km_fim: document.getElementById('bol_km_fim').value,
        moto: document.getElementById('bol_moto').value // Captura o texto digitado
    };

    // Remove versão antiga se existir e salva a nova
    db.boletins = db.boletins.filter(b => !(b.frota === novoBol.frota && b.data === novoBol.data && b.turno === novoBol.turno));
    db.boletins.push(novoBol);
    
    save();
    fecharModal('modalDigitarBoletim');
    renderBoletins();
}

// No final do seu script, dentro do renderAll(), adicione:
// renderBoletins();
function gerarPrintZap() {
    const areaPrint = document.querySelector("#page-home");
    const botoes = document.querySelectorAll('button, header');
    
    // Captura todas as células da nova coluna de tipo de prancha
    const colunasPrancha = document.querySelectorAll('.coluna-tipo-prancha');

    // 1. Entra no modo de captura (compacta e esconde lixo)
    areaPrint.classList.add('modo-compacto');
    botoes.forEach(b => b.style.opacity = '0'); // Esconde botões e cabeçalho sem mudar o layout
    
    // ESCONDE A COLUNA DA PRANCHA PARA O PRINT
    colunasPrancha.forEach(col => col.style.display = 'none');

    html2canvas(areaPrint, { 
        scale: 2, // Alta qualidade
        useCORS: true, 
        backgroundColor: "#f0f2f5" 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Programacao_Pranchas.png';
        link.href = canvas.toDataURL();
        link.click();

        // 2. Sai do modo de captura (Restaura o estado visual original na tela)
        areaPrint.classList.remove('modo-compacto');
        botoes.forEach(b => b.style.opacity = '1');
        
        // MOSTRA A COLUNA DA PRANCHA DE VOLTA NA TELA
        colunasPrancha.forEach(col => col.style.display = '');
    });
}
function abrirEquipe() {
    fecharModal('modalBase'); // Fecha as configurações para abrir a equipe
    renderEquipe();
    document.getElementById('modalEquipe').style.display = 'flex'; // Abre o modal de equipe
}
function renderRevisoes() {
    const corpo = document.getElementById('corpo-revisoes');
    const listaCheck = document.getElementById('lista-checkboxes');
    if (!corpo) return;

    // Preenche os checkboxes e marca os que já estavam selecionados
    if (listaCheck.innerHTML === "") {
        db.frota_boletins.forEach(equip => {
            const prefixo = (typeof equip === 'object') ? equip.prefixo : equip;
            const desc = (typeof equip === 'object' ? equip.descricao : "").toUpperCase();
            
            if (!desc.includes("CAMINHÃO") && !desc.includes("CAMINHAO")) {
                const isChecked = frotasSelecionadas.includes(prefixo) ? 'checked' : '';
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${prefixo}" ${isChecked} onchange="atualizarFiltroMultiplo()"> ${prefixo}`;
                listaCheck.appendChild(label);
            }
        });
        // Atualiza o texto do botão de seleção inicial
        document.getElementById('texto-selecao').innerText = frotasSelecionadas.length === 0 ? "-- TODOS OS CARROS --" : frotasSelecionadas.length + " SELECIONADO(S)";
    }

    corpo.innerHTML = "";
    db.frota_boletins.filter(equip => {
        const prefixo = (typeof equip === 'object') ? equip.prefixo : equip;
        const desc = (typeof equip === 'object' ? equip.descricao : "").toUpperCase();
        if (desc.includes("CAMINHÃO") || desc.includes("CAMINHAO")) return false;
        return frotasSelecionadas.length === 0 || frotasSelecionadas.includes(prefixo);
    }).forEach(equip => {
        const prefixo = (typeof equip === 'object') ? equip.prefixo : equip;
        const desc = (typeof equip === 'object') ? (equip.descricao || "---") : "---";
        
        const kms = db.boletins.filter(b => b.frota === prefixo && parseInt(b.km_fim) > 0).map(b => parseInt(b.km_fim));
        const kmAtual = kms.length > 0 ? Math.max(...kms) : 0;
        
        const dados = db.revisoes[prefixo] || { prox: 0, status: "DISPONIVEL" };
        const restante = (dados.prox > 0) ? (dados.prox - kmAtual) : 0;
        const isIndisponivel = dados.status === "INDISPONIVEL";

        const tr = document.createElement('tr');
        if (isIndisponivel) tr.classList.add('linha-indisponivel');

        tr.innerHTML = `
            <td style="font-weight:bold;">${prefixo}</td>
            <td style="padding-left:10px;">${desc}</td>
            <td style="font-weight:bold;">${kmAtual}</td>
            <td><input type="number" class="input-revisao-clean" value="${dados.prox}" onchange="salvarRev('${prefixo}','prox',this.value)"></td>
            <td style="font-weight:bold; color:${restante <= 500 && !isIndisponivel ? 'red' : 'inherit'}">${restante} KM</td>
            <td>
                <select class="select-manutencao" onchange="salvarRev('${prefixo}','status',this.value)">
                    <option value="DISPONIVEL" ${dados.status === 'DISPONIVEL' ? 'selected' : ''}>DISPONIVEL</option>
                    <option value="INDISPONIVEL" ${dados.status === 'INDISPONIVEL' ? 'selected' : ''}>INDISPONIVEL</option>
                </select>
            </td>
        `;
        corpo.appendChild(tr);
    });
}
function atualizarFiltroMultiplo() {
    frotasSelecionadas = Array.from(document.querySelectorAll('#lista-checkboxes input:checked')).map(cb => cb.value);
    // Salva a seleção no navegador
    localStorage.setItem('filtros_revisao_selecionados', JSON.stringify(frotasSelecionadas));
    
    document.getElementById('texto-selecao').innerText = frotasSelecionadas.length === 0 ? "-- TODOS OS CARROS --" : frotasSelecionadas.length + " SELECIONADO(S)";
    renderRevisoes();
}

function salvarRev(prefixo, campo, valor) {
    if (!db.revisoes[prefixo]) db.revisoes[prefixo] = { prox: 0, status: "DISPONIVEL" };
    db.revisoes[prefixo][campo] = campo === 'prox' ? parseInt(valor) : valor;
    save();
}
function atualizarDadosRevisao(prefixo, campo, valor) {
    if (!db.revisoes) db.revisoes = {};
    if (!db.revisoes[prefixo]) db.revisoes[prefixo] = { prox_km: 0, manut: "" };

    db.revisoes[prefixo][campo] = campo === 'prox_km' ? parseInt(valor) : valor;
    save();
}
function salvarFuncionario() {
    const i = document.getElementById('eq_idx').value;
    const obj = {
        nome: document.getElementById('eq_nome').value,
        cracha: document.getElementById('eq_cracha').value,
        escala: document.getElementById('eq_escala').value,
        folga: document.getElementById('eq_folga').value
    };

    if(obj.nome === "") return alert("Preencha o nome!");

    if(i === "-1") db.equipe.push(obj);
    else db.equipe[i] = obj;

    // Limpa campos
    document.getElementById('eq_idx').value = "-1";
    document.getElementById('eq_nome').value = "";
    document.getElementById('eq_cracha').value = "";
    
    save();
    renderEquipe();
}

function renderEquipe() {
    const corpo = document.getElementById('corpo-equipe');
    corpo.innerHTML = "";
    
    db.equipe.forEach((f, i) => {
        // Criatividade: Destaca se a folga é hoje
        const hoje = new Date().toISOString().split('T')[0];
        const estiloFolga = (f.folga === hoje) ? "color: red; font-weight: bold;" : "";

        corpo.innerHTML += `
            <tr>
                <td>${f.nome}</td>
                <td><span class="badge" style="background:#666">${f.cracha}</span></td>
                <td>${f.escala}</td>
                <td style="${estiloFolga}">${f.folga ? f.folga.split('-').reverse().join('/') : '-'}</td>
                <td>
                    <button class="btn-icon" onclick="editarFuncionario(${i})">📝</button>
                    <button class="btn-icon" onclick="excluirFuncionario(${i})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function editarFuncionario(i) {
    const f = db.equipe[i];
    document.getElementById('eq_idx').value = i;
    document.getElementById('eq_nome').value = f.nome;
    document.getElementById('eq_cracha').value = f.cracha;
    document.getElementById('eq_escala').value = f.escala;
    document.getElementById('eq_folga').value = f.folga;
}

function excluirFuncionario(i) {
    if(confirm("Deseja remover este funcionário?")) {
        db.equipe.splice(i, 1);
        save();
        renderEquipe();
    }
}
function capturarTela() {
    // Esconde os botões para o print ficar limpo
    const botoes = document.querySelectorAll('button');
    botoes.forEach(b => b.style.visibility = 'hidden');

    html2canvas(document.querySelector("#page-home")).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Programacao_Pranchas.png';
        link.href = canvas.toDataURL();
        link.click();
        
        // Mostra os botões de volta
        botoes.forEach(b => b.style.visibility = 'visible');
    });
}
function alternarCompacto() {
    const tabelas = document.querySelectorAll('table, td, th');
    tabelas.forEach(t => {
        t.style.padding = t.style.padding === '4px' ? '12px' : '4px';
        t.style.fontSize = t.style.fontSize === '10px' ? '12px' : '10px';
    });
}
// Função para transformar 2026-04-11T09:00 em 11/04/2026 09:00
function formatarDataBR(dataISO) {
    if (!dataISO || dataISO === "-") return "-";
    
    try {
        const data = new Date(dataISO);
        // Verifica se a data é válida antes de formatar
        if (isNaN(data.getTime())) return "-";
        
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return "-";
    }
}
function irPara(pagina) {
    // Esconde todas as páginas e remove o destaque de todos os links
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    // Mostra a página pretendida e destaca o link clicado
    document.getElementById('page-' + pagina).classList.add('active');
    document.getElementById('link-' + pagina).classList.add('active');
    
    // Se for a página de boletins, renderiza os dados
    if(pagina === 'boletins') {
        renderBoletins();
        renderRevisoes();
    }
}

let db = {
    motos: JSON.parse(localStorage.getItem('usa_motos') || '[]'),
    veics: JSON.parse(localStorage.getItem('usa_veics') || '[]'), // Cavalos (Frotas)
    imps: JSON.parse(localStorage.getItem('usa_imps') || '[]'),
    agendamentos: JSON.parse(localStorage.getItem('usa_agendamentos') || '[]'),
    frota: JSON.parse(localStorage.getItem('usa_frota') || '[]'),
    historico: JSON.parse(localStorage.getItem('usa_historico') || '[]'),
    boletins: JSON.parse(localStorage.getItem('usa_boletins') || '[]'),
    frota_boletins: JSON.parse(localStorage.getItem('usa_frota_boletins') || '[]'),
    equipamentos_boletim: JSON.parse(localStorage.getItem('usa_equipamentos_boletim') || '[]'),
    revisoes: JSON.parse(localStorage.getItem('central_revisoes') || '{}'), // NOVO BANCO
    equipe: JSON.parse(localStorage.getItem('usa_equipe') || '[]')
};

const save = () => {
    localStorage.setItem('usa_motos', JSON.stringify(db.motos));
    localStorage.setItem('usa_veics', JSON.stringify(db.veics));
    localStorage.setItem('usa_imps', JSON.stringify(db.imps));
    localStorage.setItem('usa_agendamentos', JSON.stringify(db.agendamentos));
    localStorage.setItem('usa_frota', JSON.stringify(db.frota));
    localStorage.setItem('usa_historico', JSON.stringify(db.historico));
    localStorage.setItem('usa_equipe', JSON.stringify(db.equipe)); // Salva equipe
    localStorage.setItem('usa_boletins', JSON.stringify(db.boletins));
    localStorage.setItem('usa_frota_boletins', JSON.stringify(db.frota_boletins)); // Salva a lista da tabela
    localStorage.setItem('usa_equipamentos_boletim', JSON.stringify(db.equipamentos_boletim));
    localStorage.setItem('central_revisoes', JSON.stringify(db.revisoes));
    localStorage.setItem('usa_revisoes', JSON.stringify(db.revisoes));
    
    if (typeof firestoreDb !== 'undefined') {
        firestoreDb.collection("central_db").doc("dashboard").set({
            motos: db.motos,
            veics: db.veics,
            imps: db.imps,
            agendamentos: db.agendamentos,
            frota: db.frota,
            historico: db.historico,
            boletins: db.boletins,
            frota_boletins: db.frota_boletins,
            equipamentos_boletim: db.equipamentos_boletim,
            revisoes: db.revisoes,
            equipe: db.equipe
        }).catch(err => console.error("Erro ao salvar no Firebase:", err));
    }
    
    renderAll();
    renderRevisoes();
    if (typeof renderEquipe === 'function') {
        renderEquipe();
    }
};

function renderAll() { 
    renderFrota(); 
    renderAgendamentos(); 
    renderBoletins(); // Adicione esta linha
}

// Sincronização em Tempo Real com o Firebase Firestore
if (typeof firestoreDb !== 'undefined') {
    firestoreDb.collection("central_db").doc("dashboard").onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            
            // Atualiza os dados locais com os dados do Firebase
            db.motos = data.motos || [];
            db.veics = data.veics || [];
            db.imps = data.imps || [];
            db.agendamentos = data.agendamentos || [];
            db.frota = data.frota || [];
            db.historico = data.historico || [];
            db.boletins = data.boletins || [];
            db.frota_boletins = data.frota_boletins || [];
            db.equipamentos_boletim = data.equipamentos_boletim || [];
            db.revisoes = data.revisoes || {};
            db.equipe = data.equipe || [];
            
            // Salva no LocalStorage para cache offline
            localStorage.setItem('usa_motos', JSON.stringify(db.motos));
            localStorage.setItem('usa_veics', JSON.stringify(db.veics));
            localStorage.setItem('usa_imps', JSON.stringify(db.imps));
            localStorage.setItem('usa_agendamentos', JSON.stringify(db.agendamentos));
            localStorage.setItem('usa_frota', JSON.stringify(db.frota));
            localStorage.setItem('usa_historico', JSON.stringify(db.historico));
            localStorage.setItem('usa_equipe', JSON.stringify(db.equipe));
            localStorage.setItem('usa_boletins', JSON.stringify(db.boletins));
            localStorage.setItem('usa_frota_boletins', JSON.stringify(db.frota_boletins));
            localStorage.setItem('usa_equipamentos_boletim', JSON.stringify(db.equipamentos_boletim));
            localStorage.setItem('central_revisoes', JSON.stringify(db.revisoes));
            localStorage.setItem('usa_revisoes', JSON.stringify(db.revisoes));
            
            // Renderiza novamente a tela inteira com as informações atualizadas
            renderAll();
            renderRevisoes();
            if (typeof renderEquipe === 'function') {
                renderEquipe();
            }
        } else {
            // Se o documento não existe no Firestore, inicializa com o estado local atual
            save();
        }
    }, (error) => {
        console.error("Erro no listener do Firebase Firestore:", error);
    });
}

function renderFrota() {
    const tbody = document.getElementById('corpo-frota');
    tbody.innerHTML = db.frota.map((f, i) => {
        const classeManutencao = f.manut === 'SIM' ? 'linha-manutencao' : '';
        const badgeSituacao = f.manut === 'SIM' ? 'bg-danger' : (f.situ === 'EM FRETE' ? 'bg-warning' : 'bg-success');
        
        // Busca o rádio no banco de veículos
        const dadosVeiculo = db.veics.find(v => v.prefixo === f.veic);
        const radioInfo = dadosVeiculo ? dadosVeiculo.radio : 'S/R';

        return `
            <tr class="${classeManutencao}">
                <td><button onclick="prepararEdicaoFrota(${i})">📝</button></td>
                <td style="font-weight:bold;">${f.veic}</td>
                <td style="color: #667; font-size: 12px;"; style="font-weight:bold;">📻 ${radioInfo}</td> <td><span class="badge ${f.manut === 'SIM' ? 'bg-danger' : 'bg-success'}">${f.manut}</span></td>
                <td>${f.moto || '-'}</td>
                <td><span class="badge ${badgeSituacao}">${f.situ}</span></td>
                <td>${f.imp || '-'}</td>
                <td><button onclick="deleteFrota(${i})">🗑️</button></td>
            </tr>
        `;
    }).join('');
}

function renderAgendamentos() {
    const pend = document.getElementById('corpo-pendente');
    const and = document.getElementById('corpo-andamento');
    pend.innerHTML = ""; and.innerHTML = "";
    
    const agendamentosOrdenados = [...db.agendamentos].sort((a, b) => {
        return new Date(a.hora_frete) - new Date(b.hora_frete);
    });

    const grupos = {};
    agendamentosOrdenados.filter(a => a.status === 'PENDENTE').forEach(a => {
        if (!grupos[a.hora_frete]) grupos[a.hora_frete] = [];
        grupos[a.hora_frete].push(a);
    });

    Object.keys(grupos).forEach((horario) => {
        const itens = grupos[horario];
        
        itens.forEach((a, index) => {
            const tr = document.createElement('tr');
            tr.classList.add('indicador-laranja');

            if (index === 0) {
                tr.classList.add('divisor-grupo');
            } else {
                tr.classList.add('linha-par');
            }

            const diff = (new Date(a.hora_frete) - new Date(a.hora_solic)) / (1000*60*60);
            const classif = diff >= 8 ? 'PROGRAMADO' : 'NÃO PROGRAMADO';
            
            // TRAJETO AGENDADO: ">" em NEGRITO e LARANJA
            const trajetoAgendado = `${a.emb} <span style="color: #ef6c00; font-weight: 900; font-size: 14px;">&gt;</span> ${a.des}`;

            tr.innerHTML = `
                <td>
                    <button onclick="prepararSaida(${a.id})">▶️</button> 
                    <button onclick="editAgendamento(${a.id})">📝</button>
                </td>
                <td style="color: #666;">${formatarDataBR(a.hora_solic)}</td>
                <td style="font-weight: bold; color: #ef6c00;">
                    ${index === 0 ? formatarDataBR(a.hora_frete) : '<span style="color: #ccc; font-weight: bold;">↳ (mesmo horário)</span>'} 
                </td>
                <td><span class="badge ${classif==='PROGRAMADO'?'bg-success':'bg-warning'}">${classif}</span></td>
                <td>${a.solicitante}</td> 
                <td>${a.carga}</td>
                
                <td class="coluna-tipo-prancha">
                    <select onchange="atualizarTipoPranchaAgendado(${a.id}, this.value)" style="padding: 2px; font-size: 11px; border-radius: 4px; border: 1px solid #ccc; max-width: 120px;">
                        <option value="">-</option>
                        <option value="Prancha Larga" ${a.tipo_prancha === 'Prancha Larga' ? 'selected' : ''}>Prancha Larga</option>
                        <option value="Prancha Baixa" ${a.tipo_prancha === 'Prancha Baixa' ? 'selected' : ''}>Prancha Baixa</option>
                        <option value="Prancha Munck" ${a.tipo_prancha === 'Prancha Munck' ? 'selected' : ''}>Prancha Munck</option>
                        <option value="Caminhão Munck" ${a.tipo_prancha === 'Caminhão Munck' ? 'selected' : ''}>Caminhão Munck</option>
                    </select>
                </td>

                <td>${trajetoAgendado}</td>
                <td><button onclick="deleteAgend(${a.id})">🗑️</button></td>
            `;
            pend.appendChild(tr);
        });
    });

    // Renderização de Andamento
    agendamentosOrdenados.filter(a => a.status === 'ANDAMENTO').forEach(a => {
        const tr = document.createElement('tr');
        tr.style.borderLeft = "6px solid #1976d2";
        
        // TRAJETO ANDAMENTO: ">" em NEGRITO e AZUL
        const trajetoAndamento = `${a.emb} <span style="color: #1976d2; font-weight: 900; font-size: 14px;">&gt;</span> ${a.des}`;

        tr.innerHTML = `
            <td>
                <button onclick="finalizar(${a.id})">✅</button>
                <button onclick="prepararTrocaExecucao(${a.id})">📝</button>
            </td>
            <td style="color:#1976d2; font-weight:bold;">${formatarDataBR(a.hora_real)}</td>
            <td>${a.moto_real}</td>
            <td>${a.solicitante}</td> 
            <td>${a.carga}</td>
            <td>${trajetoAndamento}</td>
        `;
        and.appendChild(tr);
    });
}
function atualizarTipoPranchaAgendado(id, valor) {
    const idx = db.agendamentos.findIndex(x => x.id == id);
    if (idx !== -1) {
        db.agendamentos[idx].tipo_prancha = valor;
        save(); // Salva as alterações no banco de dados local
    }
}
function prepararTrocaExecucao(agendId) {
    const agend = db.agendamentos.find(x => x.id === agendId);
    if (!agend) return;

    // Encontra o índice do veículo na frota que está realizando este frete
    const frotaIdx = db.frota.findIndex(f => f.veic === agend.veic_real);

    if (frotaIdx !== -1) {
        // Abre o modal de edição de status/motorista da frota
        prepararEdicaoFrota(frotaIdx);
    } else {
        alert("Veículo não encontrado na listagem de frota ativa.");
    }
}
function abrirHistorico() { renderHistorico(); document.getElementById('modalHistorico').style.display = 'flex'; }
function renderHistorico() {
    const tbody = document.getElementById('corpo-historico');
    if (db.historico.length === 0) { 
        tbody.innerHTML = '<tr><td colspan="7">Nenhum registro.</td></tr>'; 
        return; 
    }
    
    const histOrdenado = [...db.historico].reverse();
    
    tbody.innerHTML = histOrdenado.map(h => `
        <tr>
            <td style="color: #666;">${formatarDataBR(h.hora_real)}</td> <td style="font-weight:bold; color: var(--usa-verde-medio);">${formatarDataBR(h.fim)}</td>
            <td>${h.prancha || '-'}</td>
            <td>${h.moto_real || '-'}</td>
            <td>${h.carga || '-'}</td>
            <td>${h.emb} > ${h.des}</td>
            <td>${h.solicitante || '-'}</td>
        </tr>
    `).join('');
}

function exportarHistorico() {
    if (db.historico.length === 0) { alert("Sem dados."); return; }
    const cabecalhos = ["Início", "Fim Real", "Prancha", "Motorista", "Carga", "Origem", "Destino", "Solicitante", "Processo"];
    const rows = db.historico.map(h => [
        `"${h.hora_real}"`, 
        `"${h.fim}"`, 
        `"${h.prancha}"`, 
        `"${h.moto_real}"`, 
        `"${h.carga}"`, 
        `"${h.emb}"`, 
        `"${h.des}"`, 
        `"${h.solicitante}"`, 
        `"${h.processo || '-'}"`
    ]);
    let csvContent = "\ufeff" + cabecalhos.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historico_fretes.csv`);
    link.click();
}

function limparHistorico() { if(confirm("Apagar histórico?")) { db.historico = []; save(); renderHistorico(); } }
function fecharModal(id) { document.getElementById(id).style.display = 'none'; }
function switchTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    el.classList.add('active');
}

// Remova a linha updateSelect('agend_prancha_select'...) desta função
function abrirModalAgendamento() {
    document.getElementById('formAgendamento').reset();
    document.getElementById('agend_id').value = "";
    document.getElementById('tituloAgendamento').innerText = "Novo Agendamento";
    
    // Lógica para capturar o horário local exato (ajustando o fuso horário)
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    document.getElementById('agend_hora_solic').value = agora.toISOString().slice(0, 16);
    
    document.getElementById('modalAgendamento').style.display = 'flex';
}

function editAgendamento(id) {
    const a = db.agendamentos.find(x => x.id === id);
    if(!a) return;
    
    document.getElementById('agend_id').value = a.id;
    document.getElementById('agend_hora_solic').value = a.hora_solic;
    document.getElementById('agend_hora_frete').value = a.hora_frete;
    
    // Removido o updateSelect e a atribuição da prancha daqui
    
    document.getElementById('agend_carga').value = a.carga;
    document.getElementById('agend_solicitante').value = a.solicitante;
    document.getElementById('agend_processo').value = a.processo || "";
    document.getElementById('agend_emb').value = a.emb;
    document.getElementById('agend_des').value = a.des;

    document.getElementById('tituloAgendamento').innerText = a.status === 'ANDAMENTO' ? "Editando Frete em Curso" : "Editar Agendamento";
    document.getElementById('modalAgendamento').style.display = 'flex';
}

function salvarAgendamento(e) {
    e.preventDefault();
    const idInput = document.getElementById('agend_id').value;
    const numericId = idInput ? parseInt(idInput) : null;
    const itemAtual = numericId ? db.agendamentos.find(x => x.id === numericId) : null;
    
    const dataF = document.getElementById('agend_hora_frete').value;

    const obj = {
        id: numericId || Date.now(),
        hora_solic: document.getElementById('agend_hora_solic').value,
        hora_frete: dataF, 
        prancha: itemAtual ? itemAtual.prancha : "-", // Mantém a prancha se já estiver em andamento, ou vazio
        carga: document.getElementById('agend_carga').value,
        solicitante: document.getElementById('agend_solicitante').value,
        processo: document.getElementById('agend_processo').value,
        emb: document.getElementById('agend_emb').value, 
        des: document.getElementById('agend_des').value,
        status: itemAtual ? itemAtual.status : 'PENDENTE',
        hora_real: itemAtual ? itemAtual.hora_real : null,
        moto_real: itemAtual ? itemAtual.moto_real : null,
        veic_real: itemAtual ? itemAtual.veic_real : null
    };

    if(numericId) { 
        const idx = db.agendamentos.findIndex(x => x.id == numericId); 
        db.agendamentos[idx] = obj; 
    } else { 
        db.agendamentos.push(obj); 
    }

    save(); 
    fecharModal('modalAgendamento');
}

let tempID = null;
function prepararSaida(id) {
    tempID = id;
    updateSelect('ini_cavalo_select', db.veics, v => v.prefixo);
    updateSelect('ini_moto_select', db.motos, m => m.nome);
    
    // Captura o horário local corrigindo o fuso horário para o input
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    document.getElementById('ini_tempo').value = agora.toISOString().slice(0, 16);
    
    document.getElementById('modalIniciar').style.display = 'flex';
}

function confirmarInicio() {
    const i = db.agendamentos.findIndex(x => x.id === tempID);
    if (i === -1) return;

    // Captura os valores selecionados
    const veicSelecionado = document.getElementById('ini_cavalo_select').value.trim();
    const motoSelecionado = document.getElementById('ini_moto_select').value.trim();
    const horaSaida = document.getElementById('ini_tempo').value.replace('T', ' ');

    // 1. Atualiza o frete
    db.agendamentos[i].status = 'ANDAMENTO';
    db.agendamentos[i].hora_real = horaSaida;
    db.agendamentos[i].moto_real = motoSelecionado;
    db.agendamentos[i].veic_real = veicSelecionado;

    // 2. Atualiza a Frota (Busca exata pelo prefixo)
    const frotaIdx = db.frota.findIndex(f => f.veic.trim() === veicSelecionado);
    
    if (frotaIdx !== -1) {
        db.frota[frotaIdx].situ = 'EM FRETE';
        db.frota[frotaIdx].moto = motoSelecionado;
        db.frota[frotaIdx].manut = 'NÃO'; // Desativa manutenção
        console.log("Veículo " + veicSelecionado + " atualizado com sucesso!");
    } else {
        console.error("Veículo " + veicSelecionado + " não encontrado na lista de frota.");
        alert("Atenção: O veículo " + veicSelecionado + " não foi encontrado na tabela 'Estado Atual da Frota'. Certifique-se de que ele foi adicionado lá primeiro.");
    }

    save(); // Salva e chama renderAll()
    fecharModal('modalIniciar');
}
function finalizar(id) {
    if(!confirm("Concluir transporte?")) return;

    // 1. Localiza o índice do frete
    const i = db.agendamentos.findIndex(x => x.id === id);
    if (i === -1) return;

    // 2. Armazena os dados do frete antes de remover da lista
    const item = db.agendamentos[i]; 
    const veicUtilizado = item.veic_real ? item.veic_real.trim() : null;

    // 3. Busca o veículo na frota para liberá-lo
    if (veicUtilizado) {
        const frotaIdx = db.frota.findIndex(f => f.veic.trim() === veicUtilizado);
        
        if (frotaIdx !== -1) {
            // Só volta para AG. PROGRAMAÇÃO se não estiver marcado como MANUTENÇÃO: SIM
            if (db.frota[frotaIdx].manut !== 'SIM') {
                db.frota[frotaIdx].situ = 'AG. PROGRAMAÇÃO';
                // Opcional: limpa o motorista da frota ao finalizar, se desejar
                // db.frota[frotaIdx].moto = "-"; 
            }
        }
    }

    // 4. Remove do andamento e move para o histórico
    const itemConcluido = db.agendamentos.splice(i, 1)[0];
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    itemConcluido.fim = agora.toISOString().slice(0, 16);
    
    db.historico.push(itemConcluido);

    // 5. Salva todas as alterações e atualiza a tela
    save(); 
}

function abrirModalBase() { renderBaseListas(); document.getElementById('modalBase').style.display = 'flex'; }
function salvarItemBase(e, t) {
    e.preventDefault();
    let item = { id: Date.now() };
    if(t==='motos') item = {...item, nome: document.getElementById('b_moto_nome').value, cod: document.getElementById('b_moto_cod').value};
    if(t==='veics') {
        item = {
            ...item, 
            prefixo: document.getElementById('b_veic_prefixo').value,
            radio: document.getElementById('b_veic_radio').value // Captura o rádio
        };
    }
    if(t==='imps') item = {...item, num: document.getElementById('b_imp_num').value, tipo: document.getElementById('b_imp_tipo').value};
    db[t].push(item); save(); e.target.reset(); renderBaseListas();
}

function renderBaseListas() {
    const draw = (id, list, cols, t) => {
        // Gera o cabeçalho
        let html = `<tr>${cols.map(c => `<th>${c}</th>`).join('')}<th>X</th></tr>`;
        
        // Gera as linhas
        html += list.map((item, idx) => {
            let row = "<tr>";
            cols.forEach(c => {
                // Lógica para identificar qual campo do objeto 'item' usar
                let field = c.toLowerCase();
                if (field === 'nº') field = 'num';
                if (field === 'id') field = 'cod';
                
                row += `<td>${item[field] || '-'}</td>`;
            });
            row += `<td><button onclick="deleteBase('${t}', ${idx})">🗑️</button></td></tr>`;
            return row;
        }).join('');
        
        document.getElementById(id).innerHTML = html;
    };

    draw('lista-moto', db.motos, ['NOME', 'ID'], 'motos');
    // ATUALIZADO: Incluindo a coluna RÁDIO para Cavalos
    draw('lista-veic', db.veics, ['PREFIXO', 'RADIO'], 'veics'); 
    draw('lista-imp', db.imps, ['Nº', 'TIPO'], 'imps');
}
function deleteBase(t, i) { db[t].splice(i,1); save(); renderBaseListas(); }
function prepararNovaFrota() {
    document.getElementById('f_idx').value = "-1";
    updateSelect('f_veic', db.veics, v => v.prefixo);
    updateSelect('f_moto', db.motos, m => m.nome);
    updateSelect('f_imp', db.imps, i => i.num);
    document.getElementById('modalFrotaEdit').style.display = 'flex';
}
function prepararEdicaoFrota(i) {
    prepararNovaFrota();
    const f = db.frota[i];
    document.getElementById('f_idx').value = i;
    document.getElementById('f_veic').value = f.veic; document.getElementById('f_moto').value = f.moto;
    document.getElementById('f_imp').value = f.imp; document.getElementById('f_situ').value = f.situ;
    document.getElementById('f_manut').value = f.manut;
}
function salvarStatusFrota() {
    const i = document.getElementById('f_idx').value;
    const antigoVeic = i !== "-1" ? db.frota[i].veic : null; // Guarda o nome do veículo antes de mudar

    const obj = {
        veic: document.getElementById('f_veic').value, 
        moto: document.getElementById('f_moto').value,
        imp: document.getElementById('f_imp').value, 
        situ: document.getElementById('f_situ').value, 
        manut: document.getElementById('f_manut').value
    };

    if(i==="-1") {
        db.frota.push(obj); 
    } else {
        db.frota[i] = obj;
        
        // NOVO: Atualiza fretes em andamento que usam este veículo
        db.agendamentos.forEach(agend => {
            if (agend.status === 'ANDAMENTO' && agend.veic_real === antigoVeic) {
                agend.veic_real = obj.veic;
                agend.moto_real = obj.moto;
                // Opcional: atualizar a prancha se necessário
                agend.prancha = obj.imp;
            }
        });
    }

    save(); 
    fecharModal('modalFrotaEdit');
}
function deleteFrota(i) { if(confirm("Remover?")) { db.frota.splice(i,1); save(); } }
function deleteAgend(id) { if(confirm("Excluir?")) { db.agendamentos = db.agendamentos.filter(x=>x.id!==id); save(); } }
function updateSelect(id, list, fn) {
    const sel = document.getElementById(id);
    sel.innerHTML = '<option value="">Selecione...</option>' + list.map(x => `<option value="${fn(x)}">${fn(x)}</option>`).join('');
}

window.onload = renderAll;
