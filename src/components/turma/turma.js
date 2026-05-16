document.addEventListener("DOMContentLoaded", async () => {
    await valida_sessao();
    buscar();
});

const novoBtn = document.getElementById('novo');
if (novoBtn) {
    novoBtn.addEventListener('click', () => {
        window.location.href = 'turma_cadastrar.html';
    });
}

async function buscar() {
    const retorno = await fetch('../src/controllers/turma/turma_get.php');
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
    var html = `
        <table class="table table-striped table-hover mt-3">
            <thead>
                <tr>
                    <th> Nome </th>
                    <th> Série </th>
                    <th> Ano </th>
                    <th> Quantidade </th>
                    <th> Instituição </th>
                    <th> Ações </th>
                </tr>
            </thead>
            <tbody>`;
    for(var i=0;i<tabela.length;i++){
        html += `
            <tr>
                <td>${tabela[i].nome}</td>
                <td>${tabela[i].serie}</td>
                <td>${tabela[i].ano}</td>
                <td>${tabela[i].qntd_alunos || tabela[i].quantidade || ''}</td>
                <td>${tabela[i].nome_instituicao || ''}</td>
                <td>
                    <a href='turma_alterar.html?id=${tabela[i].id}' class="btn btn-sm btn-primary">Alterar</a>
                    <a href='#' onclick='excluir(${tabela[i].id})' class="btn btn-sm btn-danger">Excluir</a>
                </td>
            </tr>
        `;
    }
    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}
