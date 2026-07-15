<template>
  <div>
    <!-- ── Grupo 1: Identificação ─────────────────────── -->
    <div class="text-subtitle-2 font-weight-bold mb-3">
      <v-icon icon="mdi-account-circle" class="mr-1" size="18px"/>
      Identificação
    </div>
    <v-row dense>
      <v-col cols="12" md="3">
        <v-select
            v-model="form.tipo_pessoa"
            :items="[{ title: 'Física', value: 'F' }, { title: 'Jurídica', value: 'J' }]"
            item-title="title"
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
            :loading="buscandoPessoa"
            @blur="buscarPessoaPorCpf"
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
            :loading="buscandoPessoa"
            @blur="buscarPessoaPorCpf"
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
            :readonly="pessoaEncontrada"
            :bg-color="pessoaEncontrada ? 'grey-lighten-4' : undefined"
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
    <v-row dense>
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

    <!-- ── Grupo 3: Endereços ─────────────────────────── -->
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
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { ref, reactive, watch, onBeforeUnmount } from 'vue'
import { useThemeStore } from '@/stores/config-temas/theme'
import api from '@/services/api'
import apiPhp from '@/services/apiPhp'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'pessoa-encontrada', 'pessoa-nao-encontrada'])

const themeStore = useThemeStore()

const rules = {
  required: (v) => !!v || 'Campo obrigatório',
}

// ── Referência reativa local (espelha o parent) ──────────
const form = reactive({ ...props.modelValue })

const stopSyncChild = watch(form, (val) => {
  emit('update:modelValue', { ...val })
}, { deep: true })

onBeforeUnmount(() => {
  stopSyncChild()
})

// ── Busca de pessoa por CPF ──────────────────────────────
const buscandoPessoa = ref(false)
const pessoaEncontrada = ref(false)

const buscarPessoaPorCpf = async () => {
  const cpf = (form.cpf_cnpj || '').replace(/\D/g, '')
  if (form.tipo_pessoa === 'F' && cpf.length !== 11) return
  if (form.tipo_pessoa === 'J' && cpf.length !== 14) return

  buscandoPessoa.value = true
  try {
    const resp = await apiPhp.get('/manutencao/pessoas', { params: { find: cpf } })
    const rows = resp.data?.data ?? resp.data ?? []
    const lista = Array.isArray(rows) ? rows : []
    const encontrada = lista.find(p => (p.cpf_cnpj || '').replace(/\D/g, '') === cpf)

    if (!encontrada) {
      pessoaEncontrada.value = false
      form.id = null
      emit('pessoa-nao-encontrada', cpf)
      return
    }

    pessoaEncontrada.value = true
    form.id = encontrada.id || null
    form.tipo_pessoa = encontrada.tipo_pessoa || form.tipo_pessoa
    form.nome_razao = encontrada.nome_razao || ''
    form.apelido_fantasia = encontrada.apelido_fantasia || ''
    form.cpf_cnpj = encontrada.cpf_cnpj || form.cpf_cnpj
    form.rg_inscricao = encontrada.rg_inscricao || ''
    form.telefone = encontrada.telefone || ''
    form.celular = encontrada.celular || ''
    form.whats = encontrada.whats || ''
    form.website = encontrada.website || ''
    form.instagram = encontrada.instagram || ''
    form.facebook = encontrada.facebook || ''
    form.twitter_x = encontrada.twitter_x || ''
    form.tik_tok = encontrada.tik_tok || ''
    form.telegram = encontrada.telegram || ''
    form.enderecos = []

    emit('pessoa-encontrada', encontrada)
  } catch (e) {
    console.error('Erro ao buscar pessoa por CPF:', e)
    pessoaEncontrada.value = false
  } finally {
    buscandoPessoa.value = false
  }
}

// ── Endereços ────────────────────────────────────────────
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
      if (d.bairro) end.bairro = d.bairro
      if (d.localidade) end.cidade = d.localidade
    }
  } catch (e) {
    console.error('Erro ao buscar CEP:', e)
  } finally {
    end._buscandoCep = false
  }
}

// ── Planos de Conta ──────────────────────────────────────

// Expor methods para o parent
const resetarForm = (defaults = {}) => {
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
    instagram: '',
    facebook: '',
    twitter_x: '',
    tik_tok: '',
    telegram: '',
    enderecos: [],
    ...defaults
  })
  pessoaEncontrada.value = false
  buscandoPessoa.value = false
}

const preencherPessoa = (pessoa, endereco = []) => {
  pessoaEncontrada.value = true
  Object.assign(form, {
    id: pessoa.id || null,
    tipo_pessoa: pessoa.tipo_pessoa || 'F',
    nome_razao: pessoa.nome_razao || '',
    apelido_fantasia: pessoa.apelido_fantasia || '',
    cpf_cnpj: pessoa.cpf_cnpj || '',
    rg_inscricao: pessoa.rg_inscricao || '',
    telefone: pessoa.telefone || '',
    celular: pessoa.celular || '',
    whats: pessoa.whats || '',
    website: pessoa.website || '',
    instagram: pessoa.instagram || '',
    facebook: pessoa.facebook || '',
    twitter_x: pessoa.twitter_x || '',
    tik_tok: pessoa.tik_tok || '',
    telegram: pessoa.telegram || '',
    enderecos: Array.isArray(endereco)
      ? endereco.map(e => ({ ...e, _buscandoCep: false }))
      : []
  })
}

defineExpose({ resetarForm, preencherPessoa, form })
</script>
