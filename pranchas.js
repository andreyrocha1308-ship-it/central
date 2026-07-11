// --- FUNÇÃO CORRIGIDA PARA PUXAR DA ESCALA DE PROGRAMAÇÃO ---

// --- FUNÇÃO CORRIGIDA COALINHADA COM SEU BANCO DE DADOS REAL ---

// --- FUNÇÃO 100% CORRIGIDA E ALINHADA COM O SEU BANCO REAL (db.viagens) ---

// --- FUNÇÃO CORRIGIDA PARA MOSTRAR APENAS VEÍCULOS COM FRETE ---

// --- FUNÇÃO COM O NOVO LAYOUT (MOTORISTA NO TOPO DE CADA TURNO) ---

// --- FUNÇÃO AJUSTADA: LAYOUT IDÊNTICO À IMAGEM 1 (SERVIÇO LOGO ABAIXO DO MOTORISTA) ---

// --- FUNÇÃO AJUSTADA: SERVIÇOS SEPARADOS POR HORÁRIO OPERACIONAL ---

// --- FUNÇÃO COM LARGURAS FIXAS PADRONIZADAS E QUEBRA DE LINHA AUTOMÁTICA ---

function abrirEscalaUnificada() {
    const container = document.getElementById('containerEscalaUnificada');
    if (!container) return;

    const todosFretes = db.viagens || [];

    if (todosFretes.length === 0) {
        container.innerHTML = '<p style="font-size:12px; color:#aaa; text-align:center; padding:30px;">Nenhuma programação cadastrada na base de dados (Turnos A, B ou C).</p>';
        document.getElementById('modalEscalaUnificada').style.display = 'flex';
        return;
    }

    // Estrutura de agrupamento por Frota
    const estruturaEscala = {};
    const frotasComProgramacao = new Set();

    // 1. MAPEIA E FILTRA OS DADOS DO BANCO
    todosFretes.forEach(f => {
        if (!f.veiculo || !f.turno) return; 
        
        const frotaNome = f.veiculo;
        const turnoNome = f.turno; // 'A', 'B' ou 'C'

        frotasComProgramacao.add(frotaNome);

        if (!estruturaEscala[frotaNome]) {
            estruturaEscala[frotaNome] = {
                veic: frotaNome,
                programacoes: {
                    'A': { motorista: '', horarios: [] },
                    'B': { motorista: '', horarios: [] },
                    'C': { motorista: '', horarios: [] }
                }
            };
        }
        
        const prog = estruturaEscala[frotaNome].programacoes[turnoNome];
        if (prog) {
            if (!prog.motorista && f.motorista) {
                prog.motorista = f.motorista;
            }

            let contatosTexto = '';
            if (Array.isArray(f.contatos)) {
                contatosTexto = f.contatos.map(c => c.nome + (c.localizacao ? ` (${c.localizacao})` : '')).join(' / ');
            } else if (f.contatos) {
                contatosTexto = f.contatos;
            }

            prog.horarios.push({
                horario: f.horario || '--:--',
                cidade: f.cidade || 'N/I',
                servico: f.servico || 'LANÇAMENTO',
                contatos: contatosTexto
            });
        }
    });

    const listaFiltrada = Object.values(estruturaEscala).filter(v => frotasComProgramacao.has(v.veic));

    listaFiltrada.sort((a, b) => {
        return String(a.veic).localeCompare(String(b.veic), undefined, {numeric: true, sensitivity: 'base'});
    });

    // 2. MONTAGEM DA TABELA COM TRAVAMENTO DE LARGURAS (TOTAL DE 1030px)
    // table-layout: fixed força o navegador a respeitar rigidamente os tamanhos em px
    let htmlTable = `
        <table class="tabela-viva" style="width: 1030px; table-layout: fixed; border-collapse: collapse; font-size: 11px; text-transform: uppercase; background:#ffffff; color:#000000; word-wrap: break-word; overflow-wrap: break-word;">
            <thead>
                <tr style="background-color: #004A2F; color: #ffffff;">
                    <th style="border: 1px solid #333; padding: 12px; width: 70px; text-align:center; font-size: 12px;">FROTA</th>
                    <th style="border: 1px solid #333; padding: 12px; width: 320px; text-align:center; font-size: 12px;">TURNO A</th>
                    <th style="border: 1px solid #333; padding: 12px; width: 320px; text-align:center; font-size: 12px;">TURNO B</th>
                    <th style="border: 1px solid #333; padding: 12px; width: 320px; text-align:center; font-size: 12px;">TURNO C</th>
                </tr>
            </thead>
            <tbody>
    `;

    listaFiltrada.forEach(v => {
        htmlTable += `
            <tr style="border: 1px solid #333;">
                <td style="border: 1px solid #333; font-weight: bold; text-align: center; background: #f2f2f2; font-size:14px; color: #004A2F; width: 70px;">${v.veic}</td>
        `;

        ['A', 'B', 'C'].forEach(turno => {
            const prog = v.programacoes[turno];
            
            prog.horarios.sort((a, b) => a.horario.localeCompare(b.horario));

            htmlTable += `
                <td style="border: 1px solid #333; background:#fff; vertical-align: top; padding: 0; width: 320px;">
                    
                    <div style="background: #e6f2ed; text-align: center; padding: 8px; border-bottom: 1px solid #333; font-weight: bold; font-size: 11px; color: #004A2F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        👤 ${prog.motorista || '---'}
                    </div>
                    
                    <div style="padding: 6px;">
                        <table style="width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 10px;">
                            <tbody>
            `;

            if (prog.horarios.length === 0) {
                htmlTable += `<tr><td style="text-align:center; color:#999; padding: 8px;">---</td></tr>`;
            } else {
                prog.horarios.forEach(h => {
                    htmlTable += `
                        <tr style="border-bottom: 1px dashed #ccc;">
                            <td style="width: 42px; font-weight: bold; color: #1976D2; padding: 6px 0; vertical-align: top; font-size: 11px;">${h.horario}</td>
                            
                            <td style="padding: 6px 0 6px 6px; text-align: left; vertical-align: top; word-break: break-word; max-width: 266px;">
                                <b style="font-size: 11px; color: #111; display: block; margin-bottom: 2px;">📍 ${h.cidade}</b>
                                
                                <div style="font-size: 10px; font-weight: bold; color: #c0392b; background: #fdf2f2; padding: 2px 5px; border-radius: 3px; display: block; width: fit-content; margin: 3px 0; border: 1px solid #f9d5d5; word-break: break-word;">
                                    🔧 ${h.servico}
                                </div>
                                
                                ${h.contatos ? `<div style="color:#555; font-size:9px; font-weight: 500; margin-top: 2px; word-break: break-word;">📞 ${h.contatos}</div>` : ''}
                            </td>
                        </tr>
                    `;
                });
            }

            htmlTable += `
                            </tbody>
                        </table>
                    </div>
                </td>
            `;
        });

        htmlTable += `</tr>`;
    });

    htmlTable += `</tbody></table>`;
    container.innerHTML = htmlTable;

    document.getElementById('modalEscalaUnificada').style.display = 'flex';
}
function baixarEscalaUnificadaComoImagem() {
    // 1. Captura a tabela real que está montada na tela
    const tabelaOriginal = document.querySelector('#containerEscalaUnificada table');
    
    if (!tabelaOriginal) {
        alert("Não há dados na tabela para exportar!");
        return;
    }

    // 2. Cria o contêiner fantasma para o print fora da área de corte
    const divTemporaria = document.createElement('div');
    divTemporaria.style.position = 'absolute';
    divTemporaria.style.top = '-9999px';
    divTemporaria.style.left = '-9999px';
    divTemporaria.style.width = '1050px'; // Largura com margem de segurança para os 1030px da tabela
    divTemporaria.style.background = '#ffffff';
    divTemporaria.style.padding = '15px';
    divTemporaria.style.boxSizing = 'border-box';

    // 3. Clona a tabela e joga dentro do contêiner
    const tabelaClonada = tabelaOriginal.cloneNode(true);
    tabelaClonada.style.width = '1030px'; // Garante o tamanho travado
    tabelaClonada.style.margin = '0 auto';
    divTemporaria.appendChild(tabelaClonada);
    document.body.appendChild(divTemporaria);

    // 4. FORÇA A ALTURA DO CONTÊINER A SER IGUAL À ALTURA REAL DE TODAS AS LINHAS
    // Isso impede que o html2canvas corte o final da imagem
    const alturaReal = divTemporaria.scrollHeight;
    divTemporaria.style.height = alturaReal + 'px';

    // Mudança visual no botão para o operador ver que está gerando
    const btnSalvar = document.querySelector("button[onclick='baixarEscalaUnificadaComoImagem()']");
    const textoOriginal = btnSalvar ? btnSalvar.innerHTML : "";
    if (btnSalvar) btnSalvar.innerHTML = "⏳ GERANDO ESCALA COMPLETA...";

    // 5. ADICIONA UM PEQUENO TIMEOUT (DELAY) ANTES DO PRINT
    // Dá tempo para o navegador processar os tamanhos exatos das frotas
    setTimeout(() => {
        html2canvas(divTemporaria, {
            backgroundColor: '#ffffff',
            scale: 2, // Mantém a alta definição para leitura no WhatsApp
            logging: false,
            useCORS: true,
            width: 1050,
            height: alturaReal + 30 // Altura real + sobra do padding de segurança
        }).then(canvas => {
            const imagemBase64 = canvas.toDataURL('image/png');
            const linkDownload = document.createElement('a');
            
            const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            linkDownload.download = `ESCALA_UNIFICADA_${dataAtual}.png`;
            linkDownload.href = imagemBase64;
            
            document.body.appendChild(linkDownload);
            linkDownload.click();
            document.body.removeChild(linkDownload);

            // Limpa a div fantasma do sistema
            document.body.removeChild(divTemporaria);
            if (btnSalvar) btnSalvar.innerHTML = textoOriginal;
        }).catch(err => {
            console.error("Erro ao gerar imagem: ", err);
            alert("Falha ao gerar o arquivo de imagem.");
            if (divTemporaria.parentNode) document.body.removeChild(divTemporaria);
            if (btnSalvar) btnSalvar.innerHTML = textoOriginal;
        });
    }, 250); // 250 milissegundos de espera são suficientes para o motor gráfico se alinhar
}
    // Adiciona uma nova linha de Contato + Localização no modal informado
