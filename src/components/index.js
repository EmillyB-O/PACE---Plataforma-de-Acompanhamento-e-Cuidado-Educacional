document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();
    buscar();
});

document.getElementById('novo').addEventListener('click', () => {
    window.location.href = 'cadastro_admin.html';
});

async function buscar() {
    const retorno = await fetch('../src/controllers/usuario_get.php');
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        preencherTabela(resposta.data);
    }
}

async function excluir(id) {
    const retorno = await fetch('../src/controllers/usuario_excluir.php?id='+id);
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        alert(resposta.mensagem);
        window.location.reload();
    }else{
        alert(resposta.mensagem);
    }
}

async function aprovar(id) {
    const retorno = await fetch('../src/controllers/usuario_aprovar.php?id='+id);
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        alert(resposta.mensagem);
        window.location.reload();
    }else{
        alert(resposta.mensagem);
    }
}

//TODA A FUNCAO preencherTabela TEM QUE SER ADAPTADA PARA OS USUARIOS ESPECIAIS
function preencherTabela(tabela){
    var html = `
        <table class="table table-striped table-hover mt-3">
            <thead>
                <tr>
                    <th> Nome </th>
                    <th> Email </th>
                    <th> CPF </th>
                    <th> Cargo </th>
                    <th> Status </th>
                    <th> Ações </th>
                </tr>
            </thead>
            <tbody>`;
    for(var i=0;i<tabela.length;i++){
        let descCargo = '';
        switch(parseInt(tabela[i].cargo)) {
            case 1: descCargo = 'Admin'; break;
            case 2: descCargo = 'Pedagogo'; break;
            case 3: descCargo = 'Prof. Saúde'; break;
            case 4: descCargo = 'Professor'; break;
            case 5: descCargo = 'Responsável'; break;
            default: descCargo = tabela[i].cargo;
        }

        let btns = `<a href='usuario_alterar.html?id=${tabela[i].id}' class="btn btn-sm btn-primary">Alterar</a>
                    <a href='#' onclick='excluir(${tabela[i].id})' class="btn btn-sm btn-danger">Excluir</a>`;
        
        let descStatus = tabela[i].status == 1 ? 'Ativo' : 'Inativo';
        if (tabela[i].status == '2') {
            btns += ` <a href='#' onclick='aprovar(${tabela[i].id})' class="btn btn-sm btn-success">Aprovar</a>`;
            descStatus = '<span class="text-warning fw-bold">Aguardando Validação</span>';
        }

        html += `
            <tr>
                <td>${tabela[i].nome}</td>
                <td>${tabela[i].email}</td>
                <td>${tabela[i].cpf}</td>
                <td>${descCargo}</td>
                <td>${descStatus}</td>
                <td>${btns}</td>
            </tr>
        `;
    }
    html += '</tbody></table>';
    document.getElementById("lista").innerHTML = html;
}