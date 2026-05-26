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
            const response = await fetch(`../src/controllers/profissional/profissional_get_alunos.php?id_turma=${idTurma}`);
            const result = await response.json();
            const lista = document.getElementById('lista-alunos');
            
            if (result.status === 'ok') {
                if (result.data.length === 0) {
                    lista.innerHTML = '<p class="text-dark">Sem alunos cadastrados.</p>';
                    return;
                }

                var html = `
                <table class="table table-striped table-hover mt-3">
                    <thead>
                        <tr>
                            <th> Nome </th>
                            <th> Matrícula </th>
                            <th> Série </th>
                            <th> Ações </th>
                        </tr>
                    </thead>
                    <tbody>`;
                for (var i = 0; i < result.data.length; i++) {
                    const aluno = result.data[i];
                    html += `
                        <tr>
                            <td data-label="Nome">
                                <a href="aluno_detalhes.html?id=${aluno.id}">
                                    ${aluno.nome}
                                </a>
                            </td>
                            <td data-label="Matrícula">${aluno.matricula}</td>
                            <td data-label="Série">${aluno.serie}</td>
                            <td data-label="Ações">
                                <a href="aluno_detalhes.html?id=${aluno.id}" class="btn btn-sm btn-success">Acessar Perfil</a>
                            </td>
                        </tr>
                    `;
                }
                html += '</tbody></table>';
                lista.innerHTML = html;
            } else {
                lista.innerHTML = `<p class="text-danger">Erro: ${result.mensagem}</p>`;
            }
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            document.getElementById('lista-alunos').innerHTML = '<p class="text-danger">Erro na conexão com o servidor.</p>';
        }
    }

    carregarAlunos();
});
