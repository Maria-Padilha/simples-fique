<template>
  <top-all-pages icon="mdi-account-group">
    <template #titulo>Clientes</template>
    <template #section>
      <v-card class="background-secondary" elevation="0">
        <v-card-text class="pa-4">
          <BotaoExpandTransition
              :formulario-aberto="formularioAberto"
              @toggle="toggleFormulario"
          >
            <template #default>{{ formularioAberto ? 'Cancelar' : 'Novo Cliente' }}</template>
          </BotaoExpandTransition>

          <v-expand-transition>
            <div v-if="formularioAberto">
              <v-card class="background-card mb-7" elevation="0">
                <v-card-title class="text-h6 pa-4">
                  <v-icon :icon="editando ? 'mdi-pencil' : 'mdi-plus'" class="mr-2" size="23px"/>
                  {{ editando ? 'Editar Cliente' : 'Novo Cliente' }}
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
                      <v-icon icon="mdi-account-details" class="mr-1" size="18px"/>
                      Dados do Cliente
                    </div>

                    <v-row dense>
                      <v-col cols="12" md="3">
                        <v-select
                            v-model="formCliente.tpcliente"
                            :items="[{ title: 'Consumidor', value: 'C' }, { title: 'Revendedor', value: 'R' }]"
                            label="Tipo de Cliente *"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-tag-outline"
                            class="custom-text-field required-left-border"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-select
                            v-model="formCliente.contribuinte_icms"
                            :items="[
                              { title: 'Sim', value: 'S' },
                              { title: 'Não', value: 'N' },
                              { title: 'Isento', value: 'I' }
                            ]"
                            label="Contribuinte ICMS *"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-receipt-text-outline"
                            class="custom-text-field required-left-border"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-select
                            v-model="formCliente.substituto_iss"
                            :items="[{ title: 'Sim', value: 'S' }, { title: 'Não', value: 'N' }]"
                            label="Substituto ISS *"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-file-document-outline"
                            class="custom-text-field required-left-border"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-select
                            v-model="formCliente.id_vendedor"
                            :items="vendedores"
                            item-title="nome"
                            item-value="id_colabo"
                            label="Vendedor"
                            clearable
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-account-tie"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model="formCliente.limitecredito"
                            v-mask-decimal.br="2"
                            label="Limite de Crédito"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-currency-brl"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model="formCliente.dtvencto_limite"
                            label="Vencimento do Limite"
                            type="date"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-calendar"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                            v-model="formCliente.observacao"
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
                      @click="salvarCliente"
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
              :items="clientes"
              :loading="loading"
              :search="search"
              @update:search="(value) => search = value"
              search-label="Pesquisar cliente"
              item-key="id_cliente"
              no-data-icon="mdi-account-group"
              no-data-text="Nenhum cliente cadastrado"
              delete-title="Inativar"
              delete-tooltip="Inativar"
              delete-dialog-title="Inativar cliente"
              delete-dialog-message="O cliente será inativado."
              delete-item-display-field="nome"
              @edit-item="editarCliente"
              @confirm-delete="inativarCliente"
          >
            <template v-slot:[`item.tipo_pessoa`]="{ item }">
              {{ item.tipo_pessoa === 'J' ? 'Jurídica' : 'Física' }}
            </template>

            <template v-slot:[`item.tpcliente`]="{ item }">
              <v-chip :color="item.tpcliente === 'R' ? 'info' : 'default'" size="small" variant="tonal">
                {{ item.tpcliente === 'R' ? 'Revendedor' : 'Consumidor' }}
              </v-chip>
            </template>

            <template v-slot:[`item.contribuinte_icms`]="{ item }">
              <v-chip size="small" variant="tonal">
                {{ { S: 'Sim', N: 'Não', I: 'Isento' }[item.contribuinte_icms] ?? item.contribuinte_icms }}
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
import { useClientesStore } from '@/stores/APIs/clientes'
import { useFuncionariosStore } from '@/stores/APIs/funcionarios'
import { usePessoasStore } from '@/stores/APIs/pessoas'

const clientesStore = useClientesStore()
const funcionariosStore = useFuncionariosStore()
const pessoasStore = usePessoasStore()

const clientes = computed(() => clientesStore.clientes)
const loading = computed(() => clientesStore.loading)
const vendedores = computed(() => funcionariosStore.funcionarios)
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

const formCliente = reactive({
  id_cliente: null,
  tpcliente: 'C',
  contribuinte_icms: 'N',
  substituto_iss: 'N',
  id_vendedor: null,
  id_tabela_preco: null,
  limitecredito: '',
  dtvencto_limite: null,
  observacao: null,
  nrsuframa: null,
  insc_mun_subst_iss: null
})

const snackbar = reactive({ show: false, message: '', color: 'success' })

const headers = [
  { title: 'ID', key: 'id_cliente', sortable: true },
  { title: 'Nome', key: 'nome', sortable: true },
  { title: 'Tipo', key: 'tipo_pessoa', sortable: true },
  { title: 'CPF/CNPJ', key: 'cpf_cnpj', sortable: false },
  { title: 'Tipo Cliente', key: 'tpcliente', sortable: false },
  { title: 'Contribuinte ICMS', key: 'contribuinte_icms', sortable: false },
  { title: 'Status', key: 'ativo', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false }
]

