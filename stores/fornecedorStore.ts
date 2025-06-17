import { createStore } from "luffie"
import type { Fornecedor } from "../types"
import { fornecedorService } from "../services/api"

interface FornecedorState {
  fornecedores: Fornecedor[]
  loading: boolean
  selectedFornecedor: Fornecedor | null
}

const initialState: FornecedorState = {
  fornecedores: [],
  loading: false,
  selectedFornecedor: null,
}

export const fornecedorStore = createStore(initialState, {
  setLoading: (state, loading: boolean) => ({ ...state, loading }),

  setFornecedores: (state, fornecedores: Fornecedor[]) => ({
    ...state,
    fornecedores,
    loading: false,
  }),

  setSelectedFornecedor: (state, fornecedor: Fornecedor | null) => ({
    ...state,
    selectedFornecedor: fornecedor,
  }),

  addFornecedor: (state, fornecedor: Fornecedor) => ({
    ...state,
    fornecedores: [...state.fornecedores, fornecedor],
  }),

  updateFornecedor: (state, updatedFornecedor: Fornecedor) => ({
    ...state,
    fornecedores: state.fornecedores.map((f) => (f.Id === updatedFornecedor.Id ? updatedFornecedor : f)),
  }),

  removeFornecedor: (state, id: string) => ({
    ...state,
    fornecedores: state.fornecedores.filter((f) => f.Id !== id),
  }),
})

// Actions
export const fornecedorActions = {
  async fetchFornecedores() {
    fornecedorStore.setLoading(true)
    try {
      const response = await fornecedorService.getAll()
      fornecedorStore.setFornecedores(response.data)
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error)
      fornecedorStore.setLoading(false)
    }
  },

  async createFornecedor(data: Omit<Fornecedor, "Id">) {
    try {
      const response = await fornecedorService.create(data)
      fornecedorStore.addFornecedor(response.data)
      return response.data
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error)
      throw error
    }
  },

  async updateFornecedor(id: string, data: Fornecedor) {
    try {
      const response = await fornecedorService.update(id, data)
      fornecedorStore.updateFornecedor(response.data)
      return response.data
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error)
      throw error
    }
  },

  async deleteFornecedor(id: string) {
    try {
      await fornecedorService.delete(id)
      fornecedorStore.removeFornecedor(id)
    } catch (error) {
      console.error("Erro ao remover fornecedor:", error)
      throw error
    }
  },
}
