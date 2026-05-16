let turmaId = null;

document.addEventListener("DOMContentLoaded", async () => {
    valida_sessao();
    await carregarInstituicoes();
    const url = new URLSearchParams(window.location.search);
    turmaId = url.get("id");
    buscar(turmaId);

});

async function buscar(id) {
    const retorno = await fetch('../src/controllers/turma/turma_get.php?id='+id);
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        var registro = resposta.data[0];
        document.getElementById("nome").value = registro.nome;
        document.getElementById("serie").value = registro.serie;
        document.getElementById("ano").value = registro.ano;
        document.getElementById("quantidade").value = registro.qntd_alunos;
        document.getElementById("id_instituicao").value = registro.id_instituicao;
        
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
    var id_instituicao = document.getElementById('id_instituicao').value;
    
    if (!nome || !serie || !ano || !quantidade || !id_instituicao) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('serie', serie);
    fd.append('ano', ano);
    fd.append('quantidade', quantidade);
    fd.append('id_instituicao', id_instituicao);
    
    const retorno = await fetch('../src/controllers/turma/turma_alterar.php?id='+turmaId,
        {
            method: 'POST',
            body: fd
        }
    );

    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        alert('Sucesso: ' + resposta.mensagem);
        window.location.href = 'turma.html';
    }else{
        alert('Erro: ' + resposta.mensagem);
    }
}

async function carregarInstituicoes() {
    try {
        const retorno = await fetch('../src/controllers/instituicao/instituicao_get.php');
        const resposta = await retorno.json();
        if (resposta.status === 'ok') {
            window.instituicoesCache = resposta.data;
            renderInstituicoes(window.instituicoesCache);
            const searchInput = document.getElementById('search_instituicao');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const termo = e.target.value.toLowerCase();
                    const filtradas = window.instituicoesCache.filter(inst => inst.nome.toLowerCase().includes(termo));
                    // get currently selected value to preserve it
                    const select = document.getElementById('id_instituicao');
                    const selectedVal = select.value;
                    renderInstituicoes(filtradas);
                    if(selectedVal) select.value = selectedVal;
                });
            }
        }
    } catch (e) {
        console.error("Erro ao carregar instituições", e);
    }
}

function renderInstituicoes(lista) {
    const select = document.getElementById('id_instituicao');
    if (!select) return;
    
    // preserve current selection
    const currentVal = select.value;
    
    select.innerHTML = '<option value="">Selecione uma instituição</option>';
    lista.forEach(inst => {
        select.innerHTML += `<option value="${inst.id}">${inst.nome}</option>`;
    });
    
    if (currentVal) {
        select.value = currentVal;
    }
}