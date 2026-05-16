document.addEventListener("DOMContentLoaded", async () => {
    valida_sessao();
    await carregarInstituicoes();
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