import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiPhp from '@/services/apiPhp'

export const useFornecedoresStore = defineStore('fornecedores', () => {
  const loading = ref(false)
  const fornecedores = ref([])

  const buscarFornecedores = async (params = {}) => {
    loading.value = true
    try {
      const resp = await apiPhp.get('/manutencao/fornecedores', { params })
      const lista = Array.isArray(resp.data) ? resp.data : resp.data?.data || []
      fornecedores.value = lista.map((f) => ({
        ...f,
        id_pessoa: f.id_pessoa ?? f.pessoa?.id ?? f.id,
        pessoa_nome: f.pessoa?.nome_razao || f.pessoa_nome || '',
        pessoa_cpf_cnpj: f.pessoa?.cpf_cnpj || '',
        pessoa_tipo: f.pessoa?.tipo_pessoa || '',
        ativo: f.pessoa?.ativo === 'S',
      }))
    } catch (e) {
      console.error(e)
      fornecedores.value = []
    } finally {
      loading.value = false
    }
  }

  const buscarFornecedorPorId = async (id) => {
    loading.value = true
    try {
      const resp = await apiPhp.get(`/manutencao/fornecedores/${id}`)
      return resp.data
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const criarFornecedor = async (payload) => {
    loading.value = true
    try {
      const resp = await apiPhp.post('/manutencao/fornecedores', payload)
      return resp.data
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const atualizarFornecedor = async (id, payload) => {
    loading.value = true
    try {
      const resp = await apiPhp.put(`/manutencao/fornecedores/${id}`, payload)
      return resp.data
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const inativarFornecedor = async (id) => {
    loading.value = true
    try {
      await apiPhp.delete(`/manutencao/fornecedores/${id}`)
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading, fornecedores,
    buscarFornecedores, buscarFornecedorPorId, criarFornecedor, atualizarFornecedor, inativarFornecedor
  }
})
