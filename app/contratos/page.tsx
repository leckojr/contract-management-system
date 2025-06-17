"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useContrato } from "../../contexts/ContratoContext"
import { useFornecedor } from "../../contexts/FornecedorContext"
import { useAtivo } from "../../contexts/AtivoContext"
import type { ContratoVenda, ItemContrato } from "../../types"
import { formatCurrency, calculateContractTotal } from "../../utils/validation"

const ContratosPage: React.FC = () => {
  const { state: contratoState, actions: contratoActions } = useContrato()
  const { state: fornecedorState, actions: fornecedorActions } = useFornecedor()
  const { state: ativoState, actions: ativoActions } = useAtivo()

  const { contratos, loading, error, isUsingMockData } = contratoState
  const { fornecedores } = fornecedorState
  const { ativos } = ativoState

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingContrato, setEditingContrato] = useState<ContratoVenda | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    NumeroContrato: "",
    DataCriacao: "",
    DataAlteracao: "",
    FornecedorId: "",
    Desconto: "",
  })
  const [itens, setItens] = useState<ItemContrato[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    contratoActions.fetchContratos()
    fornecedorActions.fetchFornecedores()
    ativoActions.fetchAtivos()
  }, [])

  const getFornecedorDescricao = (fornecedorId: string) => {
    const fornecedor = fornecedores.find((f) => f.Id === fornecedorId)
    return fornecedor ? fornecedor.Descricao : "N/A"
  }

  const getAtivoDescricao = (ativoId: string) => {
    const ativo = ativos.find((a) => a.Id === ativoId)
    return ativo ? ativo.Descricao : "N/A"
  }

  const handleCreate = () => {
    setEditingContrato(null)
    const hoje = new Date().toISOString().split("T")[0]
    setFormData({
      NumeroContrato: "",
      DataCriacao: hoje,
      DataAlteracao: hoje,
      FornecedorId: "",
      Desconto: "0",
    })
    setItens([])
    setErrors({})
    setIsModalVisible(true)
  }

  const handleEdit = (contrato: ContratoVenda) => {
    setEditingContrato(contrato)
    setFormData({
      NumeroContrato: contrato.NumeroContrato,
      DataCriacao: contrato.DataCriacao.split("T")[0],
      DataAlteracao: contrato.DataAlteracao.split("T")[0],
      FornecedorId: contrato.FornecedorId,
      Desconto: contrato.Desconto.toString(),
    })
    setItens([...contrato.Itens])
    setErrors({})
    setIsModalVisible(true)
  }

  const handleDelete = async (contrato: ContratoVenda) => {
    if (!contrato.Id) {
      alert("Erro: ID do contrato não encontrado")
      return
    }

    const confirmMessage = `Tem certeza que deseja excluir o contrato "${contrato.NumeroContrato}"?`
    if (!confirm(confirmMessage)) {
      return
    }

    setDeletingId(contrato.Id)

    try {
      await contratoActions.deleteContrato(contrato.Id)
      alert("Contrato removido com sucesso!")
    } catch (error) {
      console.error("Erro na exclusão:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao excluir contrato"
      alert(`Erro ao remover contrato: ${errorMessage}`)
    } finally {
      setDeletingId(null)
    }
  }

  const addItem = () => {
    setItens([
      ...itens,
      {
        AtivoId: "",
        Quantidade: 1,
        PrecoUnitario: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof ItemContrato, value: any) => {
    const newItens = [...itens]
    newItens[index] = { ...newItens[index], [field]: value }
    setItens(newItens)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.NumeroContrato.trim()) {
      newErrors.NumeroContrato = "Número do contrato é obrigatório"
    }

    if (!formData.DataCriacao) {
      newErrors.DataCriacao = "Data de criação é obrigatória"
    }

    if (!formData.DataAlteracao) {
      newErrors.DataAlteracao = "Data de alteração é obrigatória"
    }

    if (!formData.FornecedorId) {
      newErrors.FornecedorId = "Fornecedor é obrigatório"
    }

    if (itens.length === 0) {
      newErrors.Itens = "Pelo menos um item é obrigatório"
    } else {
      itens.forEach((item, index) => {
        if (!item.AtivoId) {
          newErrors[`item_${index}_ativo`] = "Ativo é obrigatório"
        }
        if (item.Quantidade <= 0) {
          newErrors[`item_${index}_quantidade`] = "Quantidade deve ser maior que zero"
        }
        if (item.PrecoUnitario <= 0) {
          newErrors[`item_${index}_preco`] = "Preço deve ser maior que zero"
        }
      })
    }

    const desconto = Number.parseFloat(formData.Desconto)
    if (Number.isNaN(desconto) || desconto < 0) {
      newErrors.Desconto = "Desconto deve ser um número maior ou igual a zero"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const desconto = Number.parseFloat(formData.Desconto)
    const valorTotal = calculateContractTotal(itens, desconto)

    const contratoData = {
      NumeroContrato: formData.NumeroContrato,
      DataCriacao: formData.DataCriacao,
      DataAlteracao: formData.DataAlteracao,
      FornecedorId: formData.FornecedorId,
      Itens: itens,
      Desconto: desconto,
      ValorTotal: valorTotal,
    }

    try {
      if (editingContrato) {
        await contratoActions.updateContrato(editingContrato.Id!, {
          ...contratoData,
          Id: editingContrato.Id,
        })
        alert("Contrato atualizado com sucesso!")
      } else {
        await contratoActions.createContrato(contratoData)
        alert("Contrato criado com sucesso!")
      }
      setIsModalVisible(false)
    } catch (error) {
      console.error("Erro ao salvar:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao salvar contrato"
      alert(`Erro ao salvar contrato: ${errorMessage}`)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const handleRetry = () => {
    contratoActions.clearError()
    contratoActions.fetchContratos()
  }

  const subtotal = itens.reduce((acc, item) => acc + item.Quantidade * item.PrecoUnitario, 0)
  const desconto = Number.parseFloat(formData.Desconto) || 0
  const total = Math.max(0, subtotal - desconto)

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
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Gerenciamento de Contratos de Venda</h2>
          <button className="ant-btn ant-btn-primary" onClick={handleCreate}>
            <span style={{ marginRight: "8px" }}>➕</span>
            Novo Contrato
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
                  onClick={contratoActions.clearError}
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
              Carregando contratos...
            </div>
          ) : (
            <div className="ant-table">
              <div className="ant-table-container">
                <table style={{ width: "100%" }}>
                  <thead className="ant-table-thead">
                    <tr>
                      <th>Número</th>
                      <th>Fornecedor</th>
                      <th>Data Criação</th>
                      <th>Itens</th>
                      <th>Valor Total</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody className="ant-table-tbody">
                    {contratos.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                          {error ? "Erro ao carregar dados" : "Nenhum contrato encontrado"}
                        </td>
                      </tr>
                    ) : (
                      contratos.map((contrato) => (
                        <tr key={contrato.Id}>
                          <td>{contrato.NumeroContrato}</td>
                          <td>{getFornecedorDescricao(contrato.FornecedorId)}</td>
                          <td>{new Date(contrato.DataCriacao).toLocaleDateString("pt-BR")}</td>
                          <td>{contrato.Itens.length} item(s)</td>
                          <td>{formatCurrency(contrato.ValorTotal)}</td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                className="ant-btn ant-btn-primary"
                                onClick={() => handleEdit(contrato)}
                                disabled={deletingId === contrato.Id}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                className="ant-btn ant-btn-dangerous"
                                onClick={() => handleDelete(contrato)}
                                disabled={deletingId === contrato.Id}
                                style={{
                                  opacity: deletingId === contrato.Id ? 0.6 : 1,
                                  cursor: deletingId === contrato.Id ? "not-allowed" : "pointer",
                                }}
                              >
                                {deletingId === contrato.Id ? "⏳ Excluindo..." : "🗑️ Excluir"}
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
            <div
              className="ant-modal"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "800px", width: "90vw" }}
            >
              <div className="ant-modal-content">
                <div className="ant-modal-header">
                  <h3 className="ant-modal-title">{editingContrato ? "Editar Contrato" : "Novo Contrato"}</h3>
                </div>
                <div className="ant-modal-body">
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                      <div className="ant-form-item">
                        <div className="ant-form-item-label">
                          <label>Número do Contrato</label>
                        </div>
                        <input
                          type="text"
                          className="ant-input"
                          placeholder="Ex: CONT001"
                          value={formData.NumeroContrato}
                          onChange={(e) => handleInputChange("NumeroContrato", e.target.value)}
                        />
                        {errors.NumeroContrato && (
                          <div className="ant-form-item-explain-error">{errors.NumeroContrato}</div>
                        )}
                      </div>

                      <div className="ant-form-item">
                        <div className="ant-form-item-label">
                          <label>Fornecedor</label>
                        </div>
                        <select
                          className="ant-input"
                          value={formData.FornecedorId}
                          onChange={(e) => handleInputChange("FornecedorId", e.target.value)}
                        >
                          <option value="">Selecione um fornecedor</option>
                          {fornecedores.map((fornecedor) => (
                            <option key={fornecedor.Id} value={fornecedor.Id}>
                              {fornecedor.Codigo} - {fornecedor.Descricao}
                            </option>
                          ))}
                        </select>
                        {errors.FornecedorId && (
                          <div className="ant-form-item-explain-error">{errors.FornecedorId}</div>
                        )}
                      </div>

                      <div className="ant-form-item">
                        <div className="ant-form-item-label">
                          <label>Data de Criação</label>
                        </div>
                        <input
                          type="date"
                          className="ant-input"
                          value={formData.DataCriacao}
                          onChange={(e) => handleInputChange("DataCriacao", e.target.value)}
                        />
                        {errors.DataCriacao && <div className="ant-form-item-explain-error">{errors.DataCriacao}</div>}
                      </div>

                      <div className="ant-form-item">
                        <div className="ant-form-item-label">
                          <label>Data de Alteração</label>
                        </div>
                        <input
                          type="date"
                          className="ant-input"
                          value={formData.DataAlteracao}
                          onChange={(e) => handleInputChange("DataAlteracao", e.target.value)}
                        />
                        {errors.DataAlteracao && (
                          <div className="ant-form-item-explain-error">{errors.DataAlteracao}</div>
                        )}
                      </div>
                    </div>

                    <div className="ant-form-item">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="ant-form-item-label">
                          <label>Itens do Contrato</label>
                        </div>
                        <button type="button" className="ant-btn ant-btn-primary" onClick={addItem}>
                          ➕ Adicionar Item
                        </button>
                      </div>
                      {errors.Itens && <div className="ant-form-item-explain-error">{errors.Itens}</div>}

                      {itens.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: "6px",
                            padding: "16px",
                            marginTop: "12px",
                            position: "relative",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              background: "#ff4d4f",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              width: "24px",
                              height: "24px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            ✕
                          </button>

                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
                            <div>
                              <div className="ant-form-item-label">
                                <label>Ativo</label>
                              </div>
                              <select
                                className="ant-input"
                                value={item.AtivoId}
                                onChange={(e) => updateItem(index, "AtivoId", e.target.value)}
                              >
                                <option value="">Selecione um ativo</option>
                                {ativos.map((ativo) => (
                                  <option key={ativo.Id} value={ativo.Id}>
                                    {ativo.Codigo} - {ativo.Descricao}
                                  </option>
                                ))}
                              </select>
                              {errors[`item_${index}_ativo`] && (
                                <div className="ant-form-item-explain-error">{errors[`item_${index}_ativo`]}</div>
                              )}
                            </div>

                            <div>
                              <div className="ant-form-item-label">
                                <label>Quantidade</label>
                              </div>
                              <input
                                type="number"
                                min="1"
                                className="ant-input"
                                value={item.Quantidade}
                                onChange={(e) => updateItem(index, "Quantidade", Number.parseInt(e.target.value) || 0)}
                              />
                              {errors[`item_${index}_quantidade`] && (
                                <div className="ant-form-item-explain-error">{errors[`item_${index}_quantidade`]}</div>
                              )}
                            </div>

                            <div>
                              <div className="ant-form-item-label">
                                <label>Preço Unitário</label>
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="ant-input"
                                value={item.PrecoUnitario}
                                onChange={(e) =>
                                  updateItem(index, "PrecoUnitario", Number.parseFloat(e.target.value) || 0)
                                }
                              />
                              {errors[`item_${index}_preco`] && (
                                <div className="ant-form-item-explain-error">{errors[`item_${index}_preco`]}</div>
                              )}
                            </div>
                          </div>

                          <div style={{ marginTop: "8px", textAlign: "right", color: "#666" }}>
                            Subtotal: {formatCurrency(item.Quantidade * item.PrecoUnitario)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="ant-form-item">
                      <div className="ant-form-item-label">
                        <label>Desconto</label>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="ant-input"
                        placeholder="0.00"
                        value={formData.Desconto}
                        onChange={(e) => handleInputChange("Desconto", e.target.value)}
                      />
                      {errors.Desconto && <div className="ant-form-item-explain-error">{errors.Desconto}</div>}
                    </div>

                    <div
                      style={{
                        background: "#f5f5f5",
                        padding: "16px",
                        borderRadius: "6px",
                        marginBottom: "24px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span>Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span>Desconto:</span>
                        <span>- {formatCurrency(desconto)}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: "bold",
                          fontSize: "18px",
                          borderTop: "1px solid #d9d9d9",
                          paddingTop: "8px",
                        }}
                      >
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <div className="ant-modal-footer">
                      <button type="button" className="ant-btn" onClick={() => setIsModalVisible(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="ant-btn ant-btn-primary" style={{ marginLeft: "8px" }}>
                        {editingContrato ? "Atualizar" : "Criar"}
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

export default ContratosPage
