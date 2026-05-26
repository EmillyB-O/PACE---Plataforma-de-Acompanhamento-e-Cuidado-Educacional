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
    $retorno['mensagem'] = 'Acesso negado.';
    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);
    exit;
}

$id_profissional = $_SESSION['usuario']['id'];

    // Garante a existência da tabela Profissional_Aluno
    $conexao->query("
        CREATE TABLE IF NOT EXISTS Profissional_Aluno (
            id_profissional INT NOT NULL,
            id_aluno INT NOT NULL,
            PRIMARY KEY (id_profissional, id_aluno),
            FOREIGN KEY (id_profissional) REFERENCES Usuario(id) ON DELETE CASCADE,
            FOREIGN KEY (id_aluno) REFERENCES Aluno(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ");

    $query = "SELECT DISTINCT i.* FROM Instituicao i 
              JOIN Aluno a ON i.id = a.id_instituicao 
              JOIN Profissional_Aluno pa ON a.id = pa.id_aluno 
              WHERE pa.id_profissional = ?";

$stmt = $conexao->prepare($query);
if (!$stmt) {
    $retorno['mensagem'] = 'Erro interno ao consultar as instituições.';
    $retorno['detalhes'] = 'Erro no banco: ' . $conexao->error;
    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);
    exit;
}
$stmt->bind_param('i', $id_profissional);
$stmt->execute();
$resultado = $stmt->get_result();

$tabela = [];
while ($linha = $resultado->fetch_assoc()) {
    $tabela[] = $linha;
}

$retorno['status'] = 'ok';
$retorno['mensagem'] = 'Consulta efetuada com sucesso!';
$retorno['data'] = $tabela;

$stmt->close();
$conexao->close();

header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);
?>
