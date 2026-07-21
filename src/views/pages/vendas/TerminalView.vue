<template>
  <top-all-pages icon="mdi-monitor-dashboard">
    <template #titulo>Terminal de Vendas</template>

    <template #section>
      <BotaoExpandTransition
        :formulario-aberto="formularioAberto"
        texto-abrir="Novo Terminal"
        texto-fechar="Cancelar"
        @toggle="toggleFormulario"
      />

      <!-- Formulário Expansível -->
      <v-expand-transition>
        <div v-if="formularioAberto">
          <v-card class="background-card mb-7" elevation="2">
            <v-card-title class="text-h6 pa-4">
              <v-icon :icon="editando ? 'mdi-pencil' : 'mdi-plus'" class="mr-2"></v-icon>
              {{ editando ? 'Editar Terminal' : 'Novo Terminal' }}
            </v-card-title>

            <v-card-text class="pa-4">
              <v-form ref="formRef" v-model="formValido">
                <v-row>
                  <!-- Identificação -->
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="formData.nome"
                      label="Nome do Terminal *"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-monitor-dashboard"
                      hide-details="auto"
                      :rules="[rules.required]"
                      color="var(--text-color-laranja)"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="formData.codigo"
                      label="Código *"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-identifier"
                      hide-details="auto"
                      :rules="[rules.required]"
                      color="var(--text-color-laranja)"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select
                      v-model="formData.status"
                      :items="opcoesStatus"
                      label="Status"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-toggle-switch"
                      hide-details="auto"
                      color="var(--text-color-laranja)"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="formData.senha_operacional"
                      label="Senha Operacional"
                      :hint="editando ? 'Deixe em branco para manter a senha atual' : 'Usada por totem/comandas/chamados para acessar o terminal'"
                      persistent-hint
                      type="password"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-lock"
                      color="var(--text-color-laranja)"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select
                      v-model="formData.modo_ticket"
                      :items="opcoesModoTicket"
                      label="Modo de Emissão de Ticket"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-ticket-confirmation"
                      hide-details="auto"
                      color="var(--text-color-laranja)"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="formData.valor_couvert_padrao"
                      label="Valor Couvert Padrão"
                      type="number"
                      min="0"
                      step="0.01"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-cash"
                      hide-details="auto"
                      color="var(--text-color-laranja)"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="formData.percentual_taxa_servico_padrao"
                      label="Taxa de Serviço Padrão (%)"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-percent"
                      hide-details="auto"
                      color="var(--text-color-laranja)"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select
                      v-model="formData.produto_id_couvert"
                      :items="opcoesProdutos"
                      label="Produto do Couvert"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-food"
                      hide-details="auto"
                      clearable
                      color="var(--text-color-laranja)"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select
                      v-model="formData.produto_id_taxa_servico"
                      :items="opcoesProdutos"
                      label="Produto da Taxa de Serviço"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-room-service"
                      hide-details="auto"
                      clearable
                      color="var(--text-color-laranja)"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-row dense>
                      <v-col cols="12" md="4">
                        <v-switch
                          v-model="formData.permite_sincronizacao"
                          label="Permite sincronização"
                          color="var(--text-color-laranja)"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-switch
                          v-model="formData.emite_cupom_fiscal"
                          label="Emite cupom fiscal"
                          color="var(--text-color-laranja)"
                          hide-details
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-switch
                          v-model="formData.emite_ticket"
                          label="Emite ticket"
                          color="var(--text-color-laranja)"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-btn
                v-if="editando"
                color="error"
                variant="text"
                @click="confirmarExclusao"
              >
                <v-icon start>mdi-delete</v-icon>
                Excluir
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="grey" variant="text" @click="cancelarFormulario">
                Cancelar
              </v-btn>
              <v-btn
                color="var(--text-color-laranja)"
                :loading="loading"
                :disabled="!formValido"
                @click="salvarTerminal"
                variant="flat"
                class="text-white px-6"
                size="default"
              >
                {{ editando ? 'Atualizar' : 'Salvar' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-expand-transition>

      <!-- Tabela de Dados -->
      <v-card v-if="!formularioAberto" class="background-card" elevation="0">
        <v-card-text class="pa-4">
          <TabelaPadrao
            :formulario-aberto="formularioAberto"
            :headers="headers"
            :items="itemsFiltrados"
            :loading="loading"
            :search="search"
            @update:search="(value) => search = value"
            search-label="Pesquisar Terminal"
            item-key="id"
            no-data-icon="mdi-monitor-dashboard"
            no-data-text="Nenhum terminal cadastrado"
            delete-item-display-field="nome"
            @edit-item="editarTerminal"
            @confirm-delete="excluirTerminal"
          >
            <template v-slot:[`item.status`]="{ item }">
              <v-chip :color="item.status === 'ativo' ? 'success' : 'error'" size="small">
                {{ item.status === 'ativo' ? 'Ativo' : 'Inativo' }}
              </v-chip>
            </template>

            <template v-slot:[`item.emite_cupom_fiscal`]="{ item }">
              <v-icon :color="item.emite_cupom_fiscal ? 'success' : 'grey'">
                {{ item.emite_cupom_fiscal ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
            </template>

            <template v-slot:[`item.emite_ticket`]="{ item }">
              <v-icon :color="item.emite_ticket ? 'success' : 'grey'">
                {{ item.emite_ticket ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
            </template>

            <template v-slot:[`item.ambientes_count`]="{ item }">
              {{ item.ambientes_count ?? 0 }}
            </template>
          </TabelaPadrao>
        </v-card-text>
      </v-card>

      <!-- Dialog de Confirmação de Exclusão -->
      <v-dialog v-model="dialogExcluir" max-width="500">
        <v-card>
          <v-card-title class="text-h6 pa-4">
            <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
            Confirmar Exclusão
          </v-card-title>
          <v-card-text class="pa-4">
            Tem certeza que deseja excluir o terminal <strong>{{ formData.nome }}</strong>?
            <br>Se o terminal já possuir pedidos, ele será apenas inativado em vez de excluído.
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="dialogExcluir = false">
              Cancelar
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              :loading="loading"
              @click="excluirConfirmado"
            >
              Excluir
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </top-all-pages>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import TopAllPages from '@/components/base/padrao-paginas/TopAllPages.vue'
import BotaoExpandTransition from '@/components/base/padrao-paginas/BotaoExpandTransition.vue'
import TabelaPadrao from '@/components/base/padrao-paginas/TabelaPadrao.vue'
import { useVendasStore } from '@/stores/APIs/vendas'

const vendasStore = useVendasStore()

// Estados
const formularioAberto = ref(false)
const editando = ref(false)
const formValido = ref(false)
const formRef = ref(null)
const search = ref('')
const dialogExcluir = ref(false)

// Computed
const loading = computed(() => vendasStore.loading)
const itemsFiltrados = computed(() => {
  const dados = vendasStore.terminais || []
  return Array.isArray(dados) ? dados : []
})

const opcoesProdutos = computed(() => {
  const produtos = vendasStore.catalogoProdutos || []
  return produtos.map((produto) => ({ title: produto.descproduto, value: produto.id }))
})

// Opções dos selects
const opcoesStatus = [
  { title: 'Ativo', value: 'ativo' },
  { title: 'Inativo', value: 'inativo' }
]

const opcoesModoTicket = [
  { title: 'Agrupado', value: 'agrupado' },
  { title: 'Por Unidade', value: 'por_unidade' },
  { title: 'Não Emitir', value: 'nao_emitir' }
]

// Form Data
const formData = reactive({
  id: null,
  nome: '',
  codigo: '',
  status: 'ativo',
  senha_operacional: '',
  permite_sincronizacao: true,
  emite_cupom_fiscal: true,
  emite_ticket: true,
  modo_ticket: 'agrupado',
  valor_couvert_padrao: 0,
  percentual_taxa_servico_padrao: 10,
  produto_id_couvert: null,
  produto_id_taxa_servico: null
})

// Headers da tabela
const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Nome', key: 'nome', sortable: true },
  { title: 'Código', key: 'codigo', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Ambientes', key: 'ambientes_count', sortable: false },
  { title: 'Cupom Fiscal', key: 'emite_cupom_fiscal', sortable: false },
  { title: 'Ticket', key: 'emite_ticket', sortable: false },
  { title: 'Modo Ticket', key: 'modo_ticket', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false }
]

// Regras de validação
const rules = {
  required: (value) => !!value || 'Campo obrigatório'
}

// Métodos

const toggleFormulario = () => {
  formularioAberto.value = !formularioAberto.value
  if (!formularioAberto.value) {
    cancelarFormulario()
  }
}

const resetFormData = () => {
  formData.id = null
  formData.nome = ''
  formData.codigo = ''
  formData.status = 'ativo'
  formData.senha_operacional = ''
  formData.permite_sincronizacao = true
  formData.emite_cupom_fiscal = true
  formData.emite_ticket = true
  formData.modo_ticket = 'agrupado'
  formData.valor_couvert_padrao = 0
  formData.percentual_taxa_servico_padrao = 10
  formData.produto_id_couvert = null
  formData.produto_id_taxa_servico = null
}

const cancelarFormulario = () => {
  formRef.value?.reset()
  formRef.value?.resetValidation()
  editando.value = false
  resetFormData()
  formularioAberto.value = false
}

const salvarTerminal = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = {
      nome: formData.nome,
      codigo: formData.codigo,
      status: formData.status,
      permite_sincronizacao: formData.permite_sincronizacao,
      emite_cupom_fiscal: formData.emite_cupom_fiscal,
      emite_ticket: formData.emite_ticket,
      modo_ticket: formData.modo_ticket,
      valor_couvert_padrao: formData.valor_couvert_padrao || 0,
      percentual_taxa_servico_padrao: formData.percentual_taxa_servico_padrao || 0,
      produto_id_couvert: formData.produto_id_couvert || null,
      produto_id_taxa_servico: formData.produto_id_taxa_servico || null
    }

    if (formData.senha_operacional) {
      payload.senha_operacional = formData.senha_operacional
    }

    if (editando.value) {
      await vendasStore.alterarTerminal(formData.id, payload)
    } else {
      await vendasStore.cadastrarTerminal(payload)
    }

    await vendasStore.listarTerminais()
    cancelarFormulario()
  } catch (error) {
    console.error('Erro ao salvar terminal:', error)
  }
}

const editarTerminal = (item) => {
  formData.id = item.id
  formData.nome = item.nome
  formData.codigo = item.codigo
  formData.status = item.status || 'ativo'
  formData.senha_operacional = ''
  formData.permite_sincronizacao = !!item.permite_sincronizacao
  formData.emite_cupom_fiscal = !!item.emite_cupom_fiscal
  formData.emite_ticket = !!item.emite_ticket
  formData.modo_ticket = item.modo_ticket || 'agrupado'
  formData.valor_couvert_padrao = Number(item.valor_couvert_padrao) || 0
  formData.percentual_taxa_servico_padrao = Number(item.percentual_taxa_servico_padrao) || 0
  formData.produto_id_couvert = item.produto_id_couvert || null
  formData.produto_id_taxa_servico = item.produto_id_taxa_servico || null

  editando.value = true
  formularioAberto.value = true

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const confirmarExclusao = () => {
  dialogExcluir.value = true
}

const excluirTerminal = async (id) => {
  try {
    await vendasStore.deletarTerminal(id)
    await vendasStore.listarTerminais()
  } catch (error) {
    console.error('Erro ao excluir terminal:', error)
  }
}

const excluirConfirmado = async () => {
  try {
    await vendasStore.deletarTerminal(formData.id)
    await vendasStore.listarTerminais()
    dialogExcluir.value = false
    cancelarFormulario()
  } catch (error) {
    console.error('Erro ao excluir terminal:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await vendasStore.listarTerminais()
  await vendasStore.listarCatalogoProdutos()
})
</script>
