import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiPhp from '@/services/apiPhp'

export const useMensagensStore = defineStore('mensagens', () => {
  const loading = ref(false)
  const mensagens = ref([])

  // GET /manutencao/mensagens/:idEmpresa
  const buscarMensagens = async (idEmpresa) => {
    loading.value = true
    try {
      const response = await apiPhp.get(`/manutencao/mensagens/${idEmpresa}`)
      mensagens.value = Array.isArray(response.data) ? response.data : response.data?.data || []
    } catch (error) {
      mensagens.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  // POST /manutencao/mensagens
  const criarMensagem = async (payload) => {
    loading.value = true
    try {
      const response = await apiPhp.post('/manutencao/mensagens', payload)
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // PUT /manutencao/mensagens/:idEmpresa/:id
  const atualizarMensagem = async (idEmpresa, id, payload) => {
    loading.value = true
    try {
      const response = await apiPhp.put(`/manutencao/mensagens/${idEmpresa}/${id}`, payload)
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // DELETE /manutencao/mensagens/:idEmpresa/:id
  const deletarMensagem = async (idEmpresa, id) => {
    loading.value = true
    try {
      await apiPhp.delete(`/manutencao/mensagens/${idEmpresa}/${id}`)
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    mensagens,
    buscarMensagens,
    criarMensagem,
    atualizarMensagem,
    deletarMensagem,
  }
})
