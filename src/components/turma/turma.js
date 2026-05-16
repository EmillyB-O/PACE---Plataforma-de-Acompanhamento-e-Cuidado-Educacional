document.getElementById('enviar').addEventListener('click', () => { //"escuta" o clique do botao e automaticamente executa a funcao
    novo(); // a funcao cria uma instituicao nova
});

async function novo() {
    var nome = document.getElementById('nome').value;
    var serie = document.getElementById('serie').value;
    var ano = document.getElementById('ano').value;
    var quantidade = document.getElementById('quantidade').value;
    var codigo = document.getElementById('codigo').value;
    
    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('serie', serie);
    fd.append('ano', ano);
    fd.append('quantidade', quantidade);
    fd.append('codigo', codigo);

    //isso serve para identificar se a transacao deu certo ou nn, pois para enviar os dados da instituicao para o banco é necessario uma transacao 
    try {
        const retorno = await fetch('../src/controllers/turma/turma_novo.php',
            {
                method: 'POST',
                body: fd
            }
        );//prepara um retorno padrao para exibir a resposta de sucesso/erro

        const resposta = await retorno.json();
        if(resposta.status == 'ok'){
            alert('Sucesso: ' + resposta.mensagem);
            window.location.href = 'instituicoes.html'; // direciona pra lista apos criar
        }else{
            alert('Erro: ' + resposta.mensagem);
        }
    }catch(erro){
        console.error("Erro na requisição: ", erro);
        alert("Ocorreu um erro ao comunicar com o servidor.")
    }
<<<<<<< Updated upstream
    
}
=======
}

async function buscar() {
    const retorno = await fetch('../src/controllers/turma/turma_get.php');
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        preencherTabela(resposta.data);
    }
}
async function excluir(id) {
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
>>>>>>> Stashed changes
