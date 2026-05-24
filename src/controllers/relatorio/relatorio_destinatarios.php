<?php
session_start();
require_once '../../config/conexao.php';

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Erro desconhecido.',
    'data' => []
];

if (!isset($_SESSION['usuario'])) {
    $retorno['mensagem'] = 'Sessão expirada.';
    echo json_encode($retorno);
    exit;
}

$id_aluno = isset($_GET['id_aluno']) ? intval($_GET['id_aluno']) : 0;

if ($id_aluno <= 0) {
    $retorno['mensagem'] = 'ID do aluno inválido.';
    echo json_encode($retorno);
    exit;
}

try {
    // 1. Obter instituição e turma do aluno
    $stmt_aluno = $conexao->prepare("SELECT id_instituicao, id_turma FROM Aluno WHERE id = ?");
    $stmt_aluno->bind_param("i", $id_aluno);
    $stmt_aluno->execute();
    $res_aluno = $stmt_aluno->get_result();
    
    if (!$row_aluno = $res_aluno->fetch_assoc()) {
        $stmt_aluno->close();
        $retorno['mensagem'] = 'Aluno não encontrado.';
        echo json_encode($retorno);
        exit;
    }
    $stmt_aluno->close();
    
    $id_instituicao = $row_aluno['id_instituicao'];
    $id_turma = $row_aluno['id_turma'];
    
    $pedagogos = [];
    $professores = [];
    $responsaveis = [];
    
    // 2. Buscar Pedagogos vinculados à instituição do aluno
    $stmt_ped = $conexao->prepare("
        SELECT u.id, u.nome, u.cargo 
        FROM Usuario u
        JOIN Usuario_Instituicao ui ON u.id = ui.id_usuario
        WHERE ui.id_instituicao = ? AND u.cargo = '2' AND u.status = '1'
        ORDER BY u.nome ASC
    ");
    $stmt_ped->bind_param("i", $id_instituicao);
    $stmt_ped->execute();
    $res_ped = $stmt_ped->get_result();
    while ($row = $res_ped->fetch_assoc()) {
        $pedagogos[] = $row;
    }
    $stmt_ped->close();
    
    // 3. Buscar Professores vinculados à turma do aluno
    $stmt_prof = $conexao->prepare("
        SELECT u.id, u.nome, u.cargo, prof.materia
        FROM Usuario u
        JOIN Professor prof ON u.id = prof.id_usuario
        JOIN Professor_Turma pt ON u.id = pt.id_professor
        WHERE pt.id_turma = ? AND u.cargo = '4' AND u.status = '1'
        ORDER BY u.nome ASC
    ");
    $stmt_prof->bind_param("i", $id_turma);
    $stmt_prof->execute();
    $res_prof = $stmt_prof->get_result();
    while ($row = $res_prof->fetch_assoc()) {
        $professores[] = $row;
    }
    $stmt_prof->close();
    
    // 4. Buscar Responsáveis Legais vinculados ao aluno
    $stmt_resp = $conexao->prepare("
        SELECT u.id, u.nome, u.cargo, ra.parentesco
        FROM Usuario u
        JOIN Responsavel_Aluno ra ON u.id = ra.id_responsavel
        WHERE ra.id_aluno = ? AND u.cargo = '5' AND u.status = '1'
        ORDER BY u.nome ASC
    ");
    $stmt_resp->bind_param("i", $id_aluno);
    $stmt_resp->execute();
    $res_resp = $stmt_resp->get_result();
    while ($row = $res_resp->fetch_assoc()) {
        $responsaveis[] = $row;
    }
    $stmt_resp->close();
    
    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Destinatários listados com sucesso.',
        'data' => [
            'pedagogos' => $pedagogos,
            'professores' => $professores,
            'responsaveis' => $responsaveis
        ]
    ];
    
} catch (mysqli_sql_exception $e) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => obterMensagemErroBanco($e->getMessage(), $e->getCode()),
        'data' => []
    ];
}

$conexao->close();

header('Content-Type: application/json; charset=utf-8');
echo json_encode($retorno);
