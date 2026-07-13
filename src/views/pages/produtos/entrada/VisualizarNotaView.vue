<template>
  <top-all-pages icon="mdi-file-document-outline">
    <template #titulo>Visualizar Nota Fiscal</template>
    <template #section>
      <v-form ref="formsNf">

        <v-expansion-panels :theme="themeStore.darkMode ? 'dark' : 'light'" color="var(--bg-card)">
          <v-expansion-panel elevation="1" class="mb-5" title="Entrada de Nota" color="var(--bg-card)">
            <template #text>
              <v-row dense>
                <!-- id_fornecedor -->
                <v-col cols="12" md="4">
                  <v-autocomplete
                      density="compact" variant="outlined" label="Fornecedor" hide-details="auto"
                      v-model="forms.id_fornecedor" readonly :items="pessoas" item-title="nome_razao" item-value="id"
                  />
                </v-col>

                <!-- numero_nf -->
                <v-col cols="12" md="1">
                  <v-text-field
                      density="compact" variant="outlined" label="Nota" hide-details="auto"
                      v-model="forms.numero_nf" readonly
                  />
                </v-col>

                <!-- serie_nf -->
                <v-col cols="12" md="1">
                  <v-text-field
                      density="compact" variant="outlined" label="Série" hide-details="auto"
                      v-model="forms.serie_nf" readonly
                  />
                </v-col>

                <!-- id_almoxarifado -->
                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Almoxarifado" hide-details="auto"
                      v-model="forms.id_almoxarifado" readonly
                  />
                </v-col>

                <!-- id_cfop -->
                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="C.F.O.P" hide-details="auto"
                      v-model="forms.id_cfop" readonly>
                  </v-text-field>
                </v-col>

                <!-- id_uf -->
                <v-col cols="12" md="2">
                  <v-autocomplete
                      density="compact" variant="outlined" label="UF" hide-details="auto" :rules="validacao"
                      v-model="forms.id_uf" readonly
                  />
                </v-col>

                <!-- valores iniciais -->
                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Espécie" hide-details="auto"
                      v-model="forms.especie" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Tipo" hide-details="auto"
                      v-model="forms.tipo" maxlength="1" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Data Emissão" hide-details="auto"
                      :model-value="formatarData(forms.dtemissao)" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Data Entrada" hide-details="auto"
                      :model-value="formatarData(forms.dtentrada)" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Situação" hide-details="auto"
                      v-model="forms.situacao" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="NF Estrangeira" hide-details="auto"
                      v-model="forms.nf_estrangeira" readonly
                  />
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field
                      density="compact" variant="outlined" label="Valor Total Produtos" hide-details="auto"
                      :model-value="formatarMoeda(forms.vlr_total_produto)" readonly
                  />
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field
                      density="compact" variant="outlined" label="Valor NF" hide-details="auto"
                      :model-value="formatarMoeda(forms.vlr_nf)" readonly
                  />
                </v-col>

                <!-- Volume -->
                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Qtd Volume" hide-details="auto" type="number"
                      v-model="forms.qtd_volume" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Espécie Volume" hide-details="auto"
                      v-model="forms.especie_volume" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Peso Bruto" hide-details="auto" type="number"
                      v-model="forms.peso_bruto" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Peso Líquido" hide-details="auto" type="number"
                      v-model="forms.peso_liquido" readonly
                  />
                </v-col>

                <!-- Veículo / transportadora -->
                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Placa" hide-details="auto"
                      v-model="forms.placa_veiculo" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Regra CFOP" hide-details="auto"
                      v-model="forms.regra_cfop" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Nota de Origem" hide-details="auto"
                      v-model="forms.nf_origem" readonly
                  />
                </v-col>

                <!-- Booleans -->
                <v-col cols="12" md="3">
                  <v-switch
                      v-model="forms.gerou_financeiro"
                      :label="`Gerou Financeiro? ${forms.gerou_financeiro === 'S' ? 'Sim' : 'Não'}`"
                      hide-details="auto" color="var(--text-color-laranja)" readonly
                  />
                </v-col>

                <v-col cols="12" md="3">
                  <v-switch
                      v-model="forms.gerou_estoque"
                      :label="`Gerou Estoque? ${forms.gerou_estoque === 'S' ? 'Sim' : 'Não'}`"
                      hide-details="auto" color="var(--text-color-laranja)" readonly
                  />
                </v-col>

                <v-col cols="12" md="3">
                  <v-switch
                      v-model="forms.importacaoxml"
                      :label="`Importação XML? ${forms.importacaoxml === 'S' ? 'Sim' : 'Não'}`"
                      hide-details="auto" color="var(--text-color-laranja)" readonly
                  />
                </v-col>

                <v-col cols="12" md="12">
                  <v-textarea
                      density="compact" variant="outlined" label="Observação" hide-details="auto"
                      v-model="forms.observacao" rows="2" auto-grow readonly
                  />
                </v-col>
              </v-row>
            </template>
          </v-expansion-panel>

          <v-expansion-panel elevation="1" class="mb-5" title="Cálculo Tributário" color="var(--bg-card)">
            <template #text>
              <v-row dense>
                <!-- ICMS -->
                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Base ICMS" hide-details="auto" type="number"
                      v-model="forms.base_icms" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Alíquota ICMS" hide-details="auto" type="number"
                      v-model="forms.aliquota_icms" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Valor ICMS" hide-details="auto" type="number"
                      v-model="forms.vlr_icms" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Isento ICMS" hide-details="auto" type="number"
                      v-model="forms.isento_icms" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Outras Despesas" hide-details="auto" type="number"
                      v-model="forms.outras_despesas" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Desp. Fora NF" hide-details="auto" type="number"
                      v-model="forms.outras_despesas_foranf" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Base ICMS ST" hide-details="auto" type="number"
                      v-model="forms.base_icms_subst" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Valor ICMS ST" hide-details="auto" type="number"
                      v-model="forms.vlr_icms_subst" readonly
                  />
                </v-col>

                <!-- IPI -->
                <v-col cols="12" md="2">
                  <v-text-field density="compact" variant="outlined" label="Base IPI" hide-details="auto" type="number"
                                v-model="forms.base_ipi" readonly />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field density="compact" variant="outlined" label="Valor IPI" hide-details="auto" type="number"
                                v-model="forms.vlr_ipi" readonly />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field density="compact" variant="outlined" label="Isento IPI" hide-details="auto"
                                type="number" v-model="forms.isento_ipi" readonly />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field density="compact" variant="outlined" label="Alíquota IPI" hide-details="auto"
                                type="number" v-model="forms.aliquota_ipi" readonly />
                </v-col>

                <!-- Impostos diversos -->
                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Base II" hide-details="auto" type="number"
                      v-model="forms.base_ii" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Valor II" hide-details="auto" type="number"
                      v-model="forms.vlr_ii" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Alíquota II" hide-details="auto" type="number"
                      v-model="forms.aliquota_ii" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Base ISS" hide-details="auto" type="number"
                      v-model="forms.base_iss" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Valor ISS" hide-details="auto" type="number"
                      v-model="forms.vlr_iss" readonly
                  />
                </v-col>

                <!-- PIS/COFINS -->
                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="PIS Produto" hide-details="auto" type="number"
                      v-model="forms.vlr_pis_produto" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Alíquota PIS" hide-details="auto" type="number"
                      v-model="forms.aliquota_pis" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Cofins Produto" hide-details="auto" type="number"
                      v-model="forms.vlr_cofins_produto" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Alíquota Cofins" hide-details="auto" type="number"
                      v-model="forms.aliquota_cofins" readonly
                  />
                </v-col>

                <!-- Plano Pagamento -->
                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Plano Pagamento" hide-details="auto"
                      v-model="forms.id_planopagto" readonly
                  />
                </v-col>

                <!-- Seguro / desconto / frete -->
                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Valor Seguro" hide-details="auto" type="number"
                      v-model="forms.vlr_seguro" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Valor Desconto" hide-details="auto" type="number"
                      v-model="forms.vlr_desconto" readonly
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Tipo Frete" hide-details="auto"
                      v-model="forms.tipo_frete" readonly
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-autocomplete
                      density="compact" variant="outlined" label="Transportadora" hide-details="auto"
                      v-model="forms.id_transportadora" readonly
                      :items="pessoas" item-title="nome_razao" item-value="id"
                  />
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                      density="compact" variant="outlined" label="Valor Frete" hide-details="auto" type="number"
                      v-model="forms.vlr_frete" readonly
                  />
                </v-col>
              </v-row>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>

        <tabela-padrao
            :headers="headers"
            :items="produtos"
            :loading="produtosStore.loading"
            :show-search="false"
            item-key="id"
            no-data-icon="mdi-database-off"
            :item-por-pag="5"
            no-data-text="Nenhum item encontrado"
        >
          <template v-slot:[`item.vlr_unitario`]="{ item }">
            {{ formatarMoeda(item.vlr_unitario) }}
          </template>

          <template v-slot:[`item.desconto_total_item`]="{ item }">
            {{ formatarMoeda(item.desconto_total_item) }}
          </template>

          <template v-slot:[`item.vlr_total_item`]="{ item }">
            {{ formatarMoeda(item.vlr_total_item) }}
          </template>

          <template v-slot:[`item.vlr_frete_item`]="{ item }">
            {{ formatarMoeda(item.vlr_frete_item) }}
          </template>

          <template v-slot:[`item.custo_medio`]="{ item }">
            {{ formatarMoeda(item.custo_medio) }}
          </template>
        </tabela-padrao>
      </v-form>
    </template>
  </top-all-pages>
