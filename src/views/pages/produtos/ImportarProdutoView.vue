<template>
  <div class="pa-4">
    <!-- Header Card -->
    <v-card class="background-secondary mb-4">
      <v-card-title class="text-h5 pa-4 d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-icon icon="mdi-cloud-download-outline" class="mr-3"></v-icon>
          Importar Produtos
        </div>
      </v-card-title>
    </v-card>

    <!-- Content Card -->
    <v-card class="background-secondary">
      <v-card-text class="pa-4">
        <!-- Seção de Busca por GTIN -->
        <v-card class="background-card mb-4" elevation="2">
          <v-card-title class="text-h6 pa-4">
            <v-icon icon="mdi-barcode" class="mr-2"></v-icon>
            Escanear Código de Barras
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  ref="gtinInput"
                  v-model="filtros.gtin"
                  label="Código de Barras (GTIN)"
                  placeholder="Escaneie o código de barras do produto"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  autofocus
                  @keyup.enter="buscarPorGtin"
                  prepend-icon="mdi-barcode-scan"
                  hint="Pressione ENTER após escanear"
                  :loading="loadingBusca"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Tabela de Processos Abertos -->
        <v-expand-transition>
          <v-card v-if="produtosTempEncontrados.length > 0" class="background-card mt-4 mb-4" elevation="1">
            <v-card-title class="text-h6 pa-4 d-flex align-center gap-2" style="border-bottom: 1px solid rgba(0,0,0,0.12)">
              <v-icon icon="mdi-timer-outline" size="24" style="color: var(--text-color-laranja)"></v-icon>
              Processos em Andamento
            </v-card-title>
            <v-card-text class="pa-4">
              <v-table class="elevation-0">
                <thead>
                  <tr style="background-color: var(--text-color-laranja); color: white;">
                    <th class="text-left pa-4 font-weight-bold">ID</th>
                    <th class="text-left pa-4 font-weight-bold">Quantidade</th>
                    <th class="text-left pa-4 font-weight-bold">Data</th>
                    <th class="text-center pa-4 font-weight-bold">Status</th>
                    <th class="text-center pa-4 font-weight-bold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="processo in produtosTempEncontrados" :key="processo.id">
                    <td class="pa-4">
                      <span class="font-weight-bold" style="color: var(--text-color-laranja)">{{ processo.id }}</span>
                    </td>
                    <td class="pa-4">
                      <v-chip size="small" color="var(--text-color-laranja)" text-color="white">
                        {{ processo.quantidade || '?' }} produto(s)
                      </v-chip>
                    </td>
                    <td class="pa-4">
                      <span class="text-caption">{{ formatarData(processo.data_criacao) }}</span>
                    </td>
                    <td class="pa-4 text-center">
                      <v-chip
                        size="small"
                        :color="processo.status === 'ativo' ? '#FFC107' : '#90CAF9'"
                        text-color="white"
                      >
                        {{ processo.status === 'ativo' ? 'Em Processamento' : 'Pendente' }}
                      </v-chip>
                    </td>
                    <td class="pa-4 text-center">
                      <v-btn
                        size="small"
                        icon="mdi-play"
                        variant="text"
                        color="var(--text-color-laranja)"
                        @click="continuarImportacao(processo.id)"
                        title="Continuar importação"
                      ></v-btn>
                      <v-btn
                        size="small"
                        icon="mdi-trash-can"
                        variant="text"
                        color="error"
                        @click="confirmarExclusaoProcesso(processo.id)"
                        title="Descartar processo"
                      ></v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <!-- Tabela de Produtos (direto na tela) -->
    <v-expand-transition>
      <v-card v-if="produtos.length > 0" class="background-card mt-4" elevation="2">
        <!-- Header -->
        <v-card-title class="text-h5 pa-4 d-flex justify-space-between align-center" style="border-bottom: 3px solid var(--text-color-laranja)">
          <div class="d-flex align-center">
            <v-icon icon="mdi-package-multiple" class="mr-3" size="28" style="color: var(--text-color-laranja)"></v-icon>
            <div>
              <div class="font-weight-bold">Produtos Encontrados</div>
              <div class="text-caption mt-1" :style="{ color: 'var(--text-color-laranja)' }">{{ produtos.length }} total de produtos</div>
            </div>
          </div>
          <div class="d-flex align-center gap-3">
            <v-chip
              color="orange"
              text-color="white"
              class="font-weight-bold"
              size="large"
            >
              {{ produtos.length }} produto(s)
            </v-chip>
          </div>
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Cards de Produtos -->
          <v-row>
            <v-col
              v-for="(produto) in produtosPaginados"
              :key="produto._id_row"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card class="product-card" elevation="2">
                <!-- Imagem do Produto -->
                <div class="product-image-wrapper">
                  <v-img
                    :src="produto.foto_url || 'https://via.placeholder.com/300x300?text=Sem+Imagem'"
                    :alt="produto.produto"
                    height="220"
                    cover
                    class="product-image"
                  >
                    <template v-slot:placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <v-progress-circular indeterminate color="orange"></v-progress-circular>
                      </div>
                    </template>
                  </v-img>
                  <div class="product-badge">
                    <v-chip size="small" color="orange" text-color="white" class="font-weight-bold">
                      {{ produto.codbar }}
                    </v-chip>
                  </div>
                </div>

                <!-- Informações do Produto -->
                <v-card-text class="pa-4">
                  <div class="text-h6 font-weight-bold mb-2 text-truncate" :title="produto.produto">
                    {{ produto.produto }}
                  </div>

                  <v-divider class="mb-3"></v-divider>

                  <v-row dense>
                    <v-col cols="6" class="py-1">
                      <div class="text-caption text-grey">NCM</div>
                      <div class="text-body-2 font-weight-medium">{{ produto.ncm || '---' }}</div>
                    </v-col>
                    <v-col cols="6" class="py-1">
                      <div class="text-caption text-grey">CEST</div>
                      <div class="text-body-2 font-weight-medium">{{ produto.cest_codigo || '---' }}</div>
                    </v-col>
                    <v-col cols="6" class="py-1">
                      <div class="text-caption text-grey">Peso</div>
                      <div class="text-body-2 font-weight-medium">{{ produto.peso || '---' }}</div>
                    </v-col>
                    <v-col cols="6" class="py-1">
                      <div class="text-caption text-grey">Marca</div>
                      <div class="text-body-2 font-weight-medium">{{ produto.marca || '---' }}</div>
                    </v-col>
                    <v-col cols="6" class="py-1">
                      <div class="text-caption text-grey">Categoria</div>
                      <div class="text-body-2 font-weight-medium">{{ produto.categoria || '---' }}</div>
                    </v-col>
                    <v-col cols="6" class="py-1">
                      <div class="text-caption text-grey">Embalagem</div>
                      <div class="text-body-2 font-weight-medium">{{ produto.embalagem || '---' }}</div>
                    </v-col>
                    <v-col cols="12" class="py-1">
                      <div class="text-caption text-grey">SKU</div>
                      <div class="text-body-2 font-weight-medium">{{ produto.sku || '---' }}</div>
                    </v-col>
                  </v-row>

                  <v-divider class="my-3"></v-divider>

                  <!-- Preços -->
                  <v-row dense>
                    <v-col cols="4" class="text-center">
                      <div class="text-caption text-grey">Preço Médio</div>
                      <div class="text-subtitle-2 font-weight-bold" style="color: #4CAF50">
                        R$ {{ formatarNumero(produto.preco_medio) }}
                      </div>
                    </v-col>
                    <v-col cols="4" class="text-center">
                      <div class="text-caption text-grey">Preço Venda</div>
                      <v-text-field
                        :model-value="formatarMoedaBR(produto.preco_venda)"
                        variant="outlined"
                        density="compact"
                        class="input-preco-sm"
                        hide-details
                        @update:model-value="aplicarMascaraMoeda($event, produto, 'preco_venda')"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="4" class="text-center">
                      <div class="text-caption text-grey">Custo Compra</div>
                      <v-text-field
                        :model-value="formatarMoedaBR(produto.custo_compra)"
                        variant="outlined"
                        density="compact"
                        class="input-preco-sm"
                        hide-details
                        @update:model-value="aplicarMascaraMoeda($event, produto, 'custo_compra')"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <!-- Ações do Produto -->
                  <v-row class="mt-3">
                    <v-col cols="12">
                      <v-btn
                        block
                        color="orange"
                        variant="flat"
                        class="text-white font-weight-bold"
                        :loading="loadingImportacao"
                        @click="importarProdutoUnico(produto)"
                        prepend-icon="mdi-cloud-upload"
                      >
                        Importar Produto
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Paginação -->
          <v-row class="mt-6 mb-6">
            <v-col cols="12" class="d-flex justify-space-between align-center gap-2 flex-wrap">
              <div class="text-caption text-grey">
                <strong>{{ inicioExibicao }}</strong> a <strong>{{ fimExibicao }}</strong> de <strong>{{ produtos.length }}</strong> produtos
              </div>
              <div class="d-flex gap-2 align-center">
                <v-chip color="orange" text-color="white" class="font-weight-bold" size="small">
                  Página {{ paginaAtual + 1 }} / {{ totalPaginas }}
                </v-chip>
                <v-btn
                  color="grey"
                  variant="outlined"
                  size="small"
                  :disabled="paginaAtual === 0 || loadingBusca"
                  @click="paginaAtual--"
                  prepend-icon="mdi-chevron-left"
                >
                  Anterior
                </v-btn>
                <v-btn
                  color="orange"
                  variant="flat"
                  class="text-white font-weight-bold"
                  size="small"
                  :disabled="paginaAtual >= totalPaginas - 1 || loadingBusca"
                  @click="carregarProxima"
                  append-icon="mdi-chevron-right"
                >
                  Próxima
                </v-btn>
              </div>
            </v-col>
          </v-row>

          <!-- Botão Limpar Tudo -->
          <v-divider class="my-4"></v-divider>
          <v-row class="mt-4">
            <v-col cols="12" class="d-flex gap-3 justify-end">
              <v-btn
                color="grey"
                variant="outlined"
                @click="limparProdutos"
                prepend-icon="mdi-close"
              >
                Limpar Tudo
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <!-- Resultado da Importação -->
    <v-dialog v-model="resultadoVisivel" max-width="600px">
      <v-card class="background-card" elevation="2">
        <v-card-title class="text-h6 pa-4 d-flex align-center" style="border-bottom: 2px solid var(--text-color-laranja)">
          <v-icon
            :icon="resultadoImportacao.sucesso ? 'mdi-check-circle' : 'mdi-alert-circle'"
            :color="resultadoImportacao.sucesso ? '#4CAF50' : '#F44336'"
            class="mr-3"
            size="28"
          ></v-icon>
          <span class="font-weight-bold">Resultado da Importação</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row class="mb-4">
            <v-col cols="12" sm="6">
              <div class="text-center pa-4 background-secondary rounded" style="border-left: 4px solid #4CAF50">
                <div class="text-h4 font-weight-bold" style="color: #4CAF50">
                  {{ resultadoImportacao.inseridos }}
                </div>
                <div class="text-caption mt-2">Produtos Inseridos</div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-center pa-4 background-secondary rounded" style="border-left: 4px solid #F44336">
                <div class="text-h4 font-weight-bold" style="color: #F44336">
                  {{ resultadoImportacao.erros }}
                </div>
                <div class="text-caption mt-2">Erros</div>
              </div>
            </v-col>
          </v-row>

          <!-- Mensagens de Erro -->
          <v-row v-if="resultadoImportacao.mensagensErro.length > 0" class="mt-6">
            <v-col cols="12">
              <v-expansion-panels>
                <v-expansion-panel>
                  <template v-slot:title>
                    <v-icon icon="mdi-alert" class="mr-2" color="#F44336"></v-icon>
                    <span class="font-weight-bold">Ver Erros ({{ resultadoImportacao.mensagensErro.length }})</span>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="(erro, index) in resultadoImportacao.mensagensErro"
                      :key="index"
                    >
                      <template v-slot:prepend>
                        <v-icon icon="mdi-close-circle" color="#F44336"></v-icon>
                      </template>
                      <v-list-item-title class="text-caption">
                        <strong>{{ erro.produto }}:</strong> {{ erro.mensagem }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4" style="border-top: 1px solid rgba(0, 0, 0, 0.12)">
          <v-spacer></v-spacer>
          <v-btn
            color="var(--text-color-laranja)"
            variant="flat"
            class="text-white font-weight-bold"
            @click="fecharResultado"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Produtos Temporários -->
    <!-- REMOVIDO - Tabela agora exibida na tela principal -->

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import apiPhp from '@/services/apiPhp'
import apiLocal from '@/services/apiLocal'
import { toast } from 'vue3-toastify'
const gtinInput = ref(null)
const loadingBusca = ref(false)
const loadingImportacao = ref(false)

const resultadoVisivel = ref(false)
const produtos = ref([])
const paginaAtual = ref(0)
const itemsPorPagina = 50
const totalProdutos = ref(0)
const offsetAtual = ref(0)

const resultadoImportacao = ref({
  sucesso: true,
  inseridos: 0,
  erros: 0,
  mensagensErro: []
})

const produtosTempEncontrados = ref([])



const filtros = reactive({
  gtin: ''
})

// Formatar data para exibição
const formatarData = (data) => {
  if (!data) return '-'
  try {
    const d = typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)
      ? new Date(data + 'T00:00:00')
      : new Date(data)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return data
  }
}

