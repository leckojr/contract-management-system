"use client"

import type React from "react"
import { useRouter } from "next/navigation"

const HomePage: React.FC = () => {
  const router = useRouter()

  const menuCards = [
    {
      title: "Fornecedores",
      icon: "👥",
      description: "Gerencie fornecedores e suas informações",
      path: "/fornecedores",
      color: "#e6f7ff",
    },
    {
      title: "Tipos de Ativo",
      icon: "📦",
      description: "Configure tipos de ativos disponíveis",
      path: "/tipos-ativo",
      color: "#f6ffed",
    },
    {
      title: "Ativos",
      icon: "📄",
      description: "Cadastre e gerencie ativos",
      path: "/ativos",
      color: "#fff7e6",
    },
    {
      title: "Contratos",
      icon: "💰",
      description: "Gerencie contratos de venda",
      path: "/contratos",
      color: "#fff0f6",
    },
  ]

  return (
    <div>
      <div className="text-center mb-40">
        <h1 style={{ fontSize: "32px", marginBottom: "16px", color: "#262626" }}>Sistema de Gestão de Contratos</h1>
        <p style={{ fontSize: "16px", color: "#8c8c8c", margin: 0 }}>
          Gerencie fornecedores, ativos e contratos de forma eficiente
        </p>
      </div>

      <div className="ant-row" style={{ gap: "24px", justifyContent: "center" }}>
        {menuCards.map((card, index) => (
          <div key={index} className="ant-col-6" style={{ minWidth: "250px", maxWidth: "300px" }}>
            <div
              className="ant-card ant-card-hoverable"
              style={{
                textAlign: "center",
                height: "200px",
                backgroundColor: card.color,
                cursor: "pointer",
              }}
              onClick={() => router.push(card.path)}
            >
              <div
                className="ant-card-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  padding: "24px",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>{card.icon}</div>
                <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "#262626" }}>{card.title}</h3>
                <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage
