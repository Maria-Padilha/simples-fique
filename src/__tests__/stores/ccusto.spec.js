/* global vi */

import { setActivePinia, createPinia } from 'pinia'
import { useCCustoStore } from '@/stores/APIs/ccusto'

const mockApiPhp = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('@/services/apiPhp', () => ({
  default: mockApiPhp,
}))

vi.mock('vue3-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('useCCustoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('criarCentroCustoPrevistoLote', () => {
    it('cria o lote de previsão com sucesso e retorna o lote com id', async () => {
      const loteMock = { id: 1, valor: '500.00', origem: 'PAG', dtvencimento: '2026-08-31' }
      mockApiPhp.post.mockResolvedValueOnce({ data: loteMock })

      const store = useCCustoStore()
      const resultado = await store.criarCentroCustoPrevistoLote({ valor: 500, origem: 'PAG', dtvencimento: '2026-08-31' })

      expect(mockApiPhp.post).toHaveBeenCalledWith('/financeiro/centro-custo-previsto-lotes', { valor: 500, origem: 'PAG', dtvencimento: '2026-08-31' })
      expect(resultado).toEqual(loteMock)
      expect(store.errorMessage).toBe('')
    })

    it('retorna null e seta errorMessage em caso de falha', async () => {
      mockApiPhp.post.mockRejectedValueOnce({ response: { data: { message: 'O valor do lote é obrigatório' } } })

      const store = useCCustoStore()
      const resultado = await store.criarCentroCustoPrevistoLote({ origem: 'PAG', dtvencimento: '2026-08-31' })

      expect(resultado).toBeNull()
      expect(store.errorMessage).toBe('O valor do lote é obrigatório')
    })
  })

  describe('criarCentroCustoPrevistoLoteItem', () => {
    it('cria o item de rateio com sucesso', async () => {
      const itemMock = { id: 1, id_prev_lote: 1, id_reduzido_despesa: 10, id_ccusto: 3, valor: '250.00' }
      mockApiPhp.post.mockResolvedValueOnce({ data: itemMock })

      const store = useCCustoStore()
      const resultado = await store.criarCentroCustoPrevistoLoteItem({ id_prev_lote: 1, id_reduzido_despesa: 10, id_ccusto: 3, valor: 250 })

      expect(mockApiPhp.post).toHaveBeenCalledWith('/financeiro/centro-custo-previsto-lote-itens', { id_prev_lote: 1, id_reduzido_despesa: 10, id_ccusto: 3, valor: 250 })
      expect(resultado).toEqual(itemMock)
    })

    it('retorna null e seta errorMessage em caso de falha', async () => {
      mockApiPhp.post.mockRejectedValueOnce({ response: { data: { erro: 'Lote de previsão não encontrado' } } })

      const store = useCCustoStore()
      const resultado = await store.criarCentroCustoPrevistoLoteItem({ id_prev_lote: 999, id_reduzido_despesa: 10, id_ccusto: 3, valor: 250 })

      expect(resultado).toBeNull()
      expect(store.errorMessage).toBe('Lote de previsão não encontrado')
    })
  })
})
