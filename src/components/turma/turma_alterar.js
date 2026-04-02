document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    buscar(id);

});

async function buscar(id) {
    const retorno = await fetch('../src/controllers/turma/turma_get.php?id='+id);
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        var registro = resposta.data[0];
        document.getElementById("nome").value = registro.nome;
        document.getElementById("serie").value = registro.serie;
        document.getElementById("ano").value = registro.ano;
        document.getElementById("quantidade").value = registro.$quantidade;
        document.getElementById("codigo").value = registro.codigo;
        
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
    var ano = document.getElementById('ano').value;
    var quantidade = document.getElementById('quantidade').value;
    var codigo = document.getElementById('codigo').value;
    

    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('serie', serie);
    fd.append('ano', ano);
    fd.append('quantidade', quantidade);
    fd.append('codigo', codigo);
    
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