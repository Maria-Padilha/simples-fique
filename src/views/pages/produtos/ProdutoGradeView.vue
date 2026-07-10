<template>
  <top-all-pages icon="mdi-view-grid-outline">
    <template #titulo>Grade de Produtos</template>
    <template #section>
      <v-card elevation="0" class="background-secondary mt-10">
        <v-card-text class="pa-4">
          <botao-expand-transition
              v-if="!exibirGrade"
              :formulario-aberto="formularioAbertoGrade"
              @toggle="toggleFormularioGrade"
          >
            <template #default>
              {{ formularioAbertoGrade ? 'Cancelar' : 'Cadastrar Grade' }}
            </template>
          </botao-expand-transition>
        </v-card-text>

        <forms-expand-transition
            :salvar-formulario="salvarFormularioGrade"
            :cancelar-formulario="cancelarFormularioGrade"
            :formulario-aberto="formularioAbertoGrade"
            :loading="loading"
        >
          <template #form>
            <v-form ref="formRefGrade">
              <v-row>
                <!-- PRODUTO -->
                <v-col cols="12" md="6">
                  <v-autocomplete
                      v-bind="fieldProps"
                      v-model="formGrade.id_produto"
                      label="Produto"
                      item-title="descproduto"
                      item-value="id"
                      :items="produtos"
                      class="required-left-border"
                      :rules="validacaoObrigatorio"
                      @update:model-value="aoSelecionarProduto"
                  />
                </v-col>

                <!-- LOCALIZAÇÃO -->
                <v-col cols="12" md="6">
                  <v-autocomplete
                      v-bind="fieldProps"
                      v-model="formGrade.id_localizacao"
                      label="Localização"
                      item-title="descricao"
                      item-value="id"
                      :items="locais"
                      class="required-left-border"
                      :rules="validacaoObrigatorio"
                  />
                </v-col>

                <!-- MATRIZ COR x TAMANHO -->
                <v-col cols="12">
                  <v-sheet class="grade-erp" rounded="lg" border>
                    <div class="grade-erp__top mb-6">
                      <div>
                        <div class="text-subtitle-1 font-weight-medium">Grade de Cores x Tamanhos</div>
                        <div class="text-caption opacity-70">Adicione cores e tamanhos e informe as quantidades.</div>
                      </div>

                      <v-chip size="small" variant="flat" color="var(--text-color-laranja)" class="text-white">
                        Combinações: {{ totalCombinacoes }}
                      </v-chip>
                    </div>

                    <div class="grade-erp__body">
                      <!-- CORES (esquerda) -->
                      <div class="grade-erp__left">
                        <div class="h-[44px] mb-1" />

                        <div class="grade-erp__left-title">
                          <span class="text-caption font-weight-medium">CORES</span>
                        </div>

                        <div class="grade-erp__left-list">
                          <div
                              v-for="corId in matrizGrade.cores"
                              :key="corId"
                              class="grade-erp__left-item"
                          >
                            <div class="d-flex align-center gap-2">
                              <span class="cor-dot" :style="{ background: getCor(corId)?.cor_hexa || '#999' }" />
                              <span class="text-body-2 font-weight-medium">{{ getCor(corId)?.descricao || `Cor ${corId}` }}</span>
                            </div>

                            <v-btn
                                icon="mdi-close"
                                size="x-small"
                                variant="text"
                                @click="removeCor(corId)"
                            />
                          </div>
                        </div>

                        <div class="grade-erp__left-add">
                          <v-select
                              density="compact"
                              variant="outlined"
                              placeholder="Selecione"
                              :items="coresDisponiveis"
                              item-title="descricao"
                              item-value="id"
                              v-model="selectCor"
                              hide-details
                          >
                            <template #selection="{ item }">
                              <div class="d-flex align-center gap-2">
                                <span class="cor-dot" :style="{ background: item.raw?.cor_hexa || '#999' }" />
                                <span>{{ item.raw?.descricao }}</span>
                              </div>
                            </template>

                            <template #item="{ props, item }">
                              <v-list-item v-bind="props">
                                <template #prepend>
                                  <span class="cor-dot" :style="{ background: item.raw?.cor_hexa || '#999' }" />
                                </template>
                              </v-list-item>
                            </template>

                            <template #append-item>
                              <v-divider class="my-2" />
                              <div class="px-3 pb-2">
                                <v-btn
                                    block
                                    variant="tonal"
                                    color="var(--text-color-laranja)"
                                    prepend-icon="mdi-plus"
                                    @click="abrirModalNovaCor"
                                >
                                  Adicionar Cor
                                </v-btn>
                              </div>
                            </template>
                          </v-select>

                          <v-btn
                              class="grade-erp__btn-plus"
                              icon="mdi-plus"
                              variant="tonal"
                              size="small"
                              :disabled="selectCor === null || selectCor === '' || selectCor === undefined"
                              @click="addCor"
                          />
                        </div>
                      </div>

                      <!-- TAMANHOS + GRID (direita) -->
                      <div class="grade-erp__right">
                        <div class="grade-erp__left-title mb-3">
                          <span class="text-caption font-weight-medium">TAMANHOS</span>
                        </div>

                        <div
                            class="grade-erp__sizes"
                            :style="{ gridTemplateColumns: `repeat(${Math.max(matrizGrade.tamanhos.length, 1)}, 120px) 220px` }"
                        >
                          <div
                              v-for="tam in matrizGrade.tamanhos"
                              :key="tam"
                              class="grade-erp__size-cell"
                          >
                            <span>{{ tam }}</span>
                            <v-btn
                                icon="mdi-close"
                                size="x-small"
                                variant="text"
                                @click="removeTamanho(tam)"
                            />
                          </div>

                          <div class="grade-erp__size-add">
                            <v-text-field
                                density="compact"
                                variant="outlined"
                                placeholder="Ex: P, M, 42"
                                hide-details="auto"
                                v-model="novoTamanho"
                                maxlength="3"
                                :error-messages="erroNovoTamanho"
                                @keyup.enter="addTamanho"
                                @update:model-value="erroNovoTamanho = ''"
                            />
                            <v-btn
                                class="grade-erp__btn-plus"
                                icon="mdi-plus"
                                size="small"
                                variant="tonal"
                                :disabled="!novoTamanho"
                                @click="addTamanho"
                            />
                          </div>
                        </div>

                        <div class="grade-erp__grid-wrap">
                          <div
                              class="grade-erp__grid"
                              :style="{ gridTemplateColumns: `repeat(${matrizGrade.tamanhos.length}, 120px)` }"
                          >
                            <template v-for="corId in matrizGrade.cores" :key="corId">
                              <div
                                  v-for="tam in matrizGrade.tamanhos"
                                  :key="`${corId}-${tam}`"
                                  class="grade-erp__cell"
                              >
                                <v-text-field
                                    density="compact"
                                    variant="outlined"
                                    type="number"
                                    min="0"
                                    hide-details
                                    class="grade-erp__input mt-3"
                                    v-model.number="matrizGrade.qtd[Number(corId)][tam]"
                                />
                              </div>
                            </template>
                          </div>
                        </div>

                        <v-alert
                            v-if="matrizGrade.cores.length === 0 || matrizGrade.tamanhos.length === 0"
                            type="info"
                            variant="tonal"
                            density="compact"
                            class="mt-3"
                        >
                          Adicione pelo menos <b>1 cor</b> e <b>1 tamanho</b> para liberar a grade.
                        </v-alert>
                      </div>
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-form>
          </template>
        </forms-expand-transition>

        <tabela-padrao
            :formulario-aberto="formularioAbertoGrade"
            :headers="headers"
            :items="grades"
            :loading="loading"
            :search="search"
            @update:search="(value) => (search = value)"
            search-label="Pesquisar grades"
            item-key="id"
            no-data-icon="mdi-view-grid-outline"
            no-data-text="Nenhuma grade cadastrada"
        >
          <template #[`item.status`]="{ item }">
            <v-chip
                size="small"
                :color="item.status === 'A' ? 'success' : 'error'"
                variant="tonal"
            >
              {{ item.status === 'A' ? 'Ativo' : 'Inativo' }}
            </v-chip>
          </template>

          <template #[`item.cor`]="{ item }">
            <div class="d-flex align-center">
          <span
              class="cor-dot"
              :style="{ background: item.cor_hexa || '#999' }"
          />
              <span>{{ item.desccor || item.id_cor }}</span>
            </div>
          </template>

          <template #[`item.acoes`]="{ item }">
            <v-btn
                icon="mdi-pencil"
                size="small"
                color="primary"
                variant="text"
                @click="editarGrade(item)"
            />

            <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                variant="text"
                @click="excluirGrade(item)"
            />
          </template>
        </tabela-padrao>

        <excluir-modal
            v-model:modal-excluir="modalExcluir"
            :cancelar="cancelarModalExcluir"
            :deletar="confirmarExclusao"
            :loading="loading"
        >
          <template #item>{{ itemSelecionado?.codigo_grade }}</template>
        </excluir-modal>

        <!-- EDITAR GRADE EXISTENTE -->
        <cadastrar-modal
            v-model:cadastrar-modal="modalEditarGrade"
            :clear-input="cancelarEdicaoGrade"
            :cadastrarcidade="salvarEdicaoGrade"
            :width="450"
            :loading="loading"
            titulo-acao="Editar"
            texto-botao="Salvar alterações"
            icone-botao="mdi-content-save-outline"
        >
          <template #titulo>Grade</template>

          <template #textfields>
            <v-row dense class="px-4 py-5">
              <v-col cols="12" md="6">
                <v-text-field
                    density="compact"
                    variant="outlined"
                    label="Produto"
                    :model-value="itemEditando?.descproduto"
                    readonly
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                    density="compact"
                    variant="outlined"
                    label="Cor"
                    :model-value="itemEditando?.desccor || itemEditando?.id_cor"
                    readonly
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                    density="compact"
                    variant="outlined"
                    label="Tamanho"
                    :model-value="itemEditando?.id_tamanho"
                    readonly
                    hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                    density="compact"
                    variant="outlined"
                    label="Localização"
                    item-title="descricao"
                    item-value="id"
                    :items="locais"
                    v-model="formEditarGrade.id_localizacao"
                    hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                    density="compact"
                    variant="outlined"
                    label="Status"
                    :items="statusOptions"
                    item-title="title"
                    item-value="value"
                    v-model="formEditarGrade.status"
                    hide-details="auto"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                    density="compact"
                    variant="outlined"
                    label="Código de barras"
                    v-model="formEditarGrade.codigo_grade"
                    maxlength="25"
                    :rules="validacaoCodigoGrade"
                    hide-details="auto"
                />
              </v-col>
            </v-row>
          </template>
        </cadastrar-modal>

        <!-- CADASTRAR / EDITAR COR -->
        <cadastrar-modal
            v-model:cadastrar-modal="modalNovaCor"
            :clear-input="resetNovaCor"
            :cadastrarcidade="salvarOuEditarCor"
            :width="450"
            :loading="produtosStore.loading"
            :titulo-acao="modoCor === 'edit' ? 'Editar' : 'Cadastrar'"
            :texto-botao="modoCor === 'edit' ? 'Salvar alterações' : 'Cadastrar'"
            :icone-botao="modoCor === 'edit' ? 'mdi-content-save-outline' : 'mdi-plus-circle-outline'"
        >
          <template #titulo>Cor</template>

          <template #textfields>
            <v-row dense class="px-4 py-5">
              <v-col cols="12" class="mb-2">
                <v-text-field
                    density="compact"
                    variant="outlined"
                    label="Descrição"
                    v-model="novaCor.descricao"
                    placeholder="Ex: AMARELO"
                    hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                    density="compact"
                    variant="outlined"
                    label="Cor Denatran"
                    :items="coresDenatran"
                    item-title="title"
                    item-value="value"
                    v-model="novaCor.id_cor_denatran"
                    hide-details="auto"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                    density="compact"
                    variant="outlined"
                    label="Cor HEX"
                    v-model="novaCor.cor_hexa"
                    placeholder="#FFFF00"
                    hide-details="auto"
                >
                  <template #append-inner>
                <span
                    class="cor-dot"
                    :style="{ background: novaCor.cor_hexa || '#999' }"
                />
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="12">
                <v-color-picker
                    width="100%"
                    class="mt-2"
                    v-model="novaCor.cor_hexa"
                    hide-inputs
                    elevation="0"
                />
              </v-col>
            </v-row>
          </template>
        </cadastrar-modal>
      </v-card>
    </template>
  </top-all-pages>
