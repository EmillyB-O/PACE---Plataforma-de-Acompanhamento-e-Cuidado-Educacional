document.addEventListener('DOMContentLoaded', async () => {
    await valida_sessao();
    await carregarInstituicoes();

    const userLogado = window.usuarioLogado;
    const selectCargo = document.getElementById('cargo');
    const divAdminGroup = document.getElementById('div_admin');
    const divNivel = document.getElementById('nivel_permissao');
    
    if (userLogado && userLogado.cargo == '1' && selectCargo) {
        if (userLogado.nivel_permissao == '0') {
            // Global: Só cadastra ADM (Nivel 1 Institucional)
            Array.from(selectCargo.options).forEach(opt => {
                if (opt.value && opt.value !== '1') {
                    opt.style.display = 'none';
                    opt.disabled = true;
                }
            });
            if (divNivel) {
                divNivel.value = '1';
                divNivel.disabled = true;
            }
        } else if (userLogado.nivel_permissao == '1') {
            // Institucional: Cadastra todo mundo MENOS ADM
            Array.from(selectCargo.options).forEach(opt => {
                if (opt.value === '1') {
                    opt.style.display = 'none';
                    opt.disabled = true;
                }
            });
            if (divAdminGroup) {
                divAdminGroup.style.display = 'none';
            }
        }
    }

    // Limpeza inputs numéricos
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
        });
    }

    const telInput = document.getElementById('telefone');
    if (telInput) {
        telInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
        });
    }

    // Listener para o botão enviar
    const enviarBtn = document.getElementById('enviar');
    if (enviarBtn) {
        enviarBtn.addEventListener('click', () => {
            novo();
        });
    }

    // Listener para o seletor de cargo
    if (selectCargo) {
        selectCargo.addEventListener('change', function () {
            const div_admin = document.getElementById('div_admin');
            const div_pedagogo = document.getElementById('div_pedagogo');
            const div_saude = document.getElementById('div_saude');
            const div_prof = document.getElementById('div_prof');
            const div_responsavel = document.getElementById('div_responsavel');
            const div_instituicao_comum = document.getElementById('div_instituicao_comum');
            const selectNivel = document.getElementById('nivel_permissao');

            if (div_admin) div_admin.style.display = 'none';
            if (div_pedagogo) div_pedagogo.style.display = 'none';
            if (div_saude) div_saude.style.display = 'none';
            if (div_prof) div_prof.style.display = 'none';
            if (div_responsavel) div_responsavel.style.display = 'none';
            if (div_instituicao_comum) div_instituicao_comum.style.display = 'none';

            // Regra de visibilidade da Instituição
            // Cargos 2 (Pedagogo), 4 (Professor) e 1 (Adm) se o nível for 1 (Institucional)
            if (this.value === '1' && div_admin) {
                div_admin.style.display = 'block';
                // Mostra instituição se nível for 1
                if (selectNivel && selectNivel.value === '1') {
                    if (div_instituicao_comum) div_instituicao_comum.style.display = 'block';
                }
            } else if (this.value === '2' && div_pedagogo) {
                div_pedagogo.style.display = 'block';
                if (div_instituicao_comum) div_instituicao_comum.style.display = 'block';
            } else if (this.value === '3' && div_saude) {
                div_saude.style.display = 'block';
            } else if (this.value === '4' && div_prof) {
                div_prof.style.display = 'block';
                if (div_instituicao_comum) div_instituicao_comum.style.display = 'block';
            } else if (this.value === '5' && div_responsavel) {
                div_responsavel.style.display = 'block';
            }
        });
    }

    // Listener para o nível de permissão (para mostrar instituição se mudar para 1)
    const nivelInput = document.getElementById('nivel_permissao');
    if (nivelInput) {
        nivelInput.addEventListener('change', () => {
            const selectCargo = document.getElementById('cargo');
            const div_instituicao_comum = document.getElementById('div_instituicao_comum');
            if (selectCargo && selectCargo.value === '1') {
                if (nivelInput.value === '1') {
                    if (div_instituicao_comum) div_instituicao_comum.style.display = 'block';
                } else {
                    if (div_instituicao_comum) div_instituicao_comum.style.display = 'none';
                }
            }
        });
    }
});

async function carregarInstituicoes() {
    try {
        const retorno = await fetch('../src/controllers/instituicao/instituicao_get.php');
        const resposta = await retorno.json();
        if (resposta.status === 'ok') {
            renderInstituicoes(resposta.data);
        }
    } catch (e) {
        console.error("Erro ao carregar instituições:", e);
    }
}

function renderInstituicoes(lista) {
    const select = document.getElementById('id_instituicao');
    if (!select) return;
    let html = '<option value="">Selecione...</option>';
    lista.forEach(inst => {
        html += `<option value="${inst.id}">${inst.nome}</option>`;
    });
    select.innerHTML = html;

    // Se o usuário logado for Adm Institucional, pré-seleciona a instituição dele
    const userLogado = window.usuarioLogado;
    if (userLogado && userLogado.nivel_permissao == '1' && userLogado.id_instituicao) {
        select.value = userLogado.id_instituicao;
        select.disabled = true; // Impede que ele cadastre em outra instituição
    }
}

async function novo() {
    var nome = document.getElementById('nome').value.trim();
    var email = document.getElementById('email').value.trim();
    var cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    var senha = document.getElementById('senha').value.trim();
    var cargo = document.getElementById('cargo').value.trim();
    var telefone = document.getElementById('telefone').value.replace(/\D/g, '');

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

    const id_instituicao = document.getElementById('id_instituicao').value;

    if (cargo === '1') {
        const nivel = document.getElementById('nivel_permissao').value;
        fd.append('nivel_permissao', nivel);
        if (nivel === '1') {
            if (!id_instituicao) { alert("A instituição é obrigatória para Admin Institucional."); return; }
            fd.append('id_instituicao', id_instituicao);
        }
    } else if (cargo === '2') { // pedagogo
        if (!id_instituicao) { alert("A instituição é obrigatória para Pedagogo."); return; }
        fd.append('id_instituicao', id_instituicao);
        fd.append('especializacao', document.getElementById('especializacao').value);
    } else if (cargo === '3') { // profissional da saude
        var crm = document.getElementById('crm').value.trim();
        var crp = document.getElementById('crp').value.trim();
        if (!crm && !crp) {
            alert("Pelo menos um dos campos (CRM ou CRP) deve ser preenchido para Profissional da Saúde.");
            return;
        }
        fd.append('crm', crm);
        fd.append('crp', crp);
    } else if (cargo === '4') { // professor
        if (!id_instituicao) { alert("A instituição é obrigatória para Professor."); return; }
        fd.append('id_instituicao', id_instituicao);
        fd.append('materia', document.getElementById('materia').value);
    } else if (cargo === '5') { // responsavel legal
        fd.append('data_nasc', document.getElementById('data_nasc').value);
    }

    try {
        const retorno = await fetch('../src/controllers/usuario_cadastro.php', {
            method: 'POST',
            body: fd
        });

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