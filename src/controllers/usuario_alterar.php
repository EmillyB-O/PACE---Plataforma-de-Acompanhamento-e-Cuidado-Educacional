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
            $senha = password_hash($senhaInput, PASSWORD_DEFAULT);
            $stmt = $conexao->prepare('UPDATE Usuario SET nome = ?, email = ?, cpf = ?, senha = ?, cargo = ?, telefone = ? WHERE id = ?');
            $stmt->bind_param('ssssssi', $nome, $email, $cpf, $senha, $cargo, $telefone, $idEdit);
        } else {
            $stmt = $conexao->prepare('UPDATE Usuario SET nome = ?, email = ?, cpf = ?, cargo = ?, telefone = ? WHERE id = ?');
            $stmt->bind_param('sssssi', $nome, $email, $cpf, $cargo, $telefone, $idEdit);
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