<template>
  <top-all-pages icon="mdi-account-tie">
    <template #titulo>Representantes</template>
    <template #section>
      <v-card class="background-secondary" elevation="0">
        <v-card-text class="pa-4">
          <BotaoExpandTransition
              :formulario-aberto="formularioAberto"
              @toggle="toggleFormulario"
          >
            <template #default>{{ formularioAberto ? 'Cancelar' : 'Novo Representante' }}</template>
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
                  {{ editando ? 'Editar Representante' : 'Novo Representante' }}
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
                      <v-icon icon="mdi-account-tie" class="mr-1" size="18px"/>
                      Dados do Representante
                    </div>

                    <v-row dense>
                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formRepresentante.contato"
                            label="Contato"
                            maxlength="150"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-account-tie"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            v-model="formRepresentante.fonerepresentante"
                            v-mask-phone.br
                            label="Fone do Representante"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-phone"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-textarea
                            v-model="formRepresentante.observacao"
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
                      @click="salvarRepresentante"
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
              :items="representantes"
              :loading="loading"
              :search="search"
              @update:search="(value) => search = value"
              search-label="Pesquisar representante"
              item-key="id"
              no-data-icon="mdi-account-tie"
              no-data-text="Nenhum representante cadastrado"
              :show-delete-action="false"
              @edit-item="editarRepresentante"
          >
            <template v-slot:[`item.ativo`]="{ item }">
              <StatusPillToggle
                  :active="item.ativo"
                  :loading="statusToggling === item.id"
                  @toggle="onToggleAtivoRepresentante(item)"
              />
            </template>
          </TabelaPadrao>
        </v-card-text>
      </v-card>

      <v-dialog v-model="inativarDialog" max-width="420px">
        <v-card class="background-secondary">
          <v-card-title class="text-h6">Inativar representante</v-card-title>
          <v-card-text>
            Tem certeza que deseja inativar "{{ representanteParaInativar?.pessoa_nome }}"?
            <br><br>
            O representante será inativado.
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn color="grey" variant="text" @click="fecharDialogInativar">Cancelar</v-btn>
            <v-btn color="error" :loading="statusToggling === representanteParaInativar?.id" @click="confirmarInativacao">Inativar</v-btn>
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
import { useRepresentantesStore } from '@/stores/APIs/representantes'
import { usePessoasStore } from '@/stores/APIs/pessoas'

const representantesStore = useRepresentantesStore()
const pessoasStore = usePessoasStore()

const representantes = computed(() => representantesStore.representantes)
const loading = computed(() => representantesStore.loading)
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

const formRepresentante = reactive({
  id: null,
  id_pessoa: null,
  contato: '',
  fonerepresentante: '',
  observacao: ''
})

const snackbar = reactive({ show: false, message: '', color: 'success' })

// CPF/CNPJ nunca é editável depois de cadastrado (mudaria a identidade da pessoa)
const camposBloqueados = computed(() => editando.value ? ['cpf_cnpj'] : [])

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Representante', key: 'pessoa_nome', sortable: true },
  { title: 'Contato', key: 'contato', sortable: true },
  { title: 'Fone Representante', key: 'fonerepresentante', sortable: false },
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
  formPessoaRef.value?.resetarForm({ tipo_pessoa: 'F' })
  Object.assign(formRepresentante, {
    id: null,
    id_pessoa: null,
    contato: '',
    fonerepresentante: '',
    observacao: ''
  })
  if (formRef.value) formRef.value.resetValidation()
}

const handlePessoaEncontrada = (pessoa) => {
  const rep = pessoa.dados_representante
  editando.value = !!rep
  Object.assign(formRepresentante, {
    id: rep?.id_representante ?? rep?.id ?? null,
    id_pessoa: pessoa.id ?? null,
    contato: rep?.contato ?? '',
    fonerepresentante: rep?.fonerepresentante ?? '',
    observacao: rep?.observacao ?? ''
  })
}

const handlePessoaNaoEncontrada = () => {
  editando.value = false
  Object.assign(formRepresentante, {
    id: null,
    id_pessoa: null,
    contato: '',
    fonerepresentante: '',
    observacao: ''
  })
}

