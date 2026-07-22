<template>
  <top-all-pages icon="mdi-package-variant">
    <template #titulo>Detalhes do Produto</template>
    <template #section>
      <v-sheet class="bg-transparent">
        <v-tabs v-model="tab" color="var(--text-color-laranja)">
          <v-tab value="one">Produtos</v-tab>
          <v-tab value="preco">Preço</v-tab>
          <v-tab value="tributo">Tributo</v-tab>
          <v-tab value="emb">Embalagem</v-tab>
          <v-tab value="for">Fornecedor</v-tab>
          <v-tab value="sim">Produtos Similares</v-tab>
          <v-tab value="img">Imagens</v-tab>
          <v-tab v-if="forms.utiliza_grade === 'S'" value="grade">Grade</v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="one">
            <v-form ref="formRef" class="mt-10">
              <div class="w-100 flex justify-between gap-3 mb-8">
                <v-chip
                    variant="outlined"
                    :prepend-icon="forms.ativo === 'S' ? 'mdi-check-circle-outline' : 'mdi-cancel' "
                    :color="forms.ativo === 'S' ? 'success' : 'error'"
                >
                  {{ `Ativo: ${forms.ativo === 'S' ? 'Sim' : 'Não'}` }}
                </v-chip>

                <div class="flex gap-3">
                  <v-btn
                      class="text-none" color="error" variant="tonal"
                      @click="openModalDelete = true" :loading="produtosStore.loading"
                      prepend-icon="mdi-delete-outline" size="small"
                  >
                    Excluir
                  </v-btn>

                  <v-btn
                      class="text-none text-white" color="var(--text-color-laranja)" variant="flat"
                      @click="atualizarProduto" :loading="produtosStore.loading"
                      prepend-icon="mdi-content-save-outline" size="small"
                  >
                    Atualizar
                  </v-btn>
                </div>
              </div>

              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                      density="compact"
                      variant="outlined"
                      label="Descrição do Produto"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="forms.descproduto"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                      density="compact"
                      variant="outlined"
                      label="Aplicação"
                      item-title="title"
                      item-value="value"
                      :items="[
                        { title: 'Produto para comercialização - venda', value: 'V' },
                        { title: 'Produto para consumo', value: 'C' },
                        { title: 'Matéria-Prima', value: 'M' },
                        { title: 'Imobilizado', value: 'I' },
                      ]"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="forms.aplicacao"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                      density="compact"
                      variant="outlined"
                      label="Tipo"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="forms.tipo"
                      item-title="title"
                      item-value="value"
                      :items="[
                        { title: 'Produto', value: 'P' },
                        { title: 'Serviço', value: 'S' },
                      ]"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                  />
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field
                      density="compact"
                      variant="outlined"
                      label="Código GTIN"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="forms.codigo_gtin"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                      density="compact"
                      variant="outlined"
                      label="Código SKU"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="forms.codigo_sku"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                      density="compact"
                      variant="outlined"
                      label="Código Fabricação"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="forms.codigo_fab"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                      density="compact"
                      variant="outlined"
                      label="Código Referência"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="forms.codigo_ref"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                  />
                </v-col>

                <v-col cols="12" md="3">
                  <v-text-field
                      density="compact"
                      variant="outlined"
                      label="Grupo"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="descgrupo"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                      readonly
                      placeholder="Selecione o Grupo"
                  >
                    <template #append-inner>
                      <grupos-menu @selecionar="selecionarGrupo"/>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-autocomplete
                      density="compact"
                      variant="outlined"
                      :label="`Subgrupo ${forms.id_grupo ? '' : '(Selecione o Grupo primeiro)'}`"
                      item-title="descsubgrupo"
                      item-value="id"
                      :items="subgrupos"
                      hide-details="auto"
                      v-model="forms.id_subgrupo"
                      :loading="estoqueStore.loading"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                      :readonly="!forms.id_grupo"
                  >
                    <template #no-data><p class="pa-3">Nenhum Subgrupo cadastrado!</p></template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                      density="compact"
                      variant="outlined"
                      label="Classe"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="descclasse"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                      readonly
                      placeholder="Selecione a classe"
                  >
                    <template #append-inner>
                      <classes-menu @selecionar="selecionarClasse"/>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                      density="compact"
                      variant="outlined"
                      label="NCM"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="forms.id_ncm"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                      readonly
                      placeholder="Selecione o NCM"
                  >
                    <template #append-inner>
                      <ncm-menu @selecionar="selecionarNcm"/>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                      density="compact"
                      variant="outlined"
                      label="Marca"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="descmarca"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                      readonly
                      placeholder="Selecione a marca"
                  >
                    <template #append-inner>
                      <marcas-menu @selecionar="selecionarMarca"/>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                      density="compact"
                      variant="outlined"
                      label="Garantia"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="descgarantia"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                      readonly
                      placeholder="Selecione a garantia"
                  >
                    <template #append-inner>
                      <garantia-menu @selecionar="selecionarGarantia"/>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                      density="compact"
                      variant="outlined"
                      label="Medida"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="descmedida"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                      readonly
                      placeholder="Selecione a medida"
                  >
                    <template #append-inner>
                      <medidas-menu @selecionar="selecionarMedida"/>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12" md="12">
                  <v-textarea
                      density="compact"
                      variant="outlined"
                      label="Descrição do Produto"
                      hide-details="auto"
                      :rules="validacao"
                      v-model="forms.observacao"
                      :theme="themeStore.darkMode ? 'dark' : 'light'"
                      rows="2"
                  />
                </v-col>

                <v-col cols="6" md="2">
                  <v-switch
                      hide-details="auto"
                      :label="`Utiliza Balança? ${forms.utiliza_balanca ? 'Sim' : 'Não'}`"
                      v-model="utiliza_balanca"
                      color="var(--text-color-laranja)"
                  />
                </v-col>
                <v-col cols="6" md="2">
                  <v-switch
                      hide-details="auto"
                      :label="`Utiliza Grade? ${forms.utiliza_grade ? 'Sim' : 'Não'}`"
                      v-model="utiliza_grade"
                      color="var(--text-color-laranja)"
                  />
                </v-col>
                <v-col cols="6" md="2">
                  <v-switch
                      hide-details="auto"
                      :label="`Utiliza N. Série? ${forms.utiliza_nrserie ? 'Sim' : 'Não'}`"
                      v-model="utiliza_nrserie"
                      color="var(--text-color-laranja)"
                  />
                </v-col>
                <v-col cols="6" md="2">
                  <v-switch
                      hide-details="auto"
                      :label="`Utiliza Lote? ${forms.utiliza_lote ? 'Sim' : 'Não'}`"
                      v-model="utiliza_lote"
                      color="var(--text-color-laranja)"
                  />
                </v-col>
                <v-col cols="6" md="2">
                  <v-switch
                      hide-details="auto"
                      :label="`Em Promoção? ${forms.em_promocao ? 'Sim' : 'Não'}`"
                      v-model="em_promocao"
                      color="var(--text-color-laranja)"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-tabs-window-item>

          <v-tabs-window-item value="preco">
            <v-card elevation="0" class="background-secondary mt-10">
              <v-card-text class="pa-4">
                <v-form ref="formRefPreco">
                  <v-row>
                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="Custo de Compra"
                          prefix="R$"
                          type="text"
                          inputmode="decimal"
                          hide-details="auto"
                          v-model="formsPreco.custo_compra"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="Custo Médio"
                          prefix="R$"
                          type="text"
                          inputmode="decimal"
                          hide-details="auto"
                          v-model="formsPreco.custo_medio"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="Custo de Aquisição"
                          prefix="R$"
                          type="text"
                          inputmode="decimal"
                          hide-details="auto"
                          v-model="formsPreco.custo_aquisicao"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="Margem Lucro Líquido"
                          suffix="%"
                          type="text"
                          inputmode="decimal"
                          hide-details="auto"
                          v-model="formsPreco.margem_lucro_liquido"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="Preço de Venda"
                          prefix="R$"
                          type="text"
                          inputmode="decimal"
                          hide-details="auto"
                          v-model="formsPreco.preco_venda"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="Preço de Venda Sugerido"
                          prefix="R$"
                          type="text"
                          inputmode="decimal"
                          hide-details="auto"
                          v-model="formsPreco.preco_venda_sugerido"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="Preço de Garantia"
                          prefix="R$"
                          type="text"
                          inputmode="decimal"
                          hide-details="auto"
                          v-model="formsPreco.preco_garantia"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="% Desconto"
                          suffix="%"
                          type="text"
                          inputmode="decimal"
                          hide-details="auto"
                          v-model="formsPreco.perc_desconto"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="Comissão (%)"
                          suffix="%"
                          type="text"
                          inputmode="decimal"
                          hide-details="auto"
                          v-model="formsPreco.comissao_perc"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="Comissão (R$)"
                          prefix="R$"
                          type="text"
                          inputmode="decimal"
                          hide-details="auto"
                          v-model="formsPreco.comissao_vlr"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="Quantidade Mínima"
                          type="number"
                          min="0"
                          hide-details="auto"
                          v-model="formsPreco.quantidade_minima"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-text-field
                          density="compact"
                          variant="outlined"
                          label="Fator"
                          type="number"
                          min="0"
                          hide-details="auto"
                          v-model="formsPreco.fator"
                          :theme="themeStore.darkMode ? 'dark' : 'light'"
                      />
                    </v-col>

                    <v-col cols="12" md="3" class="d-flex align-center">
                      <v-switch
                          hide-details="auto"
                          :label="`Permite Estoque Negativo? ${formsPreco.permite_estoque_negativo === 'S' ? 'Sim' : 'Não'}`"
                          v-model="permiteEstoqueNegativo"
                          color="var(--text-color-laranja)"
                      />
                    </v-col>
                  </v-row>

                  <div class="d-flex justify-end mt-6">
                    <v-btn
                        class="text-none text-white" color="var(--text-color-laranja)" variant="flat"
                        @click="salvarPreco" :loading="produtosStore.loading"
                        prepend-icon="mdi-content-save-outline"
                    >
                      Salvar Preço
                    </v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>

          <v-tabs-window-item value="tributo">
            <v-card elevation="0" class="background-secondary mt-10">
              <v-card-text class="pa-4">
                <botao-expand-transition
                    v-if="!exibirTributos"
                    :formulario-aberto="formularioAbertoTributo"
                    @toggle="toggleFormularioTributo"
                >
                  <template #default>{{ formularioAbertoTributo ? 'Cancelar' : 'Novo Tributo' }}</template>
                </botao-expand-transition>
              </v-card-text>

              <forms-expand-transition
                  :salvar-formulario="salvarFormularioTributo"
                  :cancelar-formulario="cancelarFormularioTributo"
                  :formulario-aberto="formularioAbertoTributo"
                  :editando="editandoTributo"
                  :loading="produtosStore.loading"
              >
                <template #form>
                  <v-form ref="formRefTributo">
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            label="Classificação Fiscal"
                            hide-details="auto"
                            v-model="formsTributo.classificacao_fiscal"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-select
                            density="compact"
                            variant="outlined"
                            label="Incidencia Fiscal"
                            item-title="label"
                            item-value="value"
                            :items="camposIncidenciaFiscal"
                            hide-details="auto"
                            v-model="formsTributo.incidenciafiscal"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-autocomplete
                            :readonly="formsTributo.incidenciafiscal !== '02'"
                            density="compact"
                            variant="outlined"
                            label="CEST"
                            hide-details="auto"
                            :items="cests"
                            item-title="descricao"
                            item-value="id"
                            v-model="formsTributo.id_cest"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            label="Margem Lucro Bruto"
                            v-mask-number suffix="%"
                            hide-details="auto"
                            v-model="formsTributo.margem_lucro_bruto"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            label="Margem Lucro CNAE"
                            v-mask-number suffix="%"
                            hide-details="auto"
                            v-model="formsTributo.margem_lucro_cnae"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-select
                            density="compact"
                            variant="outlined"
                            label="Fórmula de cálculo do tributo (substitui o cálculo percentual)"
                            clearable
                            :items="formulasDisponiveis"
                            item-title="descformula"
                            item-value="id"
                            hide-details="auto"
                            v-model="formsTributo.id_formula"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-autocomplete
                            density="compact"
                            variant="outlined"
                            label="Usar dados de uma Alíquota UF específica"
                            clearable
                            :items="aliquotasDisponiveis"
                            item-title="label"
                            :item-value="(item) => `${item.id_uf}|${item.id_cfop}`"
                            hide-details="auto"
                            v-model="aliquotaSelecionada"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>
                    </v-row>
                  </v-form>
                </template>
              </forms-expand-transition>

              <tabela-padrao
                  :formulario-aberto="formularioAbertoTributo"
                  :headers="headersTributo"
                  :items="tributos"
                  :loading="produtosStore.loading"
                  :search="search"
                  @update:search="(value) => search = value"
                  search-label="Pesquisar Items"
                  item-key="id_produto"
                  no-data-icon="mdi-database-off"
                  no-data-text="Nenhum item encontrado"

              >
                <template v-slot:[`item.acoes`]='{ item }'>
                  <v-btn
                      icon="mdi-pencil" size="small"
                      color="primary" variant="text"
                      @click="editarTributo(item)"
                  />

                  <v-btn
                      icon="mdi-delete" size="small"
                      color="error" variant="text"
                      @click="deletarTributo(item)"
                  />
                </template>
              </tabela-padrao>
            </v-card>
          </v-tabs-window-item>

          <v-tabs-window-item value="emb">
            <v-card elevation="0" class="background-secondary mt-10">
              <v-card-text class="pa-4">
                <botao-expand-transition
                    v-if="!exibirEmbalagens"
                    :formulario-aberto="formularioAberto"
                    @toggle="toggleFormulario"
                >
                  <template #default>{{ formularioAberto ? 'Cancelar' : 'Nova Embalagem' }}</template>
                </botao-expand-transition>
              </v-card-text>

              <forms-expand-transition
                  :salvar-formulario="salvarFormulario"
                  :cancelar-formulario="cancelarFormulario"
                  :formulario-aberto="formularioAberto"
                  :editando="editandoEmb"
                  :loading="produtosStore.loading"
              >
                <template #form>
                  <v-form ref="formRefEmbalagem">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            label="Descrição da Embalagem"
                            hide-details="auto"
                            :rules="validacao"
                            v-model="formsEmbalagem.descembalagem"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            label="Quantidade na Embalagem"
                            type="number"
                            min="0"
                            hide-details="auto"
                            :rules="validacao"
                            v-model="formsEmbalagem.qtd_embalagem"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>
                    </v-row>
                  </v-form>
                </template>
              </forms-expand-transition>

              <tabela-padrao
                  :formulario-aberto="formularioAberto"
                  :headers="headers"
                  :items="embalagens"
                  :loading="produtosStore.loading"
                  :search="search"
                  @update:search="(value) => search = value"
                  search-label="Pesquisar Items"
                  item-key="id"
                  no-data-icon="mdi-database-off"
                  no-data-text="Nenhum item encontrado"

              >
                <template v-slot:[`item.acoes`]='{ item }'>
                  <v-btn
                      icon="mdi-pencil" size="small"
                      color="primary" variant="text"
                      @click="editarEmb(item)"
                  />

                  <v-btn
                      icon="mdi-delete" size="small"
                      color="error" variant="text"
                      @click="deletarEmb(item)"
                  />
                </template>
              </tabela-padrao>
            </v-card>
          </v-tabs-window-item>

          <v-tabs-window-item value="for">
            <v-card elevation="0" class="background-secondary mt-10">
              <v-card-text class="pa-4">
                <botao-expand-transition
                    v-if="!exibirFornecedores"
                    :formulario-aberto="formularioAbertoFor"
                    @toggle="toggleFormularioFor"
                >
                  <template #default>{{ formularioAberto ? 'Cancelar' : 'Novo Fornecedor' }}</template>
                </botao-expand-transition>
              </v-card-text>

              <forms-expand-transition
                  :salvar-formulario="salvarFormularioFor"
                  :cancelar-formulario="cancelarFormularioFor"
                  :formulario-aberto="formularioAbertoFor"
                  :editando="editandoFor"
                  :loading="produtosStore.loading"
              >
                <template #form>
                  <v-form ref="formRefFornecedor">
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-autocomplete
                            density="compact"
                            variant="outlined"
                            label="Fornecedor"
                            item-value="id"
                            item-title="nome_razao"
                            hide-details="auto"
                            :rules="validacao"
                            :items="pessoa_for"
                            v-model="formsFornecedor.id_pessoa"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            type="number"
                            min="0"
                            label="Nota"
                            hide-details="auto"
                            :rules="validacao"
                            v-model="formsFornecedor.id_nota"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                            @input="Number(formsFornecedor.id_nota) "
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            min="0"
                            label="Série"
                            hide-details="auto"
                            :rules="validacao"
                            v-model="formsFornecedor.id_serie"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>

                      <v-col cols="12" md="4">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            label="Data Última Compra"
                            type="date"
                            hide-details="auto"
                            :rules="validacao"
                            v-model="formsFornecedor.dtultima_compra"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            type="number"
                            min="0"
                            label="Qtd. Última Compra"
                            hide-details="auto"
                            :rules="validacao"
                            v-model="formsFornecedor.qtde_ultima_compra"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            type="number"
                            min="0"
                            label="Custo Última Compra"
                            hide-details="auto"
                            :rules="validacao"
                            v-model="formsFornecedor.custo_ultima_compra"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>
                    </v-row>
                  </v-form>
                </template>
              </forms-expand-transition>

              <tabela-padrao
                  :formulario-aberto="formularioAbertoFor"
                  :headers="headersFor"
                  :items="fornecedores"
                  :loading="produtosStore.loading"
                  :search="search"
                  @update:search="(value) => search = value"
                  search-label="Pesquisar Items"
                  item-key="id_pessoa"
                  no-data-icon="mdi-database-off"
                  no-data-text="Nenhum item encontrado"

              >
                <template v-slot:[`item.dtultima_compra`]="{ item }">
                  {{ formatarData(item.dtultima_compra) }}
                </template>

                <template v-slot:[`item.custo_ultima_compra`]="{ item }">
                  {{ formatarParaReal(item.custo_ultima_compra) }}
                </template>

                <template v-slot:[`item.id_pessoa`]="{ item }">
                  {{ buscarPessoa(item.id_pessoa)?.nome_razao || 'Fornecedor não encontrado' }}
                </template>

                <template v-slot:[`item.acoes`]='{ item }'>
                  <v-btn
                      icon="mdi-pencil" size="small"
                      color="primary" variant="text"
                      @click="editarFor(item)"
                  />
                </template>
              </tabela-padrao>
            </v-card>
          </v-tabs-window-item>

          <v-tabs-window-item value="sim">
            <v-card elevation="0" class="background-secondary mt-10">
              <v-card-text class="pa-4">
                <botao-expand-transition
                    v-if="!exibirSimilares"
                    :formulario-aberto="formularioAbertoSimilar"
                    @toggle="toggleFormularioSimilar"
                >
                  <template #default>{{ formularioAbertoSimilar ? 'Cancelar' : 'Novo Produto Similar' }}</template>
                </botao-expand-transition>
              </v-card-text>

              <forms-expand-transition
                  :salvar-formulario="salvarFormularioSimilar"
                  :cancelar-formulario="cancelarFormularioSimilar"
                  :formulario-aberto="formularioAbertoSimilar"
                  :editando="editandoSimilar"
                  :loading="produtosStore.loading"
              >
                <template #form>
                  <v-form ref="formRefSimilar">
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            type="number"
                            min="0"
                            label="ID Similar"
                            hide-details="auto"
                            v-model.number="formsSimilar.id_similar"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                            :readonly="editandoSimilar"
                        />
                      </v-col>

                      <v-col cols="12" md="8">
                        <v-text-field
                            density="compact"
                            variant="outlined"
                            label="Descrição do Produto Similar"
                            hide-details="auto"
                            :rules="validacao"
                            v-model="formsSimilar.descproduto"
                            :theme="themeStore.darkMode ? 'dark' : 'light'"
                        />
                      </v-col>
                    </v-row>
                  </v-form>
                </template>
              </forms-expand-transition>

              <tabela-padrao
                  :formulario-aberto="formularioAbertoSimilar"
                  :headers="headersSimilar"
                  :items="similares"
                  :loading="produtosStore.loading"
                  :search="search"
                  @update:search="(value) => search = value"
                  search-label="Pesquisar Produtos"
                  item-key="id"
                  no-data-icon="mdi-database-off"
                  no-data-text="Nenhum produto similar encontrado"
              >
                <template v-slot:[`item.acoes`]="{ item }">
                  <v-btn
                      icon="mdi-pencil"
                      size="small"
                      color="primary"
                      variant="text"
                      @click="editarSimilar(item)"
                  />

                  <v-btn
                      icon="mdi-delete" size="small"
                      color="error" variant="text"
                      @click="deletarSimilar(item)"
                  />
                </template>
              </tabela-padrao>
            </v-card>
          </v-tabs-window-item>

          <v-tabs-window-item value="img">
            <v-card elevation="0" class="background-secondary mt-10">
              <v-card-text class="pa-4">

                <div class="upload-produto-box">
                  <div class="d-flex justify-end ga-3 mt-4">
                    <v-btn
                        variant="flat"
                        color="var(--text-color-laranja)"
                        prepend-icon="mdi-cloud-upload"
                        class="text-none text-white"
                        :loading="loadingUploadFoto"
                        @click="uploadFotoProduto"
                        :disabled="!fotoProduto"
                    >
                      Salvar foto
                    </v-btn>

                    <v-btn
                        variant="tonal"
                        color="error"
                        class="text-none"
                        prepend-icon="mdi-delete"
                        :disabled="!form.foto_key && !previewImagem"
                        @click="removerFotoProduto"
                    >
                      Apagar Foto
                    </v-btn>
                  </div>

                  <v-file-input
                      v-model="fotoProduto"
                      label="Foto do produto"
                      accept="image/*"
                      prepend-icon="mdi-camera"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      class="mt-4"
                  />

                  <div class="preview-produto mt-4">
                    <v-img
                        v-if="previewImagem || form.foto_url"
                        :src="previewImagem || form.foto_url"
                        height="300px"
                        class="rounded-lg"
                    />

                    <div v-else class="preview-placeholder">
                      <v-icon size="60">mdi-image-plus</v-icon>
                      <p>Nenhuma foto selecionada</p>
                    </div>
                  </div>

                  <v-divider class="my-6" />

                  <div class="d-flex align-center justify-space-between mb-4">
                    <h3 class="text-subtitle-1 font-weight-bold">
                      Fotos salvas
                    </h3>

                    <v-btn
                        size="small"
                        variant="tonal"
                        prepend-icon="mdi-refresh"
                        :loading="loadingFotos"
                        @click="carregarFotosR2"
                    >
                      Buscar todas as fotos
                    </v-btn>
                  </div>

                  <v-progress-linear
                      v-if="loadingFotos"
                      indeterminate
                      class="mb-4"
                  />

                  <v-row v-if="!loadingFotos && fotosR2.length > 0">
                    <v-col
                        v-for="foto in fotosR2"
                        :key="foto.id"
                        cols="12"
                        sm="6"
                        md="4"
                        lg="3"
                    >
                      <v-card
                          class="foto-r2-card"
                          elevation="2"
                          @click="selecionarFotoR2(foto)"
                      >
                        <v-img
                            :src="foto.url"
                            height="150"
                            cover
                        >
                          <v-btn
                              icon="mdi-delete"
                              size="small"
                              color="error"
                              variant="flat"
                              class="ma-2"
                              @click.stop="excluirFotoSalva(foto.id)"
                          />
                        </v-img>

                        <v-card-text class="pa-3">
                          <div class="text-caption text-truncate">
                            {{ foto.nome }}
                          </div>

                          <v-btn
                              block
                              size="small"
                              class="mt-3 text-none"
                              color="primary"
                              variant="tonal"
                              @click.stop="selecionarFotoR2(foto)"
                          >
                            Usar essa foto
                          </v-btn>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>

                  <v-alert
                      v-if="!loadingFotos && fotosR2.length === 0"
                      type="info"
                      variant="tonal"
                      class="mt-4"
                  >
                    Nenhuma foto encontrada.
                  </v-alert>
                </div>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>

          <!-- ABA GRADE -->
          <v-tabs-window-item value="grade">
            <v-card elevation="0" class="background-secondary mt-10">
              <v-card-text class="pa-4">
                <div v-if="loadingGradeMatriz" class="d-flex justify-center py-8">
                  <v-progress-circular indeterminate color="var(--text-color-laranja)" />
                </div>

                <template v-else>
                  <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-3">
                    <v-autocomplete
                        density="compact"
                        variant="outlined"
                        label="Localização"
                        item-title="descricao"
                        item-value="id"
                        :items="locais"
                        v-model="gradeLocalizacao"
                        hide-details="auto"
                        style="max-width: 320px;"
                    />

                    <v-btn
                        class="text-none text-white"
                        color="var(--text-color-laranja)"
                        variant="flat"
                        prepend-icon="mdi-content-save-outline"
                        size="small"
                        :loading="salvandoGradeMatriz"
                        @click="salvarGradeMatriz"
                    >
                      Salvar Alterações
                    </v-btn>
                  </div>

                  <v-sheet class="grade-erp" rounded="lg" border>
                    <div class="grade-erp__top mb-6">
                      <div>
                        <div class="text-subtitle-1 font-weight-medium">Grade de Cores x Tamanhos</div>
                        <div class="text-caption opacity-70">Adicione cores e tamanhos e informe as quantidades.</div>
                      </div>

                      <v-chip size="small" variant="flat" color="var(--text-color-laranja)" class="text-white">
                        Combinações: {{ totalCombinacoes }}
                      </v-chip>
                    </div>

                    <div class="grade-erp__body">
                      <!-- CORES (esquerda) -->
                      <div class="grade-erp__left">
                        <div class="h-[44px] mb-1" />

                        <div class="grade-erp__left-title">
                          <span class="text-caption font-weight-medium">CORES</span>
                        </div>

                        <div class="grade-erp__left-list">
                          <div
                              v-for="corId in matrizGrade.cores"
                              :key="corId"
                              class="grade-erp__left-item"
                          >
                            <div class="d-flex align-center gap-2">
                              <span class="cor-dot" :style="{ background: getCor(corId)?.cor_hexa || '#999' }" />
                              <span class="text-body-2 font-weight-medium">{{ getCor(corId)?.descricao || `Cor ${corId}` }}</span>
                            </div>

                            <v-btn
                                icon="mdi-close"
                                size="x-small"
                                variant="text"
                                @click="removeCor(corId)"
                            />
                          </div>
                        </div>

                        <div class="grade-erp__left-add">
                          <v-select
                              density="compact"
                              variant="outlined"
                              placeholder="Selecione"
                              :items="coresDisponiveis"
                              item-title="descricao"
                              item-value="id"
                              v-model="selectCor"
                              hide-details
                          >
                            <template #selection="{ item }">
                              <div class="d-flex align-center gap-2">
                                <span class="cor-dot" :style="{ background: item.raw?.cor_hexa || '#999' }" />
                                <span>{{ item.raw?.descricao }}</span>
                              </div>
                            </template>

                            <template #item="{ props, item }">
                              <v-list-item v-bind="props">
                                <template #prepend>
                                  <span class="cor-dot" :style="{ background: item.raw?.cor_hexa || '#999' }" />
                                </template>
                              </v-list-item>
                            </template>

                            <template #append-item>
                              <v-divider class="my-2" />
                              <div class="px-3 pb-2">
                                <v-btn
                                    block
                                    variant="tonal"
                                    color="var(--text-color-laranja)"
                                    prepend-icon="mdi-plus"
                                    @click="abrirModalNovaCor"
                                >
                                  Adicionar Cor
                                </v-btn>
                              </div>
                            </template>
                          </v-select>

                          <v-btn
                              class="grade-erp__btn-plus"
                              icon="mdi-plus"
                              variant="tonal"
                              size="small"
                              :disabled="selectCor === null || selectCor === '' || selectCor === undefined"
                              @click="addCor"
                          />
                        </div>
                      </div>

                      <!-- TAMANHOS + GRID (direita) -->
                      <div class="grade-erp__right">
                        <div class="grade-erp__right-header mb-3">
                          <span class="text-caption font-weight-medium" style="color: var(--text-color-laranja);">TAMANHOS</span>
                          <v-select
                              density="compact"
                              variant="outlined"
                              placeholder="Filtrar por tipo"
                              :items="tiposTamanhoLista"
                              item-title="title"
                              item-value="value"
                              v-model="filtroTipoTamanho"
                              hide-details
                              clearable
                              multiple
                              chips
                              closable-chips
                              class="grade-erp__filtro-tipo"
                              style="max-width: 260px;"
                          />
                        </div>

                        <div
                            class="grade-erp__sizes"
                            :style="{ gridTemplateColumns: `repeat(${Math.max(matrizGrade.tamanhos.length, 1)}, 120px) 240px` }"
                        >
                          <div
                              v-for="tam in matrizGrade.tamanhos"
                              :key="tam.id"
                              class="grade-erp__size-cell"
                          >
                            <span>{{ tam.descricao }}</span>
                            <div class="d-flex">
                              <v-btn
                                  icon="mdi-pencil"
                                  size="x-small"
                                  variant="text"
                                  @click="editarTamanho(tam)"
                              />
                              <v-btn
                                  icon="mdi-delete"
                                  size="x-small"
                                  variant="text"
                                  color="error"
                                  @click="excluirTamanho(tam)"
                              />
                              <v-btn
                                  icon="mdi-close"
                                  size="x-small"
                                  variant="text"
                                  @click="removeTamanho(tam.id)"
                              />
                            </div>
                          </div>

                          <div class="grade-erp__size-add">
                            <v-select
                                density="compact"
                                variant="outlined"
                                placeholder="Selecione um tamanho"
                                :items="tamanhosNaoAdicionados"
                                item-title="descricao"
                                item-value="id"
                                v-model="selectTamanho"
                                hide-details
                            />
                            <v-btn
                                class="grade-erp__btn-plus"
                                icon="mdi-plus"
                                size="small"
                                variant="tonal"
                                :disabled="!selectTamanho"
                                @click="addTamanho"
                            />
                          </div>
                        </div>

                        <div class="grade-erp__grid-wrap">
                          <div
                              class="grade-erp__grid"
                              :style="{ gridTemplateColumns: `repeat(${matrizGrade.tamanhos.length}, 120px)` }"
                          >
                            <template v-for="corId in matrizGrade.cores" :key="corId">
                              <div
                                  v-for="tam in matrizGrade.tamanhos"
                                  :key="`${corId}-${tam.id}`"
                                  class="grade-erp__cell"
                              >
                                <v-text-field
                                    density="compact"
                                    variant="outlined"
                                    type="number"
                                    min="0"
                                    hide-details
                                    class="grade-erp__input mt-3"
                                    v-model.number="matrizGrade.qtd[Number(corId)][tam.id]"
                                />
                              </div>
                            </template>
                          </div>
                        </div>

                        <v-alert
                            v-if="matrizGrade.cores.length === 0 || matrizGrade.tamanhos.length === 0"
                            type="info"
                            variant="tonal"
                            density="compact"
                            class="mt-3"
                        >
                          Adicione pelo menos <b>1 cor</b> e <b>1 tamanho</b> para liberar a grade.
                        </v-alert>
                      </div>
                    </div>
                  </v-sheet>

                  <v-divider class="my-6" />

                  <div class="text-subtitle-1 font-weight-medium mb-3">Produtos da Grade</div>

                  <tabela-padrao
                      :headers="headersGradeLista"
                      :items="gradeListaAtual"
                      :loading="loadingGradeMatriz"
                      :search="search"
                      @update:search="(value) => (search = value)"
                      search-label="Pesquisar na grade"
                      item-key="id"
                      no-data-icon="mdi-view-grid-outline"
                      no-data-text="Nenhuma cor/tamanho adicionado ainda"
                  >
                    <template v-slot:[`item.desccor`]="{ item }">
                      <div class="d-flex align-center">
                        <span class="cor-dot" :style="{ background: item.cor_hexa }" />
                        <span>{{ item.desccor }}</span>
                      </div>
                    </template>
                  </tabela-padrao>
                </template>
              </v-card-text>
            </v-card>

            <!-- CADASTRAR / EDITAR COR -->
            <cadastrar-modal
                v-model:cadastrar-modal="modalNovaCor"
                :clear-input="resetNovaCor"
                :cadastrarcidade="salvarOuEditarCor"
                :width="450"
                :loading="produtosStore.loading"
                :titulo-acao="modoCor === 'edit' ? 'Editar' : 'Cadastrar'"
                :texto-botao="modoCor === 'edit' ? 'Salvar alterações' : 'Cadastrar'"
                :icone-botao="modoCor === 'edit' ? 'mdi-content-save-outline' : 'mdi-plus-circle-outline'"
            >
              <template #titulo>Cor</template>

              <template #textfields>
                <v-row dense class="px-4 py-5">
                  <v-col cols="12" class="mb-2">
                    <v-text-field
                        density="compact"
                        variant="outlined"
                        label="Descrição"
                        v-model="novaCor.descricao"
                        placeholder="Ex: AMARELO"
                        hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                        density="compact"
                        variant="outlined"
                        label="Cor Denatran"
                        :items="coresDenatran"
                        item-title="title"
                        item-value="value"
                        v-model="novaCor.id_cor_denatran"
                        hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                        density="compact"
                        variant="outlined"
                        label="Cor HEX"
                        v-model="novaCor.cor_hexa"
                        placeholder="#FFFF00"
                        hide-details="auto"
                    >
                      <template #append-inner>
                    <span
                        class="cor-dot"
                        :style="{ background: novaCor.cor_hexa || '#999' }"
                    />
                      </template>
                    </v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-color-picker
                        width="100%"
                        class="mt-2"
                        v-model="novaCor.cor_hexa"
                        hide-inputs
                        elevation="0"
                    />
                  </v-col>
                </v-row>
              </template>
            </cadastrar-modal>

            <!-- CADASTRAR / EDITAR TAMANHO -->
            <cadastrar-modal
                v-model:cadastrar-modal="modalNovoTamanho"
                :clear-input="resetNovoTamanho"
                :cadastrarcidade="salvarOuEditarTamanho"
                :width="400"
                :loading="estoqueStore.loading"
                :titulo-acao="modoTamanho === 'edit' ? 'Editar' : 'Cadastrar'"
                :texto-botao="modoTamanho === 'edit' ? 'Salvar alterações' : 'Cadastrar'"
                :icone-botao="modoTamanho === 'edit' ? 'mdi-content-save-outline' : 'mdi-plus-circle-outline'"
            >
              <template #titulo>Tamanho</template>

              <template #textfields>
                <v-row dense class="px-4 py-5">
                  <v-col cols="12">
                    <v-text-field
                        density="compact"
                        variant="outlined"
                        label="Descrição *"
                        v-model="novoTamanhoForm.descricao"
                        placeholder="Ex: P, M, G, 38, 42"
                        maxlength="30"
                        counter="30"
                        hide-details="auto"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                        density="compact"
                        variant="outlined"
                        label="Tipo"
                        :items="tiposTamanho"
                        item-title="title"
                        item-value="value"
                        v-model="novoTamanhoForm.tipo"
                        hide-details="auto"
                        clearable
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                        density="compact"
                        variant="outlined"
                        label="Ordem"
                        v-model.number="novoTamanhoForm.ordem"
                        type="number"
                        min="0"
                        hide-details="auto"
                    />
                  </v-col>
                </v-row>
              </template>
            </cadastrar-modal>

            <!-- EXCLUIR TAMANHO -->
            <excluir-modal
                v-model:modal-excluir="modalExcluirTamanho"
                :cancelar="cancelarExclusaoTamanho"
                :deletar="confirmarExclusaoTamanho"
                :loading="estoqueStore.loading"
            >
              <template #item>{{ tamanhoExcluir?.descricao }}</template>
            </excluir-modal>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-sheet>

      <!-- DELETAR PRODUTO -->
      <excluir-modal
          :cancelar="() => openModalDelete = false"
          :deletar="excluirProduto"
          :loading="produtosStore.loading"
          v-model:modal-excluir="openModalDelete"
      >
        <template #item>{{ forms.descproduto }}</template>
      </excluir-modal>

      <!-- DELETAR EMBALAGEM -->
      <excluir-modal
          :cancelar="() => openModalDeleteEmb = false"
          :deletar="excluirEmbalagem"
          :loading="produtosStore.loading"
          v-model:modal-excluir="openModalDeleteEmb"
      >
        <template #item>{{ itemSelecionado?.descembalagem }}</template>
      </excluir-modal>

      <!-- DELETAR SIMILAR -->
      <excluir-modal
          :cancelar="() => openModalDeleteSimilar = false"
          :deletar="excluirSimilar"
          :loading="produtosStore.loading"
          v-model:modal-excluir="openModalDeleteSimilar"
      >
        <template #item>{{ itemSelecionadoSimilar?.descproduto }}</template>
      </excluir-modal>

      <!-- DELETAR TRIBUTO -->
      <excluir-modal
          :cancelar="() => openModalDeleteTributo = false"
          :deletar="excluirTributo"
          :loading="produtosStore.loading"
          v-model:modal-excluir="openModalDeleteTributo"
      >
        <template #item>Tributo do produto</template>
      </excluir-modal>
    </template>
  </top-all-pages>
