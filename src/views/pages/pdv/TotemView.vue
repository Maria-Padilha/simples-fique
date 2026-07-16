<template>
  <top-all-pages icon="mdi-monitor-multiple">
    <template #titulo>Terminais de Vendas</template>
    <template #section>
      <!-- CADASTRO DO TERMINAL -->
      <v-card class="background-secondary mb-4" elevation="0">
        <v-card-text class="pa-4">
          <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-4">
            <div>
              <h2 class="section-title mb-1">Cadastro de terminais</h2>
              <p class="section-subtitle">
                O executável do totem e as aplicações de comandas/chamados farão login e escolherão o terminal pela API.
              </p>
            </div>

            <v-btn
                color="var(--text-color-laranja)"
                variant="flat"
                class="text-white"
                :prepend-icon="formularioAberto ? 'mdi-close' : 'mdi-plus'"
                @click="toggleFormulario"
            >
              {{ formularioAberto ? 'Cancelar' : 'Novo terminal' }}
            </v-btn>
          </div>

          <v-expand-transition>
            <div v-if="formularioAberto">
              <v-card class="background-card mb-7 form-card" elevation="2">
                <v-card-title class="text-h6 pa-4">
                  <v-icon :icon="editando ? 'mdi-pencil' : 'mdi-plus'" class="mr-2" />
                  {{ editando ? 'Editar Terminal' : 'Novo Terminal' }}
                </v-card-title>

                <v-card-text class="pa-4">
                  <v-form ref="formRef" v-model="formValido">
                    <v-row>
                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model="formData.descricao"
                            label="Nome do terminal"
                            placeholder="Ex: Terminal Entrada Principal"
                            :rules="[rules.required]"
                            variant="outlined"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model="formData.codigo"
                            label="Código interno"
                            placeholder="Ex: TERM-ENTRADA-01"
                            :rules="[rules.required]"
                            variant="outlined"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-select
                            v-model="formData.modo_ticket"
                            :items="modoTicketOptions"
                            item-title="title"
                            item-value="value"
                            label="Modo de emissão de ticket"
                            variant="outlined"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model="formData.senha_terminal"
                            label="Definir senha"
                            placeholder="Senha para acessar os paineis do terminal"
                            variant="outlined"
                            :append-inner-icon="verSenha ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                            :type="verSenha ? 'text' : 'password'"
                            @click:append-inner="verSenha = !verSenha"
                        />
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model.number="formData.valor_couvert_padrao"
                            label="Couvert padrão (R$)"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Ex: 10.00"
                            variant="outlined"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                            v-model.number="formData.percentual_taxa_servico_padrao"
                            label="Taxa de serviço padrão (%)"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="Ex: 10"
                            variant="outlined"
                        />
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12" md="3">
                        <v-switch
                            v-model="formData.ativo"
                            label="Terminal ativo"
                            color="var(--text-color-laranja)"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-switch
                            v-model="formData.permite_sincronizacao"
                            label="Permitir sincronização"
                            color="var(--text-color-laranja)"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-switch
                            v-model="formData.emite_cupom_fiscal"
                            label="Emitir cupom fiscal"
                            color="var(--text-color-laranja)"
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-switch
                            v-model="formData.emite_ticket"
                            label="Emitir tickets"
                            color="var(--text-color-laranja)"
                        />
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12">
                        <v-textarea
                            v-model="formData.observacao"
                            label="Observação interna"
                            placeholder="Ex: Terminal usado na entrada do salão principal."
                            variant="outlined"
                            rows="2"
                        />
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>

                <v-card-actions class="pa-4">
                  <v-spacer />
                  <v-btn color="grey" variant="text" @click="cancelarFormulario">
                    Cancelar
                  </v-btn>

                  <v-btn
                      color="var(--text-color-laranja)"
                      :loading="loading"
                      :disabled="!formValido"
                      variant="flat"
                      class="text-white"
                      @click="salvarTotem"
                  >
                    {{ editando ? 'Atualizar' : 'Salvar' }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-expand-transition>

          <v-text-field
              v-if="!formularioAberto"
              v-model="search"
              label="Pesquisar terminal"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              class="mb-4"
              clearable
          />

          <v-data-table
              v-if="!formularioAberto"
              :headers="headers"
              :items="itemsFiltrados"
              :loading="loading"
              item-value="id"
              class="background-card rounded-lg"
          >
            <template v-slot:[`item.ativo`]="{ item }">
              <v-chip :color="itemRaw(item).ativo ? 'success' : 'error'" size="small">
                {{ itemRaw(item).ativo ? 'Ativo' : 'Inativo' }}
              </v-chip>
            </template>

            <template v-slot:[`item.permite_sincronizacao`]="{ item }">
              <v-chip :color="itemRaw(item).permite_sincronizacao ? 'info' : 'default'" size="small" variant="tonal">
                {{ itemRaw(item).permite_sincronizacao ? 'Sincroniza' : 'Bloqueado' }}
              </v-chip>
            </template>

            <template v-slot:[`item.ultima_sincronizacao`]="{ item }">
              {{ formatarData(itemRaw(item).ultima_sincronizacao) }}
            </template>

            <template v-slot:[`item.actions`]="{ item }">
              <div class="d-flex ga-2 flex-wrap">
                <v-btn
                    icon="mdi-cog"
                    size="small"
                    variant="text"
                    color="var(--text-color-laranja)"
                    title="Configurar terminal"
                    @click="abrirConfiguracaoTotem(itemRaw(item))"
                />

                <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    color="info"
                    title="Editar terminal"
                    @click="editarTotem(itemRaw(item))"
                />

                <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    title="Excluir terminal"
                    @click="excluirTotem(itemRaw(item))"
                />
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <!-- CONFIGURAÇÃO DO TERMINAL -->
      <v-dialog
          v-model="dialogConfigTotem"
          fullscreen
          scrollable
          transition="dialog-bottom-transition"
      >
        <v-card class="config-terminal-page">
          <v-toolbar class="config-toolbar" elevation="0">
            <v-btn icon="mdi-close" variant="text" @click="fecharConfiguracaoTotem" />

            <v-toolbar-title>
              <div class="d-flex flex-column">
                <strong class="text-xl">Configuração do Terminal</strong>
              </div>
            </v-toolbar-title>

            <v-spacer />

            <v-btn
                color="var(--text-color-laranja)"
                variant="flat"
                class="text-white mr-4"
                prepend-icon="mdi-sync"
                :loading="carregandoConfigTerminal"
                :disabled="carregandoConfigTerminal"
                @click="sincronizarProdutosTerminal"
            >
              Sincronizar produtos
            </v-btn>
          </v-toolbar>

          <v-progress-linear
              v-if="carregandoConfigTerminal"
              indeterminate
              color="var(--text-color-laranja)"
              height="3"
          />

          <v-card-text v-if="terminalConfigurando" class="config-content pa-0">
            <v-overlay
                :model-value="carregandoConfigTerminal"
                contained
                persistent
                scrim="rgba(0, 0, 0, 0.35)"
                class="align-center justify-center"
            >
              <div class="d-flex flex-column align-center">
                <v-progress-circular indeterminate size="48" width="4" color="var(--text-color-laranja)" />
                <span class="mt-3 text-body-2" style="color: #fff;">Carregando configuração do terminal...</span>
              </div>
            </v-overlay>

            <section class="config-hero">
              <div>
                <h1 class="text-capitalize">{{ terminalConfigurando.descricao }}</h1>
                <p>
                  Monte ambientes, menus laterais e produtos que serão usados pelo executável do totem e pelos fronts separados via API.
                </p>
              </div>
            </section>

            <section class="config-layout">
              <!-- RESUMO LATERAL -->
              <aside class="summary-panel">
                <h2>Resumo</h2>

                <div class="summary-item">
                  <strong>{{ ambientesTerminalConfig.length }} ambientes</strong>
                  <span>{{ resumoAmbientes }}</span>
                </div>

                <div class="summary-item">
                  <strong>{{ menusTerminalConfig.length }} menus</strong>
                  <span>Menus laterais do terminal</span>
                </div>

                <div class="summary-item">
                  <strong>{{ produtosVinculadosTerminal.length }} produtos</strong>
                  <span>Produtos exibidos no terminal</span>
                </div>

                <div class="summary-item">
                  <strong>{{ terminalConfigurando.modo_ticket }}</strong>
                  <span>Modo de emissão de ticket</span>
                </div>

                <v-divider class="my-4" />

                <h3>Validação</h3>

                <v-alert
                    :type="terminalPronto ? 'success' : 'warning'"
                    variant="tonal"
                    density="compact"
                    class="mt-3"
                >
                  {{ terminalPronto ? 'Terminal pronto para publicar' : 'Configuração incompleta' }}
                </v-alert>

                <div class="sync-box mt-4">
                  <strong>Última sincronização</strong>
                  <span>{{ formatarData(terminalConfigurando.ultima_sincronizacao) }}</span>
                </div>
              </aside>

              <!-- CONTEÚDO PRINCIPAL -->
              <main class="config-main">
                <!-- CONFIGURAÇÕES GERAIS -->
                <v-card class="config-section" elevation="0">
                  <h2>0. Dados operacionais</h2>

                  <v-row>
                    <v-col cols="12" md="3">
                      <label>Terminal</label>
                      <v-text-field
                          v-model="terminalConfigurando.descricao"
                          variant="outlined"
                          density="compact"
                          hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <label>Código interno</label>
                      <v-text-field
                          v-model="terminalConfigurando.codigo"
                          variant="outlined"
                          density="compact"
                          hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <label>Modo de ticket</label>
                      <v-select
                          v-model="terminalConfigurando.modo_ticket"
                          :items="modoTicketOptions"
                          item-title="title"
                          item-value="value"
                          variant="outlined"
                          density="compact"
                          hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <label>Definir Senha</label>
                      <v-text-field
                          v-model="terminalConfigurando.senha_terminal"
                          placeholder="Senha para acessar os paineis do terminal"
                          variant="outlined"
                          density="compact"
                          :append-inner-icon="verSenha ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                          :type="verSenha ? 'text' : 'password'"
                          @click:append-inner="verSenha = !verSenha"
                          hide-details
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" md="3">
                      <v-checkbox
                          v-model="terminalConfigurando.ativo"
                          label="Ativo"
                          color="var(--text-color-laranja)"
                          hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-checkbox
                          v-model="terminalConfigurando.permite_sincronizacao"
                          label="Permite sincronização"
                          color="var(--text-color-laranja)"
                          hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-checkbox
                          v-model="terminalConfigurando.emite_cupom_fiscal"
                          label="Emite cupom fiscal"
                          color="var(--text-color-laranja)"
                          hide-details
                      />
                    </v-col>

                    <v-col cols="12" md="3">
                      <v-checkbox
                          v-model="terminalConfigurando.emite_ticket"
                          label="Emite ticket"
                          color="var(--text-color-laranja)"
                          hide-details
                      />
                    </v-col>
                  </v-row>

                  <div class="d-flex justify-end mt-2">
                    <v-btn
                        color="var(--text-color-laranja)"
                        variant="flat"
                        class="text-white"
                        :loading="loading"
                        @click="salvarConfigOperacional"
                    >
                      Atualizar dados
                    </v-btn>
                  </div>
                </v-card>

                <v-tabs v-model="aba">
                  <v-tab value="ambientes">Ambientes Operacionais</v-tab>
                  <v-tab value="menus">Menus Laterais</v-tab>
                  <v-tab value="produtos">Produtos Vinculados ao menu</v-tab>
                  <v-tab value="mesas">Mesas</v-tab>
                  <v-tab value="funcionarios">Funcionários</v-tab>
                  <v-tab value="logs">Logs Cupom Fiscal</v-tab>
                </v-tabs>

                <v-tabs-window v-model="aba">
                  <v-tabs-window-item value="ambientes">
                    <!-- AMBIENTES -->
                    <v-card class="config-section" elevation="0">
                      <h2>1. Ambientes operacionais</h2>

                      <v-row class="align-end">
                        <v-col cols="12" md="3">
                          <label>Nome</label>
                          <v-text-field
                              v-model="ambienteForm.nome"
                              placeholder="Ex: Cozinha, Bar, Área externa"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <label>Tipo</label>
                          <v-select
                              v-model="ambienteForm.tipo"
                              :items="tipoAmbienteOptions"
                              item-title="title"
                              item-value="value"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="2">
                          <v-checkbox
                              v-model="ambienteForm.controla_comandas"
                              label="Controla comandas"
                              color="var(--text-color-laranja)"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="2">
                          <v-checkbox
                              v-model="ambienteForm.exibe_painel_chamados"
                              label="Exibe painel"
                              color="var(--text-color-laranja)"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="2">
                          <v-btn
                              block
                              color="var(--text-color-laranja)"
                              variant="flat"
                              class="text-white action-btn"
                              @click="salvarAmbiente"
                          >
                            Adicionar ambiente
                          </v-btn>
                        </v-col>
                      </v-row>

                      <v-divider class="my-4" />

                      <div v-if="!ambientesTerminalConfig.length" class="empty-box">
                        Nenhum ambiente cadastrado.
                      </div>

                      <div
                          v-for="ambiente in ambientesTerminalConfig"
                          :key="ambiente.id"
                          class="config-list-row"
                      >
                        <div>
                          <strong>{{ ambiente.nome }}</strong>
                          <span>
                        {{ ambiente.tipo }} •
                        {{ ambiente.controla_comandas ? 'com comandas' : 'sem comandas' }} •
                        {{ ambiente.exibe_painel_chamados ? 'com painel' : 'sem painel' }}
                      </span>
                        </div>

                        <v-btn
                            color="error"
                            variant="tonal"
                            @click="removerAmbiente(ambiente)"
                        >
                          Remover
                        </v-btn>
                      </div>
                    </v-card>
                  </v-tabs-window-item>

                  <v-tabs-window-item value="menus">
                    <!-- MENUS -->
                    <v-card class="config-section" elevation="0">
                      <h2>2. Menus laterais do terminal</h2>

                      <v-row class="align-end">
                        <v-col cols="12" md="3">
                          <label>Ambiente</label>
                          <v-select
                              v-model="menuForm.ambiente_id"
                              :items="ambientesTerminalConfig"
                              item-title="nome"
                              item-value="id"
                              placeholder="Selecione"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <label>Nome do menu</label>
                          <v-text-field
                              v-model="menuForm.nome"
                              placeholder="Ex: Comidas, Bebidas, Combos"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <label>Ícone</label>
                          <v-text-field
                              v-model="menuForm.icone"
                              placeholder="Ex: 🍔"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-btn
                              block
                              color="var(--text-color-laranja)"
                              variant="flat"
                              class="text-white action-btn"
                              @click="salvarMenu"
                          >
                            Adicionar menu
                          </v-btn>
                        </v-col>
                      </v-row>

                      <v-divider class="my-4" />

                      <div v-if="!menusTerminalConfig.length" class="empty-box">
                        Nenhum menu cadastrado.
                      </div>

                      <div
                          v-for="menu in menusTerminalConfig"
                          :key="menu.id"
                          class="config-list-row"
                      >
                        <div>
                          <strong>{{ menu.icone || '📌' }} {{ menu.nome }}</strong>
                          <span>
                        {{ nomeAmbiente(menu.ambiente_id) }} • {{ quantidadeProdutosMenu(menu.id) }} produtos vinculados
                      </span>
                        </div>

                        <v-btn
                            color="error"
                            variant="tonal"
                            @click="removerMenu(menu)"
                        >
                          Remover
                        </v-btn>
                      </div>
                    </v-card>
                  </v-tabs-window-item>

                  <v-tabs-window-item value="produtos">
                    <!-- PRODUTOS -->
                    <v-card class="config-section" elevation="0">
                      <div class="d-flex justify-space-between align-start flex-wrap ga-3 mb-3">
                        <div>
                          <h2>3. Produtos vinculados aos menus</h2>
                          <p class="section-subtitle">
                            Produtos vêm da sincronização do ERP. Aqui você escolhe onde eles aparecem no terminal.
                          </p>
                        </div>

                        <v-btn
                            color="var(--text-color-laranja)"
                            variant="tonal"
                            prepend-icon="mdi-sync"
                            @click="sincronizarProdutosTerminal"
                        >
                          Sincronizar catálogo
                        </v-btn>
                      </div>

                      <v-row class="align-end">
                        <v-col cols="12" md="3">
                          <label>Menu lateral</label>
                          <v-select
                              v-model="produtoForm.menu_id"
                              :items="menusTerminalConfig"
                              item-title="nome"
                              item-value="id"
                              variant="outlined"
                              density="compact"
                              hide-details
                              @update:model-value="preencherAmbienteDoMenu"
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <label>Ambiente de preparo</label>
                          <v-select
                              v-model="produtoForm.ambiente_preparo_id"
                              :items="ambientesTerminalConfig"
                              item-title="nome"
                              item-value="id"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <label>Grupo</label>
                          <v-select
                              v-model="produtoForm.grupo"
                              :items="grupoOptions"
                              clearable
                              placeholder="Todos"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <label>Produto</label>
                          <v-select
                              v-model="produtoForm.produto_id"
                              :items="produtosFiltradosParaVinculo"
                              item-title="titulo"
                              item-value="id"
                              placeholder="Selecione"
                              variant="outlined"
                              density="compact"
                              hide-details
                              multiple
                              chips
                              closable-chips
                          />
                        </v-col>
                      </v-row>

                      <v-row class="align-center mt-1">
                        <v-col cols="12" md="3">
                          <v-checkbox
                              v-model="produtoForm.emite_ticket"
                              label="Emite ticket"
                              color="var(--text-color-laranja)"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-btn
                              block
                              color="var(--text-color-laranja)"
                              variant="flat"
                              class="text-white action-btn"
                              @click="vincularProduto"
                          >
                            Vincular produto
                          </v-btn>
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-btn
                              block
                              color="var(--text-color-laranja)"
                              variant="tonal"
                              class="action-btn"
                              @click="vincularGrupoProdutos"
                          >
                            Vincular grupo
                          </v-btn>
                        </v-col>

                        <v-col cols="12" md="3">
                      <span class="helper-text">
                        Vincular grupo adiciona todos os produtos do grupo selecionado.
                      </span>
                        </v-col>
                      </v-row>

                      <v-divider class="my-4" />

                      <div v-if="!produtosVinculadosTerminal.length" class="empty-box">
                        Nenhum produto vinculado aos menus deste terminal.
                      </div>

                      <template v-else>
                        <div
                            v-for="grupo in produtosVinculadosPorMenu"
                            :key="grupo.menu.id"
                            class="menu-products-section"
                        >
                          <div class="menu-products-header">
                            <div>
                              <h3>{{ grupo.menu.icone || '📌' }} {{ grupo.menu.nome }}</h3>
                              <span>
                            {{ nomeAmbiente(grupo.menu.ambiente_id) }} • {{ grupo.produtos.length }} produtos vinculados
                          </span>
                            </div>
                          </div>

                          <div
                              v-for="vinculo in grupo.produtos"
                              :key="vinculo.id"
                              class="product-link-row"
                          >
                            <div>
                              <strong>{{ vinculo.produto?.emoji || '🛒' }} {{ vinculo.produto?.nome }}</strong>
                              <span>
                          {{ vinculo.produto?.grupo }} • {{ nomeAmbiente(vinculo.ambiente_preparo_id) }} •
                          {{ formatarMoeda(vinculo.produto?.preco) }} •
                          {{ vinculo.emite_ticket ? 'emite ticket' : 'sem ticket' }}
                        </span>
                            </div>

                            <v-btn
                                color="error"
                                variant="tonal"
                                @click="removerProdutoVinculado(vinculo)"
                            >
                              Remover
                            </v-btn>
                          </div>
                        </div>
                      </template>
                    </v-card>
                  </v-tabs-window-item>

                  <v-tabs-window-item value="mesas">
                    <!-- MESAS -->
                    <v-card class="config-section" elevation="0">
                      <div class="d-flex justify-space-between align-start flex-wrap ga-3 mb-3">
                        <div>
                          <h2>4. Mesas do salão</h2>
                          <p class="section-subtitle">
                            Cadastre as mesas do salão — elas aparecem no mapa de mesas do painel de comandas.
                          </p>
                        </div>
                      </div>

                      <v-row class="align-end">
                        <v-col cols="12" md="3">
                          <label>Número</label>
                          <v-text-field
                              v-model="mesaForm.numero"
                              placeholder="Ex: 12"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <label>Nome (opcional)</label>
                          <v-text-field
                              v-model="mesaForm.nome"
                              placeholder="Ex: Varanda 3"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="2">
                          <label>Capacidade</label>
                          <v-text-field
                              v-model.number="mesaForm.capacidade"
                              type="number"
                              min="1"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="2">
                          <label>Ambiente</label>
                          <v-select
                              v-model="mesaForm.ambiente_id"
                              :items="ambientesTerminalConfig"
                              item-title="nome"
                              item-value="id"
                              clearable
                              placeholder="Nenhum"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="2">
                          <v-btn
                              block
                              color="var(--text-color-laranja)"
                              variant="flat"
                              class="text-white action-btn"
                              @click="salvarMesa"
                          >
                            Adicionar mesa
                          </v-btn>
                        </v-col>
                      </v-row>

                      <v-divider class="my-4" />

                      <div v-if="!mesasTerminalConfig.length" class="empty-box">
                        Nenhuma mesa cadastrada.
                      </div>

                      <div
                          v-for="mesa in mesasTerminalConfig"
                          :key="mesa.id"
                          class="config-list-row"
                      >
                        <div>
                          <strong>Mesa {{ mesa.numero }}{{ mesa.nome ? ' — ' + mesa.nome : '' }}</strong>
                          <span>Capacidade {{ mesa.capacidade }} • {{ statusMesaLabel(mesa.status) }}</span>
                        </div>

                        <v-btn
                            color="error"
                            variant="tonal"
                            @click="removerMesa(mesa)"
                        >
                          Remover
                        </v-btn>
                      </div>
                    </v-card>
                  </v-tabs-window-item>

                  <v-tabs-window-item value="funcionarios">
                    <!-- FUNCIONÁRIOS -->
                    <v-card class="config-section" elevation="0">
                      <div class="d-flex justify-space-between align-start flex-wrap ga-3 mb-3">
                        <div>
                          <h2>5. Funcionários vinculados</h2>
                          <p class="section-subtitle">
                            Só funcionários vinculados e com acesso ao terminal conseguem validar a senha operacional
                            aqui — assim que o primeiro vínculo é criado, essa checagem passa a valer para este terminal.
                          </p>
                        </div>
                      </div>

                      <v-row class="align-end">
                        <v-col cols="12" md="5">
                          <label>Funcionário</label>
                          <v-select
                              v-model="funcionarioVincularForm.funcionario_id"
                              :items="funcionariosDisponiveisParaVinculo"
                              item-title="nome"
                              item-value="id"
                              placeholder="Selecione"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="4">
                          <label>Papel (opcional)</label>
                          <v-text-field
                              v-model="funcionarioVincularForm.papel"
                              placeholder="Ex: garcom, caixa, cozinha"
                              variant="outlined"
                              density="compact"
                              hide-details
                          />
                        </v-col>

                        <v-col cols="12" md="3">
                          <v-btn
                              block
                              color="var(--text-color-laranja)"
                              variant="flat"
                              class="text-white action-btn"
                              @click="vincularFuncionario"
                          >
                            Vincular
                          </v-btn>
                        </v-col>
                      </v-row>

                      <v-divider class="my-4" />

                      <div v-if="!funcionariosVinculadosTerminal.length" class="empty-box">
                        Nenhum funcionário vinculado a este terminal — qualquer usuário do sistema ainda pode operá-lo.
                      </div>

                      <div
                          v-for="vinculo in funcionariosVinculadosTerminal"
                          :key="vinculo.id"
                          class="config-list-row"
                      >
                        <div>
                          <strong>{{ vinculo.funcionario?.nome || ('Funcionário #' + vinculo.funcionario_id) }}</strong>
                          <span>{{ vinculo.papel || 'sem papel definido' }} • {{ vinculo.ativo ? 'ativo' : 'inativo' }}</span>
                        </div>

                        <v-btn
                            color="error"
                            variant="tonal"
                            @click="removerVinculoFuncionario(vinculo)"
                        >
                          Desvincular
                        </v-btn>
                      </div>
                    </v-card>
                  </v-tabs-window-item>

                  <v-tabs-window-item value="logs">
                    <!-- LOGS CUPOM FISCAL -->
                    <v-card class="config-section" elevation="0">
                      <div class="d-flex justify-space-between align-start flex-wrap ga-3 mb-3">
                        <div>
                          <h2>6. Logs Cupom Fiscal</h2>
                          <p class="section-subtitle">
                            Cupons fiscais rejeitados pela SEFAZ por dados/XML incorretos — a venda já foi
                            concluída normalmente, mas o cupom fica pendente aqui até ser corrigido e reenviado.
                          </p>
                        </div>

                        <v-btn
                            variant="tonal"
                            prepend-icon="mdi-refresh"
                            :loading="logsCupomFiscalCarregando"
                            @click="carregarLogsCupomFiscal(terminalConfigurandoId)"
                        >
                          Atualizar
                        </v-btn>
                      </div>

                      <v-data-table
                          :headers="logsCupomFiscalHeaders"
                          :items="logsCupomFiscal"
                          :loading="logsCupomFiscalCarregando"
                          item-value="id"
                          class="background-card rounded-lg"
                      >
                        <template v-slot:[`item.status`]="{ item }">
                          <v-chip :color="item.status === 'aprovado' ? 'green' : 'red'" size="small">
                            {{ item.status === 'aprovado' ? 'Aprovado' : 'Erro' }}
                          </v-chip>
                        </template>

                        <template v-slot:[`item.mensagem_erro`]="{ item }">
                          <span class="text-truncate d-inline-block" style="max-width: 320px;">
                            {{ item.mensagem_erro }}
                          </span>
                        </template>

                        <template v-slot:[`item.updated_at`]="{ item }">
                          {{ formatarData(item.updated_at) }}
                        </template>

                        <template v-slot:[`item.actions`]="{ item }">
                          <v-btn
                              size="small"
                              variant="text"
                              color="var(--text-color-laranja)"
                              @click="abrirDetalheLogCupomFiscal(item)"
                          >
                            Detalhes
                          </v-btn>
                        </template>
                      </v-data-table>

                      <div v-if="!logsCupomFiscal.length && !logsCupomFiscalCarregando" class="empty-box">
                        Nenhum log de erro de cupom fiscal para este terminal.
                      </div>
                    </v-card>
                  </v-tabs-window-item>
                </v-tabs-window>
              </main>
            </section>
          </v-card-text>
        </v-card>
      </v-dialog>

      <log-cupom-fiscal-detalhe-modal
          v-model="dialogDetalheLogCupomFiscal"
          :log="logSelecionado"
          @atualizado="logCupomFiscalAtualizado"
      />

      <v-snackbar v-model="snackbar.show" :color="snackbar.color">
        {{ snackbar.text }}
      </v-snackbar>
    </template>
  </top-all-pages>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import TopAllPages from "@/components/base/padrao-paginas/TopAllPages.vue";
import LogCupomFiscalDetalheModal from "@/components/base/modais/LogCupomFiscalDetalheModal.vue";
import apiPhp from '@/services/apiPhp'

const formularioAberto = ref(false)
const editando = ref(false)
const formValido = ref(false)
const formRef = ref(null)
const search = ref('')
const loading = ref(false)
const dialogConfigTotem = ref(false)
const carregandoConfigTerminal = ref(false)
const terminalConfigurandoId = ref(null)
const aba = ref('ambientes')
const verSenha = ref(false)

const snackbar = reactive({
  show: false,
  text: '',
  color: 'success'
})

const headers_auth = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

const totems = ref([])
const ambientes = ref([])
const menus = ref([])
const menuProdutos = ref([])
const produtos = ref([])
const grupos = ref([])
const mesas = ref([])
const funcionariosVinculados = ref([])
const funcionariosDisponiveis = ref([])
const logsCupomFiscal = ref([])
const logsCupomFiscalCarregando = ref(false)
const dialogDetalheLogCupomFiscal = ref(false)
const logSelecionado = ref(null)

const logsCupomFiscalHeaders = [
  { title: 'Data', key: 'updated_at' },
  { title: 'Status', key: 'status' },
  { title: 'cStat', key: 'cstat' },
  { title: 'Mensagem', key: 'mensagem_erro' },
  { title: 'Tentativas', key: 'tentativas' },
  { title: 'Ações', key: 'actions', sortable: false }
]

const formData = reactive({
  id: null,
  descricao: '',
  codigo: '',
  ativo: true,
  permite_sincronizacao: true,
  emite_cupom_fiscal: true,
  emite_ticket: true,
  modo_ticket: 'agrupado',
  observacao: '',
  senha_terminal: '',
  valor_couvert_padrao: 0,
  percentual_taxa_servico_padrao: 10
})

const ambienteForm = reactive({
  nome: '',
  tipo: 'cozinha',
  controla_comandas: true,
  exibe_painel_chamados: true
})

const menuForm = reactive({
  ambiente_id: null,
  nome: '',
  icone: '',
  ativo: true
})

const produtoForm = reactive({
  menu_id: null,
  ambiente_preparo_id: null,
  grupo: null,
  produto_id: [],
  emite_ticket: false
})

const mesaForm = reactive({
  numero: '',
  nome: '',
  capacidade: 4,
  ambiente_id: null
})

const funcionarioVincularForm = reactive({
  funcionario_id: null,
  papel: ''
})

const statusMesaLabels = { livre: 'Livre', ocupada: 'Ocupada', reservada: 'Reservada', bloqueada: 'Bloqueada' }
const statusMesaLabel = status => statusMesaLabels[status] || status

const rules = {
  required: value => !!value || 'Campo obrigatório'
}

const modoTicketOptions = [
  { title: 'Agrupado', value: 'agrupado' },
  { title: 'Por unidade', value: 'por_unidade' },
  { title: 'Não emitir', value: 'nao_emitir' }
]

const tipoAmbienteOptions = [
  { title: 'Cozinha', value: 'cozinha' },
  { title: 'Bar', value: 'bar' },
  { title: 'Área externa', value: 'area_externa' },
  { title: 'Geral', value: 'geral' }
]

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Terminal', key: 'descricao', sortable: true },
  { title: 'Código', key: 'codigo', sortable: true },
  { title: 'Status', key: 'ativo', sortable: true },
  { title: 'Sincronização', key: 'permite_sincronizacao', sortable: true },
  { title: 'Última sinc.', key: 'ultima_sincronizacao', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false }
]

