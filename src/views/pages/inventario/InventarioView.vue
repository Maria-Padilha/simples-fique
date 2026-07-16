<template>
  <top-all-pages icon="mdi-package-variant-closed">
    <template #titulo>Inventário de Produtos</template>
    <template #acoes>
      <v-btn
          :color="loteAberto ? 'grey' : 'var(--text-color-laranja)'"
          :variant="loteAberto ? 'outlined' : 'flat'"
          :prepend-icon="loteAberto ? 'mdi-close' : 'mdi-plus'"
          @click="toggleLote"
          class="text-white"
      >
        {{ loteAberto ? 'Cancelar Criação' : 'Criar Novo Lote' }}
      </v-btn>
    </template>
    <template #section>
      <div>
        <!-- Formulário de Criação de Lote (Expandível) -->
        <v-expand-transition>
          <div v-if="loteAberto">
            <!-- Card de Configuração -->
        <v-card class="background-secondary mb-4" elevation="0">
          <v-card-title class="text-h6 pa-4">
            <v-icon icon="mdi-cog" class="mr-2"></v-icon>
            Configuração do Inventário
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <!-- Almoxarifado -->
              <v-col cols="12" md="4">
                <v-autocomplete
                    v-model="inventario.id_almoxarifado"
                    :items="almoxarifados"
                    label="Almoxarifado *"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-warehouse"
                    :rules="[v => !!v || 'Selecione um almoxarifado']"
                    item-title="descalmoxarifado"
                    item-value="id"
                    :loading="carregandoAlmoxarifados"
                >
                  <template #item="{ props }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon icon="mdi-warehouse" color="var(--text-color-laranja)"></v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <!-- Tipo de Inventário -->
              <v-col cols="12" md="4">
                <v-select
                    v-model="inventario.tipo"
                    :items="tiposInventario"
                    label="Tipo de Lançamento *"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-form-select"
                    :rules="[v => !!v || 'Selecione o tipo']"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon 
                            :icon="item.raw.icon" 
                            :color="item.raw.color"
                        ></v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <!-- Data do Inventário -->
              <v-col cols="12" md="4">
                <v-text-field
                    v-model="inventario.data"
                    label="Data do Inventário *"
                    type="date"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    :rules="[v => !!v || 'Informe a data']"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Card de Lançamento -->
        <v-card :color="themeStore.darkMode ? 'text-white' : ''" class="background-secondary mb-4">
          <v-card-title class="text-h6 pa-4">
            <v-icon 
                :icon="inventario.tipo === 'A' ? 'mdi-barcode-scan' : inventario.tipo === 'L' ? 'mdi-link-variant' : 'mdi-keyboard'" 
                class="mr-2"
            ></v-icon>
            {{ inventario.tipo === 'A' ? 'Lançamento por Coletor de Dados' : inventario.tipo === 'L' ? 'Contagem por Link' : 'Lançamento Manual' }}
          </v-card-title>

          <v-card-text class="pa-4">
            <!-- Modo Automático (Importação de Arquivo) -->
            <div v-if="inventario.tipo === 'A'">
              <v-alert 
                  type="info" 
                  variant="tonal" 
                  class="mb-4"
                  icon="mdi-information"
              >
                <strong>Modo Automático:</strong> Importe um arquivo de texto (.txt) com os produtos e quantidades do inventário.
              </v-alert>

              <v-row>
                <!-- Upload de Arquivo -->
                <v-col cols="12" md="6">
                  <v-file-input
                      v-model="inventario.arquivo"
                      label="Arquivo de Inventário (.txt) *"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-file-document"
                      prepend-icon=""
                      accept=".txt"
                      :rules="[v => !!v || 'Selecione um arquivo']"
                      :disabled="!inventario.id_almoxarifado"
                      :hint="!inventario.id_almoxarifado ? 'Selecione um almoxarifado primeiro' : ''"
                      persistent-hint
                      @change="processarArquivo"
                  >
                    <template #selection="{ fileNames }">
                      <v-chip size="small" color="var(--text-color-laranja)" variant="tonal">
                        {{ fileNames[0] }}
                      </v-chip>
                    </template>
                  </v-file-input>
                </v-col>

                <!-- Tipo de Documento -->
                <v-col cols="12" md="6">
                  <v-select
                      v-model="inventario.layout_utilizado"
                      :items="tiposDocumento"
                      label="Tipo de Documento *"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-file-cog"
                      :rules="[v => !!v || 'Selecione o tipo']"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-icon :icon="item.raw.icon" color="var(--text-color-laranja)"></v-icon>
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>

                <!-- Formato do Arquivo -->
                <v-col cols="12" md="6">
                  <v-checkbox
                      v-model="usarSeparador"
                      label="Usar separador"
                      density="compact"
                      color="var(--text-color-laranja)"
                      hide-details
                  ></v-checkbox>
                </v-col>

                <!-- Separador (se usar separador) -->
                <v-col cols="12" md="6" v-if="usarSeparador">
                  <v-select
                      v-model="inventario.separador_char"
                      :items="separadores"
                      label="Separador *"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-slash-forward"
                      :rules="[v => !!v || 'Selecione o separador']"
                  >
                    <template #selection="{ item }">
                      <v-chip size="small" color="primary" variant="tonal">
                        {{ item.title }}
                      </v-chip>
                    </template>
                  </v-select>
                </v-col>

                <!-- Campos de tamanho fixo (se NÃO usar separador) -->
                <v-col cols="12" v-if="!usarSeparador">
                  <v-row>
                    <v-col cols="6" md="3">
                      <v-text-field
                          v-model.number="inventario.layout_dig_prod"
                          label="Dígitos do Produto *"
                          variant="outlined"
                          density="compact"
                          type="number"
                          prepend-inner-icon="mdi-numeric"
                          :rules="[v => !!v || 'Informe a quantidade de dígitos']"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" md="3">
                      <v-text-field
                          v-model.number="inventario.layout_dig_qtd"
                          label="Dígitos da Quantidade *"
                          variant="outlined"
                          density="compact"
                          type="number"
                          prepend-inner-icon="mdi-numeric"
                          :rules="[v => !!v || 'Informe a quantidade de dígitos']"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-col>

                <!-- Botão Processar -->
                <v-col cols="12">
                  <v-btn
                      color="var(--text-color-laranja)"
                      variant="flat"
                      prepend-icon="mdi-file-import"
                      class="text-white"
                      :disabled="!inventario.arquivo || !inventario.layout_utilizado"
                      :loading="processandoArquivo"
                      @click="importarArquivo"
                      block
                  >
                    Processar Arquivo e Importar Produtos
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <!-- Modo Manual -->
            <div v-else-if="inventario.tipo === 'M'">
              <v-alert
                  type="info"
                  variant="tonal"
                  class="mb-4"
                  icon="mdi-information"
              >
                <strong>Modo Manual:</strong> Filtre os produtos por grupo, subgrupo, marca ou localização e adicione-os ao inventário.
              </v-alert>

              <v-row>
                <!-- Código de busca -->
                <v-col cols="12" md="4">
                  <v-text-field
                      v-model="filtroManual.codigo"
                      label="Buscar por Código"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-barcode"
                      hint="Pressione Enter para buscar"
                      persistent-hint
                      clearable
                      @keyup.enter="buscarPorCodigo"
                  >
                    <template #append-inner>
                      <v-btn icon="mdi-magnify" size="small" variant="text" @click="buscarPorCodigo"></v-btn>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Produto -->
                <v-col cols="12" md="4">
                  <v-autocomplete
                      v-model="filtroManual.produtoId"
                      :items="[{ descproduto: 'Todos os Produtos', id_produto: null }, ...produtosGrid]"
                      label="Produto"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-package-variant"
                      item-title="descproduto"
                      item-value="id_produto"
                      :loading="carregandoGridProdutos"
                      :custom-filter="filtrarProdutoPorNomeOuCodigo"
                      clearable
                      @focus="carregarGridProdutos"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #subtitle v-if="item.raw.id">
                          <span class="text-caption">Cód: {{ item.raw.codigo_sku || item.raw.codigo_gtin }}</span>
                        </template>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>

                <!-- Grupo -->
                <v-col cols="12" md="4">
                  <v-autocomplete
                      v-model="filtroManual.grupoId"
                      :items="[{ descgrupo: 'Todos os Grupos', id: null }, ...grupos]"
                      label="Grupo"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-shape"
                      item-title="descgrupo"
                      item-value="id"
                      :loading="carregandoGrupos"
                      clearable
                      @update:model-value="onGrupoChange"
                  ></v-autocomplete>
                </v-col>

                <!-- SubGrupo -->
                <v-col cols="12" md="4">
                  <v-autocomplete
                      v-model="filtroManual.subgrupoId"
                      :items="[{ descsubgrupo: 'Todos os SubGrupos', id: null }, ...subgrupos]"
                      label="SubGrupo"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-shape-plus"
                      item-title="descsubgrupo"
                      item-value="id"
                      :loading="carregandoSubgrupos"
                      :disabled="!filtroManual.grupoId"
                      :hint="!filtroManual.grupoId ? 'Selecione um grupo primeiro' : ''"
                      clearable
                  ></v-autocomplete>
                </v-col>

                <!-- Marca -->
                <v-col cols="12" md="4">
                  <v-autocomplete
                      v-model="filtroManual.marcaId"
                      :items="[{ descmarca: 'Todas as Marcas', id: null }, ...marcas]"
                      label="Marca"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-tag"
                      item-title="descmarca"
                      item-value="id"
                      :loading="carregandoMarcas"
                      clearable
                  ></v-autocomplete>
                </v-col>

                <!-- Localização -->
                <v-col cols="12" md="4">
                  <v-autocomplete
                      v-model="filtroManual.localizacaoId"
                      :items="[{ descricao: 'Todas as Localizações', id: null }, ...localizacoes]"
                      label="Localização"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-map-marker"
                      item-title="descricao"
                      item-value="id"
                      :loading="carregandoLocalizacoes"
                      clearable
                  ></v-autocomplete>
                </v-col>

                <!-- Botão -->
                <v-col cols="12">
                  <v-btn
                      color="var(--text-color-laranja)"
                      variant="flat"
                      prepend-icon="mdi-plus-circle"
                      class="text-white"
                      :disabled="!inventario.id_almoxarifado"
                      :loading="carregandoGridProdutos"
                      @click="buscarGridInventario"
                      block
                  >
                    Listar Produtos ao Inventário
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <!-- Contagem por Link -->
            <div v-else>
              <v-alert
                  type="info"
                  variant="tonal"
                  class="mb-4"
                  icon="mdi-information"
              >
                <strong>Contagem por Link:</strong> Filtre os produtos desejados e ao finalizar será gerado um link para o responsável realizar a contagem via mobile.
              </v-alert>

              <v-row>
                <!-- Código de busca -->
                <v-col cols="12" md="4">
                  <v-text-field
                      v-model="filtroManual.codigo"
                      label="Buscar por Código"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-barcode"
                      hint="Pressione Enter para buscar"
                      persistent-hint
                      clearable
                      @keyup.enter="buscarPorCodigo"
                  >
                    <template #append-inner>
                      <v-btn icon="mdi-magnify" size="small" variant="text" @click="buscarPorCodigo"></v-btn>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Produto -->
                <v-col cols="12" md="4">
                  <v-autocomplete
                      v-model="filtroManual.produtoId"
                      :items="[{ descproduto: 'Todos os Produtos', id_produto: null }, ...produtosGrid]"
                      label="Produto"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-package-variant"
                      item-title="descproduto"
                      item-value="id_produto"
                      :loading="carregandoGridProdutos"
                      :custom-filter="filtrarProdutoPorNomeOuCodigo"
                      clearable
                      @focus="carregarGridProdutos"
                  ></v-autocomplete>
                </v-col>

                <!-- Grupo -->
                <v-col cols="12" md="4">
                  <v-autocomplete
                      v-model="filtroManual.grupoId"
                      :items="[{ descgrupo: 'Todos os Grupos', id: null }, ...grupos]"
                      label="Grupo"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-shape"
                      item-title="descgrupo"
                      item-value="id"
                      :loading="carregandoGrupos"
                      clearable
                      @update:model-value="onGrupoChange"
                  ></v-autocomplete>
                </v-col>

                <!-- SubGrupo -->
                <v-col cols="12" md="4">
                  <v-autocomplete
                      v-model="filtroManual.subgrupoId"
                      :items="[{ descsubgrupo: 'Todos os SubGrupos', id: null }, ...subgrupos]"
                      label="SubGrupo"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-shape-plus"
                      item-title="descsubgrupo"
                      item-value="id"
                      :loading="carregandoSubgrupos"
                      :disabled="!filtroManual.grupoId"
                      :hint="!filtroManual.grupoId ? 'Selecione um grupo primeiro' : ''"
                      clearable
                  ></v-autocomplete>
                </v-col>

                <!-- Marca -->
                <v-col cols="12" md="4">
                  <v-autocomplete
                      v-model="filtroManual.marcaId"
                      :items="[{ descmarca: 'Todas as Marcas', id: null }, ...marcas]"
                      label="Marca"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-tag"
                      item-title="descmarca"
                      item-value="id"
                      :loading="carregandoMarcas"
                      clearable
                  ></v-autocomplete>
                </v-col>

                <!-- Localização -->
                <v-col cols="12" md="4">
                  <v-autocomplete
                      v-model="filtroManual.localizacaoId"
                      :items="[{ descricao: 'Todas as Localizações', id: null }, ...localizacoes]"
                      label="Localização"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-map-marker"
                      item-title="descricao"
                      item-value="id"
                      :loading="carregandoLocalizacoes"
                      clearable
                  ></v-autocomplete>
                </v-col>

                <!-- Botão Listar -->
                <v-col cols="12">
                  <v-btn
                      color="var(--text-color-laranja)"
                      variant="flat"
                      prepend-icon="mdi-plus-circle"
                      class="text-white"
                      :disabled="!inventario.id_almoxarifado"
                      :loading="carregandoGridProdutos"
                      @click="buscarGridInventario"
                      block
                  >
                    Listar Produtos ao Inventário
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>

        <!-- Card da Tabela de Itens -->
        <v-card v-if="itensInventario.length > 0" :color="themeStore.darkMode ? 'text-white' : ''" class="background-secondary">
          <v-card-title class="text-h6 pa-4 d-flex justify-space-between align-center">
            <div>
              <v-icon icon="mdi-format-list-bulleted" class="mr-2"></v-icon>
              Itens do Inventário
            </div>
            <v-chip 
                color="var(--text-color-laranja)" 
                size="small"
                v-if="itensInventario.length > 0"
            >
              {{ itensInventario.length }} {{ itensInventario.length === 1 ? 'item' : 'itens' }}
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-alert
                v-if="naoEncontradosCount > 0"
                type="warning"
                density="compact"
                variant="tonal"
                closable
                class="mb-4"
                @click:close="naoEncontradosCount = 0"
                icon="mdi-barcode-off"
            >
              <strong>{{ naoEncontradosCount }}</strong> {{ naoEncontradosCount === 1 ? 'código de barras não encontrado' : 'códigos de barras não encontrados' }} no catálogo de referência.
            </v-alert>
            <v-table class="inventario-table" density="comfortable">
              <thead>
                <tr>
                  <th class="text-center" style="width: 5%">#</th>
                  <th class="text-left" style="width: 10%">Código</th>
                  <th class="text-left" style="width: 35%">Produto</th>
                  <th class="text-center" style="width: 12%">Qtd. Sistema</th>
                  <th class="text-center" style="width: 12%">Qtd. Contada</th>
                  <th class="text-center" style="width: 12%">Diferença</th>
                  <th class="text-center" style="width: 10%">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="itensInventario.length === 0">
                  <td colspan="7" class="text-center pa-12">
                    <v-icon size="80" color="grey-lighten-1">mdi-package-variant-closed-remove</v-icon>
                    <p class="text-h6 mt-4 mb-2">Nenhum item adicionado ao inventário</p>
                    <p class="text-body-2 text-grey">
                      {{ inventario.tipo === 'A' ? 'Importe um arquivo para adicionar produtos automaticamente' : 'Selecione produtos manualmente usando o formulário acima' }}
                    </p>
                  </td>
                </tr>
                <tr 
                    v-else
                    v-for="(item, index) in (itensInventario || [])" 
                    :key="index"
                    :class="getDiferencaClass(item.diferenca)"
                >
                  <td class="text-center text-body-2 font-weight-bold">{{ index + 1 }}</td>
                  <td class="text-body-2">{{ item.codigo }}</td>
                  <td>
                    <div class="d-flex align-center ga-3">
                      <v-avatar
                          v-if="item.fotoUrl"
                          size="44"
                          rounded
                          class="flex-shrink-0"
                      >
                        <v-img
                            :src="item.fotoUrl"
                            alt=""
                            cover
                            class="rounded"
                        />
                      </v-avatar>
                      <v-avatar
                          v-else
                          size="44"
                          rounded
                          color="grey-lighten-3"
                          class="flex-shrink-0"
                      >
                        <v-icon icon="mdi-package-variant" color="grey-lighten-1"></v-icon>
                      </v-avatar>
                      <div v-if="!item.encontrado">
                        <v-icon icon="mdi-alert-circle-outline" color="warning" size="small"></v-icon>
                      </div>
                      <div class="min-w-0">
                        <div class="text-body-2 font-weight-medium text-truncate" :class="{ 'text-warning': !item.encontrado }" :title="item.nome">{{ item.nome }}</div>
                        <div class="text-caption text-grey" v-if="item.erro">
                          <v-icon icon="mdi-alert" size="x-small" color="warning"></v-icon>
                          {{ item.erro }}
                        </div>
                        <div class="text-caption text-grey" v-if="item.localizacao">
                          <v-icon icon="mdi-map-marker" size="x-small"></v-icon>
                          {{ item.localizacao }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" variant="outlined">
                      {{ formatarNumero(item.estoqueSistema) }} {{ item.unidade }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" color="primary" variant="tonal">
                      {{ formatarNumero(item.quantidadeContada) }} {{ item.unidade }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip 
                        size="small" 
                        :color="item.diferenca > 0 ? 'success' : item.diferenca < 0 ? 'error' : 'grey'"
                        variant="flat"
                        class="text-white font-weight-bold"
                    >
                      {{ item.diferenca > 0 ? '+' : '' }}{{ formatarNumero(item.diferenca) }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-btn
                        icon="mdi-delete"
                        size="small"
                        variant="text"
                        color="error"
                        @click="abrirModalExcluir(index)"
                    ></v-btn>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="font-weight-bold">
                  <td colspan="3" class="text-right pa-3">TOTAL:</td>
                  <td class="text-center">{{ itensInventario.length }} itens</td>
                  <td class="text-center">-</td>
                  <td class="text-center">-</td>
                  <td></td>
                </tr>
              </tfoot>
            </v-table>
          </v-card-text>

          <v-card-actions v-if="itensInventario.length > 0" class="pa-4">
            <v-btn
                color="grey"
                variant="outlined"
                prepend-icon="mdi-printer"
                @click="imprimirInventario"
            >
              Imprimir
            </v-btn>
            <v-btn
                color="success"
                variant="outlined"
                prepend-icon="mdi-file-excel"
                @click="exportarExcel"
            >
              Exportar Excel
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
                color="error"
                variant="outlined"
                prepend-icon="mdi-delete-sweep"
                @click="limparInventario"
            >
              Limpar Tudo
            </v-btn>
            <v-btn
                color="var(--text-color-laranja)"
                variant="flat"
                class="text-white"
                :prepend-icon="inventario.tipo === 'L' ? 'mdi-link-variant' : 'mdi-check-circle'"
                @click="finalizarLote"
                >
                {{ inventario.tipo === 'L' ? 'Finalizar e Gerar Link' : 'Finalizar e Salvar Lote' }}
            </v-btn>
          </v-card-actions>
        </v-card>
          </div>
        </v-expand-transition>

        <!-- Tabela de Lotes -->
        <v-card v-if="!loteAberto" :color="themeStore.darkMode ? 'text-white' : ''" class="background-secondary">
          <v-card-title class="text-h6 pa-4 d-flex align-center">
            <v-icon icon="mdi-clipboard-list" class="mr-2"></v-icon>
            Lotes de Inventário
            <v-chip 
                color="var(--text-color-laranja)" 
                size="small"
                v-if="lotes.length > 0"
                class="ml-2"
            >
              {{ lotes.length }} {{ lotes.length === 1 ? 'lote' : 'lotes' }}
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-4">
            <div v-if="lotes.length === 0" class="text-center pa-12">
              <v-icon size="80" color="grey-lighten-1">mdi-clipboard-text-off</v-icon>
              <p class="text-h6 mt-4 mb-2">Nenhum lote de inventário criado</p>
              <p class="text-body-2 text-grey">
                Clique no botão "Criar Novo Lote" acima para iniciar um inventário de produtos.
              </p>
            </div>

            <v-table v-if="lotes.length > 0 && !loteAberto" class="inventario-table" density="comfortable">
              <thead>
                <tr>
                  <th class="text-left" style="width: 5%">#</th>
                  <th class="text-left" style="width: 22%">Almoxarifado</th>
                  <th class="text-center" style="width: 12%">Data</th>
                  <th class="text-center" style="width: 12%">Tipo</th>
                  <th class="text-center" style="width: 15%">Situação</th>
                  <th class="text-center" style="width: 10%">Itens</th>
                  <th class="text-left" style="width: 14%">Observações</th>
                  <th class="text-center" style="width: 10%">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(lote, index) in (lotes || [])" :key="lote.id || index">
                  <td class="text-body-2 font-weight-bold">{{ index + 1 }}</td>
                  <td class="text-body-2">{{ lote.almoxarifadoNome }}</td>
                  <td class="text-center">
                    <v-chip size="small" variant="outlined">
                      {{ formatarData(lote.data) }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip 
                        size="small" 
                        :color="lote.tipo === 'A' ? 'primary' : 'success'"
                        variant="tonal"
                    >
                      <v-icon 
                          :icon="lote.tipo === 'A' ? 'mdi-barcode-scan' : 'mdi-keyboard'" 
                          size="x-small" 
                          class="mr-1"
                      ></v-icon>
                      {{ lote.desctipo || (lote.tipo === 'A' ? 'Automático' : 'Manual') }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip
                        size="small"
                        :color="lote.situacao === 'E' ? 'success' : lote.situacao === 'C' ? 'error' : 'warning'"
                        variant="tonal"
                    >
                      <v-icon
                          :icon="lote.situacao === 'E' ? 'mdi-check-circle' : lote.situacao === 'C' ? 'mdi-cancel' : 'mdi-progress-clock'"
                          size="x-small"
                          class="mr-1"
                      ></v-icon>
                      {{ lote.descsituacao || 'EM PROCESSAMENTO' }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" color="var(--text-color-laranja)" variant="flat" class="text-white">
                      {{ lote.qtd_item ?? (lote.itens || []).length }} {{ (lote.qtd_item ?? (lote.itens || []).length) === 1 ? 'item' : 'itens' }}
                    </v-chip>
                  </td>
                  <td class="text-body-2">
                    <span v-if="lote.observacoes" class="text-truncate" style="max-width: 150px; display: inline-block;">
                      {{ lote.observacoes }}
                    </span>
                    <span v-else class="text-grey">-</span>
                  </td>
                  <td class="text-center">
                    <v-btn
                        icon="mdi-eye"
                        size="small"
                        variant="text"
                        color="primary"
                        @click="visualizarItensLote(lote)"
                    ></v-btn>
                    <v-btn
                        v-if="lote.tipo === 'L'"
                        icon="mdi-link-variant"
                        size="small"
                        variant="text"
                        color="var(--text-color-laranja)"
                        title="Gerar Link de Contagem"
                        @click="gerarLinkContagem(lote.id)"
                    ></v-btn>
                    <v-btn
                        v-if="lote.situacao !== 'E'"
                        icon="mdi-delete"
                        size="small"
                        variant="text"
                        color="error"
                        @click="abrirModalExcluirLote(index)"
                    ></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <!-- Modal de Visualização de Itens do Lote -->
        <v-dialog v-model="modalItensAberto" max-width="1200">
          <v-card :color="themeStore.darkMode ? 'text-white' : ''" class="background-secondary">
            <v-card-title class="text-h6 pa-4 d-flex align-center">
              <v-icon icon="mdi-clipboard-text" class="mr-2"></v-icon>
              Itens do Lote - {{ loteVisualizando?.almoxarifadoNome }}
              <v-spacer></v-spacer>
              <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="modalItensAberto = false"
              ></v-btn>
            </v-card-title>

            <v-card-text class="pa-4">
              <v-row dense class="mb-4">
                <v-col cols="4">
                  <div class="text-caption text-grey">Data</div>
                  <div class="text-body-1">{{ formatarData(loteVisualizando?.data) }}</div>
                </v-col>
                <v-col cols="4">
                  <div class="text-caption text-grey">Tipo</div>
                  <div class="text-body-1">
                    <v-chip 
                        size="small" 
                        :color="loteVisualizando?.tipo === 'A' ? 'primary' : 'success'"
                        variant="tonal"
                    >
                      {{ loteVisualizando?.tipo === 'A' ? 'Automático' : 'Manual' }}
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-caption text-grey">Total de Itens</div>
                  <div class="text-body-1">
                    <v-chip color="var(--text-color-laranja)" size="small" variant="flat" class="text-white">
                      {{ loteVisualizando?.itens?.length || 0 }} {{ (loteVisualizando?.itens?.length || 0) === 1 ? 'item' : 'itens' }}
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="12" v-if="loteVisualizando?.observacoes">
                  <div class="text-caption text-grey">Observações</div>
                  <div class="text-body-1">{{ loteVisualizando.observacoes }}</div>
                </v-col>
              </v-row>

              <v-progress-linear
                  v-if="carregandoItensLote"
                  indeterminate
                  color="var(--text-color-laranja)"
                  class="mb-2"
              ></v-progress-linear>

              <v-data-table
                  class="inventario-table"
                  density="comfortable"
                  :headers="headersItensModal"
                  :items="loteVisualizando?.itens || []"
                  :loading="carregandoItensLote"
                  v-model:page="paginaModal"
                  :items-per-page="itensPorPaginaModal"
                  item-value="id_seq"
                  no-data-text="Nenhum item neste lote"
                  loading-text="Carregando itens..."
              >
                <template #[`item.codigo`]="{ item }">
                  <span class="font-weight-bold">{{ item.codigo }}</span>
                </template>

                <template #[`item.nome`]="{ item }">
                  <div class="text-body-2 font-weight-medium">{{ item.nome }}</div>
                </template>

                <template #[`item.estoqueSistema`]="{ item }">
                  <v-chip size="small" variant="outlined">
                    {{ formatarNumero(item.estoqueSistema) }}
                  </v-chip>
                </template>

                <template #[`item.quantidadeContada`]="{ item }">
                  <v-chip
                      v-if="loteVisualizando?.situacao === 'E'"
                      size="small"
                      color="grey"
                      variant="tonal"
                  >
                    {{ formatarNumero(item.quantidadeContada) }}
                  </v-chip>
                  <v-text-field
                      v-else
                      v-model.number="item.quantidadeContada"
                      type="number"
                      density="compact"
                      variant="outlined"
                      hide-details
                      min="0"
                      style="max-width: 110px; margin: 0 auto"
                      @update:model-value="item.diferenca = (item.quantidadeContada || 0) - item.estoqueSistema"
                  ></v-text-field>
                </template>

                <template #[`item.diferenca`]="{ item }">
                  <v-chip
                      size="small"
                      :color="item.diferenca > 0 ? 'success' : item.diferenca < 0 ? 'error' : 'grey'"
                      variant="flat"
                      class="text-white font-weight-bold"
                  >
                    {{ item.diferenca > 0 ? '+' : '' }}{{ formatarNumero(item.diferenca) }}
                  </v-chip>
                </template>

                <template #bottom="{ pageCount }">
                  <div class="d-flex align-center justify-space-between pa-3">
                    <div class="d-flex align-center gap-2">
                      <span class="text-body-2 text-grey mr-2">Itens por página:</span>
                      <v-select
                          v-model="itensPorPaginaModal"
                          :items="[5, 10, 20, 50]"
                          density="compact"
                          variant="outlined"
                          hide-details
                          style="width: 80px"
                      ></v-select>
                    </div>
                    <v-pagination
                        v-model="paginaModal"
                        :length="pageCount"
                        :total-visible="5"
                        density="compact"
                        active-color="var(--text-color-laranja)"
                    ></v-pagination>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn
                  color="grey"
                  variant="outlined"
                  @click="modalItensAberto = false"
              >
                Fechar
              </v-btn>
              <v-btn
                  v-if="loteVisualizando?.situacao !== 'E'"
                  color="var(--text-color-laranja)"
                  variant="flat"
                  class="text-white"
                  prepend-icon="mdi-check-circle"
                  :loading="salvandoContagem"
                  :disabled="!loteVisualizando?.itens?.length"
                  @click="salvarContagem"
              >
                Salvar Contagem
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Modal de Link de Contagem -->
        <v-dialog v-model="modalLinkAberto" max-width="600">
          <v-card :color="themeStore.darkMode ? 'text-white' : ''" class="background-secondary">
            <v-card-title class="text-h6 pa-4 d-flex align-center">
              <v-icon icon="mdi-link-variant" class="mr-2"></v-icon>
              Link de Contagem de Inventário
              <v-spacer></v-spacer>
              <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="modalLinkAberto = false"
              ></v-btn>
            </v-card-title>

            <v-card-text class="pa-4">
              <v-alert 
                  type="info" 
                  variant="tonal" 
                  class="mb-4"
                  icon="mdi-information"
              >
                <strong>Link para Contagem:</strong> Compartilhe este link com o funcionário responsável pela contagem. 
                O link é seguro e permite acesso mobile com câmera para leitura de códigos de barras.
              </v-alert>

              <v-row dense class="mb-4">
                <v-col cols="6">
                  <div class="text-caption text-grey">Lote</div>
                  <div class="text-body-1 font-weight-bold">{{ loteVisualizando?.almoxarifadoNome }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">Total de Itens</div>
                  <div class="text-body-1 font-weight-bold">{{ loteVisualizando?.itens.length || 0 }}</div>
                </v-col>
              </v-row>

              <v-text-field
                  v-model="linkContagem"
                  label="Link de Acesso"
                  variant="outlined"
                  density="compact"
                  readonly
                  prepend-inner-icon="mdi-link"
              >
                <template #append-inner>
                  <v-btn
                      icon="mdi-content-copy"
                      size="small"
                      variant="text"
                      @click="copiarLink"
                      color="var(--text-color-laranja)"
                  ></v-btn>
                </template>
              </v-text-field>

              <div class="d-flex align-center justify-center mt-4">
                <v-chip 
                    color="success" 
                    variant="tonal"
                    prepend-icon="mdi-check-circle"
                    class="mr-2"
                >
                  Link válido por 7 dias
                </v-chip>
              </div>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn
                  color="grey"
                  variant="outlined"
                  @click="modalLinkAberto = false"
              >
                Fechar
              </v-btn>
              <v-btn
                  color="var(--text-color-laranja)"
                  variant="flat"
                  class="text-white"
                  prepend-icon="mdi-content-copy"
                  @click="copiarLink"
              >
                Copiar Link
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

    <!-- Modal Remover Item -->
    <ConfirmarAcaoModal
        v-model:modal-aberto="modalExcluirItem"
        titulo="Remover item?"
        :mensagem="`Tem certeza que deseja remover '${itemExcluirNome}' da lista de itens do inventário? O produto não é excluído do catálogo, só sai desta lista.`"
        texto-confirmar="Remover"
        icone="mdi-delete-outline"
        cor="error"
        :loading="loadingExcluir"
        :confirmar="confirmarExclusaoItem"
        :cancelar="cancelarExclusaoItem"
    />

    <!-- Modal Limpar Inventário -->
    <ConfirmarAcaoModal
        v-model:modal-aberto="modalLimparInventario"
        titulo="Limpar inventário?"
        mensagem="Tem certeza que deseja remover todos os itens adicionados ao inventário? Esta ação não pode ser desfeita."
        texto-confirmar="Limpar"
        icone="mdi-delete-sweep-outline"
        cor="error"
        :confirmar="confirmarLimparInventario"
        :cancelar="cancelarLimparInventario"
    />

    <!-- Modal Excluir Inventário (lote) -->
    <ConfirmarAcaoModal
        v-model:modal-aberto="modalExcluirLote"
        titulo="Excluir inventário?"
        :mensagem="`Tem certeza que deseja excluir o inventário de '${loteExcluirNome}'? Esta ação não pode ser desfeita.`"
        texto-confirmar="Excluir"
        icone="mdi-delete-outline"
        cor="error"
        :loading="loadingExcluirLote"
        :confirmar="confirmarExclusaoLote"
        :cancelar="cancelarExclusaoLote"
    />
      </div>
    </template>
  </top-all-pages>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useThemeStore } from '@/stores/config-temas/theme'
import { useEstoqueStore } from '@/stores/APIs/estoque'
import { useProdutosStore } from '@/stores/APIs/produtos'
import { useInventarioStore } from '@/stores/APIs/inventario'
import ConfirmarAcaoModal from '@/components/base/modais/ConfirmarAcaoModal.vue'
import { toast } from 'vue3-toastify'
import TopAllPages from '@/components/base/padrao-paginas/TopAllPages.vue'
import ExcelJS from 'exceljs/dist/exceljs.min.js'

const themeStore = useThemeStore()
const inventarioStore = useInventarioStore()
const estoqueStore = useEstoqueStore()
const produtosStore = useProdutosStore()

// Estados
const loteAberto = ref(false)
const carregandoAlmoxarifados = ref(false)
const carregandoProdutos = ref(false)
const carregandoLocalizacoes = ref(false)
const carregandoGrupos = ref(false)
const carregandoSubgrupos = ref(false)
const carregandoMarcas = ref(false)
const carregandoGridProdutos = ref(false)
const adicionandoItens = ref(false)
const processandoArquivo = ref(false)
const usarSeparador = ref(true)
const modalItensAberto = ref(false)
const loteVisualizando = ref(null)
const carregandoItensLote = ref(false)
const modalLinkAberto = ref(false)
const linkContagem = ref('')
const salvandoContagem = ref(false)
const paginaModal = ref(1)
const itensPorPaginaModal = ref(10)

const headersItensModal = [
  { title: '#', key: 'codigo', sortable: true, align: 'center', width: '15%' },
  { title: 'Produto', key: 'nome', sortable: true, width: '30%' },
  { title: 'Qtd. Sistema', key: 'estoqueSistema', sortable: true, align: 'center', width: '15%' },
  { title: 'Qtd. Contada', key: 'quantidadeContada', sortable: false, align: 'center', width: '20%' },
  { title: 'Diferença', key: 'diferenca', sortable: true, align: 'center', width: '15%' }
]

// Dados
const inventario = reactive({
  id: null,
  id_almoxarifado: null,
  tipo: 'A', // A = Automático, M = Manual
  data: new Date().toISOString().split('T')[0],
  nome_arquivo: '',
  arquivo: null,
  url: '',
  separador: '',
  separador_char: '',
  layout_dig_prod: 0,
  layout_dig_qtd: 0,
  layout_utilizado: ''
})

const itemAtual = reactive({
  codigoBarras: '',
  produtoId: null,
  localizacao: ''
})

const itensInventario = ref([])
const naoEncontradosCount = ref(0)
const produtoEncontrado = ref(null)
const lotes = ref([])
const almoxarifados = ref([])
const produtos = ref([])
const produtosGrid = ref([])
const localizacoes = ref([])
const grupos = ref([])
const subgrupos = ref([])
const marcas = ref([])

const filtroManual = reactive({
  codigo: '',
  produtoId: null,
  grupoId: null,
  subgrupoId: null,
  marcaId: null,
  localizacaoId: null
})

// Tipos de inventário
const tiposInventario = [
  { 
    title: 'Automático (Importação de Arquivo)', 
    value: 'A',
    icon: 'mdi-file-import',
    color: 'primary'
  },
  { 
    title: 'Manual (Seleção de Produtos)', 
    value: 'M',
    icon: 'mdi-keyboard',
    color: 'success'
  },
  { 
    title: 'Contagem por Link', 
    value: 'L',
    icon: 'mdi-link-variant',
    color: 'info'
  }
]

// Tipos de documento para importação
const tiposDocumento = [
  { 
    title: 'Código Interno + Quantidade', 
    value: 'cod_interno_qtd',
    icon: 'mdi-barcode'
  },
  { 
    title: 'Código de Barras + Quantidade', 
    value: 'cod_barras_qtd',
    icon: 'mdi-barcode-scan'
  },
  { 
    title: 'Código de Referência + Quantidade', 
    value: 'cod_referencia_qtd',
    icon: 'mdi-tag'
  },
  { 
    title: 'Código de Fabricação + Quantidade', 
    value: 'cod_fabricacao_qtd',
    icon: 'mdi-factory'
  },
  { 
    title: 'Código Interno + Quantidade + Localização', 
    value: 'cod_interno_qtd_loc',
    icon: 'mdi-map-marker'
  }
]

// Separadores disponíveis
const separadores = [
  { title: 'Vírgula (,)', value: ',' },
  { title: 'Ponto e vírgula (;)', value: ';' },
  { title: 'Ponto (.)', value: '.' },
  { title: 'Barra (/)', value: '/' },
  { title: 'Traço (-)', value: '-' },
  { title: 'Asterisco (*)', value: '*' },
  { title: 'Cerquilha (#)', value: '#' }
]

// Métodos
const formatarNumero = (valor) => {
  return parseFloat(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatarData = (data) => {
  if (!data) return '-'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// Filtro do dropdown "Produto": além do nome, também casa por código de barras/SKU,
// já que é comum o usuário digitar o código ali em vez do campo dedicado.
const filtrarProdutoPorNomeOuCodigo = (_itemTitle, queryText, item) => {
  if (!queryText) return true
  const query = queryText.toLowerCase()
  const produto = item.raw || {}
  const nome = (produto.descproduto || '').toLowerCase()
  const codigo = String(produto.codigo_gtin || produto.codigo_sku || '').toLowerCase()
  return nome.includes(query) || codigo.includes(query)
}

const toggleLote = () => {
  loteAberto.value = !loteAberto.value
  if (!loteAberto.value) {
    limparFormulario()
  }
}

const limparFormulario = () => {
  inventario.id = null
  inventario.id_almoxarifado = null
  inventario.tipo = 'A'
  inventario.data = new Date().toISOString().split('T')[0]
  inventario.nome_arquivo = ''
  inventario.arquivo = null
  inventario.url = ''
  inventario.separador = ''
  inventario.separador_char = ''
  inventario.layout_dig_prod = 0
  inventario.layout_dig_qtd = 0
  inventario.layout_utilizado = ''
  itensInventario.value = []
  itemAtual.codigoBarras = ''
  itemAtual.produtoId = null
  itemAtual.localizacao = ''
  produtoEncontrado.value = null
}

const finalizarLote = async () => {
  if (!inventario.id_almoxarifado) {
    toast.warning('Selecione um almoxarifado')
    return
  }

  if (itensInventario.value.length === 0) {
    toast.warning('Adicione pelo menos um item ao lote')
    return
  }

  try {
    // Buscar ID da empresa
    const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
    if (!empresaSelecionadaStr) {
      toast.error('Empresa não selecionada')
      return
    }
    
    const empresaSelecionada = JSON.parse(empresaSelecionadaStr)
    const idEmpresa = empresaSelecionada.id

    if (!idEmpresa) {
      toast.error('Empresa não identificada')
      return
    }

    // Preparar dados do inventário (id_usuario vem do token)
    const dados = {
      id_empresa: parseInt(idEmpresa),
      id_almoxarifado: inventario.id_almoxarifado,
      tipo: inventario.tipo,
      nome_arquivo: inventario.nome_arquivo || '',
      arquivo: inventario.arquivo || '',
      url: inventario.url || '',
      separador: inventario.separador || '',
      separador_char: inventario.separador_char || '',
      layout_dig_prod: inventario.layout_dig_prod || 0,
      layout_dig_qtd: inventario.layout_dig_qtd || 0,
      layout_utilizado: inventario.layout_utilizado || '',
      item: itensInventario.value.map((item, index) => ({
        id_seq: index + 1,
        id_cor: 0,
        id_tamanho: 0,
        id_produto: item.produtoId,
        codigo_barras: item.codigo || '',
        qtd_sistema: item.estoqueSistema || 0,
        qtd_contada: item.quantidadeContada || 0,
        diferenca: item.diferenca || 0,
        id_localizacao: item.localizacaoId || null
      }))
    }

    console.log('[Inventário] Dados enviados:', dados)

    // Cadastrar inventário via API
    const response = await inventarioStore.cadastrarInventario(dados)

    if (response?.data) {
      // Buscar nome do almoxarifado para exibição local
      const almoxarifado = almoxarifados.value.find(a => a.id === inventario.id_almoxarifado)
      
      const novoLote = {
        ...response.data,
        id_almoxarifado: inventario.id_almoxarifado,
        almoxarifadoNome: almoxarifado?.descalmoxarifado || 'Não identificado',
        itens: [...itensInventario.value]
      }

      lotes.value.push(novoLote)

      // Se tipo L (Contagem por Link), abrir modal de link após salvar
      if (inventario.tipo === 'L' && response.data.id) {
        gerarLinkContagem(response.data.id, parseInt(idEmpresa))
      }
    }
    
    limparFormulario()
    loteAberto.value = false
  } catch (error) {
    console.error('[Inventário] Erro ao finalizar lote:', error)
  }
}

const visualizarItensLote = async (lote) => {
  loteVisualizando.value = { ...lote, itens: [] }
  modalItensAberto.value = true

  if (!lote.id) return

  try {
    const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
    if (!empresaSelecionadaStr) return

    const empresaSelecionada = JSON.parse(empresaSelecionadaStr)
    const idEmpresa = empresaSelecionada.id
    if (!idEmpresa) return

    carregandoItensLote.value = true
    const response = await inventarioStore.obterItensInventarioNovo(parseInt(idEmpresa), lote.id, lote.id_almoxarifado)
    const dados = response?.data || response

    if (dados) {
      const itensApi = Array.isArray(dados) ? dados : (dados.itens || dados.item || dados.data || [])
      const itensMapeados = itensApi.map(item => {
        const produto = item.referencia_produto || {}
        return {
          id_seq: item.id_seq,
          produtoId: item.id_produto,
          codigo: produto.codigo_gtin || item.codigo_gtin || item.codigo_barras || '',
          nome: produto.descproduto || item.descproduto || `Produto #${item.id_produto}`,
          estoqueSistema: item.qtd_sistema || 0,
          quantidadeContada: item.qtd_contada || 0,
          diferenca: item.qtd_diferenca || 0
        }
      })

      loteVisualizando.value = {
        ...loteVisualizando.value,
        ...dados,
        almoxarifadoNome: lote.almoxarifadoNome,
        itens: itensMapeados
      }
    }
  } catch (error) {
    console.error('[Inventário] Erro ao carregar itens do lote:', error)
    toast.error('Erro ao carregar itens do lote')
  } finally {
    carregandoItensLote.value = false
  }
}

const modalExcluirLote = ref(false)
const loteExcluirIndex = ref(null)
const loteExcluirNome = ref('')
const loadingExcluirLote = ref(false)

const abrirModalExcluirLote = (index) => {
  loteExcluirIndex.value = index
  loteExcluirNome.value = lotes.value[index]?.almoxarifadoNome || `Inventário #${lotes.value[index]?.id ?? ''}`
  modalExcluirLote.value = true
}

const cancelarExclusaoLote = () => {
  modalExcluirLote.value = false
  loteExcluirIndex.value = null
}

const confirmarExclusaoLote = async () => {
  const index = loteExcluirIndex.value
  if (index === null) return

  const lote = lotes.value[index]

  loadingExcluirLote.value = true
  try {
    // Se o lote tem ID, cancelar via API
    if (lote.id) {
      const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
      if (!empresaSelecionadaStr) {
        toast.error('Empresa não selecionada')
        return
      }

      const empresaSelecionada = JSON.parse(empresaSelecionadaStr)
      const idEmpresa = empresaSelecionada.id

      if (!idEmpresa) {
        toast.error('Empresa não identificada')
        return
      }

      await inventarioStore.cancelarInventario(parseInt(idEmpresa), lote.id)
    }

    // Remover do array local
    lotes.value.splice(index, 1)
  } catch (error) {
    console.error('[Inventário] Erro ao excluir lote:', error)
    toast.error('Erro ao excluir inventário')
  } finally {
    loadingExcluirLote.value = false
    modalExcluirLote.value = false
    loteExcluirIndex.value = null
  }
}

const getDiferencaClass = (diferenca) => {
  if (diferenca > 0) return 'diferenca-positiva'
  if (diferenca < 0) return 'diferenca-negativa'
  return ''
}

const salvarContagem = async () => {
  if (!loteVisualizando.value?.itens?.length) {
    toast.warning('Nenhum item para salvar')
    return
  }

  salvandoContagem.value = true
  try {
    const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
    if (!empresaSelecionadaStr) {
      toast.error('Empresa não selecionada')
      return
    }
    const idEmpresa = JSON.parse(empresaSelecionadaStr).id

    const itens = loteVisualizando.value.itens.map(item => ({
      id_seq: item.id_seq,
      id_produto: item.produtoId,
      qtd_contada: item.quantidadeContada || 0,
      qtd_diferenca: item.diferenca || 0,
      id_cor: 0,
      id_tamanho: 0,
    }))

    await inventarioStore.atualizarItemInventario(
      parseInt(idEmpresa),
      loteVisualizando.value.id,
      itens,
      loteVisualizando.value.id_almoxarifado
    )
  } catch (error) {
    console.error('[Inventário] Erro ao salvar contagem:', error)
  } finally {
    salvandoContagem.value = false
  }
}

const getDescricaoLocalizacao = (localizacaoId) => {
  if (!localizacaoId) return ''
  const loc = localizacoes.value.find(l => l.id === localizacaoId)
  return loc ? loc.descricao : ''
}

const processarArquivo = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    inventario.nome_arquivo = file.name
  }
}

const importarArquivo = async () => {
  if (!inventario.id_almoxarifado) {
    toast.warning('Selecione um almoxarifado primeiro')
    return
  }

  if (!inventario.arquivo) {
    toast.warning('Selecione um arquivo')
    return
  }

  if (!inventario.layout_utilizado) {
    toast.warning('Selecione o tipo de documento')
    return
  }

  if (usarSeparador.value && !inventario.separador_char) {
    toast.warning('Selecione o separador')
    return
  }

  if (!usarSeparador.value && (!inventario.layout_dig_prod || !inventario.layout_dig_qtd)) {
    toast.warning('Informe os tamanhos dos campos')
    return
  }

  processandoArquivo.value = true
  try {
    const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
    if (!empresaSelecionadaStr) { toast.error('Empresa não selecionada'); return }
    const idEmpresa = JSON.parse(empresaSelecionadaStr).id

    const resultado = await inventarioStore.processarArquivoInventario(inventario.arquivo, {
      id_empresa: idEmpresa,
      id_almoxarifado: inventario.id_almoxarifado,
      layout_utilizado: inventario.layout_utilizado,
      usar_separador: usarSeparador.value,
      separador_char: usarSeparador.value ? inventario.separador_char : undefined,
      layout_dig_prod: !usarSeparador.value ? inventario.layout_dig_prod : undefined,
      layout_dig_qtd: !usarSeparador.value ? inventario.layout_dig_qtd : undefined
    })

    if (!resultado) {
      toast.error('Erro ao processar arquivo - resposta vazia')
      return
    }

    const itens = resultado.itens || []

    for (const item of itens) {
      if (!item.encontrado || !item.produto) continue

      const jaExiste = itensInventario.value.find(i => i.codigo === item.codigo_barras)
      if (jaExiste) continue

      const qtdSistema = item.produto?.saldo_atual || item.produto?.quantidade || 0
      const qtdContada = item.quantidade || 0

      itensInventario.value.push({
        produtoId: item.produto.id,
        codigo: item.codigo_barras || item.produto.codigo_gtin || item.produto.codigo_sku || '',
        nome: item.produto.descricao || item.produto.descproduto || item.produto.nome || item.produto.produto || '',
        fotoUrl: item.produto.foto_url || '',
        marca: item.produto.marca || '',
        categoria: item.produto.categoria || '',
        ncm: item.produto.ncm || '',
        cestCodigo: item.produto.cest_codigo || '',
        precoMedio: item.produto.preco_medio || 0,
        estoqueSistema: qtdSistema,
        quantidadeContada: qtdContada,
        diferenca: qtdSistema - qtdContada,
        unidade: item.produto.unidade || item.produto.embalagem || 'UN',
        localizacaoId: null,
        localizacao: '',
        encontrado: true,
        erro: null
      })
    }

    const total = resultado.total_linhas || 0
    const encontrados = resultado.encontrados || 0
    const naoEncontrados = resultado.nao_encontrados || 0
    const invalidas = resultado.invalidas || 0

    naoEncontradosCount.value = naoEncontrados

    if (total > 0) {
      toast.success(`Arquivo processado: ${total} linha(s)`)
    }
    if (encontrados > 0) {
      toast.success(`${encontrados} produto(s) encontrado(s) e adicionado(s)`)
    }
    if (invalidas > 0) {
      toast.warning(`${invalidas} linha(s) inválida(s) ignoradas`)
    }
    if (encontrados === 0 && naoEncontrados === 0 && invalidas === 0) {
      toast.info('Nenhum produto foi processado')
    }
  } catch (error) {
    toast.error('Erro ao processar arquivo')
    console.error('[Inventário] Erro:', error)
  } finally {
    processandoArquivo.value = false
  }
}



const modalExcluirItem = ref(false)
const itemExcluirIndex = ref(null)
const itemExcluirNome = ref('')
const loadingExcluir = ref(false)

const abrirModalExcluir = (index) => {
  itemExcluirIndex.value = index
  itemExcluirNome.value = itensInventario.value[index]?.nome || 'item'
  modalExcluirItem.value = true
}

const confirmarExclusaoItem = () => {
  if (itemExcluirIndex.value !== null) {
    itensInventario.value.splice(itemExcluirIndex.value, 1)
    toast.info('Item removido do inventário')
  }
  modalExcluirItem.value = false
  itemExcluirIndex.value = null
}

const cancelarExclusaoItem = () => {
  modalExcluirItem.value = false
  itemExcluirIndex.value = null
}

const modalLimparInventario = ref(false)

const limparInventario = () => {
  modalLimparInventario.value = true
}

const confirmarLimparInventario = () => {
  itensInventario.value = []
  naoEncontradosCount.value = 0
  toast.success('Inventário limpo')
  modalLimparInventario.value = false
}

const cancelarLimparInventario = () => {
  modalLimparInventario.value = false
}

const imprimirInventario = () => {
  toast.info('Impressão em desenvolvimento')
}

const carregarImagemComoPng = async (url) => {
  if (!url) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    const bitmap = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    canvas.getContext('2d').drawImage(bitmap, 0, 0)
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

const exportarExcel = async () => {
  if (itensInventario.value.length === 0) {
    toast.warning('Nenhum item para exportar')
    return
  }

  toast.info('Gerando planilha, aguarde...')

  const LARANJA = 'FFF57C00'
  const LARANJA_CLARO = 'FFFCE4C4'
  const BRANCO = 'FFFFFFFF'
  const CINZA_ZEBRA = 'FFF7F7F7'
  const BORDA = { style: 'thin', color: { argb: 'FFE0E0E0' } }

  const colunas = [
    { header: 'Foto', width: 10 },
    { header: 'Código', width: 16 },
    { header: 'Produto', width: 42 },
    { header: 'Marca', width: 16 },
    { header: 'Categoria', width: 18 },
    { header: 'NCM', width: 12 },
    { header: 'CEST', width: 12 },
    { header: 'Un.', width: 8 },
    { header: 'Preço Médio', width: 14 },
    { header: 'Qtd. Sistema', width: 13 },
    { header: 'Qtd. Contada', width: 13 },
    { header: 'Diferença', width: 12 }
  ]
  const TOTAL_COLUNAS = colunas.length

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SimplesFique'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Inventário', {
    views: [{ state: 'frozen', ySplit: 3 }]
  })
  sheet.columns = colunas.map(c => ({ width: c.width }))

  sheet.mergeCells(1, 1, 1, TOTAL_COLUNAS)
  const tituloCell = sheet.getCell(1, 1)
  tituloCell.value = 'SimplesFique  ·  Relatório de Inventário'
  tituloCell.font = { bold: true, size: 16, color: { argb: BRANCO } }
  tituloCell.alignment = { vertical: 'middle', horizontal: 'center' }
  tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LARANJA } }
  sheet.getRow(1).height = 34

  sheet.mergeCells(2, 1, 2, TOTAL_COLUNAS)
  const subCell = sheet.getCell(2, 1)
  subCell.value = `Inventário de ${formatarData(inventario.data)}  ·  ${itensInventario.value.length} itens`
  subCell.font = { italic: true, size: 11, color: { argb: 'FF5A5A5A' } }
  subCell.alignment = { vertical: 'middle', horizontal: 'center' }
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LARANJA_CLARO } }
  sheet.getRow(2).height = 22

  const headerRow = sheet.getRow(3)
  colunas.forEach((c, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = c.header
    cell.font = { bold: true, color: { argb: BRANCO } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LARANJA } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = { top: BORDA, left: BORDA, bottom: BORDA, right: BORDA }
  })
  headerRow.height = 24

  let falhaImagens = 0

  for (let i = 0; i < itensInventario.value.length; i++) {
    const item = itensInventario.value[i]
    const numeroLinha = 4 + i
    const row = sheet.getRow(numeroLinha)
    row.height = 44

    row.getCell(2).value = item.codigo
    row.getCell(3).value = item.nome
    row.getCell(4).value = item.marca || '-'
    row.getCell(5).value = item.categoria || '-'
    row.getCell(6).value = item.ncm || '-'
    row.getCell(7).value = item.cestCodigo || '-'
    row.getCell(8).value = item.unidade
    row.getCell(9).value = Number(item.precoMedio) || 0
    row.getCell(9).numFmt = '"R$" #,##0.00'
    row.getCell(10).value = item.estoqueSistema
    row.getCell(11).value = item.quantidadeContada
    row.getCell(12).value = item.diferenca

    const corDiferenca = item.diferenca > 0 ? 'FF2E7D32' : item.diferenca < 0 ? 'FFC62828' : 'FF757575'
    row.getCell(12).font = { bold: true, color: { argb: corDiferenca } }

    for (let col = 1; col <= TOTAL_COLUNAS; col++) {
      const cell = row.getCell(col)
      cell.alignment = { vertical: 'middle', horizontal: col === 3 ? 'left' : 'center', wrapText: col === 3 }
      cell.border = { top: BORDA, left: BORDA, bottom: BORDA, right: BORDA }
      if (i % 2 === 1 && col !== 12) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CINZA_ZEBRA } }
      }
    }

    const imagemBase64 = await carregarImagemComoPng(item.fotoUrl)
    if (imagemBase64) {
      const imageId = workbook.addImage({ base64: imagemBase64, extension: 'png' })
      sheet.addImage(imageId, {
        tl: { col: 0.15, row: numeroLinha - 1 + 0.08 },
        ext: { width: 38, height: 38 }
      })
    } else if (item.fotoUrl) {
      falhaImagens++
    }
  }

  const linhaTotal = 4 + itensInventario.value.length
  sheet.mergeCells(linhaTotal, 1, linhaTotal, 8)
  const totalLabelCell = sheet.getCell(linhaTotal, 1)
  totalLabelCell.value = `TOTAL — ${itensInventario.value.length} itens`
  totalLabelCell.font = { bold: true }
  totalLabelCell.alignment = { vertical: 'middle', horizontal: 'right' }
  totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LARANJA_CLARO } }

  const colSistema = sheet.getCell(linhaTotal, 10)
  const colContada = sheet.getCell(linhaTotal, 11)
  const colDiferenca = sheet.getCell(linhaTotal, 12)
  colSistema.value = { formula: `SUM(J4:J${linhaTotal - 1})` }
  colContada.value = { formula: `SUM(K4:K${linhaTotal - 1})` }
  colDiferenca.value = { formula: `SUM(L4:L${linhaTotal - 1})` }
  ;[totalLabelCell, colSistema, colContada, colDiferenca].forEach(cell => {
    cell.font = { ...(cell.font || {}), bold: true }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LARANJA_CLARO } }
    cell.border = { top: BORDA, left: BORDA, bottom: BORDA, right: BORDA }
  })
  ;[colSistema, colContada, colDiferenca].forEach(cell => {
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })
  sheet.getRow(linhaTotal).height = 24

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `inventario-${inventario.data}.xlsx`
  link.click()
  URL.revokeObjectURL(link.href)

  if (falhaImagens > 0) {
    toast.warning(`Planilha exportada, mas ${falhaImagens} foto(s) não puderam ser incluídas`)
  } else {
    toast.success('Planilha exportada com sucesso')
  }
}

