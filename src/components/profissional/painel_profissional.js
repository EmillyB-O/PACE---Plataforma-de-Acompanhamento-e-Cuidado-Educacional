document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();

    async function carregarAvisos(){
        try {
            const response = await fetch('../src/controllers/profissional/profissional_get_avisos.php');
            const result = await response.json();
            const lista = document.getElementById('lista-avisos');

            if(result.status == 'ok'){
                if(result.data.length === 0){
                    lista.innerHTML = '<p class="text-muted">Nenhum aviso ou relatório no momento.</p>';
                    return;
                }  
                var html = '';
                for(var i = 0; i < result.data.length; i++){
                    const aviso = result.data[i];
                    const dataEmissao = new Date(aviso.data_emissao).toLocaleString('pt-BR');
                    html += `
                    <a href="aluno.html?id=${aviso.id_aluno}" class="list-group-item list-group-item-action mb-2 rounded">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${aviso.titulo}</h5>
                            <small>${dataEmissao}</small>
                        </div>
                        <p class="mb-1">${aviso.conteudo}</p>
                        <small class="text-muted">Aluno: ${aviso.nome_aluno} | Enviado por: ${aviso.nome_remetente}</small>
                    </a>
                    `;
                }
                lista.innerHTML = html;
            }else{
                lista.innerHTML = `<p class="text-danger">Erro: ${result.mensagem}</p>`;
            }
        } catch (error){
            console.error('Erro ao carregar avisos', error);
            document.getElementById('lista-avisos').innerHTML = '<p class="text-danger">Erro na conexão com o servidor.</p>';
        }
    }
    carregarAvisos();    
});