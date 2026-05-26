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
            // Institucional: Cadastra Pedagogo (2) e Professor (4). Oculta Adm (1), Saúde (3) e Responsável (5).
            Array.from(selectCargo.options).forEach(opt => {
                if (opt.value === '1' || opt.value === '3' || opt.value === '5') {
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

    // Listener para o conselho (CRM/CRP) profissional de saúde
    const conselhoSelect = document.getElementById('conselho');
    if (conselhoSelect) {
        conselhoSelect.addEventListener('change', function() {
            const div_crm = document.getElementById('div_crm');
            const div_crp = document.getElementById('div_crp');

            if(div_crm) div_crm.style.display = 'none';
            if(div_crp) div_crp.style.display = 'none';

            if(this.value === 'seletor_crm' && div_crm){
                div_crm.style.display = 'block';
                document.getElementById("crp").value = ""; 
            }else if(this.value === 'seletor_crp' && div_crp){
                div_crp.style.display = 'block';
                document.getElementById("crm").value = "";
            }
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
            if (div_prof) div_prof.style.display = 'none';
            if (div_responsavel) div_responsavel.style.display = 'none';
            if (div_instituicao_comum) div_instituicao_comum.style.display = 'none';

            if (div_saude) {
                div_saude.style.display = 'none';
                const conselhoSelect = document.getElementById('conselho');
                if (conselhoSelect) conselhoSelect.value = '';
                const div_crm = document.getElementById('div_crm');
                const div_crp = document.getElementById('div_crp');
                if (div_crm) div_crm.style.display = 'none';
                if (div_crp) div_crp.style.display = 'none';
            }

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
    setupPasswordStrengthValidation();
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

    if (!validarEmail(email)) {
        alert("O e-mail fornecido é inválido. Por favor, verifique o endereço digitado.");
        return;
    }

    if (!validarCPF(cpf)) {
        alert("O CPF fornecido é inválido. Por favor, verifique o número digitado.");
        return;
    }

    if (!validarTelefone(telefone)) {
        alert("O telefone fornecido é inválido. Por favor, utilize o formato com DDD.");
        return;
    }

    if (!isPasswordStrong(senha)) {
        alert("A senha fornecida não atende aos requisitos de segurança (mínimo de 8 caracteres, contendo letras maiúsculas, minúsculas, números e caracteres especiais).");
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
        const conselho = document.getElementById('conselho').value;
        if (!conselho) {
            alert("A seleção de um conselho (CRM ou CRP) é obrigatória para Profissional da Saúde.");
            return;
        }
        var crm = document.getElementById('crm').value.trim();
        var crp = document.getElementById('crp').value.trim();
        if (conselho === 'seletor_crm') {
            if (!crm) { alert("O preenchimento do campo CRM é obrigatório."); return; }
            if (!validarCRM(crm)) { alert("O formato do CRM é inválido. Utilize o formato: 123456/SP"); return; }
        }
        if (conselho === 'seletor_crp') {
            if (!crp) { alert("O preenchimento do campo CRP é obrigatório."); return; }
            if (!validarCRP(crp)) { alert("O formato do CRP é inválido. Utilize o formato: 06/123456"); return; }
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
            showAlertAndRedirect('Sucesso: ' + resposta.mensagem, 'painel_admin.html');
        } else {
            alert('Erro: ' + resposta.mensagem);
        }
    } catch (erro) {
        console.error("Erro na requisição: ", erro);
        alert("Ocorreu um erro ao comunicar com o servidor.")
    }
}

// Inicializar validação em tempo real da força da senha
function isPasswordStrong(senha) {
    return senha.length >= 8 &&
           /[A-Z]/.test(senha) &&
           /[a-z]/.test(senha) &&
           /[0-9]/.test(senha) &&
           /[^A-Za-z0-9]/.test(senha);
}

function setupPasswordStrengthValidation() {
    const senhaInput = document.getElementById('senha');
    if (!senhaInput) return;

    const reqs = {
        length: { el: document.getElementById('req-length'), test: (val) => val.length >= 8 },
        upper: { el: document.getElementById('req-upper'), test: (val) => /[A-Z]/.test(val) },
        lower: { el: document.getElementById('req-lower'), test: (val) => /[a-z]/.test(val) },
        number: { el: document.getElementById('req-number'), test: (val) => /[0-9]/.test(val) },
        special: { el: document.getElementById('req-special'), test: (val) => /[^A-Za-z0-9]/.test(val) }
    };

    const validate = () => {
        const val = senhaInput.value;
        const isEmpty = val.length === 0;

        for (const key in reqs) {
            const req = reqs[key];
            if (req.el) {
                if (isEmpty) {
                    req.el.classList.remove('valid', 'invalid');
                } else {
                    const isValid = req.test(val);
                    if (isValid) {
                        req.el.classList.remove('invalid');
                        req.el.classList.add('valid');
                    } else {
                        req.el.classList.remove('valid');
                        req.el.classList.add('invalid');
                    }
                }
            }
        }
    };

    senhaInput.addEventListener('input', validate);
    validate();
}