function adicionarLinhaContato(containerId, nomeVal = '', localVal = '') {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = 'linha-contato';
    div.style = 'display:flex; gap:5px; align-items:center;';
    div.innerHTML = `
        <input type="text" class="c_nome" value="${nomeVal}" placeholder="Nome/Telefone" style="flex:1; padding:6px; font-size:11px; background:#333; color:white; border:1px solid #444; border-radius:4px;">
        <input type="text" class="c_local" value="${localVal}" placeholder="Localização (Opcional)" style="flex:1; padding:6px; font-size:11px; background:#333; color:white; border:1px solid #444; border-radius:4px;">
        <span style="color:#ff4444; font-weight:bold; cursor:pointer; padding:0 5px; font-size:14px;" onclick="this.parentElement.remove()">×</span>
    `;
    container.appendChild(div);
}

// Captura as linhas de contatos preenchidas na tela e transforma em Array de Objetos
function obterContatosDoContainer(containerId) {
    const container = document.getElementById(containerId);
    const linhas = container.querySelectorAll('.linha-contato');
    const listaContatos = [];
    
    linhas.forEach(linha => {
        const nome = linha.querySelector('.c_nome').value.trim().toUpperCase();
        const local = linha.querySelector('.c_local').value.trim().toUpperCase();
        
        if (nome) { // Só salva se ao menos o nome/telefone estiver preenchido
            listaContatos.push({ nome: nome, localizacao: local });
        }
    });
    return listaContatos;
}
// Variável de controle interna do Popup para saber qual aba está visualizando
let turnoSelecionadoProg = 'A';

function abrirPopupProgramacao() {
    document.getElementById('modalNovaProgramacao').style.display = 'flex';
    
    // Pega por padrão o turno que já está ativo no sistema principal (db.config.turno)
    let turnoAtivo = (db.config && db.config.turno) ? db.config.turno : 'A';
    mudarTurnoProg(turnoAtivo);
    
    atualizarSelectsFormProg();
}

// Atualiza as opções com base no cadastro fixo da base de dados (db.veiculos e db.motos)
function atualizarSelectsFormProg() {
    const selVeic = document.getElementById('f_prog_veic_select');
    const selMoto = document.getElementById('f_prog_moto_select');

    selVeic.innerHTML = '<option value="">-- Selecione --</option>';
    db.veiculos.forEach(v => {
        selVeic.innerHTML += `<option value="${v.nome}">FROTA ${v.nome} (${v.modelo || 'Sem Modelo'})</option>`;
    });

    selMoto.innerHTML = '<option value="">-- Selecione --</option>';
    db.motos.forEach(m => {
        let nome = typeof m === 'object' ? m.nome : m;
        selMoto.innerHTML += `<option value="${nome}">${nome}</option>`;
    });
}

// Troca de Aba e recarrega os dados correspondentes
function mudarTurnoProg(turno) {
    turnoSelecionadoProg = turno;
    
    // Atualiza classes visuais dos botões
    document.getElementById('tabProgA').classList.remove('active');
    document.getElementById('tabProgB').classList.remove('active');
    document.getElementById('tabProgC').classList.remove('active');
    document.getElementById('tabProg' + turno).classList.add('active');
    
    // Atualiza labels escritas
    document.getElementById('lbl_turno_atual').innerText = 'TURNO ' + turno;
    document.getElementById('lbl_turno_lista').innerText = 'TURNO ' + turno;
    
    renderListaFretesProg();
    renderProgFretes()
}

