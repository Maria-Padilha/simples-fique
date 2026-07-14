<template>
  <top-all-pages icon="mdi-certificate">
    <template #titulo>Certificados Digitais</template>
    <template #acoes>
      <v-btn
          icon
          color="var(--text-color-laranja)"
          variant="outlined"
          size="small"
          :disabled="!podeExportar(ID_PROGRAMA) && !podePDF(ID_PROGRAMA)"
          @click="modalExportacaoAberto = true"
      >
        <v-icon icon="mdi-printer"></v-icon>
        <v-tooltip activator="parent" location="top">
          {{ !podeExportar(ID_PROGRAMA) && !podePDF(ID_PROGRAMA) ? 'Sem permissão' : 'Imprimir / Exportar' }}
        </v-tooltip>
      </v-btn>
    </template>

    <template #section>
      <v-card class="background-secondary" elevation="0">
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-center mb-3 gap-2">
            <BotaoExpandTransition
                :formulario-aberto="formularioAberto"
                texto-abrir="Importar Certificado"
                texto-fechar="Cancelar"
                @toggle="toggleFormulario"
            />
          </div>

          <!-- Formulário Expansível -->
          <v-expand-transition>
            <div v-if="formularioAberto">
              <v-card class="background-card mb-7" elevation="0">
                <v-card-title class="text-h6 pa-4">
                  <v-icon icon="mdi-file-certificate" class="mr-2"></v-icon>
                  Importar Certificado Digital (.pfx)
                </v-card-title>

                <v-card-text class="pa-4">
                  <v-form ref="formRef" v-model="formValido">
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                            v-model="descricao"
                            label="Descrição *"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="compact"
                            class="custom-text-field required-left-border"
                            prepend-inner-icon="mdi-text-short"
                            placeholder="Ex: Certificado NF-e Matriz 2026"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="8">
                        <v-file-input
                            v-model="arquivoPfx"
                            label="Arquivo do certificado (.pfx) *"
                            :rules="[rules.required]"
                            accept=".pfx"
                            variant="outlined"
                            density="compact"
                            class="custom-text-field required-left-border"
                            prepend-icon=""
                            prepend-inner-icon="mdi-file-certificate"
                        ></v-file-input>
                      </v-col>

                      <v-col cols="12" sm="4">
                        <v-select
                            v-model="modelo"
                            label="Modelo *"
                            :items="['A1', 'A3']"
                            :rules="[rules.required]"
                            variant="outlined"
                            density="compact"
                            class="custom-text-field required-left-border"
                            prepend-inner-icon="mdi-certificate-outline"
                        ></v-select>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="senha"
                            label="Senha do certificado *"
                            :rules="[rules.required]"
                            type="password"
                            variant="outlined"
                            density="compact"
                            class="custom-text-field required-left-border"
                            prepend-inner-icon="mdi-lock-outline"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <v-text-field
                            v-model.number="alertaDias"
                            label="Alertar vencimento com quantos dias de antecedência *"
                            :rules="[rules.required, rules.positivo]"
                            type="number"
                            variant="outlined"
                            density="compact"
                            class="custom-text-field required-left-border"
                            prepend-inner-icon="mdi-bell-alert-outline"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="4">
                        <v-text-field
                            :model-value="codigoCertificado"
                            label="Código do certificado"
                            variant="outlined"
                            density="compact"
                            class="custom-text-field"
                            prepend-inner-icon="mdi-barcode"
                            hint="Preenchido automaticamente ao extrair o certificado"
                            persistent-hint
                            readonly
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="4">
                        <v-text-field
                            :model-value="validoApos"
                            label="Válido a partir de"
                            type="date"
                            variant="outlined"
                            density="compact"
                            class="custom-text-field"
                            prepend-inner-icon="mdi-calendar-start"
                            hint="Extraído do certificado"
                            persistent-hint
                            readonly
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" sm="4">
                        <v-text-field
                            :model-value="validoAte"
                            label="Válido até"
                            type="date"
                            variant="outlined"
                            density="compact"
                            class="custom-text-field"
                            prepend-inner-icon="mdi-calendar-end"
                            hint="Extraído do certificado"
                            persistent-hint
                            readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-alert
                        v-if="filePreview.subject"
                        type="info"
                        variant="tonal"
                        density="comfortable"
                        class="mb-4"
                    >
                      <div class="text-body-2"><strong>Arquivo:</strong> {{ filePreview.name }} ({{ filePreview.size }})</div>
                      <div class="text-body-2"><strong>Titular:</strong> {{ filePreview.subject }}</div>
                      <div class="text-body-2"><strong>Emissor:</strong> {{ filePreview.issuer }}</div>
                      <div class="text-body-2"><strong>Nº de série:</strong> {{ filePreview.serialNumber }}</div>
                    </v-alert>

                    <v-row v-if="chavePrivada || certificadoPem">
                      <v-col cols="12" md="6">
                        <v-textarea
                            :model-value="certificadoPem"
                            label="Certificado extraído (.pem)"
                            variant="outlined"
                            density="compact"
                            rows="5"
                            readonly
                        ></v-textarea>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-textarea
                            :model-value="chavePrivada"
                            label="Chave privada extraída"
                            variant="outlined"
                            density="compact"
                            rows="5"
                            hint="Informação sensível — não compartilhe"
                            persistent-hint
                            readonly
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>

                <v-card-actions class="pa-4">
                  <v-spacer></v-spacer>
                  <v-btn color="grey" variant="text" @click="cancelarFormulario">
                    Cancelar
                  </v-btn>
                  <v-btn
                      color="var(--text-color-laranja)"
                      variant="flat"
                      class="text-white"
                      :loading="certificadosStore.loading"
                      :disabled="!formValido"
                      @click="salvarCertificado"
                  >
                    Extrair e Cadastrar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-expand-transition>

          <!-- Tabela de Certificados -->
          <TabelaPadrao
              :formulario-aberto="formularioAberto"
              :headers="headers"
              :items="certificadosStore.certificados"
              :loading="certificadosStore.loading"
              :search="search"
              @update:search="(value) => search = value"
              search-label="Pesquisar certificado"
              item-key="id_certificado"
              no-data-icon="mdi-certificate-outline"
              no-data-text="Nenhum certificado cadastrado"
          >
            <template v-slot:[`item.id_certificado`]="{ item }">
              <span class="text-caption">{{ item.id_certificado?.slice(0, 16) }}…</span>
            </template>

            <template v-slot:[`item.dtvalidade_ini`]="{ item }">
              {{ formatarData(item.dtvalidade_ini) }}
            </template>

            <template v-slot:[`item.dtvalidade_fin`]="{ item }">
              {{ formatarData(item.dtvalidade_fin) }}
            </template>

            <template v-slot:[`item.situacao_calculada`]="{ item }">
              <v-chip
                  :color="certificadoAtivo(item) ? 'green' : 'red'"
                  variant="outlined"
                  size="small"
              >
                {{ certificadoAtivo(item) ? 'Ativo' : 'Vencido' }}
              </v-chip>
            </template>
          </TabelaPadrao>
        </v-card-text>
      </v-card>

      <!-- Snackbar para feedback -->
      <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          :timeout="3000"
      >
        {{ snackbar.message }}
      </v-snackbar>

      <!-- Modal de Exportação -->
      <ExportacaoModal
          v-model="modalExportacaoAberto"
          :dados="certificadosStore.certificados"
          :filtros="{}"
          nome-relatorio="Certificados Digitais"
          @exportar-pdf="() => {}"
          @exportar-csv="() => {}"
          @exportar-excel="() => {}"
          @imprimir="() => {}"
      ></ExportacaoModal>

      <!-- Modal de Preview do PDF -->
      <PdfPreviewModal
          v-model="modalPreviewPDF"
          :html-content="previewHTMLContent"
          nome-relatorio="Certificados_Digitais"
      />

      <!-- Modal de Acesso Negado -->
      <AcessoNegadoModal
          v-model="acessoNegadoModal"
          :nome-programa="'Certificados Digitais'"
          :tipo-acesso="tipoAcessoNegado"
      />
    </template>
  </top-all-pages>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import forge from 'node-forge'
