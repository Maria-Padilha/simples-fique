import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiPhp from '@/services/apiPhp'

export const useContadoresStore = defineStore('contadores', () => {
  const loading = ref(false)
  const contadores = ref([])

  const buscarContadores = async (params = {}) => {
    loading.value = true
    try {
      const resp = await apiPhp.get('/manutencao/contadores', { params })
      const lista = Array.isArray(resp.data) ? resp.data : resp.data?.data || []
      contadores.value = lista.map((c) => ({
        ...c,
        id_pessoa: c.id_pessoa ?? c.pessoa?.id ?? c.id,
        pessoa_nome: c.pessoa?.nome_razao || c.pessoa_nome || '',
        pessoa_cpf_cnpj: c.pessoa?.cpf_cnpj || '',
        pessoa_tipo: c.pessoa?.tipo_pessoa || '',
        ativo: c.pessoa?.ativo === 'S',
      }))
    } catch (e) {
      console.error(e)
      contadores.value = []
    } finally {
      loading.value = false
    }
  }

  const buscarContadorPorId = async (id) => {
    loading.value = true
    try {
      const resp = await apiPhp.get(`/manutencao/contadores/${id}`)
      return resp.data?.data ?? resp.data
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const criarContador = async (payload) => {
    loading.value = true
    try {
      const resp = await apiPhp.post('/manutencao/contadores', payload)
      return resp.data
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const atualizarContador = async (id, payload) => {
    loading.value = true
    try {
      const resp = await apiPhp.put(`/manutencao/contadores/${id}`, payload)
      return resp.data
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const inativarContador = async (id) => {
    loading.value = true
    try {
      await apiPhp.delete(`/manutencao/contadores/${id}`)
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const reativarContador = async (id) => {
    loading.value = true
    try {
      const resp = await apiPhp.post(`/manutencao/contadores/${id}/reativar`)
      return resp.data
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading, contadores,
    buscarContadores, buscarContadorPorId, criarContador, atualizarContador, inativarContador, reativarContador
  }
})
