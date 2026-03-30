<?php 
    include_once('conexao.php');

    $retorno = [
        'status' => '',
        'mensagem' => '',
        'data' => []
    ];

    if (isset($_GET['id'])){
        $nome = $_POST['nome'];
        $endereco = $_POST['endereco'];
        $codigo = $_POST['codigo'];
        $stmt = $conexao->prepare("UPDATE cliente SET nome = ?, endereco = ?, codigo = ? WHERE id = ?");
        $stmt->bind_param("ssii", $nome, $endereco, $codigo, $_GET['id']);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status' => 'ok',
                'mensagem' => 'Registro alterado com sucesso',
                'data' => []
            ];
        }else{
            $retorno = [
                'status' => 'nok',
                'mensagem' => 'Não posso alterar um registtro.'.json_encode($_GET),
                'data' => []
            ];
        } 
        $stmt->close();

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
    
    