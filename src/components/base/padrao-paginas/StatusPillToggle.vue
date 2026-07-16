<template>
  <button
      type="button"
      class="status-pill"
      :class="active ? 'status-pill--active' : 'status-pill--inactive'"
      :disabled="loading || disabled"
      @click.stop="$emit('toggle')"
  >
    <span class="status-pill__thumb">
      <v-progress-circular v-if="loading" indeterminate size="10" width="2" color="white"/>
    </span>
    <span class="status-pill__label">{{ active ? activeLabel : inactiveLabel }}</span>
  </button>
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  activeLabel: {
    type: String,
    default: 'Ativo'
  },
  inactiveLabel: {
    type: String,
    default: 'Inativo'
  }
})

defineEmits(['toggle'])
</script>

<style scoped>
.status-pill {
  display: inline-flex;
  align-items: center;
  border: none;
  border-radius: 999px;
  padding: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  gap: 6px;
  transition: background-color 0.2s ease;
}

.status-pill:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.status-pill--active {
  background-color: rgba(76, 175, 80, 0.16);
  color: #2e7d32;
  flex-direction: row;
  padding-right: 10px;
}

.status-pill--inactive {
  background-color: rgba(244, 67, 54, 0.14);
  color: #c62828;
  flex-direction: row-reverse;
  padding-left: 10px;
}

.status-pill__thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}

.status-pill--active .status-pill__thumb {
  background-color: #2e7d32;
}

.status-pill--inactive .status-pill__thumb {
  background-color: #c62828;
}
</style>