import { useCertificadosStore } from '@/stores/APIs/certificados'
import { usePermissoes } from '@/utils/usePermissoes'
import BotaoExpandTransition from '@/components/base/padrao-paginas/BotaoExpandTransition.vue'
import TabelaPadrao from '@/components/base/padrao-paginas/TabelaPadrao.vue'
import TopAllPages from '@/components/base/padrao-paginas/TopAllPages.vue'
import ExportacaoModal from '@/components/base/modais/ExportacaoModal.vue'
import PdfPreviewModal from '@/components/base/modais/PdfPreviewModal.vue'
import AcessoNegadoModal from '@/components/base/modais/AcessoNegadoModal.vue'

// ID do programa desta tela
const ID_PROGRAMA = 'MMAN002P'

const certificadosStore = useCertificadosStore()
// eslint-disable-next-line no-unused-vars
const { podeVisualizar, podeIncluir, podeExportar, podePDF } = usePermissoes()

// Modal de acesso negado
const acessoNegadoModal = ref(false)
const tipoAcessoNegado = ref('')

// Estado da tela
const formularioAberto = ref(false)
const formValido = ref(false)
const formRef = ref(null)
const search = ref('')

// Snackbar
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

// Modais de exportação
const modalExportacaoAberto = ref(false)
const modalPreviewPDF = ref(false)
const previewHTMLContent = ref('')

// Campos do formulário de importação
const descricao = ref('')
const modelo = ref('A1')
const arquivoPfx = ref(null)
const senha = ref('')
const alertaDias = ref(30)
const codigoCertificado = ref('')
const validoApos = ref('')
const validoAte = ref('')
const chavePrivada = ref('')
const certificadoPem = ref('')

const filePreview = ref({
  name: '',
  size: '',
  subject: '',
  issuer: '',
  serialNumber: ''
})

