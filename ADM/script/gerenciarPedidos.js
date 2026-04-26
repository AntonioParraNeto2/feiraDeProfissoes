import Pedidos from '../../obj/pedidos.js';

const API = 'https://cdavelino-915a7-default-rtdb.firebaseio.com/'
const pedidosContainer = document.getElementById('pedidos-container');

pedidosContainer.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action="retirar"]');
    if (!button) return;

    const { key } = button.dataset;
    await atualizarStatus(key, 'Retirado');
});

mostrarPedidos()
function mostrarPedidos() {
    fetch(`${API}pedidos.json`)
        .then(response => response.json())
        .then(data => {
            pedidosContainer.innerHTML = ''; // Limpa o container antes de adicionar os pedidos
            for (const key in data) {
                if (data[key].status === undefined) {
                    data[key].status = 'Aguardando retirada';
                }
                const pedido = data[key];
                const pedidoElement = document.createElement('tr');
                if (pedido.status === 'Aguardando retirada') {
                    pedidoElement.innerHTML = `
                    <td>
                        <div class="cliente">
                            <strong>${pedido.nome}</strong>
                            <span>#PEDIDO${key}</span>
                        </div>
                    </td>
                    <td>${pedido.kit}</td>
                    <td>${pedido.status}</td>
                    <td>${pedido.horario}</td>
                    <td>
                        <button class="action-btn action-btn--solid" type="button" data-action="retirar" data-key="${key}">Retirar</button>
                    </td>
                `;
                    pedidosContainer.appendChild(pedidoElement);
                }
            }
        });
}

async function atualizarStatus(key, status) {
    const pedido = new Pedidos(key);
    await pedido.atualizar_status(status);
    mostrarPedidos();
}

setInterval(verificarPedidos, 5000); // verifica para ver se tem novos pedidos a cada 5 segundo

function verificarPedidos() {
    let pedidosAntigos = [];
    console.log('Verificando novos pedidos...');
    fetch(`${API}pedidos.json`)
        .then(response => response.json())
        .then(data => {
            for (const key in data) {
                if (!pedidosAntigos.includes(key)) {
                    pedidosAntigos.push(key);
                    mostrarPedidos();
                }
            }
        });
}   