document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();

    const params = new URLSearchParams(window.location.search);
    const idInstituicao = params.get('id_instituicao');
    const nomeInstituicao = params.get('nome');

    if (nomeInstituicao) {
        document.getElementById('nome-instituicao').textContent = `Turmas de ${nomeInstituicao}`;
    }

    async function carregarTurmas() {
        if (!idInstituicao) {
            document.getElementById('lista-turmas').innerHTML = '<div class="col-12"><p class="text-danger">ID da instituição não fornecido.</p></div>';
            return;
        }

        try {
            const response = await fetch(`../src/controllers/profissional/profissional_get_turmas.php?id_instituicao=${idInstituicao}`);
            const result = await response.json();
            const lista = document.getElementById('lista-turmas');

            if (result.status === 'ok') {
                if (result.data.length === 0) {
                    lista.innerHTML = '<div class="col-12"><p class="text-dark">Sem turmas cadastradas.</p></div>';
                    return;
                }

                var html = '';
                for (var i = 0; i < result.data.length; i++) {
                    const turma = result.data[i];
                    html += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${turma.nome}</h5>
                                <p class="card-text text-muted">Série: ${turma.serie} | Ano: ${turma.ano}</p>
                                <a href="profissional_alunos.html?id_turma=${turma.id}&nome_turma=${encodeURIComponent(turma.nome)}&nome_inst=${encodeURIComponent(nomeInstituicao || '')}" class="btn btn-primary mt-auto">Ver Alunos</a>
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
            console.error('Erro ao carregar turmas:', error);
            document.getElementById('lista-turmas').innerHTML = '<div class="col-12"><p class="text-danger">Erro na conexão com o servidor.</p></div>';
        }
    }

    carregarTurmas();
});
