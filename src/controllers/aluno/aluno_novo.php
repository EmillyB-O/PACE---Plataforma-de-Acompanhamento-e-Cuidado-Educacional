<?php
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    include_once('../../config/conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

        $nome       = $_POST['nome'];
        $nascimento       = $_POST['nascimento'];
        $serie   = $_POST['serie'];
        $matricula     = $_POST['matricula']; 
        $id_instituicao     = $_POST['id_instituicao'];
        $id_turma     = $_POST['id_turma'];

    try {
    $conexao->begin_transaction();
    $status = '0'; // 0: Matriculado
    $stmt = $conexao->prepare('INSERT INTO Aluno (nome, data_nascimento, matricula, id_turma, id_instituicao, serie, status) VALUES (?,?,?,?,?,?,?)');
    $stmt->bind_param('ssiiiis', $nome, $nascimento, $matricula, $id_turma, $id_instituicao, $serie, $status);
    $stmt->execute();
    $conexao->commit();

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Aluno inserido com sucesso!',
        'data' => []
    ];
} catch (mysqli_sql_exception $e) {
    if (isset($conexao)) {
        $conexao->rollback();
    }

    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Não foi possível realizar a operação no Aluno: ' . $e->getMessage(),
        'data' => []
    ];
}

    if(isset($stmt) && $stmt !== false) {
        $stmt->close();
    }
    $conexao->close();

    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);
