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

    if(isset($_GET['id'])){
        // Segunda situação - RECEBENDO O ID por GET
        if ($isInstitutionalAdmin || $isPedagogo) {
            $stmt = $conexao->prepare("SELECT * FROM Instituicao WHERE id = ? AND id = ?");
            $id_inst_usuario = $usuario['id_instituicao'];
            $stmt->bind_param("ii", $_GET['id'], $id_inst_usuario);
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
            // Para profissional de saúde: apenas se a instituição tiver pelo menos um aluno vinculado ao profissional de saúde
            $stmt = $conexao->prepare("SELECT DISTINCT i.* 
                                       FROM Instituicao i
                                       INNER JOIN Aluno a ON i.id = a.id_instituicao
                                       INNER JOIN Profissional_Aluno pa ON a.id = pa.id_aluno
                                       WHERE i.id = ? AND pa.id_profissional = ?");
            $stmt->bind_param("ii", $_GET['id'], $usuario['id']);
        } else {
            $stmt = $conexao->prepare("SELECT * FROM Instituicao WHERE id = ?");
            $stmt->bind_param("i",$_GET['id']);
        }
    }else{
        // Para professor: mostrar apenas instituições vinculadas
        if($usuario && $usuario['cargo'] == '4'){
            $stmt = $conexao->prepare("SELECT i.*
                                       FROM Instituicao i
                                       INNER JOIN Usuario_Instituicao ui
                                       ON ui.id_instituicao = i.id
                                       WHERE ui.id_usuario = ?
            ");
            $stmt->bind_param("i", $usuario['id']);
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
            // Para profissional de saúde: apenas instituições que possuem no mínimo um aluno vinculado a ele
            $stmt = $conexao->prepare("SELECT DISTINCT i.* 
                                       FROM Instituicao i
                                       INNER JOIN Aluno a ON i.id = a.id_instituicao
                                       INNER JOIN Profissional_Aluno pa ON a.id = pa.id_aluno
                                       WHERE pa.id_profissional = ?
            ");
            $stmt->bind_param("i", $usuario['id']);
        } elseif ($isInstitutionalAdmin || $isPedagogo) {
            // Para administrador institucional e pedagogo: restringir à sua própria instituição
            $stmt = $conexao->prepare("SELECT * FROM Instituicao WHERE id = ?");
            $stmt->bind_param("i", $usuario['id_instituicao']);
        } else {
            // Outros usuários (Administrador Global, etc.): mostrar todos
            $stmt = $conexao->prepare("SELECT * FROM Instituicao");
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