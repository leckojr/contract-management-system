import type React from "react"
import AppLayout from "../components/Layout"
import "./globals.css"
import { AppProvider } from "../contexts/AppContext"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProvider>
          <AppLayout>{children}</AppLayout>
        </AppProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
