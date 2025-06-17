export const validateCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/[^\d]/g, "")

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false

  // Validação dos dígitos verificadores
  let sum = 0
  let weight = 2

  // Primeiro dígito verificador
  for (let i = 11; i >= 0; i--) {
    sum += Number.parseInt(cleanCNPJ.charAt(i)) * weight
    weight = weight === 9 ? 2 : weight + 1
  }

  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder

  if (Number.parseInt(cleanCNPJ.charAt(12)) !== digit1) return false

  // Segundo dígito verificador
  sum = 0
  weight = 2

  for (let i = 12; i >= 0; i--) {
    sum += Number.parseInt(cleanCNPJ.charAt(i)) * weight
    weight = weight === 9 ? 2 : weight + 1
  }

  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder

  return Number.parseInt(cleanCNPJ.charAt(13)) === digit2
}

export const formatCNPJ = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, "")
  return cleanValue
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export const calculateContractTotal = (
  items: Array<{ Quantidade: number; PrecoUnitario: number }>,
  desconto = 0,
): number => {
  const subtotal = items.reduce((acc, item) => {
    return acc + item.Quantidade * item.PrecoUnitario
  }, 0)

  return Math.max(0, subtotal - desconto)
}
