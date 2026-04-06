<?php
session_start();
include_once('../config/conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if (isset($_GET['id'])) {
    $nome = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $cpf = trim($_POST['cpf']);
    $senhaInput = trim($_POST['senha']);
    $cargo = trim($_POST['cargo']);
    $telefone = trim($_POST['telefone']);

    if (empty($nome) || empty($email) || empty($cpf) || empty($senhaInput) || empty($cargo) || empty($telefone)) {
        header('Content-type:application/json;charset:utf-8');
        echo json_encode(['status' => 'nok', 'mensagem' => 'Todos os campos básicos (Nome, Email, CPF, Senha, Telefone e Cargo) devem ser preenchidos.', 'data' => []]);
        exit;
    }

    $senha = password_hash($senhaInput, PASSWORD_DEFAULT);

    if (isset($_SESSION['usuario'])) {
        $userLogado = $_SESSION['usuario'];
        $cargoLogado = $userLogado['cargo'];
        $nivelLogado = $userLogado['nivel_permissao'] ?? null;

        if ($cargoLogado == '1') {
            if ($nivelLogado == '0' && $cargo != '1') {
                echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso Negado: Administrador Global só pode alterar Administradores.', 'data' => []]); exit;
            }
            if ($nivelLogado == '1' && $cargo == '1') {
                echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso Negado: Administrador Institucional não pode gerenciar Administradores.', 'data' => []]); exit;
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

    // validacao de duplicidade de e-mail ou cpf (ignorando o próprio usuario)
    $stmtCheck = $conexao->prepare("SELECT id FROM Usuario WHERE (email = ? OR cpf = ?) AND id != ?");
    $idEdit = $_GET['id'];
    $stmtCheck->bind_param("ssi", $email, $cpf, $idEdit);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();
    if ($resultCheck->num_rows > 0) {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Já existe outro usuário cadastrado com este e-mail ou CPF.',
            'data' => []
        ];
        header('Content-type:application/json;charset:utf-8');
        echo json_encode($retorno);
        exit();
    }
    $stmtCheck->close();

    // validacao de duplicidade de crm, crp ou cndb (ignorando o próprio usuario)
    if ($cargo === '2' || $cargo === '4') {
        $cndb = trim($_POST['cndb']);
        if (empty($cndb)) {
            header('Content-type:application/json;charset:utf-8');
            echo json_encode(['status' => 'nok', 'mensagem' => 'O campo CNDB é obrigatório para Pedagogo e Professor.', 'data' => []]);
            exit;
        }
        $idEdit = $_GET['id'];
        $stmtCheck = $conexao->prepare("SELECT id_usuario FROM Pedagogo WHERE cndb = ? AND id_usuario != ? UNION SELECT id_usuario FROM Professor WHERE cndb = ? AND id_usuario != ?");
        $stmtCheck->bind_param("sisi", $cndb, $idEdit, $cndb, $idEdit);
        $stmtCheck->execute();
        $resultCheck = $stmtCheck->get_result();
        if ($resultCheck->num_rows > 0) {
            $retorno = [
                'status' => 'nok',
                'mensagem' => 'Já existe outro usuário cadastrado com este CNDB.',
                'data' => []
            ];
            header('Content-type:application/json;charset:utf-8');
            echo json_encode($retorno);
            exit();
        }
        $stmtCheck->close();
    } elseif ($cargo === '3') {
        $idEdit = $_GET['id'];
        $crm = trim($_POST['crm']);
        $crp = trim($_POST['crp']);

        if (empty($crm) && empty($crp)) {
            header('Content-type:application/json;charset:utf-8');
            echo json_encode(['status' => 'nok', 'mensagem' => 'Pelo menos um dos campos (CRM ou CRP) deve ser preenchido para Profissional da Saúde.', 'data' => []]);
            exit;
        }

        if (!empty($crm)) {
            $stmtCheck = $conexao->prepare("SELECT id_usuario FROM Profissional_Saude WHERE crm = ? AND id_usuario != ?");
            $stmtCheck->bind_param("si", $crm, $idEdit);
            $stmtCheck->execute();
            $resultCheck = $stmtCheck->get_result();
            if ($resultCheck->num_rows > 0) {
                $retorno = [
                    'status' => 'nok',
                    'mensagem' => 'Já existe outro usuário cadastrado com este CRM.',
                    'data' => []
                ];
                header('Content-type:application/json;charset:utf-8');
                echo json_encode($retorno);
                exit();
            }
            $stmtCheck->close();
        }

        if (!empty($crp)) {
            $stmtCheck = $conexao->prepare("SELECT id_usuario FROM Profissional_Saude WHERE crp = ? AND id_usuario != ?");
            $stmtCheck->bind_param("si", $crp, $idEdit);
            $stmtCheck->execute();
            $resultCheck = $stmtCheck->get_result();
            if ($resultCheck->num_rows > 0) {
                $retorno = [
                    'status' => 'nok',
                    'mensagem' => 'Já existe outro usuário cadastrado com este CRP.',
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
        $stmt = $conexao->prepare('UPDATE Usuario SET nome = ?, email = ?, cpf = ?, senha = ?, cargo = ?, telefone = ? WHERE id = ?');
        $stmt->bind_param('ssssssi', $nome, $email, $cpf, $senha, $cargo, $telefone, $_GET['id']);
        $stmt->execute();

        $idUsuario = $_GET['id'];

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

            $stmt = $conexao->prepare('UPDATE Administrador SET nivel_permissao = ?, id_instituicao = ? WHERE id_usuario = ?');
            $stmt->bind_param('sii', $nivel_permissao, $instituicao_admin, $idUsuario);
            $stmt->execute();

        } elseif ($cargo === '2') { //pedagogo
            $cndb = $_POST['cndb'];
            $instituicao = $_POST['instituicao'];
            $especializacao = $_POST['especializacao'];

            $stmtCheckInst = $conexao->prepare("SELECT id FROM Instituicao WHERE id = ?");
            $stmtCheckInst->bind_param("i", $instituicao);
            $stmtCheckInst->execute();
            if ($stmtCheckInst->get_result()->num_rows == 0) {
                $conexao->rollback();
                echo json_encode(['status'=>'nok', 'mensagem'=>'A instituição informada não existe.', 'data'=>[]]);
                exit;
            }
            $stmtCheckInst->close();

            $stmt = $conexao->prepare('UPDATE Pedagogo SET cndb = ?, id_instituicao = ?, especializacao = ? WHERE id_usuario = ?');
            $stmt->bind_param('sisi', $cndb, $instituicao, $especializacao, $idUsuario);
            $stmt->execute();

        } elseif ($cargo === '3') { //profissional de saude
            $crm = $_POST['crm'];
            $crp = $_POST['crp'];

            $stmt = $conexao->prepare('UPDATE Profissional_Saude SET crm = ?, crp = ? WHERE id_usuario = ?');
            $stmt->bind_param('ssi', $crm, $crp, $idUsuario);
            $stmt->execute();

        } elseif ($cargo === '4') { //professor
            $cndb = $_POST['cndb'];
            $instituicao = $_POST['instituicao'];
            $materia = $_POST['materia'];

            $stmtCheckInst = $conexao->prepare("SELECT id FROM Instituicao WHERE id = ?");
            $stmtCheckInst->bind_param("i", $instituicao);
            $stmtCheckInst->execute();
            if ($stmtCheckInst->get_result()->num_rows == 0) {
                $conexao->rollback();
                echo json_encode(['status'=>'nok', 'mensagem'=>'A instituição informada não existe.', 'data'=>[]]);
                exit;
            }
            $stmtCheckInst->close();

            $stmt = $conexao->prepare('UPDATE Professor SET cndb = ?, id_instituicao = ?, materia = ? WHERE id_usuario = ?');
            $stmt->bind_param('sisi', $cndb, $instituicao, $materia, $idUsuario);
            $stmt->execute();

        } elseif ($cargo === '5') { //responsavel legal
            $data_nasc = $_POST['data_nasc'];

            $stmt = $conexao->prepare('UPDATE Responsavel_Legal SET data_nasc = ? WHERE id_usuario = ?');
            $stmt->bind_param('si', $data_nasc, $idUsuario);
            $stmt->execute();
        }

        $conexao->commit();

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Registro alterado com sucesso.',
            'data' => []
        ];
    } catch (mysqli_sql_exception $e) {
        if (isset($conexao)) {
            $conexao->rollback();
        }

        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Falha ao alterar o registro: ' . $e->getMessage(),
            'data' => []
        ];
    }

    if (isset($stmt) && $stmt !== false) {
        $stmt->close();
    }

} else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Não posso alterar um registro sem um ID informado.',
        'data' => []
    ];
}

$conexao->close();

header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);