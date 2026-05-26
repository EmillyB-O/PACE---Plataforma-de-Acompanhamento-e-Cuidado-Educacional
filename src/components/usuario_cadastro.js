// Carregar SweetAlert2 dinamicamente e sobrescrever window.alert com fila resiliente
(function() {
    let alertQueue = [];
    let swalLoaded = false;

    window.alert = (message) => {
        if (swalLoaded) {
            triggerSwalAlert(message);
        } else {
            alertQueue.push(message);
        }
    };

    window.showAlertAndRedirect = (message, url) => {
        if (swalLoaded) {
            triggerSwalRedirect(message, url);
        } else {
            alertQueue.push({ message, url });
        }
    };

    if (!document.getElementById('sweetalert-js')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/sweetalert2@11.10.8/dist/sweetalert2.min.css';
        link.id = 'sweetalert-css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11.10.8/dist/sweetalert2.all.min.js';
        script.id = 'sweetalert-js';
        document.head.appendChild(script);

        script.onload = () => {
            swalLoaded = true;
            alertQueue.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    triggerSwalRedirect(item.message, item.url);
                } else {
                    triggerSwalAlert(item);
                }
            });
            alertQueue = [];
        };
    }

    function triggerSwalAlert(message) {
        let icon = 'info';
        let title = 'Aviso';
        const lower = String(message).toLowerCase();
        
        if (lower.includes('erro') || lower.includes('não foi') || lower.includes('negado') || lower.includes('obrigatório') || lower.includes('inválido') || lower.includes('falhou')) {
            icon = 'error';
            title = 'Erro';
        } else if (lower.includes('sucesso') || lower.includes('salvo') || lower.includes('ativado') || lower.includes('cadastrado') || lower.includes('criado') || lower.includes('excluído') || lower.includes('vinculado') || lower.includes('aprovado') || lower.includes('recusado')) {
            icon = 'success';
            title = 'Sucesso';
        } else if (lower.includes('atenção') || lower.includes('cuidado') || lower.includes('aviso') || lower.includes('certeza')) {
            icon = 'warning';
            title = 'Atenção';
        }
        
        Swal.fire({
            title: title,
            text: message,
            icon: icon,
            confirmButtonColor: '#004e7a',
            confirmButtonText: 'OK'
        });
    }

    function triggerSwalRedirect(message, url) {
        let icon = 'info';
        let title = 'Aviso';
        const lower = String(message).toLowerCase();
        
        if (lower.includes('erro') || lower.includes('não foi') || lower.includes('negado') || lower.includes('obrigatório') || lower.includes('inválido') || lower.includes('falhou')) {
            icon = 'error';
            title = 'Erro';
        } else if (lower.includes('sucesso') || lower.includes('salvo') || lower.includes('ativado') || lower.includes('cadastrado') || lower.includes('criado') || lower.includes('excluído') || lower.includes('vinculado') || lower.includes('aprovado') || lower.includes('recusado')) {
            icon = 'success';
            title = 'Sucesso';
        } else if (lower.includes('atenção') || lower.includes('cuidado') || lower.includes('aviso') || lower.includes('certeza')) {
            icon = 'warning';
            title = 'Atenção';
        }
        
        Swal.fire({
            title: title,
            text: message,
            icon: icon,
            confirmButtonColor: '#004e7a',
            confirmButtonText: 'OK'
        }).then(() => {
            if (url === 'reload') {
                window.location.reload();
            } else if (url) {
                window.location.href = url;
            }
        });
    }
})();

document.getElementById('enviar').addEventListener('click', () => {
    novo(); // a funcao cria um adm novo (NESSE CASO É UM ADM, poderia ser um usuario novo qualquer)
});

var seletor = document.getElementById('cargo');
var saude = document.getElementById('conselho'); // select com opção de crm ou crp

saude.addEventListener('change', function() {
    const div_crm = document.getElementById('div_crm');
    const div_crp = document.getElementById('div_crp');

    if(div_crm) div_crm.style.display = 'none'; // para grantir que existe essa div está oculta
    if(div_crp) div_crp.style.display = 'none';

    if(this.value === 'seletor_crm' && div_crm){
        div_crm.style.display = 'block';
        document.getElementById("crp").value = ""; // limpa o campo crm 

    }else if(this.value === 'seletor_crp' && div_crp){
        div_crp.style.display = 'block';
        document.getElementById("crm").value = "";
    }
});

