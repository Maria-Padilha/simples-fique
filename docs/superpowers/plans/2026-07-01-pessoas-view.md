# Tela de Pessoas — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `PessoasView.vue` em Manutenção com CRUD completo, seguindo todas as rules do projeto.

**Architecture:** View nova em `src/views/pages/manutencao/PessoasView.vue` consumindo a store `usePessoasStore` já existente (sem alterações na store). Rota lazy registrada no router, item adicionado na sidebar. Formulário com 4 grupos visuais (Identificação, Contato, Classificação, Endereços) + `TabelaPadrao` com chips de classificação.

**Tech Stack:** Vue 3 `<script setup>`, Vuetify 3, Pinia (`usePessoasStore`, `useFinanceiroStore`), `apiPhp` (via store), `usePermissoes`, Vitest (store já testada).

## Global Constraints

- Composition API (`<script setup>`) — Options API proibida
- Toda chamada HTTP via store — sem axios direto na view
- `<TabelaPadrao>` — sem `v-data-table` direto
- `<TopAllPages>` com slots `#titulo`, `#acoes`, `#section`
- CSS classes de tema: `background-secondary`, `background-card` — sem cores fixas
- `:theme="themeStore.darkMode ? 'dark' : 'light'"` em todos os inputs
- `required-left-border` em campos obrigatórios
- Lazy loading na rota (view secundária)
- API PHP: payload direto, sem wrapper `{ data: [] }`
- `ID_PROGRAMA = 'MMAN001P'`

---

### Task 1: Rota e Sidebar

**Files:**
- Modify: `src/router/index.js`
- Modify: `src/stores/Sidebar.js`

**Interfaces:**
- Produces: rota `/paginas/manutencao/pessoas` com `name: 'manutencao_pessoas'` acessível pelo sidebar

- [ ] **Step 1: Adicionar entrada no Sidebar**

Em `src/stores/Sidebar.js`, localizar o bloco `id: 'manutencao'` e inserir o item após o `{ text: 'Clientes', ... }`:

```js
// Bloco existente — localizar:
{
    id: 'manutencao',
    titulo: 'Manutenção',
    icon: 'mdi-tools',
    submenus: [
        {
            text: 'Clientes',
            icon: 'mdi-account-group',
            route: '/paginas/manutencao/clientes'
        },
        // INSERIR AQUI:
        {
            text: 'Pessoas',
            icon: 'mdi-account-multiple',
            route: '/paginas/manutencao/pessoas'
        },
        {
            text: 'Usuários',
            // ...existente
        },
```

- [ ] **Step 2: Registrar rota no router**

Em `src/router/index.js`, após a rota `manutencao_clientes` (por volta da linha 86), adicionar:

```js
{
    path: '/paginas/manutencao/pessoas',
    name: 'manutencao_pessoas',
    component: () => import('@/views/pages/manutencao/PessoasView.vue')
},
```

- [ ] **Step 3: Verificar no browser**

Iniciar o servidor (`npm run dev`) e confirmar:
- O item "Pessoas" aparece no menu Manutenção
- Clicar em "Pessoas" navega para `/paginas/manutencao/pessoas` (404 esperado — view não existe ainda)

- [ ] **Step 4: Commit**

```bash
git add src/router/index.js src/stores/Sidebar.js
git commit -m "feat: rota e sidebar para tela de Pessoas"
```

---

### Task 2: Scaffold da View com Tabela

**Files:**
- Create: `src/views/pages/manutencao/PessoasView.vue`

**Interfaces:**
- Consumes: `usePessoasStore.pessoas`, `usePessoasStore.loading`, `usePessoasStore.buscarTodasPessoas()`
- Consumes: `usePermissoes` — `podeVisualizar`, `podeIncluir`, `podeExcluir`
- Consumes: `useThemeStore.darkMode`
- Produces: página acessível em `/paginas/manutencao/pessoas` que lista pessoas em tabela

- [ ] **Step 1: Criar o arquivo com scaffold completo**

Criar `src/views/pages/manutencao/PessoasView.vue` com o seguinte conteúdo (formulário vazio por agora — será preenchido na Task 3):