const editarRepresentante = async (item) => {
  editando.value = true
  formularioAberto.value = true

  try {
    const data = await representantesStore.buscarRepresentantePorId(item.id)
    if (data) {
      const p = data.pessoa || {}
      Object.assign(formPessoa, {
        id: p.id ?? data.id_pessoa ?? data.id ?? null,
        tipo_pessoa: p.tipo_pessoa ?? 'F',
        nome_razao: p.nome_razao ?? data.nome ?? '',
        cpf_cnpj: p.cpf_cnpj ?? data.cpf ?? '',
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
      Object.assign(formRepresentante, {
        id: data.id_representante ?? data.id ?? null,
        id_pessoa: p.id ?? data.id_pessoa ?? data.id ?? null,
        contato: data.contato ?? '',
        fonerepresentante: data.fonerepresentante ?? '',
        observacao: data.observacao ?? ''
      })
    }
  } catch (e) {
    console.error(e)
    editando.value = false
    snackbar.message = e.response?.data?.erro || 'Erro ao carregar representante.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}

const salvarRepresentante = async () => {
  const valid = await formRef.value?.validate()
  if (valid && !valid.valid) return

  try {
    const pessoaNova = !formPessoa.id
    const payloadEntity = {
      contato: formRepresentante.contato || null,
      fonerepresentante: (formRepresentante.fonerepresentante || '').replace(/\D/g, '') || null,
      observacao: formRepresentante.observacao || null
    }

    if (editando.value) {
      if (formPessoa.id) {
        await pessoasStore.salvarPessoa(formRef.value, { ...formPessoa, ativo: 'S' }, true, snackbar)
      }
      await representantesStore.atualizarRepresentante(formRepresentante.id, payloadEntity)
      snackbar.message = 'Representante atualizado com sucesso!'
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
      await representantesStore.criarRepresentante(payload)
      snackbar.message = 'Representante cadastrado com sucesso!'
    } else {
      if (formPessoa.id) {
        await pessoasStore.salvarPessoa(formRef.value, { ...formPessoa, ativo: 'S' }, true, snackbar)
      }
      await representantesStore.criarRepresentante({ id_pessoa: formPessoa.id, nome: formPessoa.nome_razao, ...payloadEntity })
      snackbar.message = 'Representante cadastrado com sucesso!'
    }

    snackbar.color = 'success'
    snackbar.show = true
    await representantesStore.buscarRepresentantes()
    cancelarFormulario()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || 'Erro ao salvar representante.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}

const statusToggling = ref(null)
const inativarDialog = ref(false)
const representanteParaInativar = ref(null)

const inativarRepresentante = async (item) => {
  const id = item?.id ?? item
  statusToggling.value = id
  try {
    await representantesStore.inativarRepresentante(id)
    snackbar.message = 'Representante inativado com sucesso!'
    snackbar.color = 'success'
    snackbar.show = true
    await representantesStore.buscarRepresentantes()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || 'Erro ao inativar representante.'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    statusToggling.value = null
  }
}

const reativarRepresentante = async (item) => {
  const id = item?.id ?? item
  statusToggling.value = id
  try {
    await representantesStore.reativarRepresentante(id)
    snackbar.message = 'Representante reativado com sucesso!'
    snackbar.color = 'success'
    snackbar.show = true
    await representantesStore.buscarRepresentantes()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || e.response?.data?.message || 'Erro ao reativar representante.'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    statusToggling.value = null
  }
}

const onToggleAtivoRepresentante = (item) => {
  if (item.ativo) {
    representanteParaInativar.value = item
    inativarDialog.value = true
  } else {
    reativarRepresentante(item)
  }
}

const fecharDialogInativar = () => {
  inativarDialog.value = false
  representanteParaInativar.value = null
}

const confirmarInativacao = async () => {
  const item = representanteParaInativar.value
  if (!item) return
  await inativarRepresentante(item)
  fecharDialogInativar()
}

onMounted(async () => {
  await representantesStore.buscarRepresentantes()
})
</script>