</template>

<script setup>
import {useRoute, useRouter} from "vue-router";
import TopAllPages from "@/components/base/padrao-paginas/TopAllPages.vue";
import {useProdutosStore} from "@/stores/APIs/produtos";
import {useEstoqueStore} from "@/stores/APIs/estoque";
import {useThemeStore} from "@/stores/config-temas/theme";
import {usePessoasStore} from "@/stores/APIs/pessoas";
import {useFormulasStore} from "@/stores/APIs/formulas";
import {computed, reactive, ref, watchEffect, watch} from "vue";
import GruposMenu from "@/components/base/menu/GruposMenu.vue";
import ClassesMenu from "@/components/base/menu/ClassesMenu.vue";
import NcmMenu from "@/components/base/menu/NcmMenu.vue";
import MedidasMenu from "@/components/base/menu/MedidasMenu.vue";
import MarcasMenu from "@/components/base/menu/MarcasMenu.vue";
import GarantiaMenu from "@/components/base/menu/GarantiaMenu.vue";
import ExcluirModal from "@/components/base/modais/ExcluirModal.vue";
import BotaoExpandTransition from "@/components/base/padrao-paginas/BotaoExpandTransition.vue";
import FormsExpandTransition from "@/components/base/padrao-paginas/FormsExpandTransition.vue";
import TabelaPadrao from "@/components/base/padrao-paginas/TabelaPadrao.vue";
import { toast } from "vue3-toastify";