```vue
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
                      <!-- campos serão adicionados na Task 3 -->
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

const pessoasStore = usePessoasStore()
const themeStore = useThemeStore()

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
  tipo_pessoa: '',
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

// ─── 10. Lifecycle ───────────────────────────────────────
onMounted(async () => {
  if (!podeVisualizar(ID_PROGRAMA)) {
    tipoAcessoNegado.value = 'visualizar'
    modalAcessoNegado.value = true
    return
  }
  await pessoasStore.buscarTodasPessoas()
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
```

- [ ] **Step 2: Verificar no browser**

Navegar para `/paginas/manutencao/pessoas`. Confirmar:
- Página carrega sem erros no console
- Tabela exibe a lista de pessoas (ou estado vazio se não houver dados)
- Colunas ID, Tipo, Nome/Razão, CPF/CNPJ, Classificação, Ações visíveis
- Botão "Nova Pessoa" abre o card de formulário vazio (sem campos ainda)
- Clicar "Cancelar" fecha o formulário

- [ ] **Step 3: Commit**

```bash
git add src/views/pages/manutencao/PessoasView.vue
git commit -m "feat: scaffold PessoasView com tabela e estrutura base"
```

---

### Task 3: Formulário — Grupos 1, 2 e 3 (Identificação, Contato, Classificação)

**Files:**
- Modify: `src/views/pages/manutencao/PessoasView.vue`

**Interfaces:**
- Consumes: `useFinanceiroStore.buscarPlanosConta()` → `planosConta[]` (para campos CTB)
- Consumes: `usePessoasStore.salvarPessoa(formRef, form, editando, snackbar)`
- Produces: formulário funcional para criar e editar pessoas

- [ ] **Step 1: Adicionar import de useFinanceiroStore no script**

No bloco `// ─── 3. Stores ───────────────────────────────────────`, logo após `const themeStore = useThemeStore()`, adicionar:

```js
import { useFinanceiroStore } from '@/stores/APIs/financeiro'
const financeiroStore = useFinanceiroStore()
```

- [ ] **Step 2: Adicionar estado local para planosConta e carregar no onMounted**

Adicionar após `const loading = computed(...)`:

```js
const planosConta = computed(() => financeiroStore.planosConta)
```

Dentro de `onMounted`, após `await pessoasStore.buscarTodasPessoas()`, adicionar:

```js
await financeiroStore.buscarPlanosConta()
```

- [ ] **Step 3: Substituir o `<v-form>` vazio pelos campos dos Grupos 1, 2 e 3**

Localizar o trecho:
```vue
<v-form ref="formRef" v-model="formValido">
  <!-- campos serão adicionados na Task 3 -->
</v-form>
```

Substituir por:

```vue
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
```

- [ ] **Step 4: Verificar no browser**

Abrir o formulário e confirmar:
- Campos de Identificação aparecem: Tipo, CPF/CNPJ muda entre CPF (Física) e CNPJ (Jurídica) ao trocar o tipo
- Campos de Contato & Redes aparecem abaixo do divider
- Checkboxes de Classificação funcionam; ao marcar "Cliente" aparece o autocomplete de Redução Contábil; ao marcar "Fornecedor" aparece outro
- Campos obrigatórios (Nome/Razão, Apelido, Tipo) mostram borda laranja
- Clicar "Salvar" com campos obrigatórios vazios mostra validação

- [ ] **Step 5: Verificar criação de pessoa**

Preencher todos os campos obrigatórios e salvar. Confirmar:
- Snackbar de sucesso aparece
- Formulário fecha
- Nova pessoa aparece na tabela com chips de classificação corretos

- [ ] **Step 6: Commit**

```bash
git add src/views/pages/manutencao/PessoasView.vue
git commit -m "feat: formulário de pessoas — identificação, contato e classificação"
```

---

### Task 4: Formulário — Grupo 4 (Endereços)

**Files:**
- Modify: `src/views/pages/manutencao/PessoasView.vue`

**Interfaces:**
- Consumes: `api` (serviço legado) para lookup de CEP via `/cep/{cep}`
- Consumes: `pessoasStore.buscarpessoaId(id)` → `{ pessoa, endereco[] }` (já usado na Task 2, agora com endereços)
- Produces: bloco de endereços funcional com CEP lookup e até 4 endereços

- [ ] **Step 1: Adicionar import de api para o lookup de CEP**

No bloco de imports do `<script setup>`, após os imports de stores, adicionar:

```js
import api from '@/services/api'
```

- [ ] **Step 2: Adicionar constante e funções de endereço no script**

