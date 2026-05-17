document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();

    async function carregarInstituicoes() {
        try {
            const response = await fetch('../src/controllers/profissional/profissional_get_instituicoes.php');
            const result = await response.json();
            const lista = document.getElementById('lista-instituicoes');
            
            if (result.status === 'ok') {
                if (result.data.length === 0) {
                    lista.innerHTML = '<div class="col-12"><p class="text-dark">Você não está vinculado a nenhuma instituição.</p></div>';
                    return;
                }

                var html = '';
                for (var i = 0; i < result.data.length; i++) {
                    const inst = result.data[i];
                    html += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${inst.nome}</h5>
                                <p class="card-text text-muted">Código: ${inst.codigo}</p>
                                <p class="card-text flex-grow-1">${inst.endereco || 'Endereço não cadastrado'}</p>
                                <a href="profissional_turmas.html?id_instituicao=${inst.id}&nome=${encodeURIComponent(inst.nome)}" class="btn btn-primary mt-auto">Ver Turmas</a>
                            </div>
                        </div>
                    </div>
                    `;
                }
                lista.innerHTML = html;
            } else {
                lista.innerHTML = `<div class="col-12"><p class="text-danger">Erro: ${result.mensagem}</p></div>`;
            }
        } catch (error) {
            console.error('Erro ao carregar instituições:', error);
            document.getElementById('lista-instituicoes').innerHTML = '<div class="col-12"><p class="text-danger">Erro na conexão com o servidor.</p></div>';
        }
    }

    carregarInstituicoes();
});
