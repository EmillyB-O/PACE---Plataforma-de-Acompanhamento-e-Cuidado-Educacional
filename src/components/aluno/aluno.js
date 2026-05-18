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
                    <th> Ações </th>
                </tr>
            </thead>
            <tbody>`;
    for(var i=0;i<tabela.length;i++){
        html += `
            <tr>
                <td>
                    <a href='aluno_detalhes.html?id=${tabela[i].id}'>
                        ${tabela[i].nome}
                    </a>
                </td>
                <td>${tabela[i].matricula}</td>
                <td>${tabela[i].serie}</td>
                <td>${tabela[i].nome_turma || 'N/A'}</td>
                <td>${tabela[i].nome_instituicao || 'N/A'}</td>
                <td>
                   ${isAdmin ?
                        "<a href='aluno_alterar.html?id=" + tabela[i].id+ "' class='btn btn-sm btn-primary'>Alterar</a>" +
                        "<a href='#' onclick='excluir(" + tabela[i].id + ")' class='btn btn-sm btn-danger'>Excluir</a>"
                   : ""}
                </td>
            </tr>
        `;
    }
    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}