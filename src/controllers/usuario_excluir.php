<?php
include_once('../config/conexao.php');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if (isset($_GET['id'])) {
    try {
        $conexao->begin_transaction();
        $id = $_GET['id'];

        // Exclui das tabelas filhas primeiro por causa das Foreign Keys
        $tabelasFilhas = ['Administrador', 'Pedagogo', 'Profissional_Saude', 'Professor', 'Responsavel_Legal'];
        foreach ($tabelasFilhas as $tabela) {
            $stmt = $conexao->prepare("DELETE FROM $tabela WHERE id_usuario = ?");
            $stmt->bind_param('i', $id);
            $stmt->execute();
        }

        // Exclui da tabela mãe
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