document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();
    buscar();
});

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
    var html = `
        <table class="table table-striped table-hover mt-3">
            <thead>
                <tr>
                    <th> Nome </th>
                    <th> Endereço </th>
                    <th> Código </th>
                </tr>
            </thead>
            <tbody>`;
    for(var i=0;i<tabela.length;i++){
        html += `
            <tr>
                <td>${tabela[i].nome}</td>
                <td>${tabela[i].endereco}</td>
                <td>${tabela[i].codigo}</td>
                <td>
                    <a href='instituicao_alterar.html?id=${tabela[i].id}' class="btn btn-sm btn-primary">Alterar</a>
                    <a href='#' onclick='excluir(${tabela[i].id})' class="btn btn-sm btn-danger">Excluir</a>
                </td>
            </tr>
        `;
    }
    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}