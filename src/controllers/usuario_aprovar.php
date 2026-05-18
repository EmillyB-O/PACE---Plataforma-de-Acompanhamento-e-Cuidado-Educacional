<?php
session_start();
include_once('../config/conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Sessão expirada.']);
    exit;
}

$idUsuario = $_GET['id'];

if ($idUsuario) {
    try {
        $conexao->begin_transaction();

        $stmt = $conexao->prepare("UPDATE Usuario SET status = '1' WHERE id = ?");
        $stmt->bind_param('i', $idUsuario);
        $stmt->execute();
        $stmt->close();

        // Se quem está aprovando é um admin institucional, vincula o usuário aprovado (se não tiver instituição) à dele
        $usuarioLogado = $_SESSION['usuario'];
        $nivel_permissao = $usuarioLogado['nivel_permissao'] ?? null;
        $id_inst_logado = $usuarioLogado['id_instituicao'] ?? null;

        if ($nivel_permissao == '1' && !empty($id_inst_logado)) {
            $stmtInstCheck = $conexao->prepare("SELECT 1 FROM Usuario_Instituicao WHERE id_usuario = ?");
            $stmtInstCheck->bind_param('i', $idUsuario);
            $stmtInstCheck->execute();
            $hasInst = $stmtInstCheck->get_result()->num_rows > 0;
            $stmtInstCheck->close();

            if (!$hasInst) {
                $stmtLink = $conexao->prepare("INSERT INTO Usuario_Instituicao (id_usuario, id_instituicao) VALUES (?, ?)");
                $stmtLink->bind_param('ii', $idUsuario, $id_inst_logado);
                $stmtLink->execute();
                $stmtLink->close();
            }
        }

        $conexao->commit();

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Usuário ativado com sucesso!',
            'data' => []
        ];
    } catch (Exception $e) {
        $conexao->rollback();
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Não foi possível ativar o usuário: ' . $e->getMessage(),
            'data' => []
        ];
    }
}

header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);