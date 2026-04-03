<?php
include_once('../config/conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

$idUsuario = $_GET['id'];

if ($idUsuario) {
    try {
        $stmt = $conexao->prepare("UPDATE Usuario SET status = '1' WHERE id = ?");
        $stmt->bind_param('i', $idUsuario);
        $stmt->execute();

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Usuário ativado com sucesso!',
            'data' => []
        ];
    } catch (Exception $e) {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Não foi possível ativar o usuário.',
            'data' => []
        ];
    }
}

header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);