const gerarLinkContagem = (loteIdParam = null, idEmpresaParam = null) => {
  let loteId = loteIdParam
  let idEmpresa = idEmpresaParam

  if (!loteId) {
    toast.error('Este lote não possui ID válido para gerar o link')
    return
  }

  if (!idEmpresa) {
    const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
    if (!empresaSelecionadaStr) {
      toast.error('Empresa não selecionada')
      return
    }
    idEmpresa = JSON.parse(empresaSelecionadaStr).id
    if (!idEmpresa) {
      toast.error('Empresa não identificada')
      return
    }
  }

  // Gerar token único para o lote
  const token = gerarToken()

  // Construir URL com empresa e id do inventário
  const baseUrl = window.location.origin
  linkContagem.value = `${baseUrl}/inventario/contagem/${idEmpresa}/${loteId}?token=${token}`

  // Abrir modal com o link
  modalLinkAberto.value = true
}

const gerarToken = () => {
  // Gerar token criptograficamente seguro
  const array = new Uint32Array(4)
  crypto.getRandomValues(array)
  return Array.from(array, v => v.toString(36)).join('')
}

const copiarLink = async () => {
  try {
    await navigator.clipboard.writeText(linkContagem.value)
    toast.success('Link copiado para a área de transferência!')
  } catch (error) {
    toast.error('Erro ao copiar link')
    console.error(error)
  }
}

