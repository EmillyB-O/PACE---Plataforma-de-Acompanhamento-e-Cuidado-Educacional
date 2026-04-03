<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
include_once('../../config/conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if (isset($_GET['id'])) {
    $nome = $_POST['nome'];
    $nascimento = $_POST['nascimento'];
    $serie = $_POST['serie'];
    $matricula = $_POST['matricula'];
    $id_instituicao = $_POST['id_instituicao'];
    $id_turma = $_POST['id_turma'];

    try {
        $conexao->begin_transaction();
        $stmt = $conexao->prepare("UPDATE Aluno SET nome = ?, data_nascimento = ?, matricula = ?, id_turma = ?, id_instituicao = ?, serie = ? WHERE id = ?");
        $stmt->bind_param("ssiiiii", $nome, $nascimento, $matricula, $id_turma, $id_instituicao, $serie, $_GET['id']);
        $stmt->execute();
        $conexao->commit();

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Aluno alterado com sucesso',
            'data' => []
        ];

    } catch (mysqli_sql_exception $e) {
        $conexao->rollback();
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Não foi possível alterar o Aluno: ' . $e->getMessage(),
            'data' => []
        ];
    }

    if (isset($stmt) && $stmt !== false) {
        $stmt->close();
    }

} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Não posso alterar um registro sem um ID informado',
        'data' => []
    ];
}