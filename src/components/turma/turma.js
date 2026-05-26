const parametros = new URLSearchParams(window.location.search); 
/* window.location.search pega tudo que vem depois de ? na url (ex.: ?id_instituicao=5)
    new URLSearchParams() transforma isso em objeto manipulável pelo JS 
*/

const idInstituicao = parametros.get('id_instituicao');
/* parametros.get pega o valor do parametro: 
    Ex.: ?id_instituicao=5 vira idInstituicao = 5
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

const novoBtn = document.getElementById('novo');
if (novoBtn) {
    novoBtn.addEventListener('click', () => {
        window.location.href = 'turma_cadastrar.html';
    });
}

async function buscar() {
    // Busca turmas apenas da instituição selecionada
    let url = '../src/controllers/turma/turma_get.php';
    if(idInstituicao) {
        url += '?id_instituicao=' + idInstituicao;
    }
    const retorno = await fetch(url);

    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        preencherTabela(resposta.data);
    }
}

async function excluir(id) {
    if(!confirm("Tem certeza que deseja excluir esta turma?")) return;
    const retorno = await fetch('../src/controllers/turma/turma_excluir.php?id='+id);
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
                    <th> Série </th>
                    <th> Ano </th>
                    <th> Quantidade </th>
                    <th> Instituição </th>
                    ${isAdmin ? '<th> Ações </th>' : ''}
                </tr>
            </thead>
            <tbody>`;
    for(var i=0;i<tabela.length;i++){ /*Nome da turma se torna um link para mostrar os alunos*/
        html += `
            <tr>
                <td data-label="Nome">
                    <a href='aluno.html?id_turma=${tabela[i].id}'>
                        ${tabela[i].nome}
                    </a>
                </td>
                <td data-label="Série">${tabela[i].serie}</td>
                <td data-label="Ano">${tabela[i].ano}</td>
                <td data-label="Quantidade">${tabela[i].qntd_alunos || tabela[i].quantidade || ''}</td>
                <td data-label="Instituição">${tabela[i].nome_instituicao || ''}</td>
                ${isAdmin ? `
                <td data-label="Ações">
                    <a href='turma_alterar.html?id=${tabela[i].id}' class='btn btn-sm btn-primary me-1'>Alterar</a>
                    <a href='#' onclick='excluir(${tabela[i].id})' class='btn btn-sm btn-danger'>Excluir</a>
                </td>
                ` : ''}
            </tr>
        `;
    }
    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}