</template>

<script setup>
import TopAllPages from "@/components/base/padrao-paginas/TopAllPages.vue";
import { computed, onMounted, reactive, ref } from "vue";
import BotaoExpandTransition from "@/components/base/padrao-paginas/BotaoExpandTransition.vue";
import FormsExpandTransition from "@/components/base/padrao-paginas/FormsExpandTransition.vue";
import TabelaPadrao from "@/components/base/padrao-paginas/TabelaPadrao.vue";
import ExcluirModal from "@/components/base/modais/ExcluirModal.vue";
import CadastrarModal from "@/components/base/modais/CadastrarModal.vue";
import { useProdutosStore } from "@/stores/APIs/produtos";
import { useThemeStore } from "@/stores/config-temas/theme";
import { toast } from "vue3-toastify";

const produtosStore = useProdutosStore();
const themeStore = useThemeStore();

const idEmpresa = JSON.parse(localStorage.getItem("empresaSelecionada"));

// DADOS
const loading = computed(() => produtosStore.loading);
// Só produtos configurados para utilizar grade (utiliza_grade: "S") aparecem
// como opção — evita criar combinações de cor/tamanho pra produto incompatível.
const produtos = computed(() => (produtosStore.produtos || []).filter(p => p.utiliza_grade === 'S'));
const locais = computed(() => produtosStore.localizacoes || []);
const cores = computed(() => produtosStore.cores || []);
const grades = computed(() => produtosStore.grades || []);

