<?php
session_start();
include_once('../../config/conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => '',
    'data' => [
        'profissionais' => [],
        'responsaveis' => []
    ]
];

if (!isset($_SESSION['usuario'])) {
    $retorno['mensagem'] = 'Sessão expirada.';
    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);
    exit;
}

$id_aluno = $_GET['id_aluno'] ?? null;
if (!$id_aluno) {
    $retorno['mensagem'] = 'ID do aluno não fornecido.';
    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);
    exit;
}

try {
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

    // Busca profissionais vinculados
    $stmtProf = $conexao->prepare("
        SELECT u.id, u.nome, u.email, ps.crm, ps.crp 
        FROM Usuario u 
        JOIN Profissional_Aluno pa ON u.id = pa.id_profissional 
        JOIN Profissional_Saude ps ON u.id = ps.id_usuario 
        WHERE pa.id_aluno = ?
    ");
    $stmtProf->bind_param('i', $id_aluno);
    $stmtProf->execute();
    $resProf = $stmtProf->get_result();
    $profissionais = [];
    while ($linha = $resProf->fetch_assoc()) {
        $profissionais[] = $linha;
    }
    $stmtProf->close();

    // Busca responsáveis vinculados
    $stmtResp = $conexao->prepare("
        SELECT u.id, u.nome, u.email, ra.parentesco 
        FROM Usuario u 
        JOIN Responsavel_Aluno ra ON u.id = ra.id_responsavel 
        WHERE ra.id_aluno = ?
    ");
    $stmtResp->bind_param('i', $id_aluno);
    $stmtResp->execute();
    $resResp = $stmtResp->get_result();
    $responsaveis = [];
    while ($linha = $resResp->fetch_assoc()) {
        $responsaveis[] = $linha;
    }
    $stmtResp->close();

    $retorno['status'] = 'ok';
    $retorno['data']['profissionais'] = $profissionais;
    $retorno['data']['responsaveis'] = $responsaveis;

} catch (Exception $e) {
    $retorno['mensagem'] = 'Erro ao consultar vínculos: ' . $e->getMessage();
}

$conexao->close();
header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);