const buscarPorCodigo = async () => {
  const codigo = filtroManual.codigo
  if (!codigo) return

  const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
  if (!empresaSelecionadaStr) { toast.error('Empresa não selecionada'); return }
  const idEmpresa = JSON.parse(empresaSelecionadaStr).id

  if (!inventario.id_almoxarifado) {
    toast.warning('Selecione um almoxarifado primeiro')
    return
  }

  try {
    let produto = produtosGrid.value.find(p =>
      String(p.id_produto) === codigo ||
      p.codigo_gtin === codigo
    )

    if (!produto) {
      const ref = await inventarioStore.buscarProdutoReferencia(codigo)
      if (!ref) {
        toast.warning('Produto não encontrado')
        return
      }
      const importado = await inventarioStore.importarProdutoReferencia(codigo)
      if (!importado) {
        toast.warning('Erro ao importar produto')
        return
      }
      produto = normalizarProdutoGrid(importado)
      produtosGrid.value.push(produto)
    }

    const produtoId = produto.id_produto
    filtroManual.produtoId = produtoId

    if (itensInventario.value.find(i => i.produtoId === produtoId)) {
      toast.info('Produto já está no inventário')
      return
    }

    let qtdSistema = 0
    try {
      const saldoData = await inventarioStore.consultarSaldoProdutoAlmoxarifado(
        idEmpresa, inventario.id_almoxarifado, produtoId
      )
      qtdSistema = saldoData?.saldo || saldoData?.quantidade || 0
    } catch {
      console.warn('[Inventário] Erro ao buscar saldo, usando 0')
    }

    itensInventario.value.push({
      produtoId,
      codigo: produto.codigo_gtin || produto.id_produto,
      nome: produto.descproduto,
      estoqueSistema: qtdSistema,
      quantidadeContada: 0,
      diferenca: 0,
      unidade: produto.abreviatura || 'UN',
      localizacaoId: null,
      localizacao: ''
    })

    toast.success(`Produto "${produto.descproduto}" adicionado`)
  } catch (error) {
    toast.error('Erro ao buscar produto')
  }
}

