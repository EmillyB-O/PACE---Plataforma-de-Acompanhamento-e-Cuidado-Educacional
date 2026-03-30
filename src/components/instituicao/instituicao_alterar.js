document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    buscar(id);

});

async function buscar(id) {
    const retorno = await fetch('../src/controllers/instituicao/instituicao_get.php?id='+id);
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        var registro = resposta.data[0];
        document.getElementById("nome").value = registro.nome;
        document.getElementById("endereco").value = registro.endereco;
        document.getElementById("codigo").value = registro.codigo;
        document.getElementById("id").value = registro.id;
    }else{
        alert("ERRO:" + resposta.mensagem);
        window.location.href = "instituicoes.html";
    }
}
document.getElementById("enviar").addEventListener("click", () => {
    alterar();
})

async function alterar(){
    var nome = document.getElementById('nome').value;
    var endereco = document.getElementById('endereco').value;
    var codigo = document.getElementById('codigo').value;
    var id = document.getElementById('id').value;

    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('endereco', endereco);
    fd.append('codigo', codigo);
    
    const retorno = await fetch('../src/controllers/instituicao/instituicao_alterar.php?id='+id,
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