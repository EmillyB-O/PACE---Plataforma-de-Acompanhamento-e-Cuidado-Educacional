<?php 
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    include_once('../../config/conexao.php');

    $retorno = [
        'status' => '',
        'mensagem' => '',
        'data' => []
    ];

    if (isset($_GET['id'])){
        $nome = $_POST['nome'];
        $endereco = $_POST['endereco'];
        $codigo = $_POST['codigo'];

        try {
            $conexao->begin_transaction();

            // Verifica se já existe OUTRA instituição com o mesmo nome e código
            $stmtVerifica = $conexao->prepare('SELECT id FROM Instituicao WHERE nome = ? AND codigo = ? AND id != ?');
            $stmtVerifica->bind_param('sii', $nome, $codigo, $_GET['id']);
            $stmtVerifica->execute();
            $resultadoVerifica = $stmtVerifica->get_result();

            if ($resultadoVerifica->num_rows > 0) {
                $stmtVerifica->close();
                $retorno = [
                    'status' => 'nok',
                    'mensagem' => 'Já existe outra instituição cadastrada com esse Nome e Código informados.',
                    'data' => []
                ];
                $conexao->rollback();
                header('Content-type:application/json;charset:utf-8');
                echo json_encode($retorno);
                exit;
            }
            $stmtVerifica->close();

            $stmt = $conexao->prepare("UPDATE Instituicao SET nome = ?, endereco = ?, codigo = ? WHERE id = ?");
            $stmt->bind_param("ssii", $nome, $endereco, $codigo, $_GET['id']);
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

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
    
    