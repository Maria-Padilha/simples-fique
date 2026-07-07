import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiPhp from '@/services/apiPhp'

export const useGrupoTributacaoStore = defineStore('grupoTributacao', () => {
  const loading = ref(false)
  const grupos = ref([])

  // GET /manutencao/base-grupo-tributos
  const buscarGrupos = async () => {
    loading.value = true
    try {
      const response = await apiPhp.get('/manutencao/base-grupo-tributos')
      grupos.value = Array.isArray(response.data) ? response.data : response.data?.data || []
    } catch (error) {
      grupos.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  // GET /manutencao/base-grupo-tributos/:idEmp/:id
  const buscarGrupoPorId = async (idEmp, id) => {
    loading.value = true
    try {
      const response = await apiPhp.get(`/manutencao/base-grupo-tributos/${idEmp}/${id}`)
      return response.data
    } finally {
      loading.value = false
    }
  }

  // POST /manutencao/base-grupo-tributos
  const criarGrupo = async (payload) => {
    loading.value = true
    try {
      const response = await apiPhp.post('/manutencao/base-grupo-tributos', payload)
      return response.data
    } finally {
      loading.value = false
    }
  }

  // PUT /manutencao/base-grupo-tributos/:idEmp/:id
  const atualizarGrupo = async (idEmp, id, payload) => {
    loading.value = true
    try {
      const response = await apiPhp.put(`/manutencao/base-grupo-tributos/${idEmp}/${id}`, payload)
      return response.data
    } finally {
      loading.value = false
    }
  }

  // DELETE /manutencao/base-grupo-tributos/:idEmp/:id
  const deletarGrupo = async (idEmp, id) => {
    loading.value = true
    try {
      await apiPhp.delete(`/manutencao/base-grupo-tributos/${idEmp}/${id}`)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    grupos,
    buscarGrupos,
    buscarGrupoPorId,
    criarGrupo,
    atualizarGrupo,
    deletarGrupo,
  }
})
