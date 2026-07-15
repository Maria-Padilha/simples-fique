<template>
  <top-all-pages icon="mdi-truck-delivery">
    <template #titulo>Transportadoras</template>
    <template #section>
      <v-card class="background-secondary" elevation="0">
        <v-card-text class="pa-4">
          <BotaoExpandTransition
              :formulario-aberto="formularioAberto"
              @toggle="toggleFormulario"
          >
            <template #default>{{ formularioAberto ? 'Cancelar' : 'Nova Transportadora' }}</template>
          </BotaoExpandTransition>

          <v-expand-transition>
            <div v-if="formularioAberto">
              <v-card class="background-card mb-7" elevation="0">
                <v-card-title class="text-h6 pa-4">
                  <v-icon :icon="editando ? 'mdi-pencil' : 'mdi-plus'" class="mr-2" size="23px"/>
                  {{ editando ? 'Editar Transportadora' : 'Nova Transportadora' }}
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-form ref="formRef" v-model="formValido">
                    <FormPessoa
                        ref="formPessoaRef"
                        v-model="formPessoa"
                        classificacao="transportadora"
                        :show-classificacao="editando"
                        @pessoa-encontrada="handlePessoaEncontrada"
                        @pessoa-nao-encontrada="handlePessoaNaoEncontrada"
                    />

                    <v-divider class="my-4"/>
                    <div class="text-subtitle-2 font-weight-bold mb-3">
                      <v-icon icon="mdi-truck-delivery" class="mr-1" size="18px"/>
                      Dados da Transportadora
                    </div>

                    <v-row dense>
                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formTransportadora.inscricao_estadual"
                            label="Inscrição Estadual"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-receipt-text-outline"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formTransportadora.email"
                            label="Email"
                            type="email"
                            maxlength="200"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-email"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formTransportadora.observacao"
                            label="Observação"
                            maxlength="500"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-note-text-outline"
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
                      @click="salvarTransportadora"
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
              :items="transportadoras"
              :loading="loading"
              :search="search"
              @update:search="(value) => search = value"
              search-label="Pesquisar transportadora"
              item-key="id"
              no-data-icon="mdi-truck-delivery"
              no-data-text="Nenhuma transportadora cadastrada"
              delete-title="Inativar"
              delete-tooltip="Inativar"
              delete-dialog-title="Inativar transportadora"
              delete-dialog-message="A transportadora será inativada."
              delete-item-display-field="nome"
              @edit-item="editarTransportadora"
              @confirm-delete="inativarTransportadora"
          >
            <template v-slot:[`item.tipo_pessoa`]="{ item }">
              {{ item.tipo_pessoa === 'J' ? 'Jurídica' : 'Física' }}
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
import { ref, reactive } from 'vue'
import TopAllPages from '@/components/base/padrao-paginas/TopAllPages.vue'
import TabelaPadrao from '@/components/base/padrao-paginas/TabelaPadrao.vue'
import BotaoExpandTransition from '@/components/base/padrao-paginas/BotaoExpandTransition.vue'
import FormPessoa from '@/components/base/padrao-paginas/FormPessoa.vue'
import { usePessoasStore } from '@/stores/APIs/pessoas'

const pessoasStore = usePessoasStore()

const transportadoras = ref([])
const loading = ref(false)
const search = ref('')

const formularioAberto = ref(false)
const editando = ref(false)
const formValido = ref(false)
const formRef = ref(null)
const formPessoaRef = ref(null)

const formPessoa = reactive({
  id: null,
  tipo_pessoa: 'J',
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

const formTransportadora = reactive({
  id: null,
  id_pessoa: null,
  inscricao_estadual: '',
  email: '',
  observacao: ''
})

const snackbar = reactive({ show: false, message: '', color: 'success' })

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Nome', key: 'nome', sortable: true },
  { title: 'Tipo', key: 'tipo_pessoa', sortable: true },
  { title: 'CPF/CNPJ', key: 'cpf_cnpj', sortable: false },
  { title: 'Status', key: 'ativo', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false }
]

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
  formPessoaRef.value?.resetarForm({ tipo_pessoa: 'J' })
  Object.assign(formTransportadora, {
    id: null,
    id_pessoa: null,
    inscricao_estadual: '',
    email: '',
    observacao: ''
  })
  if (formRef.value) formRef.value.resetValidation()
}

const handlePessoaEncontrada = (pessoa) => {
  const transp = pessoa.dados_transportador
  editando.value = !!transp
  Object.assign(formTransportadora, {
    id: transp?.id_transportador ?? transp?.id ?? null,
    id_pessoa: pessoa.id ?? null,
    inscricao_estadual: transp?.inscricao_estadual ?? '',
    email: transp?.email ?? '',
    observacao: transp?.observacao ?? ''
  })
}

const handlePessoaNaoEncontrada = () => {
  editando.value = false
  Object.assign(formTransportadora, {
    id: null,
    id_pessoa: null,
    inscricao_estadual: '',
    email: '',
    observacao: ''
  })
}

const editarTransportadora = async (item) => {
  editando.value = true
  formularioAberto.value = true

  const resultado = await pessoasStore.buscarpessoaId(item.id_pessoa)
  if (resultado) {
    formPessoaRef.value?.preencherPessoa(resultado.pessoa, resultado.endereco)
    const transp = resultado.dadosTransportador || {}
    Object.assign(formTransportadora, {
      id: transp.id_transportador ?? item.id ?? null,
      id_pessoa: item.id_pessoa ?? resultado.pessoa?.id ?? null,
      inscricao_estadual: transp.inscricao_estadual ?? item.inscricao_estadual ?? '',
      email: transp.email ?? item.email ?? '',
      observacao: transp.observacao ?? item.observacao ?? ''
    })
  }
}

const salvarTransportadora = async () => {
  const valid = await formRef.value?.validate()
  if (valid && !valid.valid) return

  try {
    const pessoaNova = !formPessoa.id

    if (editando.value) {
      if (formPessoa.id) {
        await pessoasStore.salvarPessoa(formRef.value, { ...formPessoa }, true, snackbar)
      }
      // TODO: PUT /manutencao/transportadores/:id quando endpoint existir
      snackbar.message = 'Transportadora atualizada com sucesso!'
    } else if (pessoaNova) {
      // TODO: POST /manutencao/transportadores com payload unificado quando endpoint existir
      snackbar.message = 'Transportadora cadastrada com sucesso!'
    } else {
      // TODO: POST /manutencao/transportadores { id_pessoa } quando endpoint existir
      snackbar.message = 'Transportadora cadastrada com sucesso!'
    }

    snackbar.color = 'success'
    snackbar.show = true
    cancelarFormulario()
  } catch (e) {
    console.error(e)
    snackbar.message = 'Erro ao salvar transportadora.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}

const inativarTransportadora = async () => {
  try {
    // TODO: Implementar chamada API quando endpoint estiver disponível
    snackbar.message = 'Transportadora inativada com sucesso!'
    snackbar.color = 'success'
    snackbar.show = true
  } catch (e) {
    console.error(e)
    snackbar.message = 'Erro ao inativar transportadora.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}
</script>
