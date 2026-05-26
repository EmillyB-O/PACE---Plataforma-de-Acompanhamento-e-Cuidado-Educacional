let turmasSelecionadasPrevia = [];

async function carregarTurmas(idInst, selecionadasIds = []) {
    const container = document.getElementById('container_turmas');
    if (!container) return;

    if (!idInst) {
        container.innerHTML = '<span class="text-muted">Selecione uma instituição para carregar as turmas...</span>';
        return;
    }

    try {
        container.innerHTML = '<span class="text-muted">Carregando turmas...</span>';
        const retorno = await fetch('../src/controllers/turma/turma_get.php?id_instituicao=' + idInst);
        const resposta = await retorno.json();

        if (resposta.status === 'ok') {
            const turmas = resposta.data;
            let html = '';
            turmas.forEach(t => {
                const checked = selecionadasIds.includes(Number(t.id)) || selecionadasIds.includes(String(t.id)) ? 'checked' : '';
                html += `
                    <div class="form-check my-2">
                        <input class="form-check-input" type="checkbox" name="turma_opcao" value="${t.id}" id="chk_turma_${t.id}" ${checked}>
                        <label class="form-check-label" for="chk_turma_${t.id}">
                            ${t.nome} (${t.serie}º ano - ${t.ano})
                        </label>
                    </div>
                `;
            });
            container.innerHTML = html || '<span class="text-muted">Nenhuma turma cadastrada nesta instituição.</span>';
        } else {
            container.innerHTML = '<span class="text-muted">Nenhuma turma cadastrada nesta instituição.</span>';
        }
    } catch (e) {
        console.error("Erro ao carregar turmas:", e);
        container.innerHTML = '<span class="text-danger">Erro ao carregar turmas.</span>';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await valida_sessao();
    await carregarInstituicoes();
    
    // Escuta mudança de instituição para atualizar turmas dinamicamente se o cargo for Professor (4)
    const selectInst = document.getElementById('id_instituicao');
    if (selectInst) {
        selectInst.addEventListener('change', function() {
            const cargo = document.getElementById('cargo').value;
            if (cargo === '4') {
                carregarTurmas(this.value, turmasSelecionadasPrevia);
            }
        });
    }
    
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
    setupPasswordStrengthValidation();
});

async function carregarInstituicoes() {
    try {
        const retorno = await fetch('../src/controllers/instituicao/instituicao_get.php');
        const resposta = await retorno.json();
        if (resposta.status === 'ok') {
            renderInstituicoes(resposta.data);
        }
    } catch (e) { console.error(e); }
}

function renderInstituicoes(lista) {
    const select = document.getElementById('id_instituicao');
    if (!select) return;
    let html = '<option value="">Selecione...</option>';
    lista.forEach(inst => {
        html += `<option value="${inst.id}">${inst.nome}</option>`;
    });
    select.innerHTML = html;
}

async function buscar(id) {
    const retorno = await fetch('../src/controllers/usuario_get.php?id=' + id);
    const resposta = await retorno.json();
    if (resposta.status == 'ok') {
        var registro = resposta.data[0];
        document.getElementById('nome').value = registro.nome;
        document.getElementById('email').value = registro.email;
        document.getElementById('cpf').value = registro.cpf;
        document.getElementById('cpf').dispatchEvent(new Event("input"));
        document.getElementById('cargo').value = registro.cargo;
        document.getElementById('telefone').value = registro.telefone;
        document.getElementById('telefone').dispatchEvent(new Event("input"));
        document.getElementById('id').value = id;

        // Pré-seleciona a instituição (primeira da lista por enquanto)
        if (registro.id_instituicao) {
            document.getElementById('id_instituicao').value = registro.id_instituicao;
        }

        if (registro.cargo === '1') {
            document.getElementById('nivel_permissao').value = registro.nivel_permissao;
        } else if (registro.cargo === '2') {
            document.getElementById('especializacao').value = registro.especializacao;
        } else if (registro.cargo === '3') {
            document.getElementById('crm').value = registro.crm || '';
            document.getElementById('crp').value = registro.crp || '';
            
            const wCrm = document.getElementById('wrapper_crm');
            const wCrp = document.getElementById('wrapper_crp');
            if (wCrm) wCrm.style.display = (registro.crm && registro.crm.trim() !== '') ? 'block' : 'none';
            if (wCrp) wCrp.style.display = (registro.crp && registro.crp.trim() !== '') ? 'block' : 'none';
        } else if (registro.cargo === '4') {
            document.getElementById('materia').value = registro.materia;
            turmasSelecionadasPrevia = registro.turmas ? registro.turmas.map(t => Number(t.id)) : [];
            if (registro.id_instituicao) {
                await carregarTurmas(registro.id_instituicao, turmasSelecionadasPrevia);
            }
        } else if (registro.cargo === '5') {
            document.getElementById('data_nasc').value = registro.data_nasc;
        }

        const evento = new Event("change");
        document.getElementById("cargo").dispatchEvent(evento);

    } else {
        showAlertAndRedirect('Erro: ' + resposta.mensagem, 'painel_admin.html');
    }
}