const onGrupoChange = async (grupoId) => {
  filtroManual.subgrupoId = null
  subgrupos.value = []
  if (!grupoId) return

  carregandoSubgrupos.value = true
  try {
    await estoqueStore.buscarTodosSubgrupos(grupoId)
    subgrupos.value = estoqueStore.subgrupos || []
  } catch (error) {
    console.error('[Inventário] Erro ao carregar subgrupos:', error)
  } finally {
    carregandoSubgrupos.value = false
  }
}

// Normaliza os itens de /estoque/produto-almoxarifados: a API retorna o produto
// aninhado em `item.produto` (mesmo padrão do endpoint de processar-arquivo), mas o
// v-autocomplete precisa de id_produto/descproduto no nível raiz do item — sem isso
// o Vuetify usa o objeto inteiro como valor selecionado e exibe "[object Object]".
const normalizarProdutoGrid = (item) => {
  const produto = item.produto || item
  const id = item.id_produto ?? produto.id_produto ?? produto.id ?? item.id ?? null
  return {
    ...item,
    id_produto: id,
    descproduto: item.descproduto || produto.descproduto || produto.descricao || produto.nome || produto.produto || `Produto #${id}`,
    codigo_gtin: item.codigo_gtin || produto.codigo_gtin || produto.codigo_sku || produto.codigo_barras || '',
    codigo_sku: item.codigo_sku || produto.codigo_sku || '',
    abreviatura: item.abreviatura || produto.abreviatura || produto.unidade || 'UN',
    quantidade: item.quantidade ?? item.saldo ?? item.saldo_atual ?? produto.saldo_atual ?? produto.quantidade ?? 0
  }
}

