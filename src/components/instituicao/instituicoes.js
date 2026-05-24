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
    window.location.href = 'instituicao_cadastrar.html';
});

document.getElementById('logoff').addEventListener('click', () => {
    logoff();
});

async function logoff() {
    const retorno = await fetch('../src/controllers/usuario_logoff.php');
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        window.location.href = 'login.html';
    }
}

async function buscar() {
    const retorno = await fetch('../src/controllers/instituicao/instituicao_get.php');
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        preencherTabela(resposta.data);
    }
}

async function excluir(id) {
    const retorno = await fetch('../src/controllers/instituicao/instituicao_excluir.php?id='+id);
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
                    <th> Endereço </th>
                    <th> Código </th>
                    <th> Ações </th>
                </tr>
            </thead>
            <tbody>`;
    for(var i=0;i<tabela.length;i++){ /*Nome da instituição se torna um link para mostrar as turmas*/
        html += `
            <tr>
                <td data-label="Nome">
                    <a href='turma.html?id_instituicao=${tabela[i].id}'>
                        ${tabela[i].nome}
                    </a>
                </td>
                <td data-label="Endereço">${tabela[i].endereco}</td>
                <td data-label="Código">${tabela[i].codigo}</td>
                <td data-label="Ações">
                   ${isAdmin ?
                        "<a href='instituicao_alterar.html?id=" + tabela[i].id+ "' class='btn btn-sm btn-primary'>Alterar</a>" +
                        "<a href='#' onclick='excluir(" + tabela[i].id + ")' class='btn btn-sm btn-danger'>Excluir</a>"
                   : ""}
                </td>
            </tr>
        `;
    }
    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}