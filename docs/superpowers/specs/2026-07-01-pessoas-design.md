# Spec: Tela de Pessoas — Manutenção

**Data:** 2026-07-01
**Branch:** kaioba
**Endpoint base:** `/api/v1/manutencao/pessoas`

---

## 1. Objetivo

Criar a tela `PessoasView.vue` em `src/views/pages/manutencao/`, acessível via **Manutenção → Pessoas**, com CRUD completo (listar, cadastrar, editar, excluir) seguindo todas as rules do projeto. A tela é separada da `ClientesView.vue` existente e não a altera.

---

## 2. Arquivos Envolvidos

| Ação | Arquivo |
|------|---------|
| Criar | `src/views/pages/manutencao/PessoasView.vue` |
| Modificar | `src/router/index.js` |
| Modificar | `src/stores/Sidebar.js` |
| Sem alteração | `src/stores/APIs/pessoas.js` |

---

## 3. Rota

```js
{
  path: '/paginas/manutencao/pessoas',
  name: 'manutencao_pessoas',
  component: () => import('@/views/pages/manutencao/PessoasView.vue')
}
```

Lazy loading obrigatório (view secundária).

---

## 4. Sidebar

Inserir em `src/stores/Sidebar.js`, no bloco `id: 'manutencao'`, após o item "Clientes":

```js
{
  text: 'Pessoas',
  icon: 'mdi-account-multiple',
  route: '/paginas/manutencao/pessoas'
}
```

---

## 5. View — Estrutura Geral

```
TopAllPages (icon="mdi-account-multiple")
  #titulo → "Pessoas"
  #acoes  → botão Exportar (podeExportar) + botão PDF (podePDF)
  #section
    v-card.background-secondary
      BotaoExpandTransition → "Nova Pessoa" / "Cancelar"
      v-expand-transition
        v-card.background-card  ← formulário
      v-expand-transition
        TabelaPadrao            ← listagem
    v-snackbar
    AcessoNegadoModal
```

---

## 6. Formulário

### 6.1 Campos

Organizados em 4 grupos separados por `v-divider`:

**Grupo 1 — Identificação**

| Campo | Componente | Validação | Obrigatório |
|-------|-----------|-----------|-------------|
| `tipo_pessoa` | `v-select` (Física/Jurídica → F/J) | required | ✅ |
| `cpf_cnpj` | `v-text-field` com `v-mask-cpf` ou `v-mask-cnpj` conforme `tipo_pessoa` | — | — |
| `nome_razao` | `v-text-field` maxlength=100 | required | ✅ |
| `apelido_fantasia` | `v-text-field` maxlength=100 | required | ✅ |
| `rg_inscricao` | `v-text-field` maxlength=20 | — | — |

**Grupo 2 — Contato & Redes**

| Campo | Componente | Máscara |
|-------|-----------|---------|
| `telefone` | `v-text-field` | `v-mask-phone.br` |
| `celular` | `v-text-field` | `v-mask-phone.br` |
| `whats` | `v-text-field` | `v-mask-phone.br` |
| `website` | `v-text-field` maxlength=150 | — |
| `instagram` | `v-text-field` maxlength=80 | — |
| `facebook` | `v-text-field` maxlength=80 | — |
| `twitter_x` | `v-text-field` maxlength=80 | — |
| `tik_tok` | `v-text-field` maxlength=80 | — |
| `telegram` | `v-text-field` maxlength=80 | — |

**Grupo 3 — Classificação**

Flags S/N exibidas como `v-checkbox` (true → `'S'`, false → `'N'`): `cliente`, `fornecedor`, `transportadora`, `colaborador`, `representante`.

- `id_red_ctb_cli`: `v-autocomplete` com lista de planos de conta (via `useFinanceiroStore.buscarPlanosConta()`). Visível apenas quando `cliente === 'S'`.
- `id_red_ctb_for`: idem, visível apenas quando `fornecedor === 'S'`.

**Grupo 4 — Endereços**

Igual ao padrão da `ClientesView`:
- Até 4 endereços; botão "+ Adicionar"
- Cada endereço: `tipo_endereco` (Residencial/Entrega/Cobrança/Fiscal), `cep` (com lookup via ViaCEP no `@blur`), `cidade`, `bairro`, `logradouro`, `numero`, `complemento`
- Tipos já usados ficam desabilitados nos demais endereços
- Botão de remover por endereço

### 6.2 Estado do form

```js
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
  enderecos: []
})
```

### 6.3 Salvar

- Delegar para `pessoasStore.salvarPessoa(formRef, form, editando, snackbar)`
- A store já limpa máscaras, separa `endereco[]` e envia via `apiPhp`

---

## 7. Tabela

Componente: `TabelaPadrao`

| Título | Key | Largura | Slot customizado |
|--------|-----|---------|-----------------|
| ID | `id` | 70px | — |
| Tipo | `tipo_pessoa` | 90px | chip "Física"/"Jurídica" |
| Nome / Razão | `nome_razao` | — | — |
| Apelido | `apelido_fantasia` | — | — |
| CPF/CNPJ | `cpf_cnpj` | 160px | — |
| Telefone | `telefone` | 140px | — |
| Classificação | `_classificacao` | 220px | chips das flags ativas (cliente/fornecedor/etc.) |
| Ações | `actions` | 90px | padrão TabelaPadrao |

`_classificacao` é campo virtual computado na linha via slot `#item._classificacao`.

---

## 8. Permissões

```js
const ID_PROGRAMA = 'MPES001'
```

- `onMounted`: verificar `podeVisualizar` → abrir `AcessoNegadoModal` se negado
- `toggleFormulario`: verificar `podeIncluir`
- `editarItem`: verificar `podeAlterar`
- `confirmarExcluir`: verificar `podeExcluir`
- `#acoes`: botões condicionados a `podeExportar` / `podePDF`

---

## 9. Script Setup — Ordem de Imports

```
1. Vue (ref, reactive, computed, onMounted)
2. Componentes base (TopAllPages, TabelaPadrao, BotaoExpandTransition, AcessoNegadoModal)
3. Stores (usePessoasStore, useFinanceiroStore, useThemeStore)
4. Composables (usePermissoes)
5. Constantes (ID_PROGRAMA)
6. Estado local
7. Regras de validação
8. Headers da tabela
9. Computados
10. onMounted
11. Métodos
```

---

## 10. Comportamento Geral

- Ao montar: `pessoasStore.buscarTodasPessoas()` + `financeiroStore.buscarPlanosConta()`
- Editar: `pessoasStore.buscarpessoaId(id)` para obter `enderecos` populados, preencher form
- Excluir: `pessoasStore.deletarPessoa(id, snackbar)`
- Feedback: snackbar via `mostrarMensagem(msg, color)` — a store já injeta no snackbar passado

---

## 11. Checklist de Conformidade com Rules

- [x] `<script setup>` — Composition API
- [x] `<TopAllPages>` com slots `#titulo`, `#acoes`, `#section`
- [x] `<TabelaPadrao>` — sem `v-data-table` direto
- [x] `<BotaoExpandTransition>` + `v-expand-transition` manual para form
- [x] Store separada (`usePessoasStore`) — sem axios direto na view
- [x] API PHP — payload direto (sem wrapper `{ data: [] }`)
- [x] `snackbar` + `mostrarMensagem()`
- [x] `usePermissoes()` com `ID_PROGRAMA`
- [x] `AcessoNegadoModal` para permissão negada
- [x] Lazy loading na rota
- [x] CSS variables / classes de tema (`background-secondary`, `background-card`)
- [x] `:theme="themeStore.darkMode ? 'dark' : 'light'"` nos inputs
