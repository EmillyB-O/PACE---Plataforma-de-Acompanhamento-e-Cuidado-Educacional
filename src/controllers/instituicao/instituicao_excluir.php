<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
include_once('../../config/conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    try {
        $conexao->begin_transaction();

        // 1. Exclui dados dependentes de todos os Alunos vinculados a esta Instituição
        // Laudos dos alunos da instituição
        $stmtL = $conexao->prepare("DELETE FROM Laudo WHERE id_aluno IN (SELECT id FROM Aluno WHERE id_instituicao = ?)");
        $stmtL->bind_param("i", $id);
        $stmtL->execute();
        $stmtL->close();

        // Relatórios dos alunos da instituição
        $stmtR = $conexao->prepare("DELETE FROM Relatorio WHERE id_aluno IN (SELECT id FROM Aluno WHERE id_instituicao = ?)");
        $stmtR->bind_param("i", $id);
        $stmtR->execute();
        $stmtR->close();

        // Responsáveis dos alunos da instituição
        $stmtResp = $conexao->prepare("DELETE FROM Responsavel_Aluno WHERE id_aluno IN (SELECT id FROM Aluno WHERE id_instituicao = ?)");
        $stmtResp->bind_param("i", $id);
        $stmtResp->execute();
        $stmtResp->close();

        // Profissionais vinculados aos alunos da instituição
        $conexao->query("CREATE TABLE IF NOT EXISTS Profissional_Aluno (
            id_profissional INT NOT NULL,
            id_aluno INT NOT NULL,
            PRIMARY KEY (id_profissional, id_aluno)
        )");
        $stmtProf = $conexao->prepare("DELETE FROM Profissional_Aluno WHERE id_aluno IN (SELECT id FROM Aluno WHERE id_instituicao = ?)");
        $stmtProf->bind_param("i", $id);
        $stmtProf->execute();
        $stmtProf->close();

        // Alunos da instituição
        $stmtAl = $conexao->prepare("DELETE FROM Aluno WHERE id_instituicao = ?");
        $stmtAl->bind_param("i", $id);
        $stmtAl->execute();
        $stmtAl->close();

        // 2. Exclui vínculos de Professores com Turmas desta Instituição
        $stmtPT = $conexao->prepare("DELETE FROM Professor_Turma WHERE id_turma IN (SELECT id FROM Turma WHERE id_instituicao = ?)");
        $stmtPT->bind_param("i", $id);
        $stmtPT->execute();
        $stmtPT->close();

        // 3. Exclui as Turmas vinculadas a esta Instituição
        $stmtT = $conexao->prepare("DELETE FROM Turma WHERE id_instituicao = ?");
        $stmtT->bind_param("i", $id);
        $stmtT->execute();
        $stmtT->close();

        // 4. Exclui vínculos de Usuários (como Profissionais, Pedagogos, etc) com esta Instituição
        $stmtUI = $conexao->prepare("DELETE FROM Usuario_Instituicao WHERE id_instituicao = ?");
        $stmtUI->bind_param("i", $id);
        $stmtUI->execute();
        $stmtUI->close();

        // 5. Exclui o próprio registro da Instituição
        $stmt = $conexao->prepare("DELETE FROM Instituicao WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $linhasAfetadas = $stmt->affected_rows;
        $conexao->commit();

        if ($linhasAfetadas > 0) {
            $retorno = [
                'status' => 'ok',
                'mensagem' => 'Registro excluído com sucesso.',
                'data' => []
            ];
        } else {
            $retorno = [
                'status' => 'nok',
                'mensagem' => 'Registro não encontrado para exclusão.',
                'data' => []
            ];
        }
    } catch (mysqli_sql_exception $e) {
        $conexao->rollback();
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Falha ao excluir a Instituição: ' . $e->getMessage(),
            'data' => []
        ];
    }

    if (isset($stmt) && $stmt !== false) {
        $stmt->close();
    }
} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'É necessário informar um ID para exclusão',
        'data' => []
    ];
}
$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);
