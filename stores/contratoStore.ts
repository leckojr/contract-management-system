import { createStore } from "luffie"
import type { ContratoVenda } from "../types"
import { contratoService } from "../services/api"
import { message } from "antd"

interface ContratoState {
  contratos: ContratoVenda[]
  loading: boolean
  selectedContrato: ContratoVenda | null
}

const initialState: ContratoState = {
  contratos: [],
  loading: false,
  selectedContrato: null,
}

export const contratoStore = createStore(initialState, {
  setLoading: (state, loading: boolean) => ({ ...state, loading }),

  setContratos: (state, contratos: ContratoVenda[]) => ({
    ...state,
    contratos,
    loading: false,
  }),

  setSelectedContrato: (state, contrato: ContratoVenda | null) => ({
    ...state,
    selectedContrato: contrato,
  }),

  addContrato: (state, contrato: ContratoVenda) => ({
    ...state,
    contratos: [...state.contratos, contrato],
  }),

  updateContrato: (state, updatedContrato: ContratoVenda) => ({
    ...state,
    contratos: state.contratos.map((c) => (c.Id === updatedContrato.Id ? updatedContrato : c)),
  }),

  removeContrato: (state, id: string) => ({
    ...state,
    contratos: state.contratos.filter((c) => c.Id !== id),
  }),
})

export const contratoActions = {
  async fetchContratos() {
    contratoStore.setLoading(true)
    try {
      const response = await contratoService.getAll()
      contratoStore.setContratos(response.data)
    } catch (error) {
      message.error("Erro ao carregar contratos")
      contratoStore.setLoading(false)
    }
  },

  async createContrato(data: Omit<ContratoVenda, "Id">) {
    try {
      const response = await contratoService.create(data)
      contratoStore.addContrato(response.data)
      message.success("Contrato criado com sucesso")
      return response.data
    } catch (error) {
      message.error("Erro ao criar contrato")
      throw error
    }
  },

  async updateContrato(id: string, data: ContratoVenda) {
    try {
      const response = await contratoService.update(id, data)
      contratoStore.updateContrato(response.data)
      message.success("Contrato atualizado com sucesso")
      return response.data
    } catch (error) {
      message.error("Erro ao atualizar contrato")
      throw error
    }
  },

  async deleteContrato(id: string) {
    try {
      await contratoService.delete(id)
      contratoStore.removeContrato(id)
      message.success("Contrato removido com sucesso")
    } catch (error) {
      message.error("Erro ao remover contrato")
      throw error
    }
  },
}
