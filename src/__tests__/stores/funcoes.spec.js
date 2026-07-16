import { setActivePinia, createPinia } from 'pinia'
import { useFuncoesStore } from '@/stores/funcoes/funcoes'

describe('useFuncoesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('normalizarMoeda', () => {
    const store = () => useFuncoesStore()

    it('retorna "0.00" para null', () => {
      expect(store().normalizarMoeda(null)).toBe('0.00')
    })

    it('retorna "0.00" para undefined', () => {
      expect(store().normalizarMoeda(undefined)).toBe('0.00')
    })

    it('retorna "0.00" para string vazia', () => {
      expect(store().normalizarMoeda('')).toBe('0.00')
    })

    it('formata número inteiro com 2 casas', () => {
      expect(store().normalizarMoeda(10)).toBe('10.00')
    })

    it('formata string com vírgula como decimal', () => {
      expect(store().normalizarMoeda('15,50')).toBe('15.50')
    })

    it('retorna "0.00" para valor com separador de milhar', () => {
      expect(store().normalizarMoeda('1.234,56')).toBe('0.00')
    })

    it('retorna "0.00" para NaN', () => {
      expect(store().normalizarMoeda('abc')).toBe('0.00')
    })
  })

  describe('normalizarQuantidade', () => {
    const store = () => useFuncoesStore()

    it('retorna "0.0000" para null', () => {
      expect(store().normalizarQuantidade(null)).toBe('0.0000')
    })

    it('formata número com 4 casas', () => {
      expect(store().normalizarQuantidade(5)).toBe('5.0000')
    })
  })

  describe('preencherForms', () => {
    const store = () => useFuncoesStore()

    // Fragmento mínimo baseado no XML real de NFe usado como referência no projeto
    const xmlString = `<infNFe Id="NFe11260602393780000293550030005526731515360074">
      <ide><nNF>552673</nNF><serie>3</serie></ide>
      <total><ICMSTot>
        <vBC>23.98</vBC><vICMS>4.68</vICMS><vICMSDeson>0</vICMSDeson>
        <vBCST>0</vBCST><vST>0</vST>
        <vProd>1286.37</vProd><vNF>1286.37</vNF>
        <vFrete>0</vFrete><vSeg>0</vSeg><vDesc>0</vDesc>
        <vII>0</vII><vIPI>0</vIPI><vPIS>1.14</vPIS><vCOFINS>5.27</vCOFINS><vOutro>0</vOutro>
      </ICMSTot></total>
      <transp><modFrete>9</modFrete></transp>
    </infNFe>`

    const xml = new DOMParser().parseFromString(xmlString, 'application/xml')
    const total = { ICMSTot: { vBC: '23.98', vICMS: '4.68', vICMSDeson: '0', vBCST: '0', vST: '0', vProd: '1286.37', vNF: '1286.37', vFrete: '0', vSeg: '0', vDesc: '0', vII: '0', vIPI: '0', vPIS: '1.14', vCOFINS: '5.27', vOutro: '0' } }
    const transp = { modFrete: '9' }

    it('deriva aliquota_icms de vICMS/vBC (pICMS não existe em ICMSTot)', () => {
      const forms = {}
      store().preencherForms(null, total, null, xml, null, [], transp, null, null, forms, { value: [] })

      expect(forms.aliquota_icms).toBe('19.52')
    })

    it('preenche vlr_cofins_produto a partir de vCOFINS', () => {
      const forms = {}
      store().preencherForms(null, total, null, xml, null, [], transp, null, null, forms, { value: [] })

      expect(forms.vlr_cofins_produto).toBe('5.27')
    })

    it('não preenche volumes quando o XML não tem <transp><vol>', () => {
      const forms = {}
      store().preencherForms(null, total, null, xml, null, [], transp, null, null, forms, { value: [] })

      expect(forms.qtd_volume).toBeUndefined()
    })
  })
})
