<template>
  <top-all-pages icon="mdi-calculator">
    <template #titulo>Contadores</template>
    <template #section>
      <v-card class="background-secondary" elevation="0">
        <v-card-text class="pa-4">
          <BotaoExpandTransition
              :formulario-aberto="formularioAberto"
              @toggle="toggleFormulario"
          >
            <template #default>{{ formularioAberto ? 'Cancelar' : 'Novo Contador' }}</template>
          </BotaoExpandTransition>

          <v-expand-transition>
            <div v-if="formularioAberto">
              <v-btn
                  variant="text"
                  color="grey"
                  prepend-icon="mdi-arrow-left"
                  class="mb-2"
                  @click="cancelarFormulario"
              >
                Voltar
              </v-btn>
              <v-card class="background-card mb-7" elevation="0">
                <v-card-title class="text-h6 pa-4">
                  <v-icon :icon="editando ? 'mdi-pencil' : 'mdi-plus'" class="mr-2" size="23px"/>
                  {{ editando ? 'Editar Contador' : 'Novo Contador' }}
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-form ref="formRef" v-model="formValido">
                    <FormPessoa
                        ref="formPessoaRef"
                        v-model="formPessoa"
                        :readonly-fields="camposBloqueados"
                        @pessoa-encontrada="handlePessoaEncontrada"
                        @pessoa-nao-encontrada="handlePessoaNaoEncontrada"
                    />

                    <v-divider class="my-4"/>
                    <div class="text-subtitle-2 font-weight-bold mb-3">
                      <v-icon icon="mdi-calculator" class="mr-1" size="18px"/>
                      Dados do Contador
                    </div>

                    <v-row dense>
                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formContador.contato"
                            label="Contato"
                            maxlength="150"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-account-tie"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formContador.fonecontador"
                            v-mask-phone.br
                            label="Fone do Contador"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-phone"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formContador.crc"
                            label="CRC"
                            maxlength="20"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-card-account-details-outline"
                        />
                      </v-col>

                      <v-col cols="12" md="12">
                        <v-textarea
                            v-model="formContador.observacao"
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
                      @click="salvarContador"
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
              :items="contadores"
              :loading="loading"
              :search="search"
              @update:search="(value) => search = value"
              search-label="Pesquisar contador"
              item-key="id"
              no-data-icon="mdi-calculator"
              no-data-text="Nenhum contador cadastrado"
              :show-delete-action="false"
              @edit-item="editarContador"
          >
            <template v-slot:[`item.ativo`]="{ item }">
              <StatusPillToggle
                  :active="item.ativo"
                  :loading="statusToggling === item.id"
                  @toggle="onToggleAtivoContador(item)"
              />
            </template>
          </TabelaPadrao>
        </v-card-text>
      </v-card>

      <v-dialog v-model="inativarDialog" max-width="420px">
        <v-card class="background-secondary">
          <v-card-title class="text-h6">Inativar contador</v-card-title>
          <v-card-text>
            Tem certeza que deseja inativar "{{ contadorParaInativar?.pessoa_nome }}"?
            <br><br>
            O contador será inativado.
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn color="grey" variant="text" @click="fecharDialogInativar">Cancelar</v-btn>
            <v-btn color="error" :loading="statusToggling === contadorParaInativar?.id" @click="confirmarInativacao">Inativar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

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
import StatusPillToggle from '@/components/base/padrao-paginas/StatusPillToggle.vue'
import { useContadoresStore } from '@/stores/APIs/contadores'
import { usePessoasStore } from '@/stores/APIs/pessoas'

const contadoresStore = useContadoresStore()
const pessoasStore = usePessoasStore()

const contadores = computed(() => contadoresStore.contadores)
const loading = computed(() => contadoresStore.loading)
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

const formContador = reactive({
  id: null,
  id_pessoa: null,
  contato: '',
  fonecontador: '',
  observacao: '',
  crc: ''
})

const snackbar = reactive({ show: false, message: '', color: 'success' })

