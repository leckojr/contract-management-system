"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { ContratoVenda } from "../types"
import { contratoService } from "../services/api"

interface ContratoState {
  contratos: ContratoVenda[]
  loading: boolean
  selectedContrato: ContratoVenda | null
  error: string | null
  isUsingMockData: boolean
}

type ContratoAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CONTRATOS"; payload: { data: ContratoVenda[]; isFromAPI: boolean } }
  | { type: "SET_SELECTED_CONTRATO"; payload: ContratoVenda | null }
  | { type: "ADD_CONTRATO"; payload: { data: ContratoVenda; isFromAPI: boolean } }
  | { type: "UPDATE_CONTRATO"; payload: { data: ContratoVenda; isFromAPI: boolean } }
  | { type: "REMOVE_CONTRATO"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }

const initialState: ContratoState = {
  contratos: [],
  loading: false,
  selectedContrato: null,
  error: null,
  isUsingMockData: false,
}

const contratoReducer = (state: ContratoState, action: ContratoAction): ContratoState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null }
    case "SET_CONTRATOS":
      return {
        ...state,
        contratos: action.payload.data,
        loading: false,
        error: null,
        isUsingMockData: !action.payload.isFromAPI,
      }
    case "SET_SELECTED_CONTRATO":
      return { ...state, selectedContrato: action.payload }
    case "ADD_CONTRATO":
      return {
        ...state,
        contratos: [...state.contratos, action.payload.data],
        error: null,
        isUsingMockData: state.isUsingMockData || !action.payload.isFromAPI,
      }
    case "UPDATE_CONTRATO":
      return {
        ...state,
        contratos: state.contratos.map((c) => (c.Id === action.payload.data.Id ? action.payload.data : c)),
        error: null,
        isUsingMockData: state.isUsingMockData || !action.payload.isFromAPI,
      }
    case "REMOVE_CONTRATO":
      return {
        ...state,
        contratos: state.contratos.filter((c) => c.Id !== action.payload),
        error: null,
      }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

interface ContratoContextType {
  state: ContratoState
  dispatch: React.Dispatch<ContratoAction>
  actions: {
    fetchContratos: () => Promise<void>
    createContrato: (data: Omit<ContratoVenda, "Id">) => Promise<ContratoVenda>
    updateContrato: (id: string, data: ContratoVenda) => Promise<ContratoVenda>
    deleteContrato: (id: string) => Promise<void>
    clearError: () => void
  }
}

const ContratoContext = createContext<ContratoContextType | undefined>(undefined)

export const ContratoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(contratoReducer, initialState)

  const actions = {
    async fetchContratos() {
      dispatch({ type: "SET_LOADING", payload: true })
      try {
        console.log("🔍 Buscando contratos...")
        const response = await contratoService.getAll()
        console.log("📊 Contratos carregados:", response)

        dispatch({
          type: "SET_CONTRATOS",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })
      } catch (error) {
        console.error("❌ Erro ao carregar contratos:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao carregar contratos"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
      }
    },

    async createContrato(data: Omit<ContratoVenda, "Id">) {
      try {
        console.log("➕ Criando contrato:", data)
        const response = await contratoService.create(data)
        console.log("✅ Contrato criado:", response)

        dispatch({
          type: "ADD_CONTRATO",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })

        return response.data
      } catch (error) {
        console.error("❌ Erro ao criar contrato:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar contrato"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw new Error(errorMessage)
      }
    },

    async updateContrato(id: string, data: ContratoVenda) {
      try {
        console.log("✏️ Atualizando contrato:", id, data)
        const response = await contratoService.update(id, data)
        console.log("✅ Contrato atualizado:", response)

        dispatch({
          type: "UPDATE_CONTRATO",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })

        return response.data
      } catch (error) {
        console.error("❌ Erro ao atualizar contrato:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao atualizar contrato"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw new Error(errorMessage)
      }
    },

    async deleteContrato(id: string) {
      try {
        console.log("🗑️ Excluindo contrato:", id)

        if (!id) {
          throw new Error("ID do contrato não fornecido")
        }

        await contratoService.delete(id)
        console.log("✅ Contrato excluído com sucesso:", id)

        dispatch({ type: "REMOVE_CONTRATO", payload: id })
      } catch (error) {
        console.error("❌ Erro ao excluir contrato:", error)

        let errorMessage = "Erro desconhecido ao excluir contrato"

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

  return <ContratoContext.Provider value={{ state, dispatch, actions }}>{children}</ContratoContext.Provider>
}

export const useContrato = () => {
  const context = useContext(ContratoContext)
  if (context === undefined) {
    throw new Error("useContrato must be used within a ContratoProvider")
  }
  return context
}
