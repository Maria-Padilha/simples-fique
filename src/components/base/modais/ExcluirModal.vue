<template>
  <v-dialog v-model="modalExcluir" max-width="420">
    <v-card class="background-secondary" elevation="0">
      <v-card-title class="d-flex flex-column align-center pt-6 pb-2 px-6">
        <v-icon icon="mdi-close-circle-outline" color="error" size="56" class="mb-3" />
        <p class="text-subtitle-1 font-weight-medium text-center texto-color-primary">
          Excluir este item?
        </p>
      </v-card-title>

      <v-card-text class="text-center px-6 pb-2">
        <p class="text-body-2 text-medium-emphasis excluir-modal__item-name">
          <slot name="item" />
        </p>
        <p class="text-body-2 text-medium-emphasis mt-2">
          Tem certeza que deseja excluir? Esta ação não pode ser desfeita.
        </p>
      </v-card-text>

      <v-card-actions class="justify-end pa-4 pt-2">
        <v-btn color="grey" variant="text" @click="cancelar" size="small">
          Cancelar
        </v-btn>
        <v-btn
            color="error"
            :loading="loading"
            @click="deletar"
            variant="flat"
            size="small"
            class="text-white">
          Excluir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.excluir-modal__item-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  font-weight: 500;
  color: var(--text-color);
}
</style>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  modalExcluir: {
    type: Boolean,
    required: true
  },
  loading: {
    type: Boolean,
    required: true
  },
  deletar: {
    type: Function,
    required: true
  },
  cancelar: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['update:modalExcluir'])

const modalExcluir = computed({
  get: () => props.modalExcluir,
  set: (val) => emit('update:modalExcluir', val)
})

const cancelar = () => {
  props.cancelar()
}

const deletar = () => {
  props.deletar()
}
</script>