const route = useRoute();
const router = useRouter();
const produtosStore = useProdutosStore();
const estoqueStore = useEstoqueStore();
const themeStore = useThemeStore();
const pessoasStore = usePessoasStore();
const formulasStore = useFormulasStore();

const id = route.params.id;
const idEmpresa = JSON.parse(localStorage.getItem('empresaSelecionada'));

// STATE
const openModalDelete = ref(false);
const tab = ref('one');
const validacao = [(v) => !!v || 'Campo obrigatório'];
const forms = computed(() => produtosStore.produto || {});

// const loading = computed(() => produtosStore.loading);
const descgrupo = computed(() => {
  const grupo = estoqueStore.grupos.find(g => g.id === forms.value?.id_grupo);
  return grupo ? grupo.descgrupo : '';
});


const subgrupos = computed(() => estoqueStore.subgrupos);

const descclasse = computed(() => {
  const classe = estoqueStore.classes.find(c => c.id === forms.value.id_classe);
  return classe ? classe.descclasse : '';
});

const descmarca = computed(() => {
  const marca = produtosStore.marcas.find(m => m.id === forms.value.id_marca);
  return marca ? marca.descmarca : '';
});

const descgarantia = computed(() => {
  const garantia = produtosStore.garantias.find(g => g.id === forms.value.id_garantia);
  return garantia ? garantia.descgarantia : '';
});

