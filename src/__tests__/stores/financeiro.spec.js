/* global vi */

import { setActivePinia, createPinia } from 'pinia'
import { useFinanceiroStore } from '@/stores/APIs/financeiro'

const mockApiPhp = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('@/services/apiPhp', () => ({
  default: mockApiPhp,
}))

describe('useFinanceiroStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('baixarPagamentos', () => {
    it('envia o objeto de baixa diretamente, sem desembrulhar data[]', async () => {
      const baixaMock = { id_pagbaixa: 1, id_pagparcela: 42, vlrbaixa: 510 }
      mockApiPhp.post.mockResolvedValueOnce({ data: baixaMock })

      const store = useFinanceiroStore()
      const payload = { id_pagparcela: 42, id_empresa: 1, vlrbaixa: 510, id_lote_ccusto: 7 }
      const resultado = await store.baixarPagamentos(1, payload)

      expect(mockApiPhp.post).toHaveBeenCalledWith('/financeiro/baixa-pagars', payload)
      expect(resultado).toEqual(baixaMock)
    })

    it('propaga o erro quando a API rejeita', async () => {
      mockApiPhp.post.mockRejectedValueOnce({ response: { data: { message: 'Parcela a pagar não encontrada' } } })

      const store = useFinanceiroStore()

      await expect(store.baixarPagamentos(1, { id_pagparcela: 999 })).rejects.toBeTruthy()
      expect(store.error).toBe('Parcela a pagar não encontrada')
    })
  })
})
