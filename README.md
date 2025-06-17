# Sistema de Gestão de Contratos

Um sistema web responsivo para gerenciar contratos de venda de ativos para fornecedores, desenvolvido com React, TypeScript, Ant Design e Luffie.

## 🚀 Funcionalidades

- **Gestão de Fornecedores**: CRUD completo com validação de CNPJ
- **Gestão de Tipos de Ativo**: Categorização de ativos
- **Gestão de Ativos**: Cadastro com preços e tipos
- **Gestão de Contratos**: Contratos complexos com múltiplos itens, cálculo automático de totais e descontos
- **Interface Responsiva**: Funciona em desktop e dispositivos móveis
- **Validações Robustas**: Validação de campos obrigatórios e formatos
- **Navegação SPA**: Roteamento sem recarregamento de página

## 🛠️ Tecnologias Utilizadas

- **React 18** com TypeScript
- **Next.js 14** (App Router)
- **Ant Design** para componentes UI
- **Luffie** para gerenciamento de estado
- **Axios** para consumo de APIs
- **CSS3** com design responsivo

## ⚠️ Observações Importantes

> 📢 Este projeto **não utiliza uma API real**. Todas as operações são simuladas por meio de dados mockados localmente (`services/api.ts`), com uso de `setTimeout` para imitar chamadas assíncronas.
>
> 💡 A API está **offline**, e **os dados são de demonstração**.


## 📋 Pré-requisitos

- Node.js 18+ 
- npm, yarn ou pnpm

## 🔧 Instalação e Execução

Caso ocorra erro relacionado ao pacote `luffie`, execute:

```bash
npm install --legacy-peer-deps


1. **Clone o repositório**
\`\`\`bash
git clone <url-do-repositorio>
cd desafio
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
# ou
yarn install
# ou
pnpm install
\`\`\`

3. **Execute o projeto**
\`\`\`bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
\`\`\`

4. **Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

\`\`\`
src/
├── app/                    # Páginas da aplicação (App Router)
│   ├── fornecedores/      # CRUD de fornecedores
│   ├── tipos-ativo/       # CRUD de tipos de ativo
│   ├── ativos/            # CRUD de ativos
│   ├── contratos/         # CRUD de contratos
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   └── Layout.tsx         # Layout da aplicação
├── stores/                # Stores do Luffie
│   ├── fornecedorStore.ts
│   ├── tipoAtivoStore.ts
│   ├── ativoStore.ts
│   └── contratoStore.ts
├── services/              # Serviços de API
│   └── api.ts
├── types/                 # Definições de tipos TypeScript
│   └── index.ts
└── utils/                 # Utilitários e validações
    └── validation.ts
\`\`\`

## 🔌 API Endpoints

O sistema consome uma API mockada com os seguintes endpoints:

### Fornecedores
- `GET /fornecedores` - Listar fornecedores
- `POST /fornecedores` - Criar fornecedor
- `PUT /fornecedores/:id` - Atualizar fornecedor
- `DELETE /fornecedores/:id` - Excluir fornecedor

### Tipos de Ativo
- `GET /tipo_de_ativo` - Listar tipos de ativo
- `POST /tipo_de_ativo` - Criar tipo de ativo
- `PUT /tipo_de_ativo/:id` - Atualizar tipo de ativo
- `DELETE /tipo_de_ativo/:id` - Excluir tipo de ativo

### Ativos
- `GET /ativo` - Listar ativos
- `POST /ativo` - Criar ativo
- `PUT /ativo/:id` - Atualizar ativo
- `DELETE /ativo/:id` - Excluir ativo

### Contratos de Venda
- `GET /contrato_de_venda` - Listar contratos
- `POST /contrato_de_venda` - Criar contrato
- `PUT /contrato_de_venda/:id` - Atualizar contrato
- `DELETE /contrato_de_venda/:id` - Excluir contrato

## 🎯 Funcionalidades Detalhadas

### Fornecedores
- Validação de CNPJ com algoritmo oficial
- Formatação automática do CNPJ
- Campos obrigatórios: Código, Descrição, CNPJ

### Tipos de Ativo
- Cadastro simples com código e descrição
- Utilizado como categoria para os ativos

### Ativos
- Vinculação com tipo de ativo
- Preço de venda com formatação monetária
- Validação de valores numéricos

### Contratos de Venda
- Múltiplos itens por contrato
- Cálculo automático de totais
- Aplicação de descontos
- Seleção de fornecedor
- Visualização detalhada com resumo financeiro
- Validação de datas


## 🔍 Validações Implementadas

- **CNPJ**: Validação com algoritmo oficial brasileiro
- **Campos Obrigatórios**: Validação em todos os formulários
- **Valores Numéricos**: Validação de preços e quantidades
- **Datas**: Validação de formato e valores válidos
- **Relacionamentos**: Validação de IDs de entidades relacionadas

## 📱 Responsividade

O sistema foi desenvolvido com abordagem mobile-first:

- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado com componentes redimensionados
- **Mobile**: Layout otimizado com navegação colapsável

## 🚀 Deploy

Para fazer deploy da aplicação:

1. **Build de produção**
\`\`\`bash
npm run build
\`\`\`

2. **Iniciar servidor de produção**
\`\`\`bash
npm start
\`\`\`

## 🧪 Testes

Para executar os testes (quando implementados):

\`\`\`bash
npm test
\`\`\`