// FORMULÁRIO (CRIAÇÃO)
const formRefGrade = ref(null);
const formularioAbertoGrade = ref(false);
const exibirGrade = ref(false);
const itemSelecionado = ref(null);

const formGrade = reactive({
  id_empresa: idEmpresa?.id || null,
  id_produto: null,
  id_localizacao: null,
});

// Aviso defensivo: a lista de produtos já vem filtrada por utiliza_grade='S',
// então isso só dispara se a lista ficar desatualizada entre o carregamento e a seleção.
function aoSelecionarProduto(idProduto) {
  if (!idProduto) return;
  const produto = produtos.value.find(p => p.id === idProduto);
  if (produto && produto.utiliza_grade !== 'S') {
    toast.warning(`"${produto.descproduto}" não está configurado para utilizar grade`);
  }
}

const fieldProps = computed(() => ({
  variant: "outlined",
  density: "compact",
  hideDetails: "auto",
  theme: themeStore.darkMode ? "dark" : "light",
}));

const validacaoObrigatorio = [
  (v) => !!v || "Campo obrigatório",
];

const validacaoCodigoGrade = [
  (v) => !v || String(v).length <= 25 || "Máximo de 25 caracteres",
  (v) => !v || /^[0-9]+$/.test(String(v)) || "Informe apenas números",
];

