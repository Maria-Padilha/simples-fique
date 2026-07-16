import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiPhp from '@/services/apiPhp'

export const useClientesStore = defineStore('clientes', () => {
  const loading = ref(false)
  const clientes = ref([])

  const buscarClientes = async (params = {}) => {
    loading.value = true
    try {
      const resp = await apiPhp.get('/manutencao/pessoa-clientes', { params })
      const lista = Array.isArray(resp.data) ? resp.data : resp.data?.data || []
      clientes.value = lista.map((c) => ({
        ...c,
        ativo: c.ativo === 'S' || c.ativo === true,
      }))
    } catch (e) {
      console.error(e)
      clientes.value = []
    } finally {
      loading.value = false
    }
  }

  const buscarClientePorId = async (id) => {
    loading.value = true
    try {
      const resp = await apiPhp.get(`/manutencao/pessoa-clientes/${id}`)
      return resp.data?.data ?? resp.data
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const criarCliente = async (payload) => {
    loading.value = true
    try {
      const resp = await apiPhp.post('/manutencao/pessoa-clientes', payload)
      return resp.data
    } finally {
      loading.value = false
    }
  }

  const atualizarCliente = async (id, payload) => {
    loading.value = true
    try {
      const resp = await apiPhp.put(`/manutencao/pessoa-clientes/${id}`, payload)
      return resp.data
    } finally {
      loading.value = false
    }
  }

  const inativarCliente = async (id) => {
    loading.value = true
    try {
      const resp = await apiPhp.post(`/manutencao/pessoa-clientes/${id}/inativar`)
      return resp.data
    } finally {
      loading.value = false
    }
  }

  const reativarCliente = async (id) => {
    loading.value = true
    try {
      const resp = await apiPhp.post(`/manutencao/pessoa-clientes/${id}/reativar`)
      return resp.data
    } finally {
      loading.value = false
    }
  }

  // Exclusão permanente — backend bloqueia (422) se o cliente tiver
  // contas a receber ou adiantamentos vinculados
  const excluirCliente = async (id) => {
    loading.value = true
    try {
      await apiPhp.delete(`/manutencao/pessoa-clientes/${id}`)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    clientes,
    buscarClientes,
    buscarClientePorId,
    criarCliente,
    atualizarCliente,
    inativarCliente,
    reativarCliente,
    excluirCliente
  }
})
