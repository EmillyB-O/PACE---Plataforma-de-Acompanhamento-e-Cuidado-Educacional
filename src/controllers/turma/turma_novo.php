<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
include_once('../../config/conexao.php');
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

$nome = $_POST['nome'];
$serie = $_POST['serie'];
$ano = $_POST['ano'];
$quantidade = $_POST['quantidade'];
$id_instituicao = $_POST['id_instituicao'];

try {
    $conexao->begin_transaction();
    $stmt = $conexao->prepare('INSERT INTO Turma (nome, serie, ano, qntd_alunos, id_instituicao) VALUES (?,?,?,?,?)');
    $stmt->bind_param('siiii', $nome, $serie, $ano, $quantidade, $id_instituicao);
    $stmt->execute();
    $conexao->commit();

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Turma inserida com sucesso!',
        'data' => []
    ];
} catch (mysqli_sql_exception $e) {
    if (isset($conexao)) {
        $conexao->rollback();
    }

    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Não foi possível realizar a operação na Turma: ' . $e->getMessage(),
        'data' => []
    ];
}

if (isset($stmt) && $stmt !== false) {
    $stmt->close();
}
$conexao->close();

header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);