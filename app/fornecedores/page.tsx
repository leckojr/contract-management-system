"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useFornecedor } from "../../contexts/FornecedorContext"
import type { Fornecedor } from "../../types"
import { validateCNPJ, formatCNPJ } from "../../utils/validation"

const FornecedoresPage: React.FC = () => {
  const { state, actions } = useFornecedor()
  const { fornecedores, loading, error, isUsingMockData } = state
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    Codigo: "",
    Descricao: "",
    CNPJ: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    actions.fetchFornecedores()
  }, [])

  // Limpa erro quando componente é montado
  useEffect(() => {
    if (error) {
      actions.clearError()
    }
  }, [])

  const handleCreate = () => {
    setEditingFornecedor(null)
    setFormData({ Codigo: "", Descricao: "", CNPJ: "" })
    setErrors({})
    setIsModalVisible(true)
  }

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor)
    setFormData({
      Codigo: fornecedor.Codigo,
      Descricao: fornecedor.Descricao,
      CNPJ: fornecedor.CNPJ,
    })
    setErrors({})
    setIsModalVisible(true)
  }

  const handleDelete = async (fornecedor: Fornecedor) => {
    if (!fornecedor.Id) {
      alert("Erro: ID do fornecedor não encontrado")
      return
    }

    const confirmMessage = `Tem certeza que deseja excluir o fornecedor "${fornecedor.Descricao}"?`
    if (!confirm(confirmMessage)) {
      return
    }

    setDeletingId(fornecedor.Id)

    try {
      await actions.deleteFornecedor(fornecedor.Id)
      alert("Fornecedor removido com sucesso!")
    } catch (error) {
      console.error("Erro na exclusão:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao excluir fornecedor"
      alert(`Erro ao remover fornecedor: ${errorMessage}`)
    } finally {
      setDeletingId(null)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.Codigo.trim()) {
      newErrors.Codigo = "Código é obrigatório"
    } else if (formData.Codigo.length < 3) {
      newErrors.Codigo = "Código deve ter pelo menos 3 caracteres"
    }

    if (!formData.Descricao.trim()) {
      newErrors.Descricao = "Descrição é obrigatória"
    } else if (formData.Descricao.length < 5) {
      newErrors.Descricao = "Descrição deve ter pelo menos 5 caracteres"
    }

    if (!formData.CNPJ.trim()) {
      newErrors.CNPJ = "CNPJ é obrigatório"
    } else if (!validateCNPJ(formData.CNPJ)) {
      newErrors.CNPJ = "CNPJ inválido"
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
      if (editingFornecedor) {
        await actions.updateFornecedor(editingFornecedor.Id!, {
          ...formData,
          Id: editingFornecedor.Id,
        })
        alert("Fornecedor atualizado com sucesso!")
      } else {
        await actions.createFornecedor(formData)
        alert("Fornecedor criado com sucesso!")
      }
      setIsModalVisible(false)
    } catch (error) {
      console.error("Erro ao salvar:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao salvar fornecedor"
      alert(`Erro ao salvar fornecedor: ${errorMessage}`)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value

    // formata o cnpj automaticamente
    if (field === "CNPJ") {
      processedValue = formatCNPJ(value)
    }

    setFormData({ ...formData, [field]: processedValue })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const handleRetry = () => {
    actions.clearError()
    actions.fetchFornecedores()
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
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Gerenciamento de Fornecedores</h2>
          <button className="ant-btn ant-btn-primary" onClick={handleCreate}>
            <span style={{ marginRight: "8px" }}>➕</span>
            Novo Fornecedor
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
              Carregando fornecedores...
            </div>
          ) : (
            <div className="ant-table">
              <div className="ant-table-container">
                <table style={{ width: "100%" }}>
                  <thead className="ant-table-thead">
                    <tr>
                      <th>Código</th>
                      <th>Descrição</th>
                      <th>CNPJ</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody className="ant-table-tbody">
                    {fornecedores.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                          {error ? "Erro ao carregar dados" : "Nenhum fornecedor encontrado"}
                        </td>
                      </tr>
                    ) : (
                      fornecedores.map((fornecedor) => (
                        <tr key={fornecedor.Id}>
                          <td>{fornecedor.Codigo}</td>
                          <td>{fornecedor.Descricao}</td>
                          <td>{fornecedor.CNPJ}</td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                className="ant-btn ant-btn-primary"
                                onClick={() => handleEdit(fornecedor)}
                                disabled={deletingId === fornecedor.Id}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                className="ant-btn ant-btn-dangerous"
                                onClick={() => handleDelete(fornecedor)}
                                disabled={deletingId === fornecedor.Id}
                                style={{
                                  opacity: deletingId === fornecedor.Id ? 0.6 : 1,
                                  cursor: deletingId === fornecedor.Id ? "not-allowed" : "pointer",
                                }}
                              >
                                {deletingId === fornecedor.Id ? "⏳ Excluindo..." : "🗑️ Excluir"}
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
                  <h3 className="ant-modal-title">{editingFornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}</h3>
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
                        placeholder="Ex: FORN001"
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
                        placeholder="Nome do fornecedor"
                        value={formData.Descricao}
                        onChange={(e) => handleInputChange("Descricao", e.target.value)}
                      />
                      {errors.Descricao && <div className="ant-form-item-explain-error">{errors.Descricao}</div>}
                    </div>

                    <div className="ant-form-item">
                      <div className="ant-form-item-label">
                        <label>CNPJ</label>
                      </div>
                      <input
                        type="text"
                        className="ant-input"
                        placeholder="00.000.000/0000-00"
                        value={formData.CNPJ}
                        onChange={(e) => handleInputChange("CNPJ", e.target.value)}
                        maxLength={18}
                      />
                      {errors.CNPJ && <div className="ant-form-item-explain-error">{errors.CNPJ}</div>}
                    </div>

                    <div className="ant-modal-footer">
                      <button type="button" className="ant-btn" onClick={() => setIsModalVisible(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="ant-btn ant-btn-primary" style={{ marginLeft: "8px" }}>
                        {editingFornecedor ? "Atualizar" : "Criar"}
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

export default FornecedoresPage
