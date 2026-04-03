document.getElementById('enviar').addEventListener('click', () => {
    login();
});

async function login(){
    var email = document.getElementById('email').value;
    var senha = document.getElementById('senha').value;

    const fd = new FormData();
    fd.append('email', email);
    fd.append('senha', senha);

    const retorno = await fetch('../src/controllers/usuario_login.php',
        {
            method: 'POST',
            body: fd
        }
    );

    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        const usuarioLogado = resposta.data[0];
        if (usuarioLogado.cargo == '1') {
            window.location.href = 'painel_admin.html';
        } else {
            window.location.href = 'index.html'; 
        }
    }else{
        alert(resposta.mensagem || 'Credenciais inválidas. Tente novamente');
    }
}