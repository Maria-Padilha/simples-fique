import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useSidebarStore = defineStore('sidebar', () => {

    /**
     * MODULOS - Define toda a estrutura de módulos/seções da sidebar
     *
     * Cada módulo contém:
     * - id: identificador único do módulo (usado como value no v-list-group)
     * - titulo: nome exibido na sidebar
     * - icon: ícone MDI exibido ao lado do título
     * - submenus: array com os links internos do módulo
     *   - cada submenu tem: text (nome), icon (ícone), route (caminho)
     */
    const modulos = ref([
        {
            id: 'financeiro',
            titulo: 'Financeiro',
            icon: 'mdi-currency-usd',
            submenus: [
                {
                    text: 'Banco',
                    submenus: [
                        {text: 'Conta Corrente', route: '/paginas/financeiro/contacorrente'},
                        {text: 'Lançamentos', route: '/paginas/banco/movimentacao'},
                        {text: 'Transf. Financeira', route: '/paginas/financeiro/transferencia'},
                        {text: 'Carteira de Cobrança', route: '/paginas/financeiro/carteiracobranca'}
                    ]
                },
                {
                    text: 'Caixa',
                    submenus: [
                        {text: 'Caixa', route: '/paginas/financeiro/caixa'},
                        {text: 'Lançamentos', route: '/paginas/financeiro/caixa/lancamento'},
                        {text: 'Abertura', route: '/paginas/financeiro/caixa/abertura'},
                        {text: 'Encerramento', route: '/paginas/financeiro/caixa/encerramento'}
                    ]
                },
                {
                    text: 'Pagar',
                    submenus: [
                        {text: 'Lançamentos', route: '/paginas/financeiro/pagar'},
                        {text: 'Autorização', route: '/paginas/financeiro/autorizacao'},
                        {text: 'Baixa', route: '/paginas/financeiro/baixa'},
                        {text: 'Estorno de Baixa', route: '/paginas/estorno/pagar'},
                        {text: 'Adt. Fornecedores', route: '/paginas/adiantamento/fornecedor'}
                    ]
                },
                {
                    text: 'Receber',
                    submenus: [
                        {text: 'Lançamentos', route: '/paginas/financeiro/receber'},
                        {text: 'Baixa', route: '/paginas/financeiro/baixareceb'},
                        {text: 'Estorno de Baixa', route: '/paginas/estorno/receber'},
                        {text: 'Adt. Clientes', route: '/paginas/adiantamento/cliente'}
                    ]
                },
                {
                    text: 'Centro de Custo',
                    submenus: [
                        {text: 'Centro de Custo', route: '/paginas/financeiro/centrodecusto/cadastro'},
                        {text: 'Previsto', route: '/paginas/financeiro/centrodecusto/previsao'},
                        {text: 'Realizado', route: '/paginas/financeiro/centrodecusto/debitoreal'}
                    ]
                }
            ]
        },

        {
            id: 'contabil',
            titulo: 'Contábil',
            icon: 'mdi-book-open-variant',
            submenus: [
                {text: 'Plano de Contas', route: '/paginas/financeiro/planoconta'},
                {text: 'Modelos D.R.E', route: '/paginas/financeiro/dre'},
                {text: 'Relatório', route: '/paginas/financeiro/relatorio/dre'}
            ]
        },

        {
            id: 'Fiscal',
            titulo: 'Fiscal',
            icon: 'mdi-file-document-outline',
            submenus: [
                {text: 'Entrada NFSe', route: '/paginas/fiscal/notadeservico'}
            ]
        },

        {
            id: 'manutencao',
            titulo: 'Manutenção',
            icon: 'mdi-tools',
            submenus: [
                {
                    text: 'Clientes',
                    icon: 'mdi-account-group',
                    route: '/paginas/manutencao/clientes'
                },
                {
                    text: 'Pessoas',
                    icon: 'mdi-account-multiple',
                    route: '/paginas/manutencao/pessoas'
                },
                {
                    text: 'Usuários',
                    icon: 'mdi-account-cog',
                    route: '/paginas/manutencao/usuarios'
                },
                {
                    text: 'Funcionários',
                    icon: 'mdi-account-hard-hat',
                    route: '/paginas/manutencao/funcionarios'
                },
                {
                    text: 'Grupos de Usuários',
                    icon: 'mdi-account-multiple',
                    route: '/paginas/manutencao/grupousuario'
                },
                {text: 'Contadores', route: '/paginas/manutencao/contadores'},
                {text: 'Fornecedores', route: '/paginas/manutencao/fornecedores'},
                {text: 'Transportadoras', route: '/paginas/manutencao/transportadoras'},
                {
                    text: 'Fórmulas',
                    icon: 'mdi-function-variant',
                    route: '/paginas/estoque/formulas'
                },
                {
                    text: 'Certificados',
                    icon: 'mdi-certificate',
                    route: '/paginas/certificados'
                },
            ]
        },

        {
            id: 'estoque',
            titulo: 'Estoque',
            icon: 'mdi-package-variant',
            submenus: [
                {
                    text: 'Produtos',
                    submenus: [
                        {
                            text: 'Produtos',
                            icon: 'mdi-tag-outline',
                            route: '/paginas/produtos'
                        },
                        {
                            text: 'Importar Produtos',
                            icon: 'mdi-cloud-upload-outline',
                            route: '/paginas/produtos/importar'
                        },
                        {
                            text: 'Grade de Produtos',
                            icon: 'mdi-view-grid-outline',
                            route: '/paginas/produtos/grade'
                        },
                        {
                            text: 'Local Produtos',
                            icon: 'mdi-map-marker',
                            route: '/paginas/produtos/local'
                        },
                        {
                            text: 'Entrada Nota Fiscal',
                            icon: 'mdi-file-document-outline',
                            route: '/paginas/entradadfe'
                        },
                        {
                            text: 'Dev. Nota Fiscal',
                            icon: 'mdi-file-document-edit-outline',
                            route: '/paginas/deventrada'
                        },
                        {
                            text: 'Inventário',
                            icon: 'mdi-clipboard-list',
                            route: '/paginas/inventario'
                        }
                    ]
                },
                {text: 'Grupos', route: '/paginas/estoque/grupo'},
                {text: 'Classe', route: '/paginas/estoque/classe'},
                {text: 'CEST', route: '/paginas/estoque/cest'},
                {text: 'Aliquota UF', route: '/paginas/estoque/aliquotauf'}
            ]
        },

        {
            id: 'PDV',
            titulo: 'PDV',
            icon: 'mdi-point-of-sale',
            submenus: [
                {text: 'Operação', route: '/paginas/pdv/operacao'},
                {text: 'Terminais de Venda', route: '/paginas/pdv/terminais-vendas'}
            ]
        },

        {
            id: 'relatorios',
            titulo: 'Relatórios',
            icon: 'mdi-file-chart',
            submenus: [
                {text: 'Relatório Financeiro', route: '/paginas/relatorios/financeiro'},
                {text: 'Relatório Contábil', route: '/paginas/relatorios/contabil'}
            ]
        },

        {
            id: 'integracoes',
            titulo: 'Integrações',
            icon: 'mdi-cogs',
            submenus: [
                {text: 'Loja de Integrações', route: '/paginas/integracoes/loja'},
                {text: 'APIs Externas', route: '/paginas/integracoes/api-externa'},
                {text: 'Cloudflare R2', route: '/paginas/integracao/cloudflare-r2'}
            ]
        },

        {
            id: 'seguranca',
            titulo: 'Segurança',
            icon: 'mdi-shield-lock',
            submenus: [
                {text: 'Usuários', route: '/paginas/manutencao/usuarios'},
                {text: 'Grupo de Usuários', route: '/paginas/manutencao/grupousuario'}
            ]
        }
    ]);

    /**
     * GETTERS - Funções para acessar os modulos
     */

    /**
     * Retorna todos os módulos
     */
    const getModulos = () => modulos.value;

    /**
     * Busca um módulo específico pelo ID
     * @param {string} id - ID do módulo (ex: 'financeiro')
     * @returns {object} O módulo encontrado ou undefined
     */
    const getModuloById = (id) => {
        return modulos.value.find(modulo => modulo.id === id);
    };

    /**
     * ACTIONS - Funções para modificar o estado
     */

    /**
     * Adiciona um novo módulo na sidebar
     * @param {object} novoModulo - Estrutura do módulo a adicionar
     *
     * Exemplo de uso:
     * adicionarModulo({
     *   id: 'vendas',
     *   titulo: 'Vendas',
     *   icon: 'mdi-cart',
     *   submenus: [...]
     * })
     */
    const adicionarModulo = (novoModulo) => {
        if (!novoModulo.id || !novoModulo.titulo || !Array.isArray(novoModulo.submenus)) {
            console.error('Módulo inválido. Verifique id, titulo e submenus.');
            return;
        }
        modulos.value.push(novoModulo);
    };

    /**
     * Remove um módulo da sidebar pelo ID
     * @param {string} id - ID do módulo a remover
     */
    const removerModulo = (id) => {
        const index = modulos.value.findIndex(m => m.id === id);
        if (index !== -1) {
            modulos.value.splice(index, 1);
        }
    };

    /**
     * Atualiza um submenu dentro de um módulo
     * @param {string} moduloId - ID do módulo
     * @param {array} novoSubmenus - Array com os novos submenus
     */
    const atualizarSubmenus = (moduloId, novoSubmenus) => {
        const modulo = getModuloById(moduloId);
        if (modulo) {
            modulo.submenus = novoSubmenus;
        }
    };

    return {
        modulos,
        getModulos,
        getModuloById,
        adicionarModulo,
        removerModulo,
        atualizarSubmenus
    };
});

