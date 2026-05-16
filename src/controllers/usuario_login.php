<?php
include_once('../config/conexao.php');

$retorno = [
    'status' => '',
    'mensagem' => '',
    'data' => []
];

$stmt = $conexao->prepare('SELECT * FROM Usuario WHERE email = ?');
$stmt->bind_param('s', $_POST['email']);

$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $linha = $resultado->fetch_assoc();

    if (password_verify($_POST['senha'], $linha['senha'])) {
        if ($linha['status'] === '3') {
            echo json_encode(['status' => 'nok', 'mensagem' => 'Seu cadastro é inválido ou foi banido do sistema.']);
            exit;
        } else if ($linha['status'] !== '1') {
            echo json_encode(['status' => 'nok', 'mensagem' => 'Acesso negado. Usuário inativo ou aguardando validação.']);
            exit;
        }

        // Busca dados específicos do cargo
        if($linha['cargo'] == '1'){
            $stmtAdm = $conexao->prepare('SELECT nivel_permissao FROM Administrador WHERE id_usuario = ?');
            $stmtAdm->bind_param('i', $linha['id']);
            $stmtAdm->execute();
            if($adm = $stmtAdm->get_result()->fetch_assoc()){
                $linha['nivel_permissao'] = $adm['nivel_permissao'];
            }
            $stmtAdm->close();
        }

        // Busca TODAS as instituições vinculadas (Many-to-Many)
        $stmtInst = $conexao->prepare('
            SELECT i.id, i.nome 
            FROM Instituicao i
            JOIN Usuario_Instituicao ui ON i.id = ui.id_instituicao
            WHERE ui.id_usuario = ?
        ');
        $stmtInst->bind_param('i', $linha['id']);
        $stmtInst->execute();
        $resInst = $stmtInst->get_result();
        
        $instituicoes = [];
        while($inst = $resInst->fetch_assoc()){
            $instituicoes[] = $inst;
        }
        $linha['instituicoes'] = $instituicoes;
        
        // Para compatibilidade com código antigo que espera 'id_instituicao' direto no objeto:
        // Pega a primeira se existir
        $linha['id_instituicao'] = count($instituicoes) > 0 ? $instituicoes[0]['id'] : null;

        session_start();
        $_SESSION['usuario'] = $linha; 

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Sucesso, consulta efetuada!',
            'data' => [$linha]
        ];
    }
    else {
        $retorno = [
            'status' => 'nok',
            'mensagem' => 'Senha incorreta.',
            'data' => []
        ];
    }
}
else {
    $retorno = [
        'status' => 'nok',
        'mensagem' => 'Não há registros.',
        'data' => []
    ];
}

$stmt->close();
$conexao->close();

header('Content-type:application/json;charset:utf-8');
echo json_encode($retorno);