// Contador não edita dados de Pessoa via PUT do contador — só via cadastro de Pessoa
const camposBloqueados = computed(() => editando.value ? ['nome_razao', 'cpf_cnpj', 'tipo_pessoa', 'telefone', 'celular'] : [])

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Contador', key: 'pessoa_nome', sortable: true },
  { title: 'CRC', key: 'crc', sortable: false },
  { title: 'Contato', key: 'contato', sortable: true },
  { title: 'Fone Contador', key: 'fonecontador', sortable: false },
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
  Object.assign(formPessoa, {
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
  formPessoaRef.value?.resetarForm({ tipo_pessoa: 'J' })
  Object.assign(formContador, {
    id: null,
    id_pessoa: null,
    contato: '',
    fonecontador: '',
    observacao: '',
    crc: ''
  })
  if (formRef.value) formRef.value.resetValidation()
}

const handlePessoaEncontrada = (pessoa) => {
  const cont = pessoa.dados_contador
  editando.value = !!cont
  Object.assign(formContador, {
    id: cont?.id_contador ?? cont?.id ?? null,
    id_pessoa: pessoa.id ?? null,
    contato: cont?.contato ?? '',
    fonecontador: cont?.fonecontador ?? '',
    observacao: cont?.observacao ?? '',
    crc: cont?.crc ?? ''
  })
}

const handlePessoaNaoEncontrada = () => {
  editando.value = false
  Object.assign(formContador, {
    id: null,
    id_pessoa: null,
    contato: '',
    fonecontador: '',
    observacao: '',
    crc: ''
  })
}

const editarContador = async (item) => {
  editando.value = true
  formularioAberto.value = true

  try {
    const data = await contadoresStore.buscarContadorPorId(item.id)
    if (data) {
      const p = data.pessoa || {}
      Object.assign(formPessoa, {
        id: p.id ?? data.id_pessoa ?? data.id ?? null,
        tipo_pessoa: p.tipo_pessoa ?? 'F',
        nome_razao: p.nome_razao ?? data.nome_razao ?? '',
        cpf_cnpj: p.cpf_cnpj ?? data.cpf_cnpj ?? '',
        apelido_fantasia: p.apelido_fantasia ?? '',
        rg_inscricao: p.rg_inscricao ?? '',
        telefone: p.telefone ?? data.telefone ?? '',
        celular: p.celular ?? '',
        whats: p.whats ?? '',
        website: p.website ?? '',
        instagram: p.instagram ?? '',
        facebook: p.facebook ?? '',
        twitter_x: p.twitter_x ?? '',
        tik_tok: p.tik_tok ?? '',
        telegram: p.telegram ?? '',
        enderecos: p.enderecos ?? [],
      })
      Object.assign(formContador, {
        id: data.id_contador ?? data.id ?? null,
        id_pessoa: p.id ?? data.id_pessoa ?? data.id ?? null,
        contato: data.contato ?? '',
        fonecontador: data.fonecontador ?? '',
        observacao: data.observacao ?? '',
        crc: data.crc ?? ''
      })
    }
  } catch (e) {
    console.error(e)
    editando.value = false
    snackbar.message = e.response?.data?.erro || 'Erro ao carregar contador.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}

const salvarContador = async () => {
  const valid = await formRef.value?.validate()
  if (valid && !valid.valid) return

  try {
    const pessoaNova = !formPessoa.id
    const payloadEntity = {
      contato: formContador.contato || null,
      fonecontador: (formContador.fonecontador || '').replace(/\D/g, '') || null,
      observacao: formContador.observacao || null,
      crc: formContador.crc || null
    }

    if (editando.value) {
      if (formPessoa.id) {
        await pessoasStore.salvarPessoa(formRef.value, { ...formPessoa, ativo: 'S' }, true, snackbar)
      }
      await contadoresStore.atualizarContador(formContador.id, payloadEntity)
      snackbar.message = 'Contador atualizado com sucesso!'
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
      await contadoresStore.criarContador(payload)
      snackbar.message = 'Contador cadastrado com sucesso!'
    } else {
      if (formPessoa.id) {
        await pessoasStore.salvarPessoa(formRef.value, { ...formPessoa, ativo: 'S' }, true, snackbar)
      }
      await contadoresStore.criarContador({ id_pessoa: formPessoa.id, nome: formPessoa.nome_razao, ...payloadEntity })
      snackbar.message = 'Contador cadastrado com sucesso!'
    }

    snackbar.color = 'success'
    snackbar.show = true
    await contadoresStore.buscarContadores()
    cancelarFormulario()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || 'Erro ao salvar contador.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}

const statusToggling = ref(null)
const inativarDialog = ref(false)
const contadorParaInativar = ref(null)

const inativarContador = async (item) => {
  const id = item?.id ?? item
  statusToggling.value = id
  try {
    await contadoresStore.inativarContador(id)
    snackbar.message = 'Contador inativado com sucesso!'
    snackbar.color = 'success'
    snackbar.show = true
    await contadoresStore.buscarContadores()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || 'Erro ao inativar contador.'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    statusToggling.value = null
  }
}

const reativarContador = async (item) => {
  const id = item?.id ?? item
  statusToggling.value = id
  try {
    await contadoresStore.reativarContador(id)
    snackbar.message = 'Contador reativado com sucesso!'
    snackbar.color = 'success'
    snackbar.show = true
    await contadoresStore.buscarContadores()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || e.response?.data?.message || 'Erro ao reativar contador.'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    statusToggling.value = null
  }
}

const onToggleAtivoContador = (item) => {
  if (item.ativo) {
    contadorParaInativar.value = item
    inativarDialog.value = true
  } else {
    reativarContador(item)
  }
}

const fecharDialogInativar = () => {
  inativarDialog.value = false
  contadorParaInativar.value = null
}

const confirmarInativacao = async () => {
  const item = contadorParaInativar.value
  if (!item) return
  await inativarContador(item)
  fecharDialogInativar()
}

onMounted(async () => {
  await contadoresStore.buscarContadores()
})
</script>
