<?php
session_start();
include_once('../../config/conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => '',
    'data' => []
];

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['cargo'] != '1') {
    $retorno['mensagem'] = 'Acesso negado.';
    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);
    exit;
}

$id_aluno = $_POST['id_aluno'] ?? null;
$id_usuario = $_POST['id_usuario'] ?? null;
$cargo = $_POST['cargo'] ?? null;

if (!$id_aluno || !$id_usuario || !$cargo) {
    $retorno['mensagem'] = 'Campos obrigatórios ausentes.';
    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);
    exit;
}

try {
    if ($cargo == '3') {
        $stmt = $conexao->prepare("DELETE FROM Profissional_Aluno WHERE id_aluno = ? AND id_profissional = ?");
        $stmt->bind_param('ii', $id_aluno, $id_usuario);
        $stmt->execute();
        $stmt->close();
        $retorno['mensagem'] = 'Vínculo do Profissional removido com sucesso.';
    } else if ($cargo == '5') {
        $stmt = $conexao->prepare("DELETE FROM Responsavel_Aluno WHERE id_aluno = ? AND id_responsavel = ?");
        $stmt->bind_param('ii', $id_aluno, $id_usuario);
        $stmt->execute();
        $stmt->close();
        $retorno['mensagem'] = 'Vínculo do Responsável removido com sucesso.';
    } else {
        $retorno['mensagem'] = 'Cargo inválido.';
        header('Content-type:application/json;charset:utf-8');
        echo json_encode($retorno);
        exit;
    }
    $retorno['status'] = 'ok';
} catch (Exception $e) {
    $retorno['mensagem'] = 'Erro ao desvincular: ' . $e->getMessage();
}

$conexao->close();
header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);
