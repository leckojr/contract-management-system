"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { Ativo } from "../types"
import { ativoService } from "../services/api"

interface AtivoState {
  ativos: Ativo[]
  loading: boolean
  selectedAtivo: Ativo | null
  error: string | null
  isUsingMockData: boolean
}

type AtivoAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ATIVOS"; payload: { data: Ativo[]; isFromAPI: boolean } }
  | { type: "SET_SELECTED_ATIVO"; payload: Ativo | null }
  | { type: "ADD_ATIVO"; payload: { data: Ativo; isFromAPI: boolean } }
  | { type: "UPDATE_ATIVO"; payload: { data: Ativo; isFromAPI: boolean } }
  | { type: "REMOVE_ATIVO"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }

const initialState: AtivoState = {
  ativos: [],
  loading: false,
  selectedAtivo: null,
  error: null,
  isUsingMockData: false,
}

const ativoReducer = (state: AtivoState, action: AtivoAction): AtivoState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null }
    case "SET_ATIVOS":
      // Verifica se os dados são válidos
      const ativos = Array.isArray(action.payload.data) ? action.payload.data : []
      return {
        ...state,
        ativos: ativos,
        loading: false,
        error: null,
        isUsingMockData: !action.payload.isFromAPI,
      }
    case "SET_SELECTED_ATIVO":
      return { ...state, selectedAtivo: action.payload }
    case "ADD_ATIVO":
      // Verifica se o dado é válido antes de adicionar
      if (!action.payload.data || !action.payload.data.Id) {
        console.error("❌ Tentativa de adicionar ativo inválido:", action.payload.data)
        return { ...state, error: "Erro ao adicionar ativo: dados inválidos" }
      }
      return {
        ...state,
        ativos: [...state.ativos, action.payload.data],
        error: null,
        isUsingMockData: state.isUsingMockData || !action.payload.isFromAPI,
      }
    case "UPDATE_ATIVO":
      // Verifica se o dado é válido antes de atualizar
      if (!action.payload.data || !action.payload.data.Id) {
        console.error("❌ Tentativa de atualizar ativo inválido:", action.payload.data)
        return { ...state, error: "Erro ao atualizar ativo: dados inválidos" }
      }
      return {
        ...state,
        ativos: state.ativos.map((a) => (a.Id === action.payload.data.Id ? action.payload.data : a)),
        error: null,
        isUsingMockData: state.isUsingMockData || !action.payload.isFromAPI,
      }
    case "REMOVE_ATIVO":
      return {
        ...state,
        ativos: state.ativos.filter((a) => a.Id !== action.payload),
        error: null,
      }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

interface AtivoContextType {
  state: AtivoState
  dispatch: React.Dispatch<AtivoAction>
  actions: {
    fetchAtivos: () => Promise<void>
    createAtivo: (data: Omit<Ativo, "Id">) => Promise<Ativo>
    updateAtivo: (id: string, data: Ativo) => Promise<Ativo>
    deleteAtivo: (id: string) => Promise<void>
    clearError: () => void
  }
}

const AtivoContext = createContext<AtivoContextType | undefined>(undefined)

export const AtivoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(ativoReducer, initialState)

  const actions = {
    async fetchAtivos() {
      dispatch({ type: "SET_LOADING", payload: true })

      try {
        console.log("🔍 Buscando ativos...")
        const response = await ativoService.getAll()
        console.log("📊 Ativos carregados:", response)

        // Verifica se a resposta é válida
        if (!response || !response.data) {
          console.warn("⚠️ Resposta inválida do serviço, usando array vazio")
          dispatch({
            type: "SET_ATIVOS",
            payload: { data: [], isFromAPI: false },
          })
          return
        }

        dispatch({
          type: "SET_ATIVOS",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })

        if (!response.isFromAPI) {
          console.log("⚠️ Usando dados mock para ativos - API não disponível")
        } else {
          console.log("✅ Dados de ativos carregados da API com sucesso")
        }
      } catch (error) {
        console.error("❌ Erro crítico ao carregar ativos:", error)

        // Força dados mock como último recurso
        const mockData = [
          { Id: "1", Codigo: "COMP001", Descricao: "Computador Desktop", TipoAtivoId: "1", PrecoVenda: 2500.0 },
          { Id: "2", Codigo: "SOFT001", Descricao: "Licença Office", TipoAtivoId: "2", PrecoVenda: 350.0 },
          { Id: "3", Codigo: "SERV001", Descricao: "Consultoria TI", TipoAtivoId: "3", PrecoVenda: 150.0 },
        ]

        dispatch({
          type: "SET_ATIVOS",
          payload: { data: mockData, isFromAPI: false },
        })

        console.log("🔄 Forçado uso de dados mock de emergência para ativos")
      }
    },

    async createAtivo(data: Omit<Ativo, "Id">) {
      try {
        console.log("➕ Criando ativo:", data)

        // Validação dos dados de entrada
        if (!data.Codigo || !data.Descricao || !data.TipoAtivoId || data.PrecoVenda === undefined) {
          throw new Error("Dados obrigatórios não fornecidos")
        }

        const response = await ativoService.create(data)
        console.log("✅ Ativo criado:", response)

        // Verifica se a resposta é válida
        if (!response || !response.data || !response.data.Id) {
          throw new Error("Resposta inválida do serviço")
        }

        dispatch({
          type: "ADD_ATIVO",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })

        return response.data
      } catch (error) {
        console.error("❌ Erro ao criar ativo:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar ativo"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw new Error(errorMessage)
      }
    },

    async updateAtivo(id: string, data: Ativo) {
      try {
        console.log("✏️ Atualizando ativo:", id, data)

        // Validação dos dados de entrada
        if (!id || !data.Id || !data.Codigo || !data.Descricao || !data.TipoAtivoId || data.PrecoVenda === undefined) {
          throw new Error("Dados obrigatórios não fornecidos")
        }

        const response = await ativoService.update(id, data)
        console.log("✅ Ativo atualizado:", response)

        // Verifica se a resposta é válida
        if (!response || !response.data || !response.data.Id) {
          throw new Error("Resposta inválida do serviço")
        }

        dispatch({
          type: "UPDATE_ATIVO",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })

        return response.data
      } catch (error) {
        console.error("❌ Erro ao atualizar ativo:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao atualizar ativo"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw new Error(errorMessage)
      }
    },

    async deleteAtivo(id: string) {
      try {
        console.log("🗑️ Excluindo ativo:", id)

        if (!id || id.trim() === "") {
          throw new Error("ID do ativo não fornecido")
        }

        await ativoService.delete(id)
        console.log("✅ Ativo excluído com sucesso:", id)

        dispatch({ type: "REMOVE_ATIVO", payload: id })
      } catch (error) {
        console.error("❌ Erro ao excluir ativo:", error)

        let errorMessage = "Erro desconhecido ao excluir ativo"

        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === "object" && error !== null) {
          const axiosError = error as any
          if (axiosError.response) {
            errorMessage = `Erro ${axiosError.response.status}: ${axiosError.response.statusText}`
          } else if (axiosError.request) {
            errorMessage = "Erro de conexão com o servidor"
          }
        }

        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw new Error(errorMessage)
      }
    },

    clearError() {
      dispatch({ type: "SET_ERROR", payload: null })
    },
  }

  return <AtivoContext.Provider value={{ state, dispatch, actions }}>{children}</AtivoContext.Provider>
}

export const useAtivo = () => {
  const context = useContext(AtivoContext)
  if (context === undefined) {
    throw new Error("useAtivo must be used within a AtivoProvider")
  }
  return context
}
