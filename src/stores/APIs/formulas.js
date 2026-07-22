import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiPhp from '@/services/apiPhp'

export const useFormulasStore = defineStore('formulas', () => {
  const loading = ref(false)
  const formulas = ref([])

  // GET /formulas
  const buscarFormulas = async () => {
    loading.value = true
    try {
      const response = await apiPhp.get('/formulas')
      formulas.value = Array.isArray(response.data) ? response.data : response.data?.data || []
    } catch (error) {
      formulas.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  // POST /formulas
  const criarFormula = async (payload) => {
    loading.value = true
    try {
      const response = await apiPhp.post('/formulas', payload)
      return response.data
    } finally {
      loading.value = false
    }
  }

  // PUT /formulas/:id
  const atualizarFormula = async (id, payload) => {
    loading.value = true
    try {
      const response = await apiPhp.put(`/formulas/${id}`, payload)
      return response.data
    } finally {
      loading.value = false
    }
  }

  // DELETE /formulas/:id
  const deletarFormula = async (id) => {
    loading.value = true
    try {
      await apiPhp.delete(`/formulas/${id}`)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    formulas,
    buscarFormulas,
    criarFormula,
    atualizarFormula,
    deletarFormula,
  }
})
