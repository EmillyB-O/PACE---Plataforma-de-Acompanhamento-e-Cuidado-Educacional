<?php
    include_once('../../config/conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        // Segunda situação - RECEBENDO O ID por GET
        $stmt = $conexao->prepare("SELECT a.*, t.nome as nome_turma, i.nome as nome_instituicao 
                                   FROM Aluno a 
                                   LEFT JOIN Turma t ON a.id_turma = t.id 
                                   LEFT JOIN Instituicao i ON a.id_instituicao = i.id 
                                   WHERE a.id = ?");
        $stmt->bind_param("i",$_GET['id']);

    }elseif(isset($_GET['id_turma'])){
        // filtrar alunos da turma
        $stmt = $conexao->prepare("SELECT a.*, t.nome as nome_turma, i.nome as nome_instituicao
                                   FROM Aluno a
                                   LEFT JOIN Turma t ON a.id_turma = t.id
                                   LEFT JOIN Instituicao i ON a.id_instituicao = i.id
                                   WHERE a.id_turma = ?");
        $stmt->bind_param("i",$_GET['id_turma']);                          
    
    }else{
        // Primeira situação - SEM RECEBER O ID por GET
        $stmt = $conexao->prepare("SELECT a.*, t.nome as nome_turma, i.nome as nome_instituicao 
                                   FROM Aluno a 
                                   LEFT JOIN Turma t ON a.id_turma = t.id 
                                   LEFT JOIN Instituicao i ON a.id_instituicao = i.id");
    }
    
    $stmt->execute();
    $resultado = $stmt->get_result();

    $tabela = [];
    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Sucesso, consulta efetuada.',
            'data'      => $tabela
        ];
    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não há registros',
            'data'      => []
        ];
    }
    
    $stmt->close();
    $conexao->close();


    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
