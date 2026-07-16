<template>
  <top-all-pages icon="mdi-account-hard-hat">
    <template #titulo>Funcionários</template>
    <template #section>
      <v-card class="background-secondary" elevation="0">
        <v-card-text class="pa-4">
          <BotaoExpandTransition
              :formulario-aberto="formularioAberto"
              @toggle="toggleFormulario"
          >
            <template #default>{{ formularioAberto ? 'Cancelar' : 'Novo Funcionário' }}</template>
          </BotaoExpandTransition>

          <v-expand-transition>
            <div v-if="formularioAberto">
              <v-card class="background-card mb-7" elevation="0">
                <v-card-title class="text-h6 pa-4">
                  <v-icon :icon="editando ? 'mdi-pencil' : 'mdi-plus'" class="mr-2" size="23px"/>
                  {{ editando ? 'Editar Funcionário' : 'Novo Funcionário' }}
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-form ref="formRef" v-model="formValido">
                    <FormPessoa
                        ref="formPessoaRef"
                        v-model="formPessoa"
                    />

                    <v-divider class="my-4"/>
                    <div class="text-subtitle-2 font-weight-bold mb-3">
                      <v-icon icon="mdi-account-hard-hat" class="mr-1" size="18px"/>
                      Dados do Funcionário
                    </div>

                    <v-row dense>
                      <v-col cols="12" md="4">
                        <v-select
                            v-model="formFuncionario.id_empresa"
                            :items="empresas"
                            item-title="nome"
                            item-value="id"
                            label="Empresa *"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-office-building"
                            class="custom-text-field required-left-border"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formFuncionario.data_admissao"
                            label="Data de admissão"
                            type="date"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-calendar"
                        />
                      </v-col>
                    </v-row>

                    <v-divider class="my-4"/>
                    <div class="text-subtitle-2 font-weight-bold mb-3">
                      <v-icon icon="mdi-login" class="mr-1" size="18px"/>
                      Acesso ao Terminal
                    </div>

                    <v-row dense>
                      <v-col cols="12">
                        <v-switch
                            v-model="formFuncionario.acessa_sistema_terminal"
                            label="Acessa o sistema do terminal (totem/comandas/mesas)"
                            color="var(--text-color-laranja)"
                            hide-details
                        />
                        <p class="text-caption opacity-70 mt-1">
                          Cria um login restrito, que só acessa os apps de terminal — não o ERP administrativo.
                        </p>
                      </v-col>
                    </v-row>

                    <v-row v-if="formFuncionario.acessa_sistema_terminal" dense>
                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formFuncionario.email_login"
                            label="E-mail de login *"
                            :rules="[rules.required, rules.email]"
                            maxlength="120"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-email"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formFuncionario.senha"
                            :label="editando ? 'Nova senha (deixe em branco para manter)' : 'Senha *'"
                            :rules="editando ? [] : [rules.required, rules.senhaMinima]"
                            type="password"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-lock"
                        />
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
                <v-card-actions class="pa-4">
                  <v-spacer/>
                  <v-btn color="grey" variant="text" @click="cancelarFormulario">Cancelar</v-btn>
                  <v-btn
                      color="var(--text-color-laranja)"
                      :loading="loading"
                      :disabled="!formValido"
                      @click="salvarFuncionario"
                      variant="flat"
                      class="text-white"
                  >
                    {{ editando ? 'Atualizar' : 'Salvar' }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-expand-transition>

          <TabelaPadrao
              v-if="!formularioAberto"
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
              delete-dialog-message="O funcionário será inativado."
              delete-item-display-field="nome"
              @edit-item="editarFuncionario"
              @confirm-delete="inativarFuncionario"
          >
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
import TopAllPages from '@/components/base/padrao-paginas/TopAllPages.vue'
import TabelaPadrao from '@/components/base/padrao-paginas/TabelaPadrao.vue'
import BotaoExpandTransition from '@/components/base/padrao-paginas/BotaoExpandTransition.vue'
import FormPessoa from '@/components/base/padrao-paginas/FormPessoa.vue'
import { useFuncionariosStore } from '@/stores/APIs/funcionarios'
import { useEmpresaStore } from '@/stores/APIs/empresa'
import { usePessoasStore } from '@/stores/APIs/pessoas'

const funcionariosStore = useFuncionariosStore()
const empresaStore = useEmpresaStore()
const pessoasStore = usePessoasStore()

const funcionarios = computed(() => funcionariosStore.funcionarios)
const empresas = computed(() => empresaStore.empresas.map((e) => ({ id: e.id, nome: e.razao_social || e.fantasia || `Empresa ${e.id}` })))
const loading = computed(() => funcionariosStore.loading)
const search = ref('')

const formularioAberto = ref(false)
const editando = ref(false)
const formValido = ref(false)
const formRef = ref(null)
const formPessoaRef = ref(null)

const formPessoa = reactive({
  id: null,
  tipo_pessoa: 'F',
  nome_razao: '',
  apelido_fantasia: '',
  cpf_cnpj: '',
  rg_inscricao: '',
  telefone: '',
  celular: '',
  whats: '',
  website: '',
  instagram: '',
  facebook: '',
  twitter_x: '',
  tik_tok: '',
  telegram: '',
  enderecos: [],
})

const formFuncionario = reactive({
  id: null,
  id_pessoa: null,
  id_empresa: null,
  data_admissao: '',
  acessa_sistema_terminal: false,
  email_login: '',
  senha: ''
})

const snackbar = reactive({ show: false, message: '', color: 'success' })

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Nome', key: 'nome', sortable: true },
  { title: 'Acesso', key: 'acessa_sistema_terminal', sortable: false },
  { title: 'Status', key: 'ativo', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false }
]

