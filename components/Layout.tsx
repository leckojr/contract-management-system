"use client"

import type React from "react"
import { useRouter, usePathname } from "next/navigation"

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      key: "/",
      icon: "🏠",
      label: "Início",
    },
    {
      key: "/fornecedores",
      icon: "👥",
      label: "Fornecedores",
    },
    {
      key: "/tipos-ativo",
      icon: "📦",
      label: "Tipos de Ativo",
    },
    {
      key: "/ativos",
      icon: "📄",
      label: "Ativos",
    },
    {
      key: "/contratos",
      icon: "💰",
      label: "Contratos",
    },
  ]

  return (
    <div className="ant-layout">
      {}
      <div className="ant-layout-header" style={{ background: "#001529", color: "white", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <h1 style={{ color: "white", margin: 0, fontSize: "18px", fontWeight: "bold" }}>Sistema de Contratos</h1>
        </div>
      </div>

      {}
      <div style={{ background: "#f0f2f5", borderBottom: "1px solid #d9d9d9", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: "0" }}>
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.key)}
              style={{
                background: pathname === item.key ? "#1890ff" : "transparent",
                color: pathname === item.key ? "white" : "#262626",
                border: "none",
                padding: "12px 20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                borderRadius: "0",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                if (pathname !== item.key) {
                  e.currentTarget.style.background = "#e6f7ff"
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.key) {
                  e.currentTarget.style.background = "transparent"
                }
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="ant-layout-content" style={{ margin: "24px", padding: "24px" }}>
        {children}
      </div>
    </div>
  )
}

export default AppLayout
