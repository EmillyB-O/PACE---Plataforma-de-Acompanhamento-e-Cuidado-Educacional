document.getElementById('enviar').addEventListener('click', () => { //"escuta" o clique do botao e automaticamente executa a funcao
    novo(); // a funcao cria um adm novo (NESSE CASO É UM ADM, poderia ser um usuario novo qualquer)
});

var seletor = document.getElementById('cargo');

seletor.addEventListener('change', function() {
    const div_admin = document.getElementById('div_admin');
    const div_pedagogo = document.getElementById('div_pedagogo');
    const div_saude = document.getElementById('div_saude');
    const div_prof = document.getElementById('div_prof');
    const div_responsavel = document.getElementById('div_responsavel');

    if(div_admin) div_admin.style.display = 'none';
    if(div_pedagogo) div_pedagogo.style.display = 'none';
    if(div_saude) div_saude.style.display = 'none';
    if(div_prof) div_prof.style.display = 'none';
    if(div_responsavel) div_responsavel.style.display = 'none';

    if(this.value === '1' && div_admin){
        div_admin.style.display = 'block';
    }else if(this.value === '2' && div_pedagogo){
        div_pedagogo.style.display = 'block';
    }else if(this.value === '3' && div_saude){
        div_saude.style.display = 'block';
    }else if(this.value === '4' && div_prof){
        div_prof.style.display = 'block';
    }else if(this.value === '5' && div_responsavel){
        div_responsavel.style.display = 'block';
    }
});

async function novo() {
    var nome = document.getElementById('nome').value;
    var email = document.getElementById('email').value;
    var cpf = document.getElementById('cpf').value;
    var senha = document.getElementById('senha').value;
    var cargo = document.getElementById('cargo').value;
    var telefone = document.getElementById('telefone').value;
    
    if (!nome || !email || !cpf || !senha || !telefone || !cargo) {
        alert("Os campos de Nome, Email, CPF, Senha, Telefone e Cargo são obrigatórios.");
        return;
    }

    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('email', email);
    fd.append('cpf', cpf);
    fd.append('senha', senha);
    fd.append('cargo', cargo);
    fd.append('telefone', telefone);

    if(cargo === '1'){
        fd.append('nivel_permissao', document.getElementById('nivel_permissao').value);
        //o adm vem com o nivel de permissao para adm instituicionais, entretanto ele só é linkado com a instituição depois de alguem atribuir ele à ela
    }else if(cargo === '2'){//pedagogo
        var cndb = document.getElementById('cndb').value;
        if (!cndb) {
            alert("O campo CNDB é obrigatório para Pedagogo.");
            return;
        }
        fd.append('cndb', cndb);
        fd.append('instituicao', document.getElementById('instituicao').value);
        fd.append('especializacao', document.getElementById('especializacao').value);
    }else if(cargo === '3'){//profissional da saude
        var crm = document.getElementById('crm').value;
        var crp = document.getElementById('crp').value;
        if (!crm || !crp) {
            alert("Os campos CRM e CRP são obrigatórios para Profissional da Saúde.");
            return;
        }
        fd.append('crm', crm);
        fd.append('crp', crp);

    }else if(cargo === '4'){//professor
        var cndb = document.getElementById('cndb').value;
        if (!cndb) {
            alert("O campo CNDB é obrigatório para Professor.");
            return;
        }
        fd.append('cndb', cndb);
        fd.append('instituicao', document.getElementById('instituicao').value);
        fd.append('materia', document.getElementById('materia').value); 
    }else if(cargo === '5'){//responsavel legal
        fd.append('data_nasc', document.getElementById('data_nasc').value);
    }

    //isso serve para identificar se a transacao deu certo ou nn, pois para enviar os dados de usuario para o banco é necessario uma transacao 
    try {
        const retorno = await fetch('../src/controllers/usuario_cadastro.php',
            {
                method: 'POST',
                body: fd
            }
        );//prepara um retorno padrao para exibir a resposta de sucesso/erro

        const resposta = await retorno.json();
        if(resposta.status == 'ok'){
            alert('Sucesso: ' + resposta.mensagem);
            window.location.href = 'index.html'; // direciona pra home apos criar acc
        }else{
            alert('Erro: ' + resposta.mensagem);
        }
    }catch(erro){
        console.error("Erro na requisição: ", erro);
        alert("Ocorreu um erro ao comunicar com o servidor.")
    }
    
}