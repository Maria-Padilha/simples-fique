<template>
  <v-dialog v-model="modalAberto" max-width="400">
    <v-card class="background-secondary" elevation="0">
      <v-card-title class="px-4 mt-5">
        <div class="w-100 flex flex-col items-center justify-center">
          <v-icon :icon="icone" :color="cor" size="70px" class="opacity-70 mb-2" />
          <p class="text-xl font-semibold texto-color-primary text-center">{{ titulo }}</p>
        </div>
      </v-card-title>

      <v-card-text class="px-4 text-center">
        {{ mensagem }}
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="aoCancelar" size="small">Cancelar</v-btn>

        <v-btn
            :color="cor"
            :loading="loading"
            @click="aoConfirmar"
            variant="flat" size="small"
            class="text-white">
          {{ textoConfirmar }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  modalAberto: {
    type: Boolean,
    required: true
  },
  titulo: {
    type: String,
    default: 'Confirmar ação?'
  },
  mensagem: {
    type: String,
    default: 'Tem certeza que deseja continuar? Esta ação não pode ser desfeita.'
  },
  textoConfirmar: {
    type: String,
    default: 'Confirmar'
  },
  icone: {
    type: String,
    default: 'mdi-alert-circle-outline'
  },
  cor: {
    type: String,
    default: 'error'
  },
  loading: {
    type: Boolean,
    default: false
  },
  confirmar: {
    type: Function,
    required: true
  },
  cancelar: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['update:modalAberto'])

const modalAberto = computed({
  get: () => props.modalAberto,
  set: (val) => emit('update:modalAberto', val)
})

const aoCancelar = () => {
  props.cancelar()
}

const aoConfirmar = () => {
  props.confirmar()
}
</script>
