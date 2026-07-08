<template>
  <top-all-pages icon="mdi-certificate">
    <template #titulo>Certificados</template>
    <template #section>
      <v-card elevation="0" class="background-secondary mb-6">
        <v-card-text class="pa-4">
          <v-container class="pa-0">
            <div class="flex justify-between mt-2 mb-6">
              <h2 class="text-xl font-semibold mb-6">Importar Certificado</h2>
              <v-btn color="var(--text-color-laranja)" size="small" class="text-white" variant="flat" :loading="certificadosStore.loading" @click="salvarCertificado">
                {{ editando ? 'Atualizar Certificado' : 'Extrair Chave/Certificado' }}
              </v-btn>
            </div>

            <v-row class="align-end">
              <v-col cols="12" sm="8">
                <v-text-field
                    v-model="codigoCertificado"
                    label="Código do certificado *"
                    variant="outlined"
                    density="compact"
                    class="required-left-border mb-4"
                    hide-details
                    readonly
                />
              </v-col>

              <v-col cols="6" sm="4">
                <v-radio-group v-model="modelo" inline label="Modelo" hide-details>
                  <v-radio label="A1" value="A1"/>
                  <v-radio label="A3" value="A3"/>
                </v-radio-group>
              </v-col>

              <v-col cols="12" sm="8">
                <v-file-input
                    v-model="arquivoPfx"
                    label="Arquivo PFX"
                    accept=".pfx"
                    variant="outlined"
                    class="required-left-border"
                    prepend-icon="mdi-file-certificate"
                />
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                    v-model="senha"
                    label="Senha *"
                    type="password"
                    class="required-left-border"
                    variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                    v-model="validoApos"
                    label="Válido a partir de *"
                    type="date"
                    variant="outlined"
                    class="required-left-border"
                    density="compact"
                />
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                    v-model="validoAte"
                    label="Válido até *"
                    type="date"
                    class="required-left-border"
                    variant="outlined"
                    density="compact"
                />
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                    v-model="alertaDias"
                    type="number"
                    variant="outlined"
                    class="required-left-border"
                    density="compact"
                    label="Alerta de expiração (dias) *"
                />
              </v-col>
            </v-row>

            <div v-if="arquivoPfx" class="pa-4 border rounded bg-gray-50 mb-6">
              <p><strong>Nome:</strong> {{ filePreview.name }}</p>
              <p><strong>Tamanho:</strong> {{ filePreview.size }}</p>
              <p v-if="filePreview.subject"><strong>Subject:</strong> {{ filePreview.subject }}</p>
              <p v-if="filePreview.issuer"><strong>Issuer:</strong> {{ filePreview.issuer }}</p>
              <p v-if="filePreview.serialNumber"><strong>Serial:</strong> {{ filePreview.serialNumber }}</p>
              <p v-if="filePreview.validadeInicio"><strong>Validade início:</strong> {{ filePreview.validadeInicio }}</p>
              <p v-if="filePreview.validadeFim"><strong>Validade fim:</strong> {{ filePreview.validadeFim }}</p>
            </div>

            <v-textarea
                v-model="chavePrivada"
                label="Arquivo Chave Privada (*.key)"
                auto-grow
                variant="outlined"
                rows="6"
            />

            <v-textarea
                v-model="certificadoPem"
                label="Arquivo Certificado (*.pem)"
                auto-grow
                variant="outlined"
                rows="6"
            />
          </v-container>
        </v-card-text>
      </v-card>

      <v-card elevation="0" class="background-secondary">
        <v-card-text class="pa-4">
          <h3 class="text-lg font-semibold mb-4">Certificados Cadastrados</h3>
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b">
                <th class="pa-2 font-medium">Código</th>
                <th class="pa-2 font-medium">Modelo</th>
                <th class="pa-2 font-medium">Validade</th>
                <th class="pa-2 font-medium">Alerta (dias)</th>
                <th class="pa-2 font-medium">Situação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in certificadosStore.certificados" :key="item.id_certificado" class="border-b">
                <td class="pa-2">{{ item.id_certificado?.slice(0, 16) }}...</td>
                <td class="pa-2">{{ item.id_modelo }}</td>
                <td class="pa-2">{{ formatarData(item.dtvalidade_ini) }} até {{ formatarData(item.dtvalidade_fin) }}</td>
                <td class="pa-2">{{ item.dias_alerta_venc }}</td>
                <td class="pa-2">
                  <v-chip
                    :color="certificadoAtivo(item) ? 'green' : 'red'"
                    variant="outlined" size="small"
                  >
                    {{ certificadoAtivo(item) ? 'Ativo' : 'Inativo' }}
                  </v-chip>
                </td>
              </tr>
              <tr v-if="!certificadosStore.certificados.length">
                <td colspan="5" class="pa-2 text-center text-gray-500">Nenhum certificado cadastrado</td>
              </tr>
            </tbody>
          </table>
        </v-card-text>
      </v-card>
    </template>
  </top-all-pages>
