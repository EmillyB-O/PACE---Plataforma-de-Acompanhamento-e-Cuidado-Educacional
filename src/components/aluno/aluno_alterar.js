document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    buscar(id);

});

async function buscar(id) {
    const retorno = await fetch('../src/controllers/aluno/aluno_get.php?id='+id);
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        var registro = resposta.data[0];

        document.getElementById("nome").value = registro.nome;
        document.getElementById("serie").value = registro.serie;
        document.getElementById("nascimento").value = registro.data_nascimento;
        document.getElementById("matricula").value = registro.matricula;
        let rb = document.querySelector('input[name="status"][value="'+registro.status+'"]');
        if(rb) rb.checked = true;
        document.getElementById("id_instituicao").value = registro.id_instituicao;
        document.getElementById("id_turma").value = registro.id_turma;
        
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
    
    const retorno = await fetch('../src/controllers/aluno/aluno_alterar.php?id='+id,
        {
            method: 'POST',
            body: fd
        }
    );

    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        alert('Sucesso: ' + resposta.mensagem);
        window.location.href = 'aluno.html';
    }else{
        alert('Erro: ' + resposta.mensagem);
    }
}