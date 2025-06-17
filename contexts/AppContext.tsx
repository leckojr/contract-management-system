"use client"

import type React from "react"
import type { ReactNode } from "react"
import { FornecedorProvider } from "./FornecedorContext"
import { TipoAtivoProvider } from "./TipoAtivoContext"
import { AtivoProvider } from "./AtivoContext"
import { ContratoProvider } from "./ContratoContext"

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <FornecedorProvider>
      <TipoAtivoProvider>
        <AtivoProvider>
          <ContratoProvider>{children}</ContratoProvider>
        </AtivoProvider>
      </TipoAtivoProvider>
    </FornecedorProvider>
  )
}
