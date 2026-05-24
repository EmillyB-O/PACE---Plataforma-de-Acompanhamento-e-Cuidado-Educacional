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

// Apenas pedagogos (2), profissionais de saúde (3) e professores (4) podem fazer relatórios
if ($cargo != '2' && $cargo != '3' && $cargo != '4') {
    $retorno['mensagem'] = 'Seu perfil de usuário não tem permissão para cadastrar relatórios.';
    echo json_encode($retorno);
    exit;
}

$id_aluno = isset($_POST['id_aluno']) ? intval($_POST['id_aluno']) : 0;
$titulo = isset($_POST['titulo']) ? trim($_POST['titulo']) : '';
$conteudo = isset($_POST['conteudo']) ? trim($_POST['conteudo']) : '';

if ($id_aluno <= 0) {
    $retorno['mensagem'] = 'O aluno de destino deve ser informado.';
    echo json_encode($retorno);
    exit;
}

if (empty($titulo)) {
    $retorno['mensagem'] = 'O título do relatório é obrigatório.';
    echo json_encode($retorno);
    exit;
}

if (empty($conteudo)) {
    $retorno['mensagem'] = 'O conteúdo do relatório é obrigatório.';
    echo json_encode($retorno);
    exit;
}

try {
    $conexao->begin_transaction();

    // Recebe o id_recebedor se for enviado pelo front-end
    $id_recebedor = isset($_POST['id_recebedor']) ? intval($_POST['id_recebedor']) : 0;

    if ($id_recebedor <= 0) {
        // Buscar se o aluno possui algum responsável legal para atuar como recebedor secundário se aplicável
        $stmt_resp = $conexao->prepare("SELECT id_responsavel FROM Responsavel_Aluno WHERE id_aluno = ? LIMIT 1");
        $stmt_resp->bind_param("i", $id_aluno);
        $stmt_resp->execute();
        $res_resp = $stmt_resp->get_result();
        if ($row_resp = $res_resp->fetch_assoc()) {
            $id_recebedor = $row_resp['id_responsavel'];
        } else {
            $id_recebedor = $id_usuario_logado;
        }
        $stmt_resp->close();
    }

    $query = "INSERT INTO Relatorio (titulo, data_emissao, id_aluno, id_remetente, id_recebedor, conteudo) 
              VALUES (?, NOW(), ?, ?, ?, ?)";
    
    $stmt = $conexao->prepare($query);
    $stmt->bind_param("siiis", $titulo, $id_aluno, $id_usuario_logado, $id_recebedor, $conteudo);
    $stmt->execute();
    
    $conexao->commit();

    $retorno = [
        'status' => 'ok',
        'mensagem' => 'Relatório cadastrado com sucesso.',
        'data' => []
    ];

} catch (mysqli_sql_exception $e) {
    if (isset($conexao)) {
        $conexao->rollback();
    }
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
