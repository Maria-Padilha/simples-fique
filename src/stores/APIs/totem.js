import { defineStore } from 'pinia'
import apiPhp from '@/services/apiPhp'
import { toast } from 'vue3-toastify'

export const useTotemStore = defineStore('totem', {
  state: () => ({
    loading: false,
    terminais: [],
    terminalSelecionado: null,
    ambientes: [],
    menus: [],
    mesas: [],
    funcionariosVinculados: [],
    produtosCatalogo: [],
    produtosVinculados: [],
    grupos: [],
    funcionariosTodos: [],
    errorMessage: '',
    successMessage: ''
  }),

  actions: {

    // ========== TERMINAIS ==========

    /**
     * LISTAR TERMINAIS
     * GET /api/v1/admin/terminais-venda
     *
     * @return {Promise<void>}
     */
    async listarTerminais() {
      this.loading = true

      try {
        const { data } = await apiPhp.get('/admin/terminais-venda')

        this.terminais = Array.isArray(data) ? data : data.data ?? []
        this.errorMessage = ''
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Erro ao buscar terminais'
        console.error('Erro ao listar terminais:', error)
        toast.error(this.errorMessage)
      } finally {
        this.loading = false
      }
    },

    /**
     * CARREGAR CONFIGURAÇÃO COMPLETA DO TERMINAL
     * Faz GET em paralelo para ambientes, menus, produtos-catálogo, produtos-vinculados,
     * grupos, mesas, funcionários vinculados e todos os funcionários da empresa.
     *
     * @param {number} terminalId
     * @return {Promise<void>}
     */
    async carregarConfigTerminal(terminalId) {
      const safe = promise => promise.catch(() => ({ data: [] }))

      const [
        respAmbientes,
        respMenus,
        respProdutos,
        respVinculados,
        respGrupos,
        respMesas,
        respFuncVinculados,
        respFuncTodos
      ] = await Promise.all([
        safe(apiPhp.get(`/admin/terminais-venda/${terminalId}/ambientes`)),
        safe(apiPhp.get(`/admin/terminais-venda/${terminalId}/menus`)),
        safe(apiPhp.get('/admin/produtos-catalogo')),
        safe(apiPhp.get(`/admin/terminais-venda/${terminalId}/produtos-vinculados`)),
        safe(apiPhp.get('/estoque/grupos')),
        safe(apiPhp.get(`/admin/terminais-venda/${terminalId}/mesas`)),
        safe(apiPhp.get(`/admin/terminais-venda/${terminalId}/funcionarios`)),
        safe(apiPhp.get('/manutencao/funcionarios'))
      ])

      this.ambientes = respAmbientes.data?.data ?? respAmbientes.data ?? []
      this.menus = respMenus.data?.data ?? respMenus.data ?? []
      this.mesas = respMesas.data?.data ?? respMesas.data ?? []
      this.funcionariosVinculados = respFuncVinculados.data?.data ?? respFuncVinculados.data ?? []

      const rawGrupos = respGrupos.data?.data ?? respGrupos.data ?? []
      this.grupos = Array.isArray(rawGrupos) ? rawGrupos : []

      const rawProdutos = respProdutos.data?.data ?? respProdutos.data ?? []
      this.produtosCatalogo = Array.isArray(rawProdutos) ? rawProdutos : []

      const rawVinculados = respVinculados.data?.data ?? respVinculados.data ?? []
      this.produtosVinculados = Array.isArray(rawVinculados) ? rawVinculados : []

      const todosFuncionarios = respFuncTodos.data?.data ?? respFuncTodos.data ?? []
      this.funcionariosTodos = Array.isArray(todosFuncionarios) ? todosFuncionarios : []
    },

    /**
     * SALVAR TERMINAL (POST ou PUT)
     * POST /api/v1/admin/terminais-venda
     * PUT  /api/v1/admin/terminais-venda/:id
     *
     * @param {Object} formData - dados do terminal
     * @return {Promise<Object|null>}
     */
    async salvarTerminal(formData) {
      this.loading = true

      try {
        const payload = {
          nome: formData.descricao,
          codigo: formData.codigo,
          status: formData.ativo ? 'ativo' : 'inativo',
          permite_sincronizacao: formData.permite_sincronizacao,
          emite_cupom_fiscal: formData.emite_cupom_fiscal,
          emite_ticket: formData.emite_ticket,
          modo_ticket: formData.modo_ticket,
          valor_couvert_padrao: formData.valor_couvert_padrao || 0,
          percentual_taxa_servico_padrao: formData.percentual_taxa_servico_padrao || 0
        }

        if (formData.senha_terminal) {
          payload.senha_operacional = formData.senha_terminal
        }

        let response

        if (formData.id) {
          response = await apiPhp.put(`/admin/terminais-venda/${formData.id}`, payload)
          this.successMessage = 'Terminal atualizado com sucesso!'
        } else {
          response = await apiPhp.post('/admin/terminais-venda', payload)
          this.successMessage = 'Terminal cadastrado com sucesso!'
        }

        this.errorMessage = ''
        toast.success(this.successMessage)

        return response.data
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao salvar terminal'
        console.error('Erro ao salvar terminal:', error)
        toast.error(this.errorMessage)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * EXCLUIR TERMINAL
     * DELETE /api/v1/admin/terminais-venda/:id
     *
     * @param {number} id
     * @return {Promise<boolean>}
     */
    async excluirTerminal(id) {
      this.loading = true

      try {
        await apiPhp.delete(`/admin/terminais-venda/${id}`)

        this.successMessage = 'Terminal excluído com sucesso!'
        this.errorMessage = ''
        toast.success(this.successMessage)

        return true
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao excluir terminal'
        console.error('Erro ao excluir terminal:', error)
        toast.error(this.errorMessage)
        return false
      } finally {
        this.loading = false
      }
    },

    // ========== AMBIENTES ==========

    /**
     * SALVAR AMBIENTE
     * POST /api/v1/admin/terminais-venda/:id/ambientes
     *
     * @param {number} terminalId
     * @param {Object} payload - { nome, tipo, controla_comandas, exibe_painel_chamados }
     * @return {Promise<Object|null>}
     */
    async salvarAmbiente(terminalId, payload) {
      try {
        const response = await apiPhp.post(`/admin/terminais-venda/${terminalId}/ambientes`, payload)

        this.successMessage = 'Ambiente cadastrado com sucesso!'
        this.errorMessage = ''

        return response.data
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao salvar ambiente'
        console.error('Erro ao salvar ambiente:', error)
        throw error
      }
    },

    /**
     * REMOVER AMBIENTE
     * DELETE /api/v1/admin/terminais-venda-ambientes/:id
     *
     * @param {number} ambienteId
     * @return {Promise<boolean>}
     */
    async removerAmbiente(ambienteId) {
      try {
        await apiPhp.delete(`/admin/terminais-venda-ambientes/${ambienteId}`)

        this.successMessage = 'Ambiente removido com sucesso!'
        this.errorMessage = ''

        return true
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao remover ambiente'
        console.error('Erro ao remover ambiente:', error)
        throw error
      }
    },

    // ========== MENUS ==========

    /**
     * SALVAR MENU
     * POST /api/v1/admin/terminais-venda/:id/menus
     *
     * @param {number} terminalId
     * @param {Object} payload - { ambiente_id, nome, icone, ativo }
     * @return {Promise<Object|null>}
     */
    async salvarMenu(terminalId, payload) {
      try {
        const response = await apiPhp.post(`/admin/terminais-venda/${terminalId}/menus`, payload)

        this.successMessage = 'Menu cadastrado com sucesso!'
        this.errorMessage = ''

        return response.data
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao salvar menu'
        console.error('Erro ao salvar menu:', error)
        throw error
      }
    },

    /**
     * REMOVER MENU
     * DELETE /api/v1/admin/terminais-venda-menus/:id
     *
     * @param {number} menuId
     * @return {Promise<boolean>}
     */
    async removerMenu(menuId) {
      try {
        await apiPhp.delete(`/admin/terminais-venda-menus/${menuId}`)

        this.successMessage = 'Menu removido com sucesso!'
        this.errorMessage = ''

        return true
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao remover menu'
        console.error('Erro ao remover menu:', error)
        throw error
      }
    },

    // ========== PRODUTOS ==========

    /**
     * VINCULAR PRODUTO AO MENU
     * POST /api/v1/admin/terminais-venda-menus/:menuId/produtos
     *
     * @param {number} menuId
     * @param {Object} payload - { produto_id, ambiente_preparo_id, emite_ticket }
     * @return {Promise<Object|null>}
     */
    async vincularProduto(menuId, payload) {
      try {
        const response = await apiPhp.post(
          `/admin/terminais-venda-menus/${menuId}/produtos`,
          payload
        )

        this.successMessage = 'Produto vinculado com sucesso!'
        this.errorMessage = ''

        return response.data
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao vincular produto'
        console.error('Erro ao vincular produto:', error)
        throw error
      }
    },

    /**
     * VINCULAR GRUPO DE PRODUTOS AO MENU
     * POST /api/v1/admin/terminais-venda-menus/:menuId/produtos (múltiplas chamadas)
     *
     * @param {number} menuId
     * @param {Array} produtos - lista de { produto_id, ambiente_preparo_id, emite_ticket }
     * @return {Promise<void>}
     */
    async vincularGrupo(menuId, produtos) {
      try {
        await Promise.all(
          produtos.map(p =>
            apiPhp.post(`/admin/terminais-venda-menus/${menuId}/produtos`, p)
          )
        )

        this.successMessage = `${produtos.length} produto(s) vinculado(s) com sucesso!`
        this.errorMessage = ''
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao vincular grupo'
        console.error('Erro ao vincular grupo:', error)
        throw error
      }
    },

    /**
     * REMOVER PRODUTO VINCULADO
     * DELETE /api/v1/admin/terminais-venda-menu-produtos/:id
     *
     * @param {number} vinculoId
     * @return {Promise<boolean>}
     */
    async removerProdutoVinculado(vinculoId) {
      try {
        await apiPhp.delete(`/admin/terminais-venda-menu-produtos/${vinculoId}`)

        this.successMessage = 'Produto removido do menu com sucesso!'
        this.errorMessage = ''

        return true
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao remover produto vinculado'
        console.error('Erro ao remover produto vinculado:', error)
        throw error
      }
    },

    // ========== MESAS ==========

    /**
     * SALVAR MESA
     * POST /api/v1/admin/terminais-venda/:id/mesas
     *
     * @param {number} terminalId
     * @param {Object} payload - { numero, nome, capacidade, ambiente_id }
     * @return {Promise<Object|null>}
     */
    async salvarMesa(terminalId, payload) {
      try {
        const response = await apiPhp.post(`/admin/terminais-venda/${terminalId}/mesas`, payload)

        this.successMessage = 'Mesa cadastrada com sucesso!'
        this.errorMessage = ''

        return response.data
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao salvar mesa'
        console.error('Erro ao salvar mesa:', error)
        throw error
      }
    },

    /**
     * REMOVER MESA
     * DELETE /api/v1/admin/terminais-venda-mesas/:id
     *
     * @param {number} mesaId
     * @return {Promise<boolean>}
     */
    async removerMesa(mesaId) {
      try {
        await apiPhp.delete(`/admin/terminais-venda-mesas/${mesaId}`)

        this.successMessage = 'Mesa removida com sucesso!'
        this.errorMessage = ''

        return true
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao remover mesa'
        console.error('Erro ao remover mesa:', error)
        throw error
      }
    },

    // ========== FUNCIONÁRIOS ==========

    /**
     * VINCULAR FUNCIONÁRIO AO TERMINAL
     * POST /api/v1/admin/terminais-venda/:id/funcionarios
     *
     * @param {number} terminalId
     * @param {Object} payload - { funcionario_id, papel }
     * @return {Promise<Object|null>}
     */
    async vincularFuncionario(terminalId, payload) {
      try {
        const response = await apiPhp.post(
          `/admin/terminais-venda/${terminalId}/funcionarios`,
          payload
        )

        this.successMessage = 'Funcionário vinculado ao terminal com sucesso!'
        this.errorMessage = ''

        return response.data
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao vincular funcionário'
        console.error('Erro ao vincular funcionário:', error)
        throw error
      }
    },

    /**
     * REMOVER FUNCIONÁRIO VINCULADO
     * DELETE /api/v1/admin/terminais-venda-funcionarios/:id
     *
     * @param {number} vinculoId
     * @return {Promise<boolean>}
     */
    async removerFuncionario(vinculoId) {
      try {
        await apiPhp.delete(`/admin/terminais-venda-funcionarios/${vinculoId}`)

        this.successMessage = 'Funcionário desvinculado do terminal com sucesso!'
        this.errorMessage = ''

        return true
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || error.response?.data?.message || 'Erro ao desvincular funcionário'
        console.error('Erro ao desvincular funcionário:', error)
        throw error
      }
    }
  }
})
