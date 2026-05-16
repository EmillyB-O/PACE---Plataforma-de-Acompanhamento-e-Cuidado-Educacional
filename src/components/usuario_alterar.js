document.addEventListener('DOMContentLoaded', async () => {
    await valida_sessao();
    await carregarInstituicoes();
    
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
        document.getElementById('cargo').value = registro.cargo;
        document.getElementById('telefone').value = registro.telefone;
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
            document.getElementById('crm').value = registro.crm;
            document.getElementById('crp').value = registro.crp;
        } else if (registro.cargo === '4') {
            document.getElementById('materia').value = registro.materia;
        } else if (registro.cargo === '5') {
            document.getElementById('data_nasc').value = registro.data_nasc;
        }

        const evento = new Event("change");
        document.getElementById("cargo").dispatchEvent(evento);

    } else {
        alert('Erro: ' + resposta.mensagem);
        window.location.href = 'painel_admin.html';
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
    const fd = new FormData();
    fd.append('nome', document.getElementById('nome').value.trim());
    fd.append('email', document.getElementById('email').value.trim());
    fd.append('cpf', document.getElementById('cpf').value.trim());
    fd.append('senha', document.getElementById('senha').value.trim());
    fd.append('cargo', document.getElementById('cargo').value);
    fd.append('telefone', document.getElementById('telefone').value.trim());

    const cargo = document.getElementById('cargo').value;
    const id_inst = document.getElementById('id_instituicao').value;

    if (cargo === '1') {
        const n = document.getElementById('nivel_permissao').value;
        fd.append('nivel_permissao', n);
        if (n === '1') fd.append('id_instituicao', id_inst);
    } else if (cargo === '2') {
        fd.append('especializacao', document.getElementById('especializacao').value);
        fd.append('id_instituicao', id_inst);
    } else if (cargo === '3') {
        fd.append('crm', document.getElementById('crm').value);
        fd.append('crp', document.getElementById('crp').value);
    } else if (cargo === '4') {
        fd.append('materia', document.getElementById('materia').value);
        fd.append('id_instituicao', id_inst);
    } else if (cargo === '5') {
        fd.append('data_nasc', document.getElementById('data_nasc').value);
    }

    try {
        const retorno = await fetch('../src/controllers/usuario_alterar.php?id=' + id, { method: 'POST', body: fd });
        const resposta = await retorno.json();
        if (resposta.status == 'ok') {
            alert('Sucesso: ' + resposta.mensagem);
            window.location.href = 'painel_admin.html';
        } else { alert('Erro: ' + resposta.mensagem); }
    } catch (e) { alert("Erro de comunicação."); }
}