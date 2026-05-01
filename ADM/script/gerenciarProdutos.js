import Produtos from '../../obj/produtos.js';
import KIT_CONFIG from '../../obj/kitConfig.js';

const produtosApi = new Produtos();

const alertContainer = document.getElementById('alert-container');
const produtosContainer = document.getElementById('produtosContainer');
const codigoMovimentacao = document.getElementById('codigoMovimentacao');
const kitSelect = document.getElementById('kitSelect');
const kitPreview = document.getElementById('kitPreview');
const kitConfigCode = document.getElementById('kitConfigCode');

document.getElementById('recarregarProdutos').addEventListener('click', carregarTela);
document.getElementById('salvarProdutoBtn').addEventListener('click', salvarProduto);
document.getElementById('movimentarProdutoBtn').addEventListener('click', movimentarProduto);
document.getElementById('aplicarKitBtn').addEventListener('click', aplicarSaidaKit);
kitSelect.addEventListener('change', renderizarPreviewKit);

carregarTela();

async function carregarTela() {
    try {
        renderizarKitConfig();
        popularKits();
        renderizarPreviewKit();
        const produtos = await produtosApi.listar();
        renderizarResumo(produtos);
        renderizarProdutos(produtos);
        popularSelectProdutos(produtos);
    } catch (error) {
        mostrarAlerta(error.message || 'Nao foi possivel carregar os produtos.', 'danger');
    }
}

async function salvarProduto() {
    const produto = {
        codigo: document.getElementById('codigoProduto').value,
        nome: document.getElementById('nomeProduto').value,
        categoria: document.getElementById('categoriaProduto').value,
        estoque: document.getElementById('estoqueProduto').value
    };

    if (!produto.codigo || !produto.nome) {
        mostrarAlerta('Preencha o codigo e o nome do produto.', 'warning');
        return;
    }

    try {
        await produtosApi.salvar(produto);
        document.getElementById('produtoForm').reset();
        mostrarAlerta('Produto salvo com sucesso.', 'success');
        await carregarTela();
    } catch (error) {
        mostrarAlerta(error.message || 'Erro ao salvar o produto.', 'danger');
    }
}

async function movimentarProduto() {
    const payload = {
        codigo: codigoMovimentacao.value,
        tipo: document.getElementById('tipoMovimentacao').value,
        quantidade: document.getElementById('quantidadeMovimentacao').value,
        observacao: document.getElementById('observacaoMovimentacao').value
    };

    if (!payload.codigo) {
        mostrarAlerta('Selecione um produto para movimentar.', 'warning');
        return;
    }

    try {
        await produtosApi.movimentarProduto(payload);
        document.getElementById('movimentacaoForm').reset();
        mostrarAlerta('Movimentacao registrada com sucesso.', 'success');
        await carregarTela();
    } catch (error) {
        mostrarAlerta(error.message || 'Erro ao registrar movimentacao.', 'danger');
    }
}

async function aplicarSaidaKit() {
    const kit = kitSelect.value;
    const quantidade = document.getElementById('quantidadeKit').value;

    if (!kit) {
        mostrarAlerta('Selecione um kit.', 'warning');
        return;
    }

    try {
        await produtosApi.aplicarSaidaKit(kit, quantidade, KIT_CONFIG);
        document.getElementById('kitForm').reset();
        popularKits();
        renderizarPreviewKit();
        mostrarAlerta(`Saida do ${kit} aplicada com sucesso.`, 'success');
        await carregarTela();
    } catch (error) {
        mostrarAlerta(error.message || 'Erro ao aplicar a saida do kit.', 'danger');
    }
}

function renderizarResumo(produtos) {
    const lista = Object.values(produtos || {});
    const totalProdutos = lista.length;
    const totalEstoque = lista.reduce((acc, item) => acc + (Number(item.estoque) || 0), 0);
    const totalBaixoEstoque = lista.filter((item) => (Number(item.estoque) || 0) <= 5).length;

    document.getElementById('totalProdutos').textContent = String(totalProdutos).padStart(2, '0');
    document.getElementById('totalEstoque').textContent = String(totalEstoque).padStart(2, '0');
    document.getElementById('totalBaixoEstoque').textContent = String(totalBaixoEstoque).padStart(2, '0');
}

function renderizarProdutos(produtos) {
    const lista = Object.values(produtos || {}).sort((a, b) => a.nome.localeCompare(b.nome));
    produtosContainer.innerHTML = '';

    if (!lista.length) {
        produtosContainer.innerHTML = `
            <tr>
                <td colspan="5">Nenhum produto cadastrado ainda.</td>
            </tr>
        `;
        return;
    }

    lista.forEach((produto) => {
        const estoque = Number(produto.estoque) || 0;
        const statusClass = estoque <= 0 ? 'status--danger' : estoque <= 5 ? 'status--warning' : 'status--success';
        const statusLabel = estoque <= 0 ? 'Sem estoque' : estoque <= 5 ? 'Baixo estoque' : 'Disponivel';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${produto.codigo}</td>
            <td>
                <div class="cliente">
                    <strong>${produto.nome}</strong>
                </div>
            </td>
            <td>${produto.categoria || '-'}</td>
            <td>${estoque}</td>
            <td><span class="status ${statusClass}">${statusLabel}</span></td>
        `;
        produtosContainer.appendChild(row);
    });
}

function popularSelectProdutos(produtos) {
    const lista = Object.values(produtos || {}).sort((a, b) => a.nome.localeCompare(b.nome));
    codigoMovimentacao.innerHTML = '<option value="">Selecione um produto</option>';

    lista.forEach((produto) => {
        const option = document.createElement('option');
        option.value = produto.codigo;
        option.textContent = `${produto.codigo} - ${produto.nome}`;
        codigoMovimentacao.appendChild(option);
    });
}

function popularKits() {
    const kitAtual = kitSelect.value;
    kitSelect.innerHTML = '';

    Object.keys(KIT_CONFIG).forEach((kit) => {
        const option = document.createElement('option');
        option.value = kit;
        option.textContent = kit;
        kitSelect.appendChild(option);
    });

    if (kitAtual && KIT_CONFIG[kitAtual]) {
        kitSelect.value = kitAtual;
    }
}

function renderizarPreviewKit() {
    const kit = kitSelect.value || Object.keys(KIT_CONFIG)[0];
    const itens = KIT_CONFIG[kit] || [];

    kitPreview.innerHTML = itens.map((item) => `
        <div class="pedido-card pedido-card--compact">
            <strong>${item.codigo}</strong>
            <span>${item.quantidade} unidade(s) por kit</span>
        </div>
    `).join('');
}

function renderizarKitConfig() {
    kitConfigCode.textContent = `const KIT_CONFIG = ${JSON.stringify(KIT_CONFIG, null, 4)};`;
}

function mostrarAlerta(mensagem, tipo) {
    alertContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show mb-3" role="alert">
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}
