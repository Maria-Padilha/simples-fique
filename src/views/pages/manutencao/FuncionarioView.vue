<template>
  <top-all-pages icon="mdi-account-hard-hat">
    <template #titulo>Funcionários</template>
    <template #section>
      <v-card class="background-secondary" elevation="0">
        <v-card-text class="pa-4">
          <BotaoExpandTransition
              :formulario-aberto="formularioAberto"
              texto-abrir="Novo Funcionário"
              texto-fechar="Cancelar"
              @toggle="toggleFormulario"
          />

          <v-expand-transition>
            <div v-if="formularioAberto">
              <v-card class="background-card mb-7" elevation="0">
                <v-card-title class="text-h6 pa-4">
                  <v-icon :icon="editando ? 'mdi-pencil' : 'mdi-plus'" class="mr-2"></v-icon>
                  {{ editando ? 'Editar Funcionário' : 'Novo Funcionário' }}
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-form ref="formRef" v-model="formValido">
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="form.nome"
                            label="Nome *"
                            :rules="[rules.required]"
                            maxlength="150"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-account"
                            class="required-left-border"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-select
                            v-model="form.id_empresa"
                            :items="empresas"
                            item-title="nome"
                            item-value="id"
                            label="Empresa *"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-office-building"
                            class="required-left-border"
                        ></v-select>
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model="form.cpf"
                            label="CPF"
                            maxlength="14"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-card-account-details-outline"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="2">
                        <v-text-field
                            v-model="form.telefone"
                            label="Telefone"
                            maxlength="20"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-phone"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model="form.cargo"
                            label="Cargo"
                            placeholder="Ex: Garçom, Cozinheiro"
                            maxlength="80"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-briefcase-outline"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model="form.data_admissao"
                            label="Data de admissão"
                            type="date"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-calendar"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-divider class="my-4"></v-divider>

                    <v-row>
                      <v-col cols="12">
                        <v-switch
                            v-model="form.acessa_sistema_terminal"
                            label="Acessa o sistema do terminal (totem/comandas/mesas)"
                            color="var(--text-color-laranja)"
                            hide-details
                        ></v-switch>
                        <p class="text-caption opacity-70 mt-1">
                          Cria um login restrito, que só acessa os apps de terminal — não o ERP administrativo.
                        </p>
                      </v-col>
                    </v-row>

                    <v-row v-if="form.acessa_sistema_terminal">
                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="form.email_login"
                            label="E-mail de login *"
                            :rules="[rules.required, rules.email]"
                            maxlength="120"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-email"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="form.senha"
                            :label="editando ? 'Nova senha (deixe em branco para manter)' : 'Senha *'"
                            :rules="editando ? [] : [rules.required, rules.senhaMinima]"
                            type="password"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-lock"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
                <v-card-actions class="pa-4">
                  <v-spacer></v-spacer>
                  <v-btn color="grey" variant="text" @click="cancelarFormulario">Cancelar</v-btn>
                  <v-btn
                      color="var(--text-color-laranja)"
                      :loading="loading"
                      :disabled="!formValido"
                      @click="salvarFuncionario"
                      variant="flat"
                      class="text-white">
                    {{ editando ? 'Atualizar' : 'Salvar' }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-expand-transition>

          <TabelaPadrao
              :formulario-aberto="formularioAberto"
              :headers="headers"
              :items="funcionarios"
              :loading="loading"
              :search="search"
              @update:search="(value) => search = value"
              search-label="Pesquisar funcionário"
              item-key="id"
              no-data-icon="mdi-account-hard-hat"
              no-data-text="Nenhum funcionário cadastrado"
              delete-title="Inativar"
              delete-tooltip="Inativar"
              delete-dialog-title="Inativar funcionário"
              delete-dialog-message="O funcionário não é removido — apenas fica inativo e perde o acesso ao terminal, se houver."
              delete-item-display-field="nome"
              @edit-item="editarFuncionario"
              @confirm-delete="inativarFuncionario"
          >
            <template v-slot:[`item.cargo`]="{ item }">
              {{ item.cargo || '—' }}
            </template>

            <template v-slot:[`item.acessa_sistema_terminal`]="{ item }">
              <v-chip :color="item.acessa_sistema_terminal ? 'info' : 'grey'" size="small" variant="tonal">
                {{ item.acessa_sistema_terminal ? 'Acessa terminal' : 'Sem acesso' }}
              </v-chip>
            </template>

            <template v-slot:[`item.ativo`]="{ item }">
              <v-chip :color="item.ativo ? 'success' : 'error'" size="small">
                {{ item.ativo ? 'Ativo' : 'Inativo' }}
              </v-chip>
            </template>
          </TabelaPadrao>
        </v-card-text>
      </v-card>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">{{ snackbar.message }}</v-snackbar>
    </template>
  </top-all-pages>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import BotaoExpandTransition from '@/components/base/padrao-paginas/BotaoExpandTransition.vue'
import TabelaPadrao from '@/components/base/padrao-paginas/TabelaPadrao.vue'
import TopAllPages from '@/components/base/padrao-paginas/TopAllPages.vue'
import { useFuncionariosStore } from '@/stores/APIs/funcionarios'
import { useEmpresaStore } from '@/stores/APIs/empresa'

const funcionariosStore = useFuncionariosStore()
const empresaStore = useEmpresaStore()

const funcionarios = computed(() => funcionariosStore.funcionarios)
const empresas = computed(() => empresaStore.empresas.map((e) => ({ id: e.id, nome: e.razao_social || e.fantasia || `Empresa ${e.id}` })))
const loading = computed(() => funcionariosStore.loading)
const search = ref('')

const formularioAberto = ref(false)
const formValido = ref(false)
const formRef = ref(null)
const editando = ref(false)

const form = reactive({
  id: null,
  id_empresa: null,
  nome: '',
  cpf: '',
  telefone: '',
  cargo: '',
  data_admissao: '',
  acessa_sistema_terminal: false,
  email_login: '',
  senha: ''
})

const snackbar = reactive({ show: false, message: '', color: 'success' })

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Nome', key: 'nome', sortable: true },
  { title: 'Cargo', key: 'cargo', sortable: true },
  { title: 'Acesso', key: 'acessa_sistema_terminal', sortable: false },
  { title: 'Status', key: 'ativo', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false }
]