</template>

<script setup>
import TopAllPages from "@/components/base/padrao-paginas/TopAllPages.vue";
import TabelaPadrao from "@/components/base/padrao-paginas/TabelaPadrao.vue";
import {useThemeStore} from "@/stores/config-temas/theme";
import {useProdutosStore} from "@/stores/APIs/produtos";
import {usePessoasStore} from "@/stores/APIs/pessoas";
import {reactive, ref, watchEffect, computed} from "vue";
import {useRoute} from "vue-router";

const themeStore = useThemeStore();
const pessoasStore = usePessoasStore();
const produtosStore = useProdutosStore();
const route = useRoute();

const idEmpresa = JSON.parse(localStorage.getItem('empresaSelecionada'));
const pessoas = computed(() => pessoasStore.pessoas);
const id = route.params.id;

const forms = reactive({});
const produtos = ref([]);

const headers = ref([
  {title: 'Seq.', key: 'id_seq'},
  {title: 'Descrição do Produto', key: 'descprodutoxml'},
  {title: 'Quantidade', key: 'quantidade'},
  {title: 'Vlr. Unitário', key: 'vlr_unitario'},
  {title: 'Desconto', key: 'desconto_total_item'},
  {title: 'Total', key: 'vlr_total_item'},
  {title: 'Frete', key: 'vlr_frete_item'},
  {title: 'Custo Médio', key: 'custo_medio'},
  {title: 'Cor', key: 'id_cor'},
  {title: 'Tamanho', key: 'id_tamanho'},
]);

const formatarMoeda = (valor) => {
  const numero = Number(valor ?? 0);

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const formatarData = (valor) => {
  if (!valor) return '';

  const data = new Date(`${String(valor).slice(0, 10)}T00:00:00`);

  return data.toLocaleDateString('pt-BR');
};

watchEffect(async () => {
  if (id) {
    await Promise.all([
      produtosStore.buscarEntradaDfePorId(idEmpresa?.id ?? 1, id),
      produtosStore.buscarEntradaTributoPorId(id),
      produtosStore.buscarEntradaItens(id),
    ]);

    Object.assign(forms, produtosStore.entradadfeItem ?? {}, produtosStore.entradaTributoItem ?? {});
    produtos.value = produtosStore.entradaItens ?? [];

    if (pessoas.value.length === 0) {
      await pessoasStore.buscarTodasPessoas();
    }
  }
});
</script>