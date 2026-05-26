<?php
    include_once('../../config/conexao.php');

    session_start();
    $usuario = isset($_SESSION['usuario']) ? $_SESSION['usuario'] : null;

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $isInstitutionalAdmin = ($usuario && $usuario['cargo'] == '1' && isset($usuario['nivel_permissao']) && $usuario['nivel_permissao'] == '1');
    $isPedagogo = ($usuario && $usuario['cargo'] == '2');

    if($usuario && $usuario['cargo'] == '4') {
        // Para professor: mostrar apenas as turmas vinculadas a ele em Professor_Turma
        if(isset($_GET['id'])){
            $stmt = $conexao->prepare("
                SELECT t.*, i.nome as nome_instituicao 
                FROM Turma t 
                LEFT JOIN Instituicao i ON t.id_instituicao = i.id 
                INNER JOIN Professor_Turma pt ON t.id = pt.id_turma
                WHERE t.id = ? AND pt.id_professor = ?
            ");
            $stmt->bind_param("ii", $_GET['id'], $usuario['id']);
        }elseif(isset($_GET['id_instituicao'])){
            $stmt = $conexao->prepare("
                SELECT t.*, i.nome as nome_instituicao 
                FROM Turma t 
                LEFT JOIN Instituicao i ON t.id_instituicao = i.id 
                INNER JOIN Professor_Turma pt ON t.id = pt.id_turma
                WHERE t.id_instituicao = ? AND pt.id_professor = ?
            ");
            $stmt->bind_param("ii", $_GET['id_instituicao'], $usuario['id']);
        }else{
            $stmt = $conexao->prepare("
                SELECT t.*, i.nome as nome_instituicao 
                FROM Turma t 
                LEFT JOIN Instituicao i ON t.id_instituicao = i.id 
                INNER JOIN Professor_Turma pt ON t.id = pt.id_turma
                WHERE pt.id_professor = ?
            ");
            $stmt->bind_param("i", $usuario['id']);
        }
    } elseif ($isInstitutionalAdmin || $isPedagogo) {
        // Para administrador institucional e pedagogo: restringir à sua própria instituição
        $id_inst_usuario = $usuario['id_instituicao'];

        if(isset($_GET['id'])){
            $stmt = $conexao->prepare("
                SELECT t.*, i.nome as nome_instituicao 
                FROM Turma t 
                LEFT JOIN Instituicao i ON t.id_instituicao = i.id 
                WHERE t.id = ? AND t.id_instituicao = ?
            ");
            $stmt->bind_param("ii", $_GET['id'], $id_inst_usuario);
        } else {
            $stmt = $conexao->prepare("
                SELECT t.*, i.nome as nome_instituicao 
                FROM Turma t 
                LEFT JOIN Instituicao i ON t.id_instituicao = i.id 
                WHERE t.id_instituicao = ?
            ");
            $stmt->bind_param("i", $id_inst_usuario);
        }
    } elseif ($usuario && $usuario['cargo'] == '3') {
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
        // Para profissional de saúde: mostrar apenas as turmas que possuem pelo menos um aluno vinculado a ele em Profissional_Aluno
        $id_profissional = $usuario['id'];
        if(isset($_GET['id'])){
            $stmt = $conexao->prepare("
                SELECT DISTINCT t.*, i.nome as nome_instituicao 
                FROM Turma t 
                LEFT JOIN Instituicao i ON t.id_instituicao = i.id 
                INNER JOIN Aluno a ON t.id = a.id_turma
                INNER JOIN Profissional_Aluno pa ON a.id = pa.id_aluno
                WHERE t.id = ? AND pa.id_profissional = ?
            ");
            $stmt->bind_param("ii", $_GET['id'], $id_profissional);
        }elseif(isset($_GET['id_instituicao'])){
            $stmt = $conexao->prepare("
                SELECT DISTINCT t.*, i.nome as nome_instituicao 
                FROM Turma t 
                LEFT JOIN Instituicao i ON t.id_instituicao = i.id 
                INNER JOIN Aluno a ON t.id = a.id_turma
                INNER JOIN Profissional_Aluno pa ON a.id = pa.id_aluno
                WHERE t.id_instituicao = ? AND pa.id_profissional = ?
            ");
            $stmt->bind_param("ii", $_GET['id_instituicao'], $id_profissional);
        }else{
            $stmt = $conexao->prepare("
                SELECT DISTINCT t.*, i.nome as nome_instituicao 
                FROM Turma t 
                LEFT JOIN Instituicao i ON t.id_instituicao = i.id 
                INNER JOIN Aluno a ON t.id = a.id_turma
                INNER JOIN Profissional_Aluno pa ON a.id = pa.id_aluno
                WHERE pa.id_profissional = ?
            ");
            $stmt->bind_param("i", $id_profissional);
        }
    } else {
        // Outros usuários (Administrador Global, etc.)
        if(isset($_GET['id'])){
            // Segunda situação - RECEBENDO O ID por GET
            $stmt = $conexao->prepare("SELECT t.*, i.nome as nome_instituicao FROM Turma t LEFT JOIN Instituicao i ON t.id_instituicao = i.id WHERE t.id = ?");
            $stmt->bind_param("i",$_GET['id']);
        }elseif(isset($_GET['id_instituicao'])){
            // Terceira situação - RECEBENDO O ID da Instituição por GET
            $stmt = $conexao->prepare("SELECT t.*, i.nome as nome_instituicao FROM Turma t LEFT JOIN Instituicao i ON t.id_instituicao = i.id WHERE t.id_instituicao = ?");
            $stmt->bind_param("i",$_GET['id_instituicao']);
        }else{
            // Primeira situação - SEM RECEBER O ID por GET
            $stmt = $conexao->prepare("SELECT t.*, i.nome as nome_instituicao FROM Turma t LEFT JOIN Instituicao i ON t.id_instituicao = i.id");
        }
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