const descmedida = computed(() => {
  const medida = produtosStore.medidas.find(m => m.id === forms.value.id_medida);
  return medida ? medida.descmedida : '';
});

const utiliza_balanca = computed({
  get: () => forms.value.utiliza_balanca === 'S',
  set: (val) => {
    forms.value.utiliza_balanca = val ? 'S' : 'N';
  }
});

const utiliza_grade = computed({
  get: () => forms.value.utiliza_grade === 'S',
  set: (val) => {
    forms.value.utiliza_grade = val ? 'S' : 'N';
  }
});

const utiliza_nrserie = computed({
  get: () => forms.value.utiliza_nrserie === 'S',
  set: (val) => {
    forms.value.utiliza_nrserie = val ? 'S' : 'N';
  }
});

const utiliza_lote = computed({
  get: () => forms.value.utiliza_lote === 'S',
  set: (val) => {
    forms.value.utiliza_lote = val ? 'S' : 'N';
  }
});

const em_promocao = computed({
  get: () => forms.value.em_promocao === 'S',
  set: (val) => {
    forms.value.em_promocao = val ? 'S' : 'N';
  }
});

/**
 * SELECIONAR NCM
 */

const selecionarNcm = (ncmSelecionado) => {
  forms.value.id_ncm = ncmSelecionado.id;
  console.log("NCM Selecionado: ", ncmSelecionado);
}

