import type { Fornecedor, TipoAtivo, Ativo, ContratoVenda } from "../types"

let mockTiposAtivoCounter = 8
const mockTiposAtivo: TipoAtivo[] = [
  { Id: "1", Codigo: "EQUIP", Descricao: "Equipamentos" },
  { Id: "2", Codigo: "SOFT", Descricao: "Software" },
  { Id: "3", Codigo: "SERV", Descricao: "Serviços" },
  { Id: "4", Codigo: "INFRA", Descricao: "Infraestrutura" },
  { Id: "5", Codigo: "MOVEL", Descricao: "Móveis e Utensílios" },
  { Id: "6", Codigo: "VEIC", Descricao: "Veículos" },
  { Id: "7", Codigo: "teste", Descricao: "teste" },
]

let mockAtivosCounter = 8
const mockAtivos: Ativo[] = [
  { Id: "1", Codigo: "COMP001", Descricao: "Computador Desktop", TipoAtivoId: "1", PrecoVenda: 2500.0 },
  { Id: "2", Codigo: "SOFT001", Descricao: "Licença Office", TipoAtivoId: "2", PrecoVenda: 350.0 },
  { Id: "3", Codigo: "SERV001", Descricao: "Consultoria TI", TipoAtivoId: "3", PrecoVenda: 150.0 },
  { Id: "4", Codigo: "MOVEL001", Descricao: "Mesa de Escritório", TipoAtivoId: "5", PrecoVenda: 800.0 },
  { Id: "5", Codigo: "EQUIP002", Descricao: "Notebook", TipoAtivoId: "1", PrecoVenda: 3200.0 },
  { Id: "6", Codigo: "SOFT002", Descricao: "Licença Windows", TipoAtivoId: "2", PrecoVenda: 450.0 },
  { Id: "7", Codigo: "SERV002", Descricao: "teste", TipoAtivoId: "3", PrecoVenda: 120.0 },
]

let mockFornecedoresCounter = 5
const mockFornecedores: Fornecedor[] = [
  { Id: "1", Codigo: "FORN001", Descricao: "Tech Solutions Ltda", CNPJ: "12.345.678/0001-90" },
  { Id: "2", Codigo: "FORN002", Descricao: "Office Supply Co", CNPJ: "98.765.432/0001-10" },
  { Id: "3", Codigo: "FORN003", Descricao: "IT Services Inc", CNPJ: "11.222.333/0001-44" },
  { Id: "4", Codigo: "teste", Descricao: "testeeee", CNPJ: "00.000.000/0000-00" },
  
]

let mockContratosCounter = 1
const mockContratos: ContratoVenda[] = []

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Fornecedores
export const fornecedorService = {
  getAll: async () => {
    console.log("📋 Carregando fornecedores (mock)")
    await delay(500) // Simula delay da API
    return { data: [...mockFornecedores], isFromAPI: false }
  },

  getById: async (id: string) => {
    console.log(`📋 Buscando fornecedor ${id} (mock)`)
    await delay(300)
    const item = mockFornecedores.find((item) => item.Id === id)
    if (!item) {
      throw new Error("Fornecedor não encontrado")
    }
    return { data: item, isFromAPI: false }
  },

  create: async (data: Omit<Fornecedor, "Id">) => {
    console.log("📋 Criando fornecedor (mock)", data)
    await delay(500)

    const newItem: Fornecedor = {
      Id: mockFornecedoresCounter.toString(),
      ...data,
    }
    mockFornecedoresCounter++
    mockFornecedores.push(newItem)

    return { data: newItem, isFromAPI: false }
  },

  update: async (id: string, data: Fornecedor) => {
    console.log(`📋 Atualizando fornecedor ${id} (mock)`, data)
    await delay(500)

    const index = mockFornecedores.findIndex((item) => item.Id === id)
    if (index === -1) {
      throw new Error("Fornecedor não encontrado")
    }

    mockFornecedores[index] = data
    return { data: data, isFromAPI: false }
  },

  delete: async (id: string) => {
    console.log(`📋 Excluindo fornecedor ${id} (mock)`)
    await delay(500)

    const index = mockFornecedores.findIndex((item) => item.Id === id)
    if (index === -1) {
      throw new Error("Fornecedor não encontrado")
    }

    mockFornecedores.splice(index, 1)
    return { data: null, isFromAPI: false }
  },
}