</template>

<script setup>
import TopAllPages from "@/components/base/padrao-paginas/TopAllPages.vue";
import { ref, onMounted, watch } from "vue"
import forge from "node-forge"
import { useCertificadosStore } from "@/stores/APIs/certificados"

const certificadosStore = useCertificadosStore()

const arquivoPfx = ref(null)
const senha = ref("")
const editando = ref(false)

const filePreview = ref({
  name: "",
  size: "",
  subject: "",
  issuer: "",
  serialNumber: "",
  validadeInicio: "",
  validadeFim: "",
})

const codigoCertificado = ref("");
const validoApos = ref("");
const validoAte = ref("");
const modelo = ref("A1");
const alertaDias = ref(30);

const chavePrivada = ref("")
const certificadoPem = ref("")

watch(arquivoPfx, (val) => {
  if (!val || val.length === 0) return
  const file = val
  filePreview.value = {
    name: file.name,
    size: (file.size / 1024).toFixed(2) + " KB"
  }
})

const extrairCertificado = async () => {
  if (!arquivoPfx.value) {
    alert("Selecione um arquivo PFX")
    return null
  }
  if (!senha.value) {
    alert("Digite a senha do arquivo PFX")
    return null
  }

  const arrayBuffer = await arquivoPfx.value.arrayBuffer()
  const binary = String.fromCharCode(...new Uint8Array(arrayBuffer))

  let p12
  try {
    p12 = forge.pkcs12.pkcs12FromAsn1(
        forge.asn1.fromDer(binary),
        false,
        senha.value
    )
  } catch (err) {
    alert("Senha incorreta ou arquivo inválido")
    return null
  }

  const bagsCert = p12.getBags({ bagType: forge.pki.oids.certBag })
  const bagsKey = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })

  const certificado = bagsCert[forge.pki.oids.certBag][0].cert
  const privateKey = bagsKey[forge.pki.oids.pkcs8ShroudedKeyBag][0].key

  certificadoPem.value = forge.pki.certificateToPem(certificado)
  chavePrivada.value = forge.pki.privateKeyToPem(privateKey)

  filePreview.value.subject = certificado.subject.attributes
      .map((a) => `${a.shortName}=${a.value}`)
      .join(", ")
  filePreview.value.issuer = certificado.issuer.attributes
      .map((a) => `${a.shortName}=${a.value}`)
      .join(", ")
  filePreview.value.serialNumber = certificado.serialNumber
  filePreview.value.validadeInicio = certificado.validity.notBefore
  filePreview.value.validadeFim = certificado.validity.notAfter

  codigoCertificado.value = certificado.subject.hash;
  validoAte.value = paraInputDate(certificado.validity.notAfter);
  validoApos.value = paraInputDate(certificado.validity.notBefore);

  return certificado
}

const salvarCertificado = async () => {
  if (!arquivoPfx.value) {
    alert("Selecione um arquivo PFX")
    return
  }
  if (!senha.value) {
    alert("Digite a senha do arquivo PFX")
    return
  }

  const certInfo = await extrairCertificado()
  if (!certInfo) return

  const formData = new FormData()
  formData.append("arquivo_pfx", arquivoPfx.value)
  formData.append("senha_pfx", senha.value)
  formData.append("id_modelo", modelo.value)
  formData.append("situacao", calcularSituacao())
  formData.append("dias_alerta_venc", String(alertaDias.value))
  formData.append("id_certificado", codigoCertificado.value)
  formData.append("dtvalidade_ini", validoApos.value)
  formData.append("dtvalidade_fin", validoAte.value)

  const ok = await certificadosStore.cadastrarCertificado(formData)

  if (ok) {
    arquivoPfx.value = null
    senha.value = ""
    codigoCertificado.value = ""
    validoApos.value = ""
    validoAte.value = ""
    chavePrivada.value = ""
    certificadoPem.value = ""
    filePreview.value = { name: "", size: "", subject: "", issuer: "", serialNumber: "", validadeInicio: "", validadeFim: "" }
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
  return hoje >= inicio && hoje <= fim ? "A" : "I"
}

const formatarData = (date) => {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString("pt-BR")
}

const paraInputDate = (date) => {
  if (!date) return ""
  const d = new Date(date)
  const dia = String(d.getDate()).padStart(2, "0")
  const mes = String(d.getMonth() + 1).padStart(2, "0")
  const ano = d.getFullYear()
  return `${ano}-${mes}-${dia}`
}

onMounted(() => {
  certificadosStore.buscarCertificados()
})
</script>
