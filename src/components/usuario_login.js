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
        } else if (usuarioLogado.cargo == '3') {
            window.location.href = 'painel_profissional.html';
        } else if (usuarioLogado.cargo == '5') {
            window.location.href = 'secao_estudante.html';
        } else {
            window.location.href = 'index.html'; 
        }
    } else {
        alert(resposta.mensagem || 'Erro ao realizar login.');
    }
};