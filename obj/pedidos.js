import Produtos from './produtos.js';
import KIT_CONFIG from './kitConfig.js';

const API = 'https://cdavelino-915a7-default-rtdb.firebaseio.com/';

class Pedidos {
    constructor(key = '') {
        this.key = key;
        this.produtosApi = new Produtos();
    }

    async listar() {
        const response = await fetch(`${API}pedidos.json`);
        const data = await response.json();
        return data || {};
    }

    async buscar() {
        const response = await fetch(`${API}pedidos/${this.key}.json`);
        return response.json();
    }

    atualizar_status(status) {
        return fetch(`${API}pedidos/${this.key}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        })
            .then(response => response.json())
            .then(data => {
                return data;
            });
    }

    atualizar(dados) {
        return fetch(`${API}pedidos/${this.key}.json`, {
            method: 'PATCH',
            body: JSON.stringify(dados)
        })
            .then(response => response.json())
            .then(data => {
                return data;
            });
    }

    async baixarEstoqueDoPedido() {
        const pedido = await this.buscar();

        if (!pedido) {
            throw new Error('Pedido nao encontrado.');
        }

        if (pedido.estoqueBaixado) {
            return pedido;
        }

        const kitNormalizado = normalizarKit(pedido.kit);
        await this.produtosApi.aplicarSaidaKit(kitNormalizado, 1, KIT_CONFIG);
        await this.atualizar({
            kit: kitNormalizado,
            estoqueBaixado: true,
            estoqueBaixadoEm: new Date().toISOString()
        });

        return pedido;
    }
}

function normalizarKit(kit) {
    if (!kit) {
        return '';
    }

    const kitNormalizado = kit
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    if (kitNormalizado === 'kit coordenacao' || kitNormalizado === 'kit cordenacao') {
        return 'kit coordenacao';
    }

    return kitNormalizado;
}

export default Pedidos;
