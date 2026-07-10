<template>
  <top-all-pages icon="mdi-account-group">
    <template #titulo>Clientes</template>
    <template #section>
      <v-card class="background-secondary" elevation="0">
        <v-card-text class="pa-4">
          <BotaoExpandTransition
              :formulario-aberto="formularioAberto"
              texto-abrir="Novo Cliente"
              texto-fechar="Cancelar"
              @toggle="toggleFormulario"
          />

          <v-expand-transition>
            <div v-if="formularioAberto">
              <v-card class="background-card mb-7" elevation="0">
                <v-card-title class="text-h6 pa-4">
                  <v-icon :icon="editando ? 'mdi-pencil' : 'mdi-plus'" class="mr-2"></v-icon>
                  {{ editando ? 'Editar Cliente' : 'Novo Cliente' }}
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

                      <v-col cols="12" md="2">
                        <v-select
                            v-model="form.tipo_pessoa"
                            :items="[{ title: 'Física', value: 'F' }, { title: 'Jurídica', value: 'J' }]"
                            label="Tipo *"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-account-circle"
                            class="required-left-border"
                        ></v-select>
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model="form.cpf"
                            :label="form.tipo_pessoa === 'J' ? 'CNPJ' : 'CPF'"
                            :maxlength="form.tipo_pessoa === 'J' ? 18 : 14"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-card-account-details-outline"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="3">
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
                        <v-select
                            v-model="form.tpcliente"
                            :items="[{ title: 'Consumidor', value: 'C' }, { title: 'Revendedor', value: 'R' }]"
                            label="Tipo de Cliente *"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-tag-outline"
                            class="required-left-border"
                        ></v-select>
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-select
                            v-model="form.contribuinte_icms"
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
                            class="required-left-border"
                        ></v-select>
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-select
                            v-model="form.substituto_iss"
                            :items="[{ title: 'Sim', value: 'S' }, { title: 'Não', value: 'N' }]"
                            label="Substituto ISS *"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-file-document-outline"
                            class="required-left-border"
                        ></v-select>
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-select
                            v-model="form.id_vendedor"
                            :items="vendedores"
                            item-title="nome"
                            item-value="id_colabo"
                            label="Vendedor"
                            clearable
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-account-tie"
                        ></v-select>
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model="form.limitecredito"
                            v-mask-decimal.br="2"
                            label="Limite de Crédito"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-currency-brl"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model="form.dtvencto_limite"
                            label="Vencimento do Limite"
                            type="date"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-calendar"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="9">
                        <v-text-field
                            v-model="form.observacao"
                            label="Observação"
                            maxlength="500"
                            variant="outlined"
                            density="compact"
                            prepend-inner-icon="mdi-note-text-outline"
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
                      @click="salvarCliente"
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
              delete-dialog-message="O cliente não é removido — a Pessoa vinculada ficará inativa."
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
import BotaoExpandTransition from '@/components/base/padrao-paginas/BotaoExpandTransition.vue'
import TabelaPadrao from '@/components/base/padrao-paginas/TabelaPadrao.vue'
import TopAllPages from '@/components/base/padrao-paginas/TopAllPages.vue'
import { useClientesStore } from '@/stores/APIs/clientes'
import { useFuncionariosStore } from '@/stores/APIs/funcionarios'

const clientesStore = useClientesStore()
const funcionariosStore = useFuncionariosStore()

const clientes = computed(() => clientesStore.clientes)
const loading = computed(() => clientesStore.loading)
const vendedores = computed(() => funcionariosStore.funcionarios)
const search = ref('')

const formularioAberto = ref(false)
const formValido = ref(false)
const formRef = ref(null)
const editando = ref(false)

const form = reactive({
  id_cliente: null,
  nome: '',
  tipo_pessoa: 'F',
  cpf: '',
  telefone: '',
  tpcliente: 'C',
  contribuinte_icms: 'N',
  substituto_iss: 'N',
  id_vendedor: null,
  id_tabela_preco: null,
  limitecredito: '',
  dtvencto_limite: null,
  observacao: null,
  id_red_ctb_cli: null,
  nrsuframa: null,
  insc_mun_subst_iss: null
})

const parseDecimalBR = (str) => {
  if (!str && str !== 0) return null
  return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || null
}