// Regras de validação
const rules = {
  required: (value) => !!value || 'Campo obrigatório',
  positivo: (value) => Number(value) > 0 || 'Deve ser maior que zero'
}

// Headers da tabela
const headers = [
  { title: 'Descrição', key: 'descricao', sortable: true },
  { title: 'Código', key: 'id_certificado', sortable: true },
  { title: 'Modelo', key: 'id_modelo', sortable: true },
  { title: 'Válido de', key: 'dtvalidade_ini', sortable: true },
  { title: 'Válido até', key: 'dtvalidade_fin', sortable: true },
  { title: 'Alerta (dias)', key: 'dias_alerta_venc', sortable: true },
  { title: 'Situação', key: 'situacao_calculada', sortable: false }
]

watch(arquivoPfx, (arquivo) => {
  if (!arquivo) return
  filePreview.value = {
    ...filePreview.value,
    name: arquivo.name,
    size: (arquivo.size / 1024).toFixed(2) + ' KB'
  }
})

// Ciclo de vida
onMounted(async () => {
  if (!podeVisualizar(ID_PROGRAMA)) {
    tipoAcessoNegado.value = 'visualizar'
    acessoNegadoModal.value = true
    return
  }

  await certificadosStore.buscarCertificados()
})

// Métodos
const toggleFormulario = () => {
  if (!formularioAberto.value && !podeIncluir(ID_PROGRAMA)) {
    tipoAcessoNegado.value = 'incluir'
    acessoNegadoModal.value = true
    return
  }

  if (formularioAberto.value) {
    cancelarFormulario()
  } else {
    formularioAberto.value = true
  }
}

const cancelarFormulario = () => {
  formularioAberto.value = false
  resetarForm()
}

const resetarForm = () => {
  descricao.value = ''
  modelo.value = 'A1'
  arquivoPfx.value = null
  senha.value = ''
  alertaDias.value = 30
  codigoCertificado.value = ''
  validoApos.value = ''
  validoAte.value = ''
  chavePrivada.value = ''
  certificadoPem.value = ''
  filePreview.value = { name: '', size: '', subject: '', issuer: '', serialNumber: '' }

  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const mostrarMensagem = (message, color = 'success') => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

// Extrai certificado e chave privada do arquivo .pfx no client, via node-forge
const extrairCertificado = async () => {
  const arrayBuffer = await arquivoPfx.value.arrayBuffer()
  const binary = String.fromCharCode(...new Uint8Array(arrayBuffer))

  let p12
  try {
    p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(binary), false, senha.value)
  } catch {
    mostrarMensagem('Senha incorreta ou arquivo de certificado inválido.', 'error')
    return null
  }

  const bagsCert = p12.getBags({ bagType: forge.pki.oids.certBag })
  const bagsKey = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })
  const certificado = bagsCert[forge.pki.oids.certBag]?.[0]?.cert
  const privateKey = bagsKey[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0]?.key

  if (!certificado || !privateKey) {
    mostrarMensagem('Não foi possível extrair o certificado e a chave privada do arquivo.', 'error')
    return null
  }

  certificadoPem.value = forge.pki.certificateToPem(certificado)
  chavePrivada.value = forge.pki.privateKeyToPem(privateKey)

  filePreview.value.subject = certificado.subject.attributes
      .map((a) => `${a.shortName}=${a.value}`)
      .join(', ')
  filePreview.value.issuer = certificado.issuer.attributes
      .map((a) => `${a.shortName}=${a.value}`)
      .join(', ')
  filePreview.value.serialNumber = certificado.serialNumber

  codigoCertificado.value = certificado.subject.hash
  validoApos.value = paraInputDate(certificado.validity.notBefore)
  validoAte.value = paraInputDate(certificado.validity.notAfter)

  return certificado
}

const salvarCertificado = async () => {
  const certificado = await extrairCertificado()
  if (!certificado) return

  const formData = new FormData()
  formData.append('arquivo_pfx', arquivoPfx.value)
  formData.append('senha_pfx', senha.value)
  formData.append('descricao', descricao.value)
  formData.append('id_modelo', modelo.value)
  formData.append('situacao', calcularSituacao())
  formData.append('dias_alerta_venc', String(alertaDias.value))
  formData.append('id_certificado', codigoCertificado.value)
  formData.append('dtvalidade_ini', validoApos.value)
  formData.append('dtvalidade_fin', validoAte.value)

  const ok = await certificadosStore.cadastrarCertificado(formData)
  if (ok) {
    cancelarFormulario()
  }
}

const certificadoAtivo = (item) => {
  const hoje = new Date()
  const inicio = new Date(item.dtvalidade_ini)
  const fim = new Date(item.dtvalidade_fin)
  return hoje >= inicio && hoje <= fim
}

const calcularSituacao = () => {
  const hoje = new Date()
  const inicio = new Date(validoApos.value)
  const fim = new Date(validoAte.value)
  return hoje >= inicio && hoje <= fim ? 'A' : 'I'
}

const formatarData = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR')
}

const paraInputDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const ano = d.getFullYear()
  return `${ano}-${mes}-${dia}`
}
</script>