const itemRaw = item => item?.raw || item

const terminalConfigurando = computed(() => {
  return totems.value.find(t => t.id === terminalConfigurandoId.value) || null
})

const ambientesTerminalConfig = computed(() => {
  return ambientes.value.filter(a => a.terminal_id === terminalConfigurandoId.value)
})

const menusTerminalConfig = computed(() => {
  return menus.value.filter(m => m.terminal_id === terminalConfigurandoId.value)
})

const grupoOptions = computed(() => {
  return grupos.value.map(g => g.descgrupo).filter(Boolean)
})

const produtosSelect = computed(() => {
  return produtos.value
      .filter(produto => produto.ativo)
      .map(produto => ({
        ...produto,
        titulo: `${produto.emoji || '🛒'} ${produto.nome} — ${formatarMoeda(produto.preco)} — ${produto.grupo}`
      }))
})

const produtosFiltradosParaVinculo = computed(() => {
  if (!produtoForm.grupo) return produtosSelect.value
  return produtosSelect.value.filter(produto => produto.grupo === produtoForm.grupo)
})

const produtosVinculadosTerminal = computed(() => {
  return menuProdutos.value
      .filter(vinculo => vinculo.terminal_id === terminalConfigurandoId.value)
      .map(vinculo => ({
        ...vinculo,
        produto: produtos.value.find(produto => produto.id === vinculo.produto_id),
        menu: menus.value.find(menu => menu.id === vinculo.menu_id)
      }))
      .filter(vinculo => vinculo.produto && vinculo.menu)
})

