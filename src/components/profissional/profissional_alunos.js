document.addEventListener("DOMContentLoaded", () => {
    valida_sessao();

    const params = new URLSearchParams(window.location.search);
    const idTurma = params.get('id_turma');
    const nomeTurma = params.get('nome_turma');
    const nomeInst = params.get('nome_inst');

    if (nomeTurma) {
        document.getElementById('nome-turma').textContent = `Alunos da turma ${nomeTurma}`;
    }
    if (nomeInst) {
        document.getElementById('bread-inst').innerHTML = `<a href="javascript:history.back()">${nomeInst}</a>`;
    }

    async function carregarAlunos() {
        if (!idTurma) {
            document.getElementById('lista-alunos').innerHTML = '<div class="col-12"><p class="text-danger">ID da turma não fornecido.</p></div>';
            return;
        }

        try {
            const response = await fetch(`../src/controllers/profissional_get_alunos.php?id_turma=${idTurma}`);
            const result = await response.json();
            const lista = document.getElementById('lista-alunos');
            
            if (result.status === 'ok') {
                if (result.data.length === 0) {
                    lista.innerHTML = '<div class="col-12"><p class="text-dark">Nenhum aluno encontrado nesta turma sob sua responsabilidade.</p></div>';
                    return;
                }

                var html = '';
                for (var i = 0; i < result.data.length; i++) {
                    const aluno = result.data[i];
                    html += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${aluno.nome}</h5>
                                <p class="card-text text-muted">Matrícula: ${aluno.matricula}</p>
                                <a href="aluno.html?id=${aluno.id}" class="btn btn-success mt-auto">Acessar Perfil</a>
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
            console.error('Erro ao carregar alunos:', error);
            document.getElementById('lista-alunos').innerHTML = '<div class="col-12"><p class="text-danger">Erro na conexão com o servidor.</p></div>';
        }
    }

    carregarAlunos();
});
