import Pedidos from '../../obj/pedidos.js';

const ETAPAS = {
    pedidos: {
        status: 'Aguardando separacao',
        botao: 'Separar',
        proximoStatus: 'Em separacao',
        baixaEstoque: true,
        titulo: 'Pedidos recebidos'
    },
    separacao: {
        status: 'Em separacao',
        botao: 'Enviar para expedicao',
        proximoStatus: 'Em expedicao',
        baixaEstoque: false,
        titulo: 'Pedidos em separacao'
    },
    expedicao: {
        status: 'Em expedicao',
        botao: 'Retirar',
        proximoStatus: 'Retirado',
        baixaEstoque: false,
        titulo: 'Pedidos em expedicao'
    }
};

const painel = document.body.dataset.painel;
const configuracao = ETAPAS[painel];
const pedidosApi = new Pedidos();

const pedidosContainer = document.getElementById('pedidos-container');
const alertContainer = document.getElementById('alert-container');
const tableSubtitle = document.getElementById('table-subtitle');
const panelTitle = document.getElementById('panel-title');

if (panelTitle && configuracao) {
    panelTitle.textContent = configuracao.titulo;
}

pedidosContainer.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action="avancar"]');
    if (!button) return;

    button.disabled = true;

    try {
        await avancarPedido(button.dataset.key);
        await carregarPedidos();
    } catch (error) {
        mostrarAlerta(error.message || 'Nao foi possivel atualizar o pedido.', 'danger');
    } finally {
        button.disabled = false;
    }
});

carregarPedidos();
setInterval(carregarPedidos, 5000);

async function carregarPedidos() {
    const data = await pedidosApi.listar();
    const lista = Object.entries(data).map(([key, pedido]) => ({
        key,
        ...normalizarPedido(pedido)
    }));

    renderizarResumo(lista);
    renderizarTabela(lista.filter((pedido) => pedido.status === configuracao.status));
}

function normalizarPedido(pedido) {
    return {
        ...pedido,
        status: pedido.status || 'Aguardando separacao',
        estoqueBaixado: Boolean(pedido.estoqueBaixado)
    };
}

function renderizarResumo(lista) {
    const pedidosHoje = lista.length;
    const aguardando = lista.filter((pedido) => pedido.status === 'Aguardando separacao').length;
    const emSeparacao = lista.filter((pedido) => pedido.status === 'Em separacao').length;
    const emExpedicao = lista.filter((pedido) => pedido.status === 'Em expedicao').length;
    const concluidos = lista.filter((pedido) => pedido.status === 'Retirado').length;

    atualizarResumo('resumoPedidosHoje', pedidosHoje);
    atualizarResumo('resumoAguardando', aguardando);
    atualizarResumo('resumoSeparacao', emSeparacao);
    atualizarResumo('resumoExpedicao', emExpedicao);
    atualizarResumo('resumoConcluidos', concluidos);
}

function atualizarResumo(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = String(valor).padStart(2, '0');
    }
}

function renderizarTabela(lista) {
    pedidosContainer.innerHTML = '';

    if (tableSubtitle) {
        tableSubtitle.textContent = `${lista.length} resultado(s) encontrados`;
    }

    if (!lista.length) {
        pedidosContainer.innerHTML = `
            <tr>
                <td colspan="8">Nenhum pedido nesta etapa.</td>
            </tr>
        `;
        return;
    }

    lista.forEach((pedido) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="cliente">
                    <strong>${pedido.nome || '-'}</strong>
                    <span>#PEDIDO${pedido.key}</span>
                </div>
            </td>
            <td>${pedido.kit || '-'}</td>
            <td>${pedido.tipo || descobrirTipo(pedido)}</td>
            <td>${montarDetalhe(pedido)}</td>
            <td><span class="status ${statusClass(pedido.status)}">${pedido.status}</span></td>
            <td>${pedido.horario || '-'}</td>
            <td>${pedido.estoqueBaixado ? 'Sim' : 'Nao'}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn action-btn--solid" type="button" data-action="avancar" data-key="${pedido.key}">
                        ${configuracao.botao}
                    </button>
                </div>
            </td>
        `;
        pedidosContainer.appendChild(row);
    });
}

function descobrirTipo(pedido) {
    if (pedido.tipo) return pedido.tipo;
    if (pedido.cargo) return 'coordenacao';
    if (pedido.empresa) return 'convidado';
    if (pedido.ano) return 'aluno';
    return '-';
}

function montarDetalhe(pedido) {
    if (pedido.cargo) return pedido.cargo;
    if (pedido.empresa) return pedido.empresa;
    if (pedido.ano) return pedido.ano;
    return '-';
}

function statusClass(status) {
    if (status === 'Retirado') return 'status--success';
    if (status === 'Em separacao') return 'status--warning';
    if (status === 'Em expedicao') return 'status--info';
    return 'status--danger';
}

async function avancarPedido(key) {
    const pedido = new Pedidos(key);

    if (configuracao.baixaEstoque) {
        await pedido.baixarEstoqueDoPedido();
    }

    await pedido.atualizar({
        status: configuracao.proximoStatus,
        atualizadoEm: new Date().toISOString()
    });

    mostrarAlerta(`Pedido movido para ${configuracao.proximoStatus}.`, 'success');
}

function mostrarAlerta(mensagem, tipo) {
    if (!alertContainer) return;

    alertContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show mb-3" role="alert">
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}
