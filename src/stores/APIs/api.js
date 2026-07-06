import {defineStore} from "pinia"
import api from "@/services/api";
import apiPhpModule from "@/services/apiPhp";
import {toast} from "vue3-toastify";

export const useApiStore = defineStore('api', {
    state: () => ({
        loading: false,
        token: localStorage.getItem('token'),

        errorMessage: '',
        successMessage: '',

        records: 0,

        dataEmpresa: null,
        tokenEmpresa: null,

        dataUsuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
        dataSaas: JSON.parse(localStorage.getItem('saas') || 'null'),
    }),

    actions: {
        async updateMe(payload) {
            this.loading = true;
            try {
                const response = await apiPhpModule.put('/auth/me', payload);
                const usuario = response.data?.usuario || response.data;
                if (usuario) {
                    this.dataUsuario = usuario;
                    localStorage.setItem('usuario', JSON.stringify(usuario));
                }
                toast.success('Perfil atualizado com sucesso!');
                return true;
            } catch (error) {
                const msg = error.response?.data?.message || 'Erro ao atualizar perfil.';
                toast.error(msg);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async fetchMe() {
            try {
                const response = await apiPhpModule.get('/auth/me');
                const { usuario, saas, empresas } = response.data;
                if (usuario) {
                    this.dataUsuario = usuario;
                    localStorage.setItem('usuario', JSON.stringify(usuario));
                }
                if (saas) {
                    this.dataSaas = saas;
                    localStorage.setItem('saas', JSON.stringify(saas));
                }
                if (empresas) {
                    localStorage.setItem('empresas', JSON.stringify(empresas));
                }
            } catch {
                // não bloqueia o fluxo de login
            }
        },

        // Auth headers injetados pelo interceptor de api.js — sem duplicação aqui
        async executarAcao(entidade, metodo, payload = null, id = null) {
            this.loading = true;
            this.successMessage = '';
            this.errorMessage = '';

            try {
                let response;
                const url = id ? `/${entidade}/${id}` : `/${entidade}`;

                switch (metodo) {
                    case 'post':
                        response = await api.post(url, payload);
                        this.successMessage = `${entidade} cadastrado(a) com sucesso!`;
                        toast.success(this.successMessage);
                        break;

                    case 'put':
                        response = await api.put(url, payload);
                        this.successMessage = `${entidade} atualizado(a) com sucesso!`;
                        toast.success(this.successMessage);
                        break;

                    case 'delete':
                        response = await api.delete(url);
                        this.successMessage = `${entidade} excluído(a) com sucesso!`;
                        toast.success(this.successMessage);
                        break;

                    default:
                        throw new Error('Método inválido. Use post, put ou delete.');
                }

                return response.data;

            } catch (error) {
                this.errorMessage = error.validationMessage
                    || error.response?.data?.message
                    || 'Erro na operação.';
                toast.error(this.errorMessage);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async buscarDados(entidade, {
            limit = 50,
            offset = 0,
            perPage,
            page,
            ignorarPaginacao = false,
            id = null,
            apiPhp = false
        } = {}) {
            this.loading = true;
            this.errorMessage = '';
            this.successMessage = '';

            try {
                const http = apiPhp ? apiPhpModule : api;
                let url;

                if (id) {
                    url = `/${entidade}/${id}`;
                } else if (ignorarPaginacao) {
                    url = `/${entidade}`;
                } else {
                    // page/per_page explicitos têm prioridade; senão converte de limit/offset
                    const finalPage = page ?? (Math.floor(offset / limit) + 1);
                    const finalPerPage = perPage ?? limit;

                    if (apiPhp) {
                        url = `/${entidade}?page=${finalPage}&per_page=${finalPerPage}`;
                    } else {
                        url = `/${entidade}?limit=${limit}&offset=${offset}`;
                    }
                }

                const response = await http.get(url);

                if (id) {
                    this.item = response.data.data;
                } else {
                    this[`${entidade}s`] = response.data.data;
                    this.records = response.data.total ?? response.data.records ?? 0;
                }

            } catch (error) {
                this.errorMessage = error.validationMessage
                    || error.response?.data?.message
                    || 'Erro ao buscar dados.';
            } finally {
                this.loading = false;
            }
        }
    }
})
