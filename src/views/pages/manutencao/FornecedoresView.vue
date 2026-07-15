<template>
  <top-all-pages icon="mdi-truck">
    <template #titulo>Fornecedores</template>
    <template #section>
      <v-card class="background-secondary" elevation="0">
        <v-card-text class="pa-4">
          <BotaoExpandTransition
              :formulario-aberto="formularioAberto"
              @toggle="toggleFormulario"
          >
            <template #default>{{ formularioAberto ? 'Cancelar' : 'Novo Fornecedor' }}</template>
          </BotaoExpandTransition>

          <v-expand-transition>
            <div v-if="formularioAberto">
              <v-card class="background-card mb-7" elevation="0">
                <v-card-title class="text-h6 pa-4">
                  <v-icon :icon="editando ? 'mdi-pencil' : 'mdi-plus'" class="mr-2" size="23px"/>
                  {{ editando ? 'Editar Fornecedor' : 'Novo Fornecedor' }}
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-form ref="formRef" v-model="formValido">
                    <FormPessoa
                        ref="formPessoaRef"
                        v-model="formPessoa"
                        @pessoa-encontrada="handlePessoaEncontrada"
                        @pessoa-nao-encontrada="handlePessoaNaoEncontrada"
                    />

                    <v-divider class="my-4"/>
                    <div class="text-subtitle-2 font-weight-bold mb-3">
                      <v-icon icon="mdi-truck" class="mr-1" size="18px"/>
                      Dados do Fornecedor
                    </div>

                    <v-row dense>
                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formFornecedor.contato"
                            label="Contato"
                            maxlength="150"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-account-tie"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formFornecedor.fonecontato"
                            v-mask-phone.br
                            label="Fone do Contato"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-phone"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formFornecedor.limitecredito"
                            v-mask-decimal.br="2"
                            label="Limite de Crédito"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-currency-brl"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formFornecedor.dtvencto_limite"
                            label="Vencimento do Limite"
                            type="date"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-calendar"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-autocomplete
                            v-model="formFornecedor.id_red_ctb_for"
                            :items="planosConta"
                            item-title="descconta"
                            item-value="id"
                            label="Conta Contábil (Referencial)"
                            variant="outlined"
                            density="compact"
                            hide-details="auto"
                            prepend-inner-icon="mdi-book-outline"
                            clearable
                            no-data-text="Nenhuma conta encontrada"
                        >
                          <template #item="{ props, item }">
                            <v-list-item v-bind="props">
                              <template #title>
                                {{ item.raw.id_classificador }} — {{ item.raw.descconta }}
                              </template>
                            </v-list-item>
                          </template>
                          <template #selection="{ item }">
                            {{ item.raw.id_classificador }} — {{ item.raw.descconta }}
                          </template>
                        </v-autocomplete>
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-textarea
                            v-model="formFornecedor.observacao"
                            label="Observação"
                            rows="2"
                            auto-grow
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
                      @click="salvarFornecedor"
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
              :items="fornecedores"
              :loading="loading"
              :search="search"
              @update:search="(value) => search = value"
              search-label="Pesquisar fornecedor"
              item-key="id"
              no-data-icon="mdi-truck"
              no-data-text="Nenhum fornecedor cadastrado"
              delete-title="Inativar"
              delete-tooltip="Inativar"
              delete-dialog-title="Inativar fornecedor"
              delete-dialog-message="O fornecedor será inativado."
              delete-item-display-field="pessoa_nome"
              @edit-item="editarFornecedor"
              @confirm-delete="inativarFornecedor"
          >
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
import { useFornecedoresStore } from '@/stores/APIs/fornecedores'
import { usePessoasStore } from '@/stores/APIs/pessoas'
import { useFinanceiroStore } from '@/stores/APIs/financeiro'

const fornecedoresStore = useFornecedoresStore()
const pessoasStore = usePessoasStore()
const financeiroStore = useFinanceiroStore()

const fornecedores = computed(() => fornecedoresStore.fornecedores)
const loading = computed(() => fornecedoresStore.loading)
const planosConta = computed(() => financeiroStore.planosConta || [])
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

const formFornecedor = reactive({
  id: null,
  id_pessoa: null,
  contato: '',
  fonecontato: '',
  observacao: '',
  limitecredito: '',
  dtvencto_limite: null,
  id_red_ctb_for: null
})

const snackbar = reactive({ show: false, message: '', color: 'success' })

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Fornecedor', key: 'pessoa_nome', sortable: true },
  { title: 'Contato', key: 'contato', sortable: true },
  { title: 'Fone Contato', key: 'fonecontato', sortable: false },
  { title: 'Limite Crédito', key: 'limitecredito', sortable: false },
  { title: 'Status', key: 'ativo', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false }
]

const parseDecimalBR = (str) => {
  if (!str && str !== 0) return null
  return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || null
}

