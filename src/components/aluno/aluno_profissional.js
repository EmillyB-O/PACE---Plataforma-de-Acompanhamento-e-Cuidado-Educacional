document.addEventListener("DOMContentLoaded", () => {
    const checkUsuario = setInterval(() => {
        if(window.usuarioLogado !== undefined){
            clearInterval(checkUsuario);

        //Verificar quem está logando para abrir div de profissional da saúde (caso seja ele).
            if(window.usuarioLogado && window.usuarioLogado.cargo === '3'){
                const areaProfissional = document.getElementById('area-profissional-saude');
                if(areaProfissional){
                areaProfissional.style.display = 'block';
                }
            }
        }
    }, 100);
});