// Registra um novo frete no banco mantendo o formato oficial compatível
function salvarFreteProg() {
    let veic = document.getElementById('f_prog_veic_select').value;
    let moto = document.getElementById('f_prog_moto_select').value;
    let hora = document.getElementById('f_prog_hora').value;
    let cidade = document.getElementById('f_prog_cidade').value.trim().toUpperCase();
    let serv = document.getElementById('f_prog_serv').value.trim().toUpperCase();
    let contatosRaw = document.getElementById('f_prog_contatos').value.trim().toUpperCase();

    if (!veic || !hora || !cidade || !serv) {
        alert("Por favor, preencha pelo menos: Equipamento, Horário, Cidade e Serviço.");
        return;
    }

    // Estrutura os contatos no padrão exato de Array exigido pelo monitor do sistema
    let listaContatos = [];
    if (contatosRaw) {
        listaContatos.push({ nome: contatosRaw, localizacao: "" });
    }

    // Cria o objeto idêntico ao gerado pelo botão "+" do monitor principal
    let novoFrete = {
        id: Date.now(), // ID numérico único do timestamp
        veiculo: veic,
        motorista: moto,
        horario: hora,
        cidade: cidade,
        servico: serv,
        contatos: listaContatos,
        tipo: 'PENDENTE',
        turno: turnoSelecionadoProg // Vincula ao Turno da aba selecionada (A, B ou C)
    };

    if (!db.viagens) db.viagens = [];
    db.viagens.push(novoFrete);
    
    // Dispara a gravação persistente no localStorage
    save();

    // Limpa o formulário do popup para novos lançamentos
    document.getElementById('f_prog_hora').value = '';
    document.getElementById('f_prog_cidade').value = '';
    document.getElementById('f_prog_serv').value = '';
    document.getElementById('f_prog_contatos').value = '';

    // Renderiza novamente a lista do popup e atualiza a timeline do monitor principal
    renderProgFretes();
    renderBase(); 
    alert("Frete programado e salvo com sucesso!");
}
// Renderiza a lista de fretes agrupando por Frota buscando da gaveta exclusiva do popup
function renderListaFretesProg() {
    const container = document.getElementById('list-prog-fretes');
    if (!container) return; 

    let html = '';

    // Garante que a gaveta exista antes de tentar filtrar
    if (!db.viagens_popup) {
        db.viagens_popup = [];
    }

    // FILTRA DA GAVETA EXCLUSIVA DO POPUP
    const viagensFiltradas = db.viagens_popup.filter(v => v.turno === turnoSelecionadoProg);

    if (viagensFiltradas.length === 0) {
        html = `<p style="font-size:11px; color:#666; text-align:center; padding-top:30px;">Nenhuma programação gravada para o Turno ${turnoSelecionadoProg}.</p>`;
    } else {
        const gruposPorVeiculo = {};

        viagensFiltradas.forEach(v => {
            if (!gruposPorVeiculo[v.veic]) {
                gruposPorVeiculo[v.veic] = {
                    veic: v.veic,
                    moto: v.moto || 'NÃO INFORMADO',
                    fretes: []
                };
            }
            gruposPorVeiculo[v.veic].fretes.push(v);
        });

        for (let veicId in gruposPorVeiculo) {
            const grupo = gruposPorVeiculo[veicId];

            grupo.fretes.sort((a, b) => ((a.hora_escala || '') > (b.hora_escala || '') ? 1 : -1));

            const temPendente = grupo.fretes.some(f => f.status !== 'OK');
            const corBorda = temPendente ? 'var(--usa-amarelo)' : 'var(--usa-verde-medio)';

            html += `
                <div class="card-prog-mini" style="border-left: 4px solid ${corBorda}; margin-bottom: 12px; background: #252525; padding: 12px; border-radius: 6px; font-size:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #333; padding-bottom: 6px; margin-bottom: 8px;">
                        <span>🚚 <b style="font-size:13px; color:var(--usa-verde-claro);">FROTA ${grupo.veic}</b></span>
                        <span style="font-size: 11px; color: #aaa;">👤 ${grupo.moto}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">`;

            grupo.fretes.forEach(f => {
                let htmlContatos = '';
                if (Array.isArray(f.contatos)) {
                    f.contatos.forEach(c => {
                        htmlContatos += `<div style="font-size: 11px; color: var(--usa-azul); margin-top: 2px; line-height:1.2;">`;
                        htmlContatos += `📞 <b>${c.nome}</b>`;
                        if (c.localizacao) {
                            htmlContatos += ` <span style="color:#aaa;">📍 (${c.localizacao})</span>`;
                        }
                        htmlContatos += `</div>`;
                    });
                } else if (f.contatos) {
                    htmlContatos = `<div style="font-size: 11px; color: var(--usa-azul); margin-top: 2px;">📞 ${f.contatos}</div>`;
                }

                html += `
                    <div style="background: #1c1c1c; padding: 6px 8px; border-radius: 4px; display: flex; justify-content: space-between; align-items: flex-start; border-left: 2px solid #555;">
                        <div style="flex: 1; padding-right: 10px;">
                            <span style="color: var(--usa-amarelo); font-weight: bold; font-size: 11px; display: inline-block; margin-bottom: 2px;">⏰ ${f.hora_escala || '--:--'}</span>
                            <div style="font-weight: 600; color: #fff;">📍 ${f.cidade}</div>
                            <div style="font-size: 11px; color: #bbb; margin-top: 1px;">🔧 ${f.serv}</div>
                            ${htmlContatos}
                        </div>
                        <span style="color:#ff4444; font-weight:bold; cursor:pointer; font-size:14px; padding: 0 4px;" title="Remover este horário" onclick="excluirFreteProg(${f.id})">×</span>
                    </div>`;
            });

            html += `</div></div>`;
        }
    }
    renderProgFretes()
    container.innerHTML = html;
}
// Permite deletar programações removendo da gaveta correta do popup
function excluirFreteProg(id) {
    if (confirm("Deseja realmente remover esta programação?")) {
        if (!db.viagens_popup) db.viagens_popup = [];
        
        // Remove da gaveta exclusiva do popup
        db.viagens_popup = db.viagens_popup.filter(v => v.id !== id);
        save();
        renderProgFretes()
        renderListaFretesProg(); // Corrigido o typo aqui para o nome correto
    }
}
function abrirEditarFrete(id) {
    const v = db.viagens.find(x => x.id === id);
    if (!v) return;

    document.getElementById('edit_f_id').value = v.id;
    document.getElementById('edit_f_hora_escala').value = v.hora_escala || "";
    document.getElementById('edit_f_cidade').value = v.cidade || "";
    document.getElementById('edit_f_serv').value = v.serv || "";

    // Limpa e reconstrói as linhas de contatos salvas
    const container = document.getElementById('container-contatos-editar');
    container.innerHTML = '';
    
    if (Array.isArray(v.contatos) && v.contatos.length > 0) {
        v.contatos.forEach(c => {
            adicionarLinhaContato('container-contatos-editar', c.nome, c.localizacao);
        });
    } else {
        // Fallback caso seja um frete antigo que era texto simples string
        const textoAntigo = typeof v.contatos === 'string' ? v.contatos : '';
        adicionarLinhaContato('container-contatos-editar', textoAntigo, '');
    }

    document.getElementById('modalEditarFrete').style.display = 'flex';
}

function prepararDadosParaEscala() {
    let conteudoEscala = [];

    // 1. Percorre os veículos na ordem exata que aparecem na tela
    db.veiculos.forEach(veic => {
        // 2. Filtra as viagens deste veículo específico
        const viagensDoVeiculo = db.viagens.filter(v => v.veic === veic.nome && v.turno === db.config.turno);
        
        // 3. Adiciona na lista do relatório mantendo a ordem dos cards
        viagensDoVeiculo.forEach(v => {
            conteudoEscala.push({
                prefixo: veic.nome,
                motorista: db.v_motos[veic.nome] || '---',
                cidade: v.cidade,
                serv: v.serv,
                horario: v.hora_escala || v.sai
            });
        });
    });

    return conteudoEscala;
}
function salvarFrete() {
    const f_veic = document.getElementById('f_veic').value;
    const f_cidade = document.getElementById('f_cidade').value.toUpperCase();
    const f_serv = document.getElementById('f_custom').value.toUpperCase();
    const f_hora = document.getElementById('f_hora_escala').value;
    
    // Captura a lista de contatos dinâmica
    const listaContatos = obterContatosDoContainer('container-contatos-novo');

    if (!f_veic) { alert("Selecione um veículo!"); return; }

    const novo = {
        id: Date.now(),
        veic: f_veic,
        turno: db.config.turno,
        cidade: f_cidade,
        moto: f_cidade, 
        serv: f_serv,
        hora_escala: f_hora,
        sai: f_hora,
        che: '',
        contatos: listaContatos, // Array de objetos gravada aqui
        status: 'PENDENTE'
    };

    db.viagens.push(novo);
    save();
    render();
    fecharModal('modalFrete');

    // Limpa formulário e reseta linhas de contato extras
    document.getElementById('f_cidade').value = '';
    document.getElementById('f_custom').value = '';
    document.getElementById('container-contatos-novo').innerHTML = `
        <div class="linha-contato" style="display:flex; gap:5px; align-items:center;">
            <input type="text" class="c_nome" placeholder="Nome/Telefone" style="flex:1; padding:6px; font-size:11px; background:#333; color:white; border:1px solid #444; border-radius:4px;">
            <input type="text" class="c_local" placeholder="Localização (Opcional)" style="flex:1; padding:6px; font-size:11px; background:#333; color:white; border:1px solid #444; border-radius:4px;">
            <span style="color:#666; font-weight:bold; padding:0 5px;">-</span>
        </div>`;
}