const formatDecimalBR = (num) => {
  if (!num && num !== 0) return ''
  return parseFloat(num).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
  formPessoaRef.value?.resetarForm({ tipo_pessoa: 'J' })
  Object.assign(formFornecedor, {
    id: null,
    id_pessoa: null,
    contato: '',
    fonecontato: '',
    observacao: '',
    limitecredito: '',
    dtvencto_limite: null,
    id_red_ctb_for: null
  })
  if (formRef.value) formRef.value.resetValidation()
}

const handlePessoaEncontrada = (pessoa) => {
  const forn = pessoa.dados_fornecedor
  editando.value = !!forn
  Object.assign(formFornecedor, {
    id: forn?.id_fornecedor ?? forn?.id ?? null,
    id_pessoa: pessoa.id ?? null,
    contato: forn?.contato ?? '',
    fonecontato: forn?.fonecontato ?? '',
    observacao: forn?.observacao ?? '',
    limitecredito: forn?.limitecredito ? formatDecimalBR(forn.limitecredito) : '',
    dtvencto_limite: forn?.dtvencto_limite ? forn.dtvencto_limite.slice(0, 10) : null,
    id_red_ctb_for: forn?.id_red_ctb_for ?? null
  })
}

const handlePessoaNaoEncontrada = () => {
  editando.value = false
  Object.assign(formFornecedor, {
    id: null,
    id_pessoa: null,
    contato: '',
    fonecontato: '',
    observacao: '',
    limitecredito: '',
    dtvencto_limite: null,
    id_red_ctb_for: null
  })
}

const editarFornecedor = async (item) => {
  editando.value = true
  formularioAberto.value = true

  const resultado = await pessoasStore.buscarpessoaId(item.id_pessoa)
  if (resultado) {
    formPessoaRef.value?.preencherPessoa(resultado.pessoa, resultado.endereco)
    const forn = resultado.dadosFornecedor || {}
    Object.assign(formFornecedor, {
      id: forn.id_fornecedor ?? item.id ?? null,
      id_pessoa: item.id_pessoa ?? resultado.pessoa?.id ?? null,
      contato: forn.contato ?? item.contato ?? '',
      fonecontato: forn.fonecontato ?? item.fonecontato ?? '',
      observacao: forn.observacao ?? item.observacao ?? '',
      limitecredito: (forn.limitecredito ?? item.limitecredito) ? formatDecimalBR(forn.limitecredito ?? item.limitecredito) : '',
      dtvencto_limite: (forn.dtvencto_limite ?? item.dtvencto_limite) ? (forn.dtvencto_limite ?? item.dtvencto_limite).slice(0, 10) : null,
      id_red_ctb_for: forn.id_red_ctb_for ?? item.id_red_ctb_for ?? null
    })
  }
}

const salvarFornecedor = async () => {
  const valid = await formRef.value?.validate()
  if (valid && !valid.valid) return

  try {
    const pessoaNova = !formPessoa.id
    const payloadEntity = {
      contato: formFornecedor.contato || null,
      fonecontato: (formFornecedor.fonecontato || '').replace(/\D/g, '') || null,
      observacao: formFornecedor.observacao || null,
      limitecredito: parseDecimalBR(formFornecedor.limitecredito),
      dtvencto_limite: formFornecedor.dtvencto_limite || null,
      id_red_ctb_for: formFornecedor.id_red_ctb_for ?? null
    }

    if (editando.value) {
      // Edição: atualizar pessoa separadamente (se existe)
      if (formPessoa.id) {
        await pessoasStore.salvarPessoa(formRef.value, { ...formPessoa }, true, snackbar)
      }
      await fornecedoresStore.atualizarFornecedor(formFornecedor.id, payloadEntity)
      snackbar.message = 'Fornecedor atualizado com sucesso!'
    } else if (pessoaNova) {
      // Pessoa nova: tudo junto num POST só
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
      await fornecedoresStore.criarFornecedor(payload)
      snackbar.message = 'Fornecedor cadastrado com sucesso!'
    } else {
      // Pessoa já existe: id_pessoa + campos da entidade
      await fornecedoresStore.criarFornecedor({ id_pessoa: formPessoa.id, ...payloadEntity })
      snackbar.message = 'Fornecedor cadastrado com sucesso!'
    }

    snackbar.color = 'success'
    snackbar.show = true
    await fornecedoresStore.buscarFornecedores()
    cancelarFormulario()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || 'Erro ao salvar fornecedor.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}

const inativarFornecedor = async (item) => {
  try {
    const id = item?.id ?? item
    await fornecedoresStore.inativarFornecedor(id)
    snackbar.message = 'Fornecedor inativado com sucesso!'
    snackbar.color = 'success'
    snackbar.show = true
    await fornecedoresStore.buscarFornecedores()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || 'Erro ao inativar fornecedor.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}

onMounted(async () => {
  await Promise.all([
    fornecedoresStore.buscarFornecedores(),
    financeiroStore.buscarPlanosConta()
  ])
})
</script>
