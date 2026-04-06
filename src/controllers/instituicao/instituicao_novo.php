<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
include_once('../../config/conexao.php');
$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

$nome = $_POST['nome'];
$endereco = $_POST['endereco'];
$codigo = $_POST['codigo'];

try {
    $conexao->begin_transaction();

    // Verifica se já existe uma instituição com o mesmo nome e código
    $stmtVerifica = $conexao->prepare('SELECT id FROM Instituicao WHERE nome = ? AND codigo = ?');
    $stmtVerifica->bind_param('si', $nome, $codigo);
    $stmtVerifica->execute();
    $resultadoVerifica = $stmtVerifica->get_result();

    if ($resultadoVerifica->num_rows > 0) {
        $stmtVerifica->close();
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Já existe uma instituição com esse Nome e Código informados.',
            'data' => []
        ];
        $conexao->rollback();
        header('Content-type:application/json;charset:utf-8');
        echo json_encode($retorno);
        exit;
    }
    $stmtVerifica->close();

    $status = 1; // 1: Ativo
    $stmt = $conexao->prepare('INSERT INTO Instituicao (nome, endereco, codigo) VALUES (?,?,?)');
    $stmt->bind_param('ssi', $nome, $endereco, $codigo);
    $stmt->execute();
    $conexao->commit();

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Registro inserido com sucesso!',
        'data' => []
    ];
} catch (mysqli_sql_exception $e) {
    if (isset($conexao)) {
        $conexao->rollback();
    }

    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Falha ao inserir o registro: ' . $e->getMessage(),
        'data' => []
    ];
}

if (isset($stmt) && $stmt !== false) {
    $stmt->close();
}
$conexao->close();

header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);