import { ref } from 'vue'
import { defineStore } from 'pinia'
import apiPhp from '@/services/apiPhp'

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
      const resp = await apiPhp.post('/manutencao/certificados', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await buscarCertificados()
      return resp.data
    } finally {
      loading.value = false
    }
  }

  const ativarCertificado = async (idCertificado) => {
    loading.value = true
    try {
      const resp = await apiPhp.post(`/manutencao/certificados/${idCertificado}/ativar`)
      await buscarCertificados()
      return resp.data
    } finally {
      loading.value = false
    }
  }

  const inativarCertificado = async (idCertificado) => {
    loading.value = true
    try {
      const resp = await apiPhp.post(`/manutencao/certificados/${idCertificado}/inativar`)
      await buscarCertificados()
      return resp.data
    } finally {
      loading.value = false
    }
  }

  const excluirCertificado = async (idCertificado) => {
    loading.value = true
    try {
      const resp = await apiPhp.delete(`/manutencao/certificados/${idCertificado}`)
      await buscarCertificados()
      return resp.data
    } finally {
      loading.value = false
    }
  }

  const buscarCertificadoPorId = async (idCertificado) => {
    loading.value = true
    try {
      const resp = await apiPhp.get(`/manutencao/certificados/${idCertificado}`)
      return resp.data?.data ?? resp.data
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    certificados,
    buscarCertificados,
    buscarCertificadoPorId,
    cadastrarCertificado,
    ativarCertificado,
    inativarCertificado,
    excluirCertificado
  }
})
