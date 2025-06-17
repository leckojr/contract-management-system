"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { Fornecedor } from "../types"
import { fornecedorService } from "../services/api"

interface FornecedorState {
  fornecedores: Fornecedor[]
  loading: boolean
  selectedFornecedor: Fornecedor | null
  error: string | null
  isUsingMockData: boolean
}

type FornecedorAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_FORNECEDORES"; payload: { data: Fornecedor[]; isFromAPI: boolean } }
  | { type: "SET_SELECTED_FORNECEDOR"; payload: Fornecedor | null }
  | { type: "ADD_FORNECEDOR"; payload: { data: Fornecedor; isFromAPI: boolean } }
  | { type: "UPDATE_FORNECEDOR"; payload: { data: Fornecedor; isFromAPI: boolean } }
  | { type: "REMOVE_FORNECEDOR"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }

const initialState: FornecedorState = {
  fornecedores: [],
  loading: false,
  selectedFornecedor: null,
  error: null,
  isUsingMockData: false,
}

const fornecedorReducer = (state: FornecedorState, action: FornecedorAction): FornecedorState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null }
    case "SET_FORNECEDORES":
      return {
        ...state,
        fornecedores: action.payload.data,
        loading: false,
        error: null,
        isUsingMockData: !action.payload.isFromAPI,
      }
    case "SET_SELECTED_FORNECEDOR":
      return { ...state, selectedFornecedor: action.payload }
    case "ADD_FORNECEDOR":
      return {
        ...state,
        fornecedores: [...state.fornecedores, action.payload.data],
        error: null,
        isUsingMockData: state.isUsingMockData || !action.payload.isFromAPI,
      }
    case "UPDATE_FORNECEDOR":
      return {
        ...state,
        fornecedores: state.fornecedores.map((f) => (f.Id === action.payload.data.Id ? action.payload.data : f)),
        error: null,
        isUsingMockData: state.isUsingMockData || !action.payload.isFromAPI,
      }
    case "REMOVE_FORNECEDOR":
      return {
        ...state,
        fornecedores: state.fornecedores.filter((f) => f.Id !== action.payload),
        error: null,
      }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

interface FornecedorContextType {
  state: FornecedorState
  dispatch: React.Dispatch<FornecedorAction>
  actions: {
    fetchFornecedores: () => Promise<void>
    createFornecedor: (data: Omit<Fornecedor, "Id">) => Promise<Fornecedor>
    updateFornecedor: (id: string, data: Fornecedor) => Promise<Fornecedor>
    deleteFornecedor: (id: string) => Promise<void>
    clearError: () => void
  }
}

const FornecedorContext = createContext<FornecedorContextType | undefined>(undefined)

export const FornecedorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(fornecedorReducer, initialState)

  const actions = {
    async fetchFornecedores() {
      dispatch({ type: "SET_LOADING", payload: true })
      try {
        console.log("🔍 Buscando fornecedores...")
        const response = await fornecedorService.getAll()
        console.log("📊 Fornecedores carregados:", response)

        dispatch({
          type: "SET_FORNECEDORES",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })
      } catch (error) {
        console.error("❌ Erro ao carregar fornecedores:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao carregar fornecedores"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
      }
    },

    async createFornecedor(data: Omit<Fornecedor, "Id">) {
      try {
        console.log("➕ Criando fornecedor:", data)
        const response = await fornecedorService.create(data)
        console.log("✅ Fornecedor criado:", response)

        dispatch({
          type: "ADD_FORNECEDOR",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })

        return response.data
      } catch (error) {
        console.error("❌ Erro ao criar fornecedor:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar fornecedor"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw new Error(errorMessage)
      }
    },

    async updateFornecedor(id: string, data: Fornecedor) {
      try {
        console.log("✏️ Atualizando fornecedor:", id, data)
        const response = await fornecedorService.update(id, data)
        console.log("✅ Fornecedor atualizado:", response)

        dispatch({
          type: "UPDATE_FORNECEDOR",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })

        return response.data
      } catch (error) {
        console.error("❌ Erro ao atualizar fornecedor:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao atualizar fornecedor"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw new Error(errorMessage)
      }
    },

    async deleteFornecedor(id: string) {
      try {
        console.log("🗑️ Excluindo fornecedor:", id)

        if (!id) {
          throw new Error("ID do fornecedor não fornecido")
        }

        await fornecedorService.delete(id)
        console.log("✅ Fornecedor excluído com sucesso:", id)

        dispatch({ type: "REMOVE_FORNECEDOR", payload: id })
      } catch (error) {
        console.error("❌ Erro ao excluir fornecedor:", error)

        let errorMessage = "Erro desconhecido ao excluir fornecedor"

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

  return <FornecedorContext.Provider value={{ state, dispatch, actions }}>{children}</FornecedorContext.Provider>
}

export const useFornecedor = () => {
  const context = useContext(FornecedorContext)
  if (context === undefined) {
    throw new Error("useFornecedor must be used within a FornecedorProvider")
  }
  return context
}