let instituicoesCarregadas = false;

async function carregarInstituicoes() {
    if (instituicoesCarregadas) return;
    try {
        const response = await fetch('../src/controllers/instituicao/instituicao_get.php');
        const result = await response.json();
        if (result.status === 'ok') {
            const select = document.getElementById('instituicao');
            let html = '<option value="">Selecione uma instituição de vínculo...</option>';
            result.data.forEach(inst => {
                html += `<option value="${inst.id}">${inst.nome}</option>`;
            });
            select.innerHTML = html;
            instituicoesCarregadas = true;
        }
    } catch (e) {
        console.error("Erro ao carregar instituições:", e);
    }
}

seletor.addEventListener('change', function() {
    const div_admin = document.getElementById('div_admin');
    const div_pedagogo = document.getElementById('div_pedagogo');
    const div_saude = document.getElementById('div_saude');
    const div_prof = document.getElementById('div_prof');
    const div_responsavel = document.getElementById('div_responsavel');
    const div_instituicao_cadastro = document.getElementById('div_instituicao_cadastro');

    if(div_admin) div_admin.style.display = 'none';
    if(div_pedagogo) div_pedagogo.style.display = 'none';
    if(div_saude) div_saude.style.display = 'none';
    if(div_prof) div_prof.style.display = 'none';
    if(div_responsavel) div_responsavel.style.display = 'none';
    if(div_instituicao_cadastro) div_instituicao_cadastro.style.display = 'none';

    if(this.value === '1' && div_admin){
        div_admin.style.display = 'block';
    }else if(this.value === '2' && div_pedagogo){
        div_pedagogo.style.display = 'block';
    }else if(this.value === '3' && div_saude){
        div_saude.style.display = 'block';
        if(div_instituicao_cadastro) div_instituicao_cadastro.style.display = 'block';
        carregarInstituicoes();
    }else if(this.value === '4' && div_prof){
        div_prof.style.display = 'block';
    }else if(this.value === '5' && div_responsavel){
        div_responsavel.style.display = 'block';
        if(div_instituicao_cadastro) div_instituicao_cadastro.style.display = 'block';
        carregarInstituicoes();
    }
});

async function novo() {
    var nome = document.getElementById('nome').value.trim();
    var email = document.getElementById('email').value.trim();
    var cpf = document.getElementById('cpf').value.trim();
    var senha = document.getElementById('senha').value.trim();
    var cargo = document.getElementById('cargo').value.trim();
    var telefone = document.getElementById('telefone').value.trim();
    
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
    fd.append('cpf', cpf.replace(/\D/g, ''));
    fd.append('senha', senha);
    fd.append('cargo', cargo);
    fd.append('telefone', telefone.replace(/\D/g, ''));

    if(cargo === '1'){
        fd.append('nivel_permissao', document.getElementById('nivel_permissao').value);
        //o adm vem com o nivel de permissao para adm instituicionais, entretanto ele só é linkado com a instituição depois de alguem atribuir ele à ela
    }else if(cargo === '2'){//pedagogo
        fd.append('instituicao', document.getElementById('instituicao').value);
        fd.append('especializacao', document.getElementById('especializacao').value);

    }else if(cargo === '3'){//profissional da saude
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
        const id_instituicao = document.getElementById('instituicao').value;
        if (!id_instituicao) {
            alert("A escolha de uma instituição de vínculo é obrigatória.");
            return;
        }
        fd.append('id_instituicao', id_instituicao);
        fd.append('crm', crm);
        fd.append('crp', crp);

    }else if(cargo === '4'){//professor
        fd.append('instituicao', document.getElementById('instituicao').value);
        fd.append('materia', document.getElementById('materia').value); 
    }else if(cargo === '5'){//responsavel legal
        const id_instituicao = document.getElementById('instituicao').value;
        if (!id_instituicao) {
            alert("A escolha de uma instituição de vínculo é obrigatória.");
            return;
        }
        fd.append('id_instituicao', id_instituicao);
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
            showAlertAndRedirect('Sucesso: ' + resposta.mensagem, 'index.html');
        }else{
            alert('Erro: ' + resposta.mensagem);
        }
    }catch(erro){
        console.error("Erro na requisição: ", erro);
        alert("Ocorreu um erro ao comunicar com o servidor.")
    }
    
}

