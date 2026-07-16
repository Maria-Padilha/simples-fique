<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    fullscreen
  >
    <v-card class="d-flex flex-column" style="height: 100vh;">
      <v-card-title class="pa-4 d-flex justify-space-between align-center log-cupom-header">
        <div class="d-flex align-center">
          <v-icon icon="mdi-file-alert" :color="log?.status === 'aprovado' ? 'green' : 'red'" class="mr-2"></v-icon>
          <span>Log Cupom Fiscal #{{ log?.id }}</span>
          <v-chip :color="log?.status === 'aprovado' ? 'green' : 'red'" size="small" class="ml-3">
            {{ log?.status === 'aprovado' ? 'Aprovado' : 'Erro' }}
          </v-chip>
        </div>
        <div class="d-flex gap-2">
          <v-btn
            color="var(--text-color-laranja)"
            variant="flat"
            class="text-white"
            prepend-icon="mdi-refresh"
            :loading="tentando"
            @click="tentarNovamente"
          >
            Tentar novamente
          </v-btn>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="fechar"
          ></v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-4 flex-grow-1 overflow-auto">
        <v-alert :type="log?.status === 'aprovado' ? 'success' : 'error'" variant="tonal" class="mb-4">
          <div><strong>cStat:</strong> {{ log?.cstat || '-' }}</div>
          <div>{{ log?.mensagem_erro }}</div>
          <div class="mt-1 text-caption">Tentativas: {{ log?.tentativas ?? 0 }}</div>
        </v-alert>

        <label class="mb-1 d-block">XML da NFC-e (editável — reassinado automaticamente ao tentar de novo)</label>
        <v-textarea
          v-model="xmlEditado"
          rows="24"
          variant="outlined"
          class="xml-editor"
          spellcheck="false"
          hide-details
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
/* eslint-disable no-undef */
import { ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import api from '@/services/api'

const props = defineProps({
  modelValue: Boolean,
  log: Object
})

const emit = defineEmits(['update:modelValue', 'atualizado'])

const xmlEditado = ref('')
const tentando = ref(false)

const headers_auth = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

watch(() => props.log, novo => {
  xmlEditado.value = novo?.xml || ''
}, { immediate: true })

const fechar = () => {
  emit('update:modelValue', false)
}

const tentarNovamente = async () => {
  if (!props.log?.id) return

  tentando.value = true
  try {
    const { data } = await api.post(
      `/api/v1/admin/terminais-venda-logs-cupom-fiscal/${props.log.id}/tentar-novamente`,
      { xml: xmlEditado.value },
      { headers: headers_auth() }
    )

    emit('atualizado', data.log)

    if (data.sucesso) {
      toast.success(data.mensagem || 'Cupom fiscal autorizado com sucesso.')
      fechar()
    } else {
      toast.error(data.mensagem || 'A SEFAZ rejeitou novamente.')
    }
  } catch (error) {
    toast.error(error.response?.data?.mensagem || error.response?.data?.erro || 'Erro ao tentar reenviar o cupom fiscal.')
  } finally {
    tentando.value = false
  }
}
</script>

<style scoped>
.log-cupom-header {
  background: var(--bg-color-secondary);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.xml-editor :deep(textarea) {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}
</style>