const produtosVinculadosPorMenu = computed(() => {
  return menusTerminalConfig.value
      .map(menu => {
        const produtosDoMenu = produtosVinculadosTerminal.value.filter(vinculo => vinculo.menu_id === menu.id)

        return {
          menu,
          produtos: produtosDoMenu
        }
      })
      .filter(grupo => grupo.produtos.length > 0)
})

const mesasTerminalConfig = computed(() => {
  return mesas.value.filter(m => m.terminal_id === terminalConfigurandoId.value)
})

const funcionariosVinculadosTerminal = computed(() => {
  return funcionariosVinculados.value.filter(v => v.terminal_id === terminalConfigurandoId.value)
})

const funcionariosDisponiveisParaVinculo = computed(() => {
  const vinculadosIds = new Set(funcionariosVinculadosTerminal.value.map(v => v.funcionario_id))
  return funcionariosDisponiveis.value.filter(f => !vinculadosIds.has(f.id))
})

const terminalPronto = computed(() => {
  return (
      !!terminalConfigurando.value &&
      terminalConfigurando.value.ativo &&
      ambientesTerminalConfig.value.length > 0 &&
      menusTerminalConfig.value.length > 0 &&
      produtosVinculadosTerminal.value.length > 0
  )
})

const resumoAmbientes = computed(() => {
  if (!ambientesTerminalConfig.value.length) return 'Nenhum ambiente cadastrado'

  return ambientesTerminalConfig.value
      .slice(0, 3)
      .map(ambiente => ambiente.nome)
      .join(', ')
})

