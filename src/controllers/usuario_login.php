<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $stmt = $conexao->prepare('SELECT * FROM Usuario WHERE email = ? AND senha = ?');
    $stmt->bind_param('ss',$_POST['email'],$_POST['senha']);

    $stmt->execute();
    $resultado = $stmt->getresult();

    $tabela = [];
    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        session_start();
        $_SESSION['email'] = $tabela;

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Sucesso, consulta efetuada!'
            'data'      => $tabela
        ];

    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não há registros.'
            'data'      => []
        ];
    }

    $stmt->close();
    $conexao->close();

    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);