async function gerarImagemEscala() {
    const area = document.createElement('div');
    area.style = "padding:20px; background:#f0f2f5; color:#000; width:500px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;";
    
    let html = `
        <div style="text-align:center; border-bottom:3px solid #004A2F; margin-bottom:20px; padding-bottom:10px; background:white; border-radius:8px 8px 0 0;">
            <h2 style="margin:0; color:#004A2F; font-size:20px;">ESCALA DE FRETES DIRECIONADOS</h2>
            <p style="margin:5px 0; font-weight:bold; color:#666;">${new Date().toLocaleDateString()}</p>
        </div>`;

    // 1. Agrupar viagens por Veículo (apenas as que não estão OK)
    const grupos = {};
    db.viagens.filter(v => v.status !== 'OK').forEach(v => {
        if (!grupos[v.veic]) {
            grupos[v.veic] = {
                motorista: v.moto,
                veiculo: v.veic,
                fretes: []
            };
        }
        grupos[v.veic].fretes.push(v);
    });

    // 2. Renderizar os cards agrupados
    for (let idVeic in grupos) {
        const grupo = grupos[idVeic];
        
        // Ordenar os fretes do mesmo carro por hora
        grupo.fretes.sort((a, b) => (a.hora_escala > b.hora_escala ? 1 : -1));

        html += `
        <div style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 15px; overflow: hidden; border-left: 5px solid #004A2F;">
            <div style="background: #f8f9fa; padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; font-size: 16px; color: #004A2F;">${grupo.motorista}</span>
                <span style="background: #004A2F; color: white; padding: 2px 8px; border-radius: 4px; font-size: 14px; font-weight: bold;">${grupo.veiculo}</span>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <tbody>`;

        grupo.fretes.forEach((f, index) => {
            const borderTop = index > 0 ? "border-top: 1px solid #f0f0f0;" : "";
            html += `
                <tr style="${borderTop}">
                    <td style="padding: 12px; width: 70px; font-weight: bold; color: #d32f2f; text-align: center; vertical-align: top; font-size: 15px;">
                        ${f.hora_escala || '--:--'}
                    </td>
                    <td style="padding: 12px; font-size: 14px; line-height: 1.4;">
                        <div style="font-weight: bold; color: #333; margin-bottom: 2px;">${f.cidade || 'CIDADE NÃO INFORMADA'}</div>
                        <div style="color: #555;">${f.serv}</div>
                        ${f.contatos ? '<div style="margin-top: 4px; color: #007bff; font-size: 12px; font-weight: bold;">📞 ' + f.contatos + '</div>' : ''}
                    </td>
                </tr>`;
        });

        html += `
                </tbody>
            </table>
        </div>`;
    }

    if (Object.keys(grupos).length === 0) {
        html += '<p style="text-align:center; color:#888;">Nenhum frete programado para este turno.</p>';
    }

    area.innerHTML = html;
    document.body.appendChild(area);

    // Converte para imagem
    html2canvas(area, { 
        scale: 2,
        backgroundColor: "#f0f2f5" 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `ESCALA_${new Date().getHours()}h.png`;
        link.href = canvas.toDataURL();
        link.click();
        document.body.removeChild(area);
    });
}
    // Inicializa o objeto de turnos no localStorage se não existir
let escalasTurnos = JSON.parse(localStorage.getItem('v6_presets_turnos')) || {
    "A": { motoristas: {}, fretes: [] },
    "B": { motoristas: {}, fretes: [] },
    "C": { motoristas: {}, fretes: [] }
};

function salvarConfigTurno(turno) {
    if(!confirm(`Deseja salvar a disposição atual da tela como padrão para o TURNO ${turno}?`)) return;

    // Salva o vínculo Motorista x Frota atual
    escalasTurnos[turno].motoristas = JSON.parse(JSON.stringify(db.v_motos));
    
    // Salva os fretes que estão como "PENDENTE" agora para serem gerados automaticamente
    escalasTurnos[turno].fretes = db.viagens
    .filter(v => v.status === 'PENDENTE')
    .map(v => ({ 
        veic: v.veic, 
        serv: v.serv 
    }));

    localStorage.setItem('v6_presets_turnos', JSON.stringify(escalasTurnos));
    save();
    alert(`Configuração do Turno ${turno} updated com sucesso!`);
}

function aplicarTurno(turno) {
    if(!confirm(`Tem certeza que quer aplicar as configurações do turno?`)) return;
    const config = escalasTurnos[turno];
    
    // Verifica se hay configuração salva para o turno selecionado
    if (!config || Object.keys(config.motoristas).length === 0) {
        return alert("Nenhuma configuração salva para este turno. Vá em 'Base de Dados' para salvar.");
    }

    // 1. Atualiza os motoristas nos carros conforme o preset salvo
    db.v_motos = JSON.parse(JSON.stringify(config.motoristas));

    // 2. LIMPEZA TOTAL: Remove TODOS os fretes atuais (Pendentes, Rodando e Concluídos)
    db.viagens = []; 
    
    // 3. Insere apenas os fretes que fazem parte do preset do turno
    config.fretes.forEach(f => {
        db.viagens.push({
            id: Date.now() + Math.random(),
            veic: f.veic,
            moto: db.v_motos[f.veic] || "N/A",
            serv: f.serv,
            status: 'PENDENTE',
            sai: '--:--',
            che: '--:--'
        });
    });

    // Salva as alterações no localStorage e atualiza a interface visual
    save(); 
}
function abrirCadastroMotoristas() {
    const modalMoto = document.getElementById('modalMotoristas');
    if (modalMoto) {
        // Move o modal para o final do corpo do HTML (garante que fique na frente)
        document.body.appendChild(modalMoto); 
        modalMoto.style.display = 'flex';
        renderTabelaMotoristas();
    }
}
function fecharCadastroMotoristas() {
    // 1. Localiza o modal pelo ID
    const modalMoto = document.getElementById('modalMotoristas');
    
    if (modalMoto) {
        // 2. Esconde o modal
        modalMoto.style.display = 'none';
        
        // 3. Remove a trava de z-index (opcional, mas seguro)
        modalMoto.style.zIndex = "-1"; 
    }
    
    // 4. Garante que o modal de Base de Dados (que fica atrás) continue funcional
    const modalBase = document.getElementById('modalBase');
    if (modalBase) {
        modalBase.style.zIndex = '1000';
    }
}
function salvarMotoristaLongo() {
    const nome = document.getElementById('m_nome_det').value.trim().toUpperCase();
    const cracha = document.getElementById('m_cracha').value;
    const escala = document.getElementById('m_escala').value;
    const folga = document.getElementById('m_folga').value;

    if(!nome) return alert("Digite o nome!");

    db.motos.push({
        id: Date.now(),
        nome: nome,
        cracha: cracha || '-',
        escala: escala,
        proxFolga: folga || '-'
    });

    document.getElementById('m_nome_det').value = '';
    save();
    renderBase();
    renderTabelaMotoristas();
}
function renderTabelaMotoristas() {
    const corpo = document.getElementById('tabela-m-corpo');
    corpo.innerHTML = db.motos.map(m => `
        <tr style="border-bottom:1px solid #333;">
            <td style="padding:8px; font-weight:bold;">${m.nome}</td>
            <td>${m.cracha || '-'}</td>
            <td>${m.proxFolga || '-'}</td>
            <td><button onclick="delBase('motos', ${m.id}); renderTabelaMotoristas();" style="background:none; border:none; color:red; cursor:pointer;">×</button></td>
        </tr>
    `).join('');
}

function excluirMotorista(id) {
    if(confirm("Deseja remover este motorista permanentemente?")) {
        db.motos = db.motos.filter(x => x.id !== id);
        save();
        renderListaMotoristas();
        renderBase();
    }
}
// Abre o modal de QRU específico da prancha
function abrirModalQRUPra(id) {
    // 1. Fecha o modal de pranchas primeiro
    fecharModal('modalPranchas');

    // 2. Busca os dados da prancha
    const p = db.pranchas.find(x => x.id === id);
    
    // 3. Preenche o novo modal
    document.getElementById('qru_pra_id').value = id;
    document.getElementById('qru_pra_display').value = p.prancha || p.cavalo;
    document.getElementById('qru_pra_motivo').value = p.motivoQRU || '';
    document.getElementById('qru_pra_previsao').value = p.previsaoQRU || '';
    
    // 4. Mostra/Esconde o botão de remover
    document.getElementById('btn_limpar_qru_pra').style.display = p.qru ? 'block' : 'none';
    
    // 5. Abre o modal do QRU
    document.getElementById('modalQRUPra').style.display = 'flex';
}

// Salva as informações de manutenção na prancha
function salvarQRUPra() {
    const id = Number(document.getElementById('qru_pra_id').value);
    const motivo = document.getElementById('qru_pra_motivo').value.toUpperCase();
    const prev = document.getElementById('qru_pra_previsao').value.toUpperCase();
    const idx = db.pranchas.findIndex(x => x.id === id);
    
    db.pranchas[idx].qru = true;
    db.pranchas[idx].motivoQRU = motivo;
    db.pranchas[idx].previsaoQRU = prev;
    
    save(); 
    fecharModal('modalQRUPra'); 
    abrirPranchas(); // Reabre a lista de pranchas
}

function limparQRUPra() {
    const id = Number(document.getElementById('qru_pra_id').value);
    const idx = db.pranchas.findIndex(x => x.id === id);
    
    db.pranchas[idx].qru = false;
    db.pranchas[idx].motivoQRU = '';
    db.pranchas[idx].previsaoQRU = '';
    
    save(); 
    fecharModal('modalQRUPra'); 
    abrirPranchas(); // Reabre a lista de pranchas
}
let db = {
    veiculos: JSON.parse(localStorage.getItem('v6_veics')) || [],
    motos: JSON.parse(localStorage.getItem('v6_motos')) || [],
    servicos: JSON.parse(localStorage.getItem('v6_servs')) || [],
    viagens: JSON.parse(localStorage.getItem('v6_viagens')) || [],
    v_motos: JSON.parse(localStorage.getItem('v6_vmotos')) || {},
    controlador: localStorage.getItem('v6_controlador') || '',
    pranchas: JSON.parse(localStorage.getItem('v6_pranchas')) || [],
    obs_turno: localStorage.getItem('v6_obs_turno') || ''
};

