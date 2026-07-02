<template>
  <top-all-pages icon="mdi-account-circle-outline">
    <template #titulo>Perfil do Usuário</template>

    <template #section>

      <!-- HERO -->
      <v-card class="mb-6 overflow-hidden background-card" elevation="0" rounded="xl">
        <div class="perfil-banner" />
        <div class="perfil-hero-content px-6 pb-5">
          <div class="d-flex align-center justify-space-between mb-2">
            <v-avatar size="88" class="perfil-avatar">
              <v-img v-if="dataUsuario?.foto_perfil" :src="dataUsuario.foto_perfil" alt="foto" />
              <span v-else class="perfil-initials">{{ initials }}</span>
            </v-avatar>
            <v-btn
              variant="tonal"
              color="var(--text-color-laranja)"
              size="small"
              prepend-icon="mdi-pencil-outline"
              class="text-none mt-8"
              @click="abrirEdicao"
            >Editar Perfil</v-btn>
          </div>
          <div class="d-flex align-center justify-space-between flex-wrap" style="gap:12px">
            <div>
              <h2 class="text-h5 font-weight-bold texto-color-primary mb-1">
                {{ dataUsuario?.nome || 'Usuário' }}
              </h2>
              <p class="text-body-2 mb-0" style="opacity:.6">{{ dataUsuario?.email || '' }}</p>
            </div>
            <div class="d-flex align-center" style="gap:8px">
              <v-chip
                v-if="dataSaas?.nome"
                color="var(--text-color-laranja)" variant="tonal" size="small"
              >
                <v-icon start icon="mdi-cloud-outline" size="14" />
                {{ dataSaas.nome }}
              </v-chip>
              <v-chip
                :color="dataUsuario?.ativo === 'S' ? '#4CAF50' : '#F44336'"
                variant="flat" size="small" class="text-white font-weight-medium"
              >
                <v-icon start icon="mdi-circle" size="8" />
                {{ dataUsuario?.ativo === 'S' ? 'Ativo' : 'Inativo' }}
              </v-chip>
            </div>
          </div>
        </div>
      </v-card>

      <!-- LINHA 1: Dados Pessoais + Dados SaaS -->
      <v-row class="mb-0">
        <v-col cols="12" md="5">
          <v-card class="background-card" elevation="0" rounded="xl" height="100%">
            <div class="info-card-header px-5 pt-5 pb-3">
              <v-icon icon="mdi-account-outline" color="var(--text-color-laranja)" size="20" class="mr-2" />
              <span class="text-body-1 font-weight-bold">Dados Pessoais</span>
            </div>
            <v-divider />
            <div class="px-5 py-4 d-flex flex-column ga-4">
              <div v-for="item in dadosPessoais" :key="item.label" class="info-row">
                <v-icon :icon="item.icon" size="18" color="var(--text-color-laranja)" class="info-icon" />
                <div>
                  <p class="texto-pequeno mb-0" style="opacity:.55">{{ item.label }}</p>
                  <p class="text-body-2 font-weight-medium mb-0">{{ item.value }}</p>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="7">
          <v-card class="background-card" elevation="0" rounded="xl" height="100%">
            <div class="info-card-header px-5 pt-5 pb-3">
              <v-icon icon="mdi-cloud-outline" color="var(--text-color-laranja)" size="20" class="mr-2" />
              <span class="text-body-1 font-weight-bold">Dados da Plataforma (SaaS)</span>
            </div>
            <v-divider />
            <div class="px-5 py-4 d-flex flex-column ga-4">
              <div v-for="item in dadosSaas" :key="item.label" class="info-row">
                <v-icon :icon="item.icon" size="18" color="var(--text-color-laranja)" class="info-icon" />
                <div>
                  <p class="texto-pequeno mb-0" style="opacity:.55">{{ item.label }}</p>
                  <p class="text-body-2 font-weight-medium mb-0">{{ item.value || '—' }}</p>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- LINHA 2: Empresa Selecionada -->
      <v-row class="mt-0">
        <v-col cols="12">
          <v-card class="background-card" elevation="0" rounded="xl">
            <div class="info-card-header px-5 pt-5 pb-3">
              <v-icon icon="mdi-domain" color="var(--text-color-laranja)" size="20" class="mr-2" />
              <span class="text-body-1 font-weight-bold">Empresa Selecionada</span>
              <v-chip
                v-if="empresaSelecionada?.matriz === 'S'"
                color="var(--text-color-laranja)" variant="tonal" size="x-small" class="ml-2"
              >Matriz</v-chip>
              <v-chip
                v-if="empresaSelecionada"
                :color="empresaSelecionada.ativo === 'S' ? '#4CAF50' : '#F44336'"
                variant="flat" size="x-small" class="ml-1 text-white"
              >{{ empresaSelecionada.ativo === 'S' ? 'Ativa' : 'Inativa' }}</v-chip>
            </div>
            <v-divider />
            <div class="px-5 py-4">
              <v-row>
                <v-col
                  v-for="item in dadosEmpresa" :key="item.label"
                  cols="12" sm="6" md="4"
                >
                  <div class="info-row">
                    <v-icon :icon="item.icon" size="18" color="var(--text-color-laranja)" class="info-icon" />
                    <div>
                      <p class="texto-pequeno mb-0" style="opacity:.55">{{ item.label }}</p>
                      <p class="text-body-2 font-weight-medium mb-0">{{ item.value || '—' }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- MODAL DE EDIÇÃO -->
      <v-dialog v-model="editDialog" max-width="460" persistent>
        <v-card class="background-card" rounded="xl">
          <div class="info-card-header px-6 pt-5 pb-3 justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-account-edit-outline" color="var(--text-color-laranja)" size="20" class="mr-2" />
              <span class="text-body-1 font-weight-bold">Editar Perfil</span>
            </div>
            <v-btn icon="mdi-close" variant="text" size="small" density="compact" @click="cancelar" />
          </div>

          <v-divider />

          <div class="px-6 py-5">
            <!-- Avatar com overlay de upload -->
            <div class="d-flex justify-center mb-5">
              <div class="edit-avatar-wrapper" @click="triggerFileInput">
                <v-avatar size="96" class="perfil-avatar">
                  <v-img v-if="previewUrl" :src="previewUrl" alt="preview" />
                  <span v-else class="perfil-initials">{{ initials }}</span>
                </v-avatar>
                <div class="edit-avatar-overlay">
                  <v-icon icon="mdi-camera" color="white" size="22" />
                </div>
              </div>
              <input ref="fileInput" type="file" accept="image/*" class="d-none" @change="onFileChange" />
            </div>

            <!-- Nome -->
            <v-text-field
              v-model="editNome"
              label="Nome"
              variant="outlined"
              density="compact"
              hide-details="auto"
              prepend-inner-icon="mdi-account-outline"
            />
          </div>

          <v-divider />

          <div class="px-6 py-4 d-flex justify-end" style="gap:8px">
            <v-btn variant="text" class="text-none" @click="cancelar">Cancelar</v-btn>
            <v-btn
              color="var(--text-color-laranja)"
              variant="flat"
              class="text-white text-none"
              :loading="apiStore.loading"
              @click="salvar"
            >Salvar</v-btn>
          </div>
        </v-card>
      </v-dialog>

    </template>
  </top-all-pages>
</template>

<script setup>
import TopAllPages from "@/components/base/padrao-paginas/TopAllPages.vue";
import {useEmpresaStore} from "@/stores/APIs/empresa";
import {useApiStore} from "@/stores/APIs/api";
import {computed, ref, watchEffect} from "vue";

const empresaStore = useEmpresaStore();
const apiStore = useApiStore();

const dataUsuario = computed(() => apiStore.dataUsuario);
const dataSaas = computed(() => apiStore.dataSaas);
const empresaSelecionada = computed(() => empresaStore.empresaSelecionada);

watchEffect(() => {
  if (empresaStore.empresas.length === 0) empresaStore.buscarTodasEmpresas();
});

const initials = computed(() => {
  const nome = dataUsuario.value?.nome || '';
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U';
});

// ── Edição ────────────────────────────────────────────────
const editDialog = ref(false);
const editNome = ref('');
const fotoBase64 = ref(null);
const previewUrl = ref(null);
const fileInput = ref(null);

const abrirEdicao = () => {
  editNome.value = dataUsuario.value?.nome || '';
  fotoBase64.value = null;
  previewUrl.value = dataUsuario.value?.foto_perfil || null;
  editDialog.value = true;
};

const cancelar = () => {
  editDialog.value = false;
};

const triggerFileInput = () => fileInput.value?.click();

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    fotoBase64.value = ev.target.result;
    previewUrl.value = ev.target.result;
  };
  reader.readAsDataURL(file);
};

