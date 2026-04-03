<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
include_once('../../config/conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if (isset($_GET['id'])) {
    try {
        $stmt = $conexao->prepare("DELETE FROM Turma WHERE id= ?");
        $stmt->bind_param("i", $_GET['id']);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
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
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Falha ao excluir a Turma! Existem vínculos (alunos/professores) associados a ela.',
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