function save() {
    localStorage.setItem('v6_veics', JSON.stringify(db.veiculos));
    localStorage.setItem('v6_motos', JSON.stringify(db.motos));
    localStorage.setItem('v6_servs', JSON.stringify(db.servicos));
    localStorage.setItem('v6_viagens', JSON.stringify(db.viagens));
    localStorage.setItem('v6_vmotos', JSON.stringify(db.v_motos));
    localStorage.setItem('v6_controlador', db.controlador);
    localStorage.setItem('v6_pranchas', JSON.stringify(db.pranchas));
    localStorage.setItem('v6_obs_turno', db.obs_turno || '');
    
    if (typeof firestoreDb !== 'undefined') {
        firestoreDb.collection("central_db").doc("pranchas").set({
            veiculos: db.veiculos,
            motos: db.motos,
            servicos: db.servicos,
            viagens: db.viagens,
            v_motos: db.v_motos,
            controlador: db.controlador,
            pranchas: db.pranchas,
            obs_turno: db.obs_turno || '',
            presets_turnos: escalasTurnos
        }).catch(err => console.error("Erro ao salvar pranchas no Firebase:", err));
    }
    
    render();
}

// Sincronização em Tempo Real com o Firebase Firestore
if (typeof firestoreDb !== 'undefined') {
    // Escuta mudanças nos dados de Pranchas
    firestoreDb.collection("central_db").doc("pranchas").onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            db.veiculos = data.veiculos || [];
            db.motos = data.motos || [];
            db.servicos = data.servicos || [];
            db.viagens = data.viagens || [];
            db.v_motos = data.v_motos || {};
            db.controlador = data.controlador || '';
            db.pranchas = data.pranchas || [];
            db.obs_turno = data.obs_turno || '';
            
            if (data.presets_turnos) {
                escalasTurnos = data.presets_turnos;
                localStorage.setItem('v6_presets_turnos', JSON.stringify(escalasTurnos));
            }
            
            // Sync to local storage
            localStorage.setItem('v6_veics', JSON.stringify(db.veiculos));
            localStorage.setItem('v6_motos', JSON.stringify(db.motos));
            localStorage.setItem('v6_servs', JSON.stringify(db.servicos));
            localStorage.setItem('v6_viagens', JSON.stringify(db.viagens));
            localStorage.setItem('v6_vmotos', JSON.stringify(db.v_motos));
            localStorage.setItem('v6_controlador', db.controlador);
            localStorage.setItem('v6_pranchas', JSON.stringify(db.pranchas));
            localStorage.setItem('v6_obs_turno', db.obs_turno);
            
            // Atualiza o textarea na tela se o usuário não estiver focado nele atualmente
            const obsTextarea = document.getElementById('obs_turno');
            if (obsTextarea && document.activeElement !== obsTextarea) {
                obsTextarea.value = db.obs_turno;
            }

            render();
        } else {
            // Se o documento não existe no Firestore, inicializa com o estado local atual
            save();
        }
    }, (error) => {
        console.error("Erro no listener de pranchas do Firebase Firestore:", error);
    });
    
    // Escuta mudanças nos dados do Dashboard (para pegar os agendamentos atualizados)
    firestoreDb.collection("central_db").doc("dashboard").onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            const agendamentos = data.agendamentos || [];
            localStorage.setItem('usa_agendamentos', JSON.stringify(agendamentos));
            render(); // Re-renderiza para atualizar os fretes na tela de pranchas
        }
    });
}

// --- FUNÇÕES AUXILIARES ---
function obterAgendamentosExternos() {
    return JSON.parse(localStorage.getItem('usa_agendamentos')) || [];
}

// --- FUNÇÕES PRANCHAS ---
function abrirPranchas() {
    limparFormPrancha();
    renderPranchas();
    document.getElementById('modalPranchas').style.display = 'flex';
}

// Corrigido typo na função de confirmarEdicaoFrete redundante
function confirmarEdicaoFrete() {
    const idStr = document.getElementById('edit_f_id').value;
    if (!idStr) return;
    
    const id = Number(idStr);
    const item = db.viagens.find(x => x.id === id);

    if (item) {
        item.hora_escala = document.getElementById('edit_f_hora_escala').value;
        item.cidade = document.getElementById('edit_f_cidade').value.toUpperCase();
        item.serv = document.getElementById('edit_f_serv').value.toUpperCase();
        
        // Coleta os novos contatos editados
        item.contatos = obterContatosDoContainer('container-contatos-editar');

        save(); 
        fecharModal('modalEditarFrete');
        render(); 
        if (typeof renderListaFretesProg === 'function') renderListaFretesProg(); // Atualiza a lateral se existir
    }
}

function limparFormPrancha() {
    document.getElementById('p_id_edit').value = '';
    document.getElementById('p_cav').value = '';
    document.getElementById('p_pra').value = '';
    document.getElementById('p_tipo').value = '';
    document.getElementById('p_loc').value = '';
    document.getElementById('btn-p-save').innerText = 'ADICIONAR';
    document.getElementById('btn-p-save').style.background = 'var(--usa-verde-medio)';
}

function addPrancha() {
    const idEdit = document.getElementById('p_id_edit').value;
    const cav = document.getElementById('p_cav').value.toUpperCase();
    const pra = document.getElementById('p_pra').value.toUpperCase();
    const tip = document.getElementById('p_tipo').value.toUpperCase();
    const loc = document.getElementById('p_loc').value.toUpperCase();
    if(!pra && !cav) return alert("Insira ao menos um cavalo ou prancha!");
    if(idEdit) {
        const index = db.pranchas.findIndex(x => x.id == idEdit);
        db.pranchas[index] = { ...db.pranchas[index], cavalo: cav, prancha: pra, tipo: tip, local: loc };
    } else {
        db.pranchas.push({ id: Date.now(), cavalo: cav, prancha: pra, tipo: tip, local: loc, qru: false });
    }
    limparFormPrancha(); save(); renderPranchas();
}