const salvar = async () => {
  const payload = {};
  if (editNome.value && editNome.value !== dataUsuario.value?.nome) payload.nome = editNome.value;
  if (fotoBase64.value) payload.foto_perfil = fotoBase64.value;
  if (!Object.keys(payload).length) { editDialog.value = false; return; }

  const ok = await apiStore.updateMe(payload);
  if (ok) editDialog.value = false;
};

// ── Formatação ────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
};
const fmtCnpj = (v) => {
  if (!v) return '—';
  return v.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};
const fmtCep = (v) => {
  if (!v) return '—';
  return v.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2');
};
const fmtFone = (v) => {
  if (!v) return '—';
  const n = v.replace(/\D/g, '');
  if (n.length === 11) return n.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (n.length === 10) return n.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return v;
};

const dadosPessoais = computed(() => [
  { label: 'E-mail',             value: dataUsuario.value?.email || '—',                                icon: 'mdi-email-outline' },
  { label: 'Status',             value: dataUsuario.value?.ativo === 'S' ? 'Ativo' : 'Inativo',         icon: 'mdi-check-circle-outline' },
  { label: 'Permite Consolidar', value: dataUsuario.value?.permite_consolidar === 'S' ? 'Sim' : 'Não', icon: 'mdi-shield-check-outline' },
  { label: 'Cadastrado em',      value: fmtDate(dataUsuario.value?.dhinc),                             icon: 'mdi-calendar-plus-outline' },
  { label: 'Última alteração',   value: fmtDate(dataUsuario.value?.dhalt),                             icon: 'mdi-calendar-edit-outline' },
]);