/**
 * SELECIONAR GRUPO
 */

const selecionarGrupo = async (grupoSelecionado) => {
  forms.value.id_grupo = grupoSelecionado.id;
  descgrupo.value = grupoSelecionado.descgrupo;
  await buscarSubgrupos(grupoSelecionado.id);
};

/**
 * SELECIONAR CLASSE
 */

const selecionarClasse = (classeSelecionada) => {
  forms.value.id_classe = classeSelecionada.id;
  descclasse.value = classeSelecionada.descclasse;
};

/**
 * SELECIONAR MARCA
 */

const selecionarMarca = (itemSelecionado) => {
  forms.value.id_marca = itemSelecionado.id;
  descmarca.value = itemSelecionado.descmarca;
};

/**
 * SELECIONAR GARANTIA
 */

const selecionarGarantia = (itemSelecionado) => {
  forms.value.id_garantia = itemSelecionado.id;
  descgarantia.value = itemSelecionado.descgarantia;
};

/**
 * SELECIONAR MEDIDA
 */

const selecionarMedida = (itemSelecionado) => {
  forms.value.id_medida = itemSelecionado.id;
  descmedida.value = itemSelecionado.descmedida;
};

const buscarSubgrupos = async (id_grupo) => {
  await estoqueStore.buscarTodosSubgrupos(id_grupo);
}

/**
 * EXCLUIR PRODUTO
 */

const excluirProduto = async () => {
  await produtosStore.deletarProduto(id);

  if (produtosStore.errorMessage) {
    toast.error(produtosStore.errorMessage);
    return;
  }

  openModalDelete.value = false;
  toast.success('Produto excluído com sucesso!');
  router.push('/paginas/produtos');
};

/**
 * ATUALIZAR PRODUTO
 */

const atualizarProduto = async () => {
  forms.value.ativo = 'S';

  await produtosStore.atualizarProduto(id, forms.value);

  if (produtosStore.errorMessage) {
    toast.error(produtosStore.errorMessage);
    return;
  }

  toast.success("Produto atualizado com sucesso!");
};

/** ================== EMBALAGENS ================== **/

const embalagens = computed(() => produtosStore.embalagens || []);

// abrindo o formulário de nova embalagem

const formularioAberto = ref(false);
const exibirEmbalagens = ref(false);
const editandoEmb = ref(false);
const itemSelecionado = ref(null);

const toggleFormulario = () => {
  formularioAberto.value = !formularioAberto.value;
  if (editandoEmb.value) cancelarFormulario()
};

// formulário de embalagem

const formRefEmbalagem = ref(null);
const formsEmbalagem = reactive({
  id_produto: id,
  qtd_embalagem: null,
  descembalagem: '',
});

const cancelarFormulario = () => {
  formularioAberto.value = false;
  formRefEmbalagem.value.reset();
  editandoEmb.value = false;
};

// dados da tabela de embalagens
const search = ref('');
const headers = [
  {title: 'ID', key: 'id'},
  {title: 'Descrição da Embalagem', key: 'descembalagem'},
  {title: 'Quantidade', key: 'qtd_embalagem'},
  {title: 'Ativo', key: 'ativo'},
  {title: 'Ações', key: 'acoes', sortable: false},
];

/**
 * EDITANDO EMBALAGEM
 */

const editarEmb = (item) => {
  itemSelecionado.value = item;
  Object.assign(formsEmbalagem, item)
  editandoEmb.value = true;
  formularioAberto.value = true;
};

/**
 * DELETAR EMBALAGEM
 */

const openModalDeleteEmb = ref(false);
const deletarEmb = (item) => {
  itemSelecionado.value = item;
  openModalDeleteEmb.value = true;
};

const excluirEmbalagem = async () => {
  await produtosStore.deletarEmbalagem(id, itemSelecionado.value.id);
  openModalDeleteEmb.value = false;
};

/**
 * SALVAR EMBALAGEM
 */

const salvarFormulario = async () => {
  if (formRefEmbalagem.value && !(await formRefEmbalagem.value.validate())) {
    return;
  }

  if (editandoEmb.value) {
    await produtosStore.atualizarEmbalagem(id, itemSelecionado.value.id, formsEmbalagem);
  } else {
    await produtosStore.cadastrarEmbalagem(formsEmbalagem, id);
  }

  cancelarFormulario();
};


/** ================= FORNECEDOR ================ **/

// abrindo o formulário de novo fornecedor

const formularioAbertoFor = ref(false);
const exibirFornecedores = ref(false);
const editandoFor = ref(false);

const toggleFormularioFor = () => {
  formularioAbertoFor.value = !formularioAbertoFor.value;
  if (editandoFor.value) cancelarFormularioFor()
};

// formulário de fornecedor

const formRefFornecedor = ref(null);
const formsFornecedor = reactive({
  id_produto: id,
  id_pessoa: null,
  id_nota: null,
  id_serie: null,
  dtultima_compra: null,
  qtde_ultima_compra: null,
  custo_ultima_compra: null,
});

const cancelarFormularioFor = () => {
  formularioAbertoFor.value = false;
  formRefFornecedor.value.reset();
  editandoFor.value = false;
};

// dados da tabela de fornecedores
const fornecedores = computed(() => produtosStore.fornecedores || []);

const pessoa_for = computed(() => {
  return pessoasStore.pessoas.filter(p => p.tipo_pessoa === 'F');
});

const buscarPessoa = (id) => {
  return pessoasStore.pessoas.find(p => p.id === id);
};

const headersFor = [
  {title: 'ID', key: 'id_pessoa_display', value: (item) => item.id_pessoa},
  {title: 'Nome do Fornecedor', key: 'id_pessoa'},
  {title: 'Nota', key: 'id_nota'},
  {title: 'Data última compra', key: 'dtultima_compra'},
  {title: 'Qtd. última compra', key: 'qtde_ultima_compra'},
  {title: 'Custo última compra', key: 'custo_ultima_compra'},
  {title: 'Ações', key: 'acoes', sortable: false},
];

/**
 * EDITANDO FORNECEDOR
 */

const itemSelecionadoFor = ref(null);

const editarFor = (item) => {
  itemSelecionadoFor.value = item;
  Object.assign(formsFornecedor, item, {
    dtultima_compra: item.dtultima_compra ? item.dtultima_compra.slice(0, 10) : null,
  });
  editandoFor.value = true;
  formularioAbertoFor.value = true;
};

/**
 * SALVAR FORNECEDOR
 */

const salvarFormularioFor = async () => {
  if (formRefFornecedor.value && !(await formRefFornecedor.value.validate())) {
    return;
  }

  if (editandoFor.value) {
    await produtosStore.atualizarFornecedor(id, itemSelecionadoFor.value.id_pessoa, formsFornecedor);
  } else {
    await produtosStore.cadastrarFornecedor(formsFornecedor, id);
  }

  cancelarFormularioFor();
};


/** ================ PRODUTOS SIMILARES ================ **/

// abrindo o formulário de novo produto similar

const formularioAbertoSimilar = ref(false);
const exibirSimilares = ref(false);
const editandoSimilar = ref(false);

const toggleFormularioSimilar = () => {
  formularioAbertoSimilar.value = !formularioAbertoSimilar.value;
  if (editandoSimilar.value) cancelarFormularioSimilar()
};

// formulário de produto similar

const formRefSimilar = ref(null);

const formsSimilar = reactive({
  id_produto: Number(id),
  id_similar: null,
  descproduto: '',
  ativo: 'S'
});

const cancelarFormularioSimilar = () => {
  formularioAbertoSimilar.value = false;
  formRefSimilar.value.reset();
  editandoSimilar.value = false;
};

