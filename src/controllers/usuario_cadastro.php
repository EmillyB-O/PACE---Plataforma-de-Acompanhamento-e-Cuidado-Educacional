<?php
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    include_once('../config/conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $nome       = $_POST['nome'];
    $email      = $_POST['email'];
    $cpf        = $_POST['cpf'];
    $senha      = password_hash($_POST['senha'], PASSWORD_DEFAULT);
    $cargo      = $_POST['cargo'];
    $telefone   = $_POST['telefone'];

    try {
        $conexao->begin_transaction();
        $status = 1; // 1: Ativo
        $stmt = $conexao->prepare('INSERT INTO Usuario (nome, email, cpf, senha, status, cargo, telefone) VALUES (?,?,?,?,?,?,?)');
        $stmt->bind_param('ssssiis',$nome,$email,$cpf,$senha,$status,$cargo,$telefone);
        $stmt->execute();

        $idUsuarioGerado = $conexao->insert_id;

        if ($cargo === '1') {//adm
            $nivel_permissao = $_POST['nivel_permissao'];

            $stmt = $conexao->prepare('INSERT INTO Administrador (id_usuario, nivel_permissao) VALUES (?, ?)');
            $stmt->bind_param('ii', $idUsuarioGerado, $nivel_permissao);
            $stmt->execute();

        }elseif ($cargo === '2') { //pedagogo
            $cndb = $_POST['cndb'];
            $instituicao = $_POST['instituicao'];
            $especializacao = $_POST['especializacao'];

            $stmt = $conexao->prepare('INSERT INTO Pedagogo (id_usuario, cndb, id_instituicao, especializacao) VALUES (?, ?, ?, ?)');
            $stmt->bind_param('isis', $idUsuarioGerado, $cndb, $instituicao, $especializacao);
            $stmt->execute();

        }elseif ($cargo === '3') { //profissional de saude
            $crm = $_POST['crm'];
            $crp = $_POST['crp'];

            $stmt = $conexao->prepare('INSERT INTO Profissional_Saude (id_usuario, crm, crp) VALUES (?, ?, ?)');
            $stmt->bind_param('iss', $idUsuarioGerado, $crm, $crp);
            $stmt->execute();

        }elseif ($cargo === '4') { //professor
            $cndb = $_POST['cndb'];
            $instituicao = $_POST['instituicao'];
            $materia = $_POST['materia'];

            $stmt = $conexao->prepare('INSERT INTO Professor (id_usuario, cndb, id_instituicao, materia) VALUES (?, ?, ?, ?)');
            $stmt->bind_param('isis', $idUsuarioGerado, $cndb, $instituicao, $materia);
            $stmt->execute();
        
        }elseif ($cargo === '5') { //responsavel legal
            $data_nasc = $_POST['data_nasc'];

            $stmt = $conexao->prepare('INSERT INTO Responsavel_Legal (id_usuario, data_nasc) VALUES (?, ?)');
            $stmt->bind_param('is', $idUsuarioGerado, $data_nasc);
            $stmt->execute();
        }

        $conexao->commit();


        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Registro inserido com sucesso!',
            'data'      => []
        ];
    } catch (mysqli_sql_exception $e) {
        if (isset($conexao)) {
            $conexao->rollback();
        }

        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Falha ao inserir o registro: ' . $e->getMessage(),
            'data'      => []
        ];
    }

    if(isset($stmt) && $stmt !== false) {
        $stmt->close();
    }
    $conexao->close();

    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);