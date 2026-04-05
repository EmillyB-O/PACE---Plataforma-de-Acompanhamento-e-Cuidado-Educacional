document.getElementById('enviar').addEventListener('click', () => { //"escuta" o clique do botao e automaticamente executa a funcao
    novo(); // a funcao cria uma instituicao nova
});

async function novo() {
    var nome = document.getElementById('nome').value;
    var serie = document.getElementById('serie').value;
    var nascimento = document.getElementById('nascimento').value;
    var matricula = document.getElementById('matricula').value;
    var status = document.querySelector('input[name="status"]:checked') ? document.querySelector('input[name="status"]:checked').value : '0';
    var id_instituicao = document.getElementById('id_instituicao').value;
    var id_turma = document.getElementById('id_turma').value;
    
    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('serie', serie);
    fd.append('nascimento', nascimento);
    fd.append('matricula', matricula);
    fd.append('status', status);
    fd.append('id_instituicao', id_instituicao);
    fd.append('id_turma', id_turma);

    //isso serve para identificar se a transacao deu certo ou nn, pois para enviar os dados da instituicao para o banco é necessario uma transacao 
    try {
        const retorno = await fetch('../src/controllers/aluno/aluno_novo.php',
            {
                method: 'POST',
                body: fd
            }
        );//prepara um retorno padrao para exibir a resposta de sucesso/erro

        const resposta = await retorno.json();
        if(resposta.status == 'ok'){
            alert('Sucesso: ' + resposta.mensagem);
            window.location.href = 'aluno.html'; // direciona pra lista apos criar
        }else{
            alert('Erro: ' + resposta.mensagem);
        }
    }catch(erro){
        console.error("Erro na requisição: ", erro);
        alert("Ocorreu um erro ao comunicar com o servidor.")
    }
    
}
