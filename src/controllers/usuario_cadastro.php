<?php
    session_start();
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

    if (isset($_SESSION['usuario'])) {
        $userLogado = $_SESSION['usuario'];
        $cargoLogado = $userLogado['cargo'];
        $nivelLogado = $userLogado['nivel_permissao'] ?? null;

        if ($cargoLogado == '1') {
            if ($nivelLogado == '0' && $cargo != '1') {
                echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso Negado: Administrador Global só pode cadastrar Administradores.', 'data' => []]); exit;
            }
            if ($nivelLogado == '1' && $cargo == '1') {
                echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso Negado: Administrador Institucional não pode cadastrar Administradores.', 'data' => []]); exit;
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

    // validacao de duplicidade de crm, crp ou cndb
    if ($cargo === '2' || $cargo === '4') {
        $cndb = $_POST['cndb'];
        $stmtCheck = $conexao->prepare("SELECT id_usuario FROM Pedagogo WHERE cndb = ? UNION SELECT id_usuario FROM Professor WHERE cndb = ?");
        $stmtCheck->bind_param("ss", $cndb, $cndb);
        $stmtCheck->execute();
        $resultCheck = $stmtCheck->get_result();
        if ($resultCheck->num_rows > 0) {
            $retorno = [
                'status' => 'nok',
                'mensagem' => 'Já existe um usuário cadastrado com este CNDB.',
                'data' => []
            ];
            header('Content-type:application/json;charset:utf-8');
            echo json_encode($retorno);
            exit();
        }
        $stmtCheck->close();
    } elseif ($cargo === '3') {
        $crm = $_POST['crm'];
        if (!empty($crm)) {
            $stmtCheck = $conexao->prepare("SELECT id_usuario FROM Profissional_Saude WHERE crm = ?");
            $stmtCheck->bind_param("s", $crm);
            $stmtCheck->execute();
            $resultCheck = $stmtCheck->get_result();
            if ($resultCheck->num_rows > 0) {
                $retorno = [
                    'status' => 'nok',
                    'mensagem' => 'Já existe um usuário cadastrado com este CRM.',
                    'data' => []
                ];
                header('Content-type:application/json;charset:utf-8');
                echo json_encode($retorno);
                exit();
            }
            $stmtCheck->close();
        }

        $crp = $_POST['crp'];
        if (!empty($crp)) {
            $stmtCheck = $conexao->prepare("SELECT id_usuario FROM Profissional_Saude WHERE crp = ?");
            $stmtCheck->bind_param("s", $crp);
            $stmtCheck->execute();
            $resultCheck = $stmtCheck->get_result();
            if ($resultCheck->num_rows > 0) {
                $retorno = [
                    'status' => 'nok',
                    'mensagem' => 'Já existe um usuário cadastrado com este CRP.',
                    'data' => []
                ];
                header('Content-type:application/json;charset:utf-8');
                echo json_encode($retorno);
                exit();
            }
            $stmtCheck->close();
        }
    }

    try {
        $conexao->begin_transaction();
        
        //profissional da saude(3) e responsavel legal(5) vem inativos por padrao:
        if($cargo === '3' || $cargo === '5'){// || significa "ou"
            $status = '2'; //inativo
        }else{
            $status = '1'; //ativo
        }

        $stmt = $conexao->prepare('INSERT INTO Usuario (nome, email, cpf, senha, status, cargo, telefone) VALUES (?,?,?,?,?,?,?)');
        $stmt->bind_param('sssssss',$nome,$email,$cpf,$senha,$status,$cargo,$telefone);
        $stmt->execute();

        $idUsuarioGerado = $conexao->insert_id;

        if ($cargo === '1') {//adm
            $nivel_permissao = $_POST['nivel_permissao'];
            $instituicao_admin = !empty($_POST['instituicao_admin']) ? $_POST['instituicao_admin'] : null;

            if ($nivel_permissao == '1') {
                if (empty($instituicao_admin)) {
                    $conexao->rollback();
                    echo json_encode(['status'=>'nok', 'mensagem'=>'O ID da instituição é obrigatório para Administradores Institucionais.', 'data'=>[]]);
                    exit;
                }
                $stmtCheckInst = $conexao->prepare("SELECT id FROM Instituicao WHERE id = ?");
                $stmtCheckInst->bind_param("i", $instituicao_admin);
                $stmtCheckInst->execute();
                if ($stmtCheckInst->get_result()->num_rows == 0) {
                    $conexao->rollback();
                    echo json_encode(['status'=>'nok', 'mensagem'=>'A instituição informada não existe.', 'data'=>[]]);
                    exit;
                }
                $stmtCheckInst->close();
            } else {
                $instituicao_admin = null;
            }

            $stmt = $conexao->prepare('INSERT INTO Administrador (id_usuario, nivel_permissao, id_instituicao) VALUES (?, ?, ?)');
            $stmt->bind_param('isi', $idUsuarioGerado, $nivel_permissao, $instituicao_admin);
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