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

async function valida_sessao() {
    const retorno = await fetch('../src/config/valida_sessao.php');
    const resposta = await retorno.json();

    if(resposta.status == 'nok'){
        if (!window.location.pathname.endsWith('visitante.html')) {
            window.location.href = 'visitante.html';
        }
    } else {
        let usuario = resposta.data;
        if (Array.isArray(usuario)) {
            usuario = usuario[0];
        }

        const cargo = String(usuario.cargo);
        const nivel_permissao = usuario.nivel_permissao ? String(usuario.nivel_permissao) : null;
        const url = window.location.pathname;

        window.usuarioLogado = usuario;

        // Redirect rules
        if (cargo === '1' && (url.endsWith('index.html') || url.endsWith('/'))) {
            window.location.href = 'painel_admin.html';
            return;
        }

        if (cargo === '3' && (url.endsWith('index.html') || url.endsWith('/') || url.includes('painel_admin') || url.includes('secao_estudante'))) {
            window.location.href = 'painel_profissional.html';
            return;
        }

        if (cargo === '5' && (url.endsWith('index.html') || url.endsWith('/') || url.includes('painel_admin') || url.includes('painel_profissional') || url.includes('aluno.html') || url.includes('turma.html') || url.includes('instituicoes.html'))) {
            window.location.href = 'secao_estudante.html';
            return;
        }

        if (cargo === '1') {
            if (nivel_permissao === '0') {
                if (url.includes('turma') || url.includes('aluno')) {
                    window.location.href = 'painel_admin.html';
                    return;
                }
            } else if (nivel_permissao === '1') {
                if (url.includes('instituicao')) {
                    window.location.href = 'painel_admin.html';
                    return;
                }
            }
        } else if (url.endsWith('painel_admin.html')) {
            window.location.href = 'index.html';
            return;
        }

        // Para professor
        if (cargo === '4') {
            if (
                url.includes('instituicao_cadastrar') ||
                url.includes('instituicao_alterar') ||
                url.includes('turma_cadastrar') ||
                url.includes('turma_alterar') ||
                url.includes('aluno_cadastrar') ||
                url.includes('aluno_alterar')
            ) {
                window.location.href = 'index.html';
                return;
            }
        }

        // Configurar Navbar baseada no Nível
        const configureNavbar = () => {
            const links = document.querySelectorAll('.nav-link');
            links.forEach(link => {
                const text = link.innerText.trim().toLowerCase();
                if (cargo === '1') {
                    if (nivel_permissao === '0') {
                        // Global: Ocultar Turmas e Alunos
                        if (text === 'turmas' || text === 'alunos') {
                            link.parentElement.style.display = 'none';
                        }
                    } else if (nivel_permissao === '1') {
                        // Institucional: Ocultar Instituições
                        // Deve ver: Home, Usuários, Turmas, Alunos
                        if (text.includes('instituição') || text.includes('instituições') || text.includes('instituicao')) {
                            link.parentElement.style.display = 'none';
                        }
                    }
                }
            });

            // Se for Profissional da Saúde (cargo = 3) e estiver em uma página geral
            if (cargo === '3') {
                const urlLower = url.toLowerCase();
                const isProfessionalPage = 
                    urlLower.includes('painel_profissional') || 
                    urlLower.includes('profissional_instituicoes') || 
                    urlLower.includes('profissional_alunos') || 
                    urlLower.includes('profissional_turmas');
                
                if (!isProfessionalPage) {
                    const navContainer = document.querySelector('.navbar-nav');
                    if (navContainer) {
                        const isAlunosActive = urlLower.includes('aluno.html') || urlLower.includes('aluno_detalhes');
                        navContainer.innerHTML = `
                            <li class="nav-item">
                                <a class="nav-link" href="painel_profissional.html">Painel</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="profissional_instituicoes.html">Minhas Instituições</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link ${isAlunosActive ? 'active' : ''}" href="aluno.html">Alunos</a>
                            </li>
                        `;
                    }
                }
            }

        // Mensagem de "Bem-vindo!!!"
            const navRight = document.querySelector('.navbar-nav.ms-auto');
            if (navRight && !document.getElementById('msg-boas-vindas')) {
                const cargoMap = {
                    '1': 'Administrador',
                    '2': 'Pedagogo',
                    '3': 'Profissional da Saúde',
                    '4': 'Professor',
                    '5': 'Responsável Legal'
                };
                const cargoNome = cargoMap[cargo] || 'Usuário';

                const li = document.createElement('li');
                li.id = 'msg-boas-vindas';
                li.className = 'nav-item d-flex align-items-center me-3 text-light';
                li.innerHTML = `<strong>Bem-vindo, ${usuario.nome} (${cargoNome})!</strong>`;
                navRight.insertBefore(li, navRight.firstChild);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener("DOMContentLoaded", () => {
                configureNavbar();
                applyInputGuidelines();
            });
        } else {
            configureNavbar();
            applyInputGuidelines();
        }
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

// Chamar também imediatamente no carregamento do arquivo
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    applyInputGuidelines();
} else {
    document.addEventListener("DOMContentLoaded", applyInputGuidelines);
}

async function logoff() {
    const retorno = await fetch('../src/controllers/usuario_logoff.php');
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        window.location.href = 'login.html';
    }
}