document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();
    buscar();
});

document.getElementById('novo').addEventListener('click', () => {
    window.location.href = "aluno_cadastrar.html"; 
});

async function buscar() {
    try {
        const retorno = await fetch('../src/controllers/aluno/aluno_get.php');
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
                <td>${tabela[i].nome}</td>
                <td>${tabela[i].matricula}</td>
                <td>${tabela[i].serie}</td>
                <td>${tabela[i].nome_turma || 'N/A'}</td>
                <td>${tabela[i].nome_instituicao || 'N/A'}</td>
                <td>
                    <a href='aluno_alterar.html?id=${tabela[i].id}' class="btn btn-sm btn-primary">Alterar</a>
                    <a href='#' onclick='excluir(${tabela[i].id})' class="btn btn-sm btn-danger">Excluir</a>
                </td>
            </tr>
        `;
    }
    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}