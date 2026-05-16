document.addEventListener("DOMContentLoaded", async () => {
    await valida_sessao();
    
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    
    // Configurar listener para mudança de instituição
    document.getElementById('id_instituicao').addEventListener('change', async (e) => {
        const id_inst = e.target.value;
        if (id_inst) {
            await carregarTurmas(id_inst);
        } else {
            document.getElementById('id_turma').innerHTML = '<option value="">Selecione uma instituição primeiro</option>';
        }
    });

    await carregarInstituicoes();
    if (id) {
        buscar(id);
    }
});

async function buscar(id) {
    try {
        const retorno = await fetch('../src/controllers/aluno/aluno_get.php?id=' + id);
        const resposta = await retorno.json();
        if (resposta.status == 'ok') {
            var registro = resposta.data[0];

            document.getElementById("nome").value = registro.nome;
            document.getElementById("serie").value = registro.serie;
            document.getElementById("nascimento").value = registro.data_nascimento;
            document.getElementById("matricula").value = registro.matricula;
            
            let rb = document.querySelector('input[name="status"][value="' + registro.status + '"]');
            if (rb) rb.checked = true;

            // Selecionar instituição e carregar turmas
            document.getElementById("id_instituicao").value = registro.id_instituicao;
            
            // Carregar turmas sincronamente para poder selecionar a correta depois
            await carregarTurmas(registro.id_instituicao);
            document.getElementById("id_turma").value = registro.id_turma;
            
        } else {
            alert("ERRO: " + resposta.mensagem);
            window.location.href = "aluno.html";
        }
    } catch (error) {
        console.error("Erro ao buscar aluno:", error);
    }
}

document.getElementById("enviar").addEventListener("click", () => {
    alterar();
});

async function alterar() {
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");

    var nome = document.getElementById('nome').value;
    var serie = document.getElementById('serie').value;
    var nascimento = document.getElementById('nascimento').value;
    var matricula = document.getElementById('matricula').value;
    var status = document.querySelector('input[name="status"]:checked') ? document.querySelector('input[name="status"]:checked').value : '0';
    var id_instituicao = document.getElementById('id_instituicao').value;
    var id_turma = document.getElementById('id_turma').value;

    if (!nome || !id_instituicao || !id_turma) {
        alert("Por favor, preencha os campos obrigatórios (Nome, Instituição e Turma).");
        return;
    }

    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('serie', serie);
    fd.append('nascimento', nascimento);
    fd.append('matricula', matricula);
    fd.append('status', status);
    fd.append('id_instituicao', id_instituicao);
    fd.append('id_turma', id_turma);

    try {
        const retorno = await fetch('../src/controllers/aluno/aluno_alterar.php?id=' + id, {
            method: 'POST',
            body: fd
        });

        const resposta = await retorno.json();
        if (resposta.status == 'ok') {
            alert('Sucesso: ' + resposta.mensagem);
            window.location.href = 'aluno.html';
        } else {
            alert('Erro: ' + resposta.mensagem);
        }
    } catch (erro) {
        console.error("Erro na requisição: ", erro);
        alert("Ocorreu um erro ao comunicar com o servidor.")
    }
}

async function carregarInstituicoes() {
    try {
        const retorno = await fetch('../src/controllers/instituicao/instituicao_get.php');
        const resposta = await retorno.json();
        if (resposta.status === 'ok') {
            renderInstituicoes(resposta.data);
        }
    } catch (e) {
        console.error("Erro ao carregar instituições", e);
    }
}

function renderInstituicoes(lista) {
    const select = document.getElementById('id_instituicao');
    if (!select) return;
    
    const currentVal = select.value;
    select.innerHTML = '<option value="">Selecione uma instituição</option>';
    lista.forEach(inst => {
        select.innerHTML += `<option value="${inst.id}">${inst.nome}</option>`;
    });
    
    if (currentVal) {
        select.value = currentVal;
    }
}

async function carregarTurmas(id_instituicao) {
    try {
        const retorno = await fetch(`../src/controllers/turma/turma_get.php?id_instituicao=${id_instituicao}`);
        const resposta = await retorno.json();
        const select = document.getElementById('id_turma');
        if (resposta.status === 'ok') {
            select.innerHTML = '<option value="">Selecione uma turma</option>';
            resposta.data.forEach(turma => {
                select.innerHTML += `<option value="${turma.id}">${turma.nome} - ${turma.serie}ª série</option>`;
            });
        } else {
            select.innerHTML = '<option value="">Nenhuma turma encontrada</option>';
        }
    } catch (e) {
        console.error("Erro ao carregar turmas", e);
    }
}