// dados da tabela de produtos similares

const similares = computed(() => produtosStore.similar || []);

const headersSimilar = [
  {title: 'ID', key: 'id_similar'},
  {title: 'Descrição do Produto Similar', key: 'descproduto'},
  {title: 'Ativo', key: 'ativo'},
  {title: 'Ações', key: 'acoes', sortable: false},
];

/**
 * EDITANDO PRODUTO SIMILAR
 */

const itemSelecionadoSimilar = ref(null);
const editarSimilar = (item) => {
  itemSelecionadoSimilar.value = item;
  Object.assign(formsSimilar, item)
  editandoSimilar.value = true;
  formularioAbertoSimilar.value = true;
};

/**
 * DELETAR PRODUTO SIMILAR
 */

const openModalDeleteSimilar = ref(false);
const deletarSimilar = (item) => {
  itemSelecionadoSimilar.value = item;
  openModalDeleteSimilar.value = true;
};

const excluirSimilar = async () => {
  await produtosStore.deletarProdutoSimilar(id, itemSelecionadoSimilar.value.id_similar);
  openModalDeleteSimilar.value = false;
};

/**
 * SALVAR PRODUTO SIMILAR
 */

const salvarFormularioSimilar = async () => {
  if (formRefSimilar.value && !(await formRefSimilar.value.validate())) {
    return;
  }

  if (editandoSimilar.value) {
    await produtosStore.atualizarProdutoSimilar(id, itemSelecionadoSimilar.value.id_similar, formsSimilar);
  } else {
    await produtosStore.cadastrarProdutoSimilar(formsSimilar, id);
  }

  cancelarFormularioSimilar();
};

/** ================ GRADE (MATRIZ) ================ **/
// Mesmo construtor de grade (cores x tamanhos) da tela "Grade de Produtos",
// pré-carregado com a grade já salva deste produto para permitir alteração.

const cores = computed(() => produtosStore.cores || []);
const locais = computed(() => produtosStore.localizacoes || []);
const tamanhosDisponiveis = computed(() => estoqueStore.tamanhos || []);

const gradeMatriz = computed(() => produtosStore.gradeMatriz);
const loadingGradeMatriz = ref(false);
const salvandoGradeMatriz = ref(false);
const gradeLocalizacao = ref(null);

const matrizGrade = reactive({
  cores: [],      // array de ids de cor
  tamanhos: [],   // array de objetos { id, origem, descricao }
  qtd: {},        // { [idCor]: { [tamanhoId]: number } }
});

const selectCor = ref(null);
const selectTamanho = ref(null);
const filtroTipoTamanho = ref(null);

const tiposTamanhoLista = [
  { title: 'Vestuário BR', value: 'vestuario_br' },
  { title: 'Vestuário Inglês', value: 'vestuario_ingles' },
  { title: 'Numérico', value: 'numerico' },
  { title: 'Idade', value: 'idade' },
];

const coresDisponiveis = computed(() => cores.value.filter(c => !matrizGrade.cores.includes(Number(c.id))));

const tamanhosNaoAdicionados = computed(() => {
  const idsExistentes = matrizGrade.tamanhos.map(t => t.id);
  return tamanhosDisponiveis.value.filter(t => {
    if (idsExistentes.includes(t.id)) return false;
    if (filtroTipoTamanho.value && filtroTipoTamanho.value.length > 0) {
      if (!filtroTipoTamanho.value.includes(t.tipo)) return false;
    }
    return true;
  });
});

function ensureCell(corId, tamanhoId) {
  const cid = Number(corId);
  const tid = Number(tamanhoId);
  if (!matrizGrade.qtd[cid]) matrizGrade.qtd[cid] = {};
  if (matrizGrade.qtd[cid][tid] === undefined) matrizGrade.qtd[cid][tid] = 0;
}

function ensureMatrix() {
  if (!matrizGrade.cores.length || !matrizGrade.tamanhos.length) return;
  matrizGrade.cores.forEach((corId) => {
    matrizGrade.tamanhos.forEach((tam) => ensureCell(corId, tam.id));
  });
}

function addCor() {
  if (selectCor.value === null || selectCor.value === undefined || selectCor.value === "") return;

  const corId = Number(selectCor.value);
  if (Number.isNaN(corId) || matrizGrade.cores.includes(corId)) return;

  matrizGrade.cores.push(corId);
  selectCor.value = null;
  ensureMatrix();
}

function removeCor(corId) {
  const cid = Number(corId);
  matrizGrade.cores = matrizGrade.cores.filter((id) => Number(id) !== cid);
  delete matrizGrade.qtd[cid];
}

function getCor(corId) {
  const cid = Number(corId);
  return cores.value.find((c) => Number(c.id) === cid) || null;
}

function addTamanho() {
  if (!selectTamanho.value) return;

  const tamanho = tamanhosDisponiveis.value.find(t => t.id === selectTamanho.value);
  if (!tamanho) return;
  if (matrizGrade.tamanhos.some(t => t.id === tamanho.id)) return;

  matrizGrade.tamanhos.push({ ...tamanho });
  selectTamanho.value = null;
  ensureMatrix();
}

function removeTamanho(tamanhoId) {
  const tid = Number(tamanhoId);
  matrizGrade.tamanhos = matrizGrade.tamanhos.filter((t) => t.id !== tid);
  Object.keys(matrizGrade.qtd).forEach((corId) => {
    if (matrizGrade.qtd[corId]) delete matrizGrade.qtd[corId][tid];
  });
}

const totalCombinacoes = computed(() => {
  let total = 0;
  matrizGrade.cores.forEach((corId) => {
    matrizGrade.tamanhos.forEach((tam) => {
      if (Number(matrizGrade.qtd?.[Number(corId)]?.[tam.id] ?? 0) > 0) total++;
    });
  });
  return total;
});

// Lista (cor, tamanho, quantidade) das combinações atualmente na matriz —
// reage em tempo real a cores/tamanhos adicionados ou removidos.
const headersGradeLista = [
  { title: 'Cor', key: 'desccor' },
  { title: 'Tamanho', key: 'tamanho_descricao' },
  { title: 'Quantidade', key: 'qtd' },
];

const gradeListaAtual = computed(() => {
  const linhas = [];
  matrizGrade.cores.forEach((corId) => {
    matrizGrade.tamanhos.forEach((tam) => {
      const cor = getCor(corId);
      linhas.push({
        id: `${corId}_${tam.id}`,
        id_cor: corId,
        desccor: cor?.descricao || `Cor ${corId}`,
        cor_hexa: cor?.cor_hexa || '#999',
        id_tamanho: tam.id,
        tamanho_descricao: tam.descricao,
        qtd: Number(matrizGrade.qtd?.[Number(corId)]?.[tam.id] ?? 0),
      });
    });
  });
  return linhas;
});

function resetMatrizGrade() {
  matrizGrade.cores = [];
  matrizGrade.tamanhos = [];
  matrizGrade.qtd = {};
  selectCor.value = null;
  selectTamanho.value = null;
  filtroTipoTamanho.value = null;
}

// Preenche a matriz com a grade já salva do produto (cores, tamanhos e
// quantidades), permitindo alterar ou acrescentar mais cores/tamanhos.
function preencherMatrizComGradeSalva() {
  resetMatrizGrade();

  const matriz = gradeMatriz.value;
  gradeLocalizacao.value = matriz?.itens?.[0]?.id_localizacao || null;
  if (!matriz) return;

  (matriz.cores || []).forEach((cor) => {
    const corId = Number(cor.id_cor);
    if (!matrizGrade.cores.includes(corId)) matrizGrade.cores.push(corId);
  });

  (matriz.tamanhos || []).forEach((tam) => {
    if (!matrizGrade.tamanhos.some(t => t.id === tam.id_tamanho)) {
      matrizGrade.tamanhos.push({
        id: tam.id_tamanho,
        origem: tam.origem_tamanho,
        descricao: tam.descricao,
      });
    }
  });

  ensureMatrix();

  (matriz.itens || []).forEach((item) => {
    ensureCell(item.id_cor, item.id_tamanho);
    matrizGrade.qtd[Number(item.id_cor)][Number(item.id_tamanho)] = Number(item.qtd) || 0;
  });
}

async function buscarGradeMatriz() {
  loadingGradeMatriz.value = true;

  const produto = forms.value;
  const almoId = produto?.referenciados_produto_almoxarifado_por_produto?.[0]?.referencia_almoxarifado?.id;

  if (almoId) {
    await produtosStore.buscarGradeMatriz(idEmpresa?.id, id, almoId);
  }

  preencherMatrizComGradeSalva();

  loadingGradeMatriz.value = false;
}

async function salvarGradeMatriz() {
  const produto = forms.value;
  const almoId = produto?.referenciados_produto_almoxarifado_por_produto?.[0]?.referencia_almoxarifado?.id;

  if (!almoId) {
    toast.warning('Produto não possui almoxarifado vinculado');
    return;
  }

  const itens = [];
  matrizGrade.cores.forEach((corId) => {
    matrizGrade.tamanhos.forEach((tam) => {
      const qtd = Number(matrizGrade.qtd?.[Number(corId)]?.[tam.id] ?? 0);
      if (qtd > 0) {
        itens.push({
          id_cor: Number(corId),
          id_tamanho: tam.id,
          origem_tamanho: tam.origem || '',
          qtd,
        });
      }
    });
  });

  if (!itens.length) {
    toast.warning('Preencha a quantidade de pelo menos uma combinação de cor e tamanho');
    return;
  }

  salvandoGradeMatriz.value = true;

  const payload = {
    id_localizacao: gradeLocalizacao.value || null,
    itens,
  };

  const ok = await produtosStore.atualizarGradeMatriz(idEmpresa?.id, id, almoId, payload);

  salvandoGradeMatriz.value = false;

  if (!ok) {
    toast.error(produtosStore.errorMessage || 'Erro ao salvar grade');
    return;
  }

  await buscarGradeMatriz();
  toast.success('Grade atualizada com sucesso!');
}

