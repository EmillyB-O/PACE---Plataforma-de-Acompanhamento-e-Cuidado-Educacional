<?php
    session_start();
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    include_once('../config/conexao.php');
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $nome       = trim($_POST['nome']);
    $email      = trim($_POST['email']);
    $cpf        = trim($_POST['cpf']);
    $senhaInput = trim($_POST['senha']);
    $cargo      = trim($_POST['cargo']);
    $telefone   = trim($_POST['telefone']);

    if (empty($nome) || empty($email) || empty($cpf) || empty($senhaInput) || empty($cargo) || empty($telefone)) {
        header('Content-type:application/json;charset:utf-8');
        echo json_encode(['status' => 'nok', 'mensagem' => 'Todos os campos básicos (Nome, Email, CPF, Senha, Telefone e Cargo) devem ser preenchidos.', 'data' => []]);
        exit;
    }

    // Função interna para validar matematicamente o CPF brasileiro
    function validarCPF($cpf) {
        $cpf = preg_replace('/[^0-9]/', '', $cpf);
        if (strlen($cpf) != 11 || preg_match('/(\d)\1{10}/', $cpf)) return false;
        for ($t = 9; $t < 11; $t++) {
            for ($d = 0, $c = 0; $c < $t; $c++) {
                $d += $cpf[$c] * (($t + 1) - $c);
            }
            $d = ((10 * $d) % 11) % 10;
            if ($cpf[$c] != $d) return false;
        }
        return true;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email)) {
        header('Content-type:application/json;charset:utf-8');
        echo json_encode(['status' => 'nok', 'mensagem' => 'O e-mail fornecido é inválido. Por favor, verifique o endereço digitado.', 'data' => []]);
        exit;
    }

    if (!validarCPF($cpf)) {
        header('Content-type:application/json;charset:utf-8');
        echo json_encode(['status' => 'nok', 'mensagem' => 'O CPF fornecido é inválido. Por favor, verifique o número digitado.', 'data' => []]);
        exit;
    }

    $telefoneLimpo = preg_replace('/\D/', '', $telefone);
    if (!preg_match('/^(?:[1-9]{2})(?:[2-8]|9[1-9])[0-9]{3}[0-9]{4}$/', $telefoneLimpo)) {
        header('Content-type:application/json;charset:utf-8');
        echo json_encode(['status' => 'nok', 'mensagem' => 'O telefone fornecido é inválido. Por favor, utilize o formato com DDD.', 'data' => []]);
        exit;
    }

    // Validação de senha forte (mínimo de 8 caracteres, maiúsculas, minúsculas, números e caracteres especiais)
    if (strlen($senhaInput) < 8 ||
        !preg_match('/[A-Z]/', $senhaInput) ||
        !preg_match('/[a-z]/', $senhaInput) ||
        !preg_match('/[0-9]/', $senhaInput) ||
        !preg_match('/[^A-Za-z0-9]/', $senhaInput)) {
        header('Content-type:application/json;charset:utf-8');
        echo json_encode(['status' => 'nok', 'mensagem' => 'A senha fornecida não atende aos requisitos de segurança (mínimo de 8 caracteres, contendo letras maiúsculas, minúsculas, números e caracteres especiais).', 'data' => []]);
        exit;
    }

    $senha = password_hash($senhaInput, PASSWORD_DEFAULT);

    // Validação de permissão do usuário logado
    if (isset($_SESSION['usuario'])) {
        $userLogado = $_SESSION['usuario'];
        $cargoLogado = $userLogado['cargo'];
        $nivelLogado = $userLogado['nivel_permissao'] ?? null;

        if ($cargoLogado == '1') {
            if ($nivelLogado == '0' && $cargo != '1') {
                echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso Negado: Administrador Global só pode cadastrar Administradores.', 'data' => []]); exit;
            }
            if ($nivelLogado == '1' && ($cargo == '1' || $cargo == '3' || $cargo == '5')) {
                echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso Negado: Administrador Institucional só tem permissão para cadastrar Pedagogos e Professores.', 'data' => []]); exit;
            }
        }
    }

    // validacao de idade para responsável legal
    if ($cargo === '5') {
        $data_nasc = $_POST['data_nasc'];
        $data_nasc_obj = new DateTime($data_nasc);
        $hoje = new DateTime();
        $idade = $hoje->diff($data_nasc_obj)->y;
        if ($idade < 18) {
            $retorno = [
                'status' => 'nok',
                'mensagem' => 'O responsável legal deve ter pelo menos 18 anos.',
                'data' => []
            ];
            header('Content-type:application/json;charset:utf-8');
            echo json_encode($retorno);
            exit();
        }
    }

    // validacao de duplicidade de e-mail ou cpf
    $stmtCheck = $conexao->prepare("SELECT id FROM Usuario WHERE email = ? OR cpf = ?");
    $stmtCheck->bind_param("ss", $email, $cpf);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();
    if ($resultCheck->num_rows > 0) {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Já existe um usuário cadastrado com este e-mail ou CPF.',
            'data' => []
        ];
        header('Content-type:application/json;charset:utf-8');
        echo json_encode($retorno);
        exit();
    }
    $stmtCheck->close();

    // validacao de duplicidade de crm ou crp
    if ($cargo === '3') {
        $crm = trim($_POST['crm']);
        $crp = trim($_POST['crp']);

        if (empty($crm) && empty($crp)) {
            header('Content-type:application/json;charset:utf-8');
            echo json_encode(['status' => 'nok', 'mensagem' => 'Pelo menos um dos campos (CRM ou CRP) deve ser preenchido para Profissional da Saúde.', 'data' => []]);
            exit;
        }

        if (!empty($crm) && !preg_match('/^\d{4,6}\/[A-Z]{2}$/i', $crm)) {
            header('Content-type:application/json;charset:utf-8');
            echo json_encode(['status' => 'nok', 'mensagem' => 'O formato do CRM é inválido. Utilize o formato: 123456/SP', 'data' => []]);
            exit;
        }

        if (!empty($crp) && !preg_match('/^\d{2}\/\d{4,6}$/', $crp)) {
            header('Content-type:application/json;charset:utf-8');
            echo json_encode(['status' => 'nok', 'mensagem' => 'O formato do CRP é inválido. Utilize o formato: 06/123456', 'data' => []]);
            exit;
        }

        if (!empty($crm)) {
            $stmtCheck = $conexao->prepare("SELECT id_usuario FROM Profissional_Saude WHERE crm = ?");
            $stmtCheck->bind_param("s", $crm);
            $stmtCheck->execute();
            $resultCheck = $stmtCheck->get_result();
            if ($resultCheck->num_rows > 0) {
                echo json_encode(['status' => 'nok', 'mensagem' => 'Já existe um usuário cadastrado com este CRM.', 'data' => []]);
                exit;
            }
            $stmtCheck->close();
        }

        if (!empty($crp)) {
            $stmtCheck = $conexao->prepare("SELECT id_usuario FROM Profissional_Saude WHERE crp = ?");
            $stmtCheck->bind_param("s", $crp);
            $stmtCheck->execute();
            $resultCheck = $stmtCheck->get_result();
            if ($resultCheck->num_rows > 0) {
                echo json_encode(['status' => 'nok', 'mensagem' => 'Já existe um usuário cadastrado com este CRP.', 'data' => []]);
                exit;
            }
            $stmtCheck->close();
        }
    }

    try {
        $conexao->begin_transaction();
        
        //profissional da saude(3) e responsavel legal(5) vem inativos por padrao:
        if($cargo === '3' || $cargo === '5'){
            $status = '2'; //aguardando validacao
        }else{
            $status = '1'; //ativo
        }

        $stmt = $conexao->prepare('INSERT INTO Usuario (nome, email, cpf, senha, status, cargo, telefone) VALUES (?,?,?,?,?,?,?)');
        $stmt->bind_param('sssssss',$nome,$email,$cpf,$senha,$status,$cargo,$telefone);
        $stmt->execute();

        $idUsuarioGerado = $conexao->insert_id;

        // Vínculo com Instituição (Usuario_Instituicao)
        $id_instituicao = !empty($_POST['id_instituicao']) ? $_POST['id_instituicao'] : null;

        if ($cargo === '1') { // adm
            $nivel_permissao = $_POST['nivel_permissao'];
            $stmt = $conexao->prepare('INSERT INTO Administrador (id_usuario, nivel_permissao) VALUES (?, ?)');
            $stmt->bind_param('is', $idUsuarioGerado, $nivel_permissao);
            $stmt->execute();

        } elseif ($cargo === '2') { // pedagogo
            $especializacao = !empty($_POST['especializacao']) ? trim($_POST['especializacao']) : null;
            $stmt = $conexao->prepare('INSERT INTO Pedagogo (id_usuario, especializacao) VALUES (?, ?)');
            $stmt->bind_param('is', $idUsuarioGerado, $especializacao);
            $stmt->execute();

        } elseif ($cargo === '3') { // profissional de saude
            $crm = !empty($_POST['crm']) ? trim($_POST['crm']) : null;
            $crp = !empty($_POST['crp']) ? trim($_POST['crp']) : null;
            $stmt = $conexao->prepare('INSERT INTO Profissional_Saude (id_usuario, crm, crp) VALUES (?, ?, ?)');
            $stmt->bind_param('iss', $idUsuarioGerado, $crm, $crp);
            $stmt->execute();

        } elseif ($cargo === '4') { // professor
            $materia = !empty($_POST['materia']) ? trim($_POST['materia']) : null;
            $stmt = $conexao->prepare('INSERT INTO Professor (id_usuario, materia) VALUES (?, ?)');
            $stmt->bind_param('is', $idUsuarioGerado, $materia);
            $stmt->execute();
        
        } elseif ($cargo === '5') { // responsavel legal
            $data_nasc = $_POST['data_nasc'];
            $stmt = $conexao->prepare('INSERT INTO Responsavel_Legal (id_usuario, data_nasc) VALUES (?, ?)');
            $stmt->bind_param('is', $idUsuarioGerado, $data_nasc);
            $stmt->execute();
        }

        // Se houver instituição selecionada, cria o vínculo na tabela associativa
        if ($id_instituicao) {
            $stmtVinculo = $conexao->prepare('INSERT INTO Usuario_Instituicao (id_usuario, id_instituicao) VALUES (?, ?)');
            $stmtVinculo->bind_param('ii', $idUsuarioGerado, $id_instituicao);
            $stmtVinculo->execute();
            $stmtVinculo->close();
        }

        $conexao->commit();

        if ($status === '2') {
            $mensagem_sucesso = 'Sua conta está aguardando validação do administrador da instituição.';
        } else {
            $mensagem_sucesso = 'Registro inserido com sucesso!';
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => $mensagem_sucesso,
            'data'      => []
        ];
    } catch (mysqli_sql_exception $e) {
        if (isset($conexao)) {
            $conexao->rollback();
        }

        $retorno = [
            'status'    => 'nok',
            'mensagem'  => obterMensagemErroBanco($e->getMessage(), $e->getCode()),
            'data'      => []
        ];
    }

    if(isset($stmt) && $stmt !== false) {
        $stmt->close();
    }
    $conexao->close();

    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);