function editarPrancha(id) {
    const p = db.pranchas.find(x => x.id == id);
    document.getElementById('p_id_edit').value = p.id;
    document.getElementById('p_cav').value = p.cavalo;
    document.getElementById('p_pra').value = p.prancha;
    document.getElementById('p_tipo').value = p.tipo;
    document.getElementById('p_loc').value = p.local;
    document.getElementById('btn-p-save').innerText = 'SALVAR ALTERAÇÃO';
    document.getElementById('btn-p-save').style.background = 'var(--usa-azul)';
}
function moverPrancha(index, direcao) {
    const novaPos = index + direcao;
    // Verifica se a nova posição é válida dentro do array
    if (novaPos < 0 || novaPos >= db.pranchas.length) return;
    
    // Troca os elementos de lugar
    [db.pranchas[index], db.pranchas[novaPos]] = [db.pranchas[novaPos], db.pranchas[index]];
    
    save(); // Salva no localStorage e re-renderiza
    renderPranchas(); // Garante que a lista do modal atualize imediatamente
}
function renderProgFretes() {
    let container = document.getElementById('list-prog-fretes');
    if (!container) return;

    document.getElementById('lbl_turno_atual').innerText = 'TURNO ' + turnoSelecionadoProg;
    document.getElementById('lbl_turno_lista').innerText = 'TURNO ' + turnoSelecionadoProg;

    ['A', 'B', 'C'].forEach(t => {
        let btn = document.getElementById('tabProg' + t);
        if (btn) {
            if (t === turnoSelecionadoProg) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });

    if (!db.viagens) db.viagens = [];

    // 1. Filtra apenas os fretes pertencentes ao turno selecionado na Central
    let fretesFiltrados = db.viagens.filter(f => f.turno === turnoSelecionadoProg);

    if (fretesFiltrados.length === 0) {
        container.innerHTML = '<div style="padding:15px; color:#666; text-align:center; font-size:12px;">NENHUM FRETE PROGRAMADO PARA ESTE TURNO.</div>';
        return;
    }

    // 2. Agrupa os fretes por Veículo usando um Objeto Map
    let fretesAgrupados = {};
    fretesFiltrados.forEach(f => {
        if (!fretesAgrupados[f.veiculo]) {
            fretesAgrupados[f.veiculo] = [];
        }
        fretesAgrupados[f.veiculo].push(f);
    });

    // 3. Renderiza os Cards Agrupados por Veículo
    let html = '';
    
    // Varre cada frota única que possui fretes agendados
    for (let veiculo in fretesAgrupados) {
        let viagensDoCarro = fretesAgrupados[veiculo];
        
        // Ordena as viagens do carro por horário cronológico (opcional, melhora a visualização)
        viagensDoCarro.sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));

        // Inicia o Card único para o Veículo
        html += `
        <div class="card-prog-mini" style="border-left: 4px solid var(--usa-azul); margin-bottom: 12px; padding: 12px; background: #252525;">
            <div style="border-bottom: 1px solid #444; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; font-weight: bold; color: var(--usa-verde-claro);">🚛 FROTA ${veiculo}</span>
                <span style="font-size: 10px; background: rgba(25, 118, 212, 0.2); color: var(--usa-azul); padding: 2px 6px; border-radius: 10px; font-weight: bold;">
                    ${viagensDoCarro.length} ${viagensDoCarro.length === 1 ? 'VIAGEM' : 'VIAGENS'}
                </span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">`;

        // Insere as linhas de trajetos/viagens dentro do card deste carro
        viagensDoCarro.forEach((f, index) => {
            // Tratamento dinâmico para renderizar os contatos sem quebras
            let textoContatos = '';
            if (Array.isArray(f.contatos)) {
                textoContatos = f.contatos.map(c => c.nome + (c.localizacao ? ' (' + c.localizacao + ')' : '')).join(' / ');
            } else {
                textoContatos = f.contatos || '';
            }

            // Define uma linha separadora sutil caso haja mais de uma viagem no card
            let estiloLinha = index > 0 ? 'border-top: 1px dashed #3a3a3a; padding-top: 8px;' : '';

            html += `
            <div style="position: relative; padding-right: 55px; ${estiloLinha}">
                <span style="color: #fff; font-weight: bold; font-size: 12px;">⏱️ ${f.horario || '--:--'}h</span> - 
                <span style="color: var(--usa-amarelo); font-size: 11px; font-weight: 600;">${f.motorista || 'SEM MOTORISTA'}</span>
                <div class="detalhes" style="margin-top: 3px; font-size: 11px; color: #b0b0b0; line-height: 1.3;">
                    <b>DESTINO:</b> ${f.cidade}<br>
                    <b>SERVIÇO:</b> ${f.servico}
                    ${textoContatos ? `<br><span style="color: #ffa500; font-size: 10.5px;">📞 ${textoContatos}</span>` : ''}
                </div>
                
                <div style="position: absolute; top: 0px; right: 2px; display: flex; gap: 10px;">
                    <span title="Alterar Programação" style="cursor: pointer; color: var(--usa-amarelo); font-weight: bold; font-size: 13px;" onclick="alterarFreteEscala(${f.id})">✏️</span>
                    <span title="Excluir" style="cursor: pointer; color: #ff4444; font-weight: bold; font-size: 13px;" onclick="deletarFreteEscala(${f.id})">❌</span>
                </div>
            </div>`;
        });

        // Fecha a estrutura do Card do Veículo
        html += `
            </div>
        </div>`;
    }

    container.innerHTML = html;
}
// Abre o gerenciador para alterar dados do frete cadastrado
// Captura e preenche o modal de edição padrão do sistema com os dados da Escala
function alterarFreteEscala(id) {
    let frete = db.viagens.find(f => f.id == id);
    if (!frete) return;

    // Vincula os dados nos inputs padrão de edição
    document.getElementById('edit_f_id').value = frete.id;
    document.getElementById('edit_f_hora_escala').value = frete.horario || '';
    document.getElementById('edit_f_cidade').value = frete.cidade || '';
    document.getElementById('edit_f_serv').value = frete.servico || '';
    
    // Reconstrói as linhas de contato dinâmicas dentro do modal de edição
    let containerContatos = document.getElementById('container-contatos-editar');
    if (containerContatos) {
        containerContatos.innerHTML = '';
        if (Array.isArray(frete.contatos) && frete.contatos.length > 0) {
            frete.contatos.forEach(c => {
                adicionarLinhaContato('container-contatos-editar', c.nome, c.localizacao);
            });
        } else if (typeof frete.contatos === 'string' && frete.contatos) {
            adicionarLinhaContato('container-contatos-editar', frete.contatos, '');
        }
    }

    // Exibe o modal de edição nativo na tela
    document.getElementById('modalEditarFrete').style.display = 'flex';
}

// Executa a remoção completa do frete do banco de dados
function deletarFreteEscala(id) {
    if (confirm("Deseja realmente remover este frete programado?")) {
        db.viagens = db.viagens.filter(f => f.id != id);
        save();         // Atualiza o LocalStorage
        renderProgFretes(); // Atualiza a lista da Central
        renderBase();       // Atualiza a tela do Monitor principal
    }
}
// Abre o modal de edição padrão do sistema com os dados do frete da escala
function editarFreteEscala(id) {
    let frete = db.viagens.find(f => f.id === id);
    if (!frete) return;

    // Define os valores nos campos do modal de edição
    document.getElementById('edit_f_id').value = frete.id;
    document.getElementById('edit_f_hora_escala').value = frete.horario || '';
    document.getElementById('edit_f_cidade').value = frete.cidade || '';
    document.getElementById('edit_f_serv').value = frete.servico || '';
    
    // Como o popup usa um campo de texto simples para contatos, limpamos o container estruturado 
    // ou preenchemos o primeiro campo se necessário para evitar conflitos com o modal do painel principal
    let containerContatos = document.getElementById('container-contatos-editar');
    if (containerContatos) {
        containerContatos.innerHTML = '';
        if (frete.contatos) {
            adicionarLinhaContato('container-contatos-editar', frete.contatos, '');
        }
    } else {
        if (document.getElementById('edit_f_contatos')) {
            document.getElementById('edit_f_contatos').value = frete.contatos || '';
        }
    }

    // Abre o modal de edição
    document.getElementById('modalEditarFrete').style.display = 'flex';
}