const buscarGridInventario = async () => {
  if (!inventario.id_almoxarifado) {
    toast.warning('Selecione um almoxarifado primeiro')
    return
  }

  // Se o usuário preencheu "Buscar por Código", o botão "Listar Produtos ao Inventário"
  // deve trazer só aquele produto (via /produtos/referencia/{gtin}) — não a listagem em
  // massa filtrada por grupo/marca/localização, que ignoraria o código digitado.
  if (filtroManual.codigo) {
    await buscarPorCodigo()
    return
  }

  const nenhumFiltroSelecionado = !filtroManual.produtoId && !filtroManual.grupoId &&
      !filtroManual.subgrupoId && !filtroManual.marcaId && !filtroManual.localizacaoId

  if (nenhumFiltroSelecionado) {
    toast.warning('Selecione ao menos um filtro (produto, grupo, subgrupo, marca ou localização) antes de listar. Para adicionar um único item por código de barras, use o campo "Buscar por Código".')
    return
  }

  adicionandoItens.value = true
  try {
    const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
    if (!empresaSelecionadaStr) { toast.error('Empresa não selecionada'); return }
    const idEmpresa = JSON.parse(empresaSelecionadaStr).id

    // Passa os filtros como query params para a API
    const filtros = {
      idpro: filtroManual.produtoId || undefined,
      idgrp: filtroManual.grupoId || undefined,
      idsbg: filtroManual.subgrupoId || undefined,
      idmar: filtroManual.marcaId || undefined,
      idloc: filtroManual.localizacaoId || undefined
    }

    await inventarioStore.buscarGridInventario(parseInt(idEmpresa), inventario.id_almoxarifado, filtros)
    const produtosFiltrados = (inventarioStore.gridProdutos || []).map(normalizarProdutoGrid)

    if (produtosFiltrados.length === 0) {
      toast.warning('Nenhum produto encontrado com os filtros selecionados')
      return
    }

    const localizacaoId = filtroManual.localizacaoId || null
    let adicionados = 0
    for (const produto of produtosFiltrados) {
      if (itensInventario.value.find(i => i.produtoId === produto.id_produto)) continue

      const qtdSistema = parseFloat(produto.quantidade) || 0
      itensInventario.value.push({
        produtoId: produto.id_produto,
        codigo: produto.codigo_gtin || produto.id_produto,
        nome: produto.descproduto,
        estoqueSistema: qtdSistema,
        quantidadeContada: 0,
        diferenca: 0,
        unidade: produto.abreviatura || 'UN',
        localizacaoId,
        localizacao: getDescricaoLocalizacao(localizacaoId)
      })
      adicionados++
    }

    if (adicionados > 0) {
      toast.success(`${adicionados} produto(s) adicionado(s) ao inventário`)
    } else {
      toast.info('Todos os produtos filtrados já estavam no inventário')
    }
  } catch (error) {
    console.error('[Inventário] Erro ao adicionar itens manuais:', error)
    toast.error('Erro ao adicionar produtos')
  } finally {
    adicionandoItens.value = false
  }
}