const itemsFiltrados = computed(() => {
  const dados = totems.value || []

  if (!search.value) return dados

  const termo = search.value.toLowerCase()

  return dados.filter(item => {
    return (
        item.descricao?.toLowerCase().includes(termo) ||
        item.codigo?.toLowerCase().includes(termo) ||
        item.id?.toString().includes(termo)
    )
  })
})

watch(
    () => formData.descricao,
    descricao => {
      if (!editando.value && descricao) {
        formData.codigo = gerarCodigoTerminal(descricao)
      }
    }
)

watch(
    () => produtoForm.produto_id,
    produtoId => {
      const produto = produtos.value.find(item => item.id === produtoId)
      if (produto) {
        produtoForm.emite_ticket = produto.emite_ticket_padrao
      }
    }
)

const gerarCodigoTerminal = texto => {
  const base = texto
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  return base.startsWith('TERM-') ? base : `TERM-${base}`
}

// Normaliza terminal da API → formato local (descricao, ativo como boolean)
const normalizarTerminal = t => ({
  ...t,
  descricao: t.nome,
  ativo: t.status === 'ativo',
  ultima_sincronizacao: t.ultima_sincronizacao_em
})

const carregarTotems = async () => {
  loading.value = true
  try {
    const { data } = await apiPhp.get('/admin/terminais-venda', { headers: headers_auth() })
    totems.value = (Array.isArray(data) ? data : data.data ?? []).map(normalizarTerminal)
  } catch {
    mostrarMensagem('Erro ao carregar terminais.', 'error')
  } finally {
    loading.value = false
  }
}

