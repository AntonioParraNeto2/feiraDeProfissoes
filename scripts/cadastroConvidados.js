import Pessoas from '../obj/pessoa.js';

var btnFazerPedido = document.querySelector("#btnFazerPedido");
const alertContainer = document.querySelector("#alert-container");
const audioPedido = new Audio('./midia/cute-01.ogg');

btnFazerPedido.addEventListener("click", function () {
    fazerPedido()
});

async function fazerPedido() {
    let nome = document.querySelector("#nome").value;
    let empresa = document.querySelector("#email").value;

    let pessoa = new Pessoas(nome, '', empresa);
    await pessoa.salvar();
    await pessoa.fazer_pedido();

    const modalElement = document.getElementById('modalFazerPedido');
    const modal = bootstrap.Modal.getInstance(modalElement) || bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide();
    tocarSomPedido();
    document.querySelector("#nome").value = '';
    document.querySelector("#email").value = '';
    mostrarAlertaSucesso('Pedido realizado com sucesso.');
}

function tocarSomPedido() {
    audioPedido.currentTime = 0;
    audioPedido.play().catch(() => {});
}

function mostrarAlertaSucesso(mensagem) {
    alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show mt-3" role="alert">
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    setTimeout(() => {
        const alertElement = alertContainer.querySelector('.alert');
        if (!alertElement) return;

        const alertInstance = bootstrap.Alert.getOrCreateInstance(alertElement);
        alertInstance.close();
    }, 4000);
}