const formatDecimalBR = (num) => {
  if (!num && num !== 0) return ''
  return parseFloat(num).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const snackbar = reactive({ show: false, message: '', color: 'success' })

const headers = [
  { title: 'ID', key: 'id_cliente', sortable: true },
  { title: 'Nome', key: 'nome', sortable: true },
  { title: 'Tipo', key: 'tipo_pessoa', sortable: true },
  { title: 'CPF/CNPJ', key: 'cpf', sortable: false },
  { title: 'Tipo Cliente', key: 'tpcliente', sortable: false },
  { title: 'Contribuinte ICMS', key: 'contribuinte_icms', sortable: false },
  { title: 'Status', key: 'ativo', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false }
]

const rules = {
  required: (v) => !!v || 'Campo obrigatório'
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

const editarCliente = (item) => {
  editando.value = true
  Object.assign(form, {
    id_cliente: item.id_cliente,
    nome: item.nome || '',
    tipo_pessoa: item.tipo_pessoa || 'F',
    cpf: item.cpf || '',
    telefone: item.telefone || '',
    tpcliente: item.tpcliente || 'C',
    contribuinte_icms: item.contribuinte_icms || 'N',
    substituto_iss: item.substituto_iss || 'N',
    id_vendedor: item.id_vendedor || null,
    id_tabela_preco: item.id_tabela_preco || null,
    limitecredito: formatDecimalBR(item.limitecredito),
    dtvencto_limite: item.dtvencto_limite ? item.dtvencto_limite.slice(0, 10) : null,
    observacao: item.observacao || null,
    id_red_ctb_cli: item.id_red_ctb_cli || null,
    nrsuframa: item.nrsuframa || null,
    insc_mun_subst_iss: item.insc_mun_subst_iss || null
  })
  formularioAberto.value = true
}

const cancelarFormulario = () => {
  formularioAberto.value = false
  resetarForm()
}

const resetarForm = () => {
  Object.assign(form, {
    id_cliente: null,
    nome: '',
    tipo_pessoa: 'F',
    cpf: '',
    telefone: '',
    tpcliente: 'C',
    contribuinte_icms: 'N',
    substituto_iss: 'N',
    id_vendedor: null,
    id_tabela_preco: null,
    limitecredito: '',
    dtvencto_limite: null,
    observacao: null,
    id_red_ctb_cli: null,
    nrsuframa: null,
    insc_mun_subst_iss: null
  })
  if (formRef.value) formRef.value.resetValidation()
}

const mostrarMensagem = (message, color = 'success') => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

const salvarCliente = async () => {
  if (!formRef.value?.validate()) return
  try {
    const payload = {
      nome: form.nome,
      tipo_pessoa: form.tipo_pessoa,
      cpf: form.cpf || null,
      telefone: form.telefone || null,
      tpcliente: form.tpcliente,
      contribuinte_icms: form.contribuinte_icms,
      substituto_iss: form.substituto_iss,
      id_vendedor: form.id_vendedor || null,
      id_tabela_preco: form.id_tabela_preco || null,
      limitecredito: parseDecimalBR(form.limitecredito),
      dtvencto_limite: form.dtvencto_limite || null,
      observacao: form.observacao || null,
      id_red_ctb_cli: form.id_red_ctb_cli || null,
      nrsuframa: form.nrsuframa || null,
      insc_mun_subst_iss: form.insc_mun_subst_iss || null
    }

    if (editando.value) {
      await clientesStore.atualizarCliente(form.id_cliente, payload)
      mostrarMensagem('Cliente atualizado com sucesso!')
    } else {
      await clientesStore.criarCliente(payload)
      mostrarMensagem('Cliente cadastrado com sucesso!')
    }

    await clientesStore.buscarClientes()
    cancelarFormulario()
  } catch (e) {
    console.error(e)
    mostrarMensagem(e.response?.data?.erro || 'Erro ao salvar cliente.', 'error')
  }
}

const inativarCliente = async (item) => {
  try {
    const id = item?.id_cliente ?? item?.id ?? item
    await clientesStore.inativarCliente(id)
    mostrarMensagem('Cliente inativado com sucesso!')
    await clientesStore.buscarClientes()
  } catch (e) {
    console.error(e)
    mostrarMensagem(e.response?.data?.erro || 'Erro ao inativar cliente.', 'error')
  }
}

onMounted(async () => {
  await Promise.all([
    clientesStore.buscarClientes(),
    funcionariosStore.buscarFuncionarios()
  ])
})
</script>
