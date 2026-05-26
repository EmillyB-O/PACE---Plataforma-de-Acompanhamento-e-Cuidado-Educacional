const parametros = new URLSearchParams(window.location.search); 
/* window.location.search pega tudo que vem depois de ? na url (ex.: ?id_turma=5)
    new URLSearchParams() transforma isso em objeto manipulável pelo JS 
*/

const idTurma = parametros.get('id_turma');
/* parametros.get pega o valor do parametro: 
    Ex.: ?id_turma=5 vira idTurma = 5
*/

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar (){
    await valida_sessao();

    const usuario = window.usuarioLogado;
    const isAdmin = usuario.cargo == 1;

    if(!isAdmin){
        document.getElementById('novo').style.display = 'none';
    }
    
    buscar();
};

document.getElementById('novo').addEventListener('click', () => {
    window.location.href = "aluno_cadastrar.html"; 
});

async function buscar() {
    try {
        // Busca alunos apenas da turma selecionada
        let url = '../src/controllers/aluno/aluno_get.php';

        if(idTurma){
            url += '?id_turma=' + idTurma;
        }

        const retorno = await fetch(url);
        
        const resposta = await retorno.json();
        if(resposta.status == 'ok'){
            preencherTabela(resposta.data);
        } else {
            document.getElementById("lista").innerHTML = "<p class='text-center'>Nenhum aluno encontrado.</p>";
        }
    } catch (error) {
        console.error("Erro ao buscar alunos:", error);
    }
}

async function excluir(id) {
    if(!confirm("Tem certeza que deseja excluir este aluno?")) return;
    
    const retorno = await fetch('../src/controllers/aluno/aluno_excluir.php?id='+id);
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        alert(resposta.mensagem);
        window.location.reload();
    }else{
        alert(resposta.mensagem);
    }
}

function preencherTabela(tabela){
    // Para verificar se usuário é adm antes de mostrar os botões alterar e excluir
    const usuario = window.usuarioLogado;
    const isAdmin = usuario.cargo == 1;

    var html = `
        <table class="table table-striped table-hover mt-3">
            <thead>
                <tr>
                    <th> Nome </th>
                    <th> Matrícula </th>
                    <th> Série </th>
                    <th> Turma </th>
                    <th> Instituição </th>
                    ${isAdmin ? '<th> Ações </th>' : ''}
                </tr>
            </thead>
            <tbody>`;
    for(var i=0;i<tabela.length;i++){
        html += `
            <tr>
                <td data-label="Nome">
                    <a href='aluno_detalhes.html?id=${tabela[i].id}'>
                        ${tabela[i].nome}
                    </a>
                </td>
                <td data-label="Matrícula">${tabela[i].matricula}</td>
                <td data-label="Série">${tabela[i].serie}</td>
                <td data-label="Turma">${tabela[i].nome_turma || 'N/A'}</td>
                <td data-label="Instituição">${tabela[i].nome_instituicao || 'N/A'}</td>
                ${isAdmin ? `
                <td data-label="Ações">
                    <a href='aluno_alterar.html?id=${tabela[i].id}' class='btn btn-sm btn-primary me-1'>Alterar</a>
                    <button onclick='abrirVinculos(${tabela[i].id}, "${tabela[i].nome}")' class='btn btn-sm btn-info me-1 text-white'>Vincular</button>
                    <a href='#' onclick='excluir(${tabela[i].id})' class='btn btn-sm btn-danger'>Excluir</a>
                </td>
                ` : ''}
            </tr>
        `;
    }
    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}

// Configurações do Modal de Vinculação
let modalInstance = null;

async function abrirVinculos(idAluno, nomeAluno) {
    document.getElementById('vincular-id-aluno').value = idAluno;
    document.getElementById('modalVincularLabel').textContent = `Gerenciar Vínculos de ${nomeAluno}`;
    
    // Reset formulário
    document.getElementById('vincular-cargo').value = '';
    document.getElementById('vincular-usuario').innerHTML = '<option value="">Selecione um tipo primeiro...</option>';
    document.getElementById('vincular-usuario').disabled = true;
    document.getElementById('div-parentesco').style.display = 'none';
    document.getElementById('vincular-parentesco').value = '';

    await carregarVinculosAtuais(idAluno);

    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(document.getElementById('modalVincular'));
    }
    modalInstance.show();
}

