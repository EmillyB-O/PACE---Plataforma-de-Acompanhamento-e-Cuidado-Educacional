<?php
    include_once('../../config/conexao.php');

    session_start();
    $usuario = isset($_SESSION['usuario']) ? $_SESSION['usuario'] : null;

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        // Segunda situação - RECEBENDO O ID por GET
        $stmt = $conexao->prepare("SELECT * FROM instituicao WHERE id = ?");
        $stmt->bind_param("i",$_GET['id']);
    }else{
        // Para professor: mostrar apenas instituições vinculadas
        if($usuario && $usuario['cargo'] == '4'){

            $stmt = $conexao->prepare("SELECT i.*
                                       FROM Instituicao i
                                       INNER JOIN Usuario_Instituicao ui
                                       ON ui.id_instituicao = i.id
                                       WHERE ui.id_usuario = ?
            ");

            $stmt->bind_param("i", $usuario['id']);

        }else{
            //Outros usuarios: mostrar todos
            $stmt = $conexao->prepare("SELECT * FROM Instituicao");
        }
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