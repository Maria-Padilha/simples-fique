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
                  {{ editando ? 'Editar Cliente' : 'Novo Cliente' }}
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
                            item-title="nome_razao"
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
              :show-delete-action="false"
              show-custom-action
              custom-action-icon="mdi-delete-forever"
              custom-action-color="error"
              custom-action-title="Excluir permanentemente"
              @edit-item="editarCliente"
              @custom-action="abrirDialogExcluir"
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
              <StatusPillToggle
                  :active="item.ativo"
                  :loading="statusToggling === item.id_cliente"
                  @toggle="onToggleAtivoCliente(item)"
              />
            </template>
          </TabelaPadrao>
        </v-card-text>
      </v-card>

      <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">{{ snackbar.message }}</v-snackbar>

      <v-dialog v-model="inativarDialog" max-width="420px">
        <v-card class="background-secondary">
          <v-card-title class="text-h6">Inativar cliente</v-card-title>
          <v-card-text>
            Tem certeza que deseja inativar "{{ clienteParaInativar?.nome_razao }}"?
            <br><br>
            O cliente será inativado.
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn color="grey" variant="text" @click="fecharDialogInativar">Cancelar</v-btn>
            <v-btn color="error" :loading="statusToggling === clienteParaInativar?.id_cliente" @click="confirmarInativacao">Inativar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="excluirDialog" max-width="420px">
        <v-card class="background-secondary">
          <v-card-title class="text-h6">Excluir cliente permanentemente</v-card-title>
          <v-card-text>
            Tem certeza que deseja excluir "{{ clienteParaExcluir?.nome_razao }}" permanentemente?
            <br><br>
            Esta ação não pode ser desfeita. Clientes com contas a receber ou adiantamentos
            vinculados não podem ser excluídos — nesse caso, inative o cliente.
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn color="grey" variant="text" @click="fecharDialogExcluir">Cancelar</v-btn>
            <v-btn color="error" :loading="excluindo" @click="confirmarExclusao">Excluir</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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

// Backend não aceita alterar esses campos de Pessoa via PUT do cliente;
// CPF/CNPJ nunca é editável depois de cadastrado (mudaria a identidade da pessoa)
const camposBloqueados = computed(() => editando.value ? ['tipo_pessoa', 'celular', 'apelido_fantasia', 'cpf_cnpj'] : [])

const headers = [
  { title: 'ID', key: 'id_cliente', sortable: true },
  { title: 'Nome', key: 'nome_razao', sortable: true },
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
  try {
    const data = await clientesStore.buscarClientePorId(item.id)
    if (data) {
      editando.value = true
      formularioAberto.value = true

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

      Object.assign(formCliente, {
        id_cliente: data.id ?? item.id_cliente ?? null,
        tpcliente: data.tpcliente ?? 'C',
        contribuinte_icms: data.contribuinte_icms ?? 'N',
        substituto_iss: data.substituto_iss ?? 'N',
        id_vendedor: data.id_vendedor ?? null,
        id_tabela_preco: data.id_tabela_preco ?? null,
        limitecredito: formatDecimalBR(data.limitecredito),
        dtvencto_limite: data.dtvencto_limite ? data.dtvencto_limite.slice(0, 10) : null,
        observacao: data.observacao ?? null,
        nrsuframa: data.nrsuframa ?? null,
        insc_mun_subst_iss: data.insc_mun_subst_iss ?? null,
      })
    }
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || e.response?.data?.message || 'Erro ao carregar cliente.'
    snackbar.color = 'error'
    snackbar.show = true
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
        await pessoasStore.salvarPessoa(formRef.value, { ...formPessoa, ativo: 'S' }, true, snackbar)
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
      if (formPessoa.id) {
        await pessoasStore.salvarPessoa(formRef.value, { ...formPessoa, ativo: 'S' }, true, snackbar)
      }
      await clientesStore.criarCliente({ id_pessoa: formPessoa.id, nome_razao: formPessoa.nome_razao, ...payloadEntity })
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

const statusToggling = ref(null)
const inativarDialog = ref(false)
const clienteParaInativar = ref(null)

const inativarCliente = async (item) => {
  const id = item?.id_cliente ?? item?.id ?? item
  statusToggling.value = id
  try {
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
  } finally {
    statusToggling.value = null
  }
}

const reativarCliente = async (item) => {
  const id = item?.id_cliente ?? item?.id ?? item
  statusToggling.value = id
  try {
    await clientesStore.reativarCliente(id)
    snackbar.message = 'Cliente reativado com sucesso!'
    snackbar.color = 'success'
    snackbar.show = true
    await clientesStore.buscarClientes()
  } catch (e) {
    console.error(e)
    snackbar.message = e.response?.data?.erro || e.response?.data?.message || 'Erro ao reativar cliente.'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    statusToggling.value = null
  }
}

// Pill de status: Ativo→Inativo pede confirmação (igual ao antigo botão de inativar);
// Inativo→Ativo reativa direto, sem confirmação (comportamento já existente)
const onToggleAtivoCliente = (item) => {
  if (item.ativo) {
    clienteParaInativar.value = item
    inativarDialog.value = true
  } else {
    reativarCliente(item)
  }
}

const fecharDialogInativar = () => {
  inativarDialog.value = false
  clienteParaInativar.value = null
}

const confirmarInativacao = async () => {
  const item = clienteParaInativar.value
  if (!item) return
  await inativarCliente(item)
  fecharDialogInativar()
}

const excluirDialog = ref(false)
const clienteParaExcluir = ref(null)
const excluindo = ref(false)

const abrirDialogExcluir = (item) => {
  clienteParaExcluir.value = item
  excluirDialog.value = true
}

const fecharDialogExcluir = () => {
  excluirDialog.value = false
  clienteParaExcluir.value = null
}

const confirmarExclusao = async () => {
  const item = clienteParaExcluir.value
  if (!item) return

  excluindo.value = true
  try {
    const id = item?.id_cliente ?? item?.id
    await clientesStore.excluirCliente(id)
    snackbar.message = 'Cliente excluído com sucesso!'
    snackbar.color = 'success'
    snackbar.show = true
    await clientesStore.buscarClientes()
    fecharDialogExcluir()
  } catch (e) {
    console.error(e)
    snackbar.message = e.validationMessage || e.response?.data?.erro || e.response?.data?.message || 'Erro ao excluir cliente.'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    excluindo.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    clientesStore.buscarClientes(),
    funcionariosStore.buscarFuncionarios()
  ])
})
</script>
