const API = 'https://cdavelino-915a7-default-rtdb.firebaseio.com/';

class Produtos {
    async listar() {
        const response = await fetch(`${API}produtos.json`);
        const data = await response.json();
        return data || {};
    }

    async salvar(produto) {
        const codigo = produto.codigo.trim().toUpperCase();
        const payload = {
            codigo,
            nome: produto.nome.trim(),
            categoria: (produto.categoria || '').trim(),
            estoque: Number(produto.estoque) || 0
        };

        await fetch(`${API}produtos/${codigo}.json`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        return payload;
    }

    async buscarPorCodigo(codigo) {
        const codigoNormalizado = codigo.trim().toUpperCase();
        const response = await fetch(`${API}produtos/${codigoNormalizado}.json`);
        return response.json();
    }

    async atualizarEstoque(codigo, novoEstoque) {
        const codigoNormalizado = codigo.trim().toUpperCase();
        await fetch(`${API}produtos/${codigoNormalizado}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ estoque: novoEstoque })
        });
    }

    async registrarMovimentacao(movimentacao) {
        const payload = {
            ...movimentacao,
            data: new Date().toISOString()
        };

        await fetch(`${API}movimentacoesProdutos.json`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        return payload;
    }

    async movimentarProduto({ codigo, quantidade, tipo, observacao = '', origem = 'manual' }) {
        const produto = await this.buscarPorCodigo(codigo);

        if (!produto) {
            throw new Error('Produto nao encontrado.');
        }

        const estoqueAtual = Number(produto.estoque) || 0;
        const quantidadeNumerica = Number(quantidade) || 0;

        if (quantidadeNumerica <= 0) {
            throw new Error('Informe uma quantidade maior que zero.');
        }

        let novoEstoque = estoqueAtual;

        if (tipo === 'entrada') {
            novoEstoque += quantidadeNumerica;
        } else {
            if (estoqueAtual < quantidadeNumerica) {
                throw new Error(`Estoque insuficiente para ${produto.nome}.`);
            }
            novoEstoque -= quantidadeNumerica;
        }

        await this.atualizarEstoque(codigo, novoEstoque);
        await this.registrarMovimentacao({
            codigo: produto.codigo,
            nome: produto.nome,
            tipo,
            quantidade: quantidadeNumerica,
            estoqueAnterior: estoqueAtual,
            estoqueAtual: novoEstoque,
            observacao,
            origem
        });

        return { ...produto, estoque: novoEstoque };
    }

    async aplicarSaidaKit(nomeKit, quantidadeKits, configuracaoKit) {
        const quantidadeNumerica = Number(quantidadeKits) || 0;

        if (quantidadeNumerica <= 0) {
            throw new Error('Informe a quantidade de kits.');
        }

        const itens = configuracaoKit[nomeKit];
        if (!itens || !itens.length) {
            throw new Error('Kit sem configuracao.');
        }

        const produtosDoKit = await Promise.all(
            itens.map(async (item) => {
                const produto = await this.buscarPorCodigo(item.codigo);
                if (!produto) {
                    throw new Error(`Produto ${item.codigo} nao cadastrado.`);
                }

                const quantidadeNecessaria = item.quantidade * quantidadeNumerica;
                const estoqueAtual = Number(produto.estoque) || 0;

                if (estoqueAtual < quantidadeNecessaria) {
                    throw new Error(`Estoque insuficiente para ${produto.nome}.`);
                }

                return {
                    produto,
                    quantidadeNecessaria,
                    estoqueAtual,
                    estoqueFinal: estoqueAtual - quantidadeNecessaria
                };
            })
        );

        await Promise.all(
            produtosDoKit.map(async (item) => {
                await this.atualizarEstoque(item.produto.codigo, item.estoqueFinal);
                await this.registrarMovimentacao({
                    codigo: item.produto.codigo,
                    nome: item.produto.nome,
                    tipo: 'saida',
                    quantidade: item.quantidadeNecessaria,
                    estoqueAnterior: item.estoqueAtual,
                    estoqueAtual: item.estoqueFinal,
                    observacao: `Baixa automatica do ${nomeKit}`,
                    origem: 'kit'
                });
            })
        );

        return produtosDoKit;
    }
}

export default Produtos;
