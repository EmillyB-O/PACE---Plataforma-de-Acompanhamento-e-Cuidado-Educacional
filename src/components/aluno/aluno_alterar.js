document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    buscar(id);

});

async function buscar(id) {
    const retorno = await fetch('../src/controllers/turma/aluno_get.php?id='+id);
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        var registro = resposta.data[0];

        document.getElementById("nome").value = registro.nome;
        document.getElementById("serie").value = registro.serie;
        document.getElementById("nascimento").value = registro.nascimento;
        document.getElementById("matricula").value = registro.matricula;
        document.getElementById("codigo_instituicao").value = registro.codigo_instituicao;
        document.getElementById("codigo_turma").value = registro.codigo_turma;
        
    }else{
        alert("ERRO:" + resposta.mensagem);
        window.location.href = "turma.html";
    }
}
document.getElementById("enviar").addEventListener("click", () => {
    alterar();
})

async function alterar(){

    var nome = document.getElementById('nome').value;
    var serie = document.getElementById('serie').value;
    var nascimento = document.getElementById('nascimento').value;
    var matricula = document.getElementById('matricula').value;
    var codigo_instituicao = document.getElementById('codigo_instituicao').value;
    var codigo_turma = document.getElementById('codigo_turma').value;
    

    const fd = new FormData(); 
    fd.append('nome', nome);
    fd.append('serie', serie);
    fd.append('nascimento', nascimento);
    fd.append('matricula', matricula);
    fd.append('codigo_instituicao', codigo_instituicao);
    fd.append('codigo_turma', codigo_turma);
    
    const retorno = await fetch('../src/controllers/turma/turma_alterar.php?id='+id,
        {
            method: 'POST',
            body: fd
        }
    );

    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        alert('Sucesso: ' + resposta.mensagem);
        window.location.href = 'instituicoes.html';
    }else{
        alert('Erro: ' + resposta.mensagem);
    }
}