import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiPhp from '@/services/apiPhp'

export const useUsuariosStore = defineStore('usuarios', () => {
    const loading = ref(false)
    const usuarios = ref([])
    const errorMessage = ref('')
    const successMessage = ref('')

    async function buscarUsuarios(params = {}) {
        loading.value = true
        try {
            const response = await apiPhp.get('/manutencao/usuarios', { params })
            const lista = Array.isArray(response.data) ? response.data : response.data?.data ?? []
            usuarios.value = lista.map((u) => ({
                ...u,
                ativo: u.ativo === 'S' || u.ativo === true,
            }))
            errorMessage.value = ''
        } catch (error) {
            errorMessage.value = error?.response?.data?.message || error?.message || 'Erro ao buscar usuários'
            usuarios.value = []
        } finally {
            loading.value = false
        }
    }

    async function buscarUsuarioPorId(id) {
        loading.value = true
        try {
            const response = await apiPhp.get(`/manutencao/usuarios/${id}`)
            return response.data?.data ?? response.data
        } catch (error) {
            errorMessage.value = error?.response?.data?.message || error?.message || 'Erro ao buscar usuário'
            throw error
        } finally {
            loading.value = false
        }
    }

    async function criarUsuario(payload) {
        loading.value = true
        try {
            const response = await apiPhp.post('/manutencao/usuarios', payload)
            successMessage.value = 'Usuário criado com sucesso!'
            errorMessage.value = ''
            return response.data
        } catch (error) {
            errorMessage.value = error?.response?.data?.message || error?.message || 'Erro ao criar usuário'
            throw error
        } finally {
            loading.value = false
        }
    }

    async function atualizarUsuario(id, payload) {
        loading.value = true
        try {
            const response = await apiPhp.put(`/manutencao/usuarios/${id}`, payload)
            successMessage.value = 'Usuário atualizado com sucesso!'
            errorMessage.value = ''
            return response.data
        } catch (error) {
            errorMessage.value = error?.response?.data?.message || error?.message || 'Erro ao atualizar usuário'
            throw error
        } finally {
            loading.value = false
        }
    }

    async function deletarUsuario(id) {
        loading.value = true
        try {
            await apiPhp.delete(`/manutencao/usuarios/${id}`)
            successMessage.value = 'Usuário excluído com sucesso!'
            errorMessage.value = ''
        } catch (error) {
            errorMessage.value = error?.response?.data?.message || error?.message || 'Erro ao excluir usuário'
            throw error
        } finally {
            loading.value = false
        }
    }

    async function reativarUsuario(id) {
        loading.value = true
        try {
            const response = await apiPhp.post(`/manutencao/usuarios/${id}/reativar`)
            return response.data
        } catch (error) {
            errorMessage.value = error?.response?.data?.message || error?.message || 'Erro ao reativar usuário'
            throw error
        } finally {
            loading.value = false
        }
    }

    async function buscarUsuarioEmpresas() {
        loading.value = true
        try {
            const response = await apiPhp.get('/manutencao/usuario-empresa')
            errorMessage.value = ''
            return Array.isArray(response.data) ? response.data : response.data?.data ?? []
        } catch (error) {
            errorMessage.value = error?.response?.data?.message || error?.message || 'Erro ao buscar empresas do usuário'
            throw error
        } finally {
            loading.value = false
        }
    }

    async function salvarUsuarioEmpresa(payload) {
        loading.value = true
        try {
            const response = await apiPhp.post('/manutencao/usuario-empresa', payload)
            successMessage.value = 'Vínculo empresa-usuário salvo com sucesso!'
            errorMessage.value = ''
            return response.data
        } catch (error) {
            errorMessage.value = error?.response?.data?.message || error?.message || 'Erro ao salvar vínculo empresa-usuário'
            throw error
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        usuarios,
        errorMessage,
        successMessage,
        buscarUsuarios,
        buscarUsuarioPorId,
        criarUsuario,
        atualizarUsuario,
        deletarUsuario,
        reativarUsuario,
        buscarUsuarioEmpresas,
        salvarUsuarioEmpresa,
    }
})
