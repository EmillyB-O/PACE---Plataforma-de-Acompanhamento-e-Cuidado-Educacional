document.addEventListener('DOMContentLoaded', async () => {
    await valida_sessao();
    const url = new URLSearchParams(window.location.search);
    const id = url.get('id');
    await buscar(id);

    const userLogado = window.usuarioLogado;
    const selectCargo = document.getElementById('cargo');
    const divNivel = document.getElementById('nivel_permissao');
    if (userLogado && userLogado.cargo == '1' && selectCargo) {
        if (userLogado.nivel_permissao == '0') {
            Array.from(selectCargo.options).forEach(opt => {
                if (opt.value && opt.value !== '1') {
                    opt.style.display = 'none';
                    opt.disabled = true;
                }
            });
            if (divNivel) divNivel.disabled = true;
        } else if (userLogado.nivel_permissao == '1') {
            Array.from(selectCargo.options).forEach(opt => {
                if (opt.value === '1') {
                    opt.style.display = 'none';
                    opt.disabled = true;
                }
            });
        }
    }
});

async function buscar(id) {
    const retorno = await fetch('../src/controllers/usuario_get.php?id=' + id);
    const resposta = await retorno.json();
    if (resposta.status == 'ok') {
        alert('Sucesso: ' + resposta.mensagem);
        var registro = resposta.data[0];
        document.getElementById('nome').value = registro.nome;
        document.getElementById('email').value = registro.email;
        document.getElementById('cpf').value = registro.cpf;
        document.getElementById('senha').value = registro.senha;
        document.getElementById('cargo').value = registro.cargo;
        document.getElementById('telefone').value = registro.telefone;
        document.getElementById('id').value = id;

        if (registro.cargo === '1') {//adm
            document.getElementById('nivel_permissao').value = registro.nivel_permissao;
            if (registro.admin_instituicao) {
                document.getElementById('instituicao_admin').value = registro.admin_instituicao;
            }

        } else if (registro.cargo === '2') { //pedagogo
            document.getElementById('cndb').value = registro.cndb;
            document.getElementById('instituicao').value = registro.instituicao;
            document.getElementById('especializacao').value = registro.especializacao;

        } else if (registro.cargo === '3') { //profissional de saude
            document.getElementById('crm').value = registro.crm;
            document.getElementById('crp').value = registro.crp;

        } else if (registro.cargo === '4') { //professor
            document.getElementById('cndb').value = registro.prof_cndb;
            document.getElementById('instituicao').value = registro.prof_instituicao;
            document.getElementById('materia').value = registro.materia;

        } else if (registro.cargo === '5') { //responsavel legal
            document.getElementById('data_nasc').value = registro.data_nasc;
        }

        // Simular o onchange do seletor para organizar as div corretamente
        const evento = new Event("change");
        document.getElementById("cargo").dispatchEvent(evento);

    } else {
        alert('Erro: ' + resposta.mensagem);
        window.location.href = 'painel_admin.html';
    }
}

document.getElementById('enviar').addEventListener('click', () => {
    alterar();
});

var seletor = document.getElementById('cargo');
if (seletor) {
    seletor.addEventListener('change', function () {
        const div_admin = document.getElementById('div_admin');
        const div_pedagogo = document.getElementById('div_pedagogo');
        const div_saude = document.getElementById('div_saude');
        const div_prof = document.getElementById('div_prof');
        const div_responsavel = document.getElementById('div_responsavel');

        if (div_admin) div_admin.style.display = 'none';
        if (div_pedagogo) div_pedagogo.style.display = 'none';
        if (div_saude) div_saude.style.display = 'none';
        if (div_prof) div_prof.style.display = 'none';
        if (div_responsavel) div_responsavel.style.display = 'none';

        if (this.value === '1' && div_admin) {
            div_admin.style.display = 'block';
        } else if (this.value === '2' && div_pedagogo) {
            div_pedagogo.style.display = 'block';
        } else if (this.value === '3' && div_saude) {
            div_saude.style.display = 'block';
        } else if (this.value === '4' && div_prof) {
            div_prof.style.display = 'block';
        } else if (this.value === '5' && div_responsavel) {
            div_responsavel.style.display = 'block';
        }
    });
}

async function alterar() {
    var nome = document.getElementById('nome').value;
    var email = document.getElementById('email').value;
    var cpf = document.getElementById('cpf').value;
    var senha = document.getElementById('senha').value;
    var cargo = document.getElementById('cargo').value;
    var telefone = document.getElementById('telefone').value;
    const id = document.getElementById('id').value;

    if (!nome || !email || !cpf || !senha || !telefone || !cargo) {
        alert("Os campos de Nome, Email, CPF, Senha, Telefone e Cargo são obrigatórios.");
        return;
    }

    //pega os valores do front e prepara para enviar pro back

    const fd = new FormData(); //faz isso com formdata
    fd.append('nome', nome);
    fd.append('email', email);
    fd.append('cpf', cpf);
    fd.append('senha', senha);
    fd.append('cargo', cargo);
    fd.append('telefone', telefone);

    //serve para dar append somente nos itens que pertencem ao determinado cargo do usuario
    if (cargo === '1') {//adm
        fd.append('nivel_permissao', document.getElementById('nivel_permissao').value);
        fd.append('instituicao_admin', document.getElementById('instituicao_admin').value);
    } else if (cargo === '2') {//pedagogo
        var cndb = document.getElementById('cndb').value;
        if (!cndb) {
            alert("O campo CNDB é obrigatório para Pedagogo.");
            return;
        }
        fd.append('cndb', cndb);
        fd.append('instituicao', document.getElementById('instituicao').value);
        fd.append('especializacao', document.getElementById('especializacao').value);
    } else if (cargo === '3') {//profissional da saude
        var crm = document.getElementById('crm').value;
        var crp = document.getElementById('crp').value;
        if (!crm || !crp) {
            alert("Os campos CRM e CRP são obrigatórios para Profissional da Saúde.");
            return;
        }
        fd.append('crm', crm);
        fd.append('crp', crp);

    } else if (cargo === '4') {//professor
        var cndb = document.getElementById('cndb').value;
        if (!cndb) {
            alert("O campo CNDB é obrigatório para Professor.");
            return;
        }
        fd.append('cndb', cndb);
        fd.append('instituicao', document.getElementById('instituicao').value);
        fd.append('materia', document.getElementById('materia').value);
    } else if (cargo === '5') {//responsavel legal
        fd.append('data_nasc', document.getElementById('data_nasc').value);
    }

    try {
        const retorno = await fetch('../src/controllers/usuario_alterar.php?id=' + id,
            {
                method: 'POST',
                body: fd
            }
        );//prepara um retorno padrao para exibir a resposta de sucesso/erro

        const resposta = await retorno.json();
        if (resposta.status == 'ok') {
            alert('Sucesso: ' + resposta.mensagem);
            window.location.href = 'painel_admin.html';
        } else {
            alert('Erro: ' + resposta.mensagem);
        }
    } catch (erro) {
        console.error("Erro na requisição: ", erro);
        alert("Ocorreu um erro ao comunicar com o servidor.")
    }
}