const rules = {
  required: (v) => !!v || 'Campo obrigatório',
  email: (v) => !v || /\S+@\S+\.\S+/.test(v) || 'E-mail inválido',
  senhaMinima: (v) => !v || v.length >= 6 || 'A senha deve ter no mínimo 6 caracteres'
}

const toggleFormulario = () => {
  if (formularioAberto.value) {
    cancelarFormulario()
    return
  }
  editando.value = false
  resetarForm()
  formularioAberto.value = true
}

const cancelarFormulario = () => {
  formularioAberto.value = false
  editando.value = false
  resetarForm()
}

const resetarForm = () => {
  formPessoaRef.value?.resetarForm()
  Object.assign(formFuncionario, {
    id: null,
    id_pessoa: null,
    id_empresa: empresas.value[0]?.id || null,
    data_admissao: '',
    acessa_sistema_terminal: false,
    email_login: '',
    senha: ''
  })
  if (formRef.value) formRef.value.resetValidation()
}

const editarFuncionario = async (item) => {
  editando.value = true
  formularioAberto.value = true

  const resultado = await pessoasStore.buscarpessoaId(item.id_pessoa)
  if (resultado) {
    formPessoaRef.value?.preencherPessoa(resultado.pessoa, resultado.endereco)
    const func = resultado.dadosFuncionario || {}
    Object.assign(formFuncionario, {
      id: func.id_colabo ?? item.id_colabo ?? item.id ?? null,
      id_pessoa: item.id_pessoa ?? resultado.pessoa?.id ?? null,
      id_empresa: func.id_empresa ?? item.id_empresa ?? null,
      data_admissao: (func.data_admissao ?? item.data_admissao) ? (func.data_admissao ?? item.data_admissao).slice(0, 10) : '',
      acessa_sistema_terminal: !!(func.acessa_sistema_terminal ?? item.acessa_sistema_terminal),
      email_login: func.email_login ?? item.email_login ?? '',
      senha: ''
    })
  }
}

const salvarFuncionario = async () => {
  const valid = await formRef.value?.validate()
  if (valid && !valid.valid) return

  try {
    const pessoaNova = !formPessoa.id
    const payloadEntity = {
      id_empresa: formFuncionario.id_empresa,
      data_admissao: formFuncionario.data_admissao || null,
      acessa_sistema_terminal: formFuncionario.acessa_sistema_terminal
    }

    if (formFuncionario.acessa_sistema_terminal) {
      payloadEntity.email_login = formFuncionario.email_login
      if (formFuncionario.senha) payloadEntity.senha = formFuncionario.senha
    }

    if (editando.value) {
      if (formPessoa.id) {
        await pessoasStore.salvarPessoa(formRef.value, { ...formPessoa }, true, snackbar)
      }
      await funcionariosStore.atualizarFuncionario(formFuncionario.id, payloadEntity)
      snackbar.message = 'Funcionário atualizado com sucesso!'
    } else if (pessoaNova) {
      const payload = {
        tipo_pessoa: formPessoa.tipo_pessoa,
        nome_razao: formPessoa.nome_razao,
        apelido_fantasia: formPessoa.apelido_fantasia,
        cpf_cnpj: (formPessoa.cpf_cnpj || '').replace(/\D/g, ''),
        rg_inscricao: formPessoa.rg_inscricao || null,
        telefone: (formPessoa.telefone || '').replace(/\D/g, '') || null,
        celular: (formPessoa.celular || '').replace(/\D/g, '') || null,
        whats: (formPessoa.whats || '').replace(/\D/g, '') || null,
        website: formPessoa.website || null,
        instagram: formPessoa.instagram || null,
        facebook: formPessoa.facebook || null,
        twitter_x: formPessoa.twitter_x || null,
        tik_tok: formPessoa.tik_tok || null,
        telegram: formPessoa.telegram || null,
        endereco: (formPessoa.enderecos || []).map((end) => {
          const copy = { ...end }
          delete copy._buscandoCep
          return copy
        }),
        ...payloadEntity
      }
      await funcionariosStore.criarFuncionario(payload)
      snackbar.message = 'Funcionário cadastrado com sucesso!'
    } else {
      await funcionariosStore.criarFuncionario({ id_pessoa: formPessoa.id, ...payloadEntity })
      snackbar.message = 'Funcionário cadastrado com sucesso!'
    }

    snackbar.color = 'success'
    snackbar.show = true
    await funcionariosStore.buscarFuncionarios()
    cancelarFormulario()
  } catch (e) {
    console.error(e)
    snackbar.message = e.validationMessage || e.response?.data?.erro || 'Erro ao salvar funcionário.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}

const inativarFuncionario = async (item) => {
  try {
    const id = item?.id_colabo ?? item?.id ?? item
    await funcionariosStore.inativarFuncionario(id)
    snackbar.message = 'Funcionário inativado com sucesso!'
    snackbar.color = 'success'
    snackbar.show = true
    await funcionariosStore.buscarFuncionarios()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || 'Erro ao inativar funcionário.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}

onMounted(async () => {
  await Promise.all([
    empresaStore.buscarTodasEmpresas(),
    funcionariosStore.buscarFuncionarios()
  ])
})
</script>
