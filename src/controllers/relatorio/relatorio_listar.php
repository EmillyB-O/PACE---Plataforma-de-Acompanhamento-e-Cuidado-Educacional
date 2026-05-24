<?php
session_start();
require_once '../../config/conexao.php';

$retorno = [
    'status' => 'nok',
    'mensagem' => 'Erro desconhecido.',
    'data' => []
];

if (!isset($_SESSION['usuario'])) {
    $retorno['mensagem'] = 'Sessão expirada.';
    echo json_encode($retorno);
    exit;
}

$usuarioLogado = $_SESSION['usuario'];
$id_usuario_logado = $usuarioLogado['id'];
$cargo = $usuarioLogado['cargo'];

$id_aluno = isset($_GET['id_aluno']) ? intval($_GET['id_aluno']) : 0;

if ($id_aluno <= 0) {
    $retorno['mensagem'] = 'ID do aluno inválido.';
    echo json_encode($retorno);
    exit;
}

try {
    $query = "SELECT r.id, r.titulo, r.conteudo, r.data_emissao, r.id_remetente, r.id_recebedor,
                     u_rem.nome AS nome_remetente, u_rem.cargo AS cargo_remetente,
                     u_rec.nome AS nome_recebedor
              FROM Relatorio r
              JOIN Usuario u_rem ON r.id_remetente = u_rem.id
              LEFT JOIN Usuario u_rec ON r.id_recebedor = u_rec.id
              WHERE r.id_aluno = ?";

    // Aplicar regras de visibilidade
    if ($cargo == '2') {
        // Pedagogo vê todos os relatórios do aluno
    } else if ($cargo == '3') {
        // Profissional de Saúde vê relatórios de pedagogos (cargo = 2), ou relatórios criados por ele ou enviados para ele
        $query .= " AND (u_rem.cargo = '2' OR r.id_remetente = " . intval($id_usuario_logado) . " OR r.id_recebedor = " . intval($id_usuario_logado) . ")";
    } else if ($cargo == '4') {
        // Professor vê relatórios enviados por ele mesmo ou que tenham sido enviados para ele
        $query .= " AND (r.id_remetente = " . intval($id_usuario_logado) . " OR r.id_recebedor = " . intval($id_usuario_logado) . ")";
    } else if ($cargo == '5') {
        // Responsável Legal vê relatórios feitos por pedagogos (cargo = 2) ou enviados diretamente para ele
        $query .= " AND (u_rem.cargo = '2' OR r.id_recebedor = " . intval($id_usuario_logado) . ")";
    } else if ($cargo == '1') {
        // Administrador vê todos
    } else {
        // Outros cargos não veem nada
        $query .= " AND 1=0";
    }

    $query .= " ORDER BY r.data_emissao DESC";

    $stmt = $conexao->prepare($query);
    $stmt->bind_param("i", $id_aluno);
    $stmt->execute();
    $result = $stmt->get_result();

    $relatorios = [];
    while ($row = $result->fetch_assoc()) {
        $relatorios[] = $row;
    }

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Relatórios listados com sucesso.',
        'data' => $relatorios
    ];

} catch (mysqli_sql_exception $e) {
    $retorno = [
        'status' => 'nok',
        'mensagem' => obterMensagemErroBanco($e->getMessage(), $e->getCode()),
        'data' => []
    ];
}

if (isset($stmt) && $stmt !== false) {
    $stmt->close();
}
$conexao->close();

header('Content-Type: application/json; charset=utf-8');
echo json_encode($retorno);
