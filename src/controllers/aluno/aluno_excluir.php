<?php
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    include_once('../../config/conexao.php');

    $retorno = [ 
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];
    
    if(isset($_GET['id'])){
        $id = $_GET['id'];
        try {
            $conexao->begin_transaction();

            // 1. Exclui vínculos de tabelas associativas e de dados específicos do Aluno
            // Responsavel_Aluno (Vínculo do Aluno com seus Responsáveis)
            $stmtRA = $conexao->prepare("DELETE FROM Responsavel_Aluno WHERE id_aluno = ?");
            $stmtRA->bind_param("i", $id);
            $stmtRA->execute();
            $stmtRA->close();

            // Profissional_Aluno (Vínculo do Aluno com Profissionais de Saúde)
            $conexao->query("CREATE TABLE IF NOT EXISTS Profissional_Aluno (
                id_profissional INT NOT NULL,
                id_aluno INT NOT NULL,
                PRIMARY KEY (id_profissional, id_aluno)
            )");
            $stmtPA = $conexao->prepare("DELETE FROM Profissional_Aluno WHERE id_aluno = ?");
            $stmtPA->bind_param("i", $id);
            $stmtPA->execute();
            $stmtPA->close();

            // Relatorio (Relatórios emitidos referentes a este aluno)
            $stmtRel = $conexao->prepare("DELETE FROM Relatorio WHERE id_aluno = ?");
            $stmtRel->bind_param("i", $id);
            $stmtRel->execute();
            $stmtRel->close();

            // Laudo (Laudos médicos referentes a este aluno)
            $stmtLaudo = $conexao->prepare("DELETE FROM Laudo WHERE id_aluno = ?");
            $stmtLaudo->bind_param("i", $id);
            $stmtLaudo->execute();
            $stmtLaudo->close();

            // 2. Exclui o próprio registro de Aluno
            $stmt = $conexao->prepare("DELETE FROM Aluno WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();

            $linhasAfetadas = $stmt->affected_rows;
            $conexao->commit();

            if ($linhasAfetadas > 0) {
                $retorno = [
                    'status' => 'ok',
                    'mensagem' => 'Aluno excluído com sucesso.',
                    'data' => []
                ];
            } else {
                $retorno = [
                    'status' => 'nok',
                    'mensagem' => 'Aluno não encontrado para exclusão.',
                    'data' => []
                ];
            }
        } catch (mysqli_sql_exception $e) {
            $conexao->rollback();
            $retorno = [
                'status' => 'nok',
                'mensagem' => 'Falha ao excluir esse Aluno: ' . $e->getMessage(),
                'data' => []
            ];
        }

        if (isset($stmt) && $stmt !== false) {
            $stmt->close();
        }
    }else{
        $retorno = [
            'status'    => 'nok', 
            'mensagem'  => 'É necessário informar um ID para exclusão', 
            'data'      => []
        ];
    }
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