function renderPranchas() {
    const body = document.getElementById('lista-pranchas-body');
    body.innerHTML = db.pranchas.map((p, index) => `
        <tr class="row-editavel" onclick="editarPrancha(${p.id})" style="border-bottom: 1px solid #333; background: ${p.qru ? 'rgba(255,68,68,0.15)' : 'transparent'}">
            <td style="padding:10px;" onclick="event.stopPropagation()">
                <div style="display:flex; flex-direction:column; gap:2px;">
                    <button class="btn-mini" onclick="moverPrancha(${index}, -1)">▲</button>
                    <button class="btn-mini" onclick="moverPrancha(${index}, 1)">▼</button>
                </div>
            </td>
            <td style="padding:10px;">${p.cavalo || '-'}</td>
            <td style="padding:10px; font-weight:bold; color:var(--usa-verde-claro)">${p.prancha || '-'}</td>
            <td style="padding:10px;">${p.tipo}</td>
            <td style="padding:10px;">${p.local}</td>
            <td style="padding:10px;" onclick="event.stopPropagation()">
                <button onclick="abrirModalQRUPra(${p.id})" 
                        style="background:${p.qru ? 'var(--usa-qru)' : '#444'}; color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; font-size:10px;">
                    ${p.qru ? 'EM QRU' : '🔧 QRU'}
                </button>
            </td>
            <td style="padding:10px;" onclick="event.stopPropagation()">
                <button onclick="delPrancha(${p.id})" style="color:var(--usa-qru); background:none; border:none; cursor:pointer; font-size:16px;">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function toggleQruPrancha(id) {
    const p = db.pranchas.find(x => x.id === id);
    p.qru = !p.qru; save(); renderPranchas();
}

function delPrancha(id) {
    if(confirm("Remover este item?")) {
        db.pranchas = db.pranchas.filter(x => x.id !== id); save(); renderPranchas();
    }
}

// --- FUNÇÕES MONITOR ---
function excluirVeiculo(id) {
    if(confirm("Deseja remover este veículo do monitor?")) {
        db.veiculos = db.veiculos.filter(x => x.id !== id); save();
    }
}

function abrirManutencao(veicNome) {
    const v = db.veiculos.find(x => x.nome === veicNome);
    document.getElementById('qru_veic_nome').value = veicNome;
    document.getElementById('qru_display_nome').value = veicNome;
    document.getElementById('qru_motivo').value = v.motivoManutencao || '';
    document.getElementById('qru_previsao').value = v.previsaoManutencao || '';
    document.getElementById('btn_remover_qru').style.display = v.emManutencao ? 'block' : 'none';
    document.getElementById('modalQRU').style.display = 'flex';
}

function salvarManutencao() {
    const nome = document.getElementById('qru_veic_nome').value;
    const v = db.veiculos.find(x => x.nome === nome);
    v.emManutencao = true;
    v.motivoManutencao = document.getElementById('qru_motivo').value.toUpperCase();
    v.previsaoManutencao = document.getElementById('qru_previsao').value.toUpperCase();
    save(); fecharModal('modalQRU');
}

function removerManutencao() {
    const nome = document.getElementById('qru_veic_nome').value;
    const v = db.veiculos.find(x => x.nome === nome);
    v.emManutencao = false; v.motivoManutencao = ''; v.previsaoManutencao = '';
    save(); fecharModal('modalQRU');
}

function moverVeiculo(index, direcao) {
    const novaPos = index + direcao;
    if (novaPos < 0 || novaPos >= db.veiculos.length) return;
    [db.veiculos[index], db.veiculos[novaPos]] = [db.veiculos[novaPos], db.veiculos[index]];
    save();
}

function moverFrete(id, direcao) {
    const i = db.viagens.findIndex(x => x.id === id);
    const fretesDoVeiculo = db.viagens.filter(x => x.veic === db.viagens[i].veic);
    const idxNoGrupo = fretesDoVeiculo.findIndex(x => x.id === id);
    const novaPosGrupo = idxNoGrupo + direcao;
    if (novaPosGrupo >= 0 && novaPosGrupo < fretesDoVeiculo.length) {
        const outroId = fretesDoVeiculo[novaPosGrupo].id;
        const idxOutro = db.viagens.findIndex(x => x.id === outroId);
        [db.viagens[i], db.viagens[idxOutro]] = [db.viagens[idxOutro], db.viagens[i]];
        save();
        render(); // Atualiza a tela e a escala
    }
}

function excluirFrete(id) { if(confirm("Excluir frete?")) { db.viagens = db.viagens.filter(x => x.id !== id); save(); } }

function resetHorarios() {
    if(!confirm("Zerar horários?")) return;
    db.viagens = db.viagens.map(v => ({ ...v, status: 'PENDENTE', sai: '--:--', che: '--:--' }));
    save();
}

function addVeiculoComModelo() {
    const inputV = document.getElementById('in_v');
    const inputMod = document.getElementById('in_mod'); 
    const frota = inputV.value.trim().toUpperCase();
    const modelo = inputMod.value.trim().toUpperCase();

    if(!frota) return alert("Digite ao menos a frota!"); 

    db.veiculos.push({ 
        id: Date.now(), 
        nome: frota, 
        modelo: modelo || '-', 
        emManutencao: false, 
        motivoManutencao: '', 
        previsaoManutencao: '' 
    }); 

    inputV.value = ''; 
    inputMod.value = '';
    renderBase(); 
    save();
}

function addBaseManual(tipo, idInput) {
    const input = document.getElementById(idInput); 
    const valor = input.value.trim().toUpperCase();
    if(!valor) return; 
    db[tipo].push({ id: Date.now(), nome: valor }); 
    input.value = ''; 
    renderBase(); 
    save();
}

function delBase(tipo, id) { 
    if(confirm("Excluir item permanentemente?")) {
        db[tipo] = db[tipo].filter(x => x.id !== id); renderBase(); save(); 
    }
}

function renderBase() {
    const listaVeiculos = document.getElementById('list-v');
    
    listaVeiculos.innerHTML = db.veiculos.map((x, index) => `
        <div class="item-frota-grid">
            <b>${x.nome}</b>
            <input type="text" 
                class="input-modelo-lista"
                placeholder="Modelo..." 
                value="${x.modelo || ''}" 
                onchange="db.veiculos[${index}].modelo = this.value.toUpperCase(); save();">
            <span class="btn-del-mini" onclick="delBase('veiculos', ${x.id})">×</span>
        </div>`).join('');

    const renderSimples = (tipo, idDest) => {
        document.getElementById(idDest).innerHTML = db[tipo].map(x => `
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; padding:8px; border-bottom:1px solid #333;">
                <span>${x.nome}</span>
                <span onclick="delBase('${tipo}', ${x.id})" style="color:#ff4444; cursor:pointer; font-weight:bold; font-size:16px;">×</span>
            </div>`).join('');
    };

    renderSimples('motos', 'list-m');
    renderSimples('servicos', 'list-s');
    
    document.getElementById('f_veic').innerHTML = '<option value="">Selecione...</option>' + 
        db.veiculos.map(x => `<option value="${x.nome}">${x.nome}</option>`).join('');
    document.getElementById('f_serv_pre').innerHTML = '<option value="">-- Personalizado --</option>' + 
        db.servicos.map(x => `<option value="${x.nome}">${x.nome}</option>`).join('');
    render();
}

function gerenciarStatus(id) {
    const i = db.viagens.findIndex(x => x.id === id); const v = db.viagens[i];
    const agora = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    if(v.status === 'PENDENTE') { v.status = 'RODANDO'; v.sai = agora; }
    else if(v.status === 'RODANDO') { v.status = 'OK'; v.che = agora; }
    else { if(confirm("Limpar registro?")) db.viagens.splice(i, 1); }
    save();
}

function render() {
    document.getElementById('ctrl_name').value = db.controlador || '';
    if(document.getElementById('obs_turno')) { 
        document.getElementById('obs_turno').value = db.obs_turno || ''; 
    }

    const container = document.getElementById('monitor-frotas'); 
    if(!container) return;
    container.innerHTML = '';

    db.veiculos.forEach((vObj, index) => {
        const f = vObj.nome; 
        const viagens = db.viagens.filter(x => x.veic === f);
        const row = document.createElement('div'); 
        row.className = 'veiculo-row';
        
        if(vObj.emManutencao) row.style.borderLeft = "10px solid var(--usa-qru)";
        
        row.innerHTML = `
            <div class="veiculo-info">
                <div class="controles-ordem">
                    <button class="btn-mini" onclick="moverVeiculo(${index}, -1)">▲</button>
                    <button class="btn-mini" onclick="moverVeiculo(${index}, 1)">▼</button>
                </div>
                <div class="controles-acoes">
                    <button class="btn-mini btn-del-veic" onclick="excluirVeiculo(${vObj.id})" title="Remover Veículo">🗑️</button>
                    <button class="btn-mini" onclick="abrirManutencao('${f}')">${vObj.emManutencao ? '🛠️' : '🔧'}</button>
                </div>
                <span style="font-size: 10px; color: #888;">FROTA</span>
                <h3 style="${vObj.emManutencao ? 'color:var(--usa-qru)' : ''}">${f}</h3>
                
                <select onchange="db.v_motos['${f}']=this.value; save();">
                    <option value="">Motorista...</option>
                    ${db.motos.map(m => `<option value="${m.nome}" ${db.v_motos[f] === m.nome ? 'selected' : ''}>${m.nome}</option>`).join('')}
                </select>

                <input type="text" placeholder="Local atual..." 
                    value="${vObj.local || ''}" 
                    style="width: 100%; font-size: 11px; margin-top: 5px; background: #333; color: white; border: 1px solid #444; padding: 4px; border-radius: 4px;"
                    onchange="const idx = db.veiculos.findIndex(v => v.nome === '${f}'); db.veiculos[idx].local = this.value.toUpperCase(); save();">
            </div>

            <div class="viagens-timeline">
                ${viagens.map(v => {
                    let btnCfg = v.status === 'PENDENTE' ? { class: 'btn-status-start', label: 'INICIAR', icon: '🛫' } : 
                                 v.status === 'RODANDO' ? { class: 'btn-status-finish', label: 'CONCLUIR', icon: '🏁' } : 
                                 { class: 'btn-status-clear', label: 'LIMPAR', icon: '🧹' };
                    
                    return `
                    <div class="trip-card status-${v.status.toLowerCase()}">
                        <div class="card-header-actions">
                            <button class="btn-mini" onclick="abrirEditarFrete(${v.id})" title="Editar">✏️</button>
                            <button class="btn-mini" onclick="moverFrete(${v.id}, -1)">◀</button>
                            <button class="btn-mini" onclick="moverFrete(${v.id}, 1)">▶</button>
                            <button class="btn-mini" onclick="excluirFrete(${v.id})" style="color:#ff4444">✖</button>
                        </div>
                        <div class="moto">${v.cidade || v.moto || 'S/ CIDADE'}</div>
                        <div class="serv">${v.serv || ''}</div>
                        <div class="times">
                            <span>🛫 ${v.sai || '--:--'}</span>
                            <span>🏁 ${v.che || '--:--'}</span>
                        </div>
                        <button class="btn-status-dynamic ${btnCfg.class}" onclick="gerenciarStatus(${v.id})">
                            ${btnCfg.icon} ${btnCfg.label}
                        </button>
                    </div>`
                }).join('')}
                <button class="btn-novo-frete-linha" onclick="abrirFretePara('${f}')">+ NOVO FRETE</button>
            </div>`;
        
        container.appendChild(row);
    });
}
async function baixarPastaVivaComoImagem() {
    const relatorio = document.getElementById('corpo-relatorio');

    if (!relatorio || relatorio.innerText.trim() === "") {
        alert("Gere o relatório na tela antes de salvar!");
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    html2canvas(relatorio, {
        scale: 2,           
        useCORS: true,      
        backgroundColor: "#ffffff",
        width: relatorio.offsetWidth,
        height: relatorio.offsetHeight,
        logging: false
    }).then(canvas => {
        const context = canvas.getContext('2d');
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const isBlank = !Object.values(data).some(color => color !== 0 && color !== 255);

        if (isBlank) {
            alert("A imagem saiu em branco. Tente rolar a tela até o relatório e clique novamente.");
            return;
        }

        const link = document.createElement('a');
        const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        link.download = `PASTA_VIVA_${dataAtual}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}
function gerarPastaViva() {
    document.getElementById('rel-data').innerText = new Date().toLocaleDateString();
    document.getElementById('rel-user').innerText = db.controlador || 'NÃO INFORMADO';
    
    let html = `<table class="tabela-viva">
        <tr class="header-viva"><td colspan="5">ATIVOS (SPINS / ARGOS / STRADAS)</td></tr>
        <tr style="background:#eee"><th>MODELO</th><th width="80">FROTA</th><th>CONDUTOR</th><th>FRETES REALIZADOS</th><th>LOCAL</th></tr>`;
    
    db.veiculos.forEach(v => {
        const fretesOk = db.viagens.filter(x => x.veic === v.nome && x.status === 'OK').map(x => x.serv).join(' / ') || '-';
        
        html += `<tr class="${v.emManutencao?'qru-row':''}">
                    <td>${v.modelo || '-'}</td> <td style="font-weight:bold;">${v.nome}</td>
                    <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">
                        ${db.v_motos[v.nome] || '-'}
                    </td>
                    <td>${fretesOk}</td>
                    <td>${v.local || '-'}</td> 
                 </tr>`;
    });
    html += `</table>`;
    
    html += `<table class="tabela-viva" style="margin-top:5px;">
        <tr class="header-viva"><td colspan="4">PRANCHAS E IMPLEMENTOS</td></tr>
        <tr style="background:#eee"><th>CAVALO</th><th>PRANCHA</th><th>TIPO E SITUAÇÃO</th><th>LOCAL</th></tr>`;
    
    if (db.pranchas.length > 0) {
        db.pranchas.forEach(p => {
            html += `<tr class="${p.qru ? 'qru-row' : ''}"><td>${p.cavalo || '-'}</td><td style="font-weight:bold; ${p.qru?'color:red':''}">${p.prancha || '-'}</td><td>${p.tipo || '-'}</td><td>${p.local || '-'}</td></tr>`;
        });
    } else {
        html += `<tr><td colspan="4">NENHUM IMPLEMENTO REGISTRADO</td></tr>`;
    }
    html += `</table>`;

    html += `<table class="tabela-viva" style="margin-top:5px;"><tr class="header-viva"><td>SERVIÇOS E ORIENTAÇÕES PARA O PRÓXIMO TURNO</td></tr>`;

    if (db.obs_turno && db.obs_turno.trim() !== "") {
        const linhas = db.obs_turno.split('\n');
        linhas.forEach(linha => {
            if(linha.trim() !== "") {
                html += `<tr><td style="text-align:left; padding-left:15px; height:15px; font-weight: bold; color: #000; font-size: 8.5px;">• ${linha.toUpperCase()}</td></tr>`;
                html += `<tr><td style="height:10px; border:none;">&nbsp;</td></tr>`;
            }
        });
    }

    const agora = new Date();
    const limiteFuturo = new Date(agora.getTime() + (8 * 60 * 60 * 1000));

    let agExternos = obterAgendamentosExternos().filter(ag => {
        const isPendente = ag.status === 'PENDENTE' || !ag.status;
        if (ag.hora_frete) {
            const dataFrete = new Date(ag.hora_frete);
            return isPendente && dataFrete >= agora && dataFrete <= limiteFuturo;
        }
        return false;
    });

    agExternos.sort((a, b) => new Date(a.hora_frete) - new Date(b.hora_frete));

    if (agExternos.length > 0) {
        agExternos.forEach(ag => {
            let solicitante = ag.solicitante || "N/A";
            let equipamento = ag.carga || "S/N";
            let embarque = ag.emb || "EMBARQUE";
            let desembarque = ag.des || "DESEMBARQUE";
            
            let horario = "--:--";
            if (ag.hora_frete) {
                const dataObj = new Date(ag.hora_frete);
                horario = dataObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            
            html += `<tr><td style="text-align:left; padding-left:15px; height:15px; font-weight: bold; font-size: 8.5px;">• ${solicitante.toUpperCase()} = ${equipamento.toUpperCase()}: ${embarque.toUpperCase()} -> ${desembarque.toUpperCase()} = ${horario} HRS</td></tr>`;
            html += `<tr><td style="height:10px; border:none;">&nbsp;</td></tr>`;
        });
    }

    let linhasVaziasDinamicas = 7 - agExternos.length; 
    if (linhasVaziasDinamicas > 0) {
        for(let i=0; i < linhasVaziasDinamicas; i++) {
            html += `<tr><td style="height:15px;">&nbsp;</td></tr>`;
        }
    }
    html += `</table>`;

    html += `<table class="tabela-viva" style="margin-top:5px;"><tr class="header-viva"><td colspan="2">QRU - EQUIPAMENTOS PARADOS (MANUTENÇÃO)</td></tr><tr style="background:#eee"><th width="75%">EQUIPAMENTO / MOTIVO</th><th>PREVISÃO</th></tr>`;
    let qrusVeic = db.veiculos.filter(v => v.emManutencao);
    let qrusPra = db.pranchas.filter(p => p.qru);
    if (qrusVeic.length > 0 || qrusPra.length > 0) {
        qrusVeic.forEach(v => { html += `<tr class="qru-row"><td>FROTA ${v.nome} - ${v.motivoManutencao}</td><td>${v.previsaoManutencao}</td></tr>`; });
        qrusPra.forEach(p => { 
            html += `<tr class="qru-row">
                <td>PRANCHA ${p.prancha} - ${p.motivoQRU || 'MANUTENÇÃO'}</td>
                <td>${p.previsaoQRU || '-'}</td>
            </tr>`; 
        });
    } else {
        html += `<tr><td colspan="2">NENHUM EQUIPAMENTO EM MANUTENÇÃO</td></tr>`;
    }
    html += `</table>`;
    
    document.getElementById('corpo-relatorio').innerHTML = html;
    window.print();
}

function abrirFretePara(veic) { renderBase(); document.getElementById('f_veic').value = veic; document.getElementById('modalFrete').style.display='flex'; }
function abrirConfig() { renderBase(); document.getElementById('modalBase').style.display='flex'; }
function fecharModal(id) {
    document.getElementById(id).style.display = 'none';
}
setInterval(() => {
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        clockEl.innerText = new Date().toLocaleTimeString();
    }
}, 1000);

window.onload = () => { renderBase(); render(); };