function normalizarTamanho(valor) {
  if (valor === null || valor === undefined) return "";

  return String(valor)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 3);
}

// letras permitidas, simples ou combinadas (P, M, G, L, S, X, U — ex: XG, XXG)
// ou números de 1 a 3 dígitos
function tamanhoEhValido(valor) {
  const regexLetras = /^(?=.{1,3}$)[PMGLSXU]+$/;
  const regexNumeros = /^\d{1,3}$/;
  return regexLetras.test(valor) || regexNumeros.test(valor);
}

// =========================
// MATRIZ COR x TAMANHO
// =========================
const matrizGrade = reactive({
  cores: [],      // array de ids de cor
  tamanhos: [],   // array de strings (tamanho já normalizado)
  qtd: {},        // { [idCor]: { [tamanho]: number } }
});

const selectCor = ref(null);
const novoTamanho = ref("");
const erroNovoTamanho = ref("");

// cores já cadastradas que ainda não foram adicionadas à matriz
const coresDisponiveis = computed(() => cores.value.filter(c => !matrizGrade.cores.includes(Number(c.id))));

function ensureCell(corId, tamanho) {
  const cid = Number(corId);
  if (!matrizGrade.qtd[cid]) matrizGrade.qtd[cid] = {};
  if (matrizGrade.qtd[cid][tamanho] === undefined) matrizGrade.qtd[cid][tamanho] = 0;
}