document.getElementById('enviar').addEventListener('click', () => { alterar(); });

const selectCargo = document.getElementById('cargo');
if (selectCargo) {
    selectCargo.addEventListener('change', function () {
        const divs = ['div_admin', 'div_pedagogo', 'div_saude', 'div_prof', 'div_responsavel', 'div_instituicao_comum'];
        divs.forEach(d => { if (document.getElementById(d)) document.getElementById(d).style.display = 'none'; });

        const val = this.value;
        const selectNivel = document.getElementById('nivel_permissao');

        if (val === '1') {
            document.getElementById('div_admin').style.display = 'block';
            if (selectNivel && selectNivel.value === '1') document.getElementById('div_instituicao_comum').style.display = 'block';
        } else if (val === '2') {
            document.getElementById('div_pedagogo').style.display = 'block';
            document.getElementById('div_instituicao_comum').style.display = 'block';
        } else if (val === '3') {
            document.getElementById('div_saude').style.display = 'block';
        } else if (val === '4') {
            document.getElementById('div_prof').style.display = 'block';
            document.getElementById('div_instituicao_comum').style.display = 'block';
        } else if (val === '5') {
            document.getElementById('div_responsavel').style.display = 'block';
        }
    });
}

// Listener para nível de permissão
const nivelInput = document.getElementById('nivel_permissao');
if (nivelInput) {
    nivelInput.addEventListener('change', () => {
        const selectCargo = document.getElementById('cargo');
        if (selectCargo && selectCargo.value === '1') {
            document.getElementById('div_instituicao_comum').style.display = (nivelInput.value === '1' ? 'block' : 'none');
        }
    });
}

async function alterar() {
    const id = document.getElementById('id').value;
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('senha').value.trim();

    if (!validarEmail(email)) {
        alert("O e-mail fornecido é inválido. Por favor, verifique o endereço digitado.");
        return;
    }

    if (!validarTelefone(telefone)) {
        alert("O telefone fornecido é inválido. Por favor, utilize o formato com DDD.");
        return;
    }

    if (senha.length > 0 && !isPasswordStrong(senha)) {
        alert("A nova senha fornecida não atende aos requisitos de segurança (mínimo de 8 caracteres, contendo letras maiúsculas, minúsculas, números e caracteres especiais).");
        return;
    }

    const fd = new FormData();
    fd.append('nome', document.getElementById('nome').value.trim());
    fd.append('email', email);
    fd.append('cpf', document.getElementById('cpf').value.replace(/\D/g, ''));
    fd.append('senha', senha);
    fd.append('cargo', document.getElementById('cargo').value);
    fd.append('telefone', telefone.replace(/\D/g, ''));

    const cargo = document.getElementById('cargo').value;
    const id_inst = document.getElementById('id_instituicao').value;

    if (cargo === '1') {
        const n = document.getElementById('nivel_permissao').value;
        fd.append('nivel_permissao', n);
        if (n === '1') fd.append('id_instituicao', id_inst);
    } else if (cargo === '2') {
        fd.append('especializacao', document.getElementById('especializacao').value);
        fd.append('id_instituicao', id_inst);
    } else if (cargo === '3') {//profissional da saude
        var crm = document.getElementById('crm').value.trim();
        var crp = document.getElementById('crp').value.trim();
        if (!crm && !crp) {
            alert("Pelo menos um dos campos (CRM ou CRP) deve ser preenchido para Profissional da Saúde.");
            return;
        }

        fd.append('crm', crm);
        fd.append('crp', crp);

    } else if (cargo === '4') {//professor
        fd.append('materia', document.getElementById('materia').value);
        fd.append('id_instituicao', id_inst);
        
        const checkboxes = document.querySelectorAll('input[name="turma_opcao"]:checked');
        checkboxes.forEach(cb => {
            fd.append('turmas[]', cb.value);
        });
    } else if (cargo === '5') {
        fd.append('data_nasc', document.getElementById('data_nasc').value);
    }

    try {
        const retorno = await fetch('../src/controllers/usuario_alterar.php?id=' + id, { method: 'POST', body: fd });
        const resposta = await retorno.json();
        if (resposta.status == 'ok') {
            showAlertAndRedirect('Sucesso: ' + resposta.mensagem, 'painel_admin.html');
        } else { alert('Erro: ' + resposta.mensagem); }
    } catch (e) { alert("Erro de comunicação."); }
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
    const requirementsContainer = document.getElementById('password-requirements');
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