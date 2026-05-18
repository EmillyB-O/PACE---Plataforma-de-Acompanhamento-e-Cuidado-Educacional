<?php
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $servidor   = 'localhost:3306';
    $usuario    = 'root';
    $senha      = '';
    $nome_banco = 'pace';

    try {
        $conexao = new mysqli($servidor, $usuario, $senha, $nome_banco);
        if($conexao->connect_error){
            throw new Exception($conexao->connect_error);
        }
    } catch (Throwable $e) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'status' => 'nok',
            'mensagem' => 'O banco de dados do sistema está temporariamente fora de serviço. Por favor, tente novamente mais tarde.',
            'data' => []
        ]);
        exit;
    }

    if (!function_exists('obterMensagemErroBanco')) {
        function obterMensagemErroBanco($mensagemOriginal, $codigo = 0) {
            if ($codigo === 1062 || strpos($mensagemOriginal, 'Duplicate entry') !== false) {
                if (strpos($mensagemOriginal, 'email') !== false) {
                    return 'O e-mail informado já está sendo utilizado por outro usuário.';
                }
                if (strpos($mensagemOriginal, 'cpf') !== false) {
                    return 'O CPF informado já está cadastrado no sistema.';
                }
                if (strpos($mensagemOriginal, 'crm') !== false) {
                    return 'O número de CRM informado já está cadastrado no sistema.';
                }
                if (strpos($mensagemOriginal, 'crp') !== false) {
                    return 'O número de CRP informado já está cadastrado no sistema.';
                }
                return 'Falha de duplicidade: Um dos dados informados já existe no sistema.';
            }
            if (strpos($mensagemOriginal, 'a foreign key constraint fails') !== false) {
                return 'Falha de relacionamento: Verifique se os registros associados (como instituição ou turma) existem e são válidos.';
            }
            return 'Ocorreu uma inconsistência no banco de dados. Detalhe: ' . $mensagemOriginal;
        }
    }