function ensureMatrix() {
  if (!matrizGrade.cores.length || !matrizGrade.tamanhos.length) return;
  matrizGrade.cores.forEach((corId) => {
    matrizGrade.tamanhos.forEach((tam) => ensureCell(corId, tam));
  });
}

function addCor() {
  if (selectCor.value === null || selectCor.value === undefined || selectCor.value === "") return;

  const corId = Number(selectCor.value);
  if (Number.isNaN(corId) || matrizGrade.cores.includes(corId)) return;

  matrizGrade.cores.push(corId);
  selectCor.value = null;
  ensureMatrix();
}

function removeCor(corId) {
  const cid = Number(corId);
  matrizGrade.cores = matrizGrade.cores.filter((id) => Number(id) !== cid);
  delete matrizGrade.qtd[cid];
}

function getCor(corId) {
  const cid = Number(corId);
  return cores.value.find((c) => Number(c.id) === cid) || null;
}

function addTamanho() {
  const valor = normalizarTamanho(novoTamanho.value);

  if (!valor) {
    erroNovoTamanho.value = "Informe um tamanho";
    return;
  }
  if (!tamanhoEhValido(valor)) {
    erroNovoTamanho.value = "Use letras (P, M, G, L, S, X, U) ou número de até 3 dígitos";
    return;
  }
  if (matrizGrade.tamanhos.includes(valor)) {
    erroNovoTamanho.value = "Esse tamanho já foi adicionado";
    return;
  }

  matrizGrade.tamanhos.push(valor);
  novoTamanho.value = "";
  erroNovoTamanho.value = "";
  ensureMatrix();
}

function removeTamanho(tam) {
  matrizGrade.tamanhos = matrizGrade.tamanhos.filter((t) => t !== tam);
  Object.keys(matrizGrade.qtd).forEach((corId) => {
    if (matrizGrade.qtd[corId]) delete matrizGrade.qtd[corId][tam];
  });
}

// conta quantas combinações têm quantidade preenchida (> 0) — é isso que
// efetivamente vai ser criado ao salvar. A quantidade em si não é enviada
// pra API: /estoque/grades não tem campo de estoque/quantidade — isso ainda
// depende de um trabalho futuro no backend (ver plano de implementação).
const totalCombinacoes = computed(() => {
  let total = 0;
  matrizGrade.cores.forEach((corId) => {
    matrizGrade.tamanhos.forEach((tam) => {
      if (Number(matrizGrade.qtd?.[Number(corId)]?.[tam] ?? 0) > 0) total++;
    });
  });
  return total;
});

function resetMatrizGrade() {
  matrizGrade.cores = [];
  matrizGrade.tamanhos = [];
  matrizGrade.qtd = {};
  selectCor.value = null;
  novoTamanho.value = "";
  erroNovoTamanho.value = "";
}

// TABELA
const search = ref("");

const headers = [
  { title: "ID", key: "id" },
  { title: "Código Grade", key: "codigo_grade" },
  { title: "Produto", key: "descproduto" },
  { title: "Cor", key: "cor" },
  { title: "Tamanho", key: "id_tamanho" },
  { title: "Localização", key: "localizacao" },
  { title: "Status", key: "status" },
  { title: "Ações", key: "acoes", sortable: false },
];

const statusOptions = [
  { title: "Ativo", value: 'A' },
  { title: "Inativo", value: 'I' },
];

// ABRIR/FECHAR
function toggleFormularioGrade() {
  formularioAbertoGrade.value = !formularioAbertoGrade.value;
  if (formularioAbertoGrade.value) {
    resetFormularioGrade();
  }
}

function resetFormularioGrade() {
  Object.assign(formGrade, {
    id_empresa: idEmpresa?.id || null,
    id_produto: null,
    id_localizacao: null,
  });

  resetMatrizGrade();
  itemSelecionado.value = null;

  if (formRefGrade.value) {
    formRefGrade.value.resetValidation();
  }
}

function cancelarFormularioGrade() {
  resetFormularioGrade();
  formularioAbertoGrade.value = false;
}

