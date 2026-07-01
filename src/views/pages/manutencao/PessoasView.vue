<template>
  <top-all-pages icon="mdi-account-multiple">
    <template #titulo>Pessoas</template>

    <template #acoes>
      <!-- reservado para export/pdf -->
    </template>

    <template #section>
      <div>
        <v-card elevation="0" class="background-secondary">
          <v-card-text class="pa-4">
            <botao-expand-transition
                :formulario-aberto="formularioAberto"
                @toggle="toggleFormulario"
            >
              <template #default>{{ formularioAberto ? 'Cancelar' : 'Nova Pessoa' }}</template>
            </botao-expand-transition>

            <!-- Formulário — preenchido na Task 3 -->
            <v-expand-transition>
              <div v-if="formularioAberto">
                <v-card class="background-card mb-7" elevation="0">
                  <v-card-title class="text-h6 pa-4">
                    <v-icon :icon="editando ? 'mdi-pencil' : 'mdi-plus'" class="mr-2" size="23px"/>
                    {{ editando ? 'Editar Pessoa' : 'Nova Pessoa' }}
                  </v-card-title>
                  <v-card-text class="pa-4">
                    <v-form ref="formRef" v-model="formValido">
                      <!-- ── Grupo 1: Identificação ─────────────────────── -->
                      <div class="text-subtitle-2 font-weight-bold mb-3">
                        <v-icon icon="mdi-account-circle" class="mr-1" size="18px"/>
                        Identificação
                      </div>
                      <v-row>
                        <v-col cols="12" md="3">
                          <v-select
                              v-model="form.tipo_pessoa"
                              :items="[{ label: 'Física', value: 'F' }, { label: 'Jurídica', value: 'J' }]"
                              item-title="label"
                              item-value="value"
                              label="Tipo *"
                              :rules="[rules.required]"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field required-left-border"
                              prepend-inner-icon="mdi-account-circle"
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-if="form.tipo_pessoa === 'F'"
                              v-model="form.cpf_cnpj"
                              label="CPF"
                              maxlength="14"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-card-account-details"
                              v-mask-cpf
                          />
                          <v-text-field
                              v-else
                              v-model="form.cpf_cnpj"
                              label="CNPJ"
                              maxlength="18"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-card-account-details"
                              v-mask-cnpj
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.nome_razao"
                              label="Nome / Razão *"
                              :rules="[rules.required]"
                              maxlength="100"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field required-left-border"
                              prepend-inner-icon="mdi-account"
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.apelido_fantasia"
                              label="Apelido / Fantasia *"
                              :rules="[rules.required]"
                              maxlength="100"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field required-left-border"
                              prepend-inner-icon="mdi-rename-box"
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.rg_inscricao"
                              label="RG / Inscrição Estadual"
                              maxlength="20"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-identifier"
                          />
                        </v-col>
                      </v-row>

                      <!-- ── Grupo 2: Contato & Redes ───────────────────── -->
                      <v-divider class="my-4"/>
                      <div class="text-subtitle-2 font-weight-bold mb-3">
                        <v-icon icon="mdi-phone" class="mr-1" size="18px"/>
                        Contato & Redes
                      </div>
                      <v-row>
                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.telefone"
                              label="Telefone"
                              maxlength="15"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-phone"
                              v-mask-phone.br
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.celular"
                              label="Celular"
                              maxlength="15"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-cellphone"
                              v-mask-phone.br
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.whats"
                              label="WhatsApp"
                              maxlength="15"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-whatsapp"
                              v-mask-phone.br
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.website"
                              label="Website"
                              maxlength="150"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-web"
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.instagram"
                              label="Instagram"
                              maxlength="80"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-instagram"
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.facebook"
                              label="Facebook"
                              maxlength="80"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-facebook"
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.twitter_x"
                              label="Twitter / X"
                              maxlength="80"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-twitter"
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.tik_tok"
                              label="TikTok"
                              maxlength="80"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-music-note"
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-text-field
                              v-model="form.telegram"
                              label="Telegram"
                              maxlength="80"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-send"
                          />
                        </v-col>
                      </v-row>

                      <!-- ── Grupo 3: Classificação ─────────────────────── -->
                      <v-divider class="my-4"/>
                      <div class="text-subtitle-2 font-weight-bold mb-3">
                        <v-icon icon="mdi-tag-multiple" class="mr-1" size="18px"/>
                        Classificação
                      </div>
                      <v-row align="center">
                        <v-col cols="12" md="auto">
                          <v-checkbox
                              v-model="form.cliente"
                              true-value="S"
                              false-value="N"
                              label="Cliente"
                              density="compact"
                              hide-details
                              color="var(--text-color-laranja)"
                          />
                        </v-col>
                        <v-col cols="12" md="auto">
                          <v-checkbox
                              v-model="form.fornecedor"
                              true-value="S"
                              false-value="N"
                              label="Fornecedor"
                              density="compact"
                              hide-details
                              color="var(--text-color-laranja)"
                          />
                        </v-col>
                        <v-col cols="12" md="auto">
                          <v-checkbox
                              v-model="form.transportadora"
                              true-value="S"
                              false-value="N"
                              label="Transportadora"
                              density="compact"
                              hide-details
                              color="var(--text-color-laranja)"
                          />
                        </v-col>
                        <v-col cols="12" md="auto">
                          <v-checkbox
                              v-model="form.colaborador"
                              true-value="S"
                              false-value="N"
                              label="Colaborador"
                              density="compact"
                              hide-details
                              color="var(--text-color-laranja)"
                          />
                        </v-col>
                        <v-col cols="12" md="auto">
                          <v-checkbox
                              v-model="form.representante"
                              true-value="S"
                              false-value="N"
                              label="Representante"
                              density="compact"
                              hide-details
                              color="var(--text-color-laranja)"
                          />
                        </v-col>
                      </v-row>

                      <v-row v-if="form.cliente === 'S' || form.fornecedor === 'S'">
                        <v-col v-if="form.cliente === 'S'" cols="12" md="4">
                          <v-autocomplete
                              v-model="form.id_red_ctb_cli"
                              :items="planosConta"
                              item-title="descconta"
                              item-value="id"
                              label="Redução Contábil — Cliente"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-bank"
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

                        <v-col v-if="form.fornecedor === 'S'" cols="12" md="4">
                          <v-autocomplete
                              v-model="form.id_red_ctb_for"
                              :items="planosConta"
                              item-title="descconta"
                              item-value="id"
                              label="Redução Contábil — Fornecedor"
                              variant="outlined"
                              density="compact"
                              hide-details="auto"
                              :theme="themeStore.darkMode ? 'dark' : 'light'"
                              class="custom-text-field"
                              prepend-inner-icon="mdi-bank-outline"
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
                      </v-row>

                      <!-- Grupo 4: Endereços — adicionado na Task 4 -->
                    </v-form>
                  </v-card-text>
                  <v-card-actions class="pa-4">
                    <v-spacer/>
                    <v-btn color="grey" variant="text" size="small" @click="cancelarFormulario">
                      Cancelar
                    </v-btn>
                    <v-btn
                        color="var(--text-color-laranja)"
                        variant="flat"
                        size="small"
                        class="text-white"
                        :loading="pessoasStore.loading"
                        :disabled="!formValido"
                        @click="salvarPessoa"
                    >
                      {{ editando ? 'Atualizar' : 'Salvar' }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </div>
            </v-expand-transition>

            <!-- Tabela -->
            <v-expand-transition>
              <div v-if="!formularioAberto">
                <tabela-padrao
                    :headers="headers"
                    :items="pessoas"
                    :loading="loading"
                    item-key="id"
                    :formulario-aberto="formularioAberto"
                    no-data-text="Nenhuma pessoa encontrada"
                    no-data-icon="mdi-account-off"
                    @edit-item="editarPessoa"
                    @confirm-delete="confirmarExclusao"
                >
                  <template #item.tipo_pessoa="{ item }">
                    <v-chip
                        :color="item.tipo_pessoa === 'F' ? 'blue' : 'purple'"
                        size="x-small"
                        variant="tonal"
                    >
                      {{ item.tipo_pessoa === 'F' ? 'Física' : 'Jurídica' }}
                    </v-chip>
                  </template>

                  <template #item._classificacao="{ item }">
                    <div class="d-flex flex-wrap gap-1">
                      <v-chip v-if="item.cliente === 'S'" color="success" size="x-small" variant="tonal">
                        Cliente
                      </v-chip>
                      <v-chip v-if="item.fornecedor === 'S'" color="warning" size="x-small" variant="tonal">
                        Fornecedor
                      </v-chip>
                      <v-chip v-if="item.transportadora === 'S'" color="info" size="x-small" variant="tonal">
                        Transportadora
                      </v-chip>
                      <v-chip v-if="item.colaborador === 'S'" color="orange" size="x-small" variant="tonal">
                        Colaborador
                      </v-chip>
                      <v-chip v-if="item.representante === 'S'" color="pink" size="x-small" variant="tonal">
                        Representante
                      </v-chip>
                    </div>
                  </template>
                </tabela-padrao>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>

        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
          {{ snackbar.message }}
        </v-snackbar>

        <acesso-negado-modal
            v-model="modalAcessoNegado"
            :nome-programa="NOME_PROGRAMA"
            :tipo-acesso="tipoAcessoNegado"
        />
      </div>
    </template>
  </top-all-pages>
</template>

<script setup>
// ─── 1. Vue ──────────────────────────────────────────────
import { ref, reactive, computed, onMounted } from 'vue'

// ─── 2. Componentes Base ─────────────────────────────────
import TopAllPages from '@/components/base/padrao-paginas/TopAllPages.vue'
import TabelaPadrao from '@/components/base/padrao-paginas/TabelaPadrao.vue'
import BotaoExpandTransition from '@/components/base/padrao-paginas/BotaoExpandTransition.vue'
import AcessoNegadoModal from '@/components/base/modais/AcessoNegadoModal.vue'

// ─── 3. Stores ───────────────────────────────────────────
import { usePessoasStore } from '@/stores/APIs/pessoas'
import { useThemeStore } from '@/stores/config-temas/theme'
import { useFinanceiroStore } from '@/stores/APIs/financeiro'

const pessoasStore = usePessoasStore()
const themeStore = useThemeStore()
const financeiroStore = useFinanceiroStore()

// ─── 4. Composables ──────────────────────────────────────
import { usePermissoes } from '@/utils/usePermissoes'
const { podeVisualizar, podeIncluir, podeAlterar, podeExcluir } = usePermissoes()

// ─── 5. Constantes ───────────────────────────────────────
const ID_PROGRAMA = 'MMAN001P'
const NOME_PROGRAMA = 'Pessoas'

// ─── 6. Estado Local ─────────────────────────────────────
const formularioAberto = ref(false)
const editando = ref(false)
const formValido = ref(false)
const formRef = ref(null)
const modalAcessoNegado = ref(false)
const tipoAcessoNegado = ref('visualizar')

const form = reactive({
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
  cliente: 'N',
  fornecedor: 'N',
  transportadora: 'N',
  colaborador: 'N',
  representante: 'N',
  instagram: '',
  facebook: '',
  twitter_x: '',
  tik_tok: '',
  telegram: '',
  id_red_ctb_cli: null,
  id_red_ctb_for: null,
  enderecos: [],
})

const snackbar = reactive({ show: false, message: '', color: 'success' })

// ─── 7. Regras de Validação ──────────────────────────────
// usado pelo formulário na Task 3
const rules = {
  required: (v) => !!v || 'Campo obrigatório',
}

// ─── 8. Headers da Tabela ────────────────────────────────
const headers = [
  { title: 'ID', key: 'id', align: 'start', width: 70 },
  { title: 'Tipo', key: 'tipo_pessoa', align: 'center', width: 90 },
  { title: 'Nome / Razão', key: 'nome_razao', align: 'start' },
  { title: 'Apelido', key: 'apelido_fantasia', align: 'start' },
  { title: 'CPF/CNPJ', key: 'cpf_cnpj', align: 'start', width: 160 },
  { title: 'Telefone', key: 'telefone', align: 'start', width: 140 },
  { title: 'Classificação', key: '_classificacao', align: 'start', width: 220, sortable: false },
  { title: 'Ações', key: 'actions', align: 'center', sortable: false, width: 90 },
]

// ─── 9. Computados ───────────────────────────────────────
const pessoas = computed(() => pessoasStore.pessoas)
const loading = computed(() => pessoasStore.loading)
const planosConta = computed(() => financeiroStore.planosConta)

// ─── 10. Lifecycle ───────────────────────────────────────
onMounted(async () => {
  if (!podeVisualizar(ID_PROGRAMA)) {
    tipoAcessoNegado.value = 'visualizar'
    modalAcessoNegado.value = true
    return
  }
  await pessoasStore.buscarTodasPessoas()
  await financeiroStore.buscarPlanosConta()
})

// ─── 11. Métodos ─────────────────────────────────────────
function toggleFormulario() {
  if (formularioAberto.value) {
    cancelarFormulario()
    return
  }
  if (!podeIncluir(ID_PROGRAMA)) {
    tipoAcessoNegado.value = 'incluir'
    modalAcessoNegado.value = true
    return
  }
  editando.value = false
  resetarForm()
  formularioAberto.value = true
}

function cancelarFormulario() {
  formularioAberto.value = false
  editando.value = false
  resetarForm()
}

function resetarForm() {
  Object.assign(form, {
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
    cliente: 'N',
    fornecedor: 'N',
    transportadora: 'N',
    colaborador: 'N',
    representante: 'N',
    instagram: '',
    facebook: '',
    twitter_x: '',
    tik_tok: '',
    telegram: '',
    id_red_ctb_cli: null,
    id_red_ctb_for: null,
  })
  form.enderecos = []
  formRef.value?.resetValidation()
}

async function salvarPessoa() {
  pessoasStore.errorMessage = ''
  await pessoasStore.salvarPessoa(formRef.value, form, editando.value, snackbar)
  if (!pessoasStore.errorMessage) cancelarFormulario()
}

async function editarPessoa(p) {
  if (!podeAlterar(ID_PROGRAMA)) {
    tipoAcessoNegado.value = 'alterar'
    modalAcessoNegado.value = true
    return
  }
  editando.value = true
  formularioAberto.value = true
  const resultado = await pessoasStore.buscarpessoaId(p.id)
  const pessoaData = resultado?.pessoa ?? p
  const enderecoData = resultado?.endereco ?? []
  Object.assign(form, pessoaData)
  form.enderecos = Array.isArray(enderecoData) ? enderecoData.map(e => ({ ...e })) : []
}

async function confirmarExclusao(p) {
  if (!podeExcluir(ID_PROGRAMA)) {
    tipoAcessoNegado.value = 'excluir'
    modalAcessoNegado.value = true
    return
  }
  await pessoasStore.deletarPessoa(p.id, snackbar)
}
</script>