// Carregamento preguiçoso: só busca a grade quando o dropdown "Produto" é aberto,
// não ao selecionar o almoxarifado — evita bater em /estoque/produto-almoxarifados
// (a listagem completa) em fluxos que não precisam dela, como a busca por código de barras.
const carregarGridProdutos = async () => {
  if (!inventario.id_almoxarifado || produtosGrid.value.length > 0) return
  carregandoGridProdutos.value = true
  try {
    const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
    if (!empresaSelecionadaStr) return
    const idEmpresa = JSON.parse(empresaSelecionadaStr).id
    await inventarioStore.buscarGridInventario(parseInt(idEmpresa), inventario.id_almoxarifado)
    produtosGrid.value = (inventarioStore.gridProdutos || []).map(normalizarProdutoGrid)
    console.log('[Inventário] Grid de produtos carregada:', produtosGrid.value.length, 'produtos')
  } catch (error) {
    console.error('[Inventário] Erro ao carregar grid de produtos:', error)
  } finally {
    carregandoGridProdutos.value = false
  }
}

// Ao trocar de almoxarifado, só limpa o cache — o recarregamento acontece
// sob demanda (ver carregarGridProdutos), quando o dropdown "Produto" é aberto.
watch(() => inventario.id_almoxarifado, () => {
  produtosGrid.value = []
})