const dadosSaas = computed(() => [
  { label: 'Nome',          value: dataSaas.value?.nome,                                        icon: 'mdi-tag-outline' },
  { label: 'E-mail',        value: dataSaas.value?.email,                                       icon: 'mdi-email-outline' },
  { label: 'Telefone',      value: dataSaas.value?.telefone,                                    icon: 'mdi-phone-outline' },
  { label: 'Status',        value: dataSaas.value?.ativo === 'S' ? 'Ativo' : 'Inativo',         icon: 'mdi-check-circle-outline' },
  { label: 'Cadastrado em', value: fmtDate(dataSaas.value?.dhinc),                              icon: 'mdi-calendar-outline' },
]);

const dadosEmpresa = computed(() => {
  const e = empresaSelecionada.value;
  if (!e) return [];
  return [
    { label: 'Razão Social',           value: e.razao_social,                            icon: 'mdi-domain' },
    { label: 'Nome Fantasia',          value: e.fantasia,                                icon: 'mdi-store-outline' },
    { label: 'CNPJ',                   value: fmtCnpj(e.cpf_cnpj),                      icon: 'mdi-card-account-details-outline' },
    { label: 'Telefone',               value: fmtFone(e.telefone),                      icon: 'mdi-phone-outline' },
    { label: 'Celular',                value: fmtFone(e.celular),                       icon: 'mdi-cellphone' },
    { label: 'WhatsApp',               value: fmtFone(e.whatsapp),                      icon: 'mdi-whatsapp' },
    { label: 'Endereço',               value: `${e.endereco || ''}, ${e.numero || ''}`, icon: 'mdi-map-marker-outline' },
    { label: 'Complemento',            value: e.complemento,                            icon: 'mdi-map-marker-plus-outline' },
    { label: 'CEP',                    value: fmtCep(e.cep),                            icon: 'mdi-mailbox-outline' },
    { label: 'CNAE',                   value: e.cnae,                                   icon: 'mdi-tag-text-outline' },
    { label: 'CRT',                    value: e.crt,                                    icon: 'mdi-file-certificate-outline' },
    { label: 'Participa Consolidação', value: e.part_consolidacao === 'S' ? 'Sim' : 'Não', icon: 'mdi-merge' },
    { label: 'Identificação Interna',  value: e.ident_interna,                          icon: 'mdi-identifier' },
    { label: 'Cadastrado em',          value: fmtDate(e.dhinc),                         icon: 'mdi-calendar-plus-outline' },
    { label: 'Expira em',              value: fmtDate(e.dhexpiracao),                   icon: 'mdi-calendar-clock-outline' },
  ];
});
</script>

<style scoped>
.perfil-banner {
  height: 110px;
  background: linear-gradient(135deg, #F57C00 0%, #e06400 55%, #ffab57 100%);
}

.perfil-hero-content {
  margin-top: -44px;
}

.perfil-avatar {
  border: 3px solid var(--bg-card);
  background: #F57C00;
  box-shadow: 0 4px 14px rgba(245, 124, 0, 0.45);
}

.perfil-initials {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.info-card-header {
  display: flex;
  align-items: center;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

/* Edit avatar */
.edit-avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
}

.edit-avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.edit-avatar-wrapper:hover .edit-avatar-overlay {
  opacity: 1;
}
</style>