async function carregarVinculosAtuais(idAluno) {
    try {
        const response = await fetch(`../src/controllers/aluno/aluno_get_vinculos.php?id_aluno=${idAluno}`);
        const result = await response.json();
        
        const listProf = document.getElementById('lista-vinculos-prof');
        const listResp = document.getElementById('lista-vinculos-resp');

        if (result.status === 'ok') {
            // Preenche Profissionais
            if (result.data.profissionais.length === 0) {
                listProf.innerHTML = '<p class="text-muted small">Nenhum profissional vinculado.</p>';
            } else {
                let html = '';
                result.data.profissionais.forEach(prof => {
                    html += `
                        <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                            <div>
                                <strong class="small">${prof.nome}</strong><br>
                                <span class="text-muted" style="font-size: 0.75rem;">${prof.crm ? 'CRM: '+prof.crm : 'CRP: '+prof.crp}</span>
                            </div>
                            <button onclick="desvincular(${prof.id}, '3')" class="btn btn-sm btn-outline-danger py-0 px-2" style="font-size: 0.75rem;">Remover</button>
                        </div>
                    `;
                });
                listProf.innerHTML = html;
            }

            // Preenche Responsáveis
            if (result.data.responsaveis.length === 0) {
                listResp.innerHTML = '<p class="text-muted small">Nenhum responsável vinculado.</p>';
            } else {
                let html = '';
                result.data.responsaveis.forEach(resp => {
                    html += `
                        <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                            <div>
                                <strong class="small">${resp.nome}</strong><br>
                                <span class="text-muted" style="font-size: 0.75rem;">Parentesco: ${resp.parentesco}</span>
                            </div>
                            <button onclick="desvincular(${resp.id}, '5')" class="btn btn-sm btn-outline-danger py-0 px-2" style="font-size: 0.75rem;">Remover</button>
                        </div>
                    `;
                });
                listResp.innerHTML = html;
            }
        }
    } catch (e) {
        console.error("Erro ao carregar vínculos:", e);
    }
}

// Ouvinte do tipo de vínculo
document.getElementById('vincular-cargo').addEventListener('change', async function() {
    const cargo = this.value;
    const selectUser = document.getElementById('vincular-usuario');
    const divParentesco = document.getElementById('div-parentesco');

    if (!cargo) {
        selectUser.innerHTML = '<option value="">Selecione um tipo primeiro...</option>';
        selectUser.disabled = true;
        divParentesco.style.display = 'none';
        return;
    }

    selectUser.innerHTML = '<option value="">Carregando...</option>';
    selectUser.disabled = true;

    if (cargo === '5') {
        divParentesco.style.display = 'block';
    } else {
        divParentesco.style.display = 'none';
    }

    try {
        const response = await fetch(`../src/controllers/usuario_get.php?cargo=${cargo}&status=1`);
        const result = await response.json();
        if (result.status === 'ok') {
            let html = '<option value="">Selecione um usuário...</option>';
            result.data.forEach(user => {
                let cpfFormatado = user.cpf || '';
                let cleanCPF = String(cpfFormatado).replace(/\D/g, "");
                if (cleanCPF.length === 11) {
                    cpfFormatado = cleanCPF.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
                }
                html += `<option value="${user.id}">${user.nome} (${cpfFormatado})</option>`;
            });
            selectUser.innerHTML = html;
            selectUser.disabled = false;
        } else {
            selectUser.innerHTML = '<option value="">Nenhum usuário ativo encontrado.</option>';
        }
    } catch (e) {
        console.error("Erro ao carregar usuários por cargo:", e);
        selectUser.innerHTML = '<option value="">Erro ao carregar usuários.</option>';
    }
});

// Ouvinte para salvar vínculo
document.getElementById('btn-salvar-vinculo').addEventListener('click', async () => {
    const idAluno = document.getElementById('vincular-id-aluno').value;
    const cargo = document.getElementById('vincular-cargo').value;
    const idUsuario = document.getElementById('vincular-usuario').value;
    const parentesco = document.getElementById('vincular-parentesco').value.trim();

    if (!cargo || !idUsuario) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    if (cargo === '5' && !parentesco) {
        alert("O grau de parentesco é obrigatório para Responsável Legal.");
        return;
    }

    const fd = new FormData();
    fd.append('id_aluno', idAluno);
    fd.append('id_usuario', idUsuario);
    fd.append('cargo', cargo);
    if (cargo === '5') {
        fd.append('parentesco', parentesco);
    }

    try {
        const response = await fetch('../src/controllers/aluno/aluno_vincular.php', {
            method: 'POST',
            body: fd
        });
        const result = await response.json();
        alert(result.mensagem);
        if (result.status === 'ok') {
            await carregarVinculosAtuais(idAluno);
            // Limpa inputs específicos
            document.getElementById('vincular-usuario').value = '';
            document.getElementById('vincular-parentesco').value = '';
        }
    } catch (e) {
        console.error("Erro ao salvar vínculo:", e);
        alert("Erro ao conectar com o servidor.");
    }
});

// Remover vínculo
async function desvincular(idUsuario, cargo) {
    if (!confirm("Tem certeza que deseja remover este vínculo?")) return;

    const idAluno = document.getElementById('vincular-id-aluno').value;
    const fd = new FormData();
    fd.append('id_aluno', idAluno);
    fd.append('id_usuario', idUsuario);
    fd.append('cargo', cargo);

    try {
        const response = await fetch('../src/controllers/aluno/aluno_desvincular.php', {
            method: 'POST',
            body: fd
        });
        const result = await response.json();
        alert(result.mensagem);
        if (result.status === 'ok') {
            await carregarVinculosAtuais(idAluno);
        }
    } catch (e) {
        console.error("Erro ao remover vínculo:", e);
        alert("Erro ao conectar com o servidor.");
    }
}