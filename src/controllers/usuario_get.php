<?php
    session_start();
    include_once('../config/conexao.php');

    $retorno = [
        'status'    => '', 
        'mensagem'  => '', 
        'data'      => []
    ];

    if(!isset($_SESSION['usuario'])){
        echo json_encode(['status'=>'nok']);
        exit;
    }
    $usuarioLogado = $_SESSION['usuario'];
    $cargo_logado = $usuarioLogado['cargo'];
    $nivel_permissao = $usuarioLogado['nivel_permissao'] ?? null;

    //ADAPTAR OS SELECTS PARA UTILIZAR JOIN COM A ESPECIALIZACAO DE CADA USUARIO
    $query = "SELECT u.id, u.nome, u.email, u.cpf, u.status, u.cargo, u.telefone, 
              a.nivel_permissao, a.id_instituicao as admin_instituicao,
              ped.cndb as ped_cndb, ped.id_instituicao as ped_instituicao, ped.especializacao,
              ps.crm, ps.crp,
              prof.cndb as prof_cndb, prof.id_instituicao as prof_instituicao, prof.materia,
              rl.data_nasc
              FROM Usuario u
              LEFT JOIN Administrador a ON u.id = a.id_usuario
              LEFT JOIN Pedagogo ped ON u.id = ped.id_usuario
              LEFT JOIN Profissional_Saude ps ON u.id = ps.id_usuario
              LEFT JOIN Professor prof ON u.id = prof.id_usuario
              LEFT JOIN Responsavel_Legal rl ON u.id = rl.id_usuario
              WHERE 1=1 ";

    if ($cargo_logado == '1') {
        if ($nivel_permissao == '0') {
            $query .= " AND u.cargo = '1' "; // Global só vê administradores
        } elseif ($nivel_permissao == '1') {
            $id_logado = intval($usuarioLogado['id']);
            $query .= " AND (u.cargo != '1' OR u.id = $id_logado) "; // Inst não vê outros administradores
        }
    }

    if(isset($_GET['id'])){
        // Segunda situação - RECEBENDO O ID por GET
        $query .= " AND u.id = ?";
        $stmt = $conexao->prepare($query);
        $stmt->bind_param("i", $_GET['id']);
    }else{
        // Primeira situação - SEM RECEBER O ID por GET
        $stmt = $conexao->prepare($query);
    }
    
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $tabela = [];
    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        $retorno = [
            'status'    => 'ok', 
            'mensagem'  => 'Sucesso, consulta efetuada.', 
            'data'      => $tabela
        ];
    }else{
        $retorno = [
            'status'    => 'nok', 
            'mensagem'  => 'Não há registros', 
            'data'      => []
        ];
    }
    
    $stmt->close();
    $conexao->close();

    
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);