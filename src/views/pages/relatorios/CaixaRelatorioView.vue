<template>
  <div class="pa-4">
    <v-card class="background-secondary my-4" elevation="0">
      <v-card-title class="text-h5 pa-4 d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <v-icon icon="mdi-cash-register-outline" class="mr-3"></v-icon>
          Relatório de Caixa
        </div>
      </v-card-title>
    </v-card>

    <v-card elevation="0" class="background-secondary mb-4">
      <v-card-text class="pa-4">
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filtros.dataInicio"
              type="date"
              label="Data Início"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="filtros.dataFim"
              type="date"
              label="Data Fim"
              variant="outlined"
              density="compact"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="filtros.caixa"
              label="Caixa"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>

          <v-col cols="12" md="3" class="d-flex align-end gap-2">
            <v-btn
              color="var(--text-color-laranja)"
              variant="flat"
              class="text-white"
              prepend-icon="mdi-magnify"
              block
              @click="filtrarRelatorio"
            >
              Filtrar
            </v-btn>
            <v-btn
              color="var(--text-color-laranja)"
              variant="outlined"
              prepend-icon="mdi-download"
              @click="exportarRelatorio"
            >
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card elevation="0" class="background-secondary">
      <v-card-text class="pa-4">
        <TabelaPadrao
          :formulario-aberto="false"
          :headers="headers"
          :items="dadosRelatorio"
          :loading="loading"
          :show-edit-action="false"
          :show-delete-action="false"
          item-key="id"
          no-data-icon="mdi-chart-bar"
          no-data-text="Nenhum dado encontrado para os filtros aplicados."
        >
          <template v-slot:[`item.tipo`]="{ item }">
            <v-chip
              :color="item.tipo === 'entrada' ? 'success' : 'error'"
              text-color="white"
              label
            >
              {{ item.tipo === 'entrada' ? 'Entrada' : 'Saída' }}
            </v-chip>
          </template>

          <template v-slot:[`item.valor`]="{ item }">
            <span :style="{ color: item.tipo === 'entrada' ? 'var(--text-color)' : 'rgb(var(--v-theme-error))' }">
              R$ {{ item.valor.toFixed(2) }}
            </span>
          </template>

          <template v-slot:bottom>
            <div class="d-flex justify-space-between align-center pa-4 border-t">
              <span class="text-subtitle-2">
                <strong>Total de Movimentações:</strong> {{ dadosRelatorio.length }}
              </span>
              <span class="text-subtitle-2">
                <strong>Saldo:</strong> R$ {{ saldoFinal.toFixed(2) }}
              </span>
            </div>
          </template>
        </TabelaPadrao>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useThemeStore } from '@/stores/config-temas/theme'
import TabelaPadrao from '@/components/base/padrao-paginas/TabelaPadrao.vue'

const themeStore = useThemeStore()
const loading = ref(false)

const snackbar = reactive({ show: false, message: '', color: 'success' })

const mostrarMensagem = (message, color = 'success') => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

const filtros = reactive({
  dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  dataFim: new Date().toISOString().split('T')[0],
  caixa: ''
})

const dadosRelatorio = ref([])

const headers = [
  { title: 'Data', key: 'data', sortable: true },
  { title: 'Hora', key: 'hora', sortable: true },
  { title: 'Tipo', key: 'tipo', sortable: true },
  { title: 'Descrição', key: 'descricao', sortable: true },
  { title: 'Valor', key: 'valor', sortable: true },
  { title: 'Usuário', key: 'usuario', sortable: true }
]

const totalEntradas = computed(() => {
  return dadosRelatorio.value
    .filter(item => item.tipo === 'entrada')
    .reduce((sum, item) => sum + (item.valor || 0), 0)
})

const totalSaidas = computed(() => {
  return dadosRelatorio.value
    .filter(item => item.tipo === 'saida')
    .reduce((sum, item) => sum + (item.valor || 0), 0)
})

const saldoFinal = computed(() => totalEntradas.value - totalSaidas.value)

const filtrarRelatorio = () => {
  loading.value = true
  try {
    dadosRelatorio.value = []
  } catch (error) {
    mostrarMensagem('Erro ao carregar relatório', 'error')
  } finally {
    loading.value = false
  }
}
</script>
