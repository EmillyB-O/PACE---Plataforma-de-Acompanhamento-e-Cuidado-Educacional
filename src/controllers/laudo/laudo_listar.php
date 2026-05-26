<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

include_once('../../config/conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => '',
    'data' => []
];

if (!isset($_SESSION['usuario'])) {
    $retorno['mensagem'] = 'Não autenticado.';
    header('Content-type:application/json;charset=utf-8');
    echo json_encode($retorno);
    exit;
}

if (!isset($_GET['id_aluno'])) {
    $retorno['mensagem'] = 'ID do aluno não fornecido.';
    header('Content-type:application/json;charset=utf-8');
    echo json_encode($retorno);
    exit;
}

$id_aluno = $_GET['id_aluno'];
$cargo = $_SESSION['usuario']['cargo'];
$id_usuario = $_SESSION['usuario']['id'];
$tem_acesso = false;

// Garante a existência da tabela Laudo
$conexao->query("
    CREATE TABLE IF NOT EXISTS Laudo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        data_emissao DATETIME,
        id_aluno INT NOT NULL,
        id_profissional_saude INT NOT NULL,
        anexo_arquivo MEDIUMBLOB,
        anexo_nome VARCHAR(255),
        FOREIGN KEY (id_aluno) REFERENCES Aluno(id) ON DELETE CASCADE,
        FOREIGN KEY (id_profissional_saude) REFERENCES Usuario(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
");

// Garante que a coluna anexo_nome exista caso a tabela tenha sido criada sem ela pelo script SQL original
$checkCol = $conexao->query("SHOW COLUMNS FROM Laudo LIKE 'anexo_nome'");
if ($checkCol && $checkCol->num_rows === 0) {
    $conexao->query("ALTER TABLE Laudo ADD COLUMN anexo_nome VARCHAR(255)");
}

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
    $retorno['mensagem'] = 'Acesso negado. Você não possui vínculo com este aluno para acessar os laudos.';
    header('Content-type:application/json;charset=utf-8');
    echo json_encode($retorno);
    exit;
}

// Lista os laudos omitindo o anexo pesado
$query = "SELECT l.id, l.titulo, l.data_emissao, l.anexo_nome, u.nome as nome_profissional 
          FROM Laudo l 
          INNER JOIN Usuario u ON l.id_profissional_saude = u.id 
          WHERE l.id_aluno = ? 
          ORDER BY l.data_emissao DESC";
$stmt = $conexao->prepare($query);
if (!$stmt) {
    $retorno['mensagem'] = 'Erro interno ao listar os laudos.';
    $retorno['detalhes'] = 'Erro no banco: ' . $conexao->error;
    header('Content-type:application/json;charset=utf-8');
    echo json_encode($retorno);
    exit;
}

$stmt->bind_param("i", $id_aluno);
$stmt->execute();
$res = $stmt->get_result();

$laudos = [];
while ($row = $res->fetch_assoc()) {
    $laudos[] = $row;
}

$retorno['status'] = 'ok';
$retorno['mensagem'] = 'Consulta realizada com sucesso!';
$retorno['data'] = $laudos;

$stmt->close();
$conexao->close();

header('Content-type:application/json;charset=utf-8');
echo json_encode($retorno);
?>