// Carregar dados iniciais
const carregarGrupos = async () => {
  carregandoGrupos.value = true
  try {
    await estoqueStore.buscarTodos('')
    grupos.value = estoqueStore.grupos || []
  } catch (error) {
    console.error('[Inventário] Erro ao carregar grupos:', error)
  } finally {
    carregandoGrupos.value = false
  }
}

const carregarMarcas = async () => {
  carregandoMarcas.value = true
  try {
    await produtosStore.buscarMarcas()
    marcas.value = produtosStore.marcas || []
  } catch (error) {
    console.error('[Inventário] Erro ao carregar marcas:', error)
  } finally {
    carregandoMarcas.value = false
  }
}

const carregarAlmoxarifados = async () => {
  carregandoAlmoxarifados.value = true
  try {
    // Buscar ID da empresa
    const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
    if (!empresaSelecionadaStr) {
      toast.error('Empresa não selecionada')
      return
    }
    
    const empresaSelecionada = JSON.parse(empresaSelecionadaStr)
    const idEmpresa = empresaSelecionada.id

    if (!idEmpresa) {
      toast.error('Empresa não identificada')
      return
    }

    // Buscar almoxarifados da API
    await estoqueStore.buscarAlmoxarifados(idEmpresa)
    almoxarifados.value = estoqueStore.almoxarifados || []
    
    console.log('[Inventário] Almoxarifados carregados:', almoxarifados.value)
  } catch (error) {
    console.error('[Inventário] Erro ao carregar almoxarifados:', error)
    toast.error('Erro ao carregar almoxarifados')
  } finally {
    carregandoAlmoxarifados.value = false
  }
}

