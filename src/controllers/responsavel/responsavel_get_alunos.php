<?php
session_start();
include_once('../../config/conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => '',
    'data' => []
];

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['cargo'] !== '5') {
    $retorno['mensagem'] = 'Acesso não autorizado.';
    echo json_encode($retorno);
    exit;
}

$id_responsavel = $_SESSION['usuario']['id'];

// Get students linked to the responsible
$stmt = $conexao->prepare('
    SELECT a.id, a.nome, a.matricula, t.nome as turma_nome
    FROM Aluno a
    JOIN Responsavel_Aluno ra ON a.id = ra.id_aluno
    JOIN Turma t ON a.id_turma = t.id
    WHERE ra.id_responsavel = ?
');
$stmt->bind_param('i', $id_responsavel);
$stmt->execute();
$resAlunos = $stmt->get_result();

$alunos = [];
while ($aluno = $resAlunos->fetch_assoc()) {
    // Get reports for this student, filtering by pedagogue sender (cargo = 2) or matching id_recebedor
    $stmtRel = $conexao->prepare('
        SELECT r.id, r.titulo, r.data_emissao, r.conteudo, u.nome as remetente_nome
        FROM Relatorio r
        JOIN Usuario u ON r.id_remetente = u.id
        WHERE r.id_aluno = ? AND (u.cargo = \'2\' OR r.id_recebedor = ?)
        ORDER BY r.data_emissao DESC
    ');
    $stmtRel->bind_param('ii', $aluno['id'], $id_responsavel);
    $stmtRel->execute();
    $resRel = $stmtRel->get_result();
    
    $relatorios = [];
    while ($rel = $resRel->fetch_assoc()) {
        $relatorios[] = $rel;
    }
    $stmtRel->close();
    
    $aluno['relatorios'] = $relatorios;
    $alunos[] = $aluno;
}

$stmt->close();

$retorno['status'] = 'ok';
$retorno['mensagem'] = 'Sucesso';
$retorno['data'] = $alunos;

header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);
