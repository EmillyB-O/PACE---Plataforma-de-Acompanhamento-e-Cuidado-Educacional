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
        // Marca o usuário como inválido/banido (status 3)
        $stmt = $conexao->prepare("UPDATE Usuario SET status = '3' WHERE id = ?");
        $stmt->bind_param('i', $idUsuario);
        $stmt->execute();

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Usuário recusado e marcado como inválido.',
            'data' => []
        ];
    } catch (Exception $e) {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Não foi possível recusar o usuário.',
            'data' => []
        ];
    }
}

header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);