const rules = {
  required: (v) => !!v || 'Campo obrigatório'
}

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
  formPessoaRef.value?.resetarForm()
  Object.assign(formCliente, {
    id_cliente: null,
    tpcliente: 'C',
    contribuinte_icms: 'N',
    substituto_iss: 'N',
    id_vendedor: null,
    id_tabela_preco: null,
    limitecredito: '',
    dtvencto_limite: null,
    observacao: null,
    nrsuframa: null,
    insc_mun_subst_iss: null
  })
  if (formRef.value) formRef.value.resetValidation()
}

const handlePessoaEncontrada = (pessoa) => {
  const cli = pessoa.dados_cliente
  editando.value = !!cli
  Object.assign(formCliente, {
    id_cliente: cli?.id_cliente ?? cli?.id ?? null,
    tpcliente: cli?.tpcliente ?? 'C',
    contribuinte_icms: cli?.contribuinte_icms ?? 'N',
    substituto_iss: cli?.substituto_iss ?? 'N',
    id_vendedor: cli?.id_vendedor ?? null,
    id_tabela_preco: cli?.id_tabela_preco ?? null,
    limitecredito: cli?.limitecredito ? formatDecimalBR(cli.limitecredito) : '',
    dtvencto_limite: cli?.dtvencto_limite ? cli.dtvencto_limite.slice(0, 10) : null,
    observacao: cli?.observacao ?? null,
    nrsuframa: cli?.nrsuframa ?? null,
    insc_mun_subst_iss: cli?.insc_mun_subst_iss ?? null
  })
}

const handlePessoaNaoEncontrada = () => {
  editando.value = false
  Object.assign(formCliente, {
    id_cliente: null,
    tpcliente: 'C',
    contribuinte_icms: 'N',
    substituto_iss: 'N',
    id_vendedor: null,
    id_tabela_preco: null,
    limitecredito: '',
    dtvencto_limite: null,
    observacao: null,
    nrsuframa: null,
    insc_mun_subst_iss: null
  })
}

const editarCliente = async (item) => {
  editando.value = true
  formularioAberto.value = true

  const resultado = await pessoasStore.buscarpessoaId(item.id_pessoa)
  if (resultado) {
    formPessoaRef.value?.preencherPessoa(resultado.pessoa, resultado.endereco)
    const cli = resultado.dadosCliente || {}
    Object.assign(formCliente, {
      id_cliente: cli.id_cliente ?? item.id_cliente ?? null,
      tpcliente: cli.tpcliente ?? item.tpcliente ?? 'C',
      contribuinte_icms: cli.contribuinte_icms ?? item.contribuinte_icms ?? 'N',
      substituto_iss: cli.substituto_iss ?? item.substituto_iss ?? 'N',
      id_vendedor: cli.id_vendedor ?? item.id_vendedor ?? null,
      id_tabela_preco: cli.id_tabela_preco ?? item.id_tabela_preco ?? null,
      limitecredito: formatDecimalBR(cli.limitecredito ?? item.limitecredito),
      dtvencto_limite: (cli.dtvencto_limite ?? item.dtvencto_limite) ? (cli.dtvencto_limite ?? item.dtvencto_limite).slice(0, 10) : null,
      observacao: cli.observacao ?? item.observacao ?? null,
      nrsuframa: cli.nrsuframa ?? item.nrsuframa ?? null,
      insc_mun_subst_iss: cli.insc_mun_subst_iss ?? item.insc_mun_subst_iss ?? null
    })
  }
}

const salvarCliente = async () => {
  const valid = await formRef.value?.validate()
  if (valid && !valid.valid) return

  try {
    const pessoaNova = !formPessoa.id
    const payloadEntity = {
      tpcliente: formCliente.tpcliente,
      contribuinte_icms: formCliente.contribuinte_icms,
      substituto_iss: formCliente.substituto_iss,
      id_vendedor: formCliente.id_vendedor || null,
      id_tabela_preco: formCliente.id_tabela_preco || null,
      limitecredito: parseDecimalBR(formCliente.limitecredito),
      dtvencto_limite: formCliente.dtvencto_limite || null,
      observacao: formCliente.observacao || null,
      nrsuframa: formCliente.nrsuframa || null,
      insc_mun_subst_iss: formCliente.insc_mun_subst_iss || null
    }

    if (editando.value) {
      if (formPessoa.id) {
        await pessoasStore.salvarPessoa(formRef.value, { ...formPessoa }, true, snackbar)
      }
      await clientesStore.atualizarCliente(formCliente.id_cliente, payloadEntity)
      snackbar.message = 'Cliente atualizado com sucesso!'
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
      await clientesStore.criarCliente(payload)
      snackbar.message = 'Cliente cadastrado com sucesso!'
    } else {
      await clientesStore.criarCliente({ id_pessoa: formPessoa.id, ...payloadEntity })
      snackbar.message = 'Cliente cadastrado com sucesso!'
    }

    snackbar.color = 'success'
    snackbar.show = true
    await clientesStore.buscarClientes()
    cancelarFormulario()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || 'Erro ao salvar cliente.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}

const inativarCliente = async (item) => {
  try {
    const id = item?.id_cliente ?? item?.id ?? item
    await clientesStore.inativarCliente(id)
    snackbar.message = 'Cliente inativado com sucesso!'
    snackbar.color = 'success'
    snackbar.show = true
    await clientesStore.buscarClientes()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || 'Erro ao inativar cliente.'
    snackbar.color = 'error'
    snackbar.show = true
  }
}

onMounted(async () => {
  await Promise.all([
    clientesStore.buscarClientes(),
    funcionariosStore.buscarFuncionarios()
  ])
})
</script>
