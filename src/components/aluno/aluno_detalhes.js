document.addEventListener("DOMContentLoaded", async () => {
    await valida_sessao();
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert("ID do aluno não fornecido.");
        window.history.back();
        return;
    }

    // Exibir botão de adicionar relatório se for pedagogo, profissional de saúde ou professor
    if (window.usuarioLogado) {
        const cargo = String(window.usuarioLogado.cargo);
        if (cargo === '2' || cargo === '3' || cargo === '4') {
            document.getElementById('btn-novo-relatorio').style.display = 'block';
            
            // Exibe seção de laudos
            document.getElementById('secao-laudos').style.display = 'block';
            
            // Apenas profissional da saúde (cargo 3) pode anexar laudo
            if (cargo === '3') {
                document.getElementById('btn-novo-laudo').style.display = 'block';
            }
        }
    }

    async function carregarAluno() {
        try {
            const response = await fetch(`../src/controllers/aluno/aluno_get.php?id=${id}`);
            const result = await response.json();
            
            if (result.status === 'ok' && result.data.length > 0) {
                const aluno = result.data[0];
                
                document.getElementById('detalhe-nome').textContent = aluno.nome;
                document.getElementById('detalhe-matricula').textContent = aluno.matricula || 'N/A';
                document.getElementById('detalhe-serie').textContent = aluno.serie + 'º Ano';
                
                // Nascimento formatado
                if (aluno.data_nascimento) {
                    const partes = aluno.data_nascimento.split('-');
                    if (partes.length === 3) {
                        document.getElementById('detalhe-nascimento').textContent = `${partes[2]}/${partes[1]}/${partes[0]}`;
                    } else {
                        document.getElementById('detalhe-nascimento').textContent = aluno.data_nascimento;
                    }
                } else {
                    document.getElementById('detalhe-nascimento').textContent = 'N/A';
                }

                // Status formatado
                let statusText = 'Desconhecido';
                let statusClass = 'text-secondary';
                if (aluno.status == '0') {
                    statusText = 'Matriculado';
                    statusClass = 'text-success';
                } else if (aluno.status == '1') {
                    statusText = 'Transferido';
                    statusClass = 'text-warning';
                } else if (aluno.status == '2') {
                    statusText = 'Concluinte';
                    statusClass = 'text-primary';
                }
                const statusEl = document.getElementById('detalhe-status');
                statusEl.textContent = statusText;
                statusEl.className = `fs-5 fw-bold ${statusClass}`;

                document.getElementById('detalhe-turma').textContent = aluno.nome_turma || 'N/A';
                document.getElementById('detalhe-instituicao').textContent = aluno.nome_instituicao || 'N/A';
            } else {
                alert("Aluno não encontrado.");
                window.history.back();
            }
        } catch (e) {
            console.error("Erro ao carregar detalhes do aluno:", e);
            alert("Erro na conexão com o servidor.");
        }
    }

    async function carregarRelatorios() {
        const listaEl = document.getElementById('lista-relatorios');
        try {
            const response = await fetch(`../src/controllers/relatorio/relatorio_listar.php?id_aluno=${id}`);
            const result = await response.json();
            
            if (result.status === 'ok') {
                listaEl.innerHTML = '';
                if (result.data.length === 0) {
                    listaEl.innerHTML = '<p class="text-muted small">Nenhum relatório de acompanhamento registrado para este aluno.</p>';
                    return;
                }
                
                result.data.forEach(relatorio => {
                    const item = document.createElement('div');
                    item.className = 'list-group-item list-group-item-action flex-column align-items-start border rounded mb-3 p-3 shadow-sm';
                    item.style.borderColor = '#004e7a22';

                    item.innerHTML = `
                        <div class="d-flex w-100 justify-content-between mb-2">
                            <h5 class="mb-1 fw-bold" style="color: #004e7a !important;">${relatorio.titulo}</h5>
                            <small class="text-muted"><i class="bi bi-clock"></i> ${formatarDataHora(relatorio.data_emissao)}</small>
                        </div>
                        <p class="mb-2 text-secondary" style="white-space: pre-wrap; font-size: 0.95rem;">${relatorio.conteudo}</p>
                        <hr class="my-2" style="border-top: 1px dashed #004e7a22;">
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Autor: <b class="text-dark">${relatorio.nome_remetente}</b> (${obterCargoNome(relatorio.cargo_remetente)})</small>
                            ${relatorio.nome_recebedor && relatorio.id_recebedor !== relatorio.id_remetente ? `<small class="text-muted">Enviado para: <b>${relatorio.nome_recebedor}</b></small>` : ''}
                        </div>
                    `;
                    listaEl.appendChild(item);
                });
            } else {
                listaEl.innerHTML = `<p class="text-danger small">Erro ao carregar relatórios: ${result.mensagem}</p>`;
            }
        } catch (e) {
            console.error("Erro ao carregar relatórios:", e);
            listaEl.innerHTML = '<p class="text-danger small">Erro de conexão ao carregar relatórios.</p>';
        }
    }

    function formatarDataHora(str) {
        if (!str) return 'N/A';
        const partesDateTime = str.split(' ');
        const dataPartes = partesDateTime[0].split('-');
        if (dataPartes.length === 3) {
            const dataFormatada = `${dataPartes[2]}/${dataPartes[1]}/${dataPartes[0]}`;
            if (partesDateTime[1]) {
                const horaPartes = partesDateTime[1].split(':');
                return `${dataFormatada} às ${horaPartes[0]}:${horaPartes[1]}`;
            }
            return dataFormatada;
        }
        return str;
    }

    function obterCargoNome(cargo) {
        switch (String(cargo)) {
            case '1': return 'Administrador';
            case '2': return 'Pedagogo';
            case '3': return 'Profissional da Saúde';
            case '4': return 'Professor';
            case '5': return 'Responsável Legal';
            default: return 'Usuário';
        }
    }

    async function carregarDestinatarios() {
        const cargoLogado = window.usuarioLogado ? String(window.usuarioLogado.cargo) : null;
        if (!cargoLogado || (cargoLogado !== '2' && cargoLogado !== '3' && cargoLogado !== '4')) {
            return;
        }

        try {
            const response = await fetch(`../src/controllers/relatorio/relatorio_destinatarios.php?id_aluno=${id}`);
            const result = await response.json();

            if (result.status === 'ok') {
                const selectEl = document.getElementById('relatorio-recebedor');
                if (!selectEl) return;
                
                selectEl.innerHTML = '<option value="">Selecione o destinatário...</option>';
                
                const { pedagogos, professores, responsaveis } = result.data;
                let temOpcoes = false;

                // Regra Professor (cargo 4): Envia para Pedagogos
                if (cargoLogado === '4') {
                    if (pedagogos && pedagogos.length > 0) {
                        const group = document.createElement('optgroup');
                        group.label = 'Pedagogos';
                        pedagogos.forEach(p => {
                            const opt = document.createElement('option');
                            opt.value = p.id;
                            opt.textContent = p.nome;
                            group.appendChild(opt);
                            temOpcoes = true;
                        });
                        selectEl.appendChild(group);
                    }
                }
                // Regra Pedagogo (cargo 2): Envia para Responsáveis Legais
                else if (cargoLogado === '2') {
                    if (responsaveis && responsaveis.length > 0) {
                        const group = document.createElement('optgroup');
                        group.label = 'Responsáveis Legais';
                        responsaveis.forEach(r => {
                            const opt = document.createElement('option');
                            opt.value = r.id;
                            opt.textContent = `${r.nome} (${r.parentesco || 'Responsável'})`;
                            group.appendChild(opt);
                            temOpcoes = true;
                        });
                        selectEl.appendChild(group);
                    }
                }
                // Regra Profissional de Saúde (cargo 3): Envia para Professores, Pedagogos e Responsáveis
                else if (cargoLogado === '3') {
                    if (professores && professores.length > 0) {
                        const group = document.createElement('optgroup');
                        group.label = 'Professores';
                        professores.forEach(p => {
                            const opt = document.createElement('option');
                            opt.value = p.id;
                            opt.textContent = `${p.nome} (${p.materia || 'Professor'})`;
                            group.appendChild(opt);
                            temOpcoes = true;
                        });
                        selectEl.appendChild(group);
                    }
                    if (pedagogos && pedagogos.length > 0) {
                        const group = document.createElement('optgroup');
                        group.label = 'Pedagogos';
                        pedagogos.forEach(p => {
                            const opt = document.createElement('option');
                            opt.value = p.id;
                            opt.textContent = p.nome;
                            group.appendChild(opt);
                            temOpcoes = true;
                        });
                        selectEl.appendChild(group);
                    }
                    if (responsaveis && responsaveis.length > 0) {
                        const group = document.createElement('optgroup');
                        group.label = 'Responsáveis Legais';
                        responsaveis.forEach(r => {
                            const opt = document.createElement('option');
                            opt.value = r.id;
                            opt.textContent = `${r.nome} (${r.parentesco || 'Responsável'})`;
                            group.appendChild(opt);
                            temOpcoes = true;
                        });
                        selectEl.appendChild(group);
                    }
                }

                if (temOpcoes) {
                    document.getElementById('container-recebedor').style.display = 'block';
                } else {
                    const opt = document.createElement('option');
                    opt.disabled = true;
                    opt.textContent = 'Nenhum destinatário disponível';
                    selectEl.appendChild(opt);
                    document.getElementById('container-recebedor').style.display = 'block';
                }
            }
        } catch (e) {
            console.error("Erro ao carregar destinatários:", e);
        }
    }

    // Ação de Salvar Relatório
    const btnSalvar = document.getElementById('btn-salvar-relatorio');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', async () => {
            const titulo = document.getElementById('relatorio-titulo').value.trim();
            const conteudo = document.getElementById('relatorio-conteudo').value.trim();

            if (!titulo) {
                alert("O título do relatório é obrigatório.");
                return;
            }
            if (!conteudo) {
                alert("O conteúdo do relatório é obrigatório.");
                return;
            }

            const formData = new FormData();
            formData.append('id_aluno', id);
            formData.append('titulo', titulo);
            formData.append('conteudo', conteudo);

            const recebedorEl = document.getElementById('relatorio-recebedor');
            if (recebedorEl && document.getElementById('container-recebedor').style.display !== 'none') {
                if (!recebedorEl.value) {
                    alert("Por favor, selecione um destinatário para o relatório.");
                    return;
                }
                formData.append('id_recebedor', recebedorEl.value);
            }

            try {
                const response = await fetch('../src/controllers/relatorio/relatorio_novo.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.status === 'ok') {
                    alert("Relatório cadastrado com sucesso!");
                    
                    // Fechar modal
                    const modalEl = document.getElementById('modalNovoRelatorio');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                    
                    // Limpar formulário
                    document.getElementById('form-novo-relatorio').reset();
                    
                    // Recarregar lista
                    await carregarRelatorios();
                } else {
                    alert("Erro ao salvar relatório: " + result.mensagem);
                }
            } catch (e) {
                console.error("Erro ao salvar relatório:", e);
                alert("Erro de conexão ao salvar relatório.");
            }
        });
    }

    async function carregarLaudos() {
        const listaEl = document.getElementById('lista-laudos');
        if (!listaEl) return;

        try {
            const response = await fetch(`../src/controllers/laudo/laudo_listar.php?id_aluno=${id}`);
            const result = await response.json();
            
            if (result.status === 'ok') {
                listaEl.innerHTML = '';
                if (result.data.length === 0) {
                    listaEl.innerHTML = '<p class="text-muted small">Nenhum laudo ou diagnóstico registrado para este aluno.</p>';
                    return;
                }
                
                result.data.forEach(laudo => {
                    const item = document.createElement('div');
                    item.className = 'list-group-item list-group-item-action flex-column align-items-start border rounded mb-3 p-3 shadow-sm';
                    item.style.borderColor = '#004e7a22';

                    item.innerHTML = `
                        <div class="d-flex w-100 justify-content-between align-items-center mb-2">
                            <h5 class="mb-1 fw-bold" style="color: #004e7a !important;"><i class="bi bi-file-earmark-pdf-fill text-danger me-2"></i>${laudo.titulo}</h5>
                            <small class="text-muted"><i class="bi bi-clock"></i> ${formatarDataHora(laudo.data_emissao)}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div>
                                <small class="text-muted d-block">Profissional emissor: <b class="text-dark">${laudo.nome_profissional}</b></small>
                                <small class="text-muted">Arquivo: <b class="text-secondary">${laudo.anexo_nome || 'laudo.pdf'}</b></small>
                            </div>
                            <a href="../src/controllers/laudo/laudo_download.php?id=${laudo.id}" target="_blank" class="btn btn-sm btn-outline-danger">
                                <b>Visualizar PDF</b>
                            </a>
                        </div>
                    `;
                    listaEl.appendChild(item);
                });
            } else {
                listaEl.innerHTML = `<p class="text-danger small">Erro ao carregar laudos: ${result.mensagem}</p>`;
            }
        } catch (e) {
            console.error("Erro ao carregar laudos:", e);
            listaEl.innerHTML = '<p class="text-danger small">Erro de conexão ao carregar laudos.</p>';
        }
    }

    // Ação de Salvar Laudo
    const btnSalvarLaudo = document.getElementById('btn-salvar-laudo');
    if (btnSalvarLaudo) {
        btnSalvarLaudo.addEventListener('click', async () => {
            const titulo = document.getElementById('laudo-titulo').value.trim();
            const pdfInput = document.getElementById('laudo-pdf');

            if (!titulo) {
                alert("O título do laudo é obrigatório.");
                return;
            }
            if (!pdfInput.files || pdfInput.files.length === 0) {
                alert("Por favor, selecione um arquivo PDF.");
                return;
            }

            const pdfFile = pdfInput.files[0];
            if (pdfFile.type !== 'application/pdf') {
                const ext = pdfFile.name.split('.').pop().toLowerCase();
                if (ext !== 'pdf') {
                    alert("Apenas arquivos no formato PDF são permitidos.");
                    return;
                }
            }

            const formData = new FormData();
            formData.append('id_aluno', id);
            formData.append('titulo', titulo);
            formData.append('pdf', pdfFile);

            try {
                const response = await fetch('../src/controllers/laudo/laudo_novo.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.status === 'ok') {
                    alert("Laudo anexado com sucesso!");
                    
                    // Fechar modal
                    const modalEl = document.getElementById('modalNovoLaudo');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                    
                    // Limpar formulário
                    document.getElementById('form-novo-laudo').reset();
                    
                    // Recarregar lista
                    await carregarLaudos();
                } else {
                    alert("Erro ao salvar laudo: " + result.mensagem);
                }
            } catch (e) {
                console.error("Erro ao salvar laudo:", e);
                alert("Erro de conexão ao salvar laudo.");
            }
        });
    }

    await carregarAluno();
    await carregarDestinatarios();
    await carregarRelatorios();
    
    if (window.usuarioLogado) {
        const cargo = String(window.usuarioLogado.cargo);
        if (cargo === '2' || cargo === '3' || cargo === '4') {
            await carregarLaudos();
        }
    }
});