const carregarConfigTerminal = async terminalId => {
  carregandoConfigTerminal.value = true

  try {
    const h = { headers: headers_auth() }

    const safe = promise => promise.catch(() => ({ data: [] }))

    const [respAmbientes, respMenus, respProdutos, respVinculados, respGrupos, respMesas, respFuncVinculados, respFuncDisponiveis] = await Promise.all([
      safe(apiPhp.get(`/admin/terminais-venda/${terminalId}/ambientes`, h)),
      safe(apiPhp.get(`/admin/terminais-venda/${terminalId}/menus`, h)),
      safe(apiPhp.get('/admin/produtos-catalogo', h)),
      safe(apiPhp.get(`/admin/terminais-venda/${terminalId}/produtos-vinculados`, h)),
      safe(apiPhp.get('/estoque/grupos', h)),
      safe(apiPhp.get(`/admin/terminais-venda/${terminalId}/mesas`, h)),
      safe(apiPhp.get(`/admin/terminais-venda/${terminalId}/funcionarios`, h)),
      safe(apiPhp.get('/manutencao/funcionarios', h))
    ])

    mesas.value = respMesas.data?.data ?? respMesas.data ?? []
    funcionariosVinculados.value = respFuncVinculados.data?.data ?? respFuncVinculados.data ?? []

    const todosFuncionarios = respFuncDisponiveis.data?.data ?? respFuncDisponiveis.data ?? []
    funcionariosDisponiveis.value = (Array.isArray(todosFuncionarios) ? todosFuncionarios : [])
        .filter(f => f.acessa_sistema_terminal && f.ativo)

    ambientes.value = respAmbientes.data?.data ?? respAmbientes.data ?? []
    menus.value = respMenus.data?.data ?? respMenus.data ?? []

    const rawGrupos = respGrupos.data?.data ?? respGrupos.data ?? []
    grupos.value = Array.isArray(rawGrupos) ? rawGrupos : []
    const gruposMap = Object.fromEntries(grupos.value.map(g => [g.id, g.descgrupo]))

    const rawProdutos = respProdutos.data?.data ?? respProdutos.data ?? []
    produtos.value = (Array.isArray(rawProdutos) ? rawProdutos : []).map(p => ({
      id: p.id,
      nome: p.descproduto,
      codigo: p.codigo,
      grupo: gruposMap[p.id_grupo] || '',
      emoji: '🛒',
      preco: parseFloat(p.preco_venda) || 0,
      ativo: p.ativo !== false,
      emite_ticket_padrao: false
    }))

    menuProdutos.value = (respVinculados.data?.data ?? respVinculados.data ?? []).map(v => ({
      ...v,
      produto: v.produto ? { ...v.produto, emoji: '🛒', grupo: '' } : null,
      menu: menus.value.find(m => m.id === v.menu_id) || null
    }))

    await carregarLogsCupomFiscal(terminalId)
  } finally {
    carregandoConfigTerminal.value = false
  }
}

const carregarLogsCupomFiscal = async terminalId => {
  if (!terminalId) return

  logsCupomFiscalCarregando.value = true
  try {
    const { data } = await apiPhp.get(`/admin/terminais-venda/${terminalId}/logs-cupom-fiscal`, { headers: headers_auth() })
    logsCupomFiscal.value = data?.data ?? []
  } catch {
    mostrarMensagem('Erro ao carregar logs de cupom fiscal.', 'error')
  } finally {
    logsCupomFiscalCarregando.value = false
  }
}

const abrirDetalheLogCupomFiscal = item => {
  logSelecionado.value = item
  dialogDetalheLogCupomFiscal.value = true
}

const logCupomFiscalAtualizado = logAtualizado => {
  if (!logAtualizado) return

  const idx = logsCupomFiscal.value.findIndex(l => l.id === logAtualizado.id)
  if (idx !== -1) logsCupomFiscal.value[idx] = logAtualizado

  // Erros ficam no topo, aprovados vão para o final da fila — mesmo critério do backend.
  logsCupomFiscal.value = [...logsCupomFiscal.value].sort(
      (a, b) => (a.status === 'aprovado' ? 1 : 0) - (b.status === 'aprovado' ? 1 : 0)
  )
}

