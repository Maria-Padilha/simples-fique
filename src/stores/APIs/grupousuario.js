import { defineStore } from "pinia"
import apiPhp from "@/services/apiPhp";

const errorMessages = {
    "The name field is required.": "O campo nome é obrigatório!",
};

export const useGrupoUsuarioStore = defineStore('grupousuario', {
    state: () => ({
        loading: false,
        errorMessage: '',
        successMessage: '',

        gruposUsuario: [],
        grupoUsuario: null,

        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 15,
    }),

    actions: {
        async buscarTodosGruposUsuario(page = 1) {
            this.loading = true;

            try {
                const response = await apiPhp.get('/manutencao/grupo-usuarios', {
                    params: { page }
                });

                const pag = response.pagination;
                if (pag) {
                    this.currentPage = pag.current_page;
                    this.lastPage = pag.last_page;
                    this.total = pag.total;
                    this.perPage = pag.per_page;
                }

                const data = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
                this.gruposUsuario = data.map(item => ({
                    id: item.id,
                    nome: item.nome || item.descgrupousuario,
                    descricao: item.descricao || item.observacao || '',
                    usuario: item.usuario,
                    data_criacao: item.created_at || item.dhinc,
                    dhinc: item.dhinc || item.created_at
                }));

                this.errorMessage = '';

            } catch (error) {
                this.errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async buscarGrupoUsuarioId(id) {
            this.loading = true;

            try {
                const response = await apiPhp.get(`/manutencao/grupo-usuarios/${id}`);

                this.grupoUsuario = response.data?.data ?? response.data;
                this.errorMessage = '';

                this.records = response.data?.total || 0;

            } catch (error) {
                this.errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async cadastrarGrupoUsuario(id, observacao, descgrupousuario) {
            this.loading = true;
            this.successMessage = '';
            this.errorMessage = '';
            try {
                await apiPhp.post('/manutencao/grupo-usuarios', { observacao, descgrupousuario });

                await this.buscarTodosGruposUsuario();
                this.successMessage = 'Grupo de usuário cadastrado com sucesso!';

            } catch (error) {
                const data = error?.response?.data;
                if (data?.errors) {
                    this.fieldErrors = {};
                    Object.keys(data.errors).forEach(field => {
                        this.fieldErrors[field] = data.errors[field].map(errorMsg => {
                            this.errorMessage = errorMessages[errorMsg] || errorMsg;
                            return errorMessages[errorMsg] || errorMsg;
                        });
                    });
                } else {
                    this.errorMessage = data?.erro || data?.message || error?.message || 'Desculpe, ocorreu um erro ao cadastrar o Grupo de usuário. Entre em contato com nosso suporte.';
                }
            } finally {
                this.loading = false;
            }
        },

        async alterarGrupoUsuario(id, observacao, descgrupousuario) {
            this.loading = true;
            this.successMessage = '';
            this.errorMessage = '';
            try {
                await apiPhp.put(`/manutencao/grupo-usuarios/${id}`, { observacao, descgrupousuario });

                await this.buscarTodosGruposUsuario();
                this.successMessage = 'Grupo de usuário atualizado com sucesso!';

            } catch (error) {
                const data = error?.response?.data;
                if (data?.errors) {
                    this.fieldErrors = {};
                    Object.keys(data.errors).forEach(field => {
                        this.fieldErrors[field] = data.errors[field].map(errorMsg => {
                            this.errorMessage = errorMessages[errorMsg] || errorMsg;
                            return errorMessages[errorMsg] || errorMsg;
                        });
                    });
                } else {
                    this.errorMessage = data?.erro || data?.message || error?.message || 'Desculpe, ocorreu um erro ao atualizar o Grupo de usuário. Entre em contato com nosso suporte.';
                }
            } finally {
                this.loading = false;
            }
        },

        async deleteGrupoUsuario(id) {
            this.loading = true;
            this.successMessage = '';
            this.errorMessage = '';
            try {
                await apiPhp.delete(`/manutencao/grupo-usuarios/${id}`);

                await this.buscarTodosGruposUsuario();
                this.successMessage = 'Grupo de usuário deletado com sucesso!';
            } catch (error) {
                const data = error?.response?.data;
                this.errorMessage = data?.erro || data?.message || error?.message || 'Erro desconhecido';
            } finally {
                this.loading = false;
            }
        },

        async buscarPermissoesModulo(idGrupo, codigoModulo) {
            this.loading = true
            try {
                const response = await apiPhp.get(
                    `/manutencao/grupo-usuario-programas/${idGrupo}/modulo/${codigoModulo}`
                )
                const dados = Array.isArray(response.data) ? response.data : []
                return dados
            } catch (error) {
                this.errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido'
                return []
            } finally {
                this.loading = false
            }
        },

        async salvarPermissoes(idGrupo, payload) {
            try {
                await apiPhp.post(
                    `/manutencao/grupo-usuario-programas/${idGrupo}`,
                    payload
                )
                this.successMessage = 'Permissões atualizadas com sucesso'
                this.errorMessage = ''
            } catch (error) {
                this.errorMessage = error?.response?.data?.message || error?.message || 'Erro ao salvar permissões'
                this.successMessage = ''
                throw error
            }
        }
    }
})
