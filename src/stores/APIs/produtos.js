import {defineStore} from "pinia"
import apiPhp from "@/services/apiPhp";

const CAMPOS_PRODUTO = {
    descproduto: 'Descrição do Produto',
    aplicacao: 'Aplicação',
    tipo: 'Tipo',
    codigo_gtin: 'Código GTIN',
    codigo_sku: 'Código SKU',
    codigo_fab: 'Código Fabricação',
    codigo_ref: 'Código Referência',
    id_grupo: 'Grupo',
    id_subgrupo: 'Subgrupo',
    id_marca: 'Marca',
    id_medida: 'Medida',
    id_classe: 'Classe',
    id_garantia: 'Garantia',
    id_ncm: 'NCM',
};

// Traduz "Campo obrigatório não informado: "id_ncm"..." para o nome amigável do campo no formulário.
function traduzErroCampoObrigatorio(mensagem) {
    const match = String(mensagem || '').match(/campo obrigat[óo]rio[^:]*:\s*"?([a-z_]+)"?/i);
    if (!match) return mensagem;

    const campo = match[1];
    const label = CAMPOS_PRODUTO[campo] || campo;
    return `Campo obrigatório não preenchido: ${label}`;
}

export const useProdutosStore = defineStore('produtos', {
    state: () => ({
        loading: false,
        token: localStorage.getItem('token'),
        errorMessage: '',
        successMessage: '',

        produtos: [],
        produto: null,

        marcas: [],
        marca: null,
        recordsMarcas: 0,

        medidas: [],
        recordsMedidas: 0,

        garantias: [],
        garantia: null,
        recordsGarantias: 0,
        tiposGarantias: [
            {title: 'Horas', value: 1},
            {title: 'Mes', value: 2},
            {title: 'Ano', value: 3},
            {title: 'KM', value: 4},
        ],
        tiposGarantiasObj: {
            1: 'Horas',
            2: 'Mes',
            3: 'Ano',
            4: 'KM'
        },

        embalagens: [],
        embalagem: null,

        fornecedores: [],
        fornecedor: null,

        similar: [],
        produtoSimilar: null,

        produtoPreco: null,

        entradadfe: [],
        entradadfeItem: null,

        deventrada: [],

        localizacoes: [],
        localizacao: null,

        API_MIDIAS: "http://192.168.10.79:3005",
        fotosBanco: [],

        cores: [],
        cor: null,

        gradeMatriz: null,

        tamanhos: [
            {title: 'PP', value: 'PP'},
            {title: 'P', value: 'P'},
            {title: 'M', value: 'M'},
            {title: 'G', value: 'G'},
            {title: 'GG', value: 'GG'},
            {title: 'XG', value: 'XG'},
            {title: 'XGG', value: 'XGG'},
            {title: 'Único', value: 'Único'},
            {title: '36', value: '36'},
            {title: '38', value: '38'},
            {title: '40', value: '40'},
            {title: '42', value: '42'},
            {title: '44', value: '44'},
            {title: '46', value: '46'},
            {title: '48', value: '48'},
            {title: '50', value: '50'},
            {title: '52', value: '52'},
        ],

        grades: [],
        grade: null,

        tributos: [],
        tributo: null,

        aliquotaInfos: []
    }),

    actions: {

        /**
         * BUSCAR PRODUTOS
         * @return {Promise<void>}
         */

        async buscarProdutos() {
            this.loading = true;

            try {
                const response = await apiPhp.get('/estoque/produtos');

                this.produtos = response.data?.data ?? response.data ?? [];
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR PRODUTO POR ID
         * @param {number} id - ID do produto a ser buscado.
         * @return {Promise<void>}
         */

        async buscarProdutoPorId(id) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/produtos/${id}`);

                this.produto = response.data?.data ?? response.data;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * CADASTRAR PRODUTO
         * @param {object} produtoData - Dados do produto a ser cadastrado.
         * @return {Promise<void>}
         */

        async cadastrarProduto(produtoData) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/produtos', produtoData);
                await this.buscarProdutos();
            } catch (error) {
                const mensagem = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                this.errorMessage = traduzErroCampoObrigatorio(mensagem);
            } finally {
                this.loading = false;
            }
        },

        /**
         * ATUALIZAR PRODUTO
         * @param {number} id - ID do produto a ser atualizado.
         * @param {object} produtoData - Dados do produto a serem atualizados.
         * @return {Promise<void>}
         */

        async atualizarProduto(id, produtoData) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/produtos/${id}`, produtoData);
                await this.buscarProdutoPorId(id);
                await this.buscarProdutos();
            } catch (error) {
                const mensagem = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                this.errorMessage = traduzErroCampoObrigatorio(mensagem);
            } finally {
                this.loading = false;
            }
        },

        /**
         * DELETAR PRODUTO
         * @param {number} id - ID do produto a ser deletado.
         * @return {Promise<void>}
         */

        async deletarProduto(id) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/produtos/${id}`);
                await this.buscarProdutoPorId(id);
                await this.buscarProdutos();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR MARCAS
         * @return {Promise<void>}
         */

        async buscarMarcas(find = "", limit = 100) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/marcas`, {
                    params: { find, limit }
                });

                this.marcas = response.data?.data ?? response.data ?? [];
                this.recordsMarcas = response.pagination?.total ?? response.data?.total ?? 0;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR MARCA POR ID
         * @param {number} id - ID da marca a ser buscada.
         * @return {Promise<void>}
         */

        async buscarMarcaPorId(id) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/marcas/${id}`);

                this.marca = response.data?.data ?? response.data;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * CADASTRAR MARCA
         *
         */

        async cadastrarMarca(marcaData) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/marcas', marcaData);
                await this.buscarMarcas();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * ATUALIZAR MARCA
         * @param {number} id - ID da marca a ser atualizada.
         * @param {object} marcaData - Dados da marca a serem atualizados.
         * @return {Promise<void>}
         */

        async atualizarMarca(id, marcaData) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/marcas/${id}`, marcaData);
                await this.buscarMarcas();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * DELETAR MARCA
         * @param {number} id - ID da marca a ser deletada.
         * @return {Promise<void>}
         */

        async deletarMarca(id) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/marcas/${id}`);
                await this.buscarMarcas();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR MEDIDAS
         * @return {Promise<void>}
         */

        async buscarMedidas(find = "", limit = 100) {
            this.loading = true;

            try {
                const response = await apiPhp.get('/estoque/medidas', {
                    params: { find, limit }
                });

                const data = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
                this.medidas = data;
                this.recordsMedidas = data.length;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                console.error('Erro ao buscar medidas:', error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * CADASTRAR MEDIDA
         *
         */

        async cadastrarMedida(payload) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/medidas', payload);
                await this.buscarMedidas();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                console.error('Erro ao cadastrar medida:', error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * ATUALIZAR MEDIDA
         * @param {number} id - ID da medida a ser atualizada.
         * @param {object} payload - Dados da medida a serem atualizados.
         * @return {Promise<void>}
         */

        async atualizarMedida(id, payload) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/medidas/${id}`, payload);
                await this.buscarMedidas();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * DELETAR MEDIDA
         * @param {number} id - ID da medida a ser deletada.
         * @return {Promise<void>}
         */

        async deletarMedida(id) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/medidas/${id}`);
                await this.buscarMedidas();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR GARANTIAS
         * @return {Promise<void>}
         */

        async buscarGarantias(find = "", limit = 100) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/garantias`, {
                    params: { find, limit }
                });

                this.garantias = response.data?.data ?? response.data ?? [];
                this.recordsGarantias = response.pagination?.total ?? response.data?.total ?? 0;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR GARANTIA POR ID
         * @param {number} id - ID da garantia a ser buscada.
         * @return {Promise<void>}
         */

        async buscarGarantiaPorId(id) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/garantias/${id}`);

                this.garantia = response.data?.data ?? response.data;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * CADASTRAR GARANTIAS
         *
         */

        async cadastrarGarantia(payload) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/garantias', payload);
                await this.buscarGarantias();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * ATUALIZAR GARANTIA
         * @param {number} id - ID da garantia a ser atualizada.
         * @param {object} payload - Dados da garantia a serem atualizados.
         * @return {Promise<void>}
         */

        async atualizarGarantia(id, payload) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/garantias/${id}`, payload);
                await this.buscarGarantias();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * DELETAR GARANTIA
         * @param {number} id - ID da garantia a ser deletada.
         * @return {Promise<void>}
         */

        async deletarGarantia(id) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/garantias/${id}`);
                await this.buscarGarantias();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR EMBALAGENS
         * @ PARAM {string} ID - produto ID
         * @return {Promise<void>}
         */

        async buscarEmbalagens(produtoId) {
            this.loading = true;

            try {
                const response = await apiPhp.get('/estoque/produto-embalagens', {
                    params: { id_produto: produtoId }
                });

                this.embalagens = response.data?.data ?? response.data ?? [];
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR EMBALAGEM POR ID
         * @param {number} produtoId - ID do produto vinculado.
         * @param {number} id - ID da embalagem a ser buscada.
         * @return {Promise<void>}
         */

        async buscarEmbalagemPorId(produtoId, id) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/produto-embalagens/${produtoId}/${id}`);

                this.embalagem = response.data?.data ?? response.data;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * CADASTRAR EMBALAGEM
         * @param {object} embalagemData - Dados da embalagem a ser cadastrada.
         * @return {Promise<void>}
         */

        async cadastrarEmbalagem(embalagemData, produtoId) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/produto-embalagens', { ...embalagemData, id_produto: produtoId });
                await this.buscarEmbalagens(produtoId);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * ATUALIZAR EMBALAGEM
         * @param {number} id - ID do produto vinculado.
         * @param {number} id - ID da embalagem a ser atualizada.
         * @param {object} embalagemData - Dados da embalagem a serem atualizados.
         * @return {Promise<void>}
         */

        async atualizarEmbalagem(produtoId, id, embalagemData) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/produto-embalagens/${produtoId}/${id}`, { ...embalagemData, id_produto: produtoId });
                await this.buscarEmbalagens(produtoId);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * DELETAR EMBALAGEM
         * @param {number} produtoId - ID do produto vinculado.
         * @param {number} id - ID da embalagem a ser deletada.
         * @return {Promise<void>}
         */

        async deletarEmbalagem(produtoId, id) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/produto-embalagens/${produtoId}/${id}`);
                await this.buscarEmbalagens(produtoId);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR FORNECEDORES
         * @param {string} id - id do produto.
         * @return {Promise<void>}
         */

        async buscarFornecedores(idProduto) {
            this.loading = true;

            try {
                const response = await apiPhp.get('/estoque/produto-fornecedors', {
                    params: { id_produto: idProduto }
                });

                this.fornecedores = response.data?.data ?? response.data ?? [];
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR FORNECEDOR POR ID
         * @param {number} idProduto - ID do produto vinculado.
         * @param {number} idPessoa - ID da pessoa/fornecedor.
         * @return {Promise<void>}
         */

        async buscarFornecedorPorId(idProduto, idPessoa) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/produto-fornecedors/${idProduto}/${idPessoa}`);

                this.fornecedor = response.data?.data ?? response.data;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * CADASTRAR FORNECEDOR
         * @param {object} fornecedorData - Dados do fornecedor a ser cadastrado.
         * @return {Promise<void>}
         */

        async cadastrarFornecedor(fornecedorData, idProduto) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/produto-fornecedors', { ...fornecedorData, id_produto: idProduto });
                await this.buscarFornecedores(idProduto);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * DELETAR FORNECEDOR
         * @param {number} idProduto - ID do produto vinculado.
         * @param {number} id - ID do fornecedor a ser deletado.
         * @return {Promise<void>}
         */

        async deletarFornecedor(idProduto, id) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/produto-fornecedors/${idProduto}/${id}`);
                await this.buscarFornecedores(idProduto);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * ATUALIZAR FORNECEDOR
         * @param {number} idProduto - ID do produto vinculado.
         * @param {number} id - ID do fornecedor a ser atualizado.
         * @param {object} fornecedorData - Dados do fornecedor a serem atualizados.
         * @return {Promise<void>}
         */

        async atualizarFornecedor(idProduto, id, fornecedorData) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/produto-fornecedors/${idProduto}/${id}`, { ...fornecedorData, id_produto: idProduto });
                await this.buscarFornecedores(idProduto);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR PRODUTOS SIMILARES
         * @param {string} id - id do produto.
         * @return {Promise<void>}
         */

        async buscarProdutosSimilares(idProduto) {
            this.loading = true;

            try {
                const response = await apiPhp.get('/estoque/produto-similars', {
                    params: { id_produto: idProduto }
                });

                this.similar = response.data?.data ?? response.data ?? [];
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR PRODUTO SIMILAR POR ID
         * @param {number} idProduto - ID do produto vinculado.
         * @param {number} idSimilar - ID do produto similar.
         * @return {Promise<void>}
         */

        async buscarProdutoSimilarPorId(idProduto, idSimilar) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/produto-similars/${idProduto}/${idSimilar}`);

                this.produtoSimilar = response.data?.data ?? response.data;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * CADASTRAR PRODUTO SIMILAR
         * @param {object} similarData - Dados do produto similar a ser cadastrado.
         * @return {Promise<void>}
         */

        async cadastrarProdutoSimilar(similarData, idProduto) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/produto-similars', { ...similarData, id_produto: idProduto });
                await this.buscarProdutosSimilares(idProduto);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * DELETAR PRODUTO SIMILAR
         * @param {number} idProduto - ID do produto vinculado.
         * @param {number} id - ID do produto similar a ser deletado.
         * @return {Promise<void>}
         */

        async deletarProdutoSimilar(idProduto, id) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/produto-similars/${idProduto}/${id}`);
                await this.buscarProdutosSimilares(idProduto);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * ATUALIZAR PRODUTO SIMILAR
         * @param {number} idProduto - ID do produto vinculado.
         * @param {number} id - ID do produto similar a ser atualizado.
         * @param {object} similarData - Dados do produto similar a serem atualizados.
         * @return {Promise<void>}
         */

        async atualizarProdutoSimilar(idProduto, id, similarData) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/produto-similars/${idProduto}/${id}`, { ...similarData, id_produto: idProduto });
                await this.buscarProdutosSimilares(idProduto);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR ENTRADAS DFE
         * @param {string} id - id da empresa.
         * @return {Promise<void>}
         */

        async buscarEntradasDfe(idEmpresa) { // eslint-disable-line no-unused-vars
            this.loading = true;

            try {
                const response = await apiPhp.get('/estoque/entradas');

                this.entradadfe = response.data?.data ?? response.data ?? [];
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR ENTRADA DFE POR ID
         * @param {number} idEmpresa - ID da Empresa.
         * @param {number} id - ID da entrada dfe a ser buscada.
         * @return {Promise<void>}
         */

        async buscarEntradaDfePorId(idEmpresa, id) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/entradas/${id}`);
                this.entradadfeItem = response.data?.data ?? response.data;
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * CADASTRAR ENTRADA DFE
         * @param {object} entradadfeData - Dados da entrada dfe a ser cadastrada.
         * @return {Promise<void>}
         */

        async cadastrarEntradaDfe(entradadfeData, idEmpresa) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/entradas', entradadfeData);
                await this.buscarEntradasDfe(idEmpresa);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * DELETAR ENTRADA DFE
         * @param {number} idEmpresa - ID da Empresa.
         * @param {number} id - ID da entrada dfe a ser deletada.
         * @return {Promise<void>}
         */
        async deletarEntradaDfe(idEmpresa, id) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/entradas/${id}`);
                await this.buscarEntradasDfe(idEmpresa);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * ATUALIZAR ENTRADA DFE
         * @param {number} idEmpresa - ID da Empresa.
         * @param {number} id - ID da entrada dfe a ser atualizada.
         * @param {object} entradadfeData - Dados da entrada dfe a serem atualizados.
         * @return {Promise<void>}
         */

        async atualizarEntradaDfe(idEmpresa, id, entradadfeData) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/entradas/${id}`, entradadfeData);
                await this.buscarEntradaDfePorId(idEmpresa, id);
                await this.buscarEntradasDfe(idEmpresa);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR DEVOLUÇÕES DE ENTRADA
         */

        async buscarDevolucoesEntrada(idEmpresa) { // eslint-disable-line no-unused-vars
            this.loading = true;

            try {
                const response = await apiPhp.get('/estoque/devolucao-compras');
                this.deventrada = response.data?.data ?? response.data ?? [];
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * CADASTRAR DEVOLUÇÃO DE ENTRADA
         */

        async cadastrarDevEntrada(data, idEmpresa) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/devolucao-compras', data);
                await this.buscarEntradasDfe(idEmpresa);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * EDITAR DEVOLUÇÃO DE ENTRADA
         */

        async editarDevEntrada(idEmpresa, id, data) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/devolucao-compras/${id}`, data);
                await this.buscarDevolucoesEntrada(idEmpresa);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },


        /**
         * BUSCAR LOCALIZAÇÕES
         * @return {Promise<void>}
         */

        async buscarLocalizacoes(idEmpresa) { // eslint-disable-line no-unused-vars
            this.loading = true;

            try {
                const response = await apiPhp.get('/estoque/localizacoes');

                this.localizacoes = response.data?.data ?? response.data ?? [];
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR LOCALIZAÇÃO POR ID
         * @param {number} idEmpresa - ID da Empresa.
         * @param {number} id - ID da localização a ser buscada.
         * @return {Promise<void>}
         */

        async buscarLocalizacaoPorId(idEmpresa, id) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/localizacoes/${idEmpresa}/${id}`);

                this.localizacao = response.data?.data ?? response.data;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * CADASTRAR LOCALIZAÇÃO
         * @param {object} localizacaoData - Dados da localização a ser cadastrada.
         * @return {Promise<void>}
         */

        async cadastrarLocalizacao(localizacaoData, idEmpresa) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/localizacoes', localizacaoData);
                await this.buscarLocalizacoes(idEmpresa);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * DELETAR LOCALIZAÇÃO
         * @param {number} idEmpresa - ID da Empresa.
         * @param {number} id - ID da localização a ser deletada.
         * @return {Promise<void>}
         */

        async deletarLocalizacao(idEmpresa, id) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/localizacoes/${idEmpresa}/${id}`);
                await this.buscarLocalizacoes(idEmpresa);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * ATUALIZAR LOCALIZAÇÃO
         * @param {number} idEmpresa - ID da Empresa.
         * @param {number} id - ID da localização a ser atualizada.
         * @param {object} localizacaoData - Dados da localização a serem atualizados.
         * @return {Promise<void>}
         */

        async atualizarLocalizacao(idEmpresa, id, localizacaoData) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/localizacoes/${idEmpresa}/${id}`, localizacaoData);
                await this.buscarLocalizacoes(idEmpresa);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR CORES
         * @return {Promise<void>}
         */

        async buscarCores() {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/cors`);

                this.cores = response.data?.data ?? response.data ?? [];
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR COR POR ID
         * @param {number} id - ID da cor a ser buscada.
         * @return {Promise<void>}
         */

        async buscarCorPorId(id) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/cors/${id}`);

                this.cor = response.data?.data ?? response.data;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * CADASTRAR COR
         * @param {object} corData - Dados da cor a ser cadastrada.
         * @return {Promise<void>}
         */

        async cadastrarCor(corData) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/cors', corData);
                await this.buscarCores();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * ATUALIZAR COR
         * @param {number} id - ID da cor a ser atualizada.
         * @param {object} corData - Dados da cor a serem atualizados.
         * @return {Promise<void>}
         */

        async atualizarCor(id, corData) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/cors/${id}`, corData);
                await this.buscarCores();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * DELETAR COR
         * @param {number} id - ID da cor a ser deletada.
         * @return {Promise<void>}
         */

        async deletarCor(id) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/cors/${id}`);
                await this.buscarCores();
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR PRODUTO POR CÓDIGO DE BARRAS (GTIN)
         * @param {string} gtin - Código de barras do produto.
         * @return {Promise<Object|null>}
         */

        async buscarProdutoPorCodigoBarras(gtin) {
            if (!gtin) return null;

            try {
                const response = await apiPhp.get(`/estoque/produtos/referencia/${gtin}`);
                return response.data?.data ?? response.data ?? null;
            } catch (error) {
                if (error.response?.status === 404) return null;
                throw error;
            }
        },

        /**
         * GRADE DE PRODUTOS
         */

        async cadastrarGradeMatriz(matrizData, idEmp) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/grades/matriz', matrizData);
                await this.buscarGradeProduto(idEmp);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async cadastrarGradeProduto(gradeData, idEmp) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/grades', gradeData);
                await this.buscarGradeProduto(idEmp);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async deletarGradeProduto(idEmp, idProduto, idCor, idTam) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/grades/${idEmp}/${idProduto}/${idCor}/${idTam}`);
                await this.buscarGradeProduto(idEmp);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async atualizarGradeProduto(idEmp, idProduto, idCor, idTam, gradeData) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/grades/${idEmp}/${idProduto}/${idCor}/${idTam}`, gradeData);
                await this.buscarGradeProduto(idEmp);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async buscarGradeProduto(idEmp) { // eslint-disable-line no-unused-vars
            this.loading = true;

            try {
                const response = await apiPhp.get('/estoque/grades');

                this.grades = response.data?.data ?? response.data ?? [];
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                return [];
            } finally {
                this.loading = false;
            }
        },

        async buscarGradeProdutoPorId(idEmp, idProduto, idCor, idTam) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/grades/${idEmp}/${idProduto}/${idCor}/${idTam}`);

                const gradeItem = response.data?.data ?? response.data;
                this.errorMessage = '';

                return gradeItem;

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                return null;
            } finally {
                this.loading = false;
            }
        },

        /**
         * BUSCAR MATRIZ DE GRADE (cores x tamanhos)
         * GET /estoque/grades/matriz/{idEmpresa}/{idProduto}/{idAlmoxarifado}
         */
        async buscarGradeMatriz(idEmpresa, idProduto, idAlmoxarifado) {
            this.loading = true;
            try {
                const response = await apiPhp.get(`/estoque/grades/matriz/${idEmpresa}/${idProduto}/${idAlmoxarifado}`);
                this.gradeMatriz = response.data?.data ?? response.data ?? null;
                this.errorMessage = '';
                return this.gradeMatriz;
            } catch (error) {
                this.gradeMatriz = null;
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                return null;
            } finally {
                this.loading = false;
            }
        },

        /**
         * ATUALIZAR MATRIZ DE GRADE
         * PUT /estoque/grades/matriz/{idEmpresa}/{idProduto}/{idAlmoxarifado}
         */
        async atualizarGradeMatriz(idEmpresa, idProduto, idAlmoxarifado, data) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/grades/matriz/${idEmpresa}/${idProduto}/${idAlmoxarifado}`, data);
                this.errorMessage = '';
                return true;
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                return false;
            } finally {
                this.loading = false;
            }
        },

        /** ================= PREÇOS DE PRODUTOS ================= */

        async buscarProdutoPreco(idEmpresa, idProduto) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/produto-precos/${idEmpresa}/${idProduto}`);

                this.produtoPreco = response.data?.data ?? response.data;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async cadastrarProdutoPreco(precoData) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/produto-precos', precoData);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async atualizarProdutoPreco(idEmpresa, idProduto, precoData) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/produto-precos/${idEmpresa}/${idProduto}`, precoData);
                await this.buscarProdutoPreco(idEmpresa, idProduto);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        /** ================= TRIBUTOS DE PRODUTOS ================= */

        async buscarTributos(idEmpresa) { // eslint-disable-line no-unused-vars
            this.loading = true;

            try {
                const response = await apiPhp.get('/estoque/produto-tributos');

                this.tributos = response.data?.data ?? response.data ?? [];
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async cadastrarTributo(tributoData, idEmpresa, id) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/produto-tributos', tributoData);
                await this.buscarTributoPorId(idEmpresa, id);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async atualizarTributo(idEmpresa, id, tributoData) {
            this.loading = true;
            try {
                await apiPhp.put(`/estoque/produto-tributos/${idEmpresa}/${id}`, tributoData);
                await this.buscarTributoPorId(idEmpresa, id);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async deletarTributo(idEmpresa, id) {
            this.loading = true;
            try {
                await apiPhp.delete(`/estoque/produto-tributos/${idEmpresa}/${id}`);
                await this.buscarTributoPorId(idEmpresa, id);
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async buscarTributoPorId(idEmpresa, id) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/produto-tributos/${idEmpresa}/${id}`);

                const data = response.data?.data ?? response.data;
                this.tributos = data ? (Array.isArray(data) ? data : [data]) : [];
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                return null;
            } finally {
                this.loading = false;
            }
        },

        async listFiles() {
            const response = await fetch(`${this.API_MIDIAS}/api/files/list`);
            return response.json();
        },

        getDownloadUrl(key) {
            return `${this.API_MIDIAS}/api/files/download/${encodeURIComponent(key)}`;
        },

        async deleteFile(key) {
            const response = await fetch(
                `${this.API_MIDIAS}/api/files/${encodeURIComponent(key)}`,
                { method: "DELETE" }
            );

            return response.json();
        },

        async uploadFile(idSaas, idUsuario, file) {
            const API_BASE_URL = this.API_MIDIAS;

            const formData = new FormData();

            formData.append("id_saas", idSaas);
            formData.append("id_usuario", idUsuario);
            formData.append("file", file);

            const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Erro no upload");
            }

            return response.json();
        },

        async salvarFotoBanco(fotoData) {
            this.loading = true;
            try {
                await apiPhp.post('/estoque/produto-fotos', fotoData);
                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                console.error('Erro ao cadastrar foto no banco de dados:', error);
            } finally {
                this.loading = false;
            }
        },

        async buscarFotosBanco(idProduto) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/produto-fotos/${idProduto}`);

                const data = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
                this.fotosBanco = data;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                console.error('Erro ao buscar fotos do banco:', error);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async deletarFotoBanco(idProduto, idFoto) {
            this.loading = true;

            try {
                await apiPhp.delete(`/estoque/produto-fotos/${idProduto}/${idFoto}`);

                this.errorMessage = '';
            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro desconhecido';
                console.error('Erro ao deletar fotos do banco:', error);
                return null;
            } finally {
                this.loading = false;
            }
        },

        // ALIQUOTAS INFOS

        async buscarAliquotasInfos(emp, uf, cfop) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/estoque/aliquota-ufs/${emp}/${uf}/${cfop}`);

                this.aliquotaInfos = response.data;
                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.validationMessage || error?.response?.data?.erro || error?.response?.data?.message || error?.message || 'Erro ao buscar alíquotas';
                console.error('Erro ao buscar alíquotas infos:', error);
            } finally {
                this.loading = false;
            }
        },
    }
})