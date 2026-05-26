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

if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['cargo'] != '3') {
    $retorno['mensagem'] = 'Acesso negado. Apenas profissionais da saúde podem anexar laudos.';
    header('Content-type:application/json;charset=utf-8');
    echo json_encode($retorno);
    exit;
}

if (!isset($_POST['id_aluno']) || !isset($_POST['titulo'])) {
    $retorno['mensagem'] = 'Parâmetros insuficientes.';
    header('Content-type:application/json;charset=utf-8');
    echo json_encode($retorno);
    exit;
}

$id_profissional = $_SESSION['usuario']['id'];
$id_aluno = $_POST['id_aluno'];
$titulo = $_POST['titulo'];

// Garante que o profissional tem vínculo com o aluno
$stmtCheck = $conexao->prepare("SELECT 1 FROM Profissional_Aluno WHERE id_profissional = ? AND id_aluno = ?");
if (!$stmtCheck) {
    $retorno['mensagem'] = 'Erro interno ao validar vínculo do profissional.';
    $retorno['detalhes'] = 'Erro ao preparar consulta de vínculo: ' . $conexao->error;
    header('Content-type:application/json;charset=utf-8');
    echo json_encode($retorno);
    exit;
}
$stmtCheck->bind_param("ii", $id_profissional, $id_aluno);
$stmtCheck->execute();
$resCheck = $stmtCheck->get_result();
if ($resCheck->num_rows === 0) {
    $retorno['mensagem'] = 'Acesso negado. Você não está vinculado a este aluno.';
    header('Content-type:application/json;charset=utf-8');
    echo json_encode($retorno);
    exit;
}
$stmtCheck->close();

if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK) {
    $retorno['mensagem'] = 'Erro no envio do arquivo PDF.';
    header('Content-type:application/json;charset=utf-8');
    echo json_encode($retorno);
    exit;
}

$fileType = $_FILES['pdf']['type'];
if ($fileType !== 'application/pdf') {
    $ext = strtolower(pathinfo($_FILES['pdf']['name'], PATHINFO_EXTENSION));
    if ($ext !== 'pdf') {
        $retorno['mensagem'] = 'Apenas arquivos PDF são permitidos.';
        header('Content-type:application/json;charset=utf-8');
        echo json_encode($retorno);
        exit;
    }
}

$fileName = $_FILES['pdf']['name'];
$fileData = file_get_contents($_FILES['pdf']['tmp_name']);

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

$query = "INSERT INTO Laudo (titulo, data_emissao, id_aluno, id_profissional_saude, anexo_arquivo, anexo_nome) 
          VALUES (?, NOW(), ?, ?, ?, ?)";
$stmt = $conexao->prepare($query);
if (!$stmt) {
    $retorno['mensagem'] = 'Erro interno ao preparar o laudo no banco.';
    $retorno['detalhes'] = 'Erro ao preparar banco: ' . $conexao->error;
    header('Content-type:application/json;charset=utf-8');
    echo json_encode($retorno);
    exit;
}

$null = NULL;
$stmt->bind_param("siibs", $titulo, $id_aluno, $id_profissional, $null, $fileName);
$stmt->send_long_data(3, $fileData);

if ($stmt->execute()) {
    $retorno['status'] = 'ok';
    $retorno['mensagem'] = 'Laudo anexado com sucesso!';
} else {
    $retorno['mensagem'] = 'Erro interno ao salvar o laudo.';
    $retorno['detalhes'] = 'Erro ao salvar laudo no banco: ' . $stmt->error;
}

$stmt->close();
$conexao->close();

header('Content-type:application/json;charset=utf-8');
echo json_encode($retorno);
?>
