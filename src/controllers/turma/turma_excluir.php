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

        // 1. Exclui dados dependentes de todos os Alunos que pertencem a esta Turma
        // Laudos dos alunos da turma
        $stmtL = $conexao->prepare("DELETE FROM Laudo WHERE id_aluno IN (SELECT id FROM Aluno WHERE id_turma = ?)");
        $stmtL->bind_param("i", $id);
        $stmtL->execute();
        $stmtL->close();

        // Relatórios dos alunos da turma
        $stmtR = $conexao->prepare("DELETE FROM Relatorio WHERE id_aluno IN (SELECT id FROM Aluno WHERE id_turma = ?)");
        $stmtR->bind_param("i", $id);
        $stmtR->execute();
        $stmtR->close();

        // Responsáveis dos alunos da turma
        $stmtResp = $conexao->prepare("DELETE FROM Responsavel_Aluno WHERE id_aluno IN (SELECT id FROM Aluno WHERE id_turma = ?)");
        $stmtResp->bind_param("i", $id);
        $stmtResp->execute();
        $stmtResp->close();

        // Profissionais vinculados aos alunos da turma
        $conexao->query("CREATE TABLE IF NOT EXISTS Profissional_Aluno (
            id_profissional INT NOT NULL,
            id_aluno INT NOT NULL,
            PRIMARY KEY (id_profissional, id_aluno)
        )");
        $stmtProf = $conexao->prepare("DELETE FROM Profissional_Aluno WHERE id_aluno IN (SELECT id FROM Aluno WHERE id_turma = ?)");
        $stmtProf->bind_param("i", $id);
        $stmtProf->execute();
        $stmtProf->close();

        // Alunos da turma
        $stmtAl = $conexao->prepare("DELETE FROM Aluno WHERE id_turma = ?");
        $stmtAl->bind_param("i", $id);
        $stmtAl->execute();
        $stmtAl->close();

        // 2. Exclui vínculos de Professores com esta Turma
        $stmtPT = $conexao->prepare("DELETE FROM Professor_Turma WHERE id_turma = ?");
        $stmtPT->bind_param("i", $id);
        $stmtPT->execute();
        $stmtPT->close();

        // 3. Exclui o próprio registro da Turma
        $stmt = $conexao->prepare("DELETE FROM Turma WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $linhasAfetadas = $stmt->affected_rows;
        $conexao->commit();

        if ($linhasAfetadas > 0) {
            $retorno = [
                'status' => 'ok',
                'mensagem' => 'Turma excluída com sucesso.',
                'data' => []
            ];
        } else {
            $retorno = [
                'status' => 'nok',
                'mensagem' => 'Turma não encontrada para exclusão.',
                'data' => []
            ];
        }
    } catch (mysqli_sql_exception $e) {
        $conexao->rollback();
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Falha ao excluir a Turma: ' . $e->getMessage(),
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