Adicionar após a definição de `rules`, antes dos headers:

```js
// ─── Endereços ───────────────────────────────────────────
const tiposEndereco = [
  { label: 'Residencial/Comercial', value: 1 },
  { label: 'Entrega', value: 2 },
  { label: 'Cobrança', value: 3 },
  { label: 'Fiscal', value: 4 },
]

const tiposDisponiveis = (idx) => {
  const usados = form.enderecos.map((e, i) => i !== idx ? e.tipo_endereco : null).filter(t => t !== null)
  return tiposEndereco.filter(t => !usados.includes(t.value))
}

const adicionarEndereco = () => {
  if (form.enderecos.length >= 4) return
  form.enderecos.push({
    tipo_endereco: null,
    cidade: '',
    bairro: '',
    logradouro: '',
    numero: '',
    complemento: '',
    cep: '',
    _buscandoCep: false,
  })
}

const removerEndereco = (idx) => {
  form.enderecos.splice(idx, 1)
}

const buscarCep = async (end) => {
  const cep = (end.cep || '').replace(/\D/g, '')
  if (cep.length !== 8) return
  end._buscandoCep = true
  try {
    const resp = await api.get(`/cep/${cep}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    const d = resp.data?.data?.[0] ?? resp.data
    if (d) {
      if (d.logradouro) end.logradouro = d.logradouro
      if (d.bairro)     end.bairro     = d.bairro
      if (d.localidade) end.cidade     = d.localidade
    }
  } catch (e) {
    console.error('Erro ao buscar CEP:', e)
  } finally {
    end._buscandoCep = false
  }
}
```

- [ ] **Step 3: Substituir o comentário do Grupo 4 no template**

Localizar:
```vue
<!-- Grupo 4: Endereços — adicionado na Task 4 -->
```

Substituir por:

```vue
<!-- ── Grupo 4: Endereços ─────────────────────────── -->
<v-divider class="my-4"/>
<div class="d-flex align-center justify-space-between mt-2 mb-3">
  <div class="text-subtitle-2 font-weight-bold">
    <v-icon icon="mdi-map-marker" class="mr-1" size="18px"/>
    Endereços
  </div>
  <v-btn
      prepend-icon="mdi-plus"
      size="x-small"
      color="var(--text-color-laranja)"
      variant="flat"
      class="text-white"
      :disabled="form.enderecos.length >= 4"
      @click="adicionarEndereco"
  >
    Adicionar
  </v-btn>
</div>

<v-col cols="12" v-for="(end, idx) in form.enderecos" :key="idx" class="px-0">
  <v-card class="background-secondary pa-3 mb-2" elevation="0">
    <v-row align="center" dense>
      <v-col cols="12" md="2">
        <v-select
            v-model="end.tipo_endereco"
            :items="tiposDisponiveis(idx)"
            item-title="label"
            item-value="value"
            label="Tipo de Endereço"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :theme="themeStore.darkMode ? 'dark' : 'light'"
            class="custom-text-field"
            prepend-inner-icon="mdi-home-map-marker"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-text-field
            v-model="end.cep"
            label="CEP"
            maxlength="9"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :theme="themeStore.darkMode ? 'dark' : 'light'"
            class="custom-text-field"
            prepend-inner-icon="mdi-map-marker"
            :loading="end._buscandoCep"
            @blur="buscarCep(end)"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-text-field
            v-model="end.cidade"
            label="Cidade"
            maxlength="100"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :theme="themeStore.darkMode ? 'dark' : 'light'"
            class="custom-text-field"
            prepend-inner-icon="mdi-city"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-text-field
            v-model="end.bairro"
            label="Bairro"
            maxlength="100"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :theme="themeStore.darkMode ? 'dark' : 'light'"
            class="custom-text-field"
            prepend-inner-icon="mdi-map-marker-radius"
        />
      </v-col>

      <v-col cols="12" md="2">
        <v-text-field
            v-model="end.logradouro"
            label="Logradouro"
            maxlength="100"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :theme="themeStore.darkMode ? 'dark' : 'light'"
            class="custom-text-field"
            prepend-inner-icon="mdi-road-variant"
        />
      </v-col>

      <v-col cols="6" md="1">
        <v-text-field
            v-model="end.numero"
            label="Número"
            maxlength="10"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :theme="themeStore.darkMode ? 'dark' : 'light'"
            class="custom-text-field"
            prepend-inner-icon="mdi-numeric"
        />
      </v-col>

      <v-col cols="6" md="1">
        <v-text-field
            v-model="end.complemento"
            label="Complemento"
            maxlength="100"
            variant="outlined"
            density="compact"
            hide-details="auto"
            :theme="themeStore.darkMode ? 'dark' : 'light'"
            class="custom-text-field"
            prepend-inner-icon="mdi-home-plus"
        />
      </v-col>

      <v-col cols="12" md="auto" class="d-flex justify-end">
        <v-btn
            icon="mdi-delete-outline"
            size="small"
            color="error"
            variant="text"
            @click="removerEndereco(idx)"
        />
      </v-col>
    </v-row>
  </v-card>
