import { createStore } from "luffie"
import type { Ativo } from "../types"
import { ativoService } from "../services/api"
import { message } from "antd"

interface AtivoState {
  ativos: Ativo[]
  loading: boolean
  selectedAtivo: Ativo | null
}

const initialState: AtivoState = {
  ativos: [],
  loading: false,
  selectedAtivo: null,
}

export const ativoStore = createStore(initialState, {
  setLoading: (state, loading: boolean) => ({ ...state, loading }),

  setAtivos: (state, ativos: Ativo[]) => ({
    ...state,
    ativos,
    loading: false,
  }),

  setSelectedAtivo: (state, ativo: Ativo | null) => ({
    ...state,
    selectedAtivo: ativo,
  }),

  addAtivo: (state, ativo: Ativo) => ({
    ...state,
    ativos: [...state.ativos, ativo],
  }),

  updateAtivo: (state, updatedAtivo: Ativo) => ({
    ...state,
    ativos: state.ativos.map((a) => (a.Id === updatedAtivo.Id ? updatedAtivo : a)),
  }),

  removeAtivo: (state, id: string) => ({
    ...state,
    ativos: state.ativos.filter((a) => a.Id !== id),
  }),
})

export const ativoActions = {
  async fetchAtivos() {
    ativoStore.setLoading(true)
    try {
      const response = await ativoService.getAll()
      ativoStore.setAtivos(response.data)
    } catch (error) {
      message.error("Erro ao carregar ativos")
      ativoStore.setLoading(false)
    }
  },

  async createAtivo(data: Omit<Ativo, "Id">) {
    try {
      const response = await ativoService.create(data)
      ativoStore.addAtivo(response.data)
      message.success("Ativo criado com sucesso")
      return response.data
    } catch (error) {
      message.error("Erro ao criar ativo")
      throw error
    }
  },

  async updateAtivo(id: string, data: Ativo) {
    try {
      const response = await ativoService.update(id, data)
      ativoStore.updateAtivo(response.data)
      message.success("Ativo atualizado com sucesso")
      return response.data
    } catch (error) {
      message.error("Erro ao atualizar ativo")
      throw error
    }
  },

  async deleteAtivo(id: string) {
    try {
      await ativoService.delete(id)
      ativoStore.removeAtivo(id)
      message.success("Ativo removido com sucesso")
    } catch (error) {
      message.error("Erro ao remover ativo")
      throw error
    }
  },
}
