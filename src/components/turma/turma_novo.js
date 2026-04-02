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
    
}