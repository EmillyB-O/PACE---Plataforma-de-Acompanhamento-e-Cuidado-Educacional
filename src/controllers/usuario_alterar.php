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

    if (empty($nome) || empty($email) || empty($cpf) || empty($cargo) || empty($telefone)) {
        header('Content-type:application/json;charset:utf-8');
        echo json_encode(['status' => 'nok', 'mensagem' => 'Campos obrigatórios ausentes.', 'data' => []]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email)) {
        header('Content-type:application/json;charset:utf-8');
        echo json_encode(['status' => 'nok', 'mensagem' => 'O e-mail fornecido é inválido. Por favor, verifique o endereço digitado.', 'data' => []]);
        exit;
    }

    $telefoneLimpo = preg_replace('/\D/', '', $telefone);
    if (!preg_match('/^(?:[1-9]{2})(?:[2-8]|9[1-9])[0-9]{3}[0-9]{4}$/', $telefoneLimpo)) {
        header('Content-type:application/json;charset:utf-8');
        echo json_encode(['status' => 'nok', 'mensagem' => 'O telefone fornecido é inválido. Por favor, utilize o formato com DDD.', 'data' => []]);
        exit;
    }

    if (isset($_SESSION['usuario'])) {
        $userLogado = $_SESSION['usuario'];
        $cargoLogado = $userLogado['cargo'];
        $nivelLogado = $userLogado['nivel_permissao'] ?? null;

        if ($cargoLogado == '1') {
            if ($nivelLogado == '0' && $cargo != '1') {
                echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso Negado: Administrador Global só pode alterar Administradores.']); exit;
            }
            if ($nivelLogado == '1' && $cargo == '1') {
                echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso Negado: Administrador Institucional não pode gerenciar Administradores.']); exit;
            }
        }
    }

    // Validação de duplicidade (ignorando o próprio usuário)
    $stmtCheck = $conexao->prepare("SELECT id FROM Usuario WHERE (email = ? OR cpf = ?) AND id != ?");
    $idEdit = $_GET['id'];
    $stmtCheck->bind_param("ssi", $email, $cpf, $idEdit);
    $stmtCheck->execute();
    if ($stmtCheck->get_result()->num_rows > 0) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'E-mail ou CPF já em uso por outro usuário.']);
        exit;
    }
    $stmtCheck->close();

    try {
        $conexao->begin_transaction();

        // Atualiza dados básicos
        if (!empty($senhaInput)) {
            // Validação de senha forte (mínimo de 8 caracteres, maiúsculas, minúsculas, números e caracteres especiais)
            if (strlen($senhaInput) < 8 ||
                !preg_match('/[A-Z]/', $senhaInput) ||
                !preg_match('/[a-z]/', $senhaInput) ||
                !preg_match('/[0-9]/', $senhaInput) ||
                !preg_match('/[^A-Za-z0-9]/', $senhaInput)) {
                header('Content-type:application/json;charset:utf-8');
                echo json_encode(['status' => 'nok', 'mensagem' => 'A nova senha não atende aos requisitos de segurança (mínimo de 8 caracteres, contendo letras maiúsculas, minúsculas, números e caracteres especiais).', 'data' => []]);
                exit;
            }
            $senha = password_hash($senhaInput, PASSWORD_DEFAULT);
            $stmt = $conexao->prepare('UPDATE Usuario SET nome = ?, email = ?, senha = ?, cargo = ?, telefone = ? WHERE id = ?');
            $stmt->bind_param('sssssi', $nome, $email, $senha, $cargo, $telefone, $idEdit);
        } else {
            $stmt = $conexao->prepare('UPDATE Usuario SET nome = ?, email = ?, cargo = ?, telefone = ? WHERE id = ?');
            $stmt->bind_param('ssssi', $nome, $email, $cargo, $telefone, $idEdit);
        }
        $stmt->execute();

        // Atualiza dados específicos do cargo
        if ($cargo === '1') {
            $nivel_permissao = $_POST['nivel_permissao'];
            $stmt = $conexao->prepare('UPDATE Administrador SET nivel_permissao = ? WHERE id_usuario = ?');
            $stmt->bind_param('si', $nivel_permissao, $idEdit);
            $stmt->execute();
        } elseif ($cargo === '2') {
            $especializacao = $_POST['especializacao'];
            $stmt = $conexao->prepare('UPDATE Pedagogo SET especializacao = ? WHERE id_usuario = ?');
            $stmt->bind_param('si', $especializacao, $idEdit);
            $stmt->execute();
        } elseif ($cargo === '3') {
            $crm = !empty($_POST['crm']) ? trim($_POST['crm']) : null;
            $crp = !empty($_POST['crp']) ? trim($_POST['crp']) : null;
            $stmt = $conexao->prepare('UPDATE Profissional_Saude SET crm = ?, crp = ? WHERE id_usuario = ?');
            $stmt->bind_param('ssi', $crm, $crp, $idEdit);
            $stmt->execute();
        } elseif ($cargo === '4') {
            $materia = $_POST['materia'];
            $stmt = $conexao->prepare('UPDATE Professor SET materia = ? WHERE id_usuario = ?');
            $stmt->bind_param('si', $materia, $idEdit);
            $stmt->execute();

            // Sincroniza Turmas (M:N)
            // Primeiro remove vínculos antigos
            $stmtDelTurmas = $conexao->prepare("DELETE FROM Professor_Turma WHERE id_professor = ?");
            $stmtDelTurmas->bind_param("i", $idEdit);
            $stmtDelTurmas->execute();
            $stmtDelTurmas->close();

            // Insere os novos vínculos se houver
            if (isset($_POST['turmas']) && is_array($_POST['turmas'])) {
                $stmtInsTurma = $conexao->prepare("INSERT INTO Professor_Turma (id_professor, id_turma) VALUES (?, ?)");
                foreach ($_POST['turmas'] as $id_turma) {
                    $id_turma_int = intval($id_turma);
                    $stmtInsTurma->bind_param("ii", $idEdit, $id_turma_int);
                    $stmtInsTurma->execute();
                }
                $stmtInsTurma->close();
            }
        } elseif ($cargo === '5') {
            $data_nasc = $_POST['data_nasc'];
            $stmt = $conexao->prepare('UPDATE Responsavel_Legal SET data_nasc = ? WHERE id_usuario = ?');
            $stmt->bind_param('si', $data_nasc, $idEdit);
            $stmt->execute();
        }

        // Sincroniza Instituições (M:M)
        $id_instituicao = !empty($_POST['id_instituicao']) ? $_POST['id_instituicao'] : null;
        
        // Remove vínculos antigos
        $stmtDel = $conexao->prepare("DELETE FROM Usuario_Instituicao WHERE id_usuario = ?");
        $stmtDel->bind_param("i", $idEdit);
        $stmtDel->execute();
        $stmtDel->close();

        // Insere o novo vínculo se houver
        if ($id_instituicao) {
            $stmtIns = $conexao->prepare("INSERT INTO Usuario_Instituicao (id_usuario, id_instituicao) VALUES (?, ?)");
            $stmtIns->bind_param("ii", $idEdit, $id_instituicao);
            $stmtIns->execute();
            $stmtIns->close();
        }

        $conexao->commit();
        $retorno = ['status' => 'ok', 'mensagem' => 'Registro alterado com sucesso.'];

    } catch (mysqli_sql_exception $e) {
        $conexao->rollback();
        $retorno = ['status' => 'nok', 'mensagem' => obterMensagemErroBanco($e->getMessage(), $e->getCode())];
    }
} else {
    $retorno = ['status' => 'nok', 'mensagem' => 'ID não informado.'];
}

$conexao->close();
header("Content-type:application/json;charset:utf-8");
echo json_encode($retorno);