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
            $retorno = [
                'status' => 'nok',
                'mensagem' => 'Seu cadastro é inválido ou foi banido do sistema. Contate a instituição para saber mais.',
                'data' => []
            ];
            $stmt->close();
            $conexao->close();
            header('Content-type:application/json;charset:utf-8');
            echo json_encode($retorno);
            exit;
        } else if ($linha['status'] !== '1') {
            $retorno = [
                'status' => 'nok',
                'mensagem' => 'Acesso negado. Usuário inativo ou aguardando validação.',
                'data' => []
            ];
            $stmt->close();
            $conexao->close();
            header('Content-type:application/json;charset:utf-8');
            echo json_encode($retorno);
            exit;
        }

        if($linha['cargo'] == '1'){
            $stmtAdm = $conexao->prepare('SELECT nivel_permissao, id_instituicao FROM Administrador WHERE id_usuario = ?');
            $stmtAdm->bind_param('i', $linha['id']);
            $stmtAdm->execute();
            $resultadoAdm = $stmtAdm->get_result();
            if($adm = $resultadoAdm->fetch_assoc()){
                $linha['nivel_permissao'] = $adm['nivel_permissao'];
                $linha['id_instituicao'] = $adm['id_instituicao'];
            }
            $stmtAdm->close();
        }
        $tabela[] = $linha;

        session_start();
        $_SESSION['usuario'] = $linha; 

        $retorno = [
            'status' => 'ok',
            'mensagem' => 'Sucesso, consulta efetuada!',
            'data' => $tabela
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