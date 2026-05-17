<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

include_once('../config/conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => '',
    'data' => []
];

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['cargo'] != '3') {
    $retorno['mensagem'] = 'Acesso negado.';
    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);
    exit;
}

$id_profissional = $_SESSION['usuario']['id'];

$query = "SELECT i.* FROM Instituicao i 
          JOIN Profissional_Instituicao pi ON i.id = pi.id_instituicao 
          WHERE pi.id_profissional = ?";

$stmt = $conexao->prepare($query);
if (!$stmt) {
    $retorno['mensagem'] = 'Erro no banco: ' . $conexao->error;
    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);
    exit;
}
$stmt->bind_param('i', $id_profissional);
$stmt->execute();
$resultado = $stmt->get_result();

$tabela = [];
while ($linha = $resultado->fetch_assoc()) {
    $tabela[] = $linha;
}

$retorno['status'] = 'ok';
$retorno['mensagem'] = 'Consulta efetuada com sucesso!';
$retorno['data'] = $tabela;

$stmt->close();
$conexao->close();

header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);
?>
