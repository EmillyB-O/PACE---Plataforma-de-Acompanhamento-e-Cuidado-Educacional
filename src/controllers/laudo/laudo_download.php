<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

include_once('../../config/conexao.php');

if (!isset($_SESSION['usuario'])) {
    header("HTTP/1.1 401 Unauthorized");
    echo "Não autenticado.";
    exit;
}

if (!isset($_GET['id'])) {
    header("HTTP/1.1 400 Bad Request");
    echo "ID do laudo não fornecido.";
    exit;
}

$id_laudo = $_GET['id'];
$cargo = $_SESSION['usuario']['cargo'];
$id_usuario = $_SESSION['usuario']['id'];

// Busca primeiro os metadados do laudo para verificar acesso
$query = "SELECT id_aluno, anexo_nome, anexo_arquivo FROM Laudo WHERE id = ?";
$stmt = $conexao->prepare($query);
if (!$stmt) {
    header("HTTP/1.1 500 Internal Server Error");
    echo "Erro de banco: " . $conexao->error;
    exit;
}
$stmt->bind_param("i", $id_laudo);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) {
    header("HTTP/1.1 404 Not Found");
    echo "Laudo não encontrado.";
    exit;
}

$laudo = $res->fetch_assoc();
$id_aluno = $laudo['id_aluno'];
$anexo_nome = $laudo['anexo_nome'];
$anexo_arquivo = $laudo['anexo_arquivo'];
$stmt->close();

// Verifica privilégios de acesso
$tem_acesso = false;

if ($cargo == '2') { // Pedagogo
    $id_inst = $_SESSION['usuario']['id_instituicao'];
    $stmtAcc = $conexao->prepare("SELECT 1 FROM Aluno WHERE id = ? AND id_instituicao = ?");
    $stmtAcc->bind_param("ii", $id_aluno, $id_inst);
    $stmtAcc->execute();
    if ($stmtAcc->get_result()->num_rows > 0) $tem_acesso = true;
    $stmtAcc->close();
} elseif ($cargo == '4') { // Professor
    $stmtAcc = $conexao->prepare("SELECT 1 FROM Aluno a INNER JOIN Professor_Turma pt ON a.id_turma = pt.id_turma WHERE a.id = ? AND pt.id_professor = ?");
    $stmtAcc->bind_param("ii", $id_aluno, $id_usuario);
    $stmtAcc->execute();
    if ($stmtAcc->get_result()->num_rows > 0) $tem_acesso = true;
    $stmtAcc->close();
} elseif ($cargo == '3') { // Profissional da Saúde
    $stmtAcc = $conexao->prepare("SELECT 1 FROM Profissional_Aluno WHERE id_aluno = ? AND id_profissional = ?");
    $stmtAcc->bind_param("ii", $id_aluno, $id_usuario);
    $stmtAcc->execute();
    if ($stmtAcc->get_result()->num_rows > 0) $tem_acesso = true;
    $stmtAcc->close();
} elseif ($cargo == '1') { // Administrador
    $tem_acesso = true;
}

if (!$tem_acesso) {
    header("HTTP/1.1 403 Forbidden");
    echo "Acesso negado. Você não possui vínculo com este aluno.";
    exit;
}

if (!$anexo_arquivo) {
    header("HTTP/1.1 404 Not Found");
    echo "Arquivo do laudo não encontrado ou vazio.";
    exit;
}

$conexao->close();

// Envia o arquivo PDF
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . basename($anexo_nome) . '"');
header('Content-Length: ' . strlen($anexo_arquivo));

echo $anexo_arquivo;
exit;
?>
