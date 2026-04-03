async function valida_sessao() {
    const retorno = await fetch('../src/config/valida_sessao.php');
    const resposta = await retorno.json();

    if(resposta.status == 'nok'){
        window.location.href = 'login.html'
    } else {
        let usuario = resposta.data;
        if (Array.isArray(usuario)) {
            usuario = usuario[0];
        }

        const cargo = String(usuario.cargo);
        const url = window.location.pathname;

        // se o usuario for administrador, encaminhar da home para o painel
        if (cargo === '1' && (url.endsWith('index.html') || url.endsWith('/'))) {
            window.location.href = 'painel_admin.html';
        }
        
        // protecao caso o usuario nao for adm
        else if (cargo !== '1' && url.endsWith('painel_admin.html')) {
            window.location.href = 'index.html';
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