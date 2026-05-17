<?php
// Implementar no topo dos arquivos (_novo.php, _excluir.php, _alterar.php):
// include_once('../../config/valida_permissao.php');

session_start();

if(!isset($_SESSION['usuario'])){
    http_response_code(403);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Usuário não autenticado'
    ]);
    exit;
}

$usuario = $_SESSION['usuario'];

if($usuario['cargo'] == '4'){
    http_response_code(403);
    echo json_encode([
        'status' => 'nok',
        'mensagem' => 'Sem permissão'
    ]);
    exit;
}
?>