// Confirmar exclusão de processo
const confirmarExclusaoProcesso = (id) => {
  if (confirm(`Descartar processo ${id}? Os dados não salvos serão perdidos.`)) {
    descartarProdutosTemp()
  }
}




const produtosPaginados = computed(() => {
  const inicio = paginaAtual.value * itemsPorPagina
  const fim = inicio + itemsPorPagina
  return produtos.value.slice(inicio, fim)
})

const totalPaginas = computed(() => {
  return Math.ceil(produtos.value.length / itemsPorPagina)
})

const inicioExibicao = computed(() => {
  return paginaAtual.value * itemsPorPagina + 1
})

const fimExibicao = computed(() => {
  return Math.min((paginaAtual.value + 1) * itemsPorPagina, produtos.value.length)
})



// Formatar valor numérico para moeda brasileira
const formatarMoedaBR = (valor) => {
  if (!valor && valor !== 0) return ''
  const num = parseFloat(valor)
  if (isNaN(num)) return ''
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Aplicar máscara de moeda brasileira e atualizar o valor
const aplicarMascaraMoeda = (texto, item, campo) => {
  // Remove tudo que não é número
  let apenasNumeros = texto.replace(/\D/g, '')

  if (apenasNumeros === '') {
    item[campo] = 0
    return
  }

  // Converte para número (dividindo por 100 porque são centavos)
  const valor = parseInt(apenasNumeros) / 100
  item[campo] = parseFloat(valor.toFixed(2))
}




const buscarPorGtin = async () => {
  const gtin = filtros.gtin?.trim()
  if (!gtin) {
    toast.warning('Escaneie um código de barras válido')
    return
  }

  loadingBusca.value = true
  try {
    const response = await apiPhp.get(`/estoque/produtos/referencia/${gtin}`)
    const data = response.data?.data ?? response.data ?? null

    if (data) {
      const novoProduto = {
        ...data,
        _id_row: `${produtos.value.length}-${Date.now()}`,
        selecionado: true,
        codbar: gtin,
        grupo: data.categoria || '',
        marca: data.marca || '',
        peso: data.peso || '',
        preco_venda: 0,
        custo_compra: 0,
        custo_aquisicao: 0,
        id_grupo: data.id_grupo || null,
        id_subgrupo: data.id_subgrupo || null,
        id_marca: data.id_marca || null,
        id_medida: data.id_medida || null,
        id_localizacao: data.id_localizacao || null,
        id_classe: data.id_classe || null,
        incidencia_fiscal: data.incidencia_fiscal || '00'
      }

      const jaExiste = produtos.value.find(p => p.codbar === gtin)
      if (!jaExiste) {
        produtos.value.push(novoProduto)
      }

      totalProdutos.value = produtos.value.length
      filtros.gtin = ''
      toast.success(`Produto "${novoProduto.produto}" encontrado`)
    } else {
      toast.warning('Nenhum produto encontrado com este código de barras')
    }
  } catch (error) {
    if (error.response?.status === 404) {
      toast.warning('Nenhum produto encontrado com este código de barras')
    } else {
      toast.error('Erro ao buscar produto. Tente novamente.')
    }
  } finally {
    loadingBusca.value = false
  }
}


const formatarNumero = (valor) => {
  if (!valor && valor !== 0) return '0,00'
  const num = parseFloat(valor)
  if (isNaN(num)) return '0,00'
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const limparProdutos = () => {
  produtos.value = []
  totalProdutos.value = 0
  paginaAtual.value = 0
  offsetAtual.value = 0
  filtros.gtin = ''
  gtinInput.value?.focus()
}

const importarProdutoUnico = async (produto) => {
  loadingImportacao.value = true
  try {
    await apiPhp.post('/estoque/produtos/importar', { codigo_gtin: produto.codbar })
    const idx = produtos.value.findIndex(p => p._id_row === produto._id_row)
    if (idx !== -1) produtos.value.splice(idx, 1)
    totalProdutos.value = produtos.value.length
    if (produtos.value.length === 0) {
      paginaAtual.value = 0
      offsetAtual.value = 0
    }
    toast.success(`"${produto.produto}" importado com sucesso`)
  } catch (err) {
    toast.error(`Erro ao importar "${produto.produto}": ${err.response?.data?.erro || err.message}`)
  } finally {
    loadingImportacao.value = false
  }
}

const fecharResultado = () => {
  resultadoVisivel.value = false
  // Limpar dados após importação
  produtos.value = []
  produtosTempEncontrados.value = []
  totalProdutos.value = 0
  paginaAtual.value = 0
  filtros.gtin = ''
  gtinInput.value?.focus()
}

// Verificar produtos temporários ao montar o componente
onMounted(() => {
  verificarProdutosTemporarios()
})

const verificarProdutosTemporarios = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await apiLocal.get('/produtoreftempid', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      produtosTempEncontrados.value = response.data.data
      // Apenas armazena os dados, sem abrir diálogo
    }
  } catch (error) {
    // Silencioso - não mostrar erro se não houver produtos temporários
  }
}

