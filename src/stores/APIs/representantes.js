import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiPhp from '@/services/apiPhp'

export const useRepresentantesStore = defineStore('representantes', () => {
  const loading = ref(false)
  const representantes = ref([])

  const buscarRepresentantes = async (params = {}) => {
    loading.value = true
    try {
      const resp = await apiPhp.get('/manutencao/representantes', { params })
      const lista = Array.isArray(resp.data) ? resp.data : resp.data?.data || []
      representantes.value = lista.map((r) => ({
        ...r,
        id_pessoa: r.id_pessoa ?? r.pessoa?.id ?? r.id,
        pessoa_nome: r.pessoa?.nome_razao || r.pessoa_nome || '',
        pessoa_cpf_cnpj: r.pessoa?.cpf_cnpj || '',
        pessoa_tipo: r.pessoa?.tipo_pessoa || '',
        ativo: r.pessoa?.ativo === 'S',
      }))
    } catch (e) {
      console.error(e)
      representantes.value = []
    } finally {
      loading.value = false
    }
  }

  const buscarRepresentantePorId = async (id) => {
    loading.value = true
    try {
      const resp = await apiPhp.get(`/manutencao/representantes/${id}`)
      return resp.data
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const criarRepresentante = async (payload) => {
    loading.value = true
    try {
      const resp = await apiPhp.post('/manutencao/representantes', payload)
      return resp.data
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const atualizarRepresentante = async (id, payload) => {
    loading.value = true
    try {
      const resp = await apiPhp.put(`/manutencao/representantes/${id}`, payload)
      return resp.data
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const inativarRepresentante = async (id) => {
    loading.value = true
    try {
      await apiPhp.delete(`/manutencao/representantes/${id}`)
    } catch (e) {
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading, representantes,
    buscarRepresentantes, buscarRepresentantePorId, criarRepresentante, atualizarRepresentante, inativarRepresentante
  }
})
