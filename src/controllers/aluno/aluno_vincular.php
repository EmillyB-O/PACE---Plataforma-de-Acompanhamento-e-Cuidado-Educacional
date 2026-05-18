<?php
session_start();
include_once('../../config/conexao.php');

$retorno = [
    'status' => 'nok',
    'mensagem' => '',
    'data' => []
];

// Apenas administradores ou profissionais da saúde / professores?
// Vamos permitir Administradores (cargo 1) vincularem os alunos
if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['cargo'] != '1') {
    $retorno['mensagem'] = 'Acesso negado. Apenas administradores podem gerenciar vínculos.';
    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);
    exit;
}

$id_aluno = $_POST['id_aluno'] ?? null;
$id_usuario = $_POST['id_usuario'] ?? null;
$cargo = $_POST['cargo'] ?? null; // 3: Profissional da Saúde, 5: Responsável Legal
$parentesco = $_POST['parentesco'] ?? ''; // Obrigatório apenas para cargo 5

if (!$id_aluno || !$id_usuario || !$cargo) {
    $retorno['mensagem'] = 'Campos obrigatórios ausentes.';
    header('Content-type:application/json;charset:utf-8');
    echo json_encode($retorno);
    exit;
}

try {
    $conexao->begin_transaction();

    if ($cargo == '3') {
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

        // Verifica duplicidade
        $stmtCheck = $conexao->prepare("SELECT 1 FROM Profissional_Aluno WHERE id_profissional = ? AND id_aluno = ?");
        $stmtCheck->bind_param('ii', $id_usuario, $id_aluno);
        $stmtCheck->execute();
        if ($stmtCheck->get_result()->num_rows > 0) {
            $retorno['mensagem'] = 'Este Profissional da Saúde já está vinculado a este aluno.';
            $stmtCheck->close();
            $conexao->rollback();
            header('Content-type:application/json;charset:utf-8');
            echo json_encode($retorno);
            exit;
        }
        $stmtCheck->close();

        // Insere o vínculo
        $stmtInsert = $conexao->prepare("INSERT INTO Profissional_Aluno (id_profissional, id_aluno) VALUES (?, ?)");
        $stmtInsert->bind_param('ii', $id_usuario, $id_aluno);
        $stmtInsert->execute();
        $stmtInsert->close();

        $retorno['mensagem'] = 'Profissional da Saúde vinculado com sucesso!';

    } else if ($cargo == '5') {
        if (empty($parentesco)) {
            $retorno['mensagem'] = 'O grau de parentesco é obrigatório para Responsável Legal.';
            $conexao->rollback();
            header('Content-type:application/json;charset:utf-8');
            echo json_encode($retorno);
            exit;
        }

        // Verifica duplicidade
        $stmtCheck = $conexao->prepare("SELECT 1 FROM Responsavel_Aluno WHERE id_responsavel = ? AND id_aluno = ?");
        $stmtCheck->bind_param('ii', $id_usuario, $id_aluno);
        $stmtCheck->execute();
        if ($stmtCheck->get_result()->num_rows > 0) {
            $retorno['mensagem'] = 'Este Responsável Legal já está vinculado a este aluno.';
            $stmtCheck->close();
            $conexao->rollback();
            header('Content-type:application/json;charset:utf-8');
            echo json_encode($retorno);
            exit;
        }
        $stmtCheck->close();

        // Insere o vínculo
        $stmtInsert = $conexao->prepare("INSERT INTO Responsavel_Aluno (id_responsavel, id_aluno, parentesco) VALUES (?, ?, ?)");
        $stmtInsert->bind_param('iis', $id_usuario, $id_aluno, $parentesco);
        $stmtInsert->execute();
        $stmtInsert->close();

        $retorno['mensagem'] = 'Responsável Legal vinculado com sucesso!';
    } else {
        $retorno['mensagem'] = 'Cargo inválido.';
        $conexao->rollback();
        header('Content-type:application/json;charset:utf-8');
        echo json_encode($retorno);
        exit;
    }

    $conexao->commit();
    $retorno['status'] = 'ok';

} catch (Exception $e) {
    $conexao->rollback();
    $retorno['mensagem'] = 'Erro ao vincular: ' . $e->getMessage();
}

$conexao->close();
header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);