const carregarProdutos = async () => {
  carregandoProdutos.value = true
  try {
    // Buscar produtos da API
    await produtosStore.buscarProdutos()
    produtos.value = produtosStore.produtos || []
    
    console.log('[Inventário] Produtos carregados:', produtos.value)
  } catch (error) {
    console.error('[Inventário] Erro ao carregar produtos:', error)
    toast.error('Erro ao carregar produtos')
  } finally {
    carregandoProdutos.value = false
  }
}

const carregarLocalizacoes = async () => {
  carregandoLocalizacoes.value = true
  try {
    // Buscar ID da empresa
    const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
    if (!empresaSelecionadaStr) {
      toast.error('Empresa não selecionada')
      return
    }
    
    const empresaSelecionada = JSON.parse(empresaSelecionadaStr)
    const idEmpresa = empresaSelecionada.id

    if (!idEmpresa) {
      toast.error('Empresa não identificada')
      return
    }

    // Buscar localizações da API
    await produtosStore.buscarLocalizacoes(idEmpresa)
    localizacoes.value = produtosStore.localizacoes || []
    
    console.log('[Inventário] Localizações carregadas:', localizacoes.value)
  } catch (error) {
    console.error('[Inventário] Erro ao carregar localizações:', error)
    toast.error('Erro ao carregar localizações')
  } finally {
    carregandoLocalizacoes.value = false
  }
}

const carregarInventarios = async () => {
  try {
    const empresaSelecionadaStr = localStorage.getItem('empresaSelecionada')
    if (!empresaSelecionadaStr) {
      toast.error('Empresa não selecionada')
      return
    }
    
    const empresaSelecionada = JSON.parse(empresaSelecionadaStr)
    const idEmpresa = empresaSelecionada.id

    if (!idEmpresa) {
      toast.error('Empresa não identificada')
      return
    }

    await inventarioStore.listarInventarios(parseInt(idEmpresa))
    // Mapear campos da API e garantir que cada lote tenha o array de itens
    lotes.value = (inventarioStore.inventarios || []).map(lote => {
      const desc = (lote.descsituacao || '').toUpperCase()
      const situacao = desc === 'ENCERRADO' ? 'E' : desc === 'CANCELADO' ? 'C' : 'A'
      return {
        ...lote,
        almoxarifadoNome: lote.referencia_almoxarifado?.descalmoxarifado || lote.descalmoxarifado || lote.almoxarifadoNome || 'Não identificado',
        data: lote.dtgeracao ? lote.dtgeracao.split('T')[0] : lote.data,
        situacao,
        descsituacao: lote.descsituacao || '',
        desctipo: lote.desctipo || (lote.tipo === 'M' ? 'MANUAL' : lote.tipo === 'A' ? 'AUTOMÁTICO' : ''),
        qtd_item: lote.qtd_item ?? 0,
        itens: lote.itens || []
      }
    })
    
    console.log('[Inventário] Inventários carregados:', lotes.value)
  } catch (error) {
    console.error('[Inventário] Erro ao carregar inventários:', error)
  }
}

onMounted(async () => {
  await carregarAlmoxarifados()
  await carregarProdutos()
  await carregarLocalizacoes()
  await carregarGrupos()
  await carregarMarcas()
  await carregarInventarios()
})
</script>

<style scoped>
.inventario-table {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.inventario-table thead tr {
  background-color: var(--text-color-laranja);
}

.inventario-table thead th {
  color: white !important;
  font-weight: 700 !important;
}

.inventario-table tbody tr td,
.inventario-table tfoot tr td {
  color: var(--text-color) !important;
}

.diferenca-positiva {
  background-color: rgba(76, 175, 80, 0.1) !important;
}

.diferenca-negativa {
  background-color: rgba(244, 67, 54, 0.1) !important;
}

.inventario-table tfoot tr {
  background-color: rgba(var(--text-color-laranja), 0.1);
  border-top: 2px solid var(--text-color-laranja);
}

/* Modo escuro */
:deep(.v-table) {
  background-color: transparent;
}

:deep(.v-table__wrapper) {
  background-color: var(--background-card);
}

/* v-data-table - tema escuro */
:deep(.v-data-table) {
  background-color: transparent !important;
}

:deep(.v-data-table .v-data-table__wrapper) {
  background-color: var(--background-card);
}

:deep(.v-data-table thead tr th) {
  background-color: var(--text-color-laranja) !important;
  color: white !important;
  font-weight: 700 !important;
}

:deep(.v-data-table tbody tr td) {
  color: var(--text-color) !important;
}

:deep(.v-data-table .v-data-table-footer) {
  background-color: var(--background-card);
  color: var(--text-color) !important;
}

:deep(.v-data-table .v-data-table-footer .v-field__input),
:deep(.v-data-table .v-data-table-footer .v-select__selection-text) {
  color: var(--text-color) !important;
}
</style>