const salvarConfigOperacional = async () => {
  const terminal = terminalConfigurando.value
  if (!terminal) return

  loading.value = true
  try {
    const payload = {
      nome: terminal.descricao,
      codigo: terminal.codigo,
      status: terminal.ativo ? 'ativo' : 'inativo',
      permite_sincronizacao: terminal.permite_sincronizacao,
      emite_cupom_fiscal: terminal.emite_cupom_fiscal,
      emite_ticket: terminal.emite_ticket,
      modo_ticket: terminal.modo_ticket
    }

    if (terminal.senha_terminal) {
      payload.senha_operacional = terminal.senha_terminal
    }

    await apiPhp.put(`/admin/terminais-venda/${terminal.id}`, payload, { headers: headers_auth() })
    await carregarTotems()
    mostrarMensagem('Dados operacionais atualizados com sucesso.', 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || error.response?.data?.message || 'Erro ao atualizar dados operacionais.'
    mostrarMensagem(msg, 'error')
  } finally {
    loading.value = false
  }
}

const toggleFormulario = () => {
  formularioAberto.value = !formularioAberto.value

  if (!formularioAberto.value) {
    cancelarFormulario()
  }
}

const cancelarFormulario = () => {
  formRef.value?.resetValidation()
  resetFormData()
  editando.value = false
}

const resetFormData = () => {
  formData.id = null
  formData.descricao = ''
  formData.codigo = ''
  formData.ativo = true
  formData.permite_sincronizacao = true
  formData.emite_cupom_fiscal = true
  formData.emite_ticket = true
  formData.modo_ticket = 'agrupado'
  formData.observacao = ''
  formData.senha_terminal = ''
  formData.valor_couvert_padrao = 0
  formData.percentual_taxa_servico_padrao = 10
}

const editarTotem = item => {
  editando.value = true

  formData.id = item.id
  formData.descricao = item.descricao || item.nome
  formData.codigo = item.codigo
  formData.ativo = item.ativo ?? item.status === 'ativo'
  formData.permite_sincronizacao = item.permite_sincronizacao
  formData.emite_cupom_fiscal = item.emite_cupom_fiscal
  formData.emite_ticket = item.emite_ticket
  formData.modo_ticket = item.modo_ticket
  formData.observacao = item.observacao || ''
  formData.senha_terminal = ''
  formData.valor_couvert_padrao = Number(item.valor_couvert_padrao) || 0
  formData.percentual_taxa_servico_padrao = Number(item.percentual_taxa_servico_padrao) || 0

  formularioAberto.value = true
  formRef.value?.resetValidation()
}

const salvarTotem = async () => {
  const result = await formRef.value?.validate()
  if (result?.valid === false) return

  loading.value = true

  try {
    const payload = {
      nome: formData.descricao,
      codigo: gerarCodigoTerminal(formData.codigo || formData.descricao),
      status: formData.ativo ? 'ativo' : 'inativo',
      permite_sincronizacao: formData.permite_sincronizacao,
      emite_cupom_fiscal: formData.emite_cupom_fiscal,
      emite_ticket: formData.emite_ticket,
      modo_ticket: formData.modo_ticket,
      valor_couvert_padrao: formData.valor_couvert_padrao || 0,
      percentual_taxa_servico_padrao: formData.percentual_taxa_servico_padrao || 0,
    }

    if (formData.senha_terminal) {
      payload.senha_operacional = formData.senha_terminal
    }

    const h = { headers: headers_auth() }

    if (editando.value) {
      await apiPhp.put(`/admin/terminais-venda/${formData.id}`, payload, h)
      mostrarMensagem('Terminal atualizado com sucesso.', 'success')
    } else {
      const { data: novoTerminal } = await apiPhp.post('/admin/terminais-venda', payload, h)
      const terminalId = novoTerminal?.data?.id ?? novoTerminal?.id

      if (terminalId) {
        const respAmbiente = await apiPhp.post(
          `/admin/terminais-venda/${terminalId}/ambientes`,
          { nome: 'Ambiente Padrão', tipo: 'geral', controla_comandas: true, exibe_painel_chamados: true },
          h
        )
        const ambienteId = respAmbiente.data?.data?.id ?? respAmbiente.data?.id

        if (ambienteId) {
          await apiPhp.post(
            `/admin/terminais-venda/${terminalId}/menus`,
            { ambiente_id: ambienteId, nome: 'Menu Geral', icone: '📋', ativo: true },
            h
          )
        }
      }

      mostrarMensagem('Terminal cadastrado com sucesso.', 'success')
    }

    await carregarTotems()
    cancelarFormulario()
    formularioAberto.value = false
  } catch (error) {
    const msg = error.response?.data?.erro || error.response?.data?.message || 'Erro ao salvar terminal.'
    mostrarMensagem(msg, 'error')
  } finally {
    loading.value = false
  }
}

const excluirTotem = async item => {
  loading.value = true
  try {
    await apiPhp.delete(`/admin/terminais-venda/${item.id}`, { headers: headers_auth() })
    await carregarTotems()
    mostrarMensagem('Terminal excluído.', 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao excluir terminal.'
    mostrarMensagem(msg, 'error')
  } finally {
    loading.value = false
  }
}

const abrirConfiguracaoTotem = async item => {
  terminalConfigurandoId.value = item.id
  dialogConfigTotem.value = true
  resetAmbienteForm()
  resetMenuForm()
  resetProdutoForm()
  resetMesaForm()
  resetFuncionarioVincularForm()
  await carregarConfigTerminal(item.id)
}

const fecharConfiguracaoTotem = () => {
  dialogConfigTotem.value = false
  terminalConfigurandoId.value = null
  resetAmbienteForm()
  resetMenuForm()
  resetProdutoForm()
  resetMesaForm()
  resetFuncionarioVincularForm()
}

const resetAmbienteForm = () => {
  ambienteForm.nome = ''
  ambienteForm.tipo = 'cozinha'
  ambienteForm.controla_comandas = true
  ambienteForm.exibe_painel_chamados = true
}

const salvarAmbiente = async () => {
  if (!terminalConfigurandoId.value) {
    mostrarMensagem('Selecione um terminal para configurar.', 'error')
    return
  }

  if (!ambienteForm.nome) {
    mostrarMensagem('Informe o nome do ambiente.', 'error')
    return
  }

  try {
    await apiPhp.post(
      `/admin/terminais-venda/${terminalConfigurandoId.value}/ambientes`,
      {
        nome: ambienteForm.nome,
        tipo: ambienteForm.tipo,
        controla_comandas: ambienteForm.controla_comandas,
        exibe_painel_chamados: ambienteForm.exibe_painel_chamados
      },
      { headers: headers_auth() }
    )
    resetAmbienteForm()
    await carregarConfigTerminal(terminalConfigurandoId.value)
    mostrarMensagem('Ambiente cadastrado.', 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao salvar ambiente.'
    mostrarMensagem(msg, 'error')
  }
}

const removerAmbiente = async ambiente => {
  try {
    await apiPhp.delete(`/admin/terminais-venda-ambientes/${ambiente.id}`, { headers: headers_auth() })
    await carregarConfigTerminal(terminalConfigurandoId.value)
    mostrarMensagem('Ambiente removido.', 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao remover ambiente.'
    mostrarMensagem(msg, 'error')
  }
}

const resetMenuForm = () => {
  menuForm.ambiente_id = ambientesTerminalConfig.value[0]?.id || null
  menuForm.nome = ''
  menuForm.icone = ''
  menuForm.ativo = true
}

const salvarMenu = async () => {
  if (!terminalConfigurandoId.value) {
    mostrarMensagem('Selecione um terminal para configurar.', 'error')
    return
  }

  if (!menuForm.ambiente_id) {
    mostrarMensagem('Selecione o ambiente do menu.', 'error')
    return
  }

  if (!menuForm.nome) {
    mostrarMensagem('Informe o nome do menu.', 'error')
    return
  }

  try {
    await apiPhp.post(
      `/admin/terminais-venda/${terminalConfigurandoId.value}/menus`,
      {
        ambiente_id: menuForm.ambiente_id,
        nome: menuForm.nome,
        icone: menuForm.icone || null,
        ativo: menuForm.ativo
      },
      { headers: headers_auth() }
    )
    resetMenuForm()
    await carregarConfigTerminal(terminalConfigurandoId.value)
    mostrarMensagem('Menu cadastrado.', 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao salvar menu.'
    mostrarMensagem(msg, 'error')
  }
}

const removerMenu = async menu => {
  try {
    await apiPhp.delete(`/admin/terminais-venda-menus/${menu.id}`, { headers: headers_auth() })
    await carregarConfigTerminal(terminalConfigurandoId.value)
    mostrarMensagem('Menu removido.', 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao remover menu.'
    mostrarMensagem(msg, 'error')
  }
}

const resetProdutoForm = () => {
  produtoForm.menu_id = menusTerminalConfig.value[0]?.id || null
  produtoForm.ambiente_preparo_id = menusTerminalConfig.value[0]?.ambiente_id || ambientesTerminalConfig.value[0]?.id || null
  produtoForm.grupo = null
  produtoForm.produto_id = []
  produtoForm.emite_ticket = false
}

const preencherAmbienteDoMenu = menuId => {
  const menu = menus.value.find(item => item.id === menuId)
  if (menu) {
    produtoForm.ambiente_preparo_id = menu.ambiente_id
  }
}

const vincularProduto = async () => {
  if (!terminalConfigurandoId.value) {
    mostrarMensagem('Selecione um terminal.', 'error')
    return
  }

  if (!produtoForm.menu_id || !produtoForm.ambiente_preparo_id || !produtoForm.produto_id?.length) {
    mostrarMensagem('Informe menu, ambiente e pelo menos um produto.', 'error')
    return
  }

  try {
    await Promise.all(
      produtoForm.produto_id.map(id =>
        apiPhp.post(
          `/admin/terminais-venda-menus/${produtoForm.menu_id}/produtos`,
          {
            produto_id: id,
            ambiente_preparo_id: produtoForm.ambiente_preparo_id,
            emite_ticket: produtoForm.emite_ticket
          },
          { headers: headers_auth() }
        )
      )
    )
    const qty = produtoForm.produto_id.length
    produtoForm.produto_id = []
    produtoForm.emite_ticket = false
    await carregarConfigTerminal(terminalConfigurandoId.value)
    mostrarMensagem(`${qty} produto(s) vinculado(s) ao menu.`, 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao vincular produto.'
    mostrarMensagem(msg, 'error')
  }
}

const vincularGrupoProdutos = async () => {
  if (!produtoForm.grupo) {
    mostrarMensagem('Selecione um grupo para vincular.', 'error')
    return
  }

  if (!produtoForm.menu_id || !produtoForm.ambiente_preparo_id) {
    mostrarMensagem('Informe menu e ambiente de preparo.', 'error')
    return
  }

  const produtosDoGrupo = produtos.value.filter(p => p.grupo === produtoForm.grupo && p.ativo)
  const jaVinculados = new Set(menuProdutos.value.filter(v => v.menu_id === produtoForm.menu_id).map(v => v.produto_id))

  const novos = produtosDoGrupo.filter(p => !jaVinculados.has(p.id))

  if (!novos.length) {
    mostrarMensagem('Todos os produtos desse grupo já estão vinculados.', 'warning')
    return
  }

  try {
    await Promise.all(novos.map(p =>
      apiPhp.post(
        `/admin/terminais-venda-menus/${produtoForm.menu_id}/produtos`,
        { produto_id: p.id, ambiente_preparo_id: produtoForm.ambiente_preparo_id, emite_ticket: p.emite_ticket_padrao },
        { headers: headers_auth() }
      )
    ))
    await carregarConfigTerminal(terminalConfigurandoId.value)
    mostrarMensagem(`${novos.length} produtos vinculados.`, 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao vincular grupo.'
    mostrarMensagem(msg, 'error')
  }
}

const removerProdutoVinculado = async vinculo => {
  try {
    await apiPhp.delete(`/admin/terminais-venda-menu-produtos/${vinculo.id}`, { headers: headers_auth() })
    await carregarConfigTerminal(terminalConfigurandoId.value)
    mostrarMensagem('Produto removido do menu.', 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao remover produto.'
    mostrarMensagem(msg, 'error')
  }
}

const sincronizarProdutosTerminal = async () => {
  if (!terminalConfigurandoId.value) return
  await carregarConfigTerminal(terminalConfigurandoId.value)
  mostrarMensagem('Catálogo atualizado.', 'success')
}

const resetMesaForm = () => {
  mesaForm.numero = ''
  mesaForm.nome = ''
  mesaForm.capacidade = 4
  mesaForm.ambiente_id = null
}

const salvarMesa = async () => {
  if (!terminalConfigurandoId.value) {
    mostrarMensagem('Selecione um terminal para configurar.', 'error')
    return
  }

  if (!mesaForm.numero) {
    mostrarMensagem('Informe o número da mesa.', 'error')
    return
  }

  try {
    await apiPhp.post(
      `/admin/terminais-venda/${terminalConfigurandoId.value}/mesas`,
      {
        numero: mesaForm.numero,
        nome: mesaForm.nome || null,
        capacidade: mesaForm.capacidade || 1,
        ambiente_id: mesaForm.ambiente_id
      },
      { headers: headers_auth() }
    )
    resetMesaForm()
    await carregarConfigTerminal(terminalConfigurandoId.value)
    mostrarMensagem('Mesa cadastrada.', 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao salvar mesa.'
    mostrarMensagem(msg, 'error')
  }
}

const removerMesa = async mesa => {
  try {
    await apiPhp.delete(`/admin/terminais-venda-mesas/${mesa.id}`, { headers: headers_auth() })
    await carregarConfigTerminal(terminalConfigurandoId.value)
    mostrarMensagem('Mesa removida.', 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao remover mesa. Verifique se ela não está em uso.'
    mostrarMensagem(msg, 'error')
  }
}

const resetFuncionarioVincularForm = () => {
  funcionarioVincularForm.funcionario_id = null
  funcionarioVincularForm.papel = ''
}

const vincularFuncionario = async () => {
  if (!terminalConfigurandoId.value) {
    mostrarMensagem('Selecione um terminal para configurar.', 'error')
    return
  }

  if (!funcionarioVincularForm.funcionario_id) {
    mostrarMensagem('Selecione um funcionário para vincular.', 'error')
    return
  }

  try {
    await apiPhp.post(
      `/admin/terminais-venda/${terminalConfigurandoId.value}/funcionarios`,
      {
        funcionario_id: funcionarioVincularForm.funcionario_id,
        papel: funcionarioVincularForm.papel || null
      },
      { headers: headers_auth() }
    )
    resetFuncionarioVincularForm()
    await carregarConfigTerminal(terminalConfigurandoId.value)
    mostrarMensagem('Funcionário vinculado ao terminal.', 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao vincular funcionário.'
    mostrarMensagem(msg, 'error')
  }
}

const removerVinculoFuncionario = async vinculo => {
  try {
    await apiPhp.delete(`/admin/terminais-venda-funcionarios/${vinculo.id}`, { headers: headers_auth() })
    await carregarConfigTerminal(terminalConfigurandoId.value)
    mostrarMensagem('Funcionário desvinculado do terminal.', 'success')
  } catch (error) {
    const msg = error.response?.data?.erro || 'Erro ao desvincular funcionário.'
    mostrarMensagem(msg, 'error')
  }
}

const nomeAmbiente = ambienteId => {
  return ambientes.value.find(a => a.id === ambienteId)?.nome || 'Ambiente não definido'
}

const quantidadeProdutosMenu = menuId => {
  return menuProdutos.value.filter(vinculo => vinculo.menu_id === menuId).length
}

const formatarMoeda = valor => {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

const formatarData = data => {
  if (!data) return 'Nunca'

  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const mostrarMensagem = (text, color = 'success') => {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

onMounted(() => {
  carregarTotems()
})
</script>

<style scoped lang="scss">
.admin-totens-page {
  color: var(--text-color);
}

/* BASE */
.background-secondary,
.background-card,
.form-card {
  border-radius: 4px !important;
  color: var(--text-color) !important;
}

.background-secondary {
  background: var(--bg-color-secondary) !important;
}

.background-card,
.form-card {
  background: var(--bg-card) !important;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: 0.01em;
}

.section-subtitle {
  color: var(--text-color);
  opacity: 0.7;
  margin: 6px 0 0;
  font-size: 0.95rem;
}

.form-card {
  box-shadow: none !important;
  border: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
}

/* CARDS DO VUETIFY */
:deep(.v-card) {
  color: var(--text-color);
}

:deep(.v-card-title),
:deep(.v-card-text),
:deep(.v-card-subtitle),
:deep(.v-card-actions) {
  color: var(--text-color);
}

/* BOTÕES */
:deep(.v-btn) {
  border-radius: 4px !important;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

:deep(.v-btn--variant-flat) {
  box-shadow: none !important;
}

:deep(.v-btn--variant-text) {
  color: var(--text-color);
}

:deep(.v-chip) {
  border-radius: 999px !important;
  font-weight: 500;
}

/* TABELA PRINCIPAL */
:deep(.v-data-table) {
  background: var(--bg-card) !important;
  border-radius: 4px !important;
  color: var(--text-color) !important;
}

:deep(.v-table),
:deep(.v-table__wrapper),
:deep(.v-data-table-footer) {
  background: var(--bg-card) !important;
  color: var(--text-color) !important;
}

:deep(.v-data-table table) {
  background: var(--bg-card) !important;
  color: var(--text-color) !important;
}

:deep(.v-data-table thead tr th) {
  background: var(--bg-card) !important;
  color: var(--text-color) !important;
  font-weight: 500 !important;
  border-bottom: 1px solid color-mix(in srgb, var(--text-color) 12%, transparent) !important;
}

:deep(.v-data-table tbody tr) {
  background: var(--bg-card) !important;
  color: var(--text-color) !important;
}

:deep(.v-data-table tbody tr td) {
  color: var(--text-color) !important;
  border-bottom: 1px solid color-mix(in srgb, var(--text-color) 8%, transparent) !important;
}

:deep(.v-data-table tbody tr:hover) {
  background: color-mix(in srgb, var(--text-color) 4%, var(--bg-card)) !important;
}

/* MODAL CONFIGURAÇÃO */
.config-terminal-page {
  min-height: 100vh;
  background: var(--bg-color) !important;
  color: var(--text-color) !important;
}

.config-toolbar {
  background: var(--bg-color-secondary) !important;
  color: var(--text-color) !important;
  border-bottom: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
}

.config-toolbar :deep(.v-toolbar-title) {
  color: var(--text-color) !important;
  font-size: 1rem;
  font-weight: 500;
}

.config-toolbar small {
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.8rem;
  margin-top: 2px;
}

.config-content {
  background: var(--bg-color) !important;
  color: var(--text-color) !important;
  position: relative;
  min-height: 200px;
}

.config-hero {
  padding: 20px 18px 10px;
  background: var(--bg-color);
  color: var(--text-color);
}

.config-hero h1 {
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 500;
  margin: 0;
  color: var(--text-color);
}

.config-hero p {
  color: var(--text-color);
  opacity: 0.7;
  margin: 8px 0 0;
  font-size: 0.95rem;
}

.config-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
  padding: 16px 18px 28px;
  align-items: start;
}

/* RESUMO LATERAL */
.summary-panel {
  position: sticky;
  top: 16px;
  background: var(--bg-color-secondary);
  border-radius: 4px;
  padding: 16px;
  box-shadow: none;
  border: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
  color: var(--text-color);
}

.summary-panel h2,
.summary-panel h3 {
  color: var(--text-color);
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 600;
}

.summary-item,
.sync-box {
  border-radius: 4px;
  padding: 11px 12px;
  background: var(--bg-card);
  border: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: var(--text-color);
}

.summary-item strong,
.sync-box strong {
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.92rem;
}

.summary-item span,
.sync-box span {
  color: var(--text-color);
  opacity: 0.65;
  font-size: 0.82rem;
}

.summary-panel :deep(.v-alert) {
  border-radius: 4px;
  font-weight: 500;
}

/* CONTEÚDO PRINCIPAL */
.config-main {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.config-section {
  background: var(--bg-color-secondary) !important;
  border-radius: 4px;
  padding: 16px;
  box-shadow: none !important;
  border: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
  color: var(--text-color);
}

.config-section h2 {
  color: var(--text-color);
  font-size: 1.28rem;
  font-weight: 600;
  margin: 0 0 16px;
}

.config-section label {
  display: block;
  color: var(--text-color);
  font-weight: 500;
  font-size: 0.84rem;
  margin-bottom: 6px;
}

.action-btn {
  min-height: 40px;
  border-radius: 4px !important;
  font-weight: 600;
}

/* TABS */
:deep(.v-tabs) {
  background: var(--bg-color-secondary) !important;
  color: var(--text-color) !important;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
}

:deep(.v-tab) {
  color: var(--text-color) !important;
  opacity: 0.7;
}

:deep(.v-tab.v-tab--selected) {
  color: var(--text-color-laranja) !important;
  opacity: 1;
}

:deep(.v-tabs-window),
:deep(.v-tabs-window-item) {
  background: transparent !important;
  color: var(--text-color) !important;
}

/* LISTAS */
.config-list-row,
.product-link-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  border-radius: 4px;
  padding: 12px 14px;
  margin-bottom: 8px;
  background: var(--bg-card);
  border: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
  color: var(--text-color);
}

.config-list-row strong,
.product-link-row strong {
  color: var(--text-color);
  font-weight: 600;
  display: block;
}

.config-list-row span,
.product-link-row span {
  color: var(--text-color);
  opacity: 0.65;
  font-size: 0.84rem;
}

.empty-box {
  padding: 14px;
  border-radius: 4px;
  background: var(--bg-card);
  border: 1px dashed color-mix(in srgb, var(--text-color) 24%, transparent);
  color: var(--text-color);
  opacity: 0.7;
}

.helper-text {
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.86rem;
}

/* PRODUTOS POR MENU */
.menu-products-section {
  border-radius: 4px;
  background: var(--bg-color-secondary);
  border: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
  margin-bottom: 14px;
  overflow: hidden;
  color: var(--text-color);
}

.menu-products-header {
  background: var(--bg-card);
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
  color: var(--text-color);
}

.menu-products-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.menu-products-header span {
  display: block;
  margin-top: 3px;
  color: var(--text-color);
  opacity: 0.65;
  font-size: 0.84rem;
}

.menu-products-section .product-link-row {
  margin: 0;
  border-radius: 0;
  border-left: 0;
  border-right: 0;
  border-top: 0;
  background: var(--bg-color-secondary);
}

.menu-products-section .product-link-row:last-child {
  border-bottom: 0;
}

/* DIVISORES */
:deep(.v-divider) {
  border-color: color-mix(in srgb, var(--text-color) 12%, transparent) !important;
  opacity: 1 !important;
}

/* RESPONSIVO */
@media (max-width: 1180px) {
  .config-layout {
    grid-template-columns: 1fr;
    padding: 14px 14px 28px;
  }

  .summary-panel {
    position: static;
  }

  .config-hero {
    padding: 18px 14px 8px;
  }
}

@media (max-width: 720px) {
  .config-hero h1 {
    font-size: 1.65rem;
  }

  .config-list-row,
  .product-link-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>