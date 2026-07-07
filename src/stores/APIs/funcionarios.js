import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiPhp from '@/services/apiPhp'

export const useFuncionariosStore = defineStore('funcionarios', () => {
  const loading = ref(false)
  const funcionarios = ref([])

  const buscarFuncionarios = async () => {
    loading.value = true
    try {
      const resp = await apiPhp.get('/manutencao/funcionarios')
      funcionarios.value = Array.isArray(resp.data) ? resp.data : resp.data?.data || []
    } catch (e) {
      console.error(e)
      funcionarios.value = []
    } finally {
      loading.value = false
    }
  }

  const criarFuncionario = async (payload) => {
    loading.value = true
    try {
      const resp = await apiPhp.post('/manutencao/funcionarios', payload)
      return resp.data
    } finally {
      loading.value = false
    }
  }

  const atualizarFuncionario = async (id, payload) => {
    loading.value = true
    try {
      const resp = await apiPhp.put(`/manutencao/funcionarios/${id}`, payload)
      return resp.data
    } finally {
      loading.value = false
    }
  }

  const inativarFuncionario = async (id) => {
    loading.value = true
    try {
      await apiPhp.delete(`/manutencao/funcionarios/${id}`)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    funcionarios,
    buscarFuncionarios,
    criarFuncionario,
    atualizarFuncionario,
    inativarFuncionario
  }
})