const rules = {
  required: (v) => !!v || 'Campo obrigatório',
  email: (v) => !v || /\S+@\S+\.\S+/.test(v) || 'E-mail inválido',
  senhaMinima: (v) => !v || v.length >= 6 || 'A senha deve ter no mínimo 6 caracteres'
}

const buscarFuncionarios = async () => {
  await funcionariosStore.buscarFuncionarios()
}

const buscarEmpresas = async () => {
  await empresaStore.buscarTodasEmpresas()
}

const toggleFormulario = () => {
  if (formularioAberto.value) {
    cancelarFormulario()
  } else {
    editando.value = false
    resetarForm()
    formularioAberto.value = true
  }
}

const editarFuncionario = (item) => {
  editando.value = true
  Object.assign(form, {
    id: item.id,
    id_empresa: item.id_empresa,
    nome: item.nome,
    cpf: item.cpf || '',
    telefone: item.telefone || '',
    cargo: item.cargo || '',
    data_admissao: item.data_admissao ? item.data_admissao.slice(0, 10) : '',
    acessa_sistema_terminal: !!item.acessa_sistema_terminal,
    email_login: item.email_login || '',
    senha: ''
  })
  formularioAberto.value = true
}

const cancelarFormulario = () => {
  formularioAberto.value = false
  resetarForm()
}

const resetarForm = () => {
  Object.assign(form, {
    id: null,
    id_empresa: empresas.value[0]?.id || null,
    nome: '',
    cpf: '',
    telefone: '',
    cargo: '',
    data_admissao: '',
    acessa_sistema_terminal: false,
    email_login: '',
    senha: ''
  })
  if (formRef.value) formRef.value.resetValidation()
}

const mostrarMensagem = (message, color = 'success') => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

const salvarFuncionario = async () => {
  if (!formRef.value?.validate()) return
  try {
    const payload = {
      id_empresa: form.id_empresa,
      nome: form.nome,
      cpf: form.cpf || null,
      telefone: form.telefone || null,
      cargo: form.cargo || null,
      data_admissao: form.data_admissao || null,
      acessa_sistema_terminal: form.acessa_sistema_terminal
    }

    if (form.acessa_sistema_terminal) {
      payload.email_login = form.email_login
      if (form.senha) payload.senha = form.senha
    }

    if (editando.value) {
      await funcionariosStore.atualizarFuncionario(form.id, payload)
      mostrarMensagem('Funcionário atualizado com sucesso!')
    } else {
      await funcionariosStore.criarFuncionario(payload)
      mostrarMensagem('Funcionário cadastrado com sucesso!')
    }

    buscarFuncionarios()
    cancelarFormulario()
  } catch (e) {
    console.error(e)
    mostrarMensagem(e.validationMessage || e.response?.data?.erro || 'Erro ao salvar funcionário.', 'error')
  }
}

const inativarFuncionario = async (item) => {
  try {
    const id = item?.id || item
    await funcionariosStore.inativarFuncionario(id)
    mostrarMensagem('Funcionário inativado com sucesso!')
    buscarFuncionarios()
  } catch (e) {
    console.error(e)
    mostrarMensagem(e.response?.data?.erro || 'Erro ao inativar funcionário.', 'error')
  }
}

onMounted(async () => {
  await buscarEmpresas()
  resetarForm()
  await buscarFuncionarios()
})
</script>