</v-col>
```

- [ ] **Step 4: Verificar endereços no browser**

Abrir o formulário e confirmar:
- Botão "+ Adicionar" aparece na seção Endereços
- Clicar adiciona uma linha com os campos (tipo, CEP, cidade, bairro, logradouro, número, complemento)
- Cada endereço tem botão de remover (lixeira)
- Não é possível adicionar mais de 4 endereços (botão fica desabilitado)
- Preencher um CEP válido (ex.: `01310-100`) e sair do campo preenche automaticamente cidade, bairro e logradouro
- O dropdown "Tipo de Endereço" de um endereço não exibe tipos já selecionados em outros

- [ ] **Step 5: Verificar edição com endereços**

Clicar em editar em uma pessoa que já tem endereços cadastrados e confirmar:
- Os campos da pessoa são preenchidos no formulário
- Os endereços existentes aparecem na seção de endereços
- Alterar e salvar persiste as mudanças

- [ ] **Step 6: Commit**

```bash
git add src/views/pages/manutencao/PessoasView.vue
git commit -m "feat: grupo de endereços com lookup de CEP na tela de Pessoas"
```

---

## Auto-Revisão do Plano

**Cobertura do spec:**

| Requisito do spec | Task |
|---|---|
| `PessoasView.vue` criado | Task 2 |
| Rota lazy `/paginas/manutencao/pessoas` | Task 1 |
| Sidebar "Pessoas" em Manutenção | Task 1 |
| `TopAllPages` com 3 slots | Task 2 |
| `TabelaPadrao` com headers e chips | Task 2 |
| `BotaoExpandTransition` | Task 2 |
| `usePermissoes` + `AcessoNegadoModal` | Task 2 |
| `buscarTodasPessoas` no `onMounted` | Task 2 |
| Grupo 1 — Identificação (tipo, cpf/cnpj, nome, apelido, rg) | Task 3 |
| Grupo 2 — Contato & Redes (tel, cel, whats, website, redes) | Task 3 |
| Grupo 3 — Classificação + campos CTB condicionais | Task 3 |
| `buscarPlanosConta` para autocomplete CTB | Task 3 |
| Grupo 4 — Endereços com CEP lookup | Task 4 |
| `editarPessoa` via `buscarpessoaId` (com endereços) | Task 2 |
| `confirmarExclusao` via `deletarPessoa` | Task 2 |
| Permissões em todas as ações (incluir/alterar/excluir) | Task 2 |
| `snackbar` + feedback visual | Task 2 |
| `resetarForm` com `resetValidation` | Task 2 |
| Lazy loading na rota | Task 1 |
| CSS classes de tema | Tasks 2–4 |
| `:theme` em todos os inputs | Tasks 2–4 |

**Verificação de consistência de nomes:**
- `pessoasStore.salvarPessoa(formRef.value, form, editando.value, snackbar)` — assinatura correta (ver `pessoas.js` linha 30)
- `pessoasStore.buscarpessoaId(p.id)` → retorna `{ pessoa, endereco }` — correto (ver `pessoas.js` linha 89)
- `pessoasStore.deletarPessoa(p.id, snackbar)` — correto (ver `pessoas.js` linha 107)
- `pessoasStore.buscarTodasPessoas()` — correto (ver `pessoas.js` linha 76)
- `financeiroStore.buscarPlanosConta()` → popula `financeiroStore.planosConta` — correto (ver `financeiro.js` linha 1029)
- `api.get('/cep/${cep}')` — padrão idêntico ao `ClientesView.vue` linha 655–674