// Tipos de Ativo
export const tipoAtivoService = {
  getAll: async () => {
    console.log("📦 Carregando tipos de ativo (mock)")
    await delay(500)
    return { data: [...mockTiposAtivo], isFromAPI: false }
  },

  getById: async (id: string) => {
    console.log(`📦 Buscando tipo de ativo ${id} (mock)`)
    await delay(300)
    const item = mockTiposAtivo.find((item) => item.Id === id)
    if (!item) {
      throw new Error("Tipo de ativo não encontrado")
    }
    return { data: item, isFromAPI: false }
  },

  create: async (data: Omit<TipoAtivo, "Id">) => {
    console.log("📦 Criando tipo de ativo (mock)", data)
    await delay(500)

    const newItem: TipoAtivo = {
      Id: mockTiposAtivoCounter.toString(),
      ...data,
    }
    mockTiposAtivoCounter++
    mockTiposAtivo.push(newItem)

    return { data: newItem, isFromAPI: false }
  },

  update: async (id: string, data: TipoAtivo) => {
    console.log(`📦 Atualizando tipo de ativo ${id} (mock)`, data)
    await delay(500)

    const index = mockTiposAtivo.findIndex((item) => item.Id === id)
    if (index === -1) {
      throw new Error("Tipo de ativo não encontrado")
    }

    mockTiposAtivo[index] = data
    return { data: data, isFromAPI: false }
  },

  delete: async (id: string) => {
    console.log(`📦 Excluindo tipo de ativo ${id} (mock)`)
    await delay(500)

    const index = mockTiposAtivo.findIndex((item) => item.Id === id)
    if (index === -1) {
      throw new Error("Tipo de ativo não encontrado")
    }

    mockTiposAtivo.splice(index, 1)
    return { data: null, isFromAPI: false }
  },
}

// Ativos
export const ativoService = {
  getAll: async () => {
    console.log("🏷️ Carregando ativos (mock)")
    await delay(500)
    return { data: [...mockAtivos], isFromAPI: false }
  },

  getById: async (id: string) => {
    console.log(`🏷️ Buscando ativo ${id} (mock)`)
    await delay(300)
    const item = mockAtivos.find((item) => item.Id === id)
    if (!item) {
      throw new Error("Ativo não encontrado")
    }
    return { data: item, isFromAPI: false }
  },

  create: async (data: Omit<Ativo, "Id">) => {
    console.log("🏷️ Criando ativo (mock)", data)
    await delay(500)

    const newItem: Ativo = {
      Id: mockAtivosCounter.toString(),
      ...data,
    }
    mockAtivosCounter++
    mockAtivos.push(newItem)

    return { data: newItem, isFromAPI: false }
  },

  update: async (id: string, data: Ativo) => {
    console.log(`🏷️ Atualizando ativo ${id} (mock)`, data)
    await delay(500)

    const index = mockAtivos.findIndex((item) => item.Id === id)
    if (index === -1) {
      throw new Error("Ativo não encontrado")
    }

    mockAtivos[index] = data
    return { data: data, isFromAPI: false }
  },

  delete: async (id: string) => {
    console.log(`🏷️ Excluindo ativo ${id} (mock)`)
    await delay(500)

    const index = mockAtivos.findIndex((item) => item.Id === id)
    if (index === -1) {
      throw new Error("Ativo não encontrado")
    }

    mockAtivos.splice(index, 1)
    return { data: null, isFromAPI: false }
  },
}

export const contratoService = {
  getAll: async () => {
    console.log("💰 Carregando contratos (mock)")
    await delay(500)
    return { data: [...mockContratos], isFromAPI: false }
  },

  getById: async (id: string) => {
    console.log(`💰 Buscando contrato ${id} (mock)`)
    await delay(300)
    const item = mockContratos.find((item) => item.Id === id)
    if (!item) {
      throw new Error("Contrato não encontrado")
    }
    return { data: item, isFromAPI: false }
  },

  create: async (data: Omit<ContratoVenda, "Id">) => {
    console.log("💰 Criando contrato (mock)", data)
    await delay(500)

    const newItem: ContratoVenda = {
      Id: mockContratosCounter.toString(),
      ...data,
    }
    mockContratosCounter++
    mockContratos.push(newItem)

    return { data: newItem, isFromAPI: false }
  },

  update: async (id: string, data: ContratoVenda) => {
    console.log(`💰 Atualizando contrato ${id} (mock)`, data)
    await delay(500)

    const index = mockContratos.findIndex((item) => item.Id === id)
    if (index === -1) {
      throw new Error("Contrato não encontrado")
    }

    mockContratos[index] = data
    return { data: data, isFromAPI: false }
  },

  delete: async (id: string) => {
    console.log(`💰 Excluindo contrato ${id} (mock)`)
    await delay(500)

    const index = mockContratos.findIndex((item) => item.Id === id)
    if (index === -1) {
      throw new Error("Contrato não encontrado")
    }

    mockContratos.splice(index, 1)
    return { data: null, isFromAPI: false }
  },
}
