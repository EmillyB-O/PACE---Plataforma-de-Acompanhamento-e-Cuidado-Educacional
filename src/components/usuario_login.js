document.getElementById('enviar').addEventListener('click', () => {
    login();
});

async function login(){
    var email = document.getElementById('email').value;
    var senha = document.getElementById('senha').value;

    const fd = new FormData();
    fd.append('email', email);
    fd.append('senha', senha);

    const retorno = await fetch('../../usuario_login.php',
        {
            method: 'POST',
            body: fd
        }
    );

    const resposta = await retorno.json();
    if(resposta.status == 'ok'){
        window.location.href = 'A DEFINIR!!!!'; //pagina que vai ser direcionado dps que fizer login
    }else{
        alert('Credenciais inválidas. Tente novamente');
    }
}