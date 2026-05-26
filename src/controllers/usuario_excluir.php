<?php
session_start();
include_once('../config/conexao.php');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['cargo'] != '1') {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Acesso negado. Apenas administradores podem excluir usuários.',
        'data' => []
    ];
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    exit;
}

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $id_logado = $_SESSION['usuario']['id'];

    if ($id == $id_logado) {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Acesso negado. Você não pode excluir a sua própria conta.',
            'data' => []
        ];
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    try {
        $conexao->begin_transaction();

        // 1. Exclui vínculos de tabelas associativas e filhas primeiro para evitar Foreign Key constraint failures
        // Professor_Turma (Vínculo M:N de Professores)
        $stmtPT = $conexao->prepare("DELETE FROM Professor_Turma WHERE id_professor = ?");
        $stmtPT->bind_param('i', $id);
        $stmtPT->execute();
        $stmtPT->close();

        // Responsavel_Aluno (Vínculo M:N de Responsáveis Legais)
        $stmtRA = $conexao->prepare("DELETE FROM Responsavel_Aluno WHERE id_responsavel = ?");
        $stmtRA->bind_param('i', $id);
        $stmtRA->execute();
        $stmtRA->close();

        // Profissional_Aluno (Vínculo M:N de Profissionais de Saúde)
        $conexao->query("CREATE TABLE IF NOT EXISTS Profissional_Aluno (
            id_profissional INT NOT NULL,
            id_aluno INT NOT NULL,
            PRIMARY KEY (id_profissional, id_aluno)
        )");
        $stmtPA = $conexao->prepare("DELETE FROM Profissional_Aluno WHERE id_profissional = ?");
        $stmtPA->bind_param('i', $id);
        $stmtPA->execute();
        $stmtPA->close();

        // Laudo (Laudos criados pelo Profissional de Saúde)
        $stmtLaudo = $conexao->prepare("DELETE FROM Laudo WHERE id_profissional_saude = ?");
        $stmtLaudo->bind_param('i', $id);
        $stmtLaudo->execute();
        $stmtLaudo->close();

        // Avisos (Avisos criados por Administradores)
        $stmtAvisos = $conexao->prepare("DELETE FROM Avisos WHERE id_administrador = ?");
        $stmtAvisos->bind_param('i', $id);
        $stmtAvisos->execute();
        $stmtAvisos->close();

        // 2. Exclui registros das tabelas filhas de cargos
        $tabelasFilhas = ['Administrador', 'Pedagogo', 'Profissional_Saude', 'Professor', 'Responsavel_Legal'];
        foreach ($tabelasFilhas as $tabela) {
            $stmtF = $conexao->prepare("DELETE FROM $tabela WHERE id_usuario = ?");
            $stmtF->bind_param('i', $id);
            $stmtF->execute();
            $stmtF->close();
        }

        // 3. Exclui vínculos e logs gerais do Usuario
        // Usuario_Instituicao (Vínculo M:N com Instituições)
        $stmtUI = $conexao->prepare("DELETE FROM Usuario_Instituicao WHERE id_usuario = ?");
        $stmtUI->bind_param('i', $id);
        $stmtUI->execute();
        $stmtUI->close();

        // Relatorio (Relatórios onde o usuário foi remetente ou recebedor)
        $stmtRel = $conexao->prepare("DELETE FROM Relatorio WHERE id_remetente = ? OR id_recebedor = ?");
        $stmtRel->bind_param('ii', $id, $id);
        $stmtRel->execute();
        $stmtRel->close();

        // Log_Eventos (Logs gerados pelo usuário ou referentes a ele)
        $stmtLog = $conexao->prepare("DELETE FROM Log_Eventos WHERE id_usuario = ? OR id_autor = ?");
        $stmtLog->bind_param('ii', $id, $id);
        $stmtLog->execute();
        $stmtLog->close();

        // 4. Exclui o registro da tabela mãe (Usuario)
        $stmt = $conexao->prepare('DELETE FROM Usuario WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();

        $linhasAfetadas = $stmt->affected_rows;
        $conexao->commit();

        if ($linhasAfetadas > 0) {
            $retorno = [
                'status' => 'ok',
                'mensagem' => 'Registro excluido',
                'data' => []
            ];
        } else {
            $retorno = [
                'status' => 'nok',
                'mensagem' => 'Registro não encontrado para exclusão',
                'data' => []
            ];
        }
    } catch (mysqli_sql_exception $e) {
        $conexao->rollback();
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Erro ao excluir registro: ' . $e->getMessage(),
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