document.addEventListener("DOMContentLoaded", () => {
    carregarEstudantes();
});

async function carregarEstudantes() {
    try {
        const response = await fetch('../src/controllers/responsavel/responsavel_get_alunos.php');
        const data = await response.json();
        
        const container = document.getElementById('estudantes-container');
        container.innerHTML = '';

        if (data.status === 'ok' && data.data.length > 0) {
            data.data.forEach(aluno => {
                const card = document.createElement('div');
                card.className = 'col-md-12 mb-4';
                
                let relatoriosHtml = '<p class="text-muted">Nenhum relatório emitido para este aluno.</p>';
                
                if (aluno.relatorios && aluno.relatorios.length > 0) {
                    relatoriosHtml = '<div class="list-group">';
                    aluno.relatorios.forEach(rel => {
                        const dataEmissao = new Date(rel.data_emissao).toLocaleDateString('pt-BR');
                        // Escapando dados para colocar no onclick
                        const relData = encodeURIComponent(JSON.stringify(rel));
                        relatoriosHtml += `
                            <button type="button" class="list-group-item list-group-item-action" onclick="abrirRelatorio('${relData}')">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1">${rel.titulo}</h6>
                                    <small>${dataEmissao}</small>
                                </div>
                                <small class="text-muted">Por: ${rel.remetente_nome}</small>
                            </button>
                        `;
                    });
                    relatoriosHtml += '</div>';
                }

                card.innerHTML = `
                    <div class="card shadow-sm">
                        <div class="card-header" style="background-color: #004e7a; color: white;">
                            <h5 class="mb-0">${aluno.nome}</h5>
                            <small>Matrícula: ${aluno.matricula} | Turma: ${aluno.turma_nome}</small>
                        </div>
                        <div class="card-body">
                            <h6>Relatórios Periódicos</h6>
                            ${relatoriosHtml}
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = `
                <div class="col-12 text-center mt-5">
                    <p class="lead">Nenhum estudante vinculado foi encontrado.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Erro ao carregar estudantes:", error);
        document.getElementById('estudantes-container').innerHTML = `
            <div class="col-12 text-center mt-5">
                <p class="text-danger">Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

function abrirRelatorio(relDataEncoded) {
    try {
        const rel = JSON.parse(decodeURIComponent(relDataEncoded));
        
        document.getElementById('modal-titulo').innerText = rel.titulo;
        document.getElementById('modal-remetente').innerText = rel.remetente_nome;
        document.getElementById('modal-data').innerText = new Date(rel.data_emissao).toLocaleString('pt-BR');
        document.getElementById('modal-conteudo').innerText = rel.conteudo;
        
        const modal = new bootstrap.Modal(document.getElementById('relatorioModal'));
        modal.show();
    } catch (error) {
        console.error("Erro ao exibir relatório:", error);
    }
}
