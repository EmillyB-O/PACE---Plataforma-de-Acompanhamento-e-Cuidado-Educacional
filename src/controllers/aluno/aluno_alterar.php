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
        $nascimento       = $_POST['nascimento'];
        $serie   = $_POST['serie'];
        $matricula     = $_POST['matricula']; 
        $id_instituicao     = $_POST['id_instituicao'];
        $id_turma     = $_POST['id_turma'];

        try {      
            $conexao->begin_transaction();
            $stmt = $conexao->prepare("UPDATE turma SET nome = ?, serie = ?, ano = ?, quantidade = ?, codigo = ? WHERE id = ?");
            $stmt->bind_param("ssii", $nome,$nascimento,$serie,$matricula,$id_instituicao,$id_turma, $_GET['id']);
            $stmt->execute();
            $conexao->commit();

            $retorno = [
                'status' => 'ok',
                'mensagem' => 'Registro alterado com sucesso',
                'data' => []
            ];

        } catch (mysqli_sql_exception $e) {
            $conexao->rollback();
            $retorno = [
                'status' => 'nok',
                'mensagem' => 'Erro ao alterar a Instituição: ' . $e->getMessage(),
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