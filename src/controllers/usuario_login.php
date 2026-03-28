<?php
    include_once('../config/conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $stmt = $conexao->prepare('SELECT * FROM Usuario WHERE email = ?');
    $stmt->bind_param('s', $_POST['email']);

    $stmt->execute();
    $resultado = $stmt->get_result();

    if($resultado->num_rows > 0){
        $linha = $resultado->fetch_assoc();

        if (password_verify($_POST['senha'], $linha['senha'])) {
            $tabela[] = $linha;

            session_start();
            $_SESSION['usuario'] = $linha; // Salvamos os dados validados

            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Sucesso, consulta efetuada!',
                'data'      => $tabela
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Senha incorreta.',
                'data'      => []
            ];
        }

    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não há registros.',
            'data'      => []
        ];
    }

    $stmt->close();
    $conexao->close();

    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);