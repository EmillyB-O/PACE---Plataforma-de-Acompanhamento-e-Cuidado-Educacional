<?php 
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    include_once('../../config/conexao.php');

    $retorno = [
        'status' => '',
        'mensagem' => '',
        'data' => []
    ];

    if (isset($_GET['id'])){
        $nome       = $_POST['nome'];
        $serie   = $_POST['serie'];
        $ano     = $_POST['ano']; 
        $quantidade     = $_POST['quantidade'];
        $codigo     = $_POST['codigo'];

    try {
        $conexao->begin_transaction();
        $stmt = $conexao->prepare("UPDATE Turma SET nome = ?, serie = ?, ano = ?, qntd_alunos = ?, id_instituicao = ? WHERE id = ?");
        $stmt->bind_param("siiiii", $nome, $serie, $ano, $quantidade, $codigo, $_GET['id']);
        $stmt->execute();
        $conexao->commit();

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Turma alterada com sucesso',
            'data' => []
        ];

    } catch (mysqli_sql_exception $e) {
        $conexao->rollback();
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Não foi possível alterar a Turma: ' . $e->getMessage(),
            'data' => []
        ];
    }

        if(isset($stmt) && $stmt !== false) {
            $stmt->close();
        }

    }else{
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Não posso alterar um registro sem um ID informado',
            'data' => []
        ];
    }