// SALVAR — cria uma combinação de grade por célula preenchida (> 0). Não existe
// endpoint em lote, então cada combinação vira uma chamada própria a
// cadastrarGradeProduto (mesmo padrão de "um POST por item" já usado em
// src/stores/APIs/inventario.js para casos parecidos).
async function salvarFormularioGrade() {
  const validacao = await formRefGrade.value?.validate();
  if (!validacao?.valid) return;

  const combinacoes = [];
  matrizGrade.cores.forEach((corId) => {
    matrizGrade.tamanhos.forEach((tam) => {
      const qtd = Number(matrizGrade.qtd?.[Number(corId)]?.[tam] ?? 0);
      if (qtd > 0) combinacoes.push({ corId, tam });
    });
  });

  if (combinacoes.length === 0) {
    toast.warning('Preencha a quantidade de pelo menos uma combinação de cor e tamanho');
    return;
  }

  let sucesso = 0;
  let falha = 0;

  for (const { corId, tam } of combinacoes) {
    const payload = {
      id_empresa: formGrade.id_empresa,
      id_produto: formGrade.id_produto,
      id_cor: String(corId),
      id_tamanho: tam,
      id_localizacao: formGrade.id_localizacao,
      status: 'A',
      codigo_grade: null,
    };

    produtosStore.errorMessage = '';
    await produtosStore.cadastrarGradeProduto(payload, idEmpresa?.id);

    if (produtosStore.errorMessage) {
      falha++;
    } else {
      sucesso++;
    }
  }

  if (sucesso > 0) {
    toast.success(`${sucesso} combinação(ões) de grade criada(s) com sucesso`);
  }
  if (falha > 0) {
    toast.error(`${falha} combinação(ões) não puderam ser criadas`);
  }

  await produtosStore.buscarGradeProduto(idEmpresa?.id);

  if (falha === 0) {
    cancelarFormularioGrade();
  }
}

// EDITAR (registro já existente — modal separado, fora da matriz de criação)
const modalEditarGrade = ref(false);
const itemEditando = ref(null);

const formEditarGrade = reactive({
  id_localizacao: null,
  status: 'A',
  codigo_grade: "",
});

function editarGrade(item) {
  itemEditando.value = item;

  Object.assign(formEditarGrade, {
    id_localizacao: item.id_localizacao ?? null,
    status: item.status ?? 'A',
    codigo_grade: item.codigo_grade ?? "",
  });

  modalEditarGrade.value = true;
}

function cancelarEdicaoGrade() {
  modalEditarGrade.value = false;
  itemEditando.value = null;
}

async function salvarEdicaoGrade() {
  if (!itemEditando.value?.id_produto) return;

  const payload = {
    id_empresa: idEmpresa?.id,
    id_produto: itemEditando.value.id_produto,
    id_cor: String(itemEditando.value.id_cor),
    id_tamanho: itemEditando.value.id_tamanho,
    id_localizacao: formEditarGrade.id_localizacao,
    status: String(formEditarGrade.status),
    codigo_grade: formEditarGrade.codigo_grade
        ? String(formEditarGrade.codigo_grade).trim()
        : null,
  };

  await produtosStore.atualizarGradeProduto(
      idEmpresa?.id,
      itemEditando.value.id_produto,
      itemEditando.value.id_cor,
      itemEditando.value.id_tamanho,
      payload
  );

  if (!produtosStore.errorMessage) {
    await produtosStore.buscarGradeProduto(idEmpresa?.id);
    cancelarEdicaoGrade();
  }
}

// EXCLUIR
const modalExcluir = ref(false);

function excluirGrade(item) {
  itemSelecionado.value = item;
  modalExcluir.value = true;
}

function cancelarModalExcluir() {
  modalExcluir.value = false;
  itemSelecionado.value = null;
}

async function confirmarExclusao() {
  if (!itemSelecionado.value?.id_produto) return;

  await produtosStore.deletarGradeProduto(
      idEmpresa?.id,
      itemSelecionado.value.id_produto,
      itemSelecionado.value.id_cor,
      itemSelecionado.value.id_tamanho
  );

  if (!produtosStore.errorMessage) {
    await produtosStore.buscarGradeProduto(idEmpresa?.id);
    cancelarModalExcluir();
  }
}

