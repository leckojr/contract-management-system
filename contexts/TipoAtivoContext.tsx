"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { TipoAtivo } from "../types"
import { tipoAtivoService } from "../services/api"

interface TipoAtivoState {
  tiposAtivo: TipoAtivo[]
  loading: boolean
  selectedTipoAtivo: TipoAtivo | null
  error: string | null
  isUsingMockData: boolean
}

type TipoAtivoAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_TIPOS_ATIVO"; payload: { data: TipoAtivo[]; isFromAPI: boolean } }
  | { type: "SET_SELECTED_TIPO_ATIVO"; payload: TipoAtivo | null }
  | { type: "ADD_TIPO_ATIVO"; payload: { data: TipoAtivo; isFromAPI: boolean } }
  | { type: "UPDATE_TIPO_ATIVO"; payload: { data: TipoAtivo; isFromAPI: boolean } }
  | { type: "REMOVE_TIPO_ATIVO"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }

const initialState: TipoAtivoState = {
  tiposAtivo: [],
  loading: false,
  selectedTipoAtivo: null,
  error: null,
  isUsingMockData: true, // Sempre usando mock data
}

const tipoAtivoReducer = (state: TipoAtivoState, action: TipoAtivoAction): TipoAtivoState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null }
    case "SET_TIPOS_ATIVO":
      return {
        ...state,
        tiposAtivo: action.payload.data || [],
        loading: false,
        error: null,
        isUsingMockData: true, // Sempre mock
      }
    case "SET_SELECTED_TIPO_ATIVO":
      return { ...state, selectedTipoAtivo: action.payload }
    case "ADD_TIPO_ATIVO":
      return {
        ...state,
        tiposAtivo: [...state.tiposAtivo, action.payload.data],
        error: null,
      }
    case "UPDATE_TIPO_ATIVO":
      return {
        ...state,
        tiposAtivo: state.tiposAtivo.map((t) => (t.Id === action.payload.data.Id ? action.payload.data : t)),
        error: null,
      }
    case "REMOVE_TIPO_ATIVO":
      return {
        ...state,
        tiposAtivo: state.tiposAtivo.filter((t) => t.Id !== action.payload),
        error: null,
      }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

interface TipoAtivoContextType {
  state: TipoAtivoState
  dispatch: React.Dispatch<TipoAtivoAction>
  actions: {
    fetchTiposAtivo: () => Promise<void>
    createTipoAtivo: (data: Omit<TipoAtivo, "Id">) => Promise<TipoAtivo>
    updateTipoAtivo: (id: string, data: TipoAtivo) => Promise<TipoAtivo>
    deleteTipoAtivo: (id: string) => Promise<void>
    clearError: () => void
  }
}

const TipoAtivoContext = createContext<TipoAtivoContextType | undefined>(undefined)

export const TipoAtivoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tipoAtivoReducer, initialState)

  const actions = {
    async fetchTiposAtivo() {
      dispatch({ type: "SET_LOADING", payload: true })

      try {
        console.log("🔍 Buscando tipos de ativo...")
        const response = await tipoAtivoService.getAll()
        console.log("📊 Tipos de ativo carregados:", response.data)

        dispatch({
          type: "SET_TIPOS_ATIVO",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })
      } catch (error) {
        console.error("❌ Erro ao carregar tipos de ativo:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
      }
    },

    async createTipoAtivo(data: Omit<TipoAtivo, "Id">) {
      try {
        console.log("➕ Criando tipo de ativo:", data)
        const response = await tipoAtivoService.create(data)
        console.log("✅ Tipo de ativo criado:", response.data)

        dispatch({
          type: "ADD_TIPO_ATIVO",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })

        return response.data
      } catch (error) {
        console.error("❌ Erro ao criar tipo de ativo:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw new Error(errorMessage)
      }
    },

    async updateTipoAtivo(id: string, data: TipoAtivo) {
      try {
        console.log("✏️ Atualizando tipo de ativo:", id, data)
        const response = await tipoAtivoService.update(id, data)
        console.log("✅ Tipo de ativo atualizado:", response.data)

        dispatch({
          type: "UPDATE_TIPO_ATIVO",
          payload: { data: response.data, isFromAPI: response.isFromAPI },
        })

        return response.data
      } catch (error) {
        console.error("❌ Erro ao atualizar tipo de ativo:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw new Error(errorMessage)
      }
    },

    async deleteTipoAtivo(id: string) {
      try {
        console.log("🗑️ Excluindo tipo de ativo:", id)
        await tipoAtivoService.delete(id)
        console.log("✅ Tipo de ativo excluído com sucesso")

        dispatch({ type: "REMOVE_TIPO_ATIVO", payload: id })
      } catch (error) {
        console.error("❌ Erro ao excluir tipo de ativo:", error)
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw new Error(errorMessage)
      }
    },

    clearError() {
      dispatch({ type: "SET_ERROR", payload: null })
    },
  }

  return <TipoAtivoContext.Provider value={{ state, dispatch, actions }}>{children}</TipoAtivoContext.Provider>
}

export const useTipoAtivo = () => {
  const context = useContext(TipoAtivoContext)
  if (context === undefined) {
    throw new Error("useTipoAtivo must be used within a TipoAtivoProvider")
  }
  return context
}
