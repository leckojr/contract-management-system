export interface Fornecedor {
  Id?: string
  Codigo: string
  Descricao: string
  CNPJ: string
}

export interface TipoAtivo {
  Id?: string
  Codigo: string
  Descricao: string
}

export interface Ativo {
  Id?: string
  Codigo: string
  Descricao: string
  TipoAtivoId: string
  PrecoVenda: number
  TipoAtivo?: TipoAtivo
}

export interface ItemContrato {
  AtivoId: string
  Quantidade: number
  PrecoUnitario: number
  Ativo?: Ativo
}

export interface ContratoVenda {
  Id?: string
  NumeroContrato: string
  DataCriacao: string
  DataAlteracao: string
  FornecedorId: string
  Itens: ItemContrato[]
  Desconto: number
  ValorTotal: number
  Fornecedor?: Fornecedor
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}
