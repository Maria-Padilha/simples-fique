import {defineStore} from "pinia"
import apiPhp from "@/services/apiPhp";

export const usePessoasStore = defineStore('pessoas', {
    state: () => ({
        loading: false,
        token: localStorage.getItem('token'),

        errorMessage: '',
        successMessage: '',

        pessoas: [],
        pessoa: null
    }),

    actions: {
        async cadastrarPessoa (data, find = "") {
            this.loading = true;
            try {
                await apiPhp.post('/manutencao/pessoas', data);
                await this.buscarTodasPessoas(find);
            } catch (error) {
                // Error handled by caller
            }
            finally {
                this.loading = false;
            }
        },

        async salvarPessoa (formRef, form, editando = false, snackbar = null) {
            const validation = await formRef?.validate()
            if (validation && !validation.valid) return

            // Clonar para sair do Proxy reativo e evitar mutação na tela
            const rawForm = JSON.parse(JSON.stringify(form))

            // Limpar máscaras
            rawForm.cpf_cnpj = (rawForm.cpf_cnpj || '').replace(/\D/g, '')
            rawForm.telefone  = (rawForm.telefone  || '').replace(/\D/g, '')
            rawForm.celular   = (rawForm.celular   || '').replace(/\D/g, '')
            rawForm.whats     = (rawForm.whats     || '').replace(/\D/g, '')

            // Separar enderecos e descartar campos obsoletos
            const { enderecos = [], ...pessoaData } = rawForm
            delete pessoaData.data
            delete pessoaData.latitude
            delete pessoaData.longitude
            delete pessoaData.cliente
            delete pessoaData.fornecedor
            delete pessoaData.transportadora
            delete pessoaData.colaborador
            delete pessoaData.representante
            delete pessoaData.id_red_ctb_cli
            delete pessoaData.id_red_ctb_for

            const payload = {
                ...pessoaData,
                // eslint-disable-next-line no-unused-vars
                endereco: enderecos.map(({ _buscandoCep, ...e }) => e)
            }

            this.loading = true
            try {
                if (editando) {
                    await apiPhp.put(`/manutencao/pessoas/${rawForm.id}`, payload)
                    snackbar.message = 'Cliente atualizado com sucesso!'
                } else {
                    await apiPhp.post('/manutencao/pessoas', payload)
                    snackbar.message = 'Cliente criado com sucesso!'
                }
                snackbar.color = 'success'
                snackbar.show = true
                await this.buscarTodasPessoas();
            } catch (e) {
                this.errorMessage = 'Erro ao salvar cliente!'
                snackbar.message = 'Erro ao salvar cliente'
                snackbar.color = 'error'
                snackbar.show = true
            } finally {
                this.loading = false
            }
        },

        async buscarTodasPessoas(find = "") {
            this.loading = true
            try {
                const resp = await apiPhp.get('/manutencao/pessoas', { params: { find } })
                const data = resp.data?.data ?? resp.data ?? []
                this.pessoas = Array.isArray(data) ? data : []
            } catch (e) {
                this.pessoas = []
            } finally {
                this.loading = false
            }
        },

        async buscarpessoaId(id) {
            this.loading = true;
            try {
                const response = await apiPhp.get(`/manutencao/pessoas/${id}`);
                const data = response.data?.data ?? response.data ?? null;
                const pessoa = data ?? null
                const endereco = data?.endereco ?? []
                this.pessoa = pessoa
                this.errorMessage = '';
                return {
                    pessoa,
                    endereco,
                    dadosFornecedor: data?.dadosFornecedor ?? null,
                    dadosCliente: data?.dadosCliente ?? null,
                    dadosContador: data?.dadosContador ?? null,
                    dadosTransportador: data?.dadosTransportador ?? null,
                    dadosRepresentante: data?.dadosRepresentante ?? null,
                    dadosFuncionario: data?.dadosFuncionario ?? null,
                }
            } catch (error) {
                this.errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
                return null
            } finally {
                this.loading = false;
            }
        },

        async deletarPessoa(id, snackbar) {
            this.loading = true
            try {
                await apiPhp.delete(`/manutencao/pessoas/${id}`)
                snackbar.message = 'Cliente inativado com sucesso'
                snackbar.color = 'success'
                snackbar.show = true
                await this.buscarTodasPessoas();
            } catch (e) {
                snackbar.message = 'Erro ao inativar cliente'
                snackbar.color = 'error'
                snackbar.show = true
            } finally {
                this.loading = false
            }
        },

        async importarPessoasCSV(pessoas) {
            this.loading = true
            try {
                const pessoasProcessadas = pessoas.map(pessoa => ({
                    ...pessoa,
                    cpf_cnpj: pessoa.cpf_cnpj?.replace(/\D/g, '') || '',
                    telefone: pessoa.telefone?.replace(/\D/g, '') || '',
                    celular: pessoa.celular?.replace(/\D/g, '') || '',
                    whats: pessoa.whats?.replace(/\D/g, '') || '',
                    ativo: pessoa.ativo || 'S'
                }))

                await apiPhp.post('/manutencao/pessoas/importar', pessoasProcessadas)
                
                this.errorMessage = ''
            } catch (e) {
                this.errorMessage = 'Erro ao importar pessoas'
                throw e
            } finally {
                this.loading = false
            }
        }
    }
})