// CARREGAR DADOS
onMounted(async () => {
  await Promise.all([
    produtosStore.buscarProdutos(),
    produtosStore.buscarLocalizacoes(idEmpresa?.id),
    produtosStore.buscarCores(),
    produtosStore.buscarGradeProduto(idEmpresa?.id),
  ]);
});

// =========================
// CADASTRAR / EDITAR COR
// =========================
const modalNovaCor = ref(false);
const editandoCorId = ref(null);

const coresDenatran = [
  { title: "01 - AMARELO", value: 1 },
  { title: "02 - AZUL", value: 2 },
  { title: "03 - BEGE", value: 3 },
  { title: "04 - BRANCA", value: 4 },
  { title: "05 - CINZA", value: 5 },
  { title: "06 - DOURADA", value: 6 },
  { title: "07 - GRENÁ", value: 7 },
  { title: "08 - LARANJA", value: 8 },
  { title: "09 - MARROM", value: 9 },
  { title: "10 - PRATA", value: 10 },
  { title: "11 - PRETA", value: 11 },
  { title: "12 - ROSA", value: 12 },
  { title: "13 - ROXA", value: 13 },
  { title: "14 - VERDE", value: 14 },
  { title: "15 - VERMELHA", value: 15 },
  { title: "16 - FANTASIA", value: 16 },
];

const modoCor = computed(() => (editandoCorId.value ? "edit" : "create"));

const novaCor = reactive({
  descricao: "",
  id_cor_denatran: null,
  cor_hexa: "",
});

function resetNovaCor() {
  novaCor.descricao = "";
  novaCor.id_cor_denatran = null;
  novaCor.cor_hexa = "";
  modalNovaCor.value = false;
  editandoCorId.value = null;
}

function abrirModalNovaCor() {
  editandoCorId.value = null;
  modalNovaCor.value = true;
}

const corFormValida = computed(() => {
  const descOk = String(novaCor.descricao || "").trim().length >= 2;
  const denOk = !!novaCor.id_cor_denatran;
  const hexOk = /^#([0-9A-Fa-f]{6})$/.test(String(novaCor.cor_hexa || "").trim());
  return descOk && denOk && hexOk;
});

async function salvarOuEditarCor() {
  if (!corFormValida.value) return;

  const payload = {
    descricao: String(novaCor.descricao).trim().toUpperCase(),
    id_cor_denatran: Number(novaCor.id_cor_denatran),
    cor_hexa: String(novaCor.cor_hexa).trim().toUpperCase(),
  };

  if (modoCor.value === "edit") {
    await produtosStore.atualizarCor(editandoCorId.value?.id, payload);
  } else {
    await produtosStore.cadastrarCor(payload);
  }

  if (!produtosStore.errorMessage) {
    await produtosStore.buscarCores();
    resetNovaCor();
  }
}
</script>

<style scoped>
.cor-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.18);
  margin-right: 10px;
}

.gap-2 {
  gap: 8px;
}

/* Matriz Cor x Tamanho */
.grade-erp {
  padding: 16px;
  background: var(--bg-color-secondary) !important;
  color: var(--text-color) !important;
}

.grade-erp__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.grade-erp__body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
}

.grade-erp__left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.grade-erp__left-title {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}

.grade-erp__left-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 2px;
}

.grade-erp__left-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: var(--bg-color);
}

.grade-erp__left-add {
  display: grid;
  grid-template-columns: 1fr 42px;
  gap: 8px;
  align-items: center;
}

.grade-erp__right {
  overflow: auto;
}

.grade-erp__sizes {
  display: grid;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.grade-erp__size-cell {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  border-radius: 8px;
  background: var(--bg-color);
  font-weight: 600;
}

.grade-erp__size-add {
  display: grid;
  grid-template-columns: 1fr 42px;
  gap: 8px;
  align-items: center;
}

.grade-erp__grid-wrap {
  overflow: auto;
  padding-bottom: 4px;
}

.grade-erp__grid {
  display: grid;
  gap: 8px;
}

.grade-erp__cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.grade-erp__input :deep(.v-field__input) {
  text-align: center;
}

.grade-erp__btn-plus {
  background: var(--text-color-laranja) !important;
  color: #fff !important;
}
</style>