// =========================
// CADASTRAR / EDITAR COR
// =========================
const modalNovaCor = ref(false);
const editandoCorId = ref(null);

const coresDenatran = [
  { title: "01 - AMARELO", value: 1 },
  { title: "02 - AZUL", value: 2 },
  { title: "03 - BEGE", value: 3 },
  { title: "04 - BRANCA", value: 4 },
  { title: "05 - CINZA", value: 5 },
  { title: "06 - DOURADA", value: 6 },
  { title: "07 - GRENÁ", value: 7 },
  { title: "08 - LARANJA", value: 8 },
  { title: "09 - MARROM", value: 9 },
  { title: "10 - PRATA", value: 10 },
  { title: "11 - PRETA", value: 11 },
  { title: "12 - ROSA", value: 12 },
  { title: "13 - ROXA", value: 13 },
  { title: "14 - VERDE", value: 14 },
  { title: "15 - VERMELHA", value: 15 },
  { title: "16 - FANTASIA", value: 16 },
];

const modoCor = computed(() => (editandoCorId.value ? "edit" : "create"));

const novaCor = reactive({
  descricao: "",
  id_cor_denatran: null,
  cor_hexa: "",
});

function resetNovaCor() {
  novaCor.descricao = "";
  novaCor.id_cor_denatran = null;
  novaCor.cor_hexa = "";
  modalNovaCor.value = false;
  editandoCorId.value = null;
}

function abrirModalNovaCor() {
  editandoCorId.value = null;
  modalNovaCor.value = true;
}

const corFormValida = computed(() => {
  const descOk = String(novaCor.descricao || "").trim().length >= 2;
  const denOk = !!novaCor.id_cor_denatran;
  const hexOk = /^#([0-9A-Fa-f]{6})$/.test(String(novaCor.cor_hexa || "").trim());
  return descOk && denOk && hexOk;
});

async function salvarOuEditarCor() {
  if (!corFormValida.value) return;

  const payload = {
    descricao: String(novaCor.descricao).trim().toUpperCase(),
    id_cor_denatran: Number(novaCor.id_cor_denatran),
    cor_hexa: String(novaCor.cor_hexa).trim().toUpperCase(),
  };

  if (modoCor.value === "edit") {
    await produtosStore.atualizarCor(editandoCorId.value?.id, payload);
  } else {
    await produtosStore.cadastrarCor(payload);
  }

  if (!produtosStore.errorMessage) {
    await produtosStore.buscarCores();
    resetNovaCor();
  }
}

// =========================
// CADASTRAR / EDITAR / EXCLUIR TAMANHO
// =========================
const modalNovoTamanho = ref(false);
const editandoTamanhoId = ref(null);

const tiposTamanho = tiposTamanhoLista;

const modoTamanho = computed(() => (editandoTamanhoId.value ? "edit" : "create"));

const novoTamanhoForm = reactive({
  descricao: "",
  tipo: null,
  ordem: 0,
});

function resetNovoTamanho() {
  novoTamanhoForm.descricao = "";
  novoTamanhoForm.tipo = null;
  novoTamanhoForm.ordem = 0;
  modalNovoTamanho.value = false;
  editandoTamanhoId.value = null;
}

function editarTamanho(tamanho) {
  editandoTamanhoId.value = tamanho.id;
  novoTamanhoForm.descricao = tamanho.descricao || "";
  novoTamanhoForm.tipo = tamanho.tipo || null;
  novoTamanhoForm.ordem = tamanho.ordem || 0;
  modalNovoTamanho.value = true;
}

async function salvarOuEditarTamanho() {
  const desc = String(novoTamanhoForm.descricao || "").trim();
  if (!desc) {
    toast.warning("Informe a descrição do tamanho");
    return;
  }

  const payload = {
    descricao: desc,
    tipo: novoTamanhoForm.tipo || null,
    ordem: Number(novoTamanhoForm.ordem) || 0,
  };

  if (modoTamanho.value === "edit") {
    await estoqueStore.editarTamanho(idEmpresa?.id, editandoTamanhoId.value, payload);
  } else {
    await estoqueStore.cadastrarTamanho(payload);
  }

  if (!estoqueStore.errorMessage) {
    toast.success(modoTamanho.value === "edit" ? "Tamanho atualizado" : "Tamanho cadastrado");
    resetNovoTamanho();
  } else {
    toast.error(estoqueStore.errorMessage);
  }
}

const modalExcluirTamanho = ref(false);
const tamanhoExcluir = ref(null);

function excluirTamanho(tamanho) {
  tamanhoExcluir.value = tamanho;
  modalExcluirTamanho.value = true;
}

function cancelarExclusaoTamanho() {
  modalExcluirTamanho.value = false;
  tamanhoExcluir.value = null;
}

async function confirmarExclusaoTamanho() {
  if (!tamanhoExcluir.value) return;
  await estoqueStore.deletarTamanho(idEmpresa?.id, tamanhoExcluir.value.id);
  if (!estoqueStore.errorMessage) {
    toast.success("Tamanho excluído");
    cancelarExclusaoTamanho();
  } else {
    toast.error(estoqueStore.errorMessage);
  }
}

/** ================ PREÇO ================ **/

const formRefPreco = ref(null);

const formsPreco = reactive({
  custo_compra: null,
  custo_medio: null,
  custo_aquisicao: null,
  margem_lucro_liquido: null,
  perc_desconto: null,
  preco_venda: null,
  preco_venda_sugerido: null,
  preco_garantia: null,
  comissao_perc: null,
  comissao_vlr: null,
  permite_estoque_negativo: 'N',
  quantidade_minima: null,
  fator: null,
});

const permiteEstoqueNegativo = computed({
  get: () => formsPreco.permite_estoque_negativo === 'S',
  set: (val) => {
    formsPreco.permite_estoque_negativo = val ? 'S' : 'N';
  }
});

const salvarPreco = async () => {
  const payload = {
    id_produto: Number(id),
    custo_compra: Number(formsPreco.custo_compra) || 0,
    custo_medio: Number(formsPreco.custo_medio) || 0,
    custo_aquisicao: Number(formsPreco.custo_aquisicao) || 0,
    margem_lucro_liquido: Number(formsPreco.margem_lucro_liquido) || 0,
    perc_desconto: Number(formsPreco.perc_desconto) || 0,
    preco_venda: Number(formsPreco.preco_venda) || 0,
    preco_venda_sugerido: Number(formsPreco.preco_venda_sugerido) || 0,
    preco_garantia: Number(formsPreco.preco_garantia) || 0,
    comissao_perc: Number(formsPreco.comissao_perc) || 0,
    comissao_vlr: Number(formsPreco.comissao_vlr) || 0,
    permite_estoque_negativo: formsPreco.permite_estoque_negativo,
    quantidade_minima: Number(formsPreco.quantidade_minima) || 0,
    fator: Number(formsPreco.fator) || 1,
  };

  if (produtosStore.produtoPreco) {
    await produtosStore.atualizarProdutoPreco(idEmpresa?.id, id, payload);
  } else {
    await produtosStore.cadastrarProdutoPreco(payload);
    await produtosStore.buscarProdutoPreco(idEmpresa?.id, id);
  }

  if (produtosStore.errorMessage) {
    toast.error(produtosStore.errorMessage);
    return;
  }

  Object.assign(formsPreco, produtosStore.produtoPreco);
  toast.success("Preço salvo com sucesso!");
};

/** ================ TRIBUTOS ================ **/

const exibirTributos = ref(false);
const formularioAbertoTributo = ref(false);
const editandoTributo = ref(false);
const formRefTributo = ref(null);

const cests = computed(() => estoqueStore.cests);
const formulasDisponiveis = computed(() => formulasStore.formulas);
const aliquotasDisponiveis = computed(() =>
  (estoqueStore.aliquotas || []).map((a) => ({
    ...a,
    label: `${a.id_uf} - ${a.id_cfop}`,
  }))
);

const formsTributo = reactive({
  id_produto: Number(id),
  classificacao_fiscal: '',
  id_cest: null,
  margem_lucro_bruto: null,
  margem_lucro_cnae: null,
  incidenciafiscal: null,
  id_formula: null,
  id_uf_aliquota: null,
  id_cfop_aliquota: null,
});

// Preenchido ao escolher uma Alíquota UF específica no autocomplete — a chave é
// composta (id_uf + id_cfop), então usamos "uf|cfop" como item-value do v-autocomplete.
const aliquotaSelecionada = computed({
  get: () => (formsTributo.id_uf_aliquota && formsTributo.id_cfop_aliquota
    ? `${formsTributo.id_uf_aliquota}|${formsTributo.id_cfop_aliquota}`
    : null),
  set: (valor) => {
    if (!valor) {
      formsTributo.id_uf_aliquota = null;
      formsTributo.id_cfop_aliquota = null;
      return;
    }
    const [uf, cfop] = valor.split('|');
    formsTributo.id_uf_aliquota = uf;
    formsTributo.id_cfop_aliquota = cfop;
  }
});

const camposIncidenciaFiscal = [
  {label: 'Nenhuma', value: '00'},
  {label: 'Monofásica', value: '01'},
  {label: 'Subst. Tributária', value: '02'},
  {label: 'Aliquota 0', value: '03'},
  {label: 'Suspensão', value: '04'},
];

const toggleFormularioTributo = () => {
  formularioAbertoTributo.value = !formularioAbertoTributo.value;
  if (editandoTributo.value) cancelarFormularioTributo();
};

const headersTributo = [
  {title: 'Classificação Fiscal', key: 'classificacao_fiscal'},
  {title: 'Incidência Fiscal', key: 'incidenciafiscal'},
  {title: 'CEST', key: 'id_cest'},
  {title: 'Margem Lucro Bruto (%)', key: 'margem_lucro_bruto'},
  {title: 'Margem Lucro CNAE (%)', key: 'margem_lucro_cnae'},
  {title: 'Fórmula', key: 'id_formula'},
  {title: 'Alíquota UF', key: 'id_uf_aliquota'},
  {title: 'Ações', key: 'acoes', sortable: false},
];

