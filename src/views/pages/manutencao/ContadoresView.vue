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
              delete-title="Inativar"
              delete-tooltip="Inativar"
              delete-dialog-title="Inativar contador"
              delete-dialog-message="O contador será inativado."
              delete-item-display-field="pessoa_nome"
              @edit-item="editarContador"
              @confirm-delete="inativarContador"
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

  const resultado = await pessoasStore.buscarpessoaId(item.id_pessoa)
  if (resultado) {
    formPessoaRef.value?.preencherPessoa(resultado.pessoa, resultado.endereco)
    const cont = resultado.dadosContador || {}
    Object.assign(formContador, {
      id: cont.id_contador ?? item.id ?? null,
      id_pessoa: item.id_pessoa ?? resultado.pessoa?.id ?? null,
      contato: cont.contato ?? item.contato ?? '',
      fonecontador: cont.fonecontador ?? item.fonecontador ?? '',
      observacao: cont.observacao ?? item.observacao ?? '',
      crc: cont.crc ?? item.crc ?? ''
    })
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
        await pessoasStore.salvarPessoa(formRef.value, { ...formPessoa }, true, snackbar)
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
      await contadoresStore.criarContador({ id_pessoa: formPessoa.id, ...payloadEntity })
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

const inativarContador = async (item) => {
  try {
    const id = item?.id ?? item
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
  }
}

onMounted(async () => {
  await contadoresStore.buscarContadores()
})
</script>
