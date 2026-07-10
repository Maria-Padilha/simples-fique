import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiPhp from '@/services/apiPhp'

export const useClientesStore = defineStore('clientes', () => {
  const loading = ref(false)
  const clientes = ref([])

  const buscarClientes = async () => {
    loading.value = true
    try {
      const resp = await apiPhp.get('/manutencao/pessoa-clientes')
      clientes.value = Array.isArray(resp.data) ? resp.data : resp.data?.data || []
    } catch (e) {
      console.error(e)
      clientes.value = []
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
      await apiPhp.delete(`/manutencao/pessoa-clientes/${id}`)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    clientes,
    buscarClientes,
    criarCliente,
    atualizarCliente,
    inativarCliente
  }
})
