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

        // Exibir e esconder itens com base no Nível
        const hideTabs = () => {
            const links = document.querySelectorAll('.nav-link');
            links.forEach(link => {
                const text = link.innerText.trim();
                if (cargo === '1') {
                    if (nivel_permissao === '0') {
                        if (text === 'Turmas' || text === 'Alunos') link.parentElement.style.display = 'none';
                    } else if (nivel_permissao === '1') {
                        if (text === 'Instituições') link.parentElement.style.display = 'none';
                    }
                }
            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener("DOMContentLoaded", hideTabs);
        } else {
            hideTabs();
        }
    }
}

async function logoff() {
    const retorno = await fetch('../src/controllers/usuario_logoff.php');
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        window.location.href = 'login.html';
    }
}