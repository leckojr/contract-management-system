"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAtivo } from "../../contexts/AtivoContext"
import { useTipoAtivo } from "../../contexts/TipoAtivoContext"
import type { Ativo } from "../../types"
import { formatCurrency } from "../../utils/validation"

const AtivosPage: React.FC = () => {
  const { state: ativoState, actions: ativoActions } = useAtivo()
  const { state: tipoAtivoState, actions: tipoAtivoActions } = useTipoAtivo()
  const { ativos, loading, error, isUsingMockData } = ativoState
  const { tiposAtivo } = tipoAtivoState

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingAtivo, setEditingAtivo] = useState<Ativo | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    Codigo: "",
    Descricao: "",
    TipoAtivoId: "",
    PrecoVenda: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    ativoActions.fetchAtivos()
    tipoAtivoActions.fetchTiposAtivo()
  }, [])

  const getTipoAtivoDescricao = (tipoAtivoId: string) => {
    const tipo = tiposAtivo.find((t) => t.Id === tipoAtivoId)
    return tipo ? tipo.Descricao : "N/A"
  }

  const handleCreate = () => {
    setEditingAtivo(null)
    setFormData({ Codigo: "", Descricao: "", TipoAtivoId: "", PrecoVenda: "" })
    setErrors({})
    setIsModalVisible(true)
  }

  const handleEdit = (ativo: Ativo) => {
    setEditingAtivo(ativo)
    setFormData({
      Codigo: ativo.Codigo,
      Descricao: ativo.Descricao,
      TipoAtivoId: ativo.TipoAtivoId,
      PrecoVenda: ativo.PrecoVenda.toString(),
    })
    setErrors({})
    setIsModalVisible(true)
  }

  const handleDelete = async (ativo: Ativo) => {
    if (!ativo.Id) {
      alert("Erro: ID do ativo não encontrado")
      return
    }

    const confirmMessage = `Tem certeza que deseja excluirr o ativo "${ativo.Descricao}"?`
    if (!confirm(confirmMessage)) {
      return
    }

    setDeletingId(ativo.Id)

    try {
      await ativoActions.deleteAtivo(ativo.Id)
      alert("Ativo removido com sucesso!!!")
    } catch (error) {
      console.error("Erro na exclusão:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao excluir ativo"
      alert(`Erro ao remover ativo: ${errorMessage}`)
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

    if (!formData.TipoAtivoId) {
      newErrors.TipoAtivoId = "Tipo de Ativo é obrigatório"
    }

    if (!formData.PrecoVenda.trim()) {
      newErrors.PrecoVenda = "Preço de Venda é obrigatório"
    } else {
      const preco = Number.parseFloat(formData.PrecoVenda)
      if (Number.isNaN(preco) || preco <= 0) {
        newErrors.PrecoVenda = "Preço deve ser um número maior que zero"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const ativoData = {
      Codigo: formData.Codigo,
      Descricao: formData.Descricao,
      TipoAtivoId: formData.TipoAtivoId,
      PrecoVenda: Number.parseFloat(formData.PrecoVenda),
    }

    try {
      if (editingAtivo) {
        await ativoActions.updateAtivo(editingAtivo.Id!, {
          ...ativoData,
          Id: editingAtivo.Id,
        })
        alert("Ativo atualizado com sucesso!")
      } else {
        await ativoActions.createAtivo(ativoData)
        alert("Ativo criado com sucesso!")
      }
      setIsModalVisible(false)
    } catch (error) {
      console.error("Erro ao salvar:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao salvar ativo"
      alert(`Erro ao salvar ativo: ${errorMessage}`)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const handleRetry = () => {
    ativoActions.clearError()
    ativoActions.fetchAtivos()
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
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Gerenciamento de Ativos</h2>
          <button className="ant-btn ant-btn-primary" onClick={handleCreate}>
            <span style={{ marginRight: "8px" }}>➕</span>
            Novo Ativo
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
                  onClick={ativoActions.clearError}
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
              Carregando ativos...
            </div>
          ) : (
            <div className="ant-table">
              <div className="ant-table-container">
                <table style={{ width: "100%" }}>
                  <thead className="ant-table-thead">
                    <tr>
                      <th>Código</th>
                      <th>Descrição</th>
                      <th>Tipo de Ativo</th>
                      <th>Preço de Venda</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody className="ant-table-tbody">
                    {ativos.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "40px" }}>
                          {error ? "Erro ao carregar dados" : "Nenhum ativo encontrado"}
                        </td>
                      </tr>
                    ) : (
                      ativos.map((ativo) => (
                        <tr key={ativo.Id}>
                          <td>{ativo.Codigo}</td>
                          <td>{ativo.Descricao}</td>
                          <td>{getTipoAtivoDescricao(ativo.TipoAtivoId)}</td>
                          <td>{formatCurrency(ativo.PrecoVenda)}</td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                className="ant-btn ant-btn-primary"
                                onClick={() => handleEdit(ativo)}
                                disabled={deletingId === ativo.Id}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                className="ant-btn ant-btn-dangerous"
                                onClick={() => handleDelete(ativo)}
                                disabled={deletingId === ativo.Id}
                                style={{
                                  opacity: deletingId === ativo.Id ? 0.6 : 1,
                                  cursor: deletingId === ativo.Id ? "not-allowed" : "pointer",
                                }}
                              >
                                {deletingId === ativo.Id ? "⏳ Excluindo..." : "🗑️ Excluir"}
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
                  <h3 className="ant-modal-title">{editingAtivo ? "Editar Ativo" : "Novo Ativo"}</h3>
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
                        placeholder="Ex: ATIVO001"
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
                        placeholder="Descrição do ativo"
                        value={formData.Descricao}
                        onChange={(e) => handleInputChange("Descricao", e.target.value)}
                      />
                      {errors.Descricao && <div className="ant-form-item-explain-error">{errors.Descricao}</div>}
                    </div>

                    <div className="ant-form-item">
                      <div className="ant-form-item-label">
                        <label>Tipo de Ativo</label>
                      </div>
                      <select
                        className="ant-input"
                        value={formData.TipoAtivoId}
                        onChange={(e) => handleInputChange("TipoAtivoId", e.target.value)}
                      >
                        <option value="">Selecione um tipo de ativo</option>
                        {tiposAtivo.map((tipo) => (
                          <option key={tipo.Id} value={tipo.Id}>
                            {tipo.Codigo} - {tipo.Descricao}
                          </option>
                        ))}
                      </select>
                      {errors.TipoAtivoId && <div className="ant-form-item-explain-error">{errors.TipoAtivoId}</div>}
                    </div>

                    <div className="ant-form-item">
                      <div className="ant-form-item-label">
                        <label>Preço de Venda</label>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="ant-input"
                        placeholder="0.00"
                        value={formData.PrecoVenda}
                        onChange={(e) => handleInputChange("PrecoVenda", e.target.value)}
                      />
                      {errors.PrecoVenda && <div className="ant-form-item-explain-error">{errors.PrecoVenda}</div>}
                    </div>

                    <div className="ant-modal-footer">
                      <button type="button" className="ant-btn" onClick={() => setIsModalVisible(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="ant-btn ant-btn-primary" style={{ marginLeft: "8px" }}>
                        {editingAtivo ? "Atualizar" : "Criar"}
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

export default AtivosPage
