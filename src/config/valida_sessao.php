<?php
    session_start();
    if(isset($_SESSION['usuario'])){
        $retorno = [
            'status'    => 'ok', 
            'mensagem'  => '', 
            'data'      => $_SESSION['usuario']
        ];
    }else{
        $retorno = [
            'status'    => 'nok', // ok - nok
            'mensagem'  => '', // mensagem que envio para o front
            'data'      => []
        ];
    }
    header("Content-type:application/json;charset:utf-8;");
    echo json_encode($retorno);