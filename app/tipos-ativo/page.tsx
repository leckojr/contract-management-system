"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useTipoAtivo } from "../../contexts/TipoAtivoContext"
import type { TipoAtivo } from "../../types"

const TiposAtivoPage: React.FC = () => {
  const { state, actions } = useTipoAtivo()
  const { tiposAtivo, loading, error, isUsingMockData } = state
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTipoAtivo, setEditingTipoAtivo] = useState<TipoAtivo | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    Codigo: "",
    Descricao: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    actions.fetchTiposAtivo()
  }, [])

  // Limpa o erro quando componente é montado
  useEffect(() => {
    if (error) {
      actions.clearError()
    }
  }, [])

  const handleCreate = () => {
    setEditingTipoAtivo(null)
    setFormData({ Codigo: "", Descricao: "" })
    setErrors({})
    setIsModalVisible(true)
  }

  const handleEdit = (tipoAtivo: TipoAtivo) => {
    setEditingTipoAtivo(tipoAtivo)
    setFormData({
      Codigo: tipoAtivo.Codigo,
      Descricao: tipoAtivo.Descricao,
    })
    setErrors({})
    setIsModalVisible(true)
  }

  const handleDelete = async (tipoAtivo: TipoAtivo) => {
    if (!tipoAtivo.Id) {
      alert("Erro: ID do tipo de ativo não encontrado")
      return
    }

    const confirmMessage = `Tem certeza que deseja excluir o tipo de ativo "${tipoAtivo.Descricao}"?`
    if (!confirm(confirmMessage)) {
      return
    }

    setDeletingId(tipoAtivo.Id)

    try {
      await actions.deleteTipoAtivo(tipoAtivo.Id)
      alert("Tipo de ativo removido com sucesso!")
    } catch (error) {
      console.error("Erro na exclusão:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao excluir tipo de ativo"
      alert(`Erro ao remover tipo de ativo: ${errorMessage}`)
    } finally {
      setDeletingId(null)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.Codigo.trim()) {
      newErrors.Codigo = "Código é obrigatório"
    } else if (formData.Codigo.length < 1) {
      newErrors.Codigo = "Código deve ter pelo menos 1 caracteres"
    }

    if (!formData.Descricao.trim()) {
      newErrors.Descricao = "Descrição é obrigatória"
    } else if (formData.Descricao.length < 1) {
      newErrors.Descricao = "Descrição deve ter pelo menos 1 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (editingTipoAtivo) {
        await actions.updateTipoAtivo(editingTipoAtivo.Id!, {
          ...formData,
          Id: editingTipoAtivo.Id,
        })
        alert("Tipo de ativo atualizado com sucesso!")
      } else {
        await actions.createTipoAtivo(formData)
        alert("Tipo de ativo criado com sucesso!")
      }
      setIsModalVisible(false)
    } catch (error) {
      console.error("Erro ao salvar:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao salvar tipo de ativo"
      alert(`Erro ao salvar tipo de ativo: ${errorMessage}`)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const handleRetry = () => {
    actions.clearError()
    actions.fetchTiposAtivo()
  }

  return (
    <div>
      <div className="ant-card">
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Gerenciamento de Tipos de Ativo</h2>
          <button className="ant-btn ant-btn-primary" onClick={handleCreate}>
            <span style={{ marginRight: "8px" }}>➕</span>
            Novo Tipo de Ativo
          </button>
        </div>
        <div style={{ padding: "24px" }}>
          {isUsingMockData && (
            <div
              style={{
                background: "#fffbe6",
                border: "1px solid #ffe58f",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "16px",
                color: "#d48806",
              }}
            >
              <strong>⚠️ Modo Offline:</strong> A API não está disponível. Usando dados de demonstração.
            </div>
          )}

          {error && (
            <div
              style={{
                background: "#fff2f0",
                border: "1px solid #ffccc7",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "16px",
                color: "#a8071a",
              }}
            >
              <strong>Erro:</strong> {error}
              <div style={{ marginTop: "8px" }}>
                <button onClick={handleRetry} className="ant-btn" style={{ marginRight: "8px" }}>
                  🔄 Tentar Novamente
                </button>
                <button
                  onClick={actions.clearError}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#a8071a",
                    cursor: "pointer",
                  }}
                >
                  ✕ Fechar
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "18px", marginBottom: "8px" }}>⏳</div>
              Carregando tipos de ativo...
            </div>
          ) : (
            <div className="ant-table">
              <div className="ant-table-container">
                <table style={{ width: "100%" }}>
                  <thead className="ant-table-thead">
                    <tr>
                      <th>Código</th>
                      <th>Descrição</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody className="ant-table-tbody">
                    {tiposAtivo.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: "center", padding: "40px" }}>
                          {error ? "Erro ao carregar dados" : "Nenhum tipo de ativo encontrado"}
                        </td>
                      </tr>
                    ) : (
                      tiposAtivo.map((tipoAtivo) => (
                        <tr key={tipoAtivo.Id}>
                          <td>{tipoAtivo.Codigo}</td>
                          <td>{tipoAtivo.Descricao}</td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                className="ant-btn ant-btn-primary"
                                onClick={() => handleEdit(tipoAtivo)}
                                disabled={deletingId === tipoAtivo.Id}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                className="ant-btn ant-btn-dangerous"
                                onClick={() => handleDelete(tipoAtivo)}
                                disabled={deletingId === tipoAtivo.Id}
                                style={{
                                  opacity: deletingId === tipoAtivo.Id ? 0.6 : 1,
                                  cursor: deletingId === tipoAtivo.Id ? "not-allowed" : "pointer",
                                }}
                              >
                                {deletingId === tipoAtivo.Id ? "⏳ Excluindo..." : "🗑️ Excluir"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalVisible && (
        <div className="ant-modal-mask" onClick={() => setIsModalVisible(false)}>
          <div className="ant-modal-wrap">
            <div className="ant-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ant-modal-content">
                <div className="ant-modal-header">
                  <h3 className="ant-modal-title">
                    {editingTipoAtivo ? "Editar Tipo de Ativo" : "Novo Tipo de Ativo"}
                  </h3>
                </div>
                <div className="ant-modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="ant-form-item">
                      <div className="ant-form-item-label">
                        <label>Código</label>
                      </div>
                      <input
                        type="text"
                        className="ant-input"
                        placeholder="Ex: TIPO001"
                        value={formData.Codigo}
                        onChange={(e) => handleInputChange("Codigo", e.target.value)}
                      />
                      {errors.Codigo && <div className="ant-form-item-explain-error">{errors.Codigo}</div>}
                    </div>

                    <div className="ant-form-item">
                      <div className="ant-form-item-label">
                        <label>Descrição</label>
                      </div>
                      <input
                        type="text"
                        className="ant-input"
                        placeholder="Descrição do tipo de ativo"
                        value={formData.Descricao}
                        onChange={(e) => handleInputChange("Descricao", e.target.value)}
                      />
                      {errors.Descricao && <div className="ant-form-item-explain-error">{errors.Descricao}</div>}
                    </div>

                    <div className="ant-modal-footer">
                      <button type="button" className="ant-btn" onClick={() => setIsModalVisible(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="ant-btn ant-btn-primary" style={{ marginLeft: "8px" }}>
                        {editingTipoAtivo ? "Atualizar" : "Criar"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TiposAtivoPage
