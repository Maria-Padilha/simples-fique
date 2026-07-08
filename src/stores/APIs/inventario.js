import { defineStore } from 'pinia'
import apiPhp from '@/services/apiPhp'
import { toast } from 'vue3-toastify'

export const useInventarioStore = defineStore('inventario', {
  state: () => ({
    inventarios: [],
    inventarioAtual: null,
    gridProdutos: [],
    loading: false,
    token: localStorage.getItem('token')
  }),

  actions: {
    /**
     * Lista todos os inventários de uma empresa
     * @param {number} idEmpresa - ID da empresa
     */
    async listarInventarios(idEmpresa) {
      if (!idEmpresa) {
        toast.error('ID da empresa não informado')
        return
      }

      this.loading = true
      try {
        const response = await apiPhp.get('/estoque/inventarios')

        this.inventarios = response.data?.data ?? response.data ?? []
        return response.data
      } catch (error) {
        toast.error('Erro ao carregar inventários')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Busca um inventário específico
     * @param {number} idEmpresa - ID da empresa
     * @param {number} id - ID do inventário
     */
    async obterInventario(idEmpresa, id) {
      if (!idEmpresa || !id) {
        toast.error('Parâmetros inválidos')
        return
      }

      this.loading = true
      try {
        const response = await apiPhp.get(`/estoque/inventarios/${idEmpresa}/${id}`)

        this.inventarioAtual = response.data?.data ?? response.data ?? null
        return response.data
      } catch (error) {
        toast.error('Erro ao carregar inventário')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtém itens de um inventário por almoxarifado
     * @param {number} idEmpresa - ID da empresa
     * @param {number} id - ID do inventário
     * @param {number} id_almoxarifado - ID do almoxarifado
     */
    async obterItensInventarioNovo(idEmpresa, id, id_almoxarifado) {
      if (idEmpresa == null || id == null || id_almoxarifado == null) {
        toast.error('Parâmetros inválidos')
        return
      }

      this.loading = true
      try {
        const response = await apiPhp.get('/estoque/inventario-itens', {
          params: { id_inventario: id, id_almoxarifado }
        })

        this.inventarioAtual = response.data?.data ?? response.data ?? null
        return response.data
      } catch (error) {
        toast.error('Erro ao carregar inventário')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Cadastra um novo inventário
     * @param {object} dados - Dados do inventário (objeto direto, sem wrapper data)
     */
    async cadastrarInventario(dados) {
      if (!dados.id_almoxarifado) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }

      this.loading = true
      try {
        const response = await apiPhp.post('/estoque/inventarios', dados)

        if (response.data) {
          const novoInventario = response.data?.data ?? response.data
          this.inventarios.push(novoInventario)
          toast.success('Inventário cadastrado com sucesso!')
        }

        return response.data
      } catch (error) {
        toast.error('Erro ao cadastrar inventário')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Altera um inventário existente
     * @param {number} idEmpresa - ID da empresa
     * @param {number} id - ID do inventário
     * @param {object} dados - Dados a serem alterados
     */
    async alterarInventario(idEmpresa, id, dados) {
      if (!idEmpresa || !id) {
        toast.error('Parâmetros inválidos')
        return
      }

      this.loading = true
      try {
        const response = await apiPhp.put(`/estoque/inventarios/${id}`, dados)

        if (response.data) {
          const inventarioAtualizado = response.data?.data ?? response.data
          const index = this.inventarios.findIndex(inv => inv.id === id)
          if (index !== -1) {
            this.inventarios[index] = inventarioAtualizado
          }
          toast.success('Inventário alterado com sucesso!')
        }

        return response.data
      } catch (error) {
        toast.error('Erro ao alterar inventário')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Cancela/exclui um inventário
     * @param {number} idEmpresa - ID da empresa
     * @param {number} id - ID do inventário
     */
    async cancelarInventario(idEmpresa, id) {
      if (!idEmpresa || !id) {
        toast.error('Parâmetros inválidos')
        return
      }

      this.loading = true
      try {
        const response = await apiPhp.post(`/estoque/inventarios/${idEmpresa}/${id}/cancelar`)

        this.inventarios = this.inventarios.filter(inv => inv.id !== id)
        toast.success('Inventário cancelado com sucesso!')

        return response.data
      } catch (error) {
        toast.error('Erro ao cancelar inventário')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Encerra um inventário
     * @param {number} idEmpresa - ID da empresa
     * @param {number} id - ID do inventário
     * @param {number} idUsuario - ID do usuário que está encerrando
     */
    async encerrarInventario(idEmpresa, id, idUsuario) {
      if (!idEmpresa || !id || !idUsuario) {
        toast.error('Parâmetros inválidos')
        return
      }

      this.loading = true
      try {
        const response = await apiPhp.post(`/estoque/inventarios/${id}/encerrar`, {
          id_usuario: idUsuario
        })

        if (response.data) {
          const inventarioEncerrado = response.data?.data ?? response.data
          const index = this.inventarios.findIndex(inv => inv.id === id)
          if (index !== -1) {
            this.inventarios[index] = inventarioEncerrado
          }
          toast.success('Inventário encerrado com sucesso!')
        }

        return response.data
      } catch (error) {
        toast.error('Erro ao encerrar inventário')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Consulta o saldo de um produto em um almoxarifado
     * ⚠️ BLOQUEADO — sem endpoint PHP documentado, mantido THorse
     * @param {number} idEmpresa - ID da empresa
     * @param {number} idAlmoxarifado - ID do almoxarifado
     * @param {number} idProduto - ID do produto
     * @returns {Promise} Saldo do produto no almoxarifado
     */
    async consultarSaldoProdutoAlmoxarifado(idEmpresa, idAlmoxarifado, idProduto) {
      if (!idEmpresa || !idAlmoxarifado || !idProduto) {
        toast.error('Parâmetros inválidos')
        return
      }

      this.loading = true
      try {
        const response = await apiPhp.get(`/estoque/produto-almoxarifados/${idEmpresa}/${idAlmoxarifado}/${idProduto}`)

        return response.data?.data ?? response.data ?? null
      } catch (error) {
        if (error.response?.status === 404) {
          return null
        }
        toast.error('Erro ao consultar saldo do produto')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Insere itens de contagem em um inventário (usado pela tela de contagem via link)
     * @param {number} idEmpresa - ID da empresa
     * @param {number} id - ID do inventário
     * @param {Array} itens - Lista de itens no formato [{ id_produto, qtd_contada, diferenca, id_localizacao }]
     */
    async inserirItemInventario(idEmpresa, idInventario, itens) {
      if (!idEmpresa || !idInventario) {
        toast.error('Parâmetros inválidos')
        return
      }

      if (!Array.isArray(itens) || itens.length === 0) {
        toast.error('Nenhum item para salvar')
        return
      }

      this.loading = true
      let erros = 0
      try {
        for (const item of itens) {
          try {
            await apiPhp.post('/estoque/inventario-itens', {
              id_inventario: idInventario,
              id_produto: item.id_produto,
              qtd_contada: item.qtd_contada,
              id_cor: item.id_cor ?? 0,
              id_tamanho: item.id_tamanho ?? 0
            })
          } catch {
            erros++
          }
        }

        if (erros === 0) {
          toast.success('Contagem salva com sucesso!')
        } else {
          toast.warning(`${erros} item(ns) não puderam ser salvos`)
        }
        return true
      } catch (error) {
        toast.error('Erro ao salvar contagem')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Atualiza itens de contagem em um inventário
     * @param {number} idEmpresa - ID da empresa
     * @param {number} id - ID do inventário
     * @param {Array} itens - Lista de itens
     * @param {number} id_almoxarifado - ID do almoxarifado
     */
    async atualizarItemInventario(idEmpresa, idInventario, itens, id_almoxarifado = {}) {
      if (!idEmpresa || !idInventario || !id_almoxarifado) {
        toast.error('Parâmetros inválidos')
        return
      }

      if (!Array.isArray(itens) || itens.length === 0) {
        toast.error('Nenhum item para salvar')
        return
      }

      this.loading = true
      let erros = 0
      try {
        for (const item of itens) {
          try {
            await apiPhp.put(
              `/estoque/inventario-itens/${idEmpresa}/${idInventario}/${item.id_produto}/${item.id_cor ?? 0}/${item.id_tamanho ?? 0}`,
              { qtd_contada: item.qtd_contada }
            )
          } catch {
            erros++
          }
        }

        if (erros === 0) {
          toast.success('Contagem atualizada com sucesso!')
        } else {
          toast.warning(`${erros} item(ns) não puderam ser atualizados`)
        }
        return true
      } catch (error) {
        toast.error('Erro ao atualizar contagem')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Busca a grade de produtos de um almoxarifado para o inventário
     * @param {number} idEmpresa - ID da empresa
     * @param {number} idAlmoxarifado - ID do almoxarifado
     * @param {object} [filtros] - Filtros opcionais
     * @param {number} [filtros.idpro] - ID do produto
     * @param {number} [filtros.idgrp] - ID do grupo
     * @param {number} [filtros.idsbg] - ID do subgrupo
     * @param {number} [filtros.idmar] - ID da marca
     * @param {number} [filtros.idloc] - ID da localização
     */
    async buscarGridInventario(idEmpresa, idAlmoxarifado, filtros = {}) {
      if (!idEmpresa || !idAlmoxarifado) {
        toast.error('Parâmetros inválidos')
        return
      }

      // Montar query params ignorando valores nulos/undefined
      const params = {
        id_empresa: idEmpresa,
        id_almoxarifado: idAlmoxarifado
      }
      if (filtros.idpro) params.id_produto = filtros.idpro
      if (filtros.idgrp) params.id_grupo = filtros.idgrp
      if (filtros.idsbg) params.id_subgrupo = filtros.idsbg
      if (filtros.idmar) params.id_marca = filtros.idmar
      if (filtros.idloc) params.id_localizacao = filtros.idloc

      this.loading = true
      try {
        const response = await apiPhp.get('/estoque/produto-almoxarifados', { params })

        this.gridProdutos = response.data?.data ?? response.data ?? []
        return response.data
      } catch (error) {
        toast.error('Erro ao carregar produtos do almoxarifado')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Envia arquivo para processamento automático de inventário
     * @param {File} arquivo - Arquivo .txt com códigos e quantidades
     * @param {object} config - Configuração do layout
     * @param {number} config.id_empresa - ID da empresa
     * @param {number} config.id_almoxarifado - ID do almoxarifado
     * @param {string} config.layout_utilizado - Tipo de layout
     * @param {boolean} config.usar_separador - Usar separador
     * @param {string} [config.separador_char] - Caractere separador
     * @param {number} [config.layout_dig_prod] - Dígitos do produto (tamanho fixo)
     * @param {number} [config.layout_dig_qtd] - Dígitos da quantidade (tamanho fixo)
     */
    async processarArquivoInventario(arquivo, config) {
      if (!arquivo || !config.id_empresa || !config.id_almoxarifado || !config.layout_utilizado) {
        toast.error('Parâmetros inválidos para processar arquivo')
        return
      }

      this.loading = true
      try {
        const formData = new FormData()
        formData.append('arquivo', arquivo)
        formData.append('id_empresa', config.id_empresa)
        formData.append('id_almoxarifado', config.id_almoxarifado)
        formData.append('layout_utilizado', config.layout_utilizado)
        formData.append('usar_separador', config.usar_separador ? '1' : '0')

        if (config.usar_separador && config.separador_char) {
          formData.append('separador_char', config.separador_char)
        }
        if (!config.usar_separador) {
          formData.append('layout_dig_prod', config.layout_dig_prod || '0')
          formData.append('layout_dig_qtd', config.layout_dig_qtd || '0')
        }

        const response = await apiPhp.post('/estoque/inventarios/processar-arquivo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        return response.data?.data ?? response.data ?? null
      } catch (error) {
        toast.error('Erro ao processar arquivo')
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Limpa o estado do store
     */
    /**
     * Busca um produto no catálogo de referência pelo GTIN (código de barras)
     * @param {string} gtin - Código de barras do produto
     */
    async buscarProdutoReferencia(gtin) {
      if (!gtin) return null

      try {
        const response = await apiPhp.get(`/estoque/produtos/referencia/${gtin}`)
        return response.data?.data ?? response.data ?? null
      } catch (error) {
        if (error.response?.status === 404) return null
        throw error
      }
    },

    /**
     * Importa um produto do catálogo de referência
     * @param {string} gtin - Código de barras do produto
     */
    async importarProdutoReferencia(gtin) {
      if (!gtin) return null

      try {
        const response = await apiPhp.post('/estoque/produtos/importar', { codigo_gtin: gtin })
        return response.data?.data ?? response.data ?? null
      } catch (error) {
        toast.error('Erro ao importar produto')
        throw error
      }
    },

    limparEstado() {
      this.inventarios = []
      this.inventarioAtual = null
      this.loading = false
    }
  }
})