function applyInputGuidelines() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        const id = input.id ? input.id.toLowerCase() : '';
        const name = input.name ? input.name.toLowerCase() : '';
        
        // Define quais campos são obrigatórios no sistema
        const isMandatory = 
            id === 'nome' || 
            id === 'email' || 
            id === 'cpf' || 
            id === 'senha' || 
            id === 'telefone' || 
            id === 'cargo' ||
            id === 'id_instituicao' ||
            id === 'instituicao' ||
            id === 'id_turma' ||
            id === 'materia' ||
            id === 'especializacao' ||
            id === 'nivel_permissao' ||
            input.hasAttribute('required');
            
        if (isMandatory) {
            input.setAttribute('required', 'true');
            
            // Procura o label correspondente
            let label = document.querySelector(`label[for="${input.id}"]`);
            if (!label) {
                const prev = input.previousElementSibling;
                if (prev && prev.tagName === 'LABEL') {
                    label = prev;
                }
            }
            
            if (label && !label.innerHTML.includes('*')) {
                label.innerHTML += ' <span style="color: #dc3545;" title="Campo obrigatório">*</span>';
            }
        }

        if (input.type === 'hidden' || input.type === 'button' || input.type === 'submit' || input.type === 'checkbox' || input.type === 'radio') return;

        // Aplica as máscaras de forma prioritária e independente de placeholders
        if (id.includes('cpf') || name.includes('cpf')) {
            input.setAttribute('maxlength', '14');
            input.removeEventListener('input', handleCPFInput);
            input.addEventListener('input', handleCPFInput);
        }
        else if (id.includes('tel') || name.includes('tel') || input.type === 'tel') {
            input.setAttribute('maxlength', '15');
            input.removeEventListener('input', handlePhoneInput);
            input.addEventListener('input', handlePhoneInput);
        }

        const placeholder = input.getAttribute('placeholder');
        if (placeholder && placeholder.trim() !== '') return;

        if (id.includes('nome') || name.includes('nome')) {
            if (id.includes('aluno') || name.includes('aluno')) {
                input.setAttribute('placeholder', 'Ex: Nome Completo do Estudante');
            } else {
                input.setAttribute('placeholder', 'Ex: João Silva de Souza');
            }
        }
        else if (id.includes('email') || name.includes('email') || input.type === 'email') {
            input.setAttribute('placeholder', 'Ex: seu.email@exemplo.com');
        }
        else if (id.includes('cpf') || name.includes('cpf')) {
            input.setAttribute('placeholder', 'Ex: 000.000.000-00');
        }
        else if (id.includes('senha') || name.includes('senha') || input.type === 'password') {
            input.setAttribute('placeholder', 'Digite uma senha segura');
        }
        else if (id.includes('tel') || name.includes('tel') || input.type === 'tel') {
            input.setAttribute('placeholder', 'Ex: (11) 99999-9999');
        }
        else if (id.includes('crm')) {
            input.setAttribute('placeholder', 'Ex: 123456/SP');
        }
        else if (id.includes('crp')) {
            input.setAttribute('placeholder', 'Ex: 06/123456');
        }
        else if (id.includes('especializacao') || name.includes('especializacao')) {
            input.setAttribute('placeholder', 'Ex: Psicopedagogia');
        }
        else if (id.includes('materia') || name.includes('materia')) {
            input.setAttribute('placeholder', 'Ex: Matemática, Português');
        }
        else if (id.includes('serie') || name.includes('serie')) {
            input.setAttribute('placeholder', 'Ex: 5 (5º ano)');
        }
        else if (id.includes('matricula') || name.includes('matricula')) {
            input.setAttribute('placeholder', 'Ex: 2026123456');
        }
        else if (id.includes('nivel') || name.includes('nivel')) {
            input.setAttribute('placeholder', '0 para Global ou 1 para Institucional');
        }
    });
}

function handlePhoneInput(e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,4})$/, "($1) $2");
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)$/, "($1");
    }
    e.target.value = value;
}

function handleCPFInput(e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3");
    } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d{0,3})$/, "$1.$2");
    }
    e.target.value = value;
}

// Chamar imediatamente
applyInputGuidelines();

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

setupPasswordStrengthValidation();