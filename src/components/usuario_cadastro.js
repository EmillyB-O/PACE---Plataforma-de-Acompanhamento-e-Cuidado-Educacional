document.getElementById('enviar').addEventListener('click', () => { //"escuta" o clique do botao e automaticamente executa a funcao
    novo(); // a funcao cria um adm novo (NESSE CASO É UM ADM, poderia ser um usuario novo qualquer)
});

var seletor = document.getElementById('cargo');

seletor.addEventListener('change', function() {

    //IMPORTANTE: para cada informacao nova para um usuario especifico, colocar a div aqui para funcionar o style
    div_admin.style.display = 'none'; //esconde shhhhh
    div_pedagogo.style.display = 'none';
    div_saude.style.display = 'none';
    div_prof.style.display = 'none';
    div_responsavel.style.display = 'none';


    if(this.value === '1'){ //adm
        div_admin.style.display = 'block'; //mostra o conteudo da div dos elementos do adm
    }else if(this.value === '2'){ //pedagogo
        div_pedagogo.style.display = 'block';
    }else if(this.value === '3'){ //profissional da saude
        div_saude.style.display = 'block';
    }else if(this.value === '4'){ //professor
        div_prof.style.display = 'block';
    }else if(this.value === '5'){ //responsavel legal
        div_responsavel.style.display = 'block';
    }
});

async function novo() { //a funcao que o botao chama
    var nome = document.getElementById('nome').value;
    var email = document.getElementById('email').value;
    var cpf = document.getElementById('cpf').value;
    var senha = document.getElementById('senha').value;
    var cargo = document.getElementById('cargo');
    var telefone = document.getElementById('telefone').value;
    
    var nivel_permissao = document.getElementById('nivel_permissao').value;
    var instituicao = document.getElementById('instituicao').value;
    var cndb = document.getElementById('cndb').value;
    var especializacao = document.getElementById('especializacao').value;
    var crm = document.getElementById('crm').value;
    var crp = document.getElementById('crp').value;
    var materia = document.getElementById('materia').value;
    var data_nasc = document.getElementById('data_nasc').value;
    
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
        fd.append('cndb', document.getElementById('instituicao').value);
        fd.append('materia', document.getElementById('materia').value); 
    }else if(cargo === '5'){//responsavel legal
        fd.append('data_nasc', document.getElementById('data_nasc').value);
    }

    //isso serve para identificar se a transacao deu certo ou nn, pois para enviar os dados de usuario para o banco é necessario uma transacao 
    try {
        const retorno = await fetch('../../adm_novo.php',
            {
                method: 'POST',
                body: fd
            }
        );//prepara um retorno padrao para exibir a resposta de sucesso/erro

        const resposta = await retorno.json();
        if(resposta.status == 'ok'){
            alert('Sucesso: ', resposta.mensagem);
            window.location.href = 'A DEFINIR!'//colocar url da home apos login
        }else{
            alert('Erro: ', resposta.mensagem);
        }
    }catch(erro){
        console.error("Erro na requisição: ", erro);
        alert("Ocorreu um erro ao comunicar com o servidor.")
    }
    
}