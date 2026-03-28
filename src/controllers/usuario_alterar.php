<?php
    include_once('../config/conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $nome       = $_POST['nome'];
        $email      = $_POST['email'];
        $cpf        = $_POST['cpf'];
        $senha      = password_hash($_POST['senha'], PASSWORD_DEFAULT);
        $cargo      = $_POST['cargo'];
        $telefone   = $_POST['telefone'];

        try {
            $conexao->begin_transaction();
            $stmt = $conexao->prepare('UPDATE Usuario SET nome = ?, email = ?, cpf = ?, senha = ?, cargo = ?, telefone = ? WHERE id = ?');
            $stmt->bind_param('ssssisi',$nome,$email,$cpf,$senha,$cargo,$telefone,$_GET['id']);
            $stmt->execute();

            $idUsuario = $_GET['id'];

            if ($cargo === '1') {//adm
                $nivel_permissao = $_POST['nivel_permissao'];

                $stmt = $conexao->prepare('UPDATE Administrador SET nivel_permissao = ? WHERE id_usuario = ?');
                $stmt->bind_param('i',$nivel_permissao);
                $stmt->execute();

            }elseif ($cargo === '2') { //pedagogo
                $cndb = $_POST['cndb'];
                $instituicao = $_POST['instituicao'];
                $especializacao = $_POST['especializacao'];

                $stmt = $conexao->prepare('UPDATE Pedagogo SET cndb = ?, id_instituicao = ?, especializacao = ? WHERE id_usuario = ?');
                $stmt->bind_param('sis',$cndb, $instituicao, $especializacao);
                $stmt->execute();

            }elseif ($cargo === '3') { //profissional de saude
                $crm = $_POST['crm'];
                $crp = $_POST['crp'];

                $stmt = $conexao->prepare('UPDATE Profissional_Saude SET crm = ?, crp = ? WHERE id_usuario = ?');
                $stmt->bind_param('ss',$crm, $crp);
                $stmt->execute();

            }elseif ($cargo === '4') { //professor
                $cndb = $_POST['cndb'];
                $instituicao = $_POST['instituicao'];
                $materia = $_POST['materia'];

                $stmt = $conexao->prepare('UPDATE Professor SET cndb = ?, id_instituicao = ?, materia = ? WHERE id_usuario = ?');
                $stmt->bind_param('sis',$cndb, $instituicao, $materia);
                $stmt->execute();
            
            }elseif ($cargo === '5') { //responsavel legal
                $data_nasc = $_POST['data_nasc'];

                $stmt = $conexao->prepare('UPDATE Responsavel_Legal SET data_nasc = ? WHERE id_usuario = ?');
                $stmt->bind_param('si', $data_nasc, $idUsuario);
                $stmt->execute();
            }

            $conexao->commit();

            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Registro alterado com sucesso.',
                'data'      => []
            ];
        } catch (mysqli_sql_exception $e) {
            if (isset($conexao)) {
                $conexao->rollback();
            }

            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Falha ao alterar o registro: ' . $e->getMessage(),
                'data'      => []
            ];
        }

        if(isset($stmt) && $stmt !== false) {
            $stmt->close();
        }

    }else{
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Não posso alterar um registro sem um ID informado.',
            'data'      => []
        ];
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);