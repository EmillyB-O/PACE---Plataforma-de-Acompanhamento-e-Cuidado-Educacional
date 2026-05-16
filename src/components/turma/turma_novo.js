document.addEventListener('DOMContentLoaded', () => {
    carregarInstituicoes();
});

document.getElementById('enviar').addEventListener('click', () => { //"escuta" o clique do botao e automaticamente executa a funcao
    novo(); // a funcao cria uma instituicao nova
});

async function novo() {
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
            window.location.href = 'turma.html'; // direciona pra lista apos criar
        }else{
            alert('Erro: ' + resposta.mensagem);
        }
    }catch(erro){
        console.error("Erro na requisição: ", erro);
        alert("Ocorreu um erro ao comunicar com o servidor.")
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
                    renderInstituicoes(filtradas);
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
    select.innerHTML = '<option value="">Selecione uma instituição</option>';
    lista.forEach(inst => {
        select.innerHTML += `<option value="${inst.id}">${inst.nome}</option>`;
    });
}