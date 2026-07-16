import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiPhp from '@/services/apiPhp'
import { toast } from 'vue3-toastify'

export const useCertificadosStore = defineStore('certificados', () => {
  const loading = ref(false)
  const certificados = ref([])

  const buscarCertificados = async () => {
    loading.value = true
    try {
      const resp = await apiPhp.get('/manutencao/certificados')
      certificados.value = Array.isArray(resp.data)
        ? resp.data
        : resp.data?.data || []
    } catch (e) {
      console.error('Erro ao buscar certificados:', e)
      certificados.value = []
    } finally {
      loading.value = false
    }
  }

  const cadastrarCertificado = async (formData) => {
    loading.value = true
    try {
      await apiPhp.post('/manutencao/certificados', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Certificado cadastrado com sucesso!')
      await buscarCertificados()
      return true
    } catch (e) {
      const msg = e?.validationMessage
        || e?.response?.data?.erro
        || e?.response?.data?.message
        || 'Erro ao cadastrar certificado'
      toast.error(msg)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    certificados,
    buscarCertificados,
    cadastrarCertificado
  }
})