const tributos = computed(() => produtosStore.tributos || []);

const cancelarFormularioTributo = () => {
  formularioAbertoTributo.value = false;
  formRefTributo.value.reset();
  editandoTributo.value = false;
};

const salvarFormularioTributo = async () => {
  if (formRefTributo.value && !(await formRefTributo.value.validate())) {
    return;
  }

  if (editandoTributo.value) {
    await produtosStore.atualizarTributo(idEmpresa?.id, id, formsTributo);
  } else {
    await produtosStore.cadastrarTributo(formsTributo, idEmpresa?.id, id);
  }

  if (produtosStore.errorMessage) {
    toast.error(produtosStore.errorMessage);
    return;
  }

  toast.success("Tributo salvo com sucesso!");
  cancelarFormularioTributo();
};

const itemSelecionadoTributo = ref(null);

const editarTributo = (item) => {
  itemSelecionadoTributo.value = item;
  Object.assign(formsTributo, item)
  editandoTributo.value = true;
  formularioAbertoTributo.value = true;
};

const openModalDeleteTributo = ref(false);
const deletarTributo = (item) => {
  console.log("[Tributo] Item selecionado para exclusão:", item);
  itemSelecionadoTributo.value = item;
  openModalDeleteTributo.value = true;
};

const excluirTributo = async () => {
  console.log("[Tributo] Excluindo com idEmpresa:", idEmpresa?.id, "id_produto:", id);
  await produtosStore.deletarTributo(idEmpresa?.id, id);
  openModalDeleteTributo.value = false;

  if (produtosStore.errorMessage) {
    toast.error(produtosStore.errorMessage);
    return;
  }

  toast.success("Tributo excluído com sucesso!");
};


/**
 * FUNÇÕES AUXILIARES
 */

function formatarData(dataISO) {
  if (!dataISO) return "";

  const [ano, mes, dia] = dataISO.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarParaReal(valor) {
  if (!valor && valor !== 0) return "";

  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/**
 * TRABALHANDO COM AS IMAGENS
 */

const form = ref({
  foto_key: null,
  foto_url: null,
});

const fotoProduto = ref(null);
const previewImagem = ref(null);
const loadingUploadFoto = ref(false);
const loadingFotos = ref(false);
const fotosR2 = ref([]);

const normalizarKey = (key) => {
  return String(key || "").replaceAll("\\/", "/");
};

const carregarFotosR2 = async () => {
  loadingFotos.value = true;

  try {
    await produtosStore.buscarFotosBanco(id);

    const fotosBanco = produtosStore.fotosBanco || [];

    fotosR2.value = fotosBanco.map((foto) => ({
      id: foto.id,
      id_produto: foto.id_produto,
      key: foto.r2key,
      nome: foto.r2key ? normalizarKey(foto.r2key).split("/").pop() : `foto-${foto.id}`,
      url: foto.foto_url,
    }));
  } catch (error) {
    console.error("Erro ao carregar fotos do produto:", error);
    fotosR2.value = [];
  } finally {
    loadingFotos.value = false;
  }
};

const selecionarFotoR2 = (foto) => {
  form.value.foto_key = foto.key;
  form.value.foto_url = foto.url;
  form.value.foto_id = foto.id;
  previewImagem.value = foto.url;
};

const converterFotoBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = reject;
    leitor.readAsDataURL(file);
  });
};

const uploadFotoProduto = async () => {
  const file = Array.isArray(fotoProduto.value)
      ? fotoProduto.value[0]
      : fotoProduto.value;

  if (!file) return;

  loadingUploadFoto.value = true;

  try {
    const foto = await converterFotoBase64(file);

    await produtosStore.salvarFotoBanco({
      id_produto: Number(id),
      foto,
    });

    if (produtosStore.errorMessage) {
      toast.error(produtosStore.errorMessage);
      return;
    }

    previewImagem.value = foto;
    fotoProduto.value = null;

    await carregarFotosR2();
    toast.success("Foto enviada com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar foto:", error);
    toast.error("Erro ao enviar foto.");
  } finally {
    loadingUploadFoto.value = false;
  }
};

const excluirFotoSalva = async (idFoto) => {
  try {
    loadingFotos.value = true;

    await produtosStore.deletarFotoBanco(Number(id), idFoto);

    if (produtosStore.errorMessage) {
      toast.error(produtosStore.errorMessage);
      return;
    }

    if (form.value.foto_id === idFoto) {
      form.value.foto_key = null;
      form.value.foto_url = null;
      form.value.foto_id = null;
      fotoProduto.value = null;
      previewImagem.value = null;
    }

    await carregarFotosR2();
    toast.success("Foto excluída com sucesso!");
  } catch (error) {
    console.error("Erro ao remover foto:", error);
    toast.error("Erro ao remover foto.");
  } finally {
    loadingFotos.value = false;
  }
};

const removerFotoProduto = async () => {
  if (!form.value.foto_id) return;
  await excluirFotoSalva(form.value.foto_id);
};

const limparPreviewLocal = () => {
  if (previewImagem.value?.startsWith("blob:")) {
    URL.revokeObjectURL(previewImagem.value);
  }

  previewImagem.value = null;
};

const gerarPreviewFoto = () => {
  const file = Array.isArray(fotoProduto.value)
      ? fotoProduto.value[0]
      : fotoProduto.value;

  limparPreviewLocal();

  if (!file) return;

  if (!(file instanceof File || file instanceof Blob)) {
    console.warn("Preview ignorado. Valor não é File/Blob:", file);
    return;
  }

  previewImagem.value = URL.createObjectURL(file);
};

watch(fotoProduto, (novoValor) => {
  const file = Array.isArray(novoValor)
      ? novoValor[0]
      : novoValor;

  if (!file) {
    return;
  }

  if (!(file instanceof File || file instanceof Blob)) {
    return;
  }

  gerarPreviewFoto();
});

/**
 * CHAMANDO AS APIs
 */

watchEffect(async () => {
  if (id) {
    await produtosStore.buscarProdutoPorId(id);
    if (subgrupos.value.length === 0)
      await buscarSubgrupos(produtosStore.produto?.id_grupo);

    if (embalagens.value.length === 0)
      await produtosStore.buscarEmbalagens(id);

    if (fornecedores.value.length === 0)
      await produtosStore.buscarFornecedores(id);

    if (pessoasStore.pessoas.length === 0)
      await pessoasStore.buscarTodasPessoas();

    if (similares.value.length === 0)
      await produtosStore.buscarProdutosSimilares(id);
  }
  if (cests.value.length === 0) {
    await estoqueStore.buscarCests();
  }
  if (formulasDisponiveis.value.length === 0) {
    await formulasStore.buscarFormulas();
  }
  if (aliquotasDisponiveis.value.length === 0) {
    await estoqueStore.buscarTodasAliquotas(idEmpresa?.id);
  }
  if (tributos.value.length === 0) {
    await produtosStore.buscarTributoPorId(idEmpresa?.id, id);
  }
  if (id && !produtosStore.produtoPreco) {
    await produtosStore.buscarProdutoPreco(idEmpresa?.id, id);
    if (produtosStore.produtoPreco) {
      Object.assign(formsPreco, produtosStore.produtoPreco);
    }
  }
});

watch(tab, async (novaAba) => {
  if (novaAba === 'grade' && forms.value?.utiliza_grade === 'S') {
    if (!produtosStore.cores?.length) {
      await produtosStore.buscarCores();
    }
    if (!produtosStore.localizacoes?.length) {
      await produtosStore.buscarLocalizacoes(idEmpresa?.id);
    }
    if (!estoqueStore.tamanhos?.length) {
      await estoqueStore.buscarTamanhos();
    }
    await buscarGradeMatriz();
  }
});
</script>

<style scoped>
.upload-produto-box {
  width: 100%;
}

.preview-produto {
  width: 100%;
  min-height: 260px;
  border: 2px dashed rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
}

.preview-placeholder {
  height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}

.foto-r2-card {
  cursor: pointer;
  border-radius: 14px;
  overflow: hidden;
  transition: 0.2s ease;
}

.foto-r2-card:hover {
  transform: translateY(-3px);
}

.cor-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.18);
  margin-right: 10px;
}

.gap-2 {
  gap: 8px;
}

/* Matriz Cor x Tamanho */
.grade-erp {
  padding: 16px;
  background: var(--bg-color-secondary) !important;
  color: var(--text-color) !important;
}

.grade-erp__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.grade-erp__body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
}

.grade-erp__left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.grade-erp__left-title {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}

.grade-erp__right-header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  gap: 12px;
}

.grade-erp__filtro-tipo :deep(.v-field) {
  min-height: 30px !important;
}

.grade-erp__filtro-tipo :deep(.v-chip) {
  height: 22px !important;
  font-size: 0.7rem !important;
}

.grade-erp__left-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 2px;
}

.grade-erp__left-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: var(--bg-color);
}

.grade-erp__left-add {
  display: grid;
  grid-template-columns: 1fr 42px;
  gap: 8px;
  align-items: center;
}

.grade-erp__right {
  overflow: auto;
}

.grade-erp__sizes {
  display: grid;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.grade-erp__size-cell {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  border-radius: 8px;
  background: var(--bg-color);
  font-weight: 600;
}

.grade-erp__size-add {
  display: grid;
  grid-template-columns: 1fr 42px;
  gap: 8px;
  align-items: center;
}

.grade-erp__grid-wrap {
  overflow: auto;
  padding-bottom: 4px;
}

.grade-erp__grid {
  display: grid;
  gap: 8px;
}

.grade-erp__cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.grade-erp__input :deep(.v-field__input) {
  text-align: center;
}

.grade-erp__btn-plus {
  background: var(--text-color-laranja) !important;
  color: #fff !important;
}
</style>