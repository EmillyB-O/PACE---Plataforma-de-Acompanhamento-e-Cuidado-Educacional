<?php
    session_start();
    include_once('../config/conexao.php');

    $retorno = [
        'status'    => '', 
        'mensagem'  => '', 
        'data'      => []
    ];

    if(!isset($_SESSION['usuario'])){
        echo json_encode(['status'=>'nok', 'mensagem'=>'Sessão expirada.']);
        exit;
    }
    $usuarioLogado = $_SESSION['usuario'];
    $cargo_logado = $usuarioLogado['cargo'];
    $nivel_permissao = $usuarioLogado['nivel_permissao'] ?? null;

    // Busca básica de usuários e dados de cargo
    $query = "SELECT u.id, u.nome, u.email, u.cpf, u.status, u.cargo, u.telefone, 
              a.nivel_permissao,
              ped.especializacao,
              ps.crm, ps.crp,
              prof.materia,
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
            // Institutional Admin: Vê apenas usuários vinculados à sua instituição ou a si mesmo
            $id_inst_logado = $usuarioLogado['id_instituicao']; // Pega da sessão
            $id_logado = intval($usuarioLogado['id']);
            
            $query .= " AND (
                u.id IN (SELECT id_usuario FROM Usuario_Instituicao WHERE id_instituicao = $id_inst_logado) 
                OR u.id = $id_logado
            ) ";
            $query .= " AND (u.cargo != '1' OR u.id = $id_logado) "; // Não vê outros ADMs
        }
    }

    $params = [];
    $types = "";

    if (isset($_GET['id'])) {
        $query .= " AND u.id = ?";
        $params[] = $_GET['id'];
        $types .= "i";
    }
    if (isset($_GET['cargo'])) {
        $query .= " AND u.cargo = ?";
        $params[] = $_GET['cargo'];
        $types .= "s";
    }
    if (isset($_GET['status'])) {
        $query .= " AND u.status = ?";
        $params[] = $_GET['status'];
        $types .= "s";
    }

    $stmt = $conexao->prepare($query);
    if (count($params) > 0) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $tabela = [];
    while($linha = $resultado->fetch_assoc()){
        // Para cada usuário, busca as instituições vinculadas
        $idUser = $linha['id'];
        $stmtInst = $conexao->prepare("
            SELECT i.id, i.nome 
            FROM Instituicao i 
            JOIN Usuario_Instituicao ui ON i.id = ui.id_instituicao 
            WHERE ui.id_usuario = ?
        ");
        $stmtInst->bind_param("i", $idUser);
        $stmtInst->execute();
        $resInst = $stmtInst->get_result();
        
        $insts = [];
        while($inst = $resInst->fetch_assoc()){
            $insts[] = $inst;
        }
        $linha['instituicoes'] = $insts;
        
        // Mantém compatibilidade com front que espera um ID direto
        $linha['id_instituicao'] = count($insts) > 0 ? $insts[0]['id'] : null;
        $linha['nome_instituicao'] = count($insts) > 0 ? $insts[0]['nome'] : 'Sem vínculo';

        $tabela[] = $linha;
        $stmtInst->close();
    }

    if(count($tabela) > 0){
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