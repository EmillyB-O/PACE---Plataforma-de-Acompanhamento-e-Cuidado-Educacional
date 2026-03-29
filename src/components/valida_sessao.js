async function valida_sessao() {
    const retorno = await fetch('../src/config/valida_sessao.php');
    const resposta = await retorno.json();

    if(resposta.status == 'nok'){
        window.location.href = 'login.html'
    }
}

async function logoff() {
    const retorno = await fetch('../src/controllers/usuario_logoff.php');
    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        window.location.href = 'login.html';
    }
}