const continuarImportacao = async (idEspecifico) => {
  if (produtosTempEncontrados.value.length === 0) {
    toast.warning('Nenhum produto temporário encontrado')
    return
  }

  // Usar o ID específico passado como parâmetro, ou o primeiro se não houver
  const primeiroID = idEspecifico || produtosTempEncontrados.value[0].id

  try {
    const token = localStorage.getItem('token')

    // GET para buscar os produtos temporários
    const response = await apiLocal.get(`/produtoreftemp/${primeiroID}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Armazenar o ID para usar no PUT depois
      const idImportacao = primeiroID

      // Carregar os produtos no modal
      produtos.value = response.data.data.map((p, index) => ({
        ...p,
        _id_row: `${index}-${Date.now()}`, // ID único para cada linha
        selecionado: true, // Já vêm selecionados
        preco_venda: parseFloat(p.preco_venda) || 0,
        custo_compra: parseFloat(p.custo_compra) || 0,
        custo_aquisicao: parseFloat(p.custo_aquisicao) || 0,
        incidencia_fiscal: p.incidencia_fiscal || '00',
        _idImportacao: idImportacao // Armazenar o ID da importação
      }))

      totalProdutos.value = response.data.records || produtos.value.length
      paginaAtual.value = 0

      toast.success(`${produtos.value.length} produto(s) carregado(s) para continuar a importação`)
    } else {
      toast.error('Nenhum produto encontrado para esta importação')
    }
  } catch (error) {
    toast.error('Erro ao carregar produtos temporários: ' + (error.response?.data?.mensagem || error.message))
  }
}

const descartarProdutosTemp = async () => {
  try {
    const token = localStorage.getItem('token')
    // Chamar API para limpar os produtos temporários
    await apiLocal.delete('/produtoreftemp', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    produtosTempEncontrados.value = []
    toast.success('Produtos temporários descartados. Você pode iniciar uma nova importação.')
  } catch (error) {
    toast.warning('Não foi possível descartar os produtos temporários, mas você pode continuar com uma nova importação.')
  }
}
</script>

<style scoped>
.product-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(245, 124, 0, 0.15);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(245, 124, 0, 0.15) !important;
}

.product-image-wrapper {
  position: relative;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 100%);
  border-bottom: 2px solid var(--text-color-laranja);
}

.product-image {
  object-fit: contain;
  padding: 12px;
}

.product-badge {
  position: absolute;
  top: 8px;
  left: 8px;
}

/* Inputs de preço no card */
:deep(.input-preco-sm .v-field) {
  min-height: 36px !important;
  background-color: #FFFFFF !important;
  border: 2px solid #F57C00 !important;
  border-radius: 4px !important;
}

:deep(.input-preco-sm .v-field--focused) {
  border-color: #E65100 !important;
  box-shadow: 0 0 0 2px rgba(245, 124, 0, 0.15) !important;
}

:deep(.input-preco-sm input) {
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem !important;
  color: #D32F2F !important;
}

:deep(.v-theme--dark .input-preco-sm .v-field) {
  background-color: #2C2C2C !important;
  border-color: #FFB74D !important;
}

:deep(.v-theme--dark .input-preco-sm input) {
  color: #FFB74D !important;
}
</style>
