import { createStore } from "luffie"
import type { TipoAtivo } from "../types"
import { tipoAtivoService } from "../services/api"
import { message } from "antd"

interface TipoAtivoState {
  tiposAtivo: TipoAtivo[]
  loading: boolean
  selectedTipoAtivo: TipoAtivo | null
}

const initialState: TipoAtivoState = {
  tiposAtivo: [],
  loading: false,
  selectedTipoAtivo: null,
}

export const tipoAtivoStore = createStore(initialState, {
  setLoading: (state, loading: boolean) => ({ ...state, loading }),

  setTiposAtivo: (state, tiposAtivo: TipoAtivo[]) => ({
    ...state,
    tiposAtivo,
    loading: false,
  }),

  setSelectedTipoAtivo: (state, tipoAtivo: TipoAtivo | null) => ({
    ...state,
    selectedTipoAtivo: tipoAtivo,
  }),

  addTipoAtivo: (state, tipoAtivo: TipoAtivo) => ({
    ...state,
    tiposAtivo: [...state.tiposAtivo, tipoAtivo],
  }),

  updateTipoAtivo: (state, updatedTipoAtivo: TipoAtivo) => ({
    ...state,
    tiposAtivo: state.tiposAtivo.map((t) => (t.Id === updatedTipoAtivo.Id ? updatedTipoAtivo : t)),
  }),

  removeTipoAtivo: (state, id: string) => ({
    ...state,
    tiposAtivo: state.tiposAtivo.filter((t) => t.Id !== id),
  }),
})

export const tipoAtivoActions = {
  async fetchTiposAtivo() {
    tipoAtivoStore.setLoading(true)
    try {
      const response = await tipoAtivoService.getAll()
      tipoAtivoStore.setTiposAtivo(response.data)
    } catch (error) {
      message.error("Erro ao carregar tipos de ativo")
      tipoAtivoStore.setLoading(false)
    }
  },

  async createTipoAtivo(data: Omit<TipoAtivo, "Id">) {
    try {
      const response = await tipoAtivoService.create(data)
      tipoAtivoStore.addTipoAtivo(response.data)
      message.success("Tipo de ativo criado com sucesso")
      return response.data
    } catch (error) {
      message.error("Erro ao criar tipo de ativo")
      throw error
    }
  },

  async updateTipoAtivo(id: string, data: TipoAtivo) {
    try {
      const response = await tipoAtivoService.update(id, data)
      tipoAtivoStore.updateTipoAtivo(response.data)
      message.success("Tipo de ativo atualizado com sucesso")
      return response.data
    } catch (error) {
      message.error("Erro ao atualizar tipo de ativo")
      throw error
    }
  },

  async deleteTipoAtivo(id: string) {
    try {
      await tipoAtivoService.delete(id)
      tipoAtivoStore.removeTipoAtivo(id)
      message.success("Tipo de ativo removido com sucesso")
    } catch (error) {
      message.error("Erro ao remover tipo de ativo")
      throw error
    }
  },
}
