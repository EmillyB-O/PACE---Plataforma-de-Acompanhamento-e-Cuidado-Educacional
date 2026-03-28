document.addEventListener('DOMContentLoaded', () =>{
    valida_sessao();
    const url = new URLSearchParams(window.location.search);
    const id = url.get('id');
    buscar(id);
});

async function buscar(id) {
    const retorno = await fetch('../src/controllers/usuario_get.php?id='+id);
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        alert('Sucesso: ' + resposta.mensagem);
        var registro = resposta.data[0];
        document.getElementById('nome').value = registro.nome;
        document.getElementById('email').value = registro.email;
        document.getElementById('cpf').value = registro.cpf;
        document.getElementById('senha').value = registro.senha;
        document.getElementById('cargo').value = registro.cargo;
        document.getElementById('telefone').value = registro.telefone;
        document.getElementById('id').value = id;

        if(registro.cargo === '1'){//adm
            document.getElementById('nivel_permissao').value = registro.nivel_permissao;
            
        }else if(registro.cargo === '2'){ //pedagogo
            document.getElementById('cndb').value = registro.cndb;
            document.getElementById('instituicao').value = registro.instituicao;
            document.getElementById('especializacao').value = registro.especializacao;

        }else if(registro.cargo === '3'){ //profissional de saude
            document.getElementById('crm').value = registro.crm;
            document.getElementById('crp').value = registro.crp;

        }else if(registro.cargo === '4'){ //professor
            document.getElementById('cndb').value = registro.prof_cndb;
            document.getElementById('instituicao').value = registro.prof_instituicao;
            document.getElementById('materia').value = registro.materia;

        }else if(registro.cargo === '5'){ //responsavel legal
            document.getElementById('data_nasc').value = registro.data_nasc;
        }

        // Simular o onchange do seletor para organizar as div corretamente
        const evento = new Event("change");
        document.getElementById("cargo").dispatchEvent(evento);

    }else{
        alert('Erro: ' + resposta.mensagem);
        window.location.href = 'painel_admin.html';
    }
}

document.getElementById('enviar').addEventListener('click', () => {
    alterar();
});

async function alterar() {
    var nome = document.getElementById('nome').value;
    var email = document.getElementById('email').value;
    var cpf = document.getElementById('cpf').value;
    var senha = document.getElementById('senha').value;
    var cargo = document.getElementById('cargo').value;
    var telefone = document.getElementById('telefone').value;
    const id = document.getElementById('id').value;
    
    //pega os valores do front e prepara para enviar pro back

    const fd = new FormData(); //faz isso com formdata
    fd.append('nome', nome);
    fd.append('email', email);
    fd.append('cpf', cpf);
    fd.append('senha', senha);
    fd.append('cargo', cargo);
    fd.append('telefone', telefone);

    //serve para dar append somente nos itens que pertencem ao determinado cargo do usuario
    if(cargo === '1'){//adm
        fd.append('nivel_permissao', document.getElementById('nivel_permissao').value);
        //o adm vem com o nivel de permissao para adm instituicionais, entretanto ele só é linkado com a instituição depois de alguem atribuir ele à ela
    }else if(cargo === '2'){//pedagogo
        fd.append('cndb', document.getElementById('cndb').value);
        fd.append('instituicao', document.getElementById('instituicao').value);
        fd.append('especializacao', document.getElementById('especializacao').value);
    }else if(cargo === '3'){//profissional da saude
        fd.append('crm', document.getElementById('crm').value);
        fd.append('crp', document.getElementById('crp').value);

    }else if(cargo === '4'){//professor
        fd.append('cndb', document.getElementById('cndb').value);
        fd.append('instituicao', document.getElementById('instituicao').value);
        fd.append('materia', document.getElementById('materia').value); 
    }else if(cargo === '5'){//responsavel legal
        fd.append('data_nasc', document.getElementById('data_nasc').value);
    }

    try {
        const retorno = await fetch('../src/controllers/usuario_alterar.php?id='+id,
            {
                method: 'POST',
                body: fd
            }
        );//prepara um retorno padrao para exibir a resposta de sucesso/erro

        const resposta = await retorno.json();
        if(resposta.status == 'ok'){
            alert('Sucesso: ' + resposta.mensagem);
            window.location.href = 'painel_admin.html';
        }else{
            alert('Erro: ' + resposta.mensagem);
        }
    }catch(erro){
        console.error("Erro na requisição: ", erro);
        alert("Ocorreu um erro